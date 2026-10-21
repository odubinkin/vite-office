/** @fileoverview Typed contract for the exact sidebar browser dependency guard. */
/** Matches only declared browser sidebar adaptation imports. @param relativeSource - Source owner. @param relativeTarget - Imported path. @returns Whether the exact edge is declared. */
export function isSidebarPresentationImport(
  relativeSource: string,
  relativeTarget: string,
): boolean;
