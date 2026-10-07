/** @fileoverview Verifies represented native Number/Bullet font construction without upstream execution. */
import { expect, it } from "vitest";
import { SwDoc } from "../doc/doc";
import { applyWriterParagraphList } from "../doc/list";
import { createWriterNumFormat, SvxNumType } from "../doc/number";
import { Font } from "../../../../vcl/source/font/font";
import { SfxStringItem } from "../../../../svl/source/items/stritem";
import {
  FontItalic,
  FontLineStyle,
  FontWeight,
  SvxFontItem,
  SvxFontHeightItem,
  SvxPostureItem,
  SvxUnderlineItem,
  SvxWeightItem,
} from "../../../../editeng/source/items/textitem";
import {
  RES_CHRATR_FONT,
  RES_CHRATR_FONTSIZE,
  RES_CHRATR_POSTURE,
  RES_CHRATR_WEIGHT,
  RES_CHRATR_UNDERLINE,
  RES_CHRATR_COLOR,
} from "../../../inc/hintids";
import { resolveSwNumberPortionFont } from "./txtfld";
import {
  encodeWriterDocument,
  decodeWriterDocument,
} from "../../../browser/filter/xml/writer-document-codec";

for (const preserve of [false, true])
  it(`native number font uses paragraph attr ownership and source reset preserve=${preserve}`, /** Checks native enums, independent optional font copies and no history/model mutation while resolving. @returns Nothing. */ () => {
    const doc = new SwDoc(),
      node = doc.paragraphs[0];
    if (node === undefined) throw Error("Missing body");
    try {
      expect(doc.GetDocumentSettingManager().get("DO_NOT_RESET_PARA_ATTRS_FOR_NUM_FONT")).toBe(
        false,
      );
      expect(resolveSwNumberPortionFont(node)).toBeUndefined();
      doc.GetDocumentSettingManager().set("DO_NOT_RESET_PARA_ATTRS_FOR_NUM_FONT", preserve);
      node.SetText("Paragraph text");
      node.SetAttr(
        new SvxFontItem("Liberation Serif", RES_CHRATR_FONT, "Liberation Serif", "roman"),
      );
      node.SetAttr(new SvxFontHeightItem(400, RES_CHRATR_FONTSIZE));
      node.SetAttr(new SvxWeightItem(FontWeight.BOLD, RES_CHRATR_WEIGHT));
      node.SetAttr(new SvxPostureItem(FontItalic.OBLIQUE, RES_CHRATR_POSTURE));
      node.SetAttr(new SvxUnderlineItem(FontLineStyle.DOUBLE, RES_CHRATR_UNDERLINE));
      node.SetAttr(new SfxStringItem(RES_CHRATR_COLOR, "#336699"));
      applyWriterParagraphList(node, { kind: "bullet", level: 0, ruleName: "Font rule" });
      const rule = node.GetNumRule();
      if (rule === undefined) throw Error("Missing rule");
      doc.GetUndoManager().Clear();
      const initial = resolveSwNumberPortionFont(node);
      expect(initial).toEqual({
        familyName: "OpenSymbol",
        heightTwips: 400,
        weight: preserve ? FontWeight.BOLD : FontWeight.NORMAL,
        posture: preserve ? FontItalic.OBLIQUE : FontItalic.NONE,
        underline: preserve ? FontLineStyle.DOUBLE : FontLineStyle.NONE,
        color: "#336699",
      });
      expect(Object.isFrozen(initial)).toBe(true);
      const format = createWriterNumFormat("bullet"),
        face = new Font();
      face.SetFamilyName("Liberation Mono");
      format.SetBulletFont(face);
      rule.Set(0, format);
      face.SetFamilyName("Changed external handle");
      expect(resolveSwNumberPortionFont(node)?.familyName).toBe("Liberation Mono");
      expect(initial?.familyName).toBe("OpenSymbol");
      format.SetBulletFont(undefined);
      rule.Set(0, format);
      expect(resolveSwNumberPortionFont(node)).toMatchObject({
        familyName: "Liberation Serif",
        genericFamily: "roman",
      });
      format.SetBulletFont(new Font());
      rule.Set(0, format);
      expect(resolveSwNumberPortionFont(node)?.familyName).toBe("");
      format.SetNumberingType(SvxNumType.SVX_NUM_ARABIC);
      rule.Set(0, format);
      expect(resolveSwNumberPortionFont(node)).toEqual({
        familyName: "Liberation Serif",
        genericFamily: "roman",
        heightTwips: 400,
        weight: FontWeight.BOLD,
        posture: FontItalic.OBLIQUE,
        underline: preserve ? FontLineStyle.DOUBLE : FontLineStyle.NONE,
        color: "#336699",
      });
      format.SetNumberingType(SvxNumType.SVX_NUM_BITMAP);
      rule.Set(0, format);
      expect(resolveSwNumberPortionFont(node)).toBeUndefined();
      node.SetCountedInList(false);
      expect(resolveSwNumberPortionFont(node)).toBeUndefined();
      expect(node.GetText()).toBe("Paragraph text");
      expect((node.GetAttr(RES_CHRATR_WEIGHT) as SvxWeightItem).GetWeight()).toBe(FontWeight.BOLD);
      expect(doc.GetUndoManager().GetUndoActionCount()).toBe(0);
    } finally {
      doc.Dispose();
    }
  });

it("number font compatibility setting roundtrips and older graph records use the source false default", /** Checks legacy missing-field compatibility without relaxing previous settings validation or mutating the input graph. @returns Nothing. */ () => {
  const doc = new SwDoc();
  const copies: SwDoc[] = [];
  try {
    doc.GetDocumentSettingManager().set("DO_NOT_RESET_PARA_ATTRS_FOR_NUM_FONT", true);
    const record = encodeWriterDocument(doc),
      roundtrip = decodeWriterDocument(record);
    copies.push(roundtrip);
    expect(roundtrip.GetDocumentSettingManager().get("DO_NOT_RESET_PARA_ATTRS_FOR_NUM_FONT")).toBe(
      true,
    );
    const legacy = JSON.parse(JSON.stringify(record));
    delete legacy.documentSettings.DO_NOT_RESET_PARA_ATTRS_FOR_NUM_FONT;
    const old = decodeWriterDocument(legacy);
    copies.push(old);
    expect(old.GetDocumentSettingManager().get("DO_NOT_RESET_PARA_ATTRS_FOR_NUM_FONT")).toBe(false);
    expect(Object.hasOwn(legacy.documentSettings, "DO_NOT_RESET_PARA_ATTRS_FOR_NUM_FONT")).toBe(
      false,
    );
    const malformed = JSON.parse(JSON.stringify(legacy));
    delete malformed.documentSettings.TAB_COMPAT;
    expect(
      /** Reads an invalid prior-schema field. @returns Decode attempt. */ () =>
        decodeWriterDocument(malformed),
    ).toThrow("Stored Writer document setting is invalid: TAB_COMPAT");
    const invalidNew = JSON.parse(JSON.stringify(record));
    invalidNew.documentSettings.DO_NOT_RESET_PARA_ATTRS_FOR_NUM_FONT = "true";
    expect(
      /** Rejects an explicitly malformed newly represented setting. @returns Decode attempt. */ () =>
        decodeWriterDocument(invalidNew),
    ).toThrow("Stored Writer document setting is invalid: DO_NOT_RESET_PARA_ATTRS_FOR_NUM_FONT");
  } finally {
    for (const copy of copies) copy.Dispose();
    doc.Dispose();
  }
});
