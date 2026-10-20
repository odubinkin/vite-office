/** @fileoverview Actual compressed column pixel inversion including hidden spans,terminal sentinels and all-hidden sheets. */
import { expect, it } from "vitest";
import { createCalcSession } from "../composition/calc-module";
import { columnPixels, columnAtPixel, visibleColumns } from "./column-geometry";
import type { ScTable } from "../../inc/table";
it("uses per-column native truncation and actual hidden runs without a second geometry model", /** Actual width storage and bounded browser scroll. @returns Nothing. */ () => {
  const session = createCalcSession(),
    c = session.controller,
    doc = c.shell.GetDocument(),
    table = doc.FetchTable(0) as ScTable;
  try {
    expect(columnPixels(table, 0, 2)).toBe(255);
    expect(columnPixels(table, 0, -1)).toBe(0);
    doc.SetColWidth(1, 0, 1440);
    doc.SetColHidden(2, 4, 0, true);
    doc.SetColWidth(5, 0, 1);
    expect(columnPixels(table, 0, 5)).toBe(182);
    expect(columnAtPixel(table, -10, doc.MaxCol())).toBe(0);
    expect(columnAtPixel(table, 85, doc.MaxCol())).toBe(1);
    expect(columnAtPixel(table, 181, doc.MaxCol())).toBe(5);
    expect(visibleColumns(table, 0, 5)).toEqual([0, 1, 5]);
    c.Select(1, 0);
    c.Navigate(1, 0);
    expect(c.viewData.GetCurX()).toBe(5);
    c.Navigate(0, 1);
    expect(c.viewData.GetCurY()).toBe(1);
    c.Scroll(c.ScrollLeftForColumn(20, 800), 0, 800, 600);
    expect(c.viewport.firstColumn).toBe(20);
    expect(c.viewport.columns).toBeGreaterThan(1);
    c.Scroll(1e9, 0, 800, 600);
    expect(c.viewport.firstColumn).toBeGreaterThan(16000);
    expect(columnAtPixel(table, 1e12, doc.MaxCol())).toBe(doc.MaxCol());
    doc.SetColHidden(0, doc.MaxCol(), 0, true);
    expect(columnPixels(table, 0, doc.MaxCol())).toBe(0);
    expect(visibleColumns(table, 0, doc.MaxCol())).toEqual([]);
    expect(columnAtPixel(table, 0, doc.MaxCol())).toBe(doc.MaxCol());
    c.Scroll(0, 0, 40, 20);
    expect(Number.isFinite(c.viewport.columnOffset)).toBe(true);
    expect(c.ScrollLeftForColumn(0, 2e6)).toBe(0);
  } finally {
    session.Close();
  }
});
