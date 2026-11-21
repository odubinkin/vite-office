/** @fileoverview Native scalar property-map transport preserves independent scripts and source merge/failure behavior. */
import { expect, it } from "vitest";
import { FastAttributeList } from "../core/xmlimp";
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
        const [prefix, local] = name.split(":") as ["style" | "fo" | "loext", string];
        return { name, value, prefix, local, uri: ODF_NAMESPACES[prefix] };
      },
    ),
  );
}
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
  expect(textCharacterPropertyTokens).toHaveLength(63);
  expect(textCharacterPropertyTokens).toContain(XMLToken.STYLE_TEXT_EMPHASIZE);
  expect(textCharacterPropertyTokens).toContain(XMLToken.FO_LETTER_SPACING);
  expect(textCharacterPropertyTokens.slice(9, 13)).toEqual([
    XMLToken.STYLE_TEXT_LINE_THROUGH_STYLE,
    XMLToken.STYLE_TEXT_LINE_THROUGH_TYPE,
    XMLToken.STYLE_TEXT_LINE_THROUGH_WIDTH,
    XMLToken.STYLE_TEXT_LINE_THROUGH_TEXT,
  ]);
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

it("imports legacy and extended character borders and exports extended text attributes", /** Verifies mixed namespace input and independently represented sides. @returns Nothing. */ () => {
  const values = importTextCharacterProperties(
    attributes([
      ["fo:border-left", "none"],
      ["loext:border-left", "0.05cm double #123456"],
      ["style:border-line-width-left", "0.01cm 0.02cm 0.02cm"],
      ["fo:padding-left", "2pt"],
      ["loext:padding-right", "3pt"],
      ["loext:border-right", "none"],
    ]),
  );
  expect(values.characterBox).toEqual({
    borderLeft: "0.05cm double #123456",
    borderLineWidthLeft: "0.01cm 0.02cm 0.02cm",
    borderRight: "none",
    paddingLeft: 40,
    paddingRight: 60,
  });
  const xml = exportTextCharacterProperties(values);
  expect(xml).toContain('loext:border-left="0.05cm double #123456"');
  expect(xml).toContain('loext:border-right="none"');
  expect(xml).toContain('loext:border-line-width-left="0.01cm 0.02cm 0.02cm"');
  expect(xml).toContain("loext:padding-left=");
  expect(xml).toContain("loext:padding-right=");
});

it("uses the native CharEmphasis tokens in both directions", /** Checks each UNO value and the accepted native token order. @returns Nothing. */ () => {
  for (const [emphasis, lexical] of [
    [0, "none"],
    [1, "dot above"],
    [2, "circle above"],
    [3, "disc above"],
    [4, "accent above"],
    [11, "dot below"],
    [12, "circle below"],
    [13, "disc below"],
    [14, "accent below"],
  ] as const) {
    expect(importTextCharacterProperties(attributes([["style:text-emphasize", lexical]]))).toEqual({
      emphasis,
    });
    expect(exportTextCharacterProperties({ emphasis })).toContain(
      `style:text-emphasize="${lexical}"`,
    );
  }
  expect(
    importTextCharacterProperties(attributes([["style:text-emphasize", "below circle"]])),
  ).toEqual({ emphasis: 12 });
  expect(importTextCharacterProperties(attributes([["style:text-emphasize", "dot"]]))).toEqual({
    emphasis: 1,
  });
  expect(
    importTextCharacterProperties(attributes([["style:text-emphasize", "below none"]])),
  ).toEqual({ emphasis: 0 });
  for (const lexical of ["unknown", "dot below above", "dot  below", "dot circle"])
    expect(importTextCharacterProperties(attributes([["style:text-emphasize", lexical]]))).toEqual(
      {},
    );
});
