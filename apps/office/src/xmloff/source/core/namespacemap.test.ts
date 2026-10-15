/** @fileoverview Native namespace identities, aliasing, QName output/cache rules and URI normalization, without native container layout assumptions. */
import { expect, it } from "vitest";
import {
  SvXMLNamespaceMap as NS,
  NameSpaceEntry,
  QNameMode,
  XML_NAMESPACE_NONE as NONE,
  XML_NAMESPACE_UNKNOWN as UNKNOWN,
  XML_NAMESPACE_XMLNS as XMLNS,
  XML_NAMESPACE_UNKNOWN_FLAG as FLAG,
  type NamespaceStringCell as Cell,
} from "../../inc/namespacemap";
import { XML_NAMESPACE_XML } from "../../inc/xmlnamespace";
import * as namespaceIds from "../../inc/xmlnamespace";
import { ODF_NAMESPACES } from "./xmltoken";
/** Reads all three original output pointers with independent initial witnesses. @param map - Actual map. @param name - QName. @param mode - Original mode. @returns Result and all outputs. */
function parse(
  map: NS,
  name: string,
  mode = QNameMode.AttrNameCached,
): [number, string, string, string] {
  const prefix: Cell = ["prefix-old"],
    local: Cell = ["local-old"],
    uri: Cell = ["uri-old"];
  return [map.GetKeyByQName(name, prefix, local, uri, mode), prefix[0], local[0], uri[0]];
}
it("retains initialized entry equality, independent value copies and a stable borrowed table", /** Native unordered iteration is assessed by membership, never a C++ bucket order. @returns Nothing. */ () => {
  expect([NONE, UNKNOWN, XMLNS, FLAG, XML_NAMESPACE_XML]).toEqual([65534, 65535, 65533, 32768, 22]);
  expect(Object.keys(namespaceIds)).toHaveLength(92);
  expect(NS.QNameMode).toBe(QNameMode);
  const entry = new NameSpaceEntry("uri", "p", 7);
  expect(entry.equals(new NameSpaceEntry("uri", "p", 7))).toBe(true);
  expect(entry.equals(new NameSpaceEntry("other", "p", 7))).toBe(false);
  expect(entry.equals(new NameSpaceEntry("uri", "other", 7))).toBe(false);
  expect(entry.equals(new NameSpaceEntry("uri", "p", 8))).toBe(false);
  const empty = new NS();
  expect(empty.GetFirstKey()).toBe(UNKNOWN);
  expect(empty.GetFirstIndex()).toBe(UNKNOWN);
  expect(empty.equals(new NS())).toBe(true);
  const map = new NS();
  expect(map.Add("a", "urn:a", 7)).toBe(7);
  expect(map.Add("b", "urn:b", 9)).toBe(9);
  const copy = new NS(map),
    view = copy.GetAllEntries();
  expect(copy.equals(map)).toBe(true);
  expect(copy.GetAllEntries().get("a")).not.toBe(map.GetAllEntries().get("a"));
  expect(copy.assign(copy)).toBe(copy);
  expect(copy.equals(map)).toBe(true);
  expect(copy.GetAllEntries()).toBe(view);
  const other = new NS();
  other.Add("c", "urn:a", 7);
  expect(other.equals(map)).toBe(false);
  other.Add("b", "urn:b", 9);
  expect(other.equals(map)).toBe(false);
  const changed = new NS();
  changed.Add("a", "urn:changed", 7);
  changed.Add("b", "urn:b", 9);
  expect(changed.equals(map)).toBe(false);
  copy.Clear();
  expect(copy.equals(map)).toBe(false);
  copy.assign(map);
  expect(copy.GetAllEntries()).toBe(view);
  expect(copy.equals(map)).toBe(true);
  const keys = new Set<number>();
  for (let key = map.GetFirstKey(); key !== UNKNOWN; key = map.GetNextKey(key)) keys.add(key);
  expect(keys).toEqual(new Set([7, 9]));
  const indices = new Set<number>();
  for (let key = map.GetFirstIndex(); key !== UNKNOWN; key = map.GetNextIndex(key))
    indices.add(key);
  expect(indices).toEqual(keys);
  expect(NS.GetIndexByKey(65543)).toBe(7);
  expect(
    /** Original invalid-next precondition is outside valid traversal. @returns Nothing. */ () =>
      map.GetNextKey(99),
  ).toThrow("existing key");
});
it("keeps source Add resolution, aliasing, existing-prefix results and deprecated operations", /** Automatic allocation uses ordinary Map keys and source unsigned16 arithmetic. @returns Nothing. */ () => {
  const map = new NS();
  map.AddAtIndex("reserved", "urn:reserved", FLAG);
  expect(map.Add("fresh", "urn:fresh")).toBe(FLAG + 1);
  expect(map.Add("alias", "urn:fresh")).toBe(FLAG + 1);
  expect(map.GetPrefixByKey(FLAG + 1)).toBe("alias");
  expect(map.GetKeyByName("absent")).toBe(UNKNOWN);
  expect(map.Add("fresh", "urn:unknown")).toBe(UNKNOWN);
  expect(map.GetNameByKey(FLAG + 1)).toBe("urn:fresh");
  expect(map.Add("fresh", "urn:reserved")).toBe(FLAG);
  expect(map.GetKeyByPrefix("fresh")).toBe(FLAG + 1);
  expect(map.Add("none", "urn:none", NONE)).toBe(UNKNOWN);
  expect(map.GetKeyByPrefix("none")).toBe(UNKNOWN);
  expect(map.AddIfKnown("unknown", "urn:absent")).toBe(UNKNOWN);
  expect(map.AddIfKnown("known", "urn:fresh")).toBe(FLAG + 1);
  expect(map.AddIfKnown("known", "urn:fresh")).toBe(FLAG + 1);
  expect(map.AddIfKnown("known", "urn:reserved")).toBe(FLAG);
  expect(map.GetIndexByPrefix("known")).toBe(FLAG);
  expect(map.GetIndexByPrefix("absent")).toBe(UNKNOWN);
  map.AddAtIndex("old", "urn:fresh", UNKNOWN);
  expect(map.GetIndexByPrefix("old")).toBe(FLAG + 1);
  map.AddAtIndex("old", "urn:else", 80);
  expect(map.GetIndexByPrefix("old")).toBe(FLAG + 1);
  map.AddAtIndex("no", "urn:no", NONE);
  expect(map.GetKeyByPrefix("no")).toBe(UNKNOWN);
  map.AddAtIndex("auto", "urn:auto", UNKNOWN);
  expect(map.GetKeyByPrefix("auto")).toBe(FLAG + 2);
  expect(map.GetNameByKey(123)).toBe("");
  expect(map.GetPrefixByKey(123)).toBe("");
  expect(map.GetNameByIndex(123)).toBe("");
  expect(map.GetPrefixByIndex(123)).toBe("");
  expect(map.GetNameByIndex(FLAG)).toBe("urn:reserved");
  expect(map.GetPrefixByIndex(FLAG)).toBe("known");
  expect(map.GetAttrNameByKey(FLAG)).toBe("xmlns:known");
  expect(map.GetAttrNameByIndex(FLAG)).toBe("xmlns:known");
  expect(map.GetAttrNameByKey(123)).toBe("");
  map.Add("", "urn:default", 10);
  expect(map.GetAttrNameByKey(10)).toBe("xmlns");
});
it("preserves source key allocation into a reserved NONE marker without native memory probes", /** Bounded32k explicit metadata keys make only one linear automatic-key scan, avoiding exhaustion and native hash layout assumptions. @returns Nothing. */ () => {
  const map = new NS();
  for (let key = FLAG; key < NONE; ++key) map.AddAtIndex("p" + key, "urn:" + key, key);
  expect(map.Add("overflow", "urn:overflow")).toBe(NONE);
  expect(map.GetKeyByName("urn:overflow")).toBe(NONE);
  expect(map.AddIfKnown("alias", "urn:overflow")).toBe(UNKNOWN);
  expect(map.Add("alias", "urn:overflow")).toBe(UNKNOWN);
  map.AddAtIndex("alias", "urn:overflow", UNKNOWN);
  expect(map.GetKeyByPrefix("alias")).toBe(UNKNOWN);
});
it("retains QName spellings, pair-cache values and original stale assignment caches", /** Copy construction starts with empty caches whereas assignment intentionally retains destination caches. @returns Nothing. */ () => {
  const map = new NS();
  map.Add("a", "urn:a", 7);
  map.Add("", "urn:default", 8);
  for (const key of [UNKNOWN, NONE, 99]) expect(map.GetQNameByKey(key, "name")).toBe("name");
  expect(map.GetQNameByKey(XMLNS, "name")).toBe("xmlns:name");
  expect(map.GetQNameByKey(XMLNS, "")).toBe("xmlns");
  expect(map.GetQNameByKey(XML_NAMESPACE_XML, "lang")).toBe("xml:lang");
  expect(map.GetQNameByKey(7, "name")).toBe("a:name");
  expect(map.GetQNameByKey(7, "name")).toBe("a:name");
  expect(map.GetQNameByKey(7, "next")).toBe("a:next");
  expect(map.GetQNameByKey(8, "")).toBe("");
  expect(map.GetQNameByKey(8, "")).toBe("");
  map.Add("alias", "urn:a", 7);
  expect(map.GetQNameByKey(7, "name")).toBe("a:name");
  expect(map.GetQNameByKey(7, "name", false)).toBe("alias:name");
  expect(map.GetQNameByKey(8, "name", false)).toBe("name");
  expect(parse(map, "a:cached")).toEqual([7, "a", "cached", "urn:a"]);
  const replacement = new NS();
  replacement.Add("b", "urn:b", 7);
  const view = map.GetAllEntries();
  map.assign(replacement);
  expect(map.GetAllEntries()).toBe(view);
  expect(map.GetQNameByKey(7, "name")).toBe("a:name");
  expect(map.GetQNameByKey(7, "name", false)).toBe("b:name");
  expect(parse(map, "a:cached")).toEqual([7, "a", "cached", "urn:b"]);
  const copy = new NS(map);
  expect(copy.GetQNameByKey(7, "name")).toBe("b:name");
  expect(parse(copy, "a:cached")).toEqual([UNKNOWN, "a", "cached", "uri-old"]);
  copy.Clear();
  expect(copy.GetQNameByKey(7, "name")).toBe("name");
});
it("preserves all QName parser modes, exact optional outputs and cold/hot namespace differences", /** Native missing-prefix paths leave the URI output untouched until a name-cache hit. @returns Nothing. */ () => {
  const map = new NS();
  map.Add("p", "urn:p", 7);
  expect(parse(map, "p:local")).toEqual([7, "p", "local", "urn:p"]);
  expect(parse(map, "p:local")).toEqual([7, "p", "local", "urn:p"]);
  expect(
    map.GetKeyByQName("p:local", undefined, undefined, undefined, QNameMode.AttrNameCached),
  ).toBe(7);
  expect(
    map.GetKeyByQName("p:uncached", undefined, undefined, undefined, QNameMode.AttrValue),
  ).toBe(7);
  for (const [name, key, prefix, local] of [
    ["u:local", UNKNOWN, "u", "local"],
    ["local", NONE, "", "local"],
    ["xmlns:p", XMLNS, "xmlns", "p"],
  ] as const) {
    expect(parse(map, name)).toEqual([key, prefix, local, "uri-old"]);
    expect(parse(map, name)).toEqual([key, prefix, local, ""]);
  }
  expect(parse(map, "p:a:b")).toEqual([UNKNOWN, "prefix-old", "local-old", "uri-old"]);
  expect(parse(map, "p:a:b", QNameMode.AttrValue)).toEqual([7, "p", "a:b", "urn:p"]);
  const local: Cell = ["old"],
    prefix: Cell = ["old"],
    uri: Cell = ["old"];
  expect(map.GetKeyByAttrValueQName("p:a:b", local)).toBe(7);
  expect(local[0]).toBe("a:b");
  expect(map.GetKeyByAttrValueQName("p:value", undefined)).toBe(7);
  expect(map.GetKeyByAttrName("p:single", local)).toBe(7);
  expect(local[0]).toBe("single");
  expect(map.GetKeyByAttrName("p:single")).toBe(7);
  expect(map.GetKeyByAttrName("p:triple", prefix, local, uri)).toBe(7);
  expect([prefix[0], local[0], uri[0]]).toEqual(["p", "triple", "urn:p"]);
  map.Add("", "urn:default", 8);
  expect(parse(map, "default")).toEqual([8, "", "default", "urn:default"]);
  expect(parse(map, "xml:lang")[0]).toBe(UNKNOWN);
  map.Add("xml", ODF_NAMESPACES.xml, XML_NAMESPACE_XML);
  expect(parse(map, "xml:lang")[0]).toBe(UNKNOWN);
  const fresh = new NS(map);
  expect(parse(fresh, "xml:lang")).toEqual([22, "xml", "lang", ODF_NAMESPACES.xml]);
  map.AddIfKnown("p", ODF_NAMESPACES.xml);
  expect(parse(map, "p:local")).toEqual([7, "p", "local", "urn:p"]);
  map.Clear();
  expect(parse(map, "p:local")[0]).toBe(UNKNOWN);
});
it("retains source permissive normalization and every unchanged failure boundary", /** Built-in string operations match the original UTF16 slicing/index predicates, without URL or ICU normalization. @returns Nothing. */ () => {
  for (const [input, expected] of [
    ["http://www.w3.org/2000/svg", ODF_NAMESPACES.svg],
    ["http://www.w3.org/1999/XSL/Format", ODF_NAMESPACES.fo],
    ["http://www.w3.org/2001/SMIL20/", "urn:oasis:names:tc:opendocument:xmlns:smil-compatible:1.0"],
    ["http://www.w3.org/2001/SMIL20", "urn:oasis:names:tc:opendocument:xmlns:smil-compatible:1.0"],
    ["urn:oasis:names:tc:old:xmlns:text:1.7", "urn:oasis:names:tc:opendocument:xmlns:text:1.0"],
    ["urn:oasis:names:tc::xmlns::1.x", "urn:oasis:names:tc:opendocument:xmlns::1.0"],
    [ODF_NAMESPACES.text, ODF_NAMESPACES.text],
    ["http://www.w3.org/not-a-year/xforms", "http://www.w3.org/2002/xforms"],
  ] as const) {
    const value: Cell = [input];
    expect(NS.NormalizeURI(value)).toBe(true);
    expect(value[0]).toBe(expected);
  }
  const bad = [
    "other",
    "urn:oasis:names:tc",
    "urn:oasis:names:tcX",
    "urn:oasis:names:tc:old",
    "urn:oasis:names:tc:old:other:t:1.2",
    "urn:oasis:names:tc:old:xmlns",
    "urn:oasis:names:tc:old:xmlnsX:t:1.2",
    "urn:oasis:names:tc:old:xmlns:t",
    "urn:oasis:names:tc:old:xmlns:t:1.",
    "urn:oasis:names:tc:old:xmlns:t:1.0:extra",
    "urn:oasis:names:tc:old:xmlns:t:2.0",
    "urn:oasis:names:tc:old:xmlns:t:1x0",
    "http://www.w3.org/2002/other",
  ];
  for (const input of bad) {
    const value: Cell = [input];
    expect(NS.NormalizeURI(value)).toBe(false);
    expect(value[0]).toBe(input);
  }
  const direct: Cell = ["http://www.w3.org/2002/xforms"];
  expect(NS.NormalizeW3URI(direct)).toBe(true);
});
