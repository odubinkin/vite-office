/** @fileoverview Native character-map subset and name lookup for the Writer enclosure dialog. */
import type { FontCharMap } from "../../../vcl/source/font/fontcharmap";

/** Inclusive Unicode range and its pinned LibreOffice string resource. */
type Subset = readonly [first: number, last: number, id: string, label: string];

/** Native enumerated names and compact algorithmic names over inclusive ranges. */
interface CharacterMapResource {
  readonly names: readonly (readonly [number, string])[];
  readonly ranges: readonly (readonly [number, number, string])[];
  readonly subsets: readonly Subset[];
}

/** Pinned ICU names and LibreOffice subset ranges used by the browser picker. */
export class WriterSearchCharacterMap {
  private static resource: Promise<WriterSearchCharacterMap> | undefined;
  private readonly names: ReadonlyMap<number, string>;

  /** Indexes the immutable native resource. @param data - Generated ICU and LibreOffice data. @returns Character map data. */
  private constructor(private readonly data: CharacterMapResource) {
    this.names = new Map(data.names);
  }

  /** Loads pinned character data when the picker is used. @returns Shared character resources. */
  public static Load(): Promise<WriterSearchCharacterMap> {
    return (this.resource ??= import("./writer-search-character-map.data.txt?raw").then(
      /** Parses and indexes the immutable generated data. @param module - Browser resource module. @returns Character lookup. */
      (module) => new WriterSearchCharacterMap(JSON.parse(module.default) as CharacterMapResource),
    ));
  }

  /** Looks up the ICU Unicode character name. @param code - Unicode codepoint. @returns Name or empty string. */
  public GetName(code: number): string {
    const name = this.names.get(code);
    if (name !== undefined) return name;
    const range = this.data.ranges.find(
      /** Checks whether ICU generated this codepoint's name algorithmically. @param row - Named range. @returns Membership. */
      ([first, last]) => first <= code && code <= last,
    );
    return range ? range[2] + code.toString(16).toUpperCase() : "";
  }

  /** Returns the native subset list after intersecting the device map. @param characters - Fixed font map. @returns Ordered subset rows. */
  public GetSubsets(characters: FontCharMap): readonly Subset[] {
    return this.data.subsets.filter(
      /** Applies the native font intersection. @param subset - Candidate subset. @returns Whether the font contains a glyph in this range. */
      ([first, last]) => characters.CountCharsInRange(first, last) > 0,
    );
  }

  /** Filters glyphs by ICU name or the native normalized U+ prefix. @param characters - Fixed font map. @param query - Search entry. @returns Matches in glyph order. */
  public Search(characters: FontCharMap, query: string): readonly number[] {
    const keyword = query.trim().toLowerCase();
    const prefixValue = /^u\+([0-9a-f]+)/u.exec(keyword)?.[1];
    const prefix = prefixValue === undefined ? 0 : Number.parseInt(prefixValue, 16);
    const hex = prefix > 0 && prefix <= 0x7fffffff ? prefix.toString(16) : "";
    const last = characters.GetLastChar();
    const matches: number[] = [];
    for (let code = characters.GetFirstChar(); code <= last; code = characters.GetNextChar(code)) {
      const name = this.GetName(code);
      if (
        (name !== "" && name.toLowerCase().includes(keyword)) ||
        (hex !== "" && code.toString(16).startsWith(hex))
      )
        matches.push(code);
      if (code === last) break;
    }
    return matches;
  }
}
