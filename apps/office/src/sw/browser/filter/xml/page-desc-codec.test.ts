/** @fileoverview Verifies browser descriptor snapshots preserve absent and zero across actual item/worker owners. */
import { expect, it } from "vitest";
import { SwFormatPageDesc } from "../../../source/core/attr/fmtpdsc";
import { SwDoc } from "../../../source/core/doc/doc";
import { RES_PAGEDESC } from "../../../inc/hintids";
import { encodePageDesc, decodePageDesc } from "./page-desc-codec";
import { encodeSfxPoolItem, decodeSfxPoolItem } from "./item-codec";
import type { SfxPoolItemSnapshot } from "../../../../svl/source/items/poolitem";
it("preserves all offset states through JSON clones and actual item dispatch", /** Legacy pairs retain their historical zero-is-absent semantics. @returns Nothing. */ () => {
  const pool = new SwDoc().GetAttrPool();
  for (const offset of [undefined, 0, 32767, 32768, 55535, 65535]) {
    const item = new SwFormatPageDesc("Standard", offset);
    const snapshot = JSON.parse(JSON.stringify(encodeSfxPoolItem(item))) as SfxPoolItemSnapshot;
    expect(snapshot).toEqual(encodePageDesc(item));
    expect(decodeSfxPoolItem(pool, snapshot).equals(item)).toBe(true);
  }
  expect(
    decodePageDesc({ which: RES_PAGEDESC, value: ["Standard", 0] })?.GetNumOffset(),
  ).toBeUndefined();
  expect(decodePageDesc({ which: RES_PAGEDESC, value: ["Standard", 2] })?.GetNumOffset()).toBe(2);
  expect(decodePageDesc({ which: 1, value: false })).toBeUndefined();
});
it("rejects malformed descriptor values before constructing accepted native items", /** Boundary checks cover adversarial worker records without rewriting native contracts. @returns Nothing. */ () => {
  for (const value of [
    false,
    2,
    "bad",
    [],
    ["Standard"],
    [2, 3],
    ["Standard", "bad"],
    {},
    { name: 2 },
    { name: "Standard", numOffset: "bad" },
    { name: "Standard", numOffset: -1 },
    { name: "Standard", numOffset: 65536 },
  ])
    expect(
      /** Supplies an invalid boundary value. @returns Rejected value. */ () =>
        decodePageDesc({ which: RES_PAGEDESC, value }),
    ).toThrow();
});
