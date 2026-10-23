/** @fileoverview Logical file contents of original FontNameBox SaveMRUEntries/LoadMRUEntries;actual browser storage is a separate boundary. */
/** Original first-line semicolon parsing,without name normalization or deduplication. @param contents - Stored logical text. @returns Nonempty saved names in file order. */
export function decodeFontMruEntries(contents: string): string[] {
  const line = contents.split(/\r\n|\r|\n/, 1)[0] as string;
  return line
    .split(";")
    .filter(
      /** Original empty-token rejection. @param entry - Token. @returns Whether included. */ (
        entry,
      ) => entry.length !== 0,
    );
}
/** Original two LF WriteLine calls;empty entries preserve the old store instead of truncating it. Callers supply native get_mru_entries output. @param entries - Actual saved nonempty MRU values. @returns Logical file contents,or no write. */
export function encodeFontMruEntries(entries: readonly string[]): string | undefined {
  const line = entries.join(";");
  return line.length === 0 ? undefined : line + "\n\n";
}
