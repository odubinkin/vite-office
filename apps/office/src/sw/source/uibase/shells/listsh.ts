/** @fileoverview Implements the bounded Writer list context shell from `listsh.cxx`. */

import type { SfxInterface } from "../../../../sfx2/source/control/objface";
import { createSfxShell, type SfxShell } from "../../../../sfx2/source/control/shell";
import {
  isWriterParagraphListKind,
  createWriterListItemSet,
  type WriterParagraphListKind,
} from "../../core/doc/list";
import type { SwTextNode } from "../../core/txtnode/ndtxt";
import type { SwDoc } from "../../core/doc/doc";
import type { SwPaM } from "../../core/crsr/pam";
import { SfxStringItem } from "../../../../svl/source/items/stritem";
import type { SfxUndoAction } from "../../../../svl/source/undo/undo";
import {
  RES_PARATR_LIST_ID,
  RES_PARATR_LIST_ISRESTART,
  RES_PARATR_LIST_RESTARTVALUE,
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

  /** Continues the nearest preceding compatible list for the current selected list range. @returns Whether a list was joined. */
  public ContinueNumbering(): boolean {
    const paragraphs = this.wrtShell.GetDoc().paragraphs;
    const cursor = this.wrtShell.GetCursor();
    const pointIndex = paragraphs.indexOf(cursor.GetPoint().GetNode() as SwTextNode);
    const markIndex = paragraphs.indexOf(cursor.GetMark().GetNode() as SwTextNode);
    /* v8 ignore next -- Shell cursor endpoints always belong to the live document. */
    if (pointIndex < 0 || markIndex < 0) return false;
    const start = Math.min(pointIndex, markIndex);
    const end = Math.max(pointIndex, markIndex);
    const active = this.wrtShell.GetActiveParagraph();
    const currentId = active.GetListId();
    const kind = active.GetListKind();
    if (kind === "none") return false;
    const selected = paragraphs.slice(start, end + 1).filter(
      /** Keeps only items belonging to the active list. @param node - Candidate paragraph. @returns Whether selected. */
      (node) => node.GetListId() === currentId && node.GetListKind() === kind,
    );
    const first = paragraphs.indexOf(selected[0] as SwTextNode);
    const previous = paragraphs
      .slice(0, first)
      .reverse()
      .find(
        /** Finds the nearest different list with the same marker family. @param node - Earlier paragraph. @returns Whether compatible. */
        (node) => node.GetListKind() === kind && node.GetListId() !== currentId,
      );
    if (previous === undefined) return false;
    const items = selected.map(
      /** Builds one exact list-item transition. @param node - Selected paragraph. @returns Before and after sets. */
      (node) => {
        const before = node.CaptureListItems();
        const after = before.Clone();
        after.Put(new SwNumRuleItem(previous.GetNumRuleName()));
        after.Put(new SfxStringItem(RES_PARATR_LIST_ID, previous.GetListId()));
        after.ClearItem(RES_PARATR_LIST_ISRESTART);
        after.ClearItem(RES_PARATR_LIST_RESTARTVALUE);
        return { paragraph: node, before, after };
      },
    );
    return this.wrtShell.ApplyAction(
      new SwUndoContinueNumbering(items, this.wrtShell.CaptureCursorState()),
    );
  }

  /** Returns the active paragraph list family. @returns Current list kind. */
  public GetKind(): WriterParagraphListKind {
    return this.wrtShell.GetActiveParagraph().GetListKind();
  }

  /** Reports whether the active paragraph belongs to a list. @returns Whether in a list. */
  public IsInList(): boolean {
    return this.wrtShell.GetActiveParagraph().GetListKind() !== "none";
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
        /** Checks that the active paragraph has a list. @returns Whether eligible. */ () =>
          target.IsInList(),
    },
  ]);
}
