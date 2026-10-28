/** @fileoverview Original XFrames IDL declarations and cppumaker-normal interface binding; full component, event value and UI implementations are not supplied here. */
import { XIndexAccess } from "../../../../../cppu/inc/com/sun/star/container/XIndexAccess";
import type { Reference } from "../../../../../cppu/inc/com/sun/star/uno/Reference";
import type { Sequence } from "../../../../../cppu/inc/com/sun/star/uno/Sequence";
import type { Type } from "../../../../../cppu/inc/com/sun/star/uno/Type";
import type { XFrame } from "./XFrame";
import { UnoType, getTypeFromTypeDescriptionReference } from "../../../../../cppu/inc/unotype";
import {
  typelib_static_mi_interface_type_init,
  type typelib_TypeDescriptionReference as R,
} from "../../../../../cppu/inc/typelib/typedescription";
/** Complete original IDL method declarations; concrete component behavior is supplied by its native owner. */
export interface XFrames extends XIndexAccess {
  /** Original append contract. @param xFrame - Original declared input. @returns Original declared result. */
  append(xFrame: Reference<XFrame>): void;
  /** Original queryFrames contract. @param nSearchFlags - Original declared input. @returns Original declared result. */
  queryFrames(nSearchFlags: number): Sequence<Reference<XFrame>>;
  /** Original remove contract. @param xFrame - Original declared input. @returns Original declared result. */
  remove(xFrame: Reference<XFrame>): void;
}
const the_type: [R | null] = [null];
/** Original normal generated getter retains its implicit root or explicit direct base through the existing CPPU factory. @returns Borrowed cached type. */
export function cppu_detail_getUnoType(): Type {
  if (the_type[0] === null)
    typelib_static_mi_interface_type_init(
      the_type,
      new TextEncoder().encode("com.sun.star.frame.XFrames\0"),
      1,
      [XIndexAccess.static_type().getTypeLibType() as R],
    );
  return getTypeFromTypeDescriptionReference(the_type);
}
/** Original deprecated Reference pointer overload. @param reference - Ignored declared pointer. @returns Borrowed type. */
export function getCppuType(reference?: Reference<XFrames> | null): Type {
  void reference;
  return UnoType.get(["Reference", cppu_detail_getUnoType]);
}
/** Original generated interface static API. */
export const XFrames = Object.freeze({
  /** Original ignored void pointer overload. @param unused - Ignored source pointer. @returns Borrowed type. */
  static_type(unused?: unknown): Type {
    void unused;
    return UnoType.get(cppu_detail_getUnoType);
  },
});
