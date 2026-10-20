/** @fileoverview Native Parser/ParseManager pause/replay, namespace and event contracts over actual XmlReader state. */
import { expect, it } from "vitest";
import { OUString, type OUStringConstReference } from "../../sal/inc/rtl/ustring";
import { XmlReader, Text } from "../../xmlreader/inc/xmlreader";
import { Span } from "../../xmlreader/inc/span";
import { Parser } from "./parser";
import { ParseManager } from "./parsemanager";
import { parseType, parseBoolean, parseTemplateReference } from "./xmldata";
import { Type } from "./type";
/** Native string fixture. @param value - Exact text. @returns Owner. */
function u(value: string): OUString {
  const units = Uint16Array.from(
    value.split(""),
    /** Encodes a unit. @param c - Unit. @returns Code. */ (c) => c.charCodeAt(0),
  );
  return new OUString(units, units.length);
}
/** Exact text observation. @param value - Borrowed native value. @returns UTF16. */
function text(value: OUStringConstReference): string {
  let out = "";
  for (let i = 0; i < value.getLength(); i++)
    out += String.fromCharCode(value.getStr()[i] as number);
  return out;
}
/** Native byte span. @param value - Lexical bytes. @returns Span. */
function s(value: string): Span {
  const bytes = new TextEncoder().encode(value);
  return new Span(bytes, bytes.length);
}
/** Test-only original Parser subclass exercising pause/retry behavior, without a replacement XML reader/provider. */
class Recorder extends Parser {
  public readonly events: unknown[] = [];
  public starts = 0;
  public fail = false;
  /** Raw text callback mode. @returns Mode. */
  public override getTextMode(): Text {
    return Text.Raw;
  }
  /** Pause/throw once before consuming attrs, then consume real events. @param reader - Actual reader. @param ns - Namespace. @param name - Span. @param dependencies - Original pointer. @returns Whether consumed. */
  public override startElement(
    reader: XmlReader,
    ns: number,
    name: Span,
    dependencies: ReadonlySet<OUStringConstReference> | null,
  ): boolean {
    const value = name.convertFromUtf8();
    this.events.push(["begin", ns, text(value), dependencies]);
    this.starts++;
    if (this.fail) {
      this.fail = false;
      throw new Error("caller parser failure");
    }
    if (dependencies === null && this.starts === 1) return false;
    const attrName = new Span(),
      attrNs: [number] = [0];
    while (reader.nextAttribute(attrNs, attrName)) {
      const attr = attrName.convertFromUtf8(),
        raw = reader.getAttributeValue(false).convertFromUtf8();
      this.events.push(["attribute", attrNs[0], text(attr), text(raw)]);
    }
    return true;
  }
  /** Original end callback. @param reader - Actual reader. @returns Nothing. */
  public override endElement(reader: XmlReader): void {
    this.events.push(["end", text(reader.getUrl())]);
  }
  /** Native text callback. @param span - Borrowed bytes. @returns Nothing. */
  public override characters(span: Span): void {
    const value = span.convertFromUtf8();
    this.events.push(["text", text(value)]);
  }
}
it("replays the pending begin on false, forwards dependencies and retains original copied input", /** Driver does not restart the XML reader or consume the pending event. @returns Nothing. */ () => {
  const parser = new Recorder(),
    url = u("source"),
    bytes = new TextEncoder().encode(
      '<r xmlns:oor="http://openoffice.org/2001/registry" oor:name="root"><c/>text</r>',
    ),
    driver = new ParseManager(url, parser, bytes);
  url.assign(u("changed"));
  bytes.fill(0);
  expect(driver.parse(null)).toBe(false);
  expect(parser.starts).toBe(1);
  const deps = new Set([u("ready")]);
  expect(driver.parse(deps)).toBe(true);
  expect(parser.starts).toBe(3);
  expect(
    parser.events
      .filter(
        /** Excludes native raw empty-text events from this ordering observation. @param event - Observation. @returns Non-text event. */ (
          event,
        ) => (event as unknown[])[0] !== "text",
      )
      .slice(0, 3),
  ).toEqual([
    ["begin", -2, "r", null],
    ["begin", -2, "r", deps],
    ["attribute", 1, "name", "root"],
  ]);
  expect(parser.events).toContainEqual(["text", "text"]);
  expect(
    parser.events.filter(
      /** Selects real end events. @param event - Observation. @returns Whether end. */ (event) =>
        (event as unknown[])[0] === "end",
    ),
  ).toEqual([
    ["end", "source"],
    ["end", "source"],
  ]);
  expect(driver.parse(deps)).toBe(true);
});
it("retains a throwing start event for a later parser retry", /** No implicit rollback or reader reconstruction is introduced. @returns Nothing. */ () => {
  const parser = new Recorder();
  parser.fail = true;
  const driver = new ParseManager(u("retry"), parser, new TextEncoder().encode("<r/>"));
  expect(
    /** Invokes the throwing callback. @returns Completion. */ () => driver.parse(null),
  ).toThrow("caller parser failure");
  expect(driver.parse(new Set())).toBe(true);
  expect(parser.starts).toBe(2);
  expect(parser.events[0]).toEqual(["text", ""]);
  expect(parser.events[1]).toEqual(["begin", -2, "r", null]);
});
it.each([
  ["o:any", Type.TYPE_ANY],
  ["o:boolean-list", Type.TYPE_BOOLEAN_LIST],
  ["o:short-list", Type.TYPE_SHORT_LIST],
  ["o:int-list", Type.TYPE_INT_LIST],
  ["o:long-list", Type.TYPE_LONG_LIST],
  ["o:double-list", Type.TYPE_DOUBLE_LIST],
  ["o:string-list", Type.TYPE_STRING_LIST],
  ["o:hexBinary-list", Type.TYPE_HEXBINARY_LIST],
  ["x:boolean", Type.TYPE_BOOLEAN],
  ["x:short", Type.TYPE_SHORT],
  ["x:int", Type.TYPE_INT],
  ["x:long", Type.TYPE_LONG],
  ["x:double", Type.TYPE_DOUBLE],
  ["x:string", Type.TYPE_STRING],
  ["x:hexBinary", Type.TYPE_HEXBINARY],
] as const)(
  "retains actual namespace QName grammar %j",
  /** Prefix aliases resolve through real reader namespace scope. @param lexical - QName. @param expected - Native type. @returns Nothing. */ (
    lexical,
    expected,
  ) => {
    const reader = new XmlReader(
      u("types"),
      new TextEncoder().encode(
        '<r xmlns:o="http://openoffice.org/2001/registry" xmlns:x="http://www.w3.org/2001/XMLSchema"/>',
      ),
    );
    reader.registerNamespaceIri(s("http://openoffice.org/2001/registry"));
    reader.registerNamespaceIri(s("http://www.w3.org/2001/XMLSchema"));
    reader.nextItem(Text.NONE, new Span(), [0]);
    expect(parseType(reader, s(lexical))).toBe(expected);
  },
);
it("retains strict schema boolean/type and template-reference fallback contracts", /** Value parser's numeric boolean grammar must not leak into schema metadata. @returns Nothing. */ () => {
  const reader = new XmlReader(u("types"), new TextEncoder().encode("<r/>"));
  expect(
    /** Unbound spans violate the native lexical precondition. @returns Type. */ () =>
      parseType(reader, new Span()),
  ).toThrow("assert(text.is())");
  expect(
    /** Schema boolean has the same present-span precondition. @returns Boolean. */ () =>
      parseBoolean(new Span()),
  ).toThrow("assert(text.is())");
  reader.nextItem(Text.NONE, new Span(), [0]);
  for (const lexical of ["string", "z:string", "z:unknown", ":string", "x:string:extra"]) {
    expect(
      /** Classifies invalid QName. @returns Type. */ () => parseType(reader, s(lexical)),
    ).toThrow();
  }
  expect(parseBoolean(s("true"))).toBe(true);
  expect(parseBoolean(s("false"))).toBe(false);
  for (const lexical of ["1", "0", "True", " true"]) {
    expect(
      /** Invokes schema boolean rejection. @returns Boolean. */ () => parseBoolean(s(lexical)),
    ).toThrow();
  }
  const fallback = u("p:T"),
    copy = parseTemplateReference(u("p"), false, u("ignored"), fallback);
  expect(copy).not.toBe(fallback);
  expect(copy.equals(fallback)).toBe(true);
  expect(text(parseTemplateReference(u("p"), true, u("T"), null))).toBe("p:T");
  expect(text(parseTemplateReference(u("p"), true, new OUString(), null))).toBe("p:");
  expect(
    /** Missing reference type without fallback. @returns Native name. */ () =>
      parseTemplateReference(u("p"), false, new OUString(), null),
  ).toThrow();
});
