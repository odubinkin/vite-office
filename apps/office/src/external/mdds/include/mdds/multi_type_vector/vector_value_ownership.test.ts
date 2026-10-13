/** @fileoverview Replays whole native vector value lifetimes for both move-if-noexcept traits. */
import { expect, it } from "vitest";
import fixture from "./native-vector-value-cases.json";
import { std_vector, type ValueOperations } from "./vector_storage.ts";
it("matches complete native object identity and lifetime streams", /** Replays original valid caller operations, including alias append and self move. @returns Nothing. */ () => {
  const lines: string[] = [];
  for (const move_noexcept of [true, false]) {
    let seq = 0;
    /** Actual native caller ValueT, with visible special members. */
    class Value {
      public id = ++seq;
      /** Creates a caller value. @param value - Payload. @param event - Original constructor kind. @param source - Source identity. @returns Value. */
      public constructor(
        public value: number,
        event = "new",
        source?: Value,
      ) {
        lines.push(
          source ? `${event} ${source.id} ${this.id} ${value}` : `new ${this.id} ${value}`,
        );
      }
    }
    const operations: ValueOperations<Value> = {
      move_noexcept,
      /** Native copy constructor. @param source - Live source. @returns New value. */
      copy_construct(source) {
        return new Value(source.value, "copy", source);
      },
      /** Native move constructor. @param source - Live source. @returns New value. */
      move_construct(source) {
        const result = new Value(source.value, "move", source);
        source.value = -1;
        return result;
      },
      /** Native copy assignment. @param target - Live target. @param source - Live source. @returns Nothing. */
      copy_assign(target, source) {
        lines.push(`assign ${target.id} ${source.id} ${source.value}`);
        target.value = source.value;
      },
      /** Native move assignment. @param target - Live target. @param source - Live source. @returns Nothing. */
      move_assign(target, source) {
        lines.push(`moveassign ${target.id} ${source.id} ${source.value}`);
        target.value = source.value;
        source.value = -1;
      },
      /** Native destructor. @param value - Live value. @returns Nothing. */
      destroy(value) {
        lines.push(`delete ${value.id} ${value.value}`);
      },
      /** Actual ValueT operator==. @param left - Left value. @param right - Right value. @returns Equality. */
      equal(left, right) {
        return left.value === right.value;
      },
    };
    /** Complete native observable storage snapshot. @param label - Caller label. @param vector - Real vector. @returns Nothing. */
    function snap(label: string, vector: std_vector<Value>): void {
      lines.push(
        `${label} ${vector.size()} ${vector.capacity()}${vector
          .snapshot()
          .map(
            /** Prints one native caller element. @param value - Live value. @returns Snapshot field. */ (
              value,
            ) => ` ${value.id}:${value.value}`,
          )
          .join("")}`,
      );
    }
    lines.push(`case ${Number(move_noexcept)}`);
    const input = [10, 20, 30, 40, 50].map(
      /** Constructs a native caller input. @param value - Payload. @returns Live input. */ (
        value,
      ) => new Value(value),
    );
    const a = new std_vector(input.slice(0, 3), operations);
    snap("range", a);
    a.reserve(3);
    a.reserve(8);
    snap("reserve", a);
    a.insert(1, input.slice(3, 5));
    snap("insert_equal_tail", a);
    a.insert(0, []);
    snap("insert_empty", a);
    a.push_back(input[0] as Value);
    a.push_back(a.get(1));
    a.push_back(input[1] as Value);
    a.push_back(a.get(0));
    snap("alias_push", a);
    a.insert(2, input.slice(1, 3));
    snap("insert_short", a);
    a.erase(1, 3);
    snap("erase", a);
    a.pop_back();
    a.set(0, input[4] as Value);
    snap("set", a);
    const b = new std_vector(a);
    snap("copy", b);
    lines.push(`equal ${Number(a.equals(b))}`);
    b.set(0, input[0] as Value);
    lines.push(`equal ${Number(a.equals(b))}`);
    b.pop_back();
    lines.push(`equal ${Number(a.equals(b))}`);
    b.assign(input.slice(0, 2));
    snap("assign_short", b);
    b.assign(input);
    snap("assign_grow", b);
    b.reserve(5);
    b.assign([]);
    snap("assign_empty", b);
    b.copy_assign(a);
    b.copy_assign(b);
    snap("copyassign", b);
    const small = new std_vector(input.slice(0, 1), operations);
    small.copy_assign(a);
    snap("copyassign_allocate", small);
    const moved = std_vector.move(b);
    snap("moved", moved);
    snap("moved_source", b);
    small.move_assign(moved);
    snap("moveassign", small);
    snap("moveassign_source", moved);
    a.swap(small);
    snap("swap_a", a);
    snap("swap_b", small);
    a.clear();
    small.clear();
    snap("cleared", a);
    const d = new std_vector(input.slice(0, 1), operations);
    d.reserve(10);
    d.insert(0, input.slice(1, 5));
    snap("insert_long", d);
    d.erase(0, 0);
    snap("erase_empty", d);
    const empty = new std_vector<Value>([], operations);
    empty.push_back_move(input[2] as Value);
    snap("rvalue", empty);
    empty.push_back(input[0] as Value);
    snap("push_reallocate", empty);
    empty.insert(1, input);
    snap("insert_allocate", empty);
    empty.move_assign(empty);
    snap("selfmove", empty);
    const wide = new std_vector(input.slice(0, 4), operations);
    wide.insert(2, input.slice(0, 3));
    snap("insert_wide", wide);
    wide.reserve(12);
    wide.insert(wide.size(), input.slice(0, 1));
    snap("insert_end", wide);
    for (const vector of [wide, empty, d, moved, small, b, a]) vector.dispose();
    lines.push("inputs");
    for (const value of [...input].reverse()) operations.destroy(value);
  }
  expect(lines.join("\n") + "\n").toBe(fixture.output);
});
