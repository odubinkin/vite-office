/** @fileoverview Original complete XMap.idl and cppumaker-normal type binding; this declares the original map interface, never a replacement map component. */
import type { Any } from "../../../../../cppu/inc/com/sun/star/uno/Any";
import type { Type } from "../../../../../cppu/inc/com/sun/star/uno/Type";
import type { Reference } from "../../../../../cppu/inc/com/sun/star/uno/Reference";
import { XElementAccess } from "../../../../../cppu/inc/com/sun/star/container/XElementAccess";
import { UnoType, getTypeFromTypeDescriptionReference } from "../../../../../cppu/inc/unotype";
import {
  typelib_static_mi_interface_type_init,
  type typelib_TypeDescriptionReference as R,
} from "../../../../../cppu/inc/typelib/typedescription";
/** Complete original methods and readonly attribute getters; values remain actual native Any/Type owners. */
export interface XMap extends XElementAccess {
  /** Original KeyType getter. @returns Owned declared type. */ getKeyType(): Type;
  /** Original ValueType getter. @returns Owned declared type. */ getValueType(): Type;
  /** Original clear method. @returns Nothing. */ clear(): void;
  /** Original key membership. @param key - Borrowed native key. @returns Membership. */ containsKey(
    key: Readonly<Any>,
  ): boolean;
  /** Original value membership. @param value - Borrowed native value. @returns Membership. */ containsValue(
    value: Readonly<Any>,
  ): boolean;
  /** Original lookup. @param key - Borrowed native key. @returns Owned native value. */ get(
    key: Readonly<Any>,
  ): Any;
  /** Original insertion/replacement. @param key - Borrowed key. @param value - Borrowed value. @returns Owned previous value. */ put(
    key: Readonly<Any>,
    value: Readonly<Any>,
  ): Any;
  /** Original removal. @param key - Borrowed key. @returns Owned removed value. */ remove(
    key: Readonly<Any>,
  ): Any;
}
const the_type: [R | null] = [null];
/** Original normal generated type getter retains its actual direct XElementAccess base. @returns Borrowed cached type. */
export function cppu_detail_getUnoType(): Type {
  if (the_type[0] === null)
    typelib_static_mi_interface_type_init(
      the_type,
      new TextEncoder().encode("com.sun.star.container.XMap\0"),
      1,
      [XElementAccess.static_type().getTypeLibType() as R],
    );
  return getTypeFromTypeDescriptionReference(the_type);
}
/** Original deprecated Reference overload. @param reference - Ignored pointer. @returns Borrowed type. */
export function getCppuType(reference?: Reference<XMap> | null): Type {
  void reference;
  return UnoType.get(["Reference", cppu_detail_getUnoType]);
}
/** Original interface static API. */
export const XMap = Object.freeze({
  /** Original ignored void pointer. @param unused - Ignored pointer. @returns Borrowed type. */
  static_type(unused?: unknown): Type {
    void unused;
    return UnoType.get(cppu_detail_getUnoType);
  },
});
