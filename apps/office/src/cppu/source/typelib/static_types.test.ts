/** @fileoverview Replays complete unchanged original static-type processes through public CPPU/SAL owners; every initialized record field, string unit, count and byte is compared. */
import { createHash } from "node:crypto";
import { gunzipSync } from "node:zlib";
import { expect, it, vi } from "vitest";
import fixture from "./native-static-types-cases.json";
import { typelib_TypeClass as C } from "../../inc/typelib/typeclass";
import type {
  typelib_TypeDescription as D,
  typelib_TypeDescriptionReference as R,
  typelib_CompoundTypeDescription as P,
  typelib_StructTypeDescription as S,
  typelib_InterfaceTypeDescription as I,
  typelib_InterfaceMethodTypeDescription as M,
  typelib_EnumTypeDescription as E,
} from "../../inc/typelib/typedescription";
import type { rtl_uString } from "../../../sal/inc/rtl/ustring.h";

/** Loads independent original process state and complete capture. @param mode - Native process mode. @returns Public owners and initialized observation writers. */
async function context(mode: keyof typeof fixture.captures) {
  vi.resetModules();
  const f = await import("../../inc/typelib/typedescription"),
    t = await import("./typelib"),
    { OUString, OUStringLiteral } = await import("../../../sal/inc/rtl/ustring");
  const expected = gunzipSync(Buffer.from(fixture.captures[mode].gzipBase64, "base64")),
    data = new Int32Array(expected.length / 4);
  let cursor = 0;
  /** Records each original signed32 observation. @param row - Initialized values. @returns Nothing. */
  function emit(...row: (number | boolean)[]): void {
    for (const value of row) data[cursor++] = Number(value);
  }
  /** Records null identity, ownership and all UTF16 units including the terminator. @param value - Original owned string. @returns Nothing. */
  function text(value: rtl_uString | null): void {
    emit(value === null);
    if (value !== null) {
      emit(value.refCount, value.length);
      for (let i = 0; i <= value.length; i++) emit(value.buffer[i] as number);
    }
  }
  /** Records all initialized common fields. @param value - Original description. @returns Nothing. */
  function desc(value: D): void {
    emit(
      value.nRefCount,
      value.nStaticRefCount,
      value.eTypeClass,
      value.pSelf === value,
      value.bComplete,
      value.nSize,
      value.nAlignment,
      value.pWeakRef === null,
      value.pUniqueIdentifier === null,
      value.pReserved === null,
      value.bOnDemand,
    );
    text(value.pTypeName);
  }
  /** Records an original reference and its existing description. @param value - Original reference. @returns Nothing. */
  function ref(value: R | null): void {
    emit(value === null);
    if (value !== null) {
      emit(value.nRefCount, value.nStaticRefCount, value.eTypeClass, value.pType !== null);
      text(value.pTypeName);
      if (value.pType !== null) desc(value.pType);
    }
  }
  /** Records original compound member storage, layout, base and optional initialized struct flags. @param value - Original compound. @param flags - Select original struct extension. @returns Nothing. */
  function compound(value: P, flags = false): void {
    desc(value.aBase);
    emit(
      value.pBaseTypeDescription === null,
      value.nMembers,
      value.pMemberOffsets === null,
      value.ppTypeRefs === null,
      value.ppMemberNames === null,
    );
    if (value.pBaseTypeDescription !== null) desc(value.pBaseTypeDescription.aBase);
    for (let i = 0; i < value.nMembers; i++) {
      emit((value.pMemberOffsets as Int32Array)[i] as number);
      ref((value.ppTypeRefs as R[])[i] as R);
      if (value.ppMemberNames !== null) text(value.ppMemberNames[i] as rtl_uString);
    }
    if (flags) {
      const s = value as unknown as S;
      emit(s.pParameterizedTypes === null);
      if (s.pParameterizedTypes !== null)
        for (let i = 0; i < value.nMembers; i++) emit(s.pParameterizedTypes[i] as boolean);
    }
  }
  /** Records static interface initialized fields; uninitialized Uik is deliberately unread. @param value - Original interface. @returns Nothing. */
  function iface(value: I): void {
    desc(value.aBase);
    emit(
      value.nBaseTypes,
      value.nMembers,
      value.nAllMembers,
      value.pBaseTypeDescription === null,
      value.ppBaseTypes === null,
      value.ppMembers === null,
      value.ppAllMembers === null,
      value.pMapMemberIndexToFunctionIndex === null,
      value.nMapFunctionIndexToMemberIndex,
      value.pMapFunctionIndexToMemberIndex === null,
    );
    for (let i = 0; i < value.nBaseTypes; i++) desc(((value.ppBaseTypes as I[])[i] as I).aBase);
    if (value.ppAllMembers !== null) {
      emit(
        value.aUik.m_Data1,
        value.aUik.m_Data2,
        value.aUik.m_Data3,
        value.aUik.m_Data4,
        value.aUik.m_Data5,
      );
      for (let i = 0; i < value.nAllMembers; i++) ref(value.ppAllMembers[i] as R);
    }
  }
  /** Records the original root method's initialized fields and reference ownership. @param value - Original method. @returns Nothing. */
  function method(value: M): void {
    desc(value.aBase.aBase);
    emit(
      value.aBase.nPosition,
      value.bOneWay,
      value.nParams,
      value.pParams === null,
      value.nExceptions,
      value.ppExceptions === null,
      value.pBaseRef === null,
      value.nIndex,
    );
    text(value.aBase.pMemberName);
    ref(value.pReturnTypeRef);
    for (let i = 0; i < value.nParams; i++) {
      const p = (value.pParams as NonNullable<M["pParams"]>)[i] as NonNullable<
        M["pParams"]
      >[number];
      text(p.pName);
      ref(p.pTypeRef);
      emit(p.bIn, p.bOut);
    }
    for (let i = 0; i < value.nExceptions; i++) ref((value.ppExceptions as R[])[i] as R);
    iface(value.pInterface as I);
  }
  /** Constructs actual terminated original name bytes. @param value - Native ASCII literal. @returns Original input bytes. */
  function ascii(value: string): Uint8Array {
    return Uint8Array.from(Buffer.from(value + "\0", "ascii"));
  }
  /** Creates the actual source caller's _ustr literal owner. @param value - Original ASCII literal text. @returns Original literal-backed string. */
  function name(value: string): InstanceType<typeof OUString> {
    const units = new Uint16Array(value.length + 1);
    for (let i = 0; i < value.length; i++) units[i] = value.charCodeAt(i);
    return new OUString(new OUStringLiteral(units));
  }
  /** Compares the entire complete stream and content digest. @returns Nothing. */
  function finish(): void {
    const actual = Buffer.from(data.buffer);
    expect(cursor).toBe(data.length);
    const original = new Int32Array(expected.buffer, expected.byteOffset, expected.length / 4);
    const different = data.findIndex(
      /** Locates the first differing original observation without changing it. @param value - Portable observation. @param index - Original row position. @returns Difference predicate. */
      (value, index) => value !== original[index],
    );
    expect(
      different,
      `first differing observation: ${different}, actual ${data[different]}, original ${original[different]}`,
    ).toBe(-1);
    expect(actual.equals(expected)).toBe(true);
    expect(createHash("sha256").update(actual).digest("hex")).toBe(fixture.captures[mode].digest);
  }
  return { f, t, OUString, emit, ref, compound, iface, method, ascii, name, finish };
}

for (const mode of ["basic", "interface-first", "exception-first"] as const)
  it(`matches complete original ${mode} bootstrap and mutable cache cells` /** Replays independent original bootstrap order and acquired method observations. @returns Completion. */, async () => {
    const x = await context(mode),
      { f, emit, ref, iface, compound, method, name } = x;
    const first = mode === "basic" ? -1 : mode === "interface-first" ? C.INTERFACE : C.EXCEPTION;
    if (first >= 0) {
      const a = f.typelib_static_type_getByTypeClass(first as C);
      emit(first, a === f.typelib_static_type_getByTypeClass(first as C));
      ref(a[0]);
    }
    for (let j = 0; j < 15; j++) {
      const a = f.typelib_static_type_getByTypeClass(j as C);
      emit(j, a === f.typelib_static_type_getByTypeClass(j as C));
      ref(a[0]);
      const same = a[0];
      a[0] = same;
      emit(f.typelib_static_type_getByTypeClass(j as C)[0] === same);
    }
    for (const c of [C.INTERFACE, C.EXCEPTION]) {
      const a = f.typelib_static_type_getByTypeClass(c);
      emit(c, a === f.typelib_static_type_getByTypeClass(c));
      ref(a[0]);
      if (c === C.INTERFACE) {
        const i = (a[0] as R).pType as unknown as I;
        iface(i);
        for (let n = 0; n < 3; n++) {
          const d: [D | null] = [null];
          f.typelib_typedescriptionreference_getDescription(d, (i.ppAllMembers as R[])[n] as R);
          method(d[0] as unknown as M);
          f.typelib_typedescription_release(d[0] as D);
        }
      } else compound((a[0] as R).pType as unknown as P);
    }
    const rn = name("com.sun.star.uno.RuntimeException"),
      r: [D | null] = [null];
    f.typelib_typedescription_getByName(r, rn.pData);
    compound(r[0] as unknown as P);
    f.typelib_typedescription_release(r[0] as D);
    rn.dispose();
    x.finish();
  });

it("matches complete original static initializers, layout, flags and ownership" /** Replays exact original initializer calls, including source-defined idempotence and initialized-name reuse. @returns Completion. */, async () => {
  const x = await context("initializers"),
    { f, ref, compound, iface, emit, ascii } = x;
  const longType = f.typelib_static_type_getByTypeClass(C.LONG)[0] as R,
    doubleType = f.typelib_static_type_getByTypeClass(C.DOUBLE)[0] as R,
    strType = f.typelib_static_type_getByTypeClass(C.STRING)[0] as R,
    root = f.typelib_static_type_getByTypeClass(C.INTERFACE)[0] as R;
  const t: [R | null] = [null];
  f.typelib_static_type_init(t, C.LONG, ascii("long"));
  ref(t[0]);
  f.typelib_static_type_init(t, C.STRING, ascii("ignored"));
  ref(t[0]);
  const seq: [R | null] = [null],
    seq2: [R | null] = [null];
  f.typelib_static_sequence_type_init(seq, longType);
  ref(seq[0]);
  f.typelib_static_sequence_type_init(seq, longType);
  ref(seq[0]);
  f.typelib_static_sequence_type_init(seq2, longType);
  emit(seq[0] === seq2[0]);
  ref(seq2[0]);
  const members = [longType, doubleType, strType],
    s: [R | null] = [null],
    s2: [R | null] = [null];
  f.typelib_static_compound_type_init(s, C.STRUCT, ascii("static.Plain"), null, 3, members);
  compound((s[0] as R).pType as unknown as P, true);
  f.typelib_static_compound_type_init(s, C.STRUCT, ascii("ignored"), null, 0, null);
  compound((s[0] as R).pType as unknown as P, true);
  f.typelib_static_compound_type_init(s2, C.STRUCT, ascii("static.Plain"), null, 0, null);
  emit(s[0] === s2[0]);
  compound((s2[0] as R).pType as unknown as P, true);
  const child: [R | null] = [null],
    flags = [true, false];
  f.typelib_static_struct_type_init(child, ascii("static.Child"), s[0], 2, members, flags);
  compound((child[0] as R).pType as unknown as P, true);
  f.typelib_static_struct_type_init(child, ascii("ignored"), null, 0, null, null);
  compound((child[0] as R).pType as unknown as P, true);
  const empty: [R | null] = [null],
    ex: [R | null] = [null];
  f.typelib_static_struct_type_init(empty, ascii("static.Empty"), null, 0, null, flags);
  compound((empty[0] as R).pType as unknown as P, true);
  f.typelib_static_compound_type_init(ex, C.EXCEPTION, ascii("static.Exception"), null, 0, null);
  compound((ex[0] as R).pType as unknown as P);
  const i: [R | null] = [null],
    i2: [R | null] = [null],
    other: [R | null] = [null],
    multi: [R | null] = [null];
  f.typelib_static_interface_type_init(i, ascii("static.Single"), null);
  iface((i[0] as R).pType as unknown as I);
  f.typelib_static_interface_type_init(i, ascii("ignored"), root);
  iface((i[0] as R).pType as unknown as I);
  f.typelib_static_mi_interface_type_init(i2, ascii("static.Single"), 0, null);
  emit(i[0] === i2[0]);
  iface((i2[0] as R).pType as unknown as I);
  f.typelib_static_interface_type_init(other, ascii("static.Other"), root);
  iface((other[0] as R).pType as unknown as I);
  f.typelib_static_mi_interface_type_init(multi, ascii("static.Multi"), 2, [
    i[0] as R,
    other[0] as R,
  ]);
  iface((multi[0] as R).pType as unknown as I);
  f.typelib_static_mi_interface_type_init(multi, ascii("ignored"), 0, null);
  iface((multi[0] as R).pType as unknown as I);
  const e: [R | null] = [null],
    e2: [R | null] = [null];
  f.typelib_static_enum_type_init(e, ascii("static.Enum"), -2147483648);
  ref(e[0]);
  emit(((e[0] as R).pType as unknown as E).nDefaultEnumValue);
  f.typelib_static_enum_type_init(e, ascii("ignored"), 7);
  ref(e[0]);
  f.typelib_static_enum_type_init(e2, ascii("static.Enum"), 9);
  emit(e[0] === e2[0]);
  ref(e2[0]);
  emit(((e2[0] as R).pType as unknown as E).nDefaultEnumValue);
  const old = doubleType.pType as D,
    alignment = old.nAlignment;
  old.nAlignment = 16;
  const aligned: [R | null] = [null];
  f.typelib_static_struct_type_init(aligned, ascii("static.Aligned"), null, 1, [doubleType], null);
  compound((aligned[0] as R).pType as unknown as P, true);
  old.nAlignment = alignment;
  x.finish();
});

it("matches original acquired uninitialized-name retention and canonical transfer" /** Replays the original uninitialized reference lookup and enum registration without repairing retention. @returns Completion. */, async () => {
  const x = await context("uninitialized"),
    r: [R | null] = [null],
    s: [R | null] = [null];
  x.f.typelib_static_type_init(r, C.ENUM, x.ascii("static.Uninitialized"));
  x.ref(r[0]);
  x.f.typelib_static_enum_type_init(s, x.ascii("static.Uninitialized"), 3);
  x.emit(r[0] === s[0]);
  x.ref(r[0]);
  x.ref(s[0]);
  x.finish();
});

it("matches original mutable exception-cache reentry with an existing root interface" /** Replays the exact synthetic original caller's mutable cache-cell store; no native mutex race or ordinary producer claim. @returns Completion. */, async () => {
  const x = await context("cache-reentry"),
    { f, emit, ref } = x;
  const i = f.typelib_static_type_getByTypeClass(C.INTERFACE),
    e = f.typelib_static_type_getByTypeClass(C.EXCEPTION),
    retained = e[0];
  emit(
    i === f.typelib_static_type_getByTypeClass(C.INTERFACE),
    e === f.typelib_static_type_getByTypeClass(C.EXCEPTION),
  );
  ref(i[0]);
  ref(retained);
  e[0] = null;
  const again = f.typelib_static_type_getByTypeClass(C.EXCEPTION);
  emit(again === e, again[0] === null);
  ref(retained);
  ref(i[0]);
  x.finish();
});

for (const mode of ["bad-kind", "bad-typedef", "bad-base", "bad-void", "bad-interface"] as const)
  it(`preserves original checked ${mode} guard` /** Calls the same public original invalid-input guard without replacing native behavior. @returns Completion. */, async () => {
    const x = await context("basic"),
      { f, t, name, ascii } = x;
    const r: [R | null] = [null],
      b: [R | null] = [null];
    if (mode === "bad-base" || mode === "bad-interface") {
      const n = name("bad.Base");
      t.typelib_typedescriptionreference_new(b, C.INTERFACE_METHOD, n.pData);
      n.dispose();
    }
    const needle =
      mode === "bad-kind"
        ? "eTypeClass =="
        : mode === "bad-typedef"
          ? "shouldn't be possible"
          : mode === "bad-base"
            ? "pComp->pBaseTypeDescription"
            : mode === "bad-void"
              ? "pTD->nSize"
              : "pIface->ppBaseTypes[i]";
    expect(
      fixture.assertions.find(
        /** Selects the actual checked original process diagnostic. @param value - Original assertion. @returns Selected mode. */
        (value) => value.mode === mode,
      )?.stderr,
    ).toContain(needle);
    expect(
      /** Executes the selected original public guard with original caller inputs. @returns Nothing. */
      () => {
        if (mode === "bad-kind")
          f.typelib_static_compound_type_init(r, C.ENUM, ascii("bad"), null, 0, null);
        else if (mode === "bad-typedef") f.typelib_static_type_init(r, C.TYPEDEF, ascii("bad"));
        else if (mode === "bad-base")
          f.typelib_static_compound_type_init(r, C.STRUCT, ascii("bad"), b[0], 0, null);
        else if (mode === "bad-void")
          f.typelib_static_compound_type_init(r, C.STRUCT, ascii("bad"), null, 1, [
            f.typelib_static_type_getByTypeClass(C.VOID)[0] as R,
          ]);
        else f.typelib_static_mi_interface_type_init(r, ascii("bad"), 1, [b[0] as R]);
      },
    ).toThrow(needle);
  });
