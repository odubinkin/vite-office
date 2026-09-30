/**
 * @fileoverview Calculates browser-visible Writer list markers at the `sw/source/core/doc/number.cxx` ownership boundary without changing editable paragraph text.
 */

import {
  SvxNumberFormat,
  type NumberingPositionProperties,
  type NumberingMarkerProperties,
} from "../../../../editeng/source/items/numitem";

import type { WriterParagraphList, WriterParagraphListKind } from "./list";
import { WRITER_MAX_LIST_LEVEL } from "./list";

/** Numbering format owned by one level of a SwNumRule. */
export class SwNumFormat extends SvxNumberFormat {
  private readonly bulletFont: string;
  /** Creates one supported level format. @param kind - Bullet or decimal numbering family. @param bulletChar - Character-special marker. @param options - Upstream-compatible spacing, prefix, suffix, and start options. @returns Nothing. */
  public constructor(
    private readonly kind: Exclude<WriterParagraphListKind, "none">,
    private readonly bulletChar = kind === "bullet" ? "•" : "",
    options: NumberingPositionProperties &
      NumberingMarkerProperties &
      Readonly<{ bulletFont?: string }> = {},
  ) {
    super(options);
    if (kind !== "bullet" && kind !== "numbered")
      throw new Error("SwNumFormat kind must be bullet or numbered.");
    if (kind === "bullet" && [...bulletChar].length > 1)
      throw new Error("SwNumFormat bullet character must contain at most one Unicode code point.");
    this.bulletFont = options.bulletFont ?? (kind === "bullet" ? "OpenSymbol" : "");
    if (
      options.start !== undefined &&
      (options.start < 0 || options.start > 65535 || !Number.isInteger(options.start))
    )
      throw new Error("SwNumFormat start value is invalid.");
    if (
      options.includeUpperLevels !== undefined &&
      (!Number.isInteger(options.includeUpperLevels) ||
        options.includeUpperLevels < 0 ||
        options.includeUpperLevels > 255)
    )
      throw new Error("SwNumFormat included upper-level count is invalid.");
    if (options.listFormat !== undefined && typeof options.listFormat !== "string")
      throw new Error("SwNumFormat ListFormat is invalid.");
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
  /** Returns the upstream numbering type represented by this bounded format. @returns Arabic or character-special. */
  public GetNumberingType(): "arabic" | "char-special" {
    return this.kind === "bullet" ? "char-special" : "arabic";
  }
  /** Creates an independent format record. @returns Cloned format. */
  public clone(): SwNumFormat {
    return new SwNumFormat(this.kind, this.bulletChar, {
      ...this.GetPositionProperties(),
      bulletFont: this.bulletFont,
      ...this.GetMarkerProperties(),
    });
  }
}

/** Document-owned numbering rule referenced by paragraph item sets. */
export class SwNumRule {
  /** Creates one bounded numbering rule. @param name - Document-unique rule name. @param kind - Bullet or numbering marker family. @param defaultListId - Default list identity. @param automatic - Whether Writer may reuse the rule. @returns Nothing. */
  public constructor(
    private readonly name: string,
    format: Exclude<WriterParagraphListKind, "none"> | readonly SwNumFormat[] = createBaseFormats(),
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

  private readonly formats: SwNumFormat[];

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

  /** Replaces one level with an owned copy after caller validation. @param level - Zero-based level. @param format - Successfully applied format. @returns Nothing. */
  public Set(level: number, format: SwNumFormat): void {
    this.GetNumFormat(level);
    this.formats[level] = format.clone();
  }

  /** Returns the default list identity. @returns List identity. */
  public GetDefaultListId(): string {
    return this.defaultListId;
  }

  /** Reports whether Writer may reuse this rule for NumOrBulletOn. @returns Automatic-rule flag. */
  public IsAutoRule(): boolean {
    return this.automatic;
  }

  /** Formats a validated Writer number vector using native patterns or legacy joining; visible bullet glyphs are projected by SwTextNode. @param numbers - Root-to-current counters. @param level - Current zero-based level. @returns Numeric string. */
  public MakeNumString(numbers: readonly number[], level: number): string {
    const format = this.GetNumFormat(level);
    if (numbers.length <= level || numbers[level] === undefined)
      throw new Error("SwNumRule number vector does not contain the requested level.");
    if (format.HasListFormat()) {
      let pattern = format.GetListFormat();
      for (let position = 0; position < pattern.length - 2;) {
        if (pattern[position] !== "%") {
          position++;
          continue;
        }
        let replaceLevel: number;
        let endPosition: number;
        if (pattern.slice(position, position + 4) === "%10%") {
          replaceLevel = 9;
          endPosition = position + 4;
        } else if (
          pattern[position + 2] === "%" &&
          pattern.charAt(position + 1) >= "1" &&
          pattern.charAt(position + 1) <= "9"
        ) {
          replaceLevel = Number(pattern[position + 1]) - 1;
          endPosition = position + 3;
        } else {
          position++;
          continue;
        }
        if (level < replaceLevel) {
          position = endPosition;
          continue;
        }
        const value = numbers[replaceLevel] as number;
        const replacement =
          value === 0
            ? "0"
            : this.GetNumFormat(replaceLevel).GetNumberingType() === "char-special"
              ? ""
              : String(value);
        pattern = pattern.slice(0, position) + replacement + pattern.slice(endPosition);
        position += replacement.length;
      }
      return pattern;
    }
    const first = Math.max(0, level + 1 - Math.max(1, format.GetIncludeUpperLevels()));
    let marker = "";
    for (let index = first; index <= level; index++) {
      const value = numbers[index] as number;
      marker +=
        value === 0
          ? "0"
          : this.GetNumFormat(index).GetNumberingType() === "char-special"
            ? ""
            : String(value);
      if (index !== level && marker.length !== 0) marker += ".";
    }
    return format.GetNumberingType() === "char-special"
      ? marker
      : `${format.GetPrefix()}${marker}${format.GetSuffix()}`;
  }

  /** Creates an independent numbering rule. @returns Cloned rule. */
  public clone(): SwNumRule {
    return new SwNumRule(this.name, this.formats, this.defaultListId, this.automatic);
  }
}

/** Creates the modern NUM_RULE base formats selected by Writer's ODF >=1.2 default. @returns Independent Arabic base levels. */
function createBaseFormats(): readonly SwNumFormat[] {
  return Array.from(
    { length: WRITER_MAX_LIST_LEVEL + 1 },
    /** Initializes one native base level, including its inactive bullet character. @param _unused - Placeholder. @param level - Zero-based level. @returns Base format. */
    (_unused, level) => {
      const indentAt = 720 + level * 360;
      return new SwNumFormat("numbered", ["•", "◦", "▪"][level % 3], {
        firstLineIndent: -360,
        indentAt,
        listTabPosition: indentAt,
        positionAndSpaceMode: "label-alignment",
        suffix: ".",
        listFormat: `%${level + 1}%.`,
      });
    },
  );
}

/** Creates the ten uniform level formats used by Writer's default list commands. @param kind - Marker family. @returns Independent level formats. */
function createUniformFormats(
  kind: Exclude<WriterParagraphListKind, "none">,
): readonly SwNumFormat[] {
  return createBaseFormats().map(
    /** Applies the supported default list command marker to base geometry. @param format - Native base level. @returns Command format. */
    (format) =>
      new SwNumFormat(kind, kind === "bullet" ? format.GetBulletChar() : "", {
        ...format.GetPositionProperties(),
        bulletFont: kind === "bullet" ? "OpenSymbol" : "",
        suffix: kind === "numbered" ? "." : "",
      }),
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
