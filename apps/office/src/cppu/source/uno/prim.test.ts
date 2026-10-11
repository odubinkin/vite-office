/** @fileoverview Replays complete original cppu::detail live borrowed Type cell casts and exact ownership through actual shared owners. */
import { createHash } from "node:crypto";
import { gunzipSync } from "node:zlib";
import { expect, it, vi } from "vitest";
import fixture from "./native-prim-cases.json";
import { typelib_TypeClass as C } from "../../inc/typelib/typeclass";
import type {
  typelib_TypeDescription as D,
  typelib_TypeDescriptionReference as R,
} from "../../inc/typelib/typedescription";
import type { uno_Interface } from "../../inc/uno/dispatcher";
import type { uno_Mapping } from "../../inc/uno/mapping";
import type { uno_Any } from "../../inc/uno/any2";
import type { typelib_InterfaceTypeDescription as I } from "../../inc/typelib/typedescription";
import { SAL_SEQUENCE_HEADER_SIZE } from "../../../sal/inc/types";
import type { rtl_uString } from "../../../sal/inc/rtl/ustring.h";

/** Loads fresh original process state and complete native observations. @param mode - Original process mode. @returns Actual public owners and stream writers. */
async function context(mode: keyof typeof fixture.captures) {
  vi.resetModules();
  const f = await import("../../inc/typelib/typedescription"),
    prim = await import("./prim"),
    globals = await import("./data"),
    atomic = await import("../../../sal/inc/osl/interlck"),
    { OUString } = await import("../../../sal/inc/rtl/ustring");
  const expected = gunzipSync(Buffer.from(fixture.captures[mode].gzipBase64, "base64")),
    data = new Int32Array(expected.length / 4);
  let cursor = 0;
  /** Records original initialized signed32 observations. @param row - Complete row. @returns Nothing. */
  function emit(...row: (number | boolean)[]): void {
    for (const value of row) data[cursor++] = Number(value);
  }
  /** Records null identity, reference count, length and every name unit including zero. @param p - Original string. @returns Nothing. */
  function text(p: rtl_uString | null): void {
    emit(p === null);
    if (p !== null) {
      emit(p.refCount, p.length);
      for (let i = 0; i <= p.length; i++) emit(p.buffer[i] as number);
    }
  }
  /** Records every initialized common description field. @param d - Original description. @returns Nothing. */
  function desc(d: D | null): void {
    emit(d === null);
    if (d === null) return;
    emit(
      d.nRefCount,
      d.nStaticRefCount,
      d.eTypeClass,
      d.pSelf === d,
      d.bComplete,
      d.nSize,
      d.nAlignment,
      d.pWeakRef === null,
      d.pUniqueIdentifier === null,
      d.pReserved === null,
      d.bOnDemand,
    );
    text(d.pTypeName);
  }
  /** Records complete reference fields and its existing initialized common description. @param r - Original reference. @returns Nothing. */
  function ref(r: R | null): void {
    emit(r === null);
    if (r !== null) {
      emit(r.nRefCount, r.nStaticRefCount, r.eTypeClass, r.pType !== null);
      text(r.pTypeName);
      if (r.pType !== null) desc(r.pType);
    }
  }
  /** Constructs the actual original terminated ASCII caller bytes. @param value - Original ASCII text. @returns Exact input bytes. */
  function ascii(value: string): Uint8Array {
    return Uint8Array.from(Buffer.from(value + "\0", "ascii"));
  }
  /** Creates an actual owned original ASCII caller string. @param value - Original text. @returns Actual shared string owner. */
  function name(value: string): InstanceType<typeof OUString> {
    return OUString.createFromAscii(ascii(value));
  }
  /** Compares every captured byte, initialized observation and stream digest. @returns Nothing. */
  function finish(): void {
    expect(cursor).toBe(data.length);
    const original = new Int32Array(expected.buffer, expected.byteOffset, expected.length / 4),
      actual = Buffer.from(data.buffer);
    const different = data.findIndex(
      /** Locates the first differing complete observation. @param value - Portable value. @param i - Original index. @returns Difference predicate. */
      (value, i) => value !== original[i],
    );
    expect(
      different,
      `first different observation ${different}: actual ${data[different]}, original ${original[different]}`,
    ).toBe(-1);
    expect(actual.equals(expected)).toBe(true);
    expect(createHash("sha256").update(actual).digest("hex")).toBe(fixture.captures[mode].digest);
  }
  return {
    f,
    prim,
    globals,
    atomic,
    OUString,
    emit,
    text,
    ref,
    desc,
    ascii,
    name,
    finish,
  };
}

it("retains original sequence header offset and declared logical records", /** Checks captured source layout separately from JS object representation; no portable sizeof/pointer ABI is invented. @returns Nothing. */ () => {
  const bytes = gunzipSync(Buffer.from(fixture.captures.layout.gzipBase64, "base64"));
  const native = new Int32Array(bytes.buffer, bytes.byteOffset, bytes.length / 4);
  expect(Array.from(native)).toEqual([
    12, 4, 0, 4, 8, 8, 24, 8, 0, 8, 16, 24, 0, 8, 16, 24, 0, 8, 16, 0,
  ]);
  expect(SAL_SEQUENCE_HEADER_SIZE).toBe(native[5]);
  expect(createHash("sha256").update(bytes).digest("hex")).toBe(fixture.captures.layout.digest);
});
it("matches every original signed32 sequence-size observation and unsigned result", /** Uses complete original inputs and results, including unsigned64 wrap and unsigned32 allocation guard boundaries. @returns Completion. */ async () => {
  const x = await context("scalar");
  const values = [
    -0x80000000, -0x7fffffff, -65536, -16, -8, -2, -1, 0, 1, 2, 3, 4, 8, 12, 16, 24, 32, 255, 256,
    65535, 65536, 0x10000000, 0x20000000, 0x7ffffff0, 0x7fffffff,
  ];
  x.emit(values.length);
  /** Records an actual unsigned32 return before signed32 wire serialization. @param a - Original element size. @param b - Original count. @returns Nothing. */
  function observe(a: number, b: number): void {
    const n = x.prim.calcSeqMemSize(a, b);
    expect(Number.isInteger(n) && n >= 0 && n <= 0xffffffff).toBe(true);
    x.emit(a, b, n, n > 0x7fffffff, n === 0);
  }
  for (const a of values) for (const b of values) observe(a, b);
  for (const a of values)
    if (a > 0) {
      const limit = Math.min(0x7fffffff, Math.floor((0xffffffff - SAL_SEQUENCE_HEADER_SIZE) / a));
      for (let d = -2; d <= 2; d++)
        if (limit + d >= 0 && limit + d <= 0x7fffffff) observe(a, limit + d);
    }
  x.finish();
});
it("matches original static empty sequence and lazy VOID empty-Any ownership", /** Preserves real static storage, signed32 atomic wrap and untouched initialized reserved pointers. @returns Completion. */ async () => {
  const x = await context("lifetime"),
    { prim, globals: g, atomic, f, emit, ref } = x;
  /** Records all initialized empty sequence fields. @returns Nothing. */
  function seq(): void {
    emit(g.g_emptySeq.nRefCount, g.g_emptySeq.nElements, g.g_emptySeq.elements[0] as number);
  }
  seq();
  const a = prim.createEmptySequence();
  emit(a === g.g_emptySeq);
  seq();
  const b = prim.createEmptySequence();
  emit(a === b);
  seq();
  atomic.osl_atomic_decrement(g.emptySequenceCountAddress());
  seq();
  atomic.osl_atomic_decrement(g.emptySequenceCountAddress());
  seq();
  for (const n of [0x7fffffff, -0x80000000, -1, 0]) {
    g.g_emptySeq.nRefCount = n;
    emit(prim.createEmptySequence() === g.g_emptySeq);
    seq();
  }
  g.g_emptySeq.nRefCount = 1;
  seq();
  emit(g.g_pVoidType[0] === null);
  const v = prim._getVoidType();
  emit(g.g_pVoidType[0] === v);
  ref(v);
  const w = prim._getVoidType();
  emit(w === v);
  ref(v);
  prim.TYPE_ACQUIRE(v);
  ref(v);
  f.typelib_typedescriptionreference_release(v);
  f.typelib_typedescriptionreference_release(w);
  ref(v);
  const marker = { value: 17 },
    first: uno_Any = { pType: null, pData: marker, pReserved: marker };
  prim.CONSTRUCT_EMPTY_ANY(first);
  emit(first.pData === first, first.pData !== null, first.pReserved === marker, first.pType === v);
  ref(v);
  f.typelib_typedescriptionreference_release(first.pType as R);
  ref(v);
  const second: uno_Any = { pType: null, pData: null, pReserved: null };
  prim.CONSTRUCT_EMPTY_ANY(second);
  emit(
    second.pData === second,
    second.pData !== null,
    second.pReserved === null,
    second.pType === v,
  );
  ref(v);
  f.typelib_typedescriptionreference_release(second.pType as R);
  f.typelib_typedescriptionreference_release(v);
  ref(g.g_pVoidType[0]);
  x.finish();
});
it("matches original callback branches and temporary mapping description ownership", /** Caller callback witnesses only observe actual arguments, order and returned initialized pointers; they provide no queryInterface or mapping service. @returns Completion. */ async () => {
  const x = await context("callbacks"),
    { prim, f, emit, desc, ref, text, name, OUString } = x;
  let balance = 0;
  /** Actual caller-supplied acquisition witness. @param p - Borrowed pointer. @returns Nothing. */
  function acq(p: uno_Interface): void {
    emit(1, p === left);
    ++balance;
  }
  /** Actual caller-supplied release witness. @param p - Borrowed pointer. @returns Nothing. */
  function rel(p: uno_Interface): void {
    emit(2, p === left);
    --balance;
  }
  /** Actual opaque-pointer acquisition witness. @param p - Borrowed pointer. @returns Nothing. */
  function customAcq(p: unknown): void {
    emit(3, p === left);
    ++balance;
  }
  /** Actual opaque-pointer release witness. @param p - Borrowed pointer. @returns Nothing. */
  function customRel(p: unknown): void {
    emit(4, p === left);
    --balance;
  }
  const left: uno_Interface = { acquire: acq, release: rel, pDispatcher: null },
    right: uno_Interface = { acquire: acq, release: rel, pDispatcher: null };
  const mapping: uno_Mapping = {
    acquire: null,
    release: null,
    /** Actual initialized caller callback records all original inout arguments. @param m - Mapping. @param out - Destination. @param p - Interface. @param d - Description. @returns Nothing. */
    mapInterface(m, out, p, d) {
      emit(5, m === mapping, out[0] === null, p === left, d === known);
      desc(d.aBase);
      out[0] = right;
    },
  };
  for (const custom of [false, true]) {
    prim._acquire(null, custom ? customAcq : null);
    prim._release(null, custom ? customRel : null);
    emit(balance);
    prim._acquire(left, custom ? customAcq : null);
    emit(balance);
    prim._release(left, custom ? customRel : null);
    emit(balance);
  }
  emit(prim._map(null, null, null, null) === null);
  const r = f.typelib_static_type_getByTypeClass(C.INTERFACE)[0] as R,
    slot: [D | null] = [null];
  f.typelib_typedescriptionreference_getDescription(slot, r);
  const d = slot[0] as D;
  const known = d as unknown as I;
  ref(r);
  desc(d);
  emit(prim._map(left, null, d, mapping) === right);
  ref(r);
  desc(d);
  emit(prim._map(left, r, null, mapping) === right);
  ref(r);
  desc(d);
  f.typelib_typedescription_release(d);
  ref(r);
  const a: R = { ...r },
    b: R = { ...r };
  emit(prim._type_equals(a, b));
  b.eTypeClass = C.ENUM;
  emit(prim._type_equals(a, b));
  Object.assign(b, r);
  const n = name("other");
  b.pTypeName = n.pData;
  emit(prim._type_equals(a, b));
  const xn = new OUString(new Uint16Array([65, 0, 66]), 3),
    yn = new OUString(new Uint16Array([65, 0, 67]), 3);
  a.pTypeName = xn.pData;
  b.pTypeName = yn.pData;
  emit(prim._type_equals(a, b), prim._type_equals(a, a), prim._type_equals(null, null));
  text(xn.pData);
  text(yn.pData);
  x.finish();
  yn.dispose();
  xn.dispose();
  n.dispose();
});
