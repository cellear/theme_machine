#!/usr/bin/env python3
"""
Generate human-readable MD catalog from catalog.json.
Groups themes by maintenance status; within each group, sorts by install count.
"""
import json
from pathlib import Path

CATALOG = Path(__file__).parent / "catalog.json"
OUTPUT = Path(__file__).parent / "theme-catalog.md"

# Group order: most desirable first
GROUP_ORDER = [
    "Actively maintained",
    "Minimally maintained",
    "Seeking co-maintainer(s)",
    "Seeking new maintainer",
    "Unsupported",
    "",  # empty/unknown
]


def main():
    with open(CATALOG) as f:
        data = json.load(f)

    themes = data["themes"]
    generated = data.get("generated", "")

    # Group by maintenance_status
    groups = {g: [] for g in GROUP_ORDER}
    for t in themes:
        status = t.get("maintenance_status") or ""
        if status not in groups:
            groups[status] = []
        groups[status].append(t)

    # Any unlisted status goes to "Other"
    other = []
    for g in list(groups.keys()):
        if g not in GROUP_ORDER and groups[g]:
            other.extend(groups[g])
            del groups[g]
    if other:
        groups["__other__"] = other
        GROUP_ORDER.append("__other__")

    # Sort within each group by install_count_7x (desc, nulls last)
    def sort_key(t):
        n = t.get("install_count_7x")
        return (1 if n is None else 0, -(n or 0))

    for g in groups:
        groups[g].sort(key=sort_key)

    # Build MD
    lines = [
        "# D7 Theme Catalog",
        "",
        f"**151 themes** from Drupal.org (D7-compatible, full projects). Generated: {generated}",
        "",
        "---",
        "",
    ]

    group_labels = {
        "Actively maintained": "Actively maintained",
        "Minimally maintained": "Minimally maintained",
        "Seeking co-maintainer(s)": "Seeking co-maintainer(s)",
        "Seeking new maintainer": "Seeking new maintainer",
        "Unsupported": "Unsupported",
        "": "Unknown / no status",
        "__other__": "Other",
    }

    for group in GROUP_ORDER:
        items = groups.get(group, [])
        if not items:
            continue
        label = group_labels.get(group, group or "Unknown")
        lines.append(f"## {label} ({len(items)})")
        lines.append("")
        lines.append("| Name | Machine name | Installs | Security | Dev status |")
        lines.append("|------|--------------|----------|----------|------------|")

        for t in items:
            name = t.get("name", "").replace("|", "\\|")
            machine = t.get("machine_name", "")
            installs = t.get("install_count_7x") or "—"
            security = t.get("security_coverage", "—")
            dev = (t.get("development_status") or "—").replace("|", "\\|")
            url = f"https://www.drupal.org/project/{machine}"
            lines.append(f"| [{name}]({url}) | `{machine}` | {installs} | {security} | {dev} |")

        lines.append("")

    with open(OUTPUT, "w", encoding="utf-8") as f:
        f.write("\n".join(lines))

    print(f"Wrote {OUTPUT}")


if __name__ == "__main__":
    main()
