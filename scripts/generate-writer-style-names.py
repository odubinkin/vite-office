#!/usr/bin/env python3
"""Extract pinned native style-name ranges and English resource tables; --check verifies the source-derived table values."""
import ast
import json
import pathlib
import re
import sys

ROOT = pathlib.Path(__file__).resolve().parent.parent
REF = ROOT / "vendor/libreoffice-reference"


def uncomment(text):
    """Remove C++ comments without treating quoted resource content as comments."""
    return re.sub(r'"(?:\\.|[^"\\])*"|/\*[\s\S]*?\*/|//[^\n]*',
                  lambda match: match[0] if match[0].startswith('"') else "", text)


def expression(text, values):
    """Evaluate only the source enum's integer constant-expression operators."""
    def visit(node):
        if isinstance(node, ast.Constant) and isinstance(node.value, int):
            return node.value
        if isinstance(node, ast.Name):
            return values[node.id]
        if isinstance(node, ast.UnaryOp) and isinstance(node.op, ast.Invert):
            return ~visit(node.operand)
        if isinstance(node, ast.BinOp):
            left, right = visit(node.left), visit(node.right)
            operators = {ast.Add: lambda: left + right, ast.Sub: lambda: left - right,
                         ast.LShift: lambda: left << right, ast.BitOr: lambda: left | right,
                         ast.BitAnd: lambda: left & right}
            if type(node.op) in operators:
                return operators[type(node.op)]()
        raise ValueError("Unsupported source constant expression: " + text)
    return visit(ast.parse(text.strip(), mode="eval").body)


def enum_values(source, name, values):
    """Read original explicit values and implicit incrementing enumerators."""
    body = re.search(r"enum class " + name + r"[^\{]*\{([\s\S]*?)\};", source)[1]
    previous = -1
    for part in body.split(","):
        if not part.strip():
            continue
        fields = part.strip().split("=", 1)
        key = fields[0].strip()
        previous = expression(fields[1], values) if len(fields) == 2 else previous + 1
        values[key] = previous


mapper = uncomment((REF / "sw/source/core/doc/SwStyleNameMapper.cxx").read_text())
manager = uncomment((REF / "sw/source/core/doc/DocumentStylePoolManager.cxx").read_text())
header = uncomment((REF / "sw/inc/poolfmt.hxx").read_text())
values = {"USHRT_MAX": 65535}
for key, expr in re.findall(r"const sal_uInt16\s+(\w+)\s*=([^;]+);", header.split("enum class")[0]):
    values[key] = expression(expr, values)
enum_values(header, "SwPoolFormatId", values)
families = {}
enum_values(uncomment((REF / "sw/inc/SwGetPoolIdFromName.hxx").read_text()), "SwGetPoolIdFromName", families)
resources = {}
for path in ["sw/inc/strings.hrc", "include/svx/strings.hrc"]:
    for key, text in re.findall(r'#define\s+(\w+)\s+NC_\("(?:\\.|[^"\\])*",\s*("(?:\\.|[^"\\])*")\)', (REF / path).read_text()):
        resources[key] = json.loads(text)
records = []
for family, function in re.findall(r"case SwGetPoolIdFromName::(\w+):\s*return TablePair<(\w+)>::getMap", mapper):
    body = re.search(r"NameToIdHash " + function + r"\s*\([^)]*\)\s*\{([\s\S]*?)\n\}", mapper)[1]
    for begin, end, prog, ui in re.findall(r"SwPoolFormatId::(\w+),\s*SwPoolFormatId::(\w+),\s*bProgName\s*\?\s*&SwStyleNameMapper::(\w+)\s*:\s*&SwStyleNameMapper::(\w+)", body):
        start, finish = values[begin], values[end]
        if start == finish:
            prog_names, ui_names = [], []
        else:
            prog_body = re.search(r"SwStyleNameMapper::" + prog + r"\(\)\s*\{([\s\S]*?)\n\}", mapper)[1]
            prog_names = [json.loads('"' + text + '"') for text in re.findall(r'u"((?:\\.|[^"\\])*)"_ustr', prog_body)]
            ui_body = re.search(r"SwStyleNameMapper::" + ui + r"\(\)\s*\{([\s\S]*?)\n\}", manager)[1]
            table = re.search(r"lcl_NewUINameArray\((\w+),", ui_body)[1]
            table_body = re.search(r"\b" + table + r"\s*\[\]\s*=?\s*\{([\s\S]*?)\};", manager)[1]
            keys = re.findall(r"\b(?:STR_|RID_)[A-Z0-9_]+\b", table_body)
            ui_names = [resources[key] for key in keys]
        assert len(prog_names) == len(ui_names) == finish - start, (family, begin, len(prog_names), len(ui_names), finish - start)
        records.append({"family": families[family], "begin": start, "end": finish, "uiArray": ui, "programmaticArray": prog,
                        "mask": start & (values["USER_FMT"] | values["COLL_GET_RANGE_BITS"] | values["POOLGRP_NOCOLLID"]),
                        "programmatic": prog_names, "ui": ui_names})
assert len(records) == 13, len(records)
output = ROOT / "apps/office/src/sw/source/core/doc/SwStyleNameMapper-data.json"
special = [values[key] - values["COLL_EXTRA_BEGIN"] for key in re.findall(r"sal_uInt16\(SwPoolFormatId::(COLL_LABEL_\w+)\)\s*-", mapper)]
assert len(special) == 5
content = json.dumps({"ranges": records, "specialExtraIndices": special}, ensure_ascii=False, indent=2) + "\n"
if "--check" in sys.argv:
    assert json.loads(output.read_text()) == json.loads(content), "Writer style-name tables differ from pinned source"
else:
    output.write_text(content)
print("Verified" if "--check" in sys.argv else "Generated", len(records), "native style-name ranges,", sum(len(r["ui"]) for r in records), "names")
