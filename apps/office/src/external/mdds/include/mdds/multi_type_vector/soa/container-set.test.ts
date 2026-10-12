/** @fileoverview Complete original scalar single-value set permutations and returned-block/event contracts, with both overloads. */
import { expect, it } from "vitest";
import fixture from "./native-container-set-cases.json";
import { type base_element_block, get_block_type } from "../types.ts";
import { element_block_funcs } from "../block_funcs.ts";
import { default_traits } from "../util.ts";
import {
  double_element_block as D,
  uint16_element_block as U,
  boolean_element_block as B,
  int8_element_block as I,
  double_element_callbacks as DC,
  uint16_element_callbacks as UC,
  boolean_element_callbacks as BC,
  int8_element_callbacks as IC,
} from "../standard_element_blocks.ts";
import { multi_type_vector, type EventValueOps } from "./main.ts";
import { type iterator_base } from "./iterator.ts";
import { set_cell_to_top_of_data_block, set_cell_to_bottom_of_data_block } from "./main_def.set.ts";
it("matches complete original scalar single-value set permutation stream", /** Runs bounded exhaustive caller inputs against entire original native results. @returns Nothing. */ () => {
  const lines = ["scalar"],
    Ops = element_block_funcs(D, U, B, I);
  /** Original instrumentation-only event type records actual block state. */
  class Event {
    /** Native acquisition observer. @param block - Actual block. @returns Nothing. */
    element_block_acquired(block: base_element_block | null): void {
      lines.push(
        `acquire ${get_block_type(block as base_element_block)} ${Ops.size(block as base_element_block)}`,
      );
    }
    /** Native release observer. @param block - Actual block. @returns Nothing. */
    element_block_released(block: base_element_block | null): void {
      lines.push(
        `release ${get_block_type(block as base_element_block)} ${Ops.size(block as base_element_block)}`,
      );
    }
  }
  const Events: EventValueOps<Event> = {
      /** Original implicit empty copy. @param source - Input. @returns New handler. */
      copy(source) {
        void source;
        return new Event();
      },
      /** Original implicit empty move. @param source - Input. @returns New handler. */
      move(source) {
        void source;
        return new Event();
      },
      /** Original empty swap. @param left - Left. @param right - Right. @returns Nothing. */
      swap(left, right) {
        void left;
        void right;
      },
    },
    Traits = { ...default_traits, block_funcs: Ops, event_func: Event };
  /** Observes every live native scalar/metadata field. @param m - Owner. @returns Nothing. */
  function snap(m: multi_type_vector<Event>): void {
    let line = `${m.size()} ${m.block_size()} ${Number(m.empty())}`;
    for (const it = m.begin(), end = m.end(); !it.equals(end); it.increment()) {
      const node = it.get();
      line += ` | ${node.position} ${node.size} ${node.type}`;
      if (node.data) {
        line += ` ${Ops.size(node.data)} ${node.type === 10 ? D.capacity(node.data) : node.type === 4 ? U.capacity(node.data) : node.type === 0 ? B.capacity(node.data) : I.capacity(node.data)}`;
        if (node.type === 0) {
          for (
            const begin = B.cbegin(node.data), end = B.cend(node.data);
            !begin.equals(end);
            begin.advance(1)
          )
            line += ` ${Number(begin.get())}`;
        } else {
          const block = node.type === 10 ? D : node.type === 4 ? U : I;
          for (
            const begin = block.cbegin(node.data), end = block.cend(node.data);
            !begin.equals(end);
            begin.advance(1)
          )
            line += ` ${begin.get()}`;
        }
      }
    }
    lines.push(line);
  }
  for (let n = 1, limit = 4; n <= 4; ++n, limit *= 4)
    for (let code = 0; code < limit; ++code)
      for (let row = 0; row < n; ++row)
        for (let kind = 1; kind < 5; ++kind)
          for (let hint = 0; hint < 2; ++hint) {
            lines.push(`case ${n} ${code} ${row} ${kind} ${hint}`);
            const m = new multi_type_vector(Traits, Events);
            let chars = code;
            for (let i = 0; i < n; ++i) {
              const ch = chars % 4;
              chars = Math.floor(chars / 4);
              if (ch === 0) m.push_back_empty();
              else if (ch === 1) m.push_back(1.5, DC);
              else if (ch === 2) m.push_back(7, UC);
              else m.push_back(true, BC);
            }
            snap(m);
            const h = m.position(n - 1).first;
            let it: iterator_base<typeof m>;
            if (kind === 1) it = hint ? m.set(h, row, 2.5, DC) : m.set(row, 2.5, DC);
            else if (kind === 2) it = hint ? m.set(h, row, 9, UC) : m.set(row, 9, UC);
            else if (kind === 3) it = hint ? m.set(h, row, false, BC) : m.set(row, false, BC);
            else it = hint ? m.set(h, row, -9, IC) : m.set(row, -9, IC);
            const node = it.get_node();
            lines.push(
              `returned ${node.position} ${node.size} ${node.type} ${node.__private_data.block_index} ${Number(node.__private_data.parent === m)} ${Number(node.data === m.position(row).first.get().data)}`,
            );
            snap(m);
            m.clear();
            snap(m);
            m.dispose();
          }
  for (let hint = 0; hint < 2; ++hint)
    for (const row of [2, 18446744073709551615n]) {
      const m = new multi_type_vector(Traits, Events, 2);
      try {
        if (hint) m.set(m.begin(), row, 1.5, DC);
        else m.set(row, 1.5, DC);
        throw new Error("Native invalid-row set unexpectedly succeeded");
      } catch (error) {
        if (!(error instanceof Error)) throw error;
        lines.push(`error ${hint} ${error.message}`);
      }
      snap(m);
      m.dispose();
    }
  for (let which = 0; which < 2; ++which) {
    const m = new multi_type_vector(Traits, Events, 3);
    lines.push(`empty_helper ${which}`);
    const body = which ? set_cell_to_bottom_of_data_block : set_cell_to_top_of_data_block;
    body(m["m_block_store"], m.event_handler(), Ops, 0, 2.5, DC);
    snap(m);
    m.dispose();
  }
  expect(lines.join("\n") + "\n").toBe(fixture.captures.scalar);
});
