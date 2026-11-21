/** @fileoverview Native explicit row and column label name compilation. */
import { OpCode } from "../../../../formula/inc/opcode";
import { FormulaError } from "../../../../formula/inc/errorcodes";
import { text } from "../../../../i18nlangtag/source/isolang/isolang.tables";
import { ScAddress, ScRange } from "../../../inc/address";
import type { ScDocument } from "../../../inc/document";
import { ScHorizontalCellIterator } from "../../../inc/dociter";
import { ScComplexRefData, ScSingleRefData } from "../../../inc/refdata";
import { ScSingleRefToken, ScDoubleRefToken } from "../../../inc/token";
import { GetString as GetEditString } from "./editutil";
import { GetCollator } from "./queryentry";

/** Gets text from a label cell without evaluating an uncompiled formula. @param doc - Workbook. @param address - Cell. @returns Text label if present. */
export function GetLabelString(doc: ScDocument, address: ScAddress): string | undefined {
  const cell = doc.GetRefCellValue(address);
  const formula = cell.getFormula();
  if (formula && (!formula.GetCode().GetCodeLen() || formula.IsValue())) return undefined;
  const value = cell.getSharedString() ?? formula?.GetString();
  if (value) return text(value.getString());
  const edit = cell.getEditText();
  if (!edit) return undefined;
  const string = GetEditString(edit, doc);
  try {
    return text(string);
  } finally {
    string.dispose();
  }
}

/** Resolves explicit label names in sheet-first, column-before-row order. @param doc - Workbook. @param origin - Formula cell. @param name - Dequoted spelling. @returns Source token. */
export function ParseColRowName(
  doc: ScDocument,
  origin: ScAddress,
  name: string,
): ScSingleRefToken | undefined {
  const columns = doc.GetColNameRanges(),
    rows = doc.GetRowNameRanges();
  if (!columns.size() && !rows.size()) return undefined;
  const collation = GetCollator();
  for (const sameSheet of [true, false]) {
    for (const column of [true, false]) {
      const list = column ? columns : rows;
      for (let i = 0; i < list.size(); i++) {
        const labels = list.at(i).GetRange(0);
        if (sameSheet && (origin.Tab() < labels.aStart.Tab() || origin.Tab() > labels.aEnd.Tab()))
          continue;
        for (let tab = labels.aStart.Tab(); tab <= labels.aEnd.Tab(); tab++) {
          const cells = new ScHorizontalCellIterator(
            doc,
            tab,
            labels.aStart.Col(),
            labels.aStart.Row(),
            labels.aEnd.Col(),
            labels.aEnd.Row(),
          );
          const col: [number] = [0],
            row: [number] = [0];
          let match: ScAddress | undefined;
          for (let cell = cells.GetNext(col, row); cell; cell = cells.GetNext(col, row)) {
            if (match && col[0] >= match.Col()) continue;
            const address = new ScAddress(col[0], row[0], tab);
            if (address.equals(origin)) continue;
            const label = GetLabelString(doc, address);
            if (label !== undefined && collation.compare(label, name) === 0) match = address;
          }
          if (!match) continue;
          const reference = new ScSingleRefData();
          reference.InitFlags();
          reference.SetColRel(column);
          reference.SetRowRel(!column);
          reference.SetAddress(doc.GetSheetLimits(), match, origin);
          return new ScSingleRefToken(doc.GetSheetLimits(), reference, OpCode.ocColRowName);
        }
      }
    }
  }
  return undefined;
}

/** Produces the scalar or range operand selected by neighboring opcodes. @param doc - Workbook. @param origin - Formula cell. @param token - Label token. @param previous - Previous source opcode. @param next - Next source opcode. @returns Reference or native error. */
export function GetRefColRowNames(
  doc: ScDocument,
  origin: ScAddress,
  token: ScSingleRefToken,
  previous: OpCode,
  next: OpCode,
): ScSingleRefToken | ScDoubleRefToken | FormulaError {
  const limits = doc.GetSheetLimits();
  const label = token.GetSingleRef();
  const address = label.toAbs(doc, origin);
  if (!limits.ValidAddress(address)) return FormulaError.NoRef;
  const column = label.IsColRel();
  const pair = (column ? doc.GetColNameRanges() : doc.GetRowNameRanges()).Find(address);
  if (!pair) return FormulaError.NoName;
  const data = new ScRange(pair.GetRange(1));
  for (const endpoint of [data.aStart, data.aEnd]) {
    if (column) endpoint.SetCol(address.Col());
    else endpoint.SetRow(address.Row());
  }
  let scalar = data.aStart.equals(data.aEnd);
  if (
    !scalar &&
    previous !== OpCode.ocColRowName &&
    previous !== OpCode.ocIntersect &&
    next !== OpCode.ocColRowName &&
    next !== OpCode.ocIntersect &&
    [previous, next].some(
      (op) => op >= OpCode.ocStartBinaryOperators && op < OpCode.ocStopBinaryOperators,
    )
  ) {
    scalar = true;
    const coordinate = column ? origin.Row() : origin.Col();
    const first = column ? data.aStart.Row() : data.aStart.Col();
    const last = column ? data.aEnd.Row() : data.aEnd.Col();
    if (coordinate < first || coordinate > last) return FormulaError.NoRef;
    if (column) data.aStart.SetRow(coordinate);
    else data.aStart.SetCol(coordinate);
  }
  if (scalar) {
    const ref = new ScSingleRefData();
    ref.InitAddress(data.aStart);
    ref.SetColRel(column);
    ref.SetRowRel(!column);
    ref.SetAddress(limits, data.aStart, origin);
    return new ScSingleRefToken(limits, ref);
  }
  const ref = new ScComplexRefData();
  ref.InitRange(data);
  for (const endpoint of [ref.Ref1, ref.Ref2]) {
    endpoint.SetColRel(column);
    endpoint.SetRowRel(!column);
  }
  ref.SetRange(limits, data, origin);
  return new ScDoubleRefToken(limits, ref);
}
