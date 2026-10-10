/** @fileoverview Original common typelib record declarations and weak-reference classifier; allocation/registration/lifecycle remain owned by the unfinished original CPPU functions. */
import type { rtl_uString } from "../../../sal/inc/rtl/ustring.h";
import { typelib_TypeClass } from "./typeclass";
export { typelib_typedescriptionreference_equals } from "../../source/typelib/typelib";

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

/** Original weak-reference class predicate. @param eTypeClass - Original native enum value. @returns Whether the reference can lose its description. */
export function TYPELIB_TYPEDESCRIPTIONREFERENCE_ISREALLYWEAK(
  eTypeClass: typelib_TypeClass,
): boolean {
  return (
    eTypeClass === typelib_TypeClass.INTERFACE_METHOD ||
    eTypeClass === typelib_TypeClass.INTERFACE_ATTRIBUTE
  );
}
