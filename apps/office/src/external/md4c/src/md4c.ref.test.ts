/** @fileoverview Compiled md4c 0.5.3 reference definitions, duplicate selection and cumulative output budget. */
import { expect, it } from "vitest";
import fixture from "./native-primitives.json";
import {
  type MD_REF_CONTEXT,
  md_is_link_reference_definition,
  md_build_ref_def_hashtable,
  md_lookup_ref_def,
  md_is_link_reference,
  md_is_inline_link_spec,
} from "./md4c.ref";
const encoder = new TextEncoder();
/** Builds native content bounds for these unindented fixtures. @param text - UTF-8 input. @returns Line bounds. */
function linesFor(text: Uint8Array): { beg: number; end: number }[] {
  const lines: { beg: number; end: number }[] = [];
  let start = 0;
  for (let off = 0; off < text.length; off++)
    if (text[off] === 10) {
      lines.push({ beg: start, end: off });
      start = off + 1;
    }
  lines.push({ beg: start, end: text.length });
  return lines;
}
/** Creates the actual reference-context field view. @param text - Source. @param budget - Native cumulative output limit. @returns Native mutable context. */
function context(text: Uint8Array, budget: number): MD_REF_CONTEXT {
  return {
    text,
    size: text.length,
    ref_defs: [],
    ref_def_hashtable: [],
    max_ref_def_output: budget,
    html_comment_horizon: 0,
    html_proc_instr_horizon: 0,
    html_decl_horizon: 0,
    html_cdata_horizon: 0,
  };
}
it.each(fixture.referenceCases)(
  "matches compiled reference state, lookup and budget: $text",
  /** Verifies matches compiled reference state, lookup and budget: $text. @param value0 - text, budget, result value. @returns Nothing. */ ({
    text,
    budget,
    result,
  }) => {
    const input = encoder.encode(text),
      lines = linesFor(input),
      ctx = context(input, budget);
    let consumed = 0;
    while (consumed < lines.length) {
      const count = md_is_link_reference_definition(ctx, lines.slice(consumed));
      if (!count) break;
      consumed += count;
    }
    md_build_ref_def_hashtable(ctx);
    const definitions = ctx.ref_defs.map(
      /** Verifies matches compiled reference state, lookup and budget: $text. @param def - def value. @returns Callback result. */ (
        def,
      ) => [def.dest_beg, def.dest_end, [...def.label], [...def.title]],
    );
    const lookups = ["x", "X", "strasse", "a b", "key0", "KEY0", "key9", "missing"].map(
      /** Verifies matches compiled reference state, lookup and budget: $text. @param query - query value. @returns Callback result. */ (
        query,
      ) => md_lookup_ref_def(ctx, encoder.encode(query))?.dest_beg ?? -1,
    );
    const references: number[][] = [];
    const last = lines[lines.length - 1];
    if (last === undefined) throw new Error("Missing fixture line.");
    for (let index = 0; index < 2; index++) {
      const attr = md_is_link_reference(ctx, lines, last.beg, last.end);
      references.push([Number(attr !== undefined), ctx.max_ref_def_output]);
    }
    expect([consumed, ctx.ref_defs.length, definitions, lookups, references]).toEqual(result);
  },
);
it.each([
  ["()", "", ""],
  ["(  )", "", ""],
  ["(<a b> 'title')", "a b", "title"],
  ['(a(b)c\n"title")', "a(b)c", "title"],
  ['(dest "line\nnext")', "dest", "line\nnext"],
])(
  "retains source inline destination and title byte ranges: %s",
  /** Verifies retains source inline destination and title byte ranges: %s. @param source - source value. @param destination - destination value. @param title - title value. @returns Nothing. */ (
    source,
    destination,
    title,
  ) => {
    const text = encoder.encode(source);
    const value = md_is_inline_link_spec(context(text, 1000), linesFor(text), 0);
    expect(value).toBeDefined();
    expect(
      new TextDecoder().decode(text.subarray(value?.attr.dest_beg, value?.attr.dest_end)),
    ).toBe(destination);
    expect(new TextDecoder().decode(value?.attr.title)).toBe(title);
    expect(value?.end).toBe(text.length);
  },
);
