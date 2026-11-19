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
    "CT_Document CT_Body CT_P CT_R CT_Text CT_PPr CT_RPr CT_ParaRPr CT_Style CT_Style_pPr CT_Style_tblStylePr CT_PPrBase CT_Styles CT_Settings "
    "CT_HdrFtr CT_HdrFtrRef "
    "CT_DocDefaults CT_PPrDefault CT_RPrDefault CT_Fonts CT_Underline CT_Color "
    "CT_FontsList CT_Font CT_Charset CT_FontFamily CT_FontSig CT_Panose CT_Pitch "
    "CT_SectPr CT_finalSectPr CT_PageSz CT_PageMar CT_PageBorders CT_PageNumber CT_TextDirection CT_SectType CT_Columns CT_Column CT_DocGrid "
    "CT_Br CT_Br_OutOfOrder CT_Tab CT_Tabs CT_TabStop ST_TabJc ST_TabTlc CT_Cr CT_Empty "
    "CT_Bookmark CT_BookmarkRange CT_MarkupRangeBookmark CT_MarkupRange "
    "CT_Hyperlink CT_FldChar CT_instrText CT_SimpleField "
    "CT_FtnDocProps CT_EdnDocProps CT_FtnEdnSepRef CT_FtnProps CT_EdnProps "
    "CT_Numbering CT_AbstractNum CT_Num CT_NumLvl CT_Lvl CT_NumFmt CT_LevelText CT_LevelSuffix CT_LvlLegacy CT_MultiLevelType CT_NumPr "
    "CT_Tbl CT_Row CT_Tc CT_TblGrid CT_TblGridCol CT_TblPr CT_TrPr CT_TcPr CT_TblLook CT_TblOverlap CT_TblLayoutType CT_VMerge CT_HMerge CT_VerticalJc "
    "CT_Ind CT_Spacing CT_Jc CT_OnOff CT_HpsMeasure CT_SignedHpsMeasure CT_SignedTwipsMeasure CT_DecimalNumber CT_String "
    "CT_VerticalAlignRun CT_Highlight CT_TextScale EG_RPrBase CT_TblWidth CT_Height "
    "CT_View CT_Zoom CT_Proof CT_WritingStyle CT_Rel CT_ShortHexNumber CT_TwipsMeasure CT_CharacterSpacing CT_StylePaneFilter CT_Compat CT_CompatSetting "
    "CT_TrackChangesView CT_Kinsoku CT_ColorSchemeMapping "
    "CT_DocRsids CT_LongHexNumber CT_Language CT_ShapeDefaults "
    "CT_TblCellMar CT_TcMar CT_LatentStyles CT_LsdException CT_TblPrBase CT_TblPrEx CT_TblPrExBase CT_TrPrBase CT_TcPrBase CT_Border CT_TblBorders CT_TcBorders CT_TrackChange CT_Markup CT_Shd CT_TblPPr CT_PBdr CT_FramePr CT_Cnf"
).split()


def original(script, *arguments):
    """Capture the exact output of a local pinned generator."""
    return subprocess.check_output([sys.executable, str(script), *map(str, arguments)], text=True)


TEXT_EFFECTS = ("ligatures", "numForm", "numSpacing")
DRAWING_TEXT_EFFECTS = ("glow", "shadow", "reflection", "textFill", "textOutline", "scene3d", "props3d")
TYPOGRAPHY_STARTS = (*TEXT_EFFECTS, "stylisticSets", "cntxtAlts", *DRAWING_TEXT_EFFECTS)


def generate(namespace="wml", consumed=CONSUMED, included_starts=None):
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
        namespace_ids = {}
        for line in (temp / "namespaces.txt").read_text().splitlines():
            identifier, alias, uri = line.split(" ")
            stream_namespaces[uri] = int(identifier)
            namespace_ids[alias] = int(identifier)
    model_node = native.getChildByName(model, "model")
    namespaces = {n.getAttribute("name"): n for n in native.getChildrenByName(model_node, "namespace")}
    wml = namespaces[namespace]
    grammar = native.getChildByName(wml, "grammar")
    definitions = {d.getAttribute("name"): d for d in native.getChildrenByName(grammar, "define")}
    resources = {r.getAttribute("name"): r for r in native.getChildrenByName(wml, "resource")}
    if namespace == "w14":
        consumed = list(dict.fromkeys([*consumed, *DRAWING_TEXT_EFFECTS]))
        for name in consumed:
            for ref in definitions[name].getElementsByTagName("ref"):
                target = ref.getAttribute("name")
                if target in definitions and target not in consumed:
                    consumed.append(target)
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
        if match[2] == "XML_TOKEN_COUNT":
            return (namespace_ids[match[1]] if match[1] else 0) | len(token_names)
        return (match[1] or "") + ":" + local_names[match[2]]

    attributes, elements, resource_ids, actions, lists = [], [], [], [], []
    used_defines = {0: "start"}
    list_definitions = set()
    for name in consumed:
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
                admitted_actions = {"startSectionGroup", "endCharacterGroup", "endParagraphGroup", "setLastSectionGroup", "endSectionGroup", "handleLastParagraphInSection", "startParagraphGroup", "setHandle", "sendTableDepth", "endOfParagraph", "startCharacterGroup", "sendPropertiesWithId", "text", "setDefaultBooleanValue", "setDefaultIntegerValue", "setDefaultHexValue", "setDefaultStringValue", "clearProps", "setLastParagraphInSection", "handleBreak", "handleOutOfOrderBreak", "tab", "cr", "noBreakHyphen", "softHyphen"}
                admitted_actions.update({"startCell", "endCell", "sendCellProperties", "startRow", "endRow", "sendRowProperties", "sendTableProperties", "propagateCellProperties", "propagateRowProperties", "propagateTableProperties"})
                admitted_actions.update({"fieldstart", "fieldsep", "fieldend", "fieldlock", "handleHyperlink", "handleHdrFtr"})
                admitted_actions.update({"printproperty", "fieldlock_simple"})
                conditions = native.getChildrenByName(action, "cond")
                if action.getAttribute("action") not in admitted_actions or (conditions and (name != "CT_FldChar" or len(conditions) != 1)):
                    raise ValueError("Unconsumed native event action or condition: " + action.toxml())
                row = [identifier, action.getAttribute("name"), action.getAttribute("action"),
                                token_ids[native.idToLabel(action.getAttribute("tokenid"))] if action.hasAttribute("tokenid") else 0,
                                token_ids[native.idToLabel(action.getAttribute("sendtokenid"))] if action.hasAttribute("sendtokenid") else 0]
                for condition in conditions:
                    row.extend(token_ids[native.idToLabel(condition.getAttribute(key))] for key in ("tokenid", "value"))
                actions.append(row)
            for attribute in native.getChildrenByName(resource, "attribute"):
                if attribute.hasAttribute("action"):
                    if attribute.getAttribute("action") != "setValue":
                        raise ValueError("Unconsumed native attribute action: " + attribute.getAttribute("action"))
                    actions.append([identifier, "attribute", attribute.getAttribute("action"), qname(native.fastToken(attribute)), 0])
    for start in native.getChildrenByName(wml, "start"):
        name = start.getAttribute("name")
        if included_starts is not None and name not in included_starts:
            continue
        definition = definitions[name]
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
    result = {"namespaces": {"NN_" + namespace: ids["NN_" + namespace]}, "defines": used_defines, "attributes": attributes, "elements": elements,
            "resources": resource_ids, "lists": lists, "actions": actions,
            "streamNamespaces": [[uri, stream_namespaces[uri]] for uri in sorted(stream_namespaces)]}
    if namespace == "w14":
        result["effectIds"] = {
            name: [token_ids[f"NS_ooxml::LN_{name}_{name}"],
                   token_ids[f"NS_ooxml::LN_CT_{name[0].upper() + name[1:]}_val"],
                   ids[f"NN_w14"] | ids[f"DEFINE_ST_{name[0].upper() + name[1:]}"]]
            for name in TEXT_EFFECTS
        }
        result["effectIds"].update({
            "stylisticSets": [token_ids["NS_ooxml::LN_stylisticSets_stylisticSets"]],
            "cntxtAlts": [token_ids["NS_ooxml::LN_cntxtAlts_cntxtAlts"],
                          token_ids["NS_ooxml::LN_CT_OnOff_val"],
                          ids["NN_w14"] | ids["DEFINE_ST_OnOff"]],
        })
        result["styleSetIds"] = [token_ids[f"NS_ooxml::LN_{name}"] for name in (
            "CT_StylisticSets_styleSet", "CT_StyleSet_id", "CT_StyleSet_val",
        )]
    return result


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
    w14 = generate("w14", [definition for name in TEXT_EFFECTS
                            for definition in (name, "CT_" + name[0].upper() + name[1:])] +
                   ["stylisticSets", "CT_StylisticSets", "CT_StyleSet", "cntxtAlts", "CT_OnOff"],
                   TYPOGRAPHY_STARTS)
    w14.pop("streamNamespaces")
    write_tables(OUTPUT / "OOXMLFactory_w14.tables.ts", w14, args.check)
    data = generate()
    write_tables(OUTPUT / "OOXMLFactory.tables.ts", {"streamNamespaces": data.pop("streamNamespaces")}, args.check)
    # Native getListValue has a distinct lexical dispatch table from the
    # attribute/element/resource context lookups. Keep that generated data
    # responsibility separate while retaining one native factory owner/API.
    write_tables(OUTPUT / "OOXMLFactory_wml.lists.ts", {"lists": data["lists"]}, args.check)
    write_tables(OUTPUT / "OOXMLFactory_wml.attributes.ts", {"attributes": data["attributes"]}, args.check)
    # Each original lookup combines its ordered shards before the factory uses it.
    sharded_maps = {}
    for name in ("elements", "resources"):
        rows = data[name]
        shards = []
        for index in range(0, len(rows), 800):
            shard = f"{name}{index // 800}"
            filename = name if index == 0 else shard
            write_tables(OUTPUT / f"OOXMLFactory_wml.{filename}.ts", {shard: rows[index:index + 800]}, args.check)
            shards.append((shard, filename))
        sharded_maps[name] = shards
    context_data = {key: rows for key, rows in data.items() if key not in ("attributes", "lists", "elements", "resources")}
    write_tables(OUTPUT / "OOXMLFactory_wml.tables.ts", context_data, args.check, ("attributes", "lists"), sharded_maps)
    for namespace, records in (("wml", data), ("w14", w14)):
        print(f"Writer OOXML {namespace} factory:",
              ", ".join(f"{key}={len(rows)}" for key, rows in records.items()))


def write_tables(path, data, check, reexports=(), sharded_maps=None):
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
    for name in reexports:
        text += '\nexport { ' + name + ' } from "./OOXMLFactory_wml.' + name + '";\n'
    for name, shards in (sharded_maps or {}).items():
        for shard, filename in shards:
            text += '\nimport { ' + shard + ' } from "./OOXMLFactory_wml.' + filename + '";\n'
        entries = ", ".join("..." + shard for shard, _ in shards)
        text += f"\n/** Native {name} table in original generation order. */\nexport const {name} = [{entries}] as const;\n"
    if check:
        if not path.exists() or path.read_text() != text:
            raise SystemExit("Writer OOXML native factory tables are stale.")
    else:
        path.write_text(text)


if __name__ == "__main__":
    main()
