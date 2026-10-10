/** @fileoverview Compares every portable unchanged native reverse UTF16 result and original assertion guard. */
import { describe, expect, it } from "vitest";
import { rtl_ustr_reverseCompare_WithLength } from "../inc/rtl/ustring.h";
import { CompareNormal, reverseCompare_WithLengths } from "./strtmpl";
import native from "./native-reverse-compare-cases.json";

/** Makes actual offset views with unread trailing units; no comparison result is synthesized. @param units - Native caller buffer. @param offset - Borrowed pointer offset. @returns Independent borrowed view or null pointer. */
function buffer(units: number[] | null, offset: number): Uint16Array | null {
  if (units === null) return null;
  const storage = new Uint16Array(offset + units.length + 2).fill(65530);
  storage.set(units, offset);
  return storage.subarray(offset);
}

describe("original shared RTL UTF16 reverse comparison", /** Defines unchanged-source acceptance. @returns Nothing. */ () => {
  it("matches every native direct and public result with original prefix and pointer offsets", /** Compares complete captured results for all original initialized callers. @returns Nothing. */ () => {
    expect(native.cases.length).toBeGreaterThan(1000);
    for (const call of native.cases) {
      const left = native.buffers[call.left];
      const right = native.buffers[call.right];
      if (left === undefined || right === undefined) throw new Error("Incomplete native buffers");
      const first = buffer(left, call.leftOffset);
      const second = buffer(right, call.rightOffset);
      expect([
        reverseCompare_WithLengths(first, call.leftLength, second, call.rightLength, CompareNormal),
        rtl_ustr_reverseCompare_WithLength(first, call.leftLength, second, call.rightLength),
      ]).toEqual(call.result);
    }
  });
  it("retains all four original pointer and signed length assertion guards", /** Checks the fail-fast adapter against diagnosed original native assertions. @returns Nothing. */ () => {
    const data = new Uint16Array([0]);
    const inputs: [Uint16Array | null, number, Uint16Array | null, number][] = [
      [null, 1, data, 0],
      [data, -1, data, 0],
      [data, 0, null, 1],
      [data, 0, data, -1],
    ];
    expect(native.guards).toHaveLength(4);
    for (const guard of native.guards) {
      const input = inputs[guard.index];
      if (input === undefined) throw new Error("Missing native diagnostic caller");
      expect(guard.signal).toBe("SIGABRT");
      expect(
        /** Calls the original helper's assertion adapter. @returns Comparison result. */ () =>
          reverseCompare_WithLengths(...input, CompareNormal),
      ).toThrow(guard.expression);
      expect(
        /** Calls the actual public C declaration boundary. @returns Comparison result. */ () =>
          rtl_ustr_reverseCompare_WithLength(...input),
      ).toThrow(guard.expression);
    }
  });
});
