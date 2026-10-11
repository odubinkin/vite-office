/** @fileoverview Replays complete original derived-member values, array separation, borrowed/transferred ownership and release effects against the unchanged internal CPPU constructor. */
import { createHash } from "node:crypto";
import { gunzipSync } from "node:zlib";
import { describe, expect, it } from "vitest";
import fixture from "./native-type-primitives-cases.json";
import * as type from "./typelib";
import { createDerivedInterfaceMemberDescription } from "./typelib-members";
import { typelib_TypeClass as C } from "../../inc/typelib/typeclass";
import { TYPELIB_TYPEDESCRIPTIONREFERENCE_ISREALLYWEAK as weak } from "../../inc/typelib/typedescription";
import type {
  typelib_TypeDescription as D,
  typelib_TypeDescriptionReference as R,
  typelib_InterfaceTypeDescription as I,
  typelib_InterfaceMethodTypeDescription as M,
  typelib_InterfaceAttributeTypeDescription as A,
  typelib_CompoundTypeDescription as P,
  typelib_EnumTypeDescription as E,
  typelib_StructTypeDescription as S,
  typelib_IndirectTypeDescription as Q,
} from "../../inc/typelib/typedescription";
import {
  rtl_uString_acquire,
  rtl_uString_release,
  rtl_uString_newFromStr_WithLength,
} from "../../../sal/inc/rtl/ustring.h";
import { OUString } from "../../../sal/inc/rtl/ustring";
import type { rtl_uString } from "../../../sal/inc/rtl/ustring.h";
/** Uses the original owned string constructor with complete UTF16 units. @param text - Logical input. @returns Owned string. */
function string(text: string): rtl_uString {
  const slot: [rtl_uString | null] = [null];
  const units = Uint16Array.from(
    { length: text.length },
    /** Retains every code unit. @param _unit - Unused element. @param i - Offset. @returns Original unit. */ (
      _unit,
      i,
    ) => text.charCodeAt(i),
  );
  rtl_uString_newFromStr_WithLength(slot, units, units.length);
  return slot[0] as rtl_uString;
}
/** Original prefix view. @param d - Actual allocated description. @returns Selected view of the same allocation. */
function cast<T>(d: D): T {
  return d as unknown as T;
}
/** Allocates through the original empty factory. @param cls - Actual class. @param name - Borrowed name. @returns Owned description. */
function empty(cls: C, name: rtl_uString): D {
  const slot: [D | null] = [null];
  type.typelib_typedescription_newEmpty(slot, cls, name);
  return slot[0] as D;
}
/** Uses the actual original named-reference owner. @param cls - Actual class. @param name - Borrowed name. @returns Owned reference. */
function ref(cls: C, name: rtl_uString): R {
  const slot: [R | null] = [null];
  type.typelib_typedescriptionreference_new(slot, cls, name);
  return slot[0] as R;
}

describe("original derived CPPU members", /** Groups the unchanged original constructor corpus. @returns Nothing. */ () => {
  it("matches complete native fields, copies and transferred ownership", /** Replays every genuine caller operation and complete observation. @returns Nothing. */ () => {
    const values: number[] = [];
    /** Records complete signed32 observation words. @param row - Original words. @returns Nothing. */
    function emit(...row: (number | boolean)[]): void {
      values.push(...row.map(Number));
    }
    /** Observes only fields explicitly initialized by the actual original factory. @param d - Live description. @returns Nothing. */
    function observe(d: D): void {
      emit(
        d.nRefCount,
        d.nStaticRefCount,
        d.eTypeClass,
        d.pTypeName.refCount,
        d.pSelf === d,
        d.pUniqueIdentifier === null,
        d.pReserved === null,
        d.bComplete,
        d.nSize,
        d.nAlignment,
        d.pWeakRef === null,
        d.bOnDemand,
      );
      switch (d.eTypeClass) {
        case C.SEQUENCE:
          emit(cast<Q>(d).pType === null);
          break;
        case C.STRUCT:
        case C.EXCEPTION: {
          const p = cast<P>(d);
          emit(
            p.pBaseTypeDescription === null,
            p.nMembers,
            p.pMemberOffsets === null,
            p.ppTypeRefs === null,
            p.ppMemberNames === null,
          );
          if (d.eTypeClass === C.STRUCT) emit(cast<S>(d).pParameterizedTypes === null);
          break;
        }
        case C.ENUM: {
          const p = cast<E>(d);
          emit(p.nDefaultEnumValue, p.nEnumValues, p.ppEnumNames === null, p.pEnumValues === null);
          break;
        }
        case C.INTERFACE: {
          const p = cast<I>(d);
          emit(
            p.pBaseTypeDescription === null,
            p.nMembers,
            p.ppMembers === null,
            p.nAllMembers,
            p.ppAllMembers === null,
            p.nMapFunctionIndexToMemberIndex,
            p.pMapFunctionIndexToMemberIndex === null,
            p.pMapMemberIndexToFunctionIndex === null,
            p.nBaseTypes,
            p.ppBaseTypes === null,
          );
          break;
        }
        case C.INTERFACE_METHOD: {
          const p = cast<M>(d);
          emit(
            p.aBase.pMemberName === null,
            p.pReturnTypeRef === null,
            p.nParams,
            p.pParams === null,
            p.nExceptions,
            p.ppExceptions === null,
            p.pInterface === null,
            p.pBaseRef === null,
            p.nIndex,
          );
          break;
        }
        case C.INTERFACE_ATTRIBUTE: {
          const p = cast<A>(d);
          emit(
            p.aBase.pMemberName === null,
            p.pAttributeTypeRef === null,
            p.pInterface === null,
            p.pBaseRef === null,
            p.nIndex,
            p.nGetExceptions,
            p.ppGetExceptions === null,
            p.nSetExceptions,
            p.ppSetExceptions === null,
          );
          break;
        }
      }
    }
    /** Observes the genuine original reference and ordinary common-prefix allocation. @param r - Live reference. @returns Nothing. */
    function reference(r: R): void {
      emit(
        r.nRefCount,
        r.nStaticRefCount,
        r.eTypeClass,
        r.pTypeName.refCount,
        r.pType === null,
        r.pUniqueIdentifier === null,
        r.pReserved === null,
      );
      if (!weak(r.eTypeClass)) observe(r.pType as D);
    }

    /** Retains complete owned UTF16 string content and counts. @param s - Live original string. @returns Nothing. */
    function memberString(s: rtl_uString): void {
      emit(s.refCount, s.length);
      for (let i = 0; i <= s.length; i++) emit(s.buffer[i] as number);
    }
    /** Records every initialized derived field and all copied values/identity/count witnesses. @param d - Derived allocation. @param base - Borrowed live base. @param r - Transferred live reference. @param iface - Transferred live interface. @returns Nothing. */
    function derivedState(d: D, base: D, r: R, iface: D): void {
      observe(d);
      if (d.eTypeClass === C.INTERFACE_METHOD) {
        const p = cast<M>(d),
          b = cast<M>(base);
        emit(
          p.aBase.nPosition,
          p.bOneWay,
          p.aBase.pMemberName === b.aBase.pMemberName,
          p.pReturnTypeRef === b.pReturnTypeRef,
          p.pInterface === cast<I>(iface),
          p.pBaseRef === r,
          p.pParams !== b.pParams,
        );
        memberString(p.aBase.pMemberName as rtl_uString);
        reference(p.pReturnTypeRef as R);
        for (let i = 0; i < p.nParams; i++) {
          const a = (p.pParams as NonNullable<M["pParams"]>)[i] as NonNullable<
              M["pParams"]
            >[number],
            c = (b.pParams as NonNullable<M["pParams"]>)[i] as NonNullable<M["pParams"]>[number];
          emit(a.pName === c.pName, a.pTypeRef === c.pTypeRef, a.bIn, a.bOut, a !== c);
          memberString(a.pName);
          reference(a.pTypeRef);
        }
        emit(p.ppExceptions !== b.ppExceptions);
        for (let i = 0; i < p.nExceptions; i++) {
          emit((p.ppExceptions as R[])[i] === (b.ppExceptions as R[])[i]);
          reference((p.ppExceptions as R[])[i] as R);
        }
      } else {
        const p = cast<A>(d),
          b = cast<A>(base);
        emit(
          p.aBase.nPosition,
          p.bReadOnly,
          p.aBase.pMemberName === b.aBase.pMemberName,
          p.pAttributeTypeRef === b.pAttributeTypeRef,
          p.pInterface === cast<I>(iface),
          p.pBaseRef === r,
          p.ppGetExceptions !== b.ppGetExceptions,
          p.ppSetExceptions !== b.ppSetExceptions,
        );
        memberString(p.aBase.pMemberName as rtl_uString);
        reference(p.pAttributeTypeRef as R);
        for (let i = 0; i < p.nGetExceptions; i++) {
          emit((p.ppGetExceptions as R[])[i] === (b.ppGetExceptions as R[])[i]);
          reference((p.ppGetExceptions as R[])[i] as R);
        }
        for (let i = 0; i < p.nSetExceptions; i++) {
          emit((p.ppSetExceptions as R[])[i] === (b.ppSetExceptions as R[])[i]);
          reference((p.ppSetExceptions as R[])[i] as R);
        }
      }
      observe(base);
      reference(r);
      observe(iface);
    }
    for (let kind = 0; kind < 2; kind++)
      for (let flags = 0; flags < 8; flags++) {
        const baseName = string("CalcBase"),
          derivedName = string("CalcDerived"),
          ifaceName = string("CalcInterface"),
          memberName = string("m\0\ud800"),
          paramName = string("pΣ\0"),
          valueName = string("CalcValue"),
          exceptionName = string("CalcException"),
          oldName = string("CalcOld");
        const cls = kind === 0 ? C.INTERFACE_METHOD : C.INTERFACE_ATTRIBUTE;
        const r = ref(cls, baseName),
          value = ref(C.LONG, valueName),
          exc = ref(C.EXCEPTION, exceptionName);
        const base = empty(cls, baseName),
          iface = empty(C.INTERFACE, ifaceName);
        base.bOnDemand = true;
        type.typelib_typedescription_acquire(iface);
        const owner = empty(C.INTERFACE, ifaceName);
        const count = flags & 1 ? 3 : 0,
          flag = (flags & 2) !== 0;
        if (kind === 0) {
          const p = cast<M>(base);
          p.aBase.nPosition = 42;
          p.aBase.pMemberName = memberName;
          rtl_uString_acquire(memberName);
          p.pReturnTypeRef = value;
          type.typelib_typedescriptionreference_acquire(value);
          p.nParams = count;
          if (count) {
            p.pParams = [];
            for (let i = 0; i < count; i++) {
              p.pParams[i] = {
                pName: paramName,
                pTypeRef: value,
                bIn: (i & 1) === 0,
                bOut: (i & 2) !== 0,
              };
              rtl_uString_acquire(paramName);
              type.typelib_typedescriptionreference_acquire(value);
            }
          }
          p.nExceptions = count;
          if (count) {
            p.ppExceptions = [];
            for (let i = 0; i < count; i++) {
              p.ppExceptions[i] = exc;
              type.typelib_typedescriptionreference_acquire(exc);
            }
          }
          p.bOneWay = flag;
          p.pInterface = cast<I>(owner);
        } else {
          const p = cast<A>(base);
          p.aBase.nPosition = 42;
          p.aBase.pMemberName = memberName;
          rtl_uString_acquire(memberName);
          p.pAttributeTypeRef = value;
          type.typelib_typedescriptionreference_acquire(value);
          p.bReadOnly = flag;
          p.pInterface = cast<I>(owner);
          p.nGetExceptions = count;
          p.nSetExceptions = count ? (flag ? 1 : 2) : 0;
          if (count) {
            p.ppGetExceptions = [];
            for (let i = 0; i < count; i++) {
              p.ppGetExceptions[i] = exc;
              type.typelib_typedescriptionreference_acquire(exc);
            }
            p.ppSetExceptions = [];
            for (let i = 0; i < p.nSetExceptions; i++) {
              p.ppSetExceptions[i] = exc;
              type.typelib_typedescriptionreference_acquire(exc);
            }
          }
        }
        const slot: [D | null] = [base];
        type.typelib_typedescription_register(slot);
        expect(slot[0]).toBe(base);
        type.typelib_typedescriptionreference_acquire(r);
        const result: [D | null] = [flags & 4 ? empty(C.LONG, oldName) : null];
        observe(base);
        reference(r);
        observe(iface);
        memberString(memberName);
        memberString(paramName);
        reference(value);
        reference(exc);
        const index = flags & 4 ? -2147483648 : 3,
          position = flags & 4 ? 2147483647 : -1;
        const ok = createDerivedInterfaceMemberDescription(
          result,
          OUString.unacquired([derivedName]),
          r,
          base,
          iface,
          index,
          position,
        );
        emit(ok, oldName.refCount);
        derivedState(result[0] as D, base, r, iface);
        if (kind === 0) {
          const p = cast<M>(base);
          p.bOneWay = !p.bOneWay;
          if (count) {
            const parameter = (p.pParams as NonNullable<M["pParams"]>)[0] as NonNullable<
              M["pParams"]
            >[number];
            parameter.bIn = !parameter.bIn;
          }
        } else {
          const p = cast<A>(base);
          p.bReadOnly = !p.bReadOnly;
        }
        derivedState(result[0] as D, base, r, iface);
        type.typelib_typedescription_release(result[0] as D);
        observe(base);
        reference(r);
        observe(iface);
        memberString(memberName);
        memberString(paramName);
        reference(value);
        reference(exc);
        type.typelib_typedescription_release(base);
        type.typelib_typedescription_release(iface);
        reference(r);
        reference(value);
        reference(exc);
        memberString(memberName);
        memberString(paramName);
        type.typelib_typedescriptionreference_release(r);
        type.typelib_typedescriptionreference_release(value);
        type.typelib_typedescriptionreference_release(exc);
        memberString(baseName);
        memberString(derivedName);
        memberString(ifaceName);
        memberString(valueName);
        memberString(exceptionName);
        for (const name of [
          baseName,
          derivedName,
          ifaceName,
          memberName,
          paramName,
          valueName,
          exceptionName,
          oldName,
        ])
          rtl_uString_release(name);
      }
    for (let missing = 0; missing < 4; missing++) {
      const name = string("CalcInvalid"),
        r = ref(C.LONG, name),
        base = empty(C.LONG, name),
        iface = empty(C.INTERFACE, name),
        result: [D | null] = [empty(C.LONG, name)],
        old = result[0];
      const ok = createDerivedInterfaceMemberDescription(
        result,
        OUString.unacquired([name]),
        missing === 0 ? null : r,
        missing === 1 ? null : base,
        missing === 2 ? null : iface,
        0,
        0,
      );
      emit(ok, result[0] === old);
      observe(result[0] as D);
      reference(r);
      observe(base);
      observe(iface);
      memberString(name);
      type.typelib_typedescription_release(result[0] as D);
      type.typelib_typedescription_release(base);
      type.typelib_typedescription_release(iface);
      type.typelib_typedescriptionreference_release(r);
      memberString(name);
      rtl_uString_release(name);
    }
    const actual = Buffer.alloc(values.length * 4);
    values.forEach(
      /** Writes complete original little-endian words. @param v - Exact signed value. @param i - Word offset. @returns Nothing. */ (
        v,
        i,
      ) => {
        actual.writeInt32LE(v, i * 4);
      },
    );
    const expected = gunzipSync(Buffer.from(fixture.members.gzipBase64, "base64"));
    expect(createHash("sha256").update(expected).digest("hex")).toBe(fixture.members.rawHash);
    expect(actual.equals(expected)).toBe(true);
    expect(actual.length).toBe(expected.length);
  });
});
