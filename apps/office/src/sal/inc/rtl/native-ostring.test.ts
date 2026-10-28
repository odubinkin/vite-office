/** @fileoverview Original OString byte ownership and search/copy over actual SAL C/template owners; no alternative allocation or value provider. */
import { expect, it } from "vitest";
import { OString, OStringLiteral } from "./string";
import { SAL_NO_ACQUIRE } from "../types";
import {
  rtl_string_acquire,
  rtl_string_release,
  rtl_string_newFromStr_WithLength,
  rtl_string_newFromSubString,
  rtl_string_assign,
  rtl_str_indexOfChar_WithLength,
  rtl_str_indexOfStr_WithLength,
  type rtl_StringSlot,
  type rtl_String,
} from "./string.h";
/** Reads actual logical byte values. @param value - Native value. @returns Bytes. */
function bytes(value: OString): number[] {
  return [...value.getStr().subarray(0, value.getLength())];
}
it("retains exact byte allocation, embedded zero and copy/adopt ownership", /** Dynamic and static owners use original reference counters. @returns Nothing. */ () => {
  const value = new OString(Uint8Array.of(65, 0, 255, 66), 4),
    empty = new OString(),
    copy = new OString(value),
    handle = new OString(value.pData),
    address = value.getDataAddress();
  try {
    expect(bytes(value)).toEqual([65, 0, 255, 66]);
    expect(value.getLength()).toBe(4);
    expect(value.isEmpty()).toBe(false);
    expect(empty.isEmpty()).toBe(true);
    expect(value.pData.refCount).toBe(3);
    expect(address).toBe(value.getDataAddress());
    expect(address[0]).toBe(value.pData);
    expect(copy.getStr()).toBe(value.getStr());
    expect(value.getStr()[4]).toBe(0);
    rtl_string_acquire(value.pData);
    const adopted = new OString(value.pData, SAL_NO_ACQUIRE);
    try {
      expect(value.pData.refCount).toBe(4);
      expect(adopted.pData).toBe(value.pData);
    } finally {
      adopted.dispose();
    }
    const literal = new OStringLiteral(Uint8Array.of(67, 0)),
      literalValue = new OString(literal);
    try {
      expect(literal.more).toBe(literal.str);
      expect(literal.getLength()).toBe(1);
      expect(literal.getStr()).toBe(literal.str.buffer);
      expect(literalValue.pData).toBe(literal.str);
      expect(literal.str.refCount).toBe(0x40000000);
    } finally {
      literalValue.dispose();
    }
  } finally {
    handle.dispose();
    copy.dispose();
    empty.dispose();
    value.dispose();
  }
});
it("preserves substring aliasing, partial byte copies, searches and the empty needle exclusion", /** Counted bytes retain zeros and high bytes independently of character encodings. @returns Nothing. */ () => {
  const value = new OString(Uint8Array.of(65, 0, 255, 66, 65), 5),
    full = value.copy(0),
    part = value.copy(1, 3),
    tail = value.copy(4),
    empty = value.copy(5);
  try {
    expect(full.pData).toBe(value.pData);
    expect(value.pData.refCount).toBe(2);
    expect(bytes(part)).toEqual([0, 255, 66]);
    expect(part.pData).not.toBe(value.pData);
    expect(bytes(tail)).toEqual([65]);
    expect(empty.isEmpty()).toBe(true);
    expect(value.indexOf(65)).toBe(0);
    expect(value.indexOf(65, 1)).toBe(4);
    expect(value.indexOf(0)).toBe(1);
    expect(value.indexOf(-1)).toBe(2);
    expect(value.indexOf(99)).toBe(-1);
    expect(value.indexOf(65, 5)).toBe(-1);
    expect(value.indexOf(Uint8Array.of(0, 255))).toBe(1);
    expect(value.indexOf(Uint8Array.of(65), 1)).toBe(4);
    expect(value.indexOf(new Uint8Array())).toBe(-1);
    expect(value.indexOf(Uint8Array.of(7, 8))).toBe(-1);
    expect(
      /** Original checked-build fromIndex assertion. @returns Index. */ () =>
        value.indexOf(65, -1),
    ).toThrow("fromIndex");
  } finally {
    empty.dispose();
    tail.dispose();
    part.dispose();
    full.dispose();
    value.dispose();
  }
});
it("copies and moves original byte owners without swapping the destination into the moved-from source", /** Source OString move semantics differ from a swap. @returns Nothing. */ () => {
  const a = new OString(Uint8Array.of(65), 1),
    b = new OString(Uint8Array.of(66), 1),
    copy = new OString();
  try {
    const data = a.pData;
    copy.assign(a);
    expect(a.pData.refCount).toBe(2);
    copy.assign(copy);
    expect(a.pData.refCount).toBe(2);
    const moved = OString.move(a);
    try {
      expect(moved.pData).toBe(data);
      expect(a.isEmpty()).toBe(true);
      b.moveAssign(moved);
      expect(b.pData).toBe(data);
      expect(moved.isEmpty()).toBe(true);
      expect(bytes(b)).toEqual([65]);
      expect(data.refCount).toBe(2);
    } finally {
      moved.dispose();
    }
    b.moveAssign(b);
    expect(b.isEmpty()).toBe(true);
    expect(copy.pData.refCount).toBe(1);
  } finally {
    copy.dispose();
    b.dispose();
    a.dispose();
  }
});
it("instantiates byte C entrypoints with original alias-safe allocation and checked boundaries", /** No UTF16 allocation is substituted for byte data. @returns Nothing. */ () => {
  const slot: rtl_StringSlot = [null];
  rtl_string_newFromStr_WithLength(slot, Uint8Array.of(1, 0, 255), 3);
  try {
    const first = slot[0] as rtl_String;
    expect(first.buffer).toBeInstanceOf(Uint8Array);
    rtl_string_newFromStr_WithLength(slot, first.buffer.subarray(1), 2);
    expect([...(slot[0] as rtl_String).buffer]).toEqual([0, 255, 0]);
    rtl_string_assign(slot, slot[0] as rtl_String);
    rtl_string_newFromSubString(slot, slot[0] as rtl_String, 0, 2);
    expect((slot[0] as rtl_String).refCount).toBe(1);
    expect(rtl_str_indexOfChar_WithLength(null, 0, 7)).toBe(-1);
    expect(rtl_str_indexOfStr_WithLength(null, 0, null, 0)).toBe(-1);
    expect(
      /** Original substring checked assertion. @returns Nothing. */ () =>
        rtl_string_newFromSubString(slot, slot[0] as rtl_String, -1, 1),
    ).toThrow("assert(false)");
    rtl_string_newFromStr_WithLength(slot, null, 0);
    expect((slot[0] as rtl_String).length).toBe(0);
  } finally {
    rtl_string_release(slot[0] as rtl_String);
  }
});

it("retains the original checked literal terminator constraint", /** Runtime declaration binding checks the native literal storage precondition; compile-time evaluation is not certified. @returns Nothing. */ () => {
  expect(
    /** Invalid terminated storage is rejected at original assertion. @returns Literal. */ () =>
      new OStringLiteral(Uint8Array.of(65)),
  ).toThrow("literal[N - 1]");
});
