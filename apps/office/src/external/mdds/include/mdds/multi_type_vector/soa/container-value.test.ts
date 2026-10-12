/** @fileoverview Complete genuine original SoA owned constructor/reference/result read stream. */
import { expect, it } from "vitest";
import fixture from "./native-container-value-cases.json";
import { default_element_block } from "../types.ts";
import {
  delayed_delete_vector_iterator,
  type DelayedValueOperations,
} from "../delayed_delete_vector.ts";
import { MDDS_MTV_DEFINE_ELEMENT_CALLBACKS } from "../macro.ts";
import { default_traits } from "../util.ts";
import { element_block_funcs } from "../block_funcs.ts";
import { multi_type_vector, empty_event_value_ops } from "./main.ts";
it("matches original owned container whole stream including failed result cleanup", /** Replays native value special members and complete constructor/metadata/read state. @returns Nothing. */ () => {
  const lines = ["owned"];
  let seq = 0;
  /** Instrumented native caller ValueT. */
  class Value {
    public id = ++seq;
    /** Creates an actual caller value. @param value - Payload. @param event - Constructor kind. @param source - Source identity. @returns Value. */
    public constructor(
      public value: number,
      event = "new",
      source?: Value,
    ) {
      lines.push(
        source ? `${event} ${source.id} ${this.id} ${value}` : `${event} ${this.id} ${value}`,
      );
    }
  }
  const operations: DelayedValueOperations<Value> = {
    move_noexcept: true,
    /** Actual native default constructor. @returns New default value. */
    default_construct() {
      return new Value(0, "default");
    },
    /** Actual native copy constructor. @param source - Source. @returns Independent value. */
    copy_construct(source) {
      return new Value(source.value, "copy", source);
    },
    /** Actual native move constructor. @param source - Source. @returns Transferred value. */
    move_construct(source) {
      const result = new Value(source.value, "move", source);
      source.value = -1;
      return result;
    },
    /** Actual native copy assignment. @param target - Target. @param source - Source. @returns Nothing. */
    copy_assign(target, source) {
      lines.push(`assign ${target.id} ${source.id} ${source.value}`);
      target.value = source.value;
    },
    /** Actual native move assignment. @param target - Target. @param source - Source. @returns Nothing. */
    move_assign(target, source) {
      lines.push(`moveassign ${target.id} ${source.id} ${source.value}`);
      target.value = source.value;
      source.value = -1;
    },
    /** Actual native destructor. @param value - Value. @returns Nothing. */
    destroy(value) {
      lines.push(`delete ${value.id} ${value.value}`);
    },
    /** Actual native equality. @param left - Left. @param right - Right. @returns Equality. */
    equal(left, right) {
      return left.value === right.value;
    },
  };
  const zero = new Value(0);
  const input = [10, 20, 30].map(
    /** Creates a caller stack value. @param value - Payload. @returns Caller value. */ (value) =>
      new Value(value),
  );
  const input_storage = { values: input, size: input.length };
  const first = new delayed_delete_vector_iterator(input_storage, 0);
  const B = default_element_block(
    59,
    zero,
    /** Actual const-reference conversion. @param value - Value. @returns Same reference. */ (
      value,
    ) => value,
    false,
    operations,
  );
  const out = new Value(80),
    output: [Value] = [out];
  const C = MDDS_MTV_DEFINE_ELEMENT_CALLBACKS(59, zero, B, {
    operations,
    empty: operations.default_construct,
  });

  const Traits = { ...default_traits, block_funcs: element_block_funcs(B) };
  /** Observes every live metadata slot and actual owned value. @param label - Caller label. @param owner - Original shared container. @returns Nothing. */
  function snap(label: string, owner: multi_type_vector): void {
    let line = `${label} ${owner.size()} ${owner.block_size()} ${Number(owner.empty())}`;
    for (const it = owner.begin(), end = owner.end(); !it.equals(end); it.increment()) {
      const node = it.get();
      line += ` | ${node.position} ${node.size} ${node.type}`;
      if (node.data) {
        line += ` ${B.capacity(node.data)}`;
        for (
          const begin = B.cbegin(node.data), last = B.cend(node.data);
          !begin.equals(last);
          begin.advance(1)
        ) {
          const value = begin.get();
          line += ` ${value.id}:${value.value}`;
        }
      }
    }
    lines.push(line);
  }
  const empty = new multi_type_vector(Traits, empty_event_value_ops, 3);
  snap("empty", empty);
  const filled = new multi_type_vector(Traits, empty_event_value_ops, 2, C, input[0]);
  snap("filled", filled);
  const range = new multi_type_vector(
    Traits,
    empty_event_value_ops,
    3,
    C,
    first,
    first.copy().advance(3),
  );
  snap("range", range);
  const zero_size = new multi_type_vector(Traits, empty_event_value_ops, 0, C, input[0]);
  snap("zero", zero_size);
  try {
    new multi_type_vector(Traits, empty_event_value_ops, 4, C, first, first.copy().advance(3));
  } catch (error) {
    lines.push(`range_error ${(error as Error).message}`);
  }
  filled.get(1, C, output);
  lines.push(`output ${out.id}:${out.value}`);
  const result = filled.get(0, C, operations);
  lines.push(`result ${result.id}:${result.value}`);
  operations.destroy(result);
  empty.get(1, C, output);
  lines.push(`empty_output ${out.id}:${out.value}`);
  const empty_result = empty.get(0, C, operations);
  lines.push(`empty_result ${empty_result.id}:${empty_result.value}`);
  operations.destroy(empty_result);
  try {
    filled.get(2, C, operations);
  } catch (error) {
    lines.push(`result_error ${(error as Error).message}`);
  }
  try {
    filled.get(2, C, output);
  } catch (error) {
    lines.push(`output_error ${(error as Error).message} ${out.id}:${out.value}`);
  }
  const copy = new multi_type_vector(Traits, empty_event_value_ops, range);
  snap("copy", copy);
  const clone = range.clone();
  snap("clone", clone);
  const moved = multi_type_vector.move(copy);
  snap("moved", moved);
  snap("moved_source", copy);
  moved.dispose();
  clone.clear();
  copy.dispose();
  zero_size.dispose();
  range.dispose();
  filled.dispose();
  empty.dispose();
  lines.push("inputs");
  operations.destroy(out);
  for (const value of [...input].reverse()) operations.destroy(value);
  operations.destroy(zero);
  expect(output[0]).toBe(out);
  expect(lines.join("\n") + "\n").toBe(fixture.captures.owned);
});
