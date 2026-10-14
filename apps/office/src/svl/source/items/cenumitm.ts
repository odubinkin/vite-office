/** @fileoverview Original SfxBoolItem logical value contract; native instance/refcount caches remain outside the GC binding. */
import { SfxPoolItem } from "./poolitem";
import type { SfxItemPool } from "./itempool";
import { Any } from "../../../cppu/inc/com/sun/star/uno/Any";
import { enum2int } from "../../../comphelper/inc/extract";
import { OUString } from "../../../sal/inc/rtl/ustring";

/** Shared native bool item used by Writer and Calc; the existing browser UNO transport exposes plain scalar values. */
export class SfxBoolItem extends SfxPoolItem {
  private value: boolean;
  /** Original scalar/default and implicit copy construction. @param whichOrSource - Identity or actual const source. @param value - Scalar payload. @returns Item. */
  public constructor(whichOrSource: number | Readonly<SfxBoolItem> = 0, value = false) {
    super(typeof whichOrSource === "number" ? whichOrSource : whichOrSource.Which());
    this.value = typeof whichOrSource === "number" ? value : whichOrSource.GetValue();
  }
  /** Original default factory. @returns Zero-Which false item. */
  public static CreateDefault(): SfxBoolItem {
    return new SfxBoolItem();
  }
  /** Original bool payload query. @returns Stored value. */
  public GetValue(): boolean {
    return this.value;
  }
  /** Original unchanged-value early return and assignment. @param value - New payload. @returns Nothing. */
  public SetValue(value: boolean): void {
    if (this.value === value) return;
    this.value = value;
  }
  /** Original clone uses value copying and retains Which. @param pool - Unused native pool argument. @returns Independent item. */
  public Clone(pool?: SfxItemPool): SfxBoolItem {
    void pool;
    return new SfxBoolItem(this);
  }
  /** Native same-item-type comparison uses only the bool payload; host cross-type input returns false outside the asserted native domain. @param other - Candidate. @returns Equality. */
  public equals(other: SfxPoolItem): boolean {
    return (
      other instanceof SfxBoolItem &&
      other.constructor === this.constructor &&
      other.value === this.value
    );
  }
  /** Original bool Any query through the existing browser scalar binding. @returns Bool payload. */
  public override QueryValue(): boolean {
    return this.value;
  }
  /** Original bool extraction, unchanged success and wrong-type failure through the existing browser scalar binding. @param value - Payload. @param member - Ignored native member identifier. @returns Extraction success. */
  public override PutValue(value: unknown, member: number): boolean {
    void member;
    if (typeof value !== "boolean") return false;
    if (this.value === value) return true;
    this.value = value;
    return true;
  }
  /** Original parameter-driven uppercase value text, independent of this item's current value. @param value - Presented bool. @returns Actual Unicode value. */
  public GetValueTextByVal(value: boolean): OUString {
    return new OUString(
      value ? new Uint8Array([84, 82, 85, 69, 0]) : new Uint8Array([70, 65, 76, 83, 69, 0]),
    );
  }
}

/** Original enum-item virtual interface; actual value representation remains in its concrete template owner. */
export abstract class SfxEnumItemInterface extends SfxPoolItem {
  /** Original Which or implicit base-copy constructor. @param source - Identity or const source. @returns Interface base. */
  protected constructor(source: number | Readonly<SfxEnumItemInterface>) {
    super(typeof source === "number" ? source : source.Which());
  }
  /** Original unsigned16 enum query. @returns Enum value. */
  public abstract GetEnumValue(): number;
  /** Original unsigned16 enum write. @param value - Enum value. @returns Nothing. */
  public abstract SetEnumValue(value: number): void;
  /** Original same-type enum-value comparison; foreign host types return false outside native asserted inputs. @param other - Candidate. @returns Equality. */
  public equals(other: SfxPoolItem): boolean {
    return (
      other instanceof SfxEnumItemInterface &&
      other.constructor === this.constructor &&
      this.GetEnumValue() === other.GetEnumValue()
    );
  }
  /** Existing browser unwrapped scalar query. @returns Unsigned enum value. */
  public override QueryValue(): number;
  /** Original native Any output form. @param output - Actual destination Any. @param member - Ignored member identifier. @returns True. */
  public override QueryValue(output: Any, member?: number): boolean;
  /** Original unconditional unsigned16 payload query. @param output - Optional native destination. @param member - Ignored original member. @returns Native success or scalar browser value. */
  public override QueryValue(output?: Any, member = 0): boolean | number {
    void member;
    if (output === undefined) return this.GetEnumValue();
    output.insert([this.GetEnumValue()], "sal_uInt16");
    return true;
  }
  /** Original enum2int then unsigned16 assignment, with explicit signed32 scalar browser transport. @param value - Actual Any or browser signed32. @param member - Ignored native member. @returns Success. */
  public override PutValue(value: unknown, member: number): boolean {
    void member;
    const result: [number] = [0];
    if (value instanceof Any) {
      if (!enum2int(result, value)) return false;
    } else {
      if (
        typeof value !== "number" ||
        !Number.isInteger(value) ||
        value < -2147483648 ||
        value > 2147483647
      )
        return false;
      result[0] = value;
    }
    this.SetEnumValue(result[0] & 0xffff);
    return true;
  }
  /** Original enum interface does not expose bool semantics. @returns False. */
  public HasBoolValue(): boolean {
    return false;
  }
  /** Original bool query default. @returns False. */
  public GetBoolValue(): boolean {
    return false;
  }
  /** Original bool assignment does nothing. @param value - Ignored bool. @returns Nothing. */
  public SetBoolValue(value: boolean): void {
    void value;
  }
}
