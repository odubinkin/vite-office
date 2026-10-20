/** @fileoverview Consumed ScDocFunc attribute-only delete operation dispatch;other native document operations remain with their existing owners. */
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
