/** @fileoverview Replays unchanged native OUStringBuffer/header observations through actual shared SAL ownership. */
import { createHash } from "node:crypto";
import { gunzipSync } from "node:zlib";
import { expect, it } from "vitest";
import { OUStringBuffer } from "../inc/rtl/ustrbuf";
import { OUString } from "../inc/rtl/ustring";
import { StringConcat } from "../inc/rtl/stringconcat";
import { IsValidStrLen, ThrowIfInvalidStrLen } from "../inc/rtl/stringutils";
import {
  rtl_uString_acquire,
  rtl_uString_release,
  type rtl_uString,
  type rtl_uStringSlot,
  RTL_USTR_MAX_VALUEOFDOUBLE,
} from "../inc/rtl/ustring.h";
import fixture from "./native-oustringbuffer-cases.json";
/** Recreates original bounded UTF16 data,including embeddedzero and individual surrogates. @param length - Logical source length. @returns Real source allocation. */
function input(length: number): Uint16Array {
  const data = new Uint16Array(length);
  for (let i = 0; i < length; i++)
    data[i] = i === 1 ? 0 : i === 2 ? 0xd800 : i === 3 ? 0xdc00 : 65 + i;
  return data;
}
/** Reads actual pointer-field storage via the original accessInternals contract. @param value - Live buffer. @returns Actual data pointer. */
function data(value: OUStringBuffer): rtl_uString {
  const slot: [rtl_uStringSlot | null] = [null],
    capacity: [[number] | null] = [null];
  value.accessInternals(slot, capacity);
  return (slot[0] as rtl_uStringSlot)[0] as rtl_uString;
}
/** Records initialized native observable state without reading spare storage. @param value - Original buffer. @param before - Relative identity witness. @returns Source snapshot. */
function state(value: OUStringBuffer, before: rtl_uString | null): unknown[] {
  const view = value.view();
  return [
    value.getCapacity(),
    value.getLength(),
    data(value).refCount | 0,
    Number(value.isEmpty()),
    Number(data(value) === before),
    [...value.getStr().subarray(0, value.getLength() + 1)],
    value.isEmpty() ? 0 : value.charAt(0),
    Number(value.getMutableStr() === value.getStr()),
    Number(
      view.buffer === value.getStr().buffer &&
        view.byteOffset === value.getStr().byteOffset &&
        view.length === value.getLength(),
    ),
  ];
}
/** Native lazy Unicode expression,keeping each real operand alive through consumption. @param length - Original source length. @returns Actual expression. */
function concat(length: number): StringConcat {
  return new StringConcat(OUString.Concat(Uint16Array.of(81)), input(length));
}
/** Completes the source Q+view+Z expression. @param length - Source length. @returns Lazy source expression. */
function expression(length: number): StringConcat {
  return new StringConcat(concat(length), Uint16Array.of(90));
}
/** Reads complete original capture and verifies its saved hash. @returns Original JSON-lines observations. */
function original(): string[] {
  const capture = fixture.captures.values,
    bytes = gunzipSync(Buffer.from(capture.gzipBase64, "base64"));
  expect(bytes.length).toBe(capture.byteLength);
  expect(createHash("sha256").update(bytes).digest("hex")).toBe(capture.digest);
  return bytes.toString().trimEnd().split("\n");
}
it("matches original buffer construction,mutation,ownership,transfer,helpers and checked overflow", /** Uses actual native events and real buffers/lazy operands rather than an alternate buffer model. @returns Nothing. */ () => {
  let current: OUStringBuffer | undefined;
  const scalar = new DataView(new ArrayBuffer(8));
  let rows = 0;
  for (const line of original()) {
    const [op, args, expected] = JSON.parse(line) as [number, (number | string)[], unknown];
    if (op === 52) {
      expect([RTL_USTR_MAX_VALUEOFDOUBLE]).toEqual(expected);
      continue;
    }
    if (op === 47) {
      const n = BigInt(args[0] as string),
        margin = args[1] as number;
      let result = -1;
      try {
        result = margin === 0 ? ThrowIfInvalidStrLen(n) : ThrowIfInvalidStrLen(n, margin);
      } catch (error) {
        expect((error as Error).message).toBe("std::bad_alloc");
      }
      expect([Number(margin === 0 ? IsValidStrLen(n) : IsValidStrLen(n, margin)), result]).toEqual(
        expected,
      );
      continue;
    }
    if (op === 46) {
      const owner = current as OUStringBuffer;
      owner.assign(Uint16Array.of(75));
      const held = data(owner);
      rtl_uString_acquire(held);
      owner.dispose();
      current = undefined;
      expect([held.refCount | 0]).toEqual(expected);
      rtl_uString_release(held);
      continue;
    }
    const old = current;
    let before = current === undefined ? null : data(current),
      result: OUString | undefined,
      extra: OUStringBuffer | undefined;
    const n = args[0] as number;
    if (op <= 7) {
      if (op === 0) current = new OUStringBuffer();
      else if (op === 1) current = new OUStringBuffer(n);
      else if (op === 2) current = new OUStringBuffer(input(n));
      else if (op === 3) current = new OUStringBuffer(Uint8Array.of(65, 66, 0));
      else if (op === 4) {
        const source = new OUString(input(n), n);
        current = new OUStringBuffer(source);
        source.dispose();
      } else if (op === 5) current = new OUStringBuffer(expression(n));
      else if (op === 6) current = new OUStringBuffer(OUString.number(n));
      else current = new OUStringBuffer(current as OUStringBuffer);
      if (op !== 7) before = null;
    } else {
      const b = current as OUStringBuffer;
      if (op === 8) b.assign(b);
      else if (op === 9) {
        const source = new OUStringBuffer(input(n));
        b.assign(source);
        source.dispose();
      } else if (op === 10) b.ensureCapacity(n);
      else if (op === 11) b.assign(input(n));
      else if (op === 50) {
        const source = new OUString(input(n), n);
        b.assign(source);
        source.dispose();
      } else if (op === 12) b.assign(Uint8Array.of(65, 66, 0));
      else if (op === 13) b.assign(expression(n));
      else if (op === 14) b.assign(OUString.number(n));
      else if (op === 15) b.append(input(n));
      else if (op === 16) b.append(Uint8Array.of(65, 66, 0));
      else if (op === 17) b.append(OUString.number(n));
      else if (op === 18) {
        const source = new OUString(input(n), n);
        b.append(source);
        source.dispose();
      } else if (op === 19) b.append(expression(n));
      else if (op === 20) b.insert(0, input(n));
      else if (op === 21) b.insert(1, Uint8Array.of(65, 66, 0));
      else if (op === 22) b.insert(1, expression(n));
      else if (op === 23) b.insert(0, null, 0);
      else if (op === 24) b.append(Uint16Array.of(88, 0, 89), 3);
      else if (op === 25) b.appendAscii(Uint8Array.of(88, 0, 89), 3);
      else if (op >= 26 && op <= 29) {
        scalar.setBigUint64(0, BigInt("0x" + args[0]), true);
        const value = scalar.getFloat64(0, true);
        if (op === 26) b.appendFloat(value);
        else if (op === 27) b.append(value);
        else if (op === 28) b.insertFloat(1, value);
        else b.insertDouble(1, value);
      } else if (op === 30) {
        if (args[1] === 10) b.insertInt32(0, n);
        else b.insertInt32(0, n, args[1] as number);
      } else if (op === 31) {
        if (args[1] === 10) b.insert(0, BigInt(args[0] as string));
        else b.insertInt64(0, BigInt(args[0] as string), args[1] as number);
      } else if (op === 32) b.insertChar(1, n);
      else if (op === 33) b.appendUtf32(n);
      else if (op === 34) b.insertUtf32(1, n);
      else if (op === 35) {
        const reserved = b.appendUninitialized(3);
        reserved.set([1, 0, 0xffff]);
      } else if (op === 36) b.remove(n, args[1] as number);
      else if (op === 37) {
        if (n === -1) b.truncate();
        else b.truncate(n);
      } else if (op === 39) b.setCharAt(0, 0x1234);
      else if (op === 40) {
        for (let i = b.getLength() + 1; i < b.getCapacity(); i++) b.getMutableStr()[i] = 0x4321;
        b.setLength(n);
      } else if (op === 41) {
        const previous = b.getLength();
        b.setLength(n);
        for (let i = previous + 1; i < n; i++) b.getMutableStr()[i] = 0x1234;
      } else if (op === 42) result = b.toString();
      else if (op === 43) result = b.makeStringAndClear();
      else if (op === 44) {
        extra = new OUStringBuffer(input(n));
        b.moveAssign(extra);
      } else if (op === 45) b.moveAssign(b);
      else if (op === 48) {
        current = new OUStringBuffer(Uint8Array.of(65, 0));
        before = data(current);
        const backing = new Uint16Array(1 << 24);
        let joined = OUString.Concat(backing);
        for (let i = 0; i < 127; i++) joined = new StringConcat(joined, backing);
        expect(
          /** Calls original concat guard before any read/write of the large logical expression. @returns Nothing. */ () =>
            current?.insert(0, joined),
        ).toThrow("std::bad_alloc");
      } else if (op === 49) b.insert(-1, OUString.Concat(new Uint16Array()));
      else throw new Error("Unknown original buffer event " + op);
    }
    const value = current as OUStringBuffer;
    const actual = [
      state(value, before),
      result === undefined
        ? null
        : [
            result.getLength(),
            result.pData.refCount | 0,
            Number(result.pData === before),
            [...result.getStr().subarray(0, result.getLength() + 1)],
          ],
      extra === undefined ? null : state(extra, null),
    ];
    expect(actual, `native event ${op} ${JSON.stringify(args)}`).toEqual(expected);
    if (old !== undefined && old !== current) old.dispose();
    result?.dispose();
    extra?.dispose();
    rows++;
  }
  current?.dispose();
  expect(rows).toBeGreaterThan(1500);
  expect(RTL_USTR_MAX_VALUEOFDOUBLE).toBe(25);
});
it("retains original checked buffer and length/literal assertions", /** Verifies actual original assertion expressions separately from returned states. @returns Nothing. */ () => {
  for (const assertion of fixture.assertions) {
    const b = new OUStringBuffer(Uint16Array.of(65, 66, 67));
    const bad = Uint8Array.of(65, 0, 66, 0);
    let error: unknown;
    try {
      switch (assertion.code) {
        case 0:
          new OUStringBuffer(-1);
          break;
        case 1:
          b.setLength(-1);
          break;
        case 2:
          b.charAt(-1);
          break;
        case 3:
          b.charAt(3);
          break;
        case 4:
          b.setCharAt(-1, 1);
          break;
        case 5:
          b.setCharAt(3, 1);
          break;
        case 6:
          b.insert(0, null, 1);
          break;
        case 7:
          new OUStringBuffer(bad);
          break;
        case 8:
          b.insert(0, bad);
          break;
        case 9:
          b.assign(bad);
          break;
        case 10:
          IsValidStrLen(0, -1);
          break;
      }
    } catch (caught) {
      error = caught;
    }
    expect(assertion.signal).toBe("SIGABRT");
    expect(error).toBeInstanceOf(Error);
    expect((error as Error).message.replace(/\s/g, "")).toBe(
      `assert(${assertion.expression})`.replace(/\s/g, ""),
    );
    b.dispose();
  }
});

it("uses default search/strip arguments and preserves the buffer after invalid search bounds", /** Public UTF16-unit indexing admits the end position and rejects out-of-range starts before mutation. @returns Nothing. */ () => {
  const value = new OUStringBuffer(Uint16Array.of(32, 32, 65, 0, 66));
  try {
    expect(value.indexOf(65)).toBe(2);
    expect(value.indexOf(0)).toBe(3);
    expect(value.indexOf(66, value.getLength())).toBe(-1);
    for (const offset of [-1, value.getLength() + 1])
      expect(
        /** Rejected public index leaves the owner intact. @returns Native assertion diagnostic. */ () =>
          value.indexOf(65, offset),
      ).toThrow("assert(fromIndex >= 0");
    expect([...value.view()]).toEqual([32, 32, 65, 0, 66]);
    expect(value.stripStart()).toBe(2);
    expect([...value.view()]).toEqual([65, 0, 66]);
    expect(value.stripStart()).toBe(0);
  } finally {
    value.dispose();
  }
});
