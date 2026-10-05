/** @fileoverview Implements the bounded Writer list context shell from `listsh.cxx`. */

import type { SfxInterface } from "../../../../sfx2/source/control/objface";
import { createSfxShell, type SfxShell } from "../../../../sfx2/source/control/shell";
import { isWriterParagraphListKind, type WriterParagraphListKind } from "../../core/doc/list";
import { SwTextNode } from "../../core/txtnode/ndtxt";
import { SetNumRuleMode } from "../../core/doc/doc";
import { SfxListUndoAction } from "../../../../svl/source/undo/undo";
import type { SfxItemSet } from "../../../../svl/source/items/itemset";
import { SwUndoInsNum } from "../../core/undo/unnum";
import type { SwUndoRedoContext } from "../../core/undo/undobj";
import { WRITER_COMMAND_IDS } from "../../../uiconfig/swriter/menubar/menubar-commands";
import { createWriterInterface } from "../../../sdi/swriter";
import type { SwEditShell, WriterListLevelCommand } from "../../core/edit/ednumber";

/** Native editing-shell surface used directly by the list context. */
export type SwListShellTarget = Pick<
  SwEditShell,
  | "ApplyAction"
  | "CaptureCursorState"
  | "GetCursor"
  | "GetDoc"
  | "SetCurNumRule"
  | "DelNumRules"
  | "CanNumUpDown"
  | "NumUpDown"
  | "SelectionHasNumber"
  | "SelectionHasBullet"
>;

/** Context-sensitive shell that owns list execution and state. */
export class SwListShell {
  private readonly commandShell: SfxShell;

  /** Creates the active list shell. @param wrtShell - Editing shell target. @returns Nothing. */
  public constructor(private readonly wrtShell: SwListShellTarget) {
    this.commandShell = createSfxShell(this, createListCommandRegistry(this));
  }

  /** Returns the Sfx dispatch shell. @returns Command shell. */
  public GetCommandShell(): SfxShell {
    return this.commandShell;
  }

  /** Executes a list-level operation. @param command - Promote or demote. @returns Whether changed. */
  public Execute(command: WriterListLevelCommand): boolean {
    if (command !== "demote" && command !== "promote")
      throw new Error("Unsupported Writer list-level command: " + command);
    return this.wrtShell.NumUpDown(command === "demote");
  }

  /** Reports whether a native normalized range can move in this direction. @param command - Level direction. @returns Whether enabled. */
  public CanExecute(command: WriterListLevelCommand): boolean {
    return this.wrtShell.CanNumUpDown(command === "demote");
  }

  /** Applies or removes numbering over every selected native paragraph. @param kind - Requested list kind. @returns Whether a command changed list state. */
  public SetParagraphListKind(kind: WriterParagraphListKind): boolean {
    if (!isWriterParagraphListKind(kind))
      throw new Error("Unsupported Writer paragraph list kind: " + kind);
    const doc = this.wrtShell.GetDoc(),
      range = this.wrtShell.GetCursor();
    if (kind === "none") return this.wrtShell.DelNumRules();
    if (this.GetKind() === kind) return false;
    const listId = { value: "" },
      rule =
        doc.SearchNumRule(range.GetPoint(), false, kind === "numbered", false, 0, listId) ??
        doc.GetDocumentListsManager().CreateAutomaticNumRule(kind);
    return this.wrtShell.SetCurNumRule(rule, false, listId.value, true);
  }

  /** Continues the nearest native list across every selected paragraph, including table cells. @returns Whether list attributes changed. */
  public ContinueNumbering(): boolean {
    const doc = this.wrtShell.GetDoc(),
      range = this.wrtShell.GetCursor(),
      cursor = this.wrtShell.CaptureCursorState(),
      listId = { value: "" };
    const rule =
      doc.SearchNumRule(range.Start(), false, true, false, -1, listId) ??
      doc.SearchNumRule(range.Start(), false, false, false, -1, listId);
    if (rule === undefined) return false;
    const before: { node: SwTextNode; items: SfxItemSet }[] = [];
    let changed = false;
    for (let index = range.Start().GetNodeIndex(); index <= range.End().GetNodeIndex(); index++) {
      const node = doc.GetNodes().at(index);
      if (!(node instanceof SwTextNode)) continue;
      changed ||=
        node.GetNumRule() !== rule || node.GetListId() !== listId.value || !node.IsCountedInList();
      before.push({ node, items: node.CaptureListItems() });
    }
    if (!changed) return false;
    const action = new SfxListUndoAction<SwUndoRedoContext>("Continue Numbering");
    return this.wrtShell.ApplyAction(
      action,
      false,
      /** Applies native restart/rule/count policy before recording actual attribute history. @returns Nothing. */ () => {
        for (const entry of before)
          if (entry.node.IsListRestart() && entry.node.GetNumRule() !== rule)
            entry.node.SetListRestart(false);
        doc.SetNumRule(range, rule, SetNumRuleMode.Default, listId.value);
        doc.SetCounted(range, true);
        for (const entry of before)
          action.AddAction(
            new SwUndoInsNum(
              entry.node,
              entry.items,
              entry.node.CaptureListItems(),
              cursor,
              cursor,
            ),
          );
      },
    );
  }

  /** Returns the native selection list family. @returns Current list kind. */
  public GetKind(): WriterParagraphListKind {
    if (this.wrtShell.SelectionHasNumber()) return "numbered";
    if (this.wrtShell.SelectionHasBullet()) return "bullet";
    return "none";
  }

  /** Reports native continuation availability independently of the active paragraph's list kind. @returns Whether an earlier list was found. */
  public CanContinueNumbering(): boolean {
    const doc = this.wrtShell.GetDoc(),
      start = this.wrtShell.GetCursor().Start(),
      listId = { value: "" };
    return (
      (doc.SearchNumRule(start, false, true, false, -1, listId) ??
        doc.SearchNumRule(start, false, false, false, -1, listId)) !== undefined
    );
  }
}

/** Builds the bounded list toolbar registry using generated slot/resource identity. @param target - Active list shell. @returns Command registry. */
function createListCommandRegistry(target: SwListShell): SfxInterface<SwListShell> {
  return createWriterInterface([
    ...(["bullet", "numbered", "none"] as const).map(
      /** Creates one list-kind command owned by listsh. @param kind - Requested list kind. @returns Descriptor. */ (
        kind,
      ) => {
        const id = {
          bullet: WRITER_COMMAND_IDS.unorderedList,
          none: WRITER_COMMAND_IDS.removeBullets,
          numbered: WRITER_COMMAND_IDS.orderedList,
        }[kind];
        return {
          capabilityId: "CAP-0105" as const,
          execute:
            /** Applies or toggles the captured list kind. @returns Whether changed. */ (): boolean =>
              target.SetParagraphListKind(
                kind !== "none" && target.GetKind() === kind ? "none" : kind,
              ),
          id,
          isChecked: /** Reads active list kind. @returns Checked state. */ (): boolean =>
            target.GetKind() === kind,
        };
      },
    ),
    ...(["promote", "demote"] as const).map(
      /** Creates one list command descriptor. @param command - List-level operation. @returns Command descriptor. */ (
        command,
      ) => {
        const id = command === "promote" ? WRITER_COMMAND_IDS.promote : WRITER_COMMAND_IDS.demote;
        return {
          capabilityId: "CAP-0107" as const,
          execute: /** Executes the bound list command. @returns Whether changed. */ (): boolean =>
            target.Execute(command),
          id,
          isEnabled:
            /** Computes context-sensitive list enablement. @returns Whether enabled. */ (): boolean =>
              target.CanExecute(command),
        };
      },
    ),
    {
      capabilityId: "CAP-0105" as const,
      execute:
        /** Joins the selected list to the nearest earlier one. @returns Whether changed. */ () =>
          target.ContinueNumbering(),
      id: WRITER_COMMAND_IDS.continueNumbering,
      isEnabled:
        /** Reads native preceding-list search availability. @returns Whether eligible. */ () =>
          target.CanContinueNumbering(),
    },
  ]);
}
