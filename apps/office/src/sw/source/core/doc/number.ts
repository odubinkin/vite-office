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
import { SwPoolFormatId } from "../../../inc/poolfmt";
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
    if (format instanceof SwNumFormat) this.client.StartListeningToSameModifyAs(format);
  }
  /** Classifies native character-special and bitmap itemization independently of symbol visibility. @returns Itemize flag. */
  public IsItemize(): boolean {
    switch (this.GetNumberingType()) {
      case SvxNumType.SVX_NUM_CHAR_SPECIAL:
      case SvxNumType.SVX_NUM_BITMAP:
        return true;
      default:
        return false;
    }
  }
  /** Uses native enumeration policy, including NUMBER_NONE. @returns Enumeration flag. */
  public IsEnumeration(): boolean {
    return !this.IsItemize();
  }
  /** Reads the composed native SwClient registration; JS has one base class. @returns Registered source, initially undefined. */
  public GetRegisteredIn(): SwModify | undefined {
    return this.client.GetRegisteredIn();
  }
  /** Implements native base assignment followed by Writer registration transfer. @param other - Const source. @returns Assigned format. */
  public override Assign(other: ConstSwNumFormat): this {
    super.Assign(other);
    this.client.StartListeningToSameModifyAs(other);
    return this;
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
export type ConstSwNumFormat = Omit<SwNumFormat, `Set${string}` | "Assign">;

/** Stable JS const-pointer bridge: native owners stay mutable while exported reads retain identity and reject setters/assignment. */
const constFormatViews = new WeakMap<SwNumFormat, ConstSwNumFormat>();
/** Returns the cached protected read view for one native owner. @param owner - Mutable owned format. @returns Stable const reference. */
function constFormatReference(owner: SwNumFormat): ConstSwNumFormat {
  const existing = constFormatViews.get(owner);
  if (existing !== undefined) return existing;
  const target = Object.freeze(Object.create(SwNumFormat.prototype)) as SwNumFormat;
  const reference = new Proxy(target, {
    /** Resolves reads against the current owner, keeping mutation outside the const boundary. @param unused - Frozen facade. @param key - Requested member. @returns Bound reader or protected mutator. */
    get(unused, key) {
      void unused;
      if (String(key).startsWith("Set") || key === "Assign")
        return /** Rejects a forced runtime const violation. @returns Nothing. */ (): never => {
          throw new TypeError("Cannot mutate a const SwNumFormat reference; clone it first.");
        };
      const member: unknown = Reflect.get(owner, key);
      return typeof member === "function" ? member.bind(owner) : member;
    },
  });
  constFormatViews.set(owner, reference);
  return reference;
}

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
  /** Initializes optional owned levels and shared defaults. @param name - Rule name. @param defaultMode - Base table selector. @param type - Classification. @returns Nothing. */
  public constructor(name: string, defaultMode: SvxNumPositionAndSpaceMode, type?: SwNumRuleType);
  /** Copies metadata and independent owned levels with native copy-specific flags and empty clients. @param rule - Source rule. @returns Nothing. */
  public constructor(rule: SwNumRule);
  /** Implements the native constructor and copy constructor boundaries. @param source - Name or source rule. @param defaultMode - Base table selector for new rules. @param type - Classification for new rules. @returns Nothing. */
  public constructor(
    source: string | SwNumRule,
    defaultMode?: SvxNumPositionAndSpaceMode,
    type = SwNumRuleType.NUM_RULE,
  ) {
    if (source instanceof SwNumRule) {
      this.name = source.name;
      this.defaultMode = source.defaultMode;
      this.meRuleType = source.meRuleType;
      this.defaultListId = source.defaultListId;
      this.automatic = source.automatic;
      this.continusNum = source.continusNum;
      this.absSpaces = source.absSpaces;
      this.hidden = source.hidden;
      this.poolFormatId = source.poolFormatId;
      this.poolHelpId = source.poolHelpId;
      this.poolHlpFileId = source.poolHlpFileId;
      for (let level = 0; level < 10; level++) {
        const format = source.formats[level];
        if (format !== undefined) this.Set(level, format);
      }
    } else {
      if (source.trim().length === 0) throw new Error("SwNumRule name must not be blank.");
      this.name = source;
      this.defaultMode = defaultMode as SvxNumPositionAndSpaceMode;
      this.meRuleType = type;
    }
  }

  private name: string;
  private readonly defaultMode: SvxNumPositionAndSpaceMode;
  private meRuleType: SwNumRuleType;
  private defaultListId = "";
  private automatic = true;
  private readonly formats: (SwNumFormat | undefined)[] = Array.from({ length: 10 });
  private readonly textNodes: SwTextNode[] = [];
  private invalidRuleFlag = true;
  private continusNum = false;
  private absSpaces = false;
  private hidden = false;
  private countPhantoms = true;
  private usedByRedline = false;
  private poolFormatId: SwPoolFormatId = SwPoolFormatId.UNKNOWN;
  private poolHelpId = 65535;
  private poolHlpFileId = 255;
  /** Assigns raw owned levels through pointer Set and native selected metadata, retaining recipient clients, mode and list identity. @param source - Source rule. @returns Recipient identity. */
  public Assign(source: SwNumRule): this {
    if (this !== source) {
      for (let level = 0; level < 10; level++) this.SetByPointer(level, source.formats[level]);
      this.meRuleType = source.meRuleType;
      this.name = source.name;
      this.automatic = source.automatic;
      this.invalidRuleFlag = true;
      this.continusNum = source.continusNum;
      this.absSpaces = source.absSpaces;
      this.hidden = source.hidden;
      this.poolFormatId = source.GetPoolFormatId();
      this.poolHelpId = source.GetPoolHelpId();
      this.poolHlpFileId = source.GetPoolHlpFileId();
    }
    return this;
  }
  /** Clears owned levels and restores native reset metadata, accepting the supplied name verbatim and retaining recipient-only state. @param name - Replacement name. @returns Nothing. */
  public Reset(name: string): void {
    for (let level = 0; level < 10; level++) this.SetByPointer(level, undefined);
    this.meRuleType = SwNumRuleType.NUM_RULE;
    this.name = name;
    this.automatic = true;
    this.invalidRuleFlag = true;
    this.continusNum = false;
    this.absSpaces = false;
    this.hidden = false;
    this.poolFormatId = SwPoolFormatId.UNKNOWN;
    this.poolHelpId = 65535;
    this.poolHlpFileId = 255;
  }
  /** Compares the native selected metadata and all effective formats, independently of raw presence and recipient-only flags. @param rule - Other rule. @returns Native value equality. */
  public Equals(rule: SwNumRule): boolean {
    if (
      this.meRuleType !== rule.meRuleType ||
      this.name !== rule.name ||
      this.automatic !== rule.automatic ||
      this.continusNum !== rule.continusNum ||
      this.absSpaces !== rule.absSpaces ||
      this.poolFormatId !== rule.GetPoolFormatId() ||
      this.poolHelpId !== rule.GetPoolHelpId() ||
      this.poolHlpFileId !== rule.GetPoolHlpFileId()
    )
      return false;
    for (let level = 0; level < 10; level++)
      if (!rule.Get(level).Equals(this.Get(level))) return false;
    return true;
  }
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
    for (const list of lists) list.ValidateListTree(this.textNodes[0]?.GetDoc());
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
    this.CheckLevel(level);
    const owned = this.formats[level];
    return owned === undefined ? undefined : constFormatReference(owned);
  }
  /** Preserves the established browser integer-level input guard independently of const-view creation. @param level - Input level. @returns Nothing. */
  private CheckLevel(level: number): void {
    if (!Number.isInteger(level) || level < 0 || level > WRITER_MAX_LIST_LEVEL)
      throw new Error(`SwNumRule level is outside 0-${WRITER_MAX_LIST_LEVEL}.`);
  }
  /** Copies a changed reference format; equal owned values preserve identity and validity. @param level - Native level. @param format - Const source format. @returns Nothing. */
  public Set(level: number, format: ConstSwNumFormat): void {
    this.CheckLevel(level);
    const owned = this.formats[level];
    if (owned === undefined || !owned.Equals(format)) {
      this.formats[level] = new SwNumFormat(format);
      this.invalidRuleFlag = true;
    }
  }
  /** Implements the native pointer overload, distinct from reference replacement. @param level - Native level. @param format - Const source pointer or native null as undefined. @returns Nothing. */
  public SetByPointer(level: number, format: ConstSwNumFormat | undefined): void {
    this.CheckLevel(level);
    const owned = this.formats[level];
    if (owned === undefined) {
      if (format !== undefined) {
        this.formats[level] = new SwNumFormat(format);
        this.invalidRuleFlag = true;
      }
    } else if (format === undefined) {
      this.formats[level] = undefined;
      this.invalidRuleFlag = true;
    } else if (!owned.Equals(format)) {
      owned.Assign(format);
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

  /** Returns the continuous numbering flag. @returns Stored value. */
  public IsContinusNum(): boolean {
    return this.continusNum;
  }
  /** Assigns the continuous numbering flag with native field narrowing. @param value - Native scalar input. @returns Nothing. */
  public SetContinusNum(value: boolean): void {
    this.continusNum = value;
  }
  /** Returns the absolute spaces flag. @returns Stored value. */
  public IsAbsSpaces(): boolean {
    return this.absSpaces;
  }
  /** Assigns the absolute spaces flag with native field narrowing. @param value - Native scalar input. @returns Nothing. */
  public SetAbsSpaces(value: boolean): void {
    this.absSpaces = value;
  }
  /** Returns the hidden flag. @returns Stored value. */
  public IsHidden(): boolean {
    return this.hidden;
  }
  /** Assigns the hidden flag with native field narrowing. @param value - Native scalar input. @returns Nothing. */
  public SetHidden(value: boolean): void {
    this.hidden = value;
  }
  /** Returns the phantom counting flag. @returns Stored value. */
  public IsCountPhantoms(): boolean {
    return this.countPhantoms;
  }
  /** Assigns the phantom counting flag with native field narrowing. @param value - Native scalar input. @returns Nothing. */
  public SetCountPhantoms(value: boolean): void {
    this.countPhantoms = value;
  }
  /** Returns the redline usage flag. @returns Stored value. */
  public IsUsedByRedline(): boolean {
    return this.usedByRedline;
  }
  /** Assigns the redline usage flag with native field narrowing. @param value - Native scalar input. @returns Nothing. */
  public SetUsedByRedline(value: boolean): void {
    this.usedByRedline = value;
  }
  /** Returns the native pool format identity. @returns Stored value. */
  public GetPoolFormatId(): SwPoolFormatId {
    return this.poolFormatId;
  }
  /** Assigns the native pool format identity with native field narrowing. @param value - Native scalar input. @returns Nothing. */
  public SetPoolFormatId(value: SwPoolFormatId): void {
    this.poolFormatId = value & 0xffff;
  }
  /** Returns the native help identity. @returns Stored value. */
  public GetPoolHelpId(): number {
    return this.poolHelpId;
  }
  /** Assigns the native help identity with native field narrowing. @param value - Native scalar input. @returns Nothing. */
  public SetPoolHelpId(value: number): void {
    this.poolHelpId = value & 0xffff;
  }
  /** Returns the native help file identity. @returns Stored value. */
  public GetPoolHlpFileId(): number {
    return this.poolHlpFileId;
  }
  /** Assigns the native help file identity with native field narrowing. @param value - Native scalar input. @returns Nothing. */
  public SetPoolHlpFileId(value: number): void {
    this.poolHlpFileId = value & 0xff;
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
    const first = this.IsContinusNum()
      ? level
      : Math.max(0, level + 1 - Math.max(1, format.GetIncludeUpperLevels()));
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

  /** Copies through the native rule copy constructor. @returns Independent rule with native copy-specific defaults. */
  public clone(): SwNumRule {
    return new SwNumRule(this);
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
