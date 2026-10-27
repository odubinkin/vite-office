/** @fileoverview Native XFillTransparenceItem from xfltrit.hxx and xattr2.cxx. */
import { SfxPoolItem } from "../../svl/source/items/poolitem";
import type { SfxItemPool } from "../../svl/source/items/itempool";
import { Any } from "../../cppu/inc/com/sun/star/uno/Any";
import { hash_combine } from "../../o3tl/inc/hash_combine";
import { XATTR_FILLTRANSPARENCE } from "./xdef";
/** Native solid transparency item; valid constructed values have range zero through one hundred. */
export class XFillTransparenceItem extends SfxPoolItem {
  private m_nValue: number;
  /** Original unsigned16 value and implicit-copy forms. @param source - Transparency or copy. @returns Item. */
  public constructor(source: number | XFillTransparenceItem = 0) {
    super(source instanceof XFillTransparenceItem ? source.Which() : XATTR_FILLTRANSPARENCE);
    this.m_nValue = source instanceof XFillTransparenceItem ? source.m_nValue : source & 0xffff;
    if (this.m_nValue > 100) throw new Error("assert(m_nValue <= 100)");
  }
  /** Original independent copy clone. @param pool - Unused pool. @returns Item. */
  public override Clone(pool?: SfxItemPool): XFillTransparenceItem {
    void pool;
    return new XFillTransparenceItem(this);
  }
  /** Original unsigned16 payload. @returns Transparency. */
  public GetValue(): number {
    return this.m_nValue;
  }
  /** Original value comparison under the same-type/Which precondition. @param other - Candidate. @returns Equality. */
  public override equals(other: SfxPoolItem): boolean {
    return other instanceof XFillTransparenceItem && this.m_nValue === other.m_nValue;
  }
  /** Original hash availability. @returns True. */
  public supportsHashCode(): boolean {
    return true;
  }
  /** Original Which and unsigned16 payload fold. @returns Logical unsigned64 hash. */
  public hashCode(): bigint {
    const seed: [bigint] = [0n];
    hash_combine(seed, this.Which());
    hash_combine(seed, this.m_nValue);
    return seed[0];
  }
  /** Existing scalar browser query. @returns Unsigned16 value. */
  public override QueryValue(): number;
  /** Original unsigned16 Any query. @param output - Native Any. @param member - Ignored member. @returns True. */
  public override QueryValue(output: Any, member?: number): boolean;
  /** Inserts exactly the native unsigned16 payload. @param output - Optional Any. @param member - Ignored native member. @returns Scalar or success. */
  public override QueryValue(output?: Any, member = 0): boolean | number {
    void member;
    if (output === undefined) return this.m_nValue;
    output.insert([this.m_nValue], "sal_uInt16");
    return true;
  }
  /** Original unsigned16 extraction and legacy signed32 narrowing fallback. @param input - Actual Any. @param member - Ignored member. @returns Extraction success. */
  public override PutValue(input: unknown, member: number): boolean {
    void member;
    if (!(input instanceof Any)) return false;
    const value: [number] = [this.m_nValue];
    if (!input.extract(value, "sal_uInt16") && !input.extract(value, "sal_Int32")) return false;
    this.m_nValue = value[0] & 0xffff;
    if (this.m_nValue > 100) throw new Error("assert(m_nValue <= 100)");
    return true;
  }
}
