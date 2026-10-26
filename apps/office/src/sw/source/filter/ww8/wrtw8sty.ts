/** @fileoverview Builds the represented paragraph-style slots of pinned MSWordStyles. */
import type { SwDoc } from "../../core/doc/doc";
import type { SwTextFormatColl } from "../../core/doc/fmtcol";
import { getWriterParagraphStyleDefinition } from "../../../inc/poolfmt";

/** Word reserves slots 0-14 before document character and paragraph styles. */
const WW8_RESERVED_SLOTS = 15;
const MSWORD_MAX_STYLES_LIMIT = 4091;
const STANDARD = getWriterParagraphStyleDefinition("default")?.poolId;
const HEADLINE1 = getWriterParagraphStyleDefinition("heading-1")?.poolId;
const HEADLINE9 = getWriterParagraphStyleDefinition("heading-9")?.poolId;

/** Current pool subset of GetWWId plus ww::GetEnglishNameFromSti. */
export const WORD_PARAGRAPH_STYLE_NAMES: ReadonlyMap<string, string> = new Map([
  ["default", "Normal"],
  ...Array.from(
    { length: 9 },
    /** Maps source heading names. @param _unused - Empty slot. @param index - Zero-based heading level. @returns Native ID and Word name. */ (
      _,
      index,
    ): [string, string] => [`heading-${index + 1}`, `heading ${index + 1}`],
  ),
  ["footnote", "footnote text"],
  ["marginalia", "annotation text"],
  ["caption", "caption"],
  ["endnote", "endnote text"],
  ["title", "Title"],
  ["appendix", "Closing"],
  ["text-body", "Body Text"],
  ["text-body-indent", "Body Text Indent"],
  ["subtitle", "Subtitle"],
  ["first-line-indent", "Body Text First Indent"],
]);

/** Source OUString::toAsciiLowerCase leaves non-ASCII letters unchanged. @param value - Style name. @returns ASCII-folded key. */
function asciiLowerCase(value: string): string {
  return value.replace(
    /[A-Z]/g,
    /** Folds one ASCII uppercase letter. @param character - Matched letter. @returns Lowercase ASCII. */ (
      character,
    ) => character.toLowerCase(),
  );
}

/** Source MSWordStyles::BuildStylesTable and GetSlot for the current paragraph-style graph. */
export class MSWordStyles {
  private readonly styles: (SwTextFormatColl | undefined)[] =
    Array(WW8_RESERVED_SLOTS).fill(undefined);
  private readonly slots = new Map<SwTextFormatColl, number>();
  private readonly names = new Map<SwTextFormatColl, string>();

  /** Collects materialized named collections; this core's first collection is Standard. @param document - Owning Writer document. @returns Nothing. */
  public constructor(document: SwDoc) {
    for (const collection of document.GetTextFormatColls()) {
      const poolId = collection.poolId;
      const reserved =
        poolId === STANDARD
          ? 0
          : HEADLINE1 !== undefined &&
              HEADLINE9 !== undefined &&
              poolId >= HEADLINE1 &&
              poolId <= HEADLINE9
            ? poolId - HEADLINE1 + 1
            : undefined;
      if (reserved === undefined && this.styles.length >= MSWORD_MAX_STYLES_LIMIT) continue;
      const slot = reserved ?? this.styles.length;
      this.styles[slot] = collection;
      this.slots.set(collection, slot);
    }
    const used = new Set<string>(["normal"]);
    const normal = this.styles[0];
    if (normal !== undefined) this.names.set(normal, "Normal");
    /** Applies source case-insensitive ASCII suffix allocation. @param name - Candidate name. @returns Unique Word name. */
    const uniqueName = (name: string): string => {
      const key = asciiLowerCase(name);
      if (!used.has(key)) {
        used.add(key);
        return name;
      }
      let suffix = 1;
      while (used.has(`${key}${suffix}`)) suffix++;
      used.add(`${key}${suffix}`);
      return `${name}${suffix}`;
    };
    // BuildWwNames gives built-in Word names priority over user names.
    for (const collection of this.styles) {
      if (collection === undefined || this.names.has(collection)) continue;
      const builtin = [...WORD_PARAGRAPH_STYLE_NAMES].find(
        /** Matches a native builtin pool identity. @param entry - Style ID and Word name. @returns Whether the collection has this pool ID. */ ([
          id,
        ]) => getWriterParagraphStyleDefinition(id)?.poolId === collection.poolId,
      )?.[1];
      if (builtin !== undefined) this.names.set(collection, uniqueName(builtin));
    }
    for (const collection of this.styles) {
      if (collection === undefined || this.names.has(collection)) continue;
      this.names.set(collection, uniqueName(collection.GetName().replace(/ \(WW\)$/, "")));
    }
  }

  /** Returns the source Word slot, or its missing-style sentinel. @param collection - Native collection. @returns Slot or 0x0fff. */
  public GetSlot(collection: SwTextFormatColl | undefined): number {
    return collection === undefined ? 0x0fff : (this.slots.get(collection) ?? 0x0fff);
  }

  /** Returns source slot order, including reserved empty slots. @returns Native style slots. */
  public GetStyles(): readonly (SwTextFormatColl | undefined)[] {
    return this.styles;
  }

  /** Returns BuildWwNames output for an exported style. @param collection - Native collection. @returns Word style name. */
  public GetWWName(collection: SwTextFormatColl): string {
    return this.names.get(collection) ?? collection.GetName();
  }
}
