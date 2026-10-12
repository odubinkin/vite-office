/** @fileoverview Whole original Calc matrix walks over genuine shared strings and native integer flag traits. */
import { expect, it } from "vitest";
import fixture from "../../external/mdds/include/mdds/native-matrix-walk-cases.json";
import {
  multi_type_matrix as M,
  type MatrixTraits,
  element_t,
  element_block_node_type as Node,
  size_pair_type as P,
  type WalkCallableOperations,
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
it("matches original Calc matrix walks and genuine shared ownership", /** Replays complete original ordinary typed callers. @returns Nothing. */ () => {
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

  /** Ordinary native lambda value copies share its actual captures. @param value - Closure value. @returns Copy. */
  function copy<F>(value: F): F {
    return value;
  }
  /** No owned lambda captures in this original caller. @param value - Closure value. @returns Nothing. */
  function destroy<F>(value: F): void {
    void value;
  }
  const a = new M(traits, 2, 2),
    b = new M(traits, 2, 2);
  a.set(0, 0, s, S);
  a.set(1, 0, 7, U);
  b.set(0, 1, s, S);
  /** Records whole original typed sections and live ownership. @param n - Borrowed section. @returns Nothing. */
  function show(n: Node): void {
    let line = `${n.type} ${n.offset} ${n.size} ${text.pData.refCount}`;
    if (n.type === element_t.element_string)
      for (
        const i = n.begin<SharedString>(string_block), e = n.end<SharedString>(string_block);
        !i.equals(e);
        i.advance(1)
      )
        line += ` ${i.get().getData()?.buffer[0]}`;
    else if (n.type === element_t.element_integer)
      for (const i = n.begin(uint16_block), e = n.end(uint16_block); !i.equals(e); i.advance(1))
        line += ` ${i.get()}`;
    lines.push(line);
  }
  const ops: WalkCallableOperations<typeof show> = {
    argument_is_rvalue: false,
    copy_construct: copy,
    move_construct: copy,
    destroy,
    /** Original unary lambda call. @param f - Lambda. @param n - Node. @returns Nothing. */
    invoke(f, n) {
      f(n);
    },
  };
  a.walk(show, ops);
  a.walk(show, ops, new P(0, 0), new P(1, 1));
  /** Original binary lambda calls each original node consumer. @param n - Left. @param m - Right. @returns Nothing. */
  function pair(n: Node, m: Node): void {
    show(n);
    show(m);
  }
  const parallel: WalkCallableOperations<typeof pair> = {
    argument_is_rvalue: false,
    copy_construct: copy,
    move_construct: copy,
    destroy,
    /** Original binary call operator. @param f - Lambda. @param n - Left. @param m - Right. @returns Nothing. */
    invoke(f, n, m) {
      f(n, m as Node);
    },
  };
  a.walk(pair, parallel, b);
  a.walk(pair, parallel, b, new P(0, 0), new P(1, 1));
  b.dispose();
  a.dispose();
  const flags = new M(flagtraits, 2, 2, F, 7);
  /** Real uint8 block consumer. @param n - Section. @returns Nothing. */
  function flag(n: Node): void {
    let line = `flag ${n.type} ${n.offset} ${n.size}`;
    for (
      const i = n.begin(uint8_element_block), e = n.end(uint8_element_block);
      !i.equals(e);
      i.advance(1)
    )
      line += ` ${i.get()}`;
    lines.push(line);
  }
  flags.walk(flag, ops);
  flags.dispose();
  lines.push(`done ${text.pData.refCount}`);
  s.dispose();
  text.dispose();
  expect(lines.join("\n") + "\n").toBe(fixture.captures.calc);
});
