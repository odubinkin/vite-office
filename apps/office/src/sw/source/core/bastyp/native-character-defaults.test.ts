/** @fileoverview Complete native Writer character defaults on actual module/document/item-set owners; no replacement pool or inferred metadata ranges. */
import { assert, expect, it } from "vitest";
import { SwDoc } from "../doc/doc";
import { GetDfltAttr } from "../attr/hints";
import * as W from "../../../inc/hintids";
import { SwModule } from "../../uibase/app/swmodule";
import { SfxItemSet, SfxItemState } from "../../../../svl/source/items/itemset";
import { SfxBoolItem } from "../../../../svl/inc/eitem";
import { SfxInt16Item } from "../../../../svl/inc/intitem";
import { SfxVoidItem } from "../../../../svl/source/items/voiditem";
import { SfxGrabBagItem } from "../../../../svl/inc/grabbagitem";
import { SvxRsidItem } from "../../../../editeng/inc/rsiditem";
import { SvxCharHiddenItem } from "../../../../editeng/inc/charhiddenitem";
import { SvxNoHyphenItem } from "../../../../editeng/inc/nhypitem";
import { SvxCharRotateItem } from "../../../../editeng/inc/charrotateitem";
import { SvxCharScaleWidthItem } from "../../../../editeng/inc/charscaleitem";
import { SvxFontVariationsItem } from "../../../../editeng/inc/fontvariationsitem";
import { SvxTwoLinesItem } from "../../../../editeng/inc/twolinesitem";
import { SvxShadowItem } from "../../../../editeng/inc/shaditem";
import { SvxShadowLocation } from "../../../../editeng/inc/svxenum";
import metadata from "./default-metadata.json";

it("registers all 48 original character classes, slots and shared static identities on real Writer pools", /** Expected classes follow the original init.cxx table, including three deferred fonts and native unused items. @returns Nothing. */ () => {
  const classes = [
    "SvxCaseMapItem",
    "SvxColorItem",
    "SvxColorItem",
    "SvxContourItem",
    "SvxCrossedOutItem",
    "SvxEscapementItem",
    "SvxFontItem",
    "SvxFontHeightItem",
    "SvxKerningItem",
    "SvxLanguageItem",
    "SvxPostureItem",
    "SfxVoidItem",
    "SvxShadowedItem",
    "SvxUnderlineItem",
    "SvxWeightItem",
    "SvxWordLineModeItem",
    "SvxAutoKernItem",
    "SvxBlinkItem",
    "SvxNoHyphenItem",
    "SfxVoidItem",
    "SvxBrushItem",
    "SvxFontItem",
    "SvxFontHeightItem",
    "SvxLanguageItem",
    "SvxPostureItem",
    "SvxWeightItem",
    "SvxFontItem",
    "SvxFontHeightItem",
    "SvxLanguageItem",
    "SvxPostureItem",
    "SvxWeightItem",
    "SvxCharRotateItem",
    "SvxEmphasisMarkItem",
    "SvxTwoLinesItem",
    "SvxCharScaleWidthItem",
    "SvxCharReliefItem",
    "SvxCharHiddenItem",
    "SvxOverlineItem",
    "SvxRsidItem",
    "SvxBoxItem",
    "SvxShadowItem",
    "SvxBrushItem",
    "SfxGrabBagItem",
    "SfxInt16Item",
    "SfxVoidItem",
    "SvxScriptHintItem",
    "SvxOpticalSizingItem",
    "SvxFontVariationsItem",
  ];
  const first = new SwDoc(),
    second = new SwDoc(),
    pack = SwModule.get().getItemInfoPackageSwAttributes();
  try {
    expect(W.RES_CHRATR_END - W.RES_CHRATR_BEGIN).toBe(48);
    for (let which = W.RES_CHRATR_BEGIN; which < W.RES_CHRATR_END; which++) {
      const item = GetDfltAttr(which),
        row = metadata[which - 1];
      assert(item !== null && row !== undefined);
      expect(item.constructor.name).toBe(classes[which - 1]);
      expect(item.Which()).toBe(which);
      expect(item.isStaticDefault()).toBe(true);
      expect(item.isDynamicDefault()).toBe(false);
      expect(pack.getExistingItemInfo(which - 1).getItem()).toBe(item);
      expect(first.GetAttrPool().GetPoolDefaultItem(which)).toBe(item);
      expect(second.GetAttrPool().GetPoolDefaultItem(which)).toBe(item);
      expect(first.GetAttrPool().GetSlotId(which)).toBe(row.slot || which);
      if (row.slot) expect(first.GetAttrPool().GetWhichIDFromSlotID(row.slot)).toBe(which);
      const clone = item.Clone(first.GetAttrPool());
      assert(clone !== null);
      try {
        expect(clone).not.toBe(item);
        expect(clone.constructor).toBe(item.constructor);
        expect(clone.Which()).toBe(which);
        expect(clone.equals(item)).toBe(true);
      } finally {
        clone.Dispose();
      }
    }
  } finally {
    first.Dispose();
    second.Dispose();
  }
});
it("retains source reset defaults, unsigned revision zero, empty extras and bidi minus one", /** Defaults remain original typed items rather than bool or string substitutes. @returns Nothing. */ () => {
  for (const which of [
    W.RES_CHRATR_CONTOUR,
    W.RES_CHRATR_SHADOWED,
    W.RES_CHRATR_BLINK,
    W.RES_CHRATR_NOHYPHEN,
    W.RES_CHRATR_HIDDEN,
    W.RES_CHRATR_OPTICAL_SIZING,
  ])
    expect((GetDfltAttr(which) as SfxBoolItem).GetValue()).toBe(false);
  expect(GetDfltAttr(W.RES_CHRATR_HIDDEN)).toBeInstanceOf(SvxCharHiddenItem);
  expect(GetDfltAttr(W.RES_CHRATR_NOHYPHEN)).toBeInstanceOf(SvxNoHyphenItem);
  expect((GetDfltAttr(W.RES_CHRATR_RSID) as SvxRsidItem).GetValue()).toBe(0);
  expect((GetDfltAttr(W.RES_CHRATR_BIDIRTL) as SfxInt16Item).GetValue()).toBe(-1);
  for (const which of [W.RES_CHRATR_UNUSED1, W.RES_CHRATR_UNUSED2, W.RES_CHRATR_UNUSED3])
    expect(GetDfltAttr(which)).toBeInstanceOf(SfxVoidItem);
  expect(GetDfltAttr(W.RES_CHRATR_GRABBAG)).toBeInstanceOf(SfxGrabBagItem);
  expect((GetDfltAttr(W.RES_CHRATR_GRABBAG) as SfxGrabBagItem).GetGrabBag()).toEqual(new Map());
  expect(
    (GetDfltAttr(W.RES_CHRATR_FONT_VARIATIONS) as SvxFontVariationsItem).GetVariations(),
  ).toEqual([]);
  expect((GetDfltAttr(W.RES_CHRATR_SCALEW) as SvxCharScaleWidthItem).GetValue()).toBe(100);
  const rotation = GetDfltAttr(W.RES_CHRATR_ROTATE) as SvxCharRotateItem,
    twoLines = GetDfltAttr(W.RES_CHRATR_TWO_LINES) as SvxTwoLinesItem,
    shadow = GetDfltAttr(W.RES_CHRATR_SHADOW) as SvxShadowItem;
  expect(rotation.GetValue()).toBe(0);
  expect(rotation.IsFitToLine()).toBe(false);
  expect(twoLines.GetValue()).toBe(false);
  expect([twoLines.GetStartBracket(), twoLines.GetEndBracket()]).toEqual([0, 0]);
  expect([shadow.GetWidth(), shadow.GetLocation()]).toEqual([100, SvxShadowLocation.NONE]);
});
it("applies, inherits and resets real character defaults independently of direct formatting", /** Exercises the actual native document/set default path used by styles and importer attributes. @returns Nothing. */ () => {
  const first = new SwDoc(),
    second = new SwDoc(),
    set = new SfxItemSet(first.GetAttrPool(), [[W.RES_CHRATR_BEGIN, W.RES_CHRATR_END - 1]]),
    hidden = new SvxCharHiddenItem(true, W.RES_CHRATR_HIDDEN);
  try {
    expect(set.GetItemState(W.RES_CHRATR_HIDDEN, false)).toBe(SfxItemState.DEFAULT);
    expect((set.Get(W.RES_CHRATR_HIDDEN) as SvxCharHiddenItem).GetValue()).toBe(false);
    first.SetDefault(hidden);
    expect((set.Get(W.RES_CHRATR_HIDDEN) as SvxCharHiddenItem).GetValue()).toBe(true);
    expect((second.GetDefault(W.RES_CHRATR_HIDDEN) as SvxCharHiddenItem).GetValue()).toBe(false);
    const direct = new SvxCharHiddenItem(false, W.RES_CHRATR_HIDDEN);
    try {
      set.Put(direct);
    } finally {
      direct.Dispose();
    }
    expect(set.GetItemState(W.RES_CHRATR_HIDDEN, false)).toBe(SfxItemState.SET);
    expect((set.Get(W.RES_CHRATR_HIDDEN) as SvxCharHiddenItem).GetValue()).toBe(false);
    set.ClearItem(W.RES_CHRATR_HIDDEN);
    expect((set.Get(W.RES_CHRATR_HIDDEN) as SvxCharHiddenItem).GetValue()).toBe(true);
    first.GetAttrPool().ResetUserDefaultItem(W.RES_CHRATR_HIDDEN);
    expect(set.Get(W.RES_CHRATR_HIDDEN)).toBe(GetDfltAttr(W.RES_CHRATR_HIDDEN));
  } finally {
    hidden.Dispose();
    set.Dispose();
    first.Dispose();
    second.Dispose();
  }
});
