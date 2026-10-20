/** @fileoverview Actual complete EditEngine pool registration,source metadata,static versus dynamic defaults and shared item-set ownership. */
import { expect, it } from "vitest";
import * as EditEngine from "../../inc/editeng";
import { EditEngineItemPool } from "../../inc/editdoc";
import { getItemInfoPackageEditEngine } from "./eerdll";
import { ItemInfo, ItemInfoDynamic } from "../../../svl/source/items/itempool";
import { SfxItemSet, SfxItemState } from "../../../svl/source/items/itemset";
import { SfxBoolItem } from "../../../svl/inc/eitem";
import { SvxNumBulletItem, SvxNumRuleType } from "../../inc/numitem";
import { SvxFontItem } from "../../inc/fontitem";
import { SvxBulletItem } from "../../inc/bulletitem";
import { SvxLineSpacingItem } from "../../inc/lspcitem";
import { SvxTabStopItem } from "../../inc/tstpitem";
import { SvxFontHeightItem } from "../../inc/fhgtitem";
import { SvxLanguageItem } from "../../inc/langitem";
import { SvxColorItem } from "../../inc/colritem";
import { SvxFontVariationsItem } from "../../inc/fontvariationsitem";
import { SvxFieldItem, SvxFieldData } from "../items/flditem";
import { SvxAdjustItem } from "../../inc/adjustitem";
import { SvxAdjust, SvxLineSpaceRule, SvxInterLineSpaceRule } from "../../inc/svxenum";
import { SfxInt16Item } from "../../../svl/inc/intitem";
import { COL_AUTO, COL_RED } from "../../../tools/inc/color";
import { LANGUAGE_DONTKNOW } from "../../../i18nlangtag/inc/lang";
import { MapUnit } from "../../../tools/inc/mapunit";
import { text } from "../../../i18nlangtag/source/isolang/isolang.tables";
import * as EE from "../../inc/eeitem";

it("registers every original Which,slot and surrogate flag with actual static and pool-local defaults", /** Fixed native metadata numbers come from the pinned header expressions;no test double or local registry describes the expected values. @returns Nothing. */ () => {
  const a = EditEngine.CreatePool(),
    b = EditEngine.CreatePool();
  expect(a).toBeInstanceOf(EditEngineItemPool);
  expect(text(a.GetName())).toBe("EditEngineItemPool");
  expect([a.GetFirstWhich(), a.GetLastWhich(), a.GetMergedIdRanges()]).toEqual([
    4021,
    4081,
    [[4021, 4081]],
  ]);
  const slots = [
    10944, 0, 10902, 10903, 10901, 10855, 0, 0, 0, 0, 0, 10300, 10250, 10048, 10049, 10033, 10027,
    10002, 11569, 11572, 10946, 10017, 10007, 10015, 10911, 10009, 10014, 10013, 10008, 10012,
    10010, 10021, 10067, 10018, 10011, 10020, 10889, 10894, 10887, 10892, 10888, 10893, 10891,
    10896, 10890, 10895, 10899, 10920, 0, 11568, 10019, 11142, 11153, 10904, 10016, 11581, 11582, 0,
    0, 10877, 10363,
  ];
  const surrogate = new Set([1, 21, 22, 38, 39, 48]);
  const infos = Reflect.get(a, "maItemInfos") as readonly ItemInfo[];
  expect(infos).toHaveLength(61);
  expect(EE.EDITITEMCOUNT).toBe(61);
  for (let index = 0; index < 61; index++) {
    const which = 4021 + index,
      info = infos[index] as ItemInfo,
      item = a.GetPoolDefaultItem(which);
    expect(info.getWhich()).toBe(which);
    expect(item.Which()).toBe(which);
    expect(info.getSlotID()).toBe(slots[index]);
    expect(info.getItemInfoFlags()).toBe(surrogate.has(index) ? 1 : 0);
    expect(a.GetSlotId(which)).toBe(slots[index] || which);
    if (slots[index]) expect(a.GetWhichIDFromSlotID(slots[index] as number)).toBe(which);
    expect(a.GetMetric(which)).toBe(MapUnit.MapTwip);
    if (which === EE.EE_PARA_NUMBULLET) {
      expect(info).toBeInstanceOf(ItemInfoDynamic);
      expect(item.isDynamicDefault()).toBe(true);
      expect(item.isStaticDefault()).toBe(false);
      expect(item).not.toBe(b.GetPoolDefaultItem(which));
    } else {
      expect(item.isStaticDefault()).toBe(true);
      expect(item.isDynamicDefault()).toBe(false);
      expect(item).toBe(b.GetPoolDefaultItem(which));
    }
  }
  const pack = getItemInfoPackageEditEngine();
  expect(pack).toBe(getItemInfoPackageEditEngine());
  expect(pack.size()).toBe(61);
  expect(pack.getItemInfo(0, a)).toBe(pack.getItemInfo(0, b));
  expect(pack.getItemInfo(5, a)).not.toBe(pack.getItemInfo(5, a));
  expect(a.IsInRange(4020)).toBe(false);
  expect(a.IsInRange(4082)).toBe(false);
});

it("retains the source EditEngine paragraph defaults that deliberately differ from Calc document defaults", /** Real constructors keep zero line height,empty tabs and source true/false choices. @returns Nothing. */ () => {
  const pool = new EditEngineItemPool();
  for (const [which, value] of [
    [EE.EE_PARA_FORBIDDENRULES, true],
    [EE.EE_PARA_ASIANCJKSPACING, true],
    [EE.EE_PARA_HYPHENATE, false],
    [EE.EE_PARA_HYPHENATE_NO_CAPS, false],
    [EE.EE_PARA_HYPHENATE_NO_LAST_WORD, false],
    [EE.EE_PARA_BULLETSTATE, true],
    [EE.EE_PARA_AUTOWRITINGDIR, true],
  ] as const)
    expect((pool.GetPoolDefaultItem(which) as SfxBoolItem).GetValue()).toBe(value);
  expect((pool.GetPoolDefaultItem(EE.EE_PARA_OUTLLEVEL) as SfxInt16Item).GetValue()).toBe(-1);
  const spacing = pool.GetPoolDefaultItem(EE.EE_PARA_SBL) as SvxLineSpacingItem;
  expect([
    spacing.GetLineHeight(),
    spacing.GetPropLineSpace(),
    spacing.GetInterLineSpace(),
    spacing.GetLineSpaceRule(),
    spacing.GetInterLineSpaceRule(),
  ]).toEqual([0, 100, 0, SvxLineSpaceRule.Auto, SvxInterLineSpaceRule.Off]);
  expect((pool.GetPoolDefaultItem(EE.EE_PARA_TABS) as SvxTabStopItem).Count()).toBe(0);
  expect((pool.GetPoolDefaultItem(EE.EE_PARA_JUST) as SvxAdjustItem).GetAdjust()).toBe(
    SvxAdjust.ParaStart,
  );
  const bullet = pool.GetPoolDefaultItem(EE.EE_PARA_BULLET) as SvxBulletItem;
  expect(bullet).toBeInstanceOf(SvxBulletItem);
  expect(bullet.GetWidth()).toBe(1200);
  expect(bullet.GetFont().GetFamilyName()).toContain(";");
});

it("owns actual source fonts,heights,language sentinels,colors,empty variation vectors and field values", /** Native metadata is read through real shared classes rather than browser records. @returns Nothing. */ () => {
  const pool = new EditEngineItemPool();
  const names = [];
  for (const which of [EE.EE_CHAR_FONTINFO, EE.EE_CHAR_FONTINFO_CJK, EE.EE_CHAR_FONTINFO_CTL]) {
    const font = pool.GetPoolDefaultItem(which) as SvxFontItem;
    expect(font).toBeInstanceOf(SvxFontItem);
    names.push(font.GetFamilyName());
    expect(font.GetStyleName()).toBe("");
  }
  expect(names).toEqual(["Liberation Serif", "Segoe UI", "Tahoma"]);
  for (const which of [EE.EE_CHAR_FONTHEIGHT, EE.EE_CHAR_FONTHEIGHT_CJK, EE.EE_CHAR_FONTHEIGHT_CTL])
    expect((pool.GetPoolDefaultItem(which) as SvxFontHeightItem).GetHeight()).toBe(240);
  for (const which of [EE.EE_CHAR_LANGUAGE, EE.EE_CHAR_LANGUAGE_CJK, EE.EE_CHAR_LANGUAGE_CTL])
    expect((pool.GetPoolDefaultItem(which) as SvxLanguageItem).GetLanguage()).toBe(
      LANGUAGE_DONTKNOW,
    );
  expect(
    (pool.GetPoolDefaultItem(EE.EE_CHAR_COLOR) as SvxColorItem).GetValue().equals(COL_AUTO),
  ).toBe(true);
  expect(
    (pool.GetPoolDefaultItem(EE.EE_FEATURE_NOTCONV) as SvxColorItem).GetValue().equals(COL_RED),
  ).toBe(true);
  const variations = pool.GetPoolDefaultItem(EE.EE_CHAR_FONTVARIATIONS) as SvxFontVariationsItem;
  expect(variations.GetVariations()).toEqual([]);
  expect(variations.supportsHashCode()).toBe(true);
  expect(variations.hashCode()).toBe(0n);
  const field = pool.GetPoolDefaultItem(EE.EE_FEATURE_FIELD) as SvxFieldItem;
  expect(field.GetField()).toBeInstanceOf(SvxFieldData);
  expect(field.GetField()?.GetClassId()).toBe(SvxFieldData.CLASS_ID);
});

it("uses the real dynamic numbering value,owned clone defaults and user-default restoration", /** Cloning retains native base-pool type and does not replace source metadata/default owners. @returns Nothing. */ () => {
  const pool = new EditEngineItemPool(),
    which = EE.EE_PARA_NUMBULLET;
  const item = pool.GetPoolDefaultItem(which) as SvxNumBulletItem;
  expect(item).toBeInstanceOf(SvxNumBulletItem);
  expect(item.GetNumRule().GetLevelCount()).toBe(0);
  expect(item.GetNumRule().GetFeatureFlags()).toBe(0);
  expect(item.GetNumRule().IsContinuousNumbering()).toBe(false);
  expect(item.GetNumRule().GetNumRuleType()).toBe(SvxNumRuleType.NUMBERING);
  pool.SetDefaultMetric(MapUnit.Map100thMM);
  pool.SetUserDefaultItem(new SfxBoolItem(EE.EE_PARA_HYPHENATE, true));
  const clone = pool.Clone();
  expect(clone).not.toBeInstanceOf(EditEngineItemPool);
  const cloned = clone.GetPoolDefaultItem(which) as SvxNumBulletItem;
  expect(cloned).not.toBe(item);
  expect(cloned.equals(item)).toBe(true);
  expect(cloned.isDynamicDefault()).toBe(true);
  expect(clone.GetMetric(which)).toBe(MapUnit.Map100thMM);
  expect((clone.GetUserOrPoolDefaultItem(EE.EE_PARA_HYPHENATE) as SfxBoolItem).GetValue()).toBe(
    true,
  );
  clone.ResetUserDefaultItem(EE.EE_PARA_HYPHENATE);
  expect((clone.GetUserOrPoolDefaultItem(EE.EE_PARA_HYPHENATE) as SfxBoolItem).GetValue()).toBe(
    false,
  );
  expect((pool.GetUserOrPoolDefaultItem(EE.EE_PARA_HYPHENATE) as SfxBoolItem).GetValue()).toBe(
    true,
  );
  const set = new SfxItemSet(pool, [[EE.EE_ITEMS_START, EE.EE_ITEMS_END]]);
  expect(set.GetItemState(EE.EE_CHAR_FONTINFO)).toBe(SfxItemState.DEFAULT);
  expect(set.Get(EE.EE_CHAR_FONTINFO)).toBe(pool.GetPoolDefaultItem(EE.EE_CHAR_FONTINFO));
});
