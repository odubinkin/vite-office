/** @fileoverview Consumed ScViewFunc selection-pattern query and source whole-sheet data-area clipping. Alternate sheet views remain unported. */
import { ScViewUtil } from "./viewutil";
import { ScTabView } from "./tabview3";
import type { ScDocShell } from "../docshell/docsh";
import { InsertDeleteFlags, ScSizeMode } from "../../../inc/global";
import type { ScPatternAttr } from "../../../inc/patattr";
import { ScMarkData } from "../../../inc/markdata";
import { ScRange, ScAddress } from "../../../inc/address";
import { ScUndoWidthOrHeight } from "../undo/undoblk2";
import { ScDocument } from "../../../inc/document";
import { OUString } from "../../../../sal/inc/rtl/ustring";
import type { ColRowSpan } from "../../../inc/columnspanset";
import type { ScViewData } from "../inc/viewdata";
/** Original ShowFilteredRows skips actual filter runs when manually resizing or hiding. @param doc - Actual document. @param tab - Sheet. @param first - First row. @param last - Last row. @param show - Visibility. @returns Nothing. */
function ShowFilteredRows(
  doc: ScDocument,
  tab: number,
  first: number,
  last: number,
  show: boolean,
): void {
  const end: [number] = [first];
  do {
    if (!doc.RowFiltered(first, tab, undefined, end))
      doc.ShowRows(first, Math.min(end[0], last), tab, show);
    first = end[0] + 1;
  } while (first <= last);
}
/** Restricts only an exact whole-sheet simple mark, preserving the source ignored clipping result. @param marks - Copied view marks. @param doc - Actual document. @returns Nothing. */
function ShrinkToDataArea(marks: ScMarkData, doc: ScDocument): void {
  if (!marks.IsMarked()) return;
  if (marks.IsMultiMarked()) return;
  const area = marks.GetMarkArea();
  if (area.aStart.Row() !== 0 || area.aStart.Col() !== 0) return;
  if (area.aEnd.Row() !== doc.MaxRow() || area.aEnd.Col() !== doc.MaxCol()) return;
  if (area.aStart.Tab() !== area.aEnd.Tab()) return;
  const firstCol: [number] = [area.aStart.Col()],
    firstRow: [number] = [area.aStart.Row()],
    lastCol: [number] = [area.aEnd.Col()],
    lastRow: [number] = [area.aEnd.Row()];
  doc.ShrinkToDataArea(area.aStart.Tab(), firstCol, firstRow, lastCol, lastRow);
  area.aStart.SetCol(firstCol[0]);
  area.aStart.SetRow(firstRow[0]);
  area.aEnd.SetCol(lastCol[0]);
  area.aEnd.SetRow(lastRow[0]);
  marks.ResetMark();
  marks.SetMarkArea(area);
}
/** Queries the source default-sheet-view selection without changing actual view marks. @param view - Actual view data. @returns Borrowed native merged pattern. */
export function GetSelectionPattern(view: ScViewData): ScPatternAttr {
  const marks = new ScMarkData(view.GetMarkData()),
    doc = view.GetDocument();
  ShrinkToDataArea(marks, doc);
  if (!marks.IsMarked() && !marks.IsMultiMarked())
    marks.SetMarkArea(
      new ScRange(
        view.GetCurX(),
        view.GetCurY(),
        view.GetTabNumber(),
        view.GetCurX(),
        view.GetCurY(),
        view.GetTabNumber(),
      ),
    );
  return doc.GetSelectionPattern(marks);
}

/** Native view-function layer owns the cursor-versus-mark deletion decision. */
export class ScViewFunc extends ScTabView {
  /** Borrows actual source view/document owners. @param data - View. @param shell - Document shell. @returns View functions. */
  constructor(
    private readonly data: ScViewData,
    private readonly shell: ScDocShell,
  ) {
    super(data);
  }
  /** Original indentation works on copied marks with filtered rows removed. @param increment - Direction. @returns Operation result. */
  ChangeIndent(increment: boolean): boolean {
    const marks = new ScMarkData(this.data.GetMarkData());
    ScViewUtil.UnmarkFiltered(marks, this.data.GetDocument());
    marks.MarkToMulti();
    if (!marks.IsMultiMarked())
      marks.SetMultiMarkArea(
        new ScRange(
          new ScAddress(this.data.GetCurX(), this.data.GetCurY(), this.data.GetTabNumber()),
        ),
      );
    return this.shell.GetDocFunc().ChangeIndent(marks, increment, false);
  }
  /** Original marked width dispatch converts actual view marks to spans and back. @param width - Column axis. @param mode - Native size mode. @param twips - UInt16 size. @returns Nothing. */
  SetMarkedWidthOrHeight(width: boolean, mode: ScSizeMode, twips: number): void {
    const marks = this.data.GetMarkData();
    marks.MarkToMulti();
    if (!marks.IsMultiMarked())
      marks.SetMultiMarkArea(
        new ScRange(
          new ScAddress(this.data.GetCurX(), this.data.GetCurY(), this.data.GetTabNumber()),
        ),
      );
    this.SetWidthOrHeight(
      width,
      width ? marks.GetMarkedColSpans() : marks.GetMarkedRowSpans(),
      mode,
      twips,
    );
    marks.MarkToSimple();
  }
  /** Original explicit row/column geometry; device-dependent optimal sizing remains unported. @param width - Column axis. @param ranges - Inclusive source spans. @param mode - DIRECT,SHOW or ORIGINAL. @param twips - UInt16 size. @param record - Record actual geometry document. @param suppliedMarks - Original redo marks. @returns Nothing. */
  SetWidthOrHeight(
    width: boolean,
    ranges: readonly ColRowSpan[],
    mode: ScSizeMode,
    twips: number,
    record = true,
    suppliedMarks?: ScMarkData,
  ): void {
    if (ranges.length === 0) return;
    if (
      mode !== ScSizeMode.SC_SIZE_DIRECT &&
      mode !== ScSizeMode.SC_SIZE_SHOW &&
      mode !== ScSizeMode.SC_SIZE_ORIGINAL
    )
      throw new Error("Only explicit geometry is implemented");
    const marks = new ScMarkData(suppliedMarks ?? this.data.GetMarkData()),
      doc = this.shell.GetDocument(),
      first = (ranges[0] as ColRowSpan).mnStart,
      last = (ranges[ranges.length - 1] as ColRowSpan).mnEnd,
      currentTab = this.data.GetTabNumber();
    twips &= 0xffff;
    let undo: ScDocument | undefined;
    if (record) {
      undo = new ScDocument();
      const name = new OUString();
      for (let tab = 0; tab < doc.GetTableCount(); tab++) {
        doc.GetName(tab, name);
        undo.InsertTab(tab, name);
      }
      name.dispose();
      for (const tab of marks.GetSelectedTabs())
        doc.CopyToDocument(
          width
            ? new ScRange(first, 0, tab, last, doc.MaxRow(), tab)
            : new ScRange(0, first, tab, doc.MaxCol(), last, tab),
          InsertDeleteFlags.NONE,
          false,
          undo,
        );
    }
    const show = twips > 0 || mode !== ScSizeMode.SC_SIZE_DIRECT;
    let hiddenCursor = false;
    for (const tab of marks.GetSelectedTabs())
      for (const range of ranges) {
        if (width) {
          for (let column = range.mnStart; column <= range.mnEnd; column++) {
            if (twips) doc.SetColWidth(column, tab, twips);
            doc.ShowCol(column, tab, show);
            if (!show && column === this.data.GetCurX() && tab === currentTab) hiddenCursor = true;
          }
        } else if (mode === ScSizeMode.SC_SIZE_DIRECT) {
          if (twips) {
            doc.SetRowHeightRange(range.mnStart, range.mnEnd, tab, twips);
            doc.SetManualHeight(range.mnStart, range.mnEnd, tab, true);
          }
          ShowFilteredRows(doc, tab, range.mnStart, range.mnEnd, twips !== 0);
          if (
            !show &&
            range.mnStart <= this.data.GetCurY() &&
            this.data.GetCurY() <= range.mnEnd &&
            tab === currentTab
          )
            hiddenCursor = true;
        } else if (mode === ScSizeMode.SC_SIZE_SHOW)
          doc.ShowRows(range.mnStart, range.mnEnd, tab, true);
      }
    if (undo)
      this.shell
        .GetUndoManager()
        .AddUndoAction(
          new ScUndoWidthOrHeight(
            this.shell,
            marks,
            first,
            last,
            currentTab,
            undo,
            width,
            ranges,
            mode,
            twips,
            this,
          ),
        );
    if (hiddenCursor) {
      if (width) {
        const old = this.data.GetCurX();
        this.data.SetCurX(this.SkipCursorHorizontal(Math.min(old + 1, doc.MaxCol()), old, 1));
      } else {
        const old = this.data.GetCurY();
        this.data.SetCurY(this.SkipCursorVertical(Math.min(old + 1, doc.MaxRow()), old, 1));
      }
    }
    this.shell.SetDocumentModified();
  }
  /** Original plain-cell DeleteContents chooses DeleteCell for an unmarked cursor and DeleteContents for marked selections. @param flags - HARDATTR|EDITATTR for native Clear. @returns Operation result. */
  DeleteContents(flags: InsertDeleteFlags): boolean {
    const marks = new ScMarkData(this.data.GetMarkData()),
      docFunc = this.shell.GetDocFunc();
    if (!marks.IsMarked() && !marks.IsMultiMarked())
      return docFunc.DeleteCell(
        new ScAddress(this.data.GetCurX(), this.data.GetCurY(), this.data.GetTabNumber()),
        marks,
        flags,
        true,
        false,
      );
    return docFunc.DeleteContents(marks, flags, true, false);
  }
}
