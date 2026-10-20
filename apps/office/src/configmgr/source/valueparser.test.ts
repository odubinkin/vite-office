/** @fileoverview Source-derived configmgr typed lexical values and complete XML value histories with actual shared owners; no configuration provider is substituted. */
import { expect, it } from "vitest";
import { Any } from "../../cppu/inc/com/sun/star/uno/Any";
import { Sequence } from "../../cppu/inc/com/sun/star/uno/Sequence";
import type { UnoTypeArgument } from "../../cppu/inc/unotype";
import { OUString } from "../../sal/inc/rtl/ustring";
import { XmlReader, Text, Result } from "../../xmlreader/inc/xmlreader";
import { Span } from "../../xmlreader/inc/span";
import { Type, elementType, getDynamicType } from "./type";
import { Data } from "./data";
import { PropertyNode, type PropertyNodeComponents } from "./propertynode";
import { LocalizedPropertyNode } from "./localizedpropertynode";
import { LocalizedValueNode } from "./localizedvaluenode";
import { ValueParser, parseValue } from "./valueparser";
/** Actual Unicode caller value. @param value - Exact text. @returns Owner. */
function u(value: string): OUString {
  const units = Uint16Array.from(
    value.split(""),
    /** Encodes units. @param c - Unit. @returns Value. */ (c) => c.charCodeAt(0),
  );
  return new OUString(units, units.length);
}
/** Actual byte span. @param value - Text. @returns Present span. */
function s(value: string): Span {
  const bytes = new TextEncoder().encode(value);
  return new Span(bytes, bytes.length);
}
/** Reads exact Unicode. @param value - Native owner. @returns Unit text. */
function text(value: OUString): string {
  let out = "";
  for (let i = 0; i < value.getLength(); i++)
    out += String.fromCharCode(value.getStr()[i] as number);
  return out;
}
/** Explicit caller template arguments and sizeof(T), matching source declaration types. @param type - Scalar type. @returns Binding. */
function binding(type: Type): [Exclude<UnoTypeArgument, "Any">, number] {
  return (
    {
      [Type.TYPE_BOOLEAN]: ["sal_Bool", 1],
      [Type.TYPE_SHORT]: ["sal_Int16", 2],
      [Type.TYPE_INT]: ["sal_Int32", 4],
      [Type.TYPE_LONG]: ["sal_Int64", 8],
      [Type.TYPE_DOUBLE]: ["double", 8],
      [Type.TYPE_STRING]: ["OUString", 8],
      [Type.TYPE_HEXBINARY]: [["Sequence", "sal_Int8"], 8],
    } as Record<number, [Exclude<UnoTypeArgument, "Any">, number]>
  )[type] as [Exclude<UnoTypeArgument, "Any">, number];
}
/** Observes actual native Any/sequence/string owners, without JS runtime type inference. @param value - Actual Any. @param type - Declared original type. @returns Test observation. */
function observed(value: Any, type: Type): unknown {
  if (type >= Type.TYPE_BOOLEAN_LIST) {
    const [arg, size] = binding(elementType(type)),
      Seq = Sequence.specialize(arg, size),
      seq = new Seq();
    expect(value.extract(seq.getAddress(), ["Sequence", arg])).toBe(true);
    try {
      const result: unknown[] = [];
      for (let i = 0; i < seq.getLength(); i++) {
        const item = new Any(seq.operatorIndex(i), arg);
        try {
          result.push(observed(item, elementType(type)));
        } finally {
          item.dispose();
        }
      }
      return result;
    } finally {
      seq.dispose();
    }
  }
  if (type === Type.TYPE_STRING) {
    const out = new OUString();
    expect(value.extract(out, "OUString")).toBe(true);
    try {
      return text(out);
    } finally {
      out.dispose();
    }
  }
  if (type === Type.TYPE_HEXBINARY) {
    const Bytes = Sequence.specialize<[number]>("sal_Int8", 1),
      seq = new Bytes();
    expect(value.extract(seq.getAddress(), ["Sequence", "sal_Int8"])).toBe(true);
    try {
      const result: number[] = [];
      for (let i = 0; i < seq.getLength(); i++) result.push(seq.operatorIndex(i)[0]);
      return result;
    } finally {
      seq.dispose();
    }
  }
  const out: [unknown] = [null];
  expect(value.extract(out, binding(type)[0])).toBe(true);
  return out[0];
}
/** Ordinary local values need no external resolver call; the exact receiver contract fails if unexpectedly invoked. */
const noExternal: PropertyNodeComponents = {
  getExternalValue: /** Flags unexpected external lookup. @returns Never. */ () => {
    throw new Error("unexpected external lookup");
  },
};
/** Parses one scalar/list directly through original source conversion responsibility. @param raw - Exact lexical text. @param type - Declared type. @param separator - Raw delimiter bytes. @returns Observed value. */
function parsed(raw: string, type: Type, separator = ""): unknown {
  const value = parseValue(new TextEncoder().encode(separator), s(raw), type);
  try {
    expect(getDynamicType(value)).toBe(type);
    return observed(value, type);
  } finally {
    value.dispose();
  }
}
/** Runs actual XMLReader events through ValueParser. @param xml - Complete value element. @param type - Native type. @param node - Actual target property. @param separator - Explicit delimiter. @param layer - Native source layer. @param locale - Localized key. @returns Parser. */
function xml(
  xml: string,
  type: Type,
  node: PropertyNode | LocalizedPropertyNode,
  separator = "",
  layer = Data.NO_LAYER,
  locale = "",
): ValueParser {
  const reader = new XmlReader(u("configuration-fixture"), new TextEncoder().encode(xml));
  for (const iri of [
    "http://openoffice.org/2001/registry",
    "http://www.w3.org/2001/XMLSchema",
    "http://www.w3.org/2001/XMLSchema-instance",
  ])
    reader.registerNamespaceIri(s(iri));
  const name = new Span(),
    ns: [number] = [0];
  expect(reader.nextItem(Text.NONE, name, ns)).toBe(Result.Begin);
  const parser = new ValueParser(layer);
  parser.type_ = type;
  parser.separator_ = new TextEncoder().encode(separator);
  parser.start(node, u(locale));
  let depth = 1;
  while (depth) {
    const result = reader.nextItem(parser.getTextMode(), name, ns);
    if (result === Result.Begin) {
      depth++;
      expect(parser.startElement(reader, ns[0], name)).toBe(true);
    } else if (result === Result.Text) parser.characters(name);
    else if (result === Result.End) {
      expect(parser.endElement()).toBe(true);
      depth--;
    } else throw new Error("unexpected reader end");
  }
  expect(parser.getTextMode()).toBe(Text.NONE);
  expect(parser.endElement()).toBe(false);
  return parser;
}
it.each([
  [Type.TYPE_BOOLEAN, "true", 1],
  [Type.TYPE_BOOLEAN, "0", 0],
  [Type.TYPE_SHORT, "32767", 32767],
  [Type.TYPE_SHORT, "-32768", -32768],
  [Type.TYPE_SHORT, "garbage", 0],
  [Type.TYPE_SHORT, "0xffffffff", -1],
  [Type.TYPE_INT, "4294967295", 0],
  [Type.TYPE_INT, "0XFFFFFFFF", -1],
  [Type.TYPE_INT, " 12tail", 12],
  [Type.TYPE_LONG, "9223372036854775807", 9223372036854775807n],
  [Type.TYPE_LONG, "0xffffffffffffffff", -1n],
  [Type.TYPE_LONG, "0x10000000000000000", 0n],
  [Type.TYPE_DOUBLE, "1.25junk", 1.25],
  [Type.TYPE_DOUBLE, "oops", 0],
  [Type.TYPE_STRING, " a\0😀\ufeff ", " a\0😀\ufeff "],
  [Type.TYPE_HEXBINARY, "00ff80aA", [0, -1, -128, -86]],
] as const)(
  "preserves typed lexical value type=%i text=%j",
  /** Source expected values are literal. @param type - Schema type. @param raw - Lexical input. @param expected - Expected observation. @returns Nothing. */ (
    type,
    raw,
    expected,
  ) => {
    expect(parsed(raw, type)).toEqual(expected);
  },
);
it.each([
  [Type.TYPE_BOOLEAN, "True"],
  [Type.TYPE_BOOLEAN, " true"],
  [Type.TYPE_BOOLEAN, ""],
  [Type.TYPE_SHORT, "32768"],
  [Type.TYPE_SHORT, "0xffff"],
  [Type.TYPE_HEXBINARY, "f"],
  [Type.TYPE_HEXBINARY, "gg"],
  [Type.TYPE_ANY, "true"],
  [Type.TYPE_NIL, ""],
] as const)(
  "retains lexical rejection type=%i text=%j",
  /** Uses real source exception paths. @param type - Schema type. @param raw - Lexical input. @returns Nothing. */ (
    type,
    raw,
  ) => {
    expect(
      /** Parses the invalid value. @returns Observation. */ () => parsed(raw, type),
    ).toThrow();
  },
);
it("keeps every native list type, exact separators and empty/consecutive tokens", /** No whitespace splitting or permissive boolean fallback is invented. @returns Nothing. */ () => {
  expect(parsed("", Type.TYPE_BOOLEAN_LIST)).toEqual([]);
  expect(parsed("1 0 true false", Type.TYPE_BOOLEAN_LIST)).toEqual([1, 0, 1, 0]);
  expect(parsed("1  2 ", Type.TYPE_INT_LIST)).toEqual([1, 0, 2, 0]);
  expect(parsed("32767 -1", Type.TYPE_SHORT_LIST)).toEqual([32767, -1]);
  expect(parsed("0xffffffffffffffff 2", Type.TYPE_LONG_LIST)).toEqual([-1n, 2n]);
  expect(parsed("1.5 2.5", Type.TYPE_DOUBLE_LIST)).toEqual([1.5, 2.5]);
  expect(parsed("a::::b::", Type.TYPE_STRING_LIST, "::")).toEqual(["a", "", "b", ""]);
  expect(parsed("00ff::80::", Type.TYPE_HEXBINARY_LIST, "::")).toEqual([[0, -1], [-128], []]);
  expect(
    /** Consecutive empty boolean token is invalid. @returns Observation. */ () =>
      parsed("true  false", Type.TYPE_BOOLEAN_LIST),
  ).toThrow();
  expect(
    /** UTF8 conversion remains strict. @returns Any. */ () =>
      parseValue(new Uint8Array(), new Span(new Uint8Array([0xc0, 0xaf]), 2), Type.TYPE_STRING),
  ).toThrow();
});
it("drives ordinary property scalar text, layers, modified state and copied separator ownership", /** Real parser target values remain stable borrowed Any members. @returns Nothing. */ () => {
  const node = new PropertyNode(1, Type.TYPE_BOOLEAN, false, new Any(false), false),
    value = node.getValue(noExternal);
  const parser = xml("<value>true</value>", Type.TYPE_BOOLEAN, node);
  expect(node.getValue(noExternal)).toBe(value);
  expect(observed(value, Type.TYPE_BOOLEAN)).toBe(1);
  expect([node.getLayer(), node.isModified(), parser.getLayer()]).toEqual([
    Data.NO_LAYER,
    true,
    Data.NO_LAYER,
  ]);
  const list = new PropertyNode(1, Type.TYPE_STRING_LIST, false, new Any(), false);
  xml("<value>a::b::::</value>", Type.TYPE_STRING_LIST, list, "::", 2);
  expect(observed(list.getValue(noExternal), Type.TYPE_STRING_LIST)).toEqual(["a", "b", "", ""]);
  expect([list.getLayer(), list.isModified()]).toEqual([2, false]);
  const p = new ValueParser(3),
    sep = new Uint8Array([58]);
  p.separator_ = sep;
  sep[0] = 44;
  expect(Array.from(p.separator_)).toEqual([58]);
  expect(p.getTextMode()).toBe(Text.NONE);
});
it("parses it lists and localized updates using actual child nodes and original text modes", /** XMLReader suppresses inter-item text after the first item. @returns Nothing. */ () => {
  const node = new PropertyNode(1, Type.TYPE_INT_LIST, false, new Any(), false);
  xml("<value>discarded<it>1</it>ignored<it>2</it>tail</value>", Type.TYPE_INT_LIST, node);
  expect(observed(node.getValue(noExternal), Type.TYPE_INT_LIST)).toEqual([1, 2]);
  const loc = new LocalizedPropertyNode(1, Type.TYPE_STRING_LIST, false);
  xml("<value><it> a </it><it>b</it></value>", Type.TYPE_STRING_LIST, loc, "", 2, "en-US");
  const child = loc.getMember(u("en-US")) as LocalizedValueNode;
  const value = child.getValue();
  expect(observed(value, Type.TYPE_STRING_LIST)).toEqual([" a ", "b"]);
  expect(child.isModified()).toBe(false);
  xml("<value><it>x</it></value>", Type.TYPE_STRING_LIST, loc, "", Data.NO_LAYER, "en-US");
  expect(loc.getMember(u("en-US"))).toBe(child);
  expect(child.getValue()).toBe(value);
  expect(observed(value, Type.TYPE_STRING_LIST)).toEqual(["x"]);
  expect(child.isModified()).toBe(true);
});
it.each([0, 1, 8, 11, 12, 14, 31, 65534, 65535])(
  "retains original unicode scalar whitelist %i",
  /** Actual XML attribute parsing feeds the source scalar branch. @param scalar - Admitted scalar. @returns Nothing. */ (
    scalar,
  ) => {
    const node = new PropertyNode(1, Type.TYPE_STRING, false, new Any(), false);
    xml(
      `<value xmlns:oor="http://openoffice.org/2001/registry">a<unicode oor:scalar="${scalar}"/>b</value>`,
      Type.TYPE_STRING,
      node,
    );
    expect(observed(node.getValue(noExternal), Type.TYPE_STRING)).toBe(
      "a" + String.fromCharCode(scalar) + "b",
    );
  },
);
it("retains invalid numeric unicode attribute conversion to NUL and unicode inside it items", /** Source numeric lexical TODO is preserved rather than tightened. @returns Nothing. */ () => {
  const node = new PropertyNode(1, Type.TYPE_STRING_LIST, false, new Any(), false);
  xml(
    '<value xmlns:oor="http://openoffice.org/2001/registry"><it>a<unicode oor:scalar="garbage"/>b</it><it>c</it></value>',
    Type.TYPE_STRING_LIST,
    node,
  );
  expect(observed(node.getValue(noExternal), Type.TYPE_STRING_LIST)).toEqual(["a\0b", "c"]);
});
it.each([9, 10, 13, 32, -1, 65536])(
  "retains forbidden unicode scalar %i",
  /** These values fail before target assignment. @param scalar - Rejected scalar. @returns Nothing. */ (
    scalar,
  ) => {
    const node = new PropertyNode(1, Type.TYPE_STRING, false, new Any(), false);
    expect(
      /** Drives native rejection. @returns Parser. */ () =>
        xml(
          `<value xmlns:oor="http://openoffice.org/2001/registry"><unicode oor:scalar="${scalar}"/></value>`,
          Type.TYPE_STRING,
          node,
        ),
    ).toThrow();
  },
);
it("updates target metadata and inserts localized children before a lexical failure", /** Exception timing is an observable source contract. @returns Nothing. */ () => {
  const node = new PropertyNode(1, Type.TYPE_BOOLEAN, false, new Any(true), false);
  expect(
    /** Rejects bad boolean. @returns Parser. */ () =>
      xml("<value>bad</value>", Type.TYPE_BOOLEAN, node),
  ).toThrow();
  expect([
    node.getLayer(),
    node.isModified(),
    observed(node.getValue(noExternal), Type.TYPE_BOOLEAN),
  ]).toEqual([Data.NO_LAYER, true, 1]);
  const loc = new LocalizedPropertyNode(1, Type.TYPE_BOOLEAN, false);
  expect(
    /** Rejects bad localized boolean after insertion. @returns Parser. */ () =>
      xml("<value>bad</value>", Type.TYPE_BOOLEAN, loc, "", Data.NO_LAYER, "en"),
  ).toThrow();
  const child = loc.getMember(u("en")) as LocalizedValueNode;
  expect(child).toBeInstanceOf(LocalizedValueNode);
  expect([child.getLayer(), child.isModified(), child.getValue().hasValue()]).toEqual([
    Data.NO_LAYER,
    true,
    false,
  ]);
});
it("retains bad nested member and missing/wrong-namespace unicode scalar errors", /** These are original parser state and namespace boundaries. @returns Nothing. */ () => {
  for (const body of ["<bad/>", "<unicode/>", '<unicode scalar="0"/>', "<it>x</it>"]) {
    const node = new PropertyNode(1, Type.TYPE_STRING, false, new Any(), false);
    expect(
      /** Invokes invalid source member. @returns Parser. */ () =>
        xml("<value>" + body + "</value>", Type.TYPE_STRING, node),
    ).toThrow();
  }
  const node = new PropertyNode(1, Type.TYPE_STRING_LIST, false, new Any(), false);
  expect(
    /** Item syntax is disabled with explicit separator. @returns Parser. */ () =>
      xml("<value><it>x</it></value>", Type.TYPE_STRING_LIST, node, ","),
  ).toThrow();
});
it.each([
  ["IsWholeWordsOnly", "false", 0],
  ["IsMatchCase", "false", 0],
  ["IsIgnoreKashida_CTL", "true", 1],
  ["Japanese/IsMatchFullHalfWidthForms", "true", 1],
] as const)(
  "reads original Common.xcs search lexical default %j",
  /** Fixture literals come from the pinned schema, not a replacement defaults provider. @param name - Source property. @param lexical - Original value. @param expected - Bool observation. @returns Nothing. */ (
    name,
    lexical,
    expected,
  ) => {
    expect(name.length).toBeGreaterThan(0);
    const property = new PropertyNode(0, Type.TYPE_BOOLEAN, false, new Any(), false);
    xml("<value>" + lexical + "</value>", Type.TYPE_BOOLEAN, property, "", 0);
    expect(observed(property.getValue(noExternal), Type.TYPE_BOOLEAN)).toBe(expected);
    expect(property.isModified()).toBe(false);
  },
);
