/** @fileoverview Complete original generated interface observations over actual shared owners, with independent cold processes and both full initialization orders. */
import { it } from "vitest";
import fixture from "./native-generated-interface-cases.json";
import { createUnoNativeContext } from "../../../../../../test/uno-native-values";
import type {
  typelib_TypeDescription as D,
  typelib_TypeDescriptionReference as R,
  typelib_InterfaceTypeDescription as I,
  typelib_InterfaceMethodTypeDescription as M,
  typelib_MethodParameter as P,
} from "../../../../typelib/typedescription";
import type { Type } from "./Type";

/** Loads one genuine fresh source-caller process; supplies no replacement type/default/interface implementation. @param mode - Whole native mode. @returns Exact initialized observations and actual getters. */
async function context(mode: keyof typeof fixture.captures) {
  const x = await createUnoNativeContext(fixture.captures[mode]),
    modules = [
      await import("./XWeak"),
      await import("./XAdapter"),
      await import("./XReference"),
      await import("./XAggregation"),
      await import("../lang/XServiceInfo"),
    ] as const,
    classes = [
      modules[0].XWeak,
      modules[1].XAdapter,
      modules[2].XReference,
      modules[3].XAggregation,
      modules[4].XServiceInfo,
    ],
    { Type } = await import("./Type"),
    { Any } = await import("./Any"),
    { UnoType } = await import("../../../../unotype");
  /** Original caller selects a declared C++ getter expression. @param index - Declared interface. @param kind - Original helper expression. @returns Actual borrowed original type. */
  function get(index: number, kind: number): Type {
    const module = modules[index] as (typeof modules)[number];
    if (kind === 0) return UnoType.get(module.cppu_detail_getUnoType);
    if (kind === 1) return (classes[index] as (typeof classes)[number]).static_type();
    if (kind === 2) return module.getCppuType(null);
    if (kind === 3) return UnoType.get(["Reference", module.cppu_detail_getUnoType]);
    return module.cppu_detail_getUnoType();
  }
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
  return { ...x, get, observe };
}

for (const mode of ["cold0", "cold1", "cold2", "cold3", "cold4", "forward", "reverse"] as const) {
  it(`matches complete original generated interface ${mode} stream`, /** Pure declared native caller expressions and complete metadata; no selected summary hash or virtual implementation. @returns Whole native byte parity. */ async () => {
    const x = await context(mode),
      order =
        mode === "forward"
          ? [0, 1, 2, 3, 4]
          : mode === "reverse"
            ? [4, 3, 2, 1, 0]
            : [Number(mode.slice(4))];
    for (const index of order) {
      x.emit(7, index);
      const t = x.get(index, 0);
      x.observe(t);
      for (let kind = 1; kind < 5; kind++) {
        const v = x.get(index, kind);
        x.emit(kind, v === t, v.getTypeLibType() === t.getTypeLibType());
        x.ref(v.getTypeLibType());
      }
    }
    for (const index of order) {
      x.emit(8, index);
      x.observe(x.get(index, 0));
    }
    x.finish();
  });
}
