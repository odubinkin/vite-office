/** @fileoverview Portable comparisons against genuine unchanged mdds3.2.1 headers and source iterator/node contracts. */
import { readFileSync } from "node:fs";
import { URL as NodeURL } from "node:url";
import { describe, expect, it } from "vitest";
import { flat_segment_tree } from "./flat_segment_tree";
import type { SearchResult } from "./flat_segment_tree";
import {
  const_iterator,
  const_iterator_base,
  const_segment_iterator,
  iterator_state,
} from "./flat_segment_tree_itr";
import type { SegmentValue, node_base } from "./node";
import {
  node,
  nonleaf_node,
  tree_builder,
  link_nodes,
  disconnect_all_nodes,
  disconnect_leaf_nodes,
  count_leaf_nodes,
  count_needed_nonleaf_nodes,
} from "./node";
import { ref_pair } from "./ref_pair";

/** Native forward iterator observations, including dereferenceable terminal/end. */
type IteratorRecord = [boolean, number, SegmentValue];
/** Initialized native commands. */
type Operation = [string, number, ...number[]];
/** One unchanged native step's compact references. */
type Step = [[boolean, IteratorRecord] | null, number, number, boolean];
/** Explicit portable fixture avoids inference over large heterogeneous JSON. */
interface NativeFixture {
  baselineCommit: string;
  archiveHashes: { mdds: string; boost: string };
  snapshots: unknown[][];
  cases: {
    kind: "number" | "boolean";
    initial: number;
    bounds: [number, number];
    operations: Operation[];
    output: Step[];
  }[];
}
const fixture = JSON.parse(
  readFileSync(new NodeURL("./native-flat-segment-cases.json", import.meta.url), "utf8"),
) as NativeFixture;
/** Observes independent end flag and terminal pair. @param tree - Receiving owner. @param iterator - Native iterator. @returns Values. */
function iteratorRecord(
  tree: flat_segment_tree<SegmentValue>,
  iterator: const_iterator<SegmentValue>,
): IteratorRecord {
  return [iterator.equals(tree.end()), iterator.value().first, iterator.value().second];
}
/** Initializes the same default/local/past/foreign hints as native. @param tree - Owner. @param foreign - Other owner. @param kind - Hint code. @returns Iterator. */
function hint(
  tree: flat_segment_tree<SegmentValue>,
  foreign: flat_segment_tree<SegmentValue>,
  kind: number,
): const_iterator<SegmentValue> {
  if (kind === 1) return tree.begin();
  if (kind === 2) return tree.end();
  if (kind === 3) return tree.end().decrement().decrement();
  if (kind === 4) return foreign.begin();
  return new const_iterator<SegmentValue>();
}
/** Collects all original public observations without constructing an index. @param tree - Owner. @param foreign - Live foreign hint owner. @param value - Native cast specialization. @returns Full snapshot. */
function snapshot(
  tree: flat_segment_tree<SegmentValue>,
  foreign: flat_segment_tree<SegmentValue>,
  value: (n: number) => SegmentValue,
): unknown[] {
  const prefix = [tree.valid_tree(), tree.default_value(), tree.leaf_size()];
  if (tree.leaf_size() === 1) return [...prefix, null];
  const leaves = [],
    reverse = [],
    segments = [],
    queries = [];
  for (let it = tree.begin(); !it.equals(tree.end()); it.increment())
    leaves.push([it.value().first, it.value().second]);
  for (let it = tree.rbegin(); !it.equals(tree.rend()); it.increment())
    reverse.push([it.value().first, it.value().second]);
  for (let it = tree.begin_segment(); !it.equals(tree.end_segment()); it.increment())
    segments.push(Object.values(it.value()));
  for (let key = -1; key <= 9; ++key) {
    const searches = [];
    for (let mode = 0; mode < 7; ++mode) {
      const output =
        mode === 0
          ? tree.search(key, value(77), -71, -72)
          : mode === 1
            ? tree.search_tree(key, value(77), -71, -72)
            : tree.search(hint(tree, foreign, mode - 2), key, value(77), -71, -72);
      searches.push([output[1], output[2], output[3], output[4], iteratorRecord(tree, output[0])]);
    }
    const iterators = [
      iteratorRecord(tree, tree.search(key)),
      iteratorRecord(tree, tree.search_tree(key)),
    ];
    for (let n = 0; n < 5; ++n)
      iterators.push(iteratorRecord(tree, tree.search(hint(tree, foreign, n), key)));
    queries.push([...searches, iterators]);
  }
  return [...prefix, leaves, reverse, segments, queries];
}

describe("pinned mdds flat segment storage", /** Groups genuine native comparisons and independent contract cases. @returns Nothing. */ () => {
  describe("matches every unchanged native insertion, shift, index and copy/move snapshot", /** Registers both original value specializations without changing the test budget. @returns Nothing. */ () => {
    for (const kind of ["number", "boolean"] as const) {
      const states = fixture.cases.filter(
        /** Selects complete independent native callers for one specialization. @param state - Native caller. @returns Specialization membership. */
        (state) => state.kind === kind,
      );
      for (let offset = 0; offset < states.length; offset += 100) {
        it(`matches original ${kind} specialization snapshots ${offset}-${Math.min(offset + 100, states.length)}`, /** Replays every recorded native step in a bounded group of independent callers. @returns Nothing. */ () => {
          expect(fixture.baselineCommit).toBe("9bc445578031fecf56086729d8e4940c77e14d65");
          expect(fixture.archiveHashes.mdds).toBe(
            "673f5bb94612dbba581fc92b99b5e5dd1a53e29496a5dbc936432f6b0687c112",
          );
          for (const state of states.slice(offset, offset + 100)) {
            /** Applies the original native value cast. @param n - Integer input. @returns Specialized value. */
            function cast(n: number): SegmentValue {
              return state.kind === "boolean" ? Boolean(n) : n;
            }
            const trees: [flat_segment_tree<SegmentValue>, flat_segment_tree<SegmentValue>] = [
              new flat_segment_tree(...state.bounds, cast(state.initial)),
              new flat_segment_tree(...state.bounds, cast(3)),
            ];
            const foreign = new flat_segment_tree(0, 8, cast(3));
            foreign.insert_front(2, 5, cast(2));
            for (let i = 0; i < Math.max(1, state.operations.length); ++i) {
              const command = state.operations[i];
              let inserted: [boolean, IteratorRecord] | null = null;
              if (command) {
                const [op, index, first = 0, second = 0, third = 0, fourth = 0] = command;
                const target = index as 0 | 1,
                  tree = trees[target];
                if (op === "F" || op === "B" || op === "I") {
                  const result =
                    op === "F"
                      ? tree.insert_front(first, second, cast(third))
                      : op === "B"
                        ? tree.insert_back(first, second, cast(third))
                        : tree.insert(hint(tree, foreign, fourth), first, second, cast(third));
                  inserted = [result[1], iteratorRecord(tree, result[0])];
                } else if (op === "T") tree.build_tree();
                else if (op === "E") tree.clear();
                else if (op === "L") tree.shift_left(first, second);
                else if (op === "R") tree.shift_right(first, second, Boolean(third));
                else if (op === "C") trees[target] = new flat_segment_tree(trees[first as 0 | 1]);
                else if (op === "A") tree.assign(trees[first as 0 | 1]);
                else if (op === "V") trees[target] = flat_segment_tree.move(trees[first as 0 | 1]);
                else if (op === "W") tree.moveAssign(trees[first as 0 | 1]);
                else if (op === "S") tree.swap(trees[first as 0 | 1]);
                else throw new Error(`Unknown original command ${op}`);
              }
              const expected = state.output[i] as Step;
              expect(
                [
                  inserted,
                  snapshot(trees[0], foreign, cast),
                  snapshot(trees[1], foreign, cast),
                  trees[0].equals(trees[1]),
                ],
                JSON.stringify(command),
              ).toEqual([
                expected[0],
                fixture.snapshots[expected[1]],
                fixture.snapshots[expected[2]],
                expected[3],
              ]);
            }
          }
        });
      }
    }
  });
  it("retains terminal zero, hint overload asymmetry and omitted output references", /** Verifies independently visible native search/default contracts. @returns Nothing. */ () => {
    const tree = new flat_segment_tree<number>(0, 8, 9);
    expect(tree.end().value().second).toBe(0);
    expect(tree.search(new const_iterator<number>(), 2).equals(tree.end())).toBe(true);
    expect(tree.search(new const_iterator<number>(), 2, 77)[2]).toBe(9);
    const foreign = new flat_segment_tree<number>(0, 8, 42);
    expect(tree.search(foreign.begin(), 2).value().second).toBe(42);
    expect(tree.search(foreign.begin(), 2, 77)[2]).toBe(9);
    expect(tree.search(2, 77)).toMatchObject([expect.anything(), true, 9, null, null]);
    expect(tree.search(2, 77, null, -72).slice(1)).toEqual([true, 9, null, 8]);
    expect(tree.search(2, 77, -71, null).slice(1)).toEqual([true, 9, 0, null]);
    expect(tree.search(8, 77).slice(1)).toEqual([false, 77, null, null]);
    tree.build_tree();
    expect(tree.is_tree_valid()).toBe(true);
    expect(tree.search_tree(2, 77).slice(1)).toEqual([true, 9, null, null]);
    expect(tree.search_tree(2, 77, -71).slice(1)).toEqual([true, 9, 0, null]);
    expect(tree.search_tree(2, 77, null, -72).slice(1)).toEqual([true, 9, null, 8]);
    expect(tree.min_key()).toBe(0);
    expect(tree.max_key()).toBe(8);
  });
  it("preserves iterator ownership, independent end flags and live borrowed values", /** Verifies valid forward/reverse movement and cached segment copy semantics. @returns Nothing. */ () => {
    const tree = new flat_segment_tree<number>(0, 8, 0);
    tree.insert_front(2, 4, 1);
    expect(new const_iterator_base<number>().copy().equals(new const_iterator_base<number>())).toBe(
      true,
    );
    const first = tree.begin(),
      copy = first.copy();
    expect(copy.equals(first)).toBe(true);
    expect(first.equals(new const_iterator())).toBe(false);
    const assigned = new const_iterator<number>().assign(first);
    expect(assigned.equals(first)).toBe(true);
    const pair = first.value();
    tree.insert_front(0, 1, 2);
    expect(pair.second).toBe(2);
    expect(pair.equals([0, 2])).toBe(true);
    expect(pair.equals([0, 9])).toBe(false);
    expect(pair.equals(first.value())).toBe(true);
    const end = tree.end();
    expect(end.copy().decrement().value().first).toBe(8);
    end.decrement().increment();
    expect(end.equals(tree.end())).toBe(true);
    const reversed = tree.rend().copy().decrement();
    expect(reversed.value().first).toBe(0);
    reversed.decrement();
    expect(reversed.value().first).toBe(1);
    const mid = tree.search(2);
    expect(mid.copy().decrement().value().first).toBe(1);
    const range = tree.segment_range();
    expect(range.begin().value()).toEqual({ start: 0, end: 1, value: 2 });
    const segment = mid.to_segment(),
      cache = segment.value();
    expect(cache).toEqual({ start: 2, end: 4, value: 1 });
    segment.increment();
    expect(cache).toEqual({ start: 4, end: 8, value: 0 });
    segment.increment();
    expect(segment.equals(range.end())).toBe(true);
    expect(cache).toEqual({ start: 4, end: 8, value: 0 });
    expect(segment.copy().value()).toEqual({ start: 0, end: 0, value: 0 });
    expect(tree.end().to_segment().equals(tree.end_segment())).toBe(true);
    expect(tree.end().decrement().to_segment().equals(tree.end_segment())).toBe(true);
    segment.decrement();
    expect(segment.value()).toEqual({ start: 4, end: 8, value: 0 });
    const destination = tree.begin_segment();
    destination.assign(new const_segment_iterator<number>(null, null, 0));
    expect(destination.value()).toEqual({ start: 0, end: 1, value: 2 });
    destination.assign(tree.begin_segment());
    expect(destination.copy().value()).toEqual(destination.value());
    tree.clear();
    expect(range.begin().value()).toEqual({ start: 0, end: 8, value: 0 });
    expect(iterator_state(assigned).pos).toBe(iterator_state(first).pos);
  });
  it("preserves original leaf/nonleaf copy and assignment ownership", /** Verifies source node contracts and bottom-up pairing, including unpaired terminal leaf. @returns Nothing. */ () => {
    const a = new node<number>(0),
      b = new node<number>(0),
      c = new node<number>(0);
    a.key = 0;
    b.key = 3;
    c.key = 8;
    b.value_leaf.value = 7;
    link_nodes(a, b);
    link_nodes(b, c);
    const copy = new node<number>(b);
    expect(copy.equals(b)).toBe(true);
    expect(copy.parent).toBeNull();
    expect(copy.prev).toBeNull();
    a.assign(b);
    expect(a.key).toBe(0);
    expect(a.value_leaf.value).toBe(7);
    expect(a.next).toBe(b);
    expect(a.assign(a)).toBe(a);
    expect(a.to_string()).toBe("[0]");
    expect(count_leaf_nodes(a, c)).toBe(3);
    expect(count_leaf_nodes(null, null)).toBe(1);
    const pool = Array.from(
      { length: count_needed_nonleaf_nodes(3) },
      /** Allocates exact native pool slots. @returns Slot. */ () => new nonleaf_node<number>(),
    );
    const root = new tree_builder(pool).build(a) as nonleaf_node<number>;
    expect([root.low, root.high]).toEqual([0, 8]);
    expect(root.left).toBe(pool[0]);
    expect(root.right).toBe(pool[1]);
    expect(pool[1]?.left).toBe(c);
    expect(pool[1]?.right).toBeNull();
    const nc = new nonleaf_node(root);
    expect(nc.equals(root)).toBe(true);
    expect(nc.left).toBeNull();
    nc.low = 1;
    nc.assign(root);
    expect(nc.low).toBe(1);
    expect(nc.equals(root)).toBe(false);
    expect(nc.to_string()).toBe("[1-8)");
    disconnect_all_nodes(null);
    disconnect_leaf_nodes(null, null);
    disconnect_leaf_nodes(a, c);
    expect(b.next).toBeNull();
    expect(c.parent).toBeNull();
    expect(new tree_builder<number>([]).build(null)).toBeNull();
    const base: node_base<number> = a;
    expect(base.is_leaf).toBe(true);
    expect(new ref_pair(copy).equals([3, 7])).toBe(true);
  });
  it("retains full-span right shift defaults and unequal leaf list lengths", /** Exercises original meaningful branch boundaries outside the central small matrix. @returns Nothing. */ () => {
    const tree = new flat_segment_tree<number>(0, 8, 0);
    tree.insert_front(0, 8, 1);
    tree.shift_right(0, 8, false);
    expect(tree.begin().value().second).toBe(0);
    tree.insert_front(0, 8, 1);
    tree.shift_right(0, 2, false);
    expect(tree.search(2).value().second).toBe(1);
    const plain = new flat_segment_tree<number>(0, 8, 0);
    expect(tree.equals(plain)).toBe(false);
    expect(plain.equals(tree)).toBe(false);
    const moved = flat_segment_tree.move(plain);
    plain.build_tree();
    expect(plain.valid_tree()).toBe(false);
    expect(moved.equals(plain)).toBe(false);
    expect(plain.equals(moved)).toBe(false);
    const movedAgain = flat_segment_tree.move(moved);
    expect(plain.equals(moved)).toBe(true);
    expect(movedAgain.equals(plain)).toBe(false);
    const value: SearchResult<number> = tree.search(tree.end(), 8, 55);
    expect(value.slice(1)).toEqual([false, 55, null, null]);
  });
});
