/** @fileoverview Source-contract OOXML value/unit/resource dispatch tests exercising actual RTL, Any, OUString, SAX colors and ordered property owners. */
import { expect, it } from "vitest";
import {
  OOXMLProperty,
  OOXMLPropertySet,
  OOXMLPropertyType as T,
  OOXMLTable,
  OOXMLValue as V,
  GetBooleanValue,
} from "./OOXMLPropertySet";
import { OUString } from "../../../../sal/inc/rtl/ustring";
import type { Properties, Sprm, Value, Reference } from "../inc/dmapper/resourcemodel";

/** Allocates a test native string. @param value - Text. @returns Owned string. */
function unicode(value: string): OUString {
  return new OUString(
    Uint16Array.from(
      value.split(""),
      /** Reads one unit. @param c - Unit. @returns Code. */ (c) => c.charCodeAt(0),
    ),
    value.length,
  );
}
/** Reads and releases a returned native string. @param value - Owned string. @returns Text. */
function text(value: OUString): string {
  let out = "";
  try {
    for (let i = 0; i < value.getLength(); ++i)
      out += String.fromCharCode(value.getStr()[i] as number);
    return out;
  } finally {
    value.dispose();
  }
}
/** Receiving native handler records actual attribute/modifier delivery. */
class Receiver implements Properties {
  readonly entries: string[] = [];
  /** Records the original attribute channel. @param id - ID. @param value - Value. @returns Nothing. */
  attribute(id: number, value: Value): void {
    this.entries.push(`attribute:${id}:${value.getInt()}`);
  }
  /** Records the original modifier channel and nullable value. @param value - Modifier. @returns Nothing. */
  sprm(value: Sprm): void {
    this.entries.push(`sprm:${value.getId()}:${value.getValue()?.getInt() ?? "null"}`);
  }
}

it.each(["true", "True", "1", "on", "On"])(
  "preserves source ON/OFF true spelling %s",
  /** Tests original admitted strings and bool overloads. @param value - Lexeme. @returns Nothing. */ (
    value,
  ) => {
    expect(GetBooleanValue(value)).toBe(true);
    expect(V.createBoolean(value).getInt()).toBe(1);
    const a = V.createBoolean(true).getAny(),
      out: [boolean] = [false];
    try {
      expect(a.extract(out, "bool")).toBe(true);
      expect(out[0]).toBe(true);
    } finally {
      a.dispose();
    }
  },
);
it.each(["TRUE", "ON", "false", "False", "off", "0", "2", " true", "true ", ""])(
  "preserves source ON/OFF false spelling %s",
  /** Avoids broad JS truthiness/locale folding. @param value - Lexeme. @returns Nothing. */ (
    value,
  ) => {
    expect(GetBooleanValue(value)).toBe(false);
    expect(V.createBoolean(value).getInt()).toBe(0);
    expect(V.createBoolean(false).getInt()).toBe(0);
  },
);

it("keeps default/copy/string/int/hex/properties variant views distinct", /** Verifies actual Any types and copied UTF16 values. @returns Nothing. */ () => {
  const empty = new V();
  expect(empty.hasValue()).toBe(false);
  for (const operation of [
    /** Queries invalid native integer input. @returns Number. */ () => empty.getInt(),
    /** Queries invalid native string input. @returns String. */ () => empty.getString(),
    /** Queries invalid native Any input. @returns Any. */ () => empty.getAny(),
    /** Queries invalid native properties input. @returns Properties. */ () =>
      empty.getProperties(),
  ])
    expect(operation).toThrow("OOXMLValue is empty");
  const integer = V.createInteger(0x100000001),
    any = integer.getAny(),
    result: [number] = [0];
  try {
    expect(any.extract(result, "sal_Int32")).toBe(true);
    expect(result[0]).toBe(1);
  } finally {
    any.dispose();
  }
  expect(text(integer.getString())).toBe("");
  expect(integer.getProperties()).toBeNull();
  const input = unicode("a😀\u0301"),
    value = V.createString(input);
  input.dispose();
  const clone = value.clone();
  expect(text(clone.getString())).toBe("a😀\u0301");
  expect(clone.getInt()).toBe(0);
  const stringAny = clone.getAny(),
    stringOut = new OUString();
  try {
    expect(stringAny.extract(stringOut, "OUString")).toBe(true);
    expect(text(new OUString(stringOut))).toBe("a😀\u0301");
  } finally {
    stringOut.dispose();
    stringAny.dispose();
  }
  const props = new OOXMLPropertySet(),
    propValue = V.createPropertySet(props);
  expect(propValue.getProperties()).toBe(props);
  expect(propValue.clone().getProperties()).toBe(props);
  const voidAny = propValue.getAny();
  try {
    expect(voidAny.hasValue()).toBe(false);
  } finally {
    voidAny.dispose();
  }
  expect(V.createHex(-1).getInt()).toBe(-1);
  const hexAny = V.createHex(7).getAny();
  try {
    expect(hexAny.hasValue()).toBe(false);
  } finally {
    hexAny.dispose();
  }
});

it.each([
  ["FF00AA", 0xff00aa],
  ["0", 0],
  ["F", 15],
  ["FFFFFFFF", -1],
  ["FFFFFFFFF", 0],
  ["-1", 0],
  ["10tail", 16],
  ["invalid", 0],
])(
  "uses original unsigned hex prefix/overflow conversion %s",
  /** Exercises the actual native unsigned32 parser. @param input - Lexeme. @param output - Signed int projection. @returns Nothing. */ (
    input,
    output,
  ) => {
    expect(V.createHex(input).getInt()).toBe(output);
  },
);

it.each([
  ["auto", -1],
  ["Auto", 10],
  ["#ABCDEF", 0xabcdef],
  ["#000000", 0],
  ["#xyzxyz", -1],
  ["#1", -1],
  ["#", 0],
  ["bad", 0xbad],
  ["blue", 11],
])(
  "preserves original color auto/hash and prefix behavior %s",
  /** Does not normalize malformed lexemes away from source defaults. @param input - Color. @param output - Native int projection. @returns Nothing. */ (
    input,
    output,
  ) => {
    expect(V.createHexColor(input).getInt()).toBe(output);
  },
);

it.each([
  ["1pt", 20],
  ["1in", 1440],
  ["2.54cm", 1440],
  ["25.4mm", 1440],
  ["1pc", 240],
  ["1pi", 240],
  ["24", 24],
  ["24unknown", 24],
  ["1PT", 1],
  ["1pt ", 1],
  ["-0.025pt", -1],
  ["0.025pt", 1],
  ["-0.01pt", 0],
  ["badpt", 0],
  ["0", 0],
])(
  "preserves original twip universal measure conversion %s",
  /** Verifies units, exact suffix admission and std::round ties. @param input - Measure. @param output - Twips. @returns Nothing. */ (
    input,
    output,
  ) => {
    const value = V.createTwipsMeasure(input);
    expect(value.getInt()).toBe(output);
    const any = value.getAny();
    try {
      expect(any.hasValue()).toBe(false);
    } finally {
      any.dispose();
    }
  },
);

it("retains the source EMU/half-point scales and percent truncation", /** Separates native variants and rounding modes. @returns Nothing. */ () => {
  expect(V.createEmuMeasure("1in").getInt()).toBe(914400);
  expect(V.createHpsMeasure("12pt").getInt()).toBe(24);
  expect(V.createMeasurementOrPercent("12.345%").getInt()).toBe(617);
  expect(V.createMeasurementOrPercent("-12.345%").getInt()).toBe(-617);
  expect(V.createMeasurementOrPercent("12.345% ").getInt()).toBe(12);
  expect(V.createMeasurementOrPercent("%").getInt()).toBe(0);
  expect(V.createMeasurementOrPercent("1in").getInt()).toBe(1440);
  expect(V.createUniversalMeasure("3pt", 0).getInt()).toBe(0);
  expect(
    /** Calls the undefined native cast boundary. @returns Value or throws. */ () =>
      V.createTwipsMeasure("2147483648"),
  ).toThrow("defined signed32 domain");
  expect(
    /** Calls the undefined native negative cast boundary. @returns Value or throws. */ () =>
      V.createTwipsMeasure("-2147483649"),
  ).toThrow("defined signed32 domain");
  expect(
    /** Calls the undefined native nonfinite cast boundary. @returns Value or throws. */ () =>
      V.createMeasurementOrPercent("1e999%"),
  ).toThrow("defined signed32 domain");
});

it("delivers native attributes/modifiers, ID-zero guards and empty values without fabricated fallbacks", /** Exercises actual property dispatch. @returns Nothing. */ () => {
  const receiver = new Receiver(),
    props = new OOXMLPropertySet();
  props.add(1, V.createInteger(10), T.ATTRIBUTE);
  props.add(2, V.createInteger(20), T.SPRM);
  props.add(0, V.createInteger(30), T.ATTRIBUTE);
  props.add(0x100000000, V.createInteger(40), T.SPRM);
  props.add(null);
  props.resolve(receiver);
  expect(receiver.entries).toEqual(["attribute:1:10", "sprm:2:20"]);
  const zero = new OOXMLProperty(0, V.createInteger(3), T.SPRM);
  zero.resolve(receiver);
  expect(receiver.entries).toHaveLength(2);
  const attributeZero = new OOXMLProperty(0, V.createInteger(4), T.ATTRIBUTE);
  attributeZero.resolve(receiver);
  expect(receiver.entries.at(-1)).toBe("attribute:0:4");
  const value = new OOXMLProperty(-1, new V(), T.SPRM);
  expect(value.getId()).toBe(0xffffffff);
  expect(value.getValue()).toBeNull();
  expect(value.getProps()).toBeNull();
  value.resolve(receiver);
  expect(receiver.entries.at(-1)).toBe("sprm:4294967295:null");
  const nested = new OOXMLProperty(3, V.createPropertySet(props), T.SPRM);
  expect(nested.getProps()).toBe(props);
  expect(new OOXMLProperty(4, V.createInteger(8), T.SPRM).getProps()).toBeNull();
  new OOXMLProperty(5, V.createInteger(8), 99 as T).resolve(receiver);
  expect(receiver.entries).toHaveLength(4);
  expect(
    /** Asserts the original invalid null dereference is outside the defined domain. @returns Nothing or throws. */ () =>
      new OOXMLProperty(6, new V(), T.ATTRIBUTE).resolve(receiver),
  ).toThrow("no defined result");
});

it("preserves duplicate ordering, shared clone references and mutation during native resolution", /** Checks vector identity and the original dynamic-size loop. @returns Nothing. */ () => {
  const props = new OOXMLPropertySet();
  props.add(1, V.createInteger(1), T.SPRM);
  props.add(2, V.createInteger(2), T.SPRM);
  props.add(1, V.createInteger(3), T.SPRM);
  const clone = props.clone();
  expect([...clone][0]).toBe([...props][0]);
  clone.erase(1);
  expect(
    [...clone].map(/** Reads IDs. @param prop - Property. @returns ID. */ (prop) => prop.getId()),
  ).toEqual([2]);
  expect([...props]).toHaveLength(3);
  const merged = new OOXMLPropertySet();
  merged.add(clone);
  expect([...merged][0]).toBe([...clone][0]);
  const received: number[] = [];
  merged.resolve({
    /** There are no attributes in this independent modifier stream. @returns Nothing. */ attribute() {},
    /** Appends after the first callback; the original loop must reach it. @param sprm - Modifier. @returns Nothing. */ sprm(
      sprm,
    ) {
      received.push(sprm.getId());
      if (received.length === 1) merged.add(9, V.createInteger(9), T.SPRM);
    },
  });
  expect(received).toEqual([2, 9]);
  props.resolve({
    /** No attributes in this stream. @returns Nothing. */ attribute() {},
    /** Erases while preserving original vector iteration semantics. @param sprm - Modifier. @returns Nothing. */ sprm(
      sprm,
    ) {
      if (sprm.getId() === 1) props.erase(2);
    },
  });
  expect(
    [...props].map(
      /** Reads IDs after removal. @param p - Property. @returns ID. */ (p) => p.getId(),
    ),
  ).toEqual([1, 1]);
  merged.erase(99);
});

it("keeps native table positions across admitted non-property values and copied tables", /** Uses actual Reference<Properties> instances. @returns Nothing. */ () => {
  const props = new OOXMLPropertySet(),
    table = new OOXMLTable();
  table.add(new V());
  table.add(V.createInteger(1));
  table.add(V.createPropertySet(props));
  const copy = table.clone();
  table.add(V.createPropertySet(new OOXMLPropertySet()));
  const entries: [number, Reference<Properties>][] = [];
  copy.resolve({
    /** Receives exact original table entry positions. @param position - Index. @param properties - Shared reference. @returns Nothing. */ entry(
      position,
      properties,
    ) {
      entries.push([position, properties]);
    },
  });
  expect(entries).toEqual([[1, props]]);
  table.resolve({
    /** Counts actual additional entries in the original table. @param position - Index. @param properties - Reference. @returns Nothing. */ entry(
      position,
      properties,
    ) {
      entries.push([position, properties]);
    },
  });
  expect(entries).toHaveLength(3);
});
