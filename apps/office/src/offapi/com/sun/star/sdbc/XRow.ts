/** @fileoverview Complete original XRow.idl declarations and normal CPPUMaker interface type binding; no row, database, stream or result-set provider is manufactured. */
import type { Reference } from "../../../../../cppu/inc/com/sun/star/uno/Reference";
import type { Type } from "../../../../../cppu/inc/com/sun/star/uno/Type";
import { UnoType, getTypeFromTypeDescriptionReference } from "../../../../../cppu/inc/unotype";
import {
  typelib_static_mi_interface_type_init,
  type typelib_TypeDescriptionReference as R,
} from "../../../../../cppu/inc/typelib/typedescription";
import type { XInterface } from "../../../../../cppu/inc/com/sun/star/uno/XInterface";
import type { OUString } from "../../../../../sal/inc/rtl/ustring";
import type { Sequence } from "../../../../../cppu/inc/com/sun/star/uno/Sequence";
import type { Any } from "../../../../../cppu/inc/com/sun/star/uno/Any";
import type { XNameAccess } from "../../../../../cppu/inc/com/sun/star/container/XNameAccess";
import type { XInputStream } from "../../../../../udkapi/com/sun/star/io/XInputStream";
import type { Date } from "../util/Date";
import type { Time } from "../util/Time";
import type { DateTime } from "../util/DateTime";
import type { XRef } from "./XRef";
import type { XBlob } from "./XBlob";
import type { XClob } from "./XClob";
import type { XArray } from "./XArray";
/** Complete original interface; every declared method can propagate its original SQLException. */
export interface XRow extends XInterface {
  /** Original wasNull contract. @returns Owned result or declared scalar. */
  wasNull(): boolean;
  /** Original getString contract. @param columnIndex - Original declared input. @returns Owned result or declared scalar. */
  getString(columnIndex: number): OUString;
  /** Original getBoolean contract. @param columnIndex - Original declared input. @returns Owned result or declared scalar. */
  getBoolean(columnIndex: number): boolean;
  /** Original getByte contract. @param columnIndex - Original declared input. @returns Owned result or declared scalar. */
  getByte(columnIndex: number): number;
  /** Original getShort contract. @param columnIndex - Original declared input. @returns Owned result or declared scalar. */
  getShort(columnIndex: number): number;
  /** Original getInt contract. @param columnIndex - Original declared input. @returns Owned result or declared scalar. */
  getInt(columnIndex: number): number;
  /** Original getLong contract. @param columnIndex - Original declared input. @returns Owned result or declared scalar. */
  getLong(columnIndex: number): bigint;
  /** Original getFloat contract. @param columnIndex - Original declared input. @returns Owned result or declared scalar. */
  getFloat(columnIndex: number): number;
  /** Original getDouble contract. @param columnIndex - Original declared input. @returns Owned result or declared scalar. */
  getDouble(columnIndex: number): number;
  /** Original getBytes contract. @param columnIndex - Original declared input. @returns Owned result or declared scalar. */
  getBytes(columnIndex: number): Sequence<number>;
  /** Original getDate contract. @param columnIndex - Original declared input. @returns Owned result or declared scalar. */
  getDate(columnIndex: number): Date;
  /** Original getTime contract. @param columnIndex - Original declared input. @returns Owned result or declared scalar. */
  getTime(columnIndex: number): Time;
  /** Original getTimestamp contract. @param columnIndex - Original declared input. @returns Owned result or declared scalar. */
  getTimestamp(columnIndex: number): DateTime;
  /** Original getBinaryStream contract. @param columnIndex - Original declared input. @returns Owned result or declared scalar. */
  getBinaryStream(columnIndex: number): Reference<XInputStream>;
  /** Original getCharacterStream contract. @param columnIndex - Original declared input. @returns Owned result or declared scalar. */
  getCharacterStream(columnIndex: number): Reference<XInputStream>;
  /** Original getObject contract. @param columnIndex - Original declared input. @param typeMap - Original declared input. @returns Owned result or declared scalar. */
  getObject(columnIndex: number, typeMap: Reference<XNameAccess>): Any;
  /** Original getRef contract. @param columnIndex - Original declared input. @returns Owned result or declared scalar. */
  getRef(columnIndex: number): Reference<XRef>;
  /** Original getBlob contract. @param columnIndex - Original declared input. @returns Owned result or declared scalar. */
  getBlob(columnIndex: number): Reference<XBlob>;
  /** Original getClob contract. @param columnIndex - Original declared input. @returns Owned result or declared scalar. */
  getClob(columnIndex: number): Reference<XClob>;
  /** Original getArray contract. @param columnIndex - Original declared input. @returns Owned result or declared scalar. */
  getArray(columnIndex: number): Reference<XArray>;
}
const the_type: [R | null] = [null];
/** Original normal generated cached getter uses the shared CPPU factory and implicit XInterface root. @returns Borrowed cached Type. */
export function cppu_detail_getUnoType(): Type {
  if (the_type[0] === null)
    typelib_static_mi_interface_type_init(
      the_type,
      new TextEncoder().encode("com.sun.star.sdbc.XRow\0"),
      0,
      null,
    );
  return getTypeFromTypeDescriptionReference(the_type);
}
/** Original deprecated Reference pointer overload. @param reference - Ignored original pointer. @returns Borrowed type. */
export function getCppuType(reference?: Reference<XRow> | null): Type {
  void reference;
  return UnoType.get(["Reference", cppu_detail_getUnoType]);
}
/** Original generated interface static API. */
export const XRow = Object.freeze({
  /** Original ignored void pointer overload. @param unused - Ignored pointer. @returns Borrowed type. */
  static_type(unused?: unknown): Type {
    void unused;
    return UnoType.get(cppu_detail_getUnoType);
  },
});
