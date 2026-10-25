/** @fileoverview Browser pointer admission over actual native cell/header function sets and reference input;only transient gesture identity lives here. */
import type { CalcViewController } from "./calc-view-controller";
import { ScAddress, ScRange } from "../../inc/address";
/** Actual browser pointer surface identity. */
export type CalcPointerKind = "cell" | "column" | "row";
/** Starts source-native selection/reference input from already hit-tested browser coordinates. @param this - Actual controller. @param position - Native cell. @param extend - Actual Shift modifier. @param append - Actual Ctrl/Cmd modifier. @param kind - Pointer surface. @returns Admitted. */
export function StartPointer(
  this: CalcViewController,
  position: ScAddress,
  extend: boolean,
  append: boolean,
  kind: CalcPointerKind,
): boolean {
  const view = this["viewShell"],
    data = this.viewData,
    doc = data.GetDocument(),
    marks = data.GetMarkData();
  if (this.inputHandler.IsFormulaMode()) {
    const first = new ScAddress(
      kind === "row" ? 0 : position.Col(),
      kind === "column" ? 0 : position.Row(),
      position.Tab(),
    );
    this.PointReference(first, extend, append);
    if (kind !== "cell")
      this.DragReference(
        new ScAddress(
          kind === "row" ? doc.MaxCol() : position.Col(),
          kind === "column" ? doc.MaxRow() : position.Row(),
          position.Tab(),
        ),
      );
  } else {
    if (!this.Commit()) return false;
    // Existing keyboard/command marks are adopted by the original Own block state.
    if (!view.IsBlockMode() && (marks.IsMarked() || marks.IsMultiMarked())) {
      const range = new ScRange();
      marks.GetSelectionCover(range);
      view.InitOwnBlockMode(range);
    }
    if (kind !== "cell") marks.SetMarking(true);
    view.WithSelectionMouseModifiers(
      kind === "cell" && extend,
      kind === "cell" && append,
      /** Dispatches actual mouse modifiers through original native anchor/block owners. @returns Nothing. */ () => {
        if (kind === "cell") {
          const functions = view.GetFunctionSet();
          if (append && !extend) functions.DestroyAnchor();
          else if (!extend) functions.DeselectAll();
          if (extend) functions.CreateAnchor();
          functions.SetCursorAtCell(position.Col(), position.Row(), false);
          if (!extend) this["anchor"] = new ScAddress(this.Position());
        } else {
          const functions = view.GetHeaderFunctionSet();
          functions.SetColumn(kind === "column");
          if (append && !extend) functions.DestroyAnchor();
          else if (!extend) functions.DeselectAll();
          if (extend) functions.CreateAnchor();
          functions.SetCursorAtCell(
            kind === "row" ? this.viewport.firstColumn : position.Col(),
            kind === "column" ? this.viewport.firstRow : position.Row(),
          );
        }
      },
    );
    if (kind === "cell") marks.SetMarking(true);
    this.addressText = this.Address();
    this.error = "";
    this["Changed"]();
  }
  this["pointerKind"] = kind;
  return true;
}
/** Updates the actual native endpoint with no cell writes or per-browser selection model. @param this - Actual controller. @param position - Native endpoint. @returns Nothing. */
export function MovePointer(this: CalcViewController, position: ScAddress): void {
  const kind = this["pointerKind"];
  if (!kind) return;
  if (this.inputHandler.IsFormulaMode())
    this.DragReference(
      new ScAddress(
        kind === "row" ? this.shell.GetDocument().MaxCol() : position.Col(),
        kind === "column" ? this.shell.GetDocument().MaxRow() : position.Row(),
        position.Tab(),
      ),
    );
  else {
    const view = this["viewShell"];
    if (kind === "cell") {
      view.GetFunctionSet().CreateAnchor();
      view.GetFunctionSet().SetCursorAtCell(position.Col(), position.Row(), false);
    } else
      view
        .GetHeaderFunctionSet()
        .SetCursorAtCell(
          kind === "row" ? this.viewport.firstColumn : position.Col(),
          kind === "column" ? this.viewport.firstRow : position.Row(),
        );
    this.addressText = this.Address();
    this["Changed"]();
  }
}
/** Ends browser tracking while preserving source anchors for subsequent Shift selection;negative rectangles are committed through native multi-mark conversion. @param this - Actual controller. @returns Nothing. */
export function EndPointer(this: CalcViewController): void {
  const mark = this.viewData.GetMarkData();
  mark.SetMarking(false);
  if (this["pointerKind"] && !this.inputHandler.IsFormulaMode()) mark.MarkToSimple();
  this["pointerKind"] = null;
  this.viewData.SetSelCtrlMouseClick(false);
  this["Changed"]();
}
