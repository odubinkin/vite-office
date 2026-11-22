/** @fileoverview Reconciles browser view and selection after native Calc history is applied. */
import type { CalcViewController } from "./calc-view-controller";
import { ScInputMode } from "../../inc/global";
import { ScAddress } from "../../inc/address";
import { SfxListUndoAction } from "../../../svl/source/undo/undo";
import { PositionText } from "./calc-name-box";
import { ScUndoModifyStyle } from "../../source/ui/undo/undostyl";
import { UndoFormulaToValue } from "../../source/ui/undo/undoconvert";
import { ScUndoOutline } from "../../source/ui/undo/undodat";
import { ScUndoShowHideTab, ScUndoTabColor, ScUndoPrintRange } from "../../source/ui/undo/undotab";
import { ScUndoAddRangeData, ScUndoAllRangeNames } from "../../source/ui/undo/undorangename";
import { ScUndoIndent, ScUndoRemoveMerge } from "../../source/ui/undo/undoblk";
import { ScUndoWidthOrHeight } from "../../source/ui/undo/undoblk2";
import { ScUndoCursorAttr, ScUndoPageBreak, ScUndoRangeNames } from "../../source/ui/undo/undocell";
import {
  ScUndoSelectionAttr,
  ScUndoDeleteContents,
  ScUndoMerge,
} from "../../source/ui/undo/undoblk3";
import { ScUndoSetCell } from "../../source/ui/inc/undocell";

/** Reconciles source model,active sheet and input after history. @param this - Browser view owner. @param redo - Direction. @returns Changed. */
export function History(this: CalcViewController, redo: boolean): boolean {
  const manager = this.shell.GetUndoManager(),
    action = redo ? manager.GetRedoAction() : manager.GetUndoAction();
  if (!(redo ? this.shell.Redo() : this.shell.Undo())) return false;
  this.inputHandler.SetMode(ScInputMode.SC_INPUT_NONE);
  this.inputHandler.ResetInputState();
  let cursorAction = action;
  while (cursorAction instanceof SfxListUndoAction)
    cursorAction = cursorAction.GetUndoAction(redo ? cursorAction.GetActionCount() - 1 : 0);
  if (cursorAction instanceof ScUndoOutline) cursorAction.RestoreView(this.GetViewShell(), redo);
  if (cursorAction instanceof UndoFormulaToValue) cursorAction.RestoreView(this.GetViewShell());
  if (cursorAction instanceof ScUndoMerge || cursorAction instanceof ScUndoRemoveMerge) {
    const tab = this.viewData.GetTabNumber();
    const { aStart } = cursorAction.getAffectedRange(tab);
    this.SelectTab(aStart.Tab());
    if (cursorAction instanceof ScUndoMerge) {
      this.Select(aStart.Col(), aStart.Row());
      this.viewData.GetMarkData().assign(cursorAction.GetMarkData(tab));
    }
    this.SyncSheetView();
    return true;
  }
  if (
    cursorAction instanceof ScUndoWidthOrHeight ||
    cursorAction instanceof ScUndoShowHideTab ||
    cursorAction instanceof ScUndoTabColor ||
    cursorAction instanceof ScUndoPrintRange ||
    cursorAction instanceof ScUndoModifyStyle ||
    cursorAction instanceof ScUndoRangeNames ||
    cursorAction instanceof ScUndoAddRangeData ||
    cursorAction instanceof ScUndoAllRangeNames ||
    cursorAction instanceof ScUndoOutline ||
    cursorAction instanceof UndoFormulaToValue
  ) {
    if (cursorAction instanceof ScUndoWidthOrHeight) {
      this["addressText"] = PositionText.call(this);
      this["Changed"]();
    } else this.SyncSheetView();
    return true;
  }
  const position =
    cursorAction instanceof ScUndoSetCell ||
    cursorAction instanceof ScUndoCursorAttr ||
    cursorAction instanceof ScUndoPageBreak ||
    cursorAction instanceof ScUndoIndent ||
    cursorAction instanceof ScUndoSelectionAttr ||
    cursorAction instanceof ScUndoDeleteContents
      ? cursorAction.getAffectedRange().aStart
      : new ScAddress(
          0,
          0,
          Math.min(this.viewData.GetTabNumber(), this.shell.GetDocument().GetTableCount() - 1),
        );
  this.SelectTab(position.Tab());
  this.Select(position.Col(), position.Row());
  if (
    cursorAction instanceof ScUndoIndent ||
    cursorAction instanceof ScUndoSelectionAttr ||
    cursorAction instanceof ScUndoDeleteContents
  ) {
    this.viewData.GetMarkData().assign(cursorAction.GetMarkData());
    this["Changed"]();
  }
  return true;
}
