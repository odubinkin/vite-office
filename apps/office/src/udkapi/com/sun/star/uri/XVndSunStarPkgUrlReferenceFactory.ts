/** @fileoverview Complete original XVndSunStarPkgUrlReferenceFactory.idl declaration and normal cached CPPUMaker interface type. Actual components implement the declared behavior. */
import type {
  Reference,
  ReferenceConstParameter,
} from "../../../../../cppu/inc/com/sun/star/uno/Reference";
import type { Type } from "../../../../../cppu/inc/com/sun/star/uno/Type";
import { UnoType, getTypeFromTypeDescriptionReference } from "../../../../../cppu/inc/unotype";
import {
  typelib_static_mi_interface_type_init,
  type typelib_TypeDescriptionReference as R,
} from "../../../../../cppu/inc/typelib/typedescription";
import type { XInterface } from "../../../../../cppu/inc/com/sun/star/uno/XInterface";
import type { XUriReference } from "./XUriReference";
/** Original implicit XInterface root and complete declared methods. */
export interface XVndSunStarPkgUrlReferenceFactory extends XInterface {
  /** Original package URL construction. @param authority - Borrowed URI interface reference. @returns New URL or empty reference. */
  createVndSunStarPkgUrlReference(
    authority: ReferenceConstParameter<XUriReference>,
  ): Reference<XUriReference>;
}
const the_type: [R | null] = [null];
/** Original normal static interface getter. @returns Borrowed cached type. */
export function cppu_detail_getUnoType(): Type {
  if (the_type[0] === null)
    typelib_static_mi_interface_type_init(
      the_type,
      new TextEncoder().encode("com.sun.star.uri.XVndSunStarPkgUrlReferenceFactory\0"),
      0,
      null,
    );
  return getTypeFromTypeDescriptionReference(the_type);
}
/** Original deprecated Reference pointer overload. @param reference - Ignored original pointer. @returns Cached type. */
export function getCppuType(reference?: Reference<XVndSunStarPkgUrlReferenceFactory> | null): Type {
  void reference;
  return UnoType.get(["Reference", cppu_detail_getUnoType]);
}
/** Original generated static API. */
export const XVndSunStarPkgUrlReferenceFactory = Object.freeze({
  /** Original ignored void pointer overload. @param unused - Ignored pointer. @returns Cached type. */
  static_type(unused?: unknown): Type {
    void unused;
    return UnoType.get(cppu_detail_getUnoType);
  },
});
