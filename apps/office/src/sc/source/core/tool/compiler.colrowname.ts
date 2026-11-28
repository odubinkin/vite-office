/** @fileoverview Native row and column label name compilation. */
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
          return LabelReference(doc, origin, match, column);
        }
      }
    }
  }
  if (!doc.GetDocOptions().IsLookUpColRowNames()) return undefined;
  const address = FindAutomaticLabel(doc, origin, name);
  if (!address) return undefined;
  const col = address.Col(),
    row = address.Row(),
    tab = address.Tab();
  const above = row > 0 && GetLabelString(doc, new ScAddress(col, row - 1, tab)) !== undefined;
  const below = new ScAddress(col, row + 1, tab);
  const isRow =
    above ||
    (row < doc.MaxRow() &&
      (GetLabelString(doc, below) !== undefined ||
        (doc.GetRefCellValue(below).isEmpty() &&
          col < doc.MaxCol() &&
          doc.GetRefCellValue(new ScAddress(col + 1, row, tab)).hasNumeric())));
  return LabelReference(doc, origin, address, !isRow);
}

/** Builds a source label token with its lookup axis relative to the formula. @param doc - Workbook. @param origin - Formula position. @param target - Label. @param column - Whether the label names a column. @returns Label token. */
function LabelReference(
  doc: ScDocument,
  origin: ScAddress,
  target: ScAddress,
  column: boolean,
): ScSingleRefToken {
  const reference = new ScSingleRefData();
  reference.InitFlags();
  reference.SetColRel(column);
  reference.SetRowRel(!column);
  reference.SetAddress(doc.GetSheetLimits(), target, origin);
  return new ScSingleRefToken(doc.GetSheetLimits(), reference, OpCode.ocColRowName);
}

/** Resolves the upstream position precedence among equal labels on this sheet. @param doc - Workbook. @param origin - Formula position. @param name - Label spelling. @returns Matching cell. */
function FindAutomaticLabel(
  doc: ScDocument,
  origin: ScAddress,
  name: string,
): ScAddress | undefined {
  if (!doc.FetchTable(origin.Tab())) return undefined;
  const cells = new ScHorizontalCellIterator(doc, origin.Tab(), 0, 0, doc.MaxCol(), doc.MaxRow());
  const col: [number] = [0],
    row: [number] = [0];
  const matches: ScAddress[] = [];
  const collation = GetCollator();
  for (let cell = cells.GetNext(col, row); cell; cell = cells.GetNext(col, row)) {
    const address = new ScAddress(col[0], row[0], origin.Tab());
    if (address.equals(origin)) continue;
    const label = GetLabelString(doc, address);
    if (label !== undefined && collation.compare(label, name) === 0) matches.push(address);
  }
  // The source ScCellIterator traverses columns before rows.
  matches.sort(
    /** Orders label candidates by column and then by row. @param left - First candidate address. @param right - Second candidate address. @returns Relative address order. */ (
      left,
      right,
    ) => left.Col() - right.Col() || left.Row() - right.Row(),
  );
  let first: ScAddress | undefined;
  let second: ScAddress | undefined;
  let distance = Infinity;
  let max = Infinity;
  const x = origin.Col(),
    y = origin.Row();
  for (const match of matches) {
    if (max < match.Col()) break;
    const dx = x - match.Col(),
      dy = y - match.Row();
    const nextDistance = dx * dx + dy * dy;
    if (!first) first = match;
    else if (nextDistance >= distance) continue;
    else if (dx < 0 || dy < 0) second = match;
    else if (match.Row() >= first.Row() || y < first.Row()) {
      first = match;
      second = undefined;
    } else continue;
    distance = nextDistance;
    max = Math.max(x + Math.abs(dx), y + Math.abs(dy));
  }
  if (!first || !second || (x >= first.Col() && y >= first.Row())) return first;
  if (x < first.Col()) return y >= second.Row() ? second : first;
  const squared =
    /** Measures each candidate label's squared distance from the formula cell. @param address - Candidate cell address. @returns Squared distance in cells. */ (
      address: ScAddress,
    ): number => (x - address.Col()) ** 2 + (y - address.Row()) ** 2;
  return squared(first) <= squared(second) ? first : second;
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
  const ranges = column ? doc.GetColNameRanges() : doc.GetRowNameRanges();
  const pair = ranges.Find(address);
  const data = pair ? new ScRange(pair.GetRange(1)) : AutomaticBounds(doc, origin, address, column);
  if (!data) return FormulaError.NoName;
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
      /** Checks whether (`op` is at least `OpCode.ocStartBinaryOperators` and `op` is less than `OpCode.ocStopBinaryOperators`). @param op - Candidate entry. @returns Whether the condition holds. */ (
        op,
      ) => op >= OpCode.ocStartBinaryOperators && op < OpCode.ocStopBinaryOperators,
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
  return new ScDoubleRefToken(limits, ref, pair ? OpCode.ocPush : OpCode.ocColRowNameAuto);
}

/** Bounds the automatic label before the next declared data range or its own formula. @param doc - Workbook. @param origin - Formula cell. @param address - Label cell. @param column - Whether to grow downwards. @returns Allowed bounds. */
function AutomaticBounds(
  doc: ScDocument,
  origin: ScAddress,
  address: ScAddress,
  column: boolean,
): ScRange | undefined {
  if (!doc.GetDocOptions().IsLookUpColRowNames()) return undefined;
  if (!doc.GetRefCellValue(address).isEmpty() && GetLabelString(doc, address) === undefined)
    return undefined;

  const axis =
    /** Reads the candidate coordinate along the search axis. @param pos - Cell address in the matching range. @returns Row or column coordinate. */ (
      pos: ScAddress,
    ): number => (column ? pos.Row() : pos.Col());
  const cross =
    /** Reads the coordinate orthogonal to the label search axis. @param pos - Cell address in the matching range. @returns Column or row coordinate. */ (
      pos: ScAddress,
    ): number => (column ? pos.Col() : pos.Row());
  const ranges = column ? doc.GetColNameRanges() : doc.GetRowNameRanges();
  const maximum = column ? doc.MaxRow() : doc.MaxCol();
  let start = Math.min(axis(address) + 1, maximum);
  let end = maximum;
  if (cross(origin) === cross(address)) {
    if (axis(origin) === start) start = Math.min(start + 1, maximum);
    else if (axis(origin) > start) end = axis(origin) - 1;
  }
  for (let i = 0; i < ranges.size(); ++i) {
    const range = ranges.at(i).GetRange(1);
    if (cross(range.aStart) > cross(address) || cross(address) > cross(range.aEnd)) continue;
    const next = axis(range.aStart);
    if (start < next && next <= end) end = next - 1;
  }
  return column
    ? new ScRange(address.Col(), start, address.Tab(), address.Col(), end, address.Tab())
    : new ScRange(start, address.Row(), address.Tab(), end, address.Row(), address.Tab());
}
