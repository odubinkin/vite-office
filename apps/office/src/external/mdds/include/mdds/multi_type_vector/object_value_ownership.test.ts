/** @fileoverview Replays complete genuine original owned default blocks, including hidden prefix lifetimes. */
import { expect, it } from "vitest";
import fixture from "./native-object-value-cases.json";
import { default_element_block, element_type_user_start } from "./types.ts";
import {
  delayed_delete_vector_iterator,
  type DelayedValueOperations,
} from "./delayed_delete_vector.ts";
it("matches whole original object block lifetime stream", /** Replays actual native ValueT special members and complete caller stream. @returns Nothing. */ () => {
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
  const last = first.copy().advance(3);
  const B = default_element_block(
    element_type_user_start + 9,
    zero,
    /** Actual const-reference conversion. @param value - Value. @returns Same reference. */ (
      value,
    ) => value,
    false,
    operations,
  );
  /** Complete native live block snapshot. @param label - Caller label. @param block - Actual block. @returns Nothing. */
  function snap(label: string, block: InstanceType<typeof B>): void {
    const store = block.store();
    const values: string[] = [];
    for (const it = store.begin(), end = store.end(); !it.equals(end); it.advance(1)) {
      const value = it.get();
      values.push(`${value.id}:${value.value}`);
    }
    lines.push(
      `${label} ${store.size()} ${store.capacity()}${values.length ? " " + values.join(" ") : ""}`,
    );
  }
  const d = B.create_block(2);
  snap("default", d);
  const f = B.create_block_with_value(3, input[0] as Value);
  snap("filled", f);
  const r = B.create_block_with_values(first, last);
  snap("range", r);
  B.erase_value(r, 0);
  snap("delayed", r);
  const c = B.copy_block(r);
  snap("copy_hidden", c);
  const k = B.clone_block(r);
  snap("clone_hidden", k);
  B.set_value(d, 0, input[1] as Value);
  snap("set", d);
  B.append_value(d, input[2] as Value);
  snap("append", d);
  B.emplace_back_value(d, input[0] as Value);
  snap("emplace_lvalue", d);
  B.prepend_value(d, input[1] as Value);
  snap("prepend", d);
  B.reserve(d, 12);
  snap("reserve", d);
  B.resize_block(d, 7);
  snap("resize_grow", d);
  B.set_values(d, 1, first, last);
  snap("set_range", d);
  B.swap_values(d, f, 0, 0, 2);
  snap("swap_d", d);
  snap("swap_f", f);
  B.swap_values(d, d, 0, 0, 1);
  snap("swap_self", d);
  d.store().rbegin().swap(f.store().rbegin());
  snap("reverse_d", d);
  snap("reverse_f", f);
  B.assign_values_from_block(c, d, 1, 3);
  snap("assign", c);
  B.append_values_from_block(c, d, 0, 2);
  snap("append_range", c);
  B.prepend_values_from_block(c, d, 2, 1);
  snap("prepend_range", c);
  B.erase_values(c, 1, 2);
  snap("erase_range", c);
  B.resize_block(f, 1);
  snap("resize_shrink", f);
  B.shrink_to_fit(f);
  snap("shrink_fit", f);
  B.shrink_to_fit(f);
  snap("shrink_noop", f);
  B.reserve(r, 0);
  snap("clear_hidden", r);
  lines.push(`equal ${Number(B.equal_block(r, k))}`);
  for (const block of [k, c, r, f, d]) B.delete_block(block);
  B.delete_block(null);
  const scalar = { values: [1, 2], size: 2 };
  const scalar_first = new delayed_delete_vector_iterator(scalar, 0);
  scalar_first.swap(scalar_first.copy().advance(1));
  lines.push(`scalar_swap ${scalar.values[0]} ${scalar.values[1]}`);
  lines.push("inputs");
  for (const value of [...input].reverse()) operations.destroy(value);
  operations.destroy(zero);
  expect(lines.join("\n") + "\n").toBe(fixture.captures.owned);
});
