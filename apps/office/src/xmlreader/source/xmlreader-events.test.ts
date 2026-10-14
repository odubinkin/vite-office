/** @fileoverview Source-backed public reader histories over actual input bytes. */
import { expect, it } from "vitest";
import { XmlReader, Text, Result } from "../inc/xmlreader";
import { Span } from "../inc/span";
import { OUString } from "../../sal/inc/rtl/ustring";
/** Actual string. @param value - Text. @returns Value. */
function u(value: string): OUString {
  const units = Uint16Array.from(
    value,
    /** Converts an ASCII fixture character. @param c - Character. @returns UTF16 unit. */ (c) =>
      c.charCodeAt(0),
  );
  return new OUString(units, units.length);
}
/** Actual byte span. @param value - Text. @returns Value. */
function s(value: string): Span {
  const bytes = new TextEncoder().encode(value);
  return new Span(bytes, bytes.length);
}
/** Decodes actual shared UTF8 conversion. @param value - Span. @returns Text. */
function t(value: Span): string {
  const str = value.convertFromUtf8();
  let out = "";
  for (let i = 0; i < str.getLength(); i++) out += String.fromCharCode(str.getStr()[i] as number);
  return out;
}

it("preserves enums copied input URL and unused outputs after root termination", /** Actual reader protocol. @returns Nothing. */ () => {
  expect([XmlReader.NAMESPACE_NONE, XmlReader.NAMESPACE_UNKNOWN, XmlReader.NAMESPACE_XML]).toEqual([
    -2, -1, 0,
  ]);
  expect([XmlReader.Text.NONE, XmlReader.Text.Raw, XmlReader.Text.Normalized]).toEqual([0, 1, 2]);
  expect([
    XmlReader.Result.Begin,
    XmlReader.Result.End,
    XmlReader.Result.Text,
    XmlReader.Result.Done,
  ]).toEqual([0, 1, 2, 3]);
  const url = u("source"),
    bytes = new TextEncoder().encode("<r/><!--ignored--><other/>");
  const r = new XmlReader(url, bytes);
  url.assign(u("changed"));
  bytes.fill(0);
  expect(r.getUrl()).toBe(r.getUrl());
  expect(r.getUrl().equals(u("source"))).toBe(true);
  const d = s("sentinel"),
    id: [number] = [99];
  expect(r.nextItem(Text.NONE, d, id)).toBe(Result.Begin);
  expect([t(d), id[0]]).toEqual(["r", -2]);
  expect(r.nextAttribute(id, d)).toBe(false);
  const begin = d.begin;
  for (const expected of [Result.End, Result.Done, Result.Done]) {
    expect(r.nextItem(Text.Raw, d, id)).toBe(expected);
    expect(d.begin).toBe(begin);
    expect([t(d), id[0]]).toEqual(["r", -2]);
  }
});
it("registers IRIs and legacy xsi then restores nested prefix and default namespace scopes", /** Namespace and attribute sequence. @returns Nothing. */ () => {
  const r = new XmlReader(
    u("ns"),
    new TextEncoder().encode(
      '<p:r xmlns="urn:a" xmlns:p="urn:a" a="1" p:b="2" xml:lang="en" xsi:type="T"><p:c xmlns:p="urn:b" xmlns=""><d/></p:c><d/></p:r>',
    ),
  );
  for (const [iri, id] of [
    ["urn:a", 1],
    ["urn:a", 2],
    ["urn:b", 3],
    ["http://www.w3.org/2001/XMLSchema-instance", 4],
    ["http://www.w3.org/2001/XMLSchema-instance", 5],
  ] as const)
    expect(r.registerNamespaceIri(s(iri))).toBe(id);
  expect(r.getNamespaceId(s("xml"))).toBe(0);
  expect(r.getNamespaceId(s("xsi"))).toBe(5);
  expect(r.getNamespaceId(s("missing"))).toBe(-1);
  const d = new Span(),
    id: [number] = [99];
  expect(r.nextItem(Text.NONE, d, id)).toBe(Result.Begin);
  expect([t(d), id[0]]).toEqual(["r", 1]);
  for (const [name, ns, value] of [
    ["a", -2, "1"],
    ["b", 1, "2"],
    ["lang", 0, "en"],
    ["type", 5, "T"],
  ] as const) {
    expect(r.nextAttribute(id, d)).toBe(true);
    expect([t(d), id[0], t(r.getAttributeValue(false))]).toEqual([name, ns, value]);
  }
  expect(r.nextAttribute(id, d)).toBe(false);
  for (const [event, name, ns] of [
    [Result.Begin, "c", 3],
    [Result.Begin, "d", -1],
    [Result.End, null, null],
    [Result.End, null, null],
    [Result.Begin, "d", 1],
    [Result.End, null, null],
    [Result.End, null, null],
  ] as const) {
    expect(r.nextItem(Text.NONE, d, id)).toBe(event);
    if (name !== null) expect([t(d), id[0]]).toEqual([name, ns]);
  }
  expect(r.getNamespaceId(s("p"))).toBe(-1);
  expect(r.getNamespaceId(s("xsi"))).toBe(5);
});
it("retains empty IRI registration unknown prefixes last-colon names and normalized declaration values", /** Source namespace edge cases. @returns Nothing. */ () => {
  for (const [xml, iris, name, ns] of [
    ['<r xmlns=""/>', [""], "r", 1],
    ['<q:r q:a="x"/>', [], "r", -1],
    ['<a:b:c xmlns:a:b="urn:z"/>', ["urn:z"], "c", -1],
    ['<r xmlns="urn:&#97;"/>', ["urn:a"], "r", 1],
    ['<r xmlns="unknown"/>', [], "r", -1],
  ] as const) {
    const r = new XmlReader(u("n"), new TextEncoder().encode(xml));
    for (const iri of iris) r.registerNamespaceIri(s(iri));
    const d = new Span(),
      id: [number] = [0];
    expect(r.nextItem(Text.NONE, d, id)).toBe(Result.Begin);
    expect([t(d), id[0]]).toEqual([name, ns]);
    if (xml.includes("q:a")) {
      expect(r.nextAttribute(id, d)).toBe(true);
      expect([t(d), id[0]]).toEqual(["a", -1]);
    }
  }
});
it("skips text references PI comments CDATA and permissive DTDs in NONE mode", /** Native DTD scanner stream. @returns Nothing. */ () => {
  const xml = `<?xml version="1"?><!--c--><!DOCTYPE r "quoted>" 'q' [<!----><?p?><x>stuff "x" 'y'] ><r>&unknown;<![CDATA[<ignored>]]><!x><?p?><c/>tail</r>`;
  const r = new XmlReader(u("skip"), new TextEncoder().encode(xml)),
    d = new Span(),
    id: [number] = [0];
  for (const event of [Result.Begin, Result.Begin, Result.End, Result.End, Result.Done])
    expect(r.nextItem(Text.NONE, d, id)).toBe(event);
});
