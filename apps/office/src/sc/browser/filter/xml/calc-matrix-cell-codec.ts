/** @fileoverview Transfers the native Calc matrix formula master and member caches across Worker. */
import { FormulaError, isPublishedFormulaError } from "../../../../formula/inc/errorcodes";
import { FormulaGrammar } from "../../../../formula/inc/grammar";
import { text, unicode } from "../../../../i18nlangtag/source/isolang/isolang.tables";
import { ScAddress, ScRange } from "../../../inc/address";
import type { ScXMLImport } from "../../../source/filter/xml/xmlimprt";
import { ScMatrixMode, type ScFormulaCell } from "../../../inc/formulacell";

/** Native cached result and error code. Absent caches are dirty. */
type MatrixCache = readonly [value: number | string | null, error: FormulaError];

/** The master carries geometry and code. Members refer to the pre-created native cell. */
export type CalcMatrixCellRecord =
  | readonly [
      col: number,
      row: number,
      kind: "matrix",
      source: string,
      columns: number,
      rows: number,
      cache?: MatrixCache,
    ]
  | readonly [col: number, row: number, kind: "matrix-ref", cache?: MatrixCache];

/** Captures one matrix cell without forcing interpretation. @param formula - Native cell. @returns Matrix record when applicable. */
export function encodeMatrixCell(formula: ScFormulaCell): CalcMatrixCellRecord | undefined {
  const mode = formula.GetMatrixFlag();
  if (mode === ScMatrixMode.NONE) return undefined;
  const { aPos: pos } = formula;
  let cache: MatrixCache | undefined;
  if (formula.IsSpilled()) cache = [null, FormulaError.Spill];
  else if (!formula.GetDirty()) {
    const error = formula.GetErrCode();
    const value =
      error !== FormulaError.NONE || formula.IsEmpty() || formula.IsEmptyDisplayedAsString()
        ? null
        : formula.IsValue()
          ? formula.GetValue()
          : text(formula.GetString().getString());
    cache = [value, error];
  }
  if (mode === ScMatrixMode.Reference)
    return cache
      ? [pos.Col(), pos.Row(), "matrix-ref", cache]
      : [pos.Col(), pos.Row(), "matrix-ref"];
  const dimensions = formula.GetMatColsRows();
  if (!dimensions) throw new Error("Calc matrix formula geometry is invalid.");
  const source = formula.GetFormula(FormulaGrammar.Grammar.GRAM_ODFF);
  try {
    const code = text(source);
    const record = [
      pos.Col(),
      pos.Row(),
      "matrix",
      code.startsWith("{") ? code.slice(1, -1) : code,
      ...dimensions,
    ] as const;
    return cache ? [...record, cache] : record;
  } finally {
    source.dispose();
  }
}

/** Restores one native matrix cell in row-major order. @param owner - Import owner. @param tab - Sheet. @param record - Matrix transport record. @returns Nothing. */
export function decodeMatrixCell(
  owner: ScXMLImport,
  tab: number,
  record: CalcMatrixCellRecord,
): void {
  const [col, row, kind] = record;
  const position = new ScAddress(col, row, tab);
  const cache = kind === "matrix" ? record[6] : record[3];
  if (
    cache !== undefined &&
    (!Array.isArray(cache) ||
      cache.length !== 2 ||
      !(cache[0] === null || typeof cache[0] === "string" || Number.isFinite(cache[0])) ||
      (cache[1] !== FormulaError.NONE &&
        cache[1] !== FormulaError.NotAvailable &&
        !isPublishedFormulaError(cache[1])))
  )
    throw new Error("Calc worker matrix cache is invalid.");
  const document = owner.GetDocument();
  let formula: ScFormulaCell | null;
  if (kind === "matrix") {
    const [, , , code, columns, rows] = record;
    const endCol = col + columns - 1,
      endRow = row + rows - 1;
    if (
      typeof code !== "string" ||
      ![col, row, columns, rows].every(Number.isSafeInteger) ||
      columns <= 0 ||
      rows <= 0 ||
      !document.ValidColRow(col, row) ||
      !document.ValidColRow(endCol, endRow)
    )
      throw new Error("Calc worker matrix geometry is invalid.");
    owner.consumeCells(cache?.[1] === FormulaError.Spill ? 1 : columns * rows);
    const source = unicode(code);
    try {
      formula = owner
        .GetDoc()
        .setMatrixCells(
          new ScRange(col, row, tab, endCol, endRow, tab),
          source,
          FormulaGrammar.Grammar.GRAM_ODFF,
          cache?.[1] === FormulaError.Spill,
        );
    } finally {
      source.dispose();
    }
  } else {
    formula = document.GetFormulaCell(position);
    if (formula?.GetMatrixFlag() !== ScMatrixMode.Reference)
      throw new Error("Calc worker matrix reference has no master.");
  }
  if (cache) formula.SetMatrixCachedResult(cache[0], cache[1]);
}
