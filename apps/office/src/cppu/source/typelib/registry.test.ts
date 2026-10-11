/** @fileoverview Complete genuine CPPU allocation/reference/registration traces, including original specific fields and shared prefix ownership. */
import { createHash } from "node:crypto";
import { gunzipSync } from "node:zlib";
import { describe, expect, it } from "vitest";
import fixture from "./native-type-primitives-cases.json";
import * as type from "./typelib";
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
import type { rtl_uString } from "../../../sal/inc/rtl/ustring.h";
import {
  rtl_uString_acquire,
  rtl_uString_newFromStr_WithLength,
  rtl_uString_release,
} from "../../../sal/inc/rtl/ustring.h";

/** Creates a real RTL dynamic string, avoiding static literal count flags. @param text - Original UTF16 input. @returns Owned original string allocation. */
function string(text: string): rtl_uString {
  const slot: [rtl_uString | null] = [null];
  const units = Uint16Array.from(
    { length: text.length },
    /** Retains each original UTF16 code unit, including unpaired surrogates. @param _unit - Unused array-like value. @param index - Original unit offset. @returns Exact unit. */ (
      _unit,
      index,
    ) => text.charCodeAt(index),
  );
  rtl_uString_newFromStr_WithLength(slot, units, units.length);
  return slot[0] as rtl_uString;
}
/** Returns the original common-prefix view of this allocation. @param d - Original allocation. @returns Selected record view. */
function cast<T>(d: D): T {
  return d as unknown as T;
}
/** Runs the actual shared factory, retaining the original output slot. @param cls - Original class. @param name - Borrowed name. @returns Owned empty description. */
function empty(cls: C, name: rtl_uString): D {
  const slot: [D | null] = [null];
  type.typelib_typedescription_newEmpty(slot, cls, name);
  return slot[0] as D;
}
/** Completes only the fields required by the original member destructor. @param d - Actual original empty member description. @param name - Borrowed name. @returns Nothing. */
function prepareMember(d: D, name: rtl_uString): void {
  if (d.eTypeClass === C.INTERFACE_METHOD) {
    const method = cast<M>(d);
    method.pInterface = cast<I>(empty(C.INTERFACE, name));
    method.aBase.pMemberName = name;
    rtl_uString_acquire(name);
  } else if (d.eTypeClass === C.INTERFACE_ATTRIBUTE)
    cast<A>(d).pInterface = cast<I>(empty(C.INTERFACE, name));
}

describe("original CPPU registry ownership", /** Groups genuine owner observations. @returns Nothing. */ () => {
  it("matches every complete original allocated record and ownership transition", /** Replays every original initialized field/count/identity observation. @returns Nothing. */ () => {
    const values: number[] = [];
    /** Retains a complete native observation row. @param row - Full signed32 values. @returns Nothing. */
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
    for (let cls = 0; cls < 32; cls++) {
      if (cls === C.TYPEDEF) continue;
      const name = string("CalcRegistry"),
        d = empty(cls, name);
      observe(d);
      type.typelib_typedescription_acquire(d);
      observe(d);
      type.typelib_typedescription_release(d);
      observe(d);
      prepareMember(d, name);
      type.typelib_typedescription_release(d);
      emit(name.refCount);
      rtl_uString_release(name);
    }
    for (let cls = 0; cls < 32; cls++) {
      if (cls === C.TYPEDEF) continue;
      const name = string("CalcReference"),
        slot: [R | null] = [null];
      type.typelib_typedescriptionreference_new(slot, cls, name);
      const r = slot[0] as unknown as R;
      reference(r);
      r.nStaticRefCount = 3;
      r.eTypeClass = cls;
      r.pTypeName = name;
      r.pUniqueIdentifier = r;
      r.pReserved = r;
      reference(r);
      r.pUniqueIdentifier = null;
      r.pReserved = null;
      r.nStaticRefCount = 0;
      type.typelib_typedescriptionreference_acquire(r);
      reference(r);
      type.typelib_typedescriptionreference_release(r);
      reference(r);
      const lookup: [R | null] = [null];
      type.typelib_typedescriptionreference_getByName(lookup, name);
      emit(lookup[0] === r);
      reference(r);
      type.typelib_typedescriptionreference_getByName(lookup, name);
      reference(r);
      type.typelib_typedescriptionreference_release(lookup[0] as unknown as R);
      lookup[0] = null;
      type.typelib_typedescriptionreference_new(lookup, C.LONG, name);
      emit(lookup[0] === r);
      reference(r);
      type.typelib_typedescriptionreference_release(lookup[0] as unknown as R);
      type.typelib_typedescriptionreference_release(r);
      lookup[0] = null;
      type.typelib_typedescriptionreference_getByName(lookup, name);
      emit(lookup[0] === null);
      emit(name.refCount);
      rtl_uString_release(name);
    }
    for (const cls of [C.LONG, C.SEQUENCE, C.STRUCT, C.EXCEPTION, C.ENUM, C.INTERFACE, C.STRING]) {
      const name = string("CalcTransfer"),
        slot: [R | null] = [null];
      type.typelib_typedescriptionreference_new(slot, cls, name);
      const r = slot[0] as unknown as R,
        original = r.pType;
      const desc: [D | null] = [empty(cls, name)];
      const source = desc[0] as D;
      source.bOnDemand = true;
      source.nSize = 48;
      source.nAlignment = 8;
      if (cls === C.INTERFACE)
        cast<I>(source).aUik = { m_Data1: 1, m_Data2: 2, m_Data3: 3, m_Data4: 4, m_Data5: 5 };
      type.typelib_typedescription_register(desc);
      const d = desc[0] as D;
      emit(d === original, d.pWeakRef === r);
      observe(d);
      reference(r);
      type.typelib_typedescription_acquire(d);
      type.typelib_typedescription_register(desc);
      observe(d);
      const duplicate: [D | null] = [empty(cls, name)];
      (duplicate[0] as D).bOnDemand = true;
      type.typelib_typedescription_register(duplicate);
      emit(duplicate[0] === d);
      observe(d);
      type.typelib_typedescription_release(duplicate[0] as D);
      type.typelib_typedescription_release(d);
      type.typelib_typedescription_release(d);
      type.typelib_typedescriptionreference_release(r);
      emit(name.refCount);
      rtl_uString_release(name);
    }
    {
      const name = string("CalcEnum"),
        slot: [R | null] = [null];
      type.typelib_typedescriptionreference_new(slot, C.ENUM, name);
      const r = slot[0] as unknown as R;
      const initial: [D | null] = [empty(C.ENUM, name)];
      (initial[0] as D).bComplete = false;
      (initial[0] as D).bOnDemand = true;
      type.typelib_typedescription_register(initial);
      const d = initial[0] as D;
      observe(d);
      const full: [D | null] = [empty(C.ENUM, name)],
        e = cast<E>(full[0] as D);
      e.nDefaultEnumValue = 42;
      e.nEnumValues = 2;
      e.pEnumValues = new Int32Array([42, 51]);
      e.ppEnumNames = [name, name];
      rtl_uString_acquire(name);
      rtl_uString_acquire(name);
      (full[0] as D).bOnDemand = false;
      type.typelib_typedescription_register(full);
      emit(full[0] === d);
      observe(d);
      d.bComplete = false;
      const ondemand: [D | null] = [empty(C.ENUM, name)];
      (ondemand[0] as D).bOnDemand = true;
      (ondemand[0] as D).bComplete = false;
      type.typelib_typedescription_register(ondemand);
      observe(d);
      type.typelib_typedescription_release(ondemand[0] as D);
      type.typelib_typedescription_release(full[0] as D);
      type.typelib_typedescription_release(d);
      d.bOnDemand = true;
      type.typelib_typedescription_release(d);
      type.typelib_typedescriptionreference_release(r);
      emit(name.refCount);
      rtl_uString_release(name);
    }
    for (const cls of [C.INTERFACE_METHOD, C.INTERFACE_ATTRIBUTE])
      for (const existing of [false, true]) {
        const name = string("CalcWeak"),
          slot: [R | null] = [null];
        if (existing) type.typelib_typedescriptionreference_new(slot, cls, name);
        const initial: [D | null] = [empty(cls, name)];
        prepareMember(initial[0] as D, name);
        (initial[0] as D).bOnDemand = true;
        type.typelib_typedescription_register(initial);
        const d = initial[0] as D;
        observe(d);
        if (!existing) type.typelib_typedescriptionreference_getByName(slot, name);
        const r = slot[0] as unknown as R;
        reference(r);
        const duplicate: [D | null] = [empty(cls, name)];
        prepareMember(duplicate[0] as D, name);
        (duplicate[0] as D).bOnDemand = true;
        type.typelib_typedescription_register(duplicate);
        emit(duplicate[0] === d);
        observe(d);
        type.typelib_typedescription_release(duplicate[0] as D);
        type.typelib_typedescription_release(d);
        reference(r);
        type.typelib_typedescriptionreference_release(r);
        emit(name.refCount);
        rtl_uString_release(name);
      }
    {
      const name = string("CalcReplace"),
        slot: [D | null] = [empty(C.LONG, name)];
      type.typelib_typedescription_newEmpty(slot, C.STRING, name);
      observe(slot[0] as D);
      type.typelib_typedescription_release(slot[0] as D);
      emit(name.refCount);
      rtl_uString_release(name);
    }
    // Original initialized count-field witnesses, separate from a claim of native concurrent execution.
    for (const cls of [C.LONG, C.INTERFACE_METHOD]) {
      const name = string("CalcDying"),
        old: [R | null] = [null];
      type.typelib_typedescriptionreference_new(old, cls, name);
      const previous = old[0] as R;
      previous.nRefCount = 0;
      const fresh: [R | null] = [null];
      type.typelib_typedescriptionreference_new(fresh, cls, name);
      const current = fresh[0] as R;
      emit(previous !== current, previous.nRefCount);
      previous.nRefCount = 1;
      type.typelib_typedescriptionreference_release(previous);
      const found: [R | null] = [null];
      type.typelib_typedescriptionreference_getByName(found, name);
      emit(found[0] === current);
      reference(current);
      type.typelib_typedescriptionreference_release(found[0] as R);
      type.typelib_typedescriptionreference_release(current);
      emit(name.refCount);
      rtl_uString_release(name);
    }
    for (const initialized of [false, true]) {
      const name = string("CalcWeakState"),
        slot: [R | null] = [null];
      type.typelib_typedescriptionreference_new(slot, C.INTERFACE_METHOD, name);
      const r = slot[0] as unknown as R,
        old: [D | null] = [empty(C.INTERFACE_METHOD, name)];
      prepareMember(old[0] as D, name);
      (old[0] as D).bOnDemand = true;
      if (initialized) {
        type.typelib_typedescription_register(old);
        (old[0] as D).nRefCount = 0;
      } else r.pType = old[0];
      const fresh: [D | null] = [empty(C.INTERFACE_METHOD, name)];
      prepareMember(fresh[0] as D, name);
      (fresh[0] as D).bOnDemand = true;
      type.typelib_typedescription_register(fresh);
      observe(fresh[0] as D);
      reference(r);
      if (initialized) (old[0] as D).nRefCount = 1;
      type.typelib_typedescription_release(old[0] as D);
      emit(r.pType === fresh[0]);
      type.typelib_typedescription_release(fresh[0] as D);
      type.typelib_typedescriptionreference_release(r);
      emit(name.refCount);
      rtl_uString_release(name);
    }
    for (const cls of [
      C.SEQUENCE,
      C.STRUCT,
      C.EXCEPTION,
      C.INTERFACE,
      C.INTERFACE_METHOD,
      C.INTERFACE_ATTRIBUTE,
      C.ENUM,
    ]) {
      const name = string("CalcMembers"),
        childName = string("CalcChild"),
        memberName = string("CalcMember"),
        exceptionName = string("CalcException"),
        weakName = string("CalcMethod");
      const childSlot: [R | null] = [null],
        exceptionSlot: [R | null] = [null],
        memberSlot: [R | null] = [null];
      type.typelib_typedescriptionreference_new(childSlot, C.LONG, childName);
      type.typelib_typedescriptionreference_new(exceptionSlot, C.EXCEPTION, exceptionName);
      type.typelib_typedescriptionreference_new(memberSlot, C.INTERFACE_METHOD, weakName);
      const child = childSlot[0] as R,
        exception = exceptionSlot[0] as R,
        member = memberSlot[0] as R,
        base = empty(cls === C.STRUCT || cls === C.EXCEPTION ? C.EXCEPTION : C.INTERFACE, name),
        d = empty(cls, name);
      if (cls === C.SEQUENCE) {
        cast<Q>(d).pType = child;
        type.typelib_typedescriptionreference_acquire(child);
      } else if (cls === C.STRUCT || cls === C.EXCEPTION) {
        const p = cast<P>(d);
        p.pBaseTypeDescription = cast<P>(base);
        type.typelib_typedescription_acquire(base);
        p.nMembers = 2;
        p.pMemberOffsets = new Int32Array([0, 8]);
        p.ppTypeRefs = [child, child];
        type.typelib_typedescriptionreference_acquire(child);
        type.typelib_typedescriptionreference_acquire(child);
        p.ppMemberNames = [memberName, memberName];
        rtl_uString_acquire(memberName);
        rtl_uString_acquire(memberName);
        if (cls === C.STRUCT) cast<S>(d).pParameterizedTypes = [false, true];
      } else if (cls === C.INTERFACE) {
        const p = cast<I>(d);
        p.nMembers = p.nAllMembers = 2;
        p.ppMembers = p.ppAllMembers = [member, member];
        type.typelib_typedescriptionreference_acquire(member);
        type.typelib_typedescriptionreference_acquire(member);
        p.nBaseTypes = 1;
        p.ppBaseTypes = [cast<I>(base)];
        type.typelib_typedescription_acquire(base);
        p.pMapMemberIndexToFunctionIndex = new Int32Array([0, 1]);
        p.nMapFunctionIndexToMemberIndex = 2;
        p.pMapFunctionIndexToMemberIndex = new Int32Array([0, 1]);
      } else if (cls === C.INTERFACE_METHOD) {
        const p = cast<M>(d);
        p.aBase.pMemberName = memberName;
        rtl_uString_acquire(memberName);
        p.pInterface = cast<I>(base);
        type.typelib_typedescription_acquire(base);
        p.pReturnTypeRef = child;
        type.typelib_typedescriptionreference_acquire(child);
        p.nParams = 2;
        p.pParams = [
          { pName: memberName, pTypeRef: child, bIn: true, bOut: false },
          { pName: memberName, pTypeRef: child, bIn: false, bOut: true },
        ];
        rtl_uString_acquire(memberName);
        rtl_uString_acquire(memberName);
        type.typelib_typedescriptionreference_acquire(child);
        type.typelib_typedescriptionreference_acquire(child);
        p.nExceptions = 2;
        p.ppExceptions = [exception, exception];
        type.typelib_typedescriptionreference_acquire(exception);
        type.typelib_typedescriptionreference_acquire(exception);
        p.pBaseRef = member;
        type.typelib_typedescriptionreference_acquire(member);
      } else if (cls === C.INTERFACE_ATTRIBUTE) {
        const p = cast<A>(d);
        p.aBase.pMemberName = memberName;
        rtl_uString_acquire(memberName);
        p.pInterface = cast<I>(base);
        type.typelib_typedescription_acquire(base);
        p.pAttributeTypeRef = child;
        type.typelib_typedescriptionreference_acquire(child);
        p.nGetExceptions = 2;
        p.ppGetExceptions = [exception, exception];
        type.typelib_typedescriptionreference_acquire(exception);
        type.typelib_typedescriptionreference_acquire(exception);
        p.nSetExceptions = 1;
        p.ppSetExceptions = [exception];
        type.typelib_typedescriptionreference_acquire(exception);
        p.pBaseRef = member;
        type.typelib_typedescriptionreference_acquire(member);
      } else {
        const p = cast<E>(d);
        p.nDefaultEnumValue = 3;
        p.nEnumValues = 2;
        p.pEnumValues = new Int32Array([3, 4]);
        p.ppEnumNames = [memberName, memberName];
        rtl_uString_acquire(memberName);
        rtl_uString_acquire(memberName);
      }
      observe(d);
      emit(
        child.nRefCount,
        exception.nRefCount,
        member.nRefCount,
        base.nRefCount,
        memberName.refCount,
      );
      type.typelib_typedescription_release(d);
      emit(
        child.nRefCount,
        exception.nRefCount,
        member.nRefCount,
        base.nRefCount,
        memberName.refCount,
      );
      type.typelib_typedescription_release(base);
      type.typelib_typedescriptionreference_release(child);
      type.typelib_typedescriptionreference_release(exception);
      type.typelib_typedescriptionreference_release(member);
      emit(name.refCount);
      emit(childName.refCount);
      emit(exceptionName.refCount);
      emit(weakName.refCount);
      for (const value of [name, childName, memberName, exceptionName, weakName])
        rtl_uString_release(value);
    }
    for (const cls of [C.STRUCT, C.EXCEPTION, C.INTERFACE]) {
      const name = string("CalcComplete"),
        memberName = string("CalcPart"),
        slot: [R | null] = [null],
        childSlot: [R | null] = [null];
      type.typelib_typedescriptionreference_new(slot, cls, name);
      type.typelib_typedescriptionreference_new(
        childSlot,
        cls === C.INTERFACE ? C.INTERFACE_METHOD : C.LONG,
        memberName,
      );
      const r = slot[0] as unknown as R,
        child = childSlot[0] as R;
      const initial: [D | null] = [empty(cls, name)];
      (initial[0] as D).bComplete = false;
      (initial[0] as D).bOnDemand = true;
      if (cls !== C.INTERFACE) {
        const p = cast<P>(initial[0] as D);
        p.nMembers = 1;
        p.pMemberOffsets = new Int32Array([0]);
        p.ppTypeRefs = [child];
        type.typelib_typedescriptionreference_acquire(child);
      }
      type.typelib_typedescription_register(initial);
      observe(initial[0] as D);
      const full: [D | null] = [empty(cls, name)];
      (full[0] as D).bOnDemand = true;
      if (cls === C.INTERFACE) {
        const p = cast<I>(full[0] as D);
        p.nMembers = p.nAllMembers = 1;
        p.ppMembers = p.ppAllMembers = [child];
        type.typelib_typedescriptionreference_acquire(child);
        p.pMapMemberIndexToFunctionIndex = new Int32Array([0]);
        p.nMapFunctionIndexToMemberIndex = 1;
        p.pMapFunctionIndexToMemberIndex = new Int32Array([0]);
        (full[0] as D).bComplete = false;
      } else {
        const p = cast<P>(full[0] as D);
        p.nMembers = 1;
        p.pMemberOffsets = new Int32Array([0]);
        p.ppTypeRefs = [child];
        type.typelib_typedescriptionreference_acquire(child);
        p.ppMemberNames = [memberName];
        rtl_uString_acquire(memberName);
      }
      type.typelib_typedescription_register(full);
      emit(initial[0] === full[0]);
      observe(initial[0] as D);
      reference(child);
      type.typelib_typedescription_release(full[0] as D);
      type.typelib_typedescription_release(initial[0] as D);
      type.typelib_typedescriptionreference_release(r);
      type.typelib_typedescriptionreference_release(child);
      emit(name.refCount);
      emit(memberName.refCount);
      rtl_uString_release(name);
      rtl_uString_release(memberName);
    }
    {
      const name = string("CalcDemand"),
        slot: [R | null] = [null];
      type.typelib_typedescriptionreference_new(slot, C.ENUM, name);
      const r = slot[0] as unknown as R,
        initial: [D | null] = [empty(C.ENUM, name)];
      (initial[0] as D).bComplete = false;
      type.typelib_typedescription_register(initial);
      const d = initial[0] as D;
      observe(d);
      const full: [D | null] = [empty(C.ENUM, name)];
      (full[0] as D).bOnDemand = true;
      type.typelib_typedescription_register(full);
      emit(d === full[0]);
      observe(d);
      type.typelib_typedescription_release(full[0] as D);
      type.typelib_typedescription_release(d);
      type.typelib_typedescriptionreference_release(r);
      emit(name.refCount);
      rtl_uString_release(name);
    }
    {
      const name = string("CalcRetained"),
        initial: [D | null] = [empty(C.ENUM, name)];
      (initial[0] as D).bComplete = false;
      type.typelib_typedescription_register(initial);
      const d = initial[0] as D;
      observe(d);
      const full: [D | null] = [empty(C.ENUM, name)];
      (full[0] as D).bOnDemand = true;
      type.typelib_typedescription_register(full);
      emit(d === full[0]);
      observe(d);
      type.typelib_typedescription_release(full[0] as D);
      type.typelib_typedescription_release(d);
      emit(name.refCount);
      rtl_uString_release(name);
    }
    {
      /** Concrete original callback context, supplied by this caller. */
      interface Context {
        /** Invocation count. */ calls: number;
        /** Caller-selected provider response. */ mode: number;
        /** Borrowed original alias target. */ target: R | null;
      }
      /** Caller-supplied native callback contract; all returned objects come from the actual ported original factory. @param opaque - Original opaque caller context. @param ret - Actual inout description slot. @param name - Borrowed requested name. @returns Nothing. */
      function callback(opaque: unknown, ret: [D | null], name: rtl_uString): void {
        const context = opaque as Context;
        context.calls++;
        if (context.mode === 1) ret[0] = empty(C.LONG, name);
        else if (context.mode === 2) {
          ret[0] = empty(C.SEQUENCE, name);
          cast<Q>(ret[0]).pType = context.target;
          ret[0].eTypeClass = C.TYPEDEF;
        }
      }
      const missing: Context = { calls: 0, mode: 0, target: null },
        other: Context = { calls: 0, mode: 0, target: null },
        provider: Context = { calls: 0, mode: 1, target: null },
        last: Context = { calls: 0, mode: 0, target: null };
      type.typelib_typedescription_registerCallback(missing, callback);
      type.typelib_typedescription_registerCallback(missing, callback);
      type.typelib_typedescription_registerCallback(other, callback);
      type.typelib_typedescription_registerCallback(provider, callback);
      type.typelib_typedescription_registerCallback(last, callback);
      const name = string("CalcCallback"),
        slot: [R | null] = [null];
      type.typelib_typedescriptionreference_new(slot, C.TYPEDEF, name);
      emit(missing.calls, other.calls, provider.calls, last.calls);
      reference(slot[0] as unknown as R);
      type.typelib_typedescriptionreference_release(slot[0] as unknown as R);
      slot[0] = null;
      const replacedName = string("CalcProviderOld"),
        replacementName = string("CalcReplacement");
      type.typelib_typedescriptionreference_new(slot, C.INTERFACE_METHOD, replacedName);
      type.typelib_typedescriptionreference_new(slot, C.TYPEDEF, replacementName);
      reference(slot[0] as unknown as R);
      emit(missing.calls, other.calls, provider.calls, last.calls, replacedName.refCount);
      type.typelib_typedescriptionreference_release(slot[0] as unknown as R);
      slot[0] = null;
      rtl_uString_release(replacedName);
      rtl_uString_release(replacementName);
      type.typelib_typedescription_revokeCallback(missing, callback);
      type.typelib_typedescription_revokeCallback(provider, callback);
      type.typelib_typedescriptionreference_new(slot, C.TYPEDEF, name);
      emit(missing.calls, other.calls, provider.calls, last.calls, slot[0] === null);
      type.typelib_typedescriptionreference_new(slot, C.LONG, name);
      type.typelib_typedescriptionreference_new(slot, C.TYPEDEF, name);
      emit(missing.calls, other.calls, provider.calls, last.calls, slot[0] === null);
      type.typelib_typedescription_revokeCallback(other, callback);
      type.typelib_typedescription_revokeCallback(last, callback);
      const targetName = string("CalcAliasTarget"),
        oldName = string("CalcAliasOld"),
        targetSlot: [R | null] = [null];
      type.typelib_typedescriptionreference_new(targetSlot, C.LONG, targetName);
      const target = targetSlot[0] as R,
        alias: Context = { calls: 0, mode: 2, target };
      type.typelib_typedescription_registerCallback(alias, callback);
      type.typelib_typedescriptionreference_new(slot, C.INTERFACE_METHOD, oldName);
      type.typelib_typedescriptionreference_new(slot, C.TYPEDEF, name);
      emit(alias.calls, slot[0] === target);
      reference(target);
      type.typelib_typedescriptionreference_release(slot[0] as unknown as R);
      slot[0] = null;
      type.typelib_typedescriptionreference_new(slot, C.TYPEDEF, name);
      reference(target);
      type.typelib_typedescriptionreference_release(slot[0] as unknown as R);
      type.typelib_typedescriptionreference_release(target);
      type.typelib_typedescription_revokeCallback(alias, callback);
      emit(targetName.refCount);
      emit(oldName.refCount);
      rtl_uString_release(targetName);
      rtl_uString_release(oldName);
      provider.calls = 0;
      type.typelib_typedescription_registerCallback(provider, callback);
      const names: rtl_uString[] = [];
      for (let i = 0; i < 258; i++) {
        names.push(string(String(i)));
        slot[0] = null;
        type.typelib_typedescriptionreference_new(slot, C.TYPEDEF, names.at(-1) as rtl_uString);
        reference(slot[0] as unknown as R);
        type.typelib_typedescriptionreference_release(slot[0] as unknown as R);
        emit(
          provider.calls,
          (names.at(-1) as rtl_uString).refCount,
          (names[0] as rtl_uString).refCount,
        );
      }
      type.typelib_typedescription_revokeCallback(provider, callback);
      rtl_uString_release(name);
      for (const value of names) rtl_uString_release(value);
    }

    const raw = gunzipSync(Buffer.from(fixture.registry.gzipBase64, "base64"));
    expect(createHash("sha256").update(raw).digest("hex")).toBe(fixture.registry.rawHash);
    const actual = Buffer.alloc(values.length * 4);
    values.forEach(
      /** Retains every observed signed32 field byte. @param value - Original observation. @param i - Wire index. @returns Buffer offset after the write. */ (
        value,
        i,
      ) => actual.writeInt32LE(value, i * 4),
    );
    expect(actual.equals(raw)).toBe(true);
  });
});
