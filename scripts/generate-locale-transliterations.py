#!/usr/bin/env python3
"""Project the native LC_TRANSLITERATION generated resources, preserving ref chains and list order."""
from __future__ import annotations

import argparse
import json
import re
from pathlib import Path
import xml.etree.ElementTree as ET


def catalogs(source: Path) -> dict[str, list[str]]:
    """Resolve exactly the locales shipped by the native lookup table and XML reference functions."""
    original = (source / "i18npool/source/localedata/localedata.cxx").read_text()
    code = re.sub(r"/\*.*?\*/|//[^\n]*", "", original, flags=re.S)
    table = code.split("aLibTable[] = {", 1)[1].split("};", 1)[0]
    names = re.findall(r'\{\s*"([^"]+)",\s*DataLocaleLibrary::', table)
    if len(set(names)) != len(names):
        raise ValueError("Duplicate native locale lookup rows")
    directory = source / "i18npool/source/localedata/data"
    sections: dict[str, ET.Element] = {}
    for name in names:
        node = ET.parse(directory / (name + ".xml")).getroot().find("LC_TRANSLITERATION")
        if node is None:
            raise ValueError("Missing source LC_TRANSLITERATION: " + name)
        sections[name] = node
    resolved: dict[str, list[str]] = {}

    def resolve(name: str, trail: tuple[str, ...] = ()) -> list[str]:
        """Mirror generated getTransliterations ref functions without sorting or filtering module names."""
        if name in resolved:
            return resolved[name]
        if name in trail:
            raise ValueError("Cyclic native locale ref: " + repr(trail + (name,)))
        node = sections[name]
        reference = node.get("ref", "")
        if reference:
            values = list(resolve(reference.replace("-", "_"), trail + (name,)))
        else:
            values = []
            for child in node:
                if child.tag != "Transliteration" or next(iter(child.attrib), None) != "unoid":
                    raise ValueError("Unexpected native transliteration row: " + name)
                values.append(next(iter(child.attrib.values())))
        resolved[name] = values
        return values

    return {name: resolve(name) for name in sorted(names)}


def main() -> None:
    """Generate the browser resource or verify all locale names, references and ordered contents."""
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--source-root", type=Path, default=Path("vendor/libreoffice-reference"))
    parser.add_argument("--output", type=Path, default=Path("apps/office/src/i18npool/source/localedata/data/transliterations.json"))
    parser.add_argument("--check", action="store_true")
    args = parser.parse_args()
    expected = catalogs(args.source_root)
    if args.check:
        if json.loads(args.output.read_text()) != expected:
            raise ValueError("Locale transliteration projection differs from pinned source")
    else:
        args.output.write_text(json.dumps(expected, ensure_ascii=False, indent=2) + "\n")
    print(f"Locale transliteration resources verified: {len(expected)} locales, exact native module order")


if __name__ == "__main__":
    main()
