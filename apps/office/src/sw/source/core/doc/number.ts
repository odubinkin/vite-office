/**
 * @fileoverview Calculates browser-visible Writer list markers at the `sw/source/core/doc/number.cxx` ownership boundary without changing editable paragraph text.
 */

import type { WriterParagraphList, WriterParagraphListKind } from "./list";
import { WRITER_MAX_LIST_LEVEL } from "./list";

/** Numbering format owned by one level of a SwNumRule. */
export class SwNumFormat {
  private readonly bulletFont: string;
  private readonly firstLineIndent: number;
  private readonly indentAt: number;
  private readonly labelFollowedBy: "listtab" | "nothing" | "space";
  private readonly listTabPosition: number;
  private readonly prefix: string;
  private readonly start: number;
  private readonly suffix: string;
  /** Creates one supported level format. @param kind - Bullet or decimal numbering family. @param bulletChar - Character-special marker. @param options - Upstream-compatible spacing, prefix, suffix, and start options. @returns Nothing. */
  public constructor(
    private readonly kind: Exclude<WriterParagraphListKind, "none">,
    private readonly bulletChar = kind === "bullet" ? "•" : "",
    options: Readonly<{
      bulletFont?: string;
      firstLineIndent?: number;
      indentAt?: number;
      labelFollowedBy?: "listtab" | "nothing" | "space";
      listTabPosition?: number;
      prefix?: string;
      start?: number;
      suffix?: string;
    }> = {},
  ) {
    if (kind !== "bullet" && kind !== "numbered")
      throw new Error("SwNumFormat kind must be bullet or numbered.");
    if (kind === "bullet" && [...bulletChar].length > 1)
      throw new Error("SwNumFormat bullet character must contain at most one Unicode code point.");
    this.bulletFont = options.bulletFont ?? (kind === "bullet" ? "OpenSymbol" : "");
    this.firstLineIndent = options.firstLineIndent ?? -360;
    this.indentAt = options.indentAt ?? 720;
    this.labelFollowedBy = options.labelFollowedBy ?? "listtab";
    this.listTabPosition = options.listTabPosition ?? this.indentAt;
    this.prefix = options.prefix ?? "";
    this.start = options.start ?? 1;
    this.suffix = options.suffix ?? (kind === "numbered" ? "." : "");
    if (!Number.isInteger(this.start) || this.start < 0)
      throw new Error("SwNumFormat start value is invalid.");
  }

  /** Returns the marker family for this list level. @returns Bullet or numbered kind. */
  public GetKind(): Exclude<WriterParagraphListKind, "none"> {
    return this.kind;
  }

  /** Returns the character-special marker stored by this level. @returns Bullet character or an empty string. */
  public GetBulletChar(): string {
    return this.bulletChar;
  }

  /** Returns the bullet font family. @returns Bullet family or empty for numbering. */
  public GetBulletFont(): string {
    return this.bulletFont;
  }
  /** Returns the first-line indent in twips. @returns Signed indent. */
  public GetFirstLineIndent(): number {
    return this.firstLineIndent;
  }
  /** Returns the body indent in twips. @returns Indent position. */
  public GetIndentAt(): number {
    return this.indentAt;
  }
  /** Returns the label-follow separator mode. @returns Separator mode. */
  public GetLabelFollowedBy(): "listtab" | "nothing" | "space" {
    return this.labelFollowedBy;
  }
  /** Returns the list-tab position in twips. @returns Tab position. */
  public GetListtabPos(): number {
    return this.listTabPosition;
  }
  /** Returns the label prefix. @returns Prefix. */
  public GetPrefix(): string {
    return this.prefix;
  }
  /** Returns the first number. @returns Start value. */
  public GetStart(): number {
    return this.start;
  }
  /** Returns the label suffix. @returns Suffix. */
  public GetSuffix(): string {
    return this.suffix;
  }

  /** Creates an independent format record. @returns Cloned format. */
  public clone(): SwNumFormat {
    return new SwNumFormat(this.kind, this.bulletChar, {
      bulletFont: this.bulletFont,
      firstLineIndent: this.firstLineIndent,
      indentAt: this.indentAt,
      labelFollowedBy: this.labelFollowedBy,
      listTabPosition: this.listTabPosition,
      prefix: this.prefix,
      start: this.start,
      suffix: this.suffix,
    });
  }
}

/** Document-owned numbering rule referenced by paragraph item sets. */
export class SwNumRule {
  /** Creates one bounded numbering rule. @param name - Document-unique rule name. @param kind - Bullet or numbering marker family. @param defaultListId - Default list identity. @param automatic - Whether Writer may reuse the rule. @returns Nothing. */
  public constructor(
    private readonly name: string,
    format: Exclude<WriterParagraphListKind, "none"> | readonly SwNumFormat[],
    private readonly defaultListId = name,
    private readonly automatic = false,
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

  /** Reports whether Writer may reuse this rule for NumOrBulletOn. @returns Automatic-rule flag. */
  public IsAutoRule(): boolean {
    return this.automatic;
  }

  /** Creates an independent numbering rule. @returns Cloned rule. */
  public clone(): SwNumRule {
    return new SwNumRule(this.name, this.formats, this.defaultListId, this.automatic);
  }
}

/** Creates the ten uniform level formats used by Writer's default list commands. @param kind - Marker family. @returns Independent level formats. */
function createUniformFormats(
  kind: Exclude<WriterParagraphListKind, "none">,
): readonly SwNumFormat[] {
  return Array.from(
    { length: WRITER_MAX_LIST_LEVEL + 1 },
    /** Creates one independent level format. @param _unused - Array placeholder. @param level - Zero-based list level. @returns New format. */
    (_unused, level) => {
      const indentAt = 720 + level * 360;
      const bullets = ["•", "◦", "▪"] as const;
      return new SwNumFormat(kind, kind === "bullet" ? bullets[level % bullets.length] : "", {
        bulletFont: kind === "bullet" ? "OpenSymbol" : "",
        firstLineIndent: -360,
        indentAt,
        labelFollowedBy: "listtab",
        listTabPosition: indentAt,
        prefix: "",
        start: 1,
        suffix: kind === "numbered" ? "." : "",
      });
    },
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
  /** Primitive list identity supplied by a presentation projection. */
  readonly listId?: string;
  /** Optional canonical SwTextNode rule name used to distinguish numbering definitions. */
  readonly GetNumRuleName?: () => string;
  /** Primitive rule identity supplied by a presentation projection. */
  readonly numRuleName?: string;
  /** Optional canonical numbering rule used to resolve per-level bullet characters. */
  readonly GetNumRule?: () => SwNumRule | undefined;
  /** Canonical list-tree counter supplied by SwTextNode. */
  readonly GetListItemNumber?: () => number | undefined;
  /** Primitive bullet marker supplied by a presentation projection. */
  readonly bulletChar?: string;
  /** Primitive marker calculated before crossing the presentation boundary. */
  readonly listMarker?: string;
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
  if (paragraph.listMarker !== undefined) return paragraph.listMarker;
  if (paragraph.list.kind === "bullet")
    return (
      paragraph.bulletChar ??
      paragraph.GetNumRule?.()?.GetNumFormat(paragraph.list.level).GetBulletChar() ??
      "•"
    );
  const documentNumber = paragraph.GetListItemNumber?.();
  if (documentNumber !== undefined) return `${documentNumber}.`;
  return undefined;
}
