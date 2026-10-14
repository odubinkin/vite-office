/** @fileoverview Original eitem.hxx enum template and shared bool item boundary using ordinary JS values. */
import { SfxEnumItemInterface } from "./cenumitm";
import type { SfxPoolItem } from "../source/items/poolitem";
export { SfxBoolItem } from "../source/items/cenumitm";
/** Original enum template; C++ EnumT specialization is erased and preserves its initialized numeric payload. */
export abstract class SfxEnumItem<EnumT extends number> extends SfxEnumItemInterface {
  private m_nValue: EnumT;
  /** Original value and implicit-copy forms. @param args - Native selected constructor. @returns Enum item base. */
  protected constructor(
    ...args: [which: number, value: EnumT] | [source: Readonly<SfxEnumItem<EnumT>>]
  ) {
    if (args.length === 2) {
      super(args[0]);
      this.m_nValue = args[1];
    } else {
      super(args[0]);
      this.m_nValue = (args[0] as SfxEnumItem<EnumT>).m_nValue;
    }
  }
  /** Original typed payload query. @returns Enum value. */
  public GetValue(): EnumT {
    return this.m_nValue;
  }
  /** Original initialized enum payload write. @param value - Native EnumT value. @returns Nothing. */
  public SetValue(value: EnumT): void {
    this.m_nValue = value;
  }
  /** Original sal_uInt16 conversion. @returns Unsigned16 enum value. */
  public GetEnumValue(): number {
    return this.GetValue() & 0xffff;
  }
  /** Original unsigned16 input conversion into EnumT. @param value - Native unsigned16 argument. @returns Nothing. */
  public SetEnumValue(value: number): void {
    this.SetValue((value & 0xffff) as EnumT);
  }
  /** Original interface comparison then full EnumT payload equality. @param other - Candidate. @returns Equality. */
  public override equals(other: SfxPoolItem): boolean {
    return super.equals(other) && this.m_nValue === (other as SfxEnumItem<EnumT>).m_nValue;
  }
  /** Original unconditional hash support. @returns True. */
  public supportsHashCode(): boolean {
    return true;
  }
  /** Original identity xor narrowed enum payload. @returns Logical unsigned hash. */
  public hashCode(): number {
    return (this.Which() ^ this.GetEnumValue()) >>> 0;
  }
}
