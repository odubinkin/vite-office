/** @fileoverview Complete original owned append forwarding, segment/event/iterator state and positional-copy stream. */
import { expect, it } from "vitest";
import fixture from "./native-container-append-cases.json";
import { default_element_block, get_block_type, type base_element_block } from "../types.ts";
import { type DelayedValueOperations } from "../delayed_delete_vector.ts";
import { MDDS_MTV_DEFINE_ELEMENT_CALLBACKS } from "../macro.ts";
import { default_traits } from "../util.ts";
import { element_block_funcs } from "../block_funcs.ts";
import { double_element_block as D, double_element_callbacks } from "../standard_element_blocks.ts";
import { multi_type_vector, type EventValueOps } from "./main.ts";
import { type iterator_base } from "./iterator.ts";
it("matches original owned append and position-copy whole stream", /** Replays complete genuine native special members, metadata, event ordering and returned fields. @returns Nothing. */ () => {
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

  const zero = new Value(0),
    a = new Value(10),
    b = new Value(20),
    c = new Value(30);
  const B = default_element_block(
    59,
    zero,
    /** Actual native value const-reference. @param value - Value. @returns Same reference. */ (
      value,
    ) => value,
    false,
    operations,
  );
  const C = MDDS_MTV_DEFINE_ELEMENT_CALLBACKS(59, zero, B, {
    operations,
    empty: operations.default_construct,
  });
  const Ops = element_block_funcs(B, D);
  /** Actual instrumentation-only native caller event type; no Calc event owner substitute. */
  class Event {
    /** Original acquire callback receives the actual block before append. @param block - Block. @returns Nothing. */
    element_block_acquired(block: base_element_block | null): void {
      lines.push(
        `acquire ${get_block_type(block as base_element_block)} ${Ops.size(block as base_element_block)}`,
      );
    }
    /** Original release callback receives the actual block before deletion. @param block - Block. @returns Nothing. */
    element_block_released(block: base_element_block | null): void {
      lines.push(
        `release ${get_block_type(block as base_element_block)} ${Ops.size(block as base_element_block)}`,
      );
    }
  }
  const Events: EventValueOps<Event> = {
    /** Native implicit empty-state copy. @param value - Source. @returns Independent empty handler. */
    copy(value) {
      void value;
      return new Event();
    },
    /** Native implicit empty-state move. @param value - Source. @returns Independent empty handler. */
    move(value) {
      void value;
      return new Event();
    },
    /** Native empty-state swap. @param left - Left. @param right - Right. @returns Nothing. */
    swap(left, right) {
      void left;
      void right;
    },
  };
  const Traits = { ...default_traits, block_funcs: Ops, event_func: Event },
    m = new multi_type_vector(Traits, Events);
  /** Complete actual live container metadata/payload state. @param label - Label. @returns Nothing. */
  function snap(label: string): void {
    let line = `${label} ${m.size()} ${m.block_size()} ${Number(m.empty())}`;
    for (const it = m.begin(), end = m.end(); !it.equals(end); it.increment()) {
      const node = it.get();
      line += ` | ${node.position} ${node.size} ${node.type}`;
      if (node.data) {
        line += ` ${node.type === 59 ? B.capacity(node.data) : D.capacity(node.data)}`;
        if (node.type === 59)
          for (
            const begin = B.cbegin(node.data), last = B.cend(node.data);
            !begin.equals(last);
            begin.advance(1)
          ) {
            const v = begin.get();
            line += ` ${v.id}:${v.value}`;
          }
        else
          for (
            const begin = D.cbegin(node.data), last = D.cend(node.data);
            !begin.equals(last);
            begin.advance(1)
          )
            line += ` ${begin.get()}`;
      }
    }
    lines.push(line);
  }
  /** Every original returned cached metadata/private field. @param it - Returned iterator. @returns Nothing. */
  function returned(it: iterator_base<typeof m>): void {
    const node = it.get_node();
    lines.push(
      `returned ${node.position} ${node.size} ${node.type} ${node.__private_data.block_index} ${Number(node.__private_data.parent === m)} ${Number(node.data === m.position(node.position).first.get().data)}`,
    );
  }
  snap("empty");
  let it = m.push_back(a, C);
  returned(it);
  snap("first");
  it = m.push_back(b, C);
  returned(it);
  snap("same");
  it = m.push_back_empty();
  returned(it);
  snap("empty_tail");
  it = m.push_back(c, C);
  returned(it);
  snap("after_empty");
  it = m.push_back(1.5, double_element_callbacks);
  returned(it);
  snap("numeric");
  it = m.push_back_move(c, C);
  returned(it);
  snap("different_move");
  it = m.push_back_move(a, C);
  returned(it);
  snap("same_move");
  const alias = B.at(it.get().data as base_element_block, 0);
  it = m.push_back_move(alias, C);
  returned(it);
  snap("alias_move");
  const result = multi_type_vector.get(m.position(0), B);
  lines.push(`position_result ${result.id}:${result.value}`);
  result.value = 71;
  operations.destroy(result);
  snap("independent");
  lines.push(`numeric_result ${multi_type_vector.get(m.position(4), D)}`);
  m.clear();
  snap("cleared");
  m.dispose();
  lines.push("inputs");
  for (const value of [c, b, a, zero]) operations.destroy(value);
  expect(lines.join("\n") + "\n").toBe(fixture.captures.owned);
});
