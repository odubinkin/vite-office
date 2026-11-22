/** @fileoverview Native scalar property-map transport preserves independent scripts and source merge/failure behavior. */
import { expect, it } from "vitest";
import { FastAttributeList, isOpenOffice2Generator } from "../core/xmlimp";
import { getBuildIdFromGenerator } from "../meta/xmlmetai";
import * as CaseMap from "../../../offapi/com/sun/star/style/CaseMap";
import { ODF_NAMESPACES, XMLToken } from "../core/xmltoken";
import { Any } from "../../../cppu/inc/com/sun/star/uno/Any";
import { SvXMLUnitConverter } from "../core/xmluconv";
import { XMLKerningPropHdl } from "../style/kernihdl";
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
        const [prefix, local] = name.split(":") as ["style" | "fo" | "text", string];
        return { name, value, prefix, local, uri: ODF_NAMESPACES[prefix] };
      },
    ),
  );
}

it("uses the native case-map tables and character flag polarity", /** Checks exact token conversion in both directions. @returns Nothing. */ () => {
  for (const [name, token, value] of [
    ["fo:text-transform", "none", CaseMap.NONE],
    ["fo:text-transform", "uppercase", CaseMap.UPPERCASE],
    ["fo:text-transform", "lowercase", CaseMap.LOWERCASE],
    ["fo:text-transform", "capitalize", CaseMap.TITLE],
    ["fo:font-variant", "small-caps", CaseMap.SMALLCAPS],
    ["fo:font-variant", "normal", CaseMap.NONE],
  ] as const) {
    expect(importTextCharacterProperties(attributes([[name, token]]))).toEqual({
      caseMap: value,
    });
    expect(exportTextCharacterProperties({ caseMap: value })).toContain(`${name}="${token}"`);
  }
  const flags = attributes([
    ["style:text-blinking", "true"],
    ["text:display", "none"],
    ["fo:hyphenate", "false"],
  ]);
  expect(importTextCharacterProperties(flags)).toEqual({
    flashing: true,
    hidden: true,
    noHyphenation: true,
  });
  expect(importTextCharacterProperties(flags, { paragraphStyle: true, isOOo2x: true })).toEqual({
    flashing: true,
    hidden: false,
  });
  expect(
    exportTextCharacterProperties({ flashing: false, hidden: false, noHyphenation: false }),
  ).toBe(' style:text-blinking="false" text:display="true" fo:hyphenate="true"');
  expect(exportTextCharacterProperties({ noHyphenation: true }, true)).toBe("");
  expect(exportTextCharacterProperties({ caseMap: CaseMap.UPPERCASE })).toBe(
    ' fo:text-transform="uppercase"',
  );
  expect(
    importTextCharacterProperties(
      attributes([
        ["fo:text-transform", "normal"],
        ["fo:font-variant", "uppercase"],
        ["style:text-blinking", "1"],
        ["text:display", "false"],
        ["fo:hyphenate", "0"],
      ]),
      { isOOo2x: true },
    ),
  ).toEqual({});
});

it("identifies the native OpenOffice.org 2.x BuildId including the NeoOffice alias", /** Covers generator string extraction and LibreOffice classification precedence. @returns Nothing. */ () => {
  for (const [generator, id, legacy] of [
    ["OpenOffice.org/2.4 Win32 OpenOffice.org_project/680m12$Build-9286", "680$9286", true],
    ["NeoOffice/2.2", "680$9134", true],
    ["OpenOffice.org 1.1", "645$8687", false],
    ["LibreOffice/3.3$Win32 LibreOffice_project/680m12$Build-9286", "680$9286;3.3", false],
    ["LibreOffice/26.8.0.2 LibreOffice_project/42", ";26.8.0.2", false],
    [" OpenOffice.org 1.1", "", false],
  ] as const) {
    expect(getBuildIdFromGenerator(generator)).toBe(id);
    expect(isOpenOffice2Generator(id)).toBe(legacy);
  }
});
it("normalizes native rotation angles and preserves the original typography token rules", /** Checks native boundaries and typed XML export against the original handlers. @returns Nothing. */ () => {
  for (const [input, expected] of [
    ["44", 0],
    ["45", 900],
    ["179", 900],
    ["180", 2700],
    ["315", 2700],
    ["316", 0],
    ["-90", 2700],
  ] as const)
    expect(
      importTextCharacterProperties(attributes([["style:text-rotation-angle", input]])),
    ).toEqual({ rotation: expected });
  expect(
    importTextCharacterProperties(
      attributes([
        ["style:text-emphasize", "below disc"],
        ["style:text-scale", "45000%"],
        ["style:text-rotation-scale", "fixed"],
        ["style:text-combine", "lines"],
        ["style:text-combine-start-char", "😀"],
      ]),
    ),
  ).toEqual({
    emphasis: 13,
    scaleWidth: 32767,
    rotationFitsLine: true,
    combineLines: true,
    combinePrefix: "\ud83d",
  });
  expect(
    importTextCharacterProperties(
      attributes([
        ["style:text-emphasize", "dot  above"],
        ["style:text-combine", "letters"],
      ]),
    ),
  ).toEqual({});
  const output = exportTextCharacterProperties({
    rotation: 2700,
    rotationFitsLine: false,
    emphasis: 13,
    scaleWidth: 900,
    combineLines: false,
    combinePrefix: "",
    combineSuffix: '"',
  });
  expect(output).toContain('style:text-rotation-angle="270"');
  expect(output).toContain('style:text-rotation-scale="line-height"');
  expect(output).toContain('style:text-emphasize="disc below"');
  expect(output).toContain('style:text-scale="900%"');
  expect(output).toContain('style:text-combine="none"');
  expect(output).toContain('style:text-combine-end-char="&quot;"');
  expect(output).not.toContain("style:text-combine-start-char");
  expect(exportTextCharacterProperties({ combinePrefix: "\t" })).toContain(
    'style:text-combine-start-char="&#9;"',
  );
});
it("preserves native line-mode merge order, named-token rejection and typed kerning bool transport", /** Checks the shared bool property map used by primary Writer storage. @returns Nothing. */ () => {
  expect(
    importTextCharacterProperties(
      attributes([
        ["style:text-underline-mode", "skip-white-space"],
        ["style:text-line-through-mode", "continuous"],
        ["style:text-overline-mode", "invalid"],
        ["style:letter-kerning", "true"],
      ]),
    ),
  ).toEqual({ wordMode: false, autoKerning: true });
  expect(
    importTextCharacterProperties(
      attributes([
        ["style:text-underline-mode", "invalid"],
        ["style:letter-kerning", "invalid"],
      ]),
    ),
  ).toEqual({});
  const xml = exportTextCharacterProperties({ wordMode: false, autoKerning: false });
  expect(xml).toContain('style:text-underline-mode="continuous"');
  expect(xml).toContain('style:text-overline-mode="continuous"');
  expect(xml).toContain('style:text-line-through-mode="continuous"');
  expect(xml).toContain('style:letter-kerning="false"');
});
it("uses the original normal keyword and signed measure for character spacing", /** Pins the source UNO short and conversion failure behavior. @returns Nothing. */ () => {
  expect(importTextCharacterProperties(attributes([["fo:letter-spacing", "normal"]]))).toEqual({
    kerning: 0,
  });
  expect(importTextCharacterProperties(attributes([["fo:letter-spacing", "-0.035cm"]]))).toEqual({
    kerning: -35,
  });
  expect(importTextCharacterProperties(attributes([["fo:letter-spacing", "invalid"]]))).toEqual({});
  expect(exportTextCharacterProperties({ kerning: 0 })).toContain('fo:letter-spacing="normal"');
  expect(exportTextCharacterProperties({ kerning: -35 })).toContain('fo:letter-spacing="-0.035cm"');
  const value = new Any(true);
  const converter = new SvXMLUnitConverter("mm100");
  const handler = new XMLKerningPropHdl();
  try {
    const result: [string] = ["retained"];
    expect(handler.exportXML(result, value, converter)).toBe(false);
    expect(result[0]).toBe("retained");
    expect(handler.importXML("invalid", value, converter)).toBe(false);
    const spacing: [number] = [-1];
    expect(value.extract(spacing, "sal_Int16")).toBe(true);
    expect(spacing[0]).toBe(0);
  } finally {
    value.dispose();
  }
});
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
  expect(textCharacterPropertyTokens).toContain(XMLToken.FO_LETTER_SPACING);
  expect(textCharacterPropertyTokens).toEqual(
    expect.arrayContaining([
      XMLToken.STYLE_TEXT_LINE_THROUGH_STYLE,
      XMLToken.STYLE_TEXT_LINE_THROUGH_TYPE,
      XMLToken.STYLE_TEXT_LINE_THROUGH_WIDTH,
      XMLToken.STYLE_TEXT_LINE_THROUGH_TEXT,
    ]),
  );
});

it("uses separate overline and underline states and the native glyph effect spellings", /** Exercises the native decoration merge and character effect handlers. @returns Nothing. */ () => {
  const props = importTextCharacterProperties(
    attributes([
      ["style:text-underline-style", "solid"],
      ["style:text-overline-style", "wave"],
      ["style:text-overline-type", "double"],
      ["style:text-overline-color", "#cc0033"],
      ["style:text-outline", "true"],
      ["fo:text-shadow", "#00ff00 2pt 4pt"],
      ["style:font-relief", "engraved"],
    ]),
  );
  expect(props).toEqual({
    underlineStyle: 1,
    overlineStyle: 11,
    overlineColor: 0xcc0033,
    overlineHasColor: true,
    contoured: true,
    shadowed: true,
    relief: 2,
  });
  const xml = exportTextCharacterProperties(props);
  expect(xml).toContain('style:text-overline-type="double"');
  expect(xml).toContain('style:text-overline-color="#cc0033"');
  expect(xml).toContain('style:text-outline="true"');
  expect(xml).toContain('fo:text-shadow="1pt 1pt"');
  expect(xml).toContain('style:font-relief="engraved"');
  expect(
    importTextCharacterProperties(
      attributes([
        ["style:text-outline", "invalid"],
        ["fo:text-shadow", "none"],
        ["style:font-relief", "invalid"],
        ["style:text-overline-color", "font-color"],
      ]),
    ),
  ).toEqual({ shadowed: false, overlineHasColor: false });
  expect(
    exportTextCharacterProperties({
      underlineStyle: 0,
      underlineColor: 0xcc0033,
      underlineHasColor: true,
      overlineStyle: 0,
      overlineColor: 0xcc0033,
      overlineHasColor: true,
      relief: 0,
    }),
  ).toBe(
    ' style:font-relief="none" style:text-underline-style="none" style:text-overline-style="none" style:text-overline-color="#cc0033"',
  );
});

it("merges native crossed-out type and width in actual SAX order without affecting underline", /** Preserves native DOUBLE precedence and text replacement. @returns Nothing. */ () => {
  const entries = [
    ["style:text-line-through-style", "solid"],
    ["style:text-line-through-type", "double"],
    ["style:text-line-through-width", "bold"],
  ] as const;
  for (const order of [
    [0, 1, 2],
    [0, 2, 1],
    [1, 0, 2],
    [1, 2, 0],
    [2, 0, 1],
    [2, 1, 0],
  ]) {
    const properties = order.map(
      /** Orders actual SAX inputs. @param index - Source mapping. @returns Property. */ (index) =>
        entries[index] as readonly [string, string],
    );
    expect(importTextCharacterProperties(attributes(properties))).toEqual({ strikeout: 2 });
    expect(
      importTextCharacterProperties(
        attributes([...properties, ["style:text-line-through-text", "/"]]),
      ),
    ).toEqual({ strikeout: 5 });
    expect(
      importTextCharacterProperties(
        attributes([["style:text-line-through-text", "other"], ...properties]),
      ),
    ).toEqual({ strikeout: 6 });
  }
  expect(
    importTextCharacterProperties(
      attributes([
        ["style:text-line-through-style", "invalid"],
        ["style:text-line-through-text", ""],
      ]),
    ),
  ).toEqual({});
  expect(exportTextCharacterProperties({ strikeout: 3 })).toBe("");
  expect(exportTextCharacterProperties({ strikeout: 2, underlineStyle: 1 })).toContain(
    'style:text-line-through-type="double"',
  );
  expect(exportTextCharacterProperties({ strikeout: 2, underlineStyle: 1 })).toContain(
    'style:text-underline-style="solid"',
  );
});
