/** @fileoverview md4c.c md_process_doc block-analysis phase, operating on the same context before callback emission. See ../LICENSE. */
import { md_build_ref_def_hashtable } from "./md4c.ref";
import { md_end_current_block, md_leave_child_containers } from "./md4c.block.build";
import { md_analyze_line, md_process_line } from "./md4c.block.line";
import { md_dummy_blank_line, md_line_buffer, type MD_BLOCK_CONTEXT } from "./md4c.block.store";
/** Performs the original document line pass and reference-table/container finalization. Callback emission is the following native phase. @param ctx - Original context. @returns Nothing. */
export function md_process_doc_blocks(ctx: MD_BLOCK_CONTEXT): void {
  let pivot = md_dummy_blank_line;
  const buffers = [md_line_buffer(), md_line_buffer()] as const;
  let line = buffers[0],
    off = 0;
  while (off < ctx.size) {
    if (line === pivot) line = line === buffers[0] ? buffers[1] : buffers[0];
    off = md_analyze_line(ctx, off, pivot, line);
    pivot = md_process_line(ctx, pivot, line);
  }
  md_end_current_block(ctx);
  md_build_ref_def_hashtable(ctx);
  md_leave_child_containers(ctx, 0);
}
