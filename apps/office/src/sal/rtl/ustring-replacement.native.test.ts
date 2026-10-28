/** @fileoverview Complete initialized original owned/raw replacement observations over real SAL C boundaries and independently owned pointer slots. */
import { expect, it } from "vitest";
import * as C from "../inc/rtl/ustring.h";
import type { rtl_uString, rtl_uStringSlot } from "../inc/rtl/ustring.h";
import captured from "./native-replacement-cases.json";

/** Original native caller input and independent output. */
type Row = ["R" | "O", number[], number[], number, number, number, number, string];
const observations = captured as unknown as { cases: Row[] };

/** Requires an actual initialized pointer without changing ownership. @param slot - Native pointer reference. @returns Counted data. */
function data(slot: rtl_uStringSlot): rtl_uString {
  const value = slot[0];
  if (!value) throw new Error("Missing initialized native string");
  return value;
}
/** Reads all initialized units, including the native terminator. @param value - Actual allocation. @returns Native-shaped initialized observation. */
function snapshot(value: rtl_uString): number[] {
  return [value.length, ...value.buffer.subarray(0, value.length + 1)];
}

it.each(["R", "O"] as const)(
  "matches all original replacement values, identities and reference counts for overload %s",
  /** Replays unchanged original C outputs; aliases are established only by real acquire/assign APIs. @param operation - Raw span or owned source overload. @returns Nothing. */ (
    operation,
  ) => {
    let rows = 0;
    for (const [
      op,
      original,
      replacement,
      index,
      count,
      alias,
      nullable,
      expected,
    ] of observations.cases) {
      if (op !== operation) continue;
      ++rows;
      const first: rtl_uStringSlot = [null],
        second: rtl_uStringSlot = [null],
        output: rtl_uStringSlot = [null];
      C.rtl_uString_newFromStr_WithLength(first, new Uint16Array(original), original.length);
      C.rtl_uString_newFromStr_WithLength(second, new Uint16Array(replacement), replacement.length);
      try {
        if (alias === 1) C.rtl_uString_assign(output, data(first));
        else if (alias === 2) C.rtl_uString_assign(output, data(second));
        if (op === "R")
          C.rtl_uString_newReplaceStrAtUtf16L(
            output,
            data(first),
            index,
            count,
            nullable ? null : data(second).buffer,
            replacement.length,
          );
        else
          C.rtl_uString_newReplaceStrAt(
            output,
            data(first),
            index,
            count,
            nullable ? null : data(second),
          );
        const result = data(output),
          left = data(first),
          right = data(second);
        const observed = [
          Number(result === left),
          Number(result === right),
          result.refCount,
          left.refCount,
          right.refCount,
          ...snapshot(result),
          ...snapshot(left),
          ...snapshot(right),
        ].join(" ");
        expect(
          observed,
          JSON.stringify([op, original, replacement, index, count, alias, nullable]),
        ).toBe(expected);
      } finally {
        C.rtl_uString_release(data(output));
        C.rtl_uString_release(data(second));
        C.rtl_uString_release(data(first));
      }
    }
    expect(rows).toBe(1152);
  },
);

it("validates raw replacement arguments before replacing an existing output", /** Existing checked-assertion Error bindings are preserved without claiming native exception-on-assert behavior. @returns Nothing. */ () => {
  const first: rtl_uStringSlot = [null],
    output: rtl_uStringSlot = [null],
    units = Uint16Array.of(65);
  C.rtl_uString_newFromStr_WithLength(first, units, 1);
  C.rtl_uString_newFromStr_WithLength(output, units, 1);
  const previous = data(output);
  try {
    for (const [index, count, replacement, length] of [
      [-1, 0, units, 1],
      [2, 0, units, 1],
      [0, -1, units, 1],
      [1, 1, units, 1],
      [0, 0, null, 1],
      [0, 0, units, -1],
    ] as const) {
      expect(
        /** Calls the real original raw-span assertion path. @returns Nothing. */ () =>
          C.rtl_uString_newReplaceStrAtUtf16L(
            output,
            data(first),
            index,
            count,
            replacement,
            length,
          ),
      ).toThrow("assert(");
      expect(data(output)).toBe(previous);
    }
    expect(
      /** Calls the original null output-slot assertion. @returns Nothing. */ () =>
        C.rtl_uString_newReplaceStrAtUtf16L(null, data(first), 0, 0, null, 0),
    ).toThrow("assert(ppThis)");
  } finally {
    C.rtl_uString_release(data(output));
    C.rtl_uString_release(data(first));
  }
});
