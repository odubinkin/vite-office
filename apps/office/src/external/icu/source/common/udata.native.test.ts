/** @fileoverview Original native app-data/once/cleanup/hash replay over one process-ordered stream. Source cleanup/reset intentionally preserves the once record's stored status; no private state reset or fake allocator/provider is introduced. */
import { createHash } from "node:crypto";
import { expect, it } from "vitest";
import native from "./udata.native-observations.json" with { type: "json" };
import common from "./ucmndata.native-observations.json" with { type: "json" };
import { observeAppData, type AppDataOp } from "../../../../../../../scripts/icu-appdata-observe";
/** Hashes every observed numeric field in its original order. @param row - Full initialized state. @returns SHA256. */
function digest(row: unknown): string {
  return createHash("sha256").update(JSON.stringify(row)).digest("hex");
}
it("retains original app-data process cache, once error publication, cleanup and string-key behavior", /** Executes actual original-shaped records/APIs through all retained native sequences in process order, including stored statuses retained across cleanup. @returns Nothing. */ () => {
  for (let i = 0; i < native.sequences.length; ++i) {
    const rows = observeAppData(native.sequences[i] as AppDataOp[], common.pkg);
    expect(rows.length).toBe(native.rowHashes[i]?.length);
    for (let j = 0; j < rows.length; ++j)
      expect(digest(rows[j]), `sequence ${i}, operation ${j}`).toBe(native.rowHashes[i]?.[j]);
  }
});
