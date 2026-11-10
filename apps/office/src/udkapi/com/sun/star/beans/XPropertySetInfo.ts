/** @fileoverview Original XPropertySetInfo.idl complete method declarations and cppumaker-normal type binding; concrete property/listener behavior belongs to actual component owners. */
import type { Reference } from "../../../../../cppu/inc/com/sun/star/uno/Reference";
import type { Type } from "../../../../../cppu/inc/com/sun/star/uno/Type";
import { UnoType, getTypeFromTypeDescriptionReference } from "../../../../../cppu/inc/unotype";
import {
  typelib_static_mi_interface_type_init,
  type typelib_TypeDescriptionReference as R,
} from "../../../../../cppu/inc/typelib/typedescription";
import type { XInterface } from "../../../../../cppu/inc/com/sun/star/uno/XInterface";
import type { Sequence } from "../../../../../cppu/inc/com/sun/star/uno/Sequence";
import type { OUStringConstReference } from "../../../../../sal/inc/rtl/ustring";
import type { Property } from "./Property";
/** Original declared methods and direct base. */
export interface XPropertySetInfo extends XInterface {
  /** Original property descriptor enumeration. @returns Owned property sequence. */
  getProperties(): Sequence<Property>;
  /** Original named descriptor lookup. @param name - Exact property name. @returns Owned descriptor. */
  getPropertyByName(name: OUStringConstReference): Property;
  /** Original property presence query. @param name - Exact property name. @returns Original presence flag. */
  hasPropertyByName(name: OUStringConstReference): boolean;
}
const the_type: [R | null] = [null];
/** Original normal generated getter retains its implicit root or explicit direct base through the existing CPPU factory. @returns Borrowed cached type. */
export function cppu_detail_getUnoType(): Type {
  if (the_type[0] === null)
    typelib_static_mi_interface_type_init(
      the_type,
      new TextEncoder().encode("com.sun.star.beans.XPropertySetInfo\0"),
      0,
      null,
    );
  return getTypeFromTypeDescriptionReference(the_type);
}
/** Original deprecated Reference pointer overload. @param reference - Ignored declared pointer. @returns Borrowed type. */
export function getCppuType(reference?: Reference<XPropertySetInfo> | null): Type {
  void reference;
  return UnoType.get(["Reference", cppu_detail_getUnoType]);
}
/** Original generated interface static API. */
export const XPropertySetInfo = Object.freeze({
  /** Original ignored void pointer overload. @param unused - Ignored source pointer. @returns Borrowed type. */
  static_type(unused?: unknown): Type {
    void unused;
    return UnoType.get(cppu_detail_getUnoType);
  },
});
