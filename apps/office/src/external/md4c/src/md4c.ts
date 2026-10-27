/** @fileoverview md4c 0.5.3 public UTF-8 md_parse over the source block/mark/callback pipeline. See ../LICENSE. */
import { type MD_PARSER, MD_BLOCKTYPE, MD_FLAG_NOINDENTEDCODEBLOCKS } from "./md4c.h";
import { type MD_CTX, MD_CALLBACK_ABORT, md_emit_block } from "./md4c.context";
import { md_build_mark_char_map } from "./md4c.mark";
import { md_process_doc_blocks } from "./md4c.block";
import { md_process_all_blocks } from "./md4c.render";
/** Parses native UTF-8 bytes and returns zero or the original callback abort code. @param text - Input bytes. @param size - Admitted byte length. @param parser - Native callback configuration. @param userdata - Unchanged callback data. @returns Native result. */
export function md_parse<U>(
  text: Uint8Array,
  size: number,
  parser: MD_PARSER<U>,
  userdata: U,
): number {
  if (parser.abi_version !== 0) {
    parser.debug_log?.("Unsupported abi_version.", userdata);
    return -1;
  }
  if (!Number.isInteger(size) || size < 0 || size > text.length)
    throw new RangeError("md4c input size is outside the supplied byte range.");
  const ctx: MD_CTX<U> = {
    text,
    size,
    parser: { ...parser },
    userdata,
    doc_ends_with_newline: size > 0 && (text[size - 1] === 10 || text[size - 1] === 13),
    code_indent_offset: parser.flags & MD_FLAG_NOINDENTEDCODEBLOCKS ? 0xffffffff : 4,
    code_fence_length: 0,
    html_block_type: 0,
    html_comment_horizon: 0,
    html_proc_instr_horizon: 0,
    html_decl_horizon: 0,
    html_cdata_horizon: 0,
    ref_defs: [],
    ref_def_hashtable: [],
    max_ref_def_output: 16 * Math.min(size, 65536),
    block_bytes: [],
    current_block: undefined,
    containers: [],
    n_containers: 0,
    last_line_has_list_loosening_effect: false,
    last_list_item_starts_with_two_blank_lines: false,
    marks: [],
    n_marks: 0,
    mark_char_map: new Uint8Array(256),
    opener_stacks: Array.from(
      { length: 16 },
      /** Applies from to . @returns Callback result. */ () => ({ top: -1 }),
    ),
    ptr_stack: { top: -1 },
    n_table_cell_boundaries: 0,
    table_cell_boundaries_head: -1,
    table_cell_boundaries_tail: -1,
    unresolved_link_head: -1,
    unresolved_link_tail: -1,
  };
  md_build_mark_char_map(ctx);
  try {
    md_emit_block(ctx, true, MD_BLOCKTYPE.MD_BLOCK_DOC, undefined);
    md_process_doc_blocks(ctx);
    md_process_all_blocks(ctx);
    md_emit_block(ctx, false, MD_BLOCKTYPE.MD_BLOCK_DOC, undefined);
    return 0;
  } catch (error) {
    if (error instanceof MD_CALLBACK_ABORT) return error.code;
    throw error;
  }
}
