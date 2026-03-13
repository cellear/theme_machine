#!/usr/bin/env python3
"""
API Discovery for D7 Theme Catalog (epic0228-theme-catalog).
Fetches the canonical D7 theme search URL, extracts machine names,
validates API responses for a sample of themes.
"""
import json
import re
import subprocess
import time

BASE = "https://www.drupal.org"
SEARCH_URL = (
    f"{BASE}/project/project_theme"
    "?f%5B44%5D=&f%5B46%5D=&f%5B47%5D=sm_core_compatibility%3A7"
    "&f%5B48%5D=sm_field_project_type%3Afull&f%5B49%5D=&f%5B50%5D="
    "&text=&solrsort=ds_created+desc&op=Search"
)
API_NODE = f"{BASE}/api-d7/node.json"
API_TERM = f"{BASE}/api-d7/taxonomy_term"
DELAY = 1.5  # seconds between requests


def fetch(url: str) -> str:
    """Fetch URL via curl (Drupal.org blocks Python urllib/requests from some contexts)."""
    result = subprocess.run(
        ["curl", "-sL", url],
        capture_output=True,
        text=True,
        timeout=30,
    )
    result.check_returncode()
    return result.stdout


def fetch_json(url: str) -> dict:
    return json.loads(fetch(url))


def extract_machine_names(html: str) -> list[str]:
    """Extract project machine names from search result HTML."""
    # Match href="/project/{machine_name}" but exclude /project/issues and /project/project_theme
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


def main():
    print("=== D7 Theme API Discovery ===\n")

    # 1. Paginate search and collect machine names
    all_machines = []
    page = 0
    while True:
        url = f"{SEARCH_URL}&page={page}"
        print(f"Fetching search page {page}...")
        html = fetch(url)
        time.sleep(DELAY)

        # Extract count from "### N themes match your search"
        count_match = re.search(r"### (\d+) themes match your search", html)
        if count_match:
            total_count = int(count_match.group(1))
            print(f"  Reported total: {total_count} themes")
        else:
            total_count = None

        machines = extract_machine_names(html)
        if not machines:
            break
        all_machines.extend(machines)
        print(f"  Found {len(machines)} themes on this page (cumulative: {len(all_machines)})")
        page += 1

    # Deduplicate while preserving order
    seen = set()
    unique = []
    for m in all_machines:
        if m not in seen:
            seen.add(m)
            unique.append(m)

    print(f"\nTotal unique machine names: {len(unique)}")
    if total_count and len(unique) != total_count:
        print(f"  FLAG: Count mismatch! Search reported {total_count}, we extracted {len(unique)}")

    # 2. Sample 8 themes and fetch full API response
    sample = unique[:4] + unique[len(unique) // 2 : len(unique) // 2 + 2] + unique[-2:]
    sample = list(dict.fromkeys(sample))[:8]  # dedupe, cap at 8

    print(f"\nValidating API for sample themes: {sample}")

    sample_results = []
    for machine in sample:
        url = f"{API_NODE}?type=project_theme&field_project_machine_name={machine}"
        print(f"  Fetching {machine}...")
        try:
            data = fetch_json(url)
            time.sleep(DELAY)
            items = data.get("list", [])
            if items:
                node = items[0]
                sample_results.append(
                    {
                        "machine_name": machine,
                        "has_body": "body" in node and bool(node.get("body", {}).get("value")),
                        "has_author": "author" in node and bool(node.get("author", {}).get("name")),
                        "has_images": bool(node.get("field_project_images")),
                        "created": node.get("created"),
                        "changed": node.get("changed"),
                        "project_usage": node.get("project_usage"),
                        "taxonomy_44": node.get("taxonomy_vocabulary_44"),
                        "taxonomy_46": node.get("taxonomy_vocabulary_46"),
                    }
                )
            else:
                sample_results.append({"machine_name": machine, "error": "No node returned"})
        except Exception as e:
            sample_results.append({"machine_name": machine, "error": str(e)})

    # 3. Resolve taxonomy terms for first sample
    if sample_results and "taxonomy_44" in sample_results[0]:
        tid = sample_results[0].get("taxonomy_44", {}).get("id")
        if tid:
            print(f"\nResolving taxonomy term {tid} (maintenance status)...")
            try:
                term = fetch_json(f"{API_TERM}/{tid}.json")
                print(f"  -> {term.get('name')}")
            except Exception as e:
                print(f"  -> Error: {e}")
            time.sleep(DELAY)

        tid = sample_results[0].get("taxonomy_46", {}).get("id")
        if tid:
            print(f"Resolving taxonomy term {tid} (development status)...")
            try:
                term = fetch_json(f"{API_TERM}/{tid}.json")
                print(f"  -> {term.get('name')}")
            except Exception as e:
                print(f"  -> Error: {e}")

    # 4. Write report
    report = {
        "generated": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
        "search_url": SEARCH_URL,
        "reported_total": total_count,
        "extracted_count": len(unique),
        "machine_names": unique,
        "sample_validation": sample_results,
    }

    out_path = "TOOLING/theme-catalog/api-discovery-report.json"
    with open(out_path, "w") as f:
        json.dump(report, f, indent=2)
    print(f"\nReport written to {out_path}")

    # Summary
    print("\n=== Summary ===")
    print(f"Search pages: {page}")
    print(f"Themes extracted: {len(unique)}")
    print(f"Sample validated: {len([r for r in sample_results if 'error' not in r])}/{len(sample)}")
    if sample_results:
        has_all = all(
            r.get("has_body") and r.get("has_author")
            for r in sample_results
            if "error" not in r
        )
        print(f"Field coverage (body, author): {'OK' if has_all else 'MISSING in some'}")


if __name__ == "__main__":
    main()
