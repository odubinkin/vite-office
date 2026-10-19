/** @fileoverview Native scalar property-map transport preserves independent scripts and source merge/failure behavior. */
import { expect, it } from "vitest";
import { FastAttributeList } from "../core/xmlimp";
import { ODF_NAMESPACES } from "../core/xmltoken";
import {
  exportTextCharacterProperties,
  importTextCharacterProperties,
  textCharacterPropertyTokens,
} from "./txtprmap";
/** Creates actual namespace-resolved attributes in supplied source order. @param pairs - Ordered lexical properties. @returns Tokenized SAX attributes. */
function attributes(pairs: readonly (readonly [string, string])[]): FastAttributeList {
  return new FastAttributeList(
    pairs.map(
      /** Resolves the source QName. @param pair - QName and value. @returns SAX attribute. */ ([
        name,
        value,
      ]) => {
        const [prefix, local] = name.split(":") as ["style" | "fo", string];
        return { name, value, prefix, local, uri: ODF_NAMESPACES[prefix] };
      },
    ),
  );
}
it("transports all native independent script values without boolean normalization", /** Covers source maps,invalid conversion and original color filters. @returns Nothing. */ () => {
  const source = attributes([
    ["fo:font-weight", "600"],
    ["style:font-weight-asian", "normal"],
    ["style:font-weight-complex", "900"],
    ["fo:font-style", "oblique"],
    ["style:font-style-asian", "normal"],
    ["style:font-style-complex", "italic"],
    ["style:text-underline-style", "wave"],
    ["style:text-underline-type", "double"],
    ["style:text-underline-width", "bold"],
    ["style:text-underline-color", "#123aBc"],
  ]);
  const values = importTextCharacterProperties(source);
  expect(values).toEqual({
    fontWeight: 110,
    fontWeightAsian: 100,
    fontWeightComplex: 200,
    fontPosture: 1,
    fontPostureAsian: 0,
    fontPostureComplex: 2,
    underlineStyle: 11,
    underlineColor: 0x123abc,
    underlineHasColor: true,
  });
  const xml = exportTextCharacterProperties(values);
  expect(xml).toContain('fo:font-weight="600"');
  expect(xml).toContain('style:font-weight-asian="normal"');
  expect(xml).toContain('style:font-weight-complex="900"');
  expect(xml).toContain('fo:font-style="oblique"');
  expect(xml).toContain('style:font-style-asian="normal"');
  expect(xml).toContain('style:font-style-complex="italic"');
  expect(xml).toContain('style:text-underline-style="wave"');
  expect(xml).toContain('style:text-underline-type="double"');
  expect(xml).toContain('style:text-underline-color="#123abc"');
  expect(exportTextCharacterProperties({})).toBe("");
  expect(exportTextCharacterProperties({ fontPosture: 3 })).toBe("");
  expect(
    importTextCharacterProperties(
      attributes([
        ["fo:font-weight", "heavy"],
        ["style:text-underline-style", "invalid"],
        ["fo:font-style", "bad"],
      ]),
    ),
  ).toEqual({});
  expect(
    importTextCharacterProperties(attributes([["style:text-underline-color", "font-color"]])),
  ).toEqual({ underlineHasColor: false });
  expect(
    importTextCharacterProperties(attributes([["style:text-underline-color", "bad"]])),
  ).toEqual({ underlineHasColor: true });
  expect(
    importTextCharacterProperties(attributes([["style:text-underline-color", "#gggggg"]])),
  ).toEqual({ underlineColor: -1, underlineHasColor: true });
  expect(
    exportTextCharacterProperties({
      underlineStyle: 1,
      underlineHasColor: false,
      underlineColor: 0x123456,
    }),
  ).toContain('style:text-underline-color="font-color"');
  expect(exportTextCharacterProperties({ underlineStyle: 1 })).toBe(
    ' style:text-underline-style="solid" style:text-underline-width="auto"',
  );
  expect(
    exportTextCharacterProperties({
      underlineStyle: 1,
      underlineHasColor: true,
      underlineColor: 0x123456,
    }),
  ).toContain("#123456");
  expect(
    exportTextCharacterProperties({
      underlineStyle: 0,
      underlineHasColor: true,
      underlineColor: 0x123456,
    }),
  ).not.toContain("text-underline-color");
  expect(exportTextCharacterProperties({ underlineStyle: 19 })).toBe("");
  expect(importTextCharacterProperties(attributes([["fo:font-size", "12pt"]]))).toEqual({});
  expect(textCharacterPropertyTokens).toHaveLength(10);
});
