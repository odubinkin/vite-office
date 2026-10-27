/** @fileoverview Native GetLang hint precedence, point boundaries, script families, language defaults and absent no-hyphen query. */
import { assert, expect, it } from "vitest";
import { encodeSfxItemSet, decodeSfxItemSet } from "../../../browser/filter/xml/item-codec";
import * as Slots from "../../../../editeng/inc/editids";
import { SwDoc } from "../doc/doc";
import { SfxItemSet } from "../../../../svl/source/items/itemset";
import { SvxLanguageItem } from "../../../../editeng/inc/langitem";
import { LANGUAGE_DONTKNOW } from "../../../../i18nlangtag/inc/lang";
import { GetWriterTextUnits } from "../bastyp/breakit";
import { SwFormatCharFormat } from "./fmtatr2";
import { MakeTextAttr } from "./thints";
import { SetAttrMode } from "../../../inc/swtypes";
import * as H from "../../../inc/hintids";
/** Creates an actual automatic language hint. @param doc - Original pool. @param language - Native language. @returns Native style. */
function style(doc: SwDoc, language: number): SfxItemSet {
  const set = new SfxItemSet(doc.GetAttrPool(), H.WRITER_CHARACTER_WHICH_RANGES);
  set.Put(new SvxLanguageItem(language, H.RES_CHRATR_LANGUAGE));
  return set;
}
it("reads the original script-specific paragraph defaults without allocating hints", /** Uses actual CJK/CTL/Latin items and automatic text script selection. @returns Nothing. */ () => {
  const doc = new SwDoc(),
    node = doc.paragraphs[0];
  assert(node);
  try {
    node.SetText("A漢ع");
    for (const [which, language] of [
      [H.RES_CHRATR_LANGUAGE, 0x409],
      [H.RES_CHRATR_CJK_LANGUAGE, 0x411],
      [H.RES_CHRATR_CTL_LANGUAGE, 0x401],
    ] as const)
      node.SetAttr(new SvxLanguageItem(language, which));
    expect([node.GetLang(0), node.GetLang(1), node.GetLang(2)]).toEqual([0x409, 0x411, 0x401]);
    expect(node.GetLang(0, 0, 2)).toBe(0x411);
    expect(node.GetLang(0, 0, 3)).toBe(0x401);
    expect(node.GetLang(0, 0, 1, true)).toBe(LANGUAGE_DONTKNOW);
    expect(node.GetpSwpHints()).toBeUndefined();
    expect([...GetWriterTextUnits(node.GetText())]).toEqual([65, 0x6f22, 0x639]);
  } finally {
    doc.Dispose();
  }
});
it.each([false, true])(
  "keeps point start/end policy with DontExpand=%s",
  /** Zero length differs from a one-character range at an existing start. @param closed - Actual native boundary flag. @returns Nothing. */ (
    closed,
  ) => {
    const doc = new SwDoc(),
      node = doc.paragraphs[0];
    assert(node);
    try {
      node.SetText("abcdef");
      node.SetAttr(new SvxLanguageItem(0x409, H.RES_CHRATR_LANGUAGE));
      const hint = node.InsertItem(
        MakeTextAttr(doc, style(doc, 0x40c), 2, 4).GetAttr(),
        2,
        4,
        SetAttrMode.NOHINTADJUST,
      );
      assert(hint);
      hint.SetDontExpand(closed);
      expect(node.GetLang(2, 0, 1)).toBe(0x409);
      expect(node.GetLang(2, 1, 1)).toBe(0x40c);
      expect(node.GetLang(3, 0, 1)).toBe(0x40c);
      expect(node.GetLang(4, 0, 1)).toBe(closed ? 0x409 : 0x40c);
      expect(node.GetLang(4, 1, 1)).toBe(0x409);
    } finally {
      doc.Dispose();
    }
  },
);
it("takes the first partial overlap but allows later complete coverage to replace it", /** Exact source ordering over named and automatic hints. @returns Nothing. */ () => {
  const doc = new SwDoc(),
    node = doc.paragraphs[0];
  assert(node);
  try {
    node.SetText("abcdef");
    const first = doc.MakeCharFormat("First", doc.GetDfltCharFormat()),
      second = doc.MakeCharFormat("Second", doc.GetDfltCharFormat());
    first.SetFormatAttrSet(style(doc, 0x40c));
    second.SetFormatAttrSet(style(doc, 0x407));
    node.InsertItem(new SwFormatCharFormat(first), 0, 2, SetAttrMode.NOHINTADJUST);
    node.InsertItem(new SwFormatCharFormat(second), 2, 6, SetAttrMode.NOHINTADJUST);
    expect(node.GetLang(1, 3, 1)).toBe(0x40c);
    expect(node.GetLang(2, 3, 1)).toBe(0x407);
    node.InsertItem(
      MakeTextAttr(doc, style(doc, 0x410), 1, 5).GetAttr(),
      1,
      5,
      SetAttrMode.NOHINTADJUST,
    );
    expect(node.GetLang(1, 3, 1)).toBe(0x410);
  } finally {
    doc.Dispose();
  }
});

it("keeps language pool defaults, native slots and concrete Worker item restoration", /** Actual Writer item factories transport complete unsigned16 values, including the unknown default. @returns Nothing. */ () => {
  const doc = new SwDoc();
  try {
    const pool = doc.GetAttrPool(),
      set = new SfxItemSet(pool, H.WRITER_CHARACTER_WHICH_RANGES);
    for (const [which, slot, language] of [
      [H.RES_CHRATR_LANGUAGE, Slots.SID_ATTR_CHAR_LANGUAGE, 0x40c],
      [H.RES_CHRATR_CJK_LANGUAGE, Slots.SID_ATTR_CHAR_CJK_LANGUAGE, 0x411],
      [H.RES_CHRATR_CTL_LANGUAGE, Slots.SID_ATTR_CHAR_CTL_LANGUAGE, 0x401],
    ] as const) {
      const item = pool.GetUserOrPoolDefaultItem(which);
      assert(item instanceof SvxLanguageItem);
      expect(item.GetLanguage()).toBe(LANGUAGE_DONTKNOW);
      expect(pool.GetSlotId(which)).toBe(slot);
      expect(pool.GetWhichIDFromSlotID(slot)).toBe(which);
      set.Put(new SvxLanguageItem(language, which));
    }
    const encoded = encodeSfxItemSet(set),
      restored = new SfxItemSet(pool, H.WRITER_CHARACTER_WHICH_RANGES);
    decodeSfxItemSet(restored, structuredClone(encoded));
    expect(restored.Equals(set, true)).toBe(true);
    for (const item of restored.entries()) expect(item).toBeInstanceOf(SvxLanguageItem);
  } finally {
    doc.Dispose();
  }
});
