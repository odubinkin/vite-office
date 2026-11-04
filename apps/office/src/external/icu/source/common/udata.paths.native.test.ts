/** @fileoverview Replays unchanged native directory/path observations against actual putil state and UDataPathIterator. Browser-absent environment/install-directory inputs are explicit; this does not certify file mapping or the pending open/service integration. */
import { createHash } from "node:crypto";
import { expect, it } from "vitest";
import native from "./udata.paths.native-observations.json" with { type: "json" };
import {
  observeDataPaths,
  type DataPathOp,
} from "../../../../../../../scripts/icu-data-path-observe";
/** Hashes every initialized field in source order. @param row - Complete observation. @returns SHA256. */
function digest(row: number[]): string {
  return createHash("sha256").update(JSON.stringify(row)).digest("hex");
}
it("retains original directory once/status/cleanup and path iterator transitions", /** Runs every process-ordered original input and compares every retained snapshot hash. @returns Nothing. */ () => {
  const groups = observeDataPaths(native.sequences as DataPathOp[][]);
  expect(groups.length).toBe(native.hashes.length);
  for (let i = 0; i < groups.length; ++i) {
    const rows = groups[i] as number[][];
    expect(rows.length).toBe(native.hashes[i]?.length);
    for (let j = 0; j < rows.length; ++j)
      expect(digest(rows[j] as number[]), `sequence${i} op${j}`).toBe(native.hashes[i]?.[j]);
  }
});
