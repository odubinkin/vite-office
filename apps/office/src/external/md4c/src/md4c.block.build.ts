/** @fileoverview md4c.c native block construction, reference-definition removal and container events. See ../LICENSE. */
import { MD_BLOCKTYPE as B } from "./md4c.h";
import { md_is_link_reference_definition } from "./md4c.ref";
import {
  MD_BLOCK,
  MD_LINETYPE as L,
  MD_BLOCK_CONTAINER_OPENER as OPEN,
  MD_BLOCK_CONTAINER_CLOSER as CLOSE,
  MD_BLOCK_SETEXT_HEADER,
  type MD_BLOCK_CONTEXT,
  type MD_LINE_ANALYSIS,
} from "./md4c.block.store";
/** Appends a native block header in the original word queue. @param ctx - Context. @param type - Type. @param flags - Flags. @param data - Data. @param lines - Count/start/task offset. @returns Header view. */
function md_push_block(
  ctx: MD_BLOCK_CONTEXT,
  type: B,
  flags: number,
  data: number,
  lines: number,
): MD_BLOCK {
  const block = new MD_BLOCK(ctx.block_bytes, ctx.block_bytes.length * 4);
  ctx.block_bytes.push(0, 0);
  block.type = type;
  block.flags = flags;
  block.data = data;
  block.n_lines = lines;
  return block;
}
/** Starts one source leaf block. @param ctx - Context. @param line - Initial line. @returns Nothing. */
export function md_start_new_block(ctx: MD_BLOCK_CONTEXT, line: MD_LINE_ANALYSIS): void {
  const type =
    line.type === L.MD_LINE_HR
      ? B.MD_BLOCK_HR
      : line.type === L.MD_LINE_ATXHEADER || line.type === L.MD_LINE_SETEXTHEADER
        ? B.MD_BLOCK_H
        : line.type === L.MD_LINE_FENCEDCODE || line.type === L.MD_LINE_INDENTEDCODE
          ? B.MD_BLOCK_CODE
          : line.type === L.MD_LINE_TEXT
            ? B.MD_BLOCK_P
            : B.MD_BLOCK_HTML;
  ctx.current_block = md_push_block(ctx, type, 0, line.data, 0);
}
/** Consumes and stores only reference definitions at the start of the current block. @param ctx - Context. @returns Nothing. */
export function md_consume_link_reference_definitions(ctx: MD_BLOCK_CONTEXT): void {
  const block = ctx.current_block as MD_BLOCK,
    lines = block.lines();
  let n = 0;
  while (n < lines.length) {
    const count = md_is_link_reference_definition(ctx, lines.slice(n));
    if (!count) break;
    n += count;
  }
  if (n === 0) return;
  if (n === lines.length) {
    ctx.block_bytes.length -= n * 2 + 2;
    ctx.current_block = undefined;
  } else {
    ctx.block_bytes.splice(block.offset / 4 + 2, n * 2);
    block.n_lines -= n;
  }
}
/** Ends the current source block, retaining the reference-only setext downgrade. @param ctx - Context. @returns Nothing. */
export function md_end_current_block(ctx: MD_BLOCK_CONTEXT): void {
  let block = ctx.current_block;
  if (block === undefined) return;
  if (
    block.type === B.MD_BLOCK_P ||
    (block.type === B.MD_BLOCK_H && block.flags & MD_BLOCK_SETEXT_HEADER)
  ) {
    const first = block.lines()[0];
    if (first !== undefined && first.beg < ctx.size && ctx.text[first.beg] === 91) {
      md_consume_link_reference_definitions(ctx);
      if (ctx.current_block === undefined) return;
      block = ctx.current_block;
    }
  }
  if (block.type === B.MD_BLOCK_H && block.flags & MD_BLOCK_SETEXT_HEADER) {
    if (block.n_lines > 1) {
      block.n_lines--;
      ctx.block_bytes.length -= 2;
    } else {
      block.type = B.MD_BLOCK_P;
      return;
    }
  }
  ctx.current_block = undefined;
}
/** Appends one normal/verbatim source line to the current block. @param ctx - Context. @param line - Analysis. @returns Nothing. */
export function md_add_line_into_current_block(
  ctx: MD_BLOCK_CONTEXT,
  line: MD_LINE_ANALYSIS,
): void {
  const block = ctx.current_block as MD_BLOCK;
  ctx.block_bytes.push(line.beg, line.end);
  if (block.type === B.MD_BLOCK_CODE || block.type === B.MD_BLOCK_HTML)
    ctx.block_bytes.push(line.indent);
  block.n_lines++;
}
/** Appends a native container event after completing the current leaf. @param ctx - Context. @param type - Kind. @param start - Start/task offset. @param data - Marker/task state. @param flags - Opener/closer flags. @returns Nothing. */
export function md_push_container_bytes(
  ctx: MD_BLOCK_CONTEXT,
  type: B,
  start: number,
  data: number,
  flags: number,
): void {
  md_end_current_block(ctx);
  md_push_block(ctx, type, flags, data, start);
}
/** Emits source list/quote entry events and remembers mutable list headers. @param ctx - Context. @param children - Newly entered count. @returns Nothing. */
export function md_enter_child_containers(ctx: MD_BLOCK_CONTEXT, children: number): void {
  for (let index = ctx.n_containers - children; index < ctx.n_containers; index++) {
    const c = ctx.containers[index];
    if (c === undefined) throw new Error("Invalid md4c container index.");
    if (c.ch === 62) md_push_container_bytes(ctx, B.MD_BLOCK_QUOTE, 0, 0, OPEN);
    else {
      md_end_current_block(ctx);
      c.block_byte_off = ctx.block_bytes.length * 4;
      md_push_container_bytes(
        ctx,
        c.ch === 41 || c.ch === 46 ? B.MD_BLOCK_OL : B.MD_BLOCK_UL,
        c.start,
        c.ch,
        OPEN,
      );
      md_push_container_bytes(
        ctx,
        B.MD_BLOCK_LI,
        c.task_mark_off,
        c.is_task ? (ctx.text[c.task_mark_off] as number) : 0,
        OPEN,
      );
    }
  }
}
/** Emits source list/quote exits without discarding the reusable container storage. @param ctx - Context. @param keep - Remaining parent count. @returns Nothing. */
export function md_leave_child_containers(ctx: MD_BLOCK_CONTEXT, keep: number): void {
  while (ctx.n_containers > keep) {
    const c = ctx.containers[ctx.n_containers - 1];
    if (c === undefined) throw new Error("Invalid md4c container index.");
    if (c.ch === 62) md_push_container_bytes(ctx, B.MD_BLOCK_QUOTE, 0, 0, CLOSE);
    else {
      md_push_container_bytes(
        ctx,
        B.MD_BLOCK_LI,
        c.task_mark_off,
        c.is_task ? (ctx.text[c.task_mark_off] as number) : 0,
        CLOSE,
      );
      md_push_container_bytes(
        ctx,
        c.ch === 41 || c.ch === 46 ? B.MD_BLOCK_OL : B.MD_BLOCK_UL,
        0,
        c.ch,
        CLOSE,
      );
    }
    ctx.n_containers--;
  }
}
