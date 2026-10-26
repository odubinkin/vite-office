#!/usr/bin/env python3
"""Generate consumed Writer factory tables with unchanged pinned native generators."""
import argparse
import importlib.util
import json
from pathlib import Path
import re
import subprocess
import sys
import tempfile
from xml.dom import minidom

sys.dont_write_bytecode = True
ROOT = Path(__file__).resolve().parents[2]
NATIVE = ROOT / "vendor/libreoffice-reference"
OOXML = NATIVE / "sw/source/writerfilter/ooxml"
OUTPUT = ROOT / "apps/office/src/sw/source/writerfilter/ooxml"
# This is the current consumed factory surface. References retain their complete
# native IDs; omitted definitions never renumber admitted definitions or tokens.
CONSUMED = (
    "CT_Document CT_Body CT_P CT_R CT_Text CT_PPr CT_RPr CT_Style CT_Styles "
    "CT_DocDefaults CT_PPrDefault CT_RPrDefault CT_Fonts CT_Underline CT_Color "
    "CT_Ind CT_Spacing CT_Jc CT_OnOff CT_HpsMeasure CT_DecimalNumber CT_String "
    "CT_VerticalAlignRun CT_Highlight EG_RPrBase CT_TblWidth CT_Height "
    "CT_TblCellMar CT_TcMar CT_LatentStyles CT_LsdException CT_TblPrBase CT_TrPrBase CT_TcPrBase CT_Border CT_TblBorders CT_TcBorders CT_TrackChange CT_Markup CT_Shd"
).split()


def original(script, *arguments):
    """Capture the exact output of a local pinned generator."""
    return subprocess.check_output([sys.executable, str(script), *map(str, arguments)], text=True)


def generate():
    """Return native attribute/element/resource/list/action tables for the slice."""
    spec = importlib.util.spec_from_file_location("native_factoryimpl_ns", OOXML / "factoryimpl_ns.py")
    native = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(native)
    coverage = ROOT / "apps/office/coverage"
    coverage.mkdir(exist_ok=True)
    with tempfile.TemporaryDirectory(dir=coverage, prefix="native-ooxml-") as temporary:
        temp = Path(temporary)
        tokens = NATIVE / "oox/source/token"
        original(tokens / "namespaces.py", tokens / "namespaces.txt", temp / "ids.hxx",
                 temp / "names.hxx", temp / "namespaces.txt", tokens / "namespaces-strict.txt",
                 temp / "strict.hxx")
        original(NATIVE / "solenv/bin/generate-tokens.py", tokens / "tokens.txt",
                 temp / "tokenids.hxx", temp / "tokennames.inc", temp / "tokens.gperf")
        token_names = re.findall(r'"([^"]*)",', (temp / "tokennames.inc").read_text())
        local_names = {name: token_names[int(index)] for name, index in
                       re.findall(r"const sal_Int32 (\w+) = (\d+);", (temp / "tokenids.hxx").read_text())
                       if name != "XML_TOKEN_COUNT"}
        model = minidom.parseString(original(OOXML / "modelpreprocess.py", temp / "namespaces.txt", OOXML / "model.xml"))
        stream_namespaces = {}
        for line in (temp / "namespaces.txt").read_text().splitlines():
            identifier, alias, uri = line.split(" ")
            stream_namespaces[uri] = int(identifier)
    model_node = native.getChildByName(model, "model")
    namespaces = {n.getAttribute("name"): n for n in native.getChildrenByName(model_node, "namespace")}
    wml = namespaces["wml"]
    grammar = native.getChildByName(wml, "grammar")
    definitions = {d.getAttribute("name"): d for d in native.getChildrenByName(grammar, "define")}
    resources = {r.getAttribute("name"): r for r in native.getChildrenByName(wml, "resource")}
    includes = original(OOXML / "factoryinc.py", OOXML / "model.xml")
    ids = {"NN_" + k: int(v) << 16 for k, v in re.findall(r"const Id NN_(\w+) = (\d+) << 16;", includes)}
    ids.update({"DEFINE_" + k: int(v) for k, v in re.findall(r"const Id DEFINE_(\w+) = (\d+);", includes)})
    tokens = original(OOXML / "resourceids.py", OOXML / "model.xml")
    token_ids = {"NS_ooxml::" + k: int(v) for k, v in re.findall(r"const Id (LN_\w+) = (\d+);", tokens)}

    def identity(expression):
        """Evaluate only the native OR of two generated constant names."""
        if expression == "0":
            return 0
        value = 0
        for name in expression.split("|"):
            value |= ids[name.strip()]
        return value

    def qname(expression):
        """Bind native fast-token constants to canonical namespace/local XML names."""
        match = re.fullmatch(r"(?:oox::NMSP_(\w+)\|)?oox::(\w+)", expression)
        if match is None:
            raise ValueError(expression)
        return (match[1] or "") + ":" + local_names[match[2]]

    attributes, elements, resource_ids, actions, lists = [], [], [], [], []
    used_defines = {0: "start"}
    list_definitions = set()
    for name in CONSUMED:
        definition = definitions[name]
        identifier = identity(native.idForDefine(wml, definition))
        used_defines[identifier] = name
        resource = resources.get(name)
        mapping, order = native.collectAttributeToResource(wml, definition)
        seen = set()
        for token in order:
            if token in seen:
                continue
            seen.add(token)
            kind, ref = mapping[token].split(", ")
            reference = identity(ref)
            attributes.append([identifier, qname(token), kind.removeprefix("ResourceType::"), reference])
            if kind == "ResourceType::List":
                list_definitions.add(ref)
        for token, cpp in native.factoryCreateElementMapInner(namespaces, wml, definition).items():
            match = re.search(r"rOutResource = ResourceType::(\w+); rOutElement = ([^;]+);", cpp)
            elements.append([identifier, qname(token), match[1], identity(match[2])])
        for token, value in native.collectTokenToId(wml, definition).items():
            resource_ids.append([identifier, qname(token), token_ids[value]])
        if resource is not None:
            for action in native.getChildrenByName(resource, "action"):
                admitted_actions = {"startSectionGroup", "endCharacterGroup", "endParagraphGroup", "setLastSectionGroup", "endSectionGroup", "handleLastParagraphInSection", "startParagraphGroup", "setHandle", "sendTableDepth", "endOfParagraph", "startCharacterGroup", "sendPropertiesWithId", "text", "setDefaultBooleanValue", "setDefaultIntegerValue", "setDefaultStringValue", "clearProps"}
                if action.getAttribute("action") not in admitted_actions or native.getChildrenByName(action, "cond"):
                    raise ValueError("Unconsumed native event action or condition: " + action.toxml())
                actions.append([identifier, action.getAttribute("name"), action.getAttribute("action"),
                                token_ids[native.idToLabel(action.getAttribute("tokenid"))] if action.hasAttribute("tokenid") else 0,
                                token_ids[native.idToLabel(action.getAttribute("sendtokenid"))] if action.hasAttribute("sendtokenid") else 0])
            for attribute in native.getChildrenByName(resource, "attribute"):
                if attribute.hasAttribute("action"):
                    if attribute.getAttribute("action") != "setValue":
                        raise ValueError("Unconsumed native attribute action: " + attribute.getAttribute("action"))
                    actions.append([identifier, "attribute", attribute.getAttribute("action"), qname(native.fastToken(attribute)), 0])
    for start in native.getChildrenByName(wml, "start"):
        definition = definitions[start.getAttribute("name")]
        for token, cpp in native.factoryCreateElementMapInner(namespaces, wml, definition).items():
            match = re.search(r"rOutResource = ResourceType::(\w+); rOutElement = ([^;]+);", cpp)
            elements.append([0, qname(token), match[1], identity(match[2])])
        for token, value in native.collectTokenToId(wml, definition).items():
            resource_ids.append([0, qname(token), token_ids[value]])
    for expression in sorted(list_definitions):
        name = expression.split("DEFINE_")[1]
        resource = resources[name]
        identifier = identity(expression)
        used_defines[identifier] = name
        seen = set()
        for value in native.getChildrenByName(resource, "value"):
            text = value.childNodes[0].data if value.childNodes else ""
            # The original generated if/else comparisons take the first match.
            if text in seen:
                continue
            seen.add(text)
            lists.append([identifier, text, token_ids[native.idToLabel(value.getAttribute("tokenid"))]])
    return {"namespaces": {"NN_wml": ids["NN_wml"]}, "defines": used_defines, "attributes": attributes, "elements": elements,
            "resources": resource_ids, "lists": lists, "actions": actions,
            "streamNamespaces": [[uri, stream_namespaces[uri]] for uri in sorted(stream_namespaces)]}


def main():
    """Write or verify generated tables without changing the pinned corpus."""
    parser = argparse.ArgumentParser()
    parser.add_argument("--check", action="store_true")
    args = parser.parse_args()
    for filename in ("tokens.txt", "namespaces.txt", "namespaces-strict.txt"):
        source = NATIVE / "oox/source/token" / filename
        target = ROOT / "apps/office/src/oox/source/token" / filename
        if args.check:
            if not target.exists() or target.read_bytes() != source.read_bytes():
                raise SystemExit("OOXML native token input is stale: " + filename)
        else:
            target.parent.mkdir(parents=True, exist_ok=True)
            target.write_bytes(source.read_bytes())
    data = generate()
    write_tables(OUTPUT / "OOXMLFactory.tables.ts", {"streamNamespaces": data.pop("streamNamespaces")}, args.check)
    # Native getListValue has a distinct lexical dispatch table from the
    # attribute/element/resource context lookups. Keep that generated data
    # responsibility separate while retaining one native factory owner/API.
    write_tables(OUTPUT / "OOXMLFactory_wml.lists.ts", {"lists": data["lists"]}, args.check)
    context_data = {key: rows for key, rows in data.items() if key != "lists"}
    write_tables(OUTPUT / "OOXMLFactory_wml.tables.ts", context_data, args.check, True)
    print("Writer OOXML factory:", ", ".join(f"{key}={len(rows)}" for key, rows in data.items()))


def write_tables(path, data, check, reexport_lists=False):
    """Write source-generated namespace/stream tables with their original owners."""
    text = "/** @fileoverview Consumed native factory tables generated through unchanged pinned namespaces/modelpreprocess/factoryinc/resourceids/factoryimpl_ns owners; do not edit by hand. */\n"
    # Native generated table rows are deliberately one record per line, keeping
    # field order visible and avoiding formatter expansion of constant tables.
    for key, rows in data.items():
        text += "\n/** Native " + key + " table. */\n// prettier-ignore\nexport const " + key + " = "
        if isinstance(rows, dict):
            text += "{\n" + "".join("  " + json.dumps(str(k)) + ": " + json.dumps(v) + ",\n" for k, v in rows.items()) + "} as const;\n"
        else:
            text += "[\n" + "".join("  " + json.dumps(row, ensure_ascii=False) + ",\n" for row in rows) + "] as const;\n"
    if reexport_lists:
        text += '\nexport { lists } from "./OOXMLFactory_wml.lists";\n'
    if check:
        if not path.exists() or path.read_text() != text:
            raise SystemExit("Writer OOXML native factory tables are stale.")
    else:
        path.write_text(text)


if __name__ == "__main__":
    main()
