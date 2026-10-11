/** @fileoverview Original CPPU type records, allocation, reference ownership and registration; completion/static-type providers remain separate required owners. */
import type {
  typelib_TypeDescription,
  typelib_TypeDescriptionReference,
  typelib_CompoundTypeDescription,
  typelib_StructTypeDescription,
  typelib_IndirectTypeDescription,
  typelib_EnumTypeDescription,
  typelib_InterfaceTypeDescription,
  typelib_InterfaceMethodTypeDescription,
  typelib_InterfaceAttributeTypeDescription,
  typelib_typedescription_Callback,
  typelib_CompoundMember_Init,
  typelib_StructMember_Init,
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

import {
  TYPELIB_TYPEDESCRIPTIONREFERENCE_ISREALLYWEAK,
  TYPELIB_DANGER_GET,
  TYPELIB_DANGER_RELEASE,
} from "../../inc/typelib/typedescription";
import { typelib_TypeClass } from "../../inc/typelib/typeclass";
import { osl_atomic_increment, osl_atomic_decrement } from "../../../sal/inc/osl/interlck";
import { rtl_uString_acquire, rtl_uString_release } from "../../../sal/inc/rtl/ustring.h";
import type { rtl_uString } from "../../../sal/inc/rtl/ustring.h";
import { OUString } from "../../../sal/inc/rtl/ustring";
import {
  adjustAlignment,
  newAlignedSize,
  typelib_typedescription_getAlignedUnoSize,
  typelib_typedescription_getByName,
} from "./typelib-lookup";

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
/** Internal adaptation of original common-prefix reinterpretation; retrieves the allocator's existing canonical view without changing weak-reference initialization timing. @param desc - Live original allocation. @returns Existing common-prefix reference view. */
export function referenceViewOf(desc: typelib_TypeDescription): typelib_TypeDescriptionReference {
  return referenceViews.get(desc) as typelib_TypeDescriptionReference;
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
export function Init(): TypeDescriptor_Init_Impl {
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

/** Original compound/struct/sequence factory body; sizes are logical LP64 UNO offsets, not JS object addresses. @param ppRet - Inout description slot. @param eTypeClass - Original class. @param pTypeName - Owned original name. @param pType - Borrowed base/element reference. @param nMembers - Original member count. @param pCompoundMembers - Original plain member initializers. @param pStructMembers - Original struct member initializers. @returns Nothing. */
function newTypeDescription(
  ppRet: [typelib_TypeDescription | null],
  eTypeClass: typelib_TypeClass,
  pTypeName: rtl_uString,
  pType: typelib_TypeDescriptionReference | null,
  nMembers: number,
  pCompoundMembers: typelib_CompoundMember_Init[] | null,
  pStructMembers: typelib_StructMember_Init[] | null,
): void {
  if (eTypeClass === typelib_TypeClass.TYPEDEF) {
    typelib_typedescriptionreference_getDescription(
      ppRet,
      pType as typelib_TypeDescriptionReference,
    );
    return;
  }
  typelib_typedescription_newEmpty(ppRet, eTypeClass, pTypeName);
  const desc = ppRet[0] as typelib_TypeDescription;
  switch (eTypeClass) {
    case typelib_TypeClass.SEQUENCE:
      typelib_typedescriptionreference_acquire(pType as typelib_TypeDescriptionReference);
      record<typelib_IndirectTypeDescription>(desc).pType = pType;
      break;
    case typelib_TypeClass.EXCEPTION:
    case typelib_TypeClass.STRUCT: {
      const compound = record<typelib_CompoundTypeDescription>(desc);
      let offset = 0;
      if (pType !== null) {
        const base: [typelib_TypeDescription | null] = [null];
        typelib_typedescriptionreference_getDescription(base, pType);
        compound.pBaseTypeDescription = record<typelib_CompoundTypeDescription>(
          base[0] as typelib_TypeDescription,
        );
        offset = compound.pBaseTypeDescription.aBase.nSize;
      }
      if (nMembers !== 0) {
        compound.nMembers = nMembers;
        compound.pMemberOffsets = new Int32Array(nMembers);
        compound.ppTypeRefs = new Array(nMembers);
        compound.ppMemberNames = new Array(nMembers);
        const polymorphic =
          eTypeClass === typelib_TypeClass.STRUCT &&
          OUString.unacquired([pTypeName]).indexOf(60) >= 0;
        assert(
          !polymorphic || pStructMembers !== null,
          "!polymorphic || pStructMembers != nullptr",
        );
        const struct = record<typelib_StructTypeDescription>(desc);
        if (polymorphic) struct.pParameterizedTypes = new Array(nMembers);
        for (let i = 0; i < nMembers; i++) {
          const member =
            pCompoundMembers !== null
              ? (pCompoundMembers[i] as typelib_CompoundMember_Init)
              : ((pStructMembers as typelib_StructMember_Init[])[i] as typelib_StructMember_Init)
                  .aBase;
          const ref: [typelib_TypeDescriptionReference | null] = [null];
          typelib_typedescriptionreference_new(
            ref,
            member.eTypeClass,
            member.pTypeName as rtl_uString,
          );
          compound.ppTypeRefs[i] = ref[0] as typelib_TypeDescriptionReference;
          compound.ppMemberNames[i] = member.pMemberName;
          rtl_uString_acquire(member.pMemberName);
          assert(ref[0] !== null, "pTmp->ppTypeRefs[i]");
          let size: number, alignment: number;
          if (ref[0].eTypeClass === typelib_TypeClass.SEQUENCE) {
            size = 8;
            alignment = adjustAlignment(size);
          } else {
            const memberType: [typelib_TypeDescription | null] = [null];
            TYPELIB_DANGER_GET(memberType, ref[0]);
            const value = memberType[0] as typelib_TypeDescription;
            size = value.nSize;
            alignment = value.nAlignment;
            TYPELIB_DANGER_RELEASE(value);
          }
          offset = newAlignedSize(offset, size, alignment);
          compound.pMemberOffsets[i] = offset - size;
          if (polymorphic)
            (struct.pParameterizedTypes as boolean[])[i] = (
              (pStructMembers as typelib_StructMember_Init[])[i] as typelib_StructMember_Init
            ).bParameterizedType;
        }
      }
      break;
    }
    default:
      break;
  }
  if (!TYPELIB_TYPEDESCRIPTIONREFERENCE_ISREALLYWEAK(eTypeClass))
    desc.pWeakRef = referenceViews.get(desc) as typelib_TypeDescriptionReference;
  if (eTypeClass !== typelib_TypeClass.VOID) {
    const alignment: [number] = [desc.nAlignment];
    desc.nSize = typelib_typedescription_getAlignedUnoSize(desc, 0, alignment);
    desc.nAlignment = adjustAlignment(alignment[0]);
  }
}

/** Original public plain type factory. @param ppRet - Inout result. @param eTypeClass - Original class. @param pTypeName - Original name. @param pType - Base or element reference. @param nMembers - Member count. @param pMembers - Original initializers. @returns Nothing. */
export function typelib_typedescription_new(
  ppRet: [typelib_TypeDescription | null],
  eTypeClass: typelib_TypeClass,
  pTypeName: rtl_uString,
  pType: typelib_TypeDescriptionReference | null,
  nMembers: number,
  pMembers: typelib_CompoundMember_Init[] | null,
): void {
  newTypeDescription(ppRet, eTypeClass, pTypeName, pType, nMembers, pMembers, null);
}

/** Original public struct factory, preserving parameterized member flags. @param ppRet - Inout result. @param pTypeName - Original name. @param pType - Base reference. @param nMembers - Member count. @param pMembers - Original struct initializers. @returns Nothing. */
export function typelib_typedescription_newStruct(
  ppRet: [typelib_TypeDescription | null],
  pTypeName: rtl_uString,
  pType: typelib_TypeDescriptionReference | null,
  nMembers: number,
  pMembers: typelib_StructMember_Init[] | null,
): void {
  newTypeDescription(ppRet, typelib_TypeClass.STRUCT, pTypeName, pType, nMembers, null, pMembers);
}

/** Original enum factory acquires names and independently copies every value. @param ppRet - Inout result. @param pTypeName - Original name. @param nDefaultValue - Original default. @param nEnumValues - Original count. @param ppEnumNames - Borrowed names. @param pEnumValues - Borrowed signed32 values. @returns Nothing. */
export function typelib_typedescription_newEnum(
  ppRet: [typelib_TypeDescription | null],
  pTypeName: rtl_uString,
  nDefaultValue: number,
  nEnumValues: number,
  ppEnumNames: rtl_uString[] | null,
  pEnumValues: Int32Array | null,
): void {
  typelib_typedescription_newEmpty(ppRet, typelib_TypeClass.ENUM, pTypeName);
  const desc = ppRet[0] as typelib_TypeDescription;
  const value = record<typelib_EnumTypeDescription>(desc);
  value.nDefaultEnumValue = nDefaultValue;
  value.nEnumValues = nEnumValues;
  value.ppEnumNames = new Array(nEnumValues);
  for (let i = nEnumValues; i--;) {
    value.ppEnumNames[i] = (ppEnumNames as rtl_uString[])[i] as rtl_uString;
    rtl_uString_acquire(value.ppEnumNames[i] as rtl_uString);
  }
  value.pEnumValues = new Int32Array(nEnumValues);
  for (let i = 0; i < nEnumValues; i++)
    value.pEnumValues[i] = (pEnumValues as Int32Array)[i] as number;
  desc.pWeakRef = referenceViews.get(desc) as typelib_TypeDescriptionReference;
  const alignment: [number] = [desc.nAlignment];
  desc.nSize = typelib_typedescription_getAlignedUnoSize(desc, 0, alignment);
  desc.nAlignment = adjustAlignment(alignment[0]);
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
/** Original ASCII name wrapper; conversion and registry/reference ownership use the existing actual SAL/CPPU owners. @param result - Original inout reference slot. @param typeClass - Original type class. @param name - Borrowed terminated original ASCII bytes. @returns Nothing. */
export function typelib_typedescriptionreference_newByAsciiName(
  result: [typelib_TypeDescriptionReference | null],
  typeClass: typelib_TypeClass,
  name: Uint8Array | null,
): void {
  const value = OUString.createFromAscii(name);
  typelib_typedescriptionreference_new(result, typeClass, value.pData);
  value.dispose();
}
/** Original reference assignment: acquire the source before releasing the previous destination, with an identity shortcut. Nonidentical null pointers have no valid native dereference contract. @param result - Original inout destination cell. @param source - Original borrowed reference; both-null identity is defined. @returns Nothing. */
export function typelib_typedescriptionreference_assign(
  result: [typelib_TypeDescriptionReference | null],
  source: typelib_TypeDescriptionReference | null,
): void {
  if (result[0] !== source) {
    typelib_typedescriptionreference_acquire(source as typelib_TypeDescriptionReference);
    typelib_typedescriptionreference_release(result[0] as typelib_TypeDescriptionReference);
    result[0] = source;
  }
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
/** Adapts an original fatal C assertion to the existing browser Error assertion boundary; it is not a UNO exception. @param condition - Unchanged original invariant. @param expression - Original C expression. @returns Nothing for a satisfied invariant. */
export function assert(condition: boolean, expression: string): asserts condition {
  if (!condition) throw new Error(`assert(${expression})`);
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
            case typelib_TypeClass.ENUM: {
              const dst = record<typelib_EnumTypeDescription>(target);
              assert(dst.nEnumValues === 0, "dst->nEnumValues == 0");
              assert(dst.ppEnumNames === null, "dst->ppEnumNames == nullptr");
              assert(dst.pEnumValues === null, "dst->pEnumValues == nullptr");
              swapFields(desc, target, ["nEnumValues", "ppEnumNames", "pEnumValues"]);
              break;
            }
            case typelib_TypeClass.STRUCT:
            case typelib_TypeClass.EXCEPTION: {
              const src = record<typelib_CompoundTypeDescription>(desc),
                dst = record<typelib_CompoundTypeDescription>(target);
              assert(
                (dst.pBaseTypeDescription === null) === (src.pBaseTypeDescription === null),
                "(dst->pBaseTypeDescription == nullptr) == (src->pBaseTypeDescription == nullptr)",
              );
              assert(dst.nMembers === src.nMembers, "dst->nMembers == src->nMembers");
              assert(
                (dst.pMemberOffsets === null) === (dst.nMembers === 0),
                "(dst->pMemberOffsets == nullptr) == (dst->nMembers == 0)",
              );
              assert(
                (dst.ppTypeRefs === null) === (dst.nMembers === 0),
                "(dst->ppTypeRefs == nullptr) == (dst->nMembers == 0)",
              );
              assert(dst.ppMemberNames === null, "dst->ppMemberNames == nullptr");
              assert(
                target.eTypeClass !== typelib_TypeClass.STRUCT ||
                  (record<typelib_StructTypeDescription>(target).pParameterizedTypes === null) ===
                    (record<typelib_StructTypeDescription>(desc).pParameterizedTypes === null),
                "pTDR->pType->eTypeClass != typelib_TypeClass_STRUCT || ((reinterpret_cast<typelib_StructTypeDescription *>(dst)->pParameterizedTypes == nullptr) == (reinterpret_cast<typelib_StructTypeDescription *>(src)->pParameterizedTypes == nullptr))",
              );
              swapFields(desc, target, ["ppMemberNames"]);
              break;
            }
            case typelib_TypeClass.INTERFACE: {
              const src = record<typelib_InterfaceTypeDescription>(desc),
                dst = record<typelib_InterfaceTypeDescription>(target);
              assert(
                (dst.pBaseTypeDescription === null) === (src.pBaseTypeDescription === null),
                "(dst->pBaseTypeDescription == nullptr) == (src->pBaseTypeDescription == nullptr)",
              );
              assert(dst.nMembers === 0, "dst->nMembers == 0");
              assert(dst.ppMembers === null, "dst->ppMembers == nullptr");
              assert(dst.nAllMembers === 0, "dst->nAllMembers == 0");
              assert(dst.ppAllMembers === null, "dst->ppAllMembers == nullptr");
              assert(
                dst.pMapMemberIndexToFunctionIndex === null,
                "dst->pMapMemberIndexToFunctionIndex == nullptr",
              );
              assert(
                dst.nMapFunctionIndexToMemberIndex === 0,
                "dst->nMapFunctionIndexToMemberIndex == 0",
              );
              assert(
                dst.pMapFunctionIndexToMemberIndex === null,
                "dst->pMapFunctionIndexToMemberIndex == nullptr",
              );
              assert(dst.nBaseTypes === src.nBaseTypes, "dst->nBaseTypes == src->nBaseTypes");
              assert(
                (dst.ppBaseTypes === null) === (src.ppBaseTypes === null),
                "(dst->ppBaseTypes == nullptr) == (src->ppBaseTypes == nullptr)",
              );
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
            default:
              assert(false, "false");
          }
        } else transferSpecific(desc, target);
        target.bComplete = desc.bComplete;
        target.nSize = desc.nSize;
        target.nAlignment = desc.nAlignment;
        if (target.bOnDemand && !desc.bOnDemand) typelib_typedescription_acquire(target);
        else if (!target.bOnDemand && desc.bOnDemand) {
          assert(target.nRefCount > 1, "pTDR->pType->nRefCount > 1");
          typelib_typedescription_release(target);
        }
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

/** Original reference-to-description resolution, preserving the common-prefix allocation identity and actual atomic count. @param ppRet - Inout owned description. @param pRef - Borrowed original reference. @returns Nothing. */
export function typelib_typedescriptionreference_getDescription(
  ppRet: [typelib_TypeDescription | null],
  pRef: typelib_TypeDescriptionReference,
): void {
  if (ppRet[0] !== null) {
    typelib_typedescription_release(ppRet[0]);
    ppRet[0] = null;
  }
  if (
    !TYPELIB_TYPEDESCRIPTIONREFERENCE_ISREALLYWEAK(pRef.eTypeClass) &&
    pRef.pType !== null &&
    pRef.pType.pWeakRef !== null
  ) {
    const desc = descriptionViews.get(pRef) as typelib_TypeDescription;
    osl_atomic_increment(counts.get(desc) as Int32Array);
    ppRet[0] = desc;
    return;
  }
  if (pRef.pType !== null && pRef.pType.pWeakRef !== null) {
    if (osl_atomic_increment(counts.get(pRef.pType) as Int32Array) > 1) {
      ppRet[0] = pRef.pType;
      return;
    }
    osl_atomic_decrement(counts.get(pRef.pType) as Int32Array);
    pRef.pType = null;
  }
  typelib_typedescription_getByName(ppRet, pRef.pTypeName);
  pRef.pType = ppRet[0];
}
