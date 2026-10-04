/**
 * @fileoverview Defines Writer text-range attributes at the pinned LibreOffice `sw/source/core/txtnode/txatbase.cxx` ownership boundary.
 */

import {
  FontItalic,
  FontLineStyle,
  FontWeight,
  SvxFontItem,
  SvxFontHeightItem,
  SvxPostureItem,
  SvxUnderlineItem,
  SvxWeightItem,
} from "../../../../editeng/source/items/textitem";
import { SfxItemSet } from "../../../../svl/source/items/itemset";
import { SfxPoolItem, type SfxPoolItemSnapshot } from "../../../../svl/source/items/poolitem";
import { SfxStringItem } from "../../../../svl/source/items/stritem";
import {
  RES_CHRATR_CJK_POSTURE,
  RES_CHRATR_CJK_FONT,
  RES_CHRATR_CJK_FONTSIZE,
  RES_CHRATR_CJK_WEIGHT,
  RES_CHRATR_COLOR,
  RES_CHRATR_CTL_POSTURE,
  RES_CHRATR_CTL_FONT,
  RES_CHRATR_CTL_FONTSIZE,
  RES_CHRATR_FONT,
  RES_CHRATR_FONTSIZE,
  RES_CHRATR_CTL_WEIGHT,
  RES_CHRATR_HIGHLIGHT,
  RES_CHRATR_POSTURE,
  RES_CHRATR_UNDERLINE,
  RES_CHRATR_WEIGHT,
  RES_TXTATR_AUTOFMT,
  RES_TXTATR_INETFMT,
  WRITER_CHARACTER_WHICH_RANGES,
} from "../../../inc/hintids";
import type { SwAttrPool } from "../attr/swatrset";
import { SwAutoStyleFamily } from "../../../inc/istyleaccess";
import { SwFormatINetFormat } from "./fmtatr2";
import type { SwpHints } from "./ndhints";

export { RES_TXTATR_AUTOFMT } from "../../../inc/hintids";
export { RES_TXTATR_INETFMT } from "../../../inc/hintids";

/** Names the bounded direct character properties currently carried by an auto-format item. */
export interface WriterCharacterAttributes {
  /** CSS-compatible explicit foreground color or Writer's automatic color marker. */
  readonly color?: string;
  /** Explicit font family; absent means the paragraph style or document default. */
  readonly fontFamily?: string;
  /** Explicit font height in twips; absent means the paragraph style or document default. */
  readonly fontSizeTwips?: number;
  /** CSS-compatible explicit highlight color or Writer's transparent marker. */
  readonly highlight?: string;
  /** Whether the text uses a bold font weight. */
  readonly bold: boolean;
  /** Whether the text uses an italic posture. */
  readonly italic: boolean;
  /** Whether the text uses a single underline. */
  readonly underline: boolean;
}

/** Creates a canonical character item set from a browser/filter projection at a named boundary. @param pool - Writer attribute pool. @param attributes - Boundary values. @returns Effective character items. */
export function createWriterCharacterItemSet(
  pool: SwAttrPool,
  attributes: WriterCharacterAttributes,
): SfxItemSet {
  const set = new SfxItemSet(pool, WRITER_CHARACTER_WHICH_RANGES);
  const format = createSwFormatAutoFormat(pool, attributes);
  set.PutSet(format.GetStyleHandle());
  return set;
}

/** SfxPoolItem wrapper around the character item set referenced by RES_TXTATR_AUTOFMT. */
export class SwFormatAutoFormat extends SfxPoolItem {
  private styleHandle: SfxItemSet;

  /** Creates a non-shareable attribute referencing an explicit style handle. @param styleHandle - Shared character style. @param which - Auto-format WhichId. @returns Nothing. */
  public constructor(styleHandle: SfxItemSet, which: number = RES_TXTATR_AUTOFMT) {
    super(which);
    if (which !== RES_TXTATR_AUTOFMT) throw new Error("SwFormatAutoFormat WhichId is invalid.");
    this.setNonShareable();
    this.styleHandle = styleHandle;
  }

  /** Returns the shared style handle. @returns Referenced item set. */
  public GetStyleHandle(): SfxItemSet {
    return this.styleHandle;
  }

  /** Assigns the shared handle without cloning its contents. @param styleHandle - New style reference. @returns Nothing. */
  public SetStyleHandle(styleHandle: SfxItemSet): void {
    this.styleHandle = styleHandle;
  }

  /** Creates an independent item sharing the same style handle. @returns Cloned item. */
  public Clone(): SwFormatAutoFormat {
    return new SwFormatAutoFormat(this.styleHandle, this.Which());
  }

  /** Compares automatic items by shared handle identity. @param other - Candidate pool item. @returns Whether equal. */
  public equals(other: SfxPoolItem): boolean {
    return (
      other instanceof SwFormatAutoFormat &&
      other.Which() === this.Which() &&
      this.styleHandle === other.styleHandle
    );
  }

  /** Exposes the contained item values to the persistence codec. @returns Nested item records. */
  public QueryValue(): readonly SfxPoolItemSnapshot[] {
    return this.styleHandle.entries().map(
      /** Projects one nested item. @param item - Direct pooled item. @returns Primitive item record. */ (
        item,
      ) => ({
        value: item.QueryValue() as SfxPoolItemSnapshot["value"],
        which: item.Which(),
      }),
    );
  }
}

/** Native text attribute base with a start position and an optional end. */
export class SwTextAttr<
  TFormat extends SwFormatAutoFormat | SwFormatINetFormat = SwFormatAutoFormat,
> {
  private m_nStart: number;
  private m_bDontExpand = false;
  private m_bLockExpandFlag = false;
  private m_bDontMoveAttr = false;
  private m_bCharFormatAttr = false;
  private m_bOverlapAllowedAttr = false;
  private m_bPriorityAttr = false;
  private m_bDontExpandStart = false;
  private m_bNesting = false;
  private m_bHasDummyChar = false;
  private m_bFormatIgnoreStart = false;
  private m_bFormatIgnoreEnd = false;
  private m_bHasContent = false;
  /** Internal friend-access storage assigned and released only by the owning SwpHints. */
  public m_pHints: SwpHints | undefined;
  /** Initializes the native base. @param format - Owned item. @param start - UTF-16 offset. @returns Nothing. */
  protected constructor(
    public readonly format: TFormat,
    start: number,
  ) {
    if (!Number.isInteger(start)) throw new Error("SwTextAttr start is invalid.");
    this.m_nStart = start;
  }
  /** Returns the owned pool item. @returns Attribute item. */
  public GetAttr(): TFormat {
    return this.format;
  }
  /** Returns the native family. @returns WhichId. */
  public Which(): typeof RES_TXTATR_AUTOFMT | typeof RES_TXTATR_INETFMT {
    return this.GetAttr().Which() as typeof RES_TXTATR_AUTOFMT | typeof RES_TXTATR_INETFMT;
  }
  /** Returns the start. @returns UTF-16 offset. */
  public GetStart(): number {
    return this.m_nStart;
  }
  /** Sets the start and always notifies its owner. @param start - New offset. @returns Nothing. */
  public SetStart(start: number): void {
    if (!Number.isInteger(start)) throw new Error("SwTextAttr start is invalid.");
    this.m_nStart = start;
    this.m_pHints?.StartPosChanged();
  }
  /** Returns no end for the native base. @returns Absent end. */
  public GetEnd(): number | undefined {
    return undefined;
  }
  /** Rejects end writes on an attribute without an end. @param end - Unsupported offset. @returns Nothing. */
  public SetEnd(end: number): void {
    throw new Error("SwTextAttr has no end: " + end);
  }
  /** Returns the optional native end. @returns End offset if present. */
  public End(): number | undefined {
    return this.GetEnd();
  }
  /** Returns the end or the start for a point attribute. @returns UTF-16 offset. */
  public GetAnyEnd(): number {
    return this.End() ?? this.GetStart();
  }
  /** Reads the portable start projection. @returns UTF-16 offset. */
  public get start(): number {
    return this.GetStart();
  }
  /** Writes through native start notification. @param start - New offset. @returns Nothing. */
  public set start(start: number) {
    this.SetStart(start);
  }
  /** Reads the native DontExpand flag. @returns Flag value. */
  public DontExpand(): boolean {
    return this.m_bDontExpand;
  }
  /** Sets the native DontExpand flag. @param flag - New value. @returns Nothing. */
  public SetDontExpand(flag: boolean): void {
    if (!this.m_bLockExpandFlag) this.m_bDontExpand = flag;
  }
  /** Reads the native LockExpandFlag flag. @returns Flag value. */
  public IsLockExpandFlag(): boolean {
    return this.m_bLockExpandFlag;
  }
  /** Sets the native LockExpandFlag flag. @param flag - New value. @returns Nothing. */
  public SetLockExpandFlag(flag: boolean): void {
    this.m_bLockExpandFlag = flag;
  }
  /** Reads the native DontMoveAttr flag. @returns Flag value. */
  public IsDontMoveAttr(): boolean {
    return this.m_bDontMoveAttr;
  }
  /** Sets the native DontMoveAttr flag. @param flag - New value. @returns Nothing. */
  protected SetDontMoveAttr(flag: boolean): void {
    this.m_bDontMoveAttr = flag;
  }
  /** Reads the native CharFormatAttr flag. @returns Flag value. */
  public IsCharFormatAttr(): boolean {
    return this.m_bCharFormatAttr;
  }
  /** Sets the native CharFormatAttr flag. @param flag - New value. @returns Nothing. */
  protected SetCharFormatAttr(flag: boolean): void {
    this.m_bCharFormatAttr = flag;
  }
  /** Reads the native OverlapAllowedAttr flag. @returns Flag value. */
  public IsOverlapAllowedAttr(): boolean {
    return this.m_bOverlapAllowedAttr;
  }
  /** Sets the native OverlapAllowedAttr flag. @param flag - New value. @returns Nothing. */
  protected SetOverlapAllowedAttr(flag: boolean): void {
    this.m_bOverlapAllowedAttr = flag;
  }
  /** Reads the native PriorityAttr flag. @returns Flag value. */
  public IsPriorityAttr(): boolean {
    return this.m_bPriorityAttr;
  }
  /** Sets the native PriorityAttr flag. @param flag - New value. @returns Nothing. */
  public SetPriorityAttr(flag: boolean): void {
    this.m_bPriorityAttr = flag;
  }
  /** Reads the native DontExpandStart flag. @returns Flag value. */
  public IsDontExpandStartAttr(): boolean {
    return this.m_bDontExpandStart;
  }
  /** Sets the native DontExpandStart flag. @param flag - New value. @returns Nothing. */
  public SetDontExpandStartAttr(flag: boolean): void {
    this.m_bDontExpandStart = flag;
  }
  /** Reads the native Nesting flag. @returns Flag value. */
  public IsNesting(): boolean {
    return this.m_bNesting;
  }
  /** Sets the native Nesting flag. @param flag - New value. @returns Nothing. */
  protected SetNesting(flag: boolean): void {
    this.m_bNesting = flag;
  }
  /** Reads the native HasDummyChar flag. @returns Flag value. */
  public HasDummyChar(): boolean {
    return this.m_bHasDummyChar;
  }
  /** Sets the native HasDummyChar flag. @param flag - New value. @returns Nothing. */
  protected SetHasDummyChar(flag: boolean): void {
    this.m_bHasDummyChar = flag;
  }
  /** Reads the native FormatIgnoreStart flag. @returns Flag value. */
  public IsFormatIgnoreStart(): boolean {
    return this.m_bFormatIgnoreStart;
  }
  /** Sets the native FormatIgnoreStart flag. @param flag - New value. @returns Nothing. */
  public SetFormatIgnoreStart(flag: boolean): void {
    this.m_bFormatIgnoreStart = flag;
  }
  /** Reads the native FormatIgnoreEnd flag. @returns Flag value. */
  public IsFormatIgnoreEnd(): boolean {
    return this.m_bFormatIgnoreEnd;
  }
  /** Sets the native FormatIgnoreEnd flag. @param flag - New value. @returns Nothing. */
  public SetFormatIgnoreEnd(flag: boolean): void {
    this.m_bFormatIgnoreEnd = flag;
  }
  /** Reads the native HasContent flag. @returns Flag value. */
  public HasContent(): boolean {
    return this.m_bHasContent;
  }
  /** Sets the native HasContent flag. @param flag - New value. @returns Nothing. */
  protected SetHasContent(flag: boolean): void {
    this.m_bHasContent = flag;
  }
  /** Reads the existing portable dontExpand projection. @returns Flag value. */
  public get dontExpand(): boolean {
    return this.DontExpand();
  }
  /** Writes through the native dontExpand setter. @param flag - New value. @returns Nothing. */
  public set dontExpand(flag: boolean) {
    this.SetDontExpand(flag);
  }
  /** Reads the existing portable dontExpandStart projection. @returns Flag value. */
  public get dontExpandStart(): boolean {
    return this.IsDontExpandStartAttr();
  }
  /** Writes through the native dontExpandStart setter. @param flag - New value. @returns Nothing. */
  public set dontExpandStart(flag: boolean) {
    this.SetDontExpandStartAttr(flag);
  }
  /** Reads the existing portable dontMoveAttr projection. @returns Flag value. */
  public get dontMoveAttr(): boolean {
    return this.IsDontMoveAttr();
  }
  /** Writes through the native dontMoveAttr setter. @param flag - New value. @returns Nothing. */
  public set dontMoveAttr(flag: boolean) {
    this.SetDontMoveAttr(flag);
  }
  /** Copies supported state for the portable snapshot adapter, independently of native fresh construction. @param target - Detached snapshot. @returns Nothing. */
  protected CopyFlagsTo(target: SwTextAttr<TFormat>): void {
    target.m_bDontExpand = this.m_bDontExpand;
    target.m_bLockExpandFlag = this.m_bLockExpandFlag;
    target.m_bDontMoveAttr = this.m_bDontMoveAttr;
    target.m_bCharFormatAttr = this.m_bCharFormatAttr;
    target.m_bOverlapAllowedAttr = this.m_bOverlapAllowedAttr;
    target.m_bPriorityAttr = this.m_bPriorityAttr;
    target.m_bDontExpandStart = this.m_bDontExpandStart;
    target.m_bNesting = this.m_bNesting;
    target.m_bHasDummyChar = this.m_bHasDummyChar;
    target.m_bFormatIgnoreStart = this.m_bFormatIgnoreStart;
    target.m_bFormatIgnoreEnd = this.m_bFormatIgnoreEnd;
    target.m_bHasContent = this.m_bHasContent;
  }
}

/** Native ranged text attribute with end-change notifications. */
export class SwTextAttrEnd<
  TFormat extends SwFormatAutoFormat | SwFormatINetFormat = SwFormatAutoFormat,
> extends SwTextAttr<TFormat> {
  protected m_nEnd: number;
  /** Initializes a ranged item. @param format - Owned item. @param start - Start offset. @param end - End offset. @returns Nothing. */
  public constructor(format: TFormat, start: number, end: number) {
    super(format, start);
    if (!Number.isInteger(end)) throw new Error("SwTextAttr end is invalid.");
    this.m_nEnd = end;
  }
  /** Returns the range end. @returns UTF-16 offset. */
  public override GetEnd(): number {
    return this.m_nEnd;
  }
  /** Sets the end without imposing ordering during structural shifts. @param end - New offset. @returns Nothing. */
  public override SetEnd(end: number): void {
    if (!Number.isInteger(end)) throw new Error("SwTextAttr end is invalid.");
    if (this.m_nEnd !== end) {
      const oldEnd = this.m_nEnd;
      this.m_nEnd = end;
      this.m_pHints?.EndPosChanged(this.Which(), this.GetStart(), oldEnd, end);
    }
  }
  /** Reads the existing portable end projection. @returns UTF-16 offset. */
  public get end(): number {
    return this.GetEnd();
  }
  /** Writes through native end notification. @param end - New offset. @returns Nothing. */
  public set end(end: number) {
    this.SetEnd(end);
  }
  /** Constructs the same concrete ranged kind for a portable snapshot. @param format - Independent item. @param start - Start. @param end - End. @returns Detached snapshot. */
  protected createRangeClone(format: TFormat, start: number, end: number): SwTextAttrEnd<TFormat> {
    return new SwTextAttrEnd(format, start, end);
  }
  /** Captures independent supported state, distinct from MakeTextAttr's fresh native flags. @param offset - Range translation. @returns Detached snapshot. */
  public clone(offset = 0): SwTextAttrEnd<TFormat> {
    const cloned = this.createRangeClone(
      this.format.Clone() as TFormat,
      this.start + offset,
      this.end + offset,
    );
    this.CopyFlagsTo(cloned);
    return cloned;
  }
}

/** Native range whose constructor prohibits expansion and marks nesting. */
export class SwTextAttrNesting<
  TFormat extends SwFormatAutoFormat | SwFormatINetFormat = SwFormatAutoFormat,
> extends SwTextAttrEnd<TFormat> {
  /** Initializes native nesting defaults. @param format - Owned item. @param start - Start. @param end - End. @returns Nothing. */
  protected constructor(format: TFormat, start: number, end: number) {
    super(format, start, end);
    this.SetDontExpand(true);
    this.SetLockExpandFlag(true);
    this.SetDontExpandStartAttr(true);
    this.SetNesting(true);
  }
  /** Retains nesting identity in portable snapshots. @param format - Independent item. @param start - Start. @param end - End. @returns Detached snapshot. */
  protected override createRangeClone(
    format: TFormat,
    start: number,
    end: number,
  ): SwTextAttrNesting<TFormat> {
    return new SwTextAttrNesting(format, start, end);
  }
}

/** Creates a Writer auto-format item for direct character attributes. @param pool - Owning Writer attribute pool. @param attributes - Effective character properties. @param inherited - Inherited character properties used to retain only direct deltas. @returns Auto-format item. */
export function createSwFormatAutoFormat(
  pool: SwAttrPool,
  attributes: WriterCharacterAttributes,
  inherited: WriterCharacterAttributes = { bold: false, italic: false, underline: false },
): SwFormatAutoFormat {
  const items = new SfxItemSet(pool, WRITER_CHARACTER_WHICH_RANGES);
  if (attributes.color !== inherited.color && attributes.color !== undefined)
    items.Put(new SfxStringItem(RES_CHRATR_COLOR, attributes.color));
  if (attributes.fontFamily !== inherited.fontFamily && attributes.fontFamily !== undefined)
    for (const which of [RES_CHRATR_FONT, RES_CHRATR_CJK_FONT, RES_CHRATR_CTL_FONT])
      items.Put(new SvxFontItem(attributes.fontFamily, which));
  if (
    attributes.fontSizeTwips !== inherited.fontSizeTwips &&
    attributes.fontSizeTwips !== undefined
  )
    for (const which of [RES_CHRATR_FONTSIZE, RES_CHRATR_CJK_FONTSIZE, RES_CHRATR_CTL_FONTSIZE])
      items.Put(new SvxFontHeightItem(attributes.fontSizeTwips, which));
  if (attributes.highlight !== inherited.highlight && attributes.highlight !== undefined)
    items.Put(new SfxStringItem(RES_CHRATR_HIGHLIGHT, attributes.highlight));
  if (attributes.bold !== inherited.bold)
    for (const which of [RES_CHRATR_WEIGHT, RES_CHRATR_CJK_WEIGHT, RES_CHRATR_CTL_WEIGHT])
      items.Put(new SvxWeightItem(attributes.bold ? FontWeight.BOLD : FontWeight.NORMAL, which));
  if (attributes.italic !== inherited.italic)
    for (const which of [RES_CHRATR_POSTURE, RES_CHRATR_CJK_POSTURE, RES_CHRATR_CTL_POSTURE])
      items.Put(new SvxPostureItem(attributes.italic ? FontItalic.NORMAL : FontItalic.NONE, which));
  if (attributes.underline !== inherited.underline)
    items.Put(
      new SvxUnderlineItem(
        attributes.underline ? FontLineStyle.SINGLE : FontLineStyle.NONE,
        RES_CHRATR_UNDERLINE,
      ),
    );
  return new SwFormatAutoFormat(
    pool.GetDoc().GetIStyleAccess().getAutomaticStyle(items, SwAutoStyleFamily.AUTO_STYLE_CHAR),
  );
}

/** Projects supported effective character items to the browser command shape. @param items - Direct character item set. @param inherited - Optional inherited style set. @returns Effective boolean properties. */
export function projectWriterCharacterAttributes(
  items: SfxItemSet,
  inherited?: SfxItemSet,
): WriterCharacterAttributes {
  const get =
    /** Resolves a direct, inherited, or pool-default item. @param which - Character WhichId. @returns Effective item. */
    (which: number): SfxPoolItem =>
      items.GetItemIfSet(which, false) ?? inherited?.Get(which) ?? items.Get(which);
  const font =
    items.GetItemIfSet(RES_CHRATR_FONT, false) ?? inherited?.GetItemIfSet(RES_CHRATR_FONT, true);
  const fontSize =
    items.GetItemIfSet(RES_CHRATR_FONTSIZE, false) ??
    inherited?.GetItemIfSet(RES_CHRATR_FONTSIZE, true);
  const color =
    items.GetItemIfSet(RES_CHRATR_COLOR, false) ?? inherited?.GetItemIfSet(RES_CHRATR_COLOR, true);
  const highlight =
    items.GetItemIfSet(RES_CHRATR_HIGHLIGHT, false) ??
    inherited?.GetItemIfSet(RES_CHRATR_HIGHLIGHT, true);
  return {
    ...(color instanceof SfxStringItem ? { color: color.GetValue() } : {}),
    ...(font instanceof SvxFontItem ? { fontFamily: font.GetFamilyName() } : {}),
    ...(fontSize instanceof SvxFontHeightItem ? { fontSizeTwips: fontSize.GetHeight() } : {}),
    ...(highlight instanceof SfxStringItem ? { highlight: highlight.GetValue() } : {}),
    bold: (get(RES_CHRATR_WEIGHT) as SvxWeightItem).GetBoolValue(),
    italic: (get(RES_CHRATR_POSTURE) as SvxPostureItem).GetBoolValue(),
    underline: (get(RES_CHRATR_UNDERLINE) as SvxUnderlineItem).GetBoolValue(),
  };
}
