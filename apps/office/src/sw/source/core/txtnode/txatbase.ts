/**
 * @fileoverview Defines Writer text-range attributes at the pinned LibreOffice `sw/source/core/txtnode/txatbase.cxx` ownership boundary.
 */

import {
  FontItalic,
  FontLineStyle,
  FontWeight,
  SvxPostureItem,
  SvxUnderlineItem,
  SvxWeightItem,
} from "../../../../editeng/source/items/textitem";
import { SfxItemSet } from "../../../../svl/source/items/itemset";
import { SfxPoolItem, type SfxPoolItemSnapshot } from "../../../../svl/source/items/poolitem";
import {
  RES_CHRATR_CJK_POSTURE,
  RES_CHRATR_CJK_WEIGHT,
  RES_CHRATR_CTL_POSTURE,
  RES_CHRATR_CTL_WEIGHT,
  RES_CHRATR_POSTURE,
  RES_CHRATR_UNDERLINE,
  RES_CHRATR_WEIGHT,
  RES_TXTATR_AUTOFMT,
  WRITER_CHARACTER_WHICH_RANGES,
} from "../../../inc/hintids";
import type { SwAttrPool } from "../attr/swatrset";

export { RES_TXTATR_AUTOFMT } from "../../../inc/hintids";

/** Names the bounded direct character properties currently carried by an auto-format item. */
export interface WriterCharacterAttributes {
  /** Whether the text uses a bold font weight. */
  readonly bold: boolean;
  /** Whether the text uses an italic posture. */
  readonly italic: boolean;
  /** Whether the text uses a single underline. */
  readonly underline: boolean;
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
      equalSnapshots(other.styleHandle.toSnapshot(), this.styleHandle.toSnapshot())
    );
  }

  /** Serializes the contained item set. @returns Nested pooled-item snapshot. */
  public toSnapshot(): SfxPoolItemSnapshot {
    return {
      type: "SwFormatAutoFormat",
      value: this.styleHandle.toSnapshot(),
      which: this.Which(),
    };
  }
}

/** Serializable representation of one bounded Writer text attribute. */
export interface SwTextAttrSnapshot {
  /** Exclusive text range end. */
  readonly end: number;
  /** Auto-format item stored by the hint. */
  readonly format: SfxPoolItemSnapshot;
  /** Inclusive text range start. */
  readonly start: number;
}

/**
 * Models LibreOffice's ranged SwTextAttrEnd for the currently implemented auto-format item.
 *
 * Flags without browser-visible behavior are retained so later ports can extend the object without
 * replacing its identity or range semantics.
 */
export class SwTextAttr {
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
    public readonly format: SwFormatAutoFormat,
    public start: number,
    public end: number,
  ) {
    if (!Number.isInteger(start) || !Number.isInteger(end) || start < 0 || end < start)
      throw new Error("SwTextAttr range is invalid.");
  }

  /** Returns the Writer pool identifier of this attribute. @returns Auto-format WhichId. */
  public Which(): typeof RES_TXTATR_AUTOFMT {
    return this.format.Which() as typeof RES_TXTATR_AUTOFMT;
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
  public clone(offset = 0): SwTextAttr {
    const cloned = new SwTextAttr(this.format.Clone(), this.start + offset, this.end + offset);
    cloned.dontExpand = this.dontExpand;
    cloned.dontExpandStart = this.dontExpandStart;
    cloned.dontMoveAttr = this.dontMoveAttr;
    return cloned;
  }

  /** Converts the attribute to cycle-free persisted data. @returns Attribute snapshot. */
  public toSnapshot(): SwTextAttrSnapshot {
    return {
      end: this.end,
      format: this.format.toSnapshot(),
      start: this.start,
    };
  }
}

/** Creates a Writer auto-format item for direct character attributes. @param pool - Owning Writer attribute pool. @param attributes - Effective character properties. @param inherited - Inherited character properties used to retain only direct deltas. @returns Auto-format item. */
export function createSwFormatAutoFormat(
  pool: SwAttrPool,
  attributes: WriterCharacterAttributes,
  inherited: WriterCharacterAttributes = { bold: false, italic: false, underline: false },
): SwFormatAutoFormat {
  const items = new SfxItemSet(pool, WRITER_CHARACTER_WHICH_RANGES);
  if (attributes.bold !== inherited.bold)
    for (const which of [RES_CHRATR_WEIGHT, RES_CHRATR_CJK_WEIGHT, RES_CHRATR_CTL_WEIGHT])
      items.Put(new SvxWeightItem(attributes.bold ? FontWeight.BOLD : FontWeight.NORMAL, which));
  if (attributes.italic !== inherited.italic)
    for (const which of [RES_CHRATR_POSTURE, RES_CHRATR_CJK_POSTURE, RES_CHRATR_CTL_POSTURE])
      items.Put(new SvxPostureItem(attributes.italic ? FontItalic.NORMAL : FontItalic.NONE, which));
  if (attributes.underline !== inherited.underline)
    items.Put(
      new SvxUnderlineItem(attributes.underline ? FontLineStyle.SINGLE : FontLineStyle.NONE),
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
  return {
    bold: (get(RES_CHRATR_WEIGHT) as SvxWeightItem).GetBoolValue(),
    italic: (get(RES_CHRATR_POSTURE) as SvxPostureItem).GetBoolValue(),
    underline: (get(RES_CHRATR_UNDERLINE) as SvxUnderlineItem).GetBoolValue(),
  };
}

/** Restores one current auto-format snapshot. @param pool - Destination pool. @param snapshot - Nested item snapshot. @returns Restored auto-format item. */
export function restoreSwFormatAutoFormat(
  pool: SwAttrPool,
  snapshot: SfxPoolItemSnapshot,
): SwFormatAutoFormat {
  if (
    snapshot.which !== RES_TXTATR_AUTOFMT ||
    snapshot.type !== "SwFormatAutoFormat" ||
    !Array.isArray(snapshot.value)
  )
    throw new Error("SwFormatAutoFormat snapshot is invalid.");
  const items = new SfxItemSet(pool, WRITER_CHARACTER_WHICH_RANGES);
  items.restoreSnapshots(snapshot.value);
  return new SwFormatAutoFormat(items);
}

/** Compares ordered snapshots without leaking mutable item identities. @param left - First snapshots. @param right - Second snapshots. @returns Whether equal. */
function equalSnapshots(
  left: readonly SfxPoolItemSnapshot[],
  right: readonly SfxPoolItemSnapshot[],
): boolean {
  return JSON.stringify(left) === JSON.stringify(right);
}
