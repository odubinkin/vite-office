/** @fileoverview Browser async adapter for native ScTabViewShell::ExecGoToTab and JumpToTable/Nr;real sheet/cursor ownership remains with Calc. */
import { ScMetricInputDlg } from "../../source/ui/miscdlgs/mtrindlg";
import { ScOptionsUtil } from "../../source/core/tool/optutil";
import { FieldUnit } from "../../../tools/inc/fldunit";
import { SfxDialogController } from "../../../sfx2/source/dialog/basedlgs";
import { SfxInterface } from "../../../sfx2/source/control/objface";
import { createSfxShell, type SfxShell } from "../../../sfx2/source/control/shell";
import type { SfxRequest } from "../../../sfx2/source/control/request";
import { SfxUnoAnyItem } from "../../../sfx2/source/view/frame";
import { SfxUInt16Item } from "../../../svl/source/items/intitem";
import { OUString } from "../../../sal/inc/rtl/ustring";
import { text } from "../../../i18nlangtag/source/isolang/isolang.tables";
import { calcGoToSheetCommand } from "../../sdi/scalc";
import type { CalcViewController } from "../controller/calc-view-controller";
/** Immutable native dialog initialization;names are copied only as dialog widget resources. */
export interface CalcGoToSheetRequest {
  readonly names: readonly string[];
  readonly selectedName: string;
}
/** Session-owned native Go to Sheet request and asynchronous result application. */
export class CalcSheetWorkflows {
  readonly dialogs = new SfxDialogController<CalcGoToSheetRequest, string>();
  readonly widthDialogs = new SfxDialogController<ScMetricInputDlg, number>();
  private readonly shell: SfxShell;
  /** Connects a source command to the active document view. @param controller - Actual Calc controller. @returns Workflow. */
  constructor(readonly controller: CalcViewController) {
    this.shell = createSfxShell(
      this,
      new SfxInterface<CalcSheetWorkflows>([
        {
          commandUrl: ".uno:ColumnWidth",
          slotId: 26290,
          label: "Width",
          getState:
            /** Excludes duplicate width dialogs. @param target - Owner. @returns Availability. */ (
              target,
            ) => ({ enabled: target.widthDialogs.GetSnapshot() === undefined }),
          execute:
            /** Executes source column-width request. @param target - Owner. @param request - Native request. @returns Completion. */ (
              target,
              request,
            ) => target.ColumnWidth(request),
        },
        ...(
          [
            [".uno:HideColumn", 26292, false],
            [".uno:ShowColumn", 26293, true],
          ] as const
        ).map(
          /** Binds native show/hide identities. @param entry - Source command. @returns Slot. */ ([
            commandUrl,
            slotId,
            show,
          ]) => ({
            commandUrl,
            slotId,
            label: show ? "Show" : "Hide",
            execute:
              /** Delegates to the actual view command. @param target - Owner. @returns Nothing. */ (
                target: CalcSheetWorkflows,
              ) => target.controller.ShowColumns(show),
          }),
        ),

        {
          commandUrl: calcGoToSheetCommand.id,
          slotId: calcGoToSheetCommand.slotId,
          label: calcGoToSheetCommand.label,
          getState:
            /** Prevents a duplicate active dialog request. @param target - Workflow. @returns Slot state. */ (
              target,
            ) => ({ enabled: target.dialogs.GetSnapshot() === undefined }),
          execute:
            /** Retains the original native request boundary. @param target - Workflow. @param request - Slot and arguments. @returns Operation completion. */ (
              target,
              request,
            ) => target.ExecGoToTab(request),
        },
      ]),
    );
  }
  /** Borrows the original slot adapter for the active Sfx frame. @returns Shell. */
  GetShell(): SfxShell {
    return this.shell;
  }
  /** Reads actual current sheet names in document order. @returns Dialog name resources. */
  private Names(): string[] {
    const doc = this.controller.shell.GetDocument(),
      name = new OUString(),
      names: string[] = [];
    for (let tab = 0; tab < doc.GetTableCount(); tab++) {
      doc.GetName(tab, name);
      names.push(text(name));
    }
    name.dispose();
    return names;
  }
  /** Executes original Nr one-based API or opens the native-shaped async dialog. @param request - Real source request. @returns Completion. */
  private async ExecGoToTab(request: SfxRequest): Promise<void> {
    const args = request.GetArgs();
    if (args.length > 0) {
      const item = args.find(
        /** Reads the original SID_CURRENTTAB argument by Which,as native SfxItemSet::Get. @param argument - Request item. @returns Matching identity. */
        (argument) => argument.Which() === request.GetSlot(),
      );
      const value =
        item instanceof SfxUInt16Item
          ? { Nr: item.GetValue() }
          : item instanceof SfxUnoAnyItem
            ? item.GetValue()
            : undefined;
      if (
        typeof value !== "object" ||
        value === null ||
        !("Nr" in value) ||
        typeof value.Nr !== "number" ||
        !Number.isInteger(value.Nr) ||
        value.Nr < 0 ||
        value.Nr > 65535
      )
        throw new TypeError("JumpToTable requires unsigned16 Nr (one-based sheet number).");
      this.controller.SelectTab(value.Nr - 1);
      return;
    }
    if (!this.controller.Commit()) return;
    const names = this.Names(),
      selectedName = names[this.controller.viewData.GetTabNumber()] as string;
    const result = await this.dialogs.Request({ names, selectedName });
    if (result.kind === "accepted") {
      const tab = this.Names().indexOf(result.result);
      if (tab >= 0) this.controller.SelectTab(tab);
    }
  }
  /** Original typed arguments execute immediately;no-argument commands wait for the actual metric dialog. @param request - Native request. @returns Completion. */
  private async ColumnWidth(request: SfxRequest): Promise<void> {
    if (!this.controller.Commit()) return;
    if (this.controller.ExecuteColumnWidth(request)) return;
    const data = this.controller.viewData,
      dialog = new ScMetricInputDlg(
        data.GetDocument().GetColWidth(data.GetCurX(), data.GetTabNumber()),
        ScOptionsUtil.IsMetricSystem() ? FieldUnit.CM : FieldUnit.INCH,
      ),
      result = await this.widthDialogs.Request(dialog);
    if (result.kind === "accepted") this.controller.CompleteColumnWidth(result.result);
  }
  /** Cancels the native async request before the session destroys its document. @returns Nothing. */
  Close(): void {
    const width = this.widthDialogs.GetSnapshot();
    if (width) this.widthDialogs.Cancel(width.id);
    const request = this.dialogs.GetSnapshot();
    if (request) this.dialogs.Cancel(request.id);
  }
}
