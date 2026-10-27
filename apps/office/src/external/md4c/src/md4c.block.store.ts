/** @fileoverview md4c.c block queue records and line-analysis context. The native word queue uses JS storage, not a C heap emulator. See ../LICENSE. */
import { MD_BLOCKTYPE } from "./md4c.h";
import type { MD_BLOCK_SCAN_CONTEXT, MD_CONTAINER } from "./md4c.block.scan";
import type { MD_REF_CONTEXT } from "./md4c.ref";
import type { MD_LINE } from "./md4c.scan";
/** Native container event flags. */
export const MD_BLOCK_CONTAINER_OPENER = 1,
  MD_BLOCK_CONTAINER_CLOSER = 2,
  MD_BLOCK_CONTAINER = 3,
  MD_BLOCK_LOOSE_LIST = 4,
  MD_BLOCK_SETEXT_HEADER = 8;
/** Native line classifications. */
export enum MD_LINETYPE {
  MD_LINE_BLANK,
  MD_LINE_HR,
  MD_LINE_ATXHEADER,
  MD_LINE_SETEXTHEADER,
  MD_LINE_SETEXTUNDERLINE,
  MD_LINE_INDENTEDCODE,
  MD_LINE_FENCEDCODE,
  MD_LINE_HTML,
  MD_LINE_TEXT,
  MD_LINE_TABLE,
  MD_LINE_TABLEUNDERLINE,
}
/** Mutable native line analysis, including the reused pivot buffer. */
export interface MD_LINE_ANALYSIS {
  type: MD_LINETYPE;
  data: number;
  enforce_new_block: boolean;
  beg: number;
  end: number;
  indent: number;
}
/** Native verbatim line has an additional indentation field. */
export interface MD_VERBATIMLINE extends MD_LINE {
  readonly indent: number;
}
/** Actual container record additionally retains native block and task offsets. */
export interface MD_BLOCK_CONTAINER_STATE extends MD_CONTAINER {
  block_byte_off: number;
  task_mark_off: number;
}
/** Original MD_CTX fields used by line analysis and block construction. */
export interface MD_BLOCK_CONTEXT extends MD_BLOCK_SCAN_CONTEXT, MD_REF_CONTEXT {
  readonly block_bytes: number[];
  current_block: MD_BLOCK | undefined;
  readonly containers: MD_BLOCK_CONTAINER_STATE[];
  n_containers: number;
  last_line_has_list_loosening_effect: boolean;
  last_list_item_starts_with_two_blank_lines: boolean;
}
/** Native compact block header. Offsets are retained in bytes, while JS owns the queue's words. */
export class MD_BLOCK {
  /** Binds an original block header without allocating another parser owner. @param words - Context queue. @param offset - Native byte offset. @returns Header view. */
  public constructor(
    private readonly words: number[],
    public readonly offset: number,
  ) {}
  /** Reads the native 8-bit type field. @returns Block kind. */
  public get type(): MD_BLOCKTYPE {
    return ((this.words[this.offset / 4] as number) & 255) as MD_BLOCKTYPE;
  }
  /** Assigns the native 8-bit type field. @param value - Block kind.  @returns Nothing. */
  public set type(value: MD_BLOCKTYPE) {
    const index = this.offset / 4;
    this.words[index] = (((this.words[index] as number) & 0xffffff00) | (value & 255)) >>> 0;
  }
  /** Reads the native 8-bit flags. @returns Flags. */
  public get flags(): number {
    return ((this.words[this.offset / 4] as number) >>> 8) & 255;
  }
  /** Assigns the native 8-bit flags. @param value - Flags.  @returns Nothing. */
  public set flags(value: number) {
    const index = this.offset / 4;
    this.words[index] = (((this.words[index] as number) & 0xffff00ff) | ((value & 255) << 8)) >>> 0;
  }
  /** Reads the native 16-bit data field. @returns Data. */
  public get data(): number {
    return (this.words[this.offset / 4] as number) >>> 16;
  }
  /** Assigns the native 16-bit data field. @param value - Data.  @returns Nothing. */
  public set data(value: number) {
    const index = this.offset / 4;
    this.words[index] = (((this.words[index] as number) & 0xffff) | ((value & 65535) << 16)) >>> 0;
  }
  /** Reads the native line-count/start/task-offset union value. @returns Value. */
  public get n_lines(): number {
    return this.words[this.offset / 4 + 1] as number;
  }
  /** Assigns the native unsigned union value. @param value - Value.  @returns Nothing. */
  public set n_lines(value: number) {
    this.words[this.offset / 4 + 1] = value >>> 0;
  }
  /** Reads source normal or verbatim line records following the header. @returns Ordered native lines. */
  public lines(): readonly MD_VERBATIMLINE[] {
    const stride =
      this.type === MD_BLOCKTYPE.MD_BLOCK_CODE || this.type === MD_BLOCKTYPE.MD_BLOCK_HTML ? 3 : 2;
    const result: MD_VERBATIMLINE[] = [];
    for (let index = 0; index < this.n_lines; index++) {
      const off = this.offset / 4 + 2 + index * stride;
      result.push({
        beg: this.words[off] as number,
        end: this.words[off + 1] as number,
        indent: stride === 3 ? (this.words[off + 2] as number) : 0,
      });
    }
    return result;
  }
}
/** Native shared dummy pivot. Its identity is significant in line processing. */
export const md_dummy_blank_line: MD_LINE_ANALYSIS = {
  type: MD_LINETYPE.MD_LINE_BLANK,
  data: 0,
  enforce_new_block: false,
  beg: 0,
  end: 0,
  indent: 0,
};
/** Constructs a reusable line-analysis buffer with defined unused fields. @returns Buffer. */
export function md_line_buffer(): MD_LINE_ANALYSIS {
  return { ...md_dummy_blank_line };
}
/** Constructs a zero-initialized native candidate container. @returns Container. */
export function md_container_buffer(): MD_BLOCK_CONTAINER_STATE {
  return {
    ch: 0,
    is_loose: false,
    is_task: false,
    start: 0,
    mark_indent: 0,
    contents_indent: 0,
    block_byte_off: 0,
    task_mark_off: 0,
  };
}
