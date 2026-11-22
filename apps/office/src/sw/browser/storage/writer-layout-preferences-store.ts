/** @fileoverview Browser persistence boundary for represented Office.Writer/Layout properties;no ConfigItem/UNO provider facade. */
import type { SwMasterUsrPref, SwMetricConfigValues } from "../../source/uibase/config/usrpref";
/** Source ConfigItem subtree identity,qualified for the browser key namespace. */
export const WRITER_LAYOUT_PREFERENCES_KEY = "org.openoffice.Office.Writer/Layout";
/** Original separate Writer BaselineGrid configuration subtree. */
export const WRITER_BASELINE_GRID_PREFERENCES_KEY = "org.openoffice.Office.Writer/BaselineGrid";
/** Only ordinary int32 metric properties cross this platform boundary. */
const propertyNames = [
  "Other/MeasureUnit",
  "Window/HorizontalRulerUnit",
  "Window/VerticalRulerUnit",
] as const;
/** Stores actual native property names independently of document packages/history. */
export class WriterLayoutPreferenceStore {
  /** Borrows the real browser storage surface. @param storage - Platform storage. @returns Store. */
  constructor(private readonly storage: Pick<Storage, "getItem" | "setItem">) {}
  /** Reads ordinary JSON property transport. @param key - Original configuration subtree. @returns Existing property record. */
  private ReadRecord(key: string): Record<string, unknown> {
    try {
      const text = this.storage.getItem(key);
      if (text === null) return {};
      const value: unknown = JSON.parse(text);
      return value !== null && typeof value === "object" && !Array.isArray(value)
        ? (value as Record<string, unknown>)
        : {};
    } catch {
      return {};
    }
  }
  /** Source Load projection keeps absent overrides absent and rejects non-int32 transport values. @param preferences - Actual native owner. @returns Nothing. */
  Load(preferences: SwMasterUsrPref): void {
    const record = this.ReadRecord(WRITER_LAYOUT_PREFERENCES_KEY),
      values: Partial<Record<(typeof propertyNames)[number], number>> = {};
    for (const key of propertyNames) {
      const value = record[key];
      if (
        typeof value === "number" &&
        Number.isInteger(value) &&
        value >= -2147483648 &&
        value <= 2147483647
      )
        values[key] = value;
    }
    preferences.LoadMetricProperties(values);
    const baseline = this.ReadRecord(WRITER_BASELINE_GRID_PREFERENCES_KEY).VisibleGrid;
    if (typeof baseline === "boolean") preferences.SetBaselineGridVisible(baseline, true);
  }
  /** Persists only modified properties,retaining unrelated future layout fields and dirty state on write failure. @param preferences - Actual native owner. @returns Nothing. */
  Save(preferences: SwMasterUsrPref): void {
    if (preferences.IsBaselineGridModified()) {
      const record = this.ReadRecord(WRITER_BASELINE_GRID_PREFERENCES_KEY);
      record.VisibleGrid = preferences.IsBaselineGridVisible();
      this.storage.setItem(WRITER_BASELINE_GRID_PREFERENCES_KEY, JSON.stringify(record));
      preferences.ClearBaselineGridModified();
    }
    if (!preferences.IsMetricModified()) return;
    const record = this.ReadRecord(WRITER_LAYOUT_PREFERENCES_KEY),
      values: SwMetricConfigValues = preferences.GetMetricProperties();
    for (const key of propertyNames) {
      const value = values[key];
      if (value === undefined) Reflect.deleteProperty(record, key);
      else record[key] = value;
    }
    this.storage.setItem(WRITER_LAYOUT_PREFERENCES_KEY, JSON.stringify(record));
    preferences.ClearMetricModified();
  }
}
