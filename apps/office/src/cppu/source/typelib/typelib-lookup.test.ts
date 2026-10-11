/** @fileoverview Replays complete genuine CPPU lookup/factory and reverse ASCII observations against the actual shared portable owners. */
import { createHash } from "node:crypto";
import { gunzipSync } from "node:zlib";
import { expect, it, vi } from "vitest";
import fixture from "./native-lookup-cases.json";
import { typelib_TypeClass as C } from "../../inc/typelib/typeclass";
import type {
  typelib_TypeDescription as D,
  typelib_TypeDescriptionReference as R,
  typelib_CompoundTypeDescription as P,
  typelib_StructTypeDescription as S,
  typelib_EnumTypeDescription as E,
  typelib_IndirectTypeDescription as Q,
  typelib_InterfaceTypeDescription as I,
  typelib_InterfaceMethodTypeDescription as M,
  typelib_InterfaceAttributeTypeDescription as A,
  typelib_InterfaceMemberTypeDescription as Member,
  typelib_CompoundMember_Init,
  typelib_StructMember_Init,
  typelib_typedescription_Callback,
} from "../../inc/typelib/typedescription";

const classes = [
  C.TYPE,
  C.VOID,
  C.BOOLEAN,
  C.CHAR,
  C.BYTE,
  C.STRING,
  C.SHORT,
  C.UNSIGNED_SHORT,
  C.LONG,
  C.UNSIGNED_LONG,
  C.HYPER,
  C.UNSIGNED_HYPER,
  C.FLOAT,
  C.DOUBLE,
  C.ANY,
];
const basicNames = [
  "type",
  "void",
  "boolean",
  "char",
  "byte",
  "string",
  "short",
  "unsigned short",
  "long",
  "unsigned long",
  "hyper",
  "unsigned hyper",
  "float",
  "double",
  "any",
];
/** Requires actual initialized caller/output fields rather than fabricating missing values. @param value - Original initialized value. @returns Required value. */
function required<T>(value: T | null | undefined): T {
  if (value == null) throw new Error("Missing initialized original observation");
  return value;
}
/** Retains original typed views over one actual description allocation. @param desc - Original description. @returns Specific view. */
function cast<T>(desc: D): T {
  return desc as unknown as T;
}
/** Reloads original singleton owners between independent native process modes, without introducing a test reset API into the runtime. @param mode - Complete captured mode. @returns Actual owners and complete stream recorder. */
async function context(mode: keyof typeof fixture.captures) {
  vi.resetModules();
  const type = await import("./typelib");
  const lookup = await import("./typelib-lookup");
  const header = await import("../../inc/typelib/typedescription");
  const strings = await import("../../../sal/inc/rtl/ustring");
  const rtl = await import("../../../sal/rtl/ustring");
  const expected = gunzipSync(Buffer.from(fixture.captures[mode].gzipBase64, "base64"));
  const actual = new Int32Array(expected.length / 4);
  let cursor = 0;
  /** Retains the full original row, without selecting fields or changing signed32 values. @param values - Complete observation. @returns Nothing. */
  function emit(...values: (number | boolean)[]): void {
    for (const value of values) {
      if (cursor >= actual.length) throw new Error("Unexpected extra original observation");
      actual[cursor++] = Number(value);
    }
  }
  /** Compares every original captured byte and the complete digest. @returns Nothing. */
  function finish(): void {
    expect(cursor).toBe(actual.length);
    const bytes = Buffer.from(actual.buffer);
    let mismatch = -1;
    for (let i = 0; i < actual.length; i++) {
      if (actual[i] !== expected.readInt32LE(i * 4)) {
        mismatch = i;
        break;
      }
    }
    expect(
      bytes.equals(expected),
      mismatch < 0
        ? mode
        : `${mode}[${mismatch}]: original ${expected.readInt32LE(mismatch * 4)}, portable ${actual[mismatch]}`,
    ).toBe(true);
    expect(createHash("sha256").update(bytes).digest("hex")).toBe(fixture.captures[mode].digest);
  }
  /** Uses the actual owned known-length UTF16 constructor, preserving embedded zeros. @param value - Exact units. @returns Original value owner. */
  function text(value: string) {
    const units = Uint16Array.from(
      { length: value.length },
      /** Retains each UTF16 unit. @param _unit - Unused slot. @param index - Original offset. @returns Unit. */
      (_unit, index) => value.charCodeAt(index),
    );
    return new strings.OUString(units, units.length);
  }
  /** Invokes the original getter with the source value's live data. @param name - Original string owner. @returns Owned description. */
  function get(name: InstanceType<typeof strings.OUString>): D {
    const result: [D | null] = [null];
    lookup.typelib_typedescription_getByName(result, name.pData);
    return result[0] as D;
  }
  /** Records original initialized common fields and native common-prefix pointer identity. @param d - Actual live description. @returns Nothing. */
  function observe(d: D): void {
    emit(
      d.nRefCount,
      d.nStaticRefCount,
      d.eTypeClass,
      d.pTypeName.refCount,
      d.pSelf === d,
      d.bComplete,
      d.nSize,
      d.nAlignment,
      d.pWeakRef === null,
      d.pWeakRef !== null &&
        !header.TYPELIB_TYPEDESCRIPTIONREFERENCE_ISREALLYWEAK(d.eTypeClass) &&
        d.pWeakRef.pType === d,
      d.bOnDemand,
    );
  }
  /** Records all original compound offsets, references, names and parameterization flags. @param d - Actual compound description. @returns Nothing. */
  function compound(d: D): void {
    const p = cast<P>(d);
    observe(d);
    emit(
      p.pBaseTypeDescription !== null,
      p.nMembers,
      p.pMemberOffsets === null,
      p.ppTypeRefs === null,
      p.ppMemberNames === null,
    );
    for (let i = 0; i < p.nMembers; i++)
      emit(
        required(required(p.pMemberOffsets)[i]),
        required(required(p.ppTypeRefs)[i]).eTypeClass,
        required(required(p.ppTypeRefs)[i]).nRefCount,
        required(required(p.ppMemberNames)[i]).refCount,
      );
    if (d.eTypeClass === C.STRUCT) {
      const s = cast<S>(d);
      emit(s.pParameterizedTypes === null);
      if (s.pParameterizedTypes !== null)
        for (let i = 0; i < p.nMembers; i++) emit(required(s.pParameterizedTypes[i]));
    }
    const original = d.nSize;
    d.nSize = 0;
    for (const offset of [0, 1, 7, 16]) {
      const alignment: [number] = [-99];
      const size = lookup.typelib_typedescription_getAlignedUnoSize(d, offset, alignment);
      emit(size, alignment[0]);
    }
    d.nSize = original;
  }
  return { type, lookup, header, strings, rtl, emit, finish, text, get, observe, compound };
}

it("matches every original basic type, resolution and borrowed danger-get count", /** Replays complete native initial registration and resolution transitions. @returns Completion. */ async () => {
  const { type, header, text, get, observe, emit, finish } = await context("basic");
  for (const value of basicNames) {
    const name = text(value),
      d = get(name);
    observe(d);
    const again: [D | null] = [get(name)];
    emit(again[0] === d, d.nRefCount);
    type.typelib_typedescription_release(again[0] as D);
    const resolved: [D | null] = [null];
    type.typelib_typedescriptionreference_getDescription(resolved, d.pWeakRef as R);
    emit(resolved[0] === d, d.nRefCount);
    header.TYPELIB_DANGER_GET(again, d.pWeakRef as R);
    emit(again[0] === d, d.nRefCount);
    header.TYPELIB_DANGER_RELEASE(again[0] as D);
    type.typelib_typedescription_release(resolved[0] as D);
    type.typelib_typedescription_release(d);
    name.dispose();
  }
  finish();
});

it("matches original complete plain, enum, recursive sequence, inherited and polymorphic factories", /** Replays every initialized native factory output, offset and retained owner. @returns Completion. */ async () => {
  const { type, lookup, rtl, text, get, observe, compound, emit, finish } =
    await context("factory");
  const names = basicNames.map(text),
    longName = text("long"),
    integer = get(longName);
  for (const cls of classes) {
    const name = text("CalcFactory"),
      slot: [D | null] = [null];
    type.typelib_typedescription_new(slot, cls, name.pData, null, 0, null);
    const d = slot[0] as D;
    observe(d);
    for (let offset = 0; offset < 17; offset++) {
      const alignment: [number] = [-99];
      const size = lookup.typelib_typedescription_getAlignedUnoSize(d, offset, alignment);
      emit(size, alignment[0]);
    }
    type.typelib_typedescription_release(d);
    emit(name.pData.refCount);
    name.dispose();
  }
  // The original generic factory can leave weak member-specific fields incomplete; initialize only its required destructor interface/name fields in this synthetic native caller witness.
  for (const cls of [C.INTERFACE_METHOD, C.INTERFACE_ATTRIBUTE]) {
    const name = text("CalcWeakFactory"),
      slot: [D | null] = [null],
      parent: [D | null] = [null];
    type.typelib_typedescription_new(slot, cls, name.pData, null, 0, null);
    const d = required(slot[0]);
    observe(d);
    type.typelib_typedescription_new(parent, C.INTERFACE, name.pData, null, 0, null);
    if (cls === C.INTERFACE_METHOD) {
      const method = cast<M>(d);
      method.pInterface = cast<I>(required(parent[0]));
      method.aBase.pMemberName = name.pData;
      rtl.rtl_uString_acquire(name.pData);
    } else cast<A>(d).pInterface = cast<I>(required(parent[0]));
    type.typelib_typedescription_release(d);
    emit(name.pData.refCount);
    name.dispose();
  }
  for (const count of [0, 3]) {
    const name = text("CalcEnum"),
      a = text("A"),
      b = text("B\0C"),
      c = text("D"),
      enumNames = [a.pData, b.pData, c.pData],
      values = new Int32Array([-2147483647, 0, 2147483647]),
      slot: [D | null] = [null];
    type.typelib_typedescription_newEnum(slot, name.pData, 19, count, enumNames, values);
    const d = slot[0] as D,
      e = cast<E>(d);
    observe(d);
    emit(
      e.nDefaultEnumValue,
      e.nEnumValues,
      e.ppEnumNames !== null,
      e.pEnumValues !== null,
      e.pEnumValues !== values,
    );
    for (let i = 0; i < count; i++)
      emit(
        required(e.ppEnumNames)[i] === enumNames[i],
        required(required(e.ppEnumNames)[i]).refCount,
        required(required(e.pEnumValues)[i]),
      );
    values[0] = 8;
    emit(count === 0 ? 0 : required(required(e.pEnumValues)[0]));
    type.typelib_typedescription_release(d);
    emit(name.pData.refCount, a.pData.refCount, b.pData.refCount, c.pData.refCount);
    for (const value of [name, a, b, c]) value.dispose();
  }
  const seqName = text("[]long"),
    seq: [D | null] = [null];
  type.typelib_typedescription_new(seq, C.SEQUENCE, seqName.pData, integer.pWeakRef, 0, null);
  observe(seq[0] as D);
  emit(cast<Q>(seq[0] as D).pType === integer.pWeakRef, integer.nRefCount);
  type.typelib_typedescription_release(seq[0] as D);
  emit(integer.nRefCount);
  seqName.dispose();
  const memberNames = ["a", "b", "c", "self"].map(text),
    recursive = text("[]CalcStruct");
  const members: typelib_CompoundMember_Init[] = [
    {
      eTypeClass: C.BYTE,
      pTypeName: required(names[4]).pData,
      pMemberName: required(memberNames[0]).pData,
    },
    {
      eTypeClass: C.DOUBLE,
      pTypeName: required(names[13]).pData,
      pMemberName: required(memberNames[1]).pData,
    },
    {
      eTypeClass: C.LONG,
      pTypeName: required(names[8]).pData,
      pMemberName: required(memberNames[2]).pData,
    },
    {
      eTypeClass: C.SEQUENCE,
      pTypeName: recursive.pData,
      pMemberName: required(memberNames[3]).pData,
    },
  ];
  for (const cls of [C.STRUCT, C.EXCEPTION])
    for (const count of [0, 1, 3, 4]) {
      const name = text("CalcStruct"),
        slot: [D | null] = [null];
      type.typelib_typedescription_new(slot, cls, name.pData, null, count, members);
      compound(slot[0] as D);
      type.typelib_typedescription_release(slot[0] as D);
      emit(name.pData.refCount);
      for (const n of memberNames) emit(n.pData.refCount);
      name.dispose();
    }
  const baseName = text("CalcBaseStruct"),
    base: [D | null] = [null];
  type.typelib_typedescription_new(base, C.STRUCT, baseName.pData, null, 3, members);
  type.typelib_typedescription_register(base);
  const derivedName = text("CalcDerived"),
    derived: [D | null] = [null];
  type.typelib_typedescription_new(
    derived,
    C.STRUCT,
    derivedName.pData,
    (base[0] as D).pWeakRef,
    1,
    members,
  );
  compound(derived[0] as D);
  emit((base[0] as D).nRefCount);
  type.typelib_typedescription_release(derived[0] as D);
  emit((base[0] as D).nRefCount);
  for (const poly of [false, true]) {
    const name = text(poly ? "CalcPoly<long>" : "CalcPlain"),
      sm: typelib_StructMember_Init[] = [
        { aBase: required(members[0]), bParameterizedType: true },
        { aBase: required(members[2]), bParameterizedType: false },
      ],
      slot: [D | null] = [null];
    type.typelib_typedescription_newStruct(slot, name.pData, null, 2, sm);
    compound(slot[0] as D);
    type.typelib_typedescription_release(slot[0] as D);
    emit(name.pData.refCount);
    name.dispose();
  }
  const alias: [D | null] = [null];
  type.typelib_typedescription_newEmpty(alias, C.LONG, derivedName.pData);
  type.typelib_typedescription_new(alias, C.TYPEDEF, derivedName.pData, integer.pWeakRef, 0, null);
  emit(alias[0] === integer, integer.nRefCount, derivedName.pData.refCount);
  type.typelib_typedescription_release(alias[0] as D);
  type.typelib_typedescription_release(base[0] as D);
  type.typelib_typedescription_release(integer);
  for (const value of [...names, ...memberNames, longName, baseName, derivedName, recursive])
    value.dispose();
  finish();
});

it("matches original sequence routing, malformed names, provider typedefs and full cache eviction", /** Replays every captured original routing and provider/cache ownership result. @returns Completion. */ async () => {
  const { type, lookup, strings, text, get, observe, emit, finish } = await context("lookup");
  let calls = 0;
  /** Supplies initialized descriptions through the original provider contract, using actual factories. @param _context - Original opaque context. @param out - Original output. @param name - Original request. @returns Nothing. */
  const provider: typelib_typedescription_Callback =
    /** Supplies original initialized callback output. @param _context - Original context. @param out - Original output slot. @param name - Original request. @returns Nothing. */ (
      _context,
      out,
      name,
    ) => {
      calls++;
      const n = strings.OUString.unacquired([name]);
      const provided = text("CalcProvided"),
        alias = text("CalcAlias");
      const matches = n.indexOf(provided) === 0 || n.equals(alias);
      const isAlias = n.equals(alias);
      provided.dispose();
      alias.dispose();
      if (!matches) return;
      if (isAlias) {
        type.typelib_typedescription_newEmpty(out, C.SEQUENCE, name);
        const q = cast<Q>(out[0] as D),
          longName = text("long"),
          d = get(longName);
        q.pType = d.pWeakRef;
        type.typelib_typedescriptionreference_acquire(q.pType as R);
        type.typelib_typedescription_release(d);
        (out[0] as D).eTypeClass = C.TYPEDEF;
        longName.dispose();
      } else type.typelib_typedescription_newEnum(out, name, 7, 0, [name], new Int32Array([0]));
    };
  type.typelib_typedescription_registerCallback(null, provider);
  const slot: [D | null] = [null];
  for (const value of [
    "CalcAbsent",
    "[]long",
    "[xlong",
    "[][]long",
    "[]",
    "[",
    "[]Unknown",
    "Calc:@0",
    "Calc:@0,1",
    "Calc:@0,1:Missing",
    "CalcProvided",
    "CalcAlias",
  ]) {
    const name = text(value),
      before = calls;
    lookup.typelib_typedescription_getByName(slot, name.pData);
    emit(slot[0] !== null, calls - before, name.pData.refCount);
    if (slot[0] !== null) {
      const d = slot[0];
      observe(d);
      if (d.eTypeClass === C.SEQUENCE) {
        const q = cast<Q>(d);
        emit(required(q.pType).eTypeClass, required(q.pType).nRefCount);
      }
    }
    name.dispose();
  }
  if (slot[0] !== null) type.typelib_typedescription_release(slot[0]);
  for (let i = 0; i < 258; i++) {
    const name = text("CalcProvided" + i),
      d = get(name);
    observe(d);
    emit(calls, cast<E>(d).nEnumValues);
    type.typelib_typedescription_release(d);
    name.dispose();
  }
  const first = text("CalcProvided0"),
    ref: [R | null] = [null];
  type.typelib_typedescriptionreference_getByName(ref, first.pData);
  emit(ref[0] === null);
  if (ref[0] !== null) type.typelib_typedescriptionreference_release(ref[0]);
  first.dispose();
  type.typelib_typedescription_revokeCallback(null, provider);
  finish();
});

it("matches every original logical size and maximum alignment witness", /** Replays full selected native LP64 arithmetic without treating JS objects as native binary storage. @returns Completion. */ async () => {
  const { lookup, emit, finish } = await context("sizes");
  for (let cls = 0; cls < 32; cls++) {
    if (cls === C.STRUCT || cls === C.EXCEPTION || cls === C.TYPEDEF) continue;
    for (const size of [0, 1, 3, 16, 24])
      for (const alignment of [1, 2, 4, 8, 16])
        for (const offset of [0, 1, 3, 7, 16, 31]) {
          const desc = { eTypeClass: cls, nSize: size, nAlignment: alignment } as D,
            integral: [number] = [-1];
          const result = lookup.typelib_typedescription_getAlignedUnoSize(desc, offset, integral);
          emit(result, integral[0]);
        }
  }
  for (const alignment of [1, 2, 4, 8, 16, 32])
    for (let offset = 0; offset < 17; offset++)
      emit(lookup.adjustAlignment(alignment), lookup.newAlignedSize(offset, 3, alignment));
  finish();
});

it("matches every UTF16 reverse ASCII input and original assertion order", /** Replays complete original ASCII bytes and checked bounds without invalid native recovery claims. @returns Completion. */ async () => {
  const { rtl, strings, emit, finish } = await context("ascii"),
    needle = new Uint8Array([58, 64]);
  for (let unit = 0; unit < 65536; unit++) {
    const data = new Uint16Array([58, 64, unit, 58, 64, 0]);
    for (let length = 0; length <= 5; length++)
      for (let count = 0; count <= 2; count++)
        emit(rtl.rtl_ustr_lastIndexOfAscii_WithLength(data, length, needle, count));
  }
  for (let byte = 0; byte < 256; byte++) {
    const signed = (byte << 24) >> 24,
      data = new Uint16Array([signed & 0xffff, 0]);
    emit(rtl.rtl_ustr_lastIndexOfAscii_WithLength(data, 1, new Uint8Array([byte]), 1));
  }
  finish();
  const literal = new strings.OUStringLiteral(new Uint16Array([58, 64, 0])),
    source = new strings.OUString(literal),
    borrowed = strings.OUString.unacquired([source.pData]);
  expect(source.lastIndexOfAsciiL(needle, 2)).toBe(0);
  expect(borrowed.lastIndexOfAsciiL(needle, 2)).toBe(0);
  expect(source.pData.refCount).toBe(0x40000000);
  source.dispose();
  for (const item of fixture.assertions) {
    const length = item.index === 0 || item.index === 2 ? -1 : 0,
      count = item.index === 1 || item.index === 2 ? -1 : 0;
    expect(
      /** Invokes the original checked range witness. @returns Original failure. */ () =>
        rtl.rtl_ustr_lastIndexOfAscii_WithLength(null, length, null, count),
    ).toThrow("assert(" + item.expression + ")");
  }
});

it("matches original derived-member routing and every reference resolution branch", /** Replays complete native initialized provider/reference witnesses, including the synthetic zero-count guard. @returns Completion. */ async () => {
  const { type, lookup, header, strings, rtl, text, get, observe, compound, emit, finish } =
    await context("derivedrefs");
  const integerName = text("long"),
    integer = get(integerName),
    ifaceName = text("CalcIface"),
    iface: [D | null] = [null];
  type.typelib_typedescription_new(iface, C.INTERFACE, ifaceName.pData, null, 0, null);
  type.typelib_typedescription_register(iface);
  const parent = required(iface[0]);
  for (const kind of [C.INTERFACE_METHOD, C.INTERFACE_ATTRIBUTE, C.ENUM]) {
    const prefix =
        kind === C.INTERFACE_METHOD
          ? "CalcMethodBase"
          : kind === C.INTERFACE_ATTRIBUTE
            ? "CalcAttributeBase"
            : "CalcEnumBase",
      baseName = text(prefix),
      slot: [D | null] = [null];
    if (kind === C.ENUM)
      type.typelib_typedescription_newEnum(
        slot,
        baseName.pData,
        13,
        0,
        [baseName.pData],
        new Int32Array([0]),
      );
    else {
      type.typelib_typedescription_newEmpty(slot, kind, baseName.pData);
      const base = required(slot[0]),
        m = cast<Member>(base);
      m.nPosition = 0;
      m.pMemberName = baseName.pData;
      rtl.rtl_uString_acquire(m.pMemberName);
      type.typelib_typedescription_acquire(parent);
      if (kind === C.INTERFACE_METHOD) {
        const method = cast<M>(base);
        method.bOneWay = false;
        method.pReturnTypeRef = integer.pWeakRef;
        type.typelib_typedescriptionreference_acquire(required(method.pReturnTypeRef));
        method.pInterface = cast<I>(parent);
      } else {
        const attribute = cast<A>(base);
        attribute.bReadOnly = true;
        attribute.pAttributeTypeRef = integer.pWeakRef;
        type.typelib_typedescriptionreference_acquire(required(attribute.pAttributeTypeRef));
        attribute.pInterface = cast<I>(parent);
      }
    }
    type.typelib_typedescription_register(slot);
    const base = required(slot[0]);
    for (const suffix of [":@1,2:CalcIface", ":@-2147483649, 3:CalcIface", ":@0,1:MissingIface"]) {
      const name = text(prefix + suffix),
        result: [D | null] = [null];
      lookup.typelib_typedescription_getByName(result, name.pData);
      const d = result[0] as D | null;
      emit(d !== null, name.pData.refCount);
      if (d !== null) {
        observe(d);
        const m = cast<Member>(d);
        emit(m.nPosition, m.pMemberName === baseName.pData);
        if (kind === C.INTERFACE_METHOD) {
          const method = cast<M>(d);
          emit(
            method.nIndex,
            method.pInterface === cast<I>(parent),
            method.pBaseRef === base.pWeakRef,
            method.nParams,
            method.pParams !== null,
            method.nExceptions,
            method.ppExceptions !== null,
            method.bOneWay,
          );
        } else {
          const attribute = cast<A>(d);
          emit(
            attribute.nIndex,
            attribute.pInterface === cast<I>(parent),
            attribute.pBaseRef === base.pWeakRef,
            attribute.bReadOnly,
            attribute.ppGetExceptions !== null,
            attribute.ppSetExceptions !== null,
          );
        }
        type.typelib_typedescription_release(d);
      }
      emit(base.nRefCount, required(base.pWeakRef).nRefCount, parent.nRefCount, integer.nRefCount);
      name.dispose();
    }
    const voidName = text("void"),
      resolved: [D | null] = [get(voidName)];
    type.typelib_typedescriptionreference_getDescription(resolved, required(base.pWeakRef));
    emit(resolved[0] === base, base.nRefCount);
    type.typelib_typedescription_release(required(resolved[0]));
    resolved[0] = null;
    header.TYPELIB_DANGER_GET(resolved, required(base.pWeakRef));
    emit(resolved[0] === base, base.nRefCount);
    header.TYPELIB_DANGER_RELEASE(required(resolved[0] as D | null));
    emit(base.nRefCount);
    voidName.dispose();
    if (kind === C.INTERFACE_METHOD) {
      const original = base.nRefCount,
        ref = required(base.pWeakRef);
      base.nRefCount = 0;
      resolved[0] = null;
      type.typelib_typedescriptionreference_getDescription(resolved, ref);
      emit(resolved[0] === null, base.nRefCount, ref.pType === null);
      base.nRefCount = original;
      ref.pType = base;
    }
    type.typelib_typedescription_release(base);
    baseName.dispose();
  }
  for (const value of ["CalcMissing:@0,1:CalcIface", "CalcUnresolved:@0,1:CalcIface"]) {
    const name = text(value),
      ref: [R | null] = [null],
      result: [D | null] = [null];
    if (value.startsWith("CalcUnresolved")) {
      const unresolved = text("CalcUnresolved");
      type.typelib_typedescriptionreference_new(ref, C.INTERFACE_METHOD, unresolved.pData);
      unresolved.dispose();
    }
    lookup.typelib_typedescription_getByName(result, name.pData);
    const d = result[0] as D | null;
    emit(d === null, parent.nRefCount);
    if (d !== null) type.typelib_typedescription_release(d);
    if (ref[0] !== null) type.typelib_typedescriptionreference_release(ref[0]);
    name.dispose();
  }
  let calls = 0;
  /** Supplies only the original observed enum provider inputs. @param _context - Opaque original context. @param out - Output slot. @param name - Requested original name. @returns Nothing. */
  const provider: typelib_typedescription_Callback =
    /** Supplies original initialized callback output. @param _context - Original context. @param out - Original output slot. @param name - Original request. @returns Nothing. */ (
      _context,
      out,
      name,
    ) => {
      calls++;
      const n = strings.OUString.unacquired([name]),
        prefix = text("CalcProvided");
      const matches = n.indexOf(prefix) === 0;
      prefix.dispose();
      if (matches)
        type.typelib_typedescription_newEnum(out, name, 7, 0, [name], new Int32Array([0]));
    };
  type.typelib_typedescription_registerCallback(null, provider);
  for (const value of ["CalcProvidedRef", "CalcAbsentRef"]) {
    const name = text(value),
      ref: [R | null] = [null],
      desc: [D | null] = [null];
    type.typelib_typedescriptionreference_new(ref, C.ENUM, name.pData);
    header.TYPELIB_DANGER_GET(desc, required(ref[0]));
    const d = desc[0] as D | null;
    emit(d !== null, required(ref[0]).nRefCount, required(ref[0]).pType !== null, calls);
    if (d !== null) {
      observe(d);
      header.TYPELIB_DANGER_RELEASE(d);
    } else {
      header.TYPELIB_DANGER_GET(desc, required(ref[0]));
      emit(desc[0] === null, required(ref[0]).pType === null, calls);
    }
    type.typelib_typedescriptionreference_release(required(ref[0]));
    name.dispose();
  }
  type.typelib_typedescription_revokeCallback(null, provider);
  const structure = text("CalcInterfaceStruct"),
    memberName = text("iface"),
    member: typelib_CompoundMember_Init = {
      eTypeClass: C.INTERFACE,
      pTypeName: ifaceName.pData,
      pMemberName: memberName.pData,
    },
    d: [D | null] = [null];
  type.typelib_typedescription_new(d, C.STRUCT, structure.pData, null, 1, [member]);
  compound(required(d[0]));
  type.typelib_typedescription_release(required(d[0]));
  emit(parent.nRefCount);
  type.typelib_typedescription_release(parent);
  type.typelib_typedescription_release(integer);
  for (const name of [integerName, ifaceName, structure, memberName]) name.dispose();
  finish();
});

it("retains every original checked factory assertion without post-failure recovery claims", /** Replays each native process assertion with independent portable singleton owners. @returns Completion. */ async () => {
  for (const item of fixture.factoryAssertions) {
    const { type, text } = await context("factory"),
      name = text(item.index === 0 ? "CalcPoly<long>" : "CalcAssert"),
      member = text("part"),
      typeName = text(item.index === 0 ? "long" : "CalcAbsent"),
      slot: [D | null] = [null];
    expect(
      /** Invokes the actual original checked factory witness. @returns Original failure. */ () =>
        type.typelib_typedescription_new(slot, C.STRUCT, name.pData, null, 1, [
          {
            eTypeClass: item.index === 0 ? C.LONG : C.TYPEDEF,
            pTypeName: typeName.pData,
            pMemberName: member.pData,
          },
        ]),
    ).toThrow("assert(" + item.expression + ")");
  }
});
