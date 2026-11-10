/** @fileoverview Original spanning-cell constraints and first-pass column width finalization on native layout owners. */
import { assert, expect, it } from "vitest";
import { SvxAdjust } from "../../../../editeng/inc/svxenum";
import { SwHTMLTableLayout, SwHTMLTableLayoutConstraints } from "./htmltbl";
import { SwHTMLTableLayoutColumn } from "./htmltbl.column";
import { SwHTMLTableLayoutCell } from "./htmltbl.values";

/** Native provisional metrics and width-option inputs after scanning single-span cells. */
type ColumnInput = readonly [
  minimum: number,
  maximum: number,
  absoluteMinimum: number,
  width?: number,
  relative?: boolean,
];

/** Exercises the production finalizer with real scanned-column values. */
class Pass1Fixture extends SwHTMLTableLayout {
  /** Creates native columns with their three provisional source metrics. @param columns - Actual column metrics and options. @param cols - COLS option. @param tags - COL tag presence. @param width - Table width option. @returns Layout. */
  constructor(columns: readonly ColumnInput[], cols = false, tags = false, width = 0) {
    super(
      null,
      1,
      columns.length,
      cols,
      tags,
      width,
      false,
      0,
      0,
      0,
      SvxAdjust.Left,
      0,
      0,
      0,
      0,
      0,
    );
    for (const [index, [min, max, absolute, option = 0, relative = false]] of columns.entries()) {
      const column = new SwHTMLTableLayoutColumn(option, relative, false);
      column.MergeMinMaxNoAlign(min, max, absolute);
      this.SetColumn(column, index);
      this.SetPass1ColumnWidths(index);
      this.m_nMin += column.GetMin();
      this.m_nMax += column.GetMax();
    }
  }

  /** Feeds measured content through an actual cell and its existing column. @param cell - Source cell. @param minimum - Provisional minimum. @param maximum - Provisional maximum. @param absolute - Provisional absolute minimum. @returns Constraint or null. */
  collect(cell: SwHTMLTableLayoutCell, minimum: number, maximum: number, absolute: number) {
    this.SetCell(cell, 0, 0);
    return this.AccumulatePass1CellWidths(0, 0, minimum, maximum, absolute);
  }

  /** Runs the original constraint and relative-column phase. @param constraints - Native chain. @param relative - Relative-width admission. @returns Nothing. */
  finish(constraints: SwHTMLTableLayoutConstraints | null, relative = false): void {
    this.FinishAutoLayoutPass1(constraints, relative);
  }

  /** Reads actual column results. @returns Minimum/maximum per column. */
  widths(): number[][] {
    return this.m_aColumns.map(
      /** Reads an actual layout column. @param column - Column owner. @returns Native widths. */ (
        column,
      ) => {
        assert(column);
        return [column.GetMin(), column.GetMax()];
      },
    );
  }
}

it("keeps the source either-coordinate comparison and preserves equal-coordinate order", /** Exercises real constraint linking including changing the head. @returns Nothing. */ () => {
  const left = new SwHTMLTableLayoutConstraints(23, 23, 2, 0, 2),
    top = new SwHTMLTableLayoutConstraints(25, 25, 0, 1, 2),
    middle = new SwHTMLTableLayoutConstraints(27, 27, 1, 0, 2),
    equal = new SwHTMLTableLayoutConstraints(28, 28, 1, 0, 2);
  const head = left.InsertNext(top).InsertNext(middle).InsertNext(equal);
  expect(head).toBe(middle);
  expect(head.GetNext()).toBe(equal);
  expect(equal.GetNext()).toBe(top);
  expect(top.GetNext()).toBe(left);
  expect(left.GetNext()).toBeNull();
});

it("assigns the minimum remainder to the last column and drops maximum fractions independently", /** Exercises proportional constraints wider than all current maxima. @returns Nothing. */ () => {
  const layout = new Pass1Fixture([
    [100, 100, 100],
    [100, 100, 100],
  ]);
  layout.finish(new SwHTMLTableLayoutConstraints(203, 210, 0, 0, 2));
  expect(layout.widths()).toEqual([
    [101, 104],
    [102, 105],
  ]);
  expect([layout.GetMin(), layout.GetMax()]).toEqual([203, 209]);
});

it("raises the left minimum first when the existing maximum is sufficient", /** Checks the source ordered slack distribution even though both columns have slack. @returns Nothing. */ () => {
  const layout = new Pass1Fixture([
    [50, 100, 23],
    [40, 200, 23],
  ]);
  layout.finish(new SwHTMLTableLayoutConstraints(145, 290, 0, 0, 2));
  expect(layout.widths()).toEqual([
    [100, 100],
    [45, 200],
  ]);
  expect([layout.GetMin(), layout.GetMax()]).toEqual([145, 300]);
});

it("uses COLS absolute minima and resolves all three fixed-width comparisons", /** Compares explicit width with provisional minimum and absolute minimum. @returns Nothing. */ () => {
  const columns: readonly ColumnInput[] = [
    [80, 150, 30, 90],
    [80, 150, 30, 50],
    [80, 150, 30, 25],
    [80, 150, 30],
  ];
  expect(new Pass1Fixture(columns).widths()).toEqual([
    [80, 90],
    [50, 50],
    [30, 30],
    [80, 150],
  ]);
  expect(new Pass1Fixture(columns, true).widths()).toEqual([
    [90, 90],
    [50, 50],
    [30, 30],
    [30, 150],
  ]);
});

it("retains explicit COL weights, zero weight, and the limiting quotient", /** Uses real COL-tag values and suppresses spanning maximum expansion. @returns Nothing. */ () => {
  const layout = new Pass1Fixture(
    [
      [80, 300, 23, 1, true],
      [150, 500, 23, 3, true],
      [25, 200, 23, 0, true],
    ],
    false,
    true,
  );
  layout.finish(new SwHTMLTableLayoutConstraints(200, 2000, 0, 0, 3), true);
  expect(layout.widths()).toEqual([
    [80, 115],
    [150, 345],
    [25, 25],
  ]);
  expect([layout.GetMin(), layout.GetMax()]).toEqual([255, 485]);
});

it("includes fixed columns in the automatic percentage denominator and retains their authored width", /** Exercises original no-COL percentage inference and max recomputation. @returns Nothing. */ () => {
  const layout = new Pass1Fixture([
    [50, 200, 23, 40, true],
    [50, 300, 23],
    [50, 200, 23, 100],
  ]);
  layout.finish(null, true);
  expect(layout.GetColumn(1)?.GetWidthOption()).toBe(45);
  expect(layout.GetColumn(2)?.IsRelWidthOption()).toBe(false);
  expect(layout.widths()).toEqual([
    [50, 266],
    [50, 300],
    [50, 100],
  ]);
  expect(layout.GetMax()).toBe(666);
});

it("caps later percentages and bases specified table-width ratios on minima", /** Covers source excess percentages and the authored table width branch. @returns Nothing. */ () => {
  const layout = new Pass1Fixture(
    [
      [50, 200, 23, 75, true],
      [70, 300, 23, 80, true],
      [30, 150, 23, 15, true],
      [30, 150, 23],
    ],
    false,
    false,
    500,
  );
  layout.finish(null, true);
  expect(
    [0, 1, 2, 3].map(
      /** Reads the real width options. @param index - Original column. @returns Option. */ (
        index,
      ) => layout.GetColumn(index)?.GetWidthOption(),
    ),
  ).toEqual([75, 25, 0, 0]);
  expect(layout.widths()).toEqual([
    [50, 210],
    [70, 70],
    [30, 30],
    [30, 30],
  ]);
  expect(layout.GetMax()).toBe(340);
});

it("applies native NOWRAP separately for percent and fixed cell widths", /** Uses actual cell ownership and updates the original column metrics. @returns Nothing. */ () => {
  const percent = new Pass1Fixture([[23, 23, 23]]),
    fixed = new Pass1Fixture([[23, 23, 23]]);
  expect(
    percent.collect(new SwHTMLTableLayoutCell(null, 1, 1, 60, true, true), 40, 110, 30),
  ).toBeNull();
  expect(
    fixed.collect(new SwHTMLTableLayoutCell(null, 1, 1, 70, false, true), 40, 110, 30),
  ).toBeNull();
  const percentColumn = percent.GetColumn(0),
    fixedColumn = fixed.GetColumn(0);
  assert(percentColumn && fixedColumn);
  expect([
    percentColumn.GetMinNoAlign(),
    percentColumn.GetMaxNoAlign(),
    percentColumn.GetAbsMinNoAlign(),
  ]).toEqual([110, 110, 110]);
  expect([
    fixedColumn.GetMinNoAlign(),
    fixedColumn.GetMaxNoAlign(),
    fixedColumn.GetAbsMinNoAlign(),
  ]).toEqual([70, 110, 70]);
  expect(percentColumn.IsRelWidthOption()).toBe(true);
  expect(fixedColumn.GetWidthOption()).toBe(70);
});

it("uses absolute minima for colspan under COLS or COL tags and clamps fixed spans", /** Checks that spanning cells return constraints without changing individual columns. @returns Nothing. */ () => {
  const columns: readonly ColumnInput[] = [
    [23, 23, 23],
    [23, 23, 23],
  ];
  const cols = new Pass1Fixture(columns, true),
    tags = new Pass1Fixture(columns, false, true),
    ordinary = new Pass1Fixture(columns);
  const auto = new SwHTMLTableLayoutCell(null, 1, 2, 0, false, false),
    fixed = new SwHTMLTableLayoutCell(null, 1, 2, 25, false, false);
  expect(cols.collect(auto, 80, 120, 35)?.GetMinNoAlign()).toBe(35);
  expect(tags.collect(fixed, 80, 120, 35)?.GetMinNoAlign()).toBe(35);
  expect(tags.collect(fixed, 80, 120, 35)?.GetMaxNoAlign()).toBe(120);
  const constraint = ordinary.collect(fixed, 80, 120, 35);
  expect(constraint?.GetMinNoAlign()).toBe(35);
  expect(constraint?.GetMaxNoAlign()).toBe(35);
  expect(ordinary.widths()).toEqual([
    [23, 23],
    [23, 23],
  ]);
});
