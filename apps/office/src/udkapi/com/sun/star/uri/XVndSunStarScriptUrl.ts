/** @fileoverview Complete original XVndSunStarScriptUrl.idl declaration and normal cached CPPUMaker interface type. Actual components implement the declared behavior. */
import type { Reference } from "../../../../../cppu/inc/com/sun/star/uno/Reference";
import type { Type } from "../../../../../cppu/inc/com/sun/star/uno/Type";
import { UnoType, getTypeFromTypeDescriptionReference } from "../../../../../cppu/inc/unotype";
import {
  typelib_static_mi_interface_type_init,
  type typelib_TypeDescriptionReference as R,
} from "../../../../../cppu/inc/typelib/typedescription";
import type { XInterface } from "../../../../../cppu/inc/com/sun/star/uno/XInterface";
import type { OUString, OUStringConstReference } from "../../../../../sal/inc/rtl/ustring";
/** Original implicit XInterface root and complete declared methods. */
export interface XVndSunStarScriptUrl extends XInterface {
  /** Original name getter. @returns Owned decoded name. */
  getName(): OUString;
  /** Original name setter. @param name - Borrowed unescaped name. @returns Nothing. */
  setName(name: OUStringConstReference): void;
  /** Original parameter membership. @param key - Borrowed unescaped key. @returns Whether present. */
  hasParameter(key: OUStringConstReference): boolean;
  /** Original first matching parameter getter. @param key - Borrowed key. @returns Owned decoded value. */
  getParameter(key: OUStringConstReference): OUString;
  /** Original first matching parameter replacement or append. @param key - Borrowed key. @param value - Borrowed value. @returns Nothing. */
  setParameter(key: OUStringConstReference, value: OUStringConstReference): void;
}
const the_type: [R | null] = [null];
/** Original normal static interface getter. @returns Borrowed cached type. */
export function cppu_detail_getUnoType(): Type {
  if (the_type[0] === null)
    typelib_static_mi_interface_type_init(
      the_type,
      new TextEncoder().encode("com.sun.star.uri.XVndSunStarScriptUrl\0"),
      0,
      null,
    );
  return getTypeFromTypeDescriptionReference(the_type);
}
/** Original deprecated Reference pointer overload. @param reference - Ignored original pointer. @returns Cached type. */
export function getCppuType(reference?: Reference<XVndSunStarScriptUrl> | null): Type {
  void reference;
  return UnoType.get(["Reference", cppu_detail_getUnoType]);
}
/** Original generated static API. */
export const XVndSunStarScriptUrl = Object.freeze({
  /** Original ignored void pointer overload. @param unused - Ignored pointer. @returns Cached type. */
  static_type(unused?: unknown): Type {
    void unused;
    return UnoType.get(cppu_detail_getUnoType);
  },
});
