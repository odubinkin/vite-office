/** @fileoverview Browser-owned asynchronous presentation of the native Calc page-style dialogs. */
import { SfxDialogController } from "../../../sfx2/source/dialog/basedlgs";
import type { SfxSlotDefinition } from "../../../sfx2/source/control/msg";
import { SfxRequest } from "../../../sfx2/source/control/request";
import type { CalcViewController } from "../controller/calc-view-controller";
import {
  ApplyHeaderFooter,
  ApplyPageStyle,
  CreatePageStyleRequest,
  FillHeaderFieldData,
} from "../../source/ui/docshell/docsh4";
import type { SfxItemSet } from "../../../svl/source/items/itemset";
import { ScHFEditDlg, StandaloneHeaderFooterLayout } from "../../source/ui/pagedlg/hfedtdlg";
import { ScStyleSaveData } from "../../source/ui/undo/undostyl";
import type { ScStyleDlgRequest, ScStyleDlgResult } from "../../source/ui/styleui/styledlg";

import { SfxBoolItem } from "../../../svl/source/items/cenumitm";
import { SfxStringItem } from "../../../svl/source/items/stritem";
import {
  calcHeaderFooterCommand,
  calcPageStyleCommand,
  calcPrintRangeCommands,
  FN_PRINT_ENTIRE_SHEET,
  FN_PRINT_REPEAT_COL,
  FN_PRINT_REPEAT_ROW,
  SID_CHANGE_PRINTAREA,
  SID_DEFINE_PRINTAREA,
} from "../../sdi/tabvwsh";
import { CreatePrintAreasModel, type PrintAreasModel } from "../../source/ui/pagedlg/areasdlg";

/** Native print-range slot operations. */
type PrintRangeCommand = (typeof calcPrintRangeCommands)[number]["kind"];

/** Looks up the original SfxStringItem by its Which ID. @param request - Slot request. @param which - Argument identity. @returns Native string with empty default. */
function printRangeArgument(request: SfxRequest, which: number): string {
  const item = request
    .GetArgs()
    .find(
      /** Matches the native slot argument identifier. @param candidate - Typed request item. @returns Whether it has the requested Which ID. */ (
        candidate,
      ) => candidate.Which() === which,
    );
  return item instanceof SfxStringItem ? item.GetValue() : "";
}

/** Retains and applies the native page style and standalone header/footer dialog requests. */
export class CalcPageStyleWorkflow {
  readonly printDialogs = new SfxDialogController<PrintAreasModel, SfxRequest | undefined>();
  readonly headerFooterDialogs = new SfxDialogController<ScHFEditDlg, SfxItemSet>();
  readonly pageStyleDialogs = new SfxDialogController<ScStyleDlgRequest, ScStyleDlgResult>();

  /** Borrows the current browser session and its modal ownership check. @param controller - Actual Calc view controller. @param canOpen - Whether the session can open a dialog. @returns Workflow. */
  constructor(
    private readonly controller: CalcViewController,
    private readonly canOpen: () => boolean,
  ) {}

  /** Opens the original Format Page slot on the active sheet's shared page style. @param request - Source Sfx request. @returns Completion. */
  async EditPageStyle(request: SfxRequest): Promise<void> {
    if (request.GetArgs().length || !this.controller.Commit()) return;
    const view = this.controller.viewData;
    const document = view.GetDocument();
    const name = document.GetPageStyle(view.CurrentTabForData());
    const style = document.GetStyleSheetPool()?.GetPageStyle(name, true);
    if (!style) return;
    const before = new ScStyleSaveData(style);
    const copy = new SfxRequest(request.GetSlot(), request.GetArgs(), request.GetCallMode());
    request.Ignore();
    let transferred = false;
    try {
      const completion = await this.pageStyleDialogs.Request(
        CreatePageStyleRequest(this.controller.shell, style, before, view.CurrentTabForData()),
      );
      if (completion.kind !== "accepted") return;
      try {
        if (this.controller.viewData.GetDocument() !== document) return;
        transferred = ApplyPageStyle(this.controller.shell, style, before, completion.result);
        if (transferred) copy.Done();
      } finally {
        completion.result.items.Dispose();
      }
    } finally {
      if (!transferred) before.items.Dispose();
    }
  }

  /** Checks whether this session can open Format Page. @returns Modal availability. */
  CanEditPageStyle(): boolean {
    return this.canOpen();
  }

  /** Reads original applicability from the active named page style. @returns Whether the command is available. */
  CanEditHeaderFooter(): boolean {
    if (!this.canOpen()) return false;
    const view = this.controller.viewData;
    const document = view.GetDocument();
    const tab = view.CurrentTabForData();
    if (!document.FetchTable(tab)) return false;
    const style = document.GetStyleSheetPool()?.GetPageStyle(document.GetPageStyle(tab));
    return !style || StandaloneHeaderFooterLayout(style.GetItemSet()) !== undefined;
  }

  /** Opens and applies the source standalone header/footer editor. @param request - Source request. @returns Completion. */
  async EditHeaderFooter(request: SfxRequest): Promise<void> {
    if (request.GetArgs().length || !this.CanEditHeaderFooter() || !this.controller.Commit())
      return;
    const view = this.controller.viewData;
    const document = view.GetDocument();
    const tab = view.CurrentTabForData();
    const name = document.GetPageStyle(tab);
    const style = document.GetStyleSheetPool()?.GetPageStyle(name, true);
    if (!style) return;
    const items = style.GetItemSet().Clone();
    const layout = StandaloneHeaderFooterLayout(items);
    if (!layout) {
      items.Dispose();
      return;
    }
    const shell = this.controller.shell;
    const model = new ScHFEditDlg(items, name, layout, FillHeaderFieldData(shell, tab));
    const copy = new SfxRequest(request.GetSlot(), request.GetArgs(), request.GetCallMode());
    request.Ignore();
    try {
      const result = await this.headerFooterDialogs.Request(model);
      if (result.kind !== "accepted") return;
      try {
        if (shell.GetDocument() !== document) return;
        ApplyHeaderFooter(shell, style, result.result);
        copy.Done();
      } finally {
        result.result.Dispose();
      }
    } finally {
      model.Dispose();
      items.Dispose();
    }
  }

  /** Reads source print-range availability from the current sheet. @param kind - Source command. @returns Slot state. */
  CanExecutePrintRange(kind: PrintRangeCommand): boolean {
    if (this.printDialogs.GetSnapshot()) return kind === "edit";
    if (!this.canOpen()) return false;
    const view = this.controller.viewData;
    const sheet = view.GetDocument().FetchTable(view.GetTabNumber());
    return !!sheet && (kind !== "clear" || !sheet.IsPrintEntireSheet());
  }

  /** Executes the original menu slots and toggles the modeless child window. @param kind - Source command. @param request - Actual slot request. @returns Completion. */
  async ExecutePrintRange(kind: PrintRangeCommand, request: SfxRequest): Promise<void> {
    if (!this.controller.Commit()) return;
    const view = this.controller.GetViewShell();
    if (kind === "edit") {
      const open = this.printDialogs.GetSnapshot();
      if (open) {
        this.printDialogs.Cancel(open.id);
        return;
      }
      const model = CreatePrintAreasModel(view.GetViewData());
      if (!model) return;
      const result = await this.printDialogs.Request(model);
      if (
        result.kind === "accepted" &&
        result.result &&
        view === this.controller.GetViewShell() &&
        model.tab === view.GetViewData().GetTabNumber()
      )
        this.ChangePrintRange(result.result);
      return;
    }
    const typed = request.GetArgs().length > 0;
    const print =
      kind === "clear" ? "" : typed ? printRangeArgument(request, SID_DEFINE_PRINTAREA) : undefined;
    view.SetPrintRanges(kind === "clear", print, undefined, undefined, kind === "add");
    if (kind === "clear" || !typed) request.Done();
    this.controller.SyncSheetView();
  }

  /** Applies the original dialog result slot. @param request - Typed print, repeat and entire-sheet items. @returns Nothing. */
  ChangePrintRange(request: SfxRequest): void {
    if (!request.GetArgs().length) return;
    const entire = request
      .GetArgs()
      .find(
        /** Finds the original entire-sheet switch. @param item - Typed request item. @returns Whether it carries the switch. */ (
          item,
        ) => item.Which() === FN_PRINT_ENTIRE_SHEET,
      );
    this.controller
      .GetViewShell()
      .SetPrintRanges(
        entire instanceof SfxBoolItem && entire.GetValue(),
        printRangeArgument(request, SID_CHANGE_PRINTAREA),
        printRangeArgument(request, FN_PRINT_REPEAT_COL),
        printRangeArgument(request, FN_PRINT_REPEAT_ROW),
        false,
      );
    request.Done();
    this.controller.SyncSheetView();
  }
  /** Cancels pending page requests during session teardown. @returns Nothing. */
  Close(): void {
    const headerFooter = this.headerFooterDialogs.GetSnapshot();
    if (headerFooter) this.headerFooterDialogs.Cancel(headerFooter.id);
    const style = this.pageStyleDialogs.GetSnapshot();
    if (style) this.pageStyleDialogs.Cancel(style.id);
  }
}

/** Sheet slot context that provides the active page style workflow. */
interface CalcPageStyleSlotTarget {
  readonly pageStyles: CalcPageStyleWorkflow;
}

/** Original page style, header and footer, and print area slots. */
export const calcPageStyleSlots: readonly SfxSlotDefinition<CalcPageStyleSlotTarget>[] = [
  {
    commandUrl: calcHeaderFooterCommand.id,
    slotId: calcHeaderFooterCommand.slotId,
    label: calcHeaderFooterCommand.label,
    getState:
      /** Checks whether the current page style allows standalone header or footer editing. @param target - Active Calc slot target. @returns Header and Footer command state. */ (
        target: CalcPageStyleSlotTarget,
      ) => ({
        enabled: target.pageStyles.CanEditHeaderFooter(),
      }),
    execute:
      /** Opens the native standalone header and footer editor. @param target - Active Calc slot target. @param request - Original Sfx slot request. @returns Dialog completion. */ (
        target: CalcPageStyleSlotTarget,
        request: SfxRequest,
      ) => target.pageStyles.EditHeaderFooter(request),
  },
  {
    commandUrl: calcPageStyleCommand.id,
    slotId: calcPageStyleCommand.slotId,
    label: calcPageStyleCommand.label,
    getState:
      /** Checks whether a modal dialog already owns the sheet session. @param target - Active Calc slot target. @returns Format Page command state. */ (
        target: CalcPageStyleSlotTarget,
      ) => ({ enabled: target.pageStyles.CanEditPageStyle() }),
    execute:
      /** Opens Format Page for the active sheet style. @param target - Active Calc slot target. @param request - Original Sfx slot request. @returns Dialog completion. */ (
        target: CalcPageStyleSlotTarget,
        request: SfxRequest,
      ) => target.pageStyles.EditPageStyle(request),
  },
  ...calcPrintRangeCommands.map(
    /** Connects a native print-area operation to the page style workflow. @param source - Native slot metadata. @returns Browser slot definition. */
    ({ id, slotId, label, kind }) => ({
      commandUrl: id,
      slotId,
      label,
      getState:
        /** Queries availability for the registered native print-range action. @param target - Active Calc slot target. @returns Print range command state. */ (
          target: CalcPageStyleSlotTarget,
        ) => ({
          enabled: target.pageStyles.CanExecutePrintRange(kind),
        }),
      execute:
        /** Executes the registered native print-range slot. @param target - Active Calc slot target. @param request - Original Sfx slot request. @returns Command completion. */ (
          target: CalcPageStyleSlotTarget,
          request: SfxRequest,
        ) => target.pageStyles.ExecutePrintRange(kind, request),
    }),
  ),
  {
    commandUrl: ".uno:ChangePrintArea",
    slotId: SID_CHANGE_PRINTAREA,
    label: "Change Print Area",
    execute:
      /** Applies a native change-print-area request. @param target - Active Calc slot target. @param request - Original Sfx slot request. @returns Nothing. */ (
        target: CalcPageStyleSlotTarget,
        request: SfxRequest,
      ) => target.pageStyles.ChangePrintRange(request),
  },
];
