/** @fileoverview Defined normal non-mailmerge MarkManager::getUniqueMarkName loop from pinned docbm.cxx;caller owns actual names and the native next-offset cache. */
/** Original unique-name allocation and cache advancement. @param name - Proposed native nonempty name. @param isUnique - Actual mark-owner lookup. @param offsets - Original basename offset cache. @param copyTemplate - Localized STR_MARK_COPY containing %1. @returns Native chosen name,including the source empty result after an already exhausted counter. */
export function getUniqueBookmarkName(
  name: string,
  isUnique: (candidate: string) => boolean,
  offsets: Map<string, number>,
  copyTemplate: string,
): string {
  if (isUnique(name)) return name;
  let result = "",
    count = offsets.get(name) ?? 1;
  const prefix = copyTemplate.replace("%1", name);
  while (count < 2147483647) {
    result = prefix + count;
    count++;
    if (isUnique(result)) break;
  }
  offsets.set(name, count);
  return result;
}
