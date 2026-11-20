/** @fileoverview Consumed ScDocFunc attribute-only delete operation dispatch;other native document operations remain with their existing owners. */
import { Color } from "../../../../tools/inc/color";
import { ScUndoTabColor, type ScUndoTabColorInfo } from "../undo/undotab";
import { SetFormulaOperation } from "../operation/SetFormulaOperation";
import type { ScFormulaCell } from "../../../inc/formulacell";
import { RowHeightContext } from "../../../inc/rowheightcontext";
import type { ScRange } from "../../../inc/address";
import { ChangeIndentOperation } from "../operation/ChangeIndentOperation";
import type { ScDocShell } from "./docsh";
import type { ScMarkData } from "../../../inc/markdata";
import type { ScAddress } from "../../../inc/address";
import { InsertDeleteFlags } from "../../../inc/global";
import { DeleteContentOperation } from "../operation/DeleteContentOperation";
import { DeleteCellOperation } from "../operation/DeleteCellOperation";
/** Native document-function owner delegates to concrete original operation classes. */
export class ScDocFunc {
  /** Borrows the actual shell. @param shell - Document owner. @returns Function owner. */
  constructor(private readonly shell: ScDocShell) {}
  /** Changes one sheet color with the native undo and API flags. @param tab - Sheet. @param color - Native color. @param record - Record history. @param api - Suppress interactive error. @returns Success. */
  SetTabBgColor(tab: number, color: Readonly<Color>, record: boolean, api: boolean): boolean;
  /** Changes a group of sheet colors as one history action. @param colors - Requested colors by tab. @param api - Suppress interactive error. @returns Success. */
  SetTabBgColor(
    colors: readonly { tab: number; newColor: Readonly<Color> }[],
    api: boolean,
  ): boolean;
  /** Dispatches the native single-sheet and grouped color operations. @param target - Sheet or group. @param value - Color or group API flag. @param record - Single-sheet recording flag. @param api - Single-sheet API flag. @returns Success. */
  SetTabBgColor(
    target: number | readonly { tab: number; newColor: Readonly<Color> }[],
    value: Readonly<Color> | boolean,
    record = true,
    api = false,
  ): boolean {
    const doc = this.shell.GetDocument();
    const colors =
      typeof target === "number" ? [{ tab: target, newColor: value as Readonly<Color> }] : target;
    const changes: ScUndoTabColorInfo[] = [];
    for (const { tab, newColor } of colors) {
      if (doc.IsTabProtected(tab)) continue;
      const oldColor = doc.GetTabBgColor(tab);
      doc.SetTabBgColor(tab, newColor);
      if (!doc.GetTabBgColor(tab).equals(newColor)) return false;
      changes.push({ tab, oldColor, newColor: new Color(newColor) });
    }
    if (changes.length === 0) {
      if (!(typeof value === "boolean" ? value : api))
        this.shell.ErrorMessage("Protected cells can not be modified.");
      return false;
    }
    if (record) this.shell.GetUndoManager().AddUndoAction(new ScUndoTabColor(changes));
    this.shell.SetDocumentModified();
    return true;
  }
  /** Original formula dispatch consumes the prepared cell through its concrete operation. @param position - Cell position. @param cell - Transferred formula. @param interaction - User interaction. @returns Success. */
  SetFormulaCell(position: ScAddress, cell: ScFormulaCell, interaction: boolean): boolean {
    return new SetFormulaOperation(this, this.shell, position, cell, !interaction).run();
  }
  /** Original default document/sheet height path with current browser96CSSdpi context;unrepresented import locks,device layout and painting remain outside this slice. @param range - Affected rows. @param paint - Native repaint request,projected by existing React invalidation. @param api - Source shrink policy. @returns Changed. */
  AdjustRowHeight(range: ScRange, paint: boolean, api: boolean): boolean {
    void paint;
    const doc = this.shell.GetDocument(),
      context = new RowHeightContext(doc.MaxRow(), 1 / 15, 1 / 15, 1, 1, null);
    return (
      doc
        .FetchTable(range.aStart.Tab())
        ?.SetOptimalHeight(context, range.aStart.Row(), range.aEnd.Row(), api) ?? false
    );
  }
  /** Original indent operation dispatch. @param marks - Native marks. @param increment - Direction. @param api - API. @returns Result. */
  ChangeIndent(marks: ScMarkData, increment: boolean, api: boolean): boolean {
    return new ChangeIndentOperation(this.shell, marks, increment, api).run();
  }
  /** Original marked DeleteContents operation dispatch. @param marks - Selected marks. @param flags - Attribute-only flags. @param record - Record history. @param api - API request. @returns Actual result. */
  DeleteContents(
    marks: ScMarkData,
    flags: InsertDeleteFlags,
    record: boolean,
    api: boolean,
  ): boolean {
    return new DeleteContentOperation(this.shell, marks, flags, record, api).run();
  }
  /** Original cursor DeleteCell operation dispatch. @param position - Cursor. @param marks - Selected sheets. @param flags - Attribute-only flags. @param record - Record history. @param api - API request. @returns Actual result. */
  DeleteCell(
    position: ScAddress,
    marks: ScMarkData,
    flags: InsertDeleteFlags,
    record: boolean,
    api: boolean,
  ): boolean {
    return new DeleteCellOperation(this.shell, position, marks, flags, record, api).run();
  }
}
