/** @fileoverview Source init.cxx character ItemInfo slot contracts consumed by generic font and style controls. */
import { expect, it } from "vitest";
import { SwDoc } from "../doc/doc";
import * as H from "../../../inc/hintids";
import * as S from "../../../../editeng/inc/editids";
import {
  SvxFontItem,
  SvxFontHeightItem,
  SvxPostureItem,
  SvxWeightItem,
  SvxUnderlineItem,
} from "../../../../editeng/source/items/textitem";
import { SvxCrossedOutItem } from "../../../../editeng/inc/crossedoutitem";
import { SvxWordLineModeItem } from "../../../../editeng/inc/wrlmitem";
import { SvxAutoKernItem } from "../../../../editeng/inc/autokernitem";
import {
  FontItalic,
  FontWeight,
  FontLineStyle,
  FontStrikeout,
} from "../../../../tools/inc/fontenum";
import { getParagraphStyleItemSetForPreview } from "../../uibase/app/docstyle";
import { Font } from "../../../../vcl/source/font/font";
import { setStylePreviewFontDecorations } from "../../../../svx/source/tbxctrls/tbcontrl.stylepreview";

it("prepares inherited Writer underline and strikeout in all three preview font values", /** Uses the real current Writer style/item pool; unimplemented Writer decoration slots are not fabricated. @returns Nothing. */ () => {
  const doc = new SwDoc();
  try {
    const parent = doc.MakeTextFormatColl(
      "Decorated parent",
      doc.GetDfltTextFormatColl(),
      "decoration-parent",
    );
    parent.SetFormatAttr(
      new SvxUnderlineItem(FontLineStyle.LINESTYLE_DOUBLE, H.RES_CHRATR_UNDERLINE),
    );
    parent.SetFormatAttr(
      new SvxCrossedOutItem(FontStrikeout.STRIKEOUT_BOLD, H.RES_CHRATR_CROSSEDOUT),
    );
    const child = doc.MakeTextFormatColl("Decorated child", parent, "decoration-child");
    child.SetFormatAttr(new SvxUnderlineItem(FontLineStyle.LINESTYLE_WAVE, H.RES_CHRATR_UNDERLINE));
    const preview = getParagraphStyleItemSetForPreview(doc, child.id);
    expect(preview).toBeDefined();
    const latin = new Font(),
      asian = new Font(),
      complex = new Font();
    setStylePreviewFontDecorations(preview as NonNullable<typeof preview>, latin, asian, complex);
    for (const font of [latin, asian, complex])
      expect([font.GetUnderline(), font.GetStrikeout()]).toEqual([10, 4]);
  } finally {
    doc.Dispose();
  }
});

it("resolves every represented character preview slot in both directions with its actual native item", /** Pins init.cxx numeric identities independently of shared declarations. @returns Nothing. */ () => {
  const doc = new SwDoc();
  try {
    const pool = doc.GetAttrPool();
    for (const [declared, slot, which, type] of [
      [S.SID_ATTR_CHAR_FONT, 10007, H.RES_CHRATR_FONT, SvxFontItem],
      [S.SID_ATTR_CHAR_FONTHEIGHT, 10015, H.RES_CHRATR_FONTSIZE, SvxFontHeightItem],
      [S.SID_ATTR_CHAR_POSTURE, 10008, H.RES_CHRATR_POSTURE, SvxPostureItem],
      [S.SID_ATTR_CHAR_WEIGHT, 10009, H.RES_CHRATR_WEIGHT, SvxWeightItem],
      [S.SID_ATTR_CHAR_CJK_FONT, 10887, H.RES_CHRATR_CJK_FONT, SvxFontItem],
      [S.SID_ATTR_CHAR_CJK_FONTHEIGHT, 10888, H.RES_CHRATR_CJK_FONTSIZE, SvxFontHeightItem],
      [S.SID_ATTR_CHAR_CJK_POSTURE, 10890, H.RES_CHRATR_CJK_POSTURE, SvxPostureItem],
      [S.SID_ATTR_CHAR_CJK_WEIGHT, 10891, H.RES_CHRATR_CJK_WEIGHT, SvxWeightItem],
      [S.SID_ATTR_CHAR_CTL_FONT, 10892, H.RES_CHRATR_CTL_FONT, SvxFontItem],
      [S.SID_ATTR_CHAR_CTL_FONTHEIGHT, 10893, H.RES_CHRATR_CTL_FONTSIZE, SvxFontHeightItem],
      [S.SID_ATTR_CHAR_CTL_POSTURE, 10895, H.RES_CHRATR_CTL_POSTURE, SvxPostureItem],
      [S.SID_ATTR_CHAR_CTL_WEIGHT, 10896, H.RES_CHRATR_CTL_WEIGHT, SvxWeightItem],
      [S.SID_ATTR_CHAR_UNDERLINE, 10014, H.RES_CHRATR_UNDERLINE, SvxUnderlineItem],
      [S.SID_ATTR_CHAR_STRIKEOUT, 10013, H.RES_CHRATR_CROSSEDOUT, SvxCrossedOutItem],
      [S.SID_ATTR_CHAR_WORDLINEMODE, 10011, H.RES_CHRATR_WORDLINEMODE, SvxWordLineModeItem],
      [S.SID_ATTR_CHAR_AUTOKERN, 10067, H.RES_CHRATR_AUTOKERN, SvxAutoKernItem],
    ] as const) {
      expect(declared).toBe(slot);
      expect(pool.GetWhichIDFromSlotID(slot)).toBe(which);
      expect(pool.GetSlotId(which)).toBe(slot);
      expect(pool.GetPoolDefaultItem(pool.GetWhichIDFromSlotID(slot))).toBeInstanceOf(type);
    }
  } finally {
    doc.Dispose();
  }
});

it("lets a generic preview consume inherited script-specific attributes using slots alone", /** Uses the actual document style owner and pool without Writer-specific knowledge at the consuming lookup. @returns Nothing. */ () => {
  const doc = new SwDoc();
  try {
    const parent = doc.MakeTextFormatColl("Parent", doc.GetDfltTextFormatColl(), "slot-parent");
    parent.SetFormatAttr(new SvxPostureItem(FontItalic.ITALIC_NORMAL, H.RES_CHRATR_CJK_POSTURE));
    parent.SetFormatAttr(new SvxWeightItem(FontWeight.WEIGHT_BOLD, H.RES_CHRATR_CTL_WEIGHT));
    const child = doc.MakeTextFormatColl("Child", parent, "slot-child");
    child.SetFormatAttr(new SvxFontHeightItem(480, 100, H.RES_CHRATR_CJK_FONTSIZE));
    const preview = getParagraphStyleItemSetForPreview(doc, child.id);
    expect((preview?.GetItem(10890) as SvxPostureItem).GetPosture()).toBe(FontItalic.ITALIC_NORMAL);
    expect((preview?.GetItem(10896) as SvxWeightItem).GetWeight()).toBe(FontWeight.WEIGHT_BOLD);
    expect((preview?.GetItem(10888) as SvxFontHeightItem).GetHeight()).toBe(480);
  } finally {
    doc.Dispose();
  }
});
