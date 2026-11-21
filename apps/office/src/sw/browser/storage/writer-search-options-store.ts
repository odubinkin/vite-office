/** @fileoverview Browser storage for the native Office.Common/SearchOptions properties. */
import {
  searchOptionNames,
  type SearchOptionProperties,
  type SearchOptionsConfiguration,
} from "../../../unotools/source/config/searchopt";

/** Browser key for the original Common search preferences subtree. */
export const SEARCH_OPTIONS_KEY = "org.openoffice.Office.Common/SearchOptions";

/** Stores only boolean search preferences by original configuration property name. */
export class WriterSearchOptionsStore implements SearchOptionsConfiguration {
  /** Uses the platform storage boundary without document data. @param storage - Browser storage. @returns Store. */
  public constructor(private readonly storage: Pick<Storage, "getItem" | "setItem">) {}

  /** Returns the stored native property overrides. @returns Recognized boolean values. */
  public GetProperties(): SearchOptionProperties {
    try {
      const source: unknown = JSON.parse(this.storage.getItem(SEARCH_OPTIONS_KEY) ?? "null");
      if (source === null || typeof source !== "object" || Array.isArray(source)) return {};
      const record = source as Record<string, unknown>;
      const result: SearchOptionProperties = {};
      for (const name of searchOptionNames) {
        const value = record[name];
        if (typeof value === "boolean") result[name] = value;
      }
      return result;
    } catch {
      return {};
    }
  }

  /** Writes the complete native property group. @param properties - Search flags. @returns Whether the platform accepted the write. */
  public PutProperties(properties: SearchOptionProperties): boolean {
    try {
      this.storage.setItem(SEARCH_OPTIONS_KEY, JSON.stringify(properties));
      return true;
    } catch {
      return false;
    }
  }
}

/** The native Office.Common CTL font pane preference. */
export const PREFER_CTL_FONT_TAB_KEY = "org.openoffice.Office.Common/I18N/CTL/PreferCTLFontTab";

/** Reads the font pane preference, including the original Asian default. @returns Whether to show the CTL pane. */
export function readPreferredCTLFontTab(): boolean {
  try {
    return globalThis.localStorage?.getItem(PREFER_CTL_FONT_TAB_KEY) === "true";
  } catch {
    return false;
  }
}

/** Stores the application font pane selection on page deactivation. @param complex - Whether the selected pane is CTL. @returns Nothing. */
export function writePreferredCTLFontTab(complex: boolean): void {
  try {
    globalThis.localStorage?.setItem(PREFER_CTL_FONT_TAB_KEY, String(complex));
  } catch {
    // Preference storage may be unavailable in a private browser context.
  }
}
