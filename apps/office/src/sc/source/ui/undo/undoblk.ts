/** @fileoverview Original ScUndoIndent actual marked attribute snapshot and source redo;represented block history adjusts supported row heights. */
import { SfxUndoAction } from "../../../../svl/source/undo/undo";
import type { ScDocShell } from "../docshell/docsh";
import { ScDocument, ScDocumentMode } from "../../../inc/document";
import { ScMarkData } from "../../../inc/markdata";
import { ScRangeList } from "../../../inc/rangelst";
import { SfxHintId } from "../../../../svl/inc/hint";
import { ScRange } from "../../../inc/address";
import { InsertDeleteFlags } from "../../../inc/global";
import { AdjustBlockHeight } from "../view/viewfun2";
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
/** Native content-only ScUndoPaste owns actual Undo/Redo documents and base range/mark value fields. ScMultiBlockUndo drawing/view,change tracking,cut RefUndoData and Repeat services remain unrepresented;no replacement snapshots or fake shell are installed. */
export class ScUndoPaste extends SfxUndoAction<ScDocShell> {
  private readonly maBlockRanges: ScRangeList;
  private readonly aMarkData: ScMarkData;
  /** Native private repeat-option value projects to protected TypeScript state while Repeat dispatch is unrepresented;no public accessor or fake lifecycle hook is added. */
  protected readonly aPasteOptions: ScUndoPasteOptions;
  /** Original ownership/default fields;only copy-mode null RefUndoData and CONTENTS are admitted. @param shell - Actual owning shell. @param ranges - Actual base range list copied by value. @param marks - Original native marks. @param undo - Owned native Undo document. @param redo - Optional owned Redo document. @param flags - Original content flags. @param _refData - Native null copy-mode reference data. @param redoFilled - Original filled flag. @param options - Original optional repeat options. @returns Action. */
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
    if (flags !== InsertDeleteFlags.CONTENTS) {
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
    // Constructor admission proves native CONTENTS normalization equals the actual stored flags and ATTRIB is absent.
    let flags = this.flags;
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
