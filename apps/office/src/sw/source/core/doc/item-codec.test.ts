/** @fileoverview Verifies pooled-item JSON encoding and decoding stay at the browser boundary. */

import { describe, expect, it } from "vitest";

import { SfxItemPool } from "../../../../svl/source/items/itempool";
import { SfxItemSet } from "../../../../svl/source/items/itemset";
import { SfxPoolItem } from "../../../../svl/source/items/poolitem";
import { SfxStringItem } from "../../../../svl/source/items/stritem";
import { SfxUnoAnyItem } from "../../../../sfx2/source/view/frame";
import {
  decodeSfxItemSet,
  decodeSfxPoolItem,
  encodeSfxItemSet,
  encodeSfxPoolItem,
} from "../../../browser/filter/xml/item-codec";

/** Test item exposing a chosen QueryValue for persistence validation. */
class QueryValueItem extends SfxPoolItem {
  /** Creates the test item. @param value - QueryValue result. @returns Nothing. */
  public constructor(private readonly value: unknown) {
    super(1);
  }

  /** Clones the test value. @returns Independent wrapper. */
  public Clone(): QueryValueItem {
    return new QueryValueItem(this.value);
  }

  /** Compares wrapper values. @param other - Candidate. @returns Whether values match by identity. */
  public equals(other: SfxPoolItem): boolean {
    return other instanceof QueryValueItem && other.value === this.value;
  }

  /** Returns the test value. @returns Configured value. */
  public QueryValue(): unknown {
    return this.value;
  }
}

/** Defers one item encoding for rejection assertions. @param item - Candidate item. @returns Deferred encoder. */
function encodeLater(item: SfxPoolItem): () => unknown {
  return /** Encodes the captured item. @returns Encoded record. */ () => encodeSfxPoolItem(item);
}

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

  it("rejects dispatcher-only UNO Any values", /** Keeps request arguments out of stored item records. @returns Nothing. */ () => {
    expect(encodeLater(new SfxUnoAnyItem(1, { name: "request-only" }))).toThrow(
      "cannot be persisted",
    );
    expect(encodeLater(new SfxUnoAnyItem(1, [{ value: "still-request-only" }]))).toThrow(
      "cannot be persisted",
    );
  });

  it("validates nested pooled-item snapshots recursively", /** Rejects malformed array values before storage. @returns Nothing. */ () => {
    expect(encodeSfxPoolItem(new QueryValueItem([{ value: "nested", which: 2 }]))).toEqual({
      value: [{ value: "nested", which: 2 }],
      which: 1,
    });
    expect(
      encodeSfxPoolItem(new QueryValueItem({ stops: [{ position: 720, fill: "." }] })).value,
    ).toEqual({ stops: [{ position: 720, fill: "." }] });
    for (const value of [[null], { stops: [Infinity] }, { stops: [new Date()] }])
      expect(encodeLater(new QueryValueItem(value))).toThrow("not persistence-safe");
    const item = new QueryValueItem("x");
    expect(item.Clone().equals(new QueryValueItem("x"))).toBe(true);
    expect(item.equals(new QueryValueItem("y"))).toBe(false);
    expect(item.equals(new SfxStringItem(1, "x"))).toBe(false);
  });
});
