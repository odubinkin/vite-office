/** @fileoverview Original EditCharAttrib pooled-item/range owner and tab/line-break feature constructors. Rendering/SetFont and the other attribute subtypes remain outside this consumed group. */
import { SfxPoolItemHolder } from "../../../svl/source/items/itemset";
import type { SfxItemPool } from "../../../svl/source/items/itempool";
import type { SfxPoolItem } from "../../../svl/source/items/poolitem";
import { EE_ITEMS_START, EE_ITEMS_END, EE_FEATURE_START, EE_FEATURE_END } from "../../inc/eeitem";
/** Original feature marker, independent of the actual tab/line-break attribute Which. */
export const CH_FEATURE = 0x0001;
/** Original common attribute owner; mutable scalar cells bind C++ lvalues without copying the attribute. */
export class EditCharAttrib {
  private readonly maItemHolder: SfxPoolItemHolder;
  private readonly nStart: [number];
  private readonly nEnd: [number];
  private bFeature = false;
  private bEdge = false;
  private bExpandable = true;
  /** Original item retention, independent endpoints and source constructor assertions. @param pool - Actual pool. @param item - Borrowed source item. @param start - Source start. @param end - Source end. @returns Attribute owner. */
  constructor(pool: SfxItemPool, item: SfxPoolItem, start: number, end: number) {
    this.maItemHolder = new SfxPoolItemHolder(pool, item);
    this.nStart = [start];
    this.nEnd = [end];
    if (
      !(item.Which() >= EE_ITEMS_START && item.Which() <= EE_ITEMS_END) ||
      !(item.Which() < EE_FEATURE_START || item.Which() > EE_FEATURE_END || end === start + 1)
    ) {
      this.maItemHolder.Dispose();
      throw new Error("EditCharAttrib source constructor assertion");
    }
  }
  /** Original empty destructor implicitly destroys the actual item-holder member. @returns Nothing. */
  dispose(): void {
    this.maItemHolder.Dispose();
  }
  /** Original borrowed holder. @returns Actual owner association. */
  GetHolder(): SfxPoolItemHolder {
    return this.maItemHolder;
  }
  /** Original borrowed item pointer. @returns Actual pooled item or null. */
  GetItem(): SfxPoolItem | null {
    return this.maItemHolder.getItem();
  }
  /** Original item ID or zero for an absent holder. @returns Original Which. */
  Which(): number {
    return this.GetItem()?.Which() ?? 0;
  }
  /** Original const start. @returns Scalar. */
  GetStart(): number;
  /** Original mutable start lvalue. @param mutable - Erased mutable overload. @returns Stable scalar cell. */
  GetStart(mutable: true): [number];
  /** Binds original scalar/reference overload selection. @param mutable - Mutable selector. @returns Scalar or original cell. */
  GetStart(mutable?: true): number | [number] {
    return mutable ? this.nStart : this.nStart[0];
  }
  /** Original const end. @returns Scalar. */
  GetEnd(): number;
  /** Original mutable end lvalue. @param mutable - Erased mutable overload. @returns Stable scalar cell. */
  GetEnd(mutable: true): [number];
  /** Binds original scalar/reference overload selection. @param mutable - Mutable selector. @returns Scalar or original cell. */
  GetEnd(mutable?: true): number | [number] {
    return mutable ? this.nEnd : this.nEnd[0];
  }
  /** Original endpoint difference in its defined signed32 domain. @returns Length. */
  GetLen(): number {
    return this.nEnd[0] - this.nStart[0];
  }
  /** Original forward range translation. @param difference - Source increment. @returns Nothing. */
  MoveForward(difference: number): void {
    this.nStart[0] += difference;
    this.nEnd[0] += difference;
  }
  /** Original backward range translation. @param difference - Source decrement. @returns Nothing. */
  MoveBackward(difference: number): void {
    this.nStart[0] -= difference;
    this.nEnd[0] -= difference;
  }
  /** Original end-only expansion. @param difference - Source increment. @returns Nothing. */
  Expand(difference: number): void {
    this.nEnd[0] += difference;
  }
  /** Original end-only collapse, retaining source spelling. @param difference - Source decrement. @returns Nothing. */
  Collaps(difference: number): void {
    this.nEnd[0] -= difference;
  }
  /** Original closed interval predicate. @param position - Source index. @returns Membership. */
  IsIn(position: number): boolean {
    return this.nStart[0] <= position && this.nEnd[0] >= position;
  }
  /** Original half-open predicate. @param position - Source index. @returns Membership. */
  IsInLeftClosedRightOpen(position: number): boolean {
    return this.nStart[0] <= position && this.nEnd[0] > position;
  }
  /** Original open interval predicate. @param position - Source index. @returns Membership. */
  IsInside(position: number): boolean {
    return this.nStart[0] < position && this.nEnd[0] > position;
  }
  /** Original empty-range predicate. @returns Equal endpoints. */
  IsEmpty(): boolean {
    return this.nStart[0] === this.nEnd[0];
  }
  /** Original feature flag. @returns Flag. */
  IsFeature(): boolean {
    return this.bFeature;
  }
  /** Original feature flag assignment. @param value - Source flag. @returns Nothing. */
  SetFeature(value: boolean): void {
    this.bFeature = value;
  }
  /** Original edge flag. @returns Flag. */
  IsEdge(): boolean {
    return this.bEdge;
  }
  /** Original edge flag assignment. @param value - Source flag. @returns Nothing. */
  SetEdge(value: boolean): void {
    this.bEdge = value;
  }
  /** Original features-never-expand conjunction. @returns Predicate. */
  IsExpandable(): boolean {
    return !this.bFeature && this.bExpandable;
  }
  /** Original independent expandable flag. @param value - Source flag. @returns Nothing. */
  SetExpandable(value: boolean): void {
    this.bExpandable = value;
  }
}
/** Original one-unit tab feature; it is never an expandable ordinary character range. */
export class EditCharAttribTab extends EditCharAttrib {
  /** Original base construction followed by feature marking. @param pool - Actual pool. @param item - Actual tab item. @param position - Source position. @returns Feature owner. */
  constructor(pool: SfxItemPool, item: SfxPoolItem, position: number) {
    super(pool, item, position, position + 1);
    this.SetFeature(true);
  }
}
/** Original one-unit soft line-break feature. Paragraph breaks remain an EditDoc operation. */
export class EditCharAttribLineBreak extends EditCharAttrib {
  /** Original base construction followed by feature marking. @param pool - Actual pool. @param item - Actual line-break item. @param position - Source position. @returns Feature owner. */
  constructor(pool: SfxItemPool, item: SfxPoolItem, position: number) {
    super(pool, item, position, position + 1);
    this.SetFeature(true);
  }
}
