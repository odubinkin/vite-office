/** @fileoverview Bounded Calc worker transfer of supported native cells, sparse attributes and geometry; XML remains the durable format. */
import type { NoteEntry } from "../../../inc/postit";
import {
  decodeCalcDatabaseRanges,
  encodeCalcDatabaseRanges,
  type CalcDatabaseRangesRecord,
} from "./calc-database-range-codec";
import {
  decodeCalcCellNote,
  decodeCalcPerson,
  encodeCalcCellNote,
  encodeCalcPerson,
  type CalcCellNoteRecord,
  type CalcPersonRecord,
} from "./calc-note-codec";
import { ScFormulaCell } from "../../../source/core/data/formulacell";
import {
  decodeCalcIconSets,
  encodeCalcIconSets,
  type CalcIconSetRecord,
} from "./calc-icon-set-codec";
import { escapeXml } from "../../../../xmloff/source/text/txtparae";
import {
  decodeMatrixCell,
  encodeMatrixCell,
  type CalcMatrixCellRecord,
} from "./calc-matrix-cell-codec";
import { Color, ColorTransparency, COL_AUTO } from "../../../../tools/inc/color";
import { exportPageStyles } from "../../../source/filter/xml/xmlstyle.page";
import { GetPrintRanges } from "../../../source/core/data/table1";
import {
  getSheetCursor,
  getSheetTabSelected,
  setSheetTabSelected,
  getSheetPaneLayout,
  isSheetPaneLayout,
  setSheetPaneLayout,
  type SheetPaneLayout,
  setSheetCursor,
} from "../../../source/core/data/document.sheet-visibility";
import { runCooperatively, runSynchronously } from "../../../../framework/browser/io/cooperative";
import { ScDocument } from "../../../inc/document";
import {
  ScTableProtectionOption as ProtectionOption,
  ScPasswordHash,
  type ScOoxPasswordHash,
  type ScEnhancedProtection,
  type ScStoredPasswordHash,
} from "../../../inc/tabprotection";
import { ScTableProtection } from "../../../source/core/data/tabprotection";
import { ScRangeList } from "../../../inc/rangelst";
import { ScAddress, ScRange, MAXCOL, MAXROW } from "../../../inc/address";
import { ScHorizontalCellIterator } from "../../../inc/dociter";
import { CellType, CRFlags } from "../../../inc/global";
import { CellAttributeHolder, ScPatternAttr } from "../../../inc/patattr";
import { FormulaGrammar } from "../../../../formula/inc/grammar";
import { unicode, text } from "../../../../i18nlangtag/source/isolang/isolang.tables";
import { XMLFontAutoStylePool } from "../../../../xmloff/source/style/XMLFontAutoStylePool";
import { ODF_NAMESPACES } from "../../../../xmloff/source/core/xmltoken";
import { ExportConditionalFormat } from "../../../source/filter/xml/xmlcondformat";
import { ScXMLImport } from "../../../source/filter/xml/xmlimprt";
import {
  exportCellTextPropertyElement,
  exportCellPropertyElement,
  exportCellParagraphProperties,
  exportNamedCellStyles,
  getCellStyleXMLName,
  getCellStyleXMLNames,
} from "../../../source/filter/xml/xmlstyle";
import type { ScTable } from "../../../inc/table";
import { ScGridOptions, ViewOption } from "../../../inc/viewopti";
import { SvxLanguageItem } from "../../../../editeng/inc/langitem";
import { SfxUInt32Item } from "../../../../svl/source/items/intitem";
import { NUMBERFORMAT_ENTRY_NOT_FOUND } from "../../../../svl/inc/zforlist";
import { SvxFrameDirection as D } from "../../../../editeng/inc/frmdir";
import { SvxFrameDirectionItem } from "../../../../editeng/source/items/frmitems.direction";
import {
  ATTR_LANGUAGE_FORMAT,
  ATTR_MERGE,
  ATTR_VALUE_FORMAT,
  ATTR_WRITINGDIR,
} from "../../../inc/scitems";
import type { ScMergeAttr } from "../../../inc/attrib";
import { InsertRangeNames, type RangeDataType } from "../../../source/core/tool/rangenam";
import { ScDocOptions } from "../../../source/core/tool/docoptio";
import { Date } from "../../../../tools/source/datetime/tdate";
import {
  CellTextStylePool,
  type CellTextParagraph,
} from "../../../source/filter/xml/xmlexprt.celltext";
import { createCellEditText } from "../../../source/filter/xml/xmlcelli.edit";
import { FormulaDoubleToken, FormulaStringToken } from "../../../../formula/inc/token";
import {
  CreateDoubleError,
  FormulaError,
  GetDoubleErrorValue,
} from "../../../../formula/inc/errorcodes";
/** Cloneable external cache cell with an explicit error discriminator for NaN payloads. */
type ExternalCell =
  | readonly [col: number, row: number, kind: "double" | "error", value: number, format?: number]
  | readonly [col: number, row: number, kind: "string", value: string, format?: number];
/** External sources in file-ID order, with the real sheet names and sparse data. */
type ExternalFile = readonly [
  name: string,
  sheets: readonly ExternalSheet[],
  relativeName?: string | undefined,
  filter?: readonly [name: string, options: string],
];
/** External sheet cache including the ODF complete-table marker. */
type ExternalSheet = readonly [name: string, cells: readonly ExternalCell[], complete?: boolean];
/** Already imported hybrid formula result, with the native pending format flag. */
type FormulaCache = readonly [value: number | string, needsNumberFormat: boolean];
/** Compact native scalar alternative with an optional clean formula result. */
type Cell =
  | CalcMatrixCellRecord
  | readonly [col: number, row: number, kind: "number", value: number]
  | readonly [col: number, row: number, kind: "text", value: string]
  | readonly [col: number, row: number, kind: "formula", value: string, cache?: FormulaCache]
  | readonly [col: number, row: number, kind: "edit", value: string | readonly CellTextParagraph[]];
/** Actual sparse pattern span; -1 selects the native default column. */
type Pattern = readonly [
  col: number,
  first: number,
  last: number,
  style: string,
  numberFormat?: number | undefined,
  writingDirection?: D,
];
/** Compiled format source and locale, independent of the process-local format key. */
type NumberFormat = readonly [locale: number, code: string];
/** Geometry spans preserve defaults and hidden/filter/manual flags without expanding the sheet domain. */
/** One native outline entry in parent-first order across the worker boundary. */
type OutlineGroup = readonly [
  rows: boolean,
  first: number,
  last: number,
  hidden: boolean,
  visible: boolean,
];
/** Native addresses of both endpoints of an area. */
type PrintRange = readonly [number, number, number, number, number, number];

/** Serializes the native endpoints, including the original base tab. @param range - Print or repeat range. @returns Transfer record. */
function encodePrintRange(range: ScRange): PrintRange {
  return [...range.aStart.GetVars(), ...range.aEnd.GetVars()];
}

/** Reconstructs a native range from valid transfer coordinates. @param input - Transferred endpoints. @param document - Native limits. @returns Print range. */
function decodePrintRange(input: PrintRange, document: ScDocument): ScRange {
  const [firstCol, firstRow, firstTab, lastCol, lastRow, lastTab] = input;
  if (
    input.length !== 6 ||
    !input.every(Number.isInteger) ||
    !document.ValidCol(firstCol) ||
    !document.ValidCol(lastCol) ||
    !document.ValidRow(firstRow) ||
    !document.ValidRow(lastRow) ||
    !document.FetchTable(firstTab) ||
    !document.FetchTable(lastTab)
  )
    throw new Error("Calc worker print range is invalid.");
  return new ScRange(firstCol, firstRow, firstTab, lastCol, lastRow, lastTab);
}

/** Tests the primitive fields of a transferred OOXML verifier. @param hash - Source data. @returns Whether the verifier is valid. */
function isOoxPasswordHash(hash: ScOoxPasswordHash | undefined): boolean {
  return Boolean(
    hash &&
    typeof hash.algorithmName === "string" &&
    typeof hash.hashValue === "string" &&
    typeof hash.saltValue === "string" &&
    Number.isInteger(hash.spinCount) &&
    hash.spinCount >= 0 &&
    hash.spinCount <= 0xffffffff,
  );
}
/** Native sparse sheet transfer record. */
interface Sheet {
  readonly visible?: boolean;
  readonly tabColor?: number;
  readonly pageStyle?: string;
  readonly protection?: {
    readonly enabled: boolean;
    readonly options: boolean[];
    readonly ooxHash: ScOoxPasswordHash | undefined;
    readonly storedHash: ScStoredPasswordHash | undefined;
    readonly enhanced?: readonly (Omit<ScEnhancedProtection, "ranges"> & {
      readonly ranges: readonly PrintRange[];
    })[];
  };
  readonly outline?: OutlineGroup[];
  readonly rowBreaks?: number[];
  readonly columnBreaks?: number[];
  readonly printRanges?: PrintRange[];
  readonly conditionalFormats?: string;
  readonly conditionalIconSets?: readonly CalcIconSetRecord[];
  readonly repeatColumns?: PrintRange;
  readonly repeatRows?: PrintRange;
  readonly name: string;
  readonly showGrid?: boolean;
  readonly tabSelected?: boolean;
  readonly cursor?: readonly [column: number, row: number];
  readonly panes?: SheetPaneLayout;
  readonly optimalMinRowHeight?: number;
  readonly cells: Cell[];
  readonly notes?: readonly CalcCellNoteRecord[];
  readonly patterns: Pattern[];
  readonly merges?: [firstColumn: number, firstRow: number, lastColumn: number, lastRow: number][];
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
/** Native ODF calculation properties added to the version-one graph. */
interface CalculationSettings {
  readonly calcAsShown: boolean;
  readonly lookUpLabels: boolean;
  readonly matchWholeCell: boolean;
  readonly regex: boolean;
  readonly wildcards: boolean;
  readonly iterationEnabled: boolean;
  readonly iterationCount: number;
  readonly iterationEpsilon: number;
  readonly year2000: number;
}

/** Calc drawing grid across the Worker boundary in native unsigned units. */
type DrawingGrid = readonly [
  resolutionX: number,
  resolutionY: number,
  subdivisionX: number,
  subdivisionY: number,
  snap: boolean,
  visible: boolean,
  synchronized: boolean,
];

/** Rebuilds native drawing-grid options from a validated transfer. @param input - Worker payload. @returns Drawing-grid value. */
function decodeDrawingGrid(input: DrawingGrid): ScGridOptions {
  if (!Array.isArray(input) || input.length !== 7)
    throw new Error("Calc worker drawing grid is invalid.");
  const [resolutionX, resolutionY, subdivisionX, subdivisionY, snap, visible, synchronized] = input;
  if (
    ![resolutionX, resolutionY, subdivisionX, subdivisionY].every(
      /** Checks the native UInt32 domain. @param value - Transferred measurement. @returns Whether it fits. */
      (value) => Number.isInteger(value) && value >= 0 && value <= 0xffffffff,
    ) ||
    typeof snap !== "boolean" ||
    typeof visible !== "boolean" ||
    typeof synchronized !== "boolean"
  )
    throw new Error("Calc worker drawing grid is invalid.");
  const grid = new ScGridOptions();
  grid.SetFieldDrawX(resolutionX);
  grid.SetFieldDrawY(resolutionY);
  grid.SetFieldDivisionX(subdivisionX);
  grid.SetFieldDivisionY(subdivisionY);
  grid.SetUseGridSnap(snap);
  grid.SetGridVisible(visible);
  grid.SetSynchronize(synchronized);
  return grid;
}

/** Ephemeral transport, never persisted instead of XML. */
export interface CalcDocumentRecord {
  readonly version: 1;
  readonly styles: string;
  readonly sheets: Sheet[];
  readonly externalFiles?: readonly ExternalFile[];
  readonly persons?: readonly CalcPersonRecord[];
  readonly databaseRanges?: CalcDatabaseRangesRecord;
  readonly visibleTab?: number;
  readonly showGrid?: boolean;
  readonly showFormulas?: boolean;
  readonly showHeaders?: boolean;
  readonly showZeros?: boolean;
  readonly showOutline?: boolean;
  readonly showSheetTabs?: boolean;
  readonly showPageBreaks?: boolean;
  readonly showNotes?: boolean;
  readonly showNoteAuthor?: boolean;
  readonly showFormulasMarks?: boolean;
  readonly valueHighlighting?: boolean;
  readonly drawingGrid?: DrawingGrid;
  readonly nullDate?: number;
  readonly ignoreCase?: boolean;
  readonly calculationSettings?: CalculationSettings;
  readonly defaultWritingDirection?: D;
  readonly numberFormats?: readonly NumberFormat[];
  readonly names?: readonly [
    name: string,
    scope: number,
    col: number,
    row: number,
    tab: number,
    type: RangeDataType,
    symbol: string,
  ][];
}
/** Validates the native frame direction in a transfer record. @param direction - Original scalar. @returns Owned native item. */
function restoreWritingDirection(direction: D): SvxFrameDirectionItem {
  if (!Number.isInteger(direction) || direction < D.Unknown || direction > D.Stacked)
    throw new Error("Calc worker writing direction is invalid.");
  return new SvxFrameDirectionItem(direction, ATTR_WRITINGDIR);
}
/** Captures supported values without computing formula results or packaging XML. @param document - Model. @returns Incremental record. */
function* encodeSteps(document: ScDocument): Generator<void, CalcDocumentRecord> {
  const sheets: Sheet[] = [],
    fonts = new XMLFontAutoStylePool(),
    styles = new Map<string, { name: string; parent: string; properties: string }>(),
    patternNames = new Map<ScPatternAttr, string>();
  const pageStyles = exportPageStyles(document, fonts);
  const reservedNames = getCellStyleXMLNames(document);
  let automaticStyleIndex = 0;
  const numberFormats: NumberFormat[] = [];
  const textStyles = new CellTextStylePool(document, fonts);
  const numberFormatIndices = new Map<number, number>();
  /** Adds one native format definition to the transfer table. @param key - Number-format index. @returns Transfer index, if represented. */
  function registerNumberFormat(key: number): number | undefined {
    const formatter = document.GetFormatTable();
    const existing = numberFormatIndices.get(key);
    if (existing !== undefined) return existing;
    const entry = formatter.GetEntry(key);
    if (!entry) return undefined;
    const index = numberFormats.push([entry.GetLanguage(), text(entry.GetFormatstring())]) - 1;
    numberFormatIndices.set(key, index);
    return index;
  }
  const styleName =
    /** Encodes native style identity for the Calc worker boundary. @param pattern - pattern. @returns Operation result. */ (
      pattern: ScPatternAttr,
    ): string => {
      const cached = patternNames.get(pattern);
      if (cached !== undefined) return cached;
      const t = exportCellTextPropertyElement(pattern, fonts),
        c = exportCellPropertyElement(pattern),
        p = exportCellParagraphProperties(pattern);
      const parent = getCellStyleXMLName(pattern.GetStyleName());
      const properties = `${t}${c}${p ? `<style:paragraph-properties${p}/>` : ""}`;
      if (!properties) {
        const name = parent === "Default" ? "" : parent;
        patternNames.set(pattern, name);
        return name;
      }
      const key = JSON.stringify([parent, properties]);
      let style = styles.get(key);
      if (!style) {
        let name: string;
        do name = `ce${++automaticStyleIndex}`;
        while (reservedNames.has(name));
        style = { name, parent, properties };
        styles.set(key, style);
      }
      patternNames.set(pattern, style.name);
      return style.name;
    };
  for (let tab = 0; tab < document.GetTableCount(); tab++) {
    const table = document.FetchTable(tab) as ScTable;
    const merges: NonNullable<Sheet["merges"]> = [];
    const outline = table.GetOutlineTable();
    const groups: OutlineGroup[] = [];
    const rowBreaks = new Set<number>();
    const columnBreaks = new Set<number>();
    table.GetAllRowBreaks(rowBreaks, false, true);
    table.GetAllColBreaks(columnBreaks, false, true);
    const repeatColumns = table.GetRepeatColRange();
    const repeatRows = table.GetRepeatRowRange();
    const protection = table.GetProtection();
    const cursor = getSheetCursor(document, tab);
    const tabSelected = getSheetTabSelected(document, tab);
    const panes = getSheetPaneLayout(document, tab);
    const tabColor = table.GetTabBgColor();
    const pageStyle = table.GetPageStyle();
    const conditionalFormats = ExportConditionalFormat(document, table, true);
    const conditionalIconSets = encodeCalcIconSets(table);
    const noteEntries: NoteEntry[] = [];
    document.GetAllNoteEntries(tab, noteEntries);
    const notes: CalcCellNoteRecord[] = [];
    const sheet: Sheet = {
      ...(pageStyles.names.has(pageStyle) ? { pageStyle } : {}),
      ...(tabColor.equals(COL_AUTO) ? {} : { tabColor: tabColor.toUInt32() }),
      ...(table.IsVisible() ? {} : { visible: false }),
      ...(protection
        ? {
            protection: {
              enabled: protection.isProtected(),
              options: Array.from(
                { length: ProtectionOption.NONE },
                /** Transfers a native option in enum order. @param _value - Uninitialized slot. @param option - Native option. @returns Permission. */
                (_value, option) => protection.isOptionEnabled(option),
              ),
              ooxHash: protection.getOoxPasswordHash(),
              storedHash: protection.getStoredPasswordHash(),
              enhanced: protection.getEnhancedProtection().map(
                /** Copies a native enhanced range into a realm-neutral record. @param entry - Native range record. @returns Transferrable record. */
                (entry) => ({ ...entry, ranges: Array.from(entry.ranges, encodePrintRange) }),
              ),
            },
          }
        : {}),
      ...(outline ? { outline: groups } : {}),
      ...(rowBreaks.size ? { rowBreaks: [...rowBreaks] } : {}),
      ...(columnBreaks.size ? { columnBreaks: [...columnBreaks] } : {}),
      ...(table.IsPrintEntireSheet()
        ? {}
        : { printRanges: GetPrintRanges(table).map(encodePrintRange) }),
      ...(conditionalFormats ? { conditionalFormats } : {}),
      ...(conditionalIconSets.length ? { conditionalIconSets } : {}),
      ...(repeatColumns ? { repeatColumns: encodePrintRange(repeatColumns) } : {}),
      ...(repeatRows ? { repeatRows: encodePrintRange(repeatRows) } : {}),
      name: text(table.GetName()),
      ...(document.GetSheetShowGrid(tab) ? {} : { showGrid: false }),
      ...(cursor[0] || cursor[1] ? { cursor } : {}),
      ...(tabSelected === undefined ? {} : { tabSelected }),
      ...(panes ? { panes } : {}),
      optimalMinRowHeight: table.GetOptimalMinRowHeight(),
      cells: [],
      ...(noteEntries.length ? { notes } : {}),
      patterns: [],
      merges,
      columns: [],
      rows: [],
    };
    sheets.push(sheet);
    for (const entry of noteEntries) {
      notes.push(encodeCalcCellNote(entry, textStyles));
      yield;
    }
    if (outline)
      for (const rows of [false, true]) {
        const axis = rows ? outline.GetRowArray() : outline.GetColArray();
        for (let level = 0; level < axis.GetDepth(); ++level)
          for (const entry of axis.GetEntries(level)) {
            groups.push([rows, entry.start, entry.end, entry.hidden, entry.visible]);
            yield;
          }
      }
    const iterator = new ScHorizontalCellIterator(document, tab, 0, 0, MAXCOL, MAXROW),
      col: [number] = [0],
      row: [number] = [0];
    let cell;
    while ((cell = iterator.GetNext(col, row))) {
      const formula = cell.getFormula();
      if (formula) {
        const matrix = encodeMatrixCell(formula);
        if (matrix) {
          sheet.cells.push(matrix);
          continue;
        }
        const source = formula.GetFormula(FormulaGrammar.Grammar.GRAM_ODFF);
        try {
          if (
            !formula.GetDirty() &&
            formula.GetErrCode() === FormulaError.NONE &&
            !formula.IsEmpty()
          ) {
            const result = formula.IsValue()
              ? formula.GetValue()
              : text(formula.GetString().getString());
            sheet.cells.push([
              col[0],
              row[0],
              "formula",
              text(source),
              [result, formula.NeedsNumberFormat()],
            ]);
          } else sheet.cells.push([col[0], row[0], "formula", text(source)]);
        } finally {
          source.dispose();
        }
      } else if (cell.getType() === CellType.CELLTYPE_VALUE)
        sheet.cells.push([col[0], row[0], "number", cell.getDouble()]);
      else if (cell.getType() === CellType.CELLTYPE_EDIT) {
        const edit = cell.getEditText();
        /* istanbul ignore if -- B8TCAE-C01: the actual borrowed EDIT view always retains its constructor-bound non-null edit owner. */
        if (!edit) throw new Error("Calc edit cell is unavailable.");
        else {
          /* Keep the genuine owned-value alternative visible to source mapping. */
        }
        sheet.cells.push([col[0], row[0], "edit", textStyles.collect(edit)]);
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
        const style = styleName(pattern);
        const numberFormat = pattern.GetItemSet().GetItemIfSet(ATTR_VALUE_FORMAT, false)
          ? registerNumberFormat(pattern.GetNumberFormat(document.GetFormatTable()))
          : undefined;
        const direction = (
          pattern.GetItemSet().GetItemIfSet(ATTR_WRITINGDIR, false) as
            SvxFrameDirectionItem | undefined
        )?.GetValue();
        sheet.patterns.push(
          direction !== undefined
            ? [column, r, last[0], style, numberFormat, direction]
            : numberFormat === undefined
              ? [column, r, last[0], style]
              : [column, r, last[0], style, numberFormat],
        );
        const merge = pattern.GetItem(ATTR_MERGE) as ScMergeAttr;
        if (column >= 0 && merge.IsMerged()) {
          for (let row = r; row <= last[0]; ++row) {
            merges.push([
              column,
              row,
              column + merge.GetColMerge() - 1,
              row + merge.GetRowMerge() - 1,
            ]);
            yield;
          }
        }
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
  const automatic = Array.from(
    styles.values(),
    /** Encodes an automatic pattern and its native named parent. @param style - Pattern style. @returns ODF style element. */ ({
      name,
      parent,
      properties,
    }) =>
      `<style:style style:name="${name}" style:family="table-cell"${parent ? ` style:parent-style-name="${escapeXml(parent)}"` : ""}>${properties}</style:style>`,
  ).join("");
  const defaults = exportNamedCellStyles(document, fonts);
  const defaultWritingDirection = (
    document
      .GetStyleSheetPool()
      ?.GetDefaultStyle()
      ?.GetItemSet()
      .GetItemIfSet(ATTR_WRITINGDIR, false) as SvxFrameDirectionItem | undefined
  )?.GetValue();
  const names: NonNullable<CalcDocumentRecord["names"]>[number][] = [];
  for (let scope = -1; scope < document.GetTableCount(); ++scope)
    for (const entry of document.GetRangeName(scope) ?? []) {
      names.push([
        entry.name,
        scope,
        entry.pos.Col(),
        entry.pos.Row(),
        entry.pos.Tab(),
        entry.type,
        entry.GetSymbol(),
      ]);
      yield;
    }
  const view = document.GetViewOptions();
  const externalFiles: ExternalFile[] = [];
  for (const file of document.GetExternalRefManager().getExternalFiles()) {
    const sheets: ExternalSheet[] = [];
    for (const sheet of file.tables.values()) {
      const cached: ExternalCell[] = [];
      for (const [row, cells] of sheet.cache.entries()) {
        for (const [col, { token, format }] of cells) {
          const index = format === 0 ? undefined : registerNumberFormat(format);
          const formatValue: [number?] = index === undefined ? [] : [index];
          if (token instanceof FormulaStringToken)
            cached.push([col, row, "string", text(token.GetString().getString()), ...formatValue]);
          else {
            const number = token.GetDouble();
            const error = GetDoubleErrorValue(number);
            cached.push(
              error === FormulaError.NONE
                ? [col, row, "double", number, ...formatValue]
                : [col, row, "error", error, ...formatValue],
            );
          }
          yield;
        }
      }
      sheets.push(
        sheet.cache.isWholeTableCached() ? [sheet.name, cached, true] : [sheet.name, cached],
      );
    }
    const filter =
      file.filterName || file.filterOptions
        ? ([file.filterName ?? "", file.filterOptions ?? ""] as const)
        : undefined;
    externalFiles.push(
      filter
        ? [file.name, sheets, file.relativeName, filter]
        : file.relativeName === undefined
          ? [file.name, sheets]
          : [file.name, sheets, file.relativeName],
    );
  }
  const options = document.GetDocOptions();
  const grid = view.GetGridOptions();
  const persons: CalcPersonRecord[] = [];
  for (const person of document.GetPersonList()) {
    persons.push(encodeCalcPerson(person));
    yield;
  }
  const databaseRanges = encodeCalcDatabaseRanges(document);
  return {
    version: 1,
    sheets,
    ...(databaseRanges ? { databaseRanges } : {}),
    ...(externalFiles.length ? { externalFiles } : {}),
    ...(persons.length ? { persons } : {}),
    ...(document.GetVisibleTab() ? { visibleTab: document.GetVisibleTab() } : {}),
    ...(view.GetOption(ViewOption.GRID) ? {} : { showGrid: false }),
    ...(view.GetOption(ViewOption.FORMULAS) ? { showFormulas: true } : {}),
    ...(view.GetOption(ViewOption.HEADER) ? {} : { showHeaders: false }),
    ...(view.GetOption(ViewOption.NULLVALS) ? {} : { showZeros: false }),
    ...(view.GetOption(ViewOption.OUTLINER) ? {} : { showOutline: false }),
    ...(view.GetOption(ViewOption.TABCONTROLS) ? {} : { showSheetTabs: false }),
    ...(view.GetOption(ViewOption.PAGEBREAKS) ? {} : { showPageBreaks: false }),
    ...(view.GetOption(ViewOption.NOTES) ? {} : { showNotes: false }),
    ...(view.GetOption(ViewOption.NOTEAUTHOR) ? {} : { showNoteAuthor: false }),
    ...(view.GetOption(ViewOption.FORMULAS_MARKS) ? { showFormulasMarks: true } : {}),
    ...(view.GetOption(ViewOption.SYNTAX) ? { valueHighlighting: true } : {}),
    drawingGrid: [
      grid.GetFieldDrawX(),
      grid.GetFieldDrawY(),
      grid.GetFieldDivisionX(),
      grid.GetFieldDivisionY(),
      grid.GetUseGridSnap(),
      grid.GetGridVisible(),
      grid.GetSynchronize(),
    ],
    nullDate: document.GetFormatTable().GetNullDate().GetDate(),
    ...(options.IsIgnoreCase() ? { ignoreCase: true } : {}),
    calculationSettings: {
      calcAsShown: options.IsCalcAsShown(),
      lookUpLabels: options.IsLookUpColRowNames(),
      matchWholeCell: options.IsMatchWholeCell(),
      regex: options.IsFormulaRegexEnabled(),
      wildcards: options.IsFormulaWildcardsEnabled(),
      iterationEnabled: options.IsIter(),
      iterationCount: options.GetIterCount(),
      iterationEpsilon: options.GetIterEps(),
      year2000: options.GetYear2000(),
    },
    ...(defaultWritingDirection === undefined ? {} : { defaultWritingDirection }),
    ...(numberFormats.length ? { numberFormats } : {}),
    ...(names.length ? { names } : {}),
    styles: `<office:document-styles${namespaces} office:version="1.3">${fonts.exportXML()}${defaults}<office:automatic-styles>${automatic}${textStyles.exportStyles()}${pageStyles.layouts}</office:automatic-styles>${pageStyles.masters}</office:document-styles>`,
  };
}

/** Restores and validates the new version-one calculation fields. @param options - Native document options. @param settings - Worker calculation record. @returns Nothing. */
function restoreCalculationSettings(options: ScDocOptions, settings: CalculationSettings): void {
  if (
    settings === null ||
    typeof settings !== "object" ||
    typeof settings.calcAsShown !== "boolean" ||
    typeof settings.lookUpLabels !== "boolean" ||
    typeof settings.matchWholeCell !== "boolean" ||
    typeof settings.regex !== "boolean" ||
    typeof settings.wildcards !== "boolean" ||
    (settings.regex && settings.wildcards) ||
    typeof settings.iterationEnabled !== "boolean" ||
    (settings.iterationCount & 0xffff) !== settings.iterationCount ||
    typeof settings.iterationEpsilon !== "number" ||
    (settings.year2000 & 0xffff) !== settings.year2000
  )
    throw new Error("Calc worker calculation settings are invalid.");

  options.SetCalcAsShown(settings.calcAsShown);
  options.SetLookUpColRowNames(settings.lookUpLabels);
  options.SetMatchWholeCell(settings.matchWholeCell);
  options.SetFormulaRegexEnabled(settings.regex);
  options.SetFormulaWildcardsEnabled(settings.wildcards);
  options.SetIter(settings.iterationEnabled);
  options.SetIterCount(settings.iterationCount);
  options.SetIterEps(settings.iterationEpsilon);
  options.SetYear2000(settings.year2000);
}

/** Restores a fresh native document before atomic shell adoption. @param record - Worker record. @returns Incremental candidate. */
function* decodeSteps(record: CalcDocumentRecord): Generator<void, ScDocument> {
  if (record.version !== 1 || !Array.isArray(record.sheets))
    throw new Error("Calc worker graph is invalid.");
  const document = new ScDocument(),
    importer = new ScXMLImport(document);
  const transferredStyles = new Map<string, CellAttributeHolder>();
  let complete = false;
  document.SetAutoCalc(false);
  try {
    if (
      record.ignoreCase === true ||
      record.nullDate !== undefined ||
      record.calculationSettings !== undefined
    ) {
      const options = new ScDocOptions(document.GetDocOptions());
      if (record.nullDate !== undefined) {
        const packed = record.nullDate;
        if (typeof packed !== "number" || (packed | 0) !== packed)
          throw new Error("Calc worker null date is invalid.");
        const date = new Date(packed);
        if (!date.IsValidDate()) throw new Error("Calc worker null date is invalid.");
        options.SetDate(date.GetDay(), date.GetMonth(), date.GetYear());
      }
      if (record.ignoreCase === true) options.SetIgnoreCase(true);
      if (record.calculationSettings !== undefined)
        restoreCalculationSettings(options, record.calculationSettings);
      document.SetDocOptions(options);
    }
    importer.importStyles(record.styles);
    if (record.defaultWritingDirection !== undefined) {
      const pool = document.GetStyleSheetPool();
      const style = pool?.GetDefaultStyle(true);
      if (!style) throw new Error("Calc worker Standard style is missing.");
      const items = style.GetItemSet().Clone();
      try {
        items.Put(restoreWritingDirection(record.defaultWritingDirection));
        pool?.SetDefaultCellStyle(items);
      } finally {
        items.Dispose();
      }
    }
    const formats: { key: number; language: number }[] = [];
    if (record.numberFormats?.length) {
      const formatter = document.GetFormatTable();
      for (const [language, source] of record.numberFormats) {
        const code = unicode(source);
        const check: [number] = [0],
          type: [number] = [0],
          key: [number] = [0];
        try {
          formatter.PutEntry(code, check, type, key, language);
          if (check[0] || key[0] === NUMBERFORMAT_ENTRY_NOT_FOUND)
            throw new Error("Calc worker number format is invalid.");
          formats.push({ key: key[0], language });
        } finally {
          code.dispose();
        }
        yield;
      }
    }
    for (const [tab, sheet] of record.sheets.entries()) {
      const name = unicode(sheet.name);
      try {
        if (!document.InsertTab(tab, name)) throw new Error("Calc worker sheet is invalid.");
        if (sheet.visible === false) document.SetVisible(tab, false);
        if (sheet.pageStyle !== undefined) {
          if (
            typeof sheet.pageStyle !== "string" ||
            !document.GetStyleSheetPool()?.GetPageStyle(sheet.pageStyle)
          )
            throw new Error("Invalid Calc sheet page style.");
          document.SetPageStyle(tab, sheet.pageStyle);
        }
        if (sheet.tabColor !== undefined) {
          if (sheet.tabColor !== sheet.tabColor >>> 0) throw new Error("Invalid Calc sheet color.");
          document.SetTabBgColor(
            tab,
            new Color(ColorTransparency, sheet.tabColor, "ColorTransparencyTag"),
          );
        }
        if (typeof sheet.showGrid === "boolean") document.SetSheetShowGrid(tab, sheet.showGrid);
        if (typeof sheet.tabSelected === "boolean")
          setSheetTabSelected(document, tab, sheet.tabSelected);
        if (Array.isArray(sheet.cursor))
          setSheetCursor(document, tab, sheet.cursor[0], sheet.cursor[1]);
        if (sheet.panes !== undefined) {
          if (!sheet.panes || !isSheetPaneLayout(document, sheet.panes))
            throw new Error("Calc worker sheet pane layout is invalid.");
          setSheetPaneLayout(document, tab, sheet.panes);
        }
      } finally {
        name.dispose();
      }
    }
    if (record.visibleTab !== undefined && document.FetchTable(record.visibleTab))
      document.SetVisibleTab(record.visibleTab);
    const view = document.GetViewOptions();
    if (typeof record.showGrid === "boolean") view.SetOption(ViewOption.GRID, record.showGrid);
    if (typeof record.showFormulas === "boolean")
      view.SetOption(ViewOption.FORMULAS, record.showFormulas);
    if (typeof record.showHeaders === "boolean")
      view.SetOption(ViewOption.HEADER, record.showHeaders);
    if (typeof record.showZeros === "boolean")
      view.SetOption(ViewOption.NULLVALS, record.showZeros);
    if (typeof record.showOutline === "boolean")
      view.SetOption(ViewOption.OUTLINER, record.showOutline);
    if (typeof record.showSheetTabs === "boolean")
      view.SetOption(ViewOption.TABCONTROLS, record.showSheetTabs);
    if (typeof record.showPageBreaks === "boolean")
      view.SetOption(ViewOption.PAGEBREAKS, record.showPageBreaks);
    if (typeof record.showNotes === "boolean") view.SetOption(ViewOption.NOTES, record.showNotes);
    if (typeof record.showNoteAuthor === "boolean")
      view.SetOption(ViewOption.NOTEAUTHOR, record.showNoteAuthor);
    if (typeof record.showFormulasMarks === "boolean")
      view.SetOption(ViewOption.FORMULAS_MARKS, record.showFormulasMarks);
    if (typeof record.valueHighlighting === "boolean")
      view.SetOption(ViewOption.SYNTAX, record.valueHighlighting);
    if (record.drawingGrid !== undefined)
      view.SetGridOptions(decodeDrawingGrid(record.drawingGrid));
    for (const person of record.persons ?? []) {
      document.AddPerson(decodeCalcPerson(person));
      yield;
    }
    for (const [name, sheets, relativeName, filter] of record.externalFiles ?? []) {
      const manager = document.GetExternalRefManager();
      const file = manager.getExternalFileId(name);
      if (typeof relativeName === "string") manager.setRelativeFileName(file, "../" + relativeName);
      if (filter !== undefined) {
        if (
          !Array.isArray(filter) ||
          filter.length !== 2 ||
          typeof filter[0] !== "string" ||
          typeof filter[1] !== "string"
        )
          throw new Error("Calc worker external source filter is invalid.");
        manager.setFilterData(file, filter[0], filter[1]);
      }
      for (const [sheet, cells, complete] of sheets) {
        const cache = manager.getCacheTable(file, sheet, true);
        if (!cache) throw new Error("Calc worker external sheet is invalid.");
        if (complete === true) cache.setWholeTableCached();
        for (const [col, row, kind, value, formatIndex] of cells) {
          if (!Number.isInteger(col) || !Number.isInteger(row) || !document.ValidColRow(col, row))
            throw new Error("Calc worker external cell address is invalid.");
          let key = 0;
          if (formatIndex !== undefined) {
            const format = formats[formatIndex];
            if (!Number.isInteger(formatIndex) || formatIndex < 0 || !format)
              throw new Error("Calc worker external cell number format is invalid.");
            key = format.key;
          }
          if (kind === "string" && typeof value === "string") {
            const lexical = unicode(value);
            try {
              const shared = document.GetSharedStringPool().intern(lexical);
              try {
                cache.setCell(col, row, new FormulaStringToken(shared), key);
              } finally {
                shared.dispose();
              }
            } finally {
              lexical.dispose();
            }
          } else if (kind === "double" && Number.isFinite(value))
            cache.setCell(col, row, new FormulaDoubleToken(value), key);
          else if (kind === "error" && Number.isInteger(value) && value > 0 && value <= 0xffff)
            cache.setCell(
              col,
              row,
              new FormulaDoubleToken(CreateDoubleError(value as FormulaError)),
              key,
            );
          else throw new Error("Calc worker external cell value is invalid.");
          yield;
        }
      }
    }
    InsertRangeNames(
      document,
      (record.names ?? []).map(
        /** Restores an actual native name base from its transfer cell. @param record - Name data. @returns Definition. */
        ([name, scope, col, row, tab, type, symbol]) => ({
          name,
          scope,
          pos: new ScAddress(col, row, tab),
          type,
          symbol,
        }),
      ),
      FormulaGrammar.Grammar.GRAM_ODFF,
    );
    for (const [tab, sheet] of record.sheets.entries()) {
      const table = document.FetchTable(tab) as ScTable;
      if (sheet.protection) {
        const { enabled, options, ooxHash, storedHash } = sheet.protection;
        if (
          typeof enabled !== "boolean" ||
          options.length !== ProtectionOption.NONE ||
          Array.from(options).some(
            /** Validates the option, including an absent slot. @param option - Transferred value. @returns Whether the value is invalid. */
            (option) => typeof option !== "boolean",
          ) ||
          (storedHash &&
            (!ArrayBuffer.isView(storedHash.bytes) ||
              Object.prototype.toString.call(storedHash.bytes) !== "[object Uint8Array]" ||
              !Number.isInteger(storedHash.primary) ||
              storedHash.primary < ScPasswordHash.SHA1 ||
              storedHash.primary > ScPasswordHash.UNSPECIFIED ||
              !Number.isInteger(storedHash.secondary) ||
              storedHash.secondary < ScPasswordHash.SHA1 ||
              storedHash.secondary > ScPasswordHash.UNSPECIFIED)) ||
          (ooxHash && !isOoxPasswordHash(ooxHash))
        )
          throw new Error("Calc worker sheet protection is invalid.");
        const protection = new ScTableProtection();
        protection.setProtected(enabled);
        for (const [option, value] of options.entries()) protection.setOption(option, value);
        if (ooxHash) protection.setOoxPasswordHash(ooxHash);
        protection.setStoredPasswordHash(storedHash);
        protection.setEnhancedProtection(
          (sheet.protection.enhanced ?? []).map(
            /** Reconstructs the original enhanced range list. @param entry - Realm-neutral record. @returns Native record. */
            (entry) => {
              if (
                !entry ||
                !Array.isArray(entry.ranges) ||
                typeof entry.title !== "string" ||
                typeof entry.securityDescriptor !== "string" ||
                !Number.isInteger(entry.passwordVerifier) ||
                entry.passwordVerifier < 0 ||
                entry.passwordVerifier > 0xffffffff ||
                !isOoxPasswordHash(entry.passwordHash)
              )
                throw new Error("Calc worker enhanced protection is invalid.");
              const ranges = new ScRangeList();
              for (const range of entry.ranges) ranges.push_back(decodePrintRange(range, document));
              return { ...entry, ranges };
            },
          ),
        );
        table.SetProtection(protection);
      }
      if (sheet.optimalMinRowHeight !== undefined)
        table.SetOptimalMinRowHeight(sheet.optimalMinRowHeight);
      for (const [col, first, last, style, numberFormat, direction] of sheet.patterns) {
        const pattern = style
          ? importer.GetAutoStyle(style)
          : document.getCellAttributeHelper().getDefaultCellAttribute();
        if (!pattern) throw new Error("Calc worker style is missing.");
        const styleKey = `${style}:${numberFormat ?? ""}:${direction ?? ""}`;
        let holder = transferredStyles.get(styleKey);
        if (!holder) {
          if (numberFormat === undefined && direction === undefined)
            holder = new CellAttributeHolder(pattern);
          else {
            const formatted = new ScPatternAttr(pattern);
            if (numberFormat !== undefined) {
              const format = formats[numberFormat];
              if (!format) throw new Error("Calc worker number format is missing.");
              const valueItem = new SfxUInt32Item(ATTR_VALUE_FORMAT, format.key);
              const languageItem = new SvxLanguageItem(format.language, ATTR_LANGUAGE_FORMAT);
              try {
                formatted.ItemSetPut(valueItem);
                formatted.ItemSetPut(languageItem);
              } finally {
                valueItem.Dispose();
                languageItem.Dispose();
              }
            }
            if (direction !== undefined) formatted.ItemSetPut(restoreWritingDirection(direction));
            holder = new CellAttributeHolder(formatted, true);
          }
          transferredStyles.set(styleKey, holder);
        }
        (col === -1
          ? table.GetDefaultColumnData()
          : table.CreateColumnIfNotExists(col)
        ).SetPatternArea(first, last, holder);
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
      for (const [rows, first, last, hidden, visible] of sheet.outline ?? []) {
        if (
          !(rows
            ? document.ValidRow(first) && document.ValidRow(last)
            : document.ValidCol(first) && document.ValidCol(last))
        )
          throw new Error("Calc worker outline range is invalid.");
        const outline = table.StartOutlineTable();
        const axis = rows ? outline.GetRowArray() : outline.GetColArray();
        const entry = axis.Insert(first, last, hidden);
        if (!entry) throw new Error("Calc worker outline group is invalid.");
        entry.visible = visible;
        yield;
      }
      if (sheet.rowBreaks) table.SetRowManualBreaks(new Set(sheet.rowBreaks));
      if (sheet.columnBreaks) table.SetColManualBreaks(new Set(sheet.columnBreaks));
      if (sheet.printRanges) {
        table.ClearPrintRanges();
        for (const range of sheet.printRanges)
          table.AddPrintRange(decodePrintRange(range, document));
      }
      if (sheet.repeatColumns)
        table.SetRepeatColRange(decodePrintRange(sheet.repeatColumns, document));
      if (sheet.repeatRows) table.SetRepeatRowRange(decodePrintRange(sheet.repeatRows, document));
      for (const note of sheet.notes ?? []) {
        decodeCalcCellNote(importer, tab, note);
        yield;
      }
      for (const record of sheet.cells) {
        if (record[2] === "matrix" || record[2] === "matrix-ref") {
          decodeMatrixCell(importer, tab, record);
          yield;
          continue;
        }
        const [col, row, kind, value, cache] = record;
        const pos = new ScAddress(col, row, tab);
        if (kind === "number") importer.docImport.setNumericCell(pos, value);
        else if (typeof value !== "string")
          importer.docImport.setEditCell(pos, createCellEditText(importer, value));
        else {
          const string = unicode(value);
          try {
            if (kind === "formula") {
              if (cache === undefined)
                importer.docImport.setFormulaCell(pos, string, FormulaGrammar.Grammar.GRAM_ODFF);
              else {
                if (
                  !Array.isArray(cache) ||
                  cache.length !== 2 ||
                  !(typeof cache[0] === "string" || Number.isFinite(cache[0])) ||
                  typeof cache[1] !== "boolean"
                )
                  throw new Error("Calc worker formula cache is invalid.");
                const formula = new ScFormulaCell(
                  document,
                  pos,
                  string,
                  FormulaGrammar.Grammar.GRAM_ODFF,
                );
                formula.SetNeedNumberFormat(cache[1]);
                if (typeof cache[0] === "number") formula.SetHybridDouble(cache[0]);
                else {
                  const value = unicode(cache[0]);
                  const shared = document.GetSharedStringPool().intern(value);
                  try {
                    formula.SetHybridString(shared);
                  } finally {
                    value.dispose();
                    shared.dispose();
                  }
                }
                formula.ResetDirty();
                importer.docImport.setFormulaCell(pos, formula);
              }
            } else if (kind === "edit") {
              document.SetTextCell(pos, string);
              importer.docImport.invalidateBlockPositionSet(pos.Tab());
            } else importer.docImport.setStringCell(pos, string);
          } finally {
            string.dispose();
          }
        }
        yield;
      }
      for (const [firstColumn, firstRow, lastColumn, lastRow] of sheet.merges ?? []) {
        importer.docImport.setMergedCells(tab, firstColumn, firstRow, lastColumn, lastRow);
        yield;
      }
    }
    if (record.databaseRanges !== undefined)
      decodeCalcDatabaseRanges(document, record.databaseRanges);
    importer.docImport.finalize();
    for (const [tab, sheet] of record.sheets.entries())
      if (sheet.conditionalFormats)
        importer.importConditionalFormats(sheet.conditionalFormats, tab);
    importer.FinalizeConditionalFormats();
    for (const [tab, sheet] of record.sheets.entries()) {
      const table = document.FetchTable(tab);
      if (table && sheet.conditionalIconSets) decodeCalcIconSets(table, sheet.conditionalIconSets);
    }
    document.SetAutoCalc(true);
    complete = true;
    return document;
  } finally {
    for (const holder of transferredStyles.values()) holder.Dispose();
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
