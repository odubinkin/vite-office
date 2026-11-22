/** @fileoverview Original ScUndoIndent actual marked attribute snapshot and source redo;represented block history adjusts supported row heights. */
import { SfxUndoAction } from "../../../../svl/source/undo/undo";
import type { ScDocShell } from "../docshell/docsh";
import { ScDocument, ScDocumentMode } from "../../../inc/document";
import { ScMarkData } from "../../../inc/markdata";
import { ScRangeList } from "../../../inc/rangelst";
import { SfxHintId } from "../../../../svl/inc/hint";
import { ScRange } from "../../../inc/address";
import { HasAttrFlags, InsertDeleteFlags } from "../../../inc/global";
import { AdjustBlockHeight } from "../view/viewfun2";
import { scMergeResourcesEnglish } from "../../../inc/globstr";
import type { ScCellMergeOption } from "../view/cellmergeoption";
import { SfxStyleFamily } from "../../../../svl/inc/style-values";
import { unicode } from "../../../../i18nlangtag/source/isolang/isolang.tables";

/** Original cell-style history restores marked attributes and reapplies the named style on Redo. */
export class ScUndoSelectionStyle extends SfxUndoAction<ScDocShell> {
  private readonly marks: ScMarkData;
  private readonly range: ScRange;

  /** Owns original attributes and marks for the source style command. @param shell - Live shell. @param marks - Selected cells and tabs. @param range - Affected rectangle. @param styleName - Original named style. @param undo - Owned attribute snapshot. @returns History action. */
  constructor(
    private readonly shell: ScDocShell,
    marks: ScMarkData,
    range: ScRange,
    private readonly styleName: string,
    private readonly undo: ScDocument,
  ) {
    super();
    this.marks = new ScMarkData(marks);
    this.marks.MarkToMulti();
    this.range = new ScRange(range);
  }

  /** Restores the original style identities and direct attributes. @returns Nothing. */
  override UndoWithContext(): void {
    const doc = this.shell.GetDocument(),
      range = new ScRange(this.range);
    if (doc.HasAttrib(range, HasAttrFlags.Merged)) doc.ExtendMergeRange(range, true);
    range.aStart.SetTab(0);
    range.aEnd.SetTab(doc.GetTableCount() - 1);
    this.undo.CopyToDocument(range, InsertDeleteFlags.ATTRIB, true, doc, this.marks);
    AdjustBlockHeight(doc, this.marks, range.aStart.Row(), range.aEnd.Row());
  }

  /** Resolves the source style name again and repeats its application. @returns Nothing. */
  override RedoWithContext(): void {
    const doc = this.shell.GetDocument(),
      name = unicode(this.styleName);
    try {
      const style = doc.GetStyleSheetPool()?.Find(name, SfxStyleFamily.Para);
      if (!style) return;
      const range = new ScRange(this.range);
      if (doc.HasAttrib(range, HasAttrFlags.Merged)) doc.ExtendMergeRange(range, true);
      doc.ApplySelectionStyle(style, this.marks);
      AdjustBlockHeight(doc, this.marks, range.aStart.Row(), range.aEnd.Row());
    } finally {
      name.dispose();
    }
  }

  /** Copies the native history selection. @returns Selected ranges and sheets. */
  GetMarkData(): ScMarkData {
    return new ScMarkData(this.marks);
  }

  /** Copies the original style command's rectangle. @returns Affected range. */
  getAffectedRange(): ScRange {
    return new ScRange(this.range);
  }

  /** Returns STR_UNDO_APPLYCELLSTYLE. @returns History caption. */
  override GetComment(): string {
    return "Apply Cell Style";
  }

  /** Releases the owned attribute snapshot. @returns Nothing. */
  override Dispose(): void {
    this.undo.Dispose();
  }
}

/** Original split history owns one attribute snapshot and the extended source ranges. */
export class ScUndoRemoveMerge extends SfxUndoAction<ScDocShell> {
  /** Takes the pre-split snapshot for the source option. @param shell - Live document owner. @param option - Split range and tabs. @param undo - Owned attribute snapshot. @returns Undo action. */
  constructor(
    private readonly shell: ScDocShell,
    private readonly option: ScCellMergeOption,
    private readonly undo: ScDocument,
  ) {
    super();
  }

  /** Restores original attributes and marks the sheet streams for saving. @returns Nothing. */
  override UndoWithContext(): void {
    const doc = this.shell.GetDocument();
    const {
      mnStartCol: col,
      mnStartRow: row,
      mnEndCol: lastCol,
      mnEndRow: lastRow,
      maTabs,
    } = this.option;
    for (const tab of maTabs) {
      const range = this.option.getSingleRange(tab);
      const sheet = doc.FetchTable(tab);
      sheet?.DeleteArea(col, row, lastCol, lastRow, InsertDeleteFlags.ATTRIB);
      this.undo.CopyToDocument(range, InsertDeleteFlags.ATTRIB, false, doc);
      this.shell.GetDocFunc().AdjustRowHeight(range, true, true);
      sheet?.SetStreamValid(false);
    }
  }

  /** Reapplies the native split without creating more history. @returns Nothing. */
  override RedoWithContext(): void {
    this.shell.GetDocFunc().UnmergeCells(this.option, false);
  }

  /** Resolves the history sheet and original rectangle. @param tab - Current view sheet. @returns Source affected range. */
  getAffectedRange(tab: number): ScRange {
    return this.option.maTabs.has(tab)
      ? this.option.getSingleRange(tab)
      : this.option.getFirstSingleRange();
  }

  /** Returns the native split caption. @returns Undo label. */
  override GetComment(): string {
    return scMergeResourcesEnglish.STR_UNDO_REMERGE;
  }

  /** Releases the owned snapshot. @returns Nothing. */
  override Dispose(): void {
    this.undo.Dispose();
  }
}
/** Original indent history owns real pre-change attributes and original marks. */
export class ScUndoIndent extends SfxUndoAction<ScDocShell> {
  private readonly marks: ScMarkData;
  private readonly range: ScRange;
  /** Takes actual snapshot ownership. @param shell - Live shell. @param marks - Original marks. @param undo - Snapshot. @param increment - Direction. @returns Action. */
  constructor(
    private readonly shell: ScDocShell,
    marks: ScMarkData,
    private readonly undo: ScDocument,
    private readonly increment: boolean,
  ) {
    super();
    this.marks = new ScMarkData(marks);
    this.range = new ScRange(marks.GetMultiMarkArea());
  }
  /** Restores original marked attributes. @returns Nothing. */
  override UndoWithContext(): void {
    const doc = this.shell.GetDocument(),
      range = new ScRange(this.range);
    range.aStart.SetTab(0);
    range.aEnd.SetTab(doc.GetTableCount() - 1);
    this.undo.CopyToDocument(range, InsertDeleteFlags.ATTRIB, true, doc, this.marks);
    AdjustBlockHeight(doc, this.marks, this.range.aStart.Row(), this.range.aEnd.Row());
  }
  /** Repeats original native delta against current column widths. @returns Nothing. */
  override RedoWithContext(): void {
    const doc = this.shell.GetDocument();
    doc.ChangeSelectionIndent(this.increment, this.marks);
    AdjustBlockHeight(doc, this.marks, this.range.aStart.Row(), this.range.aEnd.Row());
  }
  /** Copies original native marks. @returns Marks. */
  GetMarkData(): ScMarkData {
    return new ScMarkData(this.marks);
  }
  /** Copies affected block. @returns Range. */
  getAffectedRange(): ScRange {
    return new ScRange(this.range);
  }
  /** Original indentation undo resource. @returns Label. */
  override GetComment(): string {
    return this.increment ? "Increase Indent" : "Decrease Indent";
  }
  /** Releases owned canonical attributes and strings. @returns Nothing. */
  override Dispose(): void {
    this.undo.Dispose();
  }
}

/** Original undoblk.hxx repeat-option value defaults;enum values are projected from native global.hxx ScPasteFunc::NONE0 and INS_NONE4. Repeat dispatch itself remains unported. */
export class ScUndoPasteOptions {
  nFunction = 0;
  bSkipEmptyCells = false;
  bTranspose = false;
  bAsLink = false;
  eMoveMode = 4;
  /** Original implicit struct copy/default constructor. @param source - Optional actual copied fields. @returns Value. */
  constructor(source?: ScUndoPasteOptions) {
    if (source) {
      this.nFunction = source.nFunction;
      this.bSkipEmptyCells = source.bSkipEmptyCells;
      this.bTranspose = source.bTranspose;
      this.bAsLink = source.bAsLink;
      this.eMoveMode = source.eMoveMode;
    }
  }
}
/** Native default-content ScUndoPaste with optional full attribute undo owns actual Undo/Redo documents and base range/mark value fields. ScMultiBlockUndo drawing/view,change tracking,cut RefUndoData and Repeat services remain unrepresented;no replacement snapshots or fake shell are installed. */
export class ScUndoPaste extends SfxUndoAction<ScDocShell> {
  private readonly maBlockRanges: ScRangeList;
  private readonly aMarkData: ScMarkData;
  /** Native private repeat-option value projects to protected TypeScript state while Repeat dispatch is unrepresented;no public accessor or fake lifecycle hook is added. */
  protected readonly aPasteOptions: ScUndoPasteOptions;
  /** Original ownership/default fields;only copy-mode null RefUndoData and native default-content/attribute undo flags are admitted. @param shell - Actual owning shell. @param ranges - Actual base range list copied by value. @param marks - Original native marks. @param undo - Owned native Undo document. @param redo - Optional owned Redo document. @param flags - Original content flags. @param _refData - Native null copy-mode reference data. @param redoFilled - Original filled flag. @param options - Original optional repeat options. @returns Action. */
  constructor(
    private readonly shell: ScDocShell,
    ranges: ScRangeList,
    marks: ScMarkData,
    private readonly undo: ScDocument,
    private redo: ScDocument | null,
    private readonly flags: InsertDeleteFlags,
    _refData: null,
    private redoFilled: boolean,
    options: ScUndoPasteOptions | null = null,
  ) {
    super();
    void _refData;
    if (
      flags !== InsertDeleteFlags.CONTENTS &&
      flags !== (InsertDeleteFlags.CONTENTS | InsertDeleteFlags.NOCAPTIONS) &&
      flags !== (InsertDeleteFlags.ATTRIB | InsertDeleteFlags.NOCAPTIONS) &&
      flags !==
        (InsertDeleteFlags.CONTENTS | InsertDeleteFlags.ATTRIB | InsertDeleteFlags.NOCAPTIONS)
    ) {
      // Original unique_ptr parameters/members are destroyed when construction cannot complete.
      undo.Dispose();
      redo?.Dispose();
      throw Error("Nondefault paste undo flags are not implemented");
    }
    this.maBlockRanges = new ScRangeList(ranges);
    this.aMarkData = new ScMarkData(marks);
    this.aPasteOptions = new ScUndoPasteOptions(options ?? undefined);
  }
  /** Original DoChange data phases and lazy Redo capture. Unrepresented drawing/note/change-track/painting/view notifications have no dummy hooks. @param backward - Original Undo direction. @returns Nothing. */
  private DoChange(backward: boolean): void {
    const doc = this.shell.GetDocument(),
      count = doc.GetTableCount();
    // Constructor admission retains native all-or-none content and attribute normalization.
    let flags =
      this.flags & InsertDeleteFlags.CONTENTS ? InsertDeleteFlags.CONTENTS : InsertDeleteFlags.NONE;
    if (this.flags & InsertDeleteFlags.ATTRIB) flags |= InsertDeleteFlags.ATTRIB;
    flags &= ~InsertDeleteFlags.OBJECTS;
    flags |= InsertDeleteFlags.NOCAPTIONS;
    if (backward && !this.redoFilled) {
      if (!this.redo) {
        let columns = true,
          rows = true;
        for (const range of this.maBlockRanges) {
          columns = columns && range.aStart.Row() === 0 && range.aEnd.Row() === doc.MaxRow();
          rows = rows && range.aStart.Col() === 0 && range.aEnd.Col() === doc.MaxCol();
          if (!columns && !rows) break;
        }
        this.redo = new ScDocument(ScDocumentMode.SCDOCMODE_UNDO);
        this.redo.InitUndoSelected(doc, this.aMarkData, columns, rows);
      }
      for (const range of this.maBlockRanges) {
        const copy = new ScRange(range);
        copy.aStart.SetTab(0);
        copy.aEnd.SetTab(count - 1);
        doc.CopyToDocument(copy, flags, false, this.redo);
        this.redoFilled = true;
      }
    }
    this.aMarkData.MarkToMulti();
    doc.DeleteSelection(flags, this.aMarkData, false);
    for (const range of this.maBlockRanges) doc.BroadcastCells(range, SfxHintId.ScDataChanged);
    this.aMarkData.MarkToSimple();
    const first = this.aMarkData.GetFirstSelected();
    if (!backward && this.redo) {
      for (const original of this.maBlockRanges) {
        const range = new ScRange(original);
        range.aStart.SetTab(first);
        range.aEnd.SetTab(first);
        this.redo.UndoToDocument(range, flags, false, doc);
        for (const tab of this.aMarkData.GetSelectedTabs()) {
          if (tab >= count) break;
          if (tab === first) continue;
          range.aStart.SetTab(tab);
          range.aEnd.SetTab(tab);
          this.redo.CopyToDocument(range, flags, false, doc);
        }
      }
    }
    if (backward)
      for (const original of this.maBlockRanges)
        for (const tab of this.aMarkData.GetSelectedTabs()) {
          if (tab >= count) break;
          const range = new ScRange(original);
          range.aStart.SetTab(tab);
          range.aEnd.SetTab(tab);
          this.undo.UndoToDocument(range, flags, false, doc);
        }
  }
  /** Original native Undo data restoration. @returns Nothing. */
  Undo(): void {
    this.DoChange(true);
  }
  /** Original native Redo data restoration. @returns Nothing. */
  Redo(): void {
    this.DoChange(false);
  }
  /** Existing shared Sfx contextual dispatch invokes native Undo. @returns Nothing. */
  override UndoWithContext(): void {
    this.Undo();
  }
  /** Existing shared Sfx contextual dispatch invokes native Redo. @returns Nothing. */
  override RedoWithContext(): void {
    this.Redo();
  }
  /** Browser cursor bridge borrows an independent original marked value. @returns Actual copied marks. */
  GetMarkData(): ScMarkData {
    return new ScMarkData(this.aMarkData);
  }
  /** Existing affected-range bridge projects the actual native block list. @returns Combined native range. */
  getAffectedRange(): ScRange {
    return this.maBlockRanges.Combine();
  }
  /** Original resolved STR_UNDO_PASTE English resource. @returns Label. */
  override GetComment(): string {
    return "Paste";
  }
  /** Original destructor destroys actual Undo then Redo owners. @returns Nothing. */
  override Dispose(): void {
    this.undo.Dispose();
    this.redo?.Dispose();
    this.redo = null;
  }
}

/** Captures the native format list in an undo document without copying cell content. @param doc - Live workbook. @param tab - Origin sheet. @returns Owned undo document. */
export function CreateConditionalFormatUndoData(doc: ScDocument, tab: number): ScDocument {
  const snapshot = new ScDocument(ScDocumentMode.SCDOCMODE_UNDO);
  snapshot.InitUndo(doc, tab, tab);
  snapshot
    .FetchTable(tab)
    ?.SetCondFormList(doc.FetchTable(tab)?.GetCondFormList().Clone(snapshot) ?? null);
  return snapshot;
}

/** Original conditional-format-list history restores both range associations and rule entries. */
export class ScUndoConditionalFormatList extends SfxUndoAction<ScDocShell> {
  /** Owns both history states. @param undo - Before. @param redo - After. @param tab - Origin sheet. @returns Action. */
  constructor(
    private readonly undo: ScDocument,
    private readonly redo: ScDocument,
    protected readonly tab: number,
  ) {
    super();
  }

  /** Restores an original snapshot and refreshes the shared browser view. @param shell - Live shell. @param source - Desired snapshot. @param previous - Replaced snapshot. @returns Nothing. */
  protected DoChange(shell: ScDocShell, source: ScDocument, previous: ScDocument): void {
    const doc = shell.GetDocument();
    const sheet = doc.FetchTable(this.tab);
    const list = source.FetchTable(this.tab)?.GetCondFormList();
    if (!sheet || !list) return;
    previous.FetchTable(this.tab)?.GetCondFormList().RemoveFromDocument(doc);
    list.AddToDocument(doc);
    sheet.SetCondFormList(list.Clone(doc));
    sheet.SetStreamValid(false);
  }

  /** Restores the original format list. @param shell - Live shell. @returns Nothing. */
  override UndoWithContext(shell: ScDocShell): void {
    this.DoChange(shell, this.undo, this.redo);
  }

  /** Reinstates the accepted format list. @param shell - Live shell. @returns Nothing. */
  override RedoWithContext(shell: ScDocShell): void {
    this.DoChange(shell, this.redo, this.undo);
  }

  /** Original manager action caption. @returns History label. */
  override GetComment(): string {
    return "Conditional Formats";
  }

  /** Releases both owned history states. @returns Nothing. */
  override Dispose(): void {
    this.undo.Dispose();
    this.redo.Dispose();
  }
}

/** Original single-rule history restores the complete sheet format list. */
export class ScUndoConditionalFormat extends ScUndoConditionalFormatList {
  /** Removes existing keys throughout the previous combined range before installing the retained snapshot. @param shell - Live shell. @param source - Desired snapshot. @returns Nothing. */
  protected override DoChange(shell: ScDocShell, source: ScDocument): void {
    const doc = shell.GetDocument();
    const sheet = doc.FetchTable(this.tab);
    const list = source.FetchTable(this.tab)?.GetCondFormList();
    if (!sheet || !list) return;
    const old = sheet.GetCondFormList();
    const ranges = old.GetCombinedRange();
    for (const format of old) doc.RemoveCondFormatData(ranges, this.tab, format.GetKey());
    list.AddToDocument(doc);
    sheet.SetCondFormList(list.Clone(doc));
    sheet.SetStreamValid(false);
  }

  /** Original single-format caption. @returns History label. */
  override GetComment(): string {
    return "Conditional Format";
  }
}

/** Name-list history uses the cell and attribute parts of the source ALL mask. */
export const nameListSnapshotFlags = InsertDeleteFlags.ALL & ~InsertDeleteFlags.OBJECTS;

/** Source two-column block history used by Paste List. */
export class ScUndoListNames extends SfxUndoAction<ScDocShell> {
  private readonly range: ScRange;

  /** Owns both versions of the affected block. @param range - List destination. @param undo - Before insertion. @param redo - After insertion. @returns Action. */
  constructor(
    range: ScRange,
    private readonly undo: ScDocument,
    private readonly redo: ScDocument,
  ) {
    super();
    this.range = new ScRange(range);
  }

  /** Replaces the saved block including empty cells and attributes. @param shell - Workbook. @param source - Snapshot. @returns Nothing. */
  private DoChange(shell: ScDocShell, source: ScDocument): void {
    const doc = shell.GetDocument();
    const { aStart, aEnd } = this.range;
    const marks = new ScMarkData(doc.GetSheetLimits());
    marks.SelectTable(aStart.Tab(), true);
    doc.DeleteArea(
      aStart.Col(),
      aStart.Row(),
      aEnd.Col(),
      aEnd.Row(),
      marks,
      nameListSnapshotFlags,
    );
    source.CopyToDocument(this.range, nameListSnapshotFlags, false, doc);
    AdjustBlockHeight(doc, marks, aStart.Row(), aEnd.Row());
    doc.BroadcastCells(this.range, SfxHintId.ScDataChanged);
  }

  /** Restores the original block. @param shell - Workbook. @returns Nothing. */
  override UndoWithContext(shell: ScDocShell): void {
    this.DoChange(shell, this.undo);
  }

  /** Restores the inserted list. @param shell - Workbook. @returns Nothing. */
  override RedoWithContext(shell: ScDocShell): void {
    this.DoChange(shell, this.redo);
  }

  /** Releases both owned snapshots. @returns Nothing. */
  override Dispose(): void {
    this.undo.Dispose();
    this.redo.Dispose();
  }

  /** Returns the source undo label. @returns Caption. */
  override GetComment(): string {
    return "List names";
  }
}
