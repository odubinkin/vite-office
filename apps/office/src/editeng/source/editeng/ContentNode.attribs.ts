/** @fileoverview Original CharAttribList ownership and range algorithms from ContentNode.cxx. Default-font/layout responsibilities and the enclosing ContentNode remain separate; no engine facade is provided. */
import type { EditCharAttrib } from "../../inc/editattr";
import type { SfxPoolItem } from "../../../svl/source/items/poolitem";
/** Actual original owning attribute vector and empty-range flag; font-cache access is not advertised by this member group. */
export class CharAttribList {
  private readonly maAttribs: EditCharAttrib[] = [];
  private mbHasEmptyAttribs = false;
  /** Original vector member destruction releases every actual pooled holder. @returns Nothing. */
  dispose(): void {
    for (let i = this.maAttribs.length - 1; i >= 0; i--)
      (this.maAttribs[i] as EditCharAttrib).dispose();
    this.maAttribs.length = 0;
  }
  /** Original source vector reference. @returns Borrowed owning storage. */
  GetAttribs(): EditCharAttrib[] {
    return this.maAttribs;
  }
  /** Original signed32 count in the defined vector range. @returns Count. */
  Count(): number {
    return this.maAttribs.length;
  }
  /** Original insertion before the first greater start, preserving insertion order for equal starts. @param attribute - Transferred unique attribute. @returns Nothing. */
  InsertAttrib(attribute: EditCharAttrib): void {
    if (attribute.IsEmpty()) this.mbHasEmptyAttribs = true;
    let i = 0;
    while (
      i < this.maAttribs.length &&
      (this.maAttribs[i] as EditCharAttrib).GetStart() <= attribute.GetStart()
    )
      i++;
    this.maAttribs.splice(i, 0, attribute);
  }
  /** Original LessByStart comparator; native unspecified equal-key sort order is not certified. @returns Nothing. */
  ResortAttribs(): void {
    this.maAttribs.sort(
      /** Compares only original start values. @param first - Left attribute. @param second - Right attribute. @returns Comparator sign. */ (
        first,
        second,
      ) => first.GetStart() - second.GetStart(),
    );
  }
  /** Original first-adjacent-match merge and unconditional inner break after a matching Which/boundary. @returns Nothing. */
  OptimizeRanges(): void {
    for (let i = 0; i < this.maAttribs.length; i++) {
      const attribute = this.maAttribs[i] as EditCharAttrib;
      for (let next = i + 1; next < this.maAttribs.length; next++) {
        const following = this.maAttribs[next] as EditCharAttrib;
        if (
          !attribute.IsFeature() &&
          following.GetStart() === attribute.GetEnd() &&
          following.Which() === attribute.Which()
        ) {
          if ((following.GetItem() as SfxPoolItem).equals(attribute.GetItem() as SfxPoolItem)) {
            attribute.GetEnd(true)[0] = following.GetEnd();
            this.Remove(next);
          }
          break;
        } else if (following.GetStart() > attribute.GetEnd()) break;
      }
    }
  }
  /** Original reverse closed-range lookup, preferring the attribute starting at a shared boundary. @param which - Exact ID. @param position - Source index. @returns Borrowed attribute or null. */
  FindAttrib(which: number, position: number): EditCharAttrib | null {
    for (let i = this.maAttribs.length - 1; i >= 0; i--) {
      const value = this.maAttribs[i] as EditCharAttrib;
      if (value.Which() === which && value.IsIn(position)) return value;
    }
    return null;
  }
  /** Original reverse half-open lookup. @param which - Exact ID. @param position - Source index. @returns Borrowed attribute or null. */
  FindAttribRightOpen(which: number, position: number): EditCharAttrib | null {
    for (let i = this.maAttribs.length - 1; i >= 0; i--) {
      const value = this.maAttribs[i] as EditCharAttrib;
      if (value.Which() === which && value.IsInLeftClosedRightOpen(position)) return value;
    }
    return null;
  }
  /** Original forward ID/start lookup. @param which - Exact ID. @param position - Minimum start. @returns Borrowed attribute or null. */
  FindNextAttrib(which: number, position: number): EditCharAttrib | null {
    for (const value of this.maAttribs)
      if (value.GetStart() >= position && value.Which() === which) return value;
    return null;
  }
  /** Original overlapping-range predicate. @param start - Source start. @param end - Source end. @returns Any intersecting range. */
  HasAttrib(start: number, end: number): boolean {
    for (let i = this.maAttribs.length - 1; i >= 0; i--) {
      const value = this.maAttribs[i] as EditCharAttrib;
      if (value.GetStart() < end && value.GetEnd() > start) return true;
    }
    return false;
  }
  /** Original pointer/ordinal removal; vector erase destroys the owned value without recomputing the empty flag. @param value - Actual attribute or source index. @returns Nothing. */
  Remove(value: EditCharAttrib | number): void {
    const index = typeof value === "number" ? value : this.maAttribs.indexOf(value);
    if (index >= 0) {
      const removed = this.maAttribs.splice(index, 1)[0];
      removed?.dispose();
    }
  }
  /** Original flag getter, which may remain true until DeleteEmptyAttribs. @returns Flag. */
  HasEmptyAttribs(): boolean {
    return this.mbHasEmptyAttribs;
  }
  /** Original direct flag setter. @param value - Source flag. @returns Nothing. */
  SetHasEmptyAttribs(value: boolean): void {
    this.mbHasEmptyAttribs = value;
  }
  /** Original reverse early-return algorithm, retained even though the vector is sorted by starts rather than ends. @param boundary - Source boundary. @returns Source decision. */
  HasBoundingAttrib(boundary: number): boolean {
    for (let i = this.maAttribs.length - 1; i >= 0; i--) {
      const value = this.maAttribs[i] as EditCharAttrib;
      if (value.GetEnd() < boundary) return false;
      if (value.GetStart() === boundary || value.GetEnd() === boundary) return true;
    }
    return false;
  }
  /** Original gated forward empty-range lookup. @param which - Exact ID. @param position - Source index. @returns Borrowed empty attribute or null. */
  FindEmptyAttrib(which: number, position: number): EditCharAttrib | null {
    if (!this.mbHasEmptyAttribs) return null;
    for (const value of this.maAttribs)
      if (value.GetStart() === position && value.GetEnd() === position && value.Which() === which)
        return value;
    return null;
  }
  /** Original first feature whose start is at or after the requested position. @param position - Source lower bound. @returns Borrowed feature or null. */
  FindFeature(position: number): EditCharAttrib | null {
    let first = 0;
    while (
      first < this.maAttribs.length &&
      (this.maAttribs[first] as EditCharAttrib).GetStart() < position
    )
      first++;
    for (let i = first; i < this.maAttribs.length; i++) {
      const value = this.maAttribs[i] as EditCharAttrib;
      if (value.IsFeature()) return value;
    }
    return null;
  }
  /** Original erase-if and explicit final flag reset. @returns Nothing. */
  DeleteEmptyAttribs(): void {
    for (let i = 0; i < this.maAttribs.length;) {
      if ((this.maAttribs[i] as EditCharAttrib).IsEmpty()) this.Remove(i);
      else i++;
    }
    this.mbHasEmptyAttribs = false;
  }
}
