/** @fileoverview Original native independent HTML search limits and borrowed source line subsets; backing buffers and source line geometry remain valid. */
import { assert, expect, it } from "vitest";
import { md_is_html_tag } from "./md4c.html";
import { md_lookup_line, type MD_LINE } from "./md4c.scan";
import captured from "./native-scan-limits.json";

/** Original HTML recognizer arguments and normalized success/end result. */
interface TagCase {
  operation: "html-tag";
  text: string;
  maxEnd: number;
  result: number;
}
/** Original nonempty borrowed line array and a query within its longer initialized backing document. */
interface LineCase {
  operation: "line-lookup";
  text: string;
  lines: MD_LINE[];
  offset: number;
  result: [number, number, number] | null;
}
const observations = captured as unknown as { cases: (TagCase | LineCase)[] };

/** Derives actual content lines from initialized UTF8 bytes, as in the original native caller. @param text - Actual source buffer. @returns Borrowed line bounds. */
function linesFor(text: Uint8Array): MD_LINE[] {
  const lines: MD_LINE[] = [];
  let start = 0;
  for (let offset = 0; offset < text.length; ++offset)
    if (text[offset] === 10) {
      lines.push({ beg: start, end: offset });
      start = offset + 1;
    }
  lines.push({ beg: start, end: text.length });
  return lines;
}

it.each(observations.cases)(
  "matches the original bounded $operation result",
  /** Native MD_CTX default scan fields are zero-initialized; caller arguments provide the actual text and its independent bound/query. No invalid reference fragments, containers or marks are supplied. @param row - Independent compiled original observation. @returns Nothing. */ (
    row,
  ) => {
    const text = new TextEncoder().encode(row.text);
    if (row.operation === "html-tag") {
      const ctx = {
        text,
        size: text.length,
        html_comment_horizon: 0,
        html_proc_instr_horizon: 0,
        html_decl_horizon: 0,
        html_cdata_horizon: 0,
      };
      expect(row.maxEnd).toBeLessThanOrEqual(text.length);
      expect(md_is_html_tag(ctx, linesFor(text), 0, row.maxEnd)).toBe(row.result);
    } else {
      expect(row.offset).toBeLessThanOrEqual(text.length);
      expect(row.lines.length).toBeGreaterThan(0);
      const found = md_lookup_line(row.offset, row.lines);
      if (row.result === null) expect(found).toBeUndefined();
      else {
        assert(found);
        expect([found[0].beg, found[0].end, found[1]]).toEqual(row.result);
        expect(found[0]).toBe(row.lines[row.result[2]]);
      }
    }
  },
);
