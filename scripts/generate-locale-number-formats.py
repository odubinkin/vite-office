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


def locale_fields(source: Path) -> tuple[dict[str, dict[str, str]], dict[str, str], dict[str, dict[str, str]], dict[str, dict[str, str]], dict[str, dict[str, str]]]:
    """Project LC_INFO and referenced LC_CTYPE/LC_MISC fields consumed by the formatter."""
    roots = registered_roots(source)
    info = {}
    dates = {}
    times = {}
    long_dates = {}
    reserved = {}

    def ctype(name: str, trail: tuple[str, ...] = ()) -> ET.Element:
        """Follow the original LC_CTYPE ref without borrowing another locale's LC_INFO."""
        if name in trail:
            raise ValueError("Cyclic LC_CTYPE reference")
        node = roots[name].find("LC_CTYPE")
        if node is None:
            raise ValueError("Missing LC_CTYPE: " + name)
        reference = node.get("ref", "")
        if reference:
            return ctype(reference.replace("-", "_"), trail + (name,))
        return node

    def field(node: ET.Element, name: str, path: str) -> str:
        """Require the original generated string field rather than a guessed default."""
        value = node.findtext(path)
        if value is None:
            raise ValueError("Missing " + path + ": " + name)
        return value

    def misc(name: str, trail: tuple[str, ...] = ()) -> ET.Element:
        """Follow the original LC_MISC generated ref to the source reserved-word array."""
        if name in trail:
            raise ValueError("Cyclic LC_MISC reference")
        node = roots[name].find("LC_MISC")
        if node is None:
            raise ValueError("Missing LC_MISC: " + name)
        reference = node.get("ref", "")
        if reference:
            return misc(reference.replace("-", "_"), trail + (name,))
        return node

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
        native_ctype = ctype(name)
        dates[name] = field(native_ctype, name, "Separators/DateSeparator")
        times[name] = {
            "timeSeparator": field(native_ctype, name, "Separators/TimeSeparator"),
            "time100SecSeparator": field(native_ctype, name, "Separators/Time100SecSeparator"),
            "timeAM": field(native_ctype, name, "TimeAM"),
            "timePM": field(native_ctype, name, "TimePM"),
        }
        long_dates[name] = {
            "dayOfWeek": field(native_ctype, name, "Separators/LongDateDayOfWeekSeparator"),
            "day": field(native_ctype, name, "Separators/LongDateDaySeparator"),
            "month": field(native_ctype, name, "Separators/LongDateMonthSeparator"),
        }
        native_misc = misc(name)
        true_word = native_misc.findtext("ReservedWords/trueWord")
        false_word = native_misc.findtext("ReservedWords/falseWord")
        reserved[name] = {
            "trueWord": true_word if true_word is not None else "true",
            "falseWord": false_word if false_word is not None else "false",
        }
    return info, dates, times, long_dates, reserved


def date_acceptance_patterns(source: Path) -> dict[str, list[str]]:
    """Mirror LCFormatNode::generateCode's explicit and edit-format date patterns."""
    roots = registered_roots(source)
    resolved: dict[str, list[str]] = {}

    def generated(name: str, format_code: str) -> list[str]:
        """Translate formatindex 21 using LocaleNode's modifier, quote and separator rules."""
        ctype = roots[name].find("LC_CTYPE")
        if ctype is None:
            raise ValueError("Missing LC_CTYPE: " + name)
        raw_separator = "" if ctype.get("ref") else ctype.findtext("Separators/DateSeparator", "")
        date_separator = raw_separator[0] if raw_separator else ""
        format_separator = date_separator
        pattern: list[str] = []
        alternate: list[str] = []
        detected = 0
        modifier = False
        quoted = False
        index = 0
        while index < len(format_code) and detected < 7:
            char = format_code[index]
            index += 1
            if modifier:
                if char == "]":
                    modifier = False
                continue
            if quoted:
                if char == '"':
                    quoted = False
                continue
            if char in "YyMmDd":
                token = char.upper()
                bit = {"Y": 4, "M": 2, "D": 1}[token]
                if not detected & bit:
                    pattern.append(token)
                    if alternate:
                        alternate.append(token)
                    detected |= bit
                continue
            if char == "[":
                modifier = True
                continue
            if char == '"':
                quoted = True
                continue
            if char in "AJTGPKV":
                localized = None
                bits = detected & 7
                if char == "A" and bits in (0, 3):
                    localized = ("Y", 4)
                elif char == "J" and bits in (0, 6):
                    localized = ("D", 1)
                elif char == "J" and bits == 3:
                    localized = ("Y", 4)
                elif char in "TGP" and bits == 0:
                    localized = ("D", 1)
                elif char == "K" and bits == 1:
                    localized = ("M", 2)
                elif char == "V" and bits == 3:
                    localized = ("Y", 4)
                if localized:
                    token, bit = localized
                    pattern.append(token)
                    if alternate:
                        alternate.append(token)
                    detected |= bit
                continue
            if char == "\\" and index < len(format_code):
                char = format_code[index]
                index += 1
            elif char in "-./":
                format_separator = char
            if not date_separator:
                date_separator = char
            if not format_separator:
                format_separator = char
            if date_separator != format_separator and not alternate:
                alternate = pattern.copy()
            if char == date_separator or char == format_separator:
                pattern.append(date_separator)
            if char == format_separator and alternate:
                alternate.append(format_separator)
        first = "".join(pattern)
        if detected & 7 != 7 or len(first) < 5:
            raise ValueError(f"Failed source date pattern for {name}: {format_code!r} -> {first!r}")
        result = [first]
        if alternate:
            second = "".join(alternate)
            if len(second) < 5:
                raise ValueError(f"Failed second source date pattern for {name}: {second!r}")
            result.append(second)
        return result

    def patterns(name: str, trail: tuple[str, ...] = ()) -> list[str]:
        """Follow LC_FORMAT refs, which delegate getDateAcceptancePatterns to the leaf locale."""
        if name in resolved:
            return resolved[name]
        if name in trail:
            raise ValueError("Cyclic LC_FORMAT date pattern reference")
        node = roots[name].find("LC_FORMAT")
        if node is None:
            raise ValueError("Missing LC_FORMAT: " + name)
        if reference := node.get("ref"):
            result = patterns(reference.replace("-", "_"), trail + (name,))
        else:
            result = []
            for child in node.findall("DateAcceptancePattern"):
                value = child.text or ""
                if value not in result:
                    result.append(value)
            edit = next((item.findtext("FormatCode") for item in node.findall("FormatElement")
                         if item.get("formatindex") == "21"), None)
            if edit is None:
                raise ValueError("Missing DATE_SYS_DDMMYYYY formatindex 21: " + name)
            for value in generated(name, edit):
                if value not in result:
                    result.append(value)
        resolved[name] = result
        return result

    return {name: patterns(name) for name in sorted(roots)}


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
    info, dates, times, long_dates, reserved = locale_fields(args.source_root)
    outputs = {
        args.output: expected,
        args.output.with_name("language-country-info.json"): info,
        args.output.with_name("date-separators.json"): dates,
        args.output.with_name("time-fields.json"): times,
        args.output.with_name("long-date-separators.json"): long_dates,
        args.output.with_name("reserved-words.json"): reserved,
        args.output.with_name("date-acceptance-patterns.json"): date_acceptance_patterns(args.source_root),
        Path("apps/office/src/svl/source/numbers/data/keyword-localization.json"): localized_keyword_languages(args.source_root),
    }
    for path, values in outputs.items():
        if args.check:
            if json.loads(path.read_text()) != values:
                raise ValueError("Locale/keyword projection differs from pinned source: " + str(path))
        else:
            path.parent.mkdir(parents=True, exist_ok=True)
            path.write_text(json.dumps(values, ensure_ascii=False, indent=2) + "\n")
    print(f"Locale number formats and fields verified: {len(expected)} locales, {sum(map(len, expected.values()))} ordered format records; {len(outputs)} resources")



if __name__ == "__main__":
    main()
