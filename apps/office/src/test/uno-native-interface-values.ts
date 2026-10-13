/** @fileoverview Shared pure observation of complete initialized original interface/method/map/Type/Any fields; no replacement runtime owner. */
import { createUnoNativeContext } from "./uno-native-values";
import type { UnoNativeCapture } from "./uno-native-values";
import type {
  typelib_TypeDescription as D,
  typelib_TypeDescriptionReference as R,
  typelib_InterfaceTypeDescription as I,
  typelib_InterfaceMethodTypeDescription as M,
  typelib_MethodParameter as P,
} from "../cppu/inc/typelib/typedescription";
import type { Type } from "../cppu/inc/com/sun/star/uno/Type";
/** Loads a fresh genuine observation context with actual shared Type/Any owners. @param capture - Whole original stream. @returns Complete observers and real dependencies. */
export async function createUnoNativeInterfaceContext(capture: UnoNativeCapture) {
  const x = await createUnoNativeContext(capture),
    { Type } = await import("../cppu/inc/com/sun/star/uno/Type"),
    { Any } = await import("../cppu/inc/com/sun/star/uno/Any");
  /** Whole initialized interface/base/member/alias/map fields; map fields are read only after original completion. @param i - Actual acquired description. @returns Nothing. */
  function iface(i: I): void {
    x.desc(i.aBase);
    x.emit(
      i.nMembers,
      i.nAllMembers,
      i.nBaseTypes,
      i.ppBaseTypes === null,
      i.pBaseTypeDescription === null,
      i.ppMembers === null,
      i.ppAllMembers === null,
    );
    const u = i.aUik;
    x.emit(u.m_Data1, u.m_Data2, u.m_Data3, u.m_Data4, u.m_Data5);
    const bases = i.ppBaseTypes as I[],
      own = i.ppMembers as R[],
      all = i.ppAllMembers as R[];
    if (i.nBaseTypes) x.emit(i.pBaseTypeDescription === bases[0]);
    for (let k = 0; k < i.nBaseTypes; k++) x.desc((bases[k] as I).aBase);
    for (let k = 0; k < i.nMembers; k++) {
      x.emit(own[k] === all[i.nAllMembers - i.nMembers + k]);
      x.ref(own[k] as R);
    }
    for (let k = 0; k < i.nAllMembers; k++) x.ref(all[k] as R);
    if (i.aBase.bComplete) {
      x.emit(
        i.pMapMemberIndexToFunctionIndex === null,
        i.nMapFunctionIndexToMemberIndex,
        i.pMapFunctionIndexToMemberIndex === null,
      );
      for (let k = 0; k < i.nAllMembers; k++)
        x.emit((i.pMapMemberIndexToFunctionIndex as Int32Array)[k] as number);
      for (let k = 0; k < i.nMapFunctionIndexToMemberIndex; k++)
        x.emit((i.pMapFunctionIndexToMemberIndex as Int32Array)[k] as number);
    }
  }
  /** Every initialized original own/inherited method, parameter, exception and interface ownership field. @param m - Actual method. @param owner - Actual queried interface. @returns Nothing. */
  function method(m: M, owner: I): void {
    x.desc(m.aBase.aBase);
    x.emit(m.aBase.nPosition);
    x.text(m.aBase.pMemberName);
    x.ref(m.pReturnTypeRef);
    x.emit(
      m.nParams,
      m.pParams === null,
      m.nExceptions,
      m.ppExceptions === null,
      m.bOneWay,
      m.pInterface === owner,
      m.pBaseRef === null,
      m.nIndex,
    );
    x.desc((m.pInterface as I).aBase);
    x.ref(m.pBaseRef);
    for (let k = 0; k < m.nParams; k++) {
      const p = (m.pParams as P[])[k] as P;
      x.text(p.pName);
      x.ref(p.pTypeRef);
      x.emit(p.bIn, p.bOut);
    }
    for (let k = 0; k < m.nExceptions; k++) x.ref((m.ppExceptions as R[])[k] as R);
  }
  /** Exact source caller description lookup/completion, method lifetime, Type copy and typed NULL Any observations. @param t - Actual borrowed type. @returns Nothing. */
  function observe(t: Type): void {
    x.ref(t.getTypeLibType());
    x.emit(t.getTypeClass());
    const name = t.getTypeName();
    x.text(name.pData);
    name.dispose();
    const d: [D | null] = [null];
    t.getDescription(d);
    const i = d[0] as unknown as I;
    iface(i);
    for (let k = 0; k < i.nAllMembers; k++) {
      x.emit(k);
      const m: [D | null] = [null],
        r = (i.ppAllMembers as R[])[k] as R;
      x.f.typelib_typedescriptionreference_getDescription(m, r);
      x.emit(m[0] === null);
      if (m[0] !== null) {
        method(m[0] as unknown as M, i);
        x.f.typelib_typedescription_release(m[0]);
      }
      x.ref(r);
    }
    x.emit(x.f.typelib_typedescription_complete(d));
    iface(d[0] as unknown as I);
    x.f.typelib_typedescription_release(d[0] as D);
    x.ref(t.getTypeLibType());
    const copy = new Type(t);
    x.emit(copy.operatorEqual(t), copy.operatorNotEqual(t), copy === t);
    x.ref(copy.getTypeLibType());
    copy.dispose();
    x.ref(t.getTypeLibType());
    const a = new Any([null], t);
    x.ref(a.pType);
    x.emit(a.pData === a, a.pData === x.copy.reservedDataAddress(a));
    x.emit((a.pData as [unknown])[0] === null);
    x.emit(a.hasValue(), a.getValueTypeClass());
    a.dispose();
    x.ref(t.getTypeLibType());
  }
  return { ...x, observe };
}
