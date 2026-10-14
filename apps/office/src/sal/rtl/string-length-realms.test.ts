/** @fileoverview Tests original class/terminated-pointer length semantics with actual typed arrays from another JS context. */
import { runInNewContext } from "node:vm";
import { expect, it } from "vitest";
import { getLength } from "./strtmpl";
import { OUString } from "../inc/rtl/ustring";
it("retains first-zero lengths for real foreign typed arrays and normal string records", /** The native pointer overload is independent of the host typed-array constructor realm. @returns Nothing. */ () => {
  const bytes = runInNewContext("new Uint8Array([65,0,66,0])") as Uint8Array;
  const units = runInNewContext("new Uint16Array([65,1040,0,90,0])") as Uint16Array;
  expect(bytes instanceof Uint8Array).toBe(false);
  expect(units instanceof Uint16Array).toBe(false);
  expect(ArrayBuffer.isView(bytes)).toBe(true);
  expect(ArrayBuffer.isView(units)).toBe(true);
  expect(getLength(bytes)).toBe(1);
  expect(getLength(units)).toBe(2);
  expect(getLength(new Uint8Array([65, 0, 66, 0]))).toBe(1);
  expect(getLength(new Uint16Array([65, 1040, 0, 90, 0]))).toBe(2);
  const value = OUString.createFromAscii(bytes);
  try {
    expect(value.getLength()).toBe(1);
    expect(Array.from(value.getStr())).toEqual([65, 0]);
    expect(getLength(value.pData)).toBe(1);
  } finally {
    value.dispose();
  }
});

import {
  rtl_uString_newFromLiteral,
  rtl_uString_newFromStr_WithLength,
  rtl_uString_release,
  type rtl_uStringSlot,
} from "../inc/rtl/ustring.h";
it("selects native byte and Unicode copy overloads by element kind across JS contexts", /** Checks public known-length constructors, embedded zero and the original ASCII guard. @returns Nothing. */ () => {
  const bytes = runInNewContext("new Uint8Array([65,0,66,0])") as Uint8Array,
    units = runInNewContext("new Uint16Array([65,1040,0,90,0])") as Uint16Array,
    invalid = runInNewContext("new Uint8Array([128,0])") as Uint8Array;
  const ascii: rtl_uStringSlot = [null],
    unicode: rtl_uStringSlot = [null],
    guarded: rtl_uStringSlot = [null];
  try {
    rtl_uString_newFromLiteral(ascii, bytes, 3, 0);
    rtl_uString_newFromStr_WithLength(unicode, units, 3);
    expect(ascii[0]?.length).toBe(3);
    expect(Array.from(ascii[0]?.buffer ?? [])).toEqual([65, 0, 66, 0]);
    expect(unicode[0]?.length).toBe(3);
    expect(Array.from(unicode[0]?.buffer ?? [])).toEqual([65, 1040, 0, 0]);
    expect(
      /** Exercises the original checked ASCII precondition. @returns Nothing. */ () =>
        rtl_uString_newFromLiteral(guarded, invalid, 1, 0),
    ).toThrow(/isAscii/u);
  } finally {
    for (const slot of [ascii, unicode, guarded])
      if (slot[0] !== null) rtl_uString_release(slot[0]);
  }
});
