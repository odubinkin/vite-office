/** @fileoverview Replays original ICU78.3 entry/default/cache observations in native order over real mapped resource owners. No cache fields, aliases or reference counts are replaced. */
import { expect, it } from "vitest";
import observations from "./resource-fallback.native-observations.json";
import {
  entryOpen,
  entryOpenDirect,
  entryClose,
  entryIncrease,
  ures_flushCache,
  type UResourceDataEntry,
} from "./uresbund.entries";
import { locale_get_default, locale_set_default_internal } from "./locid.default";

/** Decodes the original narrow byte transport without UTF8 replacement. @param value - Native query bytes. @returns Narrow logical storage. */
function unhex(value: string): string {
  if (value === "-") return "";
  let result = "";
  for (let i = 0; i < value.length; i += 2)
    result += String.fromCharCode(Number.parseInt(value.slice(i, i + 2), 16));
  return result;
}
/** Encodes only the native byte spelling; empty storage has an explicit sentinel. @param value - Original narrow storage. @returns Native transport. */
function hex(value: string): string {
  let result = "";
  for (let i = 0; i < value.length; i++)
    result += (value.charCodeAt(i) & 255).toString(16).padStart(2, "0");
  return result || "-";
}
/** Reads initialized cached entry fields while their actual cache allocation remains live. @param entry - Borrowed entry/null. @returns Original chain/pool observations. */
function snapshot(entry: UResourceDataEntry | null): (number | string)[] {
  const line: UResourceDataEntry[] = [];
  for (let next = entry; next !== null; next = next.fParent) line.push(next);
  const result: (number | string)[] = [line.length];
  for (const next of line)
    result.push(
      hex(next.fName),
      next.fCountExisting,
      next.fBogus,
      Number(next.fData.noFallback),
      Number(next.fData.usesPoolBundle),
      Number(next.fData.isPoolBundle),
      next.fPool === null ? "~" : hex(next.fPool.fName),
      next.fPool === null ? -1 : next.fPool.fCountExisting,
    );
  return result;
}

it("matches all original default, entry ownership and pool/cache observations in sequence", /** Entire unchanged uresbund.cpp supplies every expected row. Aliases use the same source-primed finite parent lines as the native caller; physical allocation and nonterminating self-parent traversal are outside these rows. @returns Nothing. */ () => {
  const prior = locale_get_default();
  expect(ures_flushCache()).toBe(0);
  try {
    expect(observations.cases).toHaveLength(14420);
    for (const [query, output] of observations.cases) {
      const parts = (query as string).split(" "),
        status: [number] = [0];
      if (parts[0] === "S") {
        locale_set_default_internal(unhex(parts[1] as string), status);
        expect(String(status[0]), query).toBe(output);
        continue;
      }
      expect(parts[0]).toBe("E");
      const mode = Number(parts[1]) as 0 | 1 | 2,
        name = Number(parts[3]) ? null : unhex(parts[6] as string);
      status[0] = Number(parts[2]);
      const entry =
          mode === 2
            ? entryOpenDirect(null, name, status)
            : entryOpen(null, name as string, mode, status),
        row: (number | string)[] = [status[0], ...snapshot(entry)];
      if (Number(parts[4]) && entry !== null) {
        entryIncrease(entry);
        row.push(...snapshot(entry));
        entryClose(entry);
      }
      entryClose(entry);
      row.push(...snapshot(entry), Number(parts[5]) ? ures_flushCache() : -1);
      expect(row.join(" "), query).toBe(output);
    }
  } finally {
    locale_set_default_internal(prior, [0]);
    ures_flushCache();
  }
});
