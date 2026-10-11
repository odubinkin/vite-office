/** @fileoverview Original common typelib record declarations and weak-reference classifier; allocation/reference/registration implementations share the original CPPU source owner; interface factories share separate source responsibilities; static type initialization shares its original source owner. */
import type { rtl_uString } from "../../../sal/inc/rtl/ustring.h";
import { typelib_TypeClass } from "./typeclass";
import type { typelib_Uik } from "./uik";
import {
  typelib_typedescriptionreference_getDescription,
  typelib_typedescription_release,
} from "../../source/typelib/typelib";
export {
  typelib_typedescriptionreference_equals,
  typelib_typedescription_registerCallback,
  typelib_typedescription_revokeCallback,
  typelib_typedescription_acquire,
  typelib_typedescription_release,
  typelib_typedescription_register,
  typelib_typedescriptionreference_new,
  typelib_typedescriptionreference_newByAsciiName,
  typelib_typedescriptionreference_assign,
  typelib_typedescriptionreference_acquire,
  typelib_typedescriptionreference_release,
  typelib_typedescription_new,
  typelib_typedescription_newStruct,
  typelib_typedescription_newEnum,
  typelib_typedescriptionreference_getDescription,
} from "../../source/typelib/typelib";
export { typelib_typedescription_getByName } from "../../source/typelib/typelib-lookup";
export { typelib_typedescription_complete } from "../../source/typelib/typelib-complete";
export {
  typelib_typedescription_newInterfaceMethod,
  typelib_typedescription_newInterfaceAttribute,
  typelib_typedescription_newExtendedInterfaceAttribute,
} from "../../source/typelib/typelib-member-factories";

export {
  typelib_typedescription_newInterface,
  typelib_typedescription_newMIInterface,
} from "../../source/typelib/typelib-interface-factories";

export {
  typelib_static_type_getByTypeClass,
  typelib_static_type_init,
  typelib_static_sequence_type_init,
  typelib_static_compound_type_init,
  typelib_static_struct_type_init,
  typelib_static_interface_type_init,
  typelib_static_mi_interface_type_init,
  typelib_static_enum_type_init,
} from "../../source/typelib/static_types";

export {
  typelib_typedescriptionreference_isAssignableFrom,
  typelib_typedescription_isAssignableFrom,
  typelib_typedescription_equals,
} from "../../source/typelib/typelib-assignability";

/** Complete original common type-reference record; declaration adds no allocation or guessed initialization. */
export interface _typelib_TypeDescriptionReference {
  /** Original signed32 live reference count. */
  nRefCount: number;
  /** Original signed32 static reference count. */
  nStaticRefCount: number;
  /** Original native type class. */
  eTypeClass: typelib_TypeClass;
  /** Original owned Unicode name data. */
  pTypeName: rtl_uString;
  /** Original description pointer, nullable for a genuinely weak reference. */
  pType: _typelib_TypeDescription | null;
  /** Original opaque runtime optimization pointer. */
  pUniqueIdentifier: unknown;
  /** Original reserved opaque pointer. */
  pReserved: unknown;
}
/** Original public type-reference typedef. */
export type typelib_TypeDescriptionReference = _typelib_TypeDescriptionReference;

/** Complete original common full-description record; native shared-prefix pointer reinterpretation is not supplied by this declaration. */
export interface _typelib_TypeDescription {
  /** Original signed32 live reference count. */
  nRefCount: number;
  /** Original signed32 static reference count. */
  nStaticRefCount: number;
  /** Original native type class. */
  eTypeClass: typelib_TypeClass;
  /** Original owned Unicode name data. */
  pTypeName: rtl_uString;
  /** Original self pointer. */
  pSelf: _typelib_TypeDescription | null;
  /** Original opaque runtime optimization pointer. */
  pUniqueIdentifier: unknown;
  /** Original reserved opaque pointer. */
  pReserved: unknown;
  /** Original completion flag. */
  bComplete: boolean;
  /** Original signed32 native type size. */
  nSize: number;
  /** Original signed32 native alignment. */
  nAlignment: number;
  /** Original weak reference pointer. */
  pWeakRef: _typelib_TypeDescriptionReference | null;
  /** Original on-demand unloading flag. */
  bOnDemand: boolean;
}
/** Original public full-description typedef. */
export type typelib_TypeDescription = _typelib_TypeDescription;

/** Original compound exception description; members are populated by original allocation/registration owners. */
export interface _typelib_CompoundTypeDescription {
  /** Original common description prefix. */
  aBase: typelib_TypeDescription;
  /** Original compound base, nullable for no inheritance. */
  pBaseTypeDescription: _typelib_CompoundTypeDescription | null;
  /** Original signed32 member count. */
  nMembers: number;
  /** Original signed32 byte-offset array, nullable before allocation. */
  pMemberOffsets: Int32Array | null;
  /** Original member type-reference pointers. */
  ppTypeRefs: typelib_TypeDescriptionReference[] | null;
  /** Original owned member-name pointers. */
  ppMemberNames: rtl_uString[] | null;
}
/** Original public compound typedef. */
export type typelib_CompoundTypeDescription = _typelib_CompoundTypeDescription;

/** Original plain or instantiated polymorphic struct description. */
export interface _typelib_StructTypeDescription {
  /** Original compound prefix. */
  aBase: typelib_CompoundTypeDescription;
  /** Original parameterized-member flags; null for plain structs. */
  pParameterizedTypes: boolean[] | null;
}
/** Original public struct typedef. */
export type typelib_StructTypeDescription = _typelib_StructTypeDescription;

/** Original sequence description. */
export interface _typelib_IndirectTypeDescription {
  /** Original common description prefix. */
  aBase: typelib_TypeDescription;
  /** Original element type pointer, nullable before initialization. */
  pType: typelib_TypeDescriptionReference | null;
}
/** Original public indirect typedef. */
export type typelib_IndirectTypeDescription = _typelib_IndirectTypeDescription;

/** Original enumeration description. */
export interface _typelib_EnumTypeDescription {
  /** Original common description prefix. */
  aBase: typelib_TypeDescription;
  /** Original signed32 default enumeration value. */
  nDefaultEnumValue: number;
  /** Original signed32 enumeration count. */
  nEnumValues: number;
  /** Original owned enumeration-name pointers. */
  ppEnumNames: rtl_uString[] | null;
  /** Original signed32 enumeration values. */
  pEnumValues: Int32Array | null;
}
/** Original public enumeration typedef. */
export type typelib_EnumTypeDescription = _typelib_EnumTypeDescription;

/** Original interface method parameter record. */
export interface _typelib_MethodParameter {
  /** Original owned parameter-name pointer. */
  pName: rtl_uString;
  /** Original parameter type-reference pointer. */
  pTypeRef: typelib_TypeDescriptionReference;
  /** Original in/inout flag. */
  bIn: boolean;
  /** Original out/inout flag. */
  bOut: boolean;
}
/** Original public method-parameter typedef. */
export type typelib_MethodParameter = _typelib_MethodParameter;

/** Original shared interface-method/attribute description prefix. */
export interface _typelib_InterfaceMemberTypeDescription {
  /** Original common description prefix. */
  aBase: typelib_TypeDescription;
  /** Original signed32 member position including inherited members. */
  nPosition: number;
  /** Original owned member name, nullable before initialization. */
  pMemberName: rtl_uString | null;
}
/** Original public interface-member typedef. */
export type typelib_InterfaceMemberTypeDescription = _typelib_InterfaceMemberTypeDescription;

/** Original interface-method description. */
export interface _typelib_InterfaceMethodTypeDescription {
  /** Original interface-member prefix. */
  aBase: typelib_InterfaceMemberTypeDescription;
  /** Original return-type pointer. */
  pReturnTypeRef: typelib_TypeDescriptionReference | null;
  /** Original signed32 parameter count. */
  nParams: number;
  /** Original parameter-record array. */
  pParams: typelib_MethodParameter[] | null;
  /** Original signed32 exception count. */
  nExceptions: number;
  /** Original exception type-reference pointers. */
  ppExceptions: typelib_TypeDescriptionReference[] | null;
  /** Original oneway flag. */
  bOneWay: boolean;
  /** Original containing interface, nullable before initialization. */
  pInterface: _typelib_InterfaceTypeDescription | null;
  /** Original inherited direct-base method pointer. */
  pBaseRef: typelib_TypeDescriptionReference | null;
  /** Original signed32 direct-member/base-interface index. */
  nIndex: number;
}
/** Original public interface-method typedef. */
export type typelib_InterfaceMethodTypeDescription = _typelib_InterfaceMethodTypeDescription;

/** Original interface-attribute description. */
export interface _typelib_InterfaceAttributeTypeDescription {
  /** Original interface-member prefix. */
  aBase: typelib_InterfaceMemberTypeDescription;
  /** Original read-only flag. */
  bReadOnly: boolean;
  /** Original attribute type-reference pointer. */
  pAttributeTypeRef: typelib_TypeDescriptionReference | null;
  /** Original containing interface, nullable before initialization. */
  pInterface: _typelib_InterfaceTypeDescription | null;
  /** Original inherited direct-base attribute pointer. */
  pBaseRef: typelib_TypeDescriptionReference | null;
  /** Original signed32 direct-member/base-interface index. */
  nIndex: number;
  /** Original signed32 getter-exception count. */
  nGetExceptions: number;
  /** Original getter-exception type-reference pointers. */
  ppGetExceptions: typelib_TypeDescriptionReference[] | null;
  /** Original signed32 setter-exception count. */
  nSetExceptions: number;
  /** Original setter-exception type-reference pointers. */
  ppSetExceptions: typelib_TypeDescriptionReference[] | null;
}
/** Original public interface-attribute typedef. */
export type typelib_InterfaceAttributeTypeDescription = _typelib_InterfaceAttributeTypeDescription;

/** Original interface description; initialized fields depend on the original three completion levels. */
export interface _typelib_InterfaceTypeDescription {
  /** Original common description prefix. */
  aBase: typelib_TypeDescription;
  /** Original deprecated direct-base pointer. */
  pBaseTypeDescription: _typelib_InterfaceTypeDescription | null;
  /** Original deprecated Uik record. */
  aUik: typelib_Uik;
  /** Original signed32 direct-member count. */
  nMembers: number;
  /** Original direct-member reference pointers. */
  ppMembers: typelib_TypeDescriptionReference[] | null;
  /** Original signed32 total-member count including inheritance. */
  nAllMembers: number;
  /** Original complete member-reference pointers. */
  ppAllMembers: typelib_TypeDescriptionReference[] | null;
  /** Original signed32 member-to-function index map. */
  pMapMemberIndexToFunctionIndex: Int32Array | null;
  /** Original signed32 function-to-member map size. */
  nMapFunctionIndexToMemberIndex: number;
  /** Original signed32 function-to-member index map. */
  pMapFunctionIndexToMemberIndex: Int32Array | null;
  /** Original signed32 base-interface count. */
  nBaseTypes: number;
  /** Original base-interface description pointers. */
  ppBaseTypes: _typelib_InterfaceTypeDescription[] | null;
}
/** Original public interface typedef. */
export type typelib_InterfaceTypeDescription = _typelib_InterfaceTypeDescription;

/** Original compound-member initializer record. */
export interface _typelib_CompoundMember_Init {
  /** Original member type class. */
  eTypeClass: typelib_TypeClass;
  /** Original type name; nullable for parameterized instantiated members. */
  pTypeName: rtl_uString | null;
  /** Original member name. */
  pMemberName: rtl_uString;
}
/** Original public compound-member initializer typedef. */
export type typelib_CompoundMember_Init = _typelib_CompoundMember_Init;

/** Original plain or instantiated struct-member initializer. */
export interface _typelib_StructMember_Init {
  /** Original compound-member initializer prefix. */
  aBase: typelib_CompoundMember_Init;
  /** Original parameterized-type flag. */
  bParameterizedType: boolean;
}
/** Original public struct-member initializer typedef. */
export type typelib_StructMember_Init = _typelib_StructMember_Init;

/** Original method-parameter initializer record. */
export interface _typelib_Parameter_Init {
  /** Original parameter type class. */
  eTypeClass: typelib_TypeClass;
  /** Original type name. */
  pTypeName: rtl_uString;
  /** Original parameter name. */
  pParamName: rtl_uString;
  /** Original in/inout flag. */
  bIn: boolean;
  /** Original out/inout flag. */
  bOut: boolean;
}
/** Original public parameter initializer typedef. */
export type typelib_Parameter_Init = _typelib_Parameter_Init;

/** Original callback pointer signature; a one-element tuple adapts the inout description pointer. @param pContext - Original opaque callback context. @param ppRet - Original inout description pointer slot. @param pTypeName - Original requested type name. @returns Nothing. */
export type typelib_typedescription_Callback = (
  pContext: unknown,
  ppRet: [typelib_TypeDescription | null],
  pTypeName: rtl_uString,
) => void;

/** Original weak-reference class predicate. @param eTypeClass - Original native enum value. @returns Whether the reference can lose its description. */
export function TYPELIB_TYPEDESCRIPTIONREFERENCE_ISREALLYWEAK(
  eTypeClass: typelib_TypeClass,
): boolean {
  return (
    eTypeClass === typelib_TypeClass.INTERFACE_METHOD ||
    eTypeClass === typelib_TypeClass.INTERFACE_ATTRIBUTE
  );
}

/** Original danger-get acquisition distinction, including empty nonweak references. @param result - Original output slot. @param ref - Borrowed type reference. @returns Nothing. */
export function TYPELIB_DANGER_GET(
  result: [typelib_TypeDescription | null],
  ref: typelib_TypeDescriptionReference,
): void {
  if (TYPELIB_TYPEDESCRIPTIONREFERENCE_ISREALLYWEAK(ref.eTypeClass)) {
    typelib_typedescriptionreference_getDescription(result, ref);
  } else if (ref.pType === null || ref.pType.pWeakRef === null) {
    typelib_typedescriptionreference_getDescription(result, ref);
    if (result[0] !== null) typelib_typedescription_release(result[0]);
  } else result[0] = ref.pType;
}
/** Original danger-release only relinquishes a genuinely weak description. @param desc - Original description. @returns Nothing. */
export function TYPELIB_DANGER_RELEASE(desc: typelib_TypeDescription): void {
  if (TYPELIB_TYPEDESCRIPTIONREFERENCE_ISREALLYWEAK(desc.eTypeClass))
    typelib_typedescription_release(desc);
}
