/** @fileoverview Implements the bounded Writer list context shell from `listsh.cxx`. */

import type { SfxInterface } from "../../../../sfx2/source/control/objface";
import { createSfxShell, type SfxShell } from "../../../../sfx2/source/control/shell";
import { isWriterParagraphListKind, type WriterParagraphListKind } from "../../core/doc/list";
import { SwTextNode } from "../../core/txtnode/ndtxt";
import { SetNumRuleMode, type SwDoc } from "../../core/doc/doc";
import type { SwPaM } from "../../core/crsr/pam";
import { SfxListUndoAction, type SfxUndoAction } from "../../../../svl/source/undo/undo";
import { SfxItemSet } from "../../../../svl/source/items/itemset";
import {
  RES_MARGIN_FIRSTLINE,
  RES_MARGIN_TEXTLEFT,
  RES_MARGIN_RIGHT,
  WRITER_TEXT_NODE_WHICH_RANGES,
} from "../../../inc/hintids";
import { SwUndoDelNum, SwUndoInsNum } from "../../core/undo/unnum";
import type { SwUndoCursorState } from "../../core/undo/undobj";
import type { SwUndoRedoContext } from "../../core/undo/undobj";
import { WRITER_COMMAND_IDS } from "../../../uiconfig/swriter/menubar/menubar-commands";
import { createWriterInterface } from "../../../sdi/swriter";
import {
  canChangeWriterParagraphListLevel,
  changeWriterParagraphListLevel,
  type WriterListLevelCommand,
} from "../../core/edit/ednumber";

/** Minimal SwWrtShell surface consumed by the active list context. */
export interface SwListShellTarget {
  readonly ApplyAction: (
    action: SfxUndoAction<SwUndoRedoContext>,
    tryMerge?: boolean,
    execute?: () => void,
  ) => boolean;
  readonly CaptureCursorState: () => SwUndoCursorState;
  readonly GetActiveParagraph: () => SwTextNode;
  readonly GetCursor: () => SwPaM;
  readonly GetDoc: () => SwDoc;
}

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
    return changeWriterParagraphListLevel(this.wrtShell, command);
  }

  /** Reports whether every selected list node can move in this direction. @param command - Level direction. @returns Whether enabled. */
  public CanExecute(command: WriterListLevelCommand): boolean {
    return canChangeWriterParagraphListLevel(this.wrtShell, command);
  }

  /** Applies or removes numbering over every selected native paragraph. @param kind - Requested list kind. @returns Whether a command changed list state. */
  public SetParagraphListKind(kind: WriterParagraphListKind): boolean {
    if (!isWriterParagraphListKind(kind))
      throw new Error("Unsupported Writer paragraph list kind: " + kind);
    const doc = this.wrtShell.GetDoc(),
      range = this.wrtShell.GetCursor(),
      cursor = this.wrtShell.CaptureCursorState();
    const nodes: SwTextNode[] = [];
    for (let index = range.Start().GetNodeIndex(); index <= range.End().GetNodeIndex(); index++) {
      const node = doc.GetNodes().at(index);
      if (node instanceof SwTextNode) nodes.push(node);
    }
    if (kind === "none") {
      if (
        !nodes.some(
          /** Checks native numbering presence. @param node - Selected node. @returns Whether numbered. */ (
            node,
          ) => node.GetNumRule() !== undefined,
        )
      )
        return false;
      return this.wrtShell.ApplyAction(new SwUndoDelNum(doc, cursor));
    }
    if (this.GetKind() === kind) return false;
    const listId = { value: "" },
      rule =
        doc.SearchNumRule(range.GetPoint(), false, kind === "numbered", false, 0, listId) ??
        doc.GetDocumentListsManager().CreateAutomaticNumRule(kind);
    const action = new SfxListUndoAction<SwUndoRedoContext>("Numbering");
    return this.wrtShell.ApplyAction(
      action,
      false,
      /** Executes the document range operation and records its actual direct attribute results. @returns Nothing. */ () => {
        const before = nodes.map(
          /** Captures supported native list and indent items. @param node - Current node. @returns Independent history. */ (
            node,
          ) => {
            const items = new SfxItemSet(doc.GetAttrPool(), WRITER_TEXT_NODE_WHICH_RANGES);
            items.PutSet(node.CaptureListItems());
            for (const which of [RES_MARGIN_FIRSTLINE, RES_MARGIN_TEXTLEFT, RES_MARGIN_RIGHT]) {
              const item = node.GetpSwAttrSet()?.GetItemIfSet(which, false);
              if (item !== undefined) items.Put(item);
            }
            return { node, items };
          },
        );
        doc.SetNumRule(range, rule, SetNumRuleMode.ResetIndentAttrs, listId.value);
        doc.SetCounted(range, true);
        for (const entry of before) {
          const after = new SfxItemSet(doc.GetAttrPool(), WRITER_TEXT_NODE_WHICH_RANGES);
          after.PutSet(entry.node.CaptureListItems());
          for (const which of [RES_MARGIN_FIRSTLINE, RES_MARGIN_TEXTLEFT, RES_MARGIN_RIGHT]) {
            const item = entry.node.GetpSwAttrSet()?.GetItemIfSet(which, false);
            if (item !== undefined) after.Put(item);
          }
          action.AddAction(new SwUndoInsNum(entry.node, entry.items, after, cursor, cursor));
        }
      },
    );
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

  /** Returns the active paragraph list family. @returns Current list kind. */
  public GetKind(): WriterParagraphListKind {
    const doc = this.wrtShell.GetDoc(),
      range = this.wrtShell.GetCursor();
    let kind: WriterParagraphListKind | undefined;
    for (let index = range.Start().GetNodeIndex(); index <= range.End().GetNodeIndex(); index++) {
      const node = doc.GetNodes().at(index);
      if (!(node instanceof SwTextNode)) continue;
      const current = node.GetListKind();
      if (kind !== undefined && kind !== current) return "none";
      kind = current;
    }
    return kind ?? "none";
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
