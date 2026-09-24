/**
 * @fileoverview Reimplements the bounded SfxPoolItem value hierarchy from pinned `svl/source/items/poolitem.cxx`.
 */

/** JSON-compatible persisted value of one pooled item. */
export type SfxPoolItemValue =
  boolean | number | string | readonly number[] | readonly SfxPoolItemSnapshot[];

/** JSON-compatible persisted form of one pooled item. */
export interface SfxPoolItemSnapshot {
  /** Persisted item value. */
  readonly value: SfxPoolItemValue;
  /** Writer/SVL WhichId. */
  readonly which: number;
}

/** Base value object stored by SfxItemPool and SfxItemSet. */
export abstract class SfxPoolItem {
  /** Creates one item for a concrete WhichId. @param which - Positive Writer/SVL item identity. @returns Nothing. */
  protected constructor(private readonly which: number) {
    if (!Number.isInteger(which) || which <= 0) throw new Error("SfxPoolItem WhichId is invalid.");
  }

  /** Returns this item's WhichId. @returns Positive item identity. */
  public Which(): number {
    return this.which;
  }

  /** Creates an independent item with the same type and value. @returns Cloned item. */
  public abstract Clone(): SfxPoolItem;

  /** Compares item class, WhichId, and concrete value. @param other - Candidate item. @returns True for equal items. */
  public abstract equals(other: SfxPoolItem): boolean;

  /** Exposes the UNO-compatible value used by filter and persistence boundaries. @returns Item value. */
  public abstract QueryValue(): unknown;
}

/** UNO Any-valued request item used only at dispatch boundaries, matching SfxUnoAnyItem. */
export class SfxUnoAnyItem extends SfxPoolItem {
  /** Creates an Any argument item. @param which - Slot/argument identity. @param value - Caller-owned immutable boundary value. @returns Nothing. */
  public constructor(
    which: number,
    private readonly value: unknown,
  ) {
    super(which);
  }

  /** Returns the stored Any value. @returns Boundary value. */
  public GetValue(): unknown {
    return this.value;
  }

  /** Creates an independent item wrapper. @returns Cloned item. */
  public Clone(): SfxUnoAnyItem {
    return new SfxUnoAnyItem(this.Which(), this.value);
  }

  /** Compares the item identity and Any value identity. @param other - Candidate item. @returns Equality. */
  public equals(other: SfxPoolItem): boolean {
    return (
      other instanceof SfxUnoAnyItem && other.Which() === this.Which() && other.value === this.value
    );
  }

  /** Exposes the UNO Any value. @returns Boundary value. */
  public QueryValue(): unknown {
    return this.value;
  }
}

/** String-valued SfxPoolItem counterpart. */
export class SfxStringItem extends SfxPoolItem {
  /** Creates a string item. @param which - Item identity. @param value - String value. @returns Nothing. */
  public constructor(
    which: number,
    private readonly value: string,
  ) {
    super(which);
  }

  /** Returns the stored string. @returns String item value. */
  public GetValue(): string {
    return this.value;
  }

  /** Creates an independent string item. @returns Cloned item. */
  public Clone(): SfxStringItem {
    return new SfxStringItem(this.Which(), this.value);
  }

  /** Compares string item identity and value. @param other - Candidate item. @returns True for an equal string item. */
  public equals(other: SfxPoolItem): boolean {
    return (
      other instanceof SfxStringItem && other.Which() === this.Which() && other.value === this.value
    );
  }

  /** Returns the string value through the generic item contract. @returns String value. */
  public QueryValue(): string {
    return this.value;
  }
}

/** Signed-16-bit SfxPoolItem counterpart used by Writer list levels. */
export class SfxInt16Item extends SfxPoolItem {
  /** Creates a signed-16-bit item. @param which - Item identity. @param value - Signed-16-bit value. @returns Nothing. */
  public constructor(
    which: number,
    private readonly value: number,
  ) {
    super(which);
    if (!Number.isInteger(value) || value < -32768 || value > 32767)
      throw new Error("SfxInt16Item value is outside the signed 16-bit range.");
  }

  /** Returns the stored integer. @returns Signed-16-bit item value. */
  public GetValue(): number {
    return this.value;
  }

  /** Creates an independent integer item. @returns Cloned item. */
  public Clone(): SfxInt16Item {
    return new SfxInt16Item(this.Which(), this.value);
  }

  /** Compares integer item identity and value. @param other - Candidate item. @returns True for an equal integer item. */
  public equals(other: SfxPoolItem): boolean {
    return (
      other instanceof SfxInt16Item && other.Which() === this.Which() && other.value === this.value
    );
  }

  /** Returns the integer value through the generic item contract. @returns Integer value. */
  public QueryValue(): number {
    return this.value;
  }
}

/** Ordered paragraph tab positions stored as one pooled item. */
export class SfxInt16ListItem extends SfxPoolItem {
  private readonly values: readonly number[];

  /** Creates sorted, unique tab stops. @param which - Item identity. @param values - Twip positions. */
  /** Handles Writer formatting state. @param which - Input value. @param values - Input value. @returns Callback result. */ public constructor(
    which: number,
    values: readonly number[],
  ) {
    super(which);
    if (
      values.some(
        /** Handles Writer formatting state. @param value - Input value. @returns Callback result. */ (
          value,
        ) => !Number.isInteger(value) || value < 0 || value > 32767,
      )
    )
      throw new Error("Tab positions must fit the non-negative signed 16-bit range.");
    this.values = Object.freeze(
      [...new Set(values)].sort(
        /** Handles Writer formatting state. @param left - Input value. @param right - Input value. @returns Callback result. */ (
          left,
          right,
        ) => left - right,
      ),
    );
  }

  /** Returns the tab positions. @returns Twip positions. */
  public GetValues(): readonly number[] {
    return this.values;
  }
  /** Clones this pooled item. @returns Independent tab list. */
  public Clone(): SfxInt16ListItem {
    return new SfxInt16ListItem(this.Which(), this.values);
  }
  /** Compares tab positions and item identity. @param other - Candidate item. @returns Equality. */
  public equals(other: SfxPoolItem): boolean {
    return (
      other instanceof SfxInt16ListItem &&
      other.Which() === this.Which() &&
      this.values.length === other.values.length &&
      this.values.every(
        /** Handles Writer formatting state. @param value - Input value. @param index - Input value. @returns Callback result. */ (
          value,
          index,
        ) => value === other.values[index],
      )
    );
  }
  /** Returns persisted tab positions. @returns Twip positions. */
  public QueryValue(): readonly number[] {
    return this.values;
  }
}

/** Boolean SfxPoolItem used by request arguments, return values, and checked state. */
export class SfxBoolItem extends SfxPoolItem {
  /** Creates a boolean item. @param which - Item identity. @param value - Boolean value. @returns Nothing. */
  public constructor(
    which: number,
    private readonly value: boolean,
  ) {
    super(which);
  }

  /** Returns the stored boolean. @returns Boolean value. */
  public GetValue(): boolean {
    return this.value;
  }

  /** Creates an independent boolean item. @returns Cloned item. */
  public Clone(): SfxBoolItem {
    return new SfxBoolItem(this.Which(), this.value);
  }

  /** Compares boolean item identity and value. @param other - Candidate item. @returns Equality. */
  public equals(other: SfxPoolItem): boolean {
    return (
      other instanceof SfxBoolItem && other.Which() === this.Which() && other.value === this.value
    );
  }

  /** Returns the boolean through the generic item contract. @returns Boolean value. */
  public QueryValue(): boolean {
    return this.value;
  }
}
