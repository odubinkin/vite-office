/** @fileoverview Native workbook defined-name records over the Calc name scopes. */
import { GetPrintRanges } from "../../core/data/table1";
import { FormulaGrammar } from "../../../../formula/inc/grammar";
import { text } from "../../../../i18nlangtag/source/isolang/isolang.tables";
import { getTokenFromUtf8 as token } from "../../../../oox/source/token/tokenmap";
import type { FastSerializerHelper } from "../../../../sax/inc/fshelper";
import { ScAddress, ScRange, ScRefFlags } from "../../../inc/address";
import type { ScDocument } from "../../../inc/document";
import { RangeDataType } from "../../core/tool/rangenam";

/** Emits native workbook global and sheet-local definitions in workbook name order. @param output - Workbook part writer. @param document - Native workbook. @returns Nothing. */
export function SaveXmlNames(output: FastSerializerHelper, document: ScDocument): void {
  let opened = false;
  /** Writes a native Excel name record. @param name - Output name. @param tab - Local sheet or -1. @param symbol - Native formula text. @param hidden - Hidden flag. @returns Nothing. */
  function write(name: string, tab: number, symbol: string, hidden = false): void {
    if (!opened) {
      output.startElement(token("definedNames"));
      opened = true;
    }
    output.startElement(
      token("definedName"),
      token("name"),
      name,
      token("localSheetId"),
      tab < 0 ? null : String(tab),
      token("hidden"),
      hidden ? "true" : null,
    );
    output.writeEscaped(symbol);
    output.endElement(token("definedName"));
  }
  const builtins = new Set<string>();
  const sheets = [];
  for (let tab = 0; tab < document.GetTableCount(); ++tab) {
    const table = document.FetchTable(tab);
    if (table) sheets.push({ table, tab, name: text(table.GetName()) });
  }
  sheets.sort(
    /** Original built-in records precede user definitions in sheet-name order. @param a - First sheet. @param b - Second sheet. @returns Sheet name comparison. */ (
      a,
      b,
    ) => (a.name < b.name ? -1 : Number(a.name > b.name)),
  );
  for (const { table, tab } of sheets) {
    const titles: ScRange[] = [];
    const col = table.GetRepeatColRange(),
      row = table.GetRepeatRowRange();
    if (col)
      titles.push(new ScRange(col.aStart.Col(), 0, tab, col.aEnd.Col(), document.MaxRow(), tab));
    if (row)
      titles.push(new ScRange(0, row.aStart.Row(), tab, document.MaxCol(), row.aEnd.Row(), tab));
    for (const [base, ranges] of [
      ["Print_Area", GetPrintRanges(table)],
      ["Print_Titles", titles],
    ] as const) {
      if (!ranges.length) continue;
      const details = new ScAddress.Details(FormulaGrammar.AddressConvention.CONV_XL_A1);
      const symbol = ranges
        .map(
          /** Rebinds a sheet-owned range to its emitted worksheet. @param source - Native area. @returns Qualified Excel address. */
          (source) => {
            const range = new ScRange(source);
            range.aStart.SetTab(tab);
            range.aEnd.SetTab(tab);
            const local = range.Format(document, ScRefFlags.RANGE_ABS, details);
            const sheet = range.aStart.Format(
              ScRefFlags.TAB_3D | ScRefFlags.TAB_VALID,
              document,
              details,
            );
            try {
              return text(sheet) + text(local);
            } finally {
              local.dispose();
              sheet.dispose();
            }
          },
        )
        .join(",");
      builtins.add(base.toUpperCase() + "\0" + symbol);
      write("_xlnm." + base, tab, symbol);
    }
  }
  for (let tab = -1; tab < document.GetTableCount(); ++tab) {
    for (const definition of document.GetRangeName(tab) ?? []) {
      const symbol = definition.GetSymbol(
        FormulaGrammar.Grammar.GRAM_OOXML,
        new ScAddress(0, 0, Math.max(tab, 0)),
      );
      const builtin = /^(?:Excel_BuiltIn_|_xlnm\.)(Print_Area|Print_Titles)(?:$|[_ ])/iu.exec(
        definition.name,
      )?.[1];
      if (builtin && builtins.has(builtin.toUpperCase() + "\0" + symbol.replaceAll(";", ",")))
        continue;
      write(definition.name, tab, symbol, Boolean(definition.type & RangeDataType.Hidden));
    }
  }
  if (opened) output.endElement(token("definedNames"));
}
