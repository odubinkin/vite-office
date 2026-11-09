#!/usr/bin/env python3
"""Extract the original SAL Big5, GB18030 and CNS11643 converter tables."""
from __future__ import annotations

import argparse
import ast
import hashlib
import json
import operator
import re
from pathlib import Path
from subprocess import check_output

PIN = "9bc445578031fecf56086729d8e4940c77e14d65"
ROOT = Path(__file__).resolve().parent.parent
VENDOR = ROOT / "vendor/libreoffice-reference"
SOURCE = VENDOR / "sal/textenc"
DESTINATION = ROOT / "apps/office/src/sal/textenc"


def load(name: str, hashes: dict[str, str]) -> str:
    """Reads the original table and records its byte hash."""
    raw = (SOURCE / name).read_bytes()
    hashes[f"sal/textenc/{name}"] = hashlib.sha256(raw).hexdigest()
    return re.sub(r"/\*.*?\*/|//[^\n]*", "", raw.decode(), flags=re.S)


def initializer(source: str, name: str) -> str:
    """Locates exactly one C++ named counted initializer."""
    matches = re.findall(rf"\b{re.escape(name)}\[[^\]]*\]\s*=\s*\{{(.*?)\}};", source, re.S)
    if len(matches) != 1:
        raise ValueError(f"Expected one initializer for {name}, got {len(matches)}")
    return matches[0]


def integer_expression(node: ast.AST) -> int:
    """Evaluates only the literal and arithmetic forms in the pinned table."""
    if isinstance(node, ast.Constant) and type(node.value) is int:
        return node.value
    if isinstance(node, ast.UnaryOp) and isinstance(node.op, ast.USub):
        return -integer_expression(node.operand)
    if isinstance(node, ast.BinOp):
        operations = {ast.Mult: operator.mul, ast.LShift: operator.lshift, ast.BitOr: operator.or_}
        operation = operations.get(type(node.op))
        if operation is not None:
            return operation(integer_expression(node.left), integer_expression(node.right))
    raise ValueError(f"Unexpected C++ integer expression: {ast.dump(node)}")


def number(expression: str) -> int:
    """Reads the integer literals and packed values in the generated C++ tables."""
    expression = expression.strip()
    try:
        return int(expression, 0)
    except ValueError:
        return integer_expression(ast.parse(expression, mode="eval").body)


def numbers(body: str) -> list[int]:
    """Preserves the original initializer's integer order."""
    return [number(value) for value in body.split(",") if value.strip()]


def rows(body: str) -> list[list[str]]:
    """Reads each original nested array row and its field spelling."""
    return [
        [item.strip() for item in row.split(",") if item.strip()]
        for row in re.findall(r"\{([^{}]+)\}", body)
    ]


def big5(hashes: dict[str, str]) -> dict[str, object]:
    """Copies the original pointer layout and resolves exact forward and reverse tables."""
    descriptors = load("tcvttcn6.tab", hashes)
    forward_source = load("tcvttcn1.tab", hashes)
    reverse_source = load("tcvttcn2.tab", hashes)
    tables: dict[str, list[int]] = {}
    lead = []
    high = []
    for uni, first, last, name in rows(initializer(descriptors, "aBIG5UniLeadTab")):
        lead.append({
            "mnUniChar": number(uni),
            "mnTrailStart": number(first),
            "mnTrailEnd": number(last),
            "table": None if name == "nullptr" else name,
        })
        if name not in ("nullptr", "aImplDoubleByteIdentifierTab"):
            tables[name] = numbers(initializer(forward_source, name))
    for first, last, name in rows(initializer(descriptors, "aBIG5DBCSHighTab")):
        high.append({
            "mnLowStart": number(first),
            "mnLowEnd": number(last),
            "table": None if name == "nullptr" else name,
        })
        if name != "nullptr":
            tables[name] = numbers(initializer(reverse_source, name))
    if len(lead) != 256 or len(high) != 256:
        raise ValueError("Unexpected Big5 pointer table width")
    return {"lead": lead, "high": high, "tables": tables}


def gb18030(hashes: dict[str, str]) -> dict[str, object]:
    """Copies both data owners and the native range records."""
    source = load("generate/gb180302000.tab", hashes)
    return {
        "aImplGb180302000ToUnicodeData": numbers(initializer(source, "aImplGb180302000ToUnicodeData")),
        "aImplGb180302000ToUnicodeRanges": [
            {"m_nNonRangeDataIndex": number(index), "m_nFirstLinear": number(first),
             "m_nPastLinear": number(last), "m_nFirstUnicode": number(unit)}
            for index, first, last, unit in rows(initializer(source, "aImplGb180302000ToUnicodeRanges"))
        ],
        "aImplUnicodeToGb180302000Data": numbers(initializer(source, "aImplUnicodeToGb180302000Data")),
        "aImplUnicodeToGb180302000Ranges": [
            {"m_nNonRangeDataIndex": number(index), "m_nFirstUnicode": number(first),
             "m_nLastUnicode": number(last), "m_nFirstLinear": number(linear)}
            for index, first, last, linear in rows(initializer(source, "aImplUnicodeToGb180302000Ranges"))
        ],
    }


def cns11643(hashes: dict[str, str]) -> dict[str, object]:
    """Copies the original plane, row and page owners for ISO-2022-CN."""
    source = load("generate/cns116431992.tab", hashes)
    names = (
        "aImplCns116431992ToUnicodeData",
        "aImplCns116431992ToUnicodeRowOffsets",
        "aImplCns116431992ToUnicodePlaneOffsets",
        "aImplUnicodeToCns116431992Data",
        "aImplUnicodeToCns116431992PageOffsets",
        "aImplUnicodeToCns116431992PlaneOffsets",
    )
    return {name: numbers(initializer(source, name)) for name in names}


def main() -> None:
    """Rebuilds or verifies the exact browser table projection."""
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--check", action="store_true")
    args = parser.parse_args()
    revision = check_output(["git", "-C", str(VENDOR), "rev-parse", "HEAD"], text=True).strip()
    if revision != PIN:
        raise ValueError("Changed pinned LibreOffice source")
    for filename, extract in (
        ("tcvttcn6.big5.tables.json", big5),
        ("convertgb18030.tables.json", gb18030),
        ("cns116431992.tables.json", cns11643),
    ):
        hashes: dict[str, str] = {}
        tables = extract(hashes)
        contents = check_output(
            [str(ROOT / "node_modules/.bin/prettier"), "--parser", "json"],
            cwd=ROOT,
            input=json.dumps({"baselineCommit": PIN, "sourceSha256": hashes, **tables}, separators=(",", ":")),
            text=True,
        )
        destination = DESTINATION / filename
        if args.check:
            if destination.read_text() != contents:
                raise ValueError(f"Stale pinned converter tables: {destination}")
        else:
            destination.write_text(contents)


if __name__ == "__main__":
    main()
