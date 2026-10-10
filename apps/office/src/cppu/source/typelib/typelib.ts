/** @fileoverview Original CPPU type records, allocation, reference ownership and registration; completion/static-type providers remain separate required owners. */
import type {
  typelib_TypeDescription,
  typelib_TypeDescriptionReference,
  typelib_CompoundTypeDescription,
  typelib_IndirectTypeDescription,
  typelib_EnumTypeDescription,
  typelib_InterfaceTypeDescription,
  typelib_InterfaceMethodTypeDescription,
  typelib_InterfaceAttributeTypeDescription,
  typelib_typedescription_Callback,
} from "../../inc/typelib/typedescription";
import { rtl_ustr_compare } from "../../../sal/inc/rtl/ustring.h";

/** Original pointer shortcut, class/length tests and terminated-name comparison. @param first - Borrowed original type-reference record; both-null identity is defined. @param second - Borrowed original type-reference record. @returns Original reference equality without acquiring or releasing names/types. */
export function typelib_typedescriptionreference_equals(
  first: Readonly<typelib_TypeDescriptionReference> | null,
  second: Readonly<typelib_TypeDescriptionReference> | null,
): boolean {
  return (
    first === second ||
    ((first as Readonly<typelib_TypeDescriptionReference>).eTypeClass ===
      (second as Readonly<typelib_TypeDescriptionReference>).eTypeClass &&
      (first as Readonly<typelib_TypeDescriptionReference>).pTypeName.length ===
        (second as Readonly<typelib_TypeDescriptionReference>).pTypeName.length &&
      rtl_ustr_compare(
        (first as Readonly<typelib_TypeDescriptionReference>).pTypeName.buffer,
        (second as Readonly<typelib_TypeDescriptionReference>).pTypeName.buffer,
      ) === 0)
  );
}

import { TYPELIB_TYPEDESCRIPTIONREFERENCE_ISREALLYWEAK } from "../../inc/typelib/typedescription";
import { typelib_TypeClass } from "../../inc/typelib/typeclass";
import { osl_atomic_increment, osl_atomic_decrement } from "../../../sal/inc/osl/interlck";
import { rtl_uString_acquire, rtl_uString_release } from "../../../sal/inc/rtl/ustring.h";
import type { rtl_uString } from "../../../sal/inc/rtl/ustring.h";

const counts = new WeakMap<object, Int32Array>();
const referenceViews = new WeakMap<typelib_TypeDescription, typelib_TypeDescriptionReference>();
const descriptionViews = new WeakMap<typelib_TypeDescriptionReference, typelib_TypeDescription>();
/** Adapts one native signed32 count field to actual atomic storage shared by its typed views. @param owner - Concrete allocation/view. @param count - Shared original counter. @returns Nothing. */
function bindCount(owner: object, count: Int32Array): void {
  counts.set(owner, count);
  Object.defineProperty(owner, "nRefCount", {
    enumerable: true,
    /** Reads the original live count. @returns Signed32 count. */
    get(): number {
      return Atomics.load(count, 0);
    },
    /** Writes a native signed32 count. @param value - Original field value. @returns Nothing. */
    set(value: number): void {
      Atomics.store(count, 0, value);
    },
  });
}
/** Adapts the original common-prefix reinterpretation; sequence's extended pType remains distinct from the reference prefix pType/pSelf. @param desc - Live original allocation. @returns New canonical common-prefix view of the same allocation, created exactly once by the allocator. */
function asReference(desc: typelib_TypeDescription): typelib_TypeDescriptionReference {
  const ref = {} as typelib_TypeDescriptionReference;
  bindCount(ref, counts.get(desc) as Int32Array);
  for (const key of [
    "nStaticRefCount",
    "eTypeClass",
    "pTypeName",
    "pUniqueIdentifier",
    "pReserved",
  ] as const) {
    Object.defineProperty(ref, key, {
      enumerable: true,
      /** Reads the actual common-prefix field. @returns Original field value. */
      get(): unknown {
        return desc[key];
      },
      /** Writes the actual common-prefix field. @param value - Native field value. @returns Nothing. */
      set(value: never): void {
        desc[key] = value;
      },
    });
  }
  Object.defineProperty(ref, "pType", {
    enumerable: true,
    /** Reads the pointer sharing pSelf's native offset. @returns Original description pointer. */
    get(): typelib_TypeDescription | null {
      return desc.pSelf;
    },
    /** Writes the pointer sharing pSelf's native offset. @param value - Original description pointer. @returns Nothing. */
    set(value: typelib_TypeDescription | null): void {
      desc.pSelf = value;
    },
  });
  referenceViews.set(desc, ref);
  descriptionViews.set(ref, desc);
  return ref;
}
/** Adapts original prefix reinterpretation; nested aBase prefixes denote the same allocation. @param desc - Original allocation. @returns Typed record view. */
function record<T>(desc: typelib_TypeDescription): T {
  return desc as unknown as T;
}
/** Adapts original terminated-name equality for the unordered map; preserves every UTF16 unit and the first zero boundary. @param name - Borrowed original name. @returns Exact native equality key, without normalization. */
function nameKey(name: rtl_uString): string {
  let key = "";
  for (let i = 0; name.buffer[i] !== 0; i++) key += String.fromCharCode(name.buffer[i] as number);
  return key;
}
/** Original singleton state, restricted to synchronous realm-local records. */
class TypeDescriptor_Init_Impl {
  /** Original weak entries; map keys retain the original terminated-name equality. */
  readonly maWeakMap = new Map<string, typelib_TypeDescriptionReference>();
  /** Original ordered callback/context entries; duplicate pairs remain permitted. */
  readonly maCallbacks: [unknown, typelib_typedescription_Callback][] = [];
  /** Original acquired description cache. */
  readonly maCache: typelib_TypeDescription[] = [];
  /** Original callback chain, stopping at the first returned description. @param ppRet - Empty output slot. @param pName - Requested name. @returns Nothing. */
  callChain(ppRet: [typelib_TypeDescription | null], pName: rtl_uString): void {
    for (const [context, callback] of this.maCallbacks) {
      callback(context, ppRet, pName);
      if (ppRet[0] !== null) return;
    }
  }
}
let singleton: TypeDescriptor_Init_Impl | null = null;
const nCacheSize = 256;
/** Original lazy singleton; no native object graph crosses browser realms. @returns Live original registry state. */
function Init(): TypeDescriptor_Init_Impl {
  if (singleton === null) singleton = new TypeDescriptor_Init_Impl();
  return singleton;
}
/** Original append of callback/context, without deduplication. @param pContext - Opaque context identity. @param pCallback - Original callback. @returns Nothing. */
export function typelib_typedescription_registerCallback(
  pContext: unknown,
  pCallback: typelib_typedescription_Callback,
): void {
  Init().maCallbacks.push([pContext, pCallback]);
}
/** Original erase of every matching callback/context pair. @param pContext - Opaque context identity. @param pCallback - Original callback. @returns Nothing. */
export function typelib_typedescription_revokeCallback(
  pContext: unknown,
  pCallback: typelib_typedescription_Callback,
): void {
  const entries = Init().maCallbacks;
  for (let i = 0; i < entries.length;) {
    const entry = entries[i] as [unknown, typelib_typedescription_Callback];
    if (entry[0] === pContext && entry[1] === pCallback) entries.splice(i, 1);
    else i++;
  }
}
/** Original raw allocation with only explicitly initialized common/specific fields. Unspecified native fields are absent, never guessed zero. @param eTypeClass - Native type class. @param pTypeName - Borrowed owned name. @returns Concrete empty description allocation. */
function allocTypeDescription(
  eTypeClass: typelib_TypeClass,
  pTypeName: rtl_uString,
): typelib_TypeDescription {
  const desc = {
    nStaticRefCount: 0,
    eTypeClass,
    pTypeName,
    pSelf: null,
    pUniqueIdentifier: null,
    pReserved: null,
    bComplete: true,
    nSize: 0,
    nAlignment: 0,
    pWeakRef: null,
    bOnDemand: false,
  } as typelib_TypeDescription;
  bindCount(desc, new Int32Array([1]));
  desc.pSelf = desc;
  rtl_uString_acquire(pTypeName);
  asReference(desc);
  switch (eTypeClass) {
    case typelib_TypeClass.SEQUENCE:
      Object.assign(desc, { aBase: desc, pType: null });
      break;
    case typelib_TypeClass.STRUCT:
      Object.assign(desc, { pParameterizedTypes: null });
      // Original struct compound prefix shares the same native allocation/address.
      Object.assign(desc, {
        aBase: desc,
        pBaseTypeDescription: null,
        nMembers: 0,
        pMemberOffsets: null,
        ppTypeRefs: null,
        ppMemberNames: null,
      });
      break;
    case typelib_TypeClass.EXCEPTION:
      Object.assign(desc, {
        aBase: desc,
        pBaseTypeDescription: null,
        nMembers: 0,
        pMemberOffsets: null,
        ppTypeRefs: null,
        ppMemberNames: null,
      });
      break;
    case typelib_TypeClass.ENUM:
      Object.assign(desc, {
        aBase: desc,
        nDefaultEnumValue: 0,
        nEnumValues: 0,
        ppEnumNames: null,
        pEnumValues: null,
      });
      break;
    case typelib_TypeClass.INTERFACE:
      Object.assign(desc, {
        aBase: desc,
        pBaseTypeDescription: null,
        nMembers: 0,
        ppMembers: null,
        nAllMembers: 0,
        ppAllMembers: null,
        nMapFunctionIndexToMemberIndex: 0,
        pMapFunctionIndexToMemberIndex: null,
        pMapMemberIndexToFunctionIndex: null,
        nBaseTypes: 0,
        ppBaseTypes: null,
      });
      break;
    case typelib_TypeClass.INTERFACE_METHOD:
      Object.assign(desc, {
        aBase: desc,
        pMemberName: null,
        pReturnTypeRef: null,
        nParams: 0,
        pParams: null,
        nExceptions: 0,
        ppExceptions: null,
        pInterface: null,
        pBaseRef: null,
        nIndex: 0,
      });
      break;
    case typelib_TypeClass.INTERFACE_ATTRIBUTE:
      Object.assign(desc, {
        aBase: desc,
        pMemberName: null,
        pAttributeTypeRef: null,
        pInterface: null,
        pBaseRef: null,
        nIndex: 0,
        nGetExceptions: 0,
        ppGetExceptions: null,
        nSetExceptions: 0,
        ppSetExceptions: null,
      });
      break;
    default:
      break;
  }
  return desc;
}
/** Original replacement output and initialized empty factory. @param ppRet - Inout description slot. @param eTypeClass - Native non-typedef class. @param pTypeName - Original name. @returns Nothing. */
export function typelib_typedescription_newEmpty(
  ppRet: [typelib_TypeDescription | null],
  eTypeClass: typelib_TypeClass,
  pTypeName: rtl_uString,
): void {
  if (ppRet[0] !== null) {
    typelib_typedescription_release(ppRet[0]);
    ppRet[0] = null;
  }
  ppRet[0] = allocTypeDescription(eTypeClass, pTypeName);
}
/** Original description acquire through its actual atomic count. @param desc - Live allocated description. @returns Nothing. */
export function typelib_typedescription_acquire(desc: typelib_TypeDescription): void {
  osl_atomic_increment(counts.get(desc) as Int32Array);
}
/** Original reference acquire; ordinary views share the description's exact counter. @param ref - Live original reference. @returns Nothing. */
export function typelib_typedescriptionreference_acquire(
  ref: typelib_TypeDescriptionReference,
): void {
  osl_atomic_increment(counts.get(ref) as Int32Array);
}
/** Original exception-array releases. Native deleted storage is reclaimed when its owning browser allocation becomes unreachable. @param count - Original signed count. @param exceptions - Owned reference array. @returns Nothing. */
function deleteExceptions(
  count: number,
  exceptions: typelib_TypeDescriptionReference[] | null,
): void {
  for (let i = 0; i < count; i++)
    typelib_typedescriptionreference_release(
      (exceptions as typelib_TypeDescriptionReference[])[i] as typelib_TypeDescriptionReference,
    );
}
/** Original release of specific type members; incomplete method/attribute records must first be populated as required by native callers. @param desc - Original live allocation. @returns Nothing. */
function typelib_typedescription_destructExtendedMembers(desc: typelib_TypeDescription): void {
  switch (desc.eTypeClass) {
    case typelib_TypeClass.SEQUENCE: {
      const indirect = record<typelib_IndirectTypeDescription>(desc);
      if (indirect.pType !== null) typelib_typedescriptionreference_release(indirect.pType);
      break;
    }
    case typelib_TypeClass.STRUCT:
    case typelib_TypeClass.EXCEPTION: {
      const compound = record<typelib_CompoundTypeDescription>(desc);
      if (compound.pBaseTypeDescription !== null)
        typelib_typedescription_release(compound.pBaseTypeDescription.aBase);
      for (let i = 0; i < compound.nMembers; i++)
        typelib_typedescriptionreference_release(
          (compound.ppTypeRefs as typelib_TypeDescriptionReference[])[
            i
          ] as typelib_TypeDescriptionReference,
        );
      if (compound.ppMemberNames !== null)
        for (let i = 0; i < compound.nMembers; i++)
          rtl_uString_release(compound.ppMemberNames[i] as rtl_uString);
      break;
    }
    case typelib_TypeClass.INTERFACE: {
      const iface = record<typelib_InterfaceTypeDescription>(desc);
      for (let i = 0; i < iface.nAllMembers; i++)
        typelib_typedescriptionreference_release(
          (iface.ppAllMembers as typelib_TypeDescriptionReference[])[
            i
          ] as typelib_TypeDescriptionReference,
        );
      for (let i = 0; i < iface.nBaseTypes; i++)
        typelib_typedescription_release(
          (
            (iface.ppBaseTypes as typelib_InterfaceTypeDescription[])[
              i
            ] as typelib_InterfaceTypeDescription
          ).aBase,
        );
      break;
    }
    case typelib_TypeClass.INTERFACE_METHOD: {
      const method = record<typelib_InterfaceMethodTypeDescription>(desc);
      if (method.pReturnTypeRef !== null)
        typelib_typedescriptionreference_release(method.pReturnTypeRef);
      for (let i = 0; i < method.nParams; i++) {
        const param = (
          method.pParams as import("../../inc/typelib/typedescription").typelib_MethodParameter[]
        )[i] as import("../../inc/typelib/typedescription").typelib_MethodParameter;
        rtl_uString_release(param.pName);
        typelib_typedescriptionreference_release(param.pTypeRef);
      }
      deleteExceptions(method.nExceptions, method.ppExceptions);
      rtl_uString_release(method.aBase.pMemberName as rtl_uString);
      typelib_typedescription_release(
        (method.pInterface as typelib_InterfaceTypeDescription).aBase,
      );
      if (method.pBaseRef !== null) typelib_typedescriptionreference_release(method.pBaseRef);
      break;
    }
    case typelib_TypeClass.INTERFACE_ATTRIBUTE: {
      const attr = record<typelib_InterfaceAttributeTypeDescription>(desc);
      deleteExceptions(attr.nGetExceptions, attr.ppGetExceptions);
      deleteExceptions(attr.nSetExceptions, attr.ppSetExceptions);
      if (attr.pAttributeTypeRef !== null)
        typelib_typedescriptionreference_release(attr.pAttributeTypeRef);
      if (attr.aBase.pMemberName !== null) rtl_uString_release(attr.aBase.pMemberName);
      typelib_typedescription_release((attr.pInterface as typelib_InterfaceTypeDescription).aBase);
      if (attr.pBaseRef !== null) typelib_typedescriptionreference_release(attr.pBaseRef);
      break;
    }
    case typelib_TypeClass.ENUM: {
      const enumeration = record<typelib_EnumTypeDescription>(desc);
      for (let i = enumeration.nEnumValues; i--;)
        rtl_uString_release((enumeration.ppEnumNames as rtl_uString[])[i] as rtl_uString);
      break;
    }
    default:
      break;
  }
}
/** Releases browser typed-view bookkeeping for the actual original allocation. Accessing freed pointers remains outside the native contract. @param desc - Allocation whose counter is zero. @returns Nothing. */
function freeTypeDescription(desc: typelib_TypeDescription): void {
  const ref = referenceViews.get(desc) as typelib_TypeDescriptionReference;
  counts.delete(ref);
  descriptionViews.delete(ref);
  referenceViews.delete(desc);
  counts.delete(desc);
}
/** Original description release and registry removal, preserving removal only for the same allocation. @param desc - Owned original description. @returns Nothing. */
export function typelib_typedescription_release(desc: typelib_TypeDescription): void {
  if (osl_atomic_decrement(counts.get(desc) as Int32Array) !== 0) return;
  const init = Init();
  if (TYPELIB_TYPEDESCRIPTIONREFERENCE_ISREALLYWEAK(desc.eTypeClass)) {
    if (desc.pWeakRef !== null) {
      desc.pWeakRef.pType = null;
      typelib_typedescriptionreference_release(desc.pWeakRef);
    }
  } else {
    const key = nameKey(desc.pTypeName),
      ref = init.maWeakMap.get(key);
    if (ref !== undefined && descriptionViews.get(ref) === desc) init.maWeakMap.delete(key);
  }
  typelib_typedescription_destructExtendedMembers(desc);
  rtl_uString_release(desc.pTypeName);
  freeTypeDescription(desc);
}
/** Original weak-reference release; nonweak references release their same description allocation. @param ref - Owned original reference. @returns Nothing. */
export function typelib_typedescriptionreference_release(
  ref: typelib_TypeDescriptionReference,
): void {
  if (TYPELIB_TYPEDESCRIPTIONREFERENCE_ISREALLYWEAK(ref.eTypeClass)) {
    if (osl_atomic_decrement(counts.get(ref) as Int32Array) === 0) {
      const init = Init(),
        key = nameKey(ref.pTypeName);
      if (init.maWeakMap.get(key) === ref) init.maWeakMap.delete(key);
      rtl_uString_release(ref.pTypeName);
      counts.delete(ref);
    }
  } else typelib_typedescription_release(descriptionViews.get(ref) as typelib_TypeDescription);
}
/** Original name-only registry lookup and output replacement. @param ppRet - Inout reference slot. @param pName - Borrowed original name. @returns Nothing. */
export function typelib_typedescriptionreference_getByName(
  ppRet: [typelib_TypeDescriptionReference | null],
  pName: rtl_uString,
): void {
  if (ppRet[0] !== null) {
    typelib_typedescriptionreference_release(ppRet[0]);
    ppRet[0] = null;
  }
  const ref = Init().maWeakMap.get(nameKey(pName));
  if (ref === undefined) return;
  if (osl_atomic_increment(counts.get(ref) as Int32Array) > 1) ppRet[0] = ref;
  else osl_atomic_decrement(counts.get(ref) as Int32Array);
}
/** Original creation, typedef callback resolution and acquired cache ownership. @param ppRet - Inout reference slot. @param eTypeClass - Original type class. @param pTypeName - Requested name. @returns Nothing. */
export function typelib_typedescriptionreference_new(
  ppRet: [typelib_TypeDescriptionReference | null],
  eTypeClass: typelib_TypeClass,
  pTypeName: rtl_uString,
): void {
  const init = Init();
  if (eTypeClass === typelib_TypeClass.TYPEDEF) {
    const slot: [typelib_TypeDescription | null] = [null];
    init.callChain(slot, pTypeName);
    if (slot[0] !== null) {
      let desc = slot[0];
      if (desc.eTypeClass === typelib_TypeClass.TYPEDEF) {
        const target = record<typelib_IndirectTypeDescription>(desc)
          .pType as typelib_TypeDescriptionReference;
        typelib_typedescriptionreference_acquire(target);
        if (ppRet[0] !== null) typelib_typedescriptionreference_release(ppRet[0]);
        ppRet[0] = target;
        typelib_typedescription_release(desc);
      } else {
        desc.bOnDemand = true;
        typelib_typedescription_register(slot);
        desc = slot[0] as typelib_TypeDescription;
        if (init.maCache.length >= nCacheSize)
          typelib_typedescription_release(init.maCache.shift() as typelib_TypeDescription);
        init.maCache.push(desc);
        typelib_typedescriptionreference_acquire(desc.pWeakRef as typelib_TypeDescriptionReference);
        if (ppRet[0] !== null) typelib_typedescriptionreference_release(ppRet[0]);
        ppRet[0] = desc.pWeakRef;
      }
    } else if (ppRet[0] !== null) {
      typelib_typedescriptionreference_release(ppRet[0]);
      ppRet[0] = null;
    }
    return;
  }
  typelib_typedescriptionreference_getByName(ppRet, pTypeName);
  if (ppRet[0] !== null) return;
  if (TYPELIB_TYPEDESCRIPTIONREFERENCE_ISREALLYWEAK(eTypeClass)) {
    const ref = {
      nStaticRefCount: 0,
      eTypeClass,
      pTypeName,
      pType: null,
      pUniqueIdentifier: null,
      pReserved: null,
    } as typelib_TypeDescriptionReference;
    bindCount(ref, new Int32Array([1]));
    rtl_uString_acquire(pTypeName);
    ppRet[0] = ref;
  } else {
    const slot: [typelib_TypeDescription | null] = [null];
    typelib_typedescription_newEmpty(slot, eTypeClass, pTypeName);
    const desc = slot[0] as typelib_TypeDescription;
    desc.bOnDemand = true;
    desc.bComplete = false;
    ppRet[0] = referenceViews.get(desc) as typelib_TypeDescriptionReference;
  }
  init.maWeakMap.set(nameKey(ppRet[0].pTypeName), ppRet[0]);
}
/** Original specific record bytes represented as fields; common-prefix fields are never copied. @param type - Original class. @returns Exact specific field names. */
function specificFields(type: typelib_TypeClass): string[] {
  const compound = [
    "pBaseTypeDescription",
    "nMembers",
    "pMemberOffsets",
    "ppTypeRefs",
    "ppMemberNames",
  ];
  switch (type) {
    case typelib_TypeClass.SEQUENCE:
      return ["pType"];
    case typelib_TypeClass.STRUCT:
      return [...compound, "pParameterizedTypes"];
    case typelib_TypeClass.EXCEPTION:
      return compound;
    case typelib_TypeClass.ENUM:
      return ["nDefaultEnumValue", "nEnumValues", "ppEnumNames", "pEnumValues"];
    case typelib_TypeClass.INTERFACE:
      return [
        "pBaseTypeDescription",
        "aUik",
        "nMembers",
        "ppMembers",
        "nAllMembers",
        "ppAllMembers",
        "pMapMemberIndexToFunctionIndex",
        "nMapFunctionIndexToMemberIndex",
        "pMapFunctionIndexToMemberIndex",
        "nBaseTypes",
        "ppBaseTypes",
      ];
    default:
      return [];
  }
}
/** Original memcpy transfer followed by memset of specific bytes only. Zeroes here come from actual memset, never from raw allocation. @param src - New complete/incomplete description. @param dst - Existing uninitialized description allocation. @returns Nothing. */
function transferSpecific(src: typelib_TypeDescription, dst: typelib_TypeDescription): void {
  const source = record<Record<string, unknown>>(src),
    destination = record<Record<string, unknown>>(dst);
  for (const key of specificFields(src.eTypeClass)) {
    destination[key] = source[key];
    source[key] = key.startsWith("n")
      ? 0
      : key === "aUik"
        ? { m_Data1: 0, m_Data2: 0, m_Data3: 0, m_Data4: 0, m_Data5: 0 }
        : null;
  }
}
/** Original swaps of known initialized completion fields. @param src - New description. @param dst - Existing incomplete allocation. @param keys - Actual source switch's selected fields. @returns Nothing. */
function swapFields(
  src: typelib_TypeDescription,
  dst: typelib_TypeDescription,
  keys: string[],
): void {
  const source = record<Record<string, unknown>>(src),
    destination = record<Record<string, unknown>>(dst);
  for (const key of keys) {
    const value = source[key];
    source[key] = destination[key];
    destination[key] = value;
  }
}
/** Original registration, identity-preserving completion and on-demand ownership transitions. Mutex-protected work is synchronous and realm-local; native cross-thread registry races remain unverified. @param ppNewDescription - Inout original allocated description. @returns Nothing. */
export function typelib_typedescription_register(
  ppNewDescription: [typelib_TypeDescription | null],
): void {
  const init = Init(),
    slot: [typelib_TypeDescriptionReference | null] = [null];
  let desc = ppNewDescription[0] as typelib_TypeDescription;
  typelib_typedescriptionreference_getByName(slot, desc.pTypeName);
  let ref = slot[0];
  if (ref !== null) {
    if (ref.pType !== null) {
      if (TYPELIB_TYPEDESCRIPTIONREFERENCE_ISREALLYWEAK(ref.eTypeClass)) {
        if (ref.pType.pWeakRef !== null) {
          if (osl_atomic_increment(counts.get(ref.pType) as Int32Array) > 1) {
            typelib_typedescription_release(desc);
            ppNewDescription[0] = ref.pType;
            typelib_typedescriptionreference_release(ref);
            return;
          }
          osl_atomic_decrement(counts.get(ref.pType) as Int32Array);
        }
        ref.pType = desc;
        desc.pWeakRef = ref;
        return;
      }
      const target = ref.pType;
      if (
        target !== desc &&
        (target.pWeakRef === null ||
          (!target.bComplete && desc.bComplete) ||
          (target.eTypeClass === typelib_TypeClass.INTERFACE &&
            record<typelib_InterfaceTypeDescription>(target).ppAllMembers === null &&
            record<typelib_InterfaceTypeDescription>(desc).ppAllMembers !== null))
      ) {
        if (target.pWeakRef !== null) {
          switch (target.eTypeClass) {
            case typelib_TypeClass.ENUM:
              swapFields(desc, target, ["nEnumValues", "ppEnumNames", "pEnumValues"]);
              break;
            case typelib_TypeClass.STRUCT:
            case typelib_TypeClass.EXCEPTION:
              swapFields(desc, target, ["ppMemberNames"]);
              break;
            case typelib_TypeClass.INTERFACE:
              swapFields(desc, target, [
                "nMembers",
                "ppMembers",
                "nAllMembers",
                "ppAllMembers",
                "pMapMemberIndexToFunctionIndex",
                "nMapFunctionIndexToMemberIndex",
                "pMapFunctionIndexToMemberIndex",
              ]);
              break;
          }
        } else transferSpecific(desc, target);
        target.bComplete = desc.bComplete;
        target.nSize = desc.nSize;
        target.nAlignment = desc.nAlignment;
        if (target.bOnDemand && !desc.bOnDemand) typelib_typedescription_acquire(target);
        else if (!target.bOnDemand && desc.bOnDemand) typelib_typedescription_release(target);
        target.bOnDemand = desc.bOnDemand;
        target.pWeakRef = ref;
      }
      typelib_typedescription_release(desc);
      ppNewDescription[0] = target;
      return;
    }
  } else if (TYPELIB_TYPEDESCRIPTIONREFERENCE_ISREALLYWEAK(desc.eTypeClass)) {
    typelib_typedescriptionreference_new(slot, desc.eTypeClass, desc.pTypeName);
    ref = slot[0];
  } else {
    ref = referenceViews.get(desc) as typelib_TypeDescriptionReference;
    init.maWeakMap.set(nameKey(ref.pTypeName), ref);
  }
  desc = ppNewDescription[0] as typelib_TypeDescription;
  if (!desc.bOnDemand) typelib_typedescription_acquire(desc);
  (ref as typelib_TypeDescriptionReference).pType = desc;
  desc.pWeakRef = ref;
}
