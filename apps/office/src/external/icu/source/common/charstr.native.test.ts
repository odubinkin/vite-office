/** @fileoverview Replays initialized byte-owner observations from the original ICU78.3 library. These checks cover actual CharString and byte-specialized MaybeStackArray, not native allocator/stack ABI or the still-pending udata_open orchestration. */
import { createHash } from "node:crypto";
import { expect, it } from "vitest";
import native from "./charstr.native-observations.json" with { type: "json" };
import { observeCharStrings, type CharOp } from "../../../../../../../scripts/icu-charstr-observe";
/** Hashes the complete numeric snapshot in source order. @param row - All initialized fields/bytes. @returns SHA256. */
function digest(row: number[]): string {
  return createHash("sha256").update(JSON.stringify(row)).digest("hex");
}
it("retains original CharString byte, alias, growth, status and storage ownership behavior", /** Replays every retained genuine-library sequence through the actual owners. @returns Nothing. */ () => {
  for (let i = 0; i < native.sequences.length; ++i) {
    const rows = observeCharStrings(native.sequences[i] as CharOp[]);
    expect(rows.length).toBe(native.hashes[i]?.length);
    for (let j = 0; j < rows.length; ++j)
      expect(digest(rows[j] as number[]), `sequence ${i}, operation ${j}`).toBe(
        native.hashes[i]?.[j],
      );
  }
});
