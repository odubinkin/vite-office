/** @fileoverview Actual hidden row projection and native keyboard/viewport inversion without allocating a million browser rows. */
import { expect, it } from "vitest";
import { createCalcSession } from "../composition/calc-module";
import { rowPixels, rowAtPixel, visibleRows } from "./row-geometry";
import { ScTable } from "../../inc/table";
it("intersects real height and hidden runs,skips invisible coordinates and inverts terminal/all-hidden sheets safely", /** Actual compressed geometry. @returns Nothing. */ () => {
  const session = createCalcSession(),
    c = session.controller,
    doc = c.shell.GetDocument(),
    table = doc.FetchTable(0) as ScTable;
  try {
    doc.SetRowHeightOnly(0, 0, 0, 300);
    doc.SetRowHeightOnly(1, 4, 0, 600);
    doc.SetRowHidden(1, 3, 0, true);
    expect(rowPixels(table, 0, 4)).toBe(60);
    expect(rowAtPixel(table, -3, doc.MaxRow())).toBe(0);
    expect(rowAtPixel(table, 20, doc.MaxRow())).toBe(4);
    expect(rowAtPixel(table, 59, doc.MaxRow())).toBe(4);
    expect(visibleRows(table, 0, 4)).toEqual([0, 4]);
    expect(rowPixels(table, 0, -1)).toBe(0);
    c.Select(0, 0);
    c.Navigate(0, 1);
    expect(c.viewData.GetCurY()).toBe(4);
    c.Navigate(0, -1);
    expect(c.viewData.GetCurY()).toBe(0);
    c.Scroll(0, c.ScrollTopForRow(20, 600), 800, 600);
    expect(c.viewport.firstRow).toBe(20);
    doc.SetRowHidden(0, doc.MaxRow(), 0, true);
    expect(rowPixels(table, 0, doc.MaxRow())).toBe(0);
    expect(rowAtPixel(table, 1e12, doc.MaxRow())).toBe(doc.MaxRow());
    expect(visibleRows(table, 0, doc.MaxRow())).toEqual([]);
    c.Scroll(0, 0, 800, 600);
    expect(Number.isFinite(c.viewport.rowOffset)).toBe(true);
  } finally {
    session.Close();
  }
});
