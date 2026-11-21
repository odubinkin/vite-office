import { CalcClipboardWorkflow } from "./calc-clipboard-workflow";
/** @fileoverview Browser async adapter for native ScTabViewShell::ExecGoToTab and JumpToTable/Nr;real sheet/cursor ownership remains with Calc. */
import { CalcOptionsWorkflow } from "./calc-options-workflow";
import { CalcLabelRangeWorkflow } from "./calc-label-range-workflow";
import { STD_COL_WIDTH, MAX_COL_WIDTH, MAX_ROW_HEIGHT, ScInputMode } from "../../inc/global";
import { ScMetricInputDlg } from "../../source/ui/miscdlgs/mtrindlg";
import { ScOptionsUtil } from "../../source/core/tool/optutil";
import { FieldUnit } from "../../../tools/inc/fldunit";
import { SfxDialogController } from "../../../sfx2/source/dialog/basedlgs";
import { SfxInterface } from "../../../sfx2/source/control/objface";
import type { SfxDispatcher } from "../../../sfx2/source/control/dispatch";
import { createSfxShell, type SfxShell } from "../../../sfx2/source/control/shell";
import { SfxRequest } from "../../../sfx2/source/control/request";
import { SfxUnoAnyItem } from "../../../sfx2/source/view/frame";
import { SfxInt16Item, SfxUInt16Item } from "../../../svl/source/items/intitem";
import { OUString } from "../../../sal/inc/rtl/ustring";
import { text, unicode } from "../../../i18nlangtag/source/isolang/isolang.tables";
import { SvxColorItem } from "../../../editeng/inc/colritem";
import { SfxBoolItem } from "../../../svl/source/items/cenumitm";
import { SfxStringItem } from "../../../svl/source/items/stritem";
import { SfxIntegerListItem } from "../../../svl/source/items/ilstitem";
import { Color } from "../../../tools/inc/color";
import { createBrowserColorItem } from "../../../svx/browser/tbxctrls/color-item";
import { ScRange } from "../../inc/address";
import {
  applyOutlineControl,
  changeOutline,
  changeOutlineDetail,
  type ScOutlineControl,
} from "../../source/ui/docshell/olinefun";
import {
  fullOutlineAxes,
  OutlinePossible,
  simpleOutlineRange,
  TestRemoveOutline,
} from "../../source/ui/view/dbfunc3";
import {
  calcGoToSheetCommand,
  calcOutlineCommands,
  calcPageBreakCommands,
  calcSheetCommands,
  FID_TAB_SET_TAB_BG_COLOR,
} from "../../sdi/scalc";
import {
  calcPageStyleCommand,
  calcHeaderFooterCommand,
  calcPrintRangeCommands,
  FN_PRINT_ENTIRE_SHEET,
  FN_PRINT_REPEAT_COL,
  FN_PRINT_REPEAT_ROW,
  SID_CHANGE_PRINTAREA,
  SID_DEFINE_PRINTAREA,
} from "../../sdi/tabvwsh";
import { CreatePrintAreasModel, type PrintAreasModel } from "../../source/ui/pagedlg/areasdlg";
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
import { CalcConditionalWorkflows, conditionalFormatCommands } from "./calc-conditional-workflows";
import {
  FormatNameReference,
  ScNameDefDlg,
  type ScNameDef,
} from "../../source/ui/namedlg/namedefdlg";
import {
  ScNameDlg,
  FormatPastedRangeName,
  type ScRangeNameLine,
} from "../../source/ui/namedlg/namedlg";
import { CreateNameFlags } from "../../source/ui/inc/scui_def";
import { ScMarkType } from "../../source/ui/inc/viewdata";
import { GetCreateNameFlags } from "../../source/ui/view/viewfunc.names";
import type { CreateNameAnswer } from "../../source/ui/docshell/docfunc.names";
import type { CalcViewController } from "../controller/calc-view-controller";
/** Immutable native dialog initialization;names are copied only as dialog widget resources. */
export interface CalcGoToSheetRequest {
  readonly names: readonly string[];
  readonly selectedName: string;
}
/** Dialog contents from ScShowTabDlg and ScTabBgColorDlg. */
export type CalcSheetTabDialog =
  | {
      readonly kind: "select" | "show";
      readonly names: readonly string[];
      readonly selected: readonly number[];
    }
  | { readonly kind: "color" }
  | { readonly kind: "group" }
  | { readonly kind: "ungroup" };

/** Source sheet workflow identities. */
type SheetCommand = keyof typeof calcSheetCommands;
/** Native manual outline operation identifiers. */
type OutlineCommand = (typeof calcOutlineCommands)[number]["kind"];
/** Native print-range slot operations. */
type PrintRangeCommand = (typeof calcPrintRangeCommands)[number]["kind"];

/** Looks up the original SfxStringItem by its Which ID. @param request - Slot request. @param which - Argument identity. @returns Native string with empty default. */
function printRangeArgument(request: SfxRequest, which: number): string {
  const item = request.GetArgs().find((candidate) => candidate.Which() === which);
  return item instanceof SfxStringItem ? item.GetValue() : "";
}

/** Source name-paste modal result. */
export type NamePasteResult =
  { readonly kind: "names"; readonly rows: readonly ScRangeNameLine[] } | { readonly kind: "list" };

/** Source Create Names dialog and its follow-up native prompts. */
export type CreateNamesRequest =
  | { readonly kind: "options"; readonly flags: CreateNameFlags }
  | { readonly kind: "replace"; readonly name: string }
  | { readonly kind: "invalid" };
/** Source response to orientation or replacement. */
export type CreateNamesResult = CreateNameFlags | Exclude<CreateNameAnswer, "cancel">;

/** Session-owned native Go to Sheet request and asynchronous result application. */
export class CalcSheetWorkflows {
  readonly options: CalcOptionsWorkflow;
  readonly clipboard: CalcClipboardWorkflow;
  readonly labelRanges: CalcLabelRangeWorkflow;
  readonly dialogs = new SfxDialogController<CalcGoToSheetRequest, string>();
  readonly tabDialogs = new SfxDialogController<CalcSheetTabDialog, number[] | string>();
  readonly metricDialogs = new SfxDialogController<ScMetricInputDlg, number>();
  readonly headerFooterDialogs = new SfxDialogController<ScHFEditDlg, SfxItemSet>();
  readonly pageStyleDialogs = new SfxDialogController<ScStyleDlgRequest, ScStyleDlgResult>();
  readonly printDialogs = new SfxDialogController<PrintAreasModel, SfxRequest | undefined>();
  private managing: ScNameDlg | undefined;
  private creatingNames: AbortController | undefined;
  readonly createNamesDialogs = new SfxDialogController<CreateNamesRequest, CreateNamesResult>();
  readonly nameManagerDialogs = new SfxDialogController<ScNameDlg, "add" | "apply">();
  readonly namePasteDialogs = new SfxDialogController<
    readonly ScRangeNameLine[],
    NamePasteResult
  >();
  readonly nameDialogs = new SfxDialogController<ScNameDefDlg, boolean>();
  readonly conditionals: CalcConditionalWorkflows;
  private readonly shell: SfxShell;
  /** Connects a source command to the active document view. @param controller - Actual Calc controller. @param dispatcher - Active view dispatcher. @returns Workflow. */
  constructor(
    readonly controller: CalcViewController,
    dispatcher: SfxDispatcher,
  ) {
    this.options = new CalcOptionsWorkflow(controller, () => !this.HasSheetDialog());
    this.clipboard = new CalcClipboardWorkflow(
      controller,
      () => !this.HasSheetDialog(),
      dispatcher,
    );
    this.conditionals = new CalcConditionalWorkflows(controller);
    this.labelRanges = new CalcLabelRangeWorkflow(this.controller);
    this.shell = createSfxShell(
      this,
      new SfxInterface<CalcSheetWorkflows>([
        {
          commandUrl: ".uno:AddName",
          slotId: 26276,
          label: "Define Name",
          getState: (target: CalcSheetWorkflows) => ({ enabled: !target.HasSheetDialog() }),
          execute: (target: CalcSheetWorkflows, request: SfxRequest) =>
            !request.GetArgs().length && target.DefineName(),
        },
        {
          commandUrl: ".uno:DefineName",
          slotId: 26271,
          label: "Manage Names",
          shortcuts: ["Ctrl+F3", "Meta+F3"],
          getState: (target: CalcSheetWorkflows) => ({ enabled: !target.HasSheetDialog() }),
          execute: (target: CalcSheetWorkflows, request: SfxRequest) =>
            !request.GetArgs().length && target.ManageNames(),
        },
        {
          commandUrl: ".uno:InsertName",
          slotId: 26272,
          label: "Insert Name",
          getState: (target: CalcSheetWorkflows) => ({ enabled: !target.HasSheetDialog() }),
          execute: (target: CalcSheetWorkflows, request: SfxRequest) =>
            !request.GetArgs().length && target.PasteNames(),
        },
        {
          commandUrl: ".uno:CreateNames",
          slotId: 26273,
          label: "Create Names",
          getState: (target: CalcSheetWorkflows) => ({
            enabled:
              !target.HasSheetDialog() &&
              target.controller.viewData.GetSimpleArea(new ScRange()) === ScMarkType.SC_MARK_SIMPLE,
          }),
          execute: (target: CalcSheetWorkflows, request: SfxRequest) =>
            !request.GetArgs().length && target.CreateNames(),
        },
        {
          commandUrl: ".uno:DefineLabelRange",
          slotId: 26629,
          label: "Define Label Range",
          getState: (target: CalcSheetWorkflows) => ({
            enabled: Boolean(target.labelRanges.dialogs.GetSnapshot()) || !target.HasSheetDialog(),
          }),
          execute: (target: CalcSheetWorkflows, request: SfxRequest) =>
            !request.GetArgs().length && target.labelRanges.Execute(),
        },
        ...conditionalFormatCommands.map(
          /** Binds one original conditional-format Sfx command. @param slot - Source command. @returns Slot definition. */ ([
            commandUrl,
            slotId,
            label,
            kind,
          ]) => ({
            commandUrl,
            slotId,
            label,
            getState: (target: CalcSheetWorkflows) => ({
              enabled: !target.HasSheetDialog() && target.conditionals.CanExecute(kind),
            }),
            execute: (target: CalcSheetWorkflows, request: SfxRequest) => {
              const [argument] = request.GetArgs();
              if (kind === "easy") {
                const value = argument instanceof SfxUnoAnyItem ? argument.GetValue() : undefined;
                const mode =
                  typeof value === "object" && value !== null && "FormatRule" in value
                    ? Number(value.FormatRule)
                    : argument instanceof SfxInt16Item
                      ? argument.GetValue()
                      : undefined;
                if (mode !== undefined && ![0, 1, 2, 6, 23].includes(mode)) return false;
                return target.conditionals.Execute(kind, mode);
              }
              return !argument && target.conditionals.Execute(kind);
            },
          }),
        ),
        ...(
          [
            [".uno:ColumnWidth", 26290, true],
            [".uno:RowHeight", 26286, false],
          ] as const
        ).map(
          /** Binds the original axis command. @param entry - Source identity. @returns Slot. */ ([
            commandUrl,
            slotId,
            width,
          ]) => ({
            commandUrl,
            slotId,
            label: width ? "Width" : "Height",
            getState:
              /** Excludes simultaneous metric dialogs. @param target - Owner. @returns Availability. */ (
                target: CalcSheetWorkflows,
              ) => ({ enabled: !target.HasSheetDialog() }),
            execute:
              /** Routes the actual dimension. @param target - Owner. @param request - Source request. @returns Completion. */ (
                target: CalcSheetWorkflows,
                request: SfxRequest,
              ) => target.Dimension(request, width),
          }),
        ),
        ...(
          [
            [".uno:HideColumn", 26292, false, true],
            [".uno:ShowColumn", 26293, true, true],
            [".uno:HideRow", 26288, false, false],
            [".uno:ShowRow", 26289, true, false],
          ] as const
        ).map(
          /** Binds native show/hide identities. @param entry - Source command. @returns Slot. */ ([
            commandUrl,
            slotId,
            show,
            width,
          ]) => ({
            commandUrl,
            slotId,
            label: show ? "Show" : "Hide",
            execute:
              /** Delegates to the actual view command. @param target - Owner. @returns Nothing. */ (
                target: CalcSheetWorkflows,
              ) => (width ? target.controller.ShowColumns(show) : target.controller.ShowRows(show)),
          }),
        ),

        ...calcPageBreakCommands.map(
          /** Binds the native cell-shell break commands and state. @param source - Slot definition. @returns Shell slot. */
          ({ id, slotId, label, columns, insert }) => ({
            commandUrl: id,
            slotId,
            label,
            getState:
              /** Queries break flags at the active cell. @param target - Active workflow. @returns Slot state. */
              (target: CalcSheetWorkflows) => ({
                enabled: target.CanChangePageBreak(columns, insert),
              }),
            execute:
              /** Routes the admitted command to the native view functions. @param target - Active workflow. @param request - Original request. @returns Nothing. */
              (target: CalcSheetWorkflows, request: SfxRequest) => {
                if (!target.controller.Commit()) return;
                const view = target.controller.GetViewShell();
                if (insert) view.InsertPageBreak(columns);
                else view.DeletePageBreak(columns);
                request.Done();
              },
          }),
        ),
        {
          commandUrl: calcHeaderFooterCommand.id,
          slotId: calcHeaderFooterCommand.slotId,
          label: calcHeaderFooterCommand.label,
          getState: (target: CalcSheetWorkflows) => ({ enabled: target.CanEditHeaderFooter() }),
          execute: (target: CalcSheetWorkflows, request: SfxRequest) =>
            target.EditHeaderFooter(request),
        },
        {
          commandUrl: calcPageStyleCommand.id,
          slotId: calcPageStyleCommand.slotId,
          label: calcPageStyleCommand.label,
          getState: (target: CalcSheetWorkflows) => ({ enabled: !target.HasSheetDialog() }),
          execute: (target: CalcSheetWorkflows, request: SfxRequest) =>
            target.EditPageStyle(request),
        },
        ...calcPrintRangeCommands.map(({ id, slotId, label, kind }) => ({
          commandUrl: id,
          slotId,
          label,
          getState: (target: CalcSheetWorkflows) => ({
            enabled: target.CanExecutePrintRange(kind),
          }),
          execute: (target: CalcSheetWorkflows, request: SfxRequest) =>
            target.ExecutePrintRange(kind, request),
        })),
        {
          commandUrl: ".uno:ChangePrintArea",
          slotId: SID_CHANGE_PRINTAREA,
          label: "Change Print Area",
          execute: (target: CalcSheetWorkflows, request: SfxRequest) =>
            target.ChangePrintRange(request),
        },
        ...calcOutlineCommands.map(
          /** Registers the cell-shell outline slots in the browser dispatch adapter. @param source - Source command. @returns Shell slot. */
          (source) => ({
            commandUrl: source.id,
            slotId: source.slotId,
            label: source.label,
            getState:
              /** Queries actual outline availability. @param target - Browser workflow. @returns State. */
              (target: CalcSheetWorkflows) => ({ enabled: target.CanExecuteOutline(source.kind) }),
            execute:
              /** Invokes the original operation through its source request. @param target - Browser workflow. @param request - Slot request. @returns Operation completion. */
              (target: CalcSheetWorkflows, request: SfxRequest) =>
                target.ExecuteOutline(source.kind, request),
          }),
        ),
        ...(Object.keys(calcSheetCommands) as SheetCommand[]).map(
          /** Connects the four source sheet slots. @param kind - Command identity. @returns Shell slot. */
          (kind) => ({
            commandUrl: calcSheetCommands[kind].id,
            slotId: calcSheetCommands[kind].slotId,
            label: calcSheetCommands[kind].label,
            getState:
              /** Queries native state from the active view. @param target - Workflow. @returns Slot state. */
              (target: CalcSheetWorkflows) => ({ enabled: target.CanExecuteTab(kind) }),
            execute:
              /** Delegates the slot and its typed arguments. @param target - Workflow. @param request - Source request. @returns Completion. */
              (target: CalcSheetWorkflows, request: SfxRequest) => target.ExecuteTab(kind, request),
          }),
        ),
        {
          commandUrl: calcGoToSheetCommand.id,
          slotId: calcGoToSheetCommand.slotId,
          label: calcGoToSheetCommand.label,
          getState:
            /** Prevents a duplicate active dialog request. @param target - Workflow. @returns Slot state. */ (
              target,
            ) => ({ enabled: !target.HasSheetDialog() }),
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
      if (!doc.IsVisible(tab)) continue;
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
    const document = this.controller.viewData.GetDocument();
    const name = new OUString();
    let selectedName: string;
    try {
      document.GetName(this.controller.viewData.GetTabNumber(), name);
      selectedName = text(name);
    } finally {
      name.dispose();
    }
    const result = await this.dialogs.Request({ names: this.Names(), selectedName });
    if (result.kind === "accepted") {
      const target = unicode(result.result);
      const tab: [number] = [0];
      try {
        if (this.controller.viewData.GetDocument().GetTable(target, tab))
          this.controller.SelectTab(tab[0]);
      } finally {
        target.dispose();
      }
    }
  }
  /** Original typed arguments execute immediately;no-argument commands wait for the actual metric dialog. @param request - Native request. @param width - Column versus row dimension. @returns Completion. */
  private async Dimension(request: SfxRequest, width: boolean): Promise<void> {
    if (!this.controller.Commit()) return;
    if (
      width
        ? this.controller.ExecuteColumnWidth(request)
        : this.controller.ExecuteRowHeight(request)
    )
      return;
    const data = this.controller.viewData,
      dialog = new ScMetricInputDlg(
        width ? "ColWidthDialog" : "RowHeightDialog",
        width
          ? data.GetDocument().GetColWidth(data.GetCurX(), data.GetTabNumber())
          : data.GetDocument().GetRowHeight(data.GetCurY(), data.GetTabNumber()),
        width ? STD_COL_WIDTH : data.GetDocument().GetSheetOptimalMinRowHeight(data.GetTabNumber()),
        ScOptionsUtil.IsMetricSystem() ? FieldUnit.CM : FieldUnit.INCH,
        2,
        width ? MAX_COL_WIDTH : MAX_ROW_HEIGHT,
        2,
      ),
      result = await this.metricDialogs.Request(dialog);
    if (result.kind === "accepted") {
      if (width) this.controller.CompleteColumnWidth(result.result);
      else this.controller.CompleteRowHeight(result.result);
    }
  }
  /** Opens the source reference dialog. @returns Whether a name was added. */
  private async DefineName(): Promise<boolean> {
    if (this.HasSheetDialog() || !this.controller.Commit()) return false;
    const result = await this.nameDialogs.Request(new ScNameDefDlg(this.controller.viewData));
    return result.kind === "accepted";
  }

  /** Routes the Add button through source validation before closing its request. @param id - Active request. @param data - Form values. @returns Validation error. */
  AddName(id: number, data: ScNameDef): string {
    const dialog = this.nameDialogs.GetSnapshot();
    if (!dialog || dialog.id !== id) return "The dialog has closed.";
    const manager = this.managing;
    if (manager) {
      const answer = manager.Edit(undefined, data);
      if (typeof answer === "string") return answer;
      this.nameDialogs.Complete(id, true);
      return "";
    }
    const error = dialog.request.Add(this.controller.shell, data);
    if (!error) {
      const range = new ScRange();
      this.controller.viewData.GetSimpleArea(range);
      if (data.expression === FormatNameReference(dialog.request.document, range)) {
        const scope = dialog.request.scopes.find(([tab]) => tab === data.scope)?.[1];
        this.controller.ChangeAddress(data.scope < 0 ? data.name : `${data.name} (${scope})`);
      }
      this.nameDialogs.Complete(id, true);
    }
    return error;
  }

  /** Opens and resumes the transactional name manager around its nested Define Name request. @returns Whether the workbook changed. */
  private async ManageNames(): Promise<boolean> {
    if (this.HasSheetDialog() || !this.controller.Commit()) return false;
    const manager = new ScNameDlg(this.controller.viewData);
    this.managing = manager;
    try {
      while (manager.editor.document === this.controller.shell.GetDocument()) {
        const result = await this.nameManagerDialogs.Request(manager);
        if (
          result.kind !== "accepted" ||
          manager.editor.document !== this.controller.shell.GetDocument()
        )
          return false;
        if (result.result === "apply") {
          const map = manager.TakeResult();
          if (!map) return false;
          this.controller.shell.GetDocFunc().ModifyAllRangeNames(map);
          this.controller.SyncSheetView();
          return true;
        }
        await this.nameDialogs.Request(manager.editor);
        if (this.managing !== manager) return false;
      }
      return false;
    } finally {
      this.managing = undefined;
      manager.Dispose();
    }
  }

  /** Opens the original Insert Name picker and applies its respective response. @returns Whether a command ran. */
  private async PasteNames(): Promise<boolean> {
    if (this.HasSheetDialog()) return false;
    const controller = this.controller;
    const inEdit = controller.inputHandler.IsInputMode();
    const model = new ScNameDlg(controller.viewData);
    try {
      const result = await this.namePasteDialogs.Request(model.GetRows());
      if (result.kind !== "accepted" || model.editor.document !== controller.shell.GetDocument())
        return false;
      if (inEdit && !controller.inputHandler.IsInputMode()) return false;
      if (result.result.kind === "list") {
        if (inEdit || !controller.shell.GetDocFunc().InsertNameList(controller.Position()))
          return false;
        controller.SyncSheetView();
        return true;
      }
      if (!result.result.rows.length) return false;
      if (!inEdit && !controller.StartInput(ScInputMode.SC_INPUT_TYPE, "=")) return false;
      const [first, last] = controller.inputSelection;
      const start = Math.min(first, last),
        end = Math.max(first, last);
      const inserted =
        result.result.rows
          .map((row) => FormatPastedRangeName(row, model.editor.document.GetAddressConvention()))
          .join(" ") + " ";
      controller.ChangeInput(
        controller.inputText.slice(0, start) + inserted + controller.inputText.slice(end),
      );
      controller.SetInputSelection(start + inserted.length, start + inserted.length);
      return true;
    } finally {
      model.Dispose();
    }
  }

  /** Executes the source selection-label command around its modal decisions. @returns Whether the creation ran. */
  private async CreateNames(): Promise<boolean> {
    const controller = this.controller;
    if (this.HasSheetDialog() || !controller.Commit()) return false;
    const view = controller.viewData;
    const range = new ScRange();
    if (view.GetSimpleArea(range) !== ScMarkType.SC_MARK_SIMPLE) return false;
    const owner = new AbortController();
    this.creatingNames = owner;
    try {
      const options = await this.createNamesDialogs.Request({
        kind: "options",
        flags: GetCreateNameFlags(view),
      });
      if (owner.signal.aborted || options.kind !== "accepted" || typeof options.result !== "number")
        return false;
      const done = await controller.shell.GetDocFunc().CreateNames(
        range,
        options.result,
        async (name) => {
          if (owner.signal.aborted) return "cancel";
          const result = await this.createNamesDialogs.Request({ kind: "replace", name });
          return result.kind === "accepted" && typeof result.result === "string"
            ? result.result
            : "cancel";
        },
        owner.signal,
      );
      if (owner.signal.aborted) return false;
      if (done) controller.SyncSheetView();
      else await this.createNamesDialogs.Request({ kind: "invalid" });
      return done;
    } finally {
      if (this.creatingNames === owner) this.creatingNames = undefined;
    }
  }

  /** Checks whether the sheet workflows already own a modal. @returns Active modal state. */
  private HasSheetDialog(): boolean {
    return Boolean(
      this.tabDialogs.GetSnapshot() ||
      this.dialogs.GetSnapshot() ||
      this.metricDialogs.GetSnapshot() ||
      this.printDialogs.GetSnapshot() ||
      this.pageStyleDialogs.GetSnapshot() ||
      this.headerFooterDialogs.GetSnapshot() ||
      this.managing ||
      this.creatingNames ||
      this.namePasteDialogs.GetSnapshot() ||
      this.nameDialogs.GetSnapshot() ||
      this.labelRanges.dialogs.GetSnapshot() ||
      this.clipboard.dialogs.GetSnapshot() ||
      this.options.dialogs.GetSnapshot() ||
      this.conditionals.IsOpen(),
    );
  }

  /** Opens the original Format Page slot on the active sheet's shared page style. @param request - Source Sfx request. @returns Completion. */
  private async EditPageStyle(request: SfxRequest): Promise<void> {
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

  /** Reads original applicability from the active named page style. @returns Whether the command is available. */
  private CanEditHeaderFooter(): boolean {
    if (this.HasSheetDialog()) return false;
    const view = this.controller.viewData;
    const document = view.GetDocument();
    const tab = view.CurrentTabForData();
    if (!document.FetchTable(tab)) return false;
    const style = document.GetStyleSheetPool()?.GetPageStyle(document.GetPageStyle(tab));
    return !style || StandaloneHeaderFooterLayout(style.GetItemSet()) !== undefined;
  }

  /** Opens and applies the source standalone header/footer editor. @param request - Source request. @returns Completion. */
  private async EditHeaderFooter(request: SfxRequest): Promise<void> {
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
  private CanExecutePrintRange(kind: PrintRangeCommand): boolean {
    if (this.printDialogs.GetSnapshot()) return kind === "edit";
    if (this.HasSheetDialog()) return false;
    const view = this.controller.viewData;
    const sheet = view.GetDocument().FetchTable(view.GetTabNumber());
    return !!sheet && (kind !== "clear" || !sheet.IsPrintEntireSheet());
  }

  /** Executes the original menu slots and toggles the modeless child window. @param kind - Source command. @param request - Actual slot request. @returns Completion. */
  private async ExecutePrintRange(kind: PrintRangeCommand, request: SfxRequest): Promise<void> {
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
  private ChangePrintRange(request: SfxRequest): void {
    if (!request.GetArgs().length) return;
    const entire = request.GetArgs().find((item) => item.Which() === FN_PRINT_ENTIRE_SHEET);
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

  /** Applies a level or group button through the active Calc shell. @param control - Native outline window action. @returns Nothing. */
  OutlineControl(control: ScOutlineControl): void {
    const { controller } = this;
    const view = controller.viewData;
    const editing = controller.inputHandler.IsInputMode()
      ? control.columns
        ? view.GetCurX()
        : view.GetCurY()
      : undefined;
    applyOutlineControl(controller.shell, view.GetTabNumber(), control, editing);
  }

  /** Uses the native FID break state for the active axis. @param columns - Column axis. @param insert - Insert or remove. @returns Enabled. */
  private CanChangePageBreak(columns: boolean, insert: boolean): boolean {
    if (this.HasSheetDialog()) return false;
    const view = this.controller.viewData;
    const tab = view.CurrentTabForData();
    const sheet = view.GetDocument().FetchTable(tab);
    const index = columns ? view.GetCurX() : view.GetCurY();
    if (!sheet || !index || sheet.IsProtected()) return false;
    return (columns ? sheet.HasColManualBreak(index) : sheet.HasRowManualBreak(index)) !== insert;
  }

  /** Calculates source state for the outline commands. @param kind - Source slot. @returns Whether enabled. */
  private CanExecuteOutline(kind: OutlineCommand): boolean {
    if (this.HasSheetDialog()) return false;
    const view = this.controller.viewData;
    if (kind === "group") return !view.GetMarkData().IsMultiMarked();
    if (kind === "clear")
      return !!view.GetDocument().FetchTable(view.GetTabNumber())?.GetOutlineTable();
    const range = simpleOutlineRange(view);
    if (!range) return false;
    return kind === "ungroup"
      ? TestRemoveOutline(view, range).some(Boolean)
      : OutlinePossible(view, range, kind);
  }

  /** Runs the source outline slot and opens an axis choice only when needed. @param kind - Outline command. @param request - Typed value or no-argument command. @returns Completion. */
  private async ExecuteOutline(kind: OutlineCommand, request: SfxRequest): Promise<void> {
    if (!this.controller.Commit()) return;
    const view = this.controller.viewData,
      shell = this.controller.shell;
    const range =
      kind === "clear" ? new ScRange(0, 0, view.GetTabNumber()) : simpleOutlineRange(view);
    if (!range) {
      shell.ErrorMessage("This function cannot be used with multiple selections.");
      return;
    }
    if (kind === "hide" || kind === "show" || kind === "clear") {
      changeOutlineDetail(shell, range, kind);
      request.Done();
      return;
    }
    const args = request.GetArgs();
    let axis: string;
    if (args.length) {
      const item = args.find(
        /** Finds the RowOrCol item. @param candidate - Request item. @returns Whether this is the slot argument. */
        (candidate) => candidate.Which() === request.GetSlot(),
      );
      const first = item instanceof SfxStringItem ? item.GetValue().charAt(0) : "";
      axis = first === "r" ? "R" : first === "c" ? "C" : first;
      if (axis !== "R" && axis !== "C") return;
    } else {
      const [columns, rows] =
        kind === "group" ? fullOutlineAxes(view, range) : TestRemoveOutline(view, range);
      if (columns !== rows) axis = columns ? "C" : "R";
      else {
        const result = await this.tabDialogs.Request({ kind });
        if (
          result.kind !== "accepted" ||
          typeof result.result !== "string" ||
          view !== this.controller.viewData
        )
          return;
        const liveRange = simpleOutlineRange(view);
        if (liveRange) changeOutline(shell, liveRange, result.result === "C", kind === "group");
        else shell.ErrorMessage("This function cannot be used with multiple selections.");
        return;
      }
    }
    changeOutline(shell, range, axis === "C", kind === "group");
    if (!request.IsAPI()) {
      request.AppendItem(new SfxStringItem(request.GetSlot(), axis));
      request.Done();
    }
  }

  /** Queries original view rules and prevents overlapping sheet dialogs. @param kind - Slot identity. @returns Availability. */
  private CanExecuteTab(kind: SheetCommand): boolean {
    if (this.HasSheetDialog()) return false;
    const view = this.controller.GetViewShell();
    if (kind === "hide") return view.CanHideTable();
    if (kind === "show") return view.CanShowTable();
    if (kind === "color") return view.CanSetTabBgColor();
    return true;
  }

  /** Runs original typed sheet commands and supplies the async browser dialog when needed. @param kind - Source command. @param request - Actual Sfx slot request. @returns Completion. */
  private async ExecuteTab(kind: SheetCommand, request: SfxRequest): Promise<void> {
    if (!this.controller.Commit()) {
      request.Ignore();
      return;
    }
    const view = this.controller.GetViewShell(),
      data = view.GetViewData(),
      doc = data.GetDocument();
    const which = kind === "color" ? FID_TAB_SET_TAB_BG_COLOR : request.GetSlot();
    const args = request.GetArgs();
    const item = args.find(
      /** Finds the typed native argument identity. @param candidate - Request argument. @returns Match. */
      (candidate) => candidate.Which() === which,
    );
    if (kind === "hide") {
      let restore = -1;
      if (item !== undefined && !(item instanceof SfxInt16Item))
        throw new TypeError("Hide requires signed16 nTabNumber.");
      if (item instanceof SfxInt16Item) {
        const tab = item.GetValue();
        if (!doc.FetchTable(tab)) return;
        if (!data.GetMarkData().GetTableSelect(tab)) restore = data.GetTabNumber();
        data.GetMarkData().SelectOneTable(tab);
      }
      view.HideTable(restore);
    } else if (kind === "color") {
      if (args.length) {
        if (view.SetTabBgColor(item instanceof SvxColorItem ? item.GetValue() : new Color()))
          request.Done();
      } else {
        const oldColor = doc.GetTabBgColor(data.GetTabNumber());
        const copy = new SfxRequest(request.GetSlot(), args, request.GetCallMode());
        request.Ignore();
        const result = await this.tabDialogs.Request({ kind });
        if (
          result.kind !== "accepted" ||
          typeof result.result !== "string" ||
          view !== this.controller.GetViewShell()
        )
          return;
        if (view.SetTabBgColor(createBrowserColorItem(result.result, which).GetValue())) {
          copy.AppendItem(new SvxColorItem(oldColor, which));
          copy.Done();
        }
      }
    } else if (kind === "show" && args.length) {
      if (item instanceof SfxStringItem) {
        this.ShowNamedTables([item.GetValue()]);
        if (!request.IsAPI()) request.Done();
      }
    } else if (kind === "select" && item instanceof SfxIntegerListItem) {
      if (item.GetList().length) {
        view.SelectTables(item.GetList());
        request.Done();
      }
    } else {
      const names: string[] = [],
        selected: number[] = [],
        name = new OUString();
      try {
        for (let tab = 0; tab < doc.GetTableCount(); tab++) {
          if (kind === "show" && doc.IsVisible(tab)) continue;
          doc.GetName(tab, name);
          names.push(text(name));
          if (kind === "select" && data.GetMarkData().GetTableSelect(tab)) selected.push(tab);
        }
      } finally {
        name.dispose();
      }
      if (kind === "show" && names.length) selected.push(0);
      const completion =
        kind === "show" ? new SfxRequest(request.GetSlot(), args, request.GetCallMode()) : request;
      if (kind === "show") request.Ignore();
      const result = await this.tabDialogs.Request({ kind, names, selected });
      if (
        result.kind !== "accepted" ||
        typeof result.result === "string" ||
        view !== this.controller.GetViewShell()
      ) {
        if (kind === "select") request.Ignore();
        return;
      }
      const rows = result.result;
      if (kind === "show") {
        const namesToShow = rows.map(
          /** Resolves the original row to the snapshot's sheet name. @param row - Selected row. @returns Name. */
          (row) => names[row] as string,
        );
        for (const name of namesToShow) completion.AppendItem(new SfxStringItem(which, name));
        this.ShowNamedTables(namesToShow);
        completion.Done();
      } else {
        request.AppendItem(new SfxIntegerListItem(which, rows));
        if (rows.length) {
          view.SelectTables(rows);
          request.Done();
        }
      }
    }
    this.controller.SyncSheetView();
  }

  /** Supplies source OUString values and releases them after the view operation. @param names - Target sheet names. @returns Nothing. */
  private ShowNamedTables(names: readonly string[]): void {
    const values = names.map(unicode);
    try {
      this.controller.GetViewShell().ShowTable(values);
    } finally {
      for (const value of values) value.dispose();
    }
  }

  /** Cancels the native async request before the session destroys its document. @returns Nothing. */
  Close(): void {
    this.options.Close();
    this.clipboard.Close();
    this.conditionals.Close();
    this.labelRanges.Close();
    this.managing = undefined;
    this.creatingNames?.abort();
    const createNames = this.createNamesDialogs.GetSnapshot();
    if (createNames) this.createNamesDialogs.Cancel(createNames.id);
    const manager = this.nameManagerDialogs.GetSnapshot();
    if (manager) this.nameManagerDialogs.Cancel(manager.id);
    const paste = this.namePasteDialogs.GetSnapshot();
    if (paste) this.namePasteDialogs.Cancel(paste.id);
    const name = this.nameDialogs.GetSnapshot();
    if (name) this.nameDialogs.Cancel(name.id);
    const headerFooter = this.headerFooterDialogs.GetSnapshot();
    if (headerFooter) this.headerFooterDialogs.Cancel(headerFooter.id);
    const style = this.pageStyleDialogs.GetSnapshot();
    if (style) this.pageStyleDialogs.Cancel(style.id);
    const print = this.printDialogs.GetSnapshot();
    if (print) this.printDialogs.Cancel(print.id);
    const tab = this.tabDialogs.GetSnapshot();
    if (tab) this.tabDialogs.Cancel(tab.id);
    const width = this.metricDialogs.GetSnapshot();
    if (width) this.metricDialogs.Cancel(width.id);
    const request = this.dialogs.GetSnapshot();
    if (request) this.dialogs.Cancel(request.id);
  }
}
