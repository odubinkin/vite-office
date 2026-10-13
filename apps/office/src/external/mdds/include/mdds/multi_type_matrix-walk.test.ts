/** @fileoverview Whole ordinary original matrix walk, section and callable lifetime streams. */
import { expect, it } from "vitest";
import fixture from "./native-matrix-walk-cases.json";
import {
  multi_type_matrix as M,
  std_string_traits as T,
  size_pair_type as P,
  element_t as E,
  element_block_node_type as N,
  type WalkCallableOperations,
} from "./multi_type_matrix.ts";
import {
  double_element_callbacks as D,
  boolean_element_callbacks as B,
  string_element_callbacks as S,
  int32_element_callbacks as I,
  int8_element_callbacks as A,
  double_element_block as DB,
  boolean_element_block as BB,
  string_element_block as SB,
  int32_element_block as IB,
} from "./multi_type_vector/standard_element_blocks.ts";
import { type_error, size_error, general_error } from "./global.ts";
it("matches whole original four walks and callable lifetimes", /** Replays ordinary original initialized inputs. @returns Nothing. */ () => {
  const lines = ["scalar"];
  /** Original native callable fields. */
  type F = { count: number; fail: number };
  /** Original caller construction. @param fail - Throw on call. @returns Caller. */
  function make(fail = 0): F {
    lines.push(`construct ${fail}`);
    return { count: 0, fail };
  }
  /** Native destruction. @param f - Live callable. @returns Nothing. */
  function destroy(f: F): void {
    lines.push(`destroy ${f.count}`);
  }
  /** Records borrowed section values. @param n - Original section. @returns Record. */
  function node(n: N): string {
    let out = `${n.type} ${n.offset} ${n.size} ${Number(n.data !== null)}`;
    if (n.type === E.element_numeric)
      for (const i = n.begin(DB), end = n.end(DB); !i.equals(end); i.advance(1))
        out += ` ${i.get()}`;
    else if (n.type === E.element_boolean)
      for (const i = n.begin(BB), end = n.end(BB); !i.equals(end); i.advance(1))
        out += ` ${Number(i.get())}`;
    else if (n.type === E.element_string)
      for (const i = n.begin(SB), end = n.end(SB); !i.equals(end); i.advance(1))
        out += ` ${i.get()}`;
    else if (n.type === E.element_integer)
      for (const i = n.begin(IB), end = n.end(IB); !i.equals(end); i.advance(1))
        out += ` ${i.get()}`;
    return out;
  }
  const ops: WalkCallableOperations<F> = {
    argument_is_rvalue: false,
    /** Native copy. @param f - Source. @returns Copy. */
    copy_construct(f) {
      lines.push(`copy ${f.count}`);
      return { ...f };
    },
    /** Native move. @param f - Source. @returns Moved value. */
    move_construct(f) {
      const result = { ...f };
      f.count = -1;
      lines.push(`move ${result.count}`);
      return result;
    },
    destroy,
    /** Native unary/binary call. @param f - Parameter. @param a - Left. @param b - Right. @returns Nothing. */
    invoke(f, a, b) {
      ++f.count;
      lines.push(`${b ? "pair" : "call"} ${f.count} | ${node(a)}${b ? " | " + node(b) : ""}`);
      if (f.fail === f.count) throw Error("callback failure");
    },
  };
  /** Typed mixed input population. @param m - Matrix. @param seed - Pattern. @returns Nothing. */
  function populate(m: M<string>, seed: number): void {
    const z = m.size();
    for (let c = 0; c < z.column; ++c)
      for (let r = 0; r < z.row; ++r) {
        const k = (r + z.row * c + seed) % 5;
        if (k === 1) m.set(r, c, 1.5, D);
        else if (k === 2) m.set(r, c, true, B);
        else if (k === 3) m.set(r, c, "x", S);
        else if (k === 4) m.set(r, c, 7, I);
      }
  }
  for (let r = 0; r <= 3; ++r)
    for (let c = 0; c <= 3; ++c) {
      const a = new M(T, r, c),
        b = new M(T, r, c);
      populate(a, 0);
      populate(b, 2);
      lines.push(`case ${r} ${c}`);
      const input = make();
      let result = a.walk(input, ops);
      lines.push(`whole ${input.count} ${result.count}`);
      destroy(result);
      result = a.walk(input, ops, b);
      lines.push(`parallel ${input.count} ${result.count}`);
      destroy(result);
      if (r && c)
        for (let sr = 0; sr < r; ++sr)
          for (let sc = 0; sc < c; ++sc)
            for (let er = sr; er < r; ++er)
              for (let ec = sc; ec < c; ++ec) {
                lines.push(`range ${sr} ${sc} ${er} ${ec}`);
                result = a.walk(input, ops, new P(sr, sc), new P(er, ec));
                lines.push(`ranged ${input.count} ${result.count}`);
                destroy(result);
                result = a.walk(input, ops, b, new P(sr, sc), new P(er, ec));
                lines.push(`paired ${input.count} ${result.count}`);
                destroy(result);
              }
      destroy(input);
      b.dispose();
      a.dispose();
    }
  const a = new M(T, 3, 3),
    b = new M(T, 4, 4),
    small = new M(T, 1, 1);
  populate(a, 0);
  populate(b, 1);
  const input = make();
  let result = a.walk(input, { ...ops, argument_is_rvalue: true });
  lines.push(`rvalue ${input.count} ${result.count}`);
  destroy(result);
  const clean = make();
  result = a.walk(clean, ops, b, new P(1, 1), new P(2, 2));
  lines.push(`different ${clean.count} ${result.count}`);
  destroy(result);
  destroy(clean);
  for (let mode = 0; mode < 4; ++mode) {
    lines.push(`error ${mode}`);
    const f = make();
    try {
      if (mode === 0) a.walk(f, ops, new P(2, 2), new P(1, 1));
      else if (mode === 1) a.walk(f, ops, new P(0, 0), new P(4, 0));
      else if (mode === 2) a.walk(f, ops, b);
      else a.walk(f, ops, small, new P(0, 0), new P(2, 0));
    } catch (e) {
      expect(e).toBeInstanceOf(size_error);
      lines.push(`caught ${(e as general_error).what()}`);
    }
    destroy(f);
  }
  for (let mode = 0; mode < 4; ++mode) {
    lines.push(`throw ${mode}`);
    const f = make(2);
    try {
      if (mode === 0) a.walk(f, ops);
      else if (mode === 1) a.walk(f, ops, new P(0, 0), new P(2, 2));
      else if (mode === 2) a.walk(f, ops, a);
      else a.walk(f, ops, a, new P(0, 0), new P(2, 2));
    } catch (e) {
      expect(e).toBeInstanceOf(Error);
      lines.push(`caught ${(e as Error).message} ${f.count}`);
    }
    destroy(f);
  }
  const bad = new M(T, 2, 2, A, 7),
    f = make();
  try {
    bad.walk(f, ops);
  } catch (e) {
    expect(e).toBeInstanceOf(type_error);
    lines.push(`bad ${(e as general_error).what()}`);
  }
  const spill = new M(T, 2, 2, D, 1.5),
    g = make();
  result = spill.walk(g, ops, new P(0, 0), new P(2, 0));
  lines.push(`spill ${result.count}`);
  destroy(result);
  destroy(g);
  destroy(f);
  destroy(input);
  spill.dispose();
  bad.dispose();
  small.dispose();
  b.dispose();
  a.dispose();
  expect(lines.join("\n") + "\n").toBe(fixture.captures.scalar);
});
