/** @fileoverview Calc contribution to the native OptionsTreeDialog command. */
import { SfxDialogController } from "../../../sfx2/source/dialog/basedlgs";
import { SfxInterface } from "../../../sfx2/source/control/objface";
import { createSfxShell, type SfxShell } from "../../../sfx2/source/control/shell";
import { ScTpCalcOptions } from "../../source/ui/optdlg/tpcalc";
import { ScTpFormulaOptions } from "../../source/ui/optdlg/tpformula";
import { ScTpContentOptions } from "../../source/ui/optdlg/tpview";
import type { CalcViewController } from "../controller/calc-view-controller";

/** Native page drafts scoped to one Options request. */
interface ScOptionsRequest {
  readonly view: ScTpContentOptions;
  readonly calculate: ScTpCalcOptions;
  readonly formula: ScTpFormulaOptions;
}

/** Runs the source options slot against the active document. */
export class CalcOptionsWorkflow {
  readonly dialogs = new SfxDialogController<ScOptionsRequest, boolean>();
  private readonly shell = createSfxShell(
    this,
    new SfxInterface<CalcOptionsWorkflow>([
      {
        commandUrl: ".uno:OptionsTreeDialog",
        slotId: 31630,
        label: "Options",
        shortcuts: ["Alt+F12"],
        getState:
          /** Checks whether the session permits opening Calc Options. @param target - Active Calc slot target. @returns Command state. */ (
            target,
          ) => ({ enabled: target.canOpen() }),
        execute:
          /** Opens Calc Options when the slot was dispatched without arguments. @param target - Active Calc slot target. @param request - Original Sfx slot request. @returns Dispatch result. */ (
            target,
            request,
          ) => !request.GetArgs().length && target.Execute(),
      },
    ]),
  );

  /** Connects the source slot to the view's dialog guard. @param controller - Active view. @param canOpen - Whether the view is available. @returns Workflow. */
  constructor(
    private readonly controller: CalcViewController,
    private readonly canOpen: () => boolean,
  ) {}

  /** Returns the source command shell for registration with the frame. @returns Shell. */
  GetShell(): SfxShell {
    return this.shell;
  }

  /** Cancels an open options request. @returns Nothing. */
  Close(): void {
    const active = this.dialogs.GetSnapshot();
    if (active) this.dialogs.Cancel(active.id);
  }

  /** Collects the page items and applies the source document options. @returns Whether handled. */
  private async Execute(): Promise<boolean> {
    if (!this.canOpen() || !this.controller.Commit()) return false;
    const { shell } = this.controller;
    const doc = shell.GetDocument();
    const view = new ScTpContentOptions(this.controller.viewData.GetOptions());
    const calculate = new ScTpCalcOptions(doc.GetDocOptions());
    const formula = new ScTpFormulaOptions(
      doc.GetGrammar(),
      doc.GetCalcConfig(),
      doc.GetDocOptions().IsWriteCalcConfig(),
    );
    try {
      const response = await this.dialogs.Request({ view, calculate, formula });
      if (response.kind !== "accepted" || !response.result || shell.GetDocument() !== doc)
        return true;
      const viewChanged = this.controller.scModule.ModifyViewOptions(
        shell,
        this.controller.viewData,
        view.FillItemSet(),
      );
      const calculationChanged = this.controller.scModule.ModifyOptions(
        shell,
        calculate.FillItemSet(),
        formula.GetChangedGrammar(),
        formula.GetChangedConfig(),
        formula.GetChangedWriteConfig(),
      );
      if (viewChanged || calculationChanged) this.controller.SyncSheetView();
      return true;
    } finally {
      formula.Dispose();
    }
  }
}
