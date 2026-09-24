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
  private readonly includeUpperLevels: number;
  private readonly labelFollowedBy: "listtab" | "nothing" | "space";
  private readonly listTabPosition: number;
  private readonly positionAndSpaceMode: "label-alignment";
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
      includeUpperLevels?: number;
      labelFollowedBy?: "listtab" | "nothing" | "space";
      listTabPosition?: number;
      positionAndSpaceMode?: "label-alignment";
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
    this.includeUpperLevels = options.includeUpperLevels ?? 1;
    this.labelFollowedBy = options.labelFollowedBy ?? "listtab";
    this.listTabPosition = options.listTabPosition ?? this.indentAt;
    this.positionAndSpaceMode = options.positionAndSpaceMode ?? "label-alignment";
    this.prefix = options.prefix ?? "";
    this.start = options.start ?? 1;
    this.suffix = options.suffix ?? (kind === "numbered" ? "." : "");
    if (!Number.isInteger(this.start) || this.start < 0)
      throw new Error("SwNumFormat start value is invalid.");
    if (
      !Number.isInteger(this.includeUpperLevels) ||
      this.includeUpperLevels < 1 ||
      this.includeUpperLevels > WRITER_MAX_LIST_LEVEL + 1
    )
      throw new Error("SwNumFormat included upper-level count is invalid.");
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
  /** Returns how many trailing list levels contribute to a numeric label. @returns Included level count. */
  public GetIncludeUpperLevels(): number {
    return this.includeUpperLevels;
  }
  /** Returns the label-follow separator mode. @returns Separator mode. */
  public GetLabelFollowedBy(): "listtab" | "nothing" | "space" {
    return this.labelFollowedBy;
  }
  /** Returns the list-tab position in twips. @returns Tab position. */
  public GetListtabPos(): number {
    return this.listTabPosition;
  }
  /** Returns the supported upstream spacing mode. @returns Label-alignment mode. */
  public GetPositionAndSpaceMode(): "label-alignment" {
    return this.positionAndSpaceMode;
  }
  /** Returns the upstream numbering type represented by this bounded format. @returns Arabic or character-special. */
  public GetNumberingType(): "arabic" | "char-special" {
    return this.kind === "bullet" ? "char-special" : "arabic";
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
      includeUpperLevels: this.includeUpperLevels,
      labelFollowedBy: this.labelFollowedBy,
      listTabPosition: this.listTabPosition,
      positionAndSpaceMode: this.positionAndSpaceMode,
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

  /** Formats one validated Writer number vector using the current level's prefix, suffix, and upper-level count. @param numbers - Root-to-current counters. @param level - Current zero-based level. @returns Visible label. */
  public MakeNumString(numbers: readonly number[], level: number): string {
    const format = this.GetNumFormat(level);
    if (format.GetNumberingType() === "char-special") return format.GetBulletChar();
    if (numbers.length <= level || numbers[level] === undefined)
      throw new Error("SwNumRule number vector does not contain the requested level.");
    const first = Math.max(0, level + 1 - format.GetIncludeUpperLevels());
    return `${format.GetPrefix()}${numbers.slice(first, level + 1).join(".")}${format.GetSuffix()}`;
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
        includeUpperLevels: 1,
        labelFollowedBy: "listtab",
        listTabPosition: indentAt,
        positionAndSpaceMode: "label-alignment",
        prefix: "",
        start: 1,
        suffix: kind === "numbered" ? "." : "",
      });
    },
  );
}

/** Describes the list subset of a Writer paragraph needed for deterministic marker calculation. */
export interface WriterNumberingParagraph {
  /** Serializable list state applied to the paragraph. */
  readonly list?: WriterParagraphList;
  /** Canonical list family supplied by SwTextNode. */
  readonly GetListKind?: () => WriterParagraphList["kind"];
  /** Canonical list level supplied by SwTextNode. */
  readonly GetAttrListLevel?: () => number;
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
  /** Canonical list visibility flag supplied by SwTextNode. */
  readonly IsCountedInList?: () => boolean;
  /** Primitive bullet marker supplied by a presentation projection. */
  readonly bulletChar?: string;
  /** Primitive marker calculated before crossing the presentation boundary. */
  readonly listMarker?: string;
}

/**
 * Produces the visible marker for one current Writer paragraph without changing its plain editable text.
 *
 * @param paragraphs - Ordered list-capable Writer paragraphs rendered in the browser document body.
 * @param paragraph - Paragraph whose marker is requested.
 * @returns A bullet, one-based numbering marker, or undefined when the paragraph is not a list item.
 */
export function getWriterParagraphListMarker(
  paragraphs: readonly WriterNumberingParagraph[],
  paragraph: WriterNumberingParagraph,
): string | undefined {
  const kind = paragraph.GetListKind?.() ?? paragraph.list?.kind ?? "none";
  const level = paragraph.GetAttrListLevel?.() ?? paragraph.list?.level ?? 0;
  if (!paragraphs.includes(paragraph) || kind === "none" || paragraph.IsCountedInList?.() === false)
    return undefined;
  if (paragraph.listMarker !== undefined) return paragraph.listMarker;
  if (kind === "bullet")
    return (
      paragraph.bulletChar ?? paragraph.GetNumRule?.()?.GetNumFormat(level).GetBulletChar() ?? "•"
    );
  const documentNumber = paragraph.GetListItemNumber?.();
  if (documentNumber !== undefined) return `${documentNumber}.`;
  return undefined;
}
