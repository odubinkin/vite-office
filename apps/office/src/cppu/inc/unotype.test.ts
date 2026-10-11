/** @fileoverview Replays complete original cppu::detail live borrowed Type cell casts and exact ownership through actual shared owners. */
import { createHash } from "node:crypto";
import { gunzipSync } from "node:zlib";
import { expect, it, vi } from "vitest";
import fixture from "./native-type-view-cases.json";
import { typelib_TypeClass as C } from "./typelib/typeclass";
import type {
  typelib_TypeDescription as D,
  typelib_TypeDescriptionReference as R,
} from "./typelib/typedescription";
import type { rtl_uString } from "../../sal/inc/rtl/ustring.h";

/** Loads fresh original process state and complete native observations. @param mode - Original process mode. @returns Actual public owners and stream writers. */
async function context(mode: keyof typeof fixture.captures) {
  vi.resetModules();
  const f = await import("./typelib/typedescription"),
    { Type } = await import("./com/sun/star/uno/Type"),
    { getTypeFromTypeClass, getTypeFromTypeDescriptionReference } = await import("./unotype"),
    { OUString } = await import("../../sal/inc/rtl/ustring");
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
    getTypeFromTypeClass,
    getTypeFromTypeDescriptionReference,
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

it("matches original borrowed static Type views and every supported class pair", /** Replays original cell address and ownership observations without constructing an owned substitute for the view. @returns Completion. */ async () => {
  const x = await context("classes"),
    {
      f,
      Type,
      getTypeFromTypeClass: fromClass,
      getTypeFromTypeDescriptionReference: fromCell,
      ref,
      value,
      emit,
    } = x;
  const classes: C[] = [];
  for (let i = 0; i < 15; i++) classes.push(i as C);
  classes.push(C.EXCEPTION, C.INTERFACE);
  const v: InstanceType<typeof Type>[] = [];
  for (const c of classes) {
    const cell = f.typelib_static_type_getByTypeClass(c);
    ref(cell[0]);
    const a = fromClass(c),
      b = fromCell(cell),
      again = fromClass(c);
    emit(a === b, a === again, fromCell(cell) === a, a.getTypeLibType() === cell[0]);
    value(a);
    ref(cell[0]);
    const copy = new Type(a);
    emit(copy !== a, copy.getTypeLibType() === a.getTypeLibType());
    value(copy);
    value(a);
    copy.dispose();
    value(a);
    v.push(a);
  }
  for (const a of v)
    for (const b of v) {
      emit(a === b, a.equals(b), a.operatorEqual(b), a.operatorNotEqual(b), a.isAssignableFrom(b));
      ref(a.getTypeLibType());
      ref(b.getTypeLibType());
    }
  x.finish();
});
it("matches original live pointer-cell changes and independent owning Type copies", /** Uses initialized original enum owners and mutable caller cells, preserving acquisition only for actual owned values. @returns Completion. */ async () => {
  const x = await context("cells"),
    { f, Type, getTypeFromTypeDescriptionReference: fromCell, ref, value, emit, text, name } = x,
    an = name("view.A"),
    bn = name("view.B"),
    a: [R | null] = [null],
    b: [R | null] = [null];
  f.typelib_typedescriptionreference_new(a, C.ENUM, an.pData);
  f.typelib_typedescriptionreference_new(b, C.ENUM, bn.pData);
  const cell: [R | null] = [a[0]],
    same: [R | null] = [a[0]],
    nil: [R | null] = [null];
  ref(a[0]);
  ref(b[0]);
  const v = fromCell(cell),
    other = fromCell(same),
    empty = fromCell(nil);
  emit(
    v === fromCell(cell),
    v !== other,
    v.equals(other),
    v.getTypeLibType() === a[0],
    empty.getTypeLibType() === null,
  );
  value(v);
  value(other);
  ref(a[0]);
  ref(b[0]);
  text(an.pData);
  text(bn.pData);
  const copy = new Type(v);
  value(copy);
  value(v);
  cell[0] = b[0];
  emit(
    v === fromCell(cell),
    v.getTypeLibType() === b[0],
    copy.getTypeLibType() === a[0],
    !v.equals(copy),
  );
  value(v);
  value(copy);
  ref(a[0]);
  ref(b[0]);
  emit(copy.assign(v) === copy);
  value(copy);
  value(v);
  ref(a[0]);
  ref(b[0]);
  cell[0] = null;
  emit(
    v.getTypeLibType() === null,
    v.equals(empty),
    v.isAssignableFrom(copy),
    copy.isAssignableFrom(v),
  );
  cell[0] = a[0];
  emit(v.getTypeLibType() === a[0], other.getTypeLibType() === a[0]);
  value(v);
  value(copy);
  copy.dispose();
  ref(a[0]);
  ref(b[0]);
  nil[0] = b[0];
  emit(empty.getTypeLibType() === b[0]);
  value(empty);
  text(an.pData);
  text(bn.pData);
  f.typelib_typedescriptionreference_release(b[0] as R);
  text(bn.pData);
  f.typelib_typedescriptionreference_release(a[0] as R);
  text(an.pData);
  bn.dispose();
  an.dispose();
  x.finish();
});
