/** @fileoverview Complete unchanged native SoA iterator observations over three borrowed arrays and actual shared blocks. */
import { describe, expect, it } from "vitest";
import fixture from "./native-iterator-cases.json";
import utilFixture from "../native-util-cases.json";
import {
  type IteratorNodeView,
  iterator_private_data,
  iterator_value_node,
  private_data_forward_update,
  private_data_no_update,
} from "../iterator_node.ts";
import { standard_element_blocks_traits } from "../standard_element_blocks.ts";
import { advance_position } from "../util.ts";
import {
  const_iterator_base,
  grouped_iterator_type,
  iterator_base,
  iterator_updater,
  vector_iterator,
} from "./iterator.ts";
/** Original primitive node fields, with stable data pointer token. */
type NodeRecord = readonly number[];
/** Borrows arrays populated from complete native setup observations; no runtime MTV replacement. @param nodes - Full native metadata. @returns Borrowed arrays. */
function arrays(nodes: readonly NodeRecord[]) {
  return {
    parent: {},
    positions: nodes.map(
      /** Extracts native array entry. @param nd - Node. @returns Position. */ (nd) =>
        nd[1] as number,
    ),
    sizes: nodes.map(
      /** Extracts native array entry. @param nd - Node. @returns Size. */ (nd) => nd[2] as number,
    ),
    blocks: nodes.map(
      /** Allocates actual shared scalar block of original type/size. @param nd - Node. @returns Block pointer. */ (
        nd,
      ) =>
        nd[0] === -1
          ? null
          : standard_element_blocks_traits.block_funcs.create_new_block(
              nd[0] as number,
              nd[2] as number,
            ),
    ),
  };
}
/** Actual iterator test input arrays and borrowed parent. */
type Arrays = ReturnType<typeof arrays>;
/** Constructs original three separate grouped cursor values. @param store - Borrowed arrays. @param index - Native array offset. @param reverse - Category. @returns Group. */
function group(store: Arrays, index: number, reverse: boolean): grouped_iterator_type {
  return new grouped_iterator_type(
    new vector_iterator(store.positions, index, reverse),
    new vector_iterator(store.sizes, index, reverse),
    new vector_iterator(store.blocks, index, reverse),
  );
}
/** Constructs original mutable iterator with its actual policy witness. @param store - Arrays. @param reverse - Category. @param end - End constructor. @returns Iterator. */
function mutable(store: Arrays, reverse: boolean, end = false): iterator_base<object> {
  const n = store.sizes.length,
    start = reverse ? n - 1 : 0,
    stop = reverse ? -1 : n;
  return new iterator_base(
    { private_data_update: reverse ? private_data_no_update : private_data_forward_update },
    group(store, end ? stop : start, reverse),
    group(store, stop, reverse),
    store.parent,
    reverse ? 0 : end ? n : 0,
  );
}
/** Complete stable pointer/cursor projection matching native records; end private fields are deliberately omitted. @param itr - Iterator. @param store - Arrays. @param reverse - Category. @returns State. */
function observe(itr: IteratorObservation, store: Arrays, reverse: boolean): unknown[] {
  const pos = itr.get_pos(),
    end = itr.get_end(),
    nd = itr.get_node();
  const atEnd = pos.equals(end);
  const distance =
    /** Projects std::distance from original category begin. @param cursor - Array cursor. @returns Distance. */ (cursor: {
      index: number;
    }) => (reverse ? store.sizes.length - 1 - cursor.index : cursor.index);
  return [
    [
      distance(pos.position_iterator),
      distance(pos.size_iterator),
      distance(pos.element_block_iterator),
    ],
    [
      distance(end.position_iterator),
      distance(end.size_iterator),
      distance(end.element_block_iterator),
    ],
    [nd.type, nd.position, nd.size, nd.data === null ? -1 : store.blocks.indexOf(nd.data)],
    atEnd ? null : nd.__private_data.parent === store.parent ? 0 : -1,
    atEnd ? null : nd.__private_data.block_index,
    atEnd,
  ];
}
/** Public observation contract shared by the original two template specializations. */
interface IteratorObservation {
  get_pos(): Readonly<grouped_iterator_type>;
  get_end(): Readonly<grouped_iterator_type>;
  get_node(): IteratorNodeView<object>;
}
/** Self-typed original traversal contract, retaining mutable/const static distinction. */
interface Traversal<I> extends IteratorObservation {
  copy(): I;
  assign(other: I): unknown;
  swap(other: I): void;
  equals(other: I): boolean;
  not_equals(other: I): boolean;
  get(): IteratorNodeView<object>;
  increment(): unknown;
  decrement(): unknown;
  advance(steps: number): I;
}
/** Compares every original full operation sequence for one static/category specialization. @param create - Iterator constructor. @param convert - Original const conversion/copy. @param expected - Complete native records. @param store - Arrays. @param reverse - Category. @returns Nothing. */
function compare<I extends Traversal<I>>(
  create: () => I,
  convert: (itr: I) => const_iterator_base<object>,
  expected: { forward: unknown[]; backward: unknown[]; pairs: unknown[] },
  store: Arrays,
  reverse: boolean,
): void {
  const itr = create(),
    reference = itr.get();
  const forward = [];
  for (let k = 0; k <= store.sizes.length; ++k) {
    const cp = itr.copy(),
      ci = convert(itr);
    expect(cp.get()).not.toBe(reference);
    forward.push([
      observe(itr, store, reverse),
      observe(cp, store, reverse),
      observe(ci, store, reverse),
      itr.equals(cp),
    ]);
    if (k < store.sizes.length) itr.increment();
    expect(itr.get()).toBe(reference);
  }
  expect(forward).toEqual(expected.forward);
  const backward = [];
  for (let k = 0; k < store.sizes.length; ++k) {
    itr.decrement();
    backward.push(observe(itr, store, reverse));
    expect(itr.get()).toBe(reference);
  }
  expect(backward).toEqual(expected.backward);
  const pairs = [];
  for (let i = 0; i <= store.sizes.length; ++i)
    for (let j = 0; j <= store.sizes.length; ++j) {
      const a = create().advance(i),
        b = create().advance(j),
        assigned = create(),
        aRef = a.get(),
        posRef = a.get_pos(),
        endRef = a.get_end();
      const eq = a.equals(b),
        neq = a.not_equals(b);
      assigned.assign(a);
      assigned.assign(assigned);
      const assignment = observe(assigned, store, reverse);
      a.swap(b);
      expect(a.get()).toBe(aRef);
      expect(a.get_pos()).toBe(posRef);
      expect(a.get_end()).toBe(endRef);
      const ca = convert(a),
        cb = convert(b);
      ca.swap(cb);
      pairs.push([
        i,
        j,
        eq,
        neq,
        assignment,
        observe(a, store, reverse),
        observe(b, store, reverse),
        observe(ca, store, reverse),
        observe(cb, store, reverse),
      ]);
    }
  expect(pairs).toEqual(expected.pairs);
  const away = create().advance(store.sizes.length);
  away.advance(-store.sizes.length);
  expect(away.equals(create())).toBe(true);
  expect(create().advance(0).equals(create())).toBe(true);
}
describe("original mdds SoA iterator owners", /** Defines genuine iterator comparisons. @returns Nothing. */ () => {
  it("matches complete native mutable const forward reverse iterator states", /** Compares every genuine native operation record. @returns Nothing. */ () => {
    for (const layout of fixture.layouts) {
      const store = arrays(layout.nodes);
      for (const reverse of [false, true]) {
        compare(
          /** Constructs mutable native specialization. @returns Iterator. */ () =>
            mutable(store, reverse),
          const_iterator_base.from_mutable,
          reverse ? layout.reverse : layout.normal,
          store,
          reverse,
        );
        compare(
          /** Constructs const native specialization. @returns Iterator. */ () =>
            const_iterator_base.from_mutable(mutable(store, reverse)),
          /** Copies original const cached node. @param itr - Const iterator. @returns Copy. */ (
            itr,
          ) => itr.copy(),
          reverse ? layout.constant_reverse : layout.constant,
          store,
          reverse,
        );
      }
      if (layout.mutation) {
        const itr = mutable(store, false);
        itr.get().type = 42;
        itr.get().position = 99;
        itr.get().size = 55;
        const cp = itr.copy(),
          ci = const_iterator_base.from_mutable(itr);
        expect([
          observe(itr, store, false),
          observe(cp, store, false),
          observe(ci, store, false),
          itr.equals(mutable(store, false)),
          itr.not_equals(mutable(store, false)),
        ]).toEqual(layout.mutation);
      }
    }
  });
  it("retains original node defaults identity comparison and update policies", /** Verifies complete original fields and static policies. @returns Nothing. */ () => {
    const priv = new iterator_private_data<object>(),
      nd = new iterator_value_node<object>(null, 0);
    expect([
      nd.type,
      nd.position,
      nd.size,
      nd.data === null,
      priv.parent === null,
      priv.block_index,
    ]).toEqual(fixture.defaults);
    const parent = {},
      otherParent = {},
      block = standard_element_blocks_traits.block_funcs.create_new_block(10, 2);
    nd.__private_data.parent = parent;
    nd.__private_data.block_index = 3;
    nd.data = block;
    nd.type = 10;
    nd.position = 4;
    nd.size = 2;
    const cp = nd.copy();
    expect(cp.equals(nd)).toBe(true);
    expect(cp.data).toBe(block);
    expect(cp.__private_data).not.toBe(nd.__private_data);
    for (const field of ["type", "position", "size", "data", "parent", "block_index"]) {
      const mismatch = nd.copy();
      if (field === "data") mismatch.data = null;
      else if (field === "parent") mismatch.__private_data.parent = otherParent;
      else if (field === "block_index") ++mismatch.__private_data.block_index;
      else ++mismatch[field as "type" | "position" | "size"];
      expect(nd.equals(mismatch)).toBe(false);
      expect(nd.not_equals(mismatch)).toBe(true);
    }
    const blank = new iterator_value_node<object>(null, 0),
      ref = blank.__private_data;
    nd.swap(blank);
    expect(blank.equals(cp)).toBe(true);
    expect(blank.__private_data).toBe(ref);
    blank.swap(blank);
    expect(blank.equals(cp)).toBe(true);
    private_data_forward_update.inc(blank);
    expect(blank.__private_data.block_index).toBe(4);
    private_data_forward_update.dec(blank);
    expect(blank.equals(cp)).toBe(true);
    private_data_no_update.inc(blank);
    private_data_no_update.dec(blank);
    expect(blank.equals(cp)).toBe(true);
  });
  it("retains singular construction and all three grouped comparison boundaries", /** Covers original defaults and grouped source identity. @returns Nothing. */ () => {
    const updater = new iterator_updater<object>();
    expect(updater.equals(new iterator_updater<object>())).toBe(true);
    expect(updater.get_node()).toEqual(new iterator_value_node<object>(null, 0));
    const traits = { private_data_update: private_data_forward_update };
    const a = new iterator_base<object>(traits),
      b = new iterator_base<object>(traits),
      ca = new const_iterator_base<object>(traits),
      cb = new const_iterator_base<object>(traits);
    expect([a.equals(b), a.not_equals(b), ca.equals(cb), ca.not_equals(cb)]).toEqual(
      fixture.singular,
    );
    expect(const_iterator_base.from_mutable(a).equals(ca)).toBe(true);
    const store = arrays([
        [10, 0, 1, 0],
        [11, 1, 1, 1],
      ]),
      g = group(store, 0, false);
    for (const member of [
      "position_iterator",
      "size_iterator",
      "element_block_iterator",
    ] as const) {
      const other = g.copy();
      other[member].inc();
      expect(g.equals(other)).toBe(false);
      expect(g.not_equals(other)).toBe(true);
    }
    const different = arrays([
      [10, 0, 1, 0],
      [11, 1, 1, 1],
    ]);
    expect(g.equals(group(different, 0, false))).toBe(false);
    const samePosOtherEnd = new iterator_base(traits, g, group(store, 1, false), store.parent, 0);
    expect(mutable(store, false).equals(samePosOtherEnd)).toBe(false);
    const end = mutable(store, false, true),
      byWalk = mutable(store, false).advance(2);
    expect(end.equals(byWalk)).toBe(true);
    expect(byWalk.equals(end)).toBe(true);
    expect(end.equals(mutable(different, false, true))).toBe(false);
    const foreign = mutable(store, false);
    foreign.get().__private_data.parent = different.parent;
    expect(mutable(store, false).equals(foreign)).toBe(false);
  });
  it("replays native position utilities through actual shared SoA iterators", /** Replaces no container; exercises generic utility with real runtime iterator owners. @returns Nothing. */ () => {
    for (const layout of utilFixture.layouts) {
      const store = arrays(layout.nodes);
      for (const entry of layout.positions) {
        const [, steps, mut, con] = entry as unknown as [
          number,
          number,
          [number[], unknown[]],
          [number[], unknown[]],
        ];
        const source = mut[0],
          index = source[0] as number,
          offset = source[1] as number;
        for (const itr of [
          mutable(store, false).advance(index),
          const_iterator_base.from_mutable(mutable(store, false).advance(index)),
        ]) {
          const before = observe(itr, store, false);
          const pos = { first: itr, second: offset };
          // Generic utility preserves the exact static iterator specialization.
          const result =
            itr instanceof iterator_base
              ? advance_position({ first: itr, second: pos.second }, steps)
              : advance_position({ first: itr, second: pos.second }, steps);
          const atEnd = result.first.get_pos().equals(result.first.get_end()),
            nd = result.first.get();
          const record = [
            result.first.get_pos().position_iterator.index,
            result.second,
            atEnd,
            atEnd
              ? null
              : [
                  nd.type,
                  nd.position,
                  nd.size,
                  nd.data === null ? -1 : store.blocks.indexOf(nd.data),
                ],
          ];
          expect(record).toEqual((itr instanceof iterator_base ? mut : con)[1]);
          expect(observe(itr, store, false)).toEqual(before);
          expect(result.first).not.toBe(itr);
        }
      }
    }
  });
});
