/** @fileoverview Existing browser cell commit definition partitioned onto the same controller;native cell/history owners remain unchanged. */
import type { CalcViewController } from "./calc-view-controller";
import { ScInputMode } from "../../inc/global";
import { ScAddress } from "../../inc/address";
import { ScCellValue } from "../../inc/cellvalue";
import { ScUndoSetCell } from "../../source/ui/undo/undocell";
import { parseCellInput, prepareCell, captureCell } from "../editor/cell-input";
/** Commits actual scalar/formula input atomically through existing cell and history owners. @param this - Actual controller. @returns Accepted. */
export function Commit(this: CalcViewController): boolean {
  if (this.mode === ScInputMode.SC_INPUT_NONE) return true;
  this.shell.EnsureOpen();
  try {
    if (this.inputHandler.IsModified()) {
      const doc = this.shell.GetDocument(),
        pos = this.Position(),
        content = parseCellInput(this.inputText),
        manager = this.shell.GetUndoManager();
      const prepared: { position: ScAddress; value: ScCellValue }[] = [];
      try {
        for (const tab of this.viewData.GetMarkData().GetSelectedTabs()) {
          const position = new ScAddress(pos.Col(), pos.Row(), tab);
          prepared.push({ position, value: prepareCell(doc, position, content) });
        }
        manager.EnterListAction("Input");
        try {
          for (const { position, value } of prepared) {
            const before = captureCell(doc, position);
            value.release(doc, position);
            manager.AddUndoAction(
              new ScUndoSetCell(this.shell, position, before, captureCell(doc, position)),
            );
          }
        } finally {
          manager.LeaveListAction();
        }
      } finally {
        for (const { value } of prepared) value.clear();
      }
      this.shell.SetDocumentModified();
    }
    this.inputHandler.SetMode(ScInputMode.SC_INPUT_NONE);
    this.inputHandler.ResetInputState();
    this.viewData.SetRefMode(false, 0);
    this.inputText = "";
    this.error = "";
    this["Changed"]();
    return true;
  } catch (error) {
    this.error = (error as Error).message;
    this["Changed"]();
    return false;
  }
}
