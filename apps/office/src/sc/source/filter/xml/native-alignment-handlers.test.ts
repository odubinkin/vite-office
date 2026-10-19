/** @fileoverview Original Calc XML alignment handlers over typed native UNO Any values,including merge and failure semantics. */
import { expect, it } from "vitest";
import { Any } from "../../../../cppu/inc/com/sun/star/uno/Any";
import {
  CellHoriJustify as H,
  cppu_detail_getUnoType_CellHoriJustify as type,
} from "../../../../offapi/com/sun/star/table/CellHoriJustify";
import { SvXMLUnitConverter } from "../../../../xmloff/source/core/xmluconv";
import {
  XmlScPropHdl_HoriJustify,
  XmlScPropHdl_HoriJustifySource,
  XmlScPropHdl_HoriJustifyRepeat,
  XmlScPropHdl_VertJustify,
} from "./xmlstyle";
const converter = new SvXMLUnitConverter("twip");
it("retains original typed horizontal lexical values,REPEAT precedence and failed destinations", /** Uses actual generated enum Type and Any. @returns Nothing. */ () => {
  const handler = new XmlScPropHdl_HoriJustify(),
    value = new Any(),
    other = new Any(),
    wrong = new Any([3], "sal_Int32"),
    output: [string] = ["unchanged"];
  try {
    expect(handler.exportXML(output, value, converter)).toBe(false);
    expect(output[0]).toBe("unchanged");
    expect(handler.importXML("left", value, converter)).toBe(false);
    expect(handler.importXML("start", value, converter)).toBe(true);
    for (const [xml, enumValue] of [
      ["start", H.LEFT],
      ["end", H.RIGHT],
      ["center", H.CENTER],
      ["justify", H.BLOCK],
    ] as const) {
      expect(handler.importXML(xml, value, converter)).toBe(true);
      other.insert([enumValue], type);
      expect(handler.equals(value, other)).toBe(true);
      expect(handler.exportXML(output, value, converter)).toBe(true);
      expect(output[0]).toBe(xml);
    }
    value.insert([H.REPEAT], type);
    expect(handler.importXML("invalid", value, converter)).toBe(true);
    expect(handler.importXML("end", value, converter)).toBe(true);
    other.insert([H.REPEAT], type);
    expect(handler.equals(value, other)).toBe(true);
    expect(handler.exportXML(output, value, converter)).toBe(true);
    expect(output[0]).toBe("start");
    for (const enumValue of [H.STANDARD, 999]) {
      value.insert([enumValue], type);
      output[0] = "untouched";
      expect(handler.exportXML(output, value, converter)).toBe(false);
      expect(output[0]).toBe("untouched");
    }
    expect(handler.equals(value, other)).toBe(false);
    expect(handler.equals(wrong, other)).toBe(false);
    expect(handler.equals(value, wrong)).toBe(false);
  } finally {
    value.dispose();
    other.dispose();
    wrong.dispose();
  }
});
it("preserves source fix/false no-write success and actual source/repeat property types", /** Checks void Any and merged enum data. @returns Nothing. */ () => {
  const source = new XmlScPropHdl_HoriJustifySource(),
    repeat = new XmlScPropHdl_HoriJustifyRepeat(),
    value = new Any(),
    other = new Any(),
    output: [string] = ["unchanged"];
  try {
    for (const handler of [source, repeat]) {
      expect(handler.exportXML(output, value, converter)).toBe(false);
      expect(output[0]).toBe("unchanged");
      expect(handler.importXML("invalid", value, converter)).toBe(false);
    }
    expect(source.importXML("fix", value, converter)).toBe(true);
    expect(repeat.importXML("false", value, converter)).toBe(true);
    expect(value.hasValue()).toBe(false);
    expect(source.importXML("value-type", value, converter)).toBe(true);
    other.insert([H.STANDARD], type);
    expect(source.equals(value, other)).toBe(true);
    expect(source.exportXML(output, value, converter)).toBe(true);
    expect(output[0]).toBe("value-type");
    expect(repeat.exportXML(output, value, converter)).toBe(true);
    expect(output[0]).toBe("false");
    expect(repeat.importXML("true", value, converter)).toBe(true);
    other.insert([H.REPEAT], type);
    expect(repeat.equals(value, other)).toBe(true);
    expect(repeat.exportXML(output, value, converter)).toBe(true);
    expect(output[0]).toBe("true");
    expect(source.exportXML(output, value, converter)).toBe(true);
    expect(output[0]).toBe("fix");
    expect(source.importXML("fix", value, converter)).toBe(true);
    expect(repeat.importXML("false", value, converter)).toBe(true);
    expect(source.equals(value, other)).toBe(true);
    expect(source.importXML("value-type", value, converter)).toBe(true);
    expect(repeat.equals(value, other)).toBe(false);
  } finally {
    value.dispose();
    other.dispose();
  }
});
it("uses signed32 vertical properties with exact native lexical spellings and failures", /** Exercises all original switch branches. @returns Nothing. */ () => {
  const handler = new XmlScPropHdl_VertJustify(),
    value = new Any(),
    other = new Any(),
    wrong = new Any([2], "sal_Int16"),
    output: [string] = ["unchanged"];
  try {
    expect(handler.exportXML(output, value, converter)).toBe(false);
    expect(handler.importXML("center", value, converter)).toBe(false);
    expect(output[0]).toBe("unchanged");
    for (const [xml, number] of [
      ["automatic", 0],
      ["top", 1],
      ["middle", 2],
      ["bottom", 3],
      ["justify", 4],
    ] as const) {
      expect(handler.importXML(xml, value, converter)).toBe(true);
      other.insert([number], "sal_Int32");
      expect(handler.equals(value, other)).toBe(true);
      expect(handler.exportXML(output, value, converter)).toBe(true);
      expect(output[0]).toBe(xml);
    }
    expect(handler.equals(wrong, value)).toBe(false);
    expect(handler.equals(value, wrong)).toBe(false);
    value.insert([999], "sal_Int32");
    expect(handler.equals(value, other)).toBe(false);
    output[0] = "untouched";
    expect(handler.exportXML(output, value, converter)).toBe(false);
    expect(output[0]).toBe("untouched");
  } finally {
    value.dispose();
    other.dispose();
    wrong.dispose();
  }
});
