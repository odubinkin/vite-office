/** @fileoverview Original XMLMeasurePropHdl signed scalar saturation,failed Any assignment and typed extraction. */
import { expect, it } from "vitest";
import { Any } from "../../../cppu/inc/com/sun/star/uno/Any";
import { SvXMLUnitConverter } from "../core/xmluconv";
import { XMLMeasurePropHdl } from "./xmlbahdl";
it("uses native byte widths and saturates actual typed values while assigning zero on failed conversion", /** Actual converter and Any. @returns Nothing. */ () => {
  const converter = new SvXMLUnitConverter("mm100");
  for (const [bytes, type, limit] of [
    [1, "sal_Int8", 127],
    [2, "sal_Int16", 32767],
    [4, "sal_Int32", 2147483647],
  ] as const) {
    const handler = new XMLMeasurePropHdl(bytes),
      value = new Any(),
      number: [number] = [42],
      output: [string] = ["unchanged"];
    try {
      expect(handler.exportXML(output, value, converter)).toBe(false);
      expect(output[0]).toBe("unchanged");
      expect(handler.importXML("100000000cm", value, converter)).toBe(true);
      expect(value.extract(number, type)).toBe(true);
      expect(number[0]).toBe(limit);
      expect(handler.importXML("-100000000cm", value, converter)).toBe(true);
      value.extract(number, type);
      expect(number[0]).toBe(-limit - 1);
      expect(handler.exportXML(output, value, converter)).toBe(true);
      expect(handler.importXML("bogus", value, converter)).toBe(false);
      expect(value.extract(number, type)).toBe(true);
      expect(number[0]).toBe(0);
    } finally {
      value.dispose();
    }
  }
});
