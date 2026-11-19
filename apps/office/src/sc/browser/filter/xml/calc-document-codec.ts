/** @fileoverview Bounded Calc worker transfer of supported native cells, sparse attributes and geometry; XML remains the durable format. */
import { GetPrintRanges } from "../../../source/core/data/table1";
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
import { ScXMLImport } from "../../../source/filter/xml/xmlimprt";
import {
  exportCellTextPropertyElement,
  exportCellPropertyElement,
  exportCellParagraphProperties,
  exportDefaultCellStyle,
} from "../../../source/filter/xml/xmlstyle";
import type { ScTable } from "../../../inc/table";
import { ViewOption } from "../../../inc/viewopti";
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
/** Compact native scalar alternative, with formula source rather than result text. */
type Cell =
  | readonly [col: number, row: number, kind: "number", value: number]
  | readonly [col: number, row: number, kind: "text" | "formula", value: string]
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
  readonly repeatColumns?: PrintRange;
  readonly repeatRows?: PrintRange;
  readonly name: string;
  readonly showGrid?: boolean;
  readonly optimalMinRowHeight?: number;
  readonly cells: Cell[];
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
/** Ephemeral transport, never persisted instead of XML. */
export interface CalcDocumentRecord {
  readonly version: 1;
  readonly styles: string;
  readonly sheets: Sheet[];
  readonly visibleTab?: number;
  readonly showGrid?: boolean;
  readonly showFormulas?: boolean;
  readonly showHeaders?: boolean;
  readonly showZeros?: boolean;
  readonly nullDate?: number;
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
    styles = new Map<string, string>(),
    patternNames = new Map<ScPatternAttr, string>();
  const numberFormats: NumberFormat[] = [];
  const textStyles = new CellTextStylePool(document, fonts);
  const numberFormatIndices = new Map<number, number>();
  /** Adds one native format definition to the transfer table. @param pattern - Source pattern. @returns Transfer index or General. */
  function numberFormatIndex(pattern: ScPatternAttr): number | undefined {
    if (!pattern.GetItemSet().GetItemIfSet(ATTR_VALUE_FORMAT, false)) return undefined;
    const formatter = document.GetFormatTable();
    const key = pattern.GetNumberFormat(formatter);
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
      const key = `${t}${c}${p ? `<style:paragraph-properties${p}/>` : ""}`;
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
    const sheet: Sheet = {
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
      ...(repeatColumns ? { repeatColumns: encodePrintRange(repeatColumns) } : {}),
      ...(repeatRows ? { repeatRows: encodePrintRange(repeatRows) } : {}),
      name: text(table.GetName()),
      ...(document.GetSheetShowGrid(tab) ? {} : { showGrid: false }),
      optimalMinRowHeight: table.GetOptimalMinRowHeight(),
      cells: [],
      patterns: [],
      merges,
      columns: [],
      rows: [],
    };
    sheets.push(sheet);
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
        const numberFormat = numberFormatIndex(pattern);
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
  const defaults = exportDefaultCellStyle(document, fonts);
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
  return {
    version: 1,
    sheets,
    ...(document.GetVisibleTab() ? { visibleTab: document.GetVisibleTab() } : {}),
    ...(view.GetOption(ViewOption.GRID) ? {} : { showGrid: false }),
    ...(view.GetOption(ViewOption.FORMULAS) ? { showFormulas: true } : {}),
    ...(view.GetOption(ViewOption.HEADER) ? {} : { showHeaders: false }),
    ...(view.GetOption(ViewOption.NULLVALS) ? {} : { showZeros: false }),
    nullDate: document.GetFormatTable().GetNullDate().GetDate(),
    ...(defaultWritingDirection === undefined ? {} : { defaultWritingDirection }),
    ...(numberFormats.length ? { numberFormats } : {}),
    ...(names.length ? { names } : {}),
    styles: `<office:document-styles${namespaces} office:version="1.3">${fonts.exportXML()}${defaults}<office:automatic-styles>${automatic}${textStyles.exportStyles()}</office:automatic-styles></office:document-styles>`,
  };
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
    if (record.nullDate !== undefined) {
      const packed = record.nullDate;
      if (typeof packed !== "number" || (packed | 0) !== packed)
        throw new Error("Calc worker null date is invalid.");
      const date = new Date(packed);
      if (!date.IsValidDate()) throw new Error("Calc worker null date is invalid.");
      const options = new ScDocOptions(document.GetDocOptions());
      options.SetDate(date.GetDay(), date.GetMonth(), date.GetYear());
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
        if (typeof sheet.showGrid === "boolean") document.SetSheetShowGrid(tab, sheet.showGrid);
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
      for (const [col, row, kind, value] of sheet.cells) {
        const pos = new ScAddress(col, row, tab);
        if (kind === "number") importer.docImport.setNumericCell(pos, value);
        else if (typeof value !== "string")
          importer.docImport.setEditCell(pos, createCellEditText(importer, value));
        else {
          const string = unicode(value);
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
      for (const [firstColumn, firstRow, lastColumn, lastRow] of sheet.merges ?? []) {
        importer.docImport.setMergedCells(tab, firstColumn, firstRow, lastColumn, lastRow);
        yield;
      }
    }
    importer.docImport.finalize();
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
