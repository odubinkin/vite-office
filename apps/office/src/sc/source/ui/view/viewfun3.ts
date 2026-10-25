/** @fileoverview Native PasteFromClip default-content copy orchestration for active normal sheets with unfiltered single clipboard ranges and enabled Undo. Nondefault paste,cut,matrix/drawing/database/window and multi-range service families remain explicit boundaries. */
import type { ScViewFunc } from "./viewfunc";
import { ScDocument, ScDocumentMode } from "../../../inc/document";
import { ScMarkData } from "../../../inc/markdata";
import { ScRange } from "../../../inc/address";
import { ScRangeList } from "../../../inc/rangelst";
import { InsertDeleteFlags as F, ScPasteFunc, InsCellCmd } from "../../../inc/global";
import { scPasteResourcesEnglish as R } from "../../../inc/globstr";
import { ScMarkType } from "../inc/viewdata";
import { ScViewUtil } from "./viewutil";
import { ScEditableTester } from "../inc/editable";
import { ScUndoPaste, ScUndoPasteOptions } from "../undo/undoblk";
import { AdjustBlockHeight } from "./viewfun2";
/** Original default-content PasteFromClip through real marks,clipboard,snapshots and history. Enabled Undo and the active normal view are current construction invariants;no fake native service supplies those defaults. Physical paint/OLE/UNO publication is projected by the shell's browser notification. @param this - Actual view. @param flags - Native paste flags. @param clip - Actual clipboard or null. @param operation - Native defaultNONE. @param skipEmpty - Native defaultfalse. @param transpose - Native defaultfalse. @param asLink - Native defaultfalse. @param move - Native defaultINS_NONE. @param undoExtra - Native defaultNONE. @param allowDialogs - Native defaultfalse. @returns Whether pasted. */
export function PasteFromClip(
  this: ScViewFunc,
  flags: F,
  clip: ScDocument | null,
  operation = ScPasteFunc.NONE,
  skipEmpty = false,
  transpose = false,
  asLink = false,
  move = InsCellCmd.INS_NONE,
  undoExtra = F.NONE,
  allowDialogs = false,
): boolean {
  if (!clip) return false;
  const data = this.GetViewData();
  if (data.SelectionForbidsPaste(clip)) return false;
  if (
    flags !== F.CONTENTS ||
    (undoExtra !== F.NONE && undoExtra !== F.ATTRIB) ||
    operation !== ScPasteFunc.NONE ||
    skipEmpty ||
    transpose ||
    asLink ||
    move !== InsCellCmd.INS_NONE ||
    allowDialogs
  )
    throw Error("Nondefault native paste services are not implemented");
  const content = (flags & F.CONTENTS) as F;
  // ATTRIB copying is outside this admitted path;undo-extra preserves the original destination pattern.
  const undoFlags = (content | (undoExtra & F.ATTRIB) | F.NOCAPTIONS) as F;
  const parameter = clip.GetClipParam(),
    marks = data.GetMarkData();
  if (parameter.isMultiRange() || marks.IsMultiMarked())
    throw Error("Native multi-range paste services are not implemented");
  if (!clip.IsClipboard() || parameter.mbCutMode)
    throw Error("Native paste requires a copy-mode clipboard in this slice");
  const clipX: [number] = [0],
    clipY: [number] = [0],
    destX: [number] = [0],
    destY: [number] = [0];
  clip.GetClipArea(clipX, clipY, true);
  clip.GetClipArea(destX, destY, false);
  if (clip.HasClipFilteredRows())
    throw Error("Native filtered-source unmerge services are not implemented");
  const doc = data.GetDocument(),
    shell = this["shell"],
    manager = shell.GetUndoManager();
  const markRange = new ScRange(),
    filteredMark = new ScMarkData(marks);
  const type = data.GetSimpleArea(markRange, filteredMark);
  // The prior multi-mark guard and actual GetSimpleArea implementation admit only SIMPLE/SIMPLE_FILTERED here.
  if (type === ScMarkType.SC_MARK_SIMPLE_FILTERED)
    throw Error("Native filtered destination mark services are not implemented");
  if (!marks.IsMarked()) {
    markRange.assign(
      new ScRange(
        data.GetCurX(),
        data.GetCurY(),
        data.CurrentTabForData(),
        data.GetCurX() + destX[0],
        data.GetCurY() + destY[0],
        data.CurrentTabForData(),
      ),
    );
    if (ScViewUtil.HasFiltered(markRange, doc))
      throw Error("Native filtered destination mark services are not implemented");
    filteredMark.SetMarkArea(markRange);
  } else {
    const range = filteredMark.GetMarkArea();
    if (range.aEnd.Col() - range.aStart.Col() < destX[0]) {
      range.aEnd.SetCol(range.aStart.Col() + destX[0]);
      filteredMark.SetMarkArea(range);
    }
  }
  const startCol = markRange.aStart.Col(),
    startRow = markRange.aStart.Row(),
    startTab = markRange.aStart.Tab();
  let endCol = markRange.aEnd.Col(),
    endRow = markRange.aEnd.Row();
  const endTab = markRange.aEnd.Tab(),
    extraX = endCol - startCol,
    extraY = endRow - startRow;
  if ((extraX !== 0 && extraX < destX[0]) || (extraY !== 0 && extraY < destY[0]))
    throw Error("Native larger-clipboard confirmation dialog is not implemented");
  if (extraX <= destX[0]) endCol = startCol + destX[0];
  if (extraY <= destY[0]) {
    endRow = startRow + destY[0];
    if (endRow > markRange.aEnd.Row()) {
      markRange.assign(new ScRange(startCol, startRow, startTab, endCol, endRow, endTab));
      if (ScViewUtil.HasFiltered(markRange, doc))
        throw Error("Native filtered destination mark services are not implemented");
      filteredMark.SetMarkArea(markRange);
    }
  }
  const user = new ScRange(startCol, startRow, startTab, endCol, endRow, endTab);
  const clipStartX: [number] = [0],
    clipStartY: [number] = [0];
  clip.GetClipStart(clipStartX, clipStartY);
  const undoEndCol: [number] = [clipStartX[0] + clipX[0]],
    undoEndRow: [number] = [clipStartY[0] + clipY[0]];
  let clipOver = false;
  for (let tab = 0; tab < clip.GetTableCount(); ++tab)
    if (clip.FetchTable(tab))
      clipOver =
        clip.ExtendMerge(clipStartX[0], clipStartY[0], undoEndCol, undoEndRow, tab) || clipOver;
  undoEndCol[0] += endCol - clipStartX[0] - clipX[0];
  undoEndRow[0] += endRow - clipStartY[0] - clipY[0];
  if (undoEndCol[0] > clip.MaxCol() || undoEndRow[0] > clip.MaxRow()) {
    this.ErrorMessage(R.STR_PASTE_FULL);
    return false;
  }
  doc.ExtendMergeSel(startCol, startRow, undoEndCol, undoEndRow, filteredMark);
  const tester = ScEditableTester.CreateAndTestBlock(
    doc,
    startTab,
    startCol,
    startRow,
    undoEndCol[0],
    undoEndRow[0],
  );
  if (!tester.IsEditable()) {
    this.ErrorMessage(tester.GetMessageId());
    return false;
  }
  if (clipOver) throw Error("Native merged-source overlap/unmerge services are not implemented");
  const colInfo = startRow === 0 && endRow === doc.MaxRow(),
    rowInfo = startCol === 0 && endCol === doc.MaxCol();
  const undo = new ScDocument(ScDocumentMode.SCDOCMODE_UNDO);
  let actionOwnsUndo = false;
  manager.EnterListAction("Copy");
  try {
    undo.InitUndoSelected(doc, filteredMark, colInfo, rowInfo);
    doc.CopyToDocument(
      startCol,
      startRow,
      0,
      undoEndCol[0],
      undoEndRow[0],
      doc.GetTableCount() - 1,
      undoFlags,
      false,
      undo,
    );
    this.DoneBlockMode();
    this.InitOwnBlockMode(user);
    marks.SetMarkArea(user);
    doc.CopyFromClip(user, filteredMark, flags, null, clip, true, false, false, false);
    const refreshedCol: [number] = [endCol],
      refreshedRow: [number] = [endRow];
    doc.ExtendMergeSel(startCol, startRow, refreshedCol, refreshedRow, filteredMark, true);
    AdjustBlockHeight(doc, marks, startRow, refreshedRow[0]);
    const options = new ScUndoPasteOptions();
    options.nFunction = operation;
    options.bSkipEmptyCells = skipEmpty;
    options.bTranspose = transpose;
    options.bAsLink = asLink;
    options.eMoveMode = move;
    const action = new ScUndoPaste(
      shell,
      new ScRangeList(
        new ScRange(startCol, startRow, startTab, undoEndCol[0], undoEndRow[0], endTab),
      ),
      filteredMark,
      undo,
      null,
      (flags | undoFlags) as F,
      null,
      false,
      options,
    );
    manager.AddUndoAction(action);
    actionOwnsUndo = true;
  } finally {
    if (!actionOwnsUndo) undo.Dispose();
    manager.LeaveListAction();
  }
  shell.SetDocumentModified();
  return true;
}
