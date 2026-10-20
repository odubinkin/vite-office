/** @fileoverview Shared browser toolbar resource normalization after filtering source visibility and unavailable commands. */
/** Removes orphaned separators without reordering native command groups. @param items - Filtered placements. @returns Normalized placements. */
export function normalizeToolbarItems<T extends Readonly<{ kind: string }>>(
  items: readonly T[],
): readonly T[] {
  const normalized: T[] = [];
  for (const item of items) {
    if (
      item.kind === "separator" &&
      (normalized.length === 0 || normalized.at(-1)?.kind === "separator")
    )
      continue;
    normalized.push(item);
  }
  if (normalized.at(-1)?.kind === "separator") normalized.pop();
  return normalized;
}
