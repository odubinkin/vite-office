/** @fileoverview Browser caret/draft binding for original input reference contracts;no cell data or formula evaluator is retained here. */
import type { CalcViewController } from "./calc-view-controller";
import { ESelection } from "../../../editeng/inc/ESelection";
import { ScRange, ScAddress } from "../../inc/address";
import { ScRefType } from "../../source/ui/inc/viewdata";
/** Borrows the controller's sole draft and native UTF16 selection for the active browser edit view. @param this - Actual controller. @returns Nothing. */
export function BindReferenceInput(this: CalcViewController): void {
  this.inputHandler.BindReferenceInput(
    {
      /** Reads the sole actual editor draft. @returns Draft. */ GetText: () => this.inputText,
      /** Copies native selection endpoints. @returns Selection. */ GetSelection: () =>
        new ESelection(0, this.inputSelection[0], 0, this.inputSelection[1]),
      /** Retains actual UTF16 selection without creating another editor model. @param selection - Native selection. @returns Nothing. */ SetSelection:
        (selection) => {
          this.inputSelection = [selection.start.nIndex, selection.end.nIndex];
        },
      /** Performs actual controlled input replacement. @param text - Inserted UTF16 text. @param select - Select inserted reference. @returns Nothing. */ InsertText:
        (text, select) => {
          const selection = new ESelection(0, this.inputSelection[0], 0, this.inputSelection[1]);
          selection.Adjust();
          const start = selection.start.nIndex,
            end = selection.end.nIndex;
          this.inputText = this.inputText.slice(0, start) + text + this.inputText.slice(end);
          this.inputSelection = [select ? start : start + text.length, start + text.length];
        },
    },
    this.Position(),
    this["viewShell"],
  );
}
/** Routes formula pointing before ordinary cursor selection/Commit. @param this - Actual controller. @param position - Pointed cell. @param extend - Extend existing reference anchor. @param append - Add native argument separator. @returns Whether formula reference mode consumed the pointer. */
export function PointReference(
  this: CalcViewController,
  position: ScAddress,
  extend: boolean,
  append: boolean,
): boolean {
  if (!this.inputHandler.IsFormulaMode()) return false;
  const view = this["viewShell"],
    data = this.viewData;
  if (extend && data.IsRefMode()) view.UpdateRef(position.Col(), position.Row(), position.Tab());
  else {
    view.DoneRefMode();
    if (append) this.scModule.AddRefEntry();
    view.InitRefMode(position.Col(), position.Row(), position.Tab(), ScRefType.SC_REFTYPE_REF);
  }
  this["Changed"]();
  return true;
}
/** Updates an active mouse reference without moving or committing the edit origin. @param this - Actual controller. @param position - Pointed endpoint. @returns Nothing. */
export function DragReference(this: CalcViewController, position: ScAddress): void {
  this["viewShell"].UpdateRef(position.Col(), position.Row(), position.Tab());
  this["Changed"]();
}
/** Copies the actual ordered native reference rectangle for overlay painting. @param this - Actual controller. @returns Reference or null. */
export function ReferenceRange(this: CalcViewController): ScRange | null {
  if (!this.inputHandler.IsFormulaMode() || !this.viewData.IsRefMode()) return null;
  const data = this.viewData,
    range = new ScRange(
      data.GetRefStartX(),
      data.GetRefStartY(),
      data.GetRefStartZ(),
      data.GetRefEndX(),
      data.GetRefEndY(),
      data.GetRefEndZ(),
    );
  range.PutInOrder();
  return range;
}

/** Native TYPE reference-cursor motion uses ref end separately from the actual editing cell;TABLE/TOP arrows remain DOM caret input. @param this - Actual controller. @param dx - Column movement. @param dy - Row movement. @param extend - Shift extends the reference anchor. @returns Nothing. */
export function NavigateReference(
  this: CalcViewController,
  dx: number,
  dy: number,
  extend: boolean,
): void {
  const data = this.viewData,
    doc = data.GetDocument(),
    view = this["viewShell"],
    active = data.IsRefMode();
  const oldCol = active ? data.GetRefEndX() : data.GetCurX(),
    oldRow = active ? data.GetRefEndY() : data.GetCurY();
  if ((dx < 0 && oldCol === 0 && dy === 0) || (dy < 0 && oldRow === 0 && dx === 0)) return;
  const proposedCol = oldCol + dx,
    proposedRow = oldRow + dy,
    valid = doc.ValidCol(proposedCol) && doc.ValidRow(proposedRow);
  const col =
    valid && dx
      ? view.SkipCursorHorizontal(proposedCol, oldCol, dx)
      : Math.max(0, Math.min(doc.MaxCol(), proposedCol));
  const row =
    valid && dy
      ? view.SkipCursorVertical(proposedRow, oldRow, dy)
      : Math.max(0, Math.min(doc.MaxRow(), proposedRow));
  this.PointReference(new ScAddress(col, row, data.GetTabNumber()), extend, false);
}
