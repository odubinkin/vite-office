/** @fileoverview Calc contribution to the native OptionsTreeDialog command. */
import { SfxDialogController } from "../../../sfx2/source/dialog/basedlgs";
import { SfxInterface } from "../../../sfx2/source/control/objface";
import { createSfxShell, type SfxShell } from "../../../sfx2/source/control/shell";
import { ScTpCalcOptions } from "../../source/ui/optdlg/tpcalc";
import { ScTpFormulaOptions } from "../../source/ui/optdlg/tpformula";
import type { CalcViewController } from "../controller/calc-view-controller";

/** Two native page drafts scoped to one Options request. */
interface ScOptionsRequest {
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
        getState: (target) => ({ enabled: target.canOpen() }),
        execute: (target, request) => !request.GetArgs().length && target.Execute(),
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
    const calculate = new ScTpCalcOptions(doc.GetDocOptions());
    const formula = new ScTpFormulaOptions(
      doc.GetGrammar(),
      doc.GetCalcConfig(),
      doc.GetDocOptions().IsWriteCalcConfig(),
    );
    try {
      const response = await this.dialogs.Request({ calculate, formula });
      if (response.kind !== "accepted" || !response.result || shell.GetDocument() !== doc)
        return true;
      if (
        this.controller.scModule.ModifyOptions(
          shell,
          calculate.FillItemSet(),
          formula.GetChangedGrammar(),
          formula.GetChangedConfig(),
          formula.GetChangedWriteConfig(),
        )
      )
        this.controller.SyncSheetView();
      return true;
    } finally {
      formula.Dispose();
    }
  }
}
