/** @fileoverview Original SfxBoolItem logical value contract; native instance/refcount caches remain outside the GC binding. */
import { SfxPoolItem } from "./poolitem";
import type { SfxItemPool } from "./itempool";
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
