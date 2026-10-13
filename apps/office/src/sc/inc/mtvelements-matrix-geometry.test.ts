/** @fileoverview Whole original Calc matrix geometry ownership, exception unwind and flag integer omission. */
import { expect, it } from "vitest";
import fixture from "../../external/mdds/include/mdds/native-matrix-geometry-cases.json";
import {
  multi_type_matrix as M,
  type MatrixTraits,
  element_t,
} from "../../external/mdds/include/mdds/multi_type_matrix.ts";
import {
  double_element_callbacks as D,
  boolean_element_callbacks as B,
  uint16_element_callbacks as U,
  uint8_element_callbacks as F,
  uint8_element_block,
} from "../../external/mdds/include/mdds/multi_type_vector/standard_element_blocks.ts";
import { general_error } from "../../external/mdds/include/mdds/global.ts";
import {
  string_block,
  uint16_block,
  string_element_callbacks as S,
  string_value_type,
} from "./mtvelements";
import { SharedString } from "../../svl/inc/sharedstring";
import { OUString } from "../../sal/inc/rtl/ustring";
it("matches original Calc matrix geometry ownership and failed integer operations", /** Replays real original SharedString aliases and temporary lifetimes, with no fake matrix fields. @returns Nothing. */ () => {
  const lines = ["calc"],
    text = new OUString(new Uint16Array([65, 0]), 1),
    s = new SharedString(text);
  const traits: MatrixTraits<SharedString> = {
      string_element_block: string_block,
      integer_element_block: uint16_block,
      string_callbacks: S,
      string_value_type,
      /** Native uint16_t conversion on initialized representable values. @param value - Number. @returns Integer. */
      integer_type(value: number): number {
        return value & 65535;
      },
    },
    flagtraits: MatrixTraits<SharedString> = {
      string_element_block: string_block,
      integer_element_block: uint8_element_block,
      string_callbacks: S,
      string_value_type,
      /** Native uint8_t conversion. @param value - Number. @returns Integer. */
      integer_type(value: number): number {
        return value & 255;
      },
    };
  /** Original complete live refcount and column-major values. @param label - Stage. @param m - Matrix. @returns Nothing. */
  function state(label: string, m: M<SharedString>): void {
    const sz = m.size();
    let line = `${label} ${text.pData.refCount} ${sz.row} ${sz.column} ${Number(m.empty())}`;
    for (let c = 0; c < sz.column; ++c)
      for (let r = 0; r < sz.row; ++r) {
        const t = m.get_type(r, c);
        line += ` | ${t} ${m.get_numeric(r, c)}`;
        if (t === element_t.element_string) line += ` ${m.get_string(r, c).getData()?.buffer[0]}`;
      }
    lines.push(line);
  }
  const source = new M(traits, 2, 3);
  source.set(0, 0, s, S);
  source.set(1, 0, 1.5, D);
  source.set(0, 1, true, B);
  source.set(1, 2, s, S);
  const target = new M(traits, 3, 4, D, 8.5);
  state("before", source);
  target.copy(source);
  state("copied", target);
  source.transpose();
  state("transposed", source);
  source.resize(4, 3, S, s);
  state("resized", source);
  source.resize(1, 2);
  state("shrink", source);
  source.resize(0, 2, S, s);
  state("zero", source);
  state("target", target);
  target.clear();
  state("clear", target);
  target.dispose();
  source.dispose();
  const bad = new M(traits, 2, 2);
  bad.set(0, 0, s, S);
  bad.set(1, 0, 7, U);
  const partial = new M(traits, 2, 2, D, 8.5);
  try {
    partial.copy(bad);
  } catch (e) {
    expect(e).toBeInstanceOf(general_error);
    lines.push(`copyerror ${(e as general_error).what()}`);
  }
  state("partial", partial);
  try {
    bad.transpose();
  } catch (e) {
    expect(e).toBeInstanceOf(general_error);
    lines.push(`transerror ${(e as general_error).what()}`);
  }
  state("aftererror", bad);
  try {
    bad.resize(3, 3, S, s);
  } catch (e) {
    expect(e).toBeInstanceOf(general_error);
    lines.push(`resizeerror ${(e as general_error).what()}`);
  }
  state("afterresizeerror", bad);
  partial.dispose();
  bad.dispose();
  lines.push(`done ${text.pData.refCount}`);
  const flags = new M(flagtraits, 2, 2, F, 7);
  try {
    flags.resize(3, 3);
  } catch (e) {
    expect(e).toBeInstanceOf(general_error);
    lines.push(`flagerror ${(e as general_error).what()}`);
  }
  flags.resize(0, 2);
  lines.push(`flagzero ${flags.size().row} ${flags.size().column} ${Number(flags.empty())}`);
  expect(lines.join("\n") + "\n").toBe(fixture.captures.calc);
  flags.dispose();
  s.dispose();
  text.dispose();
});
