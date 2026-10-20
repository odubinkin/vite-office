/** @fileoverview Native cdouthdl ordered-map,Any extraction,merge priority and text-marker contracts. */
import { expect, it } from "vitest";
import { TypeClass } from "../../../udkapi/com/sun/star/uno/TypeClass";
import { Any } from "../../../cppu/inc/com/sun/star/uno/Any";
import { FontStrikeout as S } from "../../../offapi/com/sun/star/awt/FontStrikeout";
import { SvXMLUnitConverter } from "../core/xmluconv";
import {
  XMLCrossedOutTypePropHdl as Type,
  XMLCrossedOutStylePropHdl as Style,
  XMLCrossedOutWidthPropHdl as Width,
  XMLCrossedOutTextPropHdl as Text,
} from "./cdouthdl";
const converter = new SvXMLUnitConverter("twip");
/** Reads a real short Any without a scalar substitute. @param value - Native owner. @returns Short. */
function number(value: Any): number {
  const result: [number] = [0];
  expect(value.extract(result, "sal_Int16")).toBe(true);
  return result[0];
}
it("preserves source type and width priorities and refuses to clear an existing nonzero style with none", /** Literal witnesses follow the source switches,including unknown but valid short payloads. @returns Nothing. */ () => {
  expect(S).toEqual({ NONE: 0, SINGLE: 1, DOUBLE: 2, DONTKNOW: 3, BOLD: 4, SLASH: 5, X: 6 });
  for (const [handler, token, old, expected] of [
    [new Type(), "none", 1, 1],
    [new Type(), "single", 4, 4],
    [new Type(), "double", 1, 2],
    [new Type(), "double", 4, 2],
    [new Type(), "double", 5, 5],
    [new Type(), "double", 6, 6],
    [new Type(), "double", 2, 2],
    [new Type(), "double", 99, 99],
    [new Type(), "none", 0, 0],
    [new Style(), "none", 4, 4],
    [new Style(), "solid", 2, 2],
    [new Style(), "solid", 0, 1],
    [new Width(), "bold", 1, 4],
    [new Width(), "bold", 2, 2],
    [new Width(), "bold", 5, 5],
    [new Width(), "auto", 4, 4],
    [new Width(), "thin", 0, 0],
  ] as const) {
    const value = new Any();
    try {
      value.insert([old], "sal_Int16");
      expect(handler.importXML(token, value, converter)).toBe(true);
      expect(number(value)).toBe(expected);
    } finally {
      value.dispose();
    }
  }
  for (const token of ["dotted", "dash", "long-dash", "dot-dash", "dot-dot-dash", "wave"]) {
    const value = new Any();
    try {
      expect(new Style().importXML(token, value, converter)).toBe(true);
      expect(number(value)).toBe(1);
    } finally {
      value.dispose();
    }
  }
  for (const [handler, token, expected] of [
    [new Type(), "single", 1],
    [new Type(), "double", 2],
    [new Style(), "none", 0],
    [new Width(), "bold", 4],
    [new Width(), "auto", 0],
    [new Width(), "medium", 0],
    [new Width(), "thick", 0],
  ] as const) {
    const value = new Any();
    try {
      value.insert([true], "bool");
      expect(handler.importXML(token, value, converter)).toBe(true);
      expect(number(value)).toBe(expected);
    } finally {
      value.dispose();
    }
  }
  for (const handler of [new Type(), new Style(), new Width()]) {
    const value = new Any();
    try {
      value.insert([5], "sal_Int16");
      expect(handler.importXML("invalid", value, converter)).toBe(false);
      expect(number(value)).toBe(5);
    } finally {
      value.dispose();
    }
  }
});
it("exports original none/single/double styles and only the native bold width with unchanged failure output", /** Both signed and unsigned actual Any inputs exercise source extraction. @returns Nothing. */ () => {
  for (const [value_, type, style, width, text] of [
    [0, "none", "none", undefined, undefined],
    [1, "single", "solid", undefined, undefined],
    [2, "double", "solid", undefined, undefined],
    [3, undefined, undefined, undefined, undefined],
    [4, "single", "solid", "bold", undefined],
    [5, "single", "solid", undefined, "/"],
    [6, "single", "solid", undefined, "X"],
    [99, undefined, undefined, undefined, undefined],
  ] as const) {
    for (const anyType of ["sal_Int16", "sal_uInt16"] as const) {
      const value = new Any();
      try {
        value.insert([value_], anyType);
        for (const [handler, expected] of [
          [new Type(), type],
          [new Style(), style],
          [new Width(), width],
          [new Text(), text],
        ] as const) {
          const out: [string] = ["retained"];
          expect(handler.exportXML(out, value, converter)).toBe(expected !== undefined);
          expect(out[0]).toBe(expected ?? "retained");
        }
      } finally {
        value.dispose();
      }
    }
  }
  for (const handler of [new Type(), new Style(), new Width(), new Text()]) {
    const value = new Any();
    try {
      for (const wrong of [false, true]) {
        if (wrong) value.insert([true], "bool");
        const out: [string] = ["retained"];
        expect(handler.exportXML(out, value, converter)).toBe(false);
        expect(out[0]).toBe("retained");
      }
    } finally {
      value.dispose();
    }
  }
});
it("uses only the first UTF16 code unit for text markers,including arbitrary nonempty strings", /** Native slash and X precedence overwrites the accumulated property. @returns Nothing. */ () => {
  const handler = new Text();
  for (const [input, expected] of [
    ["/", 5],
    ["/suffix", 5],
    ["X", 6],
    ["x", 6],
    [" ", 6],
    ["😀", 6],
    ["word", 6],
  ] as const) {
    const value = new Any();
    try {
      value.insert([2], "sal_Int16");
      expect(handler.importXML(input, value, converter)).toBe(true);
      expect(number(value)).toBe(expected);
    } finally {
      value.dispose();
    }
  }
  const value = new Any();
  try {
    value.insert([4], "sal_Int16");
    expect(handler.importXML("", value, converter)).toBe(false);
    expect(number(value)).toBe(4);
  } finally {
    value.dispose();
  }
});

it("retains native unsigned candidate comparison and signed short writeback for negative accumulated values", /** Type and width cast through sal_uInt16 before comparison;style keeps the original Any untouched. @returns Nothing. */ () => {
  for (const old of [-1, -32768]) {
    for (const [handler, token, retyped] of [
      [new Type(), "none", true],
      [new Type(), "double", true],
      [new Width(), "auto", true],
      [new Width(), "bold", true],
      [new Style(), "none", false],
    ] as const) {
      const value = new Any();
      try {
        value.insert([old & 0xffff], "sal_uInt16");
        expect(handler.importXML(token, value, converter)).toBe(true);
        expect(number(value)).toBe(old);
        expect(value.getValueTypeClass()).toBe(
          retyped ? TypeClass.SHORT : TypeClass.UNSIGNED_SHORT,
        );
      } finally {
        value.dispose();
      }
    }
  }
});
