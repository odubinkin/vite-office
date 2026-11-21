/** @fileoverview Source creation of range names from the chosen selection edges. */
import { text } from "../../../../i18nlangtag/source/isolang/isolang.tables";
import { ScAddress, ScRange, ScRefFlags } from "../../../inc/address";
import type { ScDocument } from "../../../inc/document";
import { GetString as GetEditString } from "../../core/tool/editutil";
import { ScRangeData, type ScRangeName } from "../../core/tool/rangenam";
import { CreateNameFlags } from "../inc/scui_def";

/** Source Yes, No and Cancel decisions. */
export type CreateNameAnswer = "yes" | "no" | "cancel";
/** Supplies the original replacement prompt asynchronously in the browser. */
export type ConfirmCreateName = (name: string) => Promise<CreateNameAnswer>;

/** Reads a non-numeric label with Calc cell string semantics. @param document - Workbook. @param position - Label cell. @returns Text label. */
function GetLabel(document: ScDocument, position: ScAddress): string {
  const cell = document.GetRefCellValue(position);
  if (cell.hasNumeric()) return "";
  const shared = cell.getSharedString() ?? cell.getFormula()?.GetString();
  if (shared) return text(shared.getString());
  const edit = cell.getEditText();
  if (!edit) return "";
  const value = GetEditString(edit, document);
  try {
    return text(value);
  } finally {
    value.dispose();
  }
}

/** Creates the staged scope in original edge and corner order. @param document - Workbook. @param range - Simple selection. @param flags - Chosen edges. @param names - Owned scope draft. @param confirm - Duplicate decision. @returns Whether input flags were valid. */
export async function CreateNames(
  document: ScDocument,
  range: ScRange,
  flags: CreateNameFlags,
  names: ScRangeName,
  confirm: ConfirmCreateName,
): Promise<boolean> {
  const { aStart, aEnd } = range;
  const left = aStart.Col(),
    top = aStart.Row(),
    right = aEnd.Col(),
    bottom = aEnd.Row();
  const tab = aStart.Tab();
  const useTop = Boolean(flags & CreateNameFlags.Top);
  const useLeft = Boolean(flags & CreateNameFlags.Left);
  const useBottom = Boolean(flags & CreateNameFlags.Bottom);
  const useRight = Boolean(flags & CreateNameFlags.Right);
  if (
    (!useTop && !useLeft && !useBottom && !useRight) ||
    tab !== aEnd.Tab() ||
    (top === bottom && (useTop || useBottom)) ||
    (left === right && (useLeft || useRight))
  )
    return false;

  const firstCol = left + Number(useLeft),
    lastCol = right - Number(useRight);
  const firstRow = top + Number(useTop),
    lastRow = bottom - Number(useBottom);
  let cancelled = false;

  /** Handles one header and its absolute body in the original scope. @param col - Header column. @param row - Header row. @param x1 - Body left. @param y1 - Body top. @param x2 - Body right. @param y2 - Body bottom. @returns Completion. */
  async function CreateOneName(
    col: number,
    row: number,
    x1: number,
    y1: number,
    x2: number,
    y2: number,
  ): Promise<void> {
    if (cancelled) return;
    const position = new ScAddress(col, row, tab);
    const name = ScRangeData.MakeValidName(document, GetLabel(document, position));
    if (!name) return;
    const grammar = document.GetGrammar();
    const content = new ScRange(x1, y1, tab, x2, y2, tab).Format(
      document,
      ScRefFlags.RANGE_ABS_3D,
      new ScAddress.Details(document.GetAddressConvention(), position),
    );
    const symbol = text(content);
    content.dispose();
    const old = names.findByUpperName(name.toUpperCase());
    if (old) {
      if (old.GetSymbol(grammar) === symbol) return;
      const answer = await confirm(name);
      if (answer !== "yes") {
        cancelled = answer === "cancel";
        return;
      }
    }
    const value = new ScRangeData(document, name, position);
    value.CompileRangeData(symbol, grammar, true);
    if (old) names.erase(old);
    if (!names.insert(value)) value.GetCode().Clear();
  }

  if (useTop)
    for (let col = firstCol; col <= lastCol && !cancelled; col++)
      await CreateOneName(col, top, col, firstRow, col, lastRow);
  if (useLeft)
    for (let row = firstRow; row <= lastRow && !cancelled; row++)
      await CreateOneName(left, row, firstCol, row, lastCol, row);
  if (useBottom)
    for (let col = firstCol; col <= lastCol && !cancelled; col++)
      await CreateOneName(col, bottom, col, firstRow, col, lastRow);
  if (useRight)
    for (let row = firstRow; row <= lastRow && !cancelled; row++)
      await CreateOneName(right, row, firstCol, row, lastCol, row);

  if (useTop && useLeft) await CreateOneName(left, top, firstCol, firstRow, lastCol, lastRow);
  if (useTop && useRight) await CreateOneName(right, top, firstCol, firstRow, lastCol, lastRow);
  if (useBottom && useLeft) await CreateOneName(left, bottom, firstCol, firstRow, lastCol, lastRow);
  if (useBottom && useRight)
    await CreateOneName(right, bottom, firstCol, firstRow, lastCol, lastRow);
  return true;
}
