/** @fileoverview Native NameOrIndex value/ownership family from xit.hxx and xattr.cxx. */
import { SfxStringItem } from "../../svl/source/items/stritem";
import type { SfxPoolItem } from "../../svl/source/items/poolitem";
import type { SfxItemPool } from "../../svl/source/items/itempool";
/** Native palette index and independent string name; naming services remain outside this value owner. */
export class NameOrIndex extends SfxStringItem {
  private m_nPalIndex: number;
  /** Original default, named/indexed and copy forms. @param args - Selected source constructor. @returns Item. */
  public constructor(
    ...args: [] | [which: number, indexOrName: number | string] | [source: NameOrIndex]
  ) {
    const source = args[0];
    super(
      source instanceof NameOrIndex ? source.Which() : (source ?? 0),
      source instanceof NameOrIndex ? source.GetName() : typeof args[1] === "string" ? args[1] : "",
    );
    this.m_nPalIndex =
      source instanceof NameOrIndex
        ? source.m_nPalIndex
        : typeof args[1] === "number"
          ? args[1] | 0
          : -1;
    // The native default constructor alone does not set this classification.
    if (args.length !== 0) this.setNameOrIndex();
  }
  /** Original palette detachment leaves the name untouched. @returns Nothing. */
  protected Detach(): void {
    this.m_nPalIndex = -1;
  }
  /** Original independent clone. @param pool - Unused source pool. @returns Cloned item. */
  public override Clone(pool?: SfxItemPool): NameOrIndex {
    void pool;
    return new NameOrIndex(this);
  }
  /** Original string/index equality. @param other - Same native item kind. @returns Value equality. */
  public override equals(other: SfxPoolItem): boolean {
    return (
      other instanceof NameOrIndex && super.equals(other) && this.m_nPalIndex === other.m_nPalIndex
    );
  }
  /** Original unverified-hashing policy. @returns False. */
  public supportsHashCode(): boolean {
    return false;
  }
  /** Original borrowed palette name. @returns Name. */
  public GetName(): string {
    return this.GetValue();
  }
  /** Original name assignment does not detach the index. @param name - New name. @returns Nothing. */
  public SetName(name: string): void {
    this.SetValue(name);
  }
  /** Original nonnegative palette-index predicate. @returns Whether indexed. */
  public IsIndex(): boolean {
    return this.m_nPalIndex >= 0;
  }
  /** Original signed32 palette index. @returns Index. */
  public GetPalIndex(): number {
    return this.m_nPalIndex;
  }
}
