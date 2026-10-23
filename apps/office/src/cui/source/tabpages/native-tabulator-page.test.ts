/** @fileoverview Literal original CUI tab-page Reset/FillItemSet, source handlers and real native numeric/item owners. */
import { expect, it, vi } from "vitest";
import {
  createTabulatorPage,
  formatTabulatorMetric,
} from "../../browser/tabpages/tabstpge-binding";
import { SvxTabStop, SvxTabStopItem, SvxTabAdjust as A } from "../../../editeng/inc/tstpitem";
import {
  SID_ATTR_TABSTOP as T,
  SID_ATTR_TABSTOP_DEFAULTS as D,
  SID_ATTR_TABSTOP_POS as P,
  SID_ATTR_TABSTOP_OFFSET as O,
  SID_ATTR_LRSPACE as L,
} from "../../../editeng/inc/editids";
import { SvxLRSpaceItem, SvxIndentValue } from "../../../editeng/inc/lrspitem";
import { SfxItemSet } from "../../../svl/inc/itemset";
import { SfxItemPool } from "../../../svl/source/items/itempool";
import { SfxUInt16Item, SfxInt32Item } from "../../../svl/inc/intitem";
import { GetItem, GetOldItem } from "../../../sfx2/source/dialog/SfxTabPage";
import { TabulatorDisableFlags as F } from "../../../svx/inc/flagsdef";
import { MapUnit as M } from "../../../tools/inc/mapunit";
import { FieldUnit as U } from "../../../tools/inc/fldunit";
import { MetricSpinButton, formatMetricUnit } from "../../../vcl/source/weld/MetricSpinButton";
import { setConfiguredSystemLanguage } from "../../../i18nlangtag/source/isolang/mslangid";
const W = 69;
/** Builds an actual original item pool/set with native slot metadata, not a tab-page/provider facade. @param metric - Original pool unit. @param values - Actual tab values. @returns Native input/output and controller. */
function fixture(metric = M.Map100thMM, values: SvxTabStop[] = []) {
  const pool = new SfxItemPool();
  pool.SetDefaultMetric(metric);
  pool.RegisterDefaultItem(new SvxTabStopItem(0, 0, A.Left, W), undefined, T);
  const ranges: readonly (readonly [number, number])[] = [
      [W, W],
      [D, O],
      [L, L],
    ],
    input = new SfxItemSet(pool, ranges),
    tabs = new SvxTabStopItem(0, 0, A.Left, W);
  for (const stop of values) tabs.Insert(stop);
  input.Put(tabs);
  input.Put(new SfxUInt16Item(D, metric === M.MapTwip ? 720 : 1250));
  input.Put(new SfxUInt16Item(P, 0));
  const focus = vi.fn(),
    page = createTabulatorPage(input, U.CM, focus),
    output = new SfxItemSet(pool, ranges);
  return { pool, input, tabs, page, output, focus };
}
/** Reads original independent fields. @param tabs - Actual item. @returns Fields. */
function rows(tabs: SvxTabStopItem): unknown[] {
  return Array.from(
    { length: tabs.Count() },
    /** Reads source values. @param _unused - Slot. @param index - Native index. @returns Complete tab. */ (
      _unused,
      index,
    ) => {
      const t = tabs.At(index);
      return [t.GetTabPos(), t.GetAdjustment(), t.GetDecimal(), t.GetFill()];
    },
  );
}
it("resets actual native rows, strips Default tabs and compares unchanged complete fields", /** Uses literal mm100 resource formatting and native item equality. @returns Nothing. */ () => {
  const f = fixture(M.Map100thMM, [
    new SvxTabStop(500, A.Default),
    new SvxTabStop(1000, A.Decimal, ";", "·"),
    new SvxTabStop(2000, A.Right, ".", "_"),
  ]);
  expect(f.page.GetEntries()).toEqual(["1.00 cm", "2.00 cm"]);
  expect(f.page.selectedType).toBe(A.Decimal);
  expect(f.page.decimalText).toBe(";");
  expect(f.page.fillText).toBe("·");
  expect(f.page.newEnabled).toBe(false);
  expect(f.page.deleteEnabled).toBe(true);
  expect(f.page.FillItemSet(f.output)).toBe(true);
  expect((f.output.Get(W) as SvxTabStopItem).Count()).toBe(2);
  const unchanged = fixture(M.Map100thMM, [new SvxTabStop(1000, A.Center)]);
  expect(unchanged.page.FillItemSet(unchanged.output)).toBe(false);
});
it("keeps pending-new acceptance distinct from explicit zero and restores original default distance when empty", /** Original null New button suppresses0. @returns Nothing. */ () => {
  const f = fixture();
  expect(f.page.entryText).toBe("0.00 cm");
  expect(f.page.FillItemSet(f.output)).toBe(true);
  expect(rows(f.output.Get(W) as SvxTabStopItem)).toEqual([[1250, A.Default, ".", " "]]);
  const explicit = fixture();
  explicit.page.NewHdl_Impl(true);
  expect(explicit.focus).toHaveBeenCalledWith(true);
  explicit.page.FillItemSet(explicit.output);
  expect((explicit.output.Get(W) as SvxTabStopItem).At(0).GetAdjustment()).toBe(A.Left);
  const pending = fixture();
  pending.page.entryText = "2 cm";
  pending.page.ModifyHdl_Impl();
  expect(pending.page.newEnabled).toBe(true);
  pending.page.FillItemSet(pending.output);
  expect((pending.output.Get(W) as SvxTabStopItem).At(0).GetTabPos()).toBe(2000);
});
it("uses original sorted insertion and type/fill/UTF16 focus handlers on the actual current tab", /** Does not normalize first units into codepoints. @returns Nothing. */ () => {
  const f = fixture(M.Map100thMM, [new SvxTabStop(1000), new SvxTabStop(3000)]);
  f.page.entryText = "2 cm";
  f.page.ModifyHdl_Impl();
  f.page.NewHdl_Impl(true);
  expect(f.page.GetEntries()).toEqual(["1.00 cm", "2.00 cm", "3.00 cm"]);
  f.page.TabTypeCheckHdl_Impl(A.Decimal);
  f.page.decimalText = ";extra";
  f.page.GetDezCharHdl_Impl();
  f.page.FillTypeCheckHdl_Impl("other");
  f.page.fillText = "😀";
  f.page.GetFillCharHdl_Impl();
  const tab = f.page.GetTabs().At(1);
  expect(tab.GetDecimal()).toBe(";");
  expect(tab.GetFill()).toBe("\ud83d");
  f.page.decimalText = "\n";
  f.page.GetDezCharHdl_Impl();
  expect(f.page.GetTabs().At(1).GetDecimal()).toBe(";");
  for (const [choice, char] of [
    ["none", " "],
    ["points", "."],
    ["dash", "-"],
    ["solid", "_"],
  ] as const) {
    f.page.FillTypeCheckHdl_Impl(choice);
    expect(f.page.GetTabs().At(1).GetFill()).toBe(char);
  }
  f.page.TabTypeCheckHdl_Impl(A.Left, false);
  expect(f.page.selectedType).toBe(A.Decimal);
  f.page.FillTypeCheckHdl_Impl("points", false);
  expect(f.page.selectedFill).toBe("solid");
});
it("preserves native deletion and Delete All current-field retention instead of resetting hidden metadata", /** Source Init empty path changes radios without firing their user handlers. @returns Nothing. */ () => {
  const f = fixture(M.Map100thMM, [
    new SvxTabStop(1000, A.Decimal, ";", "x"),
    new SvxTabStop(2000, A.Right),
  ]);
  f.page.entryText = "2.00 cm";
  f.page.SelectHdl_Impl();
  f.page.DelHdl_Impl();
  expect(f.page.GetEntries()).toEqual(["1.00 cm"]);
  f.page.entryText = "1.00 cm";
  f.page.SelectHdl_Impl();
  f.page.DelAllHdl_Impl();
  expect(f.page.selectedType).toBe(A.Left);
  expect(f.page.selectedFill).toBe("none");
  expect(f.page.decimalEnabled).toBe(true);
  expect(f.page.fillEnabled).toBe(true);
  f.page.entryText = "3 cm";
  f.page.ModifyHdl_Impl();
  f.page.NewHdl_Impl(true);
  expect(f.page.GetTabs().At(0).GetFill()).toBe("x");
  f.page.DelHdl_Impl();
  expect(f.page.GetEntries()).toEqual([]);
  f.page.DelAllHdl_Impl();
  f.page.entryText = "9 cm";
  f.page.DelHdl_Impl();
  expect(f.page.SelectHdl_Impl()).toBe(true);
});
it("preserves original Writer map/offset conversion, negative-indent null tab and source Modify offset assignment", /** Native input offset is distinct from actual stored tab position. @returns Nothing. */ () => {
  const f = fixture(M.MapTwip, [new SvxTabStop(720, A.Left)]);
  f.input.Put(new SfxInt32Item(O, 360));
  const lr = new SvxLRSpaceItem(L);
  lr.SetTextFirstLineOffset(SvxIndentValue.twips(-100));
  f.input.Put(lr);
  f.page.Reset(f.input);
  expect(f.page.GetEntries()).toEqual(["1.91 cm"]);
  f.page.entryText = "1.91 cm";
  f.page.ModifyHdl_Impl();
  f.page.TabTypeCheckHdl_Impl(A.Right);
  f.page.FillItemSet(f.output);
  const item = f.output.Get(W) as SvxTabStopItem;
  expect(item.At(0).GetTabPos()).toBe(0);
  expect(item.At(0).GetAdjustment()).toBe(A.Default);
  expect(item.At(1).GetTabPos()).toBe(1083);
});
it("retains original any-bit group-disable masks and native old-item parent selection", /** Genuine shared item sets and status fields are used. @returns Nothing. */ () => {
  const f = fixture();
  f.page.DisableControls(F.TypeLeft | F.FillPoint);
  expect(f.page.typeFrameEnabled).toBe(false);
  expect(f.page.fillFrameEnabled).toBe(false);
  expect(f.page.IsControlEnabled(F.TypeLeft)).toBe(false);
  expect(f.page.IsControlEnabled(F.TypeRight)).toBe(true);
  const args = new SfxItemSet(f.pool, [[11032, 11032]]);
  args.Put(new SfxUInt16Item(11032, F.TypeDecimal | F.FillSpecial));
  f.page.PageCreated(args);
  expect(f.page.decimalEnabled).toBe(false);
  expect(f.page.fillEnabled).toBe(false);
  const parent = new SfxItemSet(f.pool, [[W, W]]),
    item = new SvxTabStopItem(0, 0, A.Left, W);
  item.Insert(new SvxTabStop(1000));
  parent.Put(item);
  f.input.SetParent(parent);
  expect(GetOldItem(f.input, f.output, T, true)).toBe(parent.Get(W));
  f.output.SetParent(parent);
  f.output.InvalidateItem(W);
  expect(GetOldItem(f.input, f.output, T)).toBe(parent.Get(W));
  expect(GetItem(f.input, 12345)).toBeUndefined();
  expect(f.page.DeactivatePage()).toBe("LeavePage");
});
it("formats actual bounded numeric fields with native grouping/separators, unit signs and precision", /** Original getNum uses Latin digits and a literal minus. @returns Nothing. */ () => {
  const spin = new MetricSpinButton();
  spin.set_digits(1);
  spin.set_unit(U.POINT);
  spin.set_value(15874n, U.NONE);
  expect(formatTabulatorMetric(spin)).toBe("1,587.4 pt");
  setConfiguredSystemLanguage(1031);
  try {
    expect(formatTabulatorMetric(spin)).toBe("1.587,4 pt");
    spin.set_value(-14n, U.NONE);
    expect(formatTabulatorMetric(spin)).toBe("-1,4 pt");
  } finally {
    setConfiguredSystemLanguage(0);
  }
});

it("retains original non-mm100 Reset loss of independent default distance", /** Constructor-owned target metadata is not silently copied from the temporary source clone. @returns Nothing. */ () => {
  const f = fixture(M.MapTwip, [new SvxTabStop(720)]),
    original = (f.input.Get(W) as SvxTabStopItem).Clone();
  original.SetDefaultDistance(1134);
  f.input.Put(original);
  f.page.Reset(f.input);
  expect(f.page.GetTabs().GetDefaultDistance()).toBe(0);
  expect(f.page.FillItemSet(f.output)).toBe(true);
  const output = f.output.Get(W) as SvxTabStopItem;
  expect(output.GetDefaultDistance()).toBe(0);
  expect(output.At(0).GetTabPos()).toBe(720);
});

it("projects every original stored fill and retains native empty optional creation arguments", /** Exercises real Reset items rather than synthetic widget callbacks. @returns Nothing. */ () => {
  for (const [fill, radio] of [
    [".", "points"],
    ["-", "dash"],
    ["_", "solid"],
    [" ", "none"],
  ] as const) {
    const f = fixture(M.Map100thMM, [new SvxTabStop(1000, A.Left, ",", fill)]);
    expect(f.page.selectedFill).toBe(radio);
    expect(f.page.fillEnabled).toBe(false);
    expect(f.page.fillText).toBe("");
    f.page.DisableControls(F.FillNone);
    expect(f.page.typeFrameEnabled).toBe(true);
    f.page.DisableControls(F.TypeLeft);
    f.page.PageCreated(new SfxItemSet(f.pool, [[11032, 11032]]));
    expect(f.page.typeFrameEnabled).toBe(false);
    expect(f.page.fillFrameEnabled).toBe(false);
  }
  const f = fixture();
  f.page.DisableControls(F.TypeLeft & F.TypeRight);
  expect(f.page.typeFrameEnabled).toBe(true);
  expect(f.page.fillFrameEnabled).toBe(true);
  const empty = new SfxItemSet(f.pool, [[W, W]]);
  expect(GetItem(empty, T)).toBe(f.pool.GetUserOrPoolDefaultItem(W));
  const pool = new SfxItemPool();
  const unmapped = new SfxItemSet(pool, [
    [T, T],
    [D, O],
  ]);
  const page = createTabulatorPage(unmapped, U.CM, vi.fn());
  expect(page.GetEntries()).toEqual([]);
  expect(page.entryText).toBe("0.00 cm");
  expect(GetItem(unmapped, T)).toBeUndefined();
});

it("retains original default-zero insertion inside the page after exchange and its later row-index projection", /** Uses the source hanging-indent exchange followed by original row activation. @returns Nothing. */ () => {
  const f = fixture(M.MapTwip, [new SvxTabStop(720, A.Decimal, ";", ".")]);
  const lr = new SvxLRSpaceItem(L);
  lr.SetTextFirstLineOffset(SvxIndentValue.twips(-100));
  f.input.Put(lr);
  f.page.FillItemSet(f.output);
  expect(f.page.GetEntries()).toEqual(["1.27 cm"]);
  expect(f.page.GetTabs().At(0).GetAdjustment()).toBe(A.Default);
  f.page.SelectHdl_Impl();
  expect(f.page.selectedType).toBe(A.Decimal);
  expect(f.page.decimalEnabled).toBe(false);
  expect(f.page.selectedFill).toBe("none");
});

it("retains original native unit suffix spacing and quote-to-prime conversion for actual unit text", /** Literal MetricToString inputs exercise native scalar formatting without a replacement locale/widget service. @returns Nothing. */ () => {
  for (const [unit, suffix, expected] of [
    [U.NONE, "", "12"],
    [U.DEGREE, "°", "12°"],
    [U.CM, "cm", "12 cm"],
    [U.INCH, '"', "12″"],
    [U.INCH, "″", "12″"],
    [U.INCH, "inch", "12 inch"],
    [U.FOOT, "'", "12′"],
    [U.FOOT, "′", "12′"],
    [U.FOOT, "feet", "12 feet"],
  ] as const)
    expect(formatMetricUnit("12", unit, suffix)).toBe(expected);
  const spin = new MetricSpinButton();
  spin.set_digits(0);
  spin.set_unit(U.NONE);
  spin.set_value(12n, U.NONE);
  expect(formatTabulatorMetric(spin)).toBe("12");
  spin.set_unit(U.FOOT);
  expect(formatTabulatorMetric(spin)).toBe("12′");
});

it("formats existing native variant and countryless Locale fields through the same actual host binding", /** No new locale resources or parser/provider substitutes are introduced. @returns Nothing. */ () => {
  const spin = new MetricSpinButton();
  spin.set_digits(0);
  spin.set_unit(U.NONE);
  spin.set_value(12n, U.NONE);
  try {
    setConfiguredSystemLanguage(35849);
    expect(formatTabulatorMetric(spin)).toBe("12");
    setConfiguredSystemLanguage(255);
    expect(formatTabulatorMetric(spin)).toBe("12");
  } finally {
    setConfiguredSystemLanguage(0);
  }
});

it("retains native offset-inclusive Modify collision and deletion when two visible rows reduce to one item", /** Actual Writer twip/offset values make the source collision exact; no item or widget facade is mutated. @returns Nothing. */ () => {
  const f = fixture(M.MapTwip, [new SvxTabStop(1440, A.Left), new SvxTabStop(2880, A.Left)]);
  f.input.Put(new SfxInt32Item(O, 1440));
  f.page.Reset(f.input);
  expect(f.page.GetEntries()).toEqual(["5.08 cm", "7.62 cm"]);
  f.page.entryText = "5.08 cm";
  f.page.ModifyHdl_Impl();
  f.page.TabTypeCheckHdl_Impl(A.Right);
  expect(f.page.GetTabs().Count()).toBe(1);
  expect(f.page.GetTabs().At(0).GetTabPos()).toBe(5080);
  expect(f.page.GetEntries()).toHaveLength(2);
  f.page.DelHdl_Impl();
  expect(f.page.GetTabs().Count()).toBe(0);
  expect(f.page.GetEntries()).toEqual(["7.62 cm"]);
});

it("synthetic-only: pins the preserved native empty-list deletion body unreachable through ordinary page handlers", /** User-authorized artificial list-removal inconsistency. This tests the retained branch body, not real UI reachability; see WRITER066. @returns Nothing. */ () => {
  const f = fixture(M.MapTwip, [new SvxTabStop(1440, A.Left), new SvxTabStop(2880, A.Left)]);
  f.input.Put(new SfxInt32Item(O, 1440));
  f.page.Reset(f.input);
  f.page.entryText = "5.08 cm";
  f.page.ModifyHdl_Impl();
  f.page.TabTypeCheckHdl_Impl(A.Right);
  expect(f.page.GetTabs().Count()).toBe(1);
  const entries = f.page.GetEntries() as string[];
  expect(entries).toHaveLength(2);
  // DelHdl normally removes exactly one row. Deliberately violate only that
  // list operation for this isolated test; production code/handlers are unchanged.
  const remove = vi.spyOn(entries, "splice").mockImplementationOnce(
    /** Emulates an impossible all-rows removal to enter the preserved branch. @param start - Original removal index. @returns Removed real rows. */
    (start) => Array.prototype.splice.call(entries, start, entries.length),
  );
  try {
    f.page.DelHdl_Impl();
    expect(entries).toEqual([]);
    expect(f.page.GetTabs().Count()).toBe(0);
    expect(f.page.deleteEnabled).toBe(false);
    expect(f.page.newEnabled).toBe(true);
    expect(f.focus).toHaveBeenLastCalledWith(false);
  } finally {
    remove.mockRestore();
  }
});
