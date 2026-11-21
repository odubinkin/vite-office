/** @fileoverview Native Calc data-bar format values, ownership and per-cell geometry. */
import { COL_LIGHTRED, Color } from "../../../../tools/inc/color";
import type { ScAddress } from "../../../inc/address";
import type { ScDocument } from "../../../inc/document";
import type {
  RefUpdateContext,
  RefUpdateDeleteTabContext,
  RefUpdateInsertTabContext,
  RefUpdateMoveTabContext,
} from "../../../inc/refupdatecontext";
import { ScFormatEntry, ScFormatEntryType } from "./conditio";
import {
  GetPercentile,
  numericValue,
  ScColorFormat,
  ScColorScaleEntry,
  ScColorScaleEntryType as ScaleType,
} from "./colorscale";

/** Native databar::ScAxisPosition values. */
export enum ScAxisPosition {
  NONE,
  AUTOMATIC,
  MIDDLE,
}

/** Native ScDataBarFormatData and the two owned threshold entries. */
export class ScDataBarFormatData {
  maPositiveColor = new Color();
  mxNegativeColor: Color | undefined;
  maAxisColor = new Color();
  mbGradient = true;
  mbNeg = true;
  meAxisPosition = ScAxisPosition.AUTOMATIC;
  mnMinLength = 0;
  mnMaxLength = 100;
  mbOnlyBar = false;
  mpLowerLimit = new ScColorScaleEntry();
  mpUpperLimit = new ScColorScaleEntry();

  /** Copies native values and formula cells into the destination document. @param doc - Destination. @returns Independent data. */
  Clone(doc: ScDocument): ScDataBarFormatData {
    const copy = new ScDataBarFormatData();
    copy.maPositiveColor.assign(this.maPositiveColor);
    copy.maAxisColor.assign(this.maAxisColor);
    if (this.mxNegativeColor) copy.mxNegativeColor = new Color(this.mxNegativeColor);
    copy.mbGradient = this.mbGradient;
    copy.mbNeg = this.mbNeg;
    copy.meAxisPosition = this.meAxisPosition;
    copy.mnMinLength = this.mnMinLength;
    copy.mnMaxLength = this.mnMaxLength;
    copy.mbOnlyBar = this.mbOnlyBar;
    copy.mpLowerLimit = this.mpLowerLimit.Clone(doc);
    copy.mpUpperLimit = this.mpUpperLimit.Clone(doc);
    return copy;
  }

  /** Disposes the owned limit formulas. @returns Nothing. */
  Dispose(): void {
    this.mpLowerLimit.Dispose();
    this.mpUpperLimit.Dispose();
  }
}

/** Native signed length and zero point in percent, with drawing settings. */
export interface ScDataBarInfo {
  readonly mnZero: number;
  readonly mnLength: number;
  readonly maColor: Color;
  readonly maAxisColor: Color;
  readonly mbGradient: boolean;
  readonly mbShowValue: boolean;
}

/** Original conditional data-bar rule over the shared color-format values. */
export class ScDataBarFormat extends ScColorFormat {
  private mpFormatData = new ScDataBarFormatData();

  /** Replaces the owned data and releases its prior formula cells. @param data - Owned settings. @returns Nothing. */
  SetDataBarData(data: ScDataBarFormatData): void {
    if (data === this.mpFormatData) return;
    this.mpFormatData.Dispose();
    this.mpFormatData = data;
  }

  /** Borrows the native rule settings. @returns Data-bar settings. */
  GetDataBarData(): ScDataBarFormatData {
    return this.mpFormatData;
  }

  /** Returns the native conditional entry type. @returns Data-bar type. */
  override GetType(): ScFormatEntryType {
    return ScFormatEntryType.Databar;
  }

  /** Copies the native rule without sharing its formula cells. @param doc - Destination. @returns Independent rule. */
  override Clone(doc: ScDocument): ScDataBarFormat {
    const copy = new ScDataBarFormat(doc);
    copy.SetDataBarData(this.mpFormatData.Clone(doc));
    return copy;
  }

  /** Compares the native data-bar equality fields. @param other - Compared rule. @returns Native equality result. */
  override IsEqual(other: ScFormatEntry): boolean {
    if (!(other instanceof ScDataBarFormat)) return false;
    const data = this.mpFormatData;
    const compared = other.mpFormatData;
    return (
      data.maAxisColor.IsRGBEqual(compared.maAxisColor) &&
      data.maPositiveColor.IsRGBEqual(compared.maPositiveColor) &&
      (data.mxNegativeColor
        ? compared.mxNegativeColor !== undefined &&
          data.mxNegativeColor.equals(compared.mxNegativeColor)
        : compared.mxNegativeColor === undefined) &&
      data.meAxisPosition === compared.meAxisPosition &&
      data.mbGradient === compared.mbGradient &&
      data.mbOnlyBar === compared.mbOnlyBar &&
      equalLimit(data.mpUpperLimit, compared.mpUpperLimit) &&
      equalLimit(data.mpLowerLimit, compared.mpLowerLimit)
    );
  }

  /** Updates both native formula references. @param context - Document update. @returns Nothing. */
  override UpdateReference(context: RefUpdateContext): void {
    this.mpFormatData.mpUpperLimit.UpdateReference(context);
    this.mpFormatData.mpLowerLimit.UpdateReference(context);
  }

  /** Moves references past inserted sheets. @param context - Native insertion. @returns Nothing. */
  override UpdateInsertTab(context: RefUpdateInsertTabContext): void {
    this.remapTabs(
      /** Resolves the new referenced sheet. @param tab - Original index. @returns New index. */
      (tab) => (tab >= context.mnInsertPos ? tab + context.mnSheets : tab),
    );
  }

  /** Updates remaining references after sheet deletion. @param context - Native deletion. @returns Nothing. */
  override UpdateDeleteTab(context: RefUpdateDeleteTabContext): void {
    const end = context.mnDeletePos + context.mnSheets;
    this.remapTabs(
      /** Resolves a remaining or deleted reference. @param tab - Original index. @returns New index or deletion. */
      (tab) => (tab < context.mnDeletePos ? tab : tab < end ? null : tab - context.mnSheets),
    );
  }

  /** Updates references after a sheet move. @param context - Native move. @returns Nothing. */
  override UpdateMoveTab(context: RefUpdateMoveTabContext): void {
    this.remapTabs(context.getNewTab.bind(context));
  }

  /** Applies a tab mapping to both owned thresholds. @param map - Native index mapping. @returns Nothing. */
  private remapTabs(map: (tab: number) => number | null): void {
    this.mpFormatData.mpUpperLimit.RemapTabs(map);
    this.mpFormatData.mpLowerLimit.RemapTabs(map);
  }

  /** Resolves the native drawing information for a numeric cell. @param address - Target cell. @returns Geometry and colors or absence. */
  GetDataBarInfo(address: ScAddress): ScDataBarInfo | undefined {
    const cell = this.mrDoc.GetRefCellValue(address);
    if (!cell.hasNumeric()) return undefined;
    const values = this.getValues();
    const data = this.mpFormatData;
    const min = resolveLimit(data.mpLowerLimit, values, true);
    const max = resolveLimit(data.mpUpperLimit, values, false);
    if (min === undefined || max === undefined) return undefined;
    const value = numericValue(cell);
    const [mnZero, mnLength] = getBarGeometry(data, value, min, max);
    return {
      mnZero,
      mnLength,
      maColor: new Color(
        data.mbNeg && value < 0 ? (data.mxNegativeColor ?? COL_LIGHTRED) : data.maPositiveColor,
      ),
      maAxisColor: new Color(data.maAxisColor),
      mbGradient: data.mbGradient,
      mbShowValue: !data.mbOnlyBar,
    };
  }

  /** Releases the owned threshold cells. @returns Nothing. */
  override Dispose(): void {
    this.mpFormatData.Dispose();
    this.parent = null;
  }
}

/** Native limit comparison only compares values when the types match. @param left - Original limit. @param right - Compared limit. @returns Native equality. */
function equalLimit(left: ScColorScaleEntry, right: ScColorScaleEntry): boolean {
  return (
    left.GetType() !== right.GetType() ||
    (left.GetColor().IsRGBEqual(right.GetColor()) && left.GetValue() === right.GetValue())
  );
}

/** Applies the native lower or upper limit conversion. @param entry - Limit. @param values - Sorted range values. @param lower - Whether this is the lower limit. @returns Numeric limit or absence. */
function resolveLimit(
  entry: ScColorScaleEntry,
  values: readonly number[],
  lower: boolean,
): number | undefined {
  const min = values[0] ?? 0;
  const max = values.at(-1) ?? 0;
  const type = entry.GetType();
  if (lower && type === ScaleType.MIN) return min;
  if (!lower && type === ScaleType.MAX) return max;
  if (type === ScaleType.AUTO) return lower ? Math.min(0, min) : Math.max(0, max);
  if (type === ScaleType.PERCENT) return min + ((max - min) / 100) * entry.GetValue();
  if (type === ScaleType.PERCENTILE) return GetPercentile(values, entry.GetValue() / 100);
  return entry.GetValue();
}

/** Computes the native zero position and signed bar length. @param data - Rule settings. @param value - Numeric cell. @param min - Resolved lower limit. @param max - Resolved upper limit. @returns Zero position and length as percentages. */
function getBarGeometry(
  data: ScDataBarFormatData,
  value: number,
  min: number,
  max: number,
): readonly [number, number] {
  const minLength = data.mnMinLength;
  const maxLength = data.mnMaxLength;
  if (data.meAxisPosition === ScAxisPosition.NONE) {
    if (value <= min) return [0, minLength];
    if (value >= max) return [0, maxLength];
    return [0, minLength + ((value - min) / (max - min)) * (maxLength - minLength)];
  }
  if (data.meAxisPosition === ScAxisPosition.MIDDLE) {
    const absoluteMax = Math.max(Math.abs(min), Math.abs(max));
    const bounded =
      value < 0 && min < 0 ? Math.max(value, min) : value > max ? max : Math.max(value, min);
    return [50, maxLength * (bounded / absoluteMax)];
  }
  if (data.mpUpperLimit.GetType() === ScaleType.MAX && max < 0) max = 0;
  const zero = min < 0 ? (max < 0 ? 100 : (-100 * min) / (max - min)) : 0;
  if (value < 0 && min < 0) {
    const nonPositiveMax = Math.min(0, max);
    return [zero, value < min ? -100 : (-100 * (value - nonPositiveMax)) / (min - nonPositiveMax)];
  }
  const nonNegativeMin = Math.max(0, min);
  if (value > max) return [zero, 100];
  if (value <= min) return [zero, 0];
  return [zero, (100 * (value - nonNegativeMin)) / (max - nonNegativeMin)];
}
