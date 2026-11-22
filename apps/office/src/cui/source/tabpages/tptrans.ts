/** @fileoverview Pooled exchange for the native no-transparency and uniform-transparency controls. */
import type { SfxItemSet } from "../../../svl/inc/itemset";
import { XATTR_FILLTRANSPARENCE } from "../../../svx/inc/xdef";
import { XFillTransparenceItem } from "../../../svx/inc/xfltrit";

/** Owns the represented uniform branch of the native Transparency page. */
export class SvxTransparenceTabPage {
  private mode: "off" | "linear" | undefined;
  private linear: number;
  private edited = false;
  private readonly original: number | undefined;

  /** Reads the initial native item without producing a delta. @param input - Actual page input. @returns Transparency page. */
  constructor(input: SfxItemSet) {
    const item = input.GetItemIfSet(XATTR_FILLTRANSPARENCE, false) as
      XFillTransparenceItem | undefined;
    this.original = item?.GetValue();
    this.mode = this.original === undefined ? undefined : this.original === 0 ? "off" : "linear";
    this.linear = this.original || 50;
  }

  /** Reads the active mode including mixed input. @returns Native radio group choice. */
  GetMode(): "off" | "linear" | undefined {
    return this.mode;
  }

  /** Reads the saved uniform percentage even while the field is insensitive. @returns Percentage. */
  GetLinear(): number {
    return this.linear;
  }

  /** Chooses one native transparency mode. @param mode - Visible radio group choice. @returns Nothing. */
  SetMode(mode: "off" | "linear"): void {
    this.mode = mode;
    this.edited = true;
  }

  /** Updates the original integer-percent field. @param value - Requested native percentage. @returns Nothing. */
  SetLinear(value: number): void {
    if (!Number.isInteger(value) || value < 0 || value > 100) return;
    this.linear = value;
    this.edited = true;
  }

  /** Exchanges the uniform fill item independently of Area. @param output - Dialog exchange set. @returns Nothing. */
  FillItemSet(output: SfxItemSet): void {
    output.ClearItem(XATTR_FILLTRANSPARENCE);
    if (!this.edited) return;
    const value = this.mode === "linear" ? this.linear : 0;
    if (value !== this.original) output.Put(new XFillTransparenceItem(value), true);
  }
}
