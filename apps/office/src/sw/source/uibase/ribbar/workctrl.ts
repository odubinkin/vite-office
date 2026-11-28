/** @fileoverview Represented native Writer navigation element IDs and toolbox order. */

/** Navigation IDs from workctrl.hxx used by the active Writer view. */
export enum SwNavigationElement {
  Table = 20000,
  Page = 20002,
  Bookmark = 20006,
  Heading = 20009,
  Comment = 20013,
  RepeatSearch = 20014,
}

/** Native toolbox entries in workctrl.cxx insertion order. */
export const navigationElements = [
  [SwNavigationElement.Table, "Table", "Previous table", "Next table"],
  [SwNavigationElement.Page, "Page", "Previous page", "Next page"],
  [SwNavigationElement.Heading, "Heading", "Previous heading", "Next heading"],
  [SwNavigationElement.Bookmark, "Bookmark", "Previous bookmark", "Next bookmark"],
  [SwNavigationElement.Comment, "Comment", "Previous Comment", "Next Comment"],
  [
    SwNavigationElement.RepeatSearch,
    "Repeat search",
    "Continue search backwards",
    "Continue search forward",
  ],
] as const;

/** Admits only supported values of the native NavElement slot. @param value - Sent unsigned native ID. @returns Whether the element is represented. */
export function IsNavigationElement(value: number): value is SwNavigationElement {
  return navigationElements.some(
    /** Finds a native chooser entry with the requested ID. @param entry - Native tuple. @returns Whether its ID matches. */
    ([id]) => id === value,
  );
}
