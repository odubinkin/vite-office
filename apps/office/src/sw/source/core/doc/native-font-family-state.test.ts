/** @fileoverview Full native font attribute state through real Writer pool cloning, history and browser graph persistence. */
import { expect, it } from "vitest";
import { SwDoc } from "./doc";
import { SvxFontItem } from "../../../../editeng/inc/fontitem";
import { FontFamily, FontPitch } from "../../../../tools/inc/fontenum";
import { RTL_TEXTENCODING_SYMBOL } from "../../../../sal/inc/rtl/textenc";
import { RES_CHRATR_FONT } from "../../../inc/hintids";
import { SwHistorySetAttrSet } from "../undo/rolbck";
import {
  encodeWriterDocument,
  decodeWriterDocument,
} from "../../../browser/filter/xml/writer-document-codec";
it("keeps native font fields through actual history clones and complete browser graph roundtrips", /** Uses actual attribute/pool/history owners; no snapshot fake or parallel font model. @returns Nothing. */ () => {
  const doc = new SwDoc(),
    node = doc.paragraphs[0];
  if (node === undefined) throw new Error("Missing paragraph");
  try {
    const item = new SvxFontItem(
      FontFamily.FAMILY_SCRIPT,
      "Face",
      "Style",
      FontPitch.PITCH_FIXED,
      RTL_TEXTENCODING_SYMBOL,
      RES_CHRATR_FONT,
    );
    node.SetAttr(item);
    const history = new SwHistorySetAttrSet(
        node.GetSwAttrSet().CloneAsValue(),
        node.GetIndex(),
        new Set([RES_CHRATR_FONT]),
      ),
      state = encodeWriterDocument(doc),
      restored = decodeWriterDocument(state);
    try {
      expect(
        (restored.paragraphs[0]?.GetAttr(RES_CHRATR_FONT) as SvxFontItem).QueryValue(),
      ).toEqual(item.QueryValue());
      expect(encodeWriterDocument(restored)).toEqual(state);
    } finally {
      restored.Dispose();
    }
    node.SetAttr(new SvxFontItem(RES_CHRATR_FONT));
    history.SetInDoc(doc, false);
    expect((node.GetAttr(RES_CHRATR_FONT) as SvxFontItem).QueryValue()).toEqual(item.QueryValue());
    item.SetFamilyName("Changed");
    expect((node.GetAttr(RES_CHRATR_FONT) as SvxFontItem).GetFamilyName()).toBe("Face");
  } finally {
    doc.Dispose();
  }
});
