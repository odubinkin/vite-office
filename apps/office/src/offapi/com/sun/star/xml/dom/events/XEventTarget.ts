/** @fileoverview Complete original XEventTarget.idl contract and normal CPPUMaker binding for native DOM events/views. */
import type { Reference } from "../../../../../../../cppu/inc/com/sun/star/uno/Reference";
import type { Type } from "../../../../../../../cppu/inc/com/sun/star/uno/Type";
import {
  UnoType,
  getTypeFromTypeDescriptionReference,
} from "../../../../../../../cppu/inc/unotype";
import {
  typelib_static_mi_interface_type_init,
  type typelib_TypeDescriptionReference as R,
} from "../../../../../../../cppu/inc/typelib/typedescription";
import type { XInterface } from "../../../../../../../cppu/inc/com/sun/star/uno/XInterface";
import type { OUStringConstReference } from "../../../../../../../sal/inc/rtl/ustring";
import type { XEventListener } from "./XEventListener";
import type { XEvent } from "./XEvent";
/** Original direct base and complete declared methods. */
export interface XEventTarget extends XInterface {
  /** Original XEventTarget::addEventListener. @param eventType - Original borrowed string input. @param listener - Original borrowed XEventListener input. @param useCapture - Original borrowed boolean input. @returns Original void result. */
  addEventListener(
    eventType: OUStringConstReference,
    listener: Reference<XEventListener>,
    useCapture: boolean,
  ): void;
  /** Original XEventTarget::removeEventListener. @param eventType - Original borrowed string input. @param listener - Original borrowed XEventListener input. @param useCapture - Original borrowed boolean input. @returns Original void result. */
  removeEventListener(
    eventType: OUStringConstReference,
    listener: Reference<XEventListener>,
    useCapture: boolean,
  ): void;
  /** Original XEventTarget::dispatchEvent. @param evt - Original borrowed XEvent input. @returns Original boolean result. @throws Original raises(EventException). */
  dispatchEvent(evt: Reference<XEvent>): boolean;
}
const the_type: [R | null] = [null];
/** Original normal generated getter retains its implicit root or explicit direct base through the existing CPPU factory. @returns Borrowed cached type. */
export function cppu_detail_getUnoType(): Type {
  if (the_type[0] === null)
    typelib_static_mi_interface_type_init(
      the_type,
      new TextEncoder().encode("com.sun.star.xml.dom.events.XEventTarget\0"),
      0,
      null,
    );
  return getTypeFromTypeDescriptionReference(the_type);
}
/** Original deprecated Reference pointer overload. @param reference - Ignored declared pointer. @returns Borrowed type. */
export function getCppuType(reference?: Reference<XEventTarget> | null): Type {
  void reference;
  return UnoType.get(["Reference", cppu_detail_getUnoType]);
}
/** Original generated interface static API. */
export const XEventTarget = Object.freeze({
  /** Original ignored void pointer overload. @param unused - Ignored source pointer. @returns Borrowed type. */
  static_type(unused?: unknown): Type {
    void unused;
    return UnoType.get(cppu_detail_getUnoType);
  },
});
