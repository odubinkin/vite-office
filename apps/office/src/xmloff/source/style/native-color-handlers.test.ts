/** @fileoverview Original color conversion,transparent property merge and signed nibble error witnesses. */
import { expect, it } from "vitest";
import { Any } from "../../../cppu/inc/com/sun/star/uno/Any";
import { Converter } from "../../../sax/source/tools/converter";
import { convertToHex } from "../../../o3tl/inc/numeric";
import { XMLColorTransparentPropHdl, XMLIsTransparentPropHdl } from "./xmlbahdl";
import { SvXMLUnitConverter } from "../core/xmluconv";
/** Actual owning unit converter. */
const units = new SvXMLUnitConverter("twip");
it("retains original signed32 nibble conversion and shape-only RGB validation", /** Uses source-derived constants,including invalid-digit error propagation. @returns Nothing. */ () => {
  for (const [character, number] of [
    ["0", 0],
    ["9", 9],
    ["a", 10],
    ["f", 15],
    ["A", 10],
    ["F", 15],
    ["/", -1],
    [":", -1],
    ["`", -1],
    ["g", -1],
    ["@", -1],
    ["G", -1],
  ] as const)
    expect(convertToHex(character.charCodeAt(0))).toBe(number);
  expect(convertToHex(65, 98)).toBe(0xab);
  expect(convertToHex(103, 48)).toBe(-16);
  expect(convertToHex(48, 103)).toBe(-1);
  const color: [number] = [123];
  for (const invalid of ["", "1234567", "#123", "#12345678"]) {
    expect(Converter.convertColor(color, invalid)).toBe(false);
    expect(color[0]).toBe(123);
  }
  for (const [xml, value] of [
    ["#aBcDeF", 0xabcdef],
    ["#000000", 0],
    ["#ffffff", 0xffffff],
    ["#gggggg", -1],
    ["#g00000", -1048576],
    ["#00g000", -4096],
    ["#0000g0", -16],
  ] as const) {
    expect(Converter.convertColor(color, xml)).toBe(true);
    expect(color[0]).toBe(value);
  }
  const output: [string] = ["prefix"];
  Converter.convertColor(output, 0x123abc);
  expect(output[0]).toBe("prefix#123abc");
  Converter.convertColor(output, -1);
  expect(output[0]).toBe("prefix#123abc#ffffff");
});
it("preserves original transparent color failed assignments and attribute polarity", /** Uses actual typed Any and source output-buffer merge rules. @returns Nothing. */ () => {
  const value = new Any(),
    color = new XMLColorTransparentPropHdl("font-color"),
    out: [string] = ["old"],
    number: [number] = [99];
  value.insert([123], "sal_Int32");
  expect(color.importXML("font-color", value, units)).toBe(false);
  value.extract(number, "sal_Int32");
  expect(number[0]).toBe(123);
  expect(color.importXML("invalid", value, units)).toBe(false);
  value.extract(number, "sal_Int32");
  expect(number[0]).toBe(0);
  expect(color.importXML("#12aBcD", value, units)).toBe(true);
  expect(color.exportXML(out, value, units)).toBe(true);
  expect(out[0]).toBe("#12abcd");
  out[0] = "font-color";
  expect(color.exportXML(out, value, units)).toBe(false);
  expect(out[0]).toBe("font-color");
  out[0] = "old";
  value.insert([true], "bool");
  expect(color.exportXML(out, value, units)).toBe(false);
  expect(out[0]).toBe("old");
  const fallback = new XMLColorTransparentPropHdl();
  expect(fallback.importXML("transparent", value, units)).toBe(false);
  value.insert([1], "sal_Int32");
  out[0] = "old";
  expect(fallback.exportXML(out, value, units)).toBe(true);
  expect(out[0]).toBe("#000001");
  for (const [token, polarity] of [
    ["font-color", false],
    [null, true],
  ] as const) {
    const handler = new XMLIsTransparentPropHdl(token, polarity),
      transparent = token ?? "transparent",
      boolean: [boolean] = [false];
    for (const xml of [transparent, "#123456", "invalid"]) {
      expect(handler.importXML(xml, value, units)).toBe(true);
      expect(value.extract(boolean, "bool")).toBe(true);
      expect(boolean[0]).toBe((xml === transparent) === polarity);
      out[0] = "old";
      expect(handler.exportXML(out, value, units)).toBe(xml === transparent);
      expect(out[0]).toBe(xml === transparent ? transparent : "old");
    }
  }
  const nativeDefault = new XMLIsTransparentPropHdl(),
    defaultBool: [boolean] = [false];
  expect(nativeDefault.importXML("transparent", value, units)).toBe(true);
  expect(value.extract(defaultBool, "bool")).toBe(true);
  expect(defaultBool[0]).toBe(true);
  out[0] = "old";
  expect(nativeDefault.exportXML(out, value, units)).toBe(true);
  expect(out[0]).toBe("transparent");
  value.dispose();
});
