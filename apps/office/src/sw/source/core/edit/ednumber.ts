/** @fileoverview Implements the supported SwEditShell::NumUpDown transition from pinned `sw/source/core/edit/ednumber.cxx`. */

import {
  createWriterListItemSet,
  projectWriterParagraphList,
  WRITER_MAX_LIST_LEVEL,
} from "../doc/list";
import type { SwTextNode } from "../txtnode/ndtxt";
import { SwUndoNumLevel } from "../undo/unnum";
import type { SwUndoCursorState } from "../undo/undobj";
import type { SwDoc } from "../doc/doc";
import type { SwPaM } from "../crsr/pam";
import { SfxListUndoAction } from "../../../../svl/source/undo/undo";
import type { SwUndoRedoContext } from "../undo/undobj";

/** Supported direction for the bounded NumUpDown operation. */
export type WriterListLevelCommand = "demote" | "promote";

/** Minimal SwWrtShell surface shared by upstream-shaped list-level and text-indent transitions. */
export interface WriterIndentTarget {
  ApplyAction(action: SwUndoNumLevel | SfxListUndoAction<SwUndoRedoContext>): boolean;
  CaptureCursorState(): SwUndoCursorState;
  GetActiveParagraph(): SwTextNode;
  GetCursor(): SwPaM;
  GetDoc(): SwDoc;
}

/** Returns list nodes in the inclusive selected range, as SwDoc::NumUpDown does for non-outline lists. @param target - Editing shell. @returns Selected list nodes. */
function getSelectedListNodes(target: WriterIndentTarget): readonly SwTextNode[] {
  const cursor = target.GetCursor();
  const start = cursor.Start().GetNodeIndex();
  const end = cursor.End().GetNodeIndex();
  return target
    .GetDoc()
    .paragraphs.filter(
      /** Keeps selected list nodes. @param node - Candidate. @returns Whether selected and listed. */ (
        node,
      ) => node.GetIndex() >= start && node.GetIndex() <= end && node.GetListKind() !== "none",
    );
}

/** Reports whether every selected list node can move one level. @param target - Editing shell. @param command - Level direction. @returns Whether eligible. */
export function canChangeWriterParagraphListLevel(
  target: WriterIndentTarget,
  command: WriterListLevelCommand,
): boolean {
  const nodes = getSelectedListNodes(target);
  return (
    nodes.length > 0 &&
    nodes.every(
      /** Checks one level boundary. @param node - Selected list node. @returns Whether movable. */ (
        node,
      ) =>
        command === "demote"
          ? node.GetAttrListLevel() < WRITER_MAX_LIST_LEVEL
          : node.GetAttrListLevel() > 0,
    )
  );
}

/** Promotes or demotes the active list paragraph through one numbering undo action. @param target - Shell operation target. @param command - List-level transition. @returns Whether content changed. */
export function changeWriterParagraphListLevel(
  target: WriterIndentTarget,
  command: WriterListLevelCommand,
): boolean {
  if (command !== "demote" && command !== "promote")
    throw new Error(`Unsupported Writer list-level command: ${command}`);
  if (!canChangeWriterParagraphListLevel(target, command)) return false;
  const cursor = target.CaptureCursorState();
  const actions = getSelectedListNodes(target).map(
    /** Builds one node's numbering transition. @param paragraph - Selected list node. @returns Undo action. */ (
      paragraph,
    ) =>
      new SwUndoNumLevel(
        paragraph,
        paragraph.CaptureListItems(),
        createWriterListItemSet(paragraph, {
          ...projectWriterParagraphList(paragraph),
          level: paragraph.GetAttrListLevel() + (command === "demote" ? 1 : -1),
        }),
        cursor,
        cursor,
      ),
  );
  if (actions.length === 1) return target.ApplyAction(actions[0] as SwUndoNumLevel);
  const group = new SfxListUndoAction<SwUndoRedoContext>("Numbering Level");
  for (const action of actions) group.AddAction(action);
  return target.ApplyAction(group);
}
