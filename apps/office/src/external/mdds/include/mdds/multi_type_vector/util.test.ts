/** @fileoverview Genuine unchanged mdds utility observations on real native soa positions and borrowed vector iterators. */
import { describe, expect, it } from "vitest";
import fixture from "./native-util-cases.json";
import {
  advance_position,
  calc_input_end_position,
  call_trace,
  clone_construction_type,
  default_exec_policy,
  default_traits,
  empty_event_func,
  has_trace,
  throw_block_position_not_found,
} from "./util.ts";
import { delayed_delete_vector } from "./delayed_delete_vector.ts";
import { standard_element_blocks_traits } from "./standard_element_blocks.ts";
import { get_block_type, trace_method_properties_t } from "./types.ts";
/** Complete original native node projection; data is its stable borrowed owner token. */
type NativeNode = { type: number; position: number; size: number; data: number };
/** Native fixture iterator syntax adapter, with no runtime container/interval engine. */
class BorrowedNodes {
  /** Borrows unchanged real native output nodes. @param nodes - Native records. @param index - Borrowed position. @returns Adapter. */
  public constructor(
    private readonly nodes: readonly NativeNode[],
    public index: number,
  ) {}
  /** Copies the iterator while retaining native borrowed nodes. @returns Iterator. */
  public copy(): BorrowedNodes {
    return new BorrowedNodes(this.nodes, this.index);
  }
  /** Adapts original bidirectional iterator syntax. @param steps - Signed step. @returns This iterator. */
  public advance(steps: number): this {
    this.index += steps;
    return this;
  }
  /** Borrows the complete original projected node. @returns Node. */
  public get(): NativeNode {
    return this.nodes[this.index] as NativeNode;
  }
  /** Observes original borrowed iterator/offset pair, including end without dereference. @param offset - Block offset. @returns Full native observation. */
  public observe(offset: number): unknown[] {
    const end = this.index === this.nodes.length;
    const node = end ? null : this.get();
    return [
      this.index,
      offset,
      end,
      node === null ? null : [node.type, node.position, node.size, node.data],
    ];
  }
}
describe("original mdds container utilities", /** Defines complete original utility comparisons. @returns Nothing. */ () => {
  it("matches complete mutable and const original soa position movement", /** Compares every original block crossing without synthesizing container state. @returns Nothing. */ () => {
    let count = 0;
    for (const layout of fixture.layouts) {
      const nodes = layout.nodes.map(
        /** Adapts complete genuine original node output. @param node - Native fields. @returns Borrowed view. */ (
          node,
        ) => ({
          type: node[0] as number,
          position: node[1] as number,
          size: node[2] as number,
          data: node[3] as number,
        }),
      );
      for (const entry of layout.positions) {
        const [logical, steps, mutable, constant] = entry as unknown as [
          number,
          number,
          [number[], unknown[]],
          [number[], unknown[]],
        ];
        for (const original of [mutable, constant]) {
          const before = original[0];
          const pos = {
            first: new BorrowedNodes(nodes, before[0] as number),
            second: before[1] as number,
          };
          expect(pos.first.get().position + pos.second).toBe(logical);
          const result = advance_position(pos, steps);
          expect([pos.first.observe(pos.second), result.first.observe(result.second)]).toEqual(
            original,
          );
          expect(result.first).not.toBe(pos.first);
          ++count;
        }
      }
    }
    expect(count).toBe(
      fixture.layouts.reduce(
        /** Counts complete source records. @param n - Total. @param layout - Layout. @returns Total. */ (
          n,
          layout,
        ) => n + layout.positions.length * 2,
        0,
      ),
    );
  });
  it("matches original UInt64 input-end and signed forward reverse distances", /** Retains empty-before-bounds and native wrap, using actual delayed storage. @returns Nothing. */ () => {
    for (const sample of fixture.inputs) {
      const store = new delayed_delete_vector<number>(0, 12, 1);
      store.erase(store.begin());
      store.erase(store.begin());
      const first = (sample.reverse ? store.rbegin() : store.begin()).advance(sample.first);
      const last = (sample.reverse ? store.rbegin() : store.begin()).advance(sample.last);
      const expected = sample.result as [number, string | [string, boolean]];
      expect(first.distance_to(last)).toBe(expected[0]);
      const pos = BigInt(sample.pos),
        size = BigInt(sample.size);
      if (typeof expected[1] === "string") {
        expect(
          /** Calls original too-long bound. @returns Pair or throws. */ () =>
            calc_input_end_position(first, last, pos, size),
        ).toThrow(expected[1]);
      } else {
        const result = calc_input_end_position(first, last, pos, size);
        expect([result[0].toString(), result[1]]).toEqual(expected[1]);
      }
      if (pos <= BigInt(Number.MAX_SAFE_INTEGER) && size <= BigInt(Number.MAX_SAFE_INTEGER)) {
        if (typeof expected[1] === "string")
          expect(
            /** Compares exact bounded-number projection diagnostic. @returns Pair or throws. */ () =>
              calc_input_end_position(first, last, Number(pos), Number(size)),
          ).toThrow(expected[1]);
        else {
          const result = calc_input_end_position(first, last, Number(pos), Number(size));
          expect([String(result[0]), result[1]]).toEqual(expected[1]);
        }
      }
    }
  });
  it("matches original trace scope depth nesting and exception unwind", /** Adapts native RAII with exact explicit scope cleanup. @returns Nothing. */ () => {
    for (const [index, initial] of [-1, 0, 1].entries()) {
      const depth = { value: initial },
        states = [depth.value],
        calls: string[] = [];
      const traits = {
        ...default_traits,
        trace:
          /** Native test callback, preserving original trace property. @param props - Properties. @returns Nothing. */ (
            props: trace_method_properties_t,
          ) => {
            calls.push(props.function_args);
            if (props.function_args === "throw") throw new Error("trace failure");
          },
      };
      const props = new trace_method_properties_t();
      props.function_args = "outer";
      const outer = new call_trace(depth, traits);
      try {
        states.push(depth.value);
        outer.call(props);
        const inner = new call_trace(depth, traits);
        try {
          states.push(depth.value);
          props.function_args = "inner";
          inner.call(props);
        } finally {
          inner.dispose();
        }
        states.push(depth.value);
        props.function_args = "after";
        outer.call(props);
      } finally {
        outer.dispose();
      }
      states.push(depth.value);
      const sink = new call_trace(depth, default_traits);
      try {
        states.push(depth.value);
        sink.call(props);
      } finally {
        sink.dispose();
      }
      states.push(depth.value);
      try {
        const failure = new call_trace(depth, traits);
        try {
          states.push(depth.value);
          props.function_args = "throw";
          failure.call(props);
        } finally {
          failure.dispose();
        }
      } catch {
        states.push(depth.value);
      }
      states.push(depth.value);
      expect([states, calls]).toEqual(fixture.traces[index]);
    }
  });
  it("retains original defaults empty events and exact diagnostics", /** Checks genuine trait aliases and registered owner behavior. @returns Nothing. */ () => {
    const standard = standard_element_blocks_traits;
    const sizes = [];
    for (let type = 0; type <= 11; ++type) {
      const block = standard.block_funcs.create_new_block(type, 3);
      const before = standard.block_funcs.size(block);
      const event = new standard.event_func();
      event.element_block_acquired(block);
      event.element_block_released(block);
      expect(get_block_type(block)).toBe(type);
      expect(standard.block_funcs.size(block)).toBe(before);
      sizes.push(before);
      standard.block_funcs.delete_block(block);
    }
    const event = new empty_event_func();
    event.element_block_acquired(null);
    event.element_block_released(null);
    expect([
      default_traits.loop_unrolling,
      standard.event_func === empty_event_func,
      standard.exec_policy === default_exec_policy,
      typeof clone_construction_type === "symbol",
      has_trace(default_traits),
      has_trace({
        ...default_traits,
        trace: /** Original present trace witness. @returns Nothing. */ () => {},
      }),
      sizes,
    ]).toEqual(fixture.defaults.slice(0, 7));
    expect(
      /** Calls original empty default specialization. @returns Block or throws. */ () =>
        default_traits.block_funcs.create_new_block(0, 0),
    ).toThrow(fixture.defaults[7] as string);
    expect(
      /** Calls original out-of-range diagnostic. @returns Never. */ () =>
        throw_block_position_not_found("position", 41, 7, 3, 10),
    ).toThrow(fixture.defaults[8] as string);
  });
});
