/** @fileoverview Native ScPrintAreasDlg field initialization, reference formatting and Sfx result. */
import { FormulaGrammar } from "../../../../formula/inc/grammar";
import { text } from "../../../../i18nlangtag/source/isolang/isolang.tables";
import { SfxRequest } from "../../../../sfx2/source/control/request";
import { SfxBoolItem } from "../../../../svl/source/items/cenumitm";
import { SfxStringItem } from "../../../../svl/source/items/stritem";
import { ScAddress, ScRange, ScRefFlags } from "../../../inc/address";
import type { ScDocument } from "../../../inc/document";
import {
  FN_PRINT_ENTIRE_SHEET,
  FN_PRINT_REPEAT_COL,
  FN_PRINT_REPEAT_ROW,
  SID_CHANGE_PRINTAREA,
} from "../../../sdi/tabvwsh";
import { RangeDataType } from "../../core/tool/rangenam";
import type { ScViewData } from "../inc/viewdata";
import { GetPrintSelection, ParsePrintRange, printRangeSeparator } from "../view/viewfun2";

/** The three original reference entries. */
export type PrintRangeField = "area" | "rows" | "columns";

/** Current reference strings and the explicit entire-sheet preset. */
export interface PrintAreasDraft extends Record<PrintRangeField, string> {
  readonly entire: boolean;
}

/** A named reference offered by a source combo box. */
export interface PrintAreaPreset {
  readonly name: string;
  readonly reference: string;
}

/** Original dialog initialization from the active sheet and selection. */
export interface PrintAreasModel {
  readonly document: ScDocument;
  readonly tab: number;
  readonly initial: PrintAreasDraft;
  readonly selection: string;
  readonly named: Readonly<Record<PrintRangeField, readonly PrintAreaPreset[]>>;
}

/** Formats the absolute reference for the print-area entry. @param range - Source area. @param document - Workbook convention. @returns Entry text. */
export function FormatPrintArea(range: ScRange, document: ScDocument): string {
  const value = range.Format(
    document,
    ScRefFlags.RANGE_ABS,
    new ScAddress.Details(document.GetAddressConvention(), 0, 0),
  );
  try {
    return text(value);
  } finally {
    value.dispose();
  }
}

/** Formats a title range using only its repeat axis. @param range - Repeat interval. @param document - Workbook convention. @param field - Repeat axis. @returns Entry text. */
export function FormatRepeatRange(
  range: ScRange | undefined,
  document: ScDocument,
  field: "rows" | "columns",
): string {
  if (!range) return "";
  const rows = field === "rows";
  const flags = rows
    ? ScRefFlags.ROW_VALID | ScRefFlags.ROW_ABS
    : ScRefFlags.COL_VALID | ScRefFlags.COL_ABS;
  const details = new ScAddress.Details(document.GetAddressConvention(), 0, 0);
  const first = range.aStart.Format(flags, document, details);
  const same = rows
    ? range.aStart.Row() === range.aEnd.Row()
    : range.aStart.Col() === range.aEnd.Col();
  const last = same ? undefined : range.aEnd.Format(flags, document, details);
  try {
    return last ? text(first) + ":" + text(last) : text(first);
  } finally {
    first.dispose();
    last?.dispose();
  }
}

/** Reads the original repeat-entry grammar for the active address convention. @param source - Endpoint spelling. @param document - Workbook bounds. @param rows - Row or column axis. @returns Zero-based endpoint. */
function parseRepeatEndpoint(
  source: string,
  document: ScDocument,
  rows: boolean,
): number | undefined {
  const convention = document.GetAddressConvention();
  const limit = rows ? document.MaxRow() : document.MaxCol();
  let oneBased: number;
  if (convention === FormulaGrammar.AddressConvention.CONV_XL_R1C1) {
    const match = (rows ? /^r([0-9]+)$/i : /^c([0-9]+)$/i).exec(source);
    if (!match) return undefined;
    oneBased = Number(match[1]);
  } else {
    if (
      convention !== FormulaGrammar.AddressConvention.CONV_OOO &&
      convention !== FormulaGrammar.AddressConvention.CONV_XL_A1
    )
      return undefined;
    if (source.length >= (rows ? 6 : 4)) return undefined;
    const value = source.replace(/^\$/, "");
    if (rows) {
      if (!/^[0-9]+$/.test(value)) return undefined;
      oneBased = Number(value);
    } else {
      if (!/^[a-z]+$/i.test(value)) return undefined;
      oneBased = 0;
      for (const letter of value.toUpperCase())
        oneBased = oneBased * 26 + letter.charCodeAt(0) - 64;
    }
  }
  return oneBased > 0 && oneBased <= limit + 1 ? oneBased - 1 : undefined;
}

/** Reads a single repeat interval, including the original trailing separator case. @param source - Entry text. @param document - Workbook convention. @param field - Repeat axis. @returns Native interval or absence. */
export function ParseRepeatRange(
  source: string,
  document: ScDocument,
  field: "rows" | "columns",
): ScRange | undefined {
  const [first, last, extra] = source.split(":");
  if (!first || extra !== undefined) return undefined;
  const rows = field === "rows";
  const start = parseRepeatEndpoint(first, document, rows);
  const end = last ? parseRepeatEndpoint(last, document, rows) : start;
  if (start === undefined || end === undefined) return undefined;
  return rows ? new ScRange(0, start, 0, 0, end, 0) : new ScRange(start, 0, 0, end, 0, 0);
}

/** Captures the original dialog's saved fields, selection and document-wide presets. @param view - Active sheet view. @returns Dialog initialization when a sheet exists. */
export function CreatePrintAreasModel(view: ScViewData): PrintAreasModel | undefined {
  const document = view.GetDocument();
  const tab = view.GetTabNumber();
  const sheet = document.FetchTable(tab);
  if (!sheet) return undefined;
  const printAreas: string[] = [];
  for (let index = 0; index < sheet.GetPrintRangeCount(); index++) {
    const range = sheet.GetPrintRange(index);
    if (range) printAreas.push(FormatPrintArea(range, document));
  }
  const named: Record<PrintRangeField, PrintAreaPreset[]> = { area: [], rows: [], columns: [] };
  for (const entry of document.GetRangeName() ?? []) {
    if (
      !(entry.type & (RangeDataType.PrintArea | RangeDataType.RowHeader | RangeDataType.ColHeader))
    )
      continue;
    const range = ParsePrintRange(entry.GetSymbol(document.GetGrammar()), document, tab);
    if (!range) continue;
    const name = entry.name;
    if (entry.type & RangeDataType.PrintArea)
      named.area.push({ name, reference: FormatPrintArea(range, document) });
    if (entry.type & RangeDataType.RowHeader)
      named.rows.push({ name, reference: FormatRepeatRange(range, document, "rows") });
    if (entry.type & RangeDataType.ColHeader)
      named.columns.push({ name, reference: FormatRepeatRange(range, document, "columns") });
  }
  return {
    document,
    tab,
    initial: {
      entire: sheet.IsPrintEntireSheet(),
      area: printAreas.join(printRangeSeparator),
      rows: FormatRepeatRange(sheet.GetRepeatRowRange(), document, "rows"),
      columns: FormatRepeatRange(sheet.GetRepeatColRange(), document, "columns"),
    },
    selection: GetPrintSelection(view)
      .map(
        /** Formats each existing range in the active document's reference grammar. @param range - Native print range. @returns Formatted print area. */ (
          range,
        ) => FormatPrintArea(range, document),
      )
      .join(printRangeSeparator),
    named,
  };
}

/** Validates in original field order and constructs the typed dialog result only for changed fields. @param model - Original dialog state. @param draft - Current entries. @returns Invalid field, changed request or unchanged result. */
export function CheckPrintAreas(
  model: PrintAreasModel,
  draft: PrintAreasDraft,
): PrintRangeField | SfxRequest | undefined {
  const { document, tab, initial } = model;
  if (
    draft.area &&
    draft.area
      .split(printRangeSeparator)
      .some(
        /** Finds an area string the active document cannot parse. @param entry - One entered print area. @returns Whether the string is invalid. */ (
          entry,
        ) => !ParsePrintRange(entry, document, tab),
      )
  )
    return "area";
  const rows = ParseRepeatRange(draft.rows, document, "rows");
  if (draft.rows && !rows) return "rows";
  const columns = ParseRepeatRange(draft.columns, document, "columns");
  if (draft.columns && !columns) return "columns";
  if (
    draft.entire === initial.entire &&
    (draft.entire || draft.area === initial.area) &&
    draft.rows === initial.rows &&
    draft.columns === initial.columns
  )
    return undefined;
  return new SfxRequest(SID_CHANGE_PRINTAREA, [
    new SfxStringItem(SID_CHANGE_PRINTAREA, draft.entire ? "" : draft.area),
    new SfxStringItem(FN_PRINT_REPEAT_ROW, rows ? FormatPrintArea(rows, document) : ""),
    new SfxStringItem(FN_PRINT_REPEAT_COL, columns ? FormatPrintArea(columns, document) : ""),
    new SfxBoolItem(FN_PRINT_ENTIRE_SHEET, draft.entire),
  ]);
}
