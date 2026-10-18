/** @fileoverview Original XML attribute values, overload contracts and retained namespace history. */
import { expect, it } from "vitest";
import { SvXMLAttr } from "./SvXMLAttr";
import { SvXMLAttrCollection as Collection } from "./SvXMLAttrCollection";
import { SvXMLAttrContainerData as Data } from "../../inc/xmlcnimp";
import { XML_NAMESPACE_UNKNOWN as UNKNOWN } from "./namespacemap";

it("preserves individual attribute value fields, copy and unsigned16 identity", /** Source value comparison includes all three fields. @returns Nothing. */ () => {
  const plain = new SvXMLAttr("name", "value");
  expect([plain.getPrefixPos(), plain.getLName(), plain.getValue()]).toEqual([
    UNKNOWN,
    "name",
    "value",
  ]);
  expect(new SvXMLAttr(plain).equals(plain)).toBe(true);
  expect(plain.equals(new SvXMLAttr(1, "name", "value"))).toBe(false);
  expect(plain.equals(new SvXMLAttr("other", "value"))).toBe(false);
  expect(plain.equals(new SvXMLAttr("name", "other"))).toBe(false);
  expect(new SvXMLAttr(65537, "n", "v").getPrefixPos()).toBe(1);
  const target = new SvXMLAttr("old", "old");
  expect(target.assign(plain)).toBe(target);
  expect(target.assign(target).equals(plain)).toBe(true);
});
it("preserves independent collection copies, assignment and ordered equality", /** Native implicit members use value copies. @returns Nothing. */ () => {
  const a = new Collection();
  expect(new Collection(a).equals(a)).toBe(true);
  a.AddAttr("n", "v");
  const b = new Collection(a);
  expect(b.equals(a)).toBe(true);
  b.AddAttr("second", "2");
  expect(b.equals(a)).toBe(false);
  b.SetAt(0, "n", "other");
  a.AddAttr("second", "2");
  expect(b.equals(a)).toBe(false);
  expect(b.assign(a)).toBe(b);
  expect(b.equals(a)).toBe(true);
  expect(b.assign(b).equals(a)).toBe(true);
  b.Remove(0);
  expect([a.GetAttrCount(), b.GetAttrLName(0)]).toEqual([2, "second"]);
  b.assign(new Collection());
  expect(b.GetAttrCount()).toBe(0);
});
it("retains plain values, known-prefix rejection and complete namespace traversal membership", /** Namespace ordering is unspecified in native unordered maps. @returns Nothing. */ () => {
  const d = new Data();
  expect([d.GetAttrCount(), d.GetFirstNamespaceIndex()]).toEqual([0, UNKNOWN]);
  expect(d.AddAttr("plain", "")).toBe(true);
  expect(d.AddAttr("missing", "local", "v")).toBe(false);
  expect(d.AddAttr("p", "urn:p", "one", "1")).toBe(true);
  expect(d.AddAttr("p", "two", "2")).toBe(true);
  expect(d.AddAttr("q", "urn:q", "three", "3")).toBe(true);
  expect([d.GetAttrLName(0), d.GetAttrValue(0), d.GetAttrPrefix(0), d.GetAttrNamespace(0)]).toEqual(
    ["plain", "", "", ""],
  );
  expect([d.GetAttrLName(2), d.GetAttrValue(2), d.GetAttrPrefix(2), d.GetAttrNamespace(2)]).toEqual(
    ["two", "2", "p", "urn:p"],
  );
  const names: string[][] = [];
  for (let key = d.GetFirstNamespaceIndex(); key !== UNKNOWN; key = d.GetNextNamespaceIndex(key))
    names.push([d.GetPrefix(key), d.GetNamespace(key)]);
  expect(names).toEqual(
    expect.arrayContaining([
      ["p", "urn:p"],
      ["q", "urn:q"],
    ]),
  );
  expect(names).toHaveLength(2);
  expect([d.GetNamespace(UNKNOWN), d.GetPrefix(UNKNOWN)]).toEqual(["", ""]);
});
it("preserves Add4 versus Set4 conflict behavior without correcting upstream", /** Native Add4 stores UNKNOWN while Set4 rejects UNKNOWN. @returns Nothing. */ () => {
  const d = new Data();
  d.AddAttr("p", "urn:first", "first", "1");
  expect(d.AddAttr("p", "urn:new", "conflict", "2")).toBe(true);
  expect([d.GetAttrPrefix(1), d.GetAttrNamespace(1), d.GetAttrValue(1)]).toEqual(["", "", "2"]);
  expect(d.SetAt(0, "p", "urn:new", "replacement", "x")).toBe(false);
  expect([d.GetAttrLName(0), d.GetAttrNamespace(0)]).toEqual(["first", "urn:first"]);
  expect(d.SetAt(9, "late", "urn:late", "outside", "x")).toBe(false);
  expect(d.AddAttr("late", "outside", "x")).toBe(false);
  expect(d.SetAt(9, "p", "outside", "x")).toBe(false);
  expect(d.SetAt(9, "outside", "x")).toBe(false);
  expect(d.SetAt(0, "missing", "replacement", "x")).toBe(false);
  expect(d.SetAt(0, "q", "urn:q", "new", "3")).toBe(true);
  expect([d.GetAttrPrefix(0), d.GetAttrNamespace(0)]).toEqual(["q", "urn:q"]);
  expect(d.SetAt(1, "p", "again", "4")).toBe(true);
  expect([d.GetAttrPrefix(1), d.GetAttrValue(1)]).toEqual(["p", "4"]);
  expect(d.SetAt(0, "plain", "5")).toBe(true);
  expect([d.GetAttrPrefix(0), d.GetAttrNamespace(0)]).toEqual(["", ""]);
});
it("retains namespace aliases, canonical prefix changes and history after removal", /** Removal never prunes the source map. @returns Nothing. */ () => {
  const d = new Data();
  d.AddAttr("p", "urn:same", "first", "1");
  const before = new Data(d);
  d.AddAttr("alias", "urn:same", "second", "2");
  expect([d.GetAttrPrefix(0), d.GetAttrPrefix(1)]).toEqual(["alias", "alias"]);
  expect(before.GetAttrPrefix(0)).toBe("p");
  expect(before.equals(d)).toBe(false);
  d.Remove(99);
  expect(d.GetAttrCount()).toBe(2);
  d.Remove(1);
  d.Remove(0);
  expect(d.GetAttrCount()).toBe(0);
  expect(d.equals(new Data())).toBe(false);
  const copied = new Data(d),
    assigned = new Data();
  expect(copied.equals(d)).toBe(true);
  expect(assigned.assign(before)).toBe(assigned);
  expect(assigned.equals(before)).toBe(true);
  expect(assigned.assign(assigned).equals(before)).toBe(true);
  assigned.SetAt(0, "changed", "value");
  expect(before.GetAttrLName(0)).toBe("first");
});
it("keeps collection assertions narrower than container name assertions", /** Native collection accepts colons; data checks local and prefix colons only. @returns Nothing. */ () => {
  const c = new Collection();
  c.AddAttr("colon:name", "v");
  expect(c.SetAt(0, "p:raw", "urn:raw", "local:raw", "v")).toBe(true);
  for (const method of ["AddAttr", "SetAt"] as const) {
    const invoke =
      /** Applies the selected native overload. @param args - Attribute fields. @returns Result. */ (
        ...args: [string, string] | [string, string, string] | [string, string, string, string]
      ) => (method === "AddAttr" ? c.AddAttr(...args) : c.SetAt(0, ...args));
    expect(
      /** Invokes a native debug precondition witness. @returns Selected result. */ () =>
        invoke("", "v"),
    ).toThrow("Empty attribute name");
    expect(
      /** Invokes a native debug precondition witness. @returns Selected result. */ () =>
        invoke("", "n", "v"),
    ).toThrow("Empty attribute prefix");
    expect(
      /** Invokes a native debug precondition witness. @returns Selected result. */ () =>
        invoke("p", "", "n", "v"),
    ).toThrow("Empty attribute namespace");
  }
  const d = new Data();
  d.AddAttr("n", "v");
  for (const method of ["AddAttr", "SetAt"] as const) {
    const invoke =
      /** Applies data-level assertions before forwarding. @param args - Attribute fields. @returns Result. */ (
        ...args: [string, string] | [string, string, string] | [string, string, string, string]
      ) => (method === "AddAttr" ? d.AddAttr(...args) : d.SetAt(0, ...args));
    expect(
      /** Invokes a native debug precondition witness. @returns Selected result. */ () =>
        invoke("", "v"),
    ).toThrow("Invalid local");
    expect(
      /** Invokes a native debug precondition witness. @returns Selected result. */ () =>
        invoke("colon:name", "v"),
    ).toThrow("Invalid local");
    expect(
      /** Invokes a native debug precondition witness. @returns Selected result. */ () =>
        invoke("colon:prefix", "name", "v"),
    ).toThrow("Colon in attribute prefix");
    expect(
      /** Invokes a native debug precondition witness. @returns Selected result. */ () =>
        invoke("colon:prefix", "urn:p", "name", "v"),
    ).toThrow("Colon in attribute prefix");
    expect(
      /** Invokes a native debug precondition witness. @returns Selected result. */ () =>
        invoke("", "name", "v"),
    ).toThrow("Empty attribute prefix");
    expect(
      /** Invokes a native debug precondition witness. @returns Selected result. */ () =>
        invoke("p", "", "name", "v"),
    ).toThrow("Empty attribute namespace");
  }
});
