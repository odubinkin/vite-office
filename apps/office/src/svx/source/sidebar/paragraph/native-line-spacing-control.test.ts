/** @fileoverview Literal native popup mode/default/transition contracts and actual numeric owners. */
import { expect, it, vi } from "vitest";
import { ParaLineSpacingControl as Control, LINE_SPACING_MODES } from "./ParaLineSpacingControl";
import { SvxLineSpacingItem } from "../../../../editeng/inc/lspcitem";
import { SvxLineSpaceRule as L, SvxInterLineSpaceRule as I } from "../../../../editeng/inc/svxenum";
import { SfxItemState as S } from "../../../../svl/inc/itemset";
import { FieldUnit as F } from "../../../../tools/inc/fldunit";
/** Native item field oracle, including inactive values. @param item - Actual item. @returns Five original fields. */
function values(item: SvxLineSpacingItem) {
  return [
    item.GetLineHeight(),
    item.GetPropLineSpace(),
    item.GetInterLineSpace(),
    item.GetLineSpaceRule(),
    item.GetInterLineSpaceRule(),
  ];
}
it("retains eight original modes and independent original SetLineSpace fields and integer narrowing", /** Uses literal expected original rules. @returns Nothing. */ () => {
  expect(LINE_SPACING_MODES).toEqual([
    "Single",
    "1.15 Lines",
    "1.5 Lines",
    "Double",
    "Proportional",
    "At least",
    "Leading",
    "Fixed",
  ]);
  const expected = [
    [200, 100, 0, L.Auto, I.Off],
    [200, 115, 0, L.Auto, I.Prop],
    [200, 150, 0, L.Auto, I.Prop],
    [200, 200, 0, L.Auto, I.Prop],
    [200, 65535, 0, L.Auto, I.Prop],
    [65535, 100, 0, L.Min, I.Off],
    [200, 100, -1, L.Auto, I.Fix],
    [65535, 100, 0, L.Fix, I.Off],
  ];
  for (let mode = 0; mode < 8; mode++) {
    const item = new SvxLineSpacingItem(200, 10033);
    Control.SetLineSpace(item, mode, -1);
    expect(values(item)).toEqual(expected[mode]);
  }
  const item = new SvxLineSpacingItem(200, 10033);
  Control.SetLineSpace(item, -1);
  expect(values(item)).toEqual([200, 100, 0, L.Auto, I.Off]);
});
it("initializes every original item mode, resource ranges and actual module units", /** Real numeric controls preserve source conversion. @returns Nothing. */ () => {
  for (let mode = 0; mode < 8; mode++) {
    const item = new SvxLineSpacingItem(200, 10033);
    Control.SetLineSpace(item, mode, mode === 4 ? 137 : 300);
    const control = new Control(F.INCH, S.SET, item, true, vi.fn(), vi.fn());
    expect(control.active).toBe(mode);
    expect(control.GrabFocus()).toBe(mode < 4 ? mode : "mode");
    expect(control.metric.get_unit()).toBe(F.INCH);
    expect(control.percent.get_range(F.NONE)).toEqual([6n, 65535n]);
    if (mode === 4) expect(control.percent.get_value(F.PERCENT)).toBe(137n);
  }
  const item = new SvxLineSpacingItem(200, 10033);
  item.SetPropLineSpace(100);
  expect(new Control(F.CM, S.DEFAULT, item, true, vi.fn(), vi.fn()).active).toBe(0);
});
it("retains actual invalid/disabled initialization and preset-close versus edit-open dispatch", /** Does not replace disabled native preset semantics. @returns Nothing. */ () => {
  const dispatch = vi.fn(),
    close = vi.fn(),
    unknown = new Control(F.CM, S.UNKNOWN, undefined, true, dispatch, close);
  expect(unknown.active).toBe(-1);
  expect(unknown.modeEnabled).toBe(true);
  expect(unknown.valueEnabled).toBe(false);
  unknown.ExecuteLineSpace();
  expect(values(dispatch.mock.calls[0]?.[0] as SvxLineSpacingItem)).toEqual([
    200,
    100,
    0,
    L.Auto,
    I.Off,
  ]);
  unknown.LineSPDistHdl_Impl(4);
  expect(unknown.percent.get_value(F.PERCENT)).toBe(100n);
  expect(close).not.toHaveBeenCalled();
  unknown.percent.set_value(123n, F.PERCENT);
  unknown.LineSPDistAtHdl_Impl();
  expect((dispatch.mock.lastCall?.[0] as SvxLineSpacingItem).GetPropLineSpace()).toBe(123);
  unknown.ExecuteLineSpacing(2);
  expect(close).toHaveBeenCalledOnce();
  expect((dispatch.mock.lastCall?.[0] as SvxLineSpacingItem).GetPropLineSpace()).toBe(150);
  const disabled = new Control(F.CM, S.DISABLED, undefined, true, dispatch, close);
  expect(disabled.active).toBe(0);
  expect(disabled.modeEnabled).toBe(false);
  expect(disabled.percentEmpty).toBe(true);
});
it("retains source zero minimum and28twip fixed transition with283twip repair", /** Minimum-changing side effect, not an invented fixed default. @returns Nothing. */ () => {
  const c = new Control(F.CM, S.SET, new SvxLineSpacingItem(200, 10033), true, vi.fn(), vi.fn());
  c.LineSPDistHdl_Impl(5);
  c.metric.set_value(0n, F.NONE);
  c.LineSPDistHdl_Impl(7);
  expect(c.metric.get_value(F.NONE)).toBe(50n);
  c.metric.set_value(100n, F.NONE);
  c.LineSPDistHdl_Impl(7);
  expect(c.metric.get_value(F.NONE)).toBe(100n);
  c.LineSPDistHdl_Impl(0);
  expect(c.metricEmpty).toBe(true);
  c.LineSPDistHdl_Impl(6);
  expect(c.metric.get_value(F.NONE)).toBe(0n);
});

it("preserves original dimensional narrowing into signed additive spacing", /** Actual source numeric field admits the value before the item narrows. @returns Nothing. */ () => {
  const dispatch = vi.fn(),
    c = new Control(F.CM, S.SET, new SvxLineSpacingItem(200, 10033), true, dispatch, vi.fn());
  c.LineSPDistHdl_Impl(6);
  expect(c.metric.set_text("100 cm", ".", ",")).toBe(true);
  c.LineSPDistAtHdl_Impl();
  expect((dispatch.mock.lastCall?.[0] as SvxLineSpacingItem).GetInterLineSpace()).toBe(-8843);
});

it("retains module map units and original saved empty-field transitions on reinitialization", /** Actual public source control fields and numeric values survive native status updates. @returns Nothing. */ () => {
  const dispatch = vi.fn(),
    item = new SvxLineSpacingItem(300, 10033);
  item.SetLineHeight(300);
  const c = new Control(F.CM, S.DEFAULT, item, false, dispatch, vi.fn());
  expect(c.metric.get_value(F.NONE)).toBe(30n);
  c.ExecuteLineSpace();
  expect((dispatch.mock.lastCall?.[0] as SvxLineSpacingItem).GetLineHeight()).toBe(300);
  c.Initialize(S.DISABLED, undefined, false);
  expect(c.metricEmpty).toBe(true);
  expect(c.modeEnabled).toBe(false);
  c.Initialize(S.INVALID, undefined, false);
  expect(c.active).toBe(-1);
  expect(c.GrabFocus()).toBe("mode");
  c.SelectEntryPos(4);
  c.percent.set_value(137n, F.PERCENT);
  c.SelectEntryPos(4);
  expect(c.percent.get_value(F.PERCENT)).toBe(137n);
  c.SelectEntryPos(6);
  c.SelectEntryPos(0);
  c.SelectEntryPos(5);
  expect(c.metric.get_value(F.NONE)).toBe(0n);
  c.SelectEntryPos(0);
  c.SelectEntryPos(6);
  expect(c.metric.get_value(F.NONE)).toBe(0n);
  expect(new Control(F.CM, S.DEFAULT, undefined, true, dispatch, vi.fn()).active).toBe(-1);
});

it("clamps actual proportional and metric entry at original resource limits before native item narrowing", /** Real parser/range boundaries accept the source field domain. @returns Nothing. */ () => {
  const c = new Control(F.CM, S.SET, new SvxLineSpacingItem(200, 10033), true, vi.fn(), vi.fn());
  c.SelectEntryPos(4);
  expect(c.percent.set_text("1", ".", ",")).toBe(true);
  expect(c.percent.get_value(F.PERCENT)).toBe(6n);
  expect(c.percent.set_text("65536", ".", ",")).toBe(true);
  expect(c.percent.get_value(F.PERCENT)).toBe(65535n);
  c.SelectEntryPos(5);
  expect(c.metric.set_text("10000 cm", ".", ",")).toBe(true);
  expect(c.metric.get_value(F.NONE)).toBe(999900n);
  expect(c.metric.set_text("-1 cm", ".", ",")).toBe(true);
  expect(c.metric.get_value(F.NONE)).toBe(0n);
});
