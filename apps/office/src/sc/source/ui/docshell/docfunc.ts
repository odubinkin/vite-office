/** @fileoverview Consumed ScDocFunc attribute-only delete operation dispatch;other native document operations remain with their existing owners. */
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
