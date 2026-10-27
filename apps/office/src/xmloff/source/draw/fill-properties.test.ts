/** @fileoverview Checks source fill enum/RGB/negative-percent conversion boundaries. */
import { expect, it } from "vitest";
import { FastAttributeList } from "../core/xmlimp";
import { ODF_NAMESPACES } from "../core/xmltoken";
import { importFillProperties, exportFillProperties } from "./fill-properties";
/** Builds actual SAX drawing attributes. @param values - Namespace-local attribute pairs. @returns Tokenized source attributes. */
function attributes(values: Record<string, string>): FastAttributeList {
  return new FastAttributeList(
    Object.entries(values).map(
      /** Preserves actual namespace identity. @param entry - Local name/value. @returns SAX attribute. */
      ([local, value]) => ({
        name: `draw:${local}`,
        prefix: "draw",
        local,
        uri: ODF_NAMESPACES.draw,
        value,
      }),
    ),
  );
}
it("retains exact source fill enum tokens and failed handler omission", /** Covers every source enum and native case-sensitive comparison. @returns Nothing. */ () => {
  for (const [name, value] of [
    ["none", 0],
    ["solid", 1],
    ["bitmap", 4],
    ["gradient", 2],
    ["hatch", 3],
  ] as const) {
    expect(importFillProperties(attributes({ fill: name }))).toEqual({ fillStyle: value });
    expect(exportFillProperties({ fillStyle: value })).toEqual([`draw:fill="${name}"`]);
  }
  expect(
    importFillProperties(attributes({ fill: "SOLID", "fill-color": "invalid", opacity: "101%" })),
  ).toEqual({});
  expect(importFillProperties(attributes({ opacity: "-1%" }))).toEqual({});
  expect(exportFillProperties({ fillStyle: 123456 })).toEqual([]);
});
it("uses native RGB conversion and negative percentage polarity at inclusive bounds", /** Covers real SAX conversion, not a second color/percentage grammar. @returns Nothing. */ () => {
  expect(importFillProperties(attributes({ "fill-color": "#aBcDef", opacity: "63%" }))).toEqual({
    fillColor: 0xabcdef,
    fillTransparency: 37,
  });
  expect(importFillProperties(attributes({ opacity: "0%" }))).toEqual({ fillTransparency: 100 });
  expect(importFillProperties(attributes({ opacity: "100%" }))).toEqual({ fillTransparency: 0 });
  expect(exportFillProperties({ fillColor: 0xabcdef, fillTransparency: 37 })).toEqual([
    'draw:fill-color="#abcdef"',
    'draw:opacity="63%"',
  ]);
});
