#!/usr/bin/env python3
"""
Theme Metadata Scraper for D7 Theme Catalog (epic0228-theme-catalog).
Scrapes Drupal.org search, fetches full metadata per theme, writes CSV + JSON.
Supports --resume to restart from last processed theme.
"""
import argparse
import csv
import json
import re
import subprocess
import sys
import time
from datetime import datetime
from html import unescape
from pathlib import Path

BASE = "https://www.drupal.org"
SEARCH_URL = (
    f"{BASE}/project/project_theme"
    "?f%5B44%5D=&f%5B46%5D=&f%5B47%5D=sm_core_compatibility%3A7"
    "&f%5B48%5D=sm_field_project_type%3Afull&f%5B49%5D=&f%5B50%5D="
    "&text=&solrsort=ds_created+desc&op=Search"
)
API_NODE = f"{BASE}/api-d7/node.json"
API_TERM = f"{BASE}/api-d7/taxonomy_term"
DELAY = 1.5
PROGRESS_FILE = Path(__file__).parent / "scrape-progress.json"
OUTPUT_DIR = Path(__file__).parent


def fetch(url: str) -> str:
    result = subprocess.run(
        ["curl", "-sL", url],
        capture_output=True,
        text=True,
        timeout=60,
    )
    result.check_returncode()
    return result.stdout


def fetch_json(url: str, retries: int = 3) -> dict:
    for attempt in range(retries):
        try:
            raw = fetch(url)
            if not raw.strip():
                raise ValueError("Empty response")
            return json.loads(raw)
        except (json.JSONDecodeError, ValueError) as e:
            if attempt < retries - 1:
                time.sleep(DELAY * 2)  # Longer pause before retry
                continue
            raise


def extract_machine_names(html: str) -> list[str]:
    pattern = r'href="/project/([a-z0-9_]+)"'
    matches = re.findall(pattern, html)
    seen = set()
    result = []
    for m in matches:
        if m in ("issues", "project_theme") or m in seen:
            continue
        seen.add(m)
        result.append(m)
    return result


def strip_html(html: str) -> str:
    if not html:
        return ""
    text = re.sub(r"<[^>]+>", " ", html)
    text = re.sub(r"\s+", " ", text)
    return unescape(text).strip()


def unix_to_date(ts) -> str:
    if ts is None:
        return ""
    try:
        return datetime.utcfromtimestamp(int(ts)).strftime("%Y-%m-%d")
    except (ValueError, TypeError):
        return ""


def sum_7x_installs(project_usage: dict) -> int | None:
    if not project_usage:
        return None
    total = 0
    for k, v in project_usage.items():
        if k.startswith("7.x"):
            total += int(v) if isinstance(v, (int, str)) and str(v).isdigit() else 0
    return total if total > 0 else None


def resolve_taxonomy(tid: str | None, cache: dict) -> str:
    if not tid:
        return ""
    if tid in cache:
        return cache[tid]
    try:
        term = fetch_json(f"{API_TERM}/{tid}.json")
        name = term.get("name", "")
        cache[tid] = name
        return name
    except Exception:
        cache[tid] = ""
        return ""


def placeholder_theme(machine: str) -> dict:
    return {
        "machine_name": machine,
        "name": machine,
        "project_url": f"{BASE}/project/{machine}",
        "created": "",
        "changed": "",
        "author": "",
        "install_count_7x": None,
        "security_coverage": "not-covered",
        "maintenance_status": "",
        "development_status": "",
        "description": "",
        "screenshots": [],
        "has_screenshots": False,
    }


def process_node(node: dict, term_cache: dict) -> dict:
    body = node.get("body", {}) or {}
    body_val = body.get("value", "") or ""
    author = node.get("author", {}) or {}
    images = node.get("field_project_images") or []
    tax44 = node.get("taxonomy_vocabulary_44") or {}
    tax46 = node.get("taxonomy_vocabulary_46") or {}

    tid44 = tax44.get("id") if isinstance(tax44, dict) else None
    tid46 = tax46.get("id") if isinstance(tax46, dict) else None

    machine = node.get("field_project_machine_name", "")
    install_count = sum_7x_installs(node.get("project_usage"))

    return {
        "machine_name": machine,
        "name": node.get("title", ""),
        "project_url": node.get("url", f"{BASE}/project/{machine}"),
        "created": unix_to_date(node.get("created")),
        "changed": unix_to_date(node.get("changed")),
        "author": author.get("name", ""),
        "install_count_7x": install_count,
        "security_coverage": node.get("field_security_advisory_coverage", "not-covered") or "not-covered",
        "maintenance_status": resolve_taxonomy(tid44, term_cache),
        "development_status": resolve_taxonomy(tid46, term_cache),
        "description": strip_html(body_val),
        "screenshots": [],  # download-screenshots story will populate
        "has_screenshots": len(images) > 0,
    }


def main():
    parser = argparse.ArgumentParser(description="Scrape D7 theme catalog from Drupal.org")
    parser.add_argument("--resume", action="store_true", help="Resume from last progress")
    parser.add_argument("--limit", type=int, help="Limit number of themes (for testing)")
    args = parser.parse_args()

    term_cache = {}
    themes = []
    machine_names = []

    if args.resume and PROGRESS_FILE.exists():
        with open(PROGRESS_FILE) as f:
            progress = json.load(f)
        machine_names = progress.get("machine_names", [])
        themes = progress.get("themes", [])
        print(f"Resuming: {len(themes)} themes already scraped, {len(machine_names)} total")
    else:
        # Discovery phase
        print("=== Phase 1: Discovery ===\n")
        page = 0
        while True:
            url = f"{SEARCH_URL}&page={page}"
            print(f"Fetching search page {page}...")
            html = fetch(url)
            time.sleep(DELAY)
            machines = extract_machine_names(html)
            if not machines:
                break
            machine_names.extend(machines)
            print(f"  Found {len(machines)} themes (cumulative: {len(machine_names)})")
            page += 1

        seen = set()
        machine_names = [m for m in machine_names if m not in seen and not seen.add(m)]

        if args.limit:
            machine_names = machine_names[: args.limit]
            print(f"\nLimited to {args.limit} themes")

        print(f"\nTotal themes to scrape: {len(machine_names)}\n")

    # Scrape phase
    completed = {t["machine_name"] for t in themes}
    to_process = [m for m in machine_names if m not in completed]
    total = len(machine_names)
    done_count = len(themes)

    print("=== Phase 2: Metadata ===\n")

    for i, machine in enumerate(to_process):
        idx = done_count + i + 1
        print(f"[{idx}/{total}] Fetching {machine}...")
        url = f"{API_NODE}?type=project_theme&field_project_machine_name={machine}"
        try:
            data = fetch_json(url)
            time.sleep(DELAY)
            items = data.get("list", [])
            if items:
                theme = process_node(items[0], term_cache)
                themes.append(theme)
            else:
                print(f"  WARNING: No node returned for {machine}")
                themes.append(placeholder_theme(machine))
        except Exception as e:
            print(f"  ERROR: {e} - adding placeholder")
            themes.append(placeholder_theme(machine))
            # Save progress so we can resume
            with open(PROGRESS_FILE, "w") as f:
                json.dump(
                    {"machine_names": machine_names, "themes": themes, "last_error": str(e)},
                    f,
                    indent=2,
                )

        # Save progress periodically (every 10 themes)
        if (idx % 10) == 0:
            with open(PROGRESS_FILE, "w") as f:
                json.dump({"machine_names": machine_names, "themes": themes}, f, indent=2)

    # Write output
    print("\n=== Phase 3: Output ===\n")

    generated = datetime.utcnow().strftime("%Y-%m-%dT%H:%M:%SZ")
    catalog = {
        "generated": generated,
        "source_url": SEARCH_URL,
        "theme_count": len(themes),
        "themes": themes,
    }

    csv_path = OUTPUT_DIR / "00-theme-catalog.csv"
    csv_columns = [
        "machine_name", "name", "project_url", "created", "changed", "author",
        "install_count_7x", "security_coverage", "maintenance_status", "development_status",
        "has_screenshots",
    ]
    with open(csv_path, "w", newline="", encoding="utf-8") as f:
        w = csv.DictWriter(f, fieldnames=csv_columns, extrasaction="ignore")
        w.writeheader()
        for t in themes:
            row = {k: t.get(k, "") for k in csv_columns}
            row["has_screenshots"] = "true" if t.get("has_screenshots") else "false"
            w.writerow(row)
    print(f"Wrote {csv_path}")

    json_path = OUTPUT_DIR / "catalog.json"
    with open(json_path, "w", encoding="utf-8") as f:
        json.dump(catalog, f, indent=2, ensure_ascii=False)
    print(f"Wrote {json_path}")

    # Remove progress file on success
    if PROGRESS_FILE.exists():
        PROGRESS_FILE.unlink()
        print("Removed progress file")

    print(f"\nDone. {len(themes)} themes in catalog.")


if __name__ == "__main__":
    main()
