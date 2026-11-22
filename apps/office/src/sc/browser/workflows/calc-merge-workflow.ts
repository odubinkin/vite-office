/** @fileoverview Adapts native Calc merge requests to the browser modal lifecycle. */
import { SfxDialogController } from "../../../sfx2/source/dialog/basedlgs";
import type { SfxRequest } from "../../../sfx2/source/control/request";
import { ScInputMode } from "../../inc/global";
import { ScCellShell, type ScMergeCommand } from "../../source/ui/view/cellsh3";
import type {
  ScMergeCellsDialog,
  ScMergeCellsOption,
} from "../../source/ui/miscdlgs/mergecellsdialog";
import type { CalcViewController } from "../controller/calc-view-controller";

/** Runs original merge slots on the active cell shell and owns its modal request. */
export class CalcMergeWorkflow {
  readonly dialogs = new SfxDialogController<ScMergeCellsDialog, ScMergeCellsOption>();
  private closed = false;

  /** Borrows current Calc view and the shared sheet-modal guard. @param controller - Actual view controller. @param canOpen - Whether another sheet dialog is absent. @returns Merge workflow. */
  constructor(
    private readonly controller: CalcViewController,
    private readonly canOpen: () => boolean,
  ) {}

  /** Reads source availability from the actual cell shell. @param kind - Source merge slot. @returns Slot state. */
  GetState(kind: ScMergeCommand): { enabled: boolean; checked?: boolean } {
    if (this.closed || !this.canOpen() || this.controller.mode !== ScInputMode.SC_INPUT_NONE)
      return { enabled: false };
    return new ScCellShell(this.controller.GetViewShell()).GetMergeState(kind);
  }

  /** Runs a source merge and accepts dialog results only for the originating workbook and selection. @param kind - Source merge slot. @param request - Original Sfx request. @returns Whether cells changed. */
  async Execute(kind: ScMergeCommand, request: SfxRequest): Promise<boolean> {
    if (!this.GetState(kind).enabled) return false;
    const { controller } = this;
    const view = controller.GetViewShell();
    const ok = await new ScCellShell(view).ExecuteMerge(kind, request, async (dialog) => {
      const revision = controller.GetCommandStateRevision();
      const result = await this.dialogs.Request(dialog);
      if (
        this.closed ||
        view !== controller.GetViewShell() ||
        revision !== controller.GetCommandStateRevision() ||
        result.kind !== "accepted"
      )
        return;
      return result.result;
    });
    if (ok) controller.SyncSheetView();
    return ok;
  }

  /** Cancels an active dialog before releasing the session. @returns Nothing. */
  Close(): void {
    this.closed = true;
    const active = this.dialogs.GetSnapshot();
    if (active) this.dialogs.Cancel(active.id);
  }
}
