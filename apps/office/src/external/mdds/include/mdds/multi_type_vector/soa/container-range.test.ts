/** @fileoverview Complete original scalar input-range set permutations and returned-block/event contracts, with both overloads. */
import { expect, it } from "vitest";
import fixture from "./native-container-range-cases.json";
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
import { delayed_delete_vector } from "../delayed_delete_vector.ts";
it("matches complete original scalar input-range set permutation stream", /** Runs bounded exhaustive caller inputs against entire original native results. @returns Nothing. */ () => {
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
        for (let count = 1; count <= n - row; ++count)
          for (let kind = 1; kind < 5; ++kind)
            for (let hint = 0; hint < 2; ++hint) {
              lines.push(`case ${n} ${code} ${row} ${count} ${kind} ${hint}`);
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
              const ds = new delayed_delete_vector(0, count, 2.5),
                us = new delayed_delete_vector(0, count, 9),
                bs = new delayed_delete_vector(false, count, false),
                ints = new delayed_delete_vector(0, count, -9);
              snap(m);
              const h = m.position(n - 1).first;
              let it: iterator_base<typeof m>;
              if (kind === 1)
                it = hint
                  ? m.set(h, row, ds.begin(), ds.end(), DC)
                  : m.set(row, ds.begin(), ds.end(), DC);
              else if (kind === 2)
                it = hint
                  ? m.set(h, row, us.begin(), us.end(), UC)
                  : m.set(row, us.begin(), us.end(), UC);
              else if (kind === 3)
                it = hint
                  ? m.set(h, row, bs.begin(), bs.end(), BC)
                  : m.set(row, bs.begin(), bs.end(), BC);
              else
                it = hint
                  ? m.set(h, row, ints.begin(), ints.end(), IC)
                  : m.set(row, ints.begin(), ints.end(), IC);
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
    for (const row of [2, 18446744073709551615n])
      for (const count of [0, 1, 2]) {
        const m = new multi_type_vector(Traits, Events, 2),
          input = new delayed_delete_vector(0, count, 1.5);
        try {
          const it = hint
            ? m.set(m.end(), row, input.begin(), input.end(), DC)
            : m.set(row, input.begin(), input.end(), DC);
          lines.push(`empty ${hint} ${row} ${count} ${Number(it.equals(m.end()))}`);
        } catch (error) {
          if (!(error instanceof Error)) throw error;
          lines.push(`error ${hint} ${row} ${count} ${error.message}`);
        }
        snap(m);
        m.dispose();
      }
  for (let fault = 1; fault <= 2; ++fault) {
    let armed = false;
    const faultOps = {
      ...Ops,
      /** Caller-only original trait fault injection. @param type - Category. @param count - Size. @returns Original block or controlled null. */
      create_new_block(type: number, count: number): base_element_block {
        if (armed && fault === 1) return null as unknown as base_element_block;
        return Ops.create_new_block(type, count);
      },
      /** Caller-only original assign failure. @param dest - Destination. @param source - Source. @param pos - Offset. @param count - Count. @returns Nothing. */
      assign_values_from_block(
        dest: base_element_block,
        source: base_element_block,
        pos: number,
        count: number,
      ): void {
        if (armed && fault === 2) throw new Error("caller assignment failure");
        Ops.assign_values_from_block(dest, source, pos, count);
      },
      /** Observes original unique_ptr deleter. @param block - Owned block. @returns Nothing. */
      delete_block(block: base_element_block | null): void {
        if (armed && fault === 2)
          lines.push(
            `failure_delete ${get_block_type(block as base_element_block)} ${Ops.size(block as base_element_block)}`,
          );
        Ops.delete_block(block);
      },
    };
    const m = new multi_type_vector({ ...Traits, block_funcs: faultOps }, Events, 3, DC, 1.5),
      input = new delayed_delete_vector(0, 1, 9);
    armed = true;
    try {
      m.set(0, input.begin(), input.end(), UC);
    } catch (error) {
      if (!(error instanceof Error)) throw error;
      lines.push(`failure ${fault} ${error.message}`);
    }
    armed = false;
    snap(m);
    m.clear();
    snap(m);
    m.dispose();
  }
  expect(lines.join("\n") + "\n").toBe(fixture.captures.scalar);
});
