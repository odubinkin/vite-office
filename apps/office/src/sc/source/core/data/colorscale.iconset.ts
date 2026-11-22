/** @fileoverview Native Calc conditional icon-set ownership and numeric threshold selection. */
import type { SvxFontHeightItem } from "../../../../editeng/inc/fhgtitem";
import type { ScAddress } from "../../../inc/address";
import type { ScDocument } from "../../../inc/document";
import type {
  RefUpdateContext,
  RefUpdateDeleteTabContext,
  RefUpdateInsertTabContext,
  RefUpdateMoveTabContext,
} from "../../../inc/refupdatecontext";
import { ATTR_FONT_HEIGHT } from "../../../inc/scitems";
import type { ScColorScaleEntry } from "./colorscale";
import {
  GetPercentile,
  numericValue,
  ScColorFormat,
  ScColorScaleEntryType as Type,
} from "./colorscale";
import { ScFormatEntryType } from "./conditio";
import { ScConditionMode } from "./conditio.entry";

/** Native serialized icon-set identities in colorscale.hxx order. */
export enum ScIconSetType {
  IconSet_3Arrows,
  IconSet_3ArrowsGray,
  IconSet_3Flags,
  IconSet_3TrafficLights1,
  IconSet_3TrafficLights2,
  IconSet_3Signs,
  IconSet_3Symbols,
  IconSet_3Symbols2,
  IconSet_3Smilies,
  IconSet_3Stars,
  IconSet_3Triangles,
  IconSet_3ColorSmilies,
  IconSet_4Arrows,
  IconSet_4ArrowsGray,
  IconSet_4RedToBlack,
  IconSet_4Rating,
  IconSet_4TrafficLights,
  IconSet_5Arrows,
  IconSet_5ArrowsGray,
  IconSet_5Ratings,
  IconSet_5Quarters,
  IconSet_5Boxes,
}

const iconSetNames = [
  "3Arrows",
  "3ArrowsGray",
  "3Flags",
  "3TrafficLights1",
  "3TrafficLights2",
  "3Signs",
  "3Symbols",
  "3Symbols2",
  "3Smilies",
  "3Stars",
  "3Triangles",
  "3ColorSmilies",
  "4Arrows",
  "4ArrowsGray",
  "4RedToBlack",
  "4Rating",
  "4TrafficLights",
  "5Arrows",
  "5ArrowsGray",
  "5Rating",
  "5Quarters",
  "5Boxes",
] as const;

/** Native icon draw result and threshold comparison. */
export interface ScIconSetInfo {
  readonly eIconSetType: ScIconSetType;
  readonly nIconIndex: number;
  readonly mbShowValue: boolean;
  readonly mnHeight: number;
  readonly eConditionMode: ScConditionMode;
}

/** Native icon types and owned thresholds with optional custom entries. */
export class ScIconSetFormatData {
  mbShowValue = true;
  mbReverse = false;
  readonly m_Entries: ScColorScaleEntry[] = [];
  mbCustom = false;
  readonly maCustomVector: (readonly [ScIconSetType, number])[] = [];

  /** Selects the native default or requested icon set. @param eIconSetType - Set identity. @returns Settings. */
  constructor(public eIconSetType = ScIconSetType.IconSet_3Arrows) {}

  /** Copies the settings and each owned threshold with its source formula document. @returns Independent settings. */
  Clone(): ScIconSetFormatData {
    const copy = new ScIconSetFormatData(this.eIconSetType);
    copy.mbShowValue = this.mbShowValue;
    copy.mbReverse = this.mbReverse;
    copy.mbCustom = this.mbCustom;
    for (const [type, index] of this.maCustomVector) copy.maCustomVector.push([type, index]);
    for (const entry of this.m_Entries) copy.m_Entries.push(entry.Clone());
    return copy;
  }

  /** Releases the threshold formula cells. @returns Nothing. */
  Dispose(): void {
    for (const entry of this.m_Entries) entry.Dispose();
  }
}

/** Native conditional rule with numeric thresholds and icon selection. */
export class ScIconSetFormat extends ScColorFormat implements Iterable<ScColorScaleEntry> {
  private mpFormatData = new ScIconSetFormatData();

  /** Resolves the native identifier with the ODS default for unknown names. @param name - XML identifier. @returns Set identity. */
  static getIconSetType(name: string): ScIconSetType {
    const type = iconSetNames.findIndex(
      /** Matches an original icon-set name. @param candidate - Native name. @returns Name match. */ (
        candidate,
      ) => candidate === name,
    );
    return type < 0 ? ScIconSetType.IconSet_3Arrows : type;
  }

  /** Looks up the native identifier. @param type - Icon set. @returns Serialized name. */
  static getIconSetName(type: ScIconSetType): string {
    return iconSetNames[type] ?? "";
  }

  /** Reports the number of icons in the native set. @param type - Icon set. @returns Icon count. */
  static getIconSetElements(type: ScIconSetType): number {
    return Number(iconSetNames[type]?.[0] ?? 0);
  }

  /** Transfers the native threshold owner. @param data - Owned settings. @returns Nothing. */
  SetIconSetData(data: ScIconSetFormatData): void {
    if (data === this.mpFormatData) return;
    this.mpFormatData.Dispose();
    this.mpFormatData = data;
  }

  /** Borrows the native settings. @returns Format data. */
  GetIconSetData(): ScIconSetFormatData {
    return this.mpFormatData;
  }

  /** Native rule type. @returns Icon-set type. */
  override GetType(): ScFormatEntryType {
    return ScFormatEntryType.Iconset;
  }

  /** Copies the icon rules with their source-owned formula cells. @param doc - Destination format document. @returns Independent rule. */
  override Clone(doc: ScDocument): ScIconSetFormat {
    const copy = new ScIconSetFormat(doc);
    copy.SetIconSetData(this.mpFormatData.Clone());
    return copy;
  }

  /** Iterates the ordered native thresholds. @returns Entries. */
  [Symbol.iterator](): IterableIterator<ScColorScaleEntry> {
    return this.mpFormatData.m_Entries.values();
  }

  /** Updates references in the threshold formulas. @param context - Native update. @returns Nothing. */
  override UpdateReference(context: RefUpdateContext): void {
    for (const entry of this) entry.UpdateReference(context);
  }

  /** Remaps formula references across an insertion. @param context - Native insertion. @returns Nothing. */
  override UpdateInsertTab(context: RefUpdateInsertTabContext): void {
    for (const entry of this)
      entry.RemapTabs(
        /** Adjusts references at or past the insertion. @param tab - Prior sheet. @returns New sheet. */ (
          tab,
        ) => (tab >= context.mnInsertPos ? tab + context.mnSheets : tab),
      );
  }

  /** Remaps formula references across a deletion. @param context - Native deletion. @returns Nothing. */
  override UpdateDeleteTab(context: RefUpdateDeleteTabContext): void {
    const end = context.mnDeletePos + context.mnSheets;
    for (const entry of this)
      entry.RemapTabs(
        /** Resolves an unchanged, removed or shifted sheet. @param tab - Prior sheet. @returns New sheet. */ (
          tab,
        ) => (tab < context.mnDeletePos ? tab : tab < end ? null : tab - context.mnSheets),
      );
  }

  /** Remaps threshold formulas across a sheet move. @param context - Native move. @returns Nothing. */
  override UpdateMoveTab(context: RefUpdateMoveTabContext): void {
    const remap = context.getNewTab.bind(context);
    for (const entry of this) entry.RemapTabs(remap);
  }

  /** Selects the last matching threshold and resolves the icon to paint. @param address - Numeric cell address. @returns Icon generation data. */
  GetIconSetInfo(address: ScAddress): ScIconSetInfo | undefined {
    const cell = this.mrDoc.GetRefCellValue(address);
    const data = this.mpFormatData;
    const entries = data.m_Entries;
    if (!cell.hasNumeric() || entries.length < 3) return undefined;
    const values = this.getValues();
    const min = resolveBoundary(entries[0] as ScColorScaleEntry, values[0] ?? 0);
    const max = resolveBoundary(
      entries[entries.length - 1] as ScColorScaleEntry,
      values.at(-1) ?? 0,
    );
    const value = numericValue(cell);
    let index = -1;
    let mode = ScConditionMode.EqGreater;
    for (const [i, entry] of entries.entries()) {
      const limit = calcValue(min, max, entry, values);
      if (limit !== undefined && Compare(value, limit, entry.GetMode())) {
        index = i;
        mode = entry.GetMode();
      }
    }
    if (index === -1) return undefined;
    if (data.mbReverse) index = entries.length - 1 - index;
    const custom = data.mbCustom ? data.maCustomVector[index] : undefined;
    if (custom?.[1] === -1) return undefined;
    const height = this.mrDoc.GetPattern(address)?.GetItem(ATTR_FONT_HEIGHT) as
      SvxFontHeightItem | undefined;
    return {
      eIconSetType: custom?.[0] ?? data.eIconSetType,
      nIconIndex: custom?.[1] ?? index,
      mbShowValue: data.mbShowValue,
      mnHeight: height?.GetHeight() ?? 0,
      eConditionMode: mode,
    };
  }

  /** Releases the native thresholds and parent. @returns Nothing. */
  override Dispose(): void {
    this.mpFormatData.Dispose();
    this.parent = null;
  }
}

/** Resolves the value/formula boundary or falls back to a range extreme. @param entry - End threshold. @param extreme - Live minimum or maximum. @returns Boundary. */
function resolveBoundary(entry: ScColorScaleEntry, extreme: number): number {
  return entry.GetType() === Type.VALUE || entry.GetType() === Type.FORMULA
    ? entry.GetValue()
    : extreme;
}

/** Interprets the native threshold type. @param min - Minimum. @param max - Maximum. @param entry - Threshold. @param values - Sorted range values. @returns Matching limit. */
function calcValue(
  min: number,
  max: number,
  entry: ScColorScaleEntry,
  values: readonly number[],
): number | undefined {
  switch (entry.GetType()) {
    case Type.PERCENT:
      return min + ((max - min) * entry.GetValue()) / 100;
    case Type.MIN:
      return min;
    case Type.MAX:
      return max;
    case Type.PERCENTILE:
      return GetPercentile(values, entry.GetValue() / 100);
    default:
      return entry.GetValue();
  }
}

/** Applies an original icon-set boundary comparison. @param value - Cell value. @param limit - Threshold. @param mode - Native condition. @returns Whether matched. */
function Compare(value: number, limit: number, mode: ScConditionMode): boolean {
  switch (mode) {
    case ScConditionMode.Equal:
      return value === limit;
    case ScConditionMode.Less:
      return value < limit;
    case ScConditionMode.Greater:
      return value > limit;
    case ScConditionMode.EqLess:
      return value <= limit;
    case ScConditionMode.EqGreater:
      return value >= limit;
    case ScConditionMode.NotEqual:
      return value !== limit;
    default:
      return false;
  }
}
