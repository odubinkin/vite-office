/** @fileoverview Replays complete original uno::Type construction, assignment, predicates and live ownership through actual shared owners. */
import { createHash } from "node:crypto";
import { gunzipSync } from "node:zlib";
import { expect, it, vi } from "vitest";
import fixture from "./native-type-value-cases.json";
import { typelib_TypeClass as C } from "../../../../typelib/typeclass";
import type {
  typelib_TypeDescription as D,
  typelib_TypeDescriptionReference as R,
} from "../../../../typelib/typedescription";
import type { rtl_uString } from "../../../../../../sal/inc/rtl/ustring.h";

/** Loads fresh original process state and complete native observations. @param mode - Original process mode. @returns Actual public owners and stream writers. */
async function context(mode: keyof typeof fixture.captures) {
  vi.resetModules();
  const f = await import("../../../../typelib/typedescription"),
    { Type, UNO_TYPE_NO_ACQUIRE } = await import("./Type"),
    { SAL_NO_ACQUIRE } = await import("../../../../../../sal/inc/types"),
    { TypeClass } = await import("../../../../../../udkapi/com/sun/star/uno/TypeClass"),
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
  /** Records the original acquired return value and unchanged borrowed pointer. @param t - Actual Type value. @returns Nothing. */
  function value(t: InstanceType<typeof Type>): void {
    ref(t.getTypeLibType());
    emit(t.getTypeClass());
    const n = t.getTypeName();
    text(n.pData);
    ref(t.getTypeLibType());
    n.dispose();
    ref(t.getTypeLibType());
  }
  return {
    f,
    Type,
    TypeClass,
    UNO_TYPE_NO_ACQUIRE,
    SAL_NO_ACQUIRE,
    OUString,
    emit,
    text,
    ref,
    desc,
    value,
    ascii,
    name,
    finish,
  };
}

it("matches original value construction, acquired names, lifetime and description replacement", /** Replays genuine native value and null-retained observations without constructing substitute expected owners. @returns Completion. */ async () => {
  const x = await context("values"),
    { Type, TypeClass: T, f, value, emit, text, ref, desc, name, ascii } = x;
  emit(x.UNO_TYPE_NO_ACQUIRE, x.SAL_NO_ACQUIRE);
  const a = new Type();
  value(a);
  const b = new Type(a);
  value(a);
  value(b);
  const c = new Type(a);
  emit(c.getTypeLibType() === a.getTypeLibType());
  value(a);
  value(c);
  const d = new Type(a.getTypeLibType() as R);
  value(d);
  value(a);
  d.dispose();
  c.dispose();
  value(a);
  value(b);
  b.dispose();
  value(a);
  const n = name("value.Enum");
  const e = new Type(T.ENUM, n);
  value(e);
  text(n.pData);
  const g = new Type(T.ENUM, ascii("value.Enum"));
  emit(e.getTypeLibType() === g.getTypeLibType());
  value(e);
  value(g);
  text(n.pData);
  g.dispose();
  value(e);
  text(n.pData);
  e.dispose();
  text(n.pData);
  for (let tag = 0; tag < 2; tag++) {
    const r: [R | null] = [null];
    f.typelib_typedescriptionreference_new(r, C.ENUM, n.pData);
    ref(r[0]);
    const t = new Type(r[0], tag === 0 ? x.UNO_TYPE_NO_ACQUIRE : x.SAL_NO_ACQUIRE);
    emit(t.getTypeLibType() === r[0]);
    value(t);
    text(n.pData);
    t.dispose();
    text(n.pData);
  }
  const nil = new Type(null, x.UNO_TYPE_NO_ACQUIRE),
    nilSal = new Type(null, x.SAL_NO_ACQUIRE);
  emit(
    nil.getTypeLibType() === null,
    nilSal.getTypeLibType() === null,
    nil.equals(nilSal),
    nil.operatorEqual(nilSal),
    nil.operatorNotEqual(nilSal),
    nil.isAssignableFrom(nilSal),
    a.isAssignableFrom(nil),
    nil.isAssignableFrom(a),
  );
  const out: [D | null] = [null];
  f.typelib_typedescriptionreference_getDescription(
    out,
    f.typelib_static_type_getByTypeClass(C.LONG)[0] as R,
  );
  desc(out[0]);
  a.getDescription(out);
  desc(out[0]);
  value(a);
  f.typelib_typedescription_release(out[0] as D);
  const missing = new Type(T.INTERFACE_METHOD, ascii("value.Missing::method"));
  value(missing);
  out[0] = null;
  a.getDescription(out);
  missing.getDescription(out);
  desc(out[0]);
  value(missing);
  missing.dispose();
  n.dispose();
  a.dispose();
  x.finish();
});
it("matches original copy assignment and move assignment swaps including self identity", /** Replays the source-defined destination/source ownership after assignment and exact destruction order. @returns Completion. */ async () => {
  const x = await context("assignment"),
    { Type, TypeClass: T, value, emit, text, name } = x,
    an = name("value.AssignA"),
    bn = name("value.AssignB");
  const a = new Type(T.ENUM, an),
    b = new Type(T.ENUM, bn);
  value(a);
  value(b);
  text(an.pData);
  text(bn.pData);
  emit(a.assign(b) === a, a.getTypeLibType() === b.getTypeLibType());
  value(a);
  value(b);
  text(an.pData);
  text(bn.pData);
  emit(a.assign(a) === a);
  value(a);
  value(b);
  b.dispose();
  a.dispose();
  text(an.pData);
  text(bn.pData);
  const c = new Type(T.ENUM, an),
    d = new Type(T.ENUM, bn),
    oldA = c.getTypeLibType(),
    oldB = d.getTypeLibType();
  emit(c.moveAssign(d) === c, c.getTypeLibType() === oldB, d.getTypeLibType() === oldA);
  value(c);
  value(d);
  text(an.pData);
  text(bn.pData);
  emit(c.moveAssign(c) === c, c.getTypeLibType() === oldB);
  value(c);
  value(d);
  d.dispose();
  c.dispose();
  text(an.pData);
  text(bn.pData);
  const nil = new Type(null, x.UNO_TYPE_NO_ACQUIRE);
  emit(nil.assign(nil) === nil, nil.getTypeLibType() === null, nil.moveAssign(nil) === nil);
  an.dispose();
  bn.dispose();
  x.finish();
});
it("matches all original basic Type value pairs and complete ownership records", /** Calls actual predicates and records all native names and counts without calculating expected conversions. @returns Completion. */ async () => {
  const x = await context("predicates"),
    { Type, f, value, emit, ref } = x,
    v = [];
  for (let j = 0; j < 15; j++)
    v.push(new Type(f.typelib_static_type_getByTypeClass(j as C)[0] as R));
  for (const t of v) value(t);
  for (const a of v)
    for (const b of v) {
      emit(a.equals(b), a.operatorEqual(b), a.operatorNotEqual(b), a.isAssignableFrom(b));
      ref(a.getTypeLibType());
      ref(b.getTypeLibType());
    }
  for (let i = v.length - 1; i >= 0; i--) {
    const t = v[i] as InstanceType<typeof Type>,
      r = t.getTypeLibType();
    t.dispose();
    ref(r);
  }
  x.finish();
});
it("retains original ASCII constructor checked assertion", /** Exercises the true shared SAL checked guard through the original Type constructor. @returns Completion. */ async () => {
  const x = await context("values");
  expect(fixture.assertions[0]?.signal).toBe("SIGABRT");
  expect(fixture.assertions[0]?.stderr).toContain("Assertion failed");
  expect(
    /** Calls original invalid native ASCII input. @returns Type value if no guard fires. */ () =>
      new x.Type(x.TypeClass.ENUM, new Uint8Array([128, 0])),
  ).toThrow("static_cast<unsigned char>(*pCharStr) < 0x80");
});
