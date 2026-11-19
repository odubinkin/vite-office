/** @fileoverview Internal-sheet OOO/ODF A1 address-header operations from address.cxx. */
import { MAXROWCOUNT, ScRefFlags } from "../../../inc/address";
import { OUString } from "../../../../sal/inc/rtl/ustring";
import { text, unicode } from "../../../../i18nlangtag/source/isolang/isolang.tables";
import type { ScAddress, ScAddressDocument } from "./address";

/** Quotes a Calc sheet identifier as in ScCompiler::CheckTabQuotes. @param name - Actual sheet name. @returns Formula identifier. */
export function QuoteTabName(name: string): string {
  const cell = /^([A-Za-z]{1,3})([0-9]+)$/u.exec(name);
  const column = cell?.[1]?.toUpperCase();
  const row = Number(cell?.[2]);
  const looksLikeCell =
    column !== undefined && (column.length < 3 || column < "XFD") && row > 0 && row <= MAXROWCOUNT;
  if (
    !/^[\p{L}_][\p{L}\p{N}_]*$/u.test(name) ||
    /^[RC][0-9]/iu.test(name) ||
    looksLikeCell ||
    name === "FALSE" ||
    name === "TRUE"
  )
    return "'" + name.replaceAll("'", "''") + "'";
  return name;
}

/** Writes the sheet part ahead of the A1 component. @param tab - Current tab. @param doc - Workbook lookup. @param absolute - Absolute Calc sheet flag. @param excel - Use the Excel separator. @returns Qualified identifier or undefined for an invalid sheet. */
export function formatTab(
  tab: number,
  doc: ScAddressDocument,
  absolute: boolean,
  excel: boolean,
): string | undefined {
  const name = new OUString();
  try {
    if (!doc.GetName?.(tab, name)) return undefined;
    return (!excel && absolute ? "$" : "") + QuoteTabName(text(name)) + (excel ? "!" : ".");
  } finally {
    name.dispose();
  }
}

/** Locates the separator outside the escaped or quoted sheet qualifier. @param input - Reference spelling. @returns Offset or input length. */
export function findRangeSeparator(input: string): number {
  let colon = 0,
    quoted = false;
  for (; colon < input.length; ++colon) {
    if (input[colon] === "'") quoted = !quoted;
    else if (!quoted && input[colon] === ":") break;
  }
  return colon;
}

/** Parses the native internal OOO/ODF A1 form. @param address - Output reference. @param input - Address source. @param doc - Native sheet names and bounds. @returns Address flags. */
export function parseOOOA1(address: ScAddress, input: string, doc: ScAddressDocument): ScRefFlags {
  if (!input) return ScRefFlags.ZERO;
  const qualifier = /^(\$?)(?:'((?:[^']|'')*)'|([^.'#$]+))\./u.exec(input);
  let sheetFlags = ScRefFlags.ZERO;
  if (qualifier) {
    const sheet = unicode(qualifier[2]?.replaceAll("''", "'") ?? (qualifier[3] as string));
    const tab: [number] = [0];
    try {
      if (!doc.GetTable?.(sheet, tab)) return ScRefFlags.ZERO;
    } finally {
      sheet.dispose();
    }
    address.SetTab(tab[0]);
    sheetFlags = ScRefFlags.TAB_3D | (qualifier[1] ? ScRefFlags.TAB_ABS : ScRefFlags.ZERO);
    input = input.slice(qualifier[0].length);
  }
  const match = /^(\$?)([A-Za-z]+)(\$?)([0-9]+)$/.exec(input);
  if (!match) return ScRefFlags.ZERO;
  let column = 0;
  for (const c of match[2] as string) column = column * 26 + c.toUpperCase().charCodeAt(0) - 64;
  const row = Number(match[4]) - 1;
  if (column < 1 || column > doc.MaxCol() + 1 || row < 0 || row > doc.MaxRow())
    return ScRefFlags.ZERO;
  address.SetCol(column - 1);
  address.SetRow(row);
  return (ScRefFlags.VALID |
    ScRefFlags.COL_VALID |
    ScRefFlags.ROW_VALID |
    ScRefFlags.TAB_VALID |
    sheetFlags |
    (match[1] ? ScRefFlags.COL_ABS : 0) |
    (match[3] ? ScRefFlags.ROW_ABS : 0)) as ScRefFlags;
}
