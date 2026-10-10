/** @fileoverview Verifies native direct headline input, resource defaults and saved Text Flow output. */
import { expect, it } from "vitest";
import { SwDoc } from "../../core/doc/doc";
import { SwTextFlowPage } from "./tabledlg";
import { SfxItemSet } from "../../../../svl/source/items/itemset";
import { SfxUInt16Item } from "../../../../svl/source/items/intitem";
import { FN_PARAM_TABLE_HEADLINE } from "../../../inc/cmdid";
it.each([0, 1, 3, 120])(
  "direct native headline item is authoritative and preserves raw unchanged count=%s",
  /** Checks native widget bounds and changed-only item ownership. @param count - Native direct count. @returns Nothing. */ (
    count,
  ) => {
    const doc = new SwDoc(),
      table = doc.nodes.MakeTableNode("DirectHeadline", { headerRows: 2, repeatHeaderRows: true }),
      input = new SfxItemSet(doc.GetAttrPool(), [[21150, 21150]]),
      output = new SfxItemSet(doc.GetAttrPool(), [[21150, 21150]]);
    try {
      for (let row = 0; row < 3; row++) doc.nodes.AppendTableRow(table, 1);
      input.Put(new SfxUInt16Item(FN_PARAM_TABLE_HEADLINE, count));
      const page = new SwTextFlowPage(table, undefined, input);
      expect(table.GetRowsToRepeat()).toBe(2);
      expect(page.IsHeadline()).toBe(count > 0);
      expect(page.GetHeaderRowsMinimum()).toBe(1);
      expect(page.GetHeaderRows()).toBe(Math.max(1, Math.min(100, count)));
      expect(page.GetRowsToRepeat()).toBe(count);
      expect(page.FillItemSet(output)).toEqual({});
      expect(output.GetItemIfSet(21150, false)).toBeUndefined();
      input.Put(new SfxUInt16Item(21150, 9));
      table.SetRowsToRepeat(1);
      page.ValueChangedHdl(4);
      page.HeadLineCBClickHdl(true);
      expect(page.FillItemSet(output)).toEqual({ headerRows: 4 });
      expect(output.GetItemIfSet(21150, false)).toBeInstanceOf(SfxUInt16Item);
      expect((output.Get(21150) as SfxUInt16Item).GetValue()).toBe(4);
      page.HeadLineCBClickHdl(false);
      expect(page.GetHeaderRows()).toBe(4);
      expect(page.FillItemSet()).toEqual({ headerRows: 0 });
      page.Reset();
      expect(page.IsHeadline()).toBe(count > 0);
      expect(page.GetRowsToRepeat()).toBe(count);
      expect(page.FillItemSet()).toEqual({});
      expect(table.GetRowsToRepeat()).toBe(1);
    } finally {
      doc.Dispose();
    }
  },
);
it.each(["default", "unknown", "inherited", "invalid", "disabled"])(
  "non-direct native headline input keeps initial source widget state=%s",
  /** Checks direct-only ownership without fallback to inherited input or table. @param state - Item state. @returns Nothing. */ (
    state,
  ) => {
    const doc = new SwDoc(),
      table = doc.nodes.MakeTableNode("AbsentHeadline", { headerRows: 2, repeatHeaderRows: true }),
      input = new SfxItemSet(
        doc.GetAttrPool(),
        state === "unknown" ? [[120, 120]] : [[21150, 21150]],
      ),
      parent = new SfxItemSet(doc.GetAttrPool(), [[21150, 21150]]);
    try {
      for (let row = 0; row < 3; row++) doc.nodes.AppendTableRow(table, 1);
      parent.Put(new SfxUInt16Item(21150, 2));
      if (state === "inherited") input.SetParent(parent);
      if (state === "invalid") input.InvalidateItem(21150);
      if (state === "disabled") input.DisableItem(21150);
      const page = new SwTextFlowPage(table, undefined, input);
      expect(page.IsHeadline()).toBe(false);
      expect(page.IsSensitive()).toBe(false);
      expect(page.GetHeaderRows()).toBe(0);
      expect(page.GetHeaderRowsMinimum()).toBe(0);
      expect(page.GetRowsToRepeat()).toBe(0);
      expect(page.FillItemSet()).toEqual({});
      page.HeadLineCBClickHdl(true);
      page.ValueChangedHdl(-2);
      expect(page.GetHeaderRows()).toBe(0);
      page.ValueChangedHdl(3);
      expect(page.FillItemSet()).toEqual({ headerRows: 3 });
      page.Reset();
      expect(page.IsHeadline()).toBe(true);
      expect(page.GetHeaderRows()).toBe(3);
      expect(page.FillItemSet()).toEqual({ headerRows: 3 });
      expect(table.GetRowsToRepeat()).toBe(2);
    } finally {
      doc.Dispose();
    }
  },
);
it("input-free native construction retains the original table capture", /** Checks existing native owner support and independent Reset snapshot. @returns Nothing. */ () => {
  const doc = new SwDoc(),
    table = doc.nodes.MakeTableNode("OriginalHeadline", { headerRows: 2, repeatHeaderRows: true });
  try {
    for (let row = 0; row < 3; row++) doc.nodes.AppendTableRow(table, 1);
    const page = new SwTextFlowPage(table);
    table.SetRowsToRepeat(1);
    expect(page.GetRowsToRepeat()).toBe(2);
    expect(page.GetHeaderRowsMinimum()).toBe(1);
    page.HeadLineCBClickHdl(false);
    page.Reset();
    expect(page.FillItemSet()).toEqual({});
    expect(page.GetHeaderRows()).toBe(2);
  } finally {
    doc.Dispose();
  }
});
