/** @fileoverview Complete original XBlob.idl declarations and normal CPPUMaker interface type binding; no row, database, stream or result-set provider is manufactured. */
import type { Reference } from "../../../../../cppu/inc/com/sun/star/uno/Reference";
import type { Type } from "../../../../../cppu/inc/com/sun/star/uno/Type";
import { UnoType, getTypeFromTypeDescriptionReference } from "../../../../../cppu/inc/unotype";
import {
  typelib_static_mi_interface_type_init,
  type typelib_TypeDescriptionReference as R,
} from "../../../../../cppu/inc/typelib/typedescription";
import type { XInterface } from "../../../../../cppu/inc/com/sun/star/uno/XInterface";
import type { Sequence } from "../../../../../cppu/inc/com/sun/star/uno/Sequence";
import type { XInputStream } from "../../../../../udkapi/com/sun/star/io/XInputStream";
/** Complete original interface; every declared method can propagate its original SQLException. */
export interface XBlob extends XInterface {
  /** Original length contract. @returns Owned result or declared scalar. */
  length(): bigint;
  /** Original getBytes contract. @param pos - Original declared input. @param length - Original declared input. @returns Owned result or declared scalar. */
  getBytes(pos: bigint, length: number): Sequence<number>;
  /** Original getBinaryStream contract. @returns Owned result or declared scalar. */
  getBinaryStream(): Reference<XInputStream>;
  /** Original position contract. @param pattern - Original declared input. @param start - Original declared input. @returns Owned result or declared scalar. */
  position(pattern: Sequence<number>, start: bigint): bigint;
  /** Original positionOfBlob contract. @param pattern - Original declared input. @param start - Original declared input. @returns Owned result or declared scalar. */
  positionOfBlob(pattern: Reference<XBlob>, start: bigint): bigint;
}
const the_type: [R | null] = [null];
/** Original normal generated cached getter uses the shared CPPU factory and implicit XInterface root. @returns Borrowed cached Type. */
export function cppu_detail_getUnoType(): Type {
  if (the_type[0] === null)
    typelib_static_mi_interface_type_init(
      the_type,
      new TextEncoder().encode("com.sun.star.sdbc.XBlob\0"),
      0,
      null,
    );
  return getTypeFromTypeDescriptionReference(the_type);
}
/** Original deprecated Reference pointer overload. @param reference - Ignored original pointer. @returns Borrowed type. */
export function getCppuType(reference?: Reference<XBlob> | null): Type {
  void reference;
  return UnoType.get(["Reference", cppu_detail_getUnoType]);
}
/** Original generated interface static API. */
export const XBlob = Object.freeze({
  /** Original ignored void pointer overload. @param unused - Ignored pointer. @returns Borrowed type. */
  static_type(unused?: unknown): Type {
    void unused;
    return UnoType.get(cppu_detail_getUnoType);
  },
});
