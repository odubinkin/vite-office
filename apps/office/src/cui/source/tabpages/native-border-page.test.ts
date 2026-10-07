/** @fileoverview Verifies native border-page presets, metric rules, ownership and separate item deltas. */
import { expect, it } from "vitest";
import { SvxBorderTabPage } from "./border";
import {
  SvxBoxItem,
  SvxBoxInfoItem,
  SvxBoxInfoItemValidFlags as Valid,
} from "../../../editeng/source/items/frmitems";
import {
  SvxBorderLine,
  SvxBorderLineStyle as Style,
} from "../../../editeng/source/items/borderline";
import { SfxItemPool } from "../../../svl/source/items/itempool";
import { SfxItemSet } from "../../../svl/source/items/itemset";
import { SID_ATTR_BORDER_INNER as INNER } from "../../../svx/inc/svxids";
import {
  FrameBorderType as Edge,
  FrameBorderState as State,
} from "../../../svx/source/dialog/frmsel";
const BOX = 1;
it("source preset restores Solid when a selected arrangement follows None", /** Checks native selection-gated fallback while empty arrangements retain None. @returns Nothing. */ () => {
  const f = fixture(),
    page = new SvxBorderTabPage(f.input, BOX);
  page.SelStyleHdl_Impl(Style.NONE);
  page.SelPreHdl_Impl(1);
  expect(page.GetLineStyle()).toBe(Style.NONE);
  page.SelPreHdl_Impl(2);
  expect(page.GetLineStyle()).toBe(Style.SOLID);
  expect(page.frameSelector.GetFrameBorderState(Edge.Top)).toBe(State.Show);
});
/** Creates an independent native pool and explicit original items. @param horizontal - Inner horizontal enabled. @param vertical - Inner vertical enabled. @param distance - Padding enabled. @returns Native original items. */
function fixture(horizontal = true, vertical = true, distance = true) {
  const pool = new SfxItemPool(),
    box = new SvxBoxItem(BOX),
    info = new SvxBoxInfoItem(INNER);
  info.EnableHor(horizontal);
  info.EnableVer(vertical);
  info.SetDist(distance);
  info.SetMinDist(true);
  info.SetDefDist(28);
  pool.RegisterDefaultItem(box);
  pool.RegisterDefaultItem(info);
  const input = new SfxItemSet(pool, [
    [BOX, BOX],
    [INNER, INNER],
  ]);
  input.Put(box);
  input.Put(info);
  return { input, box, info, pool };
}
/** Resolves page output without fabricating an omitted native item. @param page - Native owner. @param input - Original native set. @returns Original-plus-delta items. */
function output(page: SvxBorderTabPage, input: SfxItemSet) {
  const delta = input.Clone(false),
    changed = page.FillItemSet(delta);
  return {
    delta,
    changed,
    box: (delta.GetItemIfSet(BOX) ?? input.Get(BOX)) as SvxBoxItem,
    info: (delta.GetItemIfSet(INNER) ?? input.Get(INNER)) as SvxBoxInfoItem,
  };
}
const nativePresets = [
  {
    horizontal: false,
    vertical: false,
    states: [
      [0, 0, 0, 0, 0, 0],
      [1, 1, 1, 1, 0, 0],
      [1, 1, 0, 0, 0, 0],
      [0, 0, 1, 1, 0, 0],
      [1, 0, 0, 0, 0, 0],
    ],
  },
  {
    horizontal: true,
    vertical: false,
    states: [
      [0, 0, 0, 0, 0, 0],
      [1, 1, 1, 1, 0, 0],
      [0, 0, 1, 1, 1, 0],
      [1, 1, 1, 1, 1, 0],
      [1, 1, 1, 1, 2, 0],
    ],
  },
  {
    horizontal: false,
    vertical: true,
    states: [
      [0, 0, 0, 0, 0, 0],
      [1, 1, 1, 1, 0, 0],
      [1, 1, 0, 0, 0, 1],
      [1, 1, 1, 1, 0, 1],
      [1, 1, 1, 1, 0, 2],
    ],
  },
  {
    horizontal: true,
    vertical: true,
    states: [
      [0, 0, 0, 0, 0, 0],
      [1, 1, 1, 1, 0, 0],
      [1, 1, 1, 1, 1, 0],
      [1, 1, 1, 1, 1, 1],
      [1, 1, 1, 1, 2, 2],
    ],
  },
];
for (const profile of nativePresets)
  for (let preset = 1; preset <= 5; preset++)
    it(`native arrangement h=${profile.horizontal} v=${profile.vertical} preset=${preset}`, /** Checks literal source preset state matrix and component output. @returns Nothing. */ () => {
      const f = fixture(profile.horizontal, profile.vertical),
        page = new SvxBorderTabPage(f.input, BOX);
      expect(page.GetPresetNames()).toHaveLength(5);
      expect(page.GetPreset()).toBeUndefined();
      page.SelPreHdl_Impl(preset);
      expect(page.GetPreset()).toBe(preset);
      const result = output(page, f.input),
        lines = [
          result.box.GetLeft(),
          result.box.GetRight(),
          result.box.GetTop(),
          result.box.GetBottom(),
          result.info.GetHori(),
          result.info.GetVert(),
        ],
        flags = [Valid.LEFT, Valid.RIGHT, Valid.TOP, Valid.BOTTOM, Valid.HORI, Valid.VERT];
      for (let index = 0; index < 6; index++) {
        const expected = (profile.states[preset - 1] as readonly number[])[index];
        expect(lines[index]?.GetWidth() ?? 0).toBe(expected === 1 ? 1 : 0);
        expect(result.info.IsValid(flags[index] as Valid)).toBe(expected !== 2);
      }
      expect(result.info.IsHor()).toBe(profile.horizontal);
      expect(result.info.IsVer()).toBe(profile.vertical);
      expect(
        [0, 1, 2, 3].map(
          /** Reads actual output distance. @param edge - Box edge. @returns Twips. */ (edge) =>
            result.box.GetDistance(edge),
        ),
      ).toEqual(preset === 1 ? [0, 0, 0, 0] : [28, 28, 28, 28]);
    });
it("source FillItemSet publishes info-only without unchanged outer box or edited widget", /** Checks explicit-input source publication and independent ownership. @returns Nothing. */ () => {
  const f = fixture(),
    page = new SvxBorderTabPage(f.input, BOX),
    result = output(page, f.input);
  expect(result.changed).toBe(true);
  expect(result.delta.GetItemIfSet(BOX)).toBeUndefined();
  expect(result.info.IsMinDist()).toBe(false);
  expect(result.info.GetDefDist()).toBe(0);
  expect(f.info.IsMinDist()).toBe(true);
  expect((f.input.Get(INNER) as SvxBoxInfoItem).GetDefDist()).toBe(28);
  result.info.SetLine(new SvxBorderLine(1, 10), 0);
  expect((f.input.Get(INNER) as SvxBoxInfoItem).GetHori()).toBeUndefined();
});
it("default-state equal border items clear output entries while preserving native policies", /** Checks source default-state equality clearing. @returns Nothing. */ () => {
  const f = fixture(),
    original = f.input.Clone(false),
    page = new SvxBorderTabPage(original, BOX),
    delta = f.input.Clone();
  expect(page.FillItemSet(delta)).toBe(false);
  expect(delta.Count()).toBe(0);
});
it("default-state edited box retains source info minimum/default and emits actual item differences", /** Checks default versus explicit policy branches. @returns Nothing. */ () => {
  const f = fixture(),
    original = f.input.Clone(false),
    page = new SvxBorderTabPage(original, BOX);
  page.SelPreHdl_Impl(2);
  const result = output(page, original);
  expect(result.changed).toBe(true);
  expect(result.box.GetTop()?.GetWidth()).toBe(1);
  expect(result.info.GetDefDist()).toBe(28);
  expect(result.info.IsMinDist()).toBe(true);
});
it("source independent distance fields retain exact saved native metrics through border edits", /** Checks source conversion-error avoidance and synchronize behavior. @returns Nothing. */ () => {
  const f = fixture();
  for (const edge of [0, 1, 2, 3]) f.box.SetDistance(100 + edge * 37, edge);
  f.input.Put(f.box);
  const page = new SvxBorderTabPage(f.input, BOX);
  expect(page.IsSynchronized()).toBe(false);
  expect(
    [0, 1, 2, 3].map(
      /** Reads displayed native distance. @param edge - Box edge. @returns Twips. */ (edge) =>
        page.GetDistance(edge),
    ),
  ).toEqual([100, 137, 174, 211]);
  page.SelPreHdl_Impl(4);
  let result = output(page, f.input);
  expect(
    [0, 1, 2, 3].map(
      /** Reads unchanged native output metrics. @param edge - Box edge. @returns Twips. */ (
        edge,
      ) => result.box.GetDistance(edge),
    ),
  ).toEqual([100, 137, 174, 211]);
  page.ModifyDistanceHdl_Impl(2, 333);
  expect(page.GetDistance(3)).toBe(211);
  page.SyncHdl_Impl(true);
  expect(page.GetDistance(3)).toBe(211);
  page.ModifyDistanceHdl_Impl(1, 72);
  result = output(page, f.input);
  expect(
    [0, 1, 2, 3].map(
      /** Reads synchronized native metrics. @param edge - Box edge. @returns Twips. */ (edge) =>
        result.box.GetDistance(edge),
    ),
  ).toEqual([72, 72, 72, 72]);
  page.Reset();
  expect(page.IsSynchronized()).toBe(false);
  expect(page.GetDistance(2)).toBe(174);
});
it("mixed native distance/line input retains dontcare validity while explicit outer change uses zero metrics", /** Checks source mixed input, partial flags and exact output. @returns Nothing. */ () => {
  const f = fixture();
  f.info.SetValid(Valid.TOP, false);
  f.info.SetValid(Valid.DISTANCE, false);
  f.box.SetLine(new SvxBorderLine(0x345678, 20), 1);
  f.input.Put(f.box);
  f.input.Put(f.info);
  const page = new SvxBorderTabPage(f.input, BOX);
  expect(page.frameSelector.GetFrameBorderState(Edge.Top)).toBe(State.DontCare);
  expect(page.GetDistance(0)).toBe(0);
  page.frameSelector.MouseButtonDown([Edge.Left]);
  page.LinesChanged_Impl();
  const result = output(page, f.input);
  expect(result.info.IsValid(Valid.TOP)).toBe(false);
  expect(result.info.IsValid(Valid.DISTANCE)).toBe(true);
  expect(result.box.GetLeft()?.GetWidth()).toBe(20);
  expect(result.box.GetBottom()?.GetColor()).toBe(0x345678);
  expect(result.box.GetDistance(0)).toBe(0);
});
it("native uniform visible lines select together; unequal lines retain cache changes without altering them", /** Checks selected-line-only style/color edits and Reset ownership. @returns Nothing. */ () => {
  const f = fixture();
  for (const edge of [0, 1, 2, 3])
    f.box.SetLine(new SvxBorderLine(0xabcdef, 30, Style.DOUBLE), edge);
  f.input.Put(f.box);
  const page = new SvxBorderTabPage(f.input, BOX);
  expect(page.GetLineStyle()).toBe(Style.DOUBLE);
  expect(page.GetLineWidth()).toBe(150);
  expect(page.GetLineColor()).toBe(0xabcdef);
  page.SelColHdl_Impl(0x123456);
  expect(output(page, f.input).box.GetTop()?.GetColor()).toBe(0x123456);
  page.Reset();
  expect(page.GetLineColor()).toBe(0xabcdef);
  f.box.SetLine(new SvxBorderLine(1, 45), 1);
  f.input.Put(f.box);
  const mixed = new SvxBorderTabPage(f.input, BOX);
  expect(mixed.GetLineStyle()).toBe(Style.SOLID);
  expect(mixed.GetLineColor()).toBe(0);
  expect(mixed.GetLineWidth()).toBe(5);
  mixed.SelColHdl_Impl(0x888888);
  mixed.ModifyWidthMFHdl_Impl(200);
  expect(output(mixed, f.input).box.GetBottom()?.GetWidth()).toBe(45);
});
for (const style of [
  Style.NONE,
  Style.SOLID,
  Style.DOTTED,
  Style.DASHED,
  Style.DOUBLE,
  Style.THINTHICK_SMALLGAP,
  Style.THINTHICK_MEDIUMGAP,
  Style.THINTHICK_LARGEGAP,
  Style.THICKTHIN_SMALLGAP,
  Style.THICKTHIN_MEDIUMGAP,
  Style.THICKTHIN_LARGEGAP,
  Style.EMBOSSED,
  Style.ENGRAVED,
  Style.OUTSET,
  Style.INSET,
  Style.FINE_DASHED,
  Style.DOUBLE_THIN,
  Style.DASH_DOT,
  Style.DASH_DOT_DOT,
])
  it(`native style transition from minimum solid width style=${style}`, /** Checks literal source automatic minimum and DOUBLE_THIN width rules. @returns Nothing. */ () => {
    const f = fixture(),
      page = new SvxBorderTabPage(f.input, BOX);
    page.ModifyWidthLBHdl_Impl(75);
    page.SelStyleHdl_Impl(style);
    const expected =
      style === Style.DOUBLE_THIN
        ? 150
        : style === Style.THINTHICK_SMALLGAP || style === Style.THICKTHIN_SMALLGAP
          ? 100
          : style === Style.OUTSET || style === Style.INSET
            ? 50
            : style === Style.NONE
              ? 5
              : 75;
    expect(page.GetLineWidth()).toBe(expected);
    expect(page.GetLineStyle()).toBe(style);
    expect(page.GetLineStyles()).toEqual([
      0, 1, 2, 14, 16, 17, 3, 15, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13,
    ]);
    expect(page.GetLineWidths()).toEqual(
      style === Style.DOUBLE_THIN ? [150, 225, 450] : [5, 50, 75, 150, 225, 450],
    );
  });
it("custom native DOUBLE_THIN width clamps at 1.10pt and restores thickness choices", /** Checks custom spinner and bounded native metrics. @returns Nothing. */ () => {
  const f = fixture(),
    page = new SvxBorderTabPage(f.input, BOX);
  page.SelPreHdl_Impl(4);
  page.ModifyWidthLBHdl_Impl(-1);
  expect(page.IsCustomWidth()).toBe(true);
  expect(page.GetLineWidth()).toBe(5);
  page.ModifyWidthMFHdl_Impl(100);
  page.SelStyleHdl_Impl(Style.DOUBLE_THIN);
  expect(page.GetLineWidth()).toBe(110);
  expect(page.frameSelector.GetFrameBorderStyle(Edge.Top)?.GetWidth()).toBe(20);
  page.ModifyWidthMFHdl_Impl(1);
  expect(page.GetLineWidth()).toBe(110);
  expect(page.frameSelector.GetFrameBorderStyle(Edge.Top)?.GetWidth()).toBe(22);
  page.SelStyleHdl_Impl(Style.SOLID);
  page.ModifyWidthMFHdl_Impl(1000);
  expect(page.GetLineWidth()).toBe(900);
  page.ModifyDistanceHdl_Impl(0, -1);
  expect(page.GetDistance(0)).toBe(0);
  page.ModifyDistanceHdl_Impl(0, 99999);
  expect(page.GetDistance(0)).toBe(2835);
});
it("source invalid box input shows empty distance fields and admits later partial editing", /** Checks empty native edits and unsupported original outer state. @returns Nothing. */ () => {
  const f = fixture();
  f.input.InvalidateItem(BOX);
  const page = new SvxBorderTabPage(f.input, BOX);
  expect(page.GetDistance(0)).toBeUndefined();
  const empty = f.input.Clone(false);
  expect(page.FillItemSet(empty)).toBe(true);
  expect((empty.Get(BOX) as SvxBoxItem).GetDistance(0)).toBe(0);
  page.SyncHdl_Impl(false);
  page.ModifyDistanceHdl_Impl(1, 100);
  const delta = f.input.Clone(false);
  page.FillItemSet(delta);
  expect((delta.Get(BOX) as SvxBoxItem).GetDistance(1)).toBe(100);
  expect((delta.Get(BOX) as SvxBoxItem).GetDistance(2)).toBe(0);
});
it("source unknown info disables padding and source DISABLE suppresses dontcare cycling", /** Checks native unknown item and explicit flags. @returns Nothing. */ () => {
  const f = fixture(false, false, false),
    onlyBox = new SfxItemSet(f.pool, [[BOX, BOX]]);
  onlyBox.Put(f.box);
  const page = new SvxBorderTabPage(onlyBox, BOX);
  expect(page.IsDistanceVisible()).toBe(false);
  expect(page.frameSelector.SupportsDontCareState()).toBe(true);
  f.info.SetValid(Valid.DISABLE);
  f.input.Put(f.info);
  const disabled = new SvxBorderTabPage(f.input, BOX);
  expect(disabled.frameSelector.SupportsDontCareState()).toBe(false);
  disabled.SelPreHdl_Impl(2);
  const result = output(disabled, f.input);
  expect(result.info.IsDist()).toBe(false);
  expect(result.box.GetDistance(0)).toBe(0);
});
