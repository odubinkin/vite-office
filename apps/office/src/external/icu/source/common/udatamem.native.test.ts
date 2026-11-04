/** @fileoverview Replay of genuine ICU78.3 full UDataMemory/header and actual data-handle rule-owner observations. No alternate loader or file mapper. */
import { createHash } from "node:crypto";
import { expect, it } from "vitest";
import native from "./udatamem.native-observations.json" with { type: "json" };
import { observeUData, type UDataCase } from "../../../../../../../scripts/icu-udata-observe";
/** Hashes the complete native-observable row. @param row - Full fields. @returns SHA256. */
function digest(row: unknown): string {
  return createHash("sha256").update(JSON.stringify(row)).digest("hex");
}
const binaries = native.binaries.map(
  /** Decodes actual original compiled rules. @param b - Original binary. @returns Actual bytes. */ (
    b,
  ) => Uint8Array.from(Buffer.from(b.binary, "base64")),
);
for (const group of native.scalar) {
  it(`retains all original uint16 header/info queries with endian marker ${group.endian}`, /** Exercises every size and compares the aggregate of full native rows including header bytes. @returns Nothing. */ () => {
    const hashes: string[] = [];
    for (let size = 0; size < 65536; ++size)
      hashes.push(
        digest(observeUData({ kind: "S", args: [size, size ^ 0x5aa5, group.endian] }, binaries)),
      );
    expect(hashes.length).toBe(group.count);
    expect(digest(hashes)).toBe(group.hash);
  });
}
for (const kind of ["Z", "N", "H", "A", "M", "R"]) {
  it(`retains complete native ${kind} descriptor and owner traces`, /** Invokes actual helpers/constructors and compares every initialized field through full-row fingerprints. Physical munmap/heap-after-close is outside this managed binding. @returns Nothing. */ () => {
    for (let i = 0; i < native.cases.length; ++i) {
      const item = native.cases[i] as UDataCase;
      if (item.kind !== kind) continue;
      expect(digest(observeUData(item, binaries)), JSON.stringify(item)).toBe(native.hashes[i]);
    }
  });
}
