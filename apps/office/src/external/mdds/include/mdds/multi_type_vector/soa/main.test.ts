/** @fileoverview Full genuine private original block-store observations over actual shared scalar blocks and reused reserved storage. */
import { describe, expect, it } from "vitest";
import fixture from "./native-block-store-cases.json";
import { block_slot_type, blocks_to_transfer, blocks_type } from "./main.ts";
import { copy_blocks, equal_blocks, equal_blocks_pred, mutate_blocks } from "./main_def.ts";
import {
  std_vector,
  type vector_storage,
  assign_storage,
  grow_storage,
  insert_storage,
} from "../vector_storage.ts";
import * as standard from "../standard_element_blocks.ts";
import { type DelayedVectorValue } from "../delayed_delete_vector.ts";
import { type base_element_block, type default_element_block, get_block_type } from "../types.ts";
import { clone_construction_type } from "../util.ts";
import { iterator_base, grouped_iterator_type, vector_iterator } from "./iterator.ts";
import { private_data_forward_update } from "../iterator_node.ts";
const Traits = standard.standard_element_blocks_traits;
const Dispatch = Traits.block_funcs;
/** Erased original scalar specialization witness. */
type BlockType = ReturnType<typeof default_element_block<DelayedVectorValue>>;
const aliases = [
  standard.boolean_element_block,
  standard.int8_element_block,
  standard.uint8_element_block,
  standard.int16_element_block,
  standard.uint16_element_block,
  standard.int32_element_block,
  standard.uint32_element_block,
  standard.int64_element_block,
  standard.uint64_element_block,
  standard.float_element_block,
  standard.double_element_block,
  standard.string_element_block,
] as unknown as readonly BlockType[];
/** Allocates native scalar caller input through actual existing block aliases. @param type - Original family. @param count - Length. @param text - Value. @returns Pointer. */
function create(type: number, count: number, text: string): base_element_block | null {
  if (type < 0) return null;
  const value =
    type === 11
      ? text
      : type === 0
        ? Boolean(Number(text))
        : type === 7 || type === 8
          ? BigInt(text)
          : Number(text);
  return (aliases[type] as BlockType).create_block_with_value(count, value);
}
/** Complete payload projection of actual shared unmanaged blocks. @param block - Pointer. @returns Original payload. */
function payload(block: base_element_block): unknown[] {
  const type = get_block_type(block),
    Block = aliases[type] as BlockType,
    values = [];
  for (
    const first = Block.cbegin(block), last = Block.cend(block);
    !first.equals(last);
    first.advance(1)
  ) {
    const v = first.get();
    values.push(typeof v === "bigint" ? v.toString() : v);
  }
  return [type, Dispatch.size(block), Block.capacity(block), values];
}
/** Complete metadata/capacity/pointer-token projection. @param store - Original owner. @param pool - Borrowed stable pointer pool. @returns State. */
function snapshot(store: blocks_type, pool: readonly base_element_block[]): unknown[] {
  return [
    store.positions.snapshot(),
    store.sizes.snapshot(),
    store.element_blocks
      .snapshot()
      .map(
        /** Projects actual borrowed pointer identity. @param p - Pointer. @returns Token. */ (
          p,
        ) => (p === null ? -1 : pool.indexOf(p)),
      ),
    [store.positions.capacity(), store.sizes.capacity(), store.element_blocks.capacity()],
  ];
}
describe("original mdds SoA block array owners", /** Defines complete portable original owner comparisons. @returns Nothing. */ () => {
  it("matches every unchanged private native block-array sequence", /** Replays every complete after-command two-owner/native-pool record. @returns Nothing. */ () => {
    let steps = 0;
    for (const sample of fixture.cases) {
      const stores = [new blocks_type(Traits), new blocks_type(Traits)],
        pool: base_element_block[] = [];
      /** Retains actual pointer ownership for native wrapper observations. @param p - Pointer. @returns Stable token. */
      function remember(p: base_element_block | null): number {
        if (p === null) return -1;
        let id = pool.indexOf(p);
        if (id < 0) {
          id = pool.length;
          pool.push(p);
        }
        return id;
      }
      for (const [step, command] of sample.commands.entries()) {
        const [op, target, ...args] = command as [string, number, ...(string | number)[]],
          s = stores[target] as blocks_type;
        const calls: number[] = [];
        let result: unknown = null;
        if (op === "P" || op === "S") {
          const [pos, size, type, text] = args as [number, number, number, string],
            data = create(type, size, text);
          remember(data);
          if (op === "P") s.push_back(pos, size, data);
          else {
            const slot = new block_slot_type(pos, size);
            slot.element_block = data;
            s.push_back(slot);
          }
        } else if (op === "s") s.push_back(new block_slot_type());
        else if (op === "U") {
          const [index, pos, size, type, text] = args as [number, number, number, number, string],
            data = create(type, size, text);
          remember(data);
          s.insert(index, pos, size, data);
        } else if (op === "I") s.insert(args[0] as number, args[1] as number);
        else if (op === "A") s.insert(args[0] as number, stores[args[1] as number] as blocks_type);
        else if (op === "E") s.erase(args[0] as number);
        else if (op === "R") s.erase(args[0] as number, args[1] as number);
        else if (op === "B") s.pop_back();
        else if (op === "Z") s.clear();
        else if (op === "O") s.reserve(args[0] as number);
        else if (op === "C") s.calc_block_position(args[0] as number);
        else if (op === "N") result = s.calc_next_block_position(args[0] as number);
        else if (op === "X") s.swap(args[0] as number, args[1] as number);
        else if (op === "W") s.swap(stores[args[0] as number] as blocks_type);
        else if (op === "Q" || op === "L" || op === "D") {
          const other = stores[args[0] as number] as blocks_type;
          const copied =
            op === "D"
              ? blocks_type.move(other)
              : op === "L"
                ? new blocks_type(Traits, other, clone_construction_type)
                : new blocks_type(Traits, other);
          s.swap(copied);
        } else if (op === "T") s.positions.set(args[0] as number, args[1] as number);
        else if (op === "v") s.sizes.set(args[0] as number, args[1] as number);
        else if (op === "d") s.sizes.pop_back();
        else if (op === "b") s.element_blocks.pop_back();
        else if (op === "K") {
          try {
            s.check_integrity();
          } catch (error) {
            result = (error as Error).message;
          }
        } else if (op === "H") {
          try {
            copy_blocks(
              s.element_blocks,
              /** Calls original registered scalar copy alias in source order. @param block - Pointer. @returns Copy. */ (
                block,
              ) => {
                calls.push(remember(block));
                if (calls.length === args[0]) throw new Error("copy failure");
                const copy = Dispatch.copy_block(block);
                remember(copy);
                return copy;
              },
            );
          } catch (error) {
            result = (error as Error).message;
          }
        } else if (op === "M") {
          try {
            mutate_blocks(
              s.element_blocks,
              /** Original test mutation callback. @param block - Pointer. @returns Nothing. */ (
                block,
              ) => {
                calls.push(remember(block));
                if (calls.length === args[0]) throw new Error("mutation failure");
                Dispatch.resize_block(block, 1);
              },
            );
          } catch (error) {
            result = (error as Error).message;
          }
        } else if (op === "G")
          result = equal_blocks(
            s.element_blocks,
            (stores[args[0] as number] as blocks_type).element_blocks,
            /** Original registered equality callback. @param a - Left pointer. @param b - Right pointer. @returns Equality. */ (
              a,
              b,
            ) => {
              calls.push(remember(a), remember(b));
              return Dispatch.equal_block(a, b);
            },
          );
        else throw new Error(`Unknown native command ${op}`);
        for (const store of stores)
          for (const pointer of store.element_blocks.snapshot()) remember(pointer);
        const state = [
          result,
          snapshot(stores[0] as blocks_type, pool),
          snapshot(stores[1] as blocks_type, pool),
          pool.map(payload),
          (stores[0] as blocks_type).equals(stores[1] as blocks_type),
          calls,
        ];
        expect(state, `type${sample.type} step${step} command${command.join(" ")}`).toEqual(
          fixture.snapshots[sample.states[step] as number],
        );
        ++steps;
      }
    }
    expect(steps).toBe(
      fixture.cases.reduce(
        /** Counts all original complete records. @param n - Total. @param c - Case. @returns Count. */ (
          n,
          c,
        ) => n + c.states.length,
        0,
      ),
    );
  });
  it("retains original slot transfer and shared reserved-vector defaults", /** Checks original default fields and real syntax adapter allocations. @returns Nothing. */ () => {
    const slot = new block_slot_type(),
      transfer = new blocks_to_transfer(Traits);
    expect([
      slot.position,
      slot.size,
      slot.element_block === null,
      transfer.blocks.positions.size(),
      transfer.insert_index,
      false,
    ]).toEqual(fixture.defaults);
    const vector = new std_vector<number>();
    expect(vector.size()).toBe(0);
    expect(vector.capacity()).toBe(0);
    vector.reserve(8);
    expect(vector.store().values.length).toBe(8);
    expect(vector.size()).toBe(0);
    vector.insert(0, [1, 2, 3]);
    vector.erase(1, 1);
    expect(vector.snapshot()).toEqual([1, 3]);
    const copy = new std_vector(vector.snapshot());
    expect(copy.equals(vector)).toBe(true);
    copy.set(1, 8);
    expect(copy.equals(vector)).toBe(false);
    copy.push_back(9);
    expect(copy.equals(vector)).toBe(false);
    const storage: vector_storage<number> = { values: [], size: 0 };
    grow_storage(storage, 2);
    insert_storage(storage, 0, [2, 3]);
    assign_storage(storage, [7]);
    expect(storage.values.slice(0, storage.size)).toEqual([7]);
    expect(storage.values.length).toBe(2);
  });
  it("retains null-aware helper boundaries and actual three-array iterator borrowing", /** Exercises original equality predicate early calls and real owner/iterator storage identities. @returns Nothing. */ () => {
    const left = create(10, 2, "3") as base_element_block,
      right = create(10, 2, "4") as base_element_block;
    let calls = 0;
    /** Counts original BlockOp equality calls. @param a - Left. @param b - Right. @returns Equality. */
    function equal(a: base_element_block, b: base_element_block): boolean {
      ++calls;
      return Dispatch.equal_block(a, b);
    }
    expect(equal_blocks_pred(null, null, equal)).toBe(true);
    expect(equal_blocks_pred(left, null, equal)).toBe(false);
    expect(equal_blocks_pred(null, left, equal)).toBe(false);
    expect(calls).toBe(0);
    expect(equal_blocks_pred(left, left, equal)).toBe(true);
    expect(equal_blocks_pred(left, right, equal)).toBe(false);
    expect(calls).toBe(2);
    const store = new blocks_type(Traits);
    store.push_back(0, 2, left);
    store.push_back(2, 1, null);
    /** Borrows actual underlying allocated vectors in original grouped category. @param index - Native cursor. @returns Group. */
    function group(index: number): grouped_iterator_type {
      return new grouped_iterator_type(
        new vector_iterator(store.positions.store().values as number[], index),
        new vector_iterator(store.sizes.store().values as number[], index),
        new vector_iterator(
          store.element_blocks.store().values as (base_element_block | null)[],
          index,
        ),
      );
    }
    const itr = new iterator_base(
      { private_data_update: private_data_forward_update },
      group(0),
      group(store.positions.size()),
      store,
      0,
    );
    expect(itr.get().data).toBe(left);
    expect(itr.get().position).toBe(0);
    itr.increment();
    expect(itr.get().data).toBe(null);
    expect(itr.get().position).toBe(2);
    const other = new blocks_type(Traits),
      backing = store.positions.store();
    store.swap(other);
    expect(other.positions.store()).toBe(backing);
    expect(itr.get_pos().position_iterator.get()).toBe(2);
    store.swap(store);
    other.swap(0, 0);
    other.check_integrity();
    // Integrity/equality probes are meaningful even when native metadata lengths
    // differ; the enclosing MTV invariant is deliberately not claimed here.
    const malformed = new blocks_type(Traits);
    malformed.positions.push_back(0);
    expect(malformed.equals(store)).toBe(false);
    const a = new blocks_type(Traits),
      b = new blocks_type(Traits);
    a.push_back(0, 2, left);
    b.push_back(0, 3, left);
    expect(a.equals(b)).toBe(false);
    b.sizes.set(0, 2);
    b.element_blocks.clear();
    expect(a.equals(b)).toBe(false);
  });
});
