/** @fileoverview Native document modes, consumed pooled resources and scalar/local-reference storage, attributes and formula tracking. Full construction, formatter and shell services remain unported. */
import { ScDetectiveRefIter } from "./formulaiter";
import type { RegexMatcherFactory } from "../../../../unotools/source/i18n/textsearch";
import {
  OdfFontResources,
  type OdfFontResource,
} from "../../../../package/source/zippackage/odf-font-resources";
import type { ScConsolidateParam } from "./global2";
import { DocumentLinkManager } from "../../ui/docshell/documentlinkmgr";
import type { LinkManager } from "../../../../sfx2/source/appl/linkmgr2";
import { SfxDocumentProperties } from "../../../../sfx2/source/doc/sfxbasemodel";
import type { ScValidationData } from "./validat";
import type { ScDocProtection } from "./tabprotection";
import type { ScChangeTrack } from "../tool/chgtrack";
import { ScValidationDataList } from "./validat.list";
import { type ScPersonData } from "../../../inc/postit";
import { ScRangePairList } from "../../../inc/rangelst";
import { ScDBCollection, type ScDBData } from "../../../inc/dbdata";
import * as documentGeometry from "./document.geometry";
import { ScCalcConfig } from "../../../inc/calcconfig";
import { ScInterpreter } from "../inc/interpre";
import { HardRecalcState, ScDocumentMode } from "./document.modes";
import { ScSetStringParam } from "../../../inc/stringutil";
import { SetString as setDocumentString } from "./document.cell-input";
import * as documentNames from "./document.sheet-names";
import * as documentVisibility from "./document.sheet-visibility";
import type { EditTextObject } from "../../../../editeng/inc/editobj";

import { FormulaError } from "../../../../formula/inc/errorcodes";
import { FormulaGrammar, type Grammar } from "../../../../formula/inc/grammar";
import { MsLangId } from "../../../../i18nlangtag/inc/mslangid";
import type { XBreakIterator } from "../../../../offapi/com/sun/star/i18n/XBreakIterator";
import { OUString, type OUStringConstReference } from "../../../../sal/inc/rtl/ustring";
import { SfxHint, SfxHintId } from "../../../../svl/inc/hint";
import { SvtScriptType } from "../../../../svl/inc/languageoptions";
import type { SharedStringPool } from "../../../../svl/inc/sharedstringpool";
import type { SvtBroadcaster } from "../../../../svl/source/notify/broadcast";

import type { SfxBroadcaster } from "../../../../svl/source/notify/SfxBroadcaster";

import { MAXCOL, MAXROW, ScAddress, ScRange, ValidCol, ValidRow } from "../../../inc/address";

import type { ScChartListenerCollection } from "../../../inc/chartlis";
import { ScClipParam } from "../../../inc/clipparam";
import type { ScColumn } from "../../../inc/column";
import { ScDocOptions, type ScDocOptionsConstReference } from "../../../inc/docoptio";
import type { Theme } from "../../../../docmodel/inc/theme/Theme";
import type { ScFormulaCell } from "../../../inc/formulacell";

import { ScInterpreterContext } from "../../../inc/interpretercontext";
import type { ScMarkData } from "../../../inc/markdata";
import {
  CellAttributeHelper,
  CellAttributeHolder,
  ScPatternAttr,
  type ScPatternStyleReference,
} from "../../../inc/patattr";

import { ScSheetLimits } from "../../../inc/sheetlimits";
import type { ScStyleSheetPool } from "../../../inc/stlpool";
import type { ScTable } from "../../../inc/table";
import { ScViewOptions } from "../../../inc/viewopti";
import { ScExternalRefManager } from "../../ui/docshell/externalrefmgr";
import type { ScBroadcastAreaSlotMachine } from "../inc/bcaslot";
import type { SfxObjectShell } from "../../../../sfx2/source/doc/objsh";
import type { DocumentEditEngine, ScFieldEditEngine } from "../tool/editutil";
import type { ScPoolHelper } from "../inc/poolhelp";
import type { ScScriptTypeData } from "../inc/scrdata";
import type { ScDocumentPool } from "./docpool";
import * as documen2 from "./documen2";
import * as documentFrame from "./document.frame";
import * as documen8 from "./documen8";
import * as documen3 from "./documen3";
import * as documen4 from "./documen4";
import { GetBreakIterator, GetStringScriptType } from "./documen6";
import * as documen7 from "./documen7";
import * as documen9 from "./documen9";
import * as document10 from "./document10";
import { ScPrintRangeSaver } from "../tool/prnsave";
import { ScRangeName } from "../tool/rangenam";
import * as documentNotes from "./document.notes";
/** Explicit initial document subset;all supported cells live in its actual sheet/column chain. */
export class ScDocument {
  private readonly embeddedFonts = new OdfFontResources();
  private mbEmbedFonts = false;
  private mbEmbedUsedFontsOnly = false;
  private mbEmbedFontScriptLatin = true;
  private mbEmbedFontScriptAsian = true;
  private mbEmbedFontScriptComplex = true;

  /** Reads original embedding setting. @returns Whether enabled. */
  IsEmbedFonts(): boolean {
    return this.mbEmbedFonts;
  }
  /** Assigns original embedding setting. @param value - Whether enabled. @returns Nothing. */
  SetEmbedFonts(value: boolean): void {
    this.mbEmbedFonts = value;
  }
  /** Reads original used-font setting. @returns Whether used fonts are selected. */
  IsEmbedUsedFontsOnly(): boolean {
    return this.mbEmbedUsedFontsOnly;
  }
  /** Assigns original used-font setting. @param value - Whether used fonts are selected. @returns Nothing. */
  SetEmbedUsedFontsOnly(value: boolean): void {
    this.mbEmbedUsedFontsOnly = value;
  }
  /** Reads the Latin script selection. @returns Script flag. */
  IsEmbedFontScriptLatin(): boolean {
    return this.mbEmbedFontScriptLatin;
  }
  /** Assigns the Latin script selection. @param value - Script flag. @returns Nothing. */
  SetEmbedFontScriptLatin(value: boolean): void {
    this.mbEmbedFontScriptLatin = value;
  }
  /** Reads the Asian script selection. @returns Script flag. */
  IsEmbedFontScriptAsian(): boolean {
    return this.mbEmbedFontScriptAsian;
  }
  /** Assigns the Asian script selection. @param value - Script flag. @returns Nothing. */
  SetEmbedFontScriptAsian(value: boolean): void {
    this.mbEmbedFontScriptAsian = value;
  }
  /** Reads the complex script selection. @returns Script flag. */
  IsEmbedFontScriptComplex(): boolean {
    return this.mbEmbedFontScriptComplex;
  }
  /** Assigns the complex script selection. @param value - Script flag. @returns Nothing. */
  SetEmbedFontScriptComplex(value: boolean): void {
    this.mbEmbedFontScriptComplex = value;
  }
  /** Claims an existing package font declaration. @param font - Original declaration. @returns Nothing. */
  RegisterEmbeddedFont(font: OdfFontResource): void {
    this.embeddedFonts.Register(font);
  }
  /** Attaches validated package font bytes. @param path - Original package entry. @param bytes - Binary font. @param canLoad - Viewing permission. @returns Nothing. */
  SetEmbeddedFontBytes(path: string, bytes: Uint8Array, canLoad: boolean): void {
    this.embeddedFonts.SetBytes(path, bytes, canLoad);
  }
  /** Copies the stored package font records. @returns Independent font catalogue. */
  GetEmbeddedFonts(): readonly OdfFontResource[] {
    return this.embeddedFonts.GetFonts();
  }

  readonly documentProperties = new SfxDocumentProperties();
  GetCondResult = documen4.GetCondResult;
  GetCondColor = documen4.GetCondColor;
  IsTabProtected = documen3.IsTabProtected;
  GetUnprotectedCells = documen3.GetUnprotectedCells;
  GetTabBgColor = documen3.GetTabBgColor;
  SetTabBgColor = documen3.SetTabBgColor;
  SetScenario = documen3.SetScenario;
  IsScenario = documen3.IsScenario;
  SetScenarioData = documen3.SetScenarioData;
  SetActiveScenario = documen3.SetActiveScenario;
  IsDefaultTabBgColor = documen3.IsDefaultTabBgColor;
  GetTabProtection = documen3.GetTabProtection;
  SetTabProtection = documen3.SetTabProtection;
  private pDocProtection: ScDocProtection | undefined;
  private pChangeTrack: ScChangeTrack | undefined;

  /** Borrows the native change track for this workbook. @returns Current change track. */
  GetChangeTrack(): ScChangeTrack | undefined {
    return this.pChangeTrack;
  }

  /** Adopts a track owned by this workbook. @param track - Candidate owner. @returns Nothing. */
  SetChangeTrack(track: ScChangeTrack): void {
    if (track === this.pChangeTrack || track.GetDocument() !== this) return;
    this.pChangeTrack?.Dispose();
    this.pChangeTrack = track;
  }

  /** Borrows the native workbook protection owner. @returns Workbook protection if present. */
  GetDocProtection(): ScDocProtection | undefined {
    return this.pDocProtection;
  }

  /** Copies or clears the native workbook protection owner. @param protection - Source protection. @returns Nothing. */
  SetDocProtection(protection?: ScDocProtection): void {
    this.pDocProtection = protection?.Clone();
  }

  /** Tests the protection flag rather than the presence of an owner. @returns Whether protected. */
  IsDocProtected(): boolean {
    return this.pDocProtection?.isProtected() ?? false;
  }
  DoMergeContents = documen3.DoMergeContents;
  DoEmptyBlock = documen3.DoEmptyBlock;
  DoMerge = documen3.DoMerge;
  RemoveMerge = documen3.RemoveMerge;
  /** Captures original print settings for all existing sheets. @returns Native print range saver. */
  CreatePrintRangeSaver(): ScPrintRangeSaver {
    const saver = new ScPrintRangeSaver(this.GetTableCount());
    for (let tab = 0; tab < saver.GetTabCount(); tab++) {
      this.FetchTable(tab)?.FillPrintSaver(saver.GetTabData(tab));
    }
    return saver;
  }
  /** Restores original settings on matching sheet indexes. @param saver - Workbook snapshot. @returns Nothing. */
  RestorePrintRanges(saver: ScPrintRangeSaver): void {
    const count = Math.min(saver.GetTabCount(), this.GetTableCount());
    for (let tab = 0; tab < count; tab++) {
      this.FetchTable(tab)?.RestorePrintRanges(saver.GetTabData(tab));
    }
  }
  private readonly xColNameRanges = new ScRangePairList();
  private readonly xRowNameRanges = new ScRangePairList();
  /** Borrows the native column label pairs. @returns Document list. */
  GetColNameRanges(): ScRangePairList {
    return this.xColNameRanges;
  }
  /** Borrows the native row label pairs. @returns Document list. */
  GetRowNameRanges(): ScRangePairList {
    return this.xRowNameRanges;
  }
  private readonly pRangeName = new ScRangeName();
  /** Looks up the owner of names in this scope. @param tab - Sheet scope or -1. @returns Native names. */
  GetRangeName(tab = -1) {
    return tab === -1 ? this.pRangeName : this.FetchTable(tab)?.GetRangeName();
  }
  private readonly pDBCollection = new ScDBCollection(this);
  private pConsolidateDlgData: ScConsolidateParam | undefined;

  /** Borrows the document's saved consolidation parameters. @returns Owned source description. */
  GetConsolidateDlgData(): ScConsolidateParam | undefined {
    return this.pConsolidateDlgData;
  }

  /** Takes ownership of the native saved consolidation parameters. @param data - Imported parameters. @returns Nothing. */
  SetConsolidateDlgData(data: ScConsolidateParam | undefined): void {
    this.pConsolidateDlgData = data;
  }
  /** Borrows the native global database range collection. @returns Database ranges. */
  GetDBCollection(): ScDBCollection {
    return this.pDBCollection;
  }
  /** Borrows the anonymous range owned by a sheet. @param tab - Sheet index. @returns Range or null. */
  GetAnonymousDBData(tab: number): ScDBData | null {
    return this.FetchTable(tab)?.GetAnonymousDBData() ?? null;
  }
  /** Transfers the anonymous range to its native sheet owner. @param tab - Sheet index. @param data - Database range. @returns Nothing. */
  SetAnonymousDBData(tab: number, data: ScDBData): void {
    this.FetchTable(tab)?.SetAnonymousDBData(data);
  }
  /** Original exact block lookup with local scope precedence. */
  GetRangeAtBlock = documen3.GetRangeAtBlock;
  declare private pUnoBroadcaster: SfxBroadcaster | null;
  AddUnoObject = documen3.AddUnoObject;
  RemoveUnoObject = documen3.RemoveUnoObject;
  private mbStreamValidLocked = false;
  /** Original stream-validity lock query. @returns Lock state. */
  IsStreamValidLocked(): boolean {
    return this.mbStreamValidLocked;
  }
  /** Original document.cxx lock assignment. @param lock - Lock state. @returns Nothing. */
  LockStreamValid(lock: boolean): void {
    this.mbStreamValidLocked = lock;
  }
  InitUndo = documen7.InitUndo;
  InitUndoSelected = documen7.InitUndoSelected;
  RemoveCondFormatData = documen7.RemoveCondFormatData;
  AddCondFormat = documen4.AddCondFormat;
  AddCondFormatData = documen7.AddCondFormatData;
  AddUndoTab = documen7.AddUndoTab;
  CopyBlockFromClip = documen7.CopyBlockFromClip;
  CopyNonFilteredFromClip = documen7.CopyNonFilteredFromClip;
  /** Original source-row query and missing-table sentinel. @param first - First row. @param last - Last row. @param tab - Sheet. @returns Row or signed SCROW maximum. */
  FirstNonFilteredRow(first: number, last: number, tab: number): number {
    return this.FetchTable(tab)?.getFilterData().firstNonFilteredRow(first, last) ?? 2147483647;
  }
  UpdateReference = documen3.UpdateReference;
  private bDelayedDeletingBroadcasters = false;
  EnableDelayDeletingBroadcasters = document10.EnableDelayDeletingBroadcasters;
  /** Original broadcaster delay query. @returns Delayed. */
  IsDelayedDeletingBroadcasters(): boolean {
    return this.bDelayedDeletingBroadcasters;
  }
  /** Original range listener completion. @param range - Copied range. @returns Nothing. */
  StartAllListeners(range?: ScRange): void {
    if (range) document10.StartAllListeners.call(this, range);
    else documen7.StartAllListeners.call(this);
  }
  private pDelayedFormulaGrouping: ScRange | null = null;
  private readonly pDelayedStartListeningFormulaCells = new Map<ScColumn, [number, number]>();
  EnableDelayStartListeningFormulaCells = document10.EnableDelayStartListeningFormulaCells;
  /** Original per-column delay query. @param column - Actual column. @returns Enabled. */
  IsEnabledDelayStartListeningFormulaCells(column: ScColumn): boolean {
    return this.pDelayedStartListeningFormulaCells.has(column);
  }
  CanDelayStartListeningFormulaCells = document10.CanDelayStartListeningFormulaCells;
  SetDirtyFromClip = documen7.SetDirtyFromClip;
  /** Original rectangular broadcast with its native individual-broadcaster default. @param range - Changed area. @param id - Hint ID. @param singles - Individual delivery. @returns Nothing. */
  BroadcastCells(range: ScRange, id: SfxHintId, singles = true): void {
    documen7.BroadcastCells.call(this, range, id, singles);
  }
  DeleteBeforeCopyFromClip = document10.DeleteBeforeCopyFromClip;
  EndListeningFormulaCells = documen7.EndListeningFormulaCells;
  /** Original delay owner presence. @returns Delayed. */
  IsDelayedFormulaGrouping(): boolean {
    return this.pDelayedFormulaGrouping !== null;
  }
  RegroupFormulaCells = document10.RegroupFormulaCells;
  DelayFormulaGrouping = document10.DelayFormulaGrouping;
  AddDelayedFormulaGroupingCell = document10.AddDelayedFormulaGroupingCell;
  private bDetectiveDirty = false;
  /** Original native detective-listening change flag. @returns Dirty. */
  IsDetectiveDirty(): boolean {
    return this.bDetectiveDirty;
  }
  /** Original flag assignment. @param dirty - Dirty flag. @returns Nothing. */
  SetDetectiveDirty(dirty: boolean): void {
    this.bDetectiveDirty = dirty;
  }
  InitColumnBlockPosition = documen7.InitColumnBlockPosition;
  DeleteBroadcasters = documen7.DeleteBroadcasters;
  static readonly HardRecalcState = HardRecalcState;
  StartListeningFromClip = document10.StartListeningFromClip;
  CopyFromClip = document10.CopyFromClip;
  private pFormatExchangeList: Map<number, number> | null = null;
  /** Original borrowed formatter exchange-table pointer. @returns Actual table or null. */
  GetFormatExchangeList(): Map<number, number> | null {
    return this.pFormatExchangeList;
  }
  SharePooledResources = document10.SharePooledResources;
  Clear = documen9.Clear;
  ResetClip = documen2.ResetClip;
  InitClipPtrs = documen2.InitClipPtrs;
  SetClipArea = document10.SetClipArea;
  UndoToDocument = document10.UndoToDocument;
  GetClipArea = documen7.GetClipArea;
  HasClipFilteredRows = document10.HasClipFilteredRows;
  GetClipStart = document10.GetClipStart;
  ExtendMerge = document10.ExtendMerge;
  SkipOverlapped = documen3.SkipOverlapped;
  ExtendOverlapped = document10.ExtendOverlapped;
  ExtendMergeRange = document10.ExtendMergeRange;
  HasMultipleDataCells = document10.HasMultipleDataCells;
  ApplySelectionStyle = documen3.ApplySelectionStyle;
  GetSelectionStyle = documen3.GetSelectionStyle;
  ApplyPatternIfNumberformatIncompatible = document10.ApplyPatternIfNumberformatIncompatible;
  ApplyFlagsTab = document10.ApplyFlagsTab;
  RemoveFlagsTab = document10.RemoveFlagsTab;
  RefreshAutoFilter = document10.RefreshAutoFilter;
  ExtendMergeSel = document10.ExtendMergeSel;
  private mpClipParam: ScClipParam | undefined;
  /** Original lazily owned clipboard parameters,also available on normal documents. @returns Actual document-owned clipboard parameters. */
  GetClipParam(): ScClipParam {
    return (this.mpClipParam ??= new ScClipParam());
  }
  /** Original copied clipboard parameters replace the previous owner. @param parameter - Source parameters. @returns Nothing. */
  SetClipParam(parameter: ScClipParam): void {
    this.mpClipParam = new ScClipParam(parameter);
  }
  /** Original filtered-row count through actual per-sheet segment storage. @param first - First row. @param last - Last row. @param tab - Sheet. @returns Nonfiltered count or zero for an absent sheet. */
  CountNonFilteredRows(first: number, last: number, tab: number): number {
    return this.FetchTable(tab)?.getFilterData().countNonFilteredRows(first, last) ?? 0;
  }
  private pValidationList: ScValidationDataList | undefined;

  /** Borrows the actual document-owned validation list. @returns Native list, if allocated. */
  GetValidationList(): ScValidationDataList | undefined {
    return this.pValidationList;
  }

  /** Finds the rule selected by a native cell pattern. @param index - Validation identity. @returns Borrowed rule, if present. */
  GetValidationEntry(index: number): ScValidationData | undefined {
    return this.pValidationList?.GetData(index);
  }

  /** Reuses equal rules and otherwise clones into the original monotonic key space. @param rule - Candidate validation rule. @returns Native key or zero for the default. */
  AddValidationEntry(rule: ScValidationData): number {
    if (rule.IsEmpty()) return 0;
    const list = (this.pValidationList ??= new ScValidationDataList());
    let max = 0;
    for (const entry of list) {
      if (entry.EqualEntries(rule)) return entry.GetKey();
      max = Math.max(max, entry.GetKey());
    }
    const copy = rule.Clone(this);
    copy.SetKey(max + 1);
    list.InsertNew(copy);
    return copy.GetKey();
  }

  private eStorageGrammar: Grammar = FormulaGrammar.Grammar.GRAM_ODFF;
  /** Returns the document's ODF formula storage grammar. @returns Native storage grammar. */
  GetStorageGrammar(): Grammar {
    return this.eStorageGrammar;
  }
  /** Sets the original modern or legacy ODF storage grammar without changing the UI grammar. @param grammar - ODF storage grammar. @returns Nothing. */
  SetStorageGrammar(grammar: Grammar): void {
    this.eStorageGrammar = grammar;
  }
  private eGrammar: Grammar = FormulaGrammar.Grammar.GRAM_NATIVE;
  /** Original current formula convention,initialized GRAM_NATIVE. @returns Grammar. */
  GetGrammar(): Grammar {
    return this.eGrammar;
  }
  IsLinked = documen3.IsLinked;
  GetLinkMode = documen3.GetLinkMode;
  GetLinkDoc = documen3.GetLinkDoc;
  GetLinkFlt = documen3.GetLinkFlt;
  GetLinkOpt = documen3.GetLinkOpt;
  GetLinkTab = documen3.GetLinkTab;
  GetLinkRefreshDelay = documen3.GetLinkRefreshDelay;
  SetLink = documen3.SetLink;

  GetAddressConvention = documen3.GetAddressConvention;
  /** Original documen3 assignment. @param grammar - Convention. @returns Nothing. */
  SetGrammar(grammar: Grammar): void {
    this.eGrammar = grammar;
  }
  private bLinkFormulaNeedingCheck = false;
  /** Original link-formula check flag. @returns Native flag. */
  HasLinkFormulaNeedingCheck(): boolean {
    return this.bLinkFormulaNeedingCheck;
  }
  /** Original link-formula flag assignment. @param value - Native flag. @returns Nothing. */
  SetLinkFormulaNeedingCheck(value: boolean): void {
    this.bLinkFormulaNeedingCheck = value;
  }
  CheckLinkFormulaNeedingCheck = documen8.CheckLinkFormulaNeedingCheck;
  IsBlockEmpty = document10.IsBlockEmpty;
  HasAttrib = documen7.HasAttrib;
  private readonly pDocOptions = new ScDocOptions();
  /** The represented document theme for the format filters. */ theme?: Theme;
  /** Original borrowed document options,including lazy search classification. @returns Actual options. */ GetDocOptions(): ScDocOptionsConstReference {
    return this.pDocOptions;
  }
  /** Assigns original options by value. @param options - Source options. @returns Nothing. */
  SetDocOptions(options: ScDocOptionsConstReference): void {
    this.pDocOptions.assign(options);
    this.mxPoolHelper?.SetFormTableOpt(options);
  }
  private readonly pViewOptions = new ScViewOptions();
  /** Original documen3 borrowed view options. @returns Actual document-owned options. */ GetViewOptions(): ScViewOptions {
    return this.pViewOptions;
  }
  /** Original value assignment preserves the borrowed owner identity. @param options - Source options. @returns Nothing. */
  SetViewOptions(options: ScViewOptions): void {
    this.pViewOptions.copy_assign(options);
  }
  GetDataArea = documen7.GetDataArea;
  ShrinkToUsedDataArea = documen7.ShrinkToUsedDataArea;
  declare private pScriptTypeData: ScScriptTypeData | undefined;
  /** Original lazily owned script service. The actual process-context factory is an explicit borrowed host port;the kernel depends only on XBreakIterator. @param args - Existing real service factory or unavailable host port. @returns Stable borrowed service or empty reference. */
  GetBreakIterator(...args: Parameters<typeof GetBreakIterator>): XBreakIterator | null {
    return GetBreakIterator.apply(this, args);
  }
  /** Original document-bound string classifier delegates to its native implementation file. @param args - Actual string and existing borrowed script-service factory. @returns Native script flags. */
  GetStringScriptType(...args: Parameters<typeof GetStringScriptType>): SvtScriptType {
    return GetStringScriptType.apply(this, args);
  }
  GetScriptType = documen7.GetScriptType;
  /** Original address setter delegates through the actual sheet/column metadata owners. @param position - Actual coordinate. @param type - Native flags. @returns Nothing. */
  SetScriptType(position: ScAddress, type: SvtScriptType): void {
    this.FetchTable(position.Tab())?.SetScriptType(position.Col(), position.Row(), type);
  }
  /** Sheet direction. @param tab - Sheet. @returns RTL. */ IsLayoutRTL(tab: number): boolean {
    return this.FetchTable(tab)?.IsLayoutRTL() ?? false;
  }
  /** Finds the sheet's original named page style. @param tab - Native sheet. @returns Name or empty. */
  GetPageStyle(tab: number): string {
    return this.FetchTable(tab)?.GetPageStyle() ?? "";
  }
  /** Assigns the original page style. @param tab - Native sheet. @param name - Known page style. @returns Nothing. */
  SetPageStyle(tab: number, name: string): void {
    this.FetchTable(tab)?.SetPageStyle(name);
  }
  /** Dispatches or defers the sheet direction for the original XML import contract. @param tab - Sheet. @param set - RTL state. @returns Nothing. */
  SetLayoutRTL(tab: number, set: boolean): void {
    const table = this.FetchTable(tab);
    if (this.bImportingXML) table?.SetLoadingRTL(set);
    else table?.SetLayoutRTL(set);
  }
  ApplySelectionLineStyle = documentFrame.ApplySelectionLineStyle;
  GetSelectionFrame = documen7.GetSelectionFrame;
  ApplySelectionFrame = documentFrame.ApplySelectionFrame;
  /** Original selected-sheet indentation with removed-tab boundary. @param increment - Direction. @param marks - Real marks. @returns Nothing. */
  ChangeSelectionIndent(increment: boolean, marks: ScMarkData): void {
    for (const tab of marks.GetSelectedTabs()) {
      if (tab >= this.GetTableCount()) break;
      this.FetchTable(tab)?.ChangeSelectionIndent(marks, increment);
    }
  }
  /** Original document column-domain query. @param column - Native column. @returns Whether valid. */
  ValidCol(column: number): boolean {
    return ValidCol(column, MAXCOL);
  }
  SetRowHeightRange = documentGeometry.SetRowHeightRange;
  SetRowHeightOnly = documentGeometry.SetRowHeightOnly;
  SetManualHeight = documentGeometry.SetManualHeight;
  GetRowHeight = documentGeometry.GetRowHeight;
  GetSheetOptimalMinRowHeight = documentGeometry.GetSheetOptimalMinRowHeight;
  RowHidden = documentGeometry.RowHidden;
  RowFiltered = documentGeometry.RowFiltered;
  IsBlockEditable = document10.IsBlockEditable;
  IsSelectionEditable = document10.IsSelectionEditable;
  HasFilteredRows = document10.HasFilteredRows;
  LastNonFilteredRow = document10.LastNonFilteredRow;
  SetRowHidden = documentGeometry.SetRowHidden;
  SetRowFiltered = documentGeometry.SetRowFiltered;
  ShowRows = documentGeometry.ShowRows;
  SetColWidth = documentGeometry.SetColWidth;
  SetColWidthOnly = documentGeometry.SetColWidthOnly;
  GetColWidth = documentGeometry.GetColWidth;
  ColHidden = documentGeometry.ColHidden;
  SetColHidden = documentGeometry.SetColHidden;
  ShowCol = documentGeometry.ShowCol;
  DeleteArea = documen7.DeleteArea;
  DeleteSelection = documen7.DeleteSelection;
  ShrinkToDataArea = documen7.ShrinkToDataArea;
  private pSelectionAttr: ScPatternAttr | undefined;
  /** Original owned selection pattern assembled by native table/column/run merges. @param marks - Actual sheet and cell marks. @param deep - Include inherited items. @returns Independent pattern. */
  CreateSelectionPattern(marks: ScMarkData, deep = true): ScPatternAttr {
    return documen7.CreateSelectionPattern.call(this, marks, deep);
  }
  /** Original retained native selection result replaces the previous owned value. @param marks - Actual marks. @returns Borrowed current pattern. */
  GetSelectionPattern(marks: ScMarkData): ScPatternAttr {
    const next = this.CreateSelectionPattern(marks);
    this.pSelectionAttr?.Dispose();
    this.pSelectionAttr = next;
    return this.pSelectionAttr;
  }
  private mxPoolHelper: ScPoolHelper | null = null;
  private mpEditEngine: ScFieldEditEngine | null = null;
  protected mpShell: SfxObjectShell | null = null;
  protected mpCellAttributeHelper: CellAttributeHelper | null = null;
  private readonly bIsClip: boolean;
  private readonly bIsUndo: boolean;
  private readonly bIsFunctionAccess: boolean;
  private bNoListening = false;
  private bInsertingFromOtherDoc = false;
  /** Original deferred insertion state. @returns Insertion flag. */
  IsInsertingFromOtherDoc(): boolean {
    return this.bInsertingFromOtherDoc;
  }
  /** Original flag suppresses premature column listening and broadcasts during clipboard transfer. @param inserting - Insertion flag. @returns Nothing. */
  SetInsertingFromOtherDoc(inserting: boolean): void {
    this.bInsertingFromOtherDoc = inserting;
  }
  private pFormulaTree: ScFormulaCell | null = null;
  private pEOFormulaTree: ScFormulaCell | null = null;
  private pFormulaTrack: ScFormulaCell | null = null;
  private pEOFormulaTrack: ScFormulaCell | null = null;
  private nFormulaTrackCount = 0;
  private nFormulaCodeInTree = 0;
  private bHasForcedFormulas = false;
  private bCalculatingFormulaTree = false;
  private readonly mxSheetLimits = new ScSheetLimits(MAXCOL, MAXROW);
  private readonly maInterpreterContext = new ScInterpreterContext(this, null);
  private readonly aDocName = new OUString();
  /** Original document.hxx document-name assignment. @param name - Source value. @returns Nothing. */
  SetName(name: OUStringConstReference): void {
    this.aDocName.assign(name);
  }
  private pChartListenerCollection: ScChartListenerCollection | null = null;
  private nInterpretLevel = 0;
  private bImportingXML = false;
  private bInDtorClear = false;
  /** Borrows the native chart collection,absent in Clip/Undo documents. @returns Collection or null. */
  GetChartListenerCollection(): ScChartListenerCollection | null {
    return this.pChartListenerCollection;
  }
  /** Original interpreter nesting query. @returns Active. */
  IsInInterpreter(): boolean {
    return this.nInterpretLevel !== 0;
  }
  /** Original saturating unsigned-short nesting increment. @returns Nothing. */
  IncInterpretLevel(): void {
    if (this.nInterpretLevel < 0xffff) ++this.nInterpretLevel;
  }
  /** Original nesting decrement retains zero. @returns Nothing. */
  DecInterpretLevel(): void {
    if (this.nInterpretLevel) --this.nInterpretLevel;
  }
  /** Original XML-import query. @returns Importing. */
  IsImportingXML(): boolean {
    return this.bImportingXML;
  }
  /** Ends XML loading before applying each sheet's deferred right-to-left layout. @param importing - Original loading flag. @returns Nothing. */
  SetImportingXML(importing: boolean): void {
    this.bImportingXML = importing;
    if (importing) return;
    for (let tab = 0; tab < this.GetTableCount(); ++tab) {
      const table = this.FetchTable(tab);
      if (!table) break;
      if (table.IsLoadingRTL()) {
        table.SetLoadingRTL(false);
        this.SetLayoutRTL(tab, true);
      }
    }
  }
  /** Original document teardown query. @returns Clearing. */
  IsInDtorClear(): boolean {
    return this.bInDtorClear;
  }
  private readonly maCalcConfig = new ScCalcConfig(ScInterpreter.GetGlobalConfig());
  /** Original borrowed per-document calculation value. @returns Borrowed configuration. */
  GetCalcConfig(): ScCalcConfig {
    return this.maCalcConfig;
  }
  /** Original normal-build document10 assignment; the debug-only mutation guard has no release behavior. @param config - Copied settings. @returns Nothing. */
  SetCalcConfig(config: ScCalcConfig): void {
    this.maCalcConfig.copy_assign(config);
  }
  private bAutoCalc: boolean;
  private readonly maPersonList: ScPersonData[] = [];
  private readonly maTabs: (ScTable | null)[] = [];
  protected nVisibleTab = 0;
  private readonly mpDocLinkMgr = new DocumentLinkManager();

  /** Borrows the document's native link owner. @returns Document link manager. */
  GetDocLinkManager(): DocumentLinkManager {
    return this.mpDocLinkMgr;
  }

  /** Borrows or creates the actual Sfx2 link manager. @returns Registered link owner. */
  GetLinkManager(): LinkManager {
    return this.GetDocLinkManager().getLinkManager();
  }

  private externalReferences: ScExternalRefManager | undefined;
  /** Borrows the document's external reference owner. @returns External link manager. */
  GetExternalRefManager = (): ScExternalRefManager =>
    (this.externalReferences ??= new ScExternalRefManager(this));
  protected readonly maSheetViews = new WeakMap<ScTable, documentVisibility.SheetViewState>();
  private pBASM: ScBroadcastAreaSlotMachine | null = null;
  private eHardRecalcState = HardRecalcState.OFF;
  private mbTrackFormulasPending = false;
  private mbFinalTrackFormulas = false;
  private bExpandRefs = false;
  protected readonly languageFields = { eLanguage: 0, eCjkLanguage: 0, eCtlLanguage: 0 };
  GetLanguage = documen3.GetLanguage;
  protected readonly locale = MsLangId.Conversion.convertLanguageToLocale(0, false);
  declare private mpCellStringPool: SharedStringPool;
  /** Constructs native document-mode resources and an independent shared string pool. @param mode - Native construction mode. @param regexMatcherFactory - Text search service provided by the current runtime. @returns Document. */
  constructor(
    mode = ScDocumentMode.SCDOCMODE_DOCUMENT,
    public readonly regexMatcherFactory?: RegexMatcherFactory,
  ) {
    this.bIsClip = mode === ScDocumentMode.SCDOCMODE_CLIP;
    this.bIsUndo = mode === ScDocumentMode.SCDOCMODE_UNDO;
    this.bIsFunctionAccess = mode === ScDocumentMode.SCDOCMODE_FUNCTIONACCESS;
    this.bAutoCalc = mode === ScDocumentMode.SCDOCMODE_DOCUMENT || this.bIsFunctionAccess;
    documen2.InitializeResources.call(this);
  }
  /** Borrows the native document pool, absent before temporary-document resource sharing. @returns Pool or null. */
  GetPool(): ScDocumentPool | null {
    return this.mxPoolHelper ? this.mxPoolHelper.GetDocPool() : null;
  }
  /** Borrows the actual native style pool when this document owns pooled resources. @returns Pool or null. */
  GetStyleSheetPool(): ScStyleSheetPool | null {
    return this.mxPoolHelper ? this.mxPoolHelper.GetStylePool() : null;
  }
  GetFormatTable = documen2.GetFormatTable;
  GetEditEnginePool = documen2.GetEditEnginePool;
  /** Original document-owned editor, exposed for literal and rich-text transfer. @returns Borrowed editor. */
  GetEditEngine(): DocumentEditEngine {
    return (this.mpEditEngine ??= documen2.GetEditEngine.call(this));
  }
  /** Native clipboard mode query. @returns Mode flag. */
  IsClipboard(): boolean {
    return this.bIsClip;
  }
  /** Native undo mode query. @returns Mode flag. */
  IsUndo(): boolean {
    return this.bIsUndo;
  }
  /** Native combined temporary-document query. @returns Mode flag. */
  IsClipOrUndo(): boolean {
    return this.bIsClip || this.bIsUndo;
  }
  /** Native function-access mode query. @returns Mode flag. */
  IsFunctionAccess(): boolean {
    return this.bIsFunctionAccess;
  }
  /** Sets the actual subscription suppression flag. @param value - Suppress new listening. @returns Nothing. */
  SetNoListening(value: boolean): void {
    this.bNoListening = value;
  }
  /** Reads the native subscription suppression flag. @returns Flag. */
  GetNoListening(): boolean {
    return this.bNoListening;
  }
  getCellAttributeHelper = documen2.getCellAttributeHelper;
  /** Borrows effective cell attributes through the sheet/column/default chain. @param position - Cell. @returns Pattern or null. */
  GetPattern(position: ScAddress): ScPatternAttr | null {
    return this.FetchTable(position.Tab())?.GetPattern(position.Col(), position.Row()) ?? null;
  }
  GetColDefault = documentGeometry.GetColDefault;
  GetNumberFormat = documentGeometry.GetNumberFormat;
  IsMerged = document10.IsMerged;
  /** Native document.cxx single-cell number-format dispatch. @param position - Cell. @param key - Formatter key. @returns Nothing. */
  SetNumberFormat(position: ScAddress, key: number): void {
    this.FetchTable(position.Tab())?.SetNumberFormat(position.Col(), position.Row(), key);
  }
  ApplyAttr = document10.ApplyAttr;
  /** Original document.cxx cursor-pattern assignment delegates through the actual sheet. @param col - Column. @param row - Row. @param tab - Sheet. @param holder - Complete canonical pattern. @returns Nothing. */
  SetPattern(col: number, row: number, tab: number, holder: CellAttributeHolder): void {
    this.FetchTable(tab)?.SetPattern(col, row, holder);
  }
  /** Original document.cxx cursor delta applies to exactly one sheet cell. @param col - Column. @param row - Row. @param tab - Sheet. @param pattern - Borrowed delta. @returns Nothing. */
  ApplyPattern(col: number, row: number, tab: number, pattern: ScPatternAttr): void {
    this.FetchTable(tab)?.ApplyPattern(col, row, pattern);
  }
  /** Applies the named style to native attributes in the selected sheet. @param startCol - First column. @param startRow - First row. @param endCol - Last column. @param endRow - Last row. @param tab - Sheet. @param style - Native style. @returns Nothing. */
  ApplyStyleAreaTab(
    startCol: number,
    startRow: number,
    endCol: number,
    endRow: number,
    tab: number,
    style: ScPatternStyleReference,
  ): void {
    this.FetchTable(tab)?.ApplyStyleArea(startCol, startRow, endCol, endRow, style);
  }

  private maSubTotalCells = new Set<ScFormulaCell>();

  /** Registers a formula that consumes the native subtotal data selection. @param cell - Formula owner. @returns Nothing. */
  AddSubTotalCell(cell: ScFormulaCell): void {
    this.maSubTotalCells.add(cell);
  }

  /** Releases a subtotal registration when the formula owner is destroyed. @param cell - Formula owner. @returns Nothing. */
  RemoveSubTotalCell(cell: ScFormulaCell): void {
    this.maSubTotalCells.delete(cell);
  }

  /** Dirties subtotal formulas referring to a filtered area and removes obsolete registrations. @param dirtyRange - Query operation's changed range. @returns Nothing. */
  SetSubTotalCellsDirty(dirtyRange: ScRange): void {
    const live = new Set<ScFormulaCell>();
    const autoCalc = this.GetAutoCalc();
    this.SetAutoCalc(false);
    try {
      for (const cell of this.maSubTotalCells) {
        if (!cell.IsSubTotal()) continue;
        live.add(cell);
        const iterator = new ScDetectiveRefIter(this, cell);
        const range = new ScRange();
        while (iterator.GetNextRef(range)) {
          if (!range.Intersects(dirtyRange)) continue;
          cell.SetDirty();
          break;
        }
      }
    } finally {
      this.SetAutoCalc(autoCalc);
    }
    this.maSubTotalCells = live;
  }

  ApplyPatternAreaTab = document10.ApplyPatternAreaTab;
  ApplySelectionPattern = documen7.ApplySelectionPattern;
  CopyToDocument = documen7.CopyToDocument;
  DisposeAttributes = documen2.DisposeAttributes;
  /** Releases consumed native document observer lifetime,starting with area destruction before formula-cell destruction as in documen2. GC owns physical stores. @returns Nothing. */
  Dispose(): void {
    this.pChangeTrack?.Dispose();
    this.pChangeTrack = undefined;
    this.documentProperties.Dispose();
    this.mpDocLinkMgr.Dispose();
    this.pValidationList?.Dispose();
    return documen2.Dispose.call(this);
  }
  /** Borrows document-independent native sheet limits. @returns Limits. */
  GetSheetLimits(): ScSheetLimits {
    return this.mxSheetLimits;
  }
  /** Borrows the actual nonthreaded numeric interpreter context. @returns Context. */
  GetNonThreadedContext(): ScInterpreterContext {
    return this.maInterpreterContext;
  }
  /** Reads the normal document's native automatic-calculation default. @returns Enabled. */
  GetAutoCalc(): boolean {
    return this.bAutoCalc;
  }
  /** Applies the native normal-document auto-calc switch and forced-formula wakeup. Shell/interpreter callback modes are unsupported. @param enabled - Enabled. @returns Nothing. */
  SetAutoCalc(enabled: boolean): void {
    const old = this.bAutoCalc;
    this.bAutoCalc = enabled;
    if (!old && enabled && this.bHasForcedFormulas && !this.bCalculatingFormulaTree)
      this.CalcFormulaTree(true);
  }
  GetRefCellValue = documen7.GetRefCellValue;
  /** Borrows a source broadcaster. @param position - Cell. @returns Broadcaster or null. */
  GetBroadcaster(position: ScAddress): SvtBroadcaster<SfxHint> | null {
    return this.FetchTable(position.Tab())?.GetBroadcaster(position.Col(), position.Row()) ?? null;
  }
  StartListeningCell = documen7.StartListeningCell;
  EndListeningCell = documen7.EndListeningCell;
  /** Borrows the actual native area machine;null after observable destruction. @returns Machine. */
  GetBASM(): ScBroadcastAreaSlotMachine | null {
    return this.pBASM;
  }
  /** Reads native recalculation mode. @returns Mode. */
  GetHardRecalcState(): HardRecalcState {
    return this.eHardRecalcState;
  }
  /** Sets native recalculation mode. @param state - Mode. @returns Nothing. */
  SetHardRecalcState(state: HardRecalcState): void {
    this.eHardRecalcState = state;
  }
  LimitRangeToAvailableSheets = documen7.LimitRangeToAvailableSheets;
  StartListeningArea = documen7.StartListeningArea;
  EndListeningArea = documen7.EndListeningArea;
  BroadcastHintInternal = documen7.BroadcastHintInternal;
  Broadcast = documen7.Broadcast;
  /** Original inline flag used by native final tracking. @returns Final-round state. */
  IsFinalTrackFormulas(): boolean {
    return this.mbFinalTrackFormulas;
  }
  /** Reads actual native deferred tracking state. @returns Pending. */
  IsTrackFormulasPending(): boolean {
    return this.mbTrackFormulasPending;
  }
  FinalTrackFormulas = documen7.FinalTrackFormulas;
  /** Reports native logical formula-tree membership. @param cell - Formula. @returns Membership. */
  IsInFormulaTree(cell: ScFormulaCell): boolean {
    return cell.GetPrevious() !== null || this.pFormulaTree === cell;
  }
  /** Reports native logical tracking membership. @param cell - Formula. @returns Membership. */
  IsInFormulaTrack(cell: ScFormulaCell): boolean {
    return cell.GetPreviousTrack() !== null || this.pFormulaTrack === cell;
  }
  /** Appends a formula to the native calculation list. This is logical ordering, not object lifetime management. @param cell - Formula. @returns Nothing. */
  PutInFormulaTree(cell: ScFormulaCell): void {
    this.RemoveFromFormulaTree(cell);
    if (this.pEOFormulaTree) this.pEOFormulaTree.SetNext(cell);
    else this.pFormulaTree = cell;
    cell.SetPrevious(this.pEOFormulaTree);
    cell.SetNext(null);
    this.pEOFormulaTree = cell;
    this.nFormulaCodeInTree += cell.GetCode().GetCodeLen();
  }
  RemoveFromFormulaTree = documen7.RemoveFromFormulaTree;
  /** Reads the actual native RPN count in the calculation list. @returns Count. */
  GetFormulaCodeInTree(): number {
    return this.nFormulaCodeInTree;
  }
  /** Appends tracking membership after removing calculation membership. @param cell - Formula. @returns Nothing. */
  AppendToFormulaTrack(cell: ScFormulaCell): void {
    this.RemoveFromFormulaTrack(cell);
    this.RemoveFromFormulaTree(cell);
    if (this.pEOFormulaTrack) this.pEOFormulaTrack.SetNextTrack(cell);
    else this.pFormulaTrack = cell;
    cell.SetPreviousTrack(this.pEOFormulaTrack);
    cell.SetNextTrack(null);
    this.pEOFormulaTrack = cell;
    this.nFormulaTrackCount = (this.nFormulaTrackCount + 1) & 0xffff;
  }
  RemoveFromFormulaTrack = documen7.RemoveFromFormulaTrack;
  /** Performs native two-pass single-cell tracking, including contiguous-row hint compression. Bulk/area/group/script services are not represented. @param id - Hint ID. @returns Nothing. */
  TrackFormulas(id: SfxHintId = SfxHintId.ScDataChanged): void {
    return documen7.TrackFormulas.call(this, id);
  }
  /** Calculates represented dirty scalar formulas from the real tree; re-scan after recursive reads remove other tree nodes. @param onlyForced - Native forced-only mode. @returns Nothing. */
  CalcFormulaTree(onlyForced = false): void {
    return documen7.CalcFormulaTree.call(this, onlyForced);
  }
  CalcAll = documen7.CalcAll;
  SetAllFormulasDirty = documen7.SetAllFormulasDirty;
  /** Writes supported numeric formula content through the existing sheet/column owner chain. @param position - Cell. @param source - Formula. @param grammar - ODFF grammar. @returns Nothing. */
  SetFormula(position: ScAddress, source: OUStringConstReference, grammar: Grammar): void {
    this.FetchTable(position.Tab())?.SetFormula(position.Col(), position.Row(), source, grammar);
  }
  SetFormulaCell = document10.SetFormulaCell;
  /** Borrows the actual formula cell, or native null. @param position - Cell. @returns Formula cell or null. */
  GetFormulaCell(position: ScAddress): ScFormulaCell | null {
    return this.FetchTable(position.Tab())?.GetFormulaCell(position.Col(), position.Row()) ?? null;
  }
  /** Reads the native compiler/interpreter error code. @param position - Cell. @returns Error. */
  GetErrCode(position: ScAddress): FormulaError {
    return this.FetchTable(position.Tab())?.GetErrCode(position) ?? FormulaError.NONE;
  }
  /** Borrows the actual shared string pool. @returns Pool. */
  GetSharedStringPool(): SharedStringPool {
    return this.mpCellStringPool;
  }
  /** Reads the normal native row limit. @returns Last row. */
  MaxRow(): number {
    return MAXROW;
  }
  /** Reads the normal native column limit. @returns Last column. */
  MaxCol(): number {
    return MAXCOL;
  }
  /** Reports the full logical row domain of every column store. @returns Count. */
  GetMaxRowCount(): number {
    return this.mxSheetLimits.GetMaxRowCount();
  }
  /** Reads the native sheet-limit column count. @returns Count. */
  GetMaxColCount(): number {
    return this.mxSheetLimits.GetMaxColCount();
  }
  /** Original reference-expansion policy getter. @returns Expand adjacent references. */
  IsExpandRefs(): boolean {
    return this.bExpandRefs;
  }
  /** Original reference-expansion policy setter. @param value - Policy. @returns Nothing. */
  SetExpandRefs(value: boolean): void {
    this.bExpandRefs = value;
  }
  /** Checks native row bounds. @param row - Row. @returns Validity. */
  ValidRow(row: number): boolean {
    return ValidRow(row, MAXROW);
  }
  GetNote = documentNotes.GetNote;
  HasNote = documentNotes.HasNote;
  SetNote = documentNotes.SetNote;
  GetOrCreateNote = documentNotes.GetOrCreateNote;
  AddPerson = documentNotes.AddPerson;

  GetPersonById = documentNotes.GetPersonById;

  /** Borrows the persons in insertion order. @param this - Actual workbook. @returns Native person list. */
  GetPersonList(): readonly ScPersonData[] {
    return this.maPersonList;
  }

  GetAllNoteEntries = documentNotes.GetAllNoteEntries;
  /** Checks native column/row bounds. @param col - Column. @param row - Row. @returns Validity. */
  ValidColRow(col: number, row: number): boolean {
    return ValidCol(col, MAXCOL) && this.ValidRow(row);
  }
  /** Returns the extent of the native sheet storage. @returns Sheet count. */
  GetTableCount = (): number => this.maTabs.length;
  GetCellArea = document10.GetCellArea;
  FetchTable = documentVisibility.FetchTable;
  IsVisible = documentVisibility.IsVisible;
  SetVisible = documentVisibility.SetVisible;
  GetVisibleTab = documentVisibility.GetVisibleTab;
  SetVisibleTab = documentVisibility.SetVisibleTab;
  GetSheetShowGrid = documentVisibility.GetSheetShowGrid;
  SetSheetShowGrid = documentVisibility.SetSheetShowGrid;
  GetName = document10.GetName;
  /** Applies native editable sheet-name character constraints without a fabricated length limit. @param name - Native Unicode name. @returns Validity. */
  static ValidTabName(name: OUStringConstReference): boolean {
    return documentNames.ValidTabName(name);
  }
  ValidNewTabName = documentNames.ValidNewTabName;
  GetTable = documentNames.GetTable;
  GetAllTableNames = documentNames.GetAllTableNames;
  SetTabNameOnLoad = documentNames.SetTabNameOnLoad;
  InsertTab = document10.InsertTab;
  RenameTab = document10.RenameTab;
  DeleteTab = document10.DeleteTab;
  /** Writes a number through the actual sheet/column chain. @param position - Cell address. @param value - Number. @returns Nothing. */
  SetValue(position: ScAddress, value: number): void {
    this.FetchTable(position.Tab())?.SetValue(position.Col(), position.Row(), value);
  }
  /** Reads numeric cells with native zero fallback. @param position - Cell address. @returns Value. */
  GetValue(position: ScAddress): number {
    return this.FetchTable(position.Tab())?.GetValue(position.Col(), position.Row()) ?? 0;
  }
  GetCellType = documen7.GetCellType;
  GetSharedString = documen7.GetSharedString;
  SetTextCell = documen7.SetTextCell;
  /** Original edit-cell setter transfers a nullable object or destroys it when no destination exists. @param position - Cell. @param value - Owned edit text. @returns Whether an existing table accepts the coordinates. */
  SetEditText(position: ScAddress, value: EditTextObject | null): boolean {
    const table = this.FetchTable(position.Tab());
    if (table) return table.SetEditText(position.Col(), position.Row(), value);
    value?.dispose();
    return false;
  }
  /** Original address overload forwards to scalar coordinates. @param position - Cell. @param value - Input. @param parameter - Optional policy. @returns Format overwrite flag. */
  SetString(
    position: ScAddress,
    value: OUStringConstReference,
    parameter?: ScSetStringParam | null,
  ): boolean;
  /** Original scalar overload tears down intersected formula-group listeners before parsing/adoption. @param col - Column. @param row - Row. @param tab - Sheet. @param value - Input. @param parameter - Optional policy. @returns Format overwrite flag. */
  SetString(
    col: number,
    row: number,
    tab: number,
    value: OUStringConstReference,
    parameter?: ScSetStringParam | null,
  ): boolean;
  /** Original overload selection uses scalar coordinates versus a declared ScAddress. @param first - Address or column. @param second - Text or row. @param third - Policy or sheet. @param fourth - Scalar text. @param fifth - Scalar policy. @returns Original format overwrite flag. */
  SetString(
    first: ScAddress | number,
    second: OUStringConstReference | number,
    third: ScSetStringParam | number | null = null,
    fourth?: OUStringConstReference,
    fifth: ScSetStringParam | null = null,
  ): boolean {
    return setDocumentString.call(this, first, second, third, fourth, fifth);
  }
  EndListeningIntersectedGroup = document10.EndListeningIntersectedGroup;
  /** Clears an existing scalar cell without allocating a missing column or sheet. @param position - Cell address. @returns Nothing. */
  SetEmptyCell(position: ScAddress): void {
    this.FetchTable(position.Tab())?.SetEmptyCell(position.Col(), position.Row());
  }
}
