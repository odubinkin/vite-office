/** @fileoverview Compiled md4c 0.5.3 block scanner differential cases and failure-side state writes. */
import { expect, it } from "vitest";
import fixture from "./native-primitives.json";
import * as scan from "./md4c.block.scan";
it.each(fixture.blockScans)(
  "matches compiled $operation scanning and output state: $text",
  /** Verifies matches compiled $operation scanning and output state: $text. @param value0 - operation, text, argument, result value. @returns Nothing. */ ({
    operation,
    text,
    argument,
    result,
  }) => {
    const input = new TextEncoder().encode(text);
    const ctx: scan.MD_BLOCK_SCAN_CONTEXT = {
      text: input,
      size: input.length,
      parser: { flags: argument },
      code_indent_offset: 4,
      code_fence_length: 3,
      html_block_type: argument,
      html_comment_horizon: 0,
      html_proc_instr_horizon: 0,
      html_decl_horizon: 0,
      html_cdata_horizon: 0,
    };
    let ok = 0,
      end = 0,
      beg = 0,
      level = 0,
      killer = 0,
      cols = 0,
      indent = 0;
    const container: scan.MD_CONTAINER = {
      ch: 0,
      is_loose: false,
      is_task: false,
      start: 0,
      mark_indent: 0,
      contents_indent: 0,
    };
    let value: scan.MD_BLOCK_SCAN_RESULT | undefined;
    switch (operation) {
      case "hr":
        value = scan.md_is_hr_line(ctx, 0);
        break;
      case "atx":
        value = scan.md_is_atxheader_line(ctx, 0);
        break;
      case "setext":
        value = scan.md_is_setext_underline(ctx, 0);
        break;
      case "table":
        value = scan.md_is_table_underline(ctx, 0);
        break;
      case "fence":
        value = scan.md_is_opening_code_fence(ctx, 0);
        break;
      case "closing":
        value = scan.md_is_closing_code_fence(ctx, input[0] as number, 0);
        break;
      case "html_start":
        ok = scan.md_is_html_block_start_condition(ctx, 0);
        break;
      case "html_end": {
        const item = scan.md_is_html_block_end_condition(ctx, 0);
        ok = item.type;
        end = item.end ?? 0;
        break;
      }
      case "container": {
        const item = scan.md_is_container_mark(ctx, argument, 0, container);
        ok = item >= 0 ? 1 : 0;
        end = item >= 0 ? item : 0;
        break;
      }
      case "indent": {
        const item = scan.md_line_indentation(ctx, argument, 0);
        ok = 1;
        end = item.end;
        indent = item.indent;
        break;
      }
      default:
        throw new Error("Unknown compiled scanner fixture.");
    }
    if (value !== undefined) {
      ok = Number(value.matched);
      end = value.end ?? 0;
      beg = value.beg ?? 0;
      level = value.level ?? 0;
      killer = value.killer ?? 0;
      cols = value.col_count ?? 0;
    }
    expect([
      ok,
      end,
      beg,
      level,
      killer,
      cols,
      ctx.code_fence_length,
      container.ch,
      container.start,
      container.mark_indent,
      container.contents_indent,
      indent,
    ]).toEqual(result);
  },
);

it.each([
  ["<![CDATA[x]]>", 4],
  ["<!é>", 0],
  ["<!é long declaration>", 0],
  ["<custom> \t\v\f\n", 7],
] as const)(
  "preserves native declaration classification for %s",
  /** Independently compiled md4c returns4/0/0/7; real UTF8 buffers cover short and long non-ASCII rejection. @param source - Counted input. @param expected - Original C helper output. @returns Nothing. */ (
    source,
    expected,
  ) => {
    const text = new TextEncoder().encode(source),
      ctx: scan.MD_BLOCK_SCAN_CONTEXT = {
        text,
        size: text.length,
        parser: { flags: 0 },
        code_indent_offset: 4,
        code_fence_length: 3,
        html_block_type: 0,
        html_comment_horizon: 0,
        html_proc_instr_horizon: 0,
        html_decl_horizon: 0,
        html_cdata_horizon: 0,
      };
    expect(scan.md_is_html_block_start_condition(ctx, 0)).toBe(expected);
  },
);

it("consumes trailing native whitespace after a table separator", /** Original C helper returns success,end7,one column for this counted buffer. @returns Nothing. */ () => {
  const text = new TextEncoder().encode("|---| \t"),
    ctx: scan.MD_BLOCK_SCAN_CONTEXT = {
      text,
      size: text.length,
      parser: { flags: 0 },
      code_indent_offset: 4,
      code_fence_length: 3,
      html_block_type: 0,
      html_comment_horizon: 0,
      html_proc_instr_horizon: 0,
      html_decl_horizon: 0,
      html_cdata_horizon: 0,
    };
  expect(scan.md_is_table_underline(ctx, 0)).toEqual({ matched: true, end: 7, col_count: 1 });
});
