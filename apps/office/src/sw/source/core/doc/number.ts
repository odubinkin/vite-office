/**
 * @fileoverview Calculates browser-visible Writer list markers at the `sw/source/core/doc/number.cxx` ownership boundary without changing editable paragraph text.
 */

import {
  SvxNumberFormat,
  type NumberingPositionProperties,
  type NumberingMarkerProperties,
  type SvxNumPositionAndSpaceMode,
  type ConstSvxNumberFormat,
} from "../../../../editeng/source/items/numitem";

import { SvxNumType } from "../../../../editeng/inc/svxenum";
export { SvxNumType } from "../../../../editeng/inc/svxenum";
import { SwClient, type SwModify } from "../../../inc/calbck";

import type { SwTextNode } from "../txtnode/ndtxt";
import type { SwList, WriterParagraphList, WriterParagraphListKind } from "./list";
import { WRITER_MAX_LIST_LEVEL } from "./list";

/** Numbering format owned by one level of a SwNumRule, with native base defaults and null client registration. */
export class SwNumFormat extends SvxNumberFormat {
  private readonly client = new SwClient();
  /** Initializes native defaults or copies a const base format. @param format - Optional source format. @returns Nothing. */
  public constructor(format?: ConstSvxNumberFormat) {
    super(format ?? SvxNumType.SVX_NUM_ARABIC);
  }
  /** Reads the composed native SwClient registration; JS has one base class. @returns Registered source, initially undefined. */
  public GetRegisteredIn(): SwModify | undefined {
    return this.client.GetRegisteredIn();
  }
  /** Compares implemented base fields and native client registration. @param other - Const Writer format. @returns Equality. */
  public override Equals(other: ConstSwNumFormat): boolean {
    return super.Equals(other) && this.GetRegisteredIn() === other.GetRegisteredIn();
  }
  /** Copies a format independently while preserving optional font and raw marker fields. @returns Format. */
  public clone(): SwNumFormat {
    return new SwNumFormat(this);
  }
}

/** Assembles the browser's existing supported format properties using the source-shaped base copy constructor. @param kind - Browser marker family. @param bulletChar - Optional glyph. @param options - Raw transfer/command fields. @returns Native format. */
export function createWriterNumFormat(
  kind: Exclude<WriterParagraphListKind, "none">,
  bulletChar = kind === "bullet" ? "•" : "",
  options: NumberingPositionProperties &
    NumberingMarkerProperties &
    Readonly<{ bulletFont?: string; numberingType?: "arabic" | "char-special" | "none" }> = {},
): SwNumFormat {
  if (kind !== "bullet" && kind !== "numbered")
    throw new Error("SwNumFormat kind must be bullet or numbered.");
  if ([...bulletChar].length > 1)
    throw new Error("SwNumFormat bullet character must contain at most one Unicode code point.");
  if (
    options.start !== undefined &&
    (!Number.isInteger(options.start) || options.start < 0 || options.start > 65535)
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
  const type =
    options.numberingType === "none"
      ? SvxNumType.SVX_NUM_NUMBER_NONE
      : options.numberingType === "char-special" ||
          (options.numberingType === undefined && kind === "bullet")
        ? SvxNumType.SVX_NUM_CHAR_SPECIAL
        : SvxNumType.SVX_NUM_ARABIC;
  const base = SvxNumberFormat.FromProperties(
    { ...options, bulletFont: options.bulletFont ?? (kind === "bullet" ? "OpenSymbol" : "") },
    type,
  );
  base.SetBulletChar(bulletChar.codePointAt(0) ?? 0);
  return new SwNumFormat(base);
}
/** Projects the existing browser marker family from native type state. @param format - Const format. @returns Browser family. */
export function getWriterNumFormatKind(format: ConstSwNumFormat): "bullet" | "numbered" {
  return format.GetNumberingType() === SvxNumType.SVX_NUM_CHAR_SPECIAL ? "bullet" : "numbered";
}
/** Converts supported Unicode glyphs at the browser/XML boundary, retaining the historical empty inactive marker. @param format - Const format. @returns Marker string. */
export function getWriterNumFormatBullet(format: ConstSwNumFormat): string;
/** Projects an optional browser format reference. @param format - Const optional reference. @returns Glyph or undefined. */
export function getWriterNumFormatBullet(format: ConstSwNumFormat | undefined): string | undefined;
/** Converts an optional native reference without allocating a format. @param format - Const optional reference. @returns Glyph or undefined. */
export function getWriterNumFormatBullet(format: ConstSwNumFormat | undefined): string | undefined {
  if (format === undefined) return undefined;
  const glyph = format.GetBulletChar();
  return glyph === 0 ? "" : String.fromCodePoint(glyph);
}

/** Const format reference: callers clone before changing an owned or shared level. */
export type ConstSwNumFormat = Omit<SwNumFormat, `Set${string}`>;

/** Native numbering-rule classification, independent of the reserved name. */
export enum SwNumRuleType {
  OUTLINE_RULE = 0,
  NUM_RULE = 1,
  RULE_END = 2,
}

/** Document-owned numbering rule referenced by paragraph item sets. */
export class SwNumRule {
  /** Returns Writer's reserved outline numbering rule identity. @returns Outline rule name. */
  public static GetOutlineRuleName(): string {
    return "Outline";
  }
  /** Initializes optional owned levels and native shared defaults. @param name - Rule name. @param defaultMode - Native base-table selection. @param type - Native rule classification. @returns Nothing. */
  public constructor(
    private readonly name: string,
    private readonly defaultMode: SvxNumPositionAndSpaceMode,
    private meRuleType = SwNumRuleType.NUM_RULE,
  ) {
    if (name.trim().length === 0) throw new Error("SwNumRule name must not be blank.");
  }

  private defaultListId = "";
  private automatic = true;
  private readonly formats: (ConstSwNumFormat | undefined)[] = Array.from({ length: 10 });
  private readonly textNodes: SwTextNode[] = [];
  private invalidRuleFlag = true;
  /** Returns native rule classification. @returns Stored type. */
  public GetRuleType(): SwNumRuleType {
    return this.meRuleType;
  }
  /** Assigns classification and invalidates the rule, preserving supplied formats. @param type - Native type. @returns Nothing. */
  public SetRuleType(type: SwNumRuleType): void {
    this.meRuleType = type;
    this.invalidRuleFlag = true;
  }
  /** Reports outline rule classification. @returns Whether explicitly typed outline. */
  public IsOutlineRule(): boolean {
    return this.meRuleType === SwNumRuleType.OUTLINE_RULE;
  }

  /** Copies insertion-ordered rule clients into caller-owned storage. @param output - Output clients. @returns Nothing. */
  public GetTextNodeList(output: SwTextNode[]): void {
    output.splice(0, output.length, ...this.textNodes);
  }
  /** Counts registered text clients. @returns Client count. */
  public GetTextNodeListSize(): number {
    return this.textNodes.length;
  }
  /** Registers a client once by object identity. @param node - Text client. @returns Nothing. */
  public AddTextNode(node: SwTextNode): void {
    if (!this.textNodes.includes(node)) this.textNodes.push(node);
  }
  /** Unregisters a client, invalidating its list when the rule is still invalid. @param node - Text client. @returns Nothing. */
  public RemoveTextNode(node: SwTextNode): void {
    const position = this.textNodes.indexOf(node);
    if (position < 0) return;
    this.textNodes.splice(position, 1);
    if (this.invalidRuleFlag)
      node.GetDoc().GetDocumentListsManager().GetListByName(node.GetListId())?.InvalidateListTree();
  }
  /** Reports pending rule validation. @returns Invalid-rule flag. */
  public IsInvalidRule(): boolean {
    return this.invalidRuleFlag;
  }
  /** Marks the rule for validation. @returns Nothing. */
  public Invalidate(): void {
    this.invalidRuleFlag = true;
  }
  /** Invalidates then validates each distinct list referenced by clients. @returns Nothing. */
  public Validate(): void {
    const lists = new Set<SwList>();
    for (const node of this.textNodes) {
      const list = node
        .GetDoc()
        .GetDocumentListsManager()
        .GetListByName(node.GetListId()) as SwList;
      lists.add(list);
    }
    for (const list of lists) list.InvalidateListTree();
    for (const list of lists) list.ValidateListTree();
    this.invalidRuleFlag = false;
  }

  /** Returns the document-unique rule name. @returns Rule name. */
  public GetName(): string {
    return this.name;
  }

  /** Returns the browser-supported marker family. @returns Bullet or numbered kind. */
  public GetKind(): Exclude<WriterParagraphListKind, "none"> {
    return getWriterNumFormatKind(this.Get(0));
  }

  /** Returns the effective const format, selecting the shared table when no owned level exists. @param level - Native level. @returns Effective format. */
  public Get(level: number): ConstSwNumFormat {
    return (
      this.GetNumFormat(level) ??
      ((
        baseFormats[this.meRuleType] as Record<
          SvxNumPositionAndSpaceMode,
          readonly ConstSwNumFormat[]
        >
      )[this.defaultMode][level] as ConstSwNumFormat)
    );
  }
  /** Returns only an explicitly owned const format. @param level - Native level. @returns Owned format or undefined for the native null pointer. */
  public GetNumFormat(level: number): ConstSwNumFormat | undefined {
    if (!Number.isInteger(level) || level < 0 || level > WRITER_MAX_LIST_LEVEL)
      throw new Error(`SwNumRule level is outside 0-${WRITER_MAX_LIST_LEVEL}.`);
    return this.formats[level];
  }
  /** Copies a changed reference format; equal owned values preserve identity and validity. @param level - Native level. @param format - Const source format. @returns Nothing. */
  public Set(level: number, format: ConstSwNumFormat): void {
    const owned = this.GetNumFormat(level);
    if (owned === undefined || !owned.Equals(format)) {
      this.formats[level] = Object.freeze(format.clone());
      this.invalidRuleFlag = true;
    }
  }
  /** Exposes the native private default-table selector for the browser graph adapter. @returns Mode. */
  public GetDefaultNumberFormatPositionAndSpaceMode(): SvxNumPositionAndSpaceMode {
    return this.defaultMode;
  }
  /** Assigns the list identity at the document assembly boundary. @param id - Identity. @returns Nothing. */
  public SetDefaultListId(id: string): void {
    this.defaultListId = id;
  }
  /** Assigns the automatic-rule flag. @param automatic - Flag. @returns Nothing. */
  public SetAutoRule(automatic: boolean): void {
    this.automatic = automatic;
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
    const format = this.Get(level);
    if (numbers.length <= level || numbers[level] === undefined)
      throw new Error("SwNumRule number vector does not contain the requested level.");
    if (format.GetNumberingType() === SvxNumType.SVX_NUM_NUMBER_NONE)
      return format.GetPrefix() + format.GetSuffix();
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
        if (this.Get(replaceLevel).GetNumberingType() === SvxNumType.SVX_NUM_NUMBER_NONE) {
          const next = pattern.indexOf("%", endPosition);
          if (next === -1)
            throw new Error("SwNumRule disabled level has no following placeholder.");
          pattern = pattern.slice(0, position) + pattern.slice(next);
          continue;
        }
        const value = numbers[replaceLevel] as number;
        const replacement = value === 0 ? "0" : this.Get(replaceLevel).GetNumStr(value);
        pattern = pattern.slice(0, position) + replacement + pattern.slice(endPosition);
        position += replacement.length;
      }
      return pattern;
    }
    const first = Math.max(0, level + 1 - Math.max(1, format.GetIncludeUpperLevels()));
    let marker = "";
    for (let index = first; index <= level; index++) {
      if (this.Get(index).GetNumberingType() === SvxNumType.SVX_NUM_NUMBER_NONE) continue;
      const value = numbers[index] as number;
      marker += value === 0 ? "0" : this.Get(index).GetNumStr(value);
      if (index !== level && marker.length !== 0) marker += ".";
    }
    return format.GetNumberingType() === SvxNumType.SVX_NUM_CHAR_SPECIAL
      ? marker
      : `${format.GetPrefix()}${marker}${format.GetSuffix()}`;
  }

  /** Creates an independent numbering rule. @returns Cloned rule. */
  public clone(): SwNumRule {
    const clone = new SwNumRule(this.name, this.defaultMode, this.meRuleType);
    clone.SetDefaultListId(this.defaultListId);
    clone.SetAutoRule(this.automatic);
    for (let level = 0; level < 10; level++) {
      const format = this.formats[level];
      if (format !== undefined) clone.Set(level, format);
    }
    return clone;
  }
}

/** Initializes the four immutable tables shared by all rules, with native Twip defaults. @param outline - Outline classification. @param mode - Geometry group. @returns Shared levels. */
function createBaseFormats(
  outline: boolean,
  mode: SvxNumPositionAndSpaceMode,
): readonly ConstSwNumFormat[] {
  return Array.from(
    { length: 10 },
    /** Initializes one complete implemented base level. @param _unused - Placeholder. @param level - Native level. @returns Const format. */
    (_unused, level) => {
      const indent = 720 + level * 360;
      return Object.freeze(
        createWriterNumFormat("numbered", ["•", "◦", "▪"][level % 3], {
          bulletFont: "",
          numberingType: outline ? "none" : "arabic",
          includeUpperLevels: outline ? 10 : 1,
          positionAndSpaceMode: mode,
          ...(outline
            ? {
                charTextDistance: mode === "label-width-and-position" ? 216 : 0,
                labelFollowedBy: mode === "label-alignment" ? "nothing" : "listtab",
              }
            : {
                ...(mode === "label-alignment"
                  ? { firstLineIndent: -360, indentAt: indent, listTabPosition: indent }
                  : {
                      absLSpace: indent,
                      firstLineOffset: -360,
                    }),
                suffix: ".",
                listFormat: `%${level + 1}%.`,
              }),
        }),
      );
    },
  );
}
const baseFormats = [true, false].map(
  /** Shares both geometry families for a native rule type. @param outline - Classification. @returns Tables. */
  (outline) => ({
    "label-width-and-position": createBaseFormats(outline, "label-width-and-position"),
    "label-alignment": createBaseFormats(outline, "label-alignment"),
  }),
);

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
      paragraph.bulletChar ?? getWriterNumFormatBullet(paragraph.GetNumRule?.()?.Get(level)) ?? "•"
    );
  const documentNumber = paragraph.GetListItemNumber?.();
  if (documentNumber !== undefined) return `${documentNumber}.`;
  return undefined;
}
