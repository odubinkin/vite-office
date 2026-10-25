#!/usr/bin/env python3
"""Project both native LC_FORMAT sections and their generated replacement/ref contracts."""
from __future__ import annotations

import argparse
import json
import re
from pathlib import Path
import xml.etree.ElementTree as ET


def registered_roots(source: Path) -> dict[str, ET.Element]:
    """Read only locale XML roots registered by the actual native service table."""
    original = (source / "i18npool/source/localedata/localedata.cxx").read_text()
    code = re.sub(r"/\*.*?\*/|//[^\n]*", "", original, flags=re.S)
    table = code.split("aLibTable[] = {", 1)[1].split("};", 1)[0]
    names = re.findall(r'\{\s*"([^"]+)",\s*DataLocaleLibrary::', table)
    if len(set(names)) != len(names):
        raise ValueError("Duplicate native locale lookup rows")
    directory = source / "i18npool/source/localedata/data"
    return {name: ET.parse(directory / (name + ".xml")).getroot() for name in names}


def catalogs(source: Path) -> dict[str, list[dict[str, object]]]:
    """Resolve the actual registered locale table, preserving native section and element order."""
    roots = registered_roots(source)
    names = list(roots)
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


def locale_fields(source: Path) -> tuple[dict[str, dict[str, str]], dict[str, str]]:
    """Project LCInfoNode's five original fields and LC_CTYPE's referenced DateSeparator."""
    roots = registered_roots(source)
    info = {}
    dates = {}

    def date_separator(name: str, trail: tuple[str, ...] = ()) -> str:
        """Follow the original LC_CTYPE ref without borrowing another locale's LC_INFO."""
        if name in trail:
            raise ValueError("Cyclic LC_CTYPE reference")
        node = roots[name].find("LC_CTYPE")
        if node is None:
            raise ValueError("Missing LC_CTYPE: " + name)
        reference = node.get("ref", "")
        if reference:
            return date_separator(reference.replace("-", "_"), trail + (name,))
        value = node.findtext("Separators/DateSeparator")
        if value is None:
            raise ValueError("Missing DateSeparator: " + name)
        return value

    for name in sorted(roots):
        node = roots[name].find("LC_INFO")
        if node is None:
            raise ValueError("Missing LC_INFO: " + name)
        info[name] = {
            "Language": node.findtext("Language/LangID", ""),
            "LanguageDefaultName": node.findtext("Language/DefaultName", ""),
            "Country": node.findtext("Country/CountryID", ""),
            "CountryDefaultName": node.findtext("Country/DefaultName", ""),
            "Variant": node.findtext("Variant", ""),
        }
        dates[name] = date_separator(name)
    return info, dates


def localized_keyword_languages(source: Path) -> list[dict[str, object]]:
    """Read exactly the native SetDependentKeywords anyOf and original LanguageType values."""
    scanner = (source / "svl/source/numbers/zforscan.cxx").read_text()
    selected = scanner.split("if ( !eLang.anyOf(", 1)[1].split("))", 1)[0]
    names = re.findall(r"LANGUAGE_[A-Z_]+", selected)
    header = (source / "include/i18nlangtag/lang.h").read_text()
    definitions = dict(re.findall(r"^#define\s+(LANGUAGE_\w+)\s+([^\n]+)", header, flags=re.M))

    def value(name: str) -> int:
        """Resolve original literal LanguageType construction or a native macro alias."""
        expression = definitions[name].strip()
        literal = re.match(r"LanguageType\((0x[0-9A-Fa-f]+|[0-9]+)\)", expression)
        if literal:
            return int(literal.group(1), 0)
        return value(expression.split()[0])

    return [{"name": name, "value": value(name)} for name in names]


def main() -> None:
    """Generate or verify every registered source format and currency replacement."""
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--source-root", type=Path, default=Path("vendor/libreoffice-reference"))
    parser.add_argument("--output", type=Path, default=Path("apps/office/src/i18npool/source/localedata/data/number-formats.json"))
    parser.add_argument("--check", action="store_true")
    args = parser.parse_args()
    expected = catalogs(args.source_root)
    info, dates = locale_fields(args.source_root)
    outputs = {
        args.output: expected,
        args.output.with_name("language-country-info.json"): info,
        args.output.with_name("date-separators.json"): dates,
        Path("apps/office/src/svl/source/numbers/data/keyword-localization.json"): localized_keyword_languages(args.source_root),
    }
    for path, values in outputs.items():
        if args.check:
            if json.loads(path.read_text()) != values:
                raise ValueError("Locale/keyword projection differs from pinned source: " + str(path))
        else:
            path.parent.mkdir(parents=True, exist_ok=True)
            path.write_text(json.dumps(values, ensure_ascii=False, indent=2) + "\n")
    print(f"Locale number formats/LC_INFO/date fields verified: {len(expected)} locales, {sum(map(len, expected.values()))} ordered format records; {len(outputs)} resources")



if __name__ == "__main__":
    main()
