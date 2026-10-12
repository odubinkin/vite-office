/** @fileoverview Complete ordinary original matrix_traits ownership observations over actual SharedString and unsigned integer blocks. */
import { expect, it } from "vitest";
import fixture from "../../external/mdds/include/mdds/native-matrix-cases.json";
import {
  multi_type_matrix,
  element_t,
  type MatrixTraits,
} from "../../external/mdds/include/mdds/multi_type_matrix.ts";
import {
  uint16_element_callbacks as U,
  uint8_element_callbacks as F,
  uint8_element_block,
} from "../../external/mdds/include/mdds/multi_type_vector/standard_element_blocks.ts";
import {
  string_block,
  uint16_block,
  string_element_callbacks as S,
  string_value_type,
} from "./mtvelements";
import { SharedString } from "../../svl/inc/sharedstring";
import { OUString } from "../../sal/inc/rtl/ustring";
it("matches whole original Calc matrix trait ownership and UInt8 flag stream", /** Replays unchanged original traits with their existing real shared owners. @returns Nothing. */ () => {
  const lines = ["calc"],
    text = new OUString(new Uint16Array([65, 0]), 1),
    s = new SharedString(text);
  const traits: MatrixTraits<SharedString> = {
      string_element_block: string_block,
      string_callbacks: S,
      string_value_type,
      integer_element_block: uint16_block,
      /** Erased original uint16_t static_cast. @param value - Number. @returns Integer. */
      integer_type(value: number): number {
        return value & 65535;
      },
    },
    flagtraits: MatrixTraits<SharedString> = {
      string_element_block: string_block,
      string_callbacks: S,
      string_value_type,
      integer_element_block: uint8_element_block,
      /** Erased original uint8_t static_cast. @param value - Number. @returns Integer. */
      integer_type(value: number): number {
        return value & 255;
      },
    };
  /** Original complete ownership and column-major type query observation. @param label - Stage. @param m - Matrix. @returns Nothing. */
  function state(label: string, m: multi_type_matrix<SharedString>): void {
    const sz = m.size();
    let line = `${label} ${text.pData.refCount} ${sz.row} ${sz.column} ${Number(m.empty())} ${Number(m.numeric())}`;
    for (let c = 0; c < sz.column; ++c)
      for (let r = 0; r < sz.row; ++r) {
        const t = m.get_type(r, c);
        line += ` | ${t} ${m.get_numeric(r, c)}`;
        if (t === element_t.element_string) line += ` ${m.get_string(r, c).getData()?.buffer[0]}`;
      }
    lines.push(line);
  }
  const m = new multi_type_matrix(traits, 2, 2, S, s);
  state("filled", m);
  m.set(0, 0, 65535, U);
  m.set(m.position(1, 1), s, S);
  state("mixed", m);
  const copied = new multi_type_matrix(traits, m);
  state("copied", copied);
  const moved = multi_type_matrix.move(copied);
  state("moved", moved);
  const assigned = new multi_type_matrix(traits);
  assigned.assign(moved);
  state("assigned", assigned);
  assigned.assign_move(moved);
  state("moveassigned", assigned);
  const v = assigned.get(1, 1, S, string_value_type);
  state("ownedresult", assigned);
  lines.push(`value ${v.getData()?.buffer[0]}`);
  v.dispose();
  assigned.dispose();
  moved.dispose();
  copied.dispose();
  state("aftercopies", m);
  m.set_empty(1, 1);
  state("empty", m);
  m.clear();
  state("clear", m);
  m.dispose();
  const flags = new multi_type_matrix(flagtraits, 2, 2, F, 255);
  lines.push(
    `flags ${flags.get_integer(0, 0)} ${flags.get_numeric(0, 0)} ${Number(flags.get_boolean(0, 0))} ${flags.get_type(0, 0)}`,
  );
  lines.push(`done ${text.pData.refCount}`);
  expect(lines.join("\n") + "\n").toBe(fixture.captures.calc);
  flags.dispose();
  s.dispose();
  text.dispose();
});
