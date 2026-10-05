/** @fileoverview Implements the bounded Writer list context shell from `listsh.cxx`. */

import type { SfxInterface } from "../../../../sfx2/source/control/objface";
import { createSfxShell, type SfxShell } from "../../../../sfx2/source/control/shell";
import {
  isWriterParagraphListKind,
  createWriterListItemSet,
  type WriterParagraphListKind,
} from "../../core/doc/list";
import { SwTextNode } from "../../core/txtnode/ndtxt";
import type { SwDoc } from "../../core/doc/doc";
import type { SwPaM } from "../../core/crsr/pam";
import { SfxStringItem } from "../../../../svl/source/items/stritem";
import type { SfxUndoAction } from "../../../../svl/source/undo/undo";
import {
  RES_PARATR_LIST_ID,
  RES_PARATR_LIST_ISRESTART,
  RES_PARATR_LIST_ISCOUNTED,
} from "../../../inc/hintids";
import { SwNumRuleItem } from "../../core/para/paratr";
import { SwUndoContinueNumbering, SwUndoInsNum } from "../../core/undo/unnum";
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
  readonly ApplyAction: (action: SfxUndoAction<SwUndoRedoContext>) => boolean;
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

  /** Applies or removes the active paragraph's bounded list rule. @param kind - Next list kind. @returns Whether changed. */
  public SetParagraphListKind(kind: WriterParagraphListKind): boolean {
    if (!isWriterParagraphListKind(kind))
      throw new Error(`Unsupported Writer paragraph list kind: ${kind}`);
    const paragraph = this.wrtShell.GetActiveParagraph();
    if (paragraph.GetListKind() === kind) return false;
    const cursor = this.wrtShell.CaptureCursorState();
    const before = paragraph.CaptureListItems();
    return this.wrtShell.ApplyAction(
      new SwUndoInsNum(
        paragraph,
        before,
        createWriterListItemSet(paragraph, { kind, level: paragraph.GetAttrListLevel() }),
        cursor,
        cursor,
      ),
    );
  }

  /** Continues the nearest native list across every selected paragraph, including table cells. @returns Whether list attributes changed. */
  public ContinueNumbering(): boolean {
    const doc = this.wrtShell.GetDoc();
    const cursor = this.wrtShell.GetCursor();
    const listId = { value: "" };
    const rule =
      doc.SearchNumRule(cursor.Start(), false, true, false, -1, listId) ??
      doc.SearchNumRule(cursor.Start(), false, false, false, -1, listId);
    if (rule === undefined) return false;
    const items = [];
    let changed = false;
    for (let index = cursor.Start().GetNodeIndex(); index <= cursor.End().GetNodeIndex(); index++) {
      const node = doc.GetNodes().at(index);
      if (!(node instanceof SwTextNode)) continue;
      const before = node.CaptureListItems(),
        after = before.Clone();
      if (node.IsListRestart() && node.GetNumRule() !== rule) {
        after.ClearItem(RES_PARATR_LIST_ISRESTART);
      }
      after.Put(new SwNumRuleItem(rule.GetName()));
      after.Put(new SfxStringItem(RES_PARATR_LIST_ID, listId.value));
      after.ClearItem(RES_PARATR_LIST_ISCOUNTED);
      changed ||= !before.Equals(after, true);
      items.push({ paragraph: node, before, after });
    }
    if (!changed) return false;
    return this.wrtShell.ApplyAction(
      new SwUndoContinueNumbering(items, this.wrtShell.CaptureCursorState()),
    );
  }

  /** Returns the active paragraph list family. @returns Current list kind. */
  public GetKind(): WriterParagraphListKind {
    return this.wrtShell.GetActiveParagraph().GetListKind();
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
