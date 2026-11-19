/** @fileoverview Verifies represented native Number/Bullet font construction without upstream execution. */
import { createWriterTextColorItem } from "../attr/swatrset";
import { FontItalic, FontWeight } from "../../../../tools/inc/fontenum";
import { assert, expect, it } from "vitest";
import { SwDoc } from "../doc/doc";
import { SwFormatAutoFormat, SwFormatCharFormat } from "../txtnode/fmtatr2";
import { SfxItemSet } from "../../../../svl/source/items/itemset";
import { SvxEscapementItem } from "../../../../editeng/inc/escapementitem";
import { applyWriterParagraphList } from "../doc/list";
import { createWriterNumFormat, SvxNumType } from "../doc/number";
import { Font } from "../../../../vcl/source/font/font";
import {
  FontLineStyle,
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
  RES_CHRATR_ESCAPEMENT,
  RES_CHRATR_BEGIN,
  RES_TXTATR_CHARFMT,
  RES_PARATR_LIST_AUTOFMT,
} from "../../../inc/hintids";
import { resolveSwNumberPortionFont } from "./txtfld";
import {
  encodeWriterDocument,
  decodeWriterDocument,
} from "../../../browser/filter/xml/writer-document-codec";
import { FontFamily, FontPitch } from "../../../../tools/inc/fontenum";
import { RTL_TEXTENCODING_DONTKNOW } from "../../../../sal/inc/rtl/textenc";
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
        new SvxFontItem(
          FontFamily.FAMILY_ROMAN,
          "Liberation Serif",
          "",
          FontPitch.PITCH_DONTKNOW,
          RTL_TEXTENCODING_DONTKNOW,
          RES_CHRATR_FONT,
        ),
      );
      node.SetAttr(new SvxFontHeightItem(400, 100, RES_CHRATR_FONTSIZE));
      node.SetAttr(new SvxWeightItem(FontWeight.WEIGHT_BOLD, RES_CHRATR_WEIGHT));
      node.SetAttr(new SvxPostureItem(FontItalic.ITALIC_OBLIQUE, RES_CHRATR_POSTURE));
      node.SetAttr(new SvxUnderlineItem(FontLineStyle.LINESTYLE_DOUBLE, RES_CHRATR_UNDERLINE));
      node.SetAttr(createWriterTextColorItem("#336699"));
      applyWriterParagraphList(node, { kind: "bullet", level: 0, ruleName: "Font rule" });
      const rule = node.GetNumRule();
      if (rule === undefined) throw Error("Missing rule");
      doc.GetUndoManager().Clear();
      const initial = resolveSwNumberPortionFont(node);
      expect(initial).toEqual({
        familyName: "OpenSymbol",
        heightTwips: 400,
        weight: preserve ? FontWeight.WEIGHT_BOLD : FontWeight.WEIGHT_NORMAL,
        posture: preserve ? FontItalic.ITALIC_OBLIQUE : FontItalic.ITALIC_NONE,
        underline: preserve ? FontLineStyle.LINESTYLE_DOUBLE : FontLineStyle.LINESTYLE_NONE,
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
        weight: FontWeight.WEIGHT_BOLD,
        posture: FontItalic.ITALIC_OBLIQUE,
        underline: preserve ? FontLineStyle.LINESTYLE_DOUBLE : FontLineStyle.LINESTYLE_NONE,
        color: "#336699",
      });
      format.SetNumberingType(SvxNumType.SVX_NUM_BITMAP);
      rule.Set(0, format);
      expect(resolveSwNumberPortionFont(node)).toBeUndefined();
      node.SetCountedInList(false);
      expect(resolveSwNumberPortionFont(node)).toBeUndefined();
      expect(node.GetText()).toBe("Paragraph text");
      expect((node.GetAttr(RES_CHRATR_WEIGHT) as SvxWeightItem).GetWeight()).toBe(
        FontWeight.WEIGHT_BOLD,
      );
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
    doc.GetDocumentSettingManager().set("APPLY_PARAGRAPH_MARK_FORMAT_TO_NUMBERING", true);
    const record = encodeWriterDocument(doc),
      roundtrip = decodeWriterDocument(record);
    copies.push(roundtrip);
    expect(roundtrip.GetDocumentSettingManager().get("DO_NOT_RESET_PARA_ATTRS_FOR_NUM_FONT")).toBe(
      true,
    );
    const legacy = JSON.parse(JSON.stringify(record));
    delete legacy.documentSettings.DO_NOT_RESET_PARA_ATTRS_FOR_NUM_FONT;
    delete legacy.documentSettings.APPLY_PARAGRAPH_MARK_FORMAT_TO_NUMBERING;
    const old = decodeWriterDocument(legacy);
    copies.push(old);
    expect(old.GetDocumentSettingManager().get("DO_NOT_RESET_PARA_ATTRS_FOR_NUM_FONT")).toBe(false);
    expect(old.GetDocumentSettingManager().get("APPLY_PARAGRAPH_MARK_FORMAT_TO_NUMBERING")).toBe(
      false,
    );
    expect(
      roundtrip.GetDocumentSettingManager().get("APPLY_PARAGRAPH_MARK_FORMAT_TO_NUMBERING"),
    ).toBe(true);
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

it("applies actual numbering character style after paragraph resets and before the explicit bullet face", /** Checks original SetDiffFnt order through Worker transport. @returns Nothing. */ () => {
  const doc = new SwDoc();
  try {
    const node = doc.paragraphs[0];
    assert(node);
    node.SetText("List");
    applyWriterParagraphList(node, { kind: "bullet", level: 0, ruleName: "Styled" });
    const style = doc.MakeCharFormat("Label", doc.GetDfltCharFormat());
    style.SetFormatAttr(new SvxWeightItem(FontWeight.WEIGHT_BOLD, RES_CHRATR_WEIGHT));
    style.SetFormatAttr(new SvxPostureItem(FontItalic.ITALIC_NORMAL, RES_CHRATR_POSTURE));
    style.SetFormatAttr(new SvxUnderlineItem(FontLineStyle.LINESTYLE_DOUBLE, RES_CHRATR_UNDERLINE));
    style.SetFormatAttr(new SvxFontHeightItem(420, 100, RES_CHRATR_FONTSIZE));
    style.SetFormatAttr(createWriterTextColorItem("#ff0000"));
    const format = createWriterNumFormat("bullet");
    format.SetCharFormat(style);
    const rule = node.GetNumRule();
    assert(rule);
    rule.Set(0, format);
    const font = resolveSwNumberPortionFont(node);
    assert(font);
    expect(font).toMatchObject({
      familyName: "OpenSymbol",
      weight: FontWeight.WEIGHT_BOLD,
      posture: FontItalic.ITALIC_NORMAL,
      underline: FontLineStyle.LINESTYLE_DOUBLE,
      heightTwips: 420,
      color: "#ff0000",
    });
    const copy = decodeWriterDocument(structuredClone(encodeWriterDocument(doc)));
    try {
      const copiedNode = copy.paragraphs[0];
      assert(copiedNode);
      expect(resolveSwNumberPortionFont(copiedNode)).toEqual(font);
    } finally {
      copy.Dispose();
    }
  } finally {
    doc.Dispose();
  }
});

it("gates the mark overlay and preserves the list style ahead of marker direct and inherited items", /** Replays represented fields and the source exclusions with real style owners. @returns Nothing. */ () => {
  const doc = new SwDoc();
  const marker = new SfxItemSet(doc.GetAttrPool(), [[RES_CHRATR_BEGIN, RES_TXTATR_CHARFMT]]);
  try {
    const node = doc.paragraphs[0];
    assert(node);
    node.SetText("List");
    applyWriterParagraphList(node, { kind: "numbered", level: 0, ruleName: "Styled marker" });
    const parent = doc.MakeCharFormat("Marker parent", doc.GetDfltCharFormat());
    parent.SetFormatAttr(new SvxFontHeightItem(420, 100, RES_CHRATR_FONTSIZE));
    parent.SetFormatAttr(new SvxWeightItem(FontWeight.WEIGHT_BOLD, RES_CHRATR_WEIGHT));
    const markerStyle = doc.MakeCharFormat("Marker child", parent);
    const reference = new SwFormatCharFormat(markerStyle);
    try {
      marker.Put(reference);
    } finally {
      reference.Dispose();
    }
    marker.Put(new SvxWeightItem(FontWeight.WEIGHT_NORMAL, RES_CHRATR_WEIGHT));
    marker.Put(new SvxUnderlineItem(FontLineStyle.LINESTYLE_DOUBLE, RES_CHRATR_UNDERLINE));
    marker.Put(new SvxEscapementItem(33, 58, RES_CHRATR_ESCAPEMENT));
    marker.Put(createWriterTextColorItem("#008000"));
    const item = new SwFormatAutoFormat(RES_PARATR_LIST_AUTOFMT);
    try {
      item.SetStyleHandle(marker);
      node.SetAttr(item);
    } finally {
      item.Dispose();
    }
    expect(resolveSwNumberPortionFont(node)?.heightTwips).not.toBe(420);
    const settings = doc.GetDocumentSettingManager();
    settings.set("APPLY_PARAGRAPH_MARK_FORMAT_TO_NUMBERING", true);
    expect(resolveSwNumberPortionFont(node)).toMatchObject({
      color: "#008000",
      heightTwips: 420,
      weight: FontWeight.WEIGHT_NORMAL,
      underline: FontLineStyle.LINESTYLE_NONE,
    });
    expect(resolveSwNumberPortionFont(node)?.escapement).toBeUndefined();
    const listStyle = doc.MakeCharFormat("List level", doc.GetDfltCharFormat());
    listStyle.SetFormatAttr(createWriterTextColorItem("#ff0000"));
    const format = createWriterNumFormat("numbered");
    format.SetCharFormat(listStyle);
    const rule = node.GetNumRule();
    assert(rule);
    rule.Set(0, format);
    expect(resolveSwNumberPortionFont(node)).toMatchObject({ color: "#ff0000", heightTwips: 420 });
  } finally {
    doc.Dispose();
    marker.Dispose();
  }
});
