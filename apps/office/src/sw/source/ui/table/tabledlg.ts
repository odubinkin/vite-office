/** @fileoverview Absolute SwFormatTablePage state and handlers ported from pinned tabledlg.cxx. */
import { HoriOrientation } from "../../../../offapi/com/sun/star/text/HoriOrientation";
import type { SwTable } from "../../core/table/swtable";
import { SwTableRep } from "../../uibase/table/swtablerep";

/** Owns represented native table-page draft, sensitivity and metric relationships. */
export class SwFormatTablePage {
  public readonly data: SwTableRep;
  public above: number;
  public below: number;
  private savedWidth: number;
  private readonly minTableWidth: number;
  private full = false;
  private modified = false;

  /** Resets the page from actual table attributes. @param table - Original model. @param space - Upper print width. @returns Nothing. */
  public constructor(table: SwTable, space: number) {
    this.data = new SwTableRep(table, space);
    this.savedWidth = this.data.width;
    this.minTableWidth = Math.min(this.savedWidth, this.data.columns.length * 23);
    this.above = table.GetFormat().marginTop ?? 0;
    this.below = table.GetFormat().marginBottom ?? 0;
  }

  /** Reads metric sensitivity for absolute widths. @param field - Metric identity. @returns Enabled state. */
  public IsSensitive(field: "width" | "left" | "right"): boolean {
    const align = this.data.align;
    if (align === HoriOrientation.FULL) return false;
    if (field === "width") return true;
    return field === "left"
      ? align !== HoriOrientation.LEFT
      : align === HoriOrientation.LEFT || align === HoriOrientation.NONE;
  }

  /** Handles the native alignment radio transition. @param align - Selected orientation. @returns Nothing. */
  public AutoClickHdl(align: HoriOrientation): void {
    const data = this.data;
    data.align = align;
    if (align === HoriOrientation.FULL) {
      data.left = data.right = 0;
      this.savedWidth = data.width;
      data.width = data.space;
      this.full = true;
    } else {
      if (align === HoriOrientation.LEFT) data.left = 0;
      if (align === HoriOrientation.RIGHT || align === HoriOrientation.LEFT_AND_WIDTH)
        data.right = 0;
      if (this.full) {
        data.width = this.savedWidth;
        this.full = false;
      }
    }
    this.ModifyHdl("width");
  }

  /** Admits a changed metric through native spin limits and arithmetic. @param field - Metric identity. @param value - Twips. @returns Nothing. */
  public ValueChangedHdl(
    field: "width" | "left" | "right" | "above" | "below",
    value: number,
  ): void {
    if (field === "above" || field === "below") {
      this[field] = Math.max(0, value);
      return;
    }
    if (field === "width")
      this.data.width = Math.max(this.minTableWidth, Math.min(2 * this.data.space, value));
    else this.data[field] = Math.max(-999999, Math.min(this.data.space, value));
    this.ModifyHdl(field);
  }

  /** Reconciles changed width or side spacing with one native correction pass. @param field - Changed metric. @param allowInconsistencies - Native recursion guard. @returns Nothing. */
  private ModifyHdl(field: "width" | "left" | "right", allowInconsistencies = false): void {
    const data = this.data,
      previous = data.width;
    let width = data.width,
      left = data.left,
      right = data.right;
    if (field === "width") {
      width = Math.max(23, width);
      let diff = right + left + width - data.space;
      switch (data.align) {
        case HoriOrientation.RIGHT:
          left -= diff;
          break;
        case HoriOrientation.LEFT:
          right -= diff;
          break;
        case HoriOrientation.LEFT_AND_WIDTH:
          if (right >= diff) right -= diff;
          else {
            diff -= right;
            right = 0;
            if (left >= diff) left -= diff;
            else {
              right += left - diff;
              left = 0;
              width = data.space;
            }
          }
          break;
        case HoriOrientation.CENTER:
          if (left !== right) {
            diff += left + right;
            left = right = Math.trunc(diff / 2);
          } else {
            left -= Math.trunc(diff / 2);
            right -= Math.trunc(diff / 2);
          }
          break;
        case HoriOrientation.NONE:
          left -= Math.trunc(diff / 2);
          right -= Math.trunc(diff / 2);
          break;
      }
    } else if (field === "right") {
      if (right + left > data.space - 23) right = data.space - left - 23;
      width = data.space - left - right;
    } else if (data.align === HoriOrientation.LEFT_AND_WIDTH) {
      right -= right + left + width - data.space;
      width = data.space - left - right;
    } else {
      const center = data.align === HoriOrientation.CENTER;
      if (center) right = left;
      if (right + left > data.space - 23) {
        left = center ? Math.trunc((data.space - 23) / 2) : data.space - 23 - right;
        if (center) right = left;
      }
      width = data.space - left - right;
    }
    data.left = left;
    data.right = right;
    data.width = width;
    if (width !== previous && field === "width" && !allowInconsistencies)
      this.ModifyHdl(field, true);
    this.modified = true;
  }

  /** Deactivates the format page, reconciling visible columns as native Writer does. @returns Nothing. */
  public DeactivatePage(): void {
    if (!this.modified) return;
    const data = this.data,
      count = data.columns.length;
    if (count === 0) return;
    let diff =
      data.columns.reduce(
        /** Sums actual column widths. @param sum - Accumulator. @param width - Column width. @returns New sum. */
        (sum, width) => sum + width,
        0,
      ) - data.width;
    const min = Math.min(23, Math.trunc(data.width / count) - 1);
    while (Math.abs(diff) > count + 1) {
      const sub = Math.trunc(diff / count);
      for (let i = 0; i < count; i++) {
        const width = data.columns[i] as number;
        if (width - min > sub) {
          data.columns[i] = width - sub;
          diff -= sub;
        } else {
          data.columns[i] = min;
          diff -= width - min;
        }
      }
    }
  }
}
