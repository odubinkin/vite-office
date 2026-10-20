/** @fileoverview Original ScUndoWidthOrHeight explicit-column path;actual undo document and borrowed active view replace unported global VCL view lookup. */
import { SfxUndoAction } from "../../../../svl/source/undo/undo";
import type { ScDocShell } from "../docshell/docsh";
import type { ScDocument } from "../../../inc/document";
import { ScMarkData } from "../../../inc/markdata";
import { ScRange } from "../../../inc/address";
import { ColRowSpan } from "../../../inc/columnspanset";
import { InsertDeleteFlags, type ScSizeMode } from "../../../inc/global";
import type { ScViewFunc } from "../view/viewfunc";
/** Original geometry history;DIRECT does not restore cell marks or the old cursor. */
export class ScUndoWidthOrHeight extends SfxUndoAction<ScDocShell> {
  private readonly marks: ScMarkData;
  private readonly ranges: readonly ColRowSpan[];
  /** Owns a real geometry document and source spans. @param shell - Document shell. @param marks - Selected sheets. @param first - First column. @param last - Last column. @param tab - Original active sheet. @param undo - Owned geometry document. @param ranges - Original spans. @param mode - Size mode. @param size - UInt16 width. @param view - Actual active view when present. @returns Action. */
  constructor(
    private readonly shell: ScDocShell,
    marks: ScMarkData,
    private readonly first: number,
    private readonly last: number,
    readonly tab: number,
    private readonly undo: ScDocument,
    ranges: readonly ColRowSpan[],
    private readonly mode: ScSizeMode,
    private readonly size: number,
    private readonly view?: ScViewFunc,
  ) {
    super();
    this.marks = new ScMarkData(marks);
    this.ranges = ranges.map(
      /** Copies native endpoints. @param span - Source span. @returns Independent span. */ (
        span,
      ) => new ColRowSpan(span.mnStart, span.mnEnd),
    );
  }
  /** Restores only source geometry on the originally selected existing sheets. @returns Nothing. */
  override UndoWithContext(): void {
    const doc = this.shell.GetDocument();
    for (const tab of this.marks.GetSelectedTabs()) {
      if (tab >= doc.GetTableCount()) break;
      this.undo.CopyToDocument(
        new ScRange(this.first, 0, tab, this.last, doc.MaxRow(), tab),
        InsertDeleteFlags.NONE,
        false,
        doc,
      );
    }
    if (this.view && this.view.GetViewData().GetTabNumber() !== this.tab)
      this.view.SetTabNo(this.tab);
  }
  /** Source redo requires an actual view;headless history has no fabricated view service. @returns Nothing. */
  override RedoWithContext(): void {
    if (this.view && this.view.GetViewData().GetTabNumber() !== this.tab)
      this.view.SetTabNo(this.tab);
    this.view?.SetWidthOrHeight(true, this.ranges, this.mode, this.size, false, this.marks);
  }
  /** Original STR_UNDO_COLWIDTH resource. @returns Label. */
  override GetComment(): string {
    return "Column Width";
  }
  /** Releases the actual owned document resources. @returns Nothing. */
  override Dispose(): void {
    this.undo.DisposeAttributes();
    this.undo.GetSharedStringPool().dispose();
  }
}
