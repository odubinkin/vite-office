/** @fileoverview Verifies LibreOffice-shaped incremental ZIP CRC-32 behavior. */

import { describe, expect, it } from "vitest";

import { CRC32 } from "./CRC32";

describe("CRC32" /** Executes the enclosing deterministic test or transformation callback. @returns Callback result. */, () => {
  it("computes, segments, resets, and validates the standard ZIP checksum" /** Executes the enclosing deterministic test or transformation callback. @returns Callback result. */, () => {
    const bytes = new TextEncoder().encode("123456789");
    expect(CRC32.compute(bytes)).toBe(0xcbf43926);
    const crc = new CRC32();
    expect(crc.getValue()).toBe(0);
    crc.updateSegment(bytes, 4);
    crc.updateSegment(bytes.slice(4));
    expect(crc.getValue()).toBe(0xcbf43926);
    crc.reset();
    crc.updateSegment(new Uint8Array());
    expect(crc.getValue()).toBe(0);
    for (const length of [-1, 10, 1.5])
      expect(
        /** Executes the enclosing deterministic test or transformation callback. @returns Callback result. */
        () => crc.updateSegment(bytes, length),
      ).toThrow("CRC32 segment length is invalid");
  });
});
