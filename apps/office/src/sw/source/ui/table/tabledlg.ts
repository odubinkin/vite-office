/** @fileoverview Absolute SwFormatTablePage state and handlers ported from pinned tabledlg.cxx. */
import { HoriOrientation } from "../../../../offapi/com/sun/star/text/HoriOrientation";
import type { SwTable } from "../../core/table/swtable";
import { SwTableRep } from "../../uibase/table/swtablerep";

/** Native table-manager automatic width sentinel, INVALID_TWIPS/LONG_MAX. */
const lAutoWidth = Number(0x7fffffffffffffffn);

/** Owns source widget-local metric/radio state and the shared committed native table representation. */
export class SwFormatTablePage {
  public readonly data: SwTableRep;
  public above = 0;
  public below = 0;
  private readonly original: SwTableRep;
  private readonly originalAbove: number;
  private readonly originalBelow: number;
  private readonly metrics = { width: 0, left: 0, right: 0 };
  private align = HoriOrientation.FULL;
  private savedWidth = 0;
  private savedLeft = 0;
  private savedRight = 0;
  private minTableWidth = 0;
  private widthMaximum = 0;
  private full = false;
  private modified = false;

  /** Binds original table parameters before reserving the native reset snapshot. @param table - Original model. @param space - Upper print width. @param lineSelected - Source shell selection flag. @returns Nothing. */
  public constructor(table: SwTable, space: number, lineSelected = false) {
    this.data = new SwTableRep(table, space);
    this.data.SetLineSelected(lineSelected);
    this.original = new SwTableRep(this.data);
    this.originalAbove = table.GetFormat().marginTop ?? 0;
    this.originalBelow = table.GetFormat().marginBottom ?? 0;
    this.Reset();
  }

  /** Restores original native representation and metric saved values without replacing shared owners. @returns Nothing. */
  public Reset(): void {
    this.data.Assign(this.original);
    this.metrics.width = this.savedWidth = this.data.width;
    this.metrics.left = this.savedLeft = this.data.left;
    this.metrics.right = this.savedRight = this.data.right;
    this.align = this.data.align;
    this.minTableWidth = Math.min(this.savedWidth, this.data.columns.length * 23);
    this.widthMaximum = 2 * this.data.space;
    this.above = this.originalAbove;
    this.below = this.originalBelow;
  }

  /** Reads current native widget value independently of committed table parameters. @param field - Metric identity. @returns Widget twips. */
  public GetFieldValue(field: "width" | "left" | "right" | "above" | "below"): number {
    return field === "above" || field === "below" ? this[field] : this.metrics[field];
  }

  /** Reads the source alignment radio state. @returns Selected orientation. */
  public GetAlign(): HoriOrientation {
    return this.align;
  }

  /** Reads metric sensitivity for absolute widths. @param field - Metric identity. @returns Enabled state. */
  public IsSensitive(field: "width" | "left" | "right"): boolean {
    const align = this.align;
    if (align === HoriOrientation.FULL) return false;
    if (field === "width") return true;
    return field === "left"
      ? align !== HoriOrientation.LEFT
      : align === HoriOrientation.LEFT || align === HoriOrientation.NONE;
  }

  /** Handles the native alignment radio transition. @param align - Selected orientation. @returns Nothing. */
  public AutoClickHdl(align: HoriOrientation): void {
    const data = this.metrics;
    this.align = align;
    if (align === HoriOrientation.FULL) {
      data.left = data.right = 0;
      this.savedWidth = data.width;
      data.width = this.data.space;
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
    if (field === "above" || field === "below") this[field] = Math.max(0, value);
    else if (field === "width")
      this.metrics.width = Math.max(this.minTableWidth, Math.min(this.widthMaximum, value));
    else this.metrics[field] = Math.max(-999999, Math.min(this.data.space, value));
    this.ModifyHdl(field);
  }

  /** Reconciles changed width or side spacing with one native correction pass. @param field - Changed metric. @param allowInconsistencies - Native recursion guard. @returns Nothing. */
  private ModifyHdl(
    field: "width" | "left" | "right" | "above" | "below",
    allowInconsistencies = false,
  ): void {
    if (field === "above" || field === "below") {
      this.modified = true;
      return;
    }
    const data = this.metrics,
      previous = data.width;
    let width = data.width,
      left = data.left,
      right = data.right;
    if (field === "width") {
      width = Math.max(23, width);
      let diff = right + left + width - this.data.space;
      switch (this.align) {
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
              width = this.data.space;
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
      if (right + left > this.data.space - 23) right = this.data.space - left - 23;
      width = this.data.space - left - right;
    } else if (this.align === HoriOrientation.LEFT_AND_WIDTH) {
      right -= right + left + width - this.data.space;
      width = this.data.space - left - right;
    } else {
      const center = this.align === HoriOrientation.CENTER;
      if (center) right = left;
      if (right + left > this.data.space - 23) {
        left = center ? Math.trunc((this.data.space - 23) / 2) : this.data.space - 23 - right;
        if (center) right = left;
      }
      width = this.data.space - left - right;
    }
    data.left = left;
    data.right = right;
    data.width = width;
    if (width !== previous && field === "width" && !allowInconsistencies)
      this.ModifyHdl(field, true);
    this.modified = true;
  }

  /** Reactivates native fields after another page publishes a changed absolute width. @returns Nothing. */
  public ActivatePage(): void {
    const width = this.data.align === HoriOrientation.FULL ? this.data.space : this.data.width;
    if (width === this.metrics.width) return;
    this.metrics.width = this.savedWidth = width;
    this.metrics.left = this.savedLeft = this.data.left;
    this.metrics.right = this.savedRight = this.data.right;
  }

  /** Applies native still-focused metric correction and reports source modified state. @param focusedField - Optional actual focused metric. @returns Whether the page was modified. */
  public FillItemSet(focusedField?: "width" | "left" | "right" | "above" | "below"): boolean {
    if (focusedField !== undefined) this.ModifyHdl(focusedField);
    return this.modified;
  }

  /** Publishes native metric/radio values, saved-spacing flags and column correction to the shared representation. @param focusedField - Optional actual focused metric. @returns Nothing. */
  public DeactivatePage(focusedField?: "width" | "left" | "right" | "above" | "below"): void {
    if (!this.FillItemSet(focusedField)) return;
    const data = this.data,
      count = data.columns.length;
    if (this.metrics.left !== this.savedLeft || this.metrics.right !== this.savedRight) {
      data.SetWidthChanged();
      data.left = this.metrics.left;
      data.right = this.metrics.right;
    }
    data.width = this.metrics.width;
    if (count !== 0) {
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
    if (this.align !== data.align) {
      data.SetWidthChanged();
      data.align = this.align;
    }
    if (this.align === HoriOrientation.FULL && data.width !== lAutoWidth) {
      data.SetWidthChanged();
      data.width = data.space;
    }
  }
}

/** Native absolute column-page state over a shared flat visible SwTableRep. */
export class SwTableColumnPage {
  public static readonly MET_FIELDS = 5;
  private readonly original: SwTableRep;
  private tableWidth = 0;
  private minWidth = 23;
  private fieldMaximum = 0;
  private modified = false;
  private modifyTable = false;
  private adaptSensitive = false;
  private adaptWidth = false;
  private proportional = false;
  private readonly valueTable = [0, 1, 2, 3, 4];
  private readonly fields: (number | undefined)[] = [];

  /** Binds the original shared native draft and reserves its reset copy. @param data - Shared table-dialog owner. @returns Nothing. */
  public constructor(public readonly data: SwTableRep) {
    this.original = new SwTableRep(data);
    this.Reset();
  }
  /** Restores source Reset data without replacing the shared pointer or width vector. @returns Nothing. */
  public Reset(): void {
    this.data.Assign(this.original);
    this.tableWidth =
      this.data.align !== HoriOrientation.FULL && this.data.align !== HoriOrientation.LEFT_AND_WIDTH
        ? this.data.width
        : this.data.space;
    for (const width of this.data.columns) if (width < this.minWidth) this.minWidth = width;
    this.fieldMaximum = this.tableWidth;
    for (let i = 0; i < SwTableColumnPage.MET_FIELDS; i++)
      this.fields[i] =
        i < this.data.columns.length ? this.Clamp(this.GetVisibleWidth(i)) : undefined;
    this.ActivatePage();
  }
  /** Reads the source field-to-column assignment. @param slot - Native metric field index. @returns Zero-based visible column. */
  public GetFieldColumn(slot: number): number {
    return this.valueTable[slot] as number;
  }
  /** Reads the displayed native metric value, including blank disabled fields. @param slot - Native metric field index. @returns Twips or an unused field. */
  public GetFieldValue(slot: number): number | undefined {
    return this.fields[slot];
  }
  /** Reads native absolute lower field bound. @returns Minimum twips. */
  public GetMinimum(): number {
    return this.minWidth;
  }
  /** Reads the source reset maximum metric bound. @returns Maximum twips. */
  public GetMaximum(): number {
    return this.fieldMaximum;
  }
  /** Reads current native table size. @returns Width in twips. */
  public GetTableWidth(): number {
    return this.tableWidth;
  }
  /** Reads available absolute adjustment space. @returns Signed twips. */
  public GetRemainingSpace(): number {
    return this.data.space - this.tableWidth;
  }
  /** Reads native checkbox state. @param mode - Native mode. @returns Checked state. */
  public IsChecked(mode: "adapt" | "proportional"): boolean {
    return mode === "adapt" ? this.adaptWidth : this.proportional;
  }
  /** Reads native mode sensitivity for full/partial tables and coupled proportional mode. @param mode - Native checkbox. @returns Whether editable. */
  public IsSensitive(mode: "adapt" | "proportional"): boolean {
    return mode === "adapt" ? this.adaptSensitive : this.modifyTable;
  }
  /** Reads native one-column window navigation sensitivity. @param direction - Source back/next button. @returns Whether available. */
  public CanScroll(direction: "back" | "next"): boolean {
    return direction === "back"
      ? this.GetFieldColumn(0) > 0
      : this.GetFieldColumn(SwTableColumnPage.MET_FIELDS - 1) < this.data.columns.length - 1;
  }
  /** Couples the native proportional and adapt-table checkboxes. @param mode - Changed checkbox. @param checked - Source active state. @returns Nothing. */
  public ModeHdl(mode: "adapt" | "proportional", checked: boolean): void {
    if (mode === "adapt") this.adaptWidth = checked;
    else {
      this.proportional = checked;
      if (checked) this.adaptWidth = true;
      this.adaptSensitive = !checked && this.modifyTable;
    }
  }
  /** Moves the source metric-field window by one visible column. @param direction - Back/next button. @returns Nothing. */
  public AutoClickHdl(direction: "back" | "next"): void {
    if (this.CanScroll(direction))
      for (let i = 0; i < this.valueTable.length; i++)
        this.valueTable[i] = (this.valueTable[i] as number) + (direction === "back" ? -1 : 1);
    this.UpdateCols(0);
  }
  /** Applies native widget min/max before dispatching column modification. @param slot - Native metric field. @param value - Authored absolute twips. @returns Nothing. */
  public ValueChangedHdl(slot: number, value: number): void {
    if (this.fields[slot] === undefined) return;
    this.modified = true;
    this.fields[slot] = this.Clamp(value);
    this.ModifyHdl(slot);
  }
  /** Copies the actual native metric value into its visible column and reconciles neighbors. @param slot - Native metric field. @returns Nothing. */
  private ModifyHdl(slot: number): void {
    const value = this.fields[slot];
    if (value === undefined) return;
    this.SetVisibleWidth(this.GetFieldColumn(slot), value);
    this.UpdateCols(this.GetFieldColumn(slot));
  }
  /** Applies native metric spin limits in the represented absolute mode. @param value - Input twips. @returns Clipped integer value. */
  private Clamp(value: number): number {
    return Math.max(this.minWidth, Math.min(this.fieldMaximum, Math.trunc(value)));
  }
  /** Reads one represented visible flat column. @param position - Visible column. @returns Native width. */
  private GetVisibleWidth(position: number): number {
    return this.data.columns[position] as number;
  }
  /** Writes one represented visible flat column in the original draft vector. @param position - Visible column. @param value - Native width. @returns Nothing. */
  private SetVisibleWidth(position: number, value: number): void {
    this.data.columns[position] = value;
  }
  /** Reconciles columns using source constant, adapt-table and proportional policies. @param current - Authored visible column. @returns Nothing. */
  private UpdateCols(current: number): void {
    let sum = 0;
    for (const width of this.data.columns) sum += width;
    let diff = sum - this.tableWidth;
    if (!this.adaptWidth && !this.proportional) {
      let loops = 0;
      while (diff !== 0) {
        if (++current === this.data.columns.length) {
          current = 0;
          if (++loops > 1) break;
        }
        const width = this.GetVisibleWidth(current);
        if (diff < 0) {
          this.SetVisibleWidth(current, width - diff);
          diff = 0;
        } else if (width >= diff + this.minWidth) {
          this.SetVisibleWidth(current, width - diff);
          diff = 0;
        }
        if (diff > 0 && this.GetVisibleWidth(current) > this.minWidth) {
          // The prior source condition consumes every case with available width >= diff.
          diff -= this.GetVisibleWidth(current) - this.minWidth;
          this.SetVisibleWidth(current, this.minWidth);
        }
      }
    } else if (!this.proportional) {
      const space = this.data.space - this.tableWidth;
      if (diff > space) {
        this.tableWidth = this.data.space;
        this.SetVisibleWidth(current, this.GetVisibleWidth(current) - diff + space);
      } else this.tableWidth += diff;
    } else if (this.adaptWidth && this.proportional) {
      const originalWidth = Math.max(1, this.GetVisibleWidth(current) - diff);
      const maxWidth = Math.max(this.data.space, this.tableWidth);
      const percent = Math.min(
        maxWidth / this.tableWidth,
        this.GetVisibleWidth(current) / originalWidth,
      );
      let total = 0;
      for (let i = 0; i < this.data.columns.length; i++) {
        const width = Math.max(
          23,
          Math.round(percent * (i === current ? originalWidth : this.GetVisibleWidth(i))),
        );
        this.SetVisibleWidth(i, width);
        total += width;
      }
      this.tableWidth = total;
    }
    for (let i = 0; i < SwTableColumnPage.MET_FIELDS && i < this.data.columns.length; i++)
      this.fields[i] = this.Clamp(this.GetVisibleWidth(this.GetFieldColumn(i)));
  }
  /** Reactivates shared table width and source selection-sensitive mode state. @returns Nothing. */
  public ActivatePage(): void {
    const align = this.data.align;
    if (
      (align !== HoriOrientation.FULL && this.tableWidth !== this.data.width) ||
      (align === HoriOrientation.FULL && this.tableWidth !== this.data.space)
    ) {
      this.tableWidth = align === HoriOrientation.FULL ? this.data.space : this.data.width;
      this.UpdateCols(0);
    }
    this.modifyTable = align !== HoriOrientation.FULL && !this.data.IsLineSelected();
    if (!this.modifyTable) {
      this.proportional = false;
      this.adaptWidth = false;
    }
    this.adaptSensitive = this.modifyTable;
  }
  /** Publishes source column-change state, including a still-focused metric field. @param focusedSlot - Optional source focused field. @returns Whether columns changed. */
  public FillItemSet(focusedSlot?: number): boolean {
    if (focusedSlot !== undefined) this.ModifyHdl(focusedSlot);
    if (this.modified) this.data.SetColsChanged();
    return this.modified;
  }
  /** Publishes accepted table width and source orientation-dependent side-space corrections. @param focusedSlot - Optional source focused field. @returns Nothing. */
  public DeactivatePage(focusedSlot?: number): void {
    this.FillItemSet(focusedSlot);
    const data = this.data;
    if (data.align === HoriOrientation.FULL || data.width === this.tableWidth) return;
    data.width = this.tableWidth;
    const diff = data.space - data.width - data.left - data.right;
    switch (data.align) {
      case HoriOrientation.RIGHT:
        data.left += diff;
        break;
      case HoriOrientation.LEFT:
        data.right += diff;
        break;
      case HoriOrientation.NONE: {
        const half = Math.trunc(diff / 2);
        if (diff > 0 || (-half < data.right && -half < data.left)) {
          data.right += half;
          data.left += half;
        } else if (data.right > data.left) {
          data.left = 0;
          data.right = data.space - data.width;
        } else {
          data.right = 0;
          data.left = data.space - data.width;
        }
        break;
      }
      case HoriOrientation.CENTER:
        data.right += Math.trunc(diff / 2);
        data.left += Math.trunc(diff / 2);
        break;
      case HoriOrientation.LEFT_AND_WIDTH:
        if (diff > data.right) data.left = data.space - data.width;
        data.right = data.space - data.width - data.left;
        break;
    }
    data.SetWidthChanged();
  }
}
