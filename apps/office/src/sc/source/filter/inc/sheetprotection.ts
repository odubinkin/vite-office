/** @fileoverview SpreadsheetML sheet protection option names and inverted defaults. */
import { ScTableProtectionOption as O } from "../../../inc/tabprotection";

/** Pairs of native permissions and OOXML disallow attributes with import defaults. */
export const sheetProtectionOptions = [
  [O.OBJECTS, "objects", false],
  [O.SCENARIOS, "scenarios", false],
  [O.FORMAT_CELLS, "formatCells", true],
  [O.FORMAT_COLUMNS, "formatColumns", true],
  [O.FORMAT_ROWS, "formatRows", true],
  [O.INSERT_COLUMNS, "insertColumns", true],
  [O.INSERT_ROWS, "insertRows", true],
  [O.INSERT_HYPERLINKS, "insertHyperlinks", true],
  [O.DELETE_COLUMNS, "deleteColumns", true],
  [O.DELETE_ROWS, "deleteRows", true],
  [O.SELECT_LOCKED_CELLS, "selectLockedCells", false],
  [O.SORT, "sort", true],
  [O.AUTOFILTER, "autoFilter", true],
  [O.PIVOT_TABLES, "pivotTables", true],
  [O.SELECT_UNLOCKED_CELLS, "selectUnlockedCells", false],
] as const;
