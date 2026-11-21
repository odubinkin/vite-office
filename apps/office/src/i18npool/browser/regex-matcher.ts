/** @fileoverview Connects the platform RegExp engine to TextSearch's directional UTF-16 results. */
import type { RegexMatcher } from "../source/search/textsearch";

/** Decodes counted UTF-16 without dropping unpaired surrogates or leading code units. @param units - Native string units. @returns JavaScript string. */
function decode(units: Uint16Array): string {
  let value = "";
  for (let offset = 0; offset < units.length; offset += 1024)
    value += String.fromCharCode(...units.subarray(offset, offset + 1024));
  return value;
}

/** Compiles the browser's Unicode regex with capture offsets. @param pattern - Prepared native search key. @param ignoreCase - Case-insensitive mode. @returns Matcher or undefined for invalid syntax. */
export function createBrowserRegexMatcher(
  pattern: Uint16Array,
  ignoreCase: boolean,
): RegexMatcher | undefined {
  const source = decode(pattern);
  const flags = ignoreCase ? "dgiu" : "dgu";
  let expression: RegExp;
  try {
    expression = new RegExp(source, flags);
  } catch (error) {
    if (error instanceof SyntaxError) return undefined;
    throw error;
  }
  return {
    /** Finds on the complete input and limits the consumed match to the search region. @param input - Original input. @param start - Directional start. @param end - Directional end. @param backward - Backward search. @returns Directional capture pairs. */
    search(input, start, end, backward) {
      const text = decode(input);
      const low = backward ? end : start;
      const high = backward ? start : end;
      // A trailing lookahead reserves the text after the range while preserving external
      // context for lookarounds, word boundaries and anchors on the complete input.
      const suffix = Array.from(text.slice(high)).length;
      const matcher =
        suffix === 0 ? expression : new RegExp(`(?:${source})(?=[\\s\\S]{${suffix}})`, flags);
      let offset = low;
      let best: RegExpIndicesArray | undefined;
      while (offset <= high) {
        matcher.lastIndex = offset;
        const result = matcher.exec(text)?.indices;
        const span = result?.[0];
        if (result === undefined || span === undefined || span[0] > high) break;
        if (span[0] < offset) {
          // In Unicode mode exec may rewind a lastIndex inside a surrogate pair.
          offset++;
          continue;
        }
        if (span[0] !== span[1] || (offset === low && span[0] === high)) {
          best = result;
          if (!backward || span[1] === high) break;
        }
        offset = Math.max(offset + 1, span[1] + Number(span[0] === span[1]));
      }
      const offsets = new Int32Array((best?.length ?? 0) * 2);
      best?.forEach(
        /** Copies native capture coordinates, using -1 for an unmatched group. @param capture - Capture bounds. @param index - Capture number. @returns Nothing. */ (
          capture,
          index,
        ) => {
          offsets[index * 2] = capture?.[backward ? 1 : 0] ?? -1;
          offsets[index * 2 + 1] = capture?.[backward ? 0 : 1] ?? -1;
        },
      );
      return offsets;
    },

    /** Leaves matcher lifetime to the JavaScript engine. @returns Nothing. */
    dispose() {},
  };
}
