/** @fileoverview Literal original percent, ASCII token and signed narrowing contracts for merged native text-position XML. */
import { expect, it } from "vitest";
import { Any } from "../../../cppu/inc/com/sun/star/uno/Any";
import { Converter } from "../../../sax/source/tools/converter";
import { XMLEscapementPropHdl, XMLEscapementHeightPropHdl } from "./escphdl";
import { SvXMLUnitConverter } from "../core/xmluconv";
import { FastAttributeList } from "../core/xmlimp";
import { ODF_NAMESPACES } from "../core/xmltoken";
import { exportTextCharacterProperties, importTextCharacterProperties } from "../text/txtprmap";
const converter = new SvXMLUnitConverter("twip"),
  offset = new XMLEscapementPropHdl(),
  height = new XMLEscapementHeightPropHdl();
it.each([
  ["super", 14000, 58],
  ["sub", -14000, 58],
  ["0%", 0, 100],
  ["33%", 33, 58],
  ["33% 75%", 33, 75],
  ["-8% 83% extra", -8, 83],
  ["super  75%", 14000, 0],
  ["", 0, 100],
  [" ", 0, 0],
  ["super ", 14000, 0],
  ["32768% 255%", -32768, -1],
  ["70000% 256%", 4464, 0],
  ["small-caps", undefined, undefined],
  ["garbage", undefined, 58],
  ["+1%", undefined, 58],
  ["%garbage", 0, 100],
  ["super bogus", 14000, undefined],
])(
  "preserves source text-position input %j",
  /** Both independent handlers consume the same original attribute. @param input - XML string. @param esc - Expected signed16. @param prop - Expected signed8. @returns Nothing. */ (
    input,
    esc,
    prop,
  ) => {
    const value = new Any(),
      scalar: [number] = [91];
    try {
      value.insert([91], "sal_Int16");
      expect(offset.importXML(input as string, value, converter)).toBe(esc !== undefined);
      value.extract(scalar, "sal_Int16");
      expect(scalar[0]).toBe(esc ?? 91);
      value.insert([91], "sal_Int8");
      expect(height.importXML(input as string, value, converter)).toBe(prop !== undefined);
      value.extract(scalar, "sal_Int8");
      expect(scalar[0]).toBe(prop ?? 91);
    } finally {
      value.dispose();
    }
  },
);
it.each([
  ["", 0],
  ["-", 0],
  [".5%", 1],
  ["-.5%", -1],
  ["12.49%", 12],
  ["12.5%", 13],
  ["-12.5%", -13],
  ["%tail", 0],
  ["1%tail", 1],
  ["2147483648%", 2147483647],
  ["-2147483649%", -2147483648],
  ["\t2 %tail", 2],
])(
  "retains native percent parse %j",
  /** Source measure parsing allows no digits and any percent tail. @param input - Original view. @param expected - Source integer. @returns Nothing. */ (
    input,
    expected,
  ) => {
    const value: [number] = [99];
    expect(Converter.convertPercent(value, input as string)).toBe(true);
    expect(value[0]).toBe(expected);
    const buffer: [string] = ["prefix:"];
    Converter.convertPercent(buffer, value[0]);
    expect(buffer[0]).toBe(`prefix:${expected}%`);
  },
);
it.each(["+2%", "2pt", "\u00a02%", "word"])(
  "keeps failed percent output for %s",
  /** Original UTF16 whitespace excludes non-ASCII and failures retain destination. @param input - Source view. @returns Nothing. */ (
    input,
  ) => {
    const value: [number] = [99];
    expect(Converter.convertPercent(value, input)).toBe(false);
    expect(value[0]).toBe(99);
  },
);
it("merges signed offset/height output and preserves original failed-extraction asymmetry", /** No generic formatter replaces original handler contracts. @returns Nothing. */ () => {
  const value = new Any(),
    output: [string] = ["stale"];
  try {
    value.insert([true], "bool");
    expect(offset.exportXML(output, value, converter)).toBe(false);
    expect(output[0]).toBe("");
    output[0] = "super";
    expect(height.exportXML(output, value, converter)).toBe(true);
    expect(output[0]).toBe("super");
    output[0] = "";
    expect(height.exportXML(output, value, converter)).toBe(false);
    for (const [esc, text] of [
      [14000, "super"],
      [-14000, "sub"],
      [33, "33%"],
      [0, "0%"],
    ] as const) {
      value.insert([esc], "sal_Int16");
      expect(offset.exportXML(output, value, converter)).toBe(true);
      expect(output[0]).toBe(text);
      value.insert([58], "sal_Int8");
      expect(height.exportXML(output, value, converter)).toBe(true);
      expect(output[0]).toBe(`${text} 58%`);
    }
  } finally {
    value.dispose();
  }
});
it("passes actual SAX text-position through independent merged properties", /** Native map uses the original token and handoff fields. @returns Nothing. */ () => {
  const attributes = new FastAttributeList([
    {
      name: "style:text-position",
      prefix: "style",
      local: "text-position",
      uri: ODF_NAMESPACES.style,
      value: "sub 75%",
    },
  ]);
  expect(importTextCharacterProperties(attributes)).toEqual({
    escapement: -14000,
    escapementHeight: 75,
  });
  expect(exportTextCharacterProperties({ escapement: -14000, escapementHeight: 75 })).toBe(
    ' style:text-position="sub 75%"',
  );
  expect(exportTextCharacterProperties({ escapementHeight: 255 })).toBe(
    ' style:text-position="-1%"',
  );
  expect(exportTextCharacterProperties({ escapement: 33 })).toBe(' style:text-position="33%"');
});

it.each([
  ["garbage 75%", { escapementHeight: 75 }],
  ["33% garbage", { escapement: 33 }],
])(
  "preserves independent failed SAX member %s",
  /** The original pair does not reject a valid independent property when its sibling fails. @param text - Native XML view. @param expected - Accepted handler values. @returns Nothing. */ (
    text,
    expected,
  ) => {
    const attrs = new FastAttributeList([
      {
        name: "style:text-position",
        prefix: "style",
        local: "text-position",
        uri: ODF_NAMESPACES.style,
        value: text as string,
      },
    ]);
    expect(importTextCharacterProperties(attrs)).toEqual(expected);
  },
);
