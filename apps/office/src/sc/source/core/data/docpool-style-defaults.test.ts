/** @fileoverview Native contiguous static cell/page defaults152..176,real item classes,slot identities and unported rich-header boundary. */
import { expect, it } from "vitest";
import { ScDocumentPool } from "./docpool";
import { ItemInfo } from "../../../../svl/source/items/itempool";
import { SfxUInt16Item, SfxUInt32Item } from "../../../../svl/inc/intitem";
import { SfxBoolItem } from "../../../../svl/inc/eitem";
import { SfxStringItem } from "../../../../svl/source/items/stritem";
import { SvxShadowItem } from "../../../../editeng/inc/shaditem";
import { SvxLRSpaceItem } from "../../../../editeng/inc/lrspitem";
import { SvxULSpaceItem } from "../../../../editeng/inc/ulspitem";
import { SvxPageItem, SvxPageUsage } from "../../../../svx/inc/pageitem";
import { SvxPaperBinItem, PAPERBIN_PRINTER_SETTINGS } from "../../../../editeng/inc/pbinitem";
import { SvxSizeItem } from "../../../../editeng/inc/sizeitem";
import { ScCondFormatItem, ScViewObjectModeItem } from "../../../inc/attrib";
import { ScVObjMode } from "../../../inc/global";
import { SvxShadowLocation, SvxNumType } from "../../../../editeng/inc/svxenum";
import { MapUnit } from "../../../../tools/inc/mapunit";
it("registers the original contiguous static prefix and preserves exact slot/default sharing and zero surrogate flags", /** Actual metadata/default owners are shared,not copied into a browser table. @returns Nothing. */ () => {
  const a = new ScDocumentPool(),
    b = new ScDocumentPool(),
    slots = [
      10025, 0, 0, 0, 10048, 10049, 10050, 10054, 10051, 10055, 10056, 10059, 10060, 10061, 11114,
      0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    ],
    infos = Reflect.get(a, "maItemInfos") as readonly ItemInfo[];
  expect([a.GetFirstWhich(), a.GetLastWhich(), a.GetMergedIdRanges()]).toEqual([
    100,
    176,
    [[100, 176]],
  ]);
  for (let which = 152; which <= 176; which++) {
    const item = a.GetPoolDefaultItem(which),
      info = infos[which - 100];
    if (info === undefined) throw Error("Missing source metadata");
    expect(item).toBe(b.GetPoolDefaultItem(which));
    expect(item.Which()).toBe(which);
    expect(item.isStaticDefault()).toBe(true);
    expect(a.GetMetric(which)).toBe(MapUnit.MapTwip);
    expect(info.getItemInfoFlags()).toBe(0);
    expect(info.getSlotID()).toBe(slots[which - 152]);
    expect(a.GetSlotId(which)).toBe(slots[which - 152] || which);
    if (slots[which - 152])
      expect(a.GetWhichIDFromSlotID(slots[which - 152] as number)).toBe(which);
  }
  expect(a.IsInRange(177)).toBe(false);
  expect(
    /** Native rich-header owner is not invented. @returns Never. */ () =>
      a.GetPoolDefaultItem(177),
  ).toThrow();
});
it("retains actual cell-tail values,zero margins,default page metadata,printer tray sentinel and zero paper size", /** Checks literal pinned constructor defaults rather than guessed print settings. @returns Nothing. */ () => {
  const p = new ScDocumentPool(),
    shadow = p.GetPoolDefaultItem(152) as SvxShadowItem;
  expect(shadow).toBeInstanceOf(SvxShadowItem);
  expect([shadow.GetWidth(), shadow.GetLocation()]).toEqual([100, SvxShadowLocation.NONE]);
  expect((p.GetPoolDefaultItem(153) as SfxUInt32Item).GetValue()).toBe(0);
  expect(p.GetPoolDefaultItem(154)).toBeInstanceOf(ScCondFormatItem);
  expect((p.GetPoolDefaultItem(154) as ScCondFormatItem).GetCondFormatData().size()).toBe(0);
  expect((p.GetPoolDefaultItem(155) as SfxStringItem).GetValue()).toBe("");
  const lr = p.GetPoolDefaultItem(156) as SvxLRSpaceItem,
    ul = p.GetPoolDefaultItem(157) as SvxULSpaceItem,
    page = p.GetPoolDefaultItem(158) as SvxPageItem,
    size = p.GetPoolDefaultItem(160) as SvxSizeItem;
  expect([
    lr.GetLeft().m_dValue,
    lr.GetRight().m_dValue,
    lr.GetTextFirstLineOffset().m_dValue,
  ]).toEqual([0, 0, 0]);
  expect([ul.GetUpper(), ul.GetLower(), ul.GetContext()]).toEqual([0, 0, false]);
  expect([page.IsLandscape(), page.GetPageUsage(), page.GetNumType()]).toEqual([
    false,
    SvxPageUsage.All,
    SvxNumType.SVX_NUM_ARABIC,
  ]);
  expect((p.GetPoolDefaultItem(159) as SvxPaperBinItem).GetValue()).toBe(PAPERBIN_PRINTER_SETTINGS);
  expect([size.GetWidth(), size.GetHeight()]).toEqual([0, 0]);
});
it("keeps native page booleans,show modes,scale and page numbers independent of later style overrides", /** Pool scale-to-pages starts at1,while native page-style setup later overrides it to0. @returns Nothing. */ () => {
  const p = new ScDocumentPool();
  for (const [which, value] of [
    [161, false],
    [162, false],
    [163, true],
    [164, true],
    [165, true],
    [166, true],
    [167, false],
    [168, false],
    [169, false],
    [173, true],
  ] as const) {
    const item = p.GetPoolDefaultItem(which);
    expect(item).toBeInstanceOf(SfxBoolItem);
    expect((item as SfxBoolItem).GetValue()).toBe(value);
  }
  for (const which of [170, 171, 172]) {
    expect(p.GetPoolDefaultItem(which)).toBeInstanceOf(ScViewObjectModeItem);
    expect((p.GetPoolDefaultItem(which) as ScViewObjectModeItem).GetValue()).toBe(
      ScVObjMode.VOBJ_MODE_SHOW,
    );
  }
  expect(
    [174, 175, 176].map(
      /** Reads actual scalar defaults. @param which - Identity. @returns Native unsigned value. */ (
        which,
      ) => (p.GetPoolDefaultItem(which) as SfxUInt16Item).GetValue(),
    ),
  ).toEqual([100, 1, 1]);
});
