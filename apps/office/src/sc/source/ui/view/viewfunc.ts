/** @fileoverview Consumed ScViewFunc selection-pattern query and source whole-sheet data-area clipping. Filtered cells and alternate sheet views remain unported. */
import { ScTabView } from "./tabview3";
import type { ScDocShell } from "../docshell/docsh";
import { InsertDeleteFlags } from "../../../inc/global";
import type { ScDocument } from "../../../inc/document";
import type { ScPatternAttr } from "../../../inc/patattr";
import { ScMarkData } from "../../../inc/markdata";
import { ScRange, ScAddress } from "../../../inc/address";
import type { ScViewData } from "../inc/viewdata";
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
