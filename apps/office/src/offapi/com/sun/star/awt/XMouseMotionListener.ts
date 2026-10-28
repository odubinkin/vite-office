/** @fileoverview Original XMouseMotionListener IDL declarations and cppumaker-normal interface binding; full component, event value and UI implementations are not supplied here. */
import type { Reference } from "../../../../../cppu/inc/com/sun/star/uno/Reference";
import type { Type } from "../../../../../cppu/inc/com/sun/star/uno/Type";
import type { MouseEvent } from "./MouseEvent";
import { XEventListener } from "../../../../../udkapi/com/sun/star/lang/XEventListener";
import { UnoType, getTypeFromTypeDescriptionReference } from "../../../../../cppu/inc/unotype";
import {
  typelib_static_mi_interface_type_init,
  type typelib_TypeDescriptionReference as R,
} from "../../../../../cppu/inc/typelib/typedescription";
/** Complete original IDL method declarations; concrete component behavior is supplied by its native owner. */
export interface XMouseMotionListener extends XEventListener {
  /** Original mouseDragged contract. @param e - Original declared input. @returns Original declared result. */
  mouseDragged(e: Readonly<MouseEvent>): void;
  /** Original mouseMoved contract. @param e - Original declared input. @returns Original declared result. */
  mouseMoved(e: Readonly<MouseEvent>): void;
}
const the_type: [R | null] = [null];
/** Original normal generated getter retains its implicit root or explicit direct base through the existing CPPU factory. @returns Borrowed cached type. */
export function cppu_detail_getUnoType(): Type {
  if (the_type[0] === null)
    typelib_static_mi_interface_type_init(
      the_type,
      new TextEncoder().encode("com.sun.star.awt.XMouseMotionListener\0"),
      1,
      [XEventListener.static_type().getTypeLibType() as R],
    );
  return getTypeFromTypeDescriptionReference(the_type);
}
/** Original deprecated Reference pointer overload. @param reference - Ignored declared pointer. @returns Borrowed type. */
export function getCppuType(reference?: Reference<XMouseMotionListener> | null): Type {
  void reference;
  return UnoType.get(["Reference", cppu_detail_getUnoType]);
}
/** Original generated interface static API. */
export const XMouseMotionListener = Object.freeze({
  /** Original ignored void pointer overload. @param unused - Ignored source pointer. @returns Borrowed type. */
  static_type(unused?: unknown): Type {
    void unused;
    return UnoType.get(cppu_detail_getUnoType);
  },
});
