/** @fileoverview Routes represented Writer NumUpDown commands to the document-owned native node range and delta history. */
import { SwUndoNumUpDown } from "../undo/unnum";
import type { SwUndoCursorState } from "../undo/undobj";
import type { SwDoc } from "../doc/doc";
import type { SwPaM } from "../crsr/pam";

/** Supported direction for the bounded NumUpDown operation. */
export type WriterListLevelCommand = "demote" | "promote";

/** Shell state and history boundary for the document-owned numbering operation. */
export interface WriterIndentTarget {
  ApplyAction(action: SwUndoNumUpDown): boolean;
  CaptureCursorState(): SwUndoCursorState;
  GetCursor(): SwPaM;
  GetDoc(): SwDoc;
}

/** Queries the native document range used by execution. @param target - Editing shell. @param command - Level direction. @returns Whether eligible. */
export function canChangeWriterParagraphListLevel(
  target: WriterIndentTarget,
  command: WriterListLevelCommand,
): boolean {
  return target.GetDoc().CanNumUpDown(target.GetCursor(), command === "demote");
}

/** Applies one range-and-direction numbering undo action. @param target - Shell operation target. @param command - Level transition. @returns Whether changed. */
export function changeWriterParagraphListLevel(
  target: WriterIndentTarget,
  command: WriterListLevelCommand,
): boolean {
  if (command !== "demote" && command !== "promote")
    throw new Error(`Unsupported Writer list-level command: ${command}`);
  if (!canChangeWriterParagraphListLevel(target, command)) return false;
  return target.ApplyAction(
    new SwUndoNumUpDown(target.CaptureCursorState(), command === "demote" ? 1 : -1),
  );
}
