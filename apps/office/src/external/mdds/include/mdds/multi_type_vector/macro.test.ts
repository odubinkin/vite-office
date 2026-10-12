/** @fileoverview Replays complete genuine original value and pointer callback streams over actual shared owners. */
import { expect, it } from "vitest";
import fixture from "./native-element-callback-cases.json";
import { default_element_block, element_type_user_start } from "./types.ts";
import {
  delayed_delete_vector_iterator,
  type DelayedValueOperations,
} from "./delayed_delete_vector.ts";
import {
  MDDS_MTV_DEFINE_ELEMENT_CALLBACKS,
  MDDS_MTV_DEFINE_ELEMENT_CALLBACKS_PTR,
} from "./macro.ts";
it("matches whole original value callback stream", /** Replays actual native ValueT special members and complete caller stream. @returns Nothing. */ () => {
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
  const last = first.copy().advance(2);
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
  const out = new Value(80),
    output: [Value] = [out];
  const C = MDDS_MTV_DEFINE_ELEMENT_CALLBACKS(59, zero, B, {
    operations,
    empty: operations.default_construct,
  });
  const b = C.mdds_mtv_create_new_block(2, input[0] as Value);
  snap("fill", b);
  lines.push(`type ${C.mdds_mtv_get_element_type(input[0] as Value)}`);
  C.mdds_mtv_get_empty_value(output);
  lines.push(`empty ${out.id}:${out.value}`);
  const empty = C.mdds_mtv_get_empty_value();
  lines.push(`empty_expression ${empty.id}:${empty.value}`);
  operations.destroy(empty);
  C.mdds_mtv_get_value(b, 0, output);
  lines.push(`output ${out.id}:${out.value}`);
  const result = C.mdds_mtv_get_value(b, 0);
  lines.push(`result ${result.id}:${result.value}`);
  operations.destroy(result);
  C.mdds_mtv_set_value(b, 1, input[1] as Value);
  snap("set", b);
  C.mdds_mtv_set_values(b, 0, zero, first, last);
  snap("set_range", b);
  C.mdds_mtv_append_value(b, input[2] as Value);
  snap("append", b);
  C.mdds_mtv_append_value_move(b, input[2] as Value);
  snap("append_move", b);
  C.mdds_mtv_emplace_back_value(b, zero, input[0] as Value);
  snap("emplace_lvalue", b);
  C.mdds_mtv_emplace_back_construct(b, zero, operations.default_construct);
  snap("emplace_default", b);
  C.mdds_mtv_emplace_back_construct(
    b,
    zero,
    /** Actual forwarded int constructor. @returns Constructed ValueT. */ () => new Value(123),
  );
  snap("emplace_args", b);
  C.mdds_mtv_emplace_back_construct(
    b,
    zero,
    /** Actual forwarded rvalue constructor. @returns Moved ValueT. */ () =>
      operations.move_construct(input[1] as Value),
  );
  snap("emplace_move", b);
  C.mdds_mtv_emplace_back_construct(
    b,
    zero,
    /** Actual live alias constructor argument before allocation. @returns Copied ValueT. */ () =>
      operations.copy_construct(B.at(b, 0)),
  );
  snap("emplace_alias", b);
  C.mdds_mtv_prepend_value(b, input[0] as Value);
  snap("prepend", b);
  C.mdds_mtv_prepend_values(b, zero, first, last);
  snap("prepend_range", b);
  C.mdds_mtv_append_values(b, zero, first, last);
  snap("append_range", b);
  C.mdds_mtv_insert_values(b, 1, zero, first, last);
  snap("insert_range", b);
  C.mdds_mtv_assign_values(b, zero, first, last);
  snap("assign_range", b);
  const r = C.mdds_mtv_create_new_block(zero, first, last);
  snap("range", r);
  B.delete_block(r);
  B.delete_block(b);
  lines.push("inputs");
  operations.destroy(out);
  for (const value of [...input].reverse()) operations.destroy(value);
  operations.destroy(zero);
  expect(output[0]).toBe(out);
  expect(lines.join("\n") + "\n").toBe(fixture.captures.owned);
});
it("matches whole original pointer callback stream", /** Replays the original pointer macro over a genuine borrowed-pointer default block, without fake Calc pointees. @returns Nothing. */ () => {
  const lines = ["pointer"];
  let seq = 0;
  /** Actual native caller pointee; only its identity and initialized lifetime are observed. */
  class Value {
    public id = ++seq;
    /** Creates original stack witness. @param value - Payload. @returns Caller pointee. */
    constructor(public value: number) {
      lines.push(`new ${this.id} ${value}`);
    }
  }
  const input = [new Value(10), new Value(20), new Value(30)];
  const storage = { values: input as (Value | null)[], size: 3 };
  const first = new delayed_delete_vector_iterator(storage, 0),
    last = first.copy().advance(2);
  const P = default_element_block<Value | null>(
    60,
    null,
    /** Original pointer conversion. @param value - Pointer. @returns Same pointer. */ (value) =>
      value,
  );
  const C = MDDS_MTV_DEFINE_ELEMENT_CALLBACKS_PTR(60, null, P);
  const output: [Value | null] = [input[0] as Value];
  /** Complete original pointer block observation. @param label - Label. @param block - Block. @returns Nothing. */
  function snap(label: string, block: InstanceType<typeof P>): void {
    const store = block.store(),
      values: number[] = [];
    for (const it = store.begin(), end = store.end(); !it.equals(end); it.advance(1))
      values.push(it.get()?.id ?? 0);
    lines.push(
      `${label} ${store.size()} ${store.capacity()}${values.length ? " " + values.join(" ") : ""}`,
    );
  }
  const b = C.mdds_mtv_create_new_block(2, input[0] as Value);
  snap("fill", b);
  lines.push(`type ${C.mdds_mtv_get_element_type(input[0] as Value)}`);
  C.mdds_mtv_get_empty_value(output);
  lines.push(`empty ${output[0]?.id ?? 0}`);
  C.mdds_mtv_get_value(b, 0, output);
  lines.push(`output ${output[0]?.id ?? 0}`);
  C.mdds_mtv_set_value(b, 1, input[1] as Value);
  snap("set", b);
  C.mdds_mtv_set_values(b, 0, null, first, last);
  snap("set_range", b);
  C.mdds_mtv_append_value(b, input[2] as Value);
  snap("append", b);
  C.mdds_mtv_prepend_value(b, input[1] as Value);
  snap("prepend", b);
  C.mdds_mtv_prepend_values(b, null, first, last);
  snap("prepend_range", b);
  C.mdds_mtv_append_values(b, null, first, last);
  snap("append_range", b);
  C.mdds_mtv_insert_values(b, 1, null, first, last);
  snap("insert_range", b);
  C.mdds_mtv_assign_values(b, null, first, first.copy().advance(3));
  snap("assign_range", b);
  const r = C.mdds_mtv_create_new_block(null, first, last);
  snap("range", r);
  P.delete_block(r);
  P.delete_block(b);
  lines.push("inputs");
  for (const value of [...input].reverse()) lines.push(`delete ${value.id} ${value.value}`);
  expect(lines.join("\n") + "\n").toBe(fixture.captures.pointer);
});
