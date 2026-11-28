/** @fileoverview Serializes the Calc document model for browser worker transfer and restores its sheets, cells and workbook settings. */
import {
  isOdfFontBytes,
  type OdfFontResource,
} from "../../../../package/source/zippackage/odf-font-resources";
import { createBrowserRegexMatcher } from "../../../../i18npool/browser/regex-matcher";
import { decodeCalcChangeTrack, type CalcChangeTrackRecord } from "./calc-change-track-codec";
import { decodeCalcAreaLink, type CalcAreaLinkRecord } from "./calc-area-link-codec";
import { SetDatabaseRangeAutoFilterFlags } from "../../../source/filter/xml/xmldrani";
import { decodeSheetLink, type CalcSheetLinkRecord } from "./calc-sheet-link-codec";
import { ATTR_VALIDDATA } from "../../../inc/scitems";
import { decodeCalcValidations, type CalcValidationRecord } from "./calc-validation-codec";
import {
  decodeCalcDatabaseRanges,
  type CalcDatabaseRangesRecord,
} from "./calc-database-range-codec";
import {
  decodeCalcCellNote,
  decodeCalcPerson,
  type CalcCellNoteRecord,
  type CalcPersonRecord,
} from "./calc-note-codec";
import { ScFormulaCell } from "../../../source/core/data/formulacell";
import { decodeCalcIconSets, type CalcIconSetRecord } from "./calc-icon-set-codec";
import { decodeMatrixCell, type CalcMatrixCellRecord } from "./calc-matrix-cell-codec";
import { ScCalcConfig } from "../../../source/core/tool/calcconfig";
import { Color, ColorTransparency } from "../../../../tools/inc/color";
import {
  setSheetTabSelected,
  isSheetPaneLayout,
  setSheetPaneLayout,
  type SheetPaneLayout,
  setSheetCursor,
} from "../../../source/core/data/document.sheet-visibility";
import { runCooperatively, runSynchronously } from "../../../../framework/browser/io/cooperative";
import { ScDocument } from "../../../inc/document";
import {
  ScTableProtectionOption as ProtectionOption,
  ScDocProtectionOption,
  ScPasswordHash,
  type ScOoxPasswordHash,
  type ScEnhancedProtection,
  type ScStoredPasswordHash,
} from "../../../inc/tabprotection";
import { ScDocProtection, ScTableProtection } from "../../../source/core/data/tabprotection";
import { ScRangeList, type ScRangePairList } from "../../../inc/rangelst";
import { ScAddress, ScRange, ScRangePair } from "../../../inc/address";
import { ScScenarioFlags } from "../../../inc/global";
import { ScMF } from "../../../source/core/data/attrib";
import { decodeConsolidation, type CalcConsolidationRecord } from "./calc-consolidation-codec";
import { CellAttributeHolder, ScPatternAttr } from "../../../inc/patattr";
import { FormulaGrammar, type AddressConvention } from "../../../../formula/inc/grammar";
import { unicode } from "../../../../i18nlangtag/source/isolang/isolang.tables";
import { ScXMLImport } from "../../../source/filter/xml/xmlimprt";
import type { ScTable } from "../../../inc/table";
import { ScGridOptions, ViewOption } from "../../../inc/viewopti";
import { SvxLanguageItem } from "../../../../editeng/inc/langitem";
import { SfxUInt32Item } from "../../../../svl/source/items/intitem";
import { NUMBERFORMAT_ENTRY_NOT_FOUND } from "../../../../svl/inc/zforlist";
import { SvxFrameDirection as D } from "../../../../editeng/inc/frmdir";
import { SvxFrameDirectionItem } from "../../../../editeng/source/items/frmitems.direction";
import { ATTR_LANGUAGE_FORMAT, ATTR_VALUE_FORMAT, ATTR_WRITINGDIR } from "../../../inc/scitems";
import { InsertRangeNames, type RangeDataType } from "../../../source/core/tool/rangenam";
import { ScDocOptions } from "../../../source/core/tool/docoptio";
import { Date } from "../../../../tools/source/datetime/tdate";
import { type CellTextParagraph } from "../../../source/filter/xml/xmlexprt.celltext";
import { createCellEditText } from "../../../source/filter/xml/xmlcelli.edit";
import { FormulaDoubleToken, FormulaStringToken } from "../../../../formula/inc/token";
import { CreateDoubleError, FormulaError } from "../../../../formula/inc/errorcodes";
import { encodeSteps } from "./calc-document-encode";
/** Cloneable external cache cell with an explicit error discriminator for NaN payloads. */
export type ExternalCell =
  | readonly [col: number, row: number, kind: "double" | "error", value: number, format?: number]
  | readonly [col: number, row: number, kind: "string", value: string, format?: number];
/** External sources in file-ID order, with the real sheet names and sparse data. */
export type ExternalFile = readonly [
  name: string,
  sheets: readonly ExternalSheet[],
  relativeName?: string | undefined,
  filter?: readonly [name: string, options: string],
];
/** External sheet cache including the ODF complete-table marker. */
export type ExternalSheet = readonly [
  name: string,
  cells: readonly ExternalCell[],
  complete?: boolean,
];
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
  writingDirection?: D | undefined,
  validation?: number,
];
/** Compiled format source and locale, independent of the process-local format key. */
export type NumberFormat = readonly [locale: number, code: string];
/** Geometry spans preserve defaults and hidden/filter/manual flags without expanding the sheet domain. */
/** One native outline entry in parent-first order across the worker boundary. */
export type OutlineGroup = readonly [
  rows: boolean,
  first: number,
  last: number,
  hidden: boolean,
  visible: boolean,
];
/** Native addresses of both endpoints of an area. */
export type RangeRecord = readonly [number, number, number, number, number, number];

/** Reconstructs a native range from valid transfer coordinates. @param input - Transferred endpoints. @param document - Native limits. @returns Native range. */
function decodeRange(input: RangeRecord, document: ScDocument): ScRange {
  if (!Array.isArray(input) || input.length !== 6) throw new Error("Calc worker range is invalid.");
  const [firstCol, firstRow, firstTab, lastCol, lastRow, lastTab] = input;
  if (
    !input.every(Number.isInteger) ||
    !document.ValidCol(firstCol) ||
    !document.ValidCol(lastCol) ||
    !document.ValidRow(firstRow) ||
    !document.ValidRow(lastRow) ||
    !document.FetchTable(firstTab) ||
    !document.FetchTable(lastTab)
  )
    throw new Error("Calc worker range is invalid.");
  return new ScRange(firstCol, firstRow, firstTab, lastCol, lastRow, lastTab);
}

/** One document-owned column or row label and the data it describes. */
export type LabelRangeRecord = readonly [label: RangeRecord, data: RangeRecord];

/** Restores native pair values without rejoining them before formula compilation. @param document - Workbook with sheets already created. @param list - Column or row owner. @param records - Transferred pairs. @returns Nothing. */
function decodeLabelRanges(
  document: ScDocument,
  list: ScRangePairList,
  records: readonly LabelRangeRecord[],
): void {
  if (!Array.isArray(records)) throw new Error("Calc worker label ranges are invalid.");
  for (const record of records as readonly LabelRangeRecord[]) {
    if (!Array.isArray(record) || record.length !== 2)
      throw new Error("Calc worker label range is invalid.");
    list.Append(
      new ScRangePair(decodeRange(record[0], document), decodeRange(record[1], document)),
    );
  }
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

/** Browser record shared by workbook and sheet protection. */
export interface ProtectionRecord {
  readonly enabled: boolean;
  readonly options: boolean[];
  readonly ooxHash: ScOoxPasswordHash | undefined;
  readonly storedHash: ScStoredPasswordHash | undefined;
}

/** Validates and restores the native state before it is adopted. @param protection - Detached protection owner. @param record - Realm-neutral state. @param optionCount - Native option count. @param owner - Error label. @returns Nothing. */
function decodeProtection(
  protection: ScDocProtection | ScTableProtection,
  record: ProtectionRecord,
  optionCount: number,
  owner: string,
): void {
  if (!record) throw new Error(`Calc worker ${owner} protection is invalid.`);
  const { enabled, options, ooxHash, storedHash } = record;
  if (
    typeof enabled !== "boolean" ||
    !Array.isArray(options) ||
    options.length !== optionCount ||
    Array.from(options).some(
      /** Validates the option, including a missing slot. @param value - Transferred value. @returns Whether invalid. */
      (value) => typeof value !== "boolean",
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
    throw new Error(`Calc worker ${owner} protection is invalid.`);
  protection.setProtected(enabled);
  for (const [option, value] of options.entries()) protection.setOption(option, value);
  if (ooxHash) protection.setOoxPasswordHash(ooxHash);
  protection.setStoredPasswordHash(storedHash);
}
/** Native sparse sheet transfer record. */
export interface Sheet {
  readonly scenario?: {
    readonly active: boolean;
    readonly comment: string;
    readonly color: number;
    readonly flags: ScScenarioFlags;
    readonly ranges: readonly RangeRecord[];
  };
  readonly visible?: boolean;
  readonly layoutRTL?: boolean;
  readonly link?: CalcSheetLinkRecord;
  readonly tabColor?: number;
  readonly pageStyle?: string;
  readonly protection?: ProtectionRecord & {
    readonly enhanced?: readonly (Omit<ScEnhancedProtection, "ranges"> & {
      readonly ranges: readonly RangeRecord[];
    })[];
  };
  readonly outline?: OutlineGroup[];
  readonly rowBreaks?: number[];
  readonly columnBreaks?: number[];
  readonly printRanges?: RangeRecord[];
  readonly conditionalFormats?: string;
  readonly conditionalIconSets?: readonly CalcIconSetRecord[];
  readonly repeatColumns?: RangeRecord;
  readonly repeatRows?: RangeRecord;
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
  readonly fontEmbedding?: readonly [
    enabled: boolean,
    usedOnly: boolean,
    latin: boolean,
    asian: boolean,
    complex: boolean,
  ];
  readonly embeddedFonts?: readonly OdfFontResource[];
  readonly consolidation?: CalcConsolidationRecord;
  readonly documentMetaXml?: string;
  readonly docProtection?: ProtectionRecord;
  readonly changeTrack?: CalcChangeTrackRecord;
  readonly version: 1;
  readonly storageGrammar?: typeof FormulaGrammar.Grammar.GRAM_PODF;
  readonly styles: string;
  readonly sheets: Sheet[];
  readonly labelRanges?: readonly [
    columns: readonly LabelRangeRecord[],
    rows: readonly LabelRangeRecord[],
  ];
  readonly externalFiles?: readonly ExternalFile[];
  readonly areaLinks?: readonly CalcAreaLinkRecord[];
  readonly persons?: readonly CalcPersonRecord[];
  readonly databaseRanges?: CalcDatabaseRangesRecord;
  readonly validations?: readonly CalcValidationRecord[];
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
  readonly gridColor?: number;
  readonly autoCalculate?: boolean;
  readonly stringRefSyntax?: readonly [convention: AddressConvention, explicit: boolean];
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
  const document = new ScDocument(undefined, createBrowserRegexMatcher),
    importer = new ScXMLImport(document);
  const transferredStyles = new Map<string, CellAttributeHolder>();
  let complete = false;
  document.SetAutoCalc(false);
  try {
    if (record.fontEmbedding !== undefined) {
      if (
        !Array.isArray(record.fontEmbedding) ||
        record.fontEmbedding.length !== 5 ||
        !record.fontEmbedding.every((value) => typeof value === "boolean")
      )
        throw new Error("Calc worker font embedding settings are invalid.");
      const [enabled, usedOnly, latin, asian, complex] = record.fontEmbedding;
      document.SetEmbedFonts(enabled);
      document.SetEmbedUsedFontsOnly(usedOnly);
      document.SetEmbedFontScriptLatin(latin);
      document.SetEmbedFontScriptAsian(asian);
      document.SetEmbedFontScriptComplex(complex);
    }
    if (record.embeddedFonts !== undefined && !Array.isArray(record.embeddedFonts))
      throw new Error("Calc worker embedded font catalogue is invalid.");
    for (const font of record.embeddedFonts ?? []) {
      if (
        !font ||
        typeof font.path !== "string" ||
        typeof font.familyName !== "string" ||
        typeof font.faceName !== "string" ||
        typeof font.format !== "string" ||
        (font.bytes !== undefined && !isOdfFontBytes(font.bytes))
      )
        throw new Error("Calc worker embedded font is invalid.");
      document.RegisterEmbeddedFont(font);
    }
    if (record.autoCalculate !== undefined && typeof record.autoCalculate !== "boolean")
      throw new Error("Calc worker AutoCalculate state is invalid.");
    if (record.stringRefSyntax !== undefined) {
      const [convention, explicit] = record.stringRefSyntax;
      if (
        !Object.values(FormulaGrammar.AddressConvention).includes(convention) ||
        typeof explicit !== "boolean"
      )
        throw new Error("Calc worker string reference syntax is invalid.");
      const config = new ScCalcConfig(document.GetCalcConfig());
      try {
        config.meStringRefAddressSyntax = convention;
        config.mbHasStringRefSyntax = explicit;
        document.SetCalcConfig(config);
      } finally {
        config.dispose();
      }
    }
    if (record.documentMetaXml !== undefined)
      document.documentProperties.SetTransferXml(record.documentMetaXml);
    if (record.storageGrammar !== undefined) {
      if (record.storageGrammar !== FormulaGrammar.Grammar.GRAM_PODF)
        throw new Error("Calc worker storage grammar is invalid.");
      document.SetStorageGrammar(record.storageGrammar);
    }
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
        if (sheet.link !== undefined) {
          if (!document.RenameTab(tab, name, true))
            throw new Error("Calc worker linked sheet is invalid.");
          decodeSheetLink(document.FetchTable(tab) as ScTable, sheet.link);
        }
        if (sheet.visible === false) document.SetVisible(tab, false);
        if (sheet.layoutRTL !== undefined) {
          if (typeof sheet.layoutRTL !== "boolean") throw new Error("Invalid Calc sheet layout.");
          document.SetLayoutRTL(tab, sheet.layoutRTL);
        }
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
    if (record.gridColor !== undefined) {
      if (!Number.isInteger(record.gridColor) || record.gridColor >>> 0 !== record.gridColor)
        throw new Error("Calc worker grid color is invalid.");
      view.SetGridColor(new Color(ColorTransparency, record.gridColor, "ColorTransparencyTag"));
    }
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
    const databaseRanges =
      record.databaseRanges === undefined
        ? []
        : decodeCalcDatabaseRanges(document, record.databaseRanges);
    if (record.labelRanges !== undefined) {
      if (!Array.isArray(record.labelRanges) || record.labelRanges.length !== 2)
        throw new Error("Calc worker label ranges are invalid.");
      decodeLabelRanges(document, document.GetColNameRanges(), record.labelRanges[0]);
      decodeLabelRanges(document, document.GetRowNameRanges(), record.labelRanges[1]);
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
    if (record.validations !== undefined) decodeCalcValidations(document, record.validations);
    for (const [tab, sheet] of record.sheets.entries()) {
      const table = document.FetchTable(tab) as ScTable;
      if (sheet.protection) {
        const protection = new ScTableProtection();
        decodeProtection(protection, sheet.protection, ProtectionOption.NONE, "sheet");
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
              for (const range of entry.ranges) ranges.push_back(decodeRange(range, document));
              return { ...entry, ranges };
            },
          ),
        );
        table.SetProtection(protection);
      }
      if (sheet.optimalMinRowHeight !== undefined)
        table.SetOptimalMinRowHeight(sheet.optimalMinRowHeight);
      for (const [col, first, last, style, numberFormat, direction, validation] of sheet.patterns) {
        const pattern = style
          ? importer.GetAutoStyle(style)
          : document.getCellAttributeHelper().getDefaultCellAttribute();
        if (!pattern) throw new Error("Calc worker style is missing.");
        const styleKey = `${style}:${numberFormat ?? ""}:${direction ?? ""}:${validation ?? ""}`;
        let holder = transferredStyles.get(styleKey);
        if (!holder) {
          if (numberFormat === undefined && direction === undefined && validation === undefined)
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
            if (validation !== undefined) {
              if (!document.GetValidationEntry(validation))
                throw new Error("Calc worker cell references a missing validation rule.");
              const item = new SfxUInt32Item(ATTR_VALIDDATA, validation);
              try {
                formatted.ItemSetPut(item);
              } finally {
                item.Dispose();
              }
            }
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
      if (sheet.scenario !== undefined) {
        const { active, comment, color, flags, ranges } = sheet.scenario;
        if (
          typeof active !== "boolean" ||
          typeof comment !== "string" ||
          !Number.isInteger(color) ||
          color < 0 ||
          color > 0xffffffff ||
          !Number.isInteger(flags) ||
          flags < 0 ||
          flags > 127 ||
          !Array.isArray(ranges)
        )
          throw new Error("Calc worker scenario is invalid.");
        table.SetScenario(true);
        table.SetScenarioData(comment, new Color(color), flags);
        table.SetActiveScenario(active);
        for (const range of ranges) {
          const { aStart, aEnd } = decodeRange(range, document);
          document.ApplyFlagsTab(
            aStart.Col(),
            aStart.Row(),
            aEnd.Col(),
            aEnd.Row(),
            tab,
            ScMF.Scenario,
          );
        }
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
        for (const range of sheet.printRanges) table.AddPrintRange(decodeRange(range, document));
      }
      if (sheet.repeatColumns) table.SetRepeatColRange(decodeRange(sheet.repeatColumns, document));
      if (sheet.repeatRows) table.SetRepeatRowRange(decodeRange(sheet.repeatRows, document));
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
    for (const range of databaseRanges) SetDatabaseRangeAutoFilterFlags(document, range);
    if (record.consolidation !== undefined)
      document.SetConsolidateDlgData(decodeConsolidation(document, record.consolidation));
    if (record.areaLinks !== undefined && !Array.isArray(record.areaLinks))
      throw new Error("Calc Worker area-links collection is invalid.");
    for (const link of record.areaLinks ?? []) {
      decodeCalcAreaLink(document, link);
      yield;
    }
    importer.docImport.finalize();
    for (const [tab, sheet] of record.sheets.entries())
      if (sheet.conditionalFormats)
        importer.importConditionalFormats(sheet.conditionalFormats, tab);
    importer.FinalizeConditionalFormats();
    for (const [tab, sheet] of record.sheets.entries()) {
      const table = document.FetchTable(tab);
      if (table && sheet.conditionalIconSets) decodeCalcIconSets(table, sheet.conditionalIconSets);
    }
    if (record.docProtection !== undefined) {
      const protection = new ScDocProtection();
      decodeProtection(protection, record.docProtection, ScDocProtectionOption.NONE, "workbook");
      document.SetDocProtection(protection);
    }
    if (record.changeTrack !== undefined) decodeCalcChangeTrack(importer, record.changeTrack);
    document.SetAutoCalc(record.autoCalculate ?? true);
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
