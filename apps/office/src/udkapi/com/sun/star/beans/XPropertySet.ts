/** @fileoverview Original XPropertySet.idl complete method declarations and cppumaker-normal type binding; concrete property/listener behavior belongs to actual component owners. */
import type { Reference } from "../../../../../cppu/inc/com/sun/star/uno/Reference";
import type { Type } from "../../../../../cppu/inc/com/sun/star/uno/Type";
import { UnoType, getTypeFromTypeDescriptionReference } from "../../../../../cppu/inc/unotype";
import {
  typelib_static_mi_interface_type_init,
  type typelib_TypeDescriptionReference as R,
} from "../../../../../cppu/inc/typelib/typedescription";
import type { XInterface } from "../../../../../cppu/inc/com/sun/star/uno/XInterface";
import type { Any } from "../../../../../cppu/inc/com/sun/star/uno/Any";
import type { OUStringConstReference } from "../../../../../sal/inc/rtl/ustring";
import type { XPropertySetInfo } from "./XPropertySetInfo";
import type { XPropertyChangeListener } from "./XPropertyChangeListener";
import type { XVetoableChangeListener } from "./XVetoableChangeListener";
/** Original declared methods and direct base. */
export interface XPropertySet extends XInterface {
  /** Original descriptor getter. @returns Owned property metadata reference. */
  getPropertySetInfo(): Reference<XPropertySetInfo>;
  /** Original value assignment. @param name - Exact property name. @param value - Original Any value. @returns Nothing. */
  setPropertyValue(name: OUStringConstReference, value: Any): void;
  /** Original value lookup; source exceptions propagate through this interface. @param name - Exact property name. @returns Owned Any value. */
  getPropertyValue(name: OUStringConstReference): Any;
  /** Original bound-property listener registration. @param name - Property name or source all-properties empty string. @param listener - Actual listener reference. @returns Nothing. */
  addPropertyChangeListener(
    name: OUStringConstReference,
    listener: Reference<XPropertyChangeListener>,
  ): void;
  /** Original bound-property listener removal. @param name - Original property name. @param listener - Actual listener reference. @returns Nothing. */
  removePropertyChangeListener(
    name: OUStringConstReference,
    listener: Reference<XPropertyChangeListener>,
  ): void;
  /** Original constrained-property listener registration. @param name - Property name or source all-properties empty string. @param listener - Actual listener reference. @returns Nothing. */
  addVetoableChangeListener(
    name: OUStringConstReference,
    listener: Reference<XVetoableChangeListener>,
  ): void;
  /** Original constrained-property listener removal. @param name - Original property name. @param listener - Actual listener reference. @returns Nothing. */
  removeVetoableChangeListener(
    name: OUStringConstReference,
    listener: Reference<XVetoableChangeListener>,
  ): void;
}
const the_type: [R | null] = [null];
/** Original normal generated getter retains its implicit root or explicit direct base through the existing CPPU factory. @returns Borrowed cached type. */
export function cppu_detail_getUnoType(): Type {
  if (the_type[0] === null)
    typelib_static_mi_interface_type_init(
      the_type,
      new TextEncoder().encode("com.sun.star.beans.XPropertySet\0"),
      0,
      null,
    );
  return getTypeFromTypeDescriptionReference(the_type);
}
/** Original deprecated Reference pointer overload. @param reference - Ignored declared pointer. @returns Borrowed type. */
export function getCppuType(reference?: Reference<XPropertySet> | null): Type {
  void reference;
  return UnoType.get(["Reference", cppu_detail_getUnoType]);
}
/** Original generated interface static API. */
export const XPropertySet = Object.freeze({
  /** Original ignored void pointer overload. @param unused - Ignored source pointer. @returns Borrowed type. */
  static_type(unused?: unknown): Type {
    void unused;
    return UnoType.get(cppu_detail_getUnoType);
  },
});
