/** @fileoverview Native Define Label Range modeless child workflow. */
import { SfxDialogController } from "../../../sfx2/source/dialog/basedlgs";
import { CompileColRowNameFormula } from "../../source/core/data/documen4";
import { ScColRowNameRangesDlg } from "../../source/ui/miscdlgs/crnrdlg";
import type { CalcViewController } from "../controller/calc-view-controller";

/** Opens and commits the original cloned label range lists. */
export class CalcLabelRangeWorkflow {
  readonly dialogs = new SfxDialogController<ScColRowNameRangesDlg, boolean>();

  /** Associates the request with the active Calc view. @param controller - Real view. @returns Workflow. */
  constructor(private readonly controller: CalcViewController) {}

  /** Runs the original modeless command or toggles its child window closed. @returns Whether handled. */
  async Execute(): Promise<boolean> {
    if (this.dialogs.GetSnapshot()) return this.Close();
    if (!this.controller.Commit()) return false;
    const model = new ScColRowNameRangesDlg(this.controller.viewData);
    const response = await this.dialogs.Request(model);
    const shell = this.controller.shell;
    if (response.kind === "accepted" && response.result && shell.GetDocument() === model.document) {
      model.document.GetColNameRanges().assign(model.columns);
      model.document.GetRowNameRanges().assign(model.rows);
      CompileColRowNameFormula(model.document);
      shell.SetDocumentModified();
      this.controller.SyncSheetView();
    }
    return true;
  }

  /** Closes only the active label range dialog. @returns Whether it was open. */
  Close(): boolean {
    const shown = this.dialogs.GetSnapshot();
    return shown ? this.dialogs.Cancel(shown.id) : false;
  }
}
