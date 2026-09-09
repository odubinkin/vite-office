/**
 * @fileoverview Calculates browser-visible Writer list markers at the `sw/source/core/doc/number.cxx` ownership boundary without changing editable paragraph text.
 */

import type { WriterParagraphList, WriterParagraphListKind } from "./list";
import { WRITER_MAX_LIST_LEVEL } from "./list";

/** Internal rule name used by the bounded default-bullet command. */
export const DEFAULT_BULLET_RULE_NAME = "__WriterDefaultBullet";

/** Internal rule name used by the bounded default-numbering command. */
export const DEFAULT_NUMBERING_RULE_NAME = "__WriterDefaultNumbering";

/** Persisted subset of one LibreOffice SwNumFormat level. */
export interface SwNumFormatSnapshot {
  /** Browser-supported numbering family for this level. */
  readonly kind: Exclude<WriterParagraphListKind, "none">;
}

/** Numbering format owned by one level of a SwNumRule. */
export class SwNumFormat {
  /** Creates one supported level format. @param kind - Bullet or decimal numbering family. @returns Nothing. */
  public constructor(private readonly kind: Exclude<WriterParagraphListKind, "none">) {
    if (kind !== "bullet" && kind !== "numbered")
      throw new Error("SwNumFormat kind must be bullet or numbered.");
  }

  /** Returns the marker family for this list level. @returns Bullet or numbered kind. */
  public GetKind(): Exclude<WriterParagraphListKind, "none"> {
    return this.kind;
  }

  /** Creates an independent format record. @returns Cloned format. */
  public clone(): SwNumFormat {
    return new SwNumFormat(this.kind);
  }

  /** Creates a persisted level-format record. @returns Format snapshot. */
  public toSnapshot(): SwNumFormatSnapshot {
    return { kind: this.kind };
  }
}

/** Persisted definition of one bounded Writer numbering rule. */
export interface SwNumRuleSnapshot {
  /** Per-level numbering formats in Writer order. */
  readonly formats: readonly SwNumFormatSnapshot[];
  /** Default list identity used when the rule is applied. */
  readonly listId: string;
  /** Document-unique rule name referenced by SwNumRuleItem. */
  readonly name: string;
}

/** Document-owned numbering rule referenced by paragraph item sets. */
export class SwNumRule {
  /** Creates one bounded numbering rule. @param name - Document-unique rule name. @param kind - Bullet or numbering marker family. @param defaultListId - Default list identity. @returns Nothing. */
  public constructor(
    private readonly name: string,
    format: Exclude<WriterParagraphListKind, "none"> | readonly SwNumFormat[],
    private readonly defaultListId = name,
  ) {
    if (name.trim().length === 0 || defaultListId.trim().length === 0)
      throw new Error("SwNumRule name and list id must not be blank.");
    if (!Array.isArray(format) && format !== "bullet" && format !== "numbered")
      throw new Error("SwNumRule kind must be bullet or numbered.");
    const suppliedFormats = Array.isArray(format)
      ? (format as readonly SwNumFormat[])
      : createUniformFormats(format as Exclude<WriterParagraphListKind, "none">);
    if (suppliedFormats.length !== WRITER_MAX_LIST_LEVEL + 1)
      throw new Error("SwNumRule must define every supported list level.");
    this.formats = suppliedFormats.map(
      /** Clones one caller-owned level format. @param format - Source format. @returns Owned clone. */
      (format) => format.clone(),
    );
  }

  private readonly formats: readonly SwNumFormat[];

  /** Returns the document-unique rule name. @returns Rule name. */
  public GetName(): string {
    return this.name;
  }

  /** Returns the browser-supported marker family. @returns Bullet or numbered kind. */
  public GetKind(): Exclude<WriterParagraphListKind, "none"> {
    return this.GetNumFormat(0).GetKind();
  }

  /** Returns the numbering format at a zero-based Writer list level. @param level - List level. @returns Owned level format. */
  public GetNumFormat(level: number): SwNumFormat {
    if (!Number.isInteger(level) || level < 0 || level > WRITER_MAX_LIST_LEVEL)
      throw new Error(`SwNumRule level is outside 0-${WRITER_MAX_LIST_LEVEL}.`);
    return this.formats[level] as SwNumFormat;
  }

  /** Returns the default list identity. @returns List identity. */
  public GetDefaultListId(): string {
    return this.defaultListId;
  }

  /** Creates an independent numbering rule. @returns Cloned rule. */
  public clone(): SwNumRule {
    return new SwNumRule(this.name, this.formats, this.defaultListId);
  }

  /** Creates a persisted numbering-rule record. @returns Rule snapshot. */
  public toSnapshot(): SwNumRuleSnapshot {
    return {
      formats: this.formats.map(
        /** Serializes one list level. @param format - Owned level format. @returns Snapshot. */
        (format) => format.toSnapshot(),
      ),
      listId: this.defaultListId,
      name: this.name,
    };
  }

  /** Restores a validated bounded numbering rule. @param snapshot - Persisted rule definition. @returns Restored rule. */
  public static fromSnapshot(snapshot: SwNumRuleSnapshot): SwNumRule {
    if (!Array.isArray(snapshot.formats) || snapshot.formats.length === 0)
      throw new Error("Stored SwNumRule formats are invalid.");
    const formats = snapshot.formats.map(
      /** Restores one persisted level format. @param format - Stored format. @returns Restored format. */
      (format) => new SwNumFormat(format.kind),
    );
    return new SwNumRule(snapshot.name, formats, snapshot.listId);
  }
}

/** Creates the ten uniform level formats used by Writer's default list commands. @param kind - Marker family. @returns Independent level formats. */
function createUniformFormats(
  kind: Exclude<WriterParagraphListKind, "none">,
): readonly SwNumFormat[] {
  return Array.from(
    { length: WRITER_MAX_LIST_LEVEL + 1 },
    /** Creates one independent level format. @returns New format. */
    () => new SwNumFormat(kind),
  );
}

/** Describes the list subset of a Writer paragraph needed for deterministic marker calculation. */
export interface WriterNumberingParagraph {
  /** Stable paragraph identity used to locate a marker request. */
  readonly id: string;
  /** Serializable list state applied to the paragraph. */
  readonly list: WriterParagraphList;
  /** Optional canonical SwTextNode list identity used to separate adjacent lists. */
  readonly GetListId?: () => string;
  /** Optional canonical SwTextNode rule name used to distinguish numbering definitions. */
  readonly GetNumRuleName?: () => string;
}

/**
 * Produces the visible marker for one current Writer paragraph without changing its plain editable text.
 *
 * @param paragraphs - Ordered list-capable Writer paragraphs rendered in the browser document body.
 * @param paragraphId - Stable identity of the paragraph whose marker is requested.
 * @returns A bullet, one-based numbering marker, or undefined when the paragraph is not a list item.
 */
export function getWriterParagraphListMarker(
  paragraphs: readonly WriterNumberingParagraph[],
  paragraphId: string,
): string | undefined {
  const paragraphIndex = paragraphs.findIndex(
    /** Finds the numbered paragraph owning paragraphId. @param paragraph - Current list-capable paragraph. @returns True only for the requested identity. */
    function hasParagraphId(paragraph): boolean {
      return paragraph.id === paragraphId;
    },
  );
  const paragraph = paragraphs[paragraphIndex];
  if (paragraph === undefined || paragraph.list.kind === "none") return undefined;
  if (paragraph.list.kind === "bullet") return "•";
  const identity = getNumberingIdentity(paragraph);
  let itemNumber = 1;
  for (let index = paragraphIndex - 1; index >= 0; index -= 1) {
    const previousParagraph = paragraphs[index] as WriterNumberingParagraph;
    if (previousParagraph.list.kind === "none") break;
    if (getNumberingIdentity(previousParagraph) !== identity) break;
    if (previousParagraph.list.level < paragraph.list.level) break;
    if (
      previousParagraph.list.level === paragraph.list.level &&
      previousParagraph.list.kind === "numbered"
    )
      itemNumber += 1;
  }
  return `${itemNumber}.`;
}

/** Returns the canonical list/rule pair when available, or a stable browser-projection fallback. @param paragraph - List-capable paragraph. @returns Stable numbering identity. */
function getNumberingIdentity(paragraph: WriterNumberingParagraph): string {
  const listId = paragraph.GetListId?.() ?? "";
  if (listId.length > 0) return listId;
  const ruleName = paragraph.GetNumRuleName?.() ?? paragraph.list.styleId ?? paragraph.list.kind;
  return `\u0000${ruleName}`;
}
