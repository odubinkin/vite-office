/**
 * @fileoverview Reimplements the bounded SfxPoolItem base contract from pinned `svl/source/items/poolitem.cxx`.
 */

/** JSON-compatible persisted value of one pooled item. */
export type SfxPoolItemValue =
  | boolean
  | number
  | string
  | readonly SfxPoolItemValue[]
  | { readonly [key: string]: SfxPoolItemValue };

/** JSON-compatible persisted form of one pooled item. */
export interface SfxPoolItemSnapshot {
  /** Persisted item value. */
  readonly value: SfxPoolItemValue;
  /** Writer/SVL WhichId. */
  readonly which: number;
}

/** Base value object stored by SfxItemPool and SfxItemSet. */
export abstract class SfxPoolItem {
  /** Original pointer/reference comparison order. Concrete JS class identity represents native ItemType; no ABI enum or lifetime state is required. @param item1 - First item or absent pointer. @param item2 - Second item or absent pointer. @returns Identity or equal Which, concrete type and payload. */
  public static areSame(
    item1: SfxPoolItem | null | undefined,
    item2: SfxPoolItem | null | undefined,
  ): boolean {
    const left = item1 ?? null;
    const right = item2 ?? null;
    if (left === right) return true;
    if (left === null || right === null) return false;
    if (left.Which() !== right.Which()) return false;
    if (left.constructor !== right.constructor) return false;
    return left.equals(right);
  }

  private shareable = true;
  private m_bNameOrIndex = false;
  /** Original drawing palette-item classification. @returns Source flag. */
  public isNameOrIndex(): boolean {
    return this.m_bNameOrIndex;
  }
  /** Original protected palette classification assignment. @returns Nothing. */
  protected setNameOrIndex(): void {
    this.m_bNameOrIndex = true;
  }
  private m_bIsSetItem = false;
  private m_bStaticDefault = false;
  private m_bDynamicDefault = false;
  /** Original logical static-default classification, without lifetime handling. @returns Whether a package-owned static default. */
  public isStaticDefault(): boolean {
    return this.m_bStaticDefault;
  }
  /** Original logical pool-dependent default classification. @returns Whether a dynamic default. */
  public isDynamicDefault(): boolean {
    return this.m_bDynamicDefault;
  }
  /** Original friend-only classification assignment; ordinary JS GC owns lifetime. @returns Nothing. */
  protected setStaticDefault(): void {
    this.m_bStaticDefault = true;
  }
  /** Original friend-only classification assignment; no refcount or disposal action. @returns Nothing. */
  protected setDynamicDefault(): void {
    this.m_bDynamicDefault = true;
  }

  /** Original classification flag for items containing an SfxItemSet. @returns Whether a set item. */
  public isSetItem(): boolean {
    return this.m_bIsSetItem;
  }
  /** Original protected set-item classification assignment; no lifetime action. @returns Nothing. */
  protected setIsSetItem(): void {
    this.m_bIsSetItem = true;
  }

  /** Reports the native item-dependent sharing policy. @returns Whether pools may share this item. */
  public isShareable(): boolean {
    return this.shareable;
  }

  /** Disables sharing for item classes with native non-shareable ownership. @returns Nothing. */
  protected setNonShareable(): void {
    this.shareable = false;
  }

  /** Creates one item for a concrete WhichId or zero-valued request return. @param which - Bounded Writer/SVL item identity. @returns Nothing. */
  protected constructor(private which: number) {
    if (!Number.isInteger(which) || which < 0 || which > 32767)
      throw new Error("SfxPoolItem WhichId is invalid.");
  }

  /** Returns this item's WhichId. @returns Item identity, including zero for request values. */
  public Which(): number {
    return this.which;
  }

  /** Changes the identity of an owned item before insertion into a set. @param which - Bounded local item identity. @returns Nothing. */
  public SetWhich(which: number): void {
    if (!Number.isInteger(which) || which < 0 || which > 32767)
      throw new Error("SfxPoolItem WhichId is invalid.");
    this.which = which;
  }

  /** Creates an independent item with the same type and value. @param pool - Optional destination pool for concrete pool-bound values. @returns Cloned item, or null for a static state sentinel. */
  public abstract Clone(pool?: import("./itempool").SfxItemPool): SfxPoolItem | null;

  /** Compares the concrete payload under the subclass contract; areSame additionally checks WhichId and exact type. @param other - Candidate item. @returns True for equal items. */
  public abstract equals(other: SfxPoolItem): boolean;

  /** Original no-op metric scaling for non-metric items. @param scale - Unused factor. @returns Nothing. */
  public ScaleMetrics(scale: number): void {
    void scale;
  }
  /** Original default for items without dimensional metrics. @returns False. */
  public HasMetrics(): boolean {
    return false;
  }

  /** Original unsupported query default, represented by the existing browser no-payload boundary. Concrete item overrides retain their values. @returns No value. */
  public QueryValue(): unknown {
    return undefined;
  }
  /** Original unsupported value update; member is required as in the native declaration. @param value - Generic browser value payload. @param member - Native member identifier. @returns False without mutation. */
  public PutValue(value: unknown, member: number): boolean {
    void value;
    void member;
    return false;
  }
}

/** Static invalid-state item owned by the pinned poolitem.cxx module. */
class InvalidItem extends SfxPoolItem {
  /** Creates the zero-WhichId static state item. @returns Nothing. */
  public constructor() {
    super(0);
  }

  /** Mirrors the sentinel's null Clone result. @returns Null. */
  public Clone(): null {
    return null;
  }

  /** Mirrors the pinned trivial sentinel equality operator. @param other - Unused candidate. @returns True. */
  public equals(other: SfxPoolItem): boolean {
    void other;
    return true;
  }

  /** Exposes no payload, matching the base failed QueryValue operation. @returns No value. */
  public override QueryValue(): undefined {
    return undefined;
  }
}

/** Static disabled-state item owned by the pinned poolitem.cxx module. */
class DisabledItem extends SfxPoolItem {
  /** Creates the zero-WhichId static state item. @returns Nothing. */
  public constructor() {
    super(0);
  }

  /** Mirrors the sentinel's null Clone result. @returns Null. */
  public Clone(): null {
    return null;
  }

  /** Mirrors the pinned trivial sentinel equality operator. @param other - Unused candidate. @returns True. */
  public equals(other: SfxPoolItem): boolean {
    void other;
    return true;
  }

  /** Exposes no payload, matching the base failed QueryValue operation. @returns No value. */
  public override QueryValue(): undefined {
    return undefined;
  }
}

/** The unique invalid item stored for all explicit INVALID states. */
export const INVALID_POOL_ITEM: SfxPoolItem = new InvalidItem();

/** The unique disabled item returned for all explicit DISABLED states. */
export const DISABLED_POOL_ITEM: SfxPoolItem = new DisabledItem();

/** Tests invalid sentinel pointer identity. @param item - Candidate item or absent pointer. @returns Whether invalid. */
export function IsInvalidItem(item: SfxPoolItem | null | undefined): boolean {
  return item === INVALID_POOL_ITEM;
}

/** Tests sentinel pointer identity, as the pinned inline helper does. @param item - Candidate item or absent pointer. @returns Whether disabled. */
export function IsDisabledItem(item: SfxPoolItem | null | undefined): boolean {
  return item === DISABLED_POOL_ITEM;
}
