/** @fileoverview Verifies pooled-item JSON encoding and decoding stay at the browser boundary. */

import { describe, expect, it } from "vitest";

import { SfxItemPool } from "../../../svl/source/items/itempool";
import { SfxItemSet } from "../../../svl/source/items/itemset";
import { SfxStringItem } from "../../../svl/source/items/poolitem";
import {
  decodeSfxItemSet,
  decodeSfxPoolItem,
  encodeSfxItemSet,
  encodeSfxPoolItem,
} from "./item-codec";

describe("browser Sfx item codec", /** Exercises JSON encoding at the browser boundary. @returns Nothing. */ () => {
  it("round-trips items and ordered item-set deltas through registered pool factories" /** Verifies stable WhichId-based decoding. @returns Nothing. */, () => {
    const pool = new SfxItemPool();
    pool.RegisterDefaultItem(
      new SfxStringItem(1, "default"),
      /** Restores WhichId one. @param value - Persisted value. @returns String item. */ (value) =>
        new SfxStringItem(1, String(value)),
    );
    pool.RegisterDefaultItem(
      new SfxStringItem(2, "default"),
      /** Restores WhichId two. @param value - Persisted value. @returns String item. */ (value) =>
        new SfxStringItem(2, String(value)),
    );
    const source = new SfxItemSet(pool, [[1, 2]]);
    source.Put(new SfxStringItem(2, "second"));
    source.Put(new SfxStringItem(1, "first"));
    const encoded = encodeSfxItemSet(source);
    expect(encoded).toEqual([
      { value: "first", which: 1 },
      { value: "second", which: 2 },
    ]);
    expect(encodeSfxPoolItem(source.Get(1))).toEqual(encoded[0]);
    expect(decodeSfxPoolItem(pool, encoded[0] as (typeof encoded)[number])).toEqual(source.Get(1));
    const restored = new SfxItemSet(pool, [[1, 2]]);
    decodeSfxItemSet(restored, encoded);
    expect(encodeSfxItemSet(restored)).toEqual(encoded);
  });
});
