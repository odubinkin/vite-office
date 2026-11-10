/** @fileoverview Original wrap influence, overlap and layout offset item from fmtwrapinfluenceonobjpos.hxx. */
import { Any } from "../../cppu/inc/com/sun/star/uno/Any";
import { WrapInfluenceOnPosition as W } from "../../offapi/com/sun/star/text/WrapInfluenceOnPosition";
import { CONVERT_TWIPS, SfxPoolItem } from "../../svl/inc/poolitem";
import { RES_WRAP_INFLUENCE_ON_OBJPOS } from "./hintids";
import { MID_ALLOW_OVERLAP, MID_WRAP_INFLUENCE } from "./unomid";

/** Native anchored-object wrapping policy item. */
export class SwFormatWrapInfluenceOnObjPos extends SfxPoolItem {
  private mbAllowOverlap = true;
  private mnOverlapVertOffset = 0;
  /** Creates original ONCE_CONCURRENT and overlap-enabled defaults. @param influence - Original wrap policy. @returns Item. */
  constructor(private mnWrapInfluenceOnPosition: number = W.ONCE_CONCURRENT) {
    super(RES_WRAP_INFLUENCE_ON_OBJPOS);
  }

  /** Clones all original state. @returns Independent item. */
  override Clone(): SwFormatWrapInfluenceOnObjPos {
    const copy = new SwFormatWrapInfluenceOnObjPos(this.mnWrapInfluenceOnPosition);
    copy.mbAllowOverlap = this.mbAllowOverlap;
    copy.mnOverlapVertOffset = this.mnOverlapVertOffset;
    return copy;
  }

  /** Compares the native policy, overlap and derived vertical offset. @param other - Candidate item. @returns Whether equal. */
  override equals(other: SfxPoolItem): boolean {
    return (
      other instanceof SwFormatWrapInfluenceOnObjPos &&
      this.mnWrapInfluenceOnPosition === other.GetWrapInfluenceOnObjPos() &&
      this.mbAllowOverlap === other.mbAllowOverlap &&
      this.mnOverlapVertOffset === other.mnOverlapVertOffset
    );
  }

  /** Returns the original wrap policy, with the optional iterative projection. @param iterativeAsConcurrent - Whether iterative reads as concurrent. @returns Native policy. */
  GetWrapInfluenceOnObjPos(iterativeAsConcurrent = false): number {
    return iterativeAsConcurrent && this.mnWrapInfluenceOnPosition === W.ITERATIVE
      ? W.ONCE_CONCURRENT
      : this.mnWrapInfluenceOnPosition;
  }

  /** Sets an admitted source wrap policy. @param value - Source policy. @returns Nothing. */
  SetWrapInfluenceOnObjPos(value: number): void {
    if (value === W.ONCE_SUCCESSIVE || value === W.ONCE_CONCURRENT || value === W.ITERATIVE)
      this.mnWrapInfluenceOnPosition = value;
  }

  /** Reads the original overlap policy. @returns Whether overlap is allowed. */
  GetAllowOverlap(): boolean {
    return this.mbAllowOverlap;
  }

  /** Sets the original overlap policy. @param value - Whether overlap is allowed. @returns Nothing. */
  SetAllowOverlap(value: boolean): void {
    this.mbAllowOverlap = value;
  }

  /** Reads the original overlap positioning offset. @returns Twips. */
  GetOverlapVertOffset(): number {
    return this.mnOverlapVertOffset;
  }

  /** Sets the original overlap positioning offset. @param value - Twips. @returns Nothing. */
  SetOverlapVertOffset(value: number): void {
    this.mnOverlapVertOffset = value;
  }

  /** Default projection of the original wrap policy. @returns Policy value. */
  override QueryValue(): number;
  /** Publishes the requested typed UNO member. @param output - Actual result Any. @param member - Original member identity. @returns Success. */
  override QueryValue(output: Any, member?: number): boolean;
  /** Publishes the original wrap or overlap member. @param output - Optional actual result Any. @param member - Original member identity. @returns Policy value or success. */
  override QueryValue(output?: Any, member = MID_WRAP_INFLUENCE): number | boolean {
    if (!output) return this.GetWrapInfluenceOnObjPos();
    switch (member & ~CONVERT_TWIPS) {
      case MID_WRAP_INFLUENCE:
        output.insert([this.GetWrapInfluenceOnObjPos()], "sal_Int16");
        return true;
      case MID_ALLOW_OVERLAP:
        output.insert([this.GetAllowOverlap()], "bool");
        return true;
      default:
        return false;
    }
  }

  /** Applies an actual UNO member using the original extraction defaults. @param value - Source Any. @param member - Native member. @returns Whether the value was accepted. */
  override PutValue(value: unknown, member: number): boolean {
    if (!(value instanceof Any)) return false;
    switch (member & ~CONVERT_TWIPS) {
      case MID_WRAP_INFLUENCE: {
        const result: [number] = [0];
        value.extract(result, "sal_Int16");
        if (
          result[0] !== W.ONCE_SUCCESSIVE &&
          result[0] !== W.ONCE_CONCURRENT &&
          result[0] !== W.ITERATIVE
        )
          return false;
        this.SetWrapInfluenceOnObjPos(result[0]);
        return true;
      }
      case MID_ALLOW_OVERLAP: {
        const result: [boolean] = [true];
        if (!value.extract(result, "bool")) return false;
        this.SetAllowOverlap(result[0]);
        return true;
      }
      default:
        return false;
    }
  }
}
