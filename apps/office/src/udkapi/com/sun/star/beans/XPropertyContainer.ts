/** @fileoverview Complete original XPropertyContainer.idl declarations and normal CPPUMaker interface type binding; no command, interaction or stream provider is manufactured. */
import type { Any } from "../../../../../cppu/inc/com/sun/star/uno/Any";
import type { OUStringConstReference } from "../../../../../sal/inc/rtl/ustring";
import type { Reference } from "../../../../../cppu/inc/com/sun/star/uno/Reference";
import type { Type } from "../../../../../cppu/inc/com/sun/star/uno/Type";
import { UnoType, getTypeFromTypeDescriptionReference } from "../../../../../cppu/inc/unotype";
import {
  typelib_static_mi_interface_type_init,
  type typelib_TypeDescriptionReference as R,
} from "../../../../../cppu/inc/typelib/typedescription";
import type { XInterface } from "../../../../../cppu/inc/com/sun/star/uno/XInterface";
/** Complete original IDL declaration and root. */
export interface XPropertyContainer extends XInterface {
  /** Original dynamic property registration. @param name - Name. @param attributes - Signed16 flags. @param initial - Initial value. @returns Nothing. */ addProperty(
    name: OUStringConstReference,
    attributes: number,
    initial: Any,
  ): void;
  /** Original removable-property operation. @param name - Name. @returns Nothing. */ removeProperty(
    name: OUStringConstReference,
  ): void;
}

const the_type: [R | null] = [null];
/** Original normal generated cached getter uses the shared CPPU factory and original declared direct base. @returns Borrowed cached Type. */
export function cppu_detail_getUnoType(): Type {
  if (the_type[0] === null)
    typelib_static_mi_interface_type_init(
      the_type,
      new TextEncoder().encode("com.sun.star.beans.XPropertyContainer\0"),
      0,
      null,
    );
  return getTypeFromTypeDescriptionReference(the_type);
}
/** Original deprecated Reference pointer overload. @param reference - Ignored original pointer. @returns Borrowed type. */
export function getCppuType(reference?: Reference<XPropertyContainer> | null): Type {
  void reference;
  return UnoType.get(["Reference", cppu_detail_getUnoType]);
}
/** Original generated interface static API. */
export const XPropertyContainer = Object.freeze({
  /** Original ignored void pointer overload. @param unused - Ignored pointer. @returns Borrowed type. */
  static_type(unused?: unknown): Type {
    void unused;
    return UnoType.get(cppu_detail_getUnoType);
  },
});
