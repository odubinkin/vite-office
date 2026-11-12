/** @fileoverview Complete original XClob.idl declarations and normal CPPUMaker interface type binding; no row, database, stream or result-set provider is manufactured. */
import type { Reference } from "../../../../../cppu/inc/com/sun/star/uno/Reference";
import type { Type } from "../../../../../cppu/inc/com/sun/star/uno/Type";
import { UnoType, getTypeFromTypeDescriptionReference } from "../../../../../cppu/inc/unotype";
import {
  typelib_static_mi_interface_type_init,
  type typelib_TypeDescriptionReference as R,
} from "../../../../../cppu/inc/typelib/typedescription";
import type { XInterface } from "../../../../../cppu/inc/com/sun/star/uno/XInterface";
import type { OUString, OUStringConstReference } from "../../../../../sal/inc/rtl/ustring";
import type { XInputStream } from "../../../../../udkapi/com/sun/star/io/XInputStream";
/** Complete original interface; every declared method can propagate its original SQLException. */
export interface XClob extends XInterface {
  /** Original length contract. @returns Owned result or declared scalar. */
  length(): bigint;
  /** Original getSubString contract. @param pos - Original declared input. @param length - Original declared input. @returns Owned result or declared scalar. */
  getSubString(pos: bigint, length: number): OUString;
  /** Original getCharacterStream contract. @returns Owned result or declared scalar. */
  getCharacterStream(): Reference<XInputStream>;
  /** Original position contract. @param searchstr - Original declared input. @param start - Original declared input. @returns Owned result or declared scalar. */
  position(searchstr: OUStringConstReference, start: number): bigint;
  /** Original positionOfClob contract. @param pattern - Original declared input. @param start - Original declared input. @returns Owned result or declared scalar. */
  positionOfClob(pattern: Reference<XClob>, start: bigint): bigint;
}
const the_type: [R | null] = [null];
/** Original normal generated cached getter uses the shared CPPU factory and implicit XInterface root. @returns Borrowed cached Type. */
export function cppu_detail_getUnoType(): Type {
  if (the_type[0] === null)
    typelib_static_mi_interface_type_init(
      the_type,
      new TextEncoder().encode("com.sun.star.sdbc.XClob\0"),
      0,
      null,
    );
  return getTypeFromTypeDescriptionReference(the_type);
}
/** Original deprecated Reference pointer overload. @param reference - Ignored original pointer. @returns Borrowed type. */
export function getCppuType(reference?: Reference<XClob> | null): Type {
  void reference;
  return UnoType.get(["Reference", cppu_detail_getUnoType]);
}
/** Original generated interface static API. */
export const XClob = Object.freeze({
  /** Original ignored void pointer overload. @param unused - Ignored pointer. @returns Borrowed type. */
  static_type(unused?: unknown): Type {
    void unused;
    return UnoType.get(cppu_detail_getUnoType);
  },
});
