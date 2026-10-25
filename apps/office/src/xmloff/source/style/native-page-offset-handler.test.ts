/** @fileoverview Pins native XMLNumberWithAutoForVoidPropHdl lexical conversion,signed16 saturation and void export. */
import { expect, it } from "vitest";
import { Any } from "../../../cppu/inc/com/sun/star/uno/Any";
import { XMLNumberWithAutoForVoidPropHdl } from "./xmlbahdl";
import { SvXMLUnitConverter } from "../core/xmluconv";
it("uses native SAX number syntax and signed16 saturation,leaving failed imports unchanged", /** Deliberate large-input saturation differs from modulo wrapping. @returns Nothing. */ () => {
  const handler = new XMLNumberWithAutoForVoidPropHdl(),
    converter = new SvXMLUnitConverter("twip");
  for (const [input, expected] of [
    ["0", 0],
    ["32767", 32767],
    ["32768", 32767],
    ["65535", 32767],
    ["-1", -1],
    ["-32768", -32768],
    ["-32769", -32768],
    [" 12", 12],
    ["2147483648", 32767],
    ["", 0],
    ["-", 0],
  ] as const) {
    const value = new Any();
    expect(handler.importXML(input, value, converter)).toBe(true);
    const number: [number] = [0];
    expect(value.extract(number, "sal_Int16")).toBe(true);
    expect(number[0]).toBe(expected);
    const output: [string] = [""];
    expect(handler.exportXML(output, value, converter)).toBe(true);
    expect(output[0]).toBe(String(expected));
  }
  for (const input of ["bad", "1.5", "AUTO", " auto ", "+12", "12 "]) {
    const value = new Any([7], "sal_Int16");
    expect(handler.importXML(input, value, converter)).toBe(false);
    const number: [number] = [0];
    expect(value.extract(number, "sal_Int16")).toBe(true);
    expect(number[0]).toBe(7);
  }
  const value = new Any([3], "sal_Int16");
  expect(handler.importXML("auto", value, converter)).toBe(true);
  expect(value.hasValue()).toBe(false);
  const output: [string] = [""];
  expect(handler.exportXML(output, value, converter)).toBe(true);
  expect(output[0]).toBe("auto");
  expect(handler.exportXML(output, new Any([false], "bool"), converter)).toBe(true);
  expect(output[0]).toBe("auto");
});
