/** @fileoverview Retains native icon-set fields that the ODS conditional XML does not round trip. */
import { ScIconSetFormat, type ScIconSetType } from "../../../inc/colorscale";
import { ScConditionMode } from "../../../inc/conditio";
import type { ScTable } from "../../../inc/table";

/** Icon values paired with the ordered rules in the conditional XML transfer. */
export interface CalcIconSetRecord {
  readonly showValue: boolean;
  readonly reverse: boolean;
  readonly custom: boolean;
  readonly icons: readonly (readonly [ScIconSetType, number])[];
  readonly modes: readonly ScConditionMode[];
}

/** Visits the icon rules in their XML transfer order. @param table - Sheet owner. @returns Icon rules. */
function* iconSets(table: ScTable): IterableIterator<ScIconSetFormat> {
  for (const format of table.GetCondFormList())
    for (let index = 0; index < format.size(); index++) {
      const entry = format.GetEntry(index);
      if (entry instanceof ScIconSetFormat) yield entry;
    }
}

/** Captures the native flags, custom identities and comparisons. @param table - Sheet owner. @returns Realm-neutral icon settings. */
export function encodeCalcIconSets(table: ScTable): CalcIconSetRecord[] {
  const records: CalcIconSetRecord[] = [];
  for (const entry of iconSets(table)) {
    const data = entry.GetIconSetData();
    records.push({
      showValue: data.mbShowValue,
      reverse: data.mbReverse,
      custom: data.mbCustom,
      icons: data.maCustomVector.map(
        /** Copies the original pair. @param entry - Icon type and index. @returns Independent pair. */ ([
          type,
          index,
        ]) => [type, index] as const,
      ),
      modes: data.m_Entries.map(
        /** Reads the original threshold comparison. @param threshold - Owned entry. @returns Mode. */ (
          threshold,
        ) => threshold.GetMode(),
      ),
    });
  }
  return records;
}

/** Restores the icon settings after the ODS threshold formulas are bound to the transferred sheet. @param table - Sheet owner. @param records - Settings in transfer order. @returns Nothing. */
export function decodeCalcIconSets(table: ScTable, records: readonly CalcIconSetRecord[]): void {
  const targets = [...iconSets(table)];
  if (!Array.isArray(records) || targets.length !== records.length)
    throw new Error("Calc icon-set record count differs from XML.");
  for (const [index, entry] of targets.entries()) {
    const record: CalcIconSetRecord | undefined = records[index];
    const data = entry.GetIconSetData();
    if (
      !record ||
      typeof record.showValue !== "boolean" ||
      typeof record.reverse !== "boolean" ||
      typeof record.custom !== "boolean" ||
      !Array.isArray(record.icons) ||
      !record.icons.every(isIcon) ||
      !Array.isArray(record.modes) ||
      record.modes.length !== data.m_Entries.length ||
      !record.modes.every(
        /** Validates the native condition discriminator. @param mode - Stored comparison. @returns Validity. */ (
          mode: unknown,
        ) => typeof mode === "number" && ScConditionMode[mode] !== undefined,
      )
    )
      throw new Error("Calc icon-set record is invalid.");
    data.mbShowValue = record.showValue;
    data.mbReverse = record.reverse;
    data.mbCustom = record.custom;
    for (const [type, icon] of record.icons) data.maCustomVector.push([type, icon]);
    for (const [offset, threshold] of data.m_Entries.entries())
      threshold.SetMode(record.modes[offset] as ScConditionMode);
  }
}

/** Checks a native icon type and signed index pair. @param value - Stored pair. @returns Validity. */
function isIcon(value: unknown): value is readonly [ScIconSetType, number] {
  return (
    Array.isArray(value) &&
    value.length === 2 &&
    typeof value[0] === "number" &&
    Number.isInteger(value[0]) &&
    ScIconSetFormat.getIconSetElements(value[0]) > 0 &&
    Number.isInteger(value[1]) &&
    value[1] >= -2147483648 &&
    value[1] <= 2147483647
  );
}
