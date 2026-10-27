/** @fileoverview md4c.c md_analyze_line and md_process_line, preserving the original shared context and pivot-buffer state machine. See ../LICENSE. */
import {
  MD_BLOCKTYPE as B,
  MD_FLAG_NOHTMLBLOCKS,
  MD_FLAG_PERMISSIVEATXHEADERS,
  MD_FLAG_TABLES,
  MD_FLAG_TASKLISTS,
} from "./md4c.h";
import { ISBLANK_, ISNEWLINE_, ISWHITESPACE_ } from "./md4c.scan";
import * as scan from "./md4c.block.scan";
import {
  MD_BLOCK,
  MD_LINETYPE as L,
  MD_BLOCK_CONTAINER_OPENER as OPEN,
  MD_BLOCK_CONTAINER_CLOSER as CLOSE,
  MD_BLOCK_LOOSE_LIST,
  MD_BLOCK_SETEXT_HEADER,
  md_dummy_blank_line as DUMMY,
  md_container_buffer,
  type MD_BLOCK_CONTEXT,
  type MD_LINE_ANALYSIS,
} from "./md4c.block.store";
import {
  md_start_new_block,
  md_add_line_into_current_block,
  md_end_current_block,
  md_push_container_bytes,
  md_enter_child_containers,
  md_leave_child_containers,
} from "./md4c.block.build";
/** Determines source line kind and changes the native container graph. @param ctx - Original context. @param beg - Raw line offset. @param pivot - Current block's pivot line. @param line - Reused analysis buffer. @returns Next raw line offset. */
export function md_analyze_line(
  ctx: MD_BLOCK_CONTEXT,
  beg: number,
  pivot: MD_LINE_ANALYSIS,
  line: MD_LINE_ANALYSIS,
): number {
  const text = ctx.text;
  let totalIndent = 0,
    parents = 0,
    brothers = 0,
    children = 0,
    off = beg,
    hrKiller = 0;
  const container = md_container_buffer(),
    previousLoose = ctx.last_line_has_list_loosening_effect;
  let indentation = scan.md_line_indentation(ctx, totalIndent, off);
  line.indent = indentation.indent;
  off = indentation.end;
  totalIndent += line.indent;
  line.beg = off;
  line.enforce_new_block = false;
  while (parents < ctx.n_containers) {
    const c = ctx.containers[parents] as typeof container;
    if (c.ch === 62 && line.indent < ctx.code_indent_offset && off < ctx.size && text[off] === 62) {
      off++;
      totalIndent++;
      indentation = scan.md_line_indentation(ctx, totalIndent, off);
      line.indent = indentation.indent;
      off = indentation.end;
      totalIndent += line.indent;
      if (line.indent > 0) line.indent--;
      line.beg = off;
    } else if (c.ch !== 62 && line.indent >= c.contents_indent) line.indent -= c.contents_indent;
    else break;
    parents++;
  }
  if (off >= ctx.size || ISNEWLINE_(text[off] as number)) {
    if (brothers + children === 0)
      while (parents < ctx.n_containers && (ctx.containers[parents] as typeof container).ch !== 62)
        parents++;
  }
  while (true) {
    if (pivot.type === L.MD_LINE_FENCEDCODE) {
      line.beg = off;
      if (line.indent < ctx.code_indent_offset) {
        const closing = scan.md_is_closing_code_fence(ctx, text[pivot.beg] as number, off);
        off = closing.end as number;
        if (closing.matched) {
          line.type = L.MD_LINE_BLANK;
          ctx.last_line_has_list_loosening_effect = false;
          break;
        }
      }
      if (parents === ctx.n_containers) {
        line.indent = line.indent > pivot.indent ? line.indent - pivot.indent : 0;
        line.type = L.MD_LINE_FENCEDCODE;
        break;
      }
    }
    if (pivot.type === L.MD_LINE_HTML && ctx.html_block_type > 0) {
      if (parents < ctx.n_containers) ctx.html_block_type = 0;
      else {
        const closing = scan.md_is_html_block_end_condition(ctx, off);
        if (closing.end !== undefined) off = closing.end;
        if (closing.type > 0) {
          ctx.html_block_type = 0;
          if (closing.type === 6 || closing.type === 7) {
            line.type = L.MD_LINE_BLANK;
            line.indent = 0;
            break;
          }
        }
        line.type = L.MD_LINE_HTML;
        parents = ctx.n_containers;
        break;
      }
    }
    if (off >= ctx.size || ISNEWLINE_(text[off] as number)) {
      if (pivot.type === L.MD_LINE_INDENTEDCODE && parents === ctx.n_containers) {
        line.type = L.MD_LINE_INDENTEDCODE;
        line.indent =
          line.indent > ctx.code_indent_offset ? line.indent - ctx.code_indent_offset : 0;
        ctx.last_line_has_list_loosening_effect = false;
      } else {
        line.type = L.MD_LINE_BLANK;
        ctx.last_line_has_list_loosening_effect =
          parents > 0 &&
          brothers + children === 0 &&
          (ctx.containers[parents - 1] as typeof container).ch !== 62;
        if (
          parents > 0 &&
          (ctx.containers[parents - 1] as typeof container).ch !== 62 &&
          brothers + children === 0 &&
          ctx.current_block === undefined &&
          ctx.block_bytes.length * 4 > 8
        ) {
          const top = new MD_BLOCK(ctx.block_bytes, ctx.block_bytes.length * 4 - 8);
          if (top.type === B.MD_BLOCK_LI) ctx.last_list_item_starts_with_two_blank_lines = true;
        }
      }
      break;
    } else {
      if (ctx.last_list_item_starts_with_two_blank_lines) {
        if (
          parents > 0 &&
          parents === ctx.n_containers &&
          (ctx.containers[parents - 1] as typeof container).ch !== 62 &&
          brothers + children === 0 &&
          ctx.current_block === undefined &&
          ctx.block_bytes.length * 4 > 8
        ) {
          const top = new MD_BLOCK(ctx.block_bytes, ctx.block_bytes.length * 4 - 8);
          if (top.type === B.MD_BLOCK_LI) {
            parents--;
            line.indent = totalIndent;
            if (parents > 0)
              line.indent -= Math.min(
                line.indent,
                (ctx.containers[parents - 1] as typeof container).contents_indent,
              );
          }
        }
        ctx.last_list_item_starts_with_two_blank_lines = false;
      }
      ctx.last_line_has_list_loosening_effect = false;
    }
    if (
      line.indent < ctx.code_indent_offset &&
      pivot.type === L.MD_LINE_TEXT &&
      off < ctx.size &&
      (text[off] === 61 || text[off] === 45) &&
      parents === ctx.n_containers
    ) {
      const underline = scan.md_is_setext_underline(ctx, off);
      if (underline.matched) {
        off = underline.end as number;
        line.type = L.MD_LINE_SETEXTUNDERLINE;
        line.data = underline.level as number;
        break;
      }
    }
    if (
      line.indent < ctx.code_indent_offset &&
      off < ctx.size &&
      off >= hrKiller &&
      [45, 95, 42].includes(text[off] as number)
    ) {
      const hr = scan.md_is_hr_line(ctx, off);
      if (hr.killer !== undefined) hrKiller = hr.killer;
      if (hr.matched) {
        off = hr.end as number;
        line.type = L.MD_LINE_HR;
        break;
      }
    }
    if (parents < ctx.n_containers && brothers + children === 0) {
      const tmp = scan.md_is_container_mark(ctx, line.indent, off, container);
      if (
        tmp >= 0 &&
        scan.md_is_container_compatible(ctx.containers[parents] as typeof container, container)
      ) {
        pivot = DUMMY;
        off = tmp;
        totalIndent += container.contents_indent - container.mark_indent;
        indentation = scan.md_line_indentation(ctx, totalIndent, off);
        line.indent = indentation.indent;
        off = indentation.end;
        totalIndent += line.indent;
        line.beg = off;
        if (off >= ctx.size || ISNEWLINE_(text[off] as number)) container.contents_indent++;
        else if (line.indent <= ctx.code_indent_offset) {
          container.contents_indent += line.indent;
          line.indent = 0;
        } else {
          container.contents_indent++;
          line.indent--;
        }
        const c = ctx.containers[parents] as typeof container;
        c.mark_indent = container.mark_indent;
        c.contents_indent = container.contents_indent;
        brothers++;
        continue;
      }
    }
    if (line.indent >= ctx.code_indent_offset && pivot.type !== L.MD_LINE_TEXT) {
      line.type = L.MD_LINE_INDENTEDCODE;
      line.indent -= ctx.code_indent_offset;
      line.data = 0;
      break;
    }
    if (line.indent < ctx.code_indent_offset) {
      const mark = scan.md_is_container_mark(ctx, line.indent, off, container);
      if (mark >= 0) {
        off = mark;
        const inParagraph = pivot.type === L.MD_LINE_TEXT && parents === ctx.n_containers;
        if (
          !(
            inParagraph &&
            (off >= ctx.size || ISNEWLINE_(text[off] as number)) &&
            container.ch !== 62
          ) &&
          !(inParagraph && (container.ch === 46 || container.ch === 41) && container.start !== 1)
        ) {
          totalIndent += container.contents_indent - container.mark_indent;
          indentation = scan.md_line_indentation(ctx, totalIndent, off);
          line.indent = indentation.indent;
          off = indentation.end;
          totalIndent += line.indent;
          line.beg = off;
          line.data = container.ch;
          if (off >= ctx.size || ISNEWLINE_(text[off] as number)) container.contents_indent++;
          else if (line.indent <= ctx.code_indent_offset) {
            container.contents_indent += line.indent;
            line.indent = 0;
          } else {
            container.contents_indent++;
            line.indent--;
          }
          if (brothers + children === 0) pivot = DUMMY;
          if (children === 0) md_leave_child_containers(ctx, parents + brothers);
          children++;
          ctx.containers[ctx.n_containers++] = { ...container };
          continue;
        }
      }
    }
    if (pivot.type === L.MD_LINE_TABLE && parents === ctx.n_containers) {
      line.type = L.MD_LINE_TABLE;
      break;
    }
    if (line.indent < ctx.code_indent_offset && off < ctx.size && text[off] === 35) {
      const heading = scan.md_is_atxheader_line(ctx, off);
      if (heading.matched) {
        line.beg = heading.beg as number;
        off = heading.end as number;
        line.type = L.MD_LINE_ATXHEADER;
        line.data = heading.level as number;
        break;
      }
    }
    if (
      line.indent < ctx.code_indent_offset &&
      off < ctx.size &&
      (text[off] === 96 || text[off] === 126)
    ) {
      const fence = scan.md_is_opening_code_fence(ctx, off);
      if (fence.matched) {
        off = fence.end as number;
        line.type = L.MD_LINE_FENCEDCODE;
        line.data = 1;
        line.enforce_new_block = true;
        break;
      }
    }
    if (off < ctx.size && text[off] === 60 && !(ctx.parser.flags & MD_FLAG_NOHTMLBLOCKS)) {
      ctx.html_block_type = scan.md_is_html_block_start_condition(ctx, off);
      if (ctx.html_block_type === 7 && pivot.type === L.MD_LINE_TEXT) ctx.html_block_type = 0;
      if (ctx.html_block_type > 0) {
        const closing = scan.md_is_html_block_end_condition(ctx, off);
        if (closing.end !== undefined) off = closing.end;
        if (closing.type === ctx.html_block_type) ctx.html_block_type = 0;
        line.enforce_new_block = true;
        line.type = L.MD_LINE_HTML;
        break;
      }
    }
    if (
      ctx.parser.flags & MD_FLAG_TABLES &&
      pivot.type === L.MD_LINE_TEXT &&
      off < ctx.size &&
      [124, 45, 58].includes(text[off] as number) &&
      parents === ctx.n_containers &&
      ctx.current_block !== undefined &&
      ctx.current_block.n_lines === 1
    ) {
      const underline = scan.md_is_table_underline(ctx, off);
      if (underline.matched) {
        off = underline.end as number;
        line.data = underline.col_count as number;
        line.type = L.MD_LINE_TABLEUNDERLINE;
        break;
      }
    }
    line.type = L.MD_LINE_TEXT;
    if (pivot.type === L.MD_LINE_TEXT && brothers + children === 0) parents = ctx.n_containers;
    if (
      ctx.parser.flags & MD_FLAG_TASKLISTS &&
      brothers + children > 0 &&
      [45, 43, 42, 46, 41].includes((ctx.containers[ctx.n_containers - 1] as typeof container).ch)
    ) {
      let tmp = off;
      while (tmp < ctx.size && tmp < off + 3 && ISBLANK_(text[tmp] as number)) tmp++;
      if (
        tmp + 2 < ctx.size &&
        text[tmp] === 91 &&
        [120, 88, 32].includes(text[tmp + 1] as number) &&
        text[tmp + 2] === 93 &&
        (tmp + 3 === ctx.size ||
          ISBLANK_(text[tmp + 3] as number) ||
          ISNEWLINE_(text[tmp + 3] as number))
      ) {
        const task =
          children > 0 ? (ctx.containers[ctx.n_containers - 1] as typeof container) : container;
        task.is_task = true;
        task.task_mark_off = tmp + 1;
        off = tmp + 3;
        while (off < ctx.size && ISWHITESPACE_(text[off] as number)) off++;
        line.beg = off;
      }
    }
    break;
  }
  while (off < ctx.size && !ISNEWLINE_(text[off] as number)) off++;
  line.end = off;
  if (line.type === L.MD_LINE_ATXHEADER) {
    let tmp = line.end;
    while (tmp > line.beg && ISBLANK_(text[tmp - 1] as number)) tmp--;
    while (tmp > line.beg && text[tmp - 1] === 35) tmp--;
    if (
      tmp === line.beg ||
      ISBLANK_(text[tmp - 1] as number) ||
      ctx.parser.flags & MD_FLAG_PERMISSIVEATXHEADERS
    )
      line.end = tmp;
  }
  if (
    line.type !== L.MD_LINE_INDENTEDCODE &&
    line.type !== L.MD_LINE_FENCEDCODE &&
    line.type !== L.MD_LINE_HTML
  )
    while (line.end > line.beg && ISBLANK_(text[line.end - 1] as number)) line.end--;
  if (off < ctx.size && text[off] === 13) off++;
  if (off < ctx.size && text[off] === 10) off++;
  if (previousLoose && line.type !== L.MD_LINE_BLANK && parents + brothers > 0) {
    const c = ctx.containers[parents + brothers - 1] as typeof container;
    if (c.ch !== 62) {
      const block = new MD_BLOCK(ctx.block_bytes, c.block_byte_off);
      block.flags |= MD_BLOCK_LOOSE_LIST;
    }
  }
  if (children === 0 && parents + brothers < ctx.n_containers)
    md_leave_child_containers(ctx, parents + brothers);
  if (brothers > 0) {
    const c = ctx.containers[parents] as typeof container;
    md_push_container_bytes(
      ctx,
      B.MD_BLOCK_LI,
      c.task_mark_off,
      c.is_task ? (text[c.task_mark_off] as number) : 0,
      CLOSE,
    );
    md_push_container_bytes(
      ctx,
      B.MD_BLOCK_LI,
      container.task_mark_off,
      container.is_task ? (text[container.task_mark_off] as number) : 0,
      OPEN,
    );
    c.is_task = container.is_task;
    c.task_mark_off = container.task_mark_off;
  }
  if (children > 0) md_enter_child_containers(ctx, children);
  return off;
}
/** Applies the source line-to-block state machine and returns the next pivot identity. @param ctx - Original context. @param pivot - Current pivot. @param line - Analyzed line. @returns Next pivot. */
export function md_process_line(
  ctx: MD_BLOCK_CONTEXT,
  pivot: MD_LINE_ANALYSIS,
  line: MD_LINE_ANALYSIS,
): MD_LINE_ANALYSIS {
  if (line.type === L.MD_LINE_BLANK) {
    md_end_current_block(ctx);
    return DUMMY;
  }
  if (line.enforce_new_block) md_end_current_block(ctx);
  if (line.type === L.MD_LINE_HR || line.type === L.MD_LINE_ATXHEADER) {
    md_end_current_block(ctx);
    md_start_new_block(ctx, line);
    md_add_line_into_current_block(ctx, line);
    md_end_current_block(ctx);
    return DUMMY;
  }
  if (line.type === L.MD_LINE_SETEXTUNDERLINE) {
    const block = ctx.current_block as MD_BLOCK;
    block.type = B.MD_BLOCK_H;
    block.data = line.data;
    block.flags |= MD_BLOCK_SETEXT_HEADER;
    md_add_line_into_current_block(ctx, line);
    md_end_current_block(ctx);
    if (ctx.current_block === undefined) return DUMMY;
    line.type = L.MD_LINE_TEXT;
    return line;
  }
  if (line.type === L.MD_LINE_TABLEUNDERLINE) {
    const block = ctx.current_block as MD_BLOCK;
    block.type = B.MD_BLOCK_TABLE;
    block.data = line.data;
    pivot.type = L.MD_LINE_TABLE;
    md_add_line_into_current_block(ctx, line);
    return pivot;
  }
  if (line.type !== pivot.type) md_end_current_block(ctx);
  if (ctx.current_block === undefined) {
    md_start_new_block(ctx, line);
    pivot = line;
  }
  md_add_line_into_current_block(ctx, line);
  return pivot;
}
