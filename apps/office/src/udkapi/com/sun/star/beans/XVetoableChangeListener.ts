/** @fileoverview Original XVetoableChangeListener.idl complete method declarations and cppumaker-normal type binding; concrete property/listener behavior belongs to actual component owners. */
import type { Reference } from "../../../../../cppu/inc/com/sun/star/uno/Reference";
import type { Type } from "../../../../../cppu/inc/com/sun/star/uno/Type";
import { UnoType, getTypeFromTypeDescriptionReference } from "../../../../../cppu/inc/unotype";
import {
  typelib_static_mi_interface_type_init,
  type typelib_TypeDescriptionReference as R,
} from "../../../../../cppu/inc/typelib/typedescription";
import {
  cppu_detail_getUnoType as eventListenerType,
  type XEventListener,
} from "../lang/XEventListener";
import type { PropertyChangeEventConstReference } from "./PropertyChangeEvent";
/** Original declared methods and direct base. */
export interface XVetoableChangeListener extends XEventListener {
  /** Original constrained-property notification, retaining declared source exceptions. @param event - Original const event. @returns Nothing. */
  vetoableChange(event: PropertyChangeEventConstReference): void;
}
const the_type: [R | null] = [null];
/** Original normal generated getter retains its implicit root or explicit direct base through the existing CPPU factory. @returns Borrowed cached type. */
export function cppu_detail_getUnoType(): Type {
  if (the_type[0] === null)
    typelib_static_mi_interface_type_init(
      the_type,
      new TextEncoder().encode("com.sun.star.beans.XVetoableChangeListener\0"),
      1,
      [eventListenerType().getTypeLibType() as R],
    );
  return getTypeFromTypeDescriptionReference(the_type);
}
/** Original deprecated Reference pointer overload. @param reference - Ignored declared pointer. @returns Borrowed type. */
export function getCppuType(reference?: Reference<XVetoableChangeListener> | null): Type {
  void reference;
  return UnoType.get(["Reference", cppu_detail_getUnoType]);
}
/** Original generated interface static API. */
export const XVetoableChangeListener = Object.freeze({
  /** Original ignored void pointer overload. @param unused - Ignored source pointer. @returns Borrowed type. */
  static_type(unused?: unknown): Type {
    void unused;
    return UnoType.get(cppu_detail_getUnoType);
  },
});
