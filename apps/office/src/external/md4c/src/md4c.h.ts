/** @fileoverview md4c 0.5.3 public callback types and literal flags from md4c.h. See ../LICENSE. */
export enum MD_BLOCKTYPE {
  MD_BLOCK_DOC = 0,

  MD_BLOCK_QUOTE,

  MD_BLOCK_UL,

  MD_BLOCK_OL,

  MD_BLOCK_LI,

  MD_BLOCK_HR,

  MD_BLOCK_H,

  MD_BLOCK_CODE,

  MD_BLOCK_HTML,

  MD_BLOCK_P,

  MD_BLOCK_TABLE,
  MD_BLOCK_THEAD,
  MD_BLOCK_TBODY,
  MD_BLOCK_TR,
  MD_BLOCK_TH,
  MD_BLOCK_TD,
}
/** Pinned native inline span discriminants. */
export enum MD_SPANTYPE {
  MD_SPAN_EM,

  MD_SPAN_STRONG,

  MD_SPAN_A,

  MD_SPAN_IMG,

  MD_SPAN_CODE,

  MD_SPAN_DEL,

  MD_SPAN_LATEXMATH,
  MD_SPAN_LATEXMATH_DISPLAY,

  MD_SPAN_WIKILINK,

  MD_SPAN_U,
}
/** Pinned native text callback discriminants. */
export enum MD_TEXTTYPE {
  MD_TEXT_NORMAL = 0,

  MD_TEXT_NULLCHAR,

  MD_TEXT_BR,
  MD_TEXT_SOFTBR,

  MD_TEXT_ENTITY,

  MD_TEXT_CODE,

  MD_TEXT_HTML,

  MD_TEXT_LATEXMATH,
}
/** Pinned native table alignment discriminants. */
export enum MD_ALIGN {
  MD_ALIGN_DEFAULT = 0,
  MD_ALIGN_LEFT,
  MD_ALIGN_CENTER,
  MD_ALIGN_RIGHT,
}
/** Pinned md4c flag value. */
export const MD_FLAG_COLLAPSEWHITESPACE = 0x0001;
/** Pinned md4c flag value. */
export const MD_FLAG_PERMISSIVEATXHEADERS = 0x0002;
/** Pinned md4c flag value. */
export const MD_FLAG_PERMISSIVEURLAUTOLINKS = 0x0004;
/** Pinned md4c flag value. */
export const MD_FLAG_PERMISSIVEEMAILAUTOLINKS = 0x0008;
/** Pinned md4c flag value. */
export const MD_FLAG_NOINDENTEDCODEBLOCKS = 0x0010;
/** Pinned md4c flag value. */
export const MD_FLAG_NOHTMLBLOCKS = 0x0020;
/** Pinned md4c flag value. */
export const MD_FLAG_NOHTMLSPANS = 0x0040;
/** Pinned md4c flag value. */
export const MD_FLAG_TABLES = 0x0100;
/** Pinned md4c flag value. */
export const MD_FLAG_STRIKETHROUGH = 0x0200;
/** Pinned md4c flag value. */
export const MD_FLAG_PERMISSIVEWWWAUTOLINKS = 0x0400;
/** Pinned md4c flag value. */
export const MD_FLAG_TASKLISTS = 0x0800;
/** Pinned md4c flag value. */
export const MD_FLAG_LATEXMATHSPANS = 0x1000;
/** Pinned md4c flag value. */
export const MD_FLAG_WIKILINKS = 0x2000;
/** Pinned md4c flag value. */
export const MD_FLAG_UNDERLINE = 0x4000;
/** Pinned md4c flag value. */
export const MD_FLAG_HARD_SOFT_BREAKS = 0x8000;
/** Pinned md4c flag value. */
export const MD_FLAG_PERMISSIVEAUTOLINKS =
  MD_FLAG_PERMISSIVEEMAILAUTOLINKS |
  MD_FLAG_PERMISSIVEURLAUTOLINKS |
  MD_FLAG_PERMISSIVEWWWAUTOLINKS;
/** Pinned md4c flag value. */
export const MD_FLAG_NOHTML = MD_FLAG_NOHTMLBLOCKS | MD_FLAG_NOHTMLSPANS;
/** Pinned md4c flag value. */
export const MD_DIALECT_COMMONMARK = 0;
/** Pinned md4c flag value. */
export const MD_DIALECT_GITHUB =
  MD_FLAG_PERMISSIVEAUTOLINKS | MD_FLAG_TABLES | MD_FLAG_STRIKETHROUGH | MD_FLAG_TASKLISTS;

/** Native non-zero callback result stops parsing. */
export interface MD_PARSER<T = unknown> {
  readonly abi_version: number;
  readonly flags: number;
  readonly enter_block: (
    type: MD_BLOCKTYPE,
    detail: MD_BLOCK_DETAIL | undefined,
    userdata: T,
  ) => number;
  readonly leave_block: (
    type: MD_BLOCKTYPE,
    detail: MD_BLOCK_DETAIL | undefined,
    userdata: T,
  ) => number;
  readonly enter_span: (
    type: MD_SPANTYPE,
    detail: MD_SPAN_DETAIL | undefined,
    userdata: T,
  ) => number;
  readonly leave_span: (
    type: MD_SPANTYPE,
    detail: MD_SPAN_DETAIL | undefined,
    userdata: T,
  ) => number;
  readonly text: (type: MD_TEXTTYPE, text: Uint8Array, size: number, userdata: T) => number;
  readonly debug_log?: (message: string, userdata: T) => void;
  readonly syntax?: undefined;
}
/** Native attribute text and substring offsets are UTF-8 bytes, not JS UTF-16 offsets. */
export interface MD_ATTRIBUTE {
  readonly text: Uint8Array;
  readonly size: number;
  readonly substr_types: readonly MD_TEXTTYPE[];
  readonly substr_offsets: readonly number[];
}
/** Native unordered-list callback detail. */
export interface MD_BLOCK_UL_DETAIL {
  readonly is_tight: number;
  readonly mark: number;
}
/** Native ordered-list callback detail. */
export interface MD_BLOCK_OL_DETAIL {
  readonly start: number;
  readonly is_tight: number;
  readonly mark_delimiter: number;
}
/** Native task item callback detail. */
export interface MD_BLOCK_LI_DETAIL {
  readonly is_task: number;
  readonly task_mark: number;
  readonly task_mark_offset: number;
}
/** Native heading callback detail. */
export interface MD_BLOCK_H_DETAIL {
  readonly level: number;
}
/** Native fenced/indented-code callback detail. */
export interface MD_BLOCK_CODE_DETAIL {
  readonly info: MD_ATTRIBUTE;
  readonly lang: MD_ATTRIBUTE;
  readonly fence_char: number;
}
/** Native table callback detail. */
export interface MD_BLOCK_TABLE_DETAIL {
  readonly col_count: number;
  readonly head_row_count: number;
  readonly body_row_count: number;
}
/** Native cell callback detail. */
export interface MD_BLOCK_TD_DETAIL {
  readonly align: MD_ALIGN;
}
/** Native hyperlink callback detail. */
export interface MD_SPAN_A_DETAIL {
  readonly href: MD_ATTRIBUTE;
  readonly title: MD_ATTRIBUTE;
  readonly is_autolink: number;
}
/** Native image callback detail. */
export interface MD_SPAN_IMG_DETAIL {
  readonly src: MD_ATTRIBUTE;
  readonly title: MD_ATTRIBUTE;
}
/** Native wikilink callback detail. */
export interface MD_SPAN_WIKILINK_DETAIL {
  readonly target: MD_ATTRIBUTE;
}
/** Native callback detail variants. */
export type MD_BLOCK_DETAIL =
  | MD_BLOCK_UL_DETAIL
  | MD_BLOCK_OL_DETAIL
  | MD_BLOCK_LI_DETAIL
  | MD_BLOCK_H_DETAIL
  | MD_BLOCK_CODE_DETAIL
  | MD_BLOCK_TABLE_DETAIL
  | MD_BLOCK_TD_DETAIL;
/** Native callback detail variants. */
export type MD_SPAN_DETAIL = MD_SPAN_A_DETAIL | MD_SPAN_IMG_DETAIL | MD_SPAN_WIKILINK_DETAIL;
