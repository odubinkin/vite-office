/** @fileoverview Complete original XArray.idl declarations and normal CPPUMaker interface type binding; no row, database, stream or result-set provider is manufactured. */
import type { Reference } from "../../../../../cppu/inc/com/sun/star/uno/Reference";
import type { Type } from "../../../../../cppu/inc/com/sun/star/uno/Type";
import { UnoType, getTypeFromTypeDescriptionReference } from "../../../../../cppu/inc/unotype";
import {
  typelib_static_mi_interface_type_init,
  type typelib_TypeDescriptionReference as R,
} from "../../../../../cppu/inc/typelib/typedescription";
import type { XInterface } from "../../../../../cppu/inc/com/sun/star/uno/XInterface";
import type { OUString } from "../../../../../sal/inc/rtl/ustring";
import type { Any } from "../../../../../cppu/inc/com/sun/star/uno/Any";
import type { Sequence } from "../../../../../cppu/inc/com/sun/star/uno/Sequence";
import type { XNameAccess } from "../../../../../cppu/inc/com/sun/star/container/XNameAccess";
import type { XResultSet } from "./XResultSet";
/** Complete original interface; every declared method can propagate its original SQLException. */
export interface XArray extends XInterface {
  /** Original getBaseTypeName contract. @returns Owned result or declared scalar. */
  getBaseTypeName(): OUString;
  /** Original getBaseType contract. @returns Owned result or declared scalar. */
  getBaseType(): number;
  /** Original getArray contract. @param typeMap - Original declared input. @returns Owned result or declared scalar. */
  getArray(typeMap: Reference<XNameAccess>): Sequence<Any>;
  /** Original getArrayAtIndex contract. @param index - Original declared input. @param count - Original declared input. @param typeMap - Original declared input. @returns Owned result or declared scalar. */
  getArrayAtIndex(index: number, count: number, typeMap: Reference<XNameAccess>): Sequence<Any>;
  /** Original getResultSet contract. @param typeMap - Original declared input. @returns Owned result or declared scalar. */
  getResultSet(typeMap: Reference<XNameAccess>): Reference<XResultSet>;
  /** Original getResultSetAtIndex contract. @param index - Original declared input. @param count - Original declared input. @param typeMap - Original declared input. @returns Owned result or declared scalar. */
  getResultSetAtIndex(
    index: number,
    count: number,
    typeMap: Reference<XNameAccess>,
  ): Reference<XResultSet>;
}
const the_type: [R | null] = [null];
/** Original normal generated cached getter uses the shared CPPU factory and implicit XInterface root. @returns Borrowed cached Type. */
export function cppu_detail_getUnoType(): Type {
  if (the_type[0] === null)
    typelib_static_mi_interface_type_init(
      the_type,
      new TextEncoder().encode("com.sun.star.sdbc.XArray\0"),
      0,
      null,
    );
  return getTypeFromTypeDescriptionReference(the_type);
}
/** Original deprecated Reference pointer overload. @param reference - Ignored original pointer. @returns Borrowed type. */
export function getCppuType(reference?: Reference<XArray> | null): Type {
  void reference;
  return UnoType.get(["Reference", cppu_detail_getUnoType]);
}
/** Original generated interface static API. */
export const XArray = Object.freeze({
  /** Original ignored void pointer overload. @param unused - Ignored pointer. @returns Borrowed type. */
  static_type(unused?: unknown): Type {
    void unused;
    return UnoType.get(cppu_detail_getUnoType);
  },
});
