/** @fileoverview Consumed native ScCellShell SID_CELL_FORMAT_RESET command over the actual view function owner. */
import { ScViewFunc } from "./viewfunc";
import { InsertDeleteFlags } from "../../../inc/global";
/** Native cell-shell command boundary;shared browser dispatch performs the existing Sfx slot admission. */
export class ScCellShell {
  /** Borrows actual native view functions. @param view - Source view owner. @returns Cell shell. */
  constructor(private readonly view: ScViewFunc) {}
  /** Original SID_CELL_FORMAT_RESET passes both HARDATTR and EDITATTR,without replacing values by pool defaults. @returns Operation result. */
  ResetAttributes(): boolean {
    return this.view.DeleteContents(InsertDeleteFlags.HARDATTR | InsertDeleteFlags.EDITATTR);
  }
}
