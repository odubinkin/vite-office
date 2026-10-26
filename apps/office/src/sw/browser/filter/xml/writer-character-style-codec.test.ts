/** @fileoverview Verifies actual character style identity, inheritance and numbering clients through Worker graph transport. */
import { assert, expect, it } from "vitest";
import { SwDoc } from "../../../source/core/doc/doc";
import { SwNumFormat, SwNumRule } from "../../../source/core/doc/number";
import { SwPoolFormatId as P } from "../../../inc/poolfmt";
import { RES_CHRATR_WEIGHT, RES_CHRATR_COLOR } from "../../../inc/hintids";
import { SvxWeightItem } from "../../../../editeng/source/items/textitem";
import { SvxColorItem } from "../../../../editeng/inc/colritem";
import { FontWeight } from "../../../../tools/inc/fontenum";
import { COL_RED } from "../../../../tools/inc/color";
import { encodeWriterDocument, decodeWriterDocument } from "./writer-document-codec";

it("transfers duplicate names, exact pool IDs, explicit defaults and the same numbering style owner", /** Checks primitive structured-clone input against restored native graph. @returns Nothing. */ () => {
  const doc = new SwDoc();
  try {
    const parent = doc.GetCharFormatFromPool(P.CHR_HTML_STRONG);
    assert(parent);
    parent.SetFormatAttr(new SvxColorItem(COL_RED, RES_CHRATR_COLOR));
    const first = doc.MakeCharFormat("Duplicate", parent);
    const second = doc.MakeCharFormat("Duplicate", first);
    second.SetAuto(true);
    second.SetFormatAttr(new SvxWeightItem(FontWeight.WEIGHT_NORMAL, RES_CHRATR_WEIGHT));
    const format = new SwNumFormat();
    format.SetCharFormat(second);
    const rule = new SwNumRule("Imported", "label-alignment");
    rule.Set(0, format);
    rule.Set(3, format);
    doc.AddNumRule(rule);
    const record = structuredClone(encodeWriterDocument(doc));
    const copy = decodeWriterDocument(record);
    try {
      expect(encodeWriterDocument(copy)).toEqual(record);
      const styles = copy.GetCharFormats();
      const [, restoredParent, restoredFirst, restoredSecond] = styles;
      const restoredRule = copy.GetNumRuleTable()[0];
      assert(restoredParent && restoredFirst && restoredSecond && restoredRule);
      expect(styles).toHaveLength(4);
      expect(restoredFirst.GetName()).toBe(restoredSecond.GetName());
      expect(restoredSecond.DerivedFrom()).toBe(styles[2]);
      expect(restoredFirst.DerivedFrom()).toBe(styles[1]);
      expect(restoredParent.GetPoolFormatId()).toBe(P.CHR_HTML_STRONG);
      expect(restoredSecond.IsAuto()).toBe(true);
      expect(restoredRule.Get(0).GetCharFormat()).toBe(styles[3]);
      expect(restoredRule.Get(3).GetCharFormat()).toBe(styles[3]);
      expect(
        (restoredSecond.GetAttrSet().Get(RES_CHRATR_COLOR) as SvxColorItem).GetValue(),
      ).toEqual(COL_RED);
      expect(
        (restoredSecond.GetAttrSet().Get(RES_CHRATR_WEIGHT) as SvxWeightItem).GetWeight(),
      ).toBe(FontWeight.WEIGHT_NORMAL);
    } finally {
      copy.Dispose();
    }
  } finally {
    doc.Dispose();
  }
});
it("accepts old absent style tables and rejects cyclic or dangling identities", /** Checks compatibility and corruption admission at the browser boundary. @returns Nothing. */ () => {
  const doc = new SwDoc();
  try {
    const record = encodeWriterDocument(doc);
    const { characterFormats: ignored, ...legacy } = record;
    void ignored;
    const copy = decodeWriterDocument(legacy);
    copy.Dispose();
    const base = record.characterFormats?.[0];
    assert(base);
    expect(() =>
      decodeWriterDocument({ ...record, characterFormats: [base, { ...base, parent: 1 }] }),
    ).toThrow("cyclic");
    expect(() =>
      decodeWriterDocument({ ...record, characterFormats: [base, { ...base, parent: 2 }] }),
    ).toThrow("invalid");
  } finally {
    doc.Dispose();
  }
});
