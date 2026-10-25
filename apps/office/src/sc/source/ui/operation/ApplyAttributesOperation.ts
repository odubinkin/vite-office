/** @fileoverview Consumed ApplyAttributesWithChangedRange/ToCell operations from ApplyAttributesOperation.cxx for normal enabled-undo scalar documents;native rich-edit,alternate views,global view lookup and paint services remain unported. */
import { Operation, OperationType } from "./Operation";
import type { ScDocShell } from "../docshell/docsh";
import { ScMarkData } from "../../../inc/markdata";
import { ScAddress, ScRange } from "../../../inc/address";
import { ScRangeList } from "../../../inc/rangelst";
import { ScPatternAttr } from "../../../inc/patattr";
import { ScDocument, ScDocumentMode } from "../../../inc/document";
import { InsertDeleteFlags } from "../../../inc/global";
import { ScUndoSelectionAttr } from "../undo/undoblk3";
import { ScUndoCursorAttr } from "../undo/undocell";
import type { ScViewData } from "../inc/viewdata";
/** Original marked attribute operation owns source copy-mode and changed ranges. */
export class ApplyAttributesWithChangedRangeOperation extends Operation {
  private readonly maChangeRanges = new ScRangeList();
  /** Borrows actual document/view and source inputs. @param shell - Shell. @param mark - Working marks. @param multiMarked - Original copy-only-marked flag. @param pattern - Delta. @param api - API mode. @param view - Actual active view in place of global lookup. @returns Operation. */
  constructor(
    private readonly shell: ScDocShell,
    private readonly mark: ScMarkData,
    private readonly multiMarked: boolean,
    private readonly pattern: ScPatternAttr,
    api: boolean,
    private readonly view?: ScViewData,
  ) {
    super(OperationType.ApplyAttributesWithChangedRange, true, api);
  }
  /** Returns the actual per-sheet native changed ranges. @returns Borrowed ranges. */
  getChangedRangeList(): ScRangeList {
    return this.maChangeRanges;
  }
  /** Preserves source snapshot,history and apply ordering. @returns Success or native absent-view no-op. */
  protected override runImplementation(): boolean {
    if (!this.view) return false;
    const doc = this.shell.GetDocument(),
      marks = new ScMarkData(this.mark),
      range = new ScRange(marks.GetMultiMarkArea());
    for (const tab of marks.GetSelectedTabs()) {
      const changed = new ScRange(range);
      changed.aStart.SetTab(tab);
      changed.aEnd.SetTab(tab);
      this.maChangeRanges.push_back(changed);
    }
    if (this.mbRecord) {
      const undo = new ScDocument(ScDocumentMode.SCDOCMODE_UNDO),
        tab = range.aStart.Tab();
      undo.InitUndo(doc, tab, tab);
      for (const selected of marks) if (selected !== tab) undo.AddUndoTab(selected, selected);
      const copy = new ScRange(range);
      copy.aStart.SetTab(0);
      copy.aEnd.SetTab(doc.GetTableCount() - 1);
      doc.CopyToDocument(copy, InsertDeleteFlags.ATTRIB, this.multiMarked, undo, marks);
      marks.MarkToMulti();
      this.shell
        .GetUndoManager()
        .AddUndoAction(
          new ScUndoSelectionAttr(this.shell, marks, range, undo, this.pattern, this.multiMarked),
        );
    }
    doc.ApplySelectionPattern(this.pattern, marks);
    this.shell.SetDocumentModified();
    return true;
  }
}
/** Original cursor operation captures complete old/new patterns,not a rectangle snapshot. */
export class ApplyAttributesToCellOperation extends Operation {
  private readonly maChangeRanges = new ScRangeList();
  /** Borrows source cursor,delta and actual active view. @param shell - Shell. @param position - Cursor. @param pattern - Delta. @param api - API mode. @param view - Actual view in place of global lookup. @returns Operation. */
  constructor(
    private readonly shell: ScDocShell,
    private readonly position: ScAddress,
    private readonly pattern: ScPatternAttr,
    api: boolean,
    private readonly view?: ScViewData,
  ) {
    super(OperationType.ApplyAttributesToCell, true, api);
  }
  /** Returns the actual original cursor range. @returns Borrowed range list. */
  getChangedRangeList(): ScRangeList {
    return this.maChangeRanges;
  }
  /** Captures native complete pattern values around real cursor mutation. @returns Success or absent-view no-op. */
  protected override runImplementation(): boolean {
    if (!this.view) return false;
    const doc = this.shell.GetDocument(),
      p = new ScAddress(this.position),
      old = new ScPatternAttr(doc.GetPattern(p) as ScPatternAttr);
    this.maChangeRanges.push_back(new ScRange(p));
    doc.ApplyPattern(p.Col(), p.Row(), p.Tab(), this.pattern);
    if (this.mbRecord)
      this.shell
        .GetUndoManager()
        .AddUndoAction(
          new ScUndoCursorAttr(
            this.shell,
            p,
            old,
            doc.GetPattern(p) as ScPatternAttr,
            this.pattern,
            this.view,
          ),
        );
    old.Dispose();
    this.shell.SetDocumentModified();
    return true;
  }
}
