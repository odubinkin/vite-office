#!/usr/bin/env python3
"""Project both native LC_FORMAT sections and their generated replacement/ref contracts."""
from __future__ import annotations

import argparse
import json
import re
from pathlib import Path
import xml.etree.ElementTree as ET


def catalogs(source: Path) -> dict[str, list[dict[str, object]]]:
    """Resolve the actual registered locale table, preserving native section and element order."""
    original = (source / "i18npool/source/localedata/localedata.cxx").read_text()
    code = re.sub(r"/\*.*?\*/|//[^\n]*", "", original, flags=re.S)
    table = code.split("aLibTable[] = {", 1)[1].split("};", 1)[0]
    names = re.findall(r'\{\s*"([^"]+)",\s*DataLocaleLibrary::', table)
    if len(set(names)) != len(names):
        raise ValueError("Duplicate native locale lookup rows")
    directory = source / "i18npool/source/localedata/data"
    roots = {name: ET.parse(directory / (name + ".xml")).getroot() for name in names}
    resolved: dict[tuple[str, int], tuple[list[dict[str, object]], str, str]] = {}

    def section(name: str, index: int, trail: tuple[str, ...] = ()) -> tuple[list[dict[str, object]], str, str]:
        """Mirror OFileWriter ref functions:the outer ref overrides to,but borrows the leaf from/code array."""
        key = (name, index)
        if key in resolved:
            return resolved[key]
        if name in trail:
            raise ValueError("Cyclic native format ref: " + repr(trail + (name,)))
        node = roots[name].find("LC_FORMAT" if index == 0 else "LC_FORMAT_1")
        if node is None:
            if index == 0:
                raise ValueError("Missing mandatory LC_FORMAT: " + name)
            return [], "", ""
        reference = node.get("ref", "")
        replacement = node.get("replaceTo", "")
        if reference:
            rows, before, _ = section(reference.replace("-", "_"), index, trail + (name,))
        else:
            before = node.get("replaceFrom", "")
            rows = []
            for child in node:
                if child.tag == "DateAcceptancePattern":
                    continue
                if child.tag != "FormatElement":
                    raise ValueError("Unexpected native format element: " + child.tag)
                value = child.findtext("FormatCode")
                if value is None:
                    raise ValueError("Missing FormatCode: " + name)
                rows.append({
                    "formatCode": value,
                    "formatName": child.findtext("DefaultName", ""),
                    "formatKey": child.attrib["msgid"],
                    "formatType": child.attrib["type"],
                    "formatUsage": child.attrib["usage"],
                    "formatIndex": int(child.attrib["formatindex"]),
                    "isDefault": child.attrib["default"] == "true",
                })
        resolved[key] = rows, before, replacement
        return resolved[key]

    result = {}
    for name in sorted(names):
        values = []
        for index in range(2):
            rows, before, after = section(name, index)
            values.extend({**row, "formatCode": str(row["formatCode"]).replace(before, after) if before else row["formatCode"]} for row in rows)
        result[name] = values
    return result


def main() -> None:
    """Generate or verify every registered source format and currency replacement."""
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--source-root", type=Path, default=Path("vendor/libreoffice-reference"))
    parser.add_argument("--output", type=Path, default=Path("apps/office/src/i18npool/source/localedata/data/number-formats.json"))
    parser.add_argument("--check", action="store_true")
    args = parser.parse_args()
    expected = catalogs(args.source_root)
    if args.check:
        if json.loads(args.output.read_text()) != expected:
            raise ValueError("Locale number-format projection differs from pinned source")
    else:
        args.output.write_text(json.dumps(expected, ensure_ascii=False, indent=2) + "\n")
    print(f"Locale number formats verified: {len(expected)} locales, {sum(map(len, expected.values()))} ordered records")


if __name__ == "__main__":
    main()
