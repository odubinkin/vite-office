/** @fileoverview Complete original type compatibility/equality and reference name/assignment observations replayed through actual shared public owners. */
import { createHash } from "node:crypto";
import { gunzipSync } from "node:zlib";
import { expect, it, vi } from "vitest";
import fixture from "./native-assignability-cases.json";
import { typelib_TypeClass as C } from "../../inc/typelib/typeclass";
import type {
  typelib_TypeDescription as D,
  typelib_TypeDescriptionReference as R,
  typelib_InterfaceTypeDescription as I,
} from "../../inc/typelib/typedescription";
import type { rtl_uString } from "../../../sal/inc/rtl/ustring.h";

/** Loads fresh original process state and complete native observations. @param mode - Original process mode. @returns Actual public owners and stream writers. */
async function context(mode: keyof typeof fixture.captures) {
  vi.resetModules();
  const f = await import("../../inc/typelib/typedescription"),
    { s_aAssignableFromTab } = await import("./typelib-assignability"),
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
  function desc(d: D): void {
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
  return { f, s_aAssignableFromTab, OUString, emit, text, ref, ascii, name, finish };
}

it("matches every original compatibility table entry, nullable type pair and complete ownership record" /** Replays original actual factories, all ancestry/type pairs and original description wrappers without implementing the expected algorithm. @returns Completion. */, async () => {
  const x = await context("matrix"),
    { f, emit, ref, name, ascii } = x;
  const nodes: { r: R | null; owned: boolean }[] = [{ r: null, owned: false }];
  for (let j = 0; j < 15; j++) {
    const r = f.typelib_static_type_getByTypeClass(j as C)[0] as R,
      d: [D | null] = [null];
    f.typelib_typedescriptionreference_getDescription(d, r);
    f.typelib_typedescription_release(d[0] as D);
    nodes.push({ r, owned: false });
  }
  const root = f.typelib_static_type_getByTypeClass(C.INTERFACE)[0] as R;
  /** Uses the same original generic type factory for actual complete caller records. @param c - Original class. @param n - Original name. @param b - Original base. @returns Real acquired reference. */
  function compound(c: C, n: string, b: R | null): R {
    const d: [D | null] = [null],
      v = name(n);
    f.typelib_typedescription_new(d, c, v.pData, b, 0, null);
    v.dispose();
    const r = (d[0] as D).pWeakRef as R;
    nodes.push({ r, owned: true });
    return r;
  }
  compound(C.ENUM, "matrix.EnumA", null);
  compound(C.ENUM, "matrix.EnumB", null);
  const alias: [R | null] = [null];
  f.typelib_typedescriptionreference_newByAsciiName(alias, C.LONG, ascii("matrix.LongAlias"));
  nodes.push({ r: alias[0], owned: true });
  for (const c of [C.STRUCT, C.EXCEPTION]) {
    const prefix = c === C.STRUCT ? "matrix.Struct" : "matrix.Exception",
      a = compound(c, prefix + "A", null);
    compound(c, prefix + "B", null);
    const d = compound(c, prefix + "Child", a);
    compound(c, prefix + "Grandchild", d);
  }
  for (const e of [(nodes[7] as { r: R }).r, (nodes[12] as { r: R }).r]) {
    const r: [R | null] = [null];
    f.typelib_static_sequence_type_init(r, e);
    nodes.push({ r: r[0], owned: false });
  }
  /** Uses the real original multiple-inheritance factory for caller interfaces. @param n - Original name. @param bases - Original bases. @returns Acquired reference. */
  function iface(n: string, bases: R[]): R {
    const i: [I | null] = [null],
      v = name(n);
    f.typelib_typedescription_newMIInterface(
      i,
      v.pData,
      0,
      0,
      0,
      0,
      0,
      bases.length,
      bases,
      0,
      null,
    );
    v.dispose();
    const r = (i[0] as I).aBase.pWeakRef as R;
    nodes.push({ r, owned: true });
    return r;
  }
  nodes.push({ r: root, owned: false });
  const ia = iface("matrix.IA", [root]),
    ib = iface("matrix.IB", [root]),
    ic = iface("matrix.IC", [ia]);
  iface("matrix.ID", [ia, ib]);
  iface("matrix.IE", [ib, ic]);
  for (const c of [C.INTERFACE_METHOD, C.INTERFACE_ATTRIBUTE])
    for (const suffix of ["A", "B"]) {
      const r: [R | null] = [null];
      f.typelib_typedescriptionreference_newByAsciiName(r, c, ascii("matrix.Weak" + c + suffix));
      nodes.push({ r: r[0], owned: true });
    }
  for (const units of [
    [101, 113, 0, 65],
    [101, 113, 0, 66],
  ]) {
    const v = new x.OUString(Uint16Array.from(units), 4),
      d: [D | null] = [null];
    f.typelib_typedescription_newEnum(d, v.pData, 0, 0, null, null);
    v.dispose();
    nodes.push({ r: (d[0] as D).pWeakRef, owned: true });
  }
  emit(nodes.length);
  for (const n of nodes) ref(n.r);
  for (let i = 0; i < 11; i++)
    for (let j = 0; j < 11; j++)
      emit(i, j, (x.s_aAssignableFromTab[i] as readonly boolean[])[j] as boolean);
  for (let i = 0; i < nodes.length; i++)
    for (let j = 0; j < nodes.length; j++) {
      const a = (nodes[i] as { r: R | null }).r,
        b = (nodes[j] as { r: R | null }).r;
      const value = f.typelib_typedescriptionreference_isAssignableFrom(a, b);
      let descriptions: number | boolean = -1,
        equal: number | boolean = -1;
      if (a !== null && b !== null && a.pType !== null && b.pType !== null) {
        descriptions = f.typelib_typedescription_isAssignableFrom(a.pType, b.pType);
        equal = f.typelib_typedescription_equals(a.pType, b.pType);
      }
      emit(i, j, value, descriptions, equal);
      ref(a);
      ref(b);
    }
  for (let i = nodes.length - 1; i >= 0; i--) {
    const n = nodes[i] as { r: R; owned: boolean };
    if (n.owned) f.typelib_typedescriptionreference_release(n.r);
  }
  x.finish();
});

it("matches original ASCII name conversion, output replacement, canonical lookup and typedef miss" /** Replays all original ASCII bytes and live canonical reference ownership through the public wrapper. @returns Completion. */, async () => {
  const x = await context("ascii-names"),
    { f, emit, ref, ascii } = x,
    r: [R | null] = [null];
  for (let byte = 0; byte <= 127; byte++) {
    const n = byte === 0 ? "" : "ascii." + String.fromCharCode(byte) + ".End";
    f.typelib_typedescriptionreference_newByAsciiName(r, C.ENUM, ascii(n));
    emit(byte);
    ref(r[0]);
    const copy: [R | null] = [null];
    f.typelib_typedescriptionreference_newByAsciiName(copy, C.STRING, ascii(n));
    emit(copy[0] === r[0]);
    ref(r[0]);
    ref(copy[0]);
    f.typelib_typedescriptionreference_release(copy[0] as R);
    ref(r[0]);
  }
  f.typelib_typedescriptionreference_newByAsciiName(r, C.ENUM, ascii("ascii.Stop\0X"));
  ref(r[0]);
  const retained = r[0] as R;
  f.typelib_typedescriptionreference_acquire(retained);
  f.typelib_typedescriptionreference_newByAsciiName(r, C.TYPEDEF, ascii("missing.Alias"));
  emit(r[0] === null);
  ref(retained);
  f.typelib_typedescriptionreference_release(retained);
  x.finish();
});

it("matches original self assignment and acquisition before destination-owned element release" /** Replays actual owner destruction ordering, including the source owned only by its prior destination sequence. @returns Completion. */, async () => {
  const x = await context("assignment"),
    { f, emit, ref, text, name } = x,
    an = name("assign.A"),
    bn = name("assign.B"),
    a: [R | null] = [null],
    b: [R | null] = [null];
  f.typelib_typedescriptionreference_new(a, C.ENUM, an.pData);
  f.typelib_typedescriptionreference_new(b, C.ENUM, bn.pData);
  ref(a[0]);
  ref(b[0]);
  text(an.pData);
  text(bn.pData);
  f.typelib_typedescriptionreference_assign(a, b[0]);
  emit(a[0] === b[0]);
  ref(a[0]);
  ref(b[0]);
  text(an.pData);
  text(bn.pData);
  f.typelib_typedescriptionreference_assign(a, b[0]);
  ref(a[0]);
  ref(b[0]);
  f.typelib_typedescriptionreference_release(a[0] as R);
  ref(b[0]);
  f.typelib_typedescriptionreference_release(b[0] as R);
  text(an.pData);
  text(bn.pData);
  const nil: [R | null] = [null];
  f.typelib_typedescriptionreference_assign(nil, null);
  emit(nil[0] === null);
  const en = name("assign.Element"),
    sn = name("assign.Sequence"),
    element: [R | null] = [null],
    sequence: [D | null] = [null];
  f.typelib_typedescriptionreference_new(element, C.ENUM, en.pData);
  f.typelib_typedescription_new(sequence, C.SEQUENCE, sn.pData, element[0], 0, null);
  const dest: [R | null] = [(sequence[0] as D).pWeakRef];
  f.typelib_typedescriptionreference_release(element[0] as R);
  ref(dest[0]);
  ref(element[0]);
  text(en.pData);
  text(sn.pData);
  f.typelib_typedescriptionreference_assign(dest, element[0]);
  emit(dest[0] === element[0]);
  ref(dest[0]);
  text(en.pData);
  text(sn.pData);
  f.typelib_typedescriptionreference_release(dest[0] as R);
  text(en.pData);
  text(sn.pData);
  an.dispose();
  bn.dispose();
  en.dispose();
  sn.dispose();
  x.finish();
});

it("retains the original checked non-ASCII name assertion through the public wrapper" /** Calls the original shared ASCII owner guard without adding validation in the wrapper. @returns Completion. */, async () => {
  const x = await context("ascii-names"),
    r: [R | null] = [null];
  expect(fixture.assertions[0]?.signal).toBe("SIGABRT");
  expect(fixture.assertions[0]?.stderr).toContain("Assertion failed");
  expect(
    /** Executes the same original invalid ASCII bytes. @returns Nothing. */
    () => x.f.typelib_typedescriptionreference_newByAsciiName(r, C.ENUM, new Uint8Array([128, 0])),
  ).toThrow("static_cast<unsigned char>(*pCharStr) < 0x80");
});
