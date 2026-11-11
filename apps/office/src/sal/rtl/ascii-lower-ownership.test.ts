/** @fileoverview Source newReplaceChars/OUString lowercase ownership, ASCII units and unchanged aliases over genuine SAL values. */
import { expect, it } from "vitest";
import { OUString } from "../inc/rtl/ustring";
import { OString } from "../inc/rtl/string";
import { SAL_NO_ACQUIRE } from "../inc/types";
import { newReplaceChars, toAsciiLower, toAsciiUpper } from "./strtmpl";
import {
  rtl_uString_newToAsciiLowerCase,
  rtl_uString_release,
  rtl_uString_acquire,
  type rtl_uStringSlot,
} from "../inc/rtl/ustring.h";
import type { rtl_StringSlot } from "../inc/rtl/string.h";
/** Original counted UTF16 owner, including embedded zero and non-ASCII units. @param value - Exact units. @returns Owned string. */
function native(value: string): OUString {
  const units = new Uint16Array(value.length);
  for (let i = 0; i < value.length; ++i) units[i] = value.charCodeAt(i);
  return new OUString(units, units.length);
}
it.each(["", "already lower", "CHANGE THIS TO ASCII LOWER CASE.", "prefix Z\0AÄİΣ"])(
  "converts source units and retains unchanged aliasing for %s",
  /** Upstream rtl_ustr.cxx lowercase literal is also exercised through the actual value-owner operation, without claiming its different in-place C overload. @param value - Exact source units. @returns Nothing. */
  (value) => {
    const original = native(value),
      result = original.toAsciiLowerCase();
    try {
      const expected = Array.from(
        { length: value.length },
        /** Source ASCII transform only. @param _ - Unused. @param i - Unit offset. @returns Unit. */ (
          _,
          i,
        ) => {
          const c = value.charCodeAt(i);
          return c >= 65 && c <= 90 ? c + 32 : c;
        },
      );
      expect([...result.getStr().subarray(0, result.getLength())]).toEqual(expected);
      expect([...original.getStr().subarray(0, original.getLength())]).toEqual(
        Array.from(
          { length: value.length },
          /** Original unit. @param _ - Unused. @param i - Offset. @returns Unit. */ (_, i) =>
            value.charCodeAt(i),
        ),
      );
      expect(result.pData === original.pData).toBe(!/[A-Z]/.test(value));
      expect(result.getStr()[result.getLength()]).toBe(0);
    } finally {
      result.dispose();
      original.dispose();
    }
  },
);
it("preserves self-output lifetime and an existing destination when replacing", /** Native template releases previous storage only after all source reads, including aliasing. @returns Nothing. */ () => {
  const original = native("AB"),
    retained = new OUString(original),
    slot: rtl_uStringSlot = [original.pData];
  rtl_uString_acquire(original.pData);
  rtl_uString_newToAsciiLowerCase(slot, slot[0] as NonNullable<(typeof slot)[0]>);
  try {
    expect([...(slot[0] as NonNullable<(typeof slot)[0]>).buffer]).toEqual([97, 98, 0]);
    expect([...retained.getStr()]).toEqual([65, 66, 0]);
    expect(retained.pData.refCount).toBe(2);
  } finally {
    rtl_uString_release(slot[0] as NonNullable<(typeof slot)[0]>);
    retained.dispose();
    original.dispose();
  }
});
it("assigns an unchanged source into an occupied distinct output slot", /** Source native assign acquires the borrowed source then releases the old destination. @returns Nothing. */ () => {
  const original = native("lower"),
    old = native("OLD"),
    oldCopy = new OUString(old),
    slot: rtl_uStringSlot = [old.pData];
  rtl_uString_acquire(old.pData);
  try {
    rtl_uString_newToAsciiLowerCase(slot, original.pData);
    expect(slot[0]).toBe(original.pData);
    expect(original.pData.refCount).toBe(2);
    expect(oldCopy.pData.refCount).toBe(2);
  } finally {
    rtl_uString_release(slot[0] as NonNullable<(typeof slot)[0]>);
    oldCopy.dispose();
    old.dispose();
    original.dispose();
  }
});
it("retains the same native template for actual byte storage and upper replacement", /** Complete initialized byte owners exercise the real template width, prefix copy and replacement strategy. @returns Nothing. */ () => {
  const source = new OString(Uint8Array.of(120, 65, 0, 255, 66), 5),
    slot: rtl_StringSlot = [null];
  newReplaceChars(slot, source.pData, toAsciiLower);
  const lower = new OString(slot[0] as NonNullable<(typeof slot)[0]>, SAL_NO_ACQUIRE),
    upperSlot: rtl_StringSlot = [null];
  try {
    expect([...lower.getStr()]).toEqual([120, 97, 0, 255, 98, 0]);
    newReplaceChars(upperSlot, lower.pData, toAsciiUpper);
    const upper = new OString(upperSlot[0] as NonNullable<(typeof upperSlot)[0]>, SAL_NO_ACQUIRE);
    try {
      expect([...upper.getStr()]).toEqual([88, 65, 0, 255, 66, 0]);
    } finally {
      upper.dispose();
    }
  } finally {
    lower.dispose();
    source.dispose();
  }
});
