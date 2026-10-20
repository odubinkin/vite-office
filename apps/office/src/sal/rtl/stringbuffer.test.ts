/** @fileoverview Genuine original native Unicode buffer observations through actual C/header/allocation/ref owners. */
import { createHash } from "node:crypto";
import { gunzipSync } from "node:zlib";
import { expect, it } from "vitest";
import * as api from "../inc/rtl/ustrbuf.h";
import {
  rtl_uString_new,
  rtl_uString_release,
  type rtl_uString,
  type rtl_uStringSlot,
} from "../inc/rtl/ustring.h";
import fixture from "./native-stringbuffer-cases.json";
/** Original observation input includes embeddedzero and both surrogate kinds without normalization. @param length - Native input size. @returns Actual UTF16 units. */
function input(length: number): Uint16Array {
  const value = new Uint16Array(length);
  for (let i = 0; i < length; i++)
    value[i] = i === 1 ? 0 : i === 2 ? 0xd800 : i === 3 ? 0xdc00 : 65 + i;
  return value;
}
/** Reads complete original capture bytes and verifies their saved hash. @param capture - Native compressed stream. @returns Actual original UTF8 JSON-lines observations. */
function original(capture: { gzipBase64: string; byteLength: number; digest: string }): string {
  const data = gunzipSync(Buffer.from(capture.gzipBase64, "base64"));
  expect(data.length).toBe(capture.byteLength);
  expect(createHash("sha256").update(data).digest("hex")).toBe(capture.digest);
  return data.toString();
}
/** Checks the original constructor's nonnull postcondition after opaque C slot mutation before releasing actual data. @param slot - Initialized original slot. @returns Nothing. */
function releaseInitialized(slot: rtl_uStringSlot): void {
  const data = slot[0];
  if (data === null) throw new Error("Original buffer constructor must initialize data");
  rtl_uString_release(data);
}
it("matches all original logical units,capacity,refs and identity through native mutation and transfer", /** Replays actual C callers rather than a replacement buffer model. @returns Nothing. */ () => {
  const rows: number[][] = [];
  /** Records original observable fields and only initialized logical units plus terminator. @param data - Actual SAL data. @param capacity - Actual capacity field. @param before - Original identity witness. @returns Nothing. */
  function record(data: rtl_uString | null, capacity: number, before: rtl_uString | null): void {
    rows.push([
      capacity,
      data === null ? -1 : data.length,
      data === null ? 0 : data.refCount | 0,
      Number(data === before),
      ...(data === null ? [] : [...data.buffer.subarray(0, data.length + 1)]),
    ]);
  }
  for (let n = 0; n <= 22; n++) {
    const source = input(n),
      slot: rtl_uStringSlot = [null],
      capacity: [number] = [n + 16];
    api.rtl_uStringbuffer_newFromStr_WithLength(slot, source, n);
    record(slot[0], capacity[0], null);
    for (const minimum of [-3, n + 16, n + 17, 2 * n + 100]) {
      const before = slot[0];
      api.rtl_uStringbuffer_ensureCapacity(slot, capacity, minimum);
      record(slot[0], capacity[0], before);
    }
    let before = slot[0];
    api.rtl_uStringbuffer_insert(slot, capacity, 0, null, 0);
    record(slot[0], capacity[0], before);
    before = slot[0];
    api.rtl_uStringbuffer_insert_ascii(slot, capacity, 0, Uint8Array.of(88, 0, 89), 3);
    record(slot[0], capacity[0], before);
    before = slot[0];
    api.rtl_uStringbuffer_insert(
      slot,
      capacity,
      Math.floor((slot[0] as rtl_uString).length / 2),
      Uint16Array.of(0x1234, 0, 0x5678),
      3,
    );
    record(slot[0], capacity[0], before);
    before = slot[0];
    api.rtl_uStringbuffer_insert(slot, capacity, 1, null, 2);
    record(slot[0], capacity[0], before);
    for (const code of [0, 0x41, 0xffff, 0xd800, 0x10000, 0x10ffff]) {
      before = slot[0];
      api.rtl_uStringbuffer_insertUtf32(slot, capacity, (slot[0] as rtl_uString).length, code);
      record(slot[0], capacity[0], before);
    }
    before = slot[0];
    api.rtl_uStringbuffer_remove(slot, 1, 2);
    record(slot[0], capacity[0], before);
    before = slot[0];
    api.rtl_uStringbuffer_remove(slot, 0, 0);
    record(slot[0], capacity[0], before);
    before = slot[0];
    api.rtl_uStringbuffer_remove(slot, (slot[0] as rtl_uString).length - 1, 99);
    record(slot[0], capacity[0], before);
    const data = slot[0] as rtl_uString;
    for (const requested of [0, data.length - 1, data.length, data.length + 7]) {
      const copy: rtl_uStringSlot = [null];
      const selected = api.rtl_uStringbuffer_newFromStringBuffer(copy, requested, data);
      record(copy[0], selected, data);
      rtl_uString_release(copy[0] as rtl_uString);
    }
    const ref = api.rtl_uStringBuffer_refReturn(data);
    record(ref, capacity[0], data);
    rtl_uString_release(ref);
    record(data, capacity[0], data);
    before = slot[0];
    const oldCapacity = capacity[0],
      moved = api.rtl_uStringBuffer_makeStringAndClear(slot, capacity);
    record(moved, oldCapacity, before);
    record(slot[0], capacity[0], before);
    rtl_uString_release(moved);
    before = slot[0];
    api.rtl_uStringbuffer_insert(slot, capacity, 0, Uint16Array.of(82), 1);
    record(slot[0], capacity[0], before);
    before = slot[0];
    api.rtl_uStringbuffer_remove(slot, 0, 99);
    record(slot[0], capacity[0], before);
    const copy: rtl_uStringSlot = [null];
    const selected = api.rtl_uStringbuffer_newFromStringBuffer(copy, 0, slot[0]);
    record(copy[0], selected, slot[0]);
    rtl_uString_release(copy[0] as rtl_uString);
    releaseInitialized(slot);
  }
  const slot: rtl_uStringSlot = [null],
    capacity: [number] = [0];
  rtl_uString_new(slot);
  let before = slot[0];
  const moved = api.rtl_uStringBuffer_makeStringAndClear(slot, capacity);
  record(moved, 0, before);
  record(slot[0], capacity[0], before);
  releaseInitialized(slot);
  slot[0] = null;
  api.rtl_uStringbuffer_newFromStr_WithLength(slot, null, 7);
  record(slot[0], 16, null);
  releaseInitialized(slot);
  slot[0] = null;
  rtl_uString_new(slot);
  capacity[0] = 0;
  before = slot[0];
  api.rtl_uStringbuffer_ensureCapacity(slot, capacity, -1);
  record(slot[0], capacity[0], before);
  releaseInitialized(slot);
  const actual =
    rows
      .map(
        /** Serializes the original observable row protocol. @param row - Actual C fields. @returns JSON line. */ (
          row,
        ) => JSON.stringify(row),
      )
      .join("\n") + "\n";
  expect(rows).toHaveLength(671);
  expect(actual).toBe(original(fixture.captures.values));
});
/** Calls the original independently observed invalid-argument operation. @param code - Original caller selector. @param slot - Actual initialized buffer. @param cap - Actual capacity field. @returns Never on the original checked path. */
function invalid(code: number, slot: rtl_uStringSlot, cap: [number]): void {
  switch (code) {
    case 0:
      return api.rtl_uStringbuffer_newFromStr_WithLength(null, null, -1);
    case 1:
      return api.rtl_uStringbuffer_newFromStr_WithLength(slot, null, -1);
    case 2:
      api.rtl_uStringbuffer_newFromStringBuffer(null, -1, null);
      return;
    case 3:
      api.rtl_uStringbuffer_newFromStringBuffer(slot, 0, null);
      return;
    case 4:
      api.rtl_uStringbuffer_newFromStringBuffer(null, 0, slot[0]);
      return;
    case 5:
      return api.rtl_uStringbuffer_ensureCapacity(null, null, 1);
    case 6:
      return api.rtl_uStringbuffer_ensureCapacity(slot, null, 1);
    case 7:
      cap[0] = -1;
      return api.rtl_uStringbuffer_ensureCapacity(slot, cap, 1);
    case 8:
      return api.rtl_uStringbuffer_insert(null, null, -1, null, -1);
    case 9:
      return api.rtl_uStringbuffer_insert(slot, null, -1, null, -1);
    case 10:
      cap[0] = -1;
      return api.rtl_uStringbuffer_insert(slot, cap, -1, null, -1);
    case 11:
      return api.rtl_uStringbuffer_insert(slot, cap, -1, null, -1);
    case 12:
      return api.rtl_uStringbuffer_insert(slot, cap, 4, null, -1);
    case 13:
      return api.rtl_uStringbuffer_insert(slot, cap, 0, null, -1);
    case 14:
      return api.rtl_uStringbuffer_remove(null, -1, -1);
    case 15:
      return api.rtl_uStringbuffer_remove(slot, -1, -1);
    case 16:
      return api.rtl_uStringbuffer_remove(slot, 4, -1);
    case 17:
      return api.rtl_uStringbuffer_remove(slot, 0, -1);
    case 18:
      api.rtl_uStringBuffer_makeStringAndClear(null, null);
      return;
    case 19:
      api.rtl_uStringBuffer_makeStringAndClear(slot, null);
      return;
    case 20:
      return api.rtl_uStringbuffer_insertUtf32(null, null, -1, 0x110000);
  }
  throw new Error("Unknown original caller");
}
it("retains every original checked guard and source precedence", /** Compares actual original native abort expressions rather than treating malformed operations as values. @returns Nothing. */ () => {
  expect(fixture.assertions).toHaveLength(21);
  for (const assertion of fixture.assertions) {
    const slot: rtl_uStringSlot = [null],
      cap: [number] = [19];
    api.rtl_uStringbuffer_newFromStr_WithLength(slot, input(3), 3);
    let error: unknown;
    try {
      invalid(assertion.code, slot, cap);
    } catch (value) {
      error = value;
    }
    expect(assertion.signal).toBe("SIGABRT");
    expect(error).toBeInstanceOf(Error);
    expect((error as Error).message.replace(/\s/g, "")).toBe(
      `assert(${assertion.expression})`.replace(/\s/g, ""),
    );
    releaseInitialized(slot);
  }
});
it("throws original insert bad_alloc before allocation or mutation", /** Uses valid real data and the native signed32 overflow guard without a huge allocation. @returns Nothing. */ () => {
  const slot: rtl_uStringSlot = [null],
    cap: [number] = [19];
  api.rtl_uStringbuffer_newFromStr_WithLength(slot, input(3), 3);
  const before = slot[0] as rtl_uString;
  expect(
    /** Invokes the original checked count overflow. @returns Nothing. */ () =>
      api.rtl_uStringbuffer_insert(slot, cap, 0, null, 2147483647),
  ).toThrow("std::bad_alloc");
  expect(slot[0]).toBe(before);
  expect(
    JSON.stringify([
      cap[0],
      before.length,
      before.refCount | 0,
      1,
      ...before.buffer.subarray(0, before.length + 1),
    ]) + "\n",
  ).toBe(original(fixture.captures.overflow));
  rtl_uString_release(before);
});
