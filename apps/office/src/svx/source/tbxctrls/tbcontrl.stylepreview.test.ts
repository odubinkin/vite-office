/** @fileoverview Native style preview helpers over actual pooled items and inheritance; device conversions are explicit protocol fixtures, not renderer parity evidence. */
import { expect, it, vi } from "vitest";
import { SfxItemPool } from "../../../svl/source/items/itempool";
import { SfxItemSet } from "../../../svl/source/items/itemset";
import { Font } from "../../../vcl/source/font/font";
import { FontFamily, FontPitch, FontWeight, FontItalic } from "../../../tools/inc/fontenum";
import { MapUnit } from "../../../tools/inc/mapunit";
import { Size } from "../../../tools/inc/gen";
import { SvxFontItem } from "../../../editeng/inc/fontitem";
import { SvxFontHeightItem } from "../../../editeng/inc/fhgtitem";
import { SvxPostureItem } from "../../../editeng/inc/postitem";
import { SvxWeightItem } from "../../../editeng/inc/wghtitem";
import {
  SID_ATTR_CHAR_FONT as FONT,
  SID_ATTR_CHAR_FONTHEIGHT as HEIGHT,
  SID_ATTR_CHAR_POSTURE as POSTURE,
  SID_ATTR_CHAR_WEIGHT as WEIGHT,
} from "../../../editeng/inc/editids";
import {
  setStylePreviewFontName,
  setStylePreviewFontSize,
  setStylePreviewFontStyle,
} from "./tbcontrl.stylepreview";

/** Creates a real pool with four native typed slot defaults and parent/child sets. @returns Actual value owners. */
function fixture() {
  const pool = new SfxItemPool();
  pool.RegisterDefaultItem(
    new SvxFontItem(
      FontFamily.FAMILY_ROMAN,
      "Default family",
      "Regular",
      FontPitch.PITCH_FIXED,
      10,
      1,
    ),
    undefined,
    FONT,
  );
  pool.RegisterDefaultItem(new SvxFontHeightItem(240, 100, 2), undefined, HEIGHT);
  pool.RegisterDefaultItem(new SvxPostureItem(FontItalic.ITALIC_NONE, 3), undefined, POSTURE);
  pool.RegisterDefaultItem(new SvxWeightItem(FontWeight.WEIGHT_NORMAL, 4), undefined, WEIGHT);
  const parent = new SfxItemSet(pool, [[1, 4]]);
  const child = new SfxItemSet(pool, [[1, 4]], parent);
  return { pool, parent, child, font: new Font() };
}

it("copies default and inherited font names without copying the other three FontItem fields", /** Retains the source helper's deliberately narrower assignment. @returns Nothing. */ () => {
  const f = fixture();
  expect(setStylePreviewFontName(f.child, FONT, f.font)).toBe(true);
  expect([f.font.GetFamilyName(), f.font.GetStyleName()]).toEqual(["Default family", "Regular"]);
  expect([f.font.GetFamilyType(), f.font.GetPitch(), f.font.GetCharSet()]).toEqual([0, 0, 0]);
  f.parent.Put(
    new SvxFontItem(FontFamily.FAMILY_SWISS, "Parent", "Bold", FontPitch.PITCH_VARIABLE, 12, 1),
  );
  expect(setStylePreviewFontName(f.child, FONT, f.font)).toBe(true);
  expect([f.font.GetFamilyName(), f.font.GetStyleName()]).toEqual(["Parent", "Bold"]);
  f.child.Put(new SvxFontItem(1));
  expect(setStylePreviewFontName(f.child, FONT, f.font)).toBe(true);
  expect(f.font.GetFamilyName()).toBe("");
});

it.each(["unknown", "invalid", "disabled"] as const)(
  "retains the font for %s names and sizes",
  /** Actual state lookup precedes any item cast or device request. @param state - Native unavailable state. @returns Nothing. */ (
    state,
  ) => {
    const f = fixture();
    f.font.SetFamilyName("Retained");
    f.font.SetFontSize(new Size(7, 19));
    let nameSlot: number = FONT,
      heightSlot: number = HEIGHT;
    if (state === "unknown") {
      nameSlot = 20000;
      heightSlot = 20001;
    } else if (state === "invalid") {
      f.child.InvalidateItem(1);
      f.child.InvalidateItem(2);
    } else {
      f.child.DisableItem(1);
      f.child.DisableItem(2);
    }
    const convert = vi.fn(
      /** Explicit unused device conversion. @returns Fixture size. */ () => new Size(0, 16),
    );
    expect(setStylePreviewFontName(f.child, nameSlot, f.font)).toBe(false);
    expect(setStylePreviewFontSize(f.child, heightSlot, f.font, MapUnit.MapTwip, convert)).toBe(
      false,
    );
    expect(f.font.GetFamilyName()).toBe("Retained");
    expect([f.font.GetAverageFontWidth(), f.font.GetFontHeight()]).toEqual([7, 19]);
    expect(convert).not.toHaveBeenCalled();
  },
);

it("passes absolute inherited height and the actual shell map unit to LogicToPixel", /** The relative percentage is not reapplied and zero-valued map units are present. @returns Nothing. */ () => {
  const f = fixture();
  f.parent.Put(new SvxFontHeightItem(360, 150, 2));
  const convert = vi.fn(
    /** Explicit device output for inspected native input. @returns Fixture pixel size. */ () =>
      new Size(3, 24),
  );
  expect(setStylePreviewFontSize(f.child, HEIGHT, f.font, undefined, convert)).toBe(false);
  expect(convert).not.toHaveBeenCalled();
  expect(setStylePreviewFontSize(f.child, HEIGHT, f.font, MapUnit.Map100thMM, convert)).toBe(true);
  // SvxFontHeightItem already applied its 150 percent in construction; the helper must not apply it twice.
  expect(convert.mock.calls[0]).toEqual([new Size(0, 540), MapUnit.Map100thMM]);
  expect([f.font.GetAverageFontWidth(), f.font.GetFontHeight()]).toEqual([3, 24]);
  const before = new Font(f.font);
  expect(setStylePreviewFontSize(f.child, HEIGHT, f.font, undefined, convert)).toBe(false);
  expect(f.font.Equals(before)).toBe(true);
});

it("assigns posture before weight and resolves the two slots independently", /** Actual Font setters observe source ordering without a synthetic font protocol. @returns Nothing. */ () => {
  const f = fixture();
  f.parent.Put(new SvxPostureItem(FontItalic.ITALIC_OBLIQUE, 3));
  f.parent.Put(new SvxWeightItem(FontWeight.WEIGHT_BOLD, 4));
  const italic = vi.spyOn(f.font, "SetItalic"),
    weight = vi.spyOn(f.font, "SetWeight");
  setStylePreviewFontStyle(f.child, POSTURE, WEIGHT, f.font);
  expect([f.font.GetItalic(), f.font.GetWeight()]).toEqual([
    FontItalic.ITALIC_OBLIQUE,
    FontWeight.WEIGHT_BOLD,
  ]);
  expect(italic.mock.invocationCallOrder[0]).toBeLessThan(
    weight.mock.invocationCallOrder[0] as number,
  );
  italic.mockClear();
  weight.mockClear();
  f.child.DisableItem(3);
  f.child.Put(new SvxWeightItem(FontWeight.WEIGHT_LIGHT, 4));
  setStylePreviewFontStyle(f.child, POSTURE, WEIGHT, f.font);
  expect(italic).not.toHaveBeenCalled();
  expect(f.font.GetWeight()).toBe(FontWeight.WEIGHT_LIGHT);
  italic.mockClear();
  weight.mockClear();
  f.child.ClearItem(3);
  f.child.InvalidateItem(4);
  setStylePreviewFontStyle(f.child, POSTURE, WEIGHT, f.font);
  expect(f.font.GetItalic()).toBe(FontItalic.ITALIC_OBLIQUE);
  expect(weight).not.toHaveBeenCalled();
});
