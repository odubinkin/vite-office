/** @fileoverview Extended Calc view settings passed to the file filter. */
import { ScRangeList } from "../../../inc/rangelst";

/** Live selection values captured from the attached view for a single export. */
export class ScExtTabSettings {
  readonly maSelection = new ScRangeList();
  mbSelected = false;
}

/** Native sheet-indexed option owner for filter-only view settings. */
export class ScExtDocOptions {
  private readonly tabs = new Map<number, ScExtTabSettings>();

  /** Borrows a captured view record. @param tab - Native tab. @returns Existing record, if any. */
  GetTabSettings(tab: number): ScExtTabSettings | undefined {
    return this.tabs.get(tab);
  }

  /** Borrows or creates an independent tab record. @param tab - Native tab. @returns Actual record. */
  GetOrCreateTabSettings(tab: number): ScExtTabSettings {
    const existing = this.tabs.get(tab);
    if (existing) return existing;
    const settings = new ScExtTabSettings();
    this.tabs.set(tab, settings);
    return settings;
  }
}
