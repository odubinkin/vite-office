/** @fileoverview Complete unchanged native terminated ASCII constructor observations, actual allocator-pointer witnesses and checked assertion diagnostics. */
import { createHash } from "node:crypto";
import { gunzipSync } from "node:zlib";
import { expect, it, vi } from "vitest";
import fixture from "./native-ascii-create-cases.json";
import type { rtl_uString, rtl_uStringSlot } from "../inc/rtl/ustring.h";

/** Loads a fresh native-process mode and actual shared owners. @param mode - Original mode. @returns Observation and allocator context. */
async function context(mode: keyof typeof fixture.captures) {
  vi.resetModules();
  const rtl = await import("../inc/rtl/ustring.h"),
    { OUString } = await import("../inc/rtl/ustring"),
    { rtl_stringAllocation } = await import("./strimp.hxx"),
    original = { ...rtl_stringAllocation },
    expected = gunzipSync(Buffer.from(fixture.captures[mode].gzipBase64, "base64")),
    actual = new Int32Array(expected.length / 4),
    ids = new Map<rtl_uString, number>(),
    events: number[] = [];
  let cursor = 0,
    nextId = 1,
    failNext = false;
  /** Records every original initialized observation. @param values - Complete row. @returns Nothing. */
  function emit(...values: (number | boolean)[]): void {
    for (const v of values) actual[cursor++] = Number(v);
  }
  /** Records initialized data and its complete logical units plus zero. @param p - Original data pointer. @returns Nothing. */
  function observe(p: rtl_uString | null): void {
    emit(p === null);
    if (p !== null) {
      emit(p.refCount, p.length);
      for (let i = 0; i <= p.length; i++) emit(p.buffer[i] as number);
    }
  }
  /** Emits every allocator/free event. @returns Nothing. */
  function flush(): void {
    emit(events.length);
    for (const v of events) emit(v);
    events.length = 0;
  }
  if (mode !== "bytes") {
    rtl_stringAllocation.rtl_allocateString =
      /** Uses the actual source-provided allocation pointer, with initialized null failure witness. @param bytes - Original requested size. @returns Real allocation or deliberate null. */
      (bytes) => {
        if (failNext) {
          failNext = false;
          events.push(2, bytes);
          return null;
        }
        const p = original.rtl_allocateString(bytes);
        if (p === null) throw Error("Unexpected allocation failure");
        const id = nextId++;
        ids.set(p, id);
        events.push(0, id, bytes);
        return p;
      };
    rtl_stringAllocation.rtl_freeString =
      /** Observes initialized original free fields before invoking the actual deallocator. @param p - Owned allocation. @returns Nothing. */
      (p) => {
        const id = ids.get(p);
        if (id === undefined) throw Error("Unknown original allocation");
        events.push(1, id, p.refCount, p.length);
        for (let j = 0; j <= p.length; j++) events.push(p.buffer[j] as number);
        ids.delete(p);
        original.rtl_freeString(p);
      };
  }
  /** Produces borrowed terminated literal inputs. @param n - Native selector. @returns Source bytes or null. */
  function input(n: number): Uint8Array | null {
    return [
      null,
      new Uint8Array([0]),
      new Uint8Array([97, 0, 105, 103, 110, 111, 114, 101, 100, 0]),
      new Uint8Array([72, 101, 108, 108, 111, 32, 49, 50, 55, 127, 0]),
    ][n] as Uint8Array | null;
  }
  /** Restores the actual source allocation pointers. @returns Nothing. */
  function restore(): void {
    Object.assign(rtl_stringAllocation, original);
  }
  /** Compares every complete initialized native byte and digest. @returns Nothing. */
  function finish(): void {
    const bytes = Buffer.from(actual.buffer);
    expect(cursor).toBe(actual.length);
    expect(createHash("sha256").update(bytes).digest("hex")).toBe(fixture.captures[mode].digest);
    expect(bytes.equals(expected)).toBe(true);
  }
  /** Selects the original source-provided next-allocation failure. @returns Nothing. */
  function fail(): void {
    failNext = true;
  }
  return { rtl, OUString, emit, observe, flush, input, restore, finish, fail };
}
it("matches original terminated ASCII output replacement and ownership events" /** Replays complete native pointer/output lifecycle. @returns Complete stream comparison. */, async () => {
  const c = await context("regular");
  try {
    for (const previous of [false, true])
      for (let n = 0; n < 4; n++) {
        const p: rtl_uStringSlot = [null];
        let held: rtl_uString | null = null;
        if (previous) {
          c.rtl.rtl_uString_newFromAscii(p, new Uint8Array([111, 108, 100, 0]));
          held = p[0];
          c.rtl.rtl_uString_acquire(held as rtl_uString);
        }
        c.emit(previous, n);
        c.observe(held);
        c.flush();
        c.rtl.rtl_uString_newFromAscii(p, c.input(n));
        c.observe(p[0]);
        c.observe(held);
        c.flush();
        c.rtl.rtl_uString_release(p[0] as rtl_uString);
        if (held !== null) c.rtl.rtl_uString_release(held);
        c.flush();
      }
    c.finish();
  } finally {
    c.restore();
  }
});
it("matches all original127 nonzero ASCII first bytes and128 second bytes" /** Replays every defined original ASCII pair and first-zero boundary. @returns Complete stream comparison. */, async () => {
  const c = await context("bytes");
  try {
    for (let a = 1; a < 128; a++)
      for (let b = 0; b < 128; b++) {
        const p: rtl_uStringSlot = [null];
        c.rtl.rtl_uString_newFromAscii(p, new Uint8Array([a, b, 0, 88, 0]));
        c.emit(a, b);
        c.observe(p[0]);
        c.rtl.rtl_uString_release(p[0] as rtl_uString);
      }
    c.finish();
  } finally {
    c.restore();
  }
});
it("matches original createFromAscii no-acquire values and distinct default-empty identity" /** Replays actual original value construction and destruction ordering. @returns Complete stream comparison. */, async () => {
  const c = await context("values");
  try {
    for (let n = 0; n < 4; n++) {
      const value = c.OUString.createFromAscii(c.input(n)),
        def = new c.OUString();
      c.emit(n, value.pData === def.pData);
      c.observe(value.pData);
      c.flush();
      def.dispose();
      value.dispose();
    }
    c.flush();
    c.finish();
  } finally {
    c.restore();
  }
});
it("matches original allocated-null return without replacing an upstream method or destroying null data" /** Replays the original replaceable allocator witness and retained no-acquire null result. @returns Complete stream comparison. */, async () => {
  const c = await context("failure");
  try {
    for (const previous of [false, true]) {
      const p: rtl_uStringSlot = [null];
      let held: rtl_uString | null = null;
      if (previous) {
        c.rtl.rtl_uString_newFromAscii(p, new Uint8Array([111, 108, 100, 0]));
        held = p[0];
        c.rtl.rtl_uString_acquire(held as rtl_uString);
      }
      c.emit(previous);
      c.observe(held);
      c.flush();
      c.fail();
      c.rtl.rtl_uString_newFromAscii(p, new Uint8Array([102, 97, 105, 108, 0]));
      c.observe(p[0]);
      c.observe(held);
      c.flush();
      if (held !== null) c.rtl.rtl_uString_release(held);
      c.flush();
    }
    c.fail();
    const value = c.OUString.createFromAscii(new Uint8Array([102, 97, 105, 108, 0]));
    c.observe(value.pData);
    c.flush();
    c.finish();
  } finally {
    c.restore();
  }
});
it("matches original checked ASCII range and null-slot guards" /** Compares original terminal assertions without certifying post-failure recovery. @returns Assertion comparison. */, async () => {
  vi.resetModules();
  const rtl = await import("../inc/rtl/ustring.h");
  expect(
    fixture.assertions.map(
      /** Selects complete native terminal mode signals. @param v - Original guard. @returns Captured terminal signal. */
      (v) => v.signal,
    ),
  ).toEqual(["SIGABRT", "SIGABRT"]);
  expect(
    /** Invokes actual original null-destination guard. @returns Nothing. */
    () => rtl.rtl_uString_newFromAscii(null, new Uint8Array([97, 0])),
  ).toThrow("assert(ppThis)");
  for (let byte = 128; byte < 256; byte++)
    expect(
      /** Invokes actual original unsigned ASCII-range guard. @returns Nothing. */
      () => rtl.rtl_uString_newFromAscii([null], new Uint8Array([byte, 0])),
    ).toThrow("assert(static_cast<unsigned char>(*pCharStr) < 0x80)");
});
