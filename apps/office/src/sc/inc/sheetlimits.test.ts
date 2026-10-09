/** @fileoverview Source-derived ScSheetLimits acceptance for explicit standard, jumbo and custom sheet limits. */
import { describe, expect, it } from "vitest";
import { MAXCOL, MAXROW, MAXROW_JUMBO, MAXTAB, ScAddress, ScRange } from "./address";
import { ScSheetLimits } from "./sheetlimits";

describe("Calc native sheet limits", /** Verifies native immutable limits. @returns Nothing. */ () => {
  it("stores explicit maxima, counts and the original fixed column strings", /** Checks immutable limits without invented factory defaults. @returns Nothing. */ () => {
    for (const [maxCol, maxRow, cols, rows] of [
      [MAXCOL, MAXROW, 16384, 1048576],
      [MAXCOL, MAXROW_JUMBO, 16384, 16777216],
      [7, 15, 8, 16],
      [0, 0, 1, 1],
      [-1, -1, 0, 0],
    ] as const) {
      const limits = new ScSheetLimits(maxCol, maxRow);
      expect([limits.mnMaxCol, limits.mnMaxRow]).toEqual([maxCol, maxRow]);
      expect([limits.MaxCol(), limits.MaxRow()]).toEqual([maxCol, maxRow]);
      expect([limits.GetMaxColCount(), limits.GetMaxRowCount()]).toEqual([cols, rows]);
      expect(limits.MaxColAsString()).toBe("XFD");
    }
    const narrowed = new ScSheetLimits(65535, 0x80000000);
    expect([narrowed.MaxCol(), narrowed.MaxRow()]).toEqual([-1, -2147483648]);
    expect(new ScSheetLimits(32767, 1).GetMaxColCount()).toBe(-32768);
  });

  it("uses document-sized column/row bounds and the native global sheet bound", /** Covers each validity axis and unsorted endpoints independently. @returns Nothing. */ () => {
    for (const [maxCol, maxRow] of [
      [7, 15],
      [MAXCOL, MAXROW],
      [MAXCOL, MAXROW_JUMBO],
    ] as const) {
      const limits = new ScSheetLimits(maxCol, maxRow);
      for (const col of [-1, 0, maxCol, maxCol + 1]) {
        for (const row of [-1, 0, maxRow, maxRow + 1]) {
          for (const tab of [-1, 0, MAXTAB, MAXTAB + 1]) {
            const colValid = col !== -1 && col !== maxCol + 1;
            const rowValid = row !== -1 && row !== maxRow + 1;
            const tabValid = tab !== -1 && tab !== MAXTAB + 1;
            expect(limits.ValidCol(col)).toBe(colValid);
            expect(limits.ValidRow(row)).toBe(rowValid);
            expect(limits.ValidColRow(col, row)).toBe(colValid && rowValid);
            expect(limits.ValidColRowTab(col, row, tab)).toBe(colValid && rowValid && tabValid);
            expect(limits.ValidAddress(new ScAddress(col, row, tab))).toBe(
              colValid && rowValid && tabValid,
            );
            expect(limits.ValidRange(new ScRange(col, row, tab, 0, 0, 0))).toBe(
              colValid && rowValid && tabValid,
            );
            expect(limits.ValidRange(new ScRange(0, 0, 0, col, row, tab))).toBe(
              colValid && rowValid && tabValid,
            );
            expect(limits.SanitizeCol(col)).toBe(
              col === -1 ? 0 : col === maxCol + 1 ? maxCol : col,
            );
            expect(limits.SanitizeRow(row)).toBe(
              row === -1 ? 0 : row === maxRow + 1 ? maxRow : row,
            );
          }
        }
      }
      const reversed = new ScRange(maxCol, maxRow, MAXTAB, 0, 0, 0);
      expect(limits.ValidRange(reversed)).toBe(true);
      expect(reversed.GetVars()).toEqual([maxCol, maxRow, MAXTAB, 0, 0, 0]);
      const negative = new ScAddress(-1, -1, -1);
      expect(limits.ValidAddress(negative)).toBe(false);
      expect(negative.GetVars()).toEqual([-1, -1, -1]);
    }
  });
});
