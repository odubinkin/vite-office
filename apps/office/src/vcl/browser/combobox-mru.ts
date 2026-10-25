/** @fileoverview Consumed GTK weld ComboBox MRU value transitions from gtkinst.cxx; browser row rendering/state remains in ComboBox. */
/** Original get_mru_entries omits empty text without deduplicating. @param entries - Actual recent rows. @returns Saved text values. */
export function getComboBoxMruEntries(entries: readonly string[]): string[] {
  return entries.filter(
    /** Original nonempty-text test. @param entry - Actual row text. @returns Whether saved. */ (
      entry,
    ) => entry.length !== 0,
  );
}
/** Original set_mru_entries accepts existing main-list names and inserts each at the front,thus reversing order. It does not apply the maximum count. @param entries - Saved/native current MRU text. @param available - Actual main-list text. @returns Restored recent rows. */
export function restoreComboBoxMru(
  entries: readonly string[],
  available: readonly string[],
): string[] {
  const restored: string[] = [];
  for (const entry of entries) if (available.includes(entry)) restored.unshift(entry);
  return restored;
}
/** Original update_mru inserts exact active text,searches duplicates except the old last row,then trims the tail. Maximum is a native nonnegative widget count. @param entries - Actual recent text. @param active - Accepted raw text. @param maximum - Configured maximum. @returns Updated recent rows. */
export function updateComboBoxMru(
  entries: readonly string[],
  active: string,
  maximum: number,
): string[] {
  const next = [...entries];
  if (maximum !== 0) {
    next.unshift(active);
    for (let index = 1; index < next.length - 1; ++index)
      if (next[index] === active) {
        next.splice(index, 1);
        break;
      }
  }
  while (next.length > maximum) next.pop();
  return next;
}
