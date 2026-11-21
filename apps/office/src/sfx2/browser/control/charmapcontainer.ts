/** @fileoverview Character and font preference lists for the browser SfxCharmapContainer. */

/** Native CharAndFont pair. */
export interface CharAndFont {
  readonly character: string;
  readonly font: string;
}

/** The two independent Office.Common character lists. */
export type CharacterList = "recent" | "favorite";

const MAX_CHARACTERS = 16;
const groupNames = { recent: "Recent", favorite: "Favorite" } as const;
const defaultFavorites = Array.from(
  "€¥£©ΣΩ≤≥∞π†‡",
  /** Reads the shipped Office.Common defaults. @param character - Default favorite. @returns Character and font. */
  (character) => ({ character, font: "Liberation Serif" }),
);

/** Compares both members of the native pair. @param left - Stored entry. @param right - Selected entry. @returns Whether both members match. */
export function sameCharAndFont(left: CharAndFont, right: CharAndFont): boolean {
  return left.character === right.character && left.font === right.font;
}

/** Reads the native application preferences used by the character map. @param list - Office.Common group. @returns Ordered character and font pairs. */
export function readCharacterList(list: CharacterList): readonly CharAndFont[] {
  const group = groupNames[list];
  const fallback = list === "favorite" ? defaultFavorites : [];
  try {
    const text = globalThis.localStorage?.getItem(
      `org.openoffice.Office.Common/${group}Characters`,
    );
    if (text == null) return fallback;
    const value: unknown = JSON.parse(text);
    if (value === null || typeof value !== "object") return fallback;
    const record = value as Record<string, unknown>;
    const characters = record[`${group}CharacterList`];
    const fonts = record[`${group}CharacterFontList`];
    if (!Array.isArray(characters) || !Array.isArray(fonts)) return fallback;
    const pairs: CharAndFont[] = [];
    const count = Math.min(characters.length, fonts.length, MAX_CHARACTERS);
    for (let index = 0; index < count; index++) {
      const character: unknown = characters[index];
      const font: unknown = fonts[index];
      if (typeof character === "string" && character !== "" && typeof font === "string")
        pairs.push({ character, font });
    }
    return pairs;
  } catch {
    return fallback;
  }
}

/** Commits the paired native preferences in one browser storage update. @param list - Office.Common group. @param pairs - Ordered character and font pairs. @returns Committed list for the view. */
export function writeCharacterList(
  list: CharacterList,
  pairs: readonly CharAndFont[],
): readonly CharAndFont[] {
  const group = groupNames[list];
  try {
    globalThis.localStorage?.setItem(
      `org.openoffice.Office.Common/${group}Characters`,
      JSON.stringify({
        [`${group}CharacterList`]: pairs.map(
          /** Projects the native character list. @param pair - Character and font. @returns Character. */
          (pair) => pair.character,
        ),
        [`${group}CharacterFontList`]: pairs.map(
          /** Projects the corresponding font list. @param pair - Character and font. @returns Font family. */
          (pair) => pair.font,
        ),
      }),
    );
  } catch {
    // Keep the current picker usable when application preferences are unavailable.
  }
  return pairs;
}

/** Removes a single matching native pair. @param pairs - Existing rows. @param choice - Pair to remove. @returns Updated rows. */
export function removeCharacter(
  pairs: readonly CharAndFont[],
  choice: CharAndFont,
): readonly CharAndFont[] {
  const index = pairs.findIndex(
    /** Compares the selected pair. @param pair - Existing row. @returns Whether it matches. */
    (pair) => sameCharAndFont(pair, choice),
  );
  return index === -1 ? pairs : [...pairs.slice(0, index), ...pairs.slice(index + 1)];
}

/** Retains the most recently applied character at the front. @param pairs - Existing recent rows. @param choice - Accepted character and font. @returns Updated native order. */
export function rememberCharacter(
  pairs: readonly CharAndFont[],
  choice: CharAndFont,
): readonly CharAndFont[] {
  return [choice, ...removeCharacter(pairs, choice).slice(0, MAX_CHARACTERS - 1)];
}

/** Reports whether the native picker can add another favorite. @param pairs - Current favorites. @returns Whether all slots are in use. */
export function favoritesFull(pairs: readonly CharAndFont[]): boolean {
  return pairs.length >= MAX_CHARACTERS;
}
