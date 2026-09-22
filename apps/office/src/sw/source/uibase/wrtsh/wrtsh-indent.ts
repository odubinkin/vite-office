/** @fileoverview Implements the bounded `MoveLeftMargin` and `NumUpDown` branch used by Writer text-shell indent commands. */

import {
  createWriterListItemSet,
  projectWriterParagraphList,
  WRITER_MAX_LIST_LEVEL,
} from "../../core/doc/list";
import type { SwTextNode } from "../../core/txtnode/ndtxt";
import { SwUndoMoveLeftMargin } from "../../core/undo/unattr";
import { SwUndoNumLevel } from "../../core/undo/unnum";
import type { SwUndoCursorState } from "../../core/undo/undobj";
import type { WriterListLevelCommand } from "../shells/listsh";

/** Writer's default tab distance used by `MoveLeftMargin`, in twips (2 cm). */
export const WRITER_PARAGRAPH_INDENT_STEP = 1134;

/** Minimal SwWrtShell surface shared by upstream-shaped list-level and text-indent transitions. */
export interface WriterIndentTarget {
  ApplyAction(action: SwUndoNumLevel | SwUndoMoveLeftMargin): boolean;
  CaptureCursorState(): SwUndoCursorState;
  GetActiveParagraph(): SwTextNode;
}

/** Promotes or demotes the active list paragraph through one numbering undo action. @param target - Shell operation target. @param command - List-level transition. @returns Whether content changed. */
export function changeWriterParagraphListLevel(
  target: WriterIndentTarget,
  command: WriterListLevelCommand,
): boolean {
  if (command !== "demote" && command !== "promote")
    throw new Error(`Unsupported Writer list-level command: ${command}`);
  const paragraph = target.GetActiveParagraph();
  if (paragraph.GetListKind() === "none") return false;
  const level = paragraph.GetAttrListLevel() + (command === "demote" ? 1 : -1);
  if (level < 0 || level > WRITER_MAX_LIST_LEVEL) return false;
  const cursor = target.CaptureCursorState();
  const before = paragraph.CaptureListItems();
  return target.ApplyAction(
    new SwUndoNumLevel(
      paragraph,
      before,
      createWriterListItemSet(paragraph, { ...projectWriterParagraphList(paragraph), level }),
      cursor,
      cursor,
    ),
  );
}

/** Implements the text-shell indent branch: list level for list paragraphs and text-left margin otherwise. @param target - Shell operation target. @param increase - Whether indentation increases. @returns Whether content changed. */
export function changeWriterParagraphIndent(
  target: WriterIndentTarget,
  increase: boolean,
): boolean {
  const paragraph = target.GetActiveParagraph();
  if (paragraph.GetListKind() !== "none")
    return changeWriterParagraphListLevel(target, increase ? "demote" : "promote");
  const before = paragraph.GetParagraphTextLeftMargin();
  const after = Math.max(
    0,
    before + (increase ? WRITER_PARAGRAPH_INDENT_STEP : -WRITER_PARAGRAPH_INDENT_STEP),
  );
  if (before === after) return false;
  const cursor = target.CaptureCursorState();
  return target.ApplyAction(new SwUndoMoveLeftMargin(paragraph, before, after, cursor, cursor));
}

/** Mirrors text-shell enabled state for the active paragraph's generic indent commands. @param paragraph - Active paragraph. @param increase - Whether indentation increases. @returns Whether enabled. */
export function canChangeWriterParagraphIndent(paragraph: SwTextNode, increase: boolean): boolean {
  if (paragraph.GetListKind() !== "none")
    return increase
      ? paragraph.GetAttrListLevel() < WRITER_MAX_LIST_LEVEL
      : paragraph.GetAttrListLevel() > 0;
  return increase || paragraph.GetParagraphTextLeftMargin() > 0;
}
