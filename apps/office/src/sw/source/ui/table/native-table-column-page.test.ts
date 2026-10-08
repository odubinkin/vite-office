/** @fileoverview Verifies source-owned absolute column-page fields, native mode arithmetic, reset ownership and spacing. */
import { expect, it } from "vitest";
import { SwDoc } from "../../core/doc/doc";
import { SwTableRep } from "../../uibase/table/swtablerep";
import { SwTableColumnPage } from "./tabledlg";
import { HoriOrientation as H } from "../../../../offapi/com/sun/star/text/HoriOrientation";
import type { SwTableFormat } from "../../core/table/swtable";
/** Creates authored native columns and the actual shared page owner. @param columns - Original widths. @param format - Native format. @param space - Available width. @returns Original owners. */
function fixture(
  columns = [2000, 2000, 2000],
  format: SwTableFormat = { width: 6000, horiOrient: H.LEFT },
  space = 9000,
) {
  const doc = new SwDoc(),
    table = doc.nodes.MakeTableNode("Columns", format);
  for (const width of columns) table.AddColumnWidth(width);
  const data = new SwTableRep(table, space),
    page = new SwTableColumnPage(data);
  return { doc, table, data, page };
}
it("native column Reset keeps shared draft/vector identity and independent copy flags", /** Checks actual SwTableRep copy and source Reset ownership. @returns Nothing. */ () => {
  const f = fixture(),
    vector = f.data.columns,
    copy = new SwTableRep(f.data);
  expect([copy.IsLineSelected(), copy.HasWidthChanged(), copy.HasColsChanged()]).toEqual([
    false,
    false,
    false,
  ]);
  f.data.SetLineSelected(true);
  f.data.SetWidthChanged();
  f.data.SetColsChanged();
  f.data.left = 123;
  f.data.right = 456;
  f.data.width = 7000;
  f.data.align = H.RIGHT;
  f.data.space = 10000;
  (f.data.columns[0] as { nWidth: number }).nWidth = 3000;
  const assigned = new SwTableRep(f.table, 9000),
    assignedVector = assigned.columns;
  expect(assigned.Assign(f.data)).toBe(assigned);
  expect(assigned.columns).toBe(assignedVector);
  expect(
    assigned.columns.map(
      /** Reads literal native widths. @param column - Native interval. @returns Width. */ (
        column,
      ) => column.nWidth,
    ),
  ).toEqual([3000, 2000, 2000]);
  expect([
    assigned.IsLineSelected(),
    assigned.HasWidthChanged(),
    assigned.HasColsChanged(),
    assigned.left,
    assigned.right,
    assigned.width,
    assigned.space,
    assigned.align,
  ]).toEqual([true, true, true, 123, 456, 7000, 10000, H.RIGHT]);
  expect(
    copy.columns.map(
      /** Reads literal native widths. @param column - Native interval. @returns Width. */ (
        column,
      ) => column.nWidth,
    ),
  ).toEqual([2000, 2000, 2000]);
  expect(copy.columns).not.toBe(vector);
  f.page.Reset();
  expect(f.page.data).toBe(f.data);
  expect(f.data.columns).toBe(vector);
  expect([
    f.data.IsLineSelected(),
    f.data.HasWidthChanged(),
    f.data.HasColsChanged(),
    f.data.width,
    f.data.left,
    f.data.right,
    f.data.space,
    f.data.align,
  ]).toEqual([false, false, false, 6000, 0, 3000, 9000, H.LEFT]);
  expect(f.table.GetColumnWidths()).toEqual([2000, 2000, 2000]);
  expect(f.doc.GetUndoManager().GetUndoActionCount()).toBe(0);
});
it("native five metric slots retain disabled blanks, source bounds and no-op focused guards", /** Checks literal field contracts. @returns Nothing. */ () => {
  const f = fixture([1500], { width: 1500, horiOrient: H.LEFT });
  expect(SwTableColumnPage.MET_FIELDS).toBe(5);
  expect(f.page.GetMinimum()).toBe(23);
  expect(f.page.GetMaximum()).toBe(1500);
  expect(
    [0, 1, 2, 3, 4].map(
      /** Reads native slots. @param slot - Source field. @returns Display value. */ (slot) =>
        f.page.GetFieldValue(slot),
    ),
  ).toEqual([1500, undefined, undefined, undefined, undefined]);
  expect([
    f.page.CanScroll("back"),
    f.page.CanScroll("next"),
    f.page.IsChecked("adapt"),
    f.page.IsChecked("proportional"),
  ]).toEqual([false, false, false, false]);
  f.page.ValueChangedHdl(4, 1000);
  expect(f.page.FillItemSet(4)).toBe(false);
  expect(f.data.HasColsChanged()).toBe(false);
  f.page.ValueChangedHdl(0, 2000);
  expect(
    f.data.columns.map(
      /** Reads literal native widths. @param column - Native interval. @returns Width. */ (
        column,
      ) => column.nWidth,
    ),
  ).toEqual([1500]);
  expect(f.page.FillItemSet(0)).toBe(true);
  expect(f.data.HasColsChanged()).toBe(true);
});
it.each([
  [0, 3500, [3500, 500, 2000]],
  [0, 5990, [5954, 23, 23]],
  [0, 0, [23, 3977, 2000]],
  [2, 3000, [1000, 2000, 3000]],
])(
  "native constant width slot%s input%s balances subsequent original columns",
  /** Checks independent literal source results. @param slot - Authored field. @param value - Requested width. @param expected - Literal widths. @returns Nothing. */ (
    slot,
    value,
    expected,
  ) => {
    const f = fixture();
    f.page.ValueChangedHdl(slot, value);
    expect(
      f.data.columns.map(
        /** Reads literal native widths. @param column - Native interval. @returns Width. */ (
          column,
        ) => column.nWidth,
      ),
    ).toEqual(expected);
    expect(f.page.GetTableWidth()).toBe(6000);
    expect(f.page.GetRemainingSpace()).toBe(3000);
    f.page.DeactivatePage();
    expect(f.data.HasColsChanged()).toBe(true);
    expect(f.data.HasWidthChanged()).toBe(false);
  },
);
it("native inherited narrow minimum and tiny-table two-wrap limit preserve source behavior", /** Checks independent source minimum and small-table remainder. @returns Nothing. */ () => {
  const narrow = fixture([10, 20, 30], { width: 60, horiOrient: H.LEFT });
  expect(narrow.page.GetMinimum()).toBe(10);
  narrow.page.ValueChangedHdl(0, 50);
  expect(
    narrow.data.columns.map(
      /** Reads literal native widths. @param column - Native interval. @returns Width. */ (
        column,
      ) => column.nWidth,
    ),
  ).toEqual([40, 10, 10]);
  const tiny = fixture([1, 1, 1], { width: 1, horiOrient: H.LEFT });
  tiny.page.ValueChangedHdl(0, 1);
  expect(
    tiny.data.columns.map(
      /** Reads literal native widths. @param column - Native interval. @returns Width. */ (
        column,
      ) => column.nWidth,
    ),
  ).toEqual([1, 1, 1]);
  expect(tiny.page.GetTableWidth()).toBe(1);
});
it.each([
  [3000, 7000, [3000, 2000, 2000]],
  [6000, 9000, [5000, 2000, 2000]],
  [500, 4500, [500, 2000, 2000]],
])(
  "native adapt-table input%s resolves width%s",
  /** Checks literal cap and unchanged neighboring columns. @param value - Field. @param width - Actual table width. @param columns - Literal actual widths. @returns Nothing. */ (
    value,
    width,
    columns,
  ) => {
    const f = fixture();
    f.page.ModeHdl("adapt", true);
    f.page.ValueChangedHdl(0, value);
    expect(
      f.data.columns.map(
        /** Reads literal native widths. @param column - Native interval. @returns Width. */ (
          column,
        ) => column.nWidth,
      ),
    ).toEqual(columns);
    expect(f.page.GetTableWidth()).toBe(width);
    expect(f.page.GetMaximum()).toBe(6000);
    f.page.DeactivatePage();
    expect([f.data.width, f.data.right, f.data.HasWidthChanged()]).toEqual([
      width,
      9000 - width,
      true,
    ]);
  },
);
it.each([
  [3000, 9000, [3000, 3000, 3000]],
  [6000, 9000, [3000, 3000, 3000]],
  [23, 69, [23, 23, 23]],
])(
  "native proportional input%s resolves width%s",
  /** Checks literal percentage cap and MINLAY rounding. @param value - Field. @param width - Table width. @param columns - Actual widths. @returns Nothing. */ (
    value,
    width,
    columns,
  ) => {
    const f = fixture();
    f.page.ModeHdl("proportional", true);
    expect(f.page.IsChecked("adapt")).toBe(true);
    expect(f.page.IsSensitive("adapt")).toBe(false);
    f.page.ValueChangedHdl(0, value);
    expect(
      f.data.columns.map(
        /** Reads literal native widths. @param column - Native interval. @returns Width. */ (
          column,
        ) => column.nWidth,
      ),
    ).toEqual(columns);
    expect(f.page.GetTableWidth()).toBe(width);
    f.page.ModeHdl("proportional", false);
    expect(f.page.IsSensitive("adapt")).toBe(true);
    expect(f.page.IsChecked("adapt")).toBe(true);
  },
);
it("native proportional integer rounding and reactivation restore source checkbox sensitivity", /** Checks mode coupling and the source fourth checkbox state after ActivatePage. @returns Nothing. */ () => {
  const f = fixture([1001, 2000, 2999]);
  f.page.ModeHdl("proportional", true);
  f.page.ValueChangedHdl(0, 1101);
  expect(
    f.data.columns.map(
      /** Reads literal native widths. @param column - Native interval. @returns Width. */ (
        column,
      ) => column.nWidth,
    ),
  ).toEqual([1101, 2200, 3299]);
  expect(f.page.GetTableWidth()).toBe(6600);
  f.page.DeactivatePage();
  f.page.ActivatePage();
  expect(f.page.IsSensitive("adapt")).toBe(true);
  f.page.ModeHdl("adapt", false);
  f.page.ValueChangedHdl(0, 1200);
  expect(
    f.data.columns.map(
      /** Reads literal native widths. @param column - Native interval. @returns Width. */ (
        column,
      ) => column.nWidth,
    ),
  ).toEqual([1200, 2200, 3299]);
  expect(f.page.GetTableWidth()).toBe(6600);
});
it("native one-column window moves all five fields and retains source guards", /** Checks seven actual columns through back/next and reset. @returns Nothing. */ () => {
  const f = fixture([100, 200, 300, 400, 500, 600, 700], { width: 2800, horiOrient: H.LEFT });
  f.page.AutoClickHdl("back");
  expect(f.page.GetFieldColumn(0)).toBe(0);
  f.page.AutoClickHdl("next");
  expect(f.page.GetFieldColumn(0)).toBe(1);
  expect(f.page.GetFieldValue(4)).toBe(600);
  f.page.AutoClickHdl("next");
  expect(f.page.GetFieldColumn(4)).toBe(6);
  expect(f.page.CanScroll("next")).toBe(false);
  f.page.AutoClickHdl("next");
  expect(f.page.GetFieldColumn(4)).toBe(6);
  f.page.ValueChangedHdl(4, 800);
  expect(
    f.data.columns.map(
      /** Reads literal native widths. @param column - Native interval. @returns Width. */ (
        column,
      ) => column.nWidth,
    ),
  ).toEqual([23, 177, 300, 400, 500, 600, 800]);
  f.page.AutoClickHdl("back");
  expect(f.page.GetFieldColumn(0)).toBe(1);
  expect(f.page.GetFieldValue(0)).toBe(177);
  f.page.Reset();
  expect(
    f.data.columns.map(
      /** Reads literal native widths. @param column - Native interval. @returns Width. */ (
        column,
      ) => column.nWidth,
    ),
  ).toEqual([100, 200, 300, 400, 500, 600, 700]);
  expect(f.page.GetFieldColumn(0)).toBe(1);
  expect(f.page.GetFieldValue(0)).toBe(100);
});
it.each([H.FULL, H.LEFT])(
  "native selection/automatic mode sensitivity align=%s",
  /** Checks source IsLineSelected admission and activation. @param align - Native align. @returns Nothing. */ (
    align,
  ) => {
    const f = fixture([2000, 2000, 2000], { width: 6000, horiOrient: align });
    f.data.SetLineSelected(true);
    f.page.ModeHdl("proportional", true);
    f.page.ActivatePage();
    expect([
      f.page.IsChecked("adapt"),
      f.page.IsChecked("proportional"),
      f.page.IsSensitive("adapt"),
      f.page.IsSensitive("proportional"),
    ]).toEqual([false, false, false, false]);
    f.data.SetLineSelected(false);
    f.page.ActivatePage();
    expect(f.page.IsSensitive("proportional")).toBe(align !== H.FULL);
    if (align === H.FULL) {
      f.page.ValueChangedHdl(0, 2000);
      f.page.DeactivatePage();
      expect(f.data.HasWidthChanged()).toBe(false);
    } else {
      f.data.width = 6500;
      f.page.ActivatePage();
      expect(f.page.GetTableWidth()).toBe(6500);
      expect(
        f.data.columns.map(
          /** Reads literal native widths. @param column - Native interval. @returns Width. */ (
            column,
          ) => column.nWidth,
        ),
      ).toEqual([2000, 2500, 2000]);
    }
  },
);
it.each([
  [{ width: 6000, horiOrient: H.RIGHT }, 3000, 2000, 0],
  [{ width: 6000, horiOrient: H.CENTER }, 3000, 1000, 1000],
  [{ width: 6000, horiOrient: H.NONE, marginLeft: 1000, marginRight: 2000 }, 3000, 500, 1500],
  [{ width: 6000, horiOrient: H.NONE, marginLeft: 100, marginRight: 2900 }, 3000, 0, 2000],
  [{ width: 6000, horiOrient: H.NONE, marginLeft: 2900, marginRight: 100 }, 3000, 2000, 0],
  [{ width: 6000, horiOrient: H.NONE, marginLeft: 1000, marginRight: 2000 }, 1000, 1500, 2500],
  [{ width: 6000, horiOrient: H.LEFT_AND_WIDTH, marginLeft: 3000 }, 3000, 3000, -1000],
  [{ width: 6000, horiOrient: H.LEFT_AND_WIDTH, marginLeft: 3000 }, 1000, 4000, 0],
  [{ width: 6000, horiOrient: H.INSIDE }, 3000, 0, 0],
] as readonly (readonly [SwTableFormat, number, number, number])[])(
  "native column deactivation reconciles orientation%j",
  /** Checks literal source LR relationships. @param format - Original format. @param value - Input. @param left - Source left. @param right - Source right. @returns Nothing. */ (
    format,
    value,
    left,
    right,
  ) => {
    const f = fixture([2000, 2000, 2000], format);
    f.page.ModeHdl("adapt", true);
    f.page.ValueChangedHdl(0, value);
    f.page.DeactivatePage();
    expect([f.data.left, f.data.right]).toEqual([left, right]);
    expect(f.data.HasWidthChanged()).toBe(true);
  },
);
it("native automatic column page reconciles changed available page space", /** Checks native FULL reactivation while preserving the authored automatic width. @returns Nothing. */ () => {
  const f = fixture([3000, 3000, 3000], { width: 6000, horiOrient: H.FULL });
  expect(f.page.GetTableWidth()).toBe(9000);
  f.data.space = 10500;
  f.page.ActivatePage();
  expect(
    f.data.columns.map(
      /** Reads literal native widths. @param column - Native interval. @returns Width. */ (
        column,
      ) => column.nWidth,
    ),
  ).toEqual([3000, 4500, 3000]);
  expect(f.page.GetTableWidth()).toBe(10500);
  expect(f.page.GetRemainingSpace()).toBe(0);
  expect(f.page.IsSensitive("adapt")).toBe(false);
  f.page.DeactivatePage();
  expect(f.data.width).toBe(9000);
  expect(f.data.HasWidthChanged()).toBe(false);
});
