#!/usr/bin/env python3
"""Project the pinned LibreOffice native-number character tables used by NATNUM0."""

import argparse
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "vendor/libreoffice-reference/i18npool/source/nativenumber/data/numberchar.h"
TARGET = ROOT / "apps/office/src/i18npool/source/nativenumber/data/numberchar.json"


def array(source: str, name: str, rows: bool = False) -> list:
    match = re.search(r"\b" + name + r"\s*\[[^;=]*=\s*\{(.*?)\n\};", source, re.S)
    if match is None:
        raise ValueError(f"Missing upstream array {name}")
    body = re.sub(r"//[^\n]*", "", match.group(1))
    if rows:
        return [
            [int(value, 16) for value in re.findall(r"0x([0-9A-Fa-f]+)", row)]
            for row in re.findall(r"\{([^{}]+)\}", body)
        ]
    return [int(value, 16) for value in re.findall(r"0x([0-9A-Fa-f]+)", body)]


def decimal_array(source: str, name: str) -> list[int]:
    match = re.search(r"\b" + name + r"\s*\[[^;=]*=\s*\{(.*?)\};", source, re.S)
    if match is None:
        raise ValueError(f"Missing upstream array {name}")
    body = re.sub(r"//[^\n]*", "", match.group(1))
    return [int(value) for value in re.findall(r"\b\d+\b", body)]


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--check", action="store_true")
    args = parser.parse_args()
    source = SOURCE.read_text()
    data = {
        "numberChar": array(source, "NumberChar", True),
        "decimalChar": array(source, "DecimalChar"),
        "minusChar": array(source, "MinusChar"),
        "separatorChar": array(source, "SeparatorChar"),
        "multiplierChar7Cjk": array(source, "MultiplierChar_7_CJK", True),
        "multiplierExponent7Cjk": decimal_array(source, "MultiplierExponent_7_CJK"),
    }
    rendered = json.dumps(data, ensure_ascii=False, indent=2) + "\n"
    if args.check:
        if not TARGET.exists() or TARGET.read_text() != rendered:
            raise SystemExit(f"Outdated generated source table: {TARGET}")
    else:
        TARGET.parent.mkdir(parents=True, exist_ok=True)
        TARGET.write_text(rendered)


if __name__ == "__main__":
    main()
