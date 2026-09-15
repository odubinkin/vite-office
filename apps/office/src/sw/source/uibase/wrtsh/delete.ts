/**
 * @fileoverview Applies Writer edit grouping rules from pinned LibreOffice
 * `sw/source/uibase/wrtsh/delete.cxx` and its SwUndo grouping collaborators.
 */

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
