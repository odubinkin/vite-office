/** @fileoverview Native database shell's source-range contract for Text to Columns. */
import { ScRange } from "../../../inc/address";
import { ScDocument, ScDocumentMode } from "../../../inc/document";
import { InsertDeleteFlags } from "../../../inc/global";
import { ScMarkData } from "../../../inc/markdata";
import { ScRangeList } from "../../../inc/rangelst";
import type { SvStream } from "../../../../tools/source/stream/stream";
import type { ScDocShell } from "../docshell/docsh";
import type { ScImportExport } from "../docshell/impex";
import { ScEditableTester } from "../inc/editable";
import { ScUndoPaste } from "../undo/undoblk";
import { AdjustBlockHeight } from "./viewfun2";
import type { ScViewData } from "./viewdata";

/** Gets the source rectangle for the command state or the used rows for execution. @param view - Native view. @param range - Destination for the selected range. @param emptyCheckOnly - Whether this is the command-state query. @returns Whether the range is admitted. */
export function GetTextToColumnsRange(
  view: ScViewData,
  range: ScRange,
  emptyCheckOnly: boolean,
): boolean {
  const marks = view.GetMarkData();
  const doc = view.GetDocument();
  if (marks.IsMarked()) {
    if (marks.IsMultiMarked()) return false;
    range.assign(marks.GetMarkArea());
    if (range.aStart.Col() !== range.aEnd.Col()) return false;
  } else {
    const col = view.GetCurX(),
      row = view.GetCurY(),
      tab = view.CurrentTabForData();
    range.assign(new ScRange(col, row, tab, col, row, tab));
  }
  if (emptyCheckOnly)
    return !doc.IsBlockEmpty(
      range.aStart.Col(),
      range.aStart.Row(),
      range.aEnd.Col(),
      range.aEnd.Row(),
      range.aStart.Tab(),
    );

  range.PutInOrder();
  const startRow: [number] = [range.aStart.Row()];
  const endRow: [number] = [range.aEnd.Row()];
  const shrunk: [boolean] = [false];
  doc.ShrinkToUsedDataArea(
    shrunk,
    range.aStart.Tab(),
    [range.aStart.Col()],
    startRow,
    [range.aEnd.Col()],
    endRow,
    false,
    false,
    true,
  );
  if (shrunk[0]) {
    range.aStart.SetRow(startRow[0]);
    range.aEnd.SetRow(endRow[0]);
  }
  return true;
}

/** Imports the confirmed range with the undo grouping of the source database shell. @param shell - Active document shell. @param importer - Configured live importer. @param stream - Unchanged source text. @param range - Determined destination. @returns Whether the import ran. */
export function ImportTextToColumns(
  shell: ScDocShell,
  importer: ScImportExport,
  stream: SvStream,
  range: ScRange,
): boolean {
  const doc = shell.GetDocument();
  const { aStart, aEnd } = range;
  const tester = ScEditableTester.CreateAndTestBlock(
    doc,
    aStart.Tab(),
    aStart.Col(),
    aStart.Row(),
    aEnd.Col(),
    aEnd.Row(),
  );
  if (!tester.IsEditable()) {
    shell.ErrorMessage(tester.GetMessageId());
    return false;
  }
  const flags = (InsertDeleteFlags.CONTENTS |
    InsertDeleteFlags.ATTRIB |
    InsertDeleteFlags.NOCAPTIONS) as InsertDeleteFlags;
  /** Copies the represented state through the native Undo document. @returns Owned snapshot. */
  const snapshot =
    /** Copies the original selected cells to an undo document before text conversion. @returns Undo document for the affected range. */ (): ScDocument => {
      const state = new ScDocument(ScDocumentMode.SCDOCMODE_UNDO);
      try {
        state.InitUndo(doc, aStart.Tab(), aEnd.Tab());
        doc.CopyToDocument(range, flags, false, state);
        return state;
      } catch (error) {
        state.Dispose();
        throw error;
      }
    };
  const manager = shell.GetUndoManager();
  const before = snapshot();
  const marks = new ScMarkData(doc.GetSheetLimits());
  marks.SetMarkArea(range);
  const ranges = new ScRangeList(range);
  let ownBefore = true;
  manager.EnterListAction("Text to Columns");
  try {
    if (!importer.ImportStream(stream, range)) return false;
    AdjustBlockHeight(doc, marks, aStart.Row(), aEnd.Row());
    const after = snapshot();
    manager.AddUndoAction(new ScUndoPaste(shell, ranges, marks, before, after, flags, null, true));
    ownBefore = false;
  } catch (error) {
    const rollback = new ScUndoPaste(shell, ranges, marks, before, null, flags, null, true);
    ownBefore = false;
    try {
      rollback.Undo();
    } finally {
      rollback.Dispose();
    }
    throw error;
  } finally {
    manager.LeaveListAction();
    if (ownBefore) before.Dispose();
  }
  shell.SetDocumentModified();
  return true;
}
