/** @fileoverview Whole ordinary pinned upstream matrix core observations, including ownership, geometry and actual vector dispatch. */
import { expect, it } from "vitest";
import fixture from "./native-matrix-cases.json";
import {
  multi_type_matrix as M,
  size_pair_type,
  std_string_traits,
  element_t,
} from "./multi_type_matrix.ts";
import {
  double_element_callbacks as D,
  boolean_element_callbacks as B,
  int32_element_callbacks as I,
  string_element_callbacks as S,
  int8_element_callbacks as A,
  double_element_block,
} from "./multi_type_vector/standard_element_blocks.ts";
import { general_error, type_error, invalid_arg_error } from "./global.ts";
it("matches the whole original scalar matrix storage/access stream", /** Executes the original native caller operations with explicit native overload witnesses. @returns Nothing. */ () => {
  const lines = ["scalar"];
  /** Records original column-major value/type/geometry queries. @param label - Stage. @param m - Matrix. @returns Nothing. */
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
  const zero = new M(std_string_traits);
  state("default", zero);
  for (let rows = 0; rows <= 4; ++rows)
    for (let cols = 0; cols <= 4; ++cols) {
      const m = new M(std_string_traits, rows, cols);
      state("empty", m);
      if (rows * cols) {
        for (let c = 0; c < cols; ++c)
          for (let r = 0; r < rows; ++r) {
            const k = (r + rows * c) % 4;
            if (k === 0) m.set(r, c, 2.5, D);
            else if (k === 1) m.set(r, c, true, B);
            else if (k === 2) m.set(r, c, -9, I);
            else m.set(r, c, "abc", S);
          }
        state("mixed", m);
        for (let c = 0; c < cols; ++c)
          for (let r = 0; r < rows; ++r) {
            const p = m.position(r, c),
              q = m.position(p, r, c),
              next = M.next_position(q);
            lines.push(
              `position ${r} ${c} ${q.second} ${next.second} ${Number(next.first.equals(m.end_position().first))}`,
            );
            m.set(q, 4.5, D);
          }
        state("hinted", m);
        m.set_empty(m.position(rows - 1, cols - 1));
        state("oneempty", m);
        m.set_row_empty(0);
        state("rowempty", m);
        m.set_column_empty(cols - 1);
        state("colempty", m);
        m.set_empty(0, 0, rows * cols);
        state("allempty", m);
        try {
          m.set_empty(0, 0, 0);
        } catch (error) {
          expect(error).toBeInstanceOf(general_error);
          lines.push(`lengtherror ${(error as general_error).what()}`);
        }
      }
      const copied = new M(std_string_traits, m);
      lines.push(`equal ${Number(copied.equals(m))} ${Number(copied.not_equals(m))}`);
      const moved = M.move(copied);
      lines.push(
        `move ${copied.size().row} ${copied.size().column} ${Number(copied.empty())} ${Number(moved.equals(m))}`,
      );
      const assigned = new M(std_string_traits, 1, 2, D, 3);
      assigned.assign(m);
      state("assigned", assigned);
      assigned.assign(assigned);
      state("self", assigned);
      const movedAssigned = new M(std_string_traits);
      movedAssigned.assign_move(assigned);
      state("moveassigned", movedAssigned);
      assigned.clear();
      movedAssigned.swap(zero);
      state("swap", zero);
      zero.swap(zero);
      state("selfswap", zero);
      zero.clear();
      state("clear", zero);
      movedAssigned.dispose();
      assigned.dispose();
      moved.dispose();
      copied.dispose();
      m.dispose();
    }
  for (const type of [-1, 0, 1, 2, 5, 10, 11, 52]) {
    try {
      const value = M.to_mtm_type(std_string_traits, type);
      lines.push(`type ${type} ${value}`);
    } catch (error) {
      expect(error).toBeInstanceOf(type_error);
      lines.push(`type ${type} ${(error as type_error).what()}`);
    }
  }
  for (let count = 0; count < 5; ++count) {
    try {
      const p =
        count === 0
          ? new size_pair_type()
          : new size_pair_type(
              Array.from(
                { length: count },
                /** Original initializer-list value sequence. @param value - Unused array value. @param i - Index. @returns Native element. */ (
                  value,
                  i,
                ) => {
                  void value;
                  return i + 1;
                },
              ),
            );
      lines.push(
        `pair ${count} ${p.row} ${p.column} ${Number(p.equals(new size_pair_type(1, 2)))} ${Number(p.not_equals(new size_pair_type(1, 2)))}`,
      );
    } catch (error) {
      expect(error).toBeInstanceOf(invalid_arg_error);
      lines.push(`pairerror ${count} ${(error as invalid_arg_error).what()}`);
    }
  }
  for (let kind = 0; kind < 4; ++kind) {
    const m =
      kind === 0
        ? new M(std_string_traits, 2, 2, D, 2.5)
        : kind === 1
          ? new M(std_string_traits, 2, 2, B, true)
          : kind === 2
            ? new M(std_string_traits, 2, 2, I, -7)
            : new M(std_string_traits, 2, 2, S, "x");
    state("filled", m);
    m.dispose();
  }
  const vs = double_element_block.create_block_with_value(5, 0);
  for (let i = 0; i < 5; ++i)
    double_element_block
      .begin(vs)
      .advance(i)
      .set(i + 1);
  const first = double_element_block.begin(vs),
    last = double_element_block.end(vs),
    ranged = new M(std_string_traits, 2, 2, D, first, first.copy().advance(4));
  state("range", ranged);
  ranged.set_range(1, 0, first, first.copy().advance(3), D);
  state("setrange", ranged);
  ranged.set_range_position(
    ranged.position(0, 0),
    first.copy().advance(1),
    first.copy().advance(3),
    D,
  );
  state("hintrange", ranged);
  ranged.set_column(1, first, last, D);
  state("columnlong", ranged);
  ranged.set_column(0, first, first.copy().advance(1), D);
  state("columnshort", ranged);
  ranged.set_column(0, first, first, D);
  state("columnzero", ranged);
  const unsupported = double_element_block.create_block_with_value(4, 1);
  try {
    new M(
      std_string_traits,
      2,
      2,
      A,
      double_element_block.begin(unsupported),
      double_element_block.end(unsupported),
    );
  } catch (error) {
    expect(error).toBeInstanceOf(type_error);
    lines.push(`rangeerror ${(error as type_error).what()}`);
  }
  const unsupportedScalar = new M(std_string_traits, 1, 1, A, 4);
  try {
    unsupportedScalar.get_numeric(0, 0);
  } catch (error) {
    expect(error).toBeInstanceOf(general_error);
    lines.push(`numericerror ${(error as general_error).what()}`);
  }
  try {
    unsupportedScalar.numeric();
  } catch (error) {
    expect(error).toBeInstanceOf(general_error);
    lines.push(`allnumericerror ${(error as general_error).what()}`);
  }
  try {
    ranged.get_string(0, 0);
  } catch (error) {
    expect(error).toBeInstanceOf(general_error);
    lines.push(`stringerror ${(error as general_error).what()}`);
  }
  const different = new M(std_string_traits, 3, 1);
  lines.push(
    `different ${Number(ranged.equals(different))} ${Number(ranged.not_equals(different))}`,
  );
  const values = new M(std_string_traits, 2, 1, D, 1),
    values2 = new M(std_string_traits, 2, 1, D, 2);
  lines.push(`values ${Number(values.equals(values2))} ${Number(values.not_equals(values2))}`);
  lines.push(`get ${ranged.get(0, 0, D)}`);
  const nan = new M(std_string_traits, 1, 1, D, NaN);
  lines.push(`nanbool ${Number(nan.get_boolean(0, 0))}`);
  const cp = ranged.cposition(0, 0),
    cq = ranged.cposition(cp, 1, 0),
    ce = ranged.cend_position(),
    cn = M.next_position(cq);
  lines.push(
    `const ${cq.second} ${ce.second} ${cn.second} ${ranged.get_type(0, 0)} ${ranged.get_numeric(0, 0)} ${ranged.get_integer(0, 0)} ${Number(ranged.get_boolean(0, 0))}`,
  );
  expect(lines.join("\n") + "\n").toBe(fixture.captures.scalar);
  for (const m of [nan, values2, values, different, unsupportedScalar, ranged, zero]) m.dispose();
  double_element_block.delete_block(unsupported);
  double_element_block.delete_block(vs);
});
