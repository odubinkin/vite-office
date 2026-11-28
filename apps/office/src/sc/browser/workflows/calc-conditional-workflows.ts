/** @fileoverview Browser dispatch of source conditional-format manager and reference dialogs. */
import { ScConditionMode } from "../../inc/conditio";
import { SfxDialogController } from "../../../sfx2/source/dialog/basedlgs";
import {
  ConditionalSelection,
  FindConditionalFormat,
  ScCondFormatDlg,
  type ConditionalFormatResult,
} from "../../source/ui/condformat/condformatdlg";
import {
  ScCondFormatManagerDlg,
  type ConditionalManagerResult,
} from "../../source/ui/condformat/condformatmgr";
import type { ConditionalRuleKind } from "../../source/ui/condformat/condformatdlgentry";
import type { CalcViewController } from "../controller/calc-view-controller";

/** Original cell-shell conditional format command slots. */
export const conditionalFormatCommands = [
  [".uno:ConditionalFormatEasy", 26192, "Highlight cells", "easy"],
  [".uno:ConditionalFormatDialog", 26159, "Condition", "condition"],
  [".uno:CurrentConditionalFormatDialog", 26158, "Edit Conditional Formatting", "current"],
  [".uno:ColorScaleFormatDialog", 26166, "Color Scale", "scale3"],
  [".uno:CondDateFormatDialog", 26169, "Date", "date"],
  [".uno:ConditionalFormatManagerDialog", 26162, "Manage Conditional Formatting", "manager"],
  [".uno:CurrentConditionalFormatManagerDialog", 26164, "Manage Conditional Formatting", "manager"],
] as const;

/** Conditional format dialog mode from an original command slot. */
type ConditionalCommand = (typeof conditionalFormatCommands)[number][3];

/** Owns the two original asynchronous dialog requests and commits against the opening sheet. */
export class CalcConditionalWorkflows {
  readonly editors = new SfxDialogController<ScCondFormatDlg, ConditionalFormatResult>();
  readonly managers = new SfxDialogController<ScCondFormatManagerDlg, ConditionalManagerResult>();
  private running = false;
  private closed = false;

  /** Binds the original source view. @param controller - Live Calc view. @returns Workflow. */
  constructor(private readonly controller: CalcViewController) {}

  /** Returns whether the source conditional-format flow owns a dialog. @returns Active flow. */
  IsOpen(): boolean {
    return this.running;
  }

  /** Checks whether conditional formatting can be edited at the active sheet. @param kind - Source mode. @returns Enabled state. */
  CanExecute(kind?: ConditionalCommand): boolean {
    const view = this.controller.viewData;
    const tab = view.CurrentTabForData();
    const doc = view.GetDocument();
    return (
      !this.closed &&
      !this.running &&
      !!doc.FetchTable(tab) &&
      !doc.IsTabProtected(tab) &&
      (kind !== "current" || !!FindConditionalFormat(view, true))
    );
  }

  /** Selects the source direct editor or manager route. @param kind - Source command. @param rule - Optional typed source quick-format operation. @returns Native acceptance. */
  async Execute(kind: ConditionalCommand, rule?: ScConditionMode): Promise<boolean> {
    if (!this.CanExecute(kind) || !this.controller.Commit()) return false;
    this.running = true;
    const view = this.controller.viewData;
    const tab = view.CurrentTabForData();
    const doc = view.GetDocument();
    const shell = this.controller.shell;
    try {
      if (kind === "manager") return await this.Manage(new ScCondFormatManagerDlg(doc, tab));
      const easy = kind === "easy";
      const entry = easy ? undefined : FindConditionalFormat(view, kind === "current");
      const model = new ScCondFormatDlg(
        doc,
        tab,
        ConditionalSelection(view),
        kind === "current" || easy ? "condition" : kind,
        entry,
        easy ? (rule ?? ScConditionMode.Greater) : undefined,
      );
      const result = await this.editors.Request(model);
      if (result.kind !== "accepted") return false;
      const { format, ranges } = result.result;
      if (this.closed || shell.GetDocument() !== doc) {
        format?.Dispose();
        return false;
      }
      return shell.GetDocFunc().ReplaceConditionalFormat(model.key, format, tab, ranges);
    } finally {
      this.running = false;
    }
  }

  /** Mediates the original manager → rule editor → manager response loop. @param model - Draft list owner. @returns Whether the live workbook changed. */
  private async Manage(model: ScCondFormatManagerDlg): Promise<boolean> {
    const shell = this.controller.shell;
    try {
      while (!this.closed && shell.GetDocument() === model.document) {
        const response = await this.managers.Request(model);
        if (response.kind !== "accepted" || shell.GetDocument() !== model.document) return false;
        const action = response.result;
        if (action.kind === "apply") {
          const list = model.TakeResult();
          return list ? shell.GetDocFunc().SetConditionalFormatList(list, model.tab) : false;
        }
        const previous =
          action.kind === "edit"
            ? model
                .GetFormats()
                .find(
                  /** Finds the staged format entry selected by the manager action. @param entry - Conditional format candidate. @returns Whether the format key matches. */ (
                    entry,
                  ) => entry.GetKey() === action.key,
                )
            : undefined;
        const selection = ConditionalSelection(this.controller.viewData);
        const editor = new ScCondFormatDlg(
          model.document,
          model.tab,
          selection,
          "condition" satisfies ConditionalRuleKind,
          previous,
        );
        const result = await this.editors.Request(editor);
        if (result.kind === "accepted") model.Edit(editor.key, result.result.format);
      }
      return false;
    } finally {
      model.Dispose();
    }
  }

  /** Cancels the active source request on document-session teardown. @returns Nothing. */
  Close(): void {
    this.closed = true;
    const editor = this.editors.GetSnapshot();
    if (editor) this.editors.Cancel(editor.id);
    const manager = this.managers.GetSnapshot();
    if (manager) this.managers.Cancel(manager.id);
  }
}
