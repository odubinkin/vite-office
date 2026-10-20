/** @fileoverview Consumed ScDocumentPool original defaults,static sharing,metric and Which/slot metadata. */
import { expect, it } from "vitest";
import { ScDocumentPool } from "./docpool";
import { text } from "../../../../i18nlangtag/source/isolang/isolang.tables";
import { MapUnit } from "../../../../tools/inc/mapunit";
import { SvxFontHeightItem, SvxFontItem } from "../../../../editeng/source/items/textitem";
it("registers the original contiguous character prefix with source slot IDs and defaults", /** Uses real Sfx default item identity and mappings. @returns Nothing. */ () => {
  const a = new ScDocumentPool(),
    b = new ScDocumentPool();
  expect(text(a.GetName())).toBe("ScDocumentPool");
  expect(a.GetMetric(101)).toBe(MapUnit.MapTwip);
  const slots = [
    10007, 10015, 10009, 10008, 10014, 11568, 10013, 10012, 10010, 10017, 10020, 10887, 10888,
    10891, 10890, 10889, 10892, 10893, 10896, 10895, 10894, 10899, 0, 10011, 10920, 10931, 0, 0,
    10903, 11571, 11569, 10460, 11572, 11570, 10229, 10577, 10578, 10949, 10944, 10230, 11015,
    11013, 11014, 10228, 0, 0, 10085, 0, 10001, 26036, 10024, 10023,
  ];
  for (let i = 0; i < slots.length; i++) {
    const which = i + 100;
    expect(a.GetPoolDefaultItem(which)).toBe(b.GetPoolDefaultItem(which));
    expect(a.GetPoolDefaultItem(which).Which()).toBe(which);
    if (slots[i]) expect(a.GetWhichIDFromSlotID(slots[i] as number)).toBe(which);
  }
  for (const which of [101, 112, 117]) {
    const item = a.GetPoolDefaultItem(which) as SvxFontHeightItem;
    expect([item.GetHeight(), item.GetProp()]).toEqual([200, 100]);
  }
  expect((a.GetPoolDefaultItem(100) as SvxFontItem).GetFamilyName()).not.toBe("");
  expect((a.GetPoolDefaultItem(111) as SvxFontItem).GetFamilyName()).not.toBe("");
  expect((a.GetPoolDefaultItem(116) as SvxFontItem).GetFamilyName()).not.toBe("");
  expect(a.IsInRange(99)).toBe(false);
  expect(a.IsInRange(189)).toBe(false);
  expect(
    /** Rejects an ID beyond the original pool range. @returns Never. */ () =>
      a.GetPoolDefaultItem(189),
  ).toThrow();
});
