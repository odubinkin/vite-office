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
import {
  SfxPoolItem,
  SfxStringItem,
  type SfxPoolItemSnapshot,
} from "../../../../svl/source/items/poolitem";
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
import { SwFormatINetFormat } from "./fmtinfmt";

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
  private readonly styleHandle: SfxItemSet;

  /** Creates an auto-format item from direct character deltas. @param styleHandle - Character item set. @param which - Auto-format WhichId. @returns Nothing. */
  public constructor(styleHandle: SfxItemSet, which: number = RES_TXTATR_AUTOFMT) {
    super(which);
    if (which !== RES_TXTATR_AUTOFMT) throw new Error("SwFormatAutoFormat WhichId is invalid.");
    this.styleHandle = styleHandle.Clone();
  }

  /** Returns the owned direct character item set. @returns Independent read/write item set. */
  public GetStyleHandle(): SfxItemSet {
    return this.styleHandle;
  }

  /** Creates an independent auto-format item. @returns Cloned item and item set. */
  public Clone(): SwFormatAutoFormat {
    return new SwFormatAutoFormat(this.styleHandle, this.Which());
  }

  /** Compares WhichId and direct item values. @param other - Candidate pool item. @returns Whether equal. */
  public equals(other: SfxPoolItem): boolean {
    return (
      other instanceof SwFormatAutoFormat &&
      other.Which() === this.Which() &&
      equalItemSets(other.styleHandle, this.styleHandle)
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

/**
 * Models LibreOffice's ranged SwTextAttrEnd for the currently implemented auto-format item.
 *
 * Flags without browser-visible behavior are retained so later ports can extend the object without
 * replacing its identity or range semantics.
 */
export class SwTextAttr<
  TFormat extends SwFormatAutoFormat | SwFormatINetFormat = SwFormatAutoFormat,
> {
  /** Prevents expansion at the end during insertion when enabled. */
  public dontExpand = false;
  /** Prevents expansion at the start during insertion when enabled. */
  public dontExpandStart = false;
  /** Prevents moving this attribute during structural edits when enabled. */
  public dontMoveAttr = false;

  /**
   * Creates one ranged Writer text attribute.
   *
   * @param format - Auto-format item owned by this hint.
   * @param start - Inclusive UTF-16 start offset.
   * @param end - Exclusive UTF-16 end offset.
   * @returns Nothing; initializes this attribute.
   */
  public constructor(
    public readonly format: TFormat,
    public start: number,
    public end: number,
  ) {
    if (!Number.isInteger(start) || !Number.isInteger(end) || start < 0 || end < start)
      throw new Error("SwTextAttr range is invalid.");
  }

  /** Returns the Writer pool identifier of this attribute. @returns Auto-format WhichId. */
  public Which(): typeof RES_TXTATR_AUTOFMT | typeof RES_TXTATR_INETFMT {
    return this.format.Which() as typeof RES_TXTATR_AUTOFMT | typeof RES_TXTATR_INETFMT;
  }

  /** Returns the inclusive start offset. @returns Inclusive UTF-16 offset. */
  public GetStart(): number {
    return this.start;
  }

  /** Returns the exclusive end offset. @returns Exclusive UTF-16 offset. */
  public GetEnd(): number {
    return this.end;
  }

  /** Changes the exclusive range end after validating Writer ordering. @param end - New exclusive offset. @returns Nothing. */
  public SetEnd(end: number): void {
    if (!Number.isInteger(end) || end < this.start) throw new Error("SwTextAttr end is invalid.");
    this.end = end;
  }

  /** Creates an independent attribute with the same item and flags. @param offset - Offset applied to the cloned range. @returns Independent attribute. */
  public clone(offset = 0): SwTextAttr<TFormat> {
    const cloned = new SwTextAttr(
      this.format.Clone() as TFormat,
      this.start + offset,
      this.end + offset,
    );
    cloned.dontExpand = this.dontExpand;
    cloned.dontExpandStart = this.dontExpandStart;
    cloned.dontMoveAttr = this.dontMoveAttr;
    return cloned;
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
  return new SwFormatAutoFormat(items);
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

/** Compares direct item values without a persistence-shaped intermediate. @param left - First set. @param right - Second set. @returns Whether equal. */
function equalItemSets(left: SfxItemSet, right: SfxItemSet): boolean {
  const leftItems = left.entries();
  const rightItems = right.entries();
  return (
    leftItems.length === rightItems.length &&
    leftItems.every(
      /** Compares one ordered item. @param item - Left item. @param index - Ordered offset. @returns Whether values match. */ (
        item,
        index,
      ) => item.equals(rightItems[index] as SfxPoolItem),
    )
  );
}
