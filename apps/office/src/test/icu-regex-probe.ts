/** @fileoverview Local test transport for the pinned native ICU regex bridge. */
import { execFileSync } from "node:child_process";
import type { RegexMatcher } from "../i18npool/source/search/textsearch";

const host = process.env.WRITER_ICU_REGEX_PROBE;

/** Runs the actual compiled ICU C ABI through the local host probe. @param pattern - Prepared pattern. @param ignoreCase - ICU option. @returns Native test matcher. */
export function createNativeRegexMatcher(
  pattern: Uint16Array,
  ignoreCase: boolean,
): RegexMatcher | undefined {
  const executable = host ?? "";
  const units = pattern.slice();
  if (!executable) throw new Error("Pinned ICU host probe is unavailable.");
  /** Marshals one match using decimal UTF-16 units, preserving embedded NULs. @param input - UTF-16 source. @param start - Directional start. @param end - Directional end. @param backward - Direction. @returns Native diagnostic or capture pairs. */
  function invoke(input: Uint16Array, start: number, end: number, backward: boolean): string {
    return execFileSync(executable, ["--bridge"], {
      input: [
        units.length,
        input.length,
        Number(ignoreCase),
        start,
        end,
        Number(backward),
        units.join(" "),
        input.join(" "),
      ].join(" "),
      encoding: "utf8",
    }).trim();
  }

  if (invoke(new Uint16Array(), 0, 0, false) === "invalid") return undefined;
  return {
    /** Parses the native signed capture array. @param input - Prepared text. @param start - Directional start. @param end - Directional end. @param backward - Direction. @returns Native offsets. */
    search(input, start, end, backward) {
      const reply = invoke(input, start, end, backward);
      return Int32Array.from(reply === "" ? [] : reply.split(" ").map(Number));
    },
    /** Each invocation owns its native process lifetime. @returns Nothing. */
    dispose() {},
  };
}

/** Whether the pinned local native probe has been supplied to the suites. */
export const hasNativeRegexProbe = Boolean(host);
