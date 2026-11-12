/** @fileoverview Original XPropertyState.idl complete method declarations and cppumaker-normal type binding; concrete property/listener behavior belongs to actual component owners. */
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
import type { PropertyState } from "./PropertyState";
import type { OUString } from "../../../../../sal/inc/rtl/ustring";
import type { Any } from "../../../../../cppu/inc/com/sun/star/uno/Any";
/** Original published property-state interface with all four declared methods. */
export interface XPropertyState extends XInterface {
  /** Original single-property state query. @param name - Native property name. @returns Original declared state. */
  getPropertyState(name: OUStringConstReference): PropertyState;
  /** Original correlated bulk-state query; input is borrowed and result is owned. @param names - Native sequence of property names. @returns Owned state sequence. */
  getPropertyStates(names: Sequence<OUString>): Sequence<PropertyState>;
  /** Original reset-to-implementation-default operation. @param name - Native property name. @returns Nothing. */
  setPropertyToDefault(name: OUStringConstReference): void;
  /** Original default lookup; UnknownPropertyException/WrappedTargetException belong to the actual implementation. @param name - Native property name. @returns Owned Any, including void when the default value is unknown or void. */
  getPropertyDefault(name: OUStringConstReference): Any;
}
const the_type: [R | null] = [null];
/** Original normal generated getter retains its implicit root or explicit direct base through the existing CPPU factory. @returns Borrowed cached type. */
export function cppu_detail_getUnoType(): Type {
  if (the_type[0] === null)
    typelib_static_mi_interface_type_init(
      the_type,
      new TextEncoder().encode("com.sun.star.beans.XPropertyState\0"),
      0,
      null,
    );
  return getTypeFromTypeDescriptionReference(the_type);
}
/** Original deprecated Reference pointer overload. @param reference - Ignored declared pointer. @returns Borrowed type. */
export function getCppuType(reference?: Reference<XPropertyState> | null): Type {
  void reference;
  return UnoType.get(["Reference", cppu_detail_getUnoType]);
}
/** Original generated interface static API. */
export const XPropertyState = Object.freeze({
  /** Original ignored void pointer overload. @param unused - Ignored source pointer. @returns Borrowed type. */
  static_type(unused?: unknown): Type {
    void unused;
    return UnoType.get(cppu_detail_getUnoType);
  },
});
