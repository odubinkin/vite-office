/** @fileoverview Complete original XResultSet.idl declarations and normal CPPUMaker interface type binding; no row, database, stream or result-set provider is manufactured. */
import type { Reference } from "../../../../../cppu/inc/com/sun/star/uno/Reference";
import type { Type } from "../../../../../cppu/inc/com/sun/star/uno/Type";
import { UnoType, getTypeFromTypeDescriptionReference } from "../../../../../cppu/inc/unotype";
import {
  typelib_static_mi_interface_type_init,
  type typelib_TypeDescriptionReference as R,
} from "../../../../../cppu/inc/typelib/typedescription";
import type { XInterface } from "../../../../../cppu/inc/com/sun/star/uno/XInterface";

/** Complete original interface; every declared method can propagate its original SQLException. */
export interface XResultSet extends XInterface {
  /** Original next contract. @returns Owned result or declared scalar. */
  next(): boolean;
  /** Original isBeforeFirst contract. @returns Owned result or declared scalar. */
  isBeforeFirst(): boolean;
  /** Original isAfterLast contract. @returns Owned result or declared scalar. */
  isAfterLast(): boolean;
  /** Original isFirst contract. @returns Owned result or declared scalar. */
  isFirst(): boolean;
  /** Original isLast contract. @returns Owned result or declared scalar. */
  isLast(): boolean;
  /** Original beforeFirst contract. @returns Nothing. */
  beforeFirst(): void;
  /** Original afterLast contract. @returns Nothing. */
  afterLast(): void;
  /** Original first contract. @returns Owned result or declared scalar. */
  first(): boolean;
  /** Original last contract. @returns Owned result or declared scalar. */
  last(): boolean;
  /** Original getRow contract. @returns Owned result or declared scalar. */
  getRow(): number;
  /** Original absolute contract. @param row - Original declared input. @returns Owned result or declared scalar. */
  absolute(row: number): boolean;
  /** Original relative contract. @param rows - Original declared input. @returns Owned result or declared scalar. */
  relative(rows: number): boolean;
  /** Original previous contract. @returns Owned result or declared scalar. */
  previous(): boolean;
  /** Original refreshRow contract. @returns Nothing. */
  refreshRow(): void;
  /** Original rowUpdated contract. @returns Owned result or declared scalar. */
  rowUpdated(): boolean;
  /** Original rowInserted contract. @returns Owned result or declared scalar. */
  rowInserted(): boolean;
  /** Original rowDeleted contract. @returns Owned result or declared scalar. */
  rowDeleted(): boolean;
  /** Original getStatement contract. @returns Owned result or declared scalar. */
  getStatement(): Reference<XInterface>;
}
const the_type: [R | null] = [null];
/** Original normal generated cached getter uses the shared CPPU factory and implicit XInterface root. @returns Borrowed cached Type. */
export function cppu_detail_getUnoType(): Type {
  if (the_type[0] === null)
    typelib_static_mi_interface_type_init(
      the_type,
      new TextEncoder().encode("com.sun.star.sdbc.XResultSet\0"),
      0,
      null,
    );
  return getTypeFromTypeDescriptionReference(the_type);
}
/** Original deprecated Reference pointer overload. @param reference - Ignored original pointer. @returns Borrowed type. */
export function getCppuType(reference?: Reference<XResultSet> | null): Type {
  void reference;
  return UnoType.get(["Reference", cppu_detail_getUnoType]);
}
/** Original generated interface static API. */
export const XResultSet = Object.freeze({
  /** Original ignored void pointer overload. @param unused - Ignored pointer. @returns Borrowed type. */
  static_type(unused?: unknown): Type {
    void unused;
    return UnoType.get(cppu_detail_getUnoType);
  },
});
