/** @fileoverview Actual sparse row-major traversal through real Calc column stores. */
import { assert, expect, it } from "vitest";
import { ScDocument } from "../../../inc/document";
import { ScAddress, MAXCOL, MAXROW } from "../../../inc/address";
import { ScHorizontalCellIterator } from "../../../inc/dociter";
import { FormulaGrammar } from "../../../../formula/inc/grammar";
import { CellType } from "../../../inc/global";
import { unicode, text } from "../../../../i18nlangtag/source/isolang/isolang.tables";
/** Reads public cursor output before its borrowed owner can be overwritten. @param iterator - Native iterator. @returns Value/coordinate observations. */
function observations(iterator: ScHorizontalCellIterator): unknown[] {
  const col: [number] = [-1],
    row: [number] = [-1],
    result: unknown[] = [];
  for (let cell = iterator.GetNext(col, row); cell; cell = iterator.GetNext(col, row)) {
    const type = cell.getType();
    result.push([
      col[0],
      row[0],
      type,
      type === CellType.CELLTYPE_VALUE
        ? cell.getDouble()
        : type === CellType.CELLTYPE_STRING
          ? text(
              (
                cell.getSharedString() as NonNullable<ReturnType<typeof cell.getSharedString>>
              ).getString(),
            )
          : cell.getFormula(),
    ]);
  }
  return result;
}
it("visits interleaved actual blocks by row with stable borrowed view identity and no formula evaluation", /** Empty strings and numeric zero remain actual nonempty cells. @returns Nothing. */ () => {
  const doc = new ScDocument();
  doc.InsertTab(0, unicode("Data"));
  for (const [col, row, value] of [
    [0, 0, 0],
    [0, 1, 1],
    [1, 0, 10],
    [2, 3, 23],
    [1, 6, 16],
    [0, 9, 9],
    [3, 9, 39],
    [2, MAXROW, 42],
  ] as const)
    doc.SetValue(new ScAddress(col, row, 0), value);
  const table = doc.FetchTable(0);
  assert(table);
  table.CreateColumnIfNotExists(0).SetRawString(2, unicode(""));
  doc.SetTextCell(new ScAddress(1, 2, 0), unicode("text"));
  doc.SetFormula(new ScAddress(2, 0, 0), unicode("=1+2"), FormulaGrammar.Grammar.GRAM_ODFF);
  const formula = doc.GetFormulaCell(new ScAddress(2, 0, 0));
  assert(formula);
  const iterator = new ScHorizontalCellIterator(doc, 0, 0, 0, MAXCOL, MAXROW),
    col: [number] = [-1],
    row: [number] = [-1];
  expect(iterator.GetPos(col, row)).toBe(true);
  expect([col[0], row[0]]).toEqual([0, 0]);
  const first = iterator.GetNext(col, row);
  assert(first);
  expect(first.getDouble()).toBe(0);
  const second = iterator.GetNext(col, row);
  expect(second).toBe(first);
  expect(first.getDouble()).toBe(10);
  expect([col[0], row[0]]).toEqual([1, 0]);
  iterator.SetTab(0);
  expect(observations(iterator)).toEqual([
    [0, 0, CellType.CELLTYPE_VALUE, 0],
    [1, 0, CellType.CELLTYPE_VALUE, 10],
    [2, 0, CellType.CELLTYPE_FORMULA, formula],
    [0, 1, CellType.CELLTYPE_VALUE, 1],
    [0, 2, CellType.CELLTYPE_STRING, ""],
    [1, 2, CellType.CELLTYPE_STRING, "text"],
    [2, 3, CellType.CELLTYPE_VALUE, 23],
    [1, 6, CellType.CELLTYPE_VALUE, 16],
    [0, 9, CellType.CELLTYPE_VALUE, 9],
    [3, 9, CellType.CELLTYPE_VALUE, 39],
    [2, MAXROW, CellType.CELLTYPE_VALUE, 42],
  ]);
  expect(formula.GetDirty()).toBe(true);
  col[0] = 777;
  row[0] = 888;
  expect(iterator.GetNext(col, row)).toBeNull();
  expect([col[0], row[0]]).toEqual([777, 888]);
  expect(iterator.GetPos(col, row)).toBe(false);
});
it("respects inclusive cuts, sparse jumps, empty columns and the original sheet clamp", /** Oracle uses explicit coordinates, not iterator internals. @returns Nothing. */ () => {
  const doc = new ScDocument();
  doc.InsertTab(0, unicode("A"));
  doc.InsertTab(1, unicode("B"));
  doc.InsertTab(2, unicode("Empty"));
  const cells = [
    [0, 1, 1],
    [0, 2, 2],
    [0, 8, 8],
    [2, 0, 20],
    [2, 5, 25],
    [3, 7, 37],
  ] as const;
  for (const [c, r, v] of cells) doc.SetValue(new ScAddress(c, r, 0), v);
  for (const [c, r, v] of [
    [0, 1, 101],
    [3, 5, 135],
    [4, 4, 144],
  ] as const)
    doc.SetValue(new ScAddress(c, r, 1), v);
  for (const startCol of [0, 1, 2, 3, 4])
    for (const endCol of [0, 2, 3, MAXCOL])
      for (const startRow of [0, 1, 3, 6, 9])
        for (const endRow of [1, 5, 8, MAXROW]) {
          const iterator = new ScHorizontalCellIterator(doc, 0, startCol, startRow, endCol, endRow);
          const expected = cells
            .filter(
              /** Selects the inclusive source area. @param cell - Explicit cell. @returns Membership. */ ([
                c,
                r,
              ]) => c >= startCol && c <= endCol && r >= startRow && r <= endRow,
            )
            .map(
              /** Projects actual scalar observations. @param cell - Explicit cell. @returns Row. */ ([
                c,
                r,
                v,
              ]) => [c, r, CellType.CELLTYPE_VALUE, v],
            )
            .sort(
              /** Defines independent row-major order. @param a - Row. @param b - Row. @returns Order. */ (
                a,
                b,
              ) => (a[1] as number) - (b[1] as number) || (a[0] as number) - (b[0] as number),
            );
          expect(
            observations(iterator),
            JSON.stringify({ startCol, endCol, startRow, endRow }),
          ).toEqual(expected);
        }
  const reset = new ScHorizontalCellIterator(doc, 0, 0, 0, MAXCOL, 9);
  reset.SetTab(1);
  expect(observations(reset)).toEqual([
    [0, 1, CellType.CELLTYPE_VALUE, 101],
    [3, 5, CellType.CELLTYPE_VALUE, 135],
  ]);
  const empty = new ScHorizontalCellIterator(doc, 2, 20, 0, MAXCOL, MAXROW);
  expect(observations(empty)).toEqual([]);
  empty.SetTab(2);
  expect(observations(empty)).toEqual([]);
  expect(
    /** Invalid sheet violates the native precondition. @returns Iterator. */ () =>
      new ScHorizontalCellIterator(doc, 9, 0, 0, 0, 0),
  ).toThrow(RangeError);
  expect(
    /** Native SetTab requires its retained allocated-column domain. @returns Nothing. */ () =>
      reset.SetTab(2),
  ).toThrow(RangeError);
  expect(
    /** Missing sheet has no native block cursors. @returns Nothing. */ () => reset.SetTab(9),
  ).toThrow(RangeError);
  expect(doc.FetchTable(2)?.GetAllocatedColumnsCount()).toBe(1);
});
