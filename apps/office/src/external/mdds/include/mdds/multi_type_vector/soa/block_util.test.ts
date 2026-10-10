/** @fileoverview Lossless original native position-adjustment comparisons using actual shared SoA arrays and their reserved vectors. */
import { describe, expect, it } from "vitest";
import fixture from "./native-position-adjustment-cases.json";
import { adjust_block_positions, type scalar_lu_factor } from "./block_util.ts";
import { blocks_type } from "./main.ts";
import { default_traits } from "../util.ts";
import { std_vector } from "../vector_storage.ts";
import { type base_element_block } from "../types.ts";
import { string_element_block } from "../standard_element_blocks.ts";
import { iterator_base, grouped_iterator_type, vector_iterator } from "./iterator.ts";
import { private_data_forward_update } from "../iterator_node.ts";

/** Serializes full native metadata, block aliases, capacities and payload. @param owner - Actual array owner. @param positions - Actual generic position vector. @param data - Real original scalar block. @returns Complete native record. */
function snapshot<S extends number | bigint>(
  owner: blocks_type,
  positions: std_vector<S>,
  data: base_element_block,
): unknown {
  return [
    positions
      .snapshot()
      .map(
        /** Retains lossless uint64 output syntax. @param value - Position. @returns Decimal. */ (
          value,
        ) => String(value),
      ),
    owner.sizes.snapshot(),
    owner.element_blocks
      .snapshot()
      .map(
        /** Preserves borrowed native pointer tokens. @param block - Pointer. @returns Token. */ (
          block,
        ) => (block === data ? 0 : -1),
      ),
    [positions.capacity(), owner.sizes.capacity(), owner.element_blocks.capacity()],
    [
      11,
      string_element_block.size(data),
      string_element_block.capacity(data),
      Array.from(
        { length: string_element_block.size(data) },
        /** Reads all original scalar payload values. @param _unused - Empty entry. @param i - Slot. @returns Scalar. */ (
          _unused,
          i,
        ) => string_element_block.at(data, i),
      ),
    ],
  ];
}

describe("original SoA position adjustment", /** Declares original shared owner comparisons. @returns Nothing. */ () => {
  it("matches every full unchanged native scalar specialization state", /** Replays the entire lossless native corpus through actual shared owners. @returns Nothing. */ () => {
    expect(fixture.defaults).toEqual([default_traits.loop_unrolling, 8, false, false, 0]);
    expect(fixture.factors).toEqual([0, 4, 8, 16, 32]);
    for (const c of fixture.cases)
      for (const bigint of [false, true]) {
        if (!bigint && !c.numberExact) continue;
        for (let f = 0; f < fixture.factors.length; ++f) {
          const owner = new blocks_type(default_traits);
          const data = string_element_block.create_block_with_value(2, "v");
          owner.reserve(c.positions.length + 7);
          for (let i = 0; i < c.positions.length; ++i)
            owner.push_back(bigint ? i : Number(c.positions[i]), 3 + (i % 5), i % 2 ? null : data);
          const positions: std_vector<number | bigint> = bigint
            ? new std_vector<bigint>()
            : owner.positions;
          if (bigint) {
            positions.reserve(c.positions.length + 7);
            for (const p of c.positions) positions.push_back(BigInt(p));
          }
          const storage = positions.store();
          const sizes = owner.sizes.store();
          const blocks = owner.element_blocks.store();
          expect(snapshot(owner, positions, data)).toEqual(
            fixture.snapshots[c.states[0] as number],
          );
          adjust_block_positions(fixture.factors[f] as scalar_lu_factor)(
            { positions },
            bigint ? BigInt(c.start) : Number(c.start),
            bigint ? BigInt(c.delta) : Number(c.delta),
          );
          expect(snapshot(owner, positions, data)).toEqual(
            fixture.snapshots[c.states[f + 1] as number],
          );
          expect(positions.store()).toBe(storage);
          expect(owner.sizes.store()).toBe(sizes);
          expect(owner.element_blocks.store()).toBe(blocks);
        }
      }
  });

  it("borrows the genuine default owner and preserves iterator cache boundaries", /** Checks original borrowed cache refresh behavior. @returns Nothing. */ () => {
    const owner = new blocks_type(default_traits);
    for (let i = 0; i < 17; ++i) owner.push_back(i * 2, 2, null);
    /** Borrows actual native array cursors. @param index - Current slot. @returns Original grouped iterator. */
    function group(index: number): grouped_iterator_type {
      return new grouped_iterator_type(
        new vector_iterator(owner.positions.store().values as number[], index),
        new vector_iterator(owner.sizes.store().values as number[], index),
        new vector_iterator(
          owner.element_blocks.store().values as (base_element_block | null)[],
          index,
        ),
      );
    }
    const cursor = new iterator_base(
      { private_data_update: private_data_forward_update },
      group(1),
      group(17),
      owner,
      1,
    );
    expect(cursor.get().position).toBe(2);
    adjust_block_positions(default_traits.loop_unrolling as scalar_lu_factor)(owner, 1, 3);
    expect(owner.positions.get(1)).toBe(5);
    expect(cursor.get().position).toBe(2);
    cursor.increment();
    expect(cursor.get().position).toBe(7);
    expect(owner.sizes.snapshot()).toEqual(Array<number>(17).fill(2));
    expect(owner.element_blocks.snapshot()).toEqual(Array<null>(17).fill(null));
  });
});
