/** @fileoverview Full native block-analysis differential corpus from pinned md4c 0.5.3 and its bundled CommonMark/extension examples. */
import { expect, it } from "vitest";
import fixture from "./native-blocks.json";
import { MD_BLOCKTYPE as B, MD_FLAG_NOINDENTEDCODEBLOCKS } from "./md4c.h";
import { md_process_doc_blocks } from "./md4c.block";
import { MD_BLOCK, MD_BLOCK_CONTAINER, type MD_BLOCK_CONTEXT } from "./md4c.block.store";
it.each(fixture.cases)(
  "matches compiled md4c block queue and reference definitions: $id",
  /** Verifies matches compiled md4c block queue and reference definitions: $id. @param value0 - text, flags, result value. @returns Nothing. */ ({
    text,
    flags,
    result,
  }) => {
    const input = new TextEncoder().encode(text);
    const ctx: MD_BLOCK_CONTEXT = {
      text: input,
      size: input.length,
      parser: { flags },
      ref_defs: [],
      ref_def_hashtable: [],
      max_ref_def_output: 16 * Math.min(input.length, 65536),
      block_bytes: [],
      current_block: undefined,
      containers: [],
      n_containers: 0,
      last_line_has_list_loosening_effect: false,
      last_list_item_starts_with_two_blank_lines: false,
      code_indent_offset: flags & MD_FLAG_NOINDENTEDCODEBLOCKS ? 0xffffffff : 4,
      code_fence_length: 0,
      html_block_type: 0,
      html_comment_horizon: 0,
      html_proc_instr_horizon: 0,
      html_decl_horizon: 0,
      html_cdata_horizon: 0,
    };
    md_process_doc_blocks(ctx);
    const blocks: unknown[] = [];
    let cursor = 0;
    while (cursor < ctx.block_bytes.length * 4) {
      const block = new MD_BLOCK(ctx.block_bytes, cursor);
      cursor += 8;
      const data =
        block.type === B.MD_BLOCK_P ||
        block.type === B.MD_BLOCK_HTML ||
        block.type === B.MD_BLOCK_HR
          ? 0
          : block.data;
      const lines =
        block.flags & MD_BLOCK_CONTAINER
          ? []
          : block
              .lines()
              .map(
                /** Verifies matches compiled md4c block queue and reference definitions: $id. @param line - line value. @returns Callback result. */ (
                  line,
                ) => [line.beg, line.end, line.indent],
              );
      blocks.push([block.type, block.flags, data, block.n_lines, lines]);
      if (!(block.flags & MD_BLOCK_CONTAINER))
        cursor +=
          block.n_lines *
          (block.type === B.MD_BLOCK_CODE || block.type === B.MD_BLOCK_HTML ? 12 : 8);
    }
    const definitions = ctx.ref_defs.map(
      /** Verifies matches compiled md4c block queue and reference definitions: $id. @param def - def value. @returns Callback result. */ (
        def,
      ) => [def.dest_beg, def.dest_end, [...def.label], [...def.title]],
    );
    expect({ blocks, definitions }).toEqual(result);
  },
);
