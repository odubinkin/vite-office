/** @fileoverview Source font-color multi-property conversion over genuine UNO Any values. */
import { expect, it } from "vitest";
import { XMLColorAutoPropHdl, XMLIsAutoColorPropHdl } from "./xmlbahdl";
import { Any } from "../../../cppu/inc/com/sun/star/uno/Any";
import { SvXMLUnitConverter } from "../core/xmluconv";
it("retains source AUTO precedence and suppresses only its RGB output", /** Checks real Any values and literal XML. @returns Nothing. */ () => {
  const color = new XMLColorAutoPropHdl(),
    auto = new XMLIsAutoColorPropHdl(),
    unit = new SvXMLUnitConverter("twip"),
    value = new Any(),
    output: [string] = ["prior"],
    number: [number] = [0];
  try {
    expect(color.exportXML(output, value, unit)).toBe(false);
    expect(output[0]).toBe("prior");
    expect(color.importXML("#123456", value, unit)).toBe(true);
    expect(value.extract(number, "sal_Int32")).toBe(true);
    expect(number[0]).toBe(0x123456);
    expect(color.exportXML(output, value, unit)).toBe(true);
    expect(output[0]).toBe("#123456");
    expect(color.importXML("red", value, unit)).toBe(false);
    value.extract(number, "sal_Int32");
    expect(number[0]).toBe(0x123456);
    expect(auto.importXML("true", value, unit)).toBe(true);
    expect(color.importXML("#abcdef", value, unit)).toBe(false);
    value.extract(number, "sal_Int32");
    expect(number[0]).toBe(-1);
    output[0] = "prior";
    expect(color.exportXML(output, value, unit)).toBe(false);
    expect(output[0]).toBe("prior");
    expect(auto.exportXML(output, value, unit)).toBe(true);
    expect(output[0]).toBe("true");
    expect(auto.importXML("false", value, unit)).toBe(true);
    expect(auto.importXML("malformed", value, unit)).toBe(true);
    value.extract(number, "sal_Int32");
    expect(number[0]).toBe(-1);
  } finally {
    value.dispose();
  }
});
it("does not invent RGB or AUTO values for false or invalid flags", /** Checks the original always-true bool handler and unchanged void Any. @returns Nothing. */ () => {
  const handler = new XMLIsAutoColorPropHdl(),
    unit = new SvXMLUnitConverter("twip"),
    value = new Any(),
    output: [string] = ["prior"];
  try {
    expect(handler.exportXML(output, value, unit)).toBe(false);
    expect(handler.importXML("false", value, unit)).toBe(true);
    expect(value.hasValue()).toBe(false);
    expect(handler.importXML("1", value, unit)).toBe(true);
    expect(value.hasValue()).toBe(false);
    value.insert([0xabcdef], "sal_Int32");
    expect(handler.exportXML(output, value, unit)).toBe(false);
    expect(output[0]).toBe("prior");
  } finally {
    value.dispose();
  }
});
