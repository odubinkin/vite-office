/** @fileoverview Replays complete original uno::Type construction, assignment, predicates and live ownership through actual shared owners. */
import { createHash } from "node:crypto";
import { gunzipSync } from "node:zlib";
import { expect, it, vi } from "vitest";
import fixture from "./native-reference-exception-cases.json";
import type {
  typelib_TypeDescription as D,
  typelib_TypeDescriptionReference as R,
} from "../../../../typelib/typedescription";
import type { rtl_uString } from "../../../../../../sal/inc/rtl/ustring.h";

/** Loads fresh original process state and complete native observations. @param mode - Original process mode. @returns Actual public owners and stream writers. */
async function context(mode: keyof typeof fixture.captures) {
  vi.resetModules();
  const f = await import("../../../../typelib/typedescription"),
    { Reference, BaseReference, UNO_REF_NO_ACQUIRE } = await import("./Reference"),
    { Exception } = await import("./Exception"),
    { RuntimeException, cppu_detail_getUnoType } = await import("./RuntimeException"),
    literalStrings = await import("../../../../../../sal/inc/rtl/ustring.h"),
    { SAL_NO_ACQUIRE } = await import("../../../../../../sal/inc/types"),
    { OUString } = await import("../../../../../../sal/inc/rtl/ustring");
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
  /** Exact callback witnesses observe caller-owned pointer identity and count/visibility, supplying no runtime provider. @param id - Caller identity. @returns Witness. */
  function witness(id: number) {
    return {
      value: id,
      count: 10,
      watch: null as InstanceType<typeof Reference> | null,
      /** Observes original virtual acquire call. @returns Nothing. */
      acquire(): void {
        emit(
          1,
          this.value,
          ++this.count,
          this.watch ? ((this.watch.get() as { value: number } | null)?.value ?? 0) : -1,
        );
      },
      /** Observes original virtual release call. @returns Nothing. */
      release(): void {
        emit(
          2,
          this.value,
          --this.count,
          this.watch ? ((this.watch.get() as { value: number } | null)?.value ?? 0) : -1,
        );
      },
    };
  }
  return {
    f,
    Reference,
    BaseReference,
    UNO_REF_NO_ACQUIRE,
    SAL_NO_ACQUIRE,
    Exception,
    RuntimeException,
    cppu_detail_getUnoType,
    literalStrings,
    OUString,
    emit,
    text,
    ref,
    desc,
    name,
    finish,
    witness,
  };
}

it("matches original direct Reference ownership and callback publication order", /** Replays all direct pointer operations with original callback-visible owners, including valid retained self move. @returns Completion. */ async () => {
  const x = await context("reference"),
    { Reference, BaseReference, emit } = x,
    a = x.witness(11),
    b = x.witness(22);
  /** Actual caller-owned interface witness type. */
  type W = typeof a;
  /** Observes borrowed pointer, null predicates and exact counts. @param r - Original owner. @returns Nothing. */
  function state(r: InstanceType<typeof Reference>): void {
    emit(
      (r.get() as W | null)?.value ?? 0,
      r.is(),
      r.operatorBool(),
      BaseReference.prototype.get.call(r) === r.get(),
      a.count,
      b.count,
    );
  }
  emit(x.UNO_REF_NO_ACQUIRE, x.SAL_NO_ACQUIRE);
  const r = new Reference<W>();
  a.watch = r;
  b.watch = r;
  state(r);
  const n = new Reference<W>(null);
  state(n);
  n.dispose();
  const p = new Reference(a);
  state(p);
  const c = new Reference(p);
  state(c);
  a.acquire();
  const t = new Reference(a, x.SAL_NO_ACQUIRE);
  state(t);
  b.acquire();
  const u = new Reference(b, x.UNO_REF_NO_ACQUIRE);
  state(u);
  emit(r.set(a));
  state(r);
  emit(r.set(a));
  state(r);
  emit(r.set(b));
  state(r);
  emit(r.set(c));
  state(r);
  emit(r.set(null));
  state(r);
  r.clear();
  state(r);
  emit(r.assign(b) === r);
  state(r);
  emit(r.assign(r) === r);
  state(r);
  emit(r.assign(p) === r);
  state(r);
  const m = Reference.move(c);
  state(c);
  state(m);
  emit(r.moveAssign(m) === r);
  state(r);
  state(m);
  emit(r.moveAssign(r) === r);
  state(r);
  a.acquire();
  emit(r.set(a, x.SAL_NO_ACQUIRE));
  state(r);
  b.acquire();
  emit(r.set(b, x.UNO_REF_NO_ACQUIRE));
  state(r);
  emit(r.set(null, x.SAL_NO_ACQUIRE));
  state(r);
  r.clear();
  state(r);
  r.set(a);
  r.clear();
  state(r);
  emit(r.moveAssign(m) === r);
  state(r);
  state(m);
  r.set(a);
  state(r);
  c.dispose();
  m.dispose();
  t.dispose();
  u.dispose();
  p.dispose();
  state(r);
  r.dispose();
  a.watch = null;
  b.watch = null;
  emit(a.count, b.count);
  x.finish();
});

/** Replays actual default/two-field/copy/move/assignment/reverse destruction through one generated class owner. @param x - Actual process. @param E - Original selected generated value class. @returns Nothing. */
function exceptions(x: Awaited<ReturnType<typeof context>>, E: typeof x.Exception): void {
  const { emit, text } = x,
    a = x.witness(11);
  /** Observes every initialized value field and actual counts. @param value - Original value owner. @param held - Original borrowed caller string or null. @returns Nothing. */
  function observe(value: InstanceType<typeof E>, held: rtl_uString | null): void {
    expect(value instanceof E).toBe(true);
    text(value.Message.pData);
    emit(
      value.Message.pData === held,
      (value.Context.get() as typeof a | null)?.value ?? 0,
      value.Context.is(),
      a.count,
    );
  }
  const e = new E();
  observe(e, null);
  const held = x.name("Message"),
    contextValue = new x.Reference(a),
    p = new E(held, contextValue);
  observe(p, held.pData);
  text(held.pData);
  const c = new E(p);
  observe(c, held.pData);
  observe(p, held.pData);
  const message = c.Message,
    owner = c.Context;
  emit(c.assign(c) === c, c.Message === message, c.Context === owner);
  observe(c, held.pData);
  emit(e.assign(c) === e);
  observe(e, held.pData);
  text(held.pData);
  const m = E.move(c);
  observe(c, held.pData);
  observe(m, held.pData);
  emit(e.moveAssign(m) === e);
  observe(e, held.pData);
  observe(m, held.pData);
  text(held.pData);
  m.dispose();
  c.dispose();
  p.dispose();
  observe(e, held.pData);
  e.dispose();
  text(held.pData);
  contextValue.dispose();
  emit(a.count);
  held.dispose();
}
/** Observes original cached type/member/common-field ownership without a replacement registry. @param x - Actual process. @returns Nothing. */
function runtimeType(x: Awaited<ReturnType<typeof context>>): void {
  const t = x.cppu_detail_getUnoType();
  x.ref(t.getTypeLibType());
  const name = t.getTypeName();
  x.text(name.pData);
  x.emit(t === x.cppu_detail_getUnoType());
  const p = t.getTypeLibType()
    ?.pType as unknown as import("../../../../typelib/typedescription").typelib_CompoundTypeDescription;
  x.emit(p.nMembers, p.pBaseTypeDescription !== null);
  if (p.pBaseTypeDescription) {
    const b = p.pBaseTypeDescription;
    x.desc(b.aBase);
    x.emit(b.nMembers);
    for (let i = 0; i < b.nMembers; i++) {
      x.emit((b.pMemberOffsets as Int32Array)[i] as number);
      x.text((b.ppMemberNames as rtl_uString[])[i] as rtl_uString);
      x.ref((b.ppTypeRefs as R[])[i] as R);
    }
  }
  name.dispose();
}
it("matches original generated Exception value constructors and implicit lifetime", /** Executes the true normal generated class fields and shared owners. @returns Completion. */ async () => {
  const x = await context("exception");
  exceptions(x, x.Exception);
  x.finish();
});
it("matches original generated RuntimeException values and real registered type ownership", /** Explicit construction initializes the original generated type while implicit moves/copies retain value ownership. @returns Completion. */ async () => {
  const x = await context("runtime");
  exceptions(x, x.RuntimeException);
  runtimeType(x);
  const a = x.witness(11),
    another = new x.RuntimeException();
  x.text(another.Message.pData);
  x.emit(false, 0, another.Context.is(), a.count);
  another.dispose();
  x.finish();
});
it("matches original generated cached type factory and bootstrap lifetime", /** Replays all initialized description fields/member offsets/names/references, without synthetic type data. @returns Completion. */ async () => {
  const x = await context("type");
  runtimeType(x);
  const e = new x.RuntimeException();
  runtimeType(x);
  const copy = new x.RuntimeException(e);
  runtimeType(x);
  copy.dispose();
  e.dispose();
  x.finish();
});
it("matches original ASCII literal constructors and C template allocation ownership", /** Replays valid char inputs/empty/spare/null/replacement/release-last fields and original assertion children. @returns Completion. */ async () => {
  const x = await context("literal");
  for (const old of [0, 1])
    for (const n of [0, 1, 3])
      for (const extra of [0, 2])
        for (const nullSource of [0, 1]) {
          if (nullSource && n) continue;
          const held = x.name("held"),
            out: [rtl_uString | null] = [null];
          if (old) {
            out[0] = held.pData;
            x.literalStrings.rtl_uString_acquire(out[0]);
          }
          const input = new Uint8Array([65, 0, 66]);
          x.emit(old, n, extra, nullSource);
          x.text(held.pData);
          x.literalStrings.rtl_uString_newFromLiteral(out, nullSource ? null : input, n, extra);
          x.text(out[0]);
          x.text(held.pData);
          x.literalStrings.rtl_uString_release(out[0] as rtl_uString);
          x.text(held.pData);
          held.dispose();
        }
  for (const bytes of [[0], [65, 0], [77, 101, 115, 115, 97, 103, 101, 0], [120, 127, 0]]) {
    const s = new x.OUString(new Uint8Array(bytes));
    x.text(s.pData);
    s.dispose();
  }
  x.finish();
  expect(fixture.assertionSignals).toEqual({
    "bad-embedded": { normal: "SIGABRT", sanitized: "SIGABRT" },
    "bad-trailer": { normal: "SIGABRT", sanitized: "SIGABRT" },
    "bad-ascii": { normal: "SIGABRT", sanitized: "SIGABRT" },
  });
  expect(
    /** Executes original invalid const char array assertion. @returns Unconstructed value or assertion failure. */ () =>
      new x.OUString(new Uint8Array([65, 0, 0])),
  ).toThrow("isValid(literal)");
  expect(
    /** Executes original invalid const char array assertion. @returns Unconstructed value or assertion failure. */ () =>
      new x.OUString(new Uint8Array([65, 66])),
  ).toThrow("isValid(literal)");
  expect(
    /** Executes original invalid ASCII Copy assertion. @returns Nothing on failure. */ () =>
      x.literalStrings.rtl_uString_newFromLiteral([null], new Uint8Array([128]), 1, 0),
  ).toThrow("rtl::isAscii");
});
