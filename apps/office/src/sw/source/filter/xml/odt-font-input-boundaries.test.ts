/** @fileoverview Covers legacy ODF font metadata and malformed native paragraph attributes at XML boundaries. */
import { expect, it, vi } from "vitest";
import { SwDoc } from "../../core/doc/doc";
import { SfxStringItem } from "../../../../svl/source/items/stritem";
import { SvxAdjustItem, SvxAdjust } from "../../../../editeng/inc/adjustitem";
import { SvxFontItem } from "../../../../editeng/inc/fontitem";
import { RES_CHRATR_FONT, RES_MARGIN_TEXTLEFT, RES_PARATR_ADJUST } from "../../../inc/hintids";
import {
  XMLFontStylesContext,
  type XMLFontStylesImportTarget,
} from "../../../../xmloff/source/style/XMLFontStylesContext";
import { exportStylesXml } from "./xmlexp";
import { importWriterXml } from "./xmlimp";
import { registerWriterFontFace } from "./xmlfonte";
import { XMLFontAutoStylePool } from "../../../../xmloff/source/style/XMLFontAutoStylePool";
import { exportCharacterAttributes } from "../../../../xmloff/source/text/txtparae";
import { FontFamily, FontPitch } from "../../../../tools/inc/fontenum";
import { RTL_TEXTENCODING_DONTKNOW } from "../../../../sal/inc/rtl/textenc";

it("exports a family-only browser font through the real native font pool", /** Missing optional metadata must still allocate one usable Unicode face declaration. @returns Nothing. */ () => {
  const pool = new XMLFontAutoStylePool();
  const properties = { fontFamily: "Шрифт 測試" };
  const resolver = registerWriterFontFace.bind(undefined, pool);
  const attributes = exportCharacterAttributes(properties, resolver);
  expect(attributes).toContain(' style:font-name="Шрифт 測試"');
  expect(exportCharacterAttributes(properties, resolver)).toBe(attributes);
  expect(
    pool.Find(
      properties.fontFamily,
      "",
      FontFamily.FAMILY_DONTKNOW,
      FontPitch.PITCH_DONTKNOW,
      RTL_TEXTENCODING_DONTKNOW,
    ),
  ).toBe("Шрифт 測試");
  expect(pool.exportXML()).toBe(
    '<office:font-face-decls><style:font-face style:name="Шрифт 測試" svg:font-family="&apos;Шрифт 測試&apos;"/></office:font-face-decls>',
  );
});

it("rejects incorrectly typed direct margins and paragraph adjustments at export", /** Corrupt pool inputs must not silently serialize as valid paragraph state. @returns Nothing. */ () => {
  for (const [which, message] of [
    [RES_MARGIN_TEXTLEFT, "ODT left-margin item is invalid"],
    [RES_PARATR_ADJUST, "ODT paragraph adjustment item is invalid"],
  ] as const) {
    const doc = new SwDoc();
    try {
      doc.GetTextFormatColl("text-body").SetFormatAttr(new SfxStringItem(which, "corrupt"));
      expect(
        /** Serializes actual malformed style state. @returns XML. */ () => exportStylesXml(doc),
      ).toThrow(message);
    } finally {
      doc.Dispose();
    }
  }
});

it("rejects an unsupported adjustment returned by a native item", /** Checks the exporter boundary independently of native getter normalization. @returns Nothing. */ () => {
  const doc = new SwDoc();
  doc
    .GetTextFormatColl("text-body")
    .SetFormatAttr(new SvxAdjustItem(SvxAdjust.Left, RES_PARATR_ADJUST));
  const getter = vi.spyOn(SvxAdjustItem.prototype, "GetAdjust").mockReturnValue(SvxAdjust.End);
  try {
    expect(
      /** Serializes unsupported native adjustment. @returns XML. */ () => exportStylesXml(doc),
    ).toThrow("ODT paragraph adjustment value is unsupported");
  } finally {
    getter.mockRestore();
    doc.Dispose();
  }
});

it("imports fallback font-family without named-face metadata", /** Legacy family-only ODF defaults style, pitch and charset through the real parser. @returns Nothing. */ () => {
  const xml =
    '<office:document-styles xmlns:office="urn:oasis:names:tc:opendocument:xmlns:office:1.0" xmlns:style="urn:oasis:names:tc:opendocument:xmlns:style:1.0" xmlns:fo="urn:oasis:names:tc:opendocument:xmlns:xsl-fo-compatible:1.0"><office:styles><style:style style:name="Text_20_body" style:family="paragraph"><style:text-properties fo:font-family="Legacy Face"/></style:style></office:styles></office:document-styles>';
  const { document } = importWriterXml(xml, undefined, { title: "Legacy font" });
  try {
    expect(
      (
        document
          .GetTextFormatColl("text-body")
          .GetAttrSet()
          .Get(RES_CHRATR_FONT, true) as SvxFontItem
      ).GetFamilyName(),
    ).toBe("Legacy Face");
  } finally {
    document.Dispose();
  }
});

it("accepts a font registration without optional metadata through the existing import target", /** Exercises the declared legacy target signature on the actual import coordinator. @returns Nothing. */ () => {
  const original = XMLFontStylesContext.prototype.createFastChildContext;
  const spy = vi.spyOn(XMLFontStylesContext.prototype, "createFastChildContext").mockImplementation(
    /** Replays the optional metadata signature on the real import target. @param this - Actual declaration context. @param element - Child token. @param attributes - Actual font attributes. @returns Real font child context. */ function (
      this: XMLFontStylesContext,
      element,
      attributes,
    ) {
      const target = Reflect.get(this, "target") as XMLFontStylesImportTarget;
      target.registerFontFace("Legacy", "Legacy Face", undefined);
      return original.call(this, element, attributes);
    },
  );
  try {
    const { document } = importWriterXml(
      '<office:document-styles xmlns:office="urn:oasis:names:tc:opendocument:xmlns:office:1.0" xmlns:style="urn:oasis:names:tc:opendocument:xmlns:style:1.0" xmlns:svg="urn:oasis:names:tc:opendocument:xmlns:svg-compatible:1.0"><office:font-face-decls><style:font-face style:name="Legacy" svg:font-family="Legacy Face"/></office:font-face-decls></office:document-styles>',
      undefined,
      { title: "Registration" },
    );
    try {
      expect(spy).toHaveBeenCalled();
      expect(document.GetAttrPool()).toBeDefined();
    } finally {
      document.Dispose();
    }
  } finally {
    spy.mockRestore();
  }
});
