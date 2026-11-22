/** @fileoverview Browser modal host for the native Calc sheet protection slot. */
import { SfxInterface } from "../../../sfx2/source/control/objface";
import type { SfxRequest } from "../../../sfx2/source/control/request";
import { createSfxShell } from "../../../sfx2/source/control/shell";
import { SfxDialogController } from "../../../sfx2/source/dialog/basedlgs";
import { FID_PROTECT_TABLE } from "../../sdi/tabvwsh";
import type {
  ScSheetProtectionResult,
  ScTableProtectionDlg,
} from "../../source/ui/miscdlgs/protectiondlg";
import type { CalcViewController } from "../controller/calc-view-controller";

/** Native prompt kind and input resources. */
export type CalcProtectionDialog =
  | { readonly kind: "protect"; readonly model: ScTableProtectionDlg }
  | { readonly kind: "unprotect" }
  | { readonly kind: "incorrect" };

/** Adapts native sheet protection prompts to one browser session. */
export class CalcSheetProtectionWorkflow {
  readonly dialogs = new SfxDialogController<
    CalcProtectionDialog,
    ScSheetProtectionResult | string
  >();
  private pending = false;
  private closed = false;

  /** Shares the existing Calc sheet-dialog guard. @param controller - Actual view. @param canOpen - Whether the session admits a modal. @returns Workflow. */
  constructor(
    private readonly controller: CalcViewController,
    private readonly canOpen: () => boolean,
  ) {}

  /** Returns the actual native protection slot. @returns Command shell. */
  GetShell() {
    return createSfxShell(
      this,
      new SfxInterface<CalcSheetProtectionWorkflow>([
        {
          commandUrl: ".uno:Protect",
          slotId: FID_PROTECT_TABLE,
          label: "Protect Sheet",
          /** Projects the active sheet's actual lock flag. @param workflow - Command owner. @returns Slot state. */
          getState: (workflow) => workflow.GetState(),
          /** Forwards the original request. @param workflow - Command owner. @param request - Native request. @returns Whether the model changed. */
          execute: (workflow, request) => workflow.Execute(request),
        },
      ]),
    );
  }

  /** Indicates an outstanding native request. @returns Modal ownership. */
  IsOpen(): boolean {
    return this.pending;
  }

  /** Reads availability and the checked protection flag. @returns Source state. */
  private GetState() {
    const { controller } = this;
    const tab = controller.viewData.GetTabNumber();
    const doc = controller.shell.GetDocument();
    return {
      enabled: !this.closed && !this.pending && this.canOpen() && !!doc.FetchTable(tab),
      checked: doc.IsTabProtected(tab),
    };
  }

  /** Runs the tab shell request with its original prompts. @param request - Caller-owned command. @returns Whether any sheet changed. */
  private async Execute(request: SfxRequest): Promise<boolean> {
    if (!this.GetState().enabled) return false;
    const { controller } = this;
    const view = controller.GetViewShell();
    this.pending = true;
    try {
      const changed = await view.ExecProtectTable(request, {
        Configure:
          /** Requests native protection options. @param model - Source dialog. @returns Accepted values. */ async (
            model,
          ) => {
            const response = await this.dialogs.Request({ kind: "protect", model });
            if (response.kind === "accepted" && typeof response.result !== "string")
              return response.result;
          },
        RequestPassword:
          /** Requests the sheet's existing password. @returns Entered value or cancellation. */ async () => {
            const response = await this.dialogs.Request({ kind: "unprotect" });
            if (response.kind === "accepted" && typeof response.result === "string")
              return response.result;
          },
        ShowIncorrectPassword:
          /** Waits for acknowledgement of the native information dialog. @returns Completion. */ async () => {
            await this.dialogs.Request({ kind: "incorrect" });
          },
        CommitInput: /** Completes pending spreadsheet input. @returns Whether committed. */ () =>
          controller.Commit(),
        IsCurrent:
          /** Rejects results when the document or session has been replaced. @returns View identity. */ () =>
            !this.closed && view === controller.GetViewShell(),
      });
      return changed;
    } finally {
      this.pending = false;
      if (!this.closed && view === controller.GetViewShell()) controller.SyncSheetView();
    }
  }

  /** Cancels the native sheet dialog during session teardown. @returns Nothing. */
  Close(): void {
    this.closed = true;
    const active = this.dialogs.GetSnapshot();
    if (active) this.dialogs.Cancel(active.id);
  }
}
