/** @fileoverview Source-derived Calc limits, flags and coordinate-domain acceptance from pinned sc/inc/address.hxx. */
import { describe, expect, it } from "vitest";
import * as address from "./address";

describe("Calc native coordinate domain", /** Exercises the pinned numerical contract. @returns Nothing. */ () => {
  it("retains all pinned standard, jumbo and sentinel defaults", /** Exercises the pinned numerical contract. @returns Nothing. */ () => {
    expect([address.MAXROWCOUNT, address.MAXCOLCOUNT, address.MAXTABCOUNT]).toEqual([
      1048576, 16384, 10000,
    ]);
    expect([address.MAXROW, address.MAXCOL, address.MAXTAB]).toEqual([1048575, 16383, 9999]);
    expect([
      address.MAXROWCOUNT_JUMBO,
      address.MAXCOLCOUNT_JUMBO,
      address.MAXROW_JUMBO,
      address.MAXCOL_JUMBO,
    ]).toEqual([16777216, 16384, 16777215, 16383]);
    expect([address.SCROW_MAX, address.SCCOL_MAX, address.SCTAB_MAX, address.SCCOLROW_MAX]).toEqual(
      [2147483647, 32767, 32767, 2147483647],
    );
    expect([
      address.SC_TAB_APPEND,
      address.TABLEID_DOC,
      address.SCCOL_REPEAT_NONE,
      address.SCROW_REPEAT_NONE,
      address.SC_TABSTART_NONE,
    ]).toEqual([32767, 32767, 32767, 2147483647, 32767]);
    expect([
      address.INITIALCOLCOUNT,
      address.MININITTAB,
      address.MAXINITTAB,
      address.MAXTILEDROW,
      address.MAXCOLROW,
      address.SCROWS32K,
      address.MAXROW_30,
    ]).toEqual([1, 1, 1024, 1048575, 1048575, 32000, 8191]);
    expect([
      address.MAXROW_STRING,
      address.MAXCOL_STRING,
      address.MAXROW_JUMBO_STRING,
      address.MAXCOL_JUMBO_STRING,
    ]).toEqual(["1048575", "XFD", "16777215", "XFD"]);
  });

  it("retains every native reference flag and unsigned start-to-end shift", /** Exercises the pinned numerical contract. @returns Nothing. */ () => {
    const names = [
      "ZERO",
      "COL_ABS",
      "ROW_ABS",
      "TAB_ABS",
      "TAB_3D",
      "COL2_ABS",
      "ROW2_ABS",
      "TAB2_ABS",
      "TAB2_3D",
      "ROW_VALID",
      "COL_VALID",
      "TAB_VALID",
      "BITS",
      "FORCE_DOC",
      "ROW2_VALID",
      "COL2_VALID",
      "TAB2_VALID",
      "VALID",
      "TAB_ABS_3D",
      "ADDR_ABS",
      "RANGE_ABS",
      "ADDR_ABS_3D",
      "RANGE_ABS_3D",
    ] as const;
    expect(
      names.map(
        /** Selects a native flag. @param name - Flag name. @returns Numeric flag. */ (name) =>
          address.ScRefFlags[name],
      ),
    ).toEqual([
      0, 1, 2, 4, 8, 16, 32, 64, 128, 256, 512, 1024, 1807, 2048, 4096, 8192, 16384, 32768, 12,
      32775, 32887, 32783, 32895,
    ]);
    for (let flags = 0; flags <= 65535; flags++) {
      expect(address.applyStartToEndFlags(flags)).toBe((flags | (flags * 16)) % 65536);
    }
    expect(address.applyStartToEndFlags(address.ScRefFlags.VALID, address.ScRefFlags.BITS)).toBe(
      0xf0f0,
    );
  });

  it("distinguishes nonnegative sentinel validity from sheet limits and clamps each axis", /** Exercises the pinned numerical contract. @returns Nothing. */ () => {
    for (const maxRow of [address.MAXROW, address.MAXROW_JUMBO]) {
      for (const col of [-1, 0, address.MAXCOL, address.MAXCOL + 1]) {
        for (const row of [-1, 0, maxRow, maxRow + 1]) {
          for (const tab of [-1, 0, address.MAXTAB, address.MAXTAB + 1]) {
            const validCol = col !== -1 && col !== address.MAXCOL + 1;
            const validRow = row !== -1 && row !== maxRow + 1;
            const validTab = tab !== -1 && tab !== address.MAXTAB + 1;
            const pos = new address.ScAddress(col, row, tab);
            const range = new address.ScRange(pos);
            expect(address.ValidCol(col, address.MAXCOL)).toBe(validCol);
            expect(address.ValidRow(row, maxRow)).toBe(validRow);
            expect(address.ValidTab(tab)).toBe(validTab);
            expect(address.ValidColRow(col, row, address.MAXCOL, maxRow)).toBe(
              validCol && validRow,
            );
            expect(address.ValidColRowTab(col, row, tab, address.MAXCOL, maxRow)).toBe(
              validCol && validRow && validTab,
            );
            expect(address.ValidAddress(pos, address.MAXCOL, maxRow)).toBe(
              validCol && validRow && validTab,
            );
            expect(address.ValidRange(range, address.MAXCOL, maxRow)).toBe(
              validCol && validRow && validTab,
            );
            expect(address.SanitizeCol(col, address.MAXCOL)).toBe(
              Math.min(address.MAXCOL, Math.max(0, col)),
            );
            expect(address.SanitizeRow(row, maxRow)).toBe(Math.min(maxRow, Math.max(0, row)));
            expect(address.SanitizeTab(tab)).toBe(Math.min(address.MAXTAB, Math.max(0, tab)));
          }
        }
      }
    }
    expect(address.ValidTab(2, 2)).toBe(true);
    expect(address.ValidTab(3, 2)).toBe(false);
    const range = new address.ScRange(0, 0, 0, address.MAXCOL + 1, 0, 0);
    expect(range.IsValid()).toBe(true);
    expect(address.ValidRange(range, address.MAXCOL, address.MAXROW)).toBe(false);
  });
});
