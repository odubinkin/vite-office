/** @fileoverview md4c.c native table, verbatim, leaf and container callback emission. See ../LICENSE. */
import {
  MD_BLOCKTYPE as B,
  MD_TEXTTYPE as T,
  MD_ALIGN as A,
  type MD_BLOCK_DETAIL,
  type MD_ATTRIBUTE,
  type MD_BLOCK_CODE_DETAIL,
} from "./md4c.h";
import { type MD_LINE, ISWHITESPACE_ } from "./md4c.scan";
import {
  type MD_CTX,
  md_emit_block,
  md_emit_text,
  md_text_with_null_replacement,
} from "./md4c.context";
import { type MD_MARK } from "./md4c.mark";
import { md_analyze_inlines } from "./md4c.mark.analyze";
import { md_process_inlines } from "./md4c.inline";
import {
  MD_BLOCK,
  MD_BLOCK_CONTAINER,
  MD_BLOCK_CONTAINER_OPENER,
  MD_BLOCK_CONTAINER_CLOSER,
  MD_BLOCK_LOOSE_LIST,
  type MD_VERBATIMLINE,
} from "./md4c.block.store";
import { md_build_attribute } from "./md4c.attribute";
const EMPTY: MD_ATTRIBUTE = {
    text: new Uint8Array(),
    size: 0,
    substr_types: [],
    substr_offsets: [],
  },
  LF = new Uint8Array([10]),
  SPACES = new Uint8Array(16).fill(32);
/** Processes source inline content and releases only its temporary owned title references. @param ctx - Context. @param lines - Native bounds. @returns Nothing. */
export function md_process_normal_block_contents<U>(
  ctx: MD_CTX<U>,
  lines: readonly MD_LINE[],
): void {
  try {
    md_analyze_inlines(ctx, lines, false);
    md_process_inlines(ctx, lines);
  } finally {
    for (let index = ctx.ptr_stack.top; index >= 0; index = (ctx.marks[index] as MD_MARK).next)
      delete (ctx.marks[index] as MD_MARK).pointer;
    ctx.ptr_stack.top = -1;
  }
}
/** Processes one source table cell after ASCII whitespace trimming. @param ctx - Context. @param type - Header/body cell kind. @param align - Native alignment. @param beg - Start. @param end - End. @returns Nothing. */
function md_process_table_cell<U>(
  ctx: MD_CTX<U>,
  type: B,
  align: A,
  beg: number,
  end: number,
): void {
  while (beg < end && ISWHITESPACE_(ctx.text[beg] as number)) beg++;
  while (end > beg && ISWHITESPACE_(ctx.text[end - 1] as number)) end--;
  const detail = { align };
  md_emit_block(ctx, true, type, detail);
  md_process_normal_block_contents(ctx, [{ beg, end }]);
  md_emit_block(ctx, false, type, detail);
}
/** Preserves source pipe-boundary caching, empty-interval skipping and final cell filling. @param ctx - Context. @param type - Header/body cell kind. @param beg - Row start. @param end - Row end. @param align - Alignments. @param count - Native column count. @returns Nothing. */
function md_process_table_row<U>(
  ctx: MD_CTX<U>,
  type: B,
  beg: number,
  end: number,
  align: readonly A[],
  count: number,
): void {
  try {
    md_analyze_inlines(ctx, [{ beg, end }], true);
    const pipes = [beg];
    for (
      let index = ctx.table_cell_boundaries_head;
      index >= 0;
      index = (ctx.marks[index] as MD_MARK).next
    )
      pipes.push((ctx.marks[index] as MD_MARK).end);
    pipes.push(end + 1);
    md_emit_block(ctx, true, B.MD_BLOCK_TR, undefined);
    let col = 0;
    for (let index = 0; index < pipes.length - 1 && col < count; index++)
      if ((pipes[index] as number) < (pipes[index + 1] as number) - 1)
        md_process_table_cell(
          ctx,
          type,
          align[col++] as A,
          pipes[index] as number,
          (pipes[index + 1] as number) - 1,
        );
    while (col < count) md_process_table_cell(ctx, type, align[col++] as A, 0, 0);
    md_emit_block(ctx, false, B.MD_BLOCK_TR, undefined);
  } finally {
    ctx.table_cell_boundaries_head = -1;
    ctx.table_cell_boundaries_tail = -1;
  }
}
/** Emits the native table header and optional body groups. @param ctx - Context. @param count - Column count. @param lines - Native table lines. @returns Nothing. */
function md_process_table_block_contents<U>(
  ctx: MD_CTX<U>,
  count: number,
  lines: readonly MD_LINE[],
): void {
  const underline = lines[1] as MD_LINE,
    align: A[] = [],
    map = [A.MD_ALIGN_DEFAULT, A.MD_ALIGN_LEFT, A.MD_ALIGN_RIGHT, A.MD_ALIGN_CENTER];
  let off = underline.beg;
  for (let column = 0; column < count; column++) {
    let index = 0;
    while (ctx.text[off] !== 45) off++;
    if (off > underline.beg && ctx.text[off - 1] === 58) index |= 1;
    while (off < underline.end && ctx.text[off] === 45) off++;
    if (off < underline.end && ctx.text[off] === 58) index |= 2;
    align.push(map[index] as A);
  }
  md_emit_block(ctx, true, B.MD_BLOCK_THEAD, undefined);
  const head = lines[0] as MD_LINE;
  md_process_table_row(ctx, B.MD_BLOCK_TH, head.beg, head.end, align, count);
  md_emit_block(ctx, false, B.MD_BLOCK_THEAD, undefined);
  if (lines.length > 2) {
    md_emit_block(ctx, true, B.MD_BLOCK_TBODY, undefined);
    for (let index = 2; index < lines.length; index++) {
      const row = lines[index] as MD_LINE;
      md_process_table_row(ctx, B.MD_BLOCK_TD, row.beg, row.end, align, count);
    }
    md_emit_block(ctx, false, B.MD_BLOCK_TBODY, undefined);
  }
}
/** Emits source verbatim indentation chunks and an enforced LF after every line. @param ctx - Context. @param type - Code/HTML kind. @param lines - Verbatim records. @returns Nothing. */
function md_process_verbatim_block_contents<U>(
  ctx: MD_CTX<U>,
  type: T,
  lines: readonly MD_VERBATIMLINE[],
): void {
  for (const line of lines) {
    let indent = line.indent;
    while (indent > 16) {
      md_emit_text(ctx, type, SPACES);
      indent -= 16;
    }
    if (indent > 0) md_emit_text(ctx, type, SPACES.subarray(0, indent));
    md_text_with_null_replacement(ctx, type, ctx.text.subarray(line.beg, line.end));
    md_emit_text(ctx, type, LF);
  }
}
/** Builds source fence info and language attribute details. @param ctx - Context. @param line - Initial fence. @returns Native detail. */
function md_setup_fenced_code_detail<U>(
  ctx: MD_CTX<U>,
  line: MD_VERBATIMLINE,
): MD_BLOCK_CODE_DETAIL {
  const text = ctx.text,
    fence = text[line.beg] as number;
  let beg = line.beg,
    end = line.end;
  while (beg < ctx.size && text[beg] === fence) beg++;
  while (beg < ctx.size && text[beg] === 32) beg++;
  while (end > beg && text[end - 1] === 32) end--;
  let langEnd = beg;
  while (langEnd < end && !ISWHITESPACE_(text[langEnd] as number)) langEnd++;
  return {
    info: md_build_attribute(text.subarray(beg, end)),
    lang: md_build_attribute(text.subarray(beg, langEnd)),
    fence_char: fence,
  };
}
/** Emits one native leaf with tight-list paragraph suppression. @param ctx - Context. @param block - Header view. @returns Nothing. */
function md_process_leaf_block<U>(ctx: MD_CTX<U>, block: MD_BLOCK): void {
  const tight = ctx.n_containers > 0 && !ctx.containers[ctx.n_containers - 1]?.is_loose,
    lines = block.lines();
  let detail: MD_BLOCK_DETAIL | undefined;
  if (block.type === B.MD_BLOCK_H) detail = { level: block.data };
  else if (block.type === B.MD_BLOCK_CODE)
    detail =
      block.data !== 0
        ? md_setup_fenced_code_detail(ctx, lines[0] as MD_VERBATIMLINE)
        : { info: EMPTY, lang: EMPTY, fence_char: 0 };
  else if (block.type === B.MD_BLOCK_TABLE)
    detail = { col_count: block.data, head_row_count: 1, body_row_count: block.n_lines - 2 };
  if (!tight || block.type !== B.MD_BLOCK_P) md_emit_block(ctx, true, block.type, detail);
  switch (block.type) {
    case B.MD_BLOCK_HR:
      break;
    case B.MD_BLOCK_CODE: {
      let start = block.data !== 0 ? 1 : 0,
        end = lines.length;
      if (block.data === 0) {
        while (start < end && (lines[start] as MD_LINE).beg === (lines[start] as MD_LINE).end)
          /* istanbul ignore next -- B8TCAE-M13: blank lines cannot start an indented-code block; retain the defensive trim guard. */
          start++;
        while (end > start && (lines[end - 1] as MD_LINE).beg === (lines[end - 1] as MD_LINE).end)
          end--;
      }
      if (start < end)
        md_process_verbatim_block_contents(ctx, T.MD_TEXT_CODE, lines.slice(start, end));
      break;
    }
    case B.MD_BLOCK_HTML:
      md_process_verbatim_block_contents(ctx, T.MD_TEXT_HTML, lines);
      break;
    case B.MD_BLOCK_TABLE:
      md_process_table_block_contents(ctx, block.data, lines);
      break;
    default:
      md_process_normal_block_contents(ctx, lines);
  }
  if (!tight || block.type !== B.MD_BLOCK_P) md_emit_block(ctx, false, block.type, detail);
}
/** Emits the source queue, reusing container storage for list looseness. @param ctx - Context. @returns Nothing. */
export function md_process_all_blocks<U>(ctx: MD_CTX<U>): void {
  let offset = 0;
  ctx.n_containers = 0;
  while (offset < ctx.block_bytes.length * 4) {
    const block = new MD_BLOCK(ctx.block_bytes, offset);
    let detail: MD_BLOCK_DETAIL | undefined;
    if (block.type === B.MD_BLOCK_UL)
      detail = { is_tight: block.flags & MD_BLOCK_LOOSE_LIST ? 0 : 1, mark: block.data };
    else if (block.type === B.MD_BLOCK_OL)
      detail = {
        start: block.n_lines,
        is_tight: block.flags & MD_BLOCK_LOOSE_LIST ? 0 : 1,
        mark_delimiter: block.data,
      };
    else if (block.type === B.MD_BLOCK_LI)
      detail = {
        is_task: Number(block.data !== 0),
        task_mark: block.data,
        task_mark_offset: block.n_lines,
      };
    if (block.flags & MD_BLOCK_CONTAINER) {
      if (block.flags & MD_BLOCK_CONTAINER_CLOSER) {
        md_emit_block(ctx, false, block.type, detail);
        if ([B.MD_BLOCK_UL, B.MD_BLOCK_OL, B.MD_BLOCK_QUOTE].includes(block.type))
          ctx.n_containers--;
      }
      if (block.flags & MD_BLOCK_CONTAINER_OPENER) {
        md_emit_block(ctx, true, block.type, detail);
        if (block.type === B.MD_BLOCK_UL || block.type === B.MD_BLOCK_OL) {
          const item = ctx.containers[ctx.n_containers];
          /* istanbul ignore else -- B8TCAE-M12a: original queue replay stays within the dense container storage reserved by analysis. */
          if (item !== undefined) item.is_loose = Boolean(block.flags & MD_BLOCK_LOOSE_LIST);
          ctx.n_containers++;
        } else if (block.type === B.MD_BLOCK_QUOTE) {
          const item = ctx.containers[ctx.n_containers];
          /* istanbul ignore else -- B8TCAE-M12b: quote replay uses the same retained dense container storage. */
          if (item !== undefined) item.is_loose = true;
          ctx.n_containers++;
        }
      }
    } else {
      md_process_leaf_block(ctx, block);
      offset +=
        block.n_lines * (block.type === B.MD_BLOCK_CODE || block.type === B.MD_BLOCK_HTML ? 12 : 8);
    }
    offset += 8;
  }
  ctx.block_bytes.length = 0;
}
