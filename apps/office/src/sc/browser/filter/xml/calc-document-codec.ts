/** @fileoverview Bounded Calc worker transfer of supported native cells, sparse attributes and geometry; XML remains the durable format. */
import { runCooperatively, runSynchronously } from "../../../../framework/browser/io/cooperative";
import { ScDocument } from "../../../inc/document";
import { ScAddress, MAXCOL, MAXROW } from "../../../inc/address";
import { ScHorizontalCellIterator } from "../../../inc/dociter";
import { CellType, CRFlags } from "../../../inc/global";
import { CellAttributeHolder, type ScPatternAttr } from "../../../inc/patattr";
import { FormulaGrammar } from "../../../../formula/inc/grammar";
import { unicode, text } from "../../../../i18nlangtag/source/isolang/isolang.tables";
import { XMLFontAutoStylePool } from "../../../../xmloff/source/style/XMLFontAutoStylePool";
import { ODF_NAMESPACES } from "../../../../xmloff/source/core/xmltoken";
import { ScXMLImport } from "../../../source/filter/xml/xmlimprt";
import {
  exportCellTextProperties,
  exportCellProperties,
  exportCellParagraphProperties,
} from "../../../source/filter/xml/xmlstyle";
import type { ScTable } from "../../../inc/table";
/** Compact native scalar alternative, with formula source rather than result text. */
type Cell = readonly [
  col: number,
  row: number,
  kind: "number" | "text" | "edit" | "formula",
  value: number | string,
];
/** Actual sparse pattern span; -1 selects the native default column. */
type Pattern = readonly [col: number, first: number, last: number, style: string];
/** Geometry spans preserve defaults and hidden/filter/manual flags without expanding the sheet domain. */
interface Sheet {
  readonly name: string;
  readonly cells: Cell[];
  readonly patterns: Pattern[];
  readonly columns: [first: number, last: number, width: number, hidden: boolean][];
  readonly rows: [
    first: number,
    last: number,
    height: number,
    manual: boolean,
    hidden: boolean,
    filtered: boolean,
  ][];
}
/** Ephemeral transport, never persisted instead of XML. */
export interface CalcDocumentRecord {
  readonly version: 1;
  readonly styles: string;
  readonly sheets: Sheet[];
}
/** Captures supported values without computing formula results or packaging XML. @param document - Model. @returns Incremental record. */
function* encodeSteps(document: ScDocument): Generator<void, CalcDocumentRecord> {
  const sheets: Sheet[] = [],
    fonts = new XMLFontAutoStylePool(),
    styles = new Map<string, string>(),
    patternNames = new Map<ScPatternAttr, string>();
  const styleName =
    /** Encodes native style identity for the Calc worker boundary. @param pattern - pattern. @returns Operation result. */ (
      pattern: ScPatternAttr,
    ): string => {
      const cached = patternNames.get(pattern);
      if (cached !== undefined) return cached;
      const t = exportCellTextProperties(pattern, fonts),
        c = exportCellProperties(pattern),
        p = exportCellParagraphProperties(pattern);
      const key = `${t ? `<style:text-properties${t}/>` : ""}${c ? `<style:table-cell-properties${c}/>` : ""}${p ? `<style:paragraph-properties${p}/>` : ""}`;
      let name = styles.get(key);
      if (name === undefined) {
        name = key ? `ce${styles.size + 1}` : "";
        styles.set(key, name);
      }
      patternNames.set(pattern, name);
      return name;
    };
  for (let tab = 0; tab < document.GetTableCount(); tab++) {
    const table = document.FetchTable(tab) as ScTable;
    const sheet: Sheet = {
      name: text(table.GetName()),
      cells: [],
      patterns: [],
      columns: [],
      rows: [],
    };
    sheets.push(sheet);
    const iterator = new ScHorizontalCellIterator(document, tab, 0, 0, MAXCOL, MAXROW),
      col: [number] = [0],
      row: [number] = [0];
    let cell;
    while ((cell = iterator.GetNext(col, row))) {
      const formula = cell.getFormula();
      if (formula) {
        const source = formula.GetFormula(FormulaGrammar.Grammar.GRAM_ODFF);
        try {
          sheet.cells.push([col[0], row[0], "formula", text(source)]);
        } finally {
          source.dispose();
        }
      } else if (cell.getType() === CellType.CELLTYPE_VALUE)
        sheet.cells.push([col[0], row[0], "number", cell.getDouble()]);
      else if (cell.getType() === CellType.CELLTYPE_EDIT) {
        const edit = cell.getEditText();
        if (!edit) throw new Error("Calc edit cell is unavailable.");
        const value = edit.GetText();
        try {
          sheet.cells.push([col[0], row[0], "edit", text(value)]);
        } finally {
          value.dispose();
        }
      } else {
        const string = cell.getSharedString();
        if (!string) throw new Error("Calc worker cell type is unsupported.");
        sheet.cells.push([col[0], row[0], "text", text(string.getString())]);
      }
      yield;
    }
    for (let column = -1; column < table.GetAllocatedColumnsCount(); column++) {
      const data = column === -1 ? table.GetDefaultColumnData() : table.GetColumnData(column);
      const first: [number] = [0],
        last: [number] = [0];
      for (let r = 0; r <= MAXROW;) {
        const pattern = data.GetPatternRange(first, last, r) as ScPatternAttr;
        sheet.patterns.push([column, r, last[0], styleName(pattern)]);
        r = last[0] + 1;
        yield;
      }
    }
    for (let col = 0; col <= MAXCOL;) {
      const width = table.GetColWidthRange(col),
        end: [number] = [0],
        hidden = table.ColHidden(col, undefined, end),
        last = Math.min(width.mnRow2, end[0]);
      sheet.columns.push([col, last, width.maValue, hidden]);
      col = last + 1;
      yield;
    }
    for (let row = 0; row <= MAXROW;) {
      const height = table.GetRowHeightRange(row),
        flags = table.GetRowFlagsRange(row),
        hiddenEnd: [number] = [0],
        filteredEnd: [number] = [0];
      const hidden = table.RowHidden(row, undefined, hiddenEnd),
        filtered = table.getFilterData().rowFiltered(row, undefined, filteredEnd),
        last = Math.min(height.mnRow2, flags.mnRow2, hiddenEnd[0], filteredEnd[0]);
      sheet.rows.push([
        row,
        last,
        height.mnValue,
        !!(flags.maValue & CRFlags.ManualSize),
        hidden,
        filtered,
      ]);
      row = last + 1;
      yield;
    }
  }
  const namespaces = Object.entries(ODF_NAMESPACES)
    .map(
      /** Encodes native style identity for the Calc worker boundary. @param input1 - Operation input. @returns Operation result. */ ([
        prefix,
        uri,
      ]) => ` xmlns:${prefix}="${uri}"`,
    )
    .join("");
  const automatic = [...styles]
    .map(
      /** Encodes native style identity for the Calc worker boundary. @param input1 - Operation input. @returns Operation result. */ ([
        key,
        name,
      ]) =>
        name
          ? `<style:style style:name="${name}" style:family="table-cell">${key}</style:style>`
          : "",
    )
    .join("");
  return {
    version: 1,
    sheets,
    styles: `<office:document-styles${namespaces} office:version="1.3">${fonts.exportXML()}<office:automatic-styles>${automatic}</office:automatic-styles></office:document-styles>`,
  };
}
/** Restores a fresh native document before atomic shell adoption. @param record - Worker record. @returns Incremental candidate. */
function* decodeSteps(record: CalcDocumentRecord): Generator<void, ScDocument> {
  if (record.version !== 1 || !Array.isArray(record.sheets))
    throw new Error("Calc worker graph is invalid.");
  const document = new ScDocument(),
    importer = new ScXMLImport(document);
  let complete = false;
  document.SetAutoCalc(false);
  try {
    importer.importStyles(record.styles);
    for (const [tab, sheet] of record.sheets.entries()) {
      const name = unicode(sheet.name);
      try {
        if (!document.InsertTab(tab, name)) throw new Error("Calc worker sheet is invalid.");
      } finally {
        name.dispose();
      }
      const table = document.FetchTable(tab) as ScTable;
      for (const [col, first, last, style] of sheet.patterns) {
        const pattern = style
          ? importer.GetAutoStyle(style)
          : document.getCellAttributeHelper().getDefaultCellAttribute();
        if (!pattern) throw new Error("Calc worker style is missing.");
        const holder = new CellAttributeHolder(pattern);
        try {
          (col === -1
            ? table.GetDefaultColumnData()
            : table.CreateColumnIfNotExists(col)
          ).SetPatternArea(first, last, holder);
        } finally {
          holder.Dispose();
        }
        yield;
      }
      for (const [first, last, width, hidden] of sheet.columns) {
        for (let col = first; col <= last; col++) {
          table.SetColWidthOnly(col, width);
          yield;
        }
        table.SetColHidden(first, last, hidden);
      }
      for (const [first, last, height, manual, hidden, filtered] of sheet.rows) {
        table.SetRowHeightOnly(first, last, height);
        table.SetManualHeight(first, last, manual);
        table.SetRowHidden(first, last, hidden);
        table.getFilterData().setRowFiltered(first, last, filtered);
        yield;
      }
      for (const [col, row, kind, value] of sheet.cells) {
        const pos = new ScAddress(col, row, tab);
        if (kind === "number") importer.docImport.setNumericCell(pos, value as number);
        else {
          const string = unicode(value as string);
          try {
            if (kind === "formula")
              importer.docImport.setFormulaCell(pos, string, FormulaGrammar.Grammar.GRAM_ODFF);
            else if (kind === "edit") {
              document.SetTextCell(pos, string);
              importer.docImport.invalidateBlockPositionSet(pos.Tab());
            } else importer.docImport.setStringCell(pos, string);
          } finally {
            string.dispose();
          }
        }
        yield;
      }
    }
    importer.docImport.finalize();
    document.SetAutoCalc(true);
    complete = true;
    return document;
  } finally {
    importer.DisposeStyles();
    if (!complete) document.DisposeAttributes();
  }
}
/** Captures in a worker/inline runtime. @param document - Model. @returns Record. */
export function encodeCalcDocument(document: ScDocument): CalcDocumentRecord {
  return runSynchronously(encodeSteps(document));
}
/** Restores in a worker/inline runtime. @param record - Record. @returns Model. */
export function decodeCalcDocument(record: CalcDocumentRecord): ScDocument {
  return runSynchronously(decodeSteps(record));
}
/** Captures without monopolizing browser tasks. @param document - Model. @param cancelled - Snapshot guard. @returns Record. */
export function encodeCalcDocumentAsync(
  document: ScDocument,
  cancelled: () => boolean,
): Promise<CalcDocumentRecord> {
  return runCooperatively(encodeSteps(document), cancelled);
}
/** Restores without monopolizing browser tasks. @param record - Record. @param cancelled - Staleness guard. @returns Model. */
export function decodeCalcDocumentAsync(
  record: CalcDocumentRecord,
  cancelled: () => boolean,
): Promise<ScDocument> {
  return runCooperatively(decodeSteps(record), cancelled);
}
