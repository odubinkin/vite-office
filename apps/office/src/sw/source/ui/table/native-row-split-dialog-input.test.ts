/** @fileoverview Verifies direct native row-split dialog input, source indeterminate fallback and saved widget ownership. */
import { expect, it } from "vitest";
import { SwDoc } from "../../core/doc/doc";
import { SwTextFlowPage } from "./tabledlg";
import { SwFormatRowSplit } from "../../../inc/fmtrowsplt";
import { SwFormatLayoutSplit } from "../../../inc/fmtlsplt";
import { RES_ROW_SPLIT } from "../../../inc/hintids";
import { SfxItemSet } from "../../../../svl/source/items/itemset";
/** Constructs original native rows with contradictory dialog input available. @returns Original native owners. */
function fixture() {
  const doc = new SwDoc(),
    table = doc.nodes.MakeTableNode("NativeRowInput");
  table.AddColumnWidth(3000);
  const first = doc.nodes.AppendTableRow(table, 1, { rowSplit: new SwFormatRowSplit(false) }),
    last = doc.nodes.AppendTableRow(table, 1, { rowSplit: new SwFormatRowSplit(true) });
  return { doc, table, first, last };
}
it.each(["false", "true", "default", "unknown", "invalid", "disabled", "inherited"])(
  "native Text Flow uses direct row input with indeterminate fallback for %s",
  /** Checks source Which129 direct input instead of selected-row projection. @param state - Input state. @returns Nothing. */ (
    state,
  ) => {
    const f = fixture(),
      input = new SfxItemSet(
        f.doc.GetAttrPool(),
        state === "unknown" ? [[120, 120]] : [[129, 129]],
      ),
      parent = new SfxItemSet(f.doc.GetAttrPool(), [[129, 129]]),
      output = new SfxItemSet(f.doc.GetAttrPool(), [[1, 32767]]),
      box = f.first.GetTabBoxes()[0];
    if (box === undefined) throw Error("Missing native selected row box");
    parent.Put(new SwFormatRowSplit(false));
    input.SetParent(parent);
    if (state === "false" || state === "true") input.Put(new SwFormatRowSplit(state === "true"));
    if (state === "default") input.SetParent(undefined);
    if (state === "invalid") input.InvalidateItem(129);
    if (state === "disabled") input.DisableItem(129);
    const expected = state === "false" ? false : state === "true" ? true : undefined,
      page = new SwTextFlowPage(f.table, [box], input);
    try {
      expect(page.GetRowSplitState()).toBe(expected);
      expect(page.IsRowSplitSensitive()).toBe(true);
      expect(page.FillItemSet(output)).toEqual({});
      expect(output.Count()).toBe(0);
      page.SplitHdl_Impl(false);
      expect(page.GetRowSplitState()).toBe(expected);
      expect(page.IsRowSplitSensitive()).toBe(false);
      page.SetRowSplitState(expected !== true);
      expect(page.FillItemSet(output)).toEqual({ layoutSplit: false, rowSplit: expected !== true });
      expect(output.GetItemIfSet(RES_ROW_SPLIT, false)).toBeInstanceOf(SwFormatRowSplit);
      expect((output.Get(129) as SwFormatRowSplit).GetValue()).toBe(expected !== true);
      page.Reset();
      expect(page.GetRowSplitState()).toBe(expected);
      expect(page.IsRowSplitSensitive()).toBe(true);
      expect(page.FillItemSet()).toEqual({});
      expect(f.first.GetRowSplit().GetValue()).toBe(false);
      expect(f.last.GetRowSplit().GetValue()).toBe(true);
      expect(f.doc.GetUndoManager().GetUndoActionCount()).toBe(0);
    } finally {
      f.doc.Dispose();
    }
  },
);
it("input-free native row projection retains original selected, whole, foreign and empty owners", /** Checks supported original-owner construction separately from authoritative dialog input. @returns Nothing. */ () => {
  const f = fixture(),
    first = f.first.GetTabBoxes()[0],
    last = f.last.GetTabBoxes()[0];
  if (first === undefined || last === undefined) throw Error("Missing original row owners");
  try {
    expect(new SwTextFlowPage(f.table, [first]).GetRowSplitState()).toBe(false);
    expect(new SwTextFlowPage(f.table, [last]).GetRowSplitState()).toBe(true);
    expect(new SwTextFlowPage(f.table).GetRowSplitState()).toBeUndefined();
    expect(new SwTextFlowPage(f.table, []).GetRowSplitState()).toBeUndefined();
    const empty = f.doc.nodes.MakeTableNode("Empty");
    expect(new SwTextFlowPage(empty).GetRowSplitState()).toBeUndefined();
    expect(new SwTextFlowPage(empty, [first]).GetRowSplitState()).toBeUndefined();
    const input = new SfxItemSet(f.doc.GetAttrPool(), [[120, 129]]);
    input.Put(new SwFormatRowSplit(true));
    input.Put(new SwFormatLayoutSplit(false));
    const page = new SwTextFlowPage(f.table, [first], input);
    expect(page.GetRowSplitState()).toBe(true);
    expect(page.IsRowSplitSensitive()).toBe(false);
    expect(page.FillItemSet()).toEqual({});
  } finally {
    f.doc.Dispose();
  }
});
