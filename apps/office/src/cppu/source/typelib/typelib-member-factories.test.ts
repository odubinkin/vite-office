/** @fileoverview Complete unchanged native member-factory observations replayed through the actual portable registry, allocator and ownership owners. */
import { createHash } from "node:crypto";
import { gunzipSync } from "node:zlib";
import { expect, it, vi } from "vitest";
import fixture from "./native-member-factories-cases.json";
import { typelib_TypeClass as C } from "../../inc/typelib/typeclass";
import type {
  typelib_TypeDescription as D,
  typelib_TypeDescriptionReference as R,
  typelib_InterfaceTypeDescription as I,
  typelib_InterfaceAttributeTypeDescription as A,
  typelib_InterfaceMethodTypeDescription as M,
  typelib_Parameter_Init,
} from "../../inc/typelib/typedescription";

/** Requires a source-initialized observation field. @param value - Original field. @returns Required field. */
function required<T>(value: T | null | undefined): T {
  if (value == null) throw new Error("Missing original initialized observation");
  return value;
}
/** Retains native allocation identity across original specific-prefix views. @param value - Original allocation. @returns Specific view. */
function cast<T>(value: D): T {
  return value as unknown as T;
}
/** Loads independent process-mode state and complete original stream comparison. @param mode - Original mode. @returns Actual shared owners and observation functions. */
async function context(mode: keyof typeof fixture.captures) {
  vi.resetModules();
  const type = await import("./typelib");
  const strings = await import("../../../sal/inc/rtl/ustring");
  const header = await import("../../inc/typelib/typedescription");
  const expected = gunzipSync(Buffer.from(fixture.captures[mode].gzipBase64, "base64"));
  const data = new Int32Array(expected.length / 4);
  let cursor = 0;
  /** Records every original signed32 observation. @param values - Complete row. @returns Nothing. */
  function emit(...values: (number | boolean)[]): void {
    for (const value of values) data[cursor++] = Number(value);
  }
  /** Compares the complete native stream and digest. @returns Nothing. */
  function finish(): void {
    const actual = Buffer.from(data.buffer);
    expect(cursor).toBe(data.length);
    expect(createHash("sha256").update(actual).digest("hex")).toBe(fixture.captures[mode].digest);
    expect(actual.equals(expected)).toBe(true);
  }
  /** Observes every initialized common field selected by the original caller. @param desc - Live original record. @returns Nothing. */
  function observe(desc: D): void {
    emit(
      desc.nRefCount,
      desc.nStaticRefCount,
      desc.eTypeClass,
      desc.pSelf === desc,
      desc.bComplete,
      desc.nSize,
      desc.nAlignment,
      desc.pWeakRef === null,
      desc.bOnDemand,
    );
    text(desc.pTypeName);
  }
  /** Records every original owned UTF16 unit and count. @param value - Live original string. @returns Nothing. */
  function text(value: D["pTypeName"]): void {
    emit(value.refCount, value.length);
    for (let i = 0; i < value.length; i++) emit(required(value.buffer[i]));
  }
  /** Records every original initialized reference field and full name. @param ref - Live original reference. @returns Nothing. */
  function reference(ref: R): void {
    emit(ref.nRefCount, ref.nStaticRefCount, ref.eTypeClass, ref.pType !== null);
    text(ref.pTypeName);
  }
  const literals = new Map<string, InstanceType<typeof strings.OUStringLiteral>>();
  /** Constructs the original static UTF16 literal record. @param text - Caller literal. @returns Original static name. */
  function literal(text: string) {
    let value = literals.get(text);
    if (value === undefined) {
      value = new strings.OUStringLiteral(
        Uint16Array.from(
          [...text]
            .map(
              /** Converts fixed ASCII caller literal units. @param unit - ASCII character. @returns UTF16 unit. */
              (unit) => unit.charCodeAt(0),
            )
            .concat(0),
        ),
      );
      literals.set(text, value);
    }
    return value.str;
  }
  /** Uses only the actual original allocator for synthetic initialized caller inputs. @param kind - Original class. @param name - Borrowed name. @returns Actual allocation. */
  function empty(kind: C, name: ReturnType<typeof literal>): D {
    const out: [D | null] = [null];
    type.typelib_typedescription_newEmpty(out, kind, name);
    return required(out[0]);
  }
  /** Initializes only the source-defined no-base interface caller fields; this test adapter does not implement or prove the unported interface factory. @returns Registered original allocator record. */
  function iface(): I {
    const names = ["member.IFace::M", "member.IFace::A", "member.IFace::B", "member.IFace::Z"].map(
        literal,
      ),
      refs: R[] = [];
    for (let i = 0; i < 4; i++) {
      const slot: [R | null] = [null];
      type.typelib_typedescriptionreference_new(
        slot,
        i === 0 ? C.INTERFACE_METHOD : C.INTERFACE_ATTRIBUTE,
        required(names[i]),
      );
      refs.push(required(slot[0]));
    }
    const d = empty(C.INTERFACE, literal("member.IFace")),
      value = cast<I>(d);
    value.nBaseTypes = 0;
    value.ppBaseTypes = [];
    value.aUik = { m_Data1: 0, m_Data2: 0, m_Data3: 0, m_Data4: 0, m_Data5: 0 };
    value.nMembers = 4;
    value.nAllMembers = 4;
    value.ppAllMembers = refs;
    value.ppMembers = refs;
    for (const ref of refs) type.typelib_typedescriptionreference_acquire(ref);
    for (const ref of refs) type.typelib_typedescriptionreference_release(ref);
    d.nSize = 8;
    d.nAlignment = 8;
    d.bComplete = false;
    const slot: [D | null] = [d];
    type.typelib_typedescription_register(slot);
    return cast<I>(required(slot[0]));
  }
  /** Observes actual acquired interface and deferred call-map fields. @param value - Original interface. @returns Nothing. */
  function observeInterface(value: I): void {
    observe(value.aBase);
    emit(
      value.nMembers,
      value.nAllMembers,
      value.pMapMemberIndexToFunctionIndex === null,
      value.pMapFunctionIndexToMemberIndex === null,
      value.nMapFunctionIndexToMemberIndex,
    );
  }
  /** Observes every initialized original method field, full parameter/name/exception arrays and acquired identity. @param value - Original method. @param owner - Actual interface. @returns Nothing. */
  function method(value: M, owner: I): void {
    observe(value.aBase.aBase);
    emit(value.aBase.nPosition);
    text(required(value.aBase.pMemberName));
    emit(value.bOneWay);
    reference(required(value.pReturnTypeRef));
    emit(value.nParams, value.pParams === null);
    for (const p of value.pParams ?? []) {
      text(p.pName);
      reference(p.pTypeRef);
      emit(p.bIn, p.bOut, p.pTypeRef === value.pReturnTypeRef);
    }
    emit(value.nExceptions, value.ppExceptions === null);
    for (const r of value.ppExceptions ?? []) reference(r);
    emit(value.pInterface === owner, owner.aBase.nRefCount, value.pBaseRef === null, value.nIndex);
  }
  /** Observes every initialized original attribute field and separate full getter/setter exception arrays. @param value - Original attribute. @param owner - Actual interface. @returns Nothing. */
  function attribute(value: A, owner: I): void {
    observe(value.aBase.aBase);
    emit(value.aBase.nPosition);
    text(required(value.aBase.pMemberName));
    emit(value.bReadOnly);
    reference(required(value.pAttributeTypeRef));
    emit(value.nGetExceptions, value.ppGetExceptions === null);
    for (const r of value.ppGetExceptions ?? []) reference(r);
    emit(value.nSetExceptions, value.ppSetExceptions === null);
    for (const r of value.ppSetExceptions ?? []) reference(r);
    emit(value.pInterface === owner, owner.aBase.nRefCount, value.pBaseRef === null, value.nIndex);
  }
  return {
    type,
    header,
    strings,
    emit,
    finish,
    observe,
    literal,
    empty,
    iface,
    observeInterface,
    method,
    attribute,
  };
}

it("matches original method and attribute fields and every owned parameter or exception" /** Replays original fields and counts through public header factory exports. @returns Complete native stream comparison. */, async () => {
  const {
    type,
    header,
    strings,
    emit,
    finish,
    literal,
    iface,
    observeInterface,
    method,
    attribute,
  } = await context("success");
  const owner = iface();
  observeInterface(owner);
  const nameUnits = ["first", "second", "third"].map(
    /** Converts exact original dynamic parameter-name units. @param text - Caller name. @returns Original units. */
    (text) =>
      Uint16Array.from(
        [...text].map(
          /** Converts fixed ASCII unit. @param unit - ASCII character. @returns UTF16 unit. */
          (unit) => unit.charCodeAt(0),
        ),
      ),
  );
  const names = nameUnits.map(
    /** Uses actual original explicit-length string construction. @param units - Complete caller name. @returns Owned original name. */
    (units) => new strings.OUString(units, units.length),
  );
  const params: typelib_Parameter_Init[] = [
    {
      eTypeClass: C.LONG,
      pTypeName: literal("long"),
      pParamName: required(names[0]).pData,
      bIn: false,
      bOut: false,
    },
    {
      eTypeClass: C.LONG,
      pTypeName: literal("long"),
      pParamName: required(names[1]).pData,
      bIn: true,
      bOut: false,
    },
    {
      eTypeClass: C.STRING,
      pTypeName: literal("string"),
      pParamName: required(names[2]).pData,
      bIn: true,
      bOut: true,
    },
  ];
  const exceptions = [
    literal("member.Exception"),
    literal("member.Exception"),
    literal("member.OtherException"),
  ];
  const m: [M | null] = [null];
  for (let one = 0; one < 2; one++)
    for (let r = 0; r < 2; r++)
      for (let n = 0; n < 4; n++)
        for (let e = 0; e < 4; e++) {
          header.typelib_typedescription_newInterfaceMethod(
            m,
            n % 4,
            Boolean(one),
            literal("member.IFace::M"),
            r ? C.LONG : C.VOID,
            literal(r ? "long" : "void"),
            n,
            n ? params : null,
            e,
            e ? exceptions : null,
          );
          emit(one, r, n, e);
          method(required(m[0]), owner);
          observeInterface(owner);
        }
  type.typelib_typedescription_release(required(m[0]).aBase.aBase);
  observeInterface(owner);
  const a: [A | null] = [null];
  for (let ro = 0; ro < 2; ro++)
    for (let g = 0; g < 3; g++)
      for (let s = 0; s < 3; s++) {
        header.typelib_typedescription_newExtendedInterfaceAttribute(
          a,
          1,
          literal("member.IFace::A"),
          C.STRING,
          literal("string"),
          Boolean(ro),
          g,
          g ? exceptions : null,
          s,
          s ? exceptions : null,
        );
        emit(ro, g, s);
        attribute(required(a[0]), owner);
        observeInterface(owner);
      }
  for (let ro = 0; ro < 2; ro++) {
    header.typelib_typedescription_newInterfaceAttribute(
      a,
      2,
      literal("member.IFace::B"),
      C.LONG,
      literal("long"),
      Boolean(ro),
    );
    emit(ro);
    attribute(required(a[0]), owner);
    observeInterface(owner);
  }
  type.typelib_typedescription_release(required(a[0]).aBase.aBase);
  observeInterface(owner);
  type.typelib_typedescription_release(owner.aBase);
  for (const name of names) name.dispose();
  finish();
});

it("matches original full65536 UTF16 member-name construction and original last-colon routing" /** Replays every native UTF16 unit through both original public factory exports. @returns Complete stream comparison. */, async () => {
  const { type, header, strings, emit, finish, literal, iface } = await context("unicode");
  const owner = iface();
  const prefix = Uint16Array.from(
    [..."member.IFace::"].map(
      /** Converts fixed original interface prefix. @param unit - Prefix character. @returns UTF16 unit. */
      (unit) => unit.charCodeAt(0),
    ),
  );
  const units = new Uint16Array(prefix.length + 1);
  units.set(prefix);
  for (let unit = 0; unit < 65536; unit++) {
    units[prefix.length] = unit;
    const name = new strings.OUString(units, units.length),
      m: [M | null] = [null],
      a: [A | null] = [null];
    header.typelib_typedescription_newInterfaceMethod(
      m,
      0,
      false,
      name.pData,
      C.VOID,
      literal("void"),
      0,
      null,
      0,
      null,
    );
    header.typelib_typedescription_newInterfaceAttribute(
      a,
      1,
      name.pData,
      C.LONG,
      literal("long"),
      true,
    );
    emit(unit, m[0] === null, a[0] === null, owner.aBase.nRefCount);
    if (m[0] !== null) {
      const v = m[0],
        s = required(v.aBase.pMemberName);
      emit(
        s.length,
        required(s.buffer[0]),
        v.aBase.nPosition,
        v.nIndex,
        v.nParams,
        v.nExceptions,
        v.pParams === null,
        v.ppExceptions === null,
      );
      type.typelib_typedescription_release(v.aBase.aBase);
    }
    if (a[0] !== null) {
      const v = a[0],
        s = required(v.aBase.pMemberName);
      emit(
        s.length,
        required(s.buffer[0]),
        v.aBase.nPosition,
        v.nIndex,
        v.nGetExceptions,
        v.nSetExceptions,
        v.ppGetExceptions === null,
        v.ppSetExceptions === null,
      );
      type.typelib_typedescription_release(v.aBase.aBase);
    }
    emit(owner.aBase.nRefCount);
    name.dispose();
  }
  type.typelib_typedescription_release(owner.aBase);
  finish();
});

it("matches original member-factory early returns and retained interface or wrong-kind descriptions" /** Replays initialized original failure paths, without repairing native acquisitions. @returns Complete stream comparison. */, async () => {
  const { type, header, emit, finish, literal, empty, iface } = await context("failure");
  const owner = iface(),
    wrong: [D | null] = [null];
  header.typelib_typedescription_newEnum(wrong, literal("member.Enum"), 0, 0, null, null);
  type.typelib_typedescription_register(wrong);
  const incomplete = empty(C.INTERFACE, literal("member.Empty"));
  incomplete.bComplete = false;
  const slot: [D | null] = [incomplete];
  type.typelib_typedescription_register(slot);
  const values = [
    "",
    ":",
    "single:colon",
    "::",
    "member.Missing::M",
    "member.Enum::M",
    "member.Empty::M",
  ].map(literal);
  for (const old of [false, true])
    for (let n = 0; n < 7; n++) {
      const m: [M | null] = [null],
        a: [A | null] = [null];
      if (old) {
        header.typelib_typedescription_newInterfaceMethod(
          m,
          0,
          false,
          literal("member.IFace::M"),
          C.VOID,
          literal("void"),
          0,
          null,
          0,
          null,
        );
        header.typelib_typedescription_newInterfaceAttribute(
          a,
          1,
          literal("member.IFace::A"),
          C.LONG,
          literal("long"),
          true,
        );
      }
      emit(
        old,
        n,
        owner.aBase.nRefCount,
        required(wrong[0]).nRefCount,
        required(slot[0]).nRefCount,
      );
      header.typelib_typedescription_newInterfaceMethod(
        m,
        0,
        false,
        required(values[n]),
        C.VOID,
        literal("void"),
        0,
        null,
        0,
        null,
      );
      emit(
        m[0] === null,
        owner.aBase.nRefCount,
        required(wrong[0]).nRefCount,
        required(slot[0]).nRefCount,
      );
      header.typelib_typedescription_newInterfaceAttribute(
        a,
        1,
        required(values[n]),
        C.LONG,
        literal("long"),
        true,
      );
      emit(
        a[0] === null,
        owner.aBase.nRefCount,
        required(wrong[0]).nRefCount,
        required(slot[0]).nRefCount,
      );
    }
  type.typelib_typedescription_release(required(wrong[0]));
  type.typelib_typedescription_release(required(slot[0]));
  type.typelib_typedescription_release(owner.aBase);
  finish();
});
