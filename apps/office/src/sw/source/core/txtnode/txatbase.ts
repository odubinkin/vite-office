/**
 * @fileoverview Defines Writer text-range attributes at the pinned LibreOffice `sw/source/core/txtnode/txatbase.cxx` ownership boundary.
 */

import { RES_TXTATR_AUTOFMT } from "../../../inc/hintids";

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

/** Stores the character item set referenced by one RES_TXTATR_AUTOFMT hint. */
export interface SwFormatAutoFormat {
  /** Direct character items active for the hint range. */
  readonly items: WriterCharacterAttributes;
  /** Writer pool identifier retained from the upstream text-attribute model. */
  readonly which: typeof RES_TXTATR_AUTOFMT;
}

/** Serializable representation of one bounded Writer text attribute. */
export interface SwTextAttrSnapshot {
  /** Exclusive text range end. */
  readonly end: number;
  /** Auto-format item stored by the hint. */
  readonly format: SwFormatAutoFormat;
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
    return this.format.which;
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
    const cloned = new SwTextAttr(
      { items: { ...this.format.items }, which: this.format.which },
      this.start + offset,
      this.end + offset,
    );
    cloned.dontExpand = this.dontExpand;
    cloned.dontExpandStart = this.dontExpandStart;
    cloned.dontMoveAttr = this.dontMoveAttr;
    return cloned;
  }

  /** Converts the attribute to cycle-free persisted data. @returns Attribute snapshot. */
  public toSnapshot(): SwTextAttrSnapshot {
    return {
      end: this.end,
      format: { items: { ...this.format.items }, which: RES_TXTATR_AUTOFMT },
      start: this.start,
    };
  }
}

/** Creates a Writer auto-format item for direct character attributes. @param items - Direct character properties. @returns Auto-format item. */
export function createSwFormatAutoFormat(items: WriterCharacterAttributes): SwFormatAutoFormat {
  return { items: { ...items }, which: RES_TXTATR_AUTOFMT };
}
