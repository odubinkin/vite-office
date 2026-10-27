/** @fileoverview Module-global Writer defaults, exact native metadata and independent document user overlays. */
import { assert, expect, it, vi } from "vitest";
import metadata from "./default-metadata.json";
import { SwModule } from "../../uibase/app/swmodule";
import { SwDoc } from "../doc/doc";
import { GetDfltAttr } from "../attr/hints";
import {
  RES_CHRATR_BEGIN,
  RES_CHRATR_FONT,
  RES_CHRATR_CJK_FONT,
  RES_CHRATR_CTL_FONT,
  RES_PARATR_ORPHANS,
  RES_PARATR_WIDOWS,
} from "../../../inc/hintids";
import { SvxFontItem } from "../../../../editeng/inc/fontitem";
import { FontFamily, FontPitch } from "../../../../tools/inc/fontenum";
import { SfxItemSet } from "../../../../svl/source/items/itemset";
import { SfxInt16Item } from "../../../../svl/source/items/intitem";

it("provides the original metadata index/slot/flag table independently of represented default classes", () => {
  const owner = SwModule.get().getItemInfoPackageSwAttributes();
  expect(owner.size()).toBe(163);
  for (const row of metadata) {
    const info = owner.getExistingItemInfo(row.which - RES_CHRATR_BEGIN);
    expect([info.getWhich(), info.getSlotID(), info.getItemInfoFlags()]).toEqual([
      row.which,
      row.slot,
      row.flags,
    ]);
  }
  const slots = owner.getSlotIDToWhichIDMap();
  for (const row of metadata) if (row.slot) expect(slots.get(row.slot)).toBe(row.which);
});
it("uses GetDefaultFonts for module-global fonts before any document construction", () => {
  const font = GetDfltAttr(RES_CHRATR_FONT);
  assert(font instanceof SvxFontItem);
  expect(font.GetFamily()).toBe(FontFamily.FAMILY_ROMAN);
  expect(font.GetPitch()).toBe(FontPitch.PITCH_VARIABLE);
  expect(font.GetStyleName()).toBe("");
  expect(font.isStaticDefault()).toBe(true);
  expect(GetDfltAttr(RES_CHRATR_FONT)).toBe(font);
});
it("shares real static metadata/default identities across documents and pool copies while overrides remain local", () => {
  const first = new SwDoc({ locale: "en-US" }),
    second = new SwDoc({ locale: "ja-JP" });
  try {
    for (const which of [RES_CHRATR_FONT, RES_CHRATR_CJK_FONT, RES_CHRATR_CTL_FONT]) {
      const global = GetDfltAttr(which);
      expect(first.GetAttrPool().GetPoolDefaultItem(which)).toBe(global);
      expect(second.GetAttrPool().GetPoolDefaultItem(which)).toBe(global);
      expect(first.GetAttrPool().Clone().GetPoolDefaultItem(which)).toBe(global);
      expect(first.GetAttrPool().GetUserDefaultItem(which)).not.toBeNull();
      const other = second.GetAttrPool().GetUserDefaultItem(which);
      first.GetAttrPool().ResetUserDefaultItem(which);
      expect(first.GetDefault(which)).toBe(global);
      expect(second.GetAttrPool().GetUserDefaultItem(which)).toBe(other);
    }
    const set = new SfxItemSet(first.GetAttrPool(), [[RES_PARATR_ORPHANS, RES_PARATR_WIDOWS]]);
    try {
      expect(set.Get(RES_PARATR_ORPHANS)).toBe(
        first.GetAttrPool().GetUserOrPoolDefaultItem(RES_PARATR_ORPHANS),
      );
    } finally {
      set.Dispose();
    }
  } finally {
    first.Dispose();
    second.Dispose();
  }
});
it("keeps InitNew's two-line orphan/widow overlay distinct from the zero global pool values", () => {
  const doc = new SwDoc();
  try {
    for (const which of [RES_PARATR_ORPHANS, RES_PARATR_WIDOWS]) {
      const global = GetDfltAttr(which) as SfxInt16Item;
      expect(global.GetValue()).toBe(0);
      expect((doc.GetDefault(which) as SfxInt16Item).GetValue()).toBe(2);
      doc.GetAttrPool().ResetUserDefaultItem(which);
      expect(doc.GetDefault(which)).toBe(global);
    }
  } finally {
    doc.Dispose();
  }
});

it("requires explicit module initialization and retains native replacement/removal ownership", () => {
  const module = new SwModule();
  expect(() => module.getItemInfoPackageSwAttributes()).toThrow("InitItemInfoPackageSwAttributes");
  module.InitItemInfoPackageSwAttributes();
  const first = module.getItemInfoPackageSwAttributes(),
    released = vi.spyOn(first, "Dispose");
  module.InitItemInfoPackageSwAttributes();
  expect(module.getItemInfoPackageSwAttributes()).not.toBe(first);
  expect(released).toHaveBeenCalledTimes(1);
  const second = module.getItemInfoPackageSwAttributes(),
    removed = vi.spyOn(second, "Dispose");
  module.RemoveItemInfoPackageSwAttributes();
  expect(removed).toHaveBeenCalledTimes(1);
  expect(() => module.getItemInfoPackageSwAttributes()).toThrow("InitItemInfoPackageSwAttributes");
  module.RemoveItemInfoPackageSwAttributes();
  expect(removed).toHaveBeenCalledTimes(1);
});
