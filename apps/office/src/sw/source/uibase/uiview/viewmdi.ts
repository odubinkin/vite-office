/** @fileoverview Native Writer view navigation through physical viewport and model targets. */

/** The visible physical range of the Writer view in layout order. */
export interface SwVisiblePageNumbers {
  readonly first: number;
  readonly last: number;
}

/** Browser view binding for the native physical viewport operation. */
export interface SwNavigationViewport {
  readonly GetVisiblePageNumbers: () => SwVisiblePageNumbers | undefined;
  readonly GoToPage: (number: number) => void;
}

/** Identifies the next physical page, wrapping at the native document edge. @param visible - Current visible range. @param count - Physical page count. @param forward - Direction of navigation. @returns The page to display. */
export function GetNavigationPage(
  visible: SwVisiblePageNumbers,
  count: number,
  forward: boolean,
): number {
  if (forward) return visible.last < count ? visible.last + 1 : 1;
  return visible.first > 1 ? visible.first - 1 : count;
}
