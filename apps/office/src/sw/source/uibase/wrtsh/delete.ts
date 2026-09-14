/**
 * @fileoverview Applies Writer edit grouping rules from pinned LibreOffice
 * `sw/source/uibase/wrtsh/delete.cxx` and its SwUndo grouping collaborators.
 */

import type { SwUndoDeleteDirection, SwUndoDeleteGroup } from "../../core/undo/undel";
import type { SwUndoCursorState } from "../../core/undo/undobj";
import type { SwUndoInsertGroup } from "../../core/undo/unins";

/** Applies SwUndoInsert::CanGrouping preconditions to browser input. @param change - Exact insertion. @param inputType - Native edit kind. @param before - Canonical cursor before input. @param nextCaretOffset - Native caret after input. @returns Character group when compatible. */
export function getWriterInsertGroup(
  change: Readonly<{ kind: "insert"; offset: number; text: string }>,
  inputType: string,
  before: SwUndoCursorState,
  nextCaretOffset: number | undefined,
): SwUndoInsertGroup | undefined {
  if (
    inputType !== "insertText" ||
    nextCaretOffset !== change.offset + change.text.length ||
    before.mark !== undefined ||
    before.point.offset !== change.offset
  )
    return undefined;
  return getWriterTypingCharacterClass(change.text);
}

/** Applies SwUndoDelete::CanGrouping position and direction rules. @param change - Exact deletion. @param inputType - Native edit kind. @param before - Canonical cursor before input. @param nextCaretOffset - Native caret after input. @returns Direction and class when compatible. */
export function getWriterDeleteGrouping(
  change: Readonly<{ kind: "delete"; end: number; start: number; text: string }>,
  inputType: string,
  before: SwUndoCursorState,
  nextCaretOffset: number | undefined,
): Readonly<{ direction: SwUndoDeleteDirection; group: SwUndoDeleteGroup }> | undefined {
  if (change.text.length !== 1 || before.mark !== undefined) return undefined;
  const group = /[\p{L}\p{N}]/u.test(change.text) ? "word" : "delimiter";
  if (
    inputType === "deleteContentBackward" &&
    before.point.offset === change.end &&
    nextCaretOffset === change.start
  )
    return { direction: "backspace", group };
  if (
    inputType === "deleteContentForward" &&
    before.point.offset === change.start &&
    nextCaretOffset === change.start
  )
    return { direction: "delete", group };
  return undefined;
}

/** Classifies one grouped edit as alphanumeric word or delimiter input. @param text - Non-empty changed text. @returns Shared class or undefined for mixed input. */
export function getWriterTypingCharacterClass(text: string): "delimiter" | "word" | undefined {
  const characters = [...text];
  const firstCharacter = characters[0];
  /* c8 ignore next -- detected insertions and deletions always contain text. */
  if (firstCharacter === undefined) return undefined;
  const firstIsWord = /[\p{L}\p{N}]/u.test(firstCharacter);
  return characters.every(
    /** Compares one character class with the first changed character. @param character - Changed character. @returns Whether its class matches. */
    (character) => /[\p{L}\p{N}]/u.test(character) === firstIsWord,
  )
    ? firstIsWord
      ? "word"
      : "delimiter"
    : undefined;
}
