/** @fileoverview Native named-bool and cppu::any2bool contracts, including numeric fallback, unchanged invalid imports and actual generated exception defaults. */
import { expect, it } from "vitest";
import { XMLNamedBoolPropertyHdl } from "./NamedBoolPropertyHdl";
import { Any } from "../../../cppu/inc/com/sun/star/uno/Any";
import { IllegalArgumentException } from "../../../cppu/inc/com/sun/star/lang/IllegalArgumentException";
import { SvXMLUnitConverter } from "../core/xmluconv";

it("retains exact named bool import and failure-side Any state", /** Uses actual typed Any values. @returns Nothing. */ () => {
  const handler = new XMLNamedBoolPropertyHdl("skip-white-space", "continuous"),
    value = new Any([7], "sal_Int32"),
    converter = new SvXMLUnitConverter("twip");
  try {
    expect(handler.importXML("invalid", value, converter)).toBe(false);
    const integer: [number] = [0];
    expect(value.extract(integer, "sal_Int32")).toBe(true);
    expect(integer[0]).toBe(7);
    const boolean: [boolean] = [false];
    expect(handler.importXML("skip-white-space", value, converter)).toBe(true);
    expect(value.extract(boolean, "bool")).toBe(true);
    expect(boolean[0]).toBe(true);
    expect(handler.importXML("continuous", value, converter)).toBe(true);
    value.extract(boolean, "bool");
    expect(boolean[0]).toBe(false);
    expect(handler.importXML("CONTINUOUS", value, converter)).toBe(false);
    value.extract(boolean, "bool");
    expect(boolean[0]).toBe(false);
  } finally {
    value.dispose();
  }
});

it("exports bool or signed32-compatible numeric values and throws the native default exception otherwise", /** Pins original any2bool behavior rather than coercing JavaScript truthiness. @returns Nothing. */ () => {
  const handler = new XMLNamedBoolPropertyHdl("yes", "no"),
    converter = new SvXMLUnitConverter("twip"),
    output: [string] = ["unchanged"];
  for (const [value, expected] of [
    [new Any([true], "bool"), "yes"],
    [new Any([false], "bool"), "no"],
    [new Any([-1], "sal_Int32"), "yes"],
    [new Any([0], "sal_Int16"), "no"],
  ] as const) {
    try {
      expect(handler.exportXML(output, value, converter)).toBe(true);
      expect(output[0]).toBe(expected);
    } finally {
      value.dispose();
    }
  }
  const value = new Any();
  let caught: unknown;
  output[0] = "untouched";
  try {
    handler.exportXML(output, value, converter);
  } catch (error) {
    caught = error;
  } finally {
    value.dispose();
  }
  expect(caught).toBeInstanceOf(IllegalArgumentException);
  expect((caught as IllegalArgumentException).ArgumentPosition).toBe(0);
  expect(output[0]).toBe("untouched");
});
