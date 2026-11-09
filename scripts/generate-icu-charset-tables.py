#!/usr/bin/env python3
"""Extract the pinned ICU charset recognizer's original static tables."""
from __future__ import annotations

import argparse
import hashlib
import json
import re
from pathlib import Path
from subprocess import check_output

PIN = "45672f08cc906c6a5db18380e9030ae0f6a0f7bb"
ROOT = Path(__file__).resolve().parent.parent
SOURCE = ROOT / "vendor/icu-reference"
DESTINATION = ROOT / "apps/office/src/external/icu/source/i18n"


def values(body: str) -> list[int]:
    """Read a counted initializer's unchanged integer values."""
    return [int(value.strip(), 0) for value in body.split(",") if value.strip()]


def extract(owner: str) -> dict[str, object]:
    """Read the native arrays, retaining model order and escape terminators."""
    source = SOURCE / "source/i18n" / f"{owner}.cpp"
    raw = source.read_bytes()
    code = re.sub(r"/\*.*?\*/|//[^\n]*", "", raw.decode(), flags=re.S)
    arrays = re.findall(
        r"static const (uint8_t|uint16_t|int32_t|NGramsPlusLang)\s+(\w+)\s*"
        r"\[\](\[5\])?\s*=\s*\{(.*?)\};",
        code,
        re.S,
    )
    tables: dict[str, object] = {}
    for kind, name, width, body in arrays:
        if kind == "NGramsPlusLang":
            rows = [
                {"ngrams": values(ngrams), "language": language}
                for ngrams, language in re.findall(r'\{\s*\{([^{}]+)\},\s*"([^"]+)"\s*\}', body)
            ]
            if not rows or any(len(row["ngrams"]) != 64 for row in rows):
                raise ValueError(f"Invalid n-gram language table {name}")
            tables[name] = rows
        elif width:
            sequences = [values(row) for row in re.findall(r"\{([^{}]+)\}", body)]
            if not sequences or any(len(row) != 5 or row[0] != 0x1B or row[-1] for row in sequences):
                raise ValueError(f"Invalid ISO-2022 table {name}")
            tables[name] = sequences
        else:
            integers = values(body)
            if not integers or (kind == "uint8_t" and len(integers) != 256):
                raise ValueError(f"Invalid byte map {name}")
            if kind == "int32_t" and len(integers) != 64:
                raise ValueError(f"Invalid n-gram table {name}")
            tables[name] = integers
    expected = {"csr2022": 3, "csrmbcs": 5, "csrsbcs": 28}
    if len(tables) != expected[owner]:
        raise ValueError(f"Unexpected static table count for {owner}: {len(tables)}")
    return {
        "source": f"source/i18n/{owner}.cpp",
        "baselineCommit": PIN,
        "sourceSha256": hashlib.sha256(raw).hexdigest(),
        "tables": tables,
    }


def main() -> None:
    """Write or verify the canonical tables from the pinned source."""
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--check", action="store_true")
    args = parser.parse_args()
    revision = check_output(["git", "-C", str(SOURCE), "rev-parse", "HEAD"], text=True).strip()
    if revision != PIN:
        raise ValueError("Changed ICU source revision")
    for owner in ("csr2022", "csrmbcs", "csrsbcs"):
        result = check_output(
            [str(ROOT / "node_modules/.bin/prettier"), "--parser", "json"],
            input=json.dumps(extract(owner), separators=(",", ":")),
            text=True,
            cwd=ROOT,
        )
        destination = DESTINATION / f"{owner}.tables.json"
        if args.check:
            if destination.read_text() != result:
                raise ValueError(f"Stale native charset tables: {destination}")
        else:
            destination.write_text(result)


if __name__ == "__main__":
    main()
