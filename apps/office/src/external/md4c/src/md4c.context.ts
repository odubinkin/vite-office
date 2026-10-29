/** @fileoverview md4c.c complete UTF-8 parser context and source callback-abort propagation. See ../LICENSE. */
import {
  type MD_PARSER,
  type MD_BLOCK_DETAIL,
  type MD_SPAN_DETAIL,
  MD_BLOCKTYPE,
  MD_SPANTYPE,
  MD_TEXTTYPE,
} from "./md4c.h";
import type { MD_MARK_CONTEXT } from "./md4c.mark";
/** Actual context extends the same block/mark state with the original callbacks and user pointer. */
export interface MD_CTX<T = unknown> extends MD_MARK_CONTEXT {
  readonly parser: MD_PARSER<T>;
  readonly userdata: T;
  readonly doc_ends_with_newline: boolean;
}
/** Private non-local exit carries only the source callback's numeric result. */
export class MD_CALLBACK_ABORT extends Error {
  /** Retains the callback result for md_parse's public return contract. @param code - Original nonzero result. @returns Abort token. */
  public constructor(public readonly code: number) {
    super("md4c callback aborted");
  }
}
/** Applies the original logging/abort rule after a callback. @param ctx - Context. @param code - Callback result. @param kind - Native callback name. @returns Nothing. */
function check<T>(ctx: MD_CTX<T>, code: number, kind: string): void {
  if (code !== 0) {
    ctx.parser.debug_log?.(`Aborted from ${kind}() callback.`, ctx.userdata);
    throw new MD_CALLBACK_ABORT(code);
  }
}
/** Emits the native block enter/leave callback. @param ctx - Context. @param enter - Entry flag. @param type - Kind. @param detail - Native detail. @returns Nothing. */
export function md_emit_block<T>(
  ctx: MD_CTX<T>,
  enter: boolean,
  type: MD_BLOCKTYPE,
  detail: MD_BLOCK_DETAIL | undefined,
): void {
  check(
    ctx,
    (enter ? ctx.parser.enter_block : ctx.parser.leave_block)(type, detail, ctx.userdata),
    enter ? "enter_block" : "leave_block",
  );
}
/** Emits the native span enter/leave callback. @param ctx - Context. @param enter - Entry flag. @param type - Kind. @param detail - Native detail. @returns Nothing. */
export function md_emit_span<T>(
  ctx: MD_CTX<T>,
  enter: boolean,
  type: MD_SPANTYPE,
  detail: MD_SPAN_DETAIL | undefined,
): void {
  check(
    ctx,
    (enter ? ctx.parser.enter_span : ctx.parser.leave_span)(type, detail, ctx.userdata),
    enter ? "enter_span" : "leave_span",
  );
}
/** Emits only positive-size text callbacks as the source macro does. @param ctx - Context. @param type - Kind. @param text - Exact byte slice. @returns Nothing. */
export function md_emit_text<T>(ctx: MD_CTX<T>, type: MD_TEXTTYPE, text: Uint8Array): void {
  /* istanbul ignore else -- B8TCAE-M14: original callers supply positive guarded spans or nonempty SPACE/LF/NUL constants. */
  if (text.length > 0) check(ctx, ctx.parser.text(type, text, text.length, ctx.userdata), "text");
}
/** Preserves the source NULL callback and following chunk progression verbatim. @param ctx - Context. @param type - Original text kind. @param text - Verbatim bytes. @returns Nothing. */
export function md_text_with_null_replacement<T>(
  ctx: MD_CTX<T>,
  type: MD_TEXTTYPE,
  text: Uint8Array,
): void {
  let offset = 0,
    source = text;
  while (true) {
    while (offset < source.length && source[offset] !== 0) offset++;
    if (offset > 0) {
      md_emit_text(ctx, type, source.subarray(0, offset));
      source = source.subarray(offset);
      offset = 0;
    }
    if (offset >= source.length) return;
    md_emit_text(ctx, MD_TEXTTYPE.MD_TEXT_NULLCHAR, new Uint8Array([0]));
    offset++;
  }
}
