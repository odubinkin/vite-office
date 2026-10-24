/** @fileoverview Native style preview helpers over actual pooled items and inheritance; device conversions are explicit protocol fixtures, not renderer parity evidence. */
import { expect, it, vi } from "vitest";
import { SfxItemPool } from "../../../svl/source/items/itempool";
import { SfxItemSet } from "../../../svl/source/items/itemset";
import { Font } from "../../../vcl/source/font/font";
import { FontFamily, FontPitch, FontWeight, FontItalic } from "../../../tools/inc/fontenum";
import { MapUnit } from "../../../tools/inc/mapunit";
import { Size, type ReadonlySize } from "../../../tools/inc/gen";
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
  setStylePreviewFontDecorations,
  setupStylePreviewFonts,
} from "./tbcontrl.stylepreview";
import * as slots from "../../../editeng/inc/editids";
import { SvxContourItem } from "../../../editeng/inc/contouritem";
import { SvxShadowedItem } from "../../../editeng/inc/shdditem";
import { SvxCharReliefItem } from "../../../editeng/inc/charreliefitem";
import { SvxUnderlineItem, SvxOverlineItem } from "../../../editeng/inc/udlnitem";
import { SvxCrossedOutItem } from "../../../editeng/inc/crossedoutitem";
import { SvxEmphasisMarkItem } from "../../../editeng/inc/emphasismarkitem";
import { FontLineStyle, FontStrikeout, FontEmphasisMark } from "../../../tools/inc/fontenum";
import { FontRelief } from "../../../vcl/inc/fntstyle";

it("copies inherited, local and default decoration items into all actual script fonts", /** Uses real item pools and native slot identities, without a parallel style store. @returns Nothing. */ () => {
  const pool = new SfxItemPool();
  const defaults = [
    new SvxContourItem(false, 1),
    new SvxShadowedItem(false, 2),
    new SvxCharReliefItem(FontRelief.NONE, 3),
    new SvxUnderlineItem(FontLineStyle.LINESTYLE_NONE, 4),
    new SvxOverlineItem(FontLineStyle.LINESTYLE_NONE, 5),
    new SvxCrossedOutItem(FontStrikeout.STRIKEOUT_NONE, 6),
    new SvxEmphasisMarkItem(FontEmphasisMark.NONE, 7),
  ];
  const declared = [
    slots.SID_ATTR_CHAR_CONTOUR,
    slots.SID_ATTR_CHAR_SHADOWED,
    slots.SID_ATTR_CHAR_RELIEF,
    slots.SID_ATTR_CHAR_UNDERLINE,
    slots.SID_ATTR_CHAR_OVERLINE,
    slots.SID_ATTR_CHAR_STRIKEOUT,
    slots.SID_ATTR_CHAR_EMPHASISMARK,
  ];
  expect(declared).toEqual([10012, 10010, 10920, 10014, 11568, 10013, 10899]);
  for (const [index, item] of defaults.entries())
    pool.RegisterDefaultItem(item, undefined, declared[index]);
  const parent = new SfxItemSet(pool, [[1, 7]]),
    child = new SfxItemSet(pool, [[1, 7]], parent);
  parent.Put(new SvxContourItem(true, 1));
  parent.Put(new SvxShadowedItem(true, 2));
  parent.Put(new SvxCharReliefItem(FontRelief.Embossed, 3));
  parent.Put(new SvxUnderlineItem(FontLineStyle.LINESTYLE_DOUBLE, 4));
  parent.Put(new SvxOverlineItem(FontLineStyle.LINESTYLE_BOLD, 5));
  parent.Put(new SvxCrossedOutItem(FontStrikeout.STRIKEOUT_SLASH, 6));
  parent.Put(new SvxEmphasisMarkItem(FontEmphasisMark.Accent | FontEmphasisMark.PosAbove, 7));
  child.Put(new SvxUnderlineItem(FontLineStyle.LINESTYLE_WAVE, 4));
  const latin = new Font(),
    asian = new Font(),
    complex = new Font();
  latin.SetFamilyName("Latin");
  asian.SetFamilyName("Asian");
  complex.SetFamilyName("Complex");
  setStylePreviewFontDecorations(child, latin, asian, complex);
  for (const font of [latin, asian, complex])
    expect([
      font.IsOutline(),
      font.IsShadow(),
      font.GetRelief(),
      font.GetUnderline(),
      font.GetOverline(),
      font.GetStrikeout(),
      font.GetEmphasisMark(),
    ]).toEqual([true, true, 1, 10, 12, 5, 4100]);
  expect([latin.GetFamilyName(), asian.GetFamilyName(), complex.GetFamilyName()]).toEqual([
    "Latin",
    "Asian",
    "Complex",
  ]);
  const empty = new SfxItemSet(pool, [[1, 7]]);
  setStylePreviewFontDecorations(empty, latin, asian, complex);
  for (const font of [latin, asian, complex])
    expect([
      font.IsOutline(),
      font.IsShadow(),
      font.GetRelief(),
      font.GetUnderline(),
      font.GetOverline(),
      font.GetStrikeout(),
      font.GetEmphasisMark(),
    ]).toEqual([false, false, 0, 0, 0, 0, 0]);
  for (const id of [1, 3, 5, 7]) child.InvalidateItem(id);
  for (const id of [2, 4, 6]) child.DisableItem(id);
  for (const font of [latin, asian, complex]) {
    font.SetOutline(true);
    font.SetShadow(true);
    font.SetRelief(FontRelief.Engraved);
    font.SetUnderline(FontLineStyle.LINESTYLE_DOUBLE);
    font.SetOverline(FontLineStyle.LINESTYLE_DOUBLE);
    font.SetStrikeout(FontStrikeout.STRIKEOUT_DOUBLE);
    font.SetEmphasisMark(FontEmphasisMark.Circle);
  }
  const before = [new Font(latin), new Font(asian), new Font(complex)];
  setStylePreviewFontDecorations(child, latin, asian, complex);
  for (const [index, font] of [latin, asian, complex].entries())
    expect(font.Equals(before[index] as Font)).toBe(true);
});

it("retains existing script decoration values when the pool does not know the slots", /** Missing optional items must not reset a previously prepared font. @returns Nothing. */ () => {
  const set = new SfxItemSet(new SfxItemPool(), [[1, 7]]),
    font = new Font();
  font.SetOutline(true);
  font.SetShadow(true);
  font.SetUnderline(FontLineStyle.LINESTYLE_BOLD);
  const before = new Font(font);
  const asian = new Font(font),
    complex = new Font(font);
  setStylePreviewFontDecorations(set, font, asian, complex);
  expect(font.Equals(before)).toBe(true);
  expect(asian.Equals(before)).toBe(true);
  expect(complex.Equals(before)).toBe(true);
});

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

it("commits source optional members only after both assignments and retains other script identities", /** Uses real item-state transitions and the actual source short-circuit ordering across consecutive rows. @returns Nothing. */ () => {
  const pool = new SfxItemPool();
  const groups = [
    [
      slots.SID_ATTR_CHAR_FONT,
      slots.SID_ATTR_CHAR_FONTHEIGHT,
      slots.SID_ATTR_CHAR_POSTURE,
      slots.SID_ATTR_CHAR_WEIGHT,
    ],
    [
      slots.SID_ATTR_CHAR_CJK_FONT,
      slots.SID_ATTR_CHAR_CJK_FONTHEIGHT,
      slots.SID_ATTR_CHAR_CJK_POSTURE,
      slots.SID_ATTR_CHAR_CJK_WEIGHT,
    ],
    [
      slots.SID_ATTR_CHAR_CTL_FONT,
      slots.SID_ATTR_CHAR_CTL_FONTHEIGHT,
      slots.SID_ATTR_CHAR_CTL_POSTURE,
      slots.SID_ATTR_CHAR_CTL_WEIGHT,
    ],
  ] as const;
  for (const [index, group] of groups.entries()) {
    const offset = index * 4;
    pool.RegisterDefaultItem(
      new SvxFontItem(
        FontFamily.FAMILY_ROMAN,
        `Family${index}`,
        "Regular",
        FontPitch.PITCH_VARIABLE,
        0,
        offset + 1,
      ),
      undefined,
      group[0],
    );
    pool.RegisterDefaultItem(
      new SvxFontHeightItem(240 + index * 60, 100, offset + 2),
      undefined,
      group[1],
    );
    pool.RegisterDefaultItem(
      new SvxPostureItem(FontItalic.ITALIC_NONE, offset + 3),
      undefined,
      group[2],
    );
    pool.RegisterDefaultItem(
      new SvxWeightItem(FontWeight.WEIGHT_NORMAL, offset + 4),
      undefined,
      group[3],
    );
  }
  const parent = new SfxItemSet(pool, [[1, 12]]),
    child = new SfxItemSet(pool, [[1, 12]], parent);
  parent.Put(new SvxWeightItem(FontWeight.WEIGHT_BOLD, 4));
  parent.Put(new SvxPostureItem(FontItalic.ITALIC_OBLIQUE, 11));
  const convert = vi.fn(
    /** Explicit real-device protocol observation,not a CSS DPI guess. @param size - Native logical size. @param unit - Actual shell map unit. @returns Test device pixel size. */
    (size: ReadonlySize, unit: MapUnit) => {
      expect(unit).toBe(MapUnit.MapTwip);
      return new Size(0, size.Height() / 15);
    },
  );
  const first = setupStylePreviewFonts(child, {}, MapUnit.MapTwip, convert);
  expect([
    first.latin?.GetFamilyName(),
    first.asian?.GetFamilyName(),
    first.complex?.GetFamilyName(),
  ]).toEqual(["Family0", "Family1", "Family2"]);
  expect([
    first.latin?.GetFontHeight(),
    first.asian?.GetFontHeight(),
    first.complex?.GetFontHeight(),
  ]).toEqual([16, 20, 24]);
  expect(first.latin?.GetWeight()).toBe(FontWeight.WEIGHT_BOLD);
  expect(first.complex?.GetItalic()).toBe(FontItalic.ITALIC_OBLIQUE);
  expect(first.asian?.GetWeight()).toBe(FontWeight.WEIGHT_NORMAL);
  convert.mockClear();
  const noShell = setupStylePreviewFonts(child, first, undefined, convert);
  expect(noShell).toEqual(first);
  expect(noShell.latin).toBe(first.latin);
  expect(noShell.asian).toBe(first.asian);
  expect(noShell.complex).toBe(first.complex);
  expect(convert).not.toHaveBeenCalled();
  // Each AND condition preserves both native short-circuit branches.
  child.DisableItem(1);
  child.InvalidateItem(6);
  child.DisableItem(9);
  const retained = setupStylePreviewFonts(child, first, MapUnit.MapTwip, convert);
  expect(retained.latin).toBe(first.latin);
  expect(retained.asian).toBe(first.asian);
  expect(retained.complex).toBe(first.complex);
  expect(convert).not.toHaveBeenCalled();
  child.ClearItem(1);
  child.ClearItem(6);
  child.ClearItem(9);
  child.DisableItem(2);
  child.DisableItem(5);
  child.DisableItem(10);
  const retainedOther = setupStylePreviewFonts(child, first, MapUnit.MapTwip, convert);
  expect(retainedOther.latin).toBe(first.latin);
  expect(retainedOther.asian).toBe(first.asian);
  expect(retainedOther.complex).toBe(first.complex);
  expect(convert).not.toHaveBeenCalled();
  child.ClearItem(2);
  child.ClearItem(5);
  child.ClearItem(10);
  child.Put(
    new SvxFontItem(FontFamily.FAMILY_SWISS, "New Asian", "Bold", FontPitch.PITCH_VARIABLE, 0, 5),
  );
  const next = setupStylePreviewFonts(child, retained, MapUnit.MapTwip, convert);
  expect(next.asian?.GetFamilyName()).toBe("New Asian");
  expect(first.asian?.GetFamilyName()).toBe("Family1");
  expect(next.latin).not.toBe(first.latin);
  expect(next.complex).not.toBe(first.complex);
});
