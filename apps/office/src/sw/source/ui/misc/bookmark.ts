/** @fileoverview Consumed BookmarkTable name proposal and SwInsertBookmarkDlg ModifyHdl/SelectionChanged contracts from pinned bookmark.cxx. */
import { toInt32 } from "../../../../o3tl/inc/string_view";
/** Original BookmarkTable forbidden characters;semicolon is the selection separator. */
export const BOOKMARK_FORBIDDEN_CHARACTERS = '/\\@*?",#';
/** Native represented button and row-selection values. */
export interface BookmarkDialogState {
  readonly selected: readonly string[];
  readonly insert: boolean;
  readonly remove: boolean;
  readonly navigate: boolean;
  readonly rename: boolean;
  readonly forbidden: boolean;
}
/** Original temporary sanitization and token-count admission;raw entry text is not rewritten. @param raw - Actual entry text. @param names - Actual document bookmark names. @param protectedMarks - Native protection state when represented by the caller. @returns Native control values. */
export function bookmarkModifyState(
  raw: string,
  names: readonly string[],
  protectedMarks = false,
): BookmarkDialogState {
  let temporary = raw;
  for (const character of BOOKMARK_FORBIDDEN_CHARACTERS)
    temporary = temporary.replaceAll(character, "");
  const forbidden = temporary.length !== raw.length,
    tokens = temporary.length === 0 ? [] : temporary.split(";"),
    selected: string[] = [];
  let recognized = 0;
  for (const token of tokens)
    if (names.includes(token)) {
      recognized++;
      if (!selected.includes(token)) selected.push(token);
    }
  return {
    selected,
    forbidden,
    insert: tokens.length === 1 && recognized === 0 && !forbidden && !protectedMarks,
    remove: tokens.length > 0 && recognized === tokens.length && !protectedMarks,
    navigate: tokens.length === 1 && recognized === 1,
    rename: tokens.length === 1 && recognized === 1 && !protectedMarks,
  };
}
/** Original row-selection handler differs from typed token admission,including insertion sensitivity on empty selection. @param selected - Actual selected rows in row order. @param protectedMarks - Native protection state. @returns Native button values. */
export function bookmarkSelectionState(
  selected: readonly string[],
  protectedMarks = false,
): BookmarkDialogState {
  return {
    selected,
    forbidden: false,
    insert: selected.length === 0 && !protectedMarks,
    remove: selected.length > 0 && !protectedMarks,
    navigate: selected.length === 1,
    rename: selected.length === 1 && !protectedMarks,
  };
}
/** Original highest numeric suffix proposal;source signed increment requires a highest ID below INT32_MAX. @param names - Actual row names. @param prefix - Localized STR_BOOKMARK_DEF_NAME. @returns Proposed original display name. */
export function bookmarkNameProposal(names: readonly string[], prefix: string): string {
  let highest = 0;
  for (const name of names) {
    const tokens = name.split(" ");
    if (tokens[0] === prefix) {
      const value = tokens[1] ?? "",
        units = new Uint16Array(value.length);
      for (let i = 0; i < value.length; i++) units[i] = value.charCodeAt(i);
      highest = Math.max(highest, toInt32(units));
    }
  }
  return `${prefix} ${highest + 1}`;
}
