/** @fileoverview Original native public-parser span counts and counted text for wiki/link boundary inputs; no internal marks are constructed. */
import { expect, it } from "vitest";
import fixture from "./native-mark-boundaries.json";
import { md_parse } from "./md4c";
import { MD_FLAG_WIKILINKS, MD_FLAG_PERMISSIVEAUTOLINKS, type MD_PARSER } from "./md4c.h";
/** Consumer-owned observations, independent of internal parser storage. */
interface Capture {
  counts: number[];
  text: number[];
}
/** Creates actual public callbacks matching the independently compiled C caller. @returns Count/text consumer. */
function consumer(): MD_PARSER<Capture> {
  return {
    abi_version: 0,
    flags: MD_FLAG_WIKILINKS | MD_FLAG_PERMISSIVEAUTOLINKS,
    enter_block: /** Accepts original block without altering the input. @returns Success. */ () =>
      0,
    leave_block: /** Accepts original block close. @returns Success. */ () => 0,
    enter_span:
      /** Counts original emitted span kinds. @param type - Native span kind. @param _detail - Unobserved detail. @param capture - Consumer data. @returns Success. */ (
        type,
        _detail,
        capture,
      ) => {
        capture.counts[type] = (capture.counts[type] ?? 0) + 1;
        return 0;
      },
    leave_span: /** Accepts original span close. @returns Success. */ () => 0,
    text: /** Retains only the counted original text bytes. @param _type - Unobserved text category. @param bytes - Borrowed bytes. @param count - Native count. @param capture - Consumer data. @returns Success. */ (
      _type,
      bytes,
      count,
      capture,
    ) => {
      capture.text.push(...bytes.subarray(0, count));
      return 0;
    },
  };
}
it.each(fixture.cases)(
  "matches native span/text observations for $text",
  /** Expected counts/bytes come from original compiled md_parse, not a second mark resolver. @param row - Native input/output. @returns Nothing. */ (
    row,
  ) => {
    const bytes = new TextEncoder().encode(row.text),
      capture: Capture = { counts: Array<number>(32).fill(0), text: [] };
    expect(md_parse(bytes, bytes.length, consumer(), capture)).toBe(row.result);
    expect(capture.counts).toEqual(row.spanCounts);
    expect(
      capture.text
        .map(
          /** Serializes a counted byte without text normalization. @param byte - Actual emitted byte. @returns Hexadecimal pair. */ (
            byte,
          ) => byte.toString(16).padStart(2, "0"),
        )
        .join(""),
    ).toBe(row.textHex);
  },
);
