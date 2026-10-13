/** @fileoverview Whole original matrix geometry, section-copy, validation and partial-exception observations. */
import { expect, it } from "vitest";
import fixture from "./native-matrix-geometry-cases.json";
import {
  multi_type_matrix as M,
  std_string_traits as T,
  element_t,
  element_block_node_type as Node,
} from "./multi_type_matrix.ts";
import {
  double_element_callbacks as D,
  boolean_element_callbacks as B,
  string_element_callbacks as S,
  int32_element_callbacks as I,
  int8_element_callbacks as A,
  double_element_block as DB,
  int32_element_block as IB,
  int8_element_block as AB,
} from "./multi_type_vector/standard_element_blocks.ts";
import { general_error, size_error, type_error } from "./global.ts";
it("matches whole original matrix copy resize transpose and section stream", /** Replays the complete ordinary original caller, preserving valid ownership and exact input types. @returns Nothing. */ () => {
  const lines = ["scalar"];
  /** Records actual original column-major geometry/value state. @param label - Stage. @param m - Matrix. @returns Nothing. */
  function state(label: string, m: M<string>): void {
    const sz = m.size();
    let line = `${label} ${sz.row} ${sz.column} ${Number(m.empty())} ${Number(m.numeric())}`;
    for (let c = 0; c < sz.column; ++c)
      for (let r = 0; r < sz.row; ++r) {
        const p = m.position(r, c),
          q = m.matrix_position(p),
          t = m.get_type(p);
        line += ` | ${q.row} ${q.column} ${t} ${m.get_numeric(p)} ${m.get_integer(p)} ${Number(m.get_boolean(p))}`;
        if (t === element_t.element_string) line += ` ${m.get_string(p)}`;
      }
    lines.push(line);
  }
  /** Original deterministic mixed matrix input. @param m - Owner. @param seed - Pattern offset. @returns Nothing. */
  function populate(m: M<string>, seed: number): void {
    const sz = m.size();
    for (let c = 0; c < sz.column; ++c)
      for (let r = 0; r < sz.row; ++r) {
        const k = (r + sz.row * c + seed) % 4;
        if (k === 1) m.set(r, c, 1.5, D);
        else if (k === 2) m.set(r, c, true, B);
        else if (k === 3) m.set(r, c, "x", S);
      }
  }
  for (let sr = 0; sr <= 3; ++sr)
    for (let sc = 0; sc <= 3; ++sc)
      for (let dr = 0; dr <= 3; ++dr)
        for (let dc = 0; dc <= 3; ++dc) {
          const src = new M(T, sr, sc);
          populate(src, 0);
          const dst = new M(T, dr, dc, D, 8.5);
          lines.push(`copycase ${sr} ${sc} ${dr} ${dc}`);
          dst.copy(src);
          state("copied", dst);
          dst.copy(dst);
          state("selfcopy", dst);
          dst.dispose();
          src.dispose();
        }
  for (let r = 0; r <= 3; ++r)
    for (let c = 0; c <= 3; ++c) {
      const m = new M(T, r, c);
      populate(m, 1);
      const result = m.transpose();
      lines.push(`transcase ${r} ${c} ${Number(result === m)}`);
      state("transposed", m);
      m.transpose();
      state("back", m);
      for (let nr = 0; nr <= 3; ++nr)
        for (let nc = 0; nc <= 3; ++nc) {
          const x = new M(T, m);
          x.resize(nr, nc);
          lines.push(`resizecase ${nr} ${nc}`);
          state("resized", x);
          const y = new M(T, m);
          y.resize(nr, nc, D, 9.5);
          state("filledresize", y);
          y.dispose();
          x.dispose();
        }
      m.dispose();
    }
  const values = DB.create_block_with_value(6, 0);
  for (let i = 0; i < 6; ++i)
    DB.begin(values)
      .advance(i)
      .set(i + 1);
  const first = DB.begin(values),
    last = DB.end(values),
    ranged = new M(T, 3, 3, D, 8.5);
  ranged.copy_range(2, 2, first, first.copy().advance(4), D);
  state("range", ranged);
  ranged.copy_range(9, 9, first, first, D);
  state("rangezero", ranged);
  const empty = new M(T);
  empty.copy_range(9, 9, first, last, D);
  state("emptyrange", empty);
  try {
    ranged.copy_range(2, 2, first, first.copy().advance(3), D);
  } catch (e) {
    expect(e).toBeInstanceOf(size_error);
    lines.push(`lengtherror ${(e as general_error).what()}`);
  }
  try {
    ranged.copy_range(1, 6, first, last, D);
  } catch (e) {
    expect(e).toBeInstanceOf(size_error);
    lines.push(`colerror ${(e as general_error).what()}`);
  }
  try {
    ranged.copy_range(6, 1, first, last, D);
  } catch (e) {
    expect(e).toBeInstanceOf(size_error);
    lines.push(`rowerror ${(e as general_error).what()}`);
  }
  const bad = AB.create_block_with_value(4, 1);
  try {
    ranged.copy_range(2, 2, AB.begin(bad), AB.end(bad), A);
  } catch (e) {
    expect(e).toBeInstanceOf(type_error);
    lines.push(`typeerror ${(e as general_error).what()}`);
  }
  const ints = IB.create_block_with_value(4, 0);
  for (let i = 0; i < 4; ++i)
    IB.begin(ints)
      .advance(i)
      .set(i + 1);
  ranged.copy_range(2, 2, IB.begin(ints), IB.end(ints), I);
  state("integerrange", ranged);
  const integer = new M(T, 2, 2);
  integer.set(0, 0, "x", S);
  integer.set(1, 0, 7, I);
  const target = new M(T, 2, 2, D, 8.5);
  try {
    target.copy(integer);
  } catch (e) {
    expect(e).toBeInstanceOf(general_error);
    lines.push(`integercopyerror ${(e as general_error).what()}`);
  }
  state("partialcopy", target);
  try {
    integer.transpose();
  } catch (e) {
    expect(e).toBeInstanceOf(general_error);
    lines.push(`integertranserror ${(e as general_error).what()}`);
  }
  state("unchangedtrans", integer);
  try {
    integer.resize(3, 3);
  } catch (e) {
    expect(e).toBeInstanceOf(general_error);
    lines.push(`integerresizeerror ${(e as general_error).what()}`);
  }
  state("unchangedresize", integer);
  try {
    integer.resize(3, 3, D, 9.5);
  } catch (e) {
    expect(e).toBeInstanceOf(general_error);
    lines.push(`integerfillerror ${(e as general_error).what()}`);
  }
  state("unchangedfill", integer);
  const node = new Node(M.to_mtm_type.bind(null, T));
  lines.push(`defaultnode ${node.type} ${node.offset} ${node.size} ${Number(node.data === null)}`);
  const block = DB.create_block_with_value(4, 1.5);
  node.type = element_t.element_numeric;
  node.offset = 1;
  node.size = 2;
  node.data = block;
  const copied = new Node(M.to_mtm_type.bind(null, T), node),
    begin = copied.begin(DB),
    end = copied.end(DB);
  lines.push(
    `copiednode ${copied.type} ${copied.offset} ${copied.size} ${Number(copied.data === node.data)} ${begin.distance_to(end)} ${begin.get()}`,
  );
  DB.delete_block(block);
  expect(lines.join("\n") + "\n").toBe(fixture.captures.scalar);
  for (const m of [target, integer, ranged, empty]) m.dispose();
  DB.delete_block(values);
  AB.delete_block(bad);
  IB.delete_block(ints);
});
