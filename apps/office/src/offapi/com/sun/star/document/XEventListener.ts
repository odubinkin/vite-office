/** @fileoverview Original listener IDL declaration and CPPUMaker-normal static type binding over actual shared CPPU ownership. */
import type { Reference } from "../../../../../cppu/inc/com/sun/star/uno/Reference";
import type { Type } from "../../../../../cppu/inc/com/sun/star/uno/Type";
import { UnoType, getTypeFromTypeDescriptionReference } from "../../../../../cppu/inc/unotype";
import {
  typelib_static_mi_interface_type_init,
  type typelib_TypeDescriptionReference as R,
} from "../../../../../cppu/inc/typelib/typedescription";
import type { EventObject } from "./EventObject";
import { XEventListener as LangXEventListener } from "../../../../../udkapi/com/sun/star/lang/XEventListener";
/** Complete original declared method and direct base; actual listeners supply behavior. */
export interface XEventListener extends LangXEventListener {
  /** Original document event notification. @param Event - Borrowed original event. @returns Nothing. */
  notifyEvent(Event: Readonly<EventObject>): void;
}
const the_type: [R | null] = [null];
/** Original normal generated getter retains its implicit root or explicit direct base through the existing CPPU factory. @returns Borrowed cached type. */
export function cppu_detail_getUnoType(): Type {
  if (the_type[0] === null)
    typelib_static_mi_interface_type_init(
      the_type,
      new TextEncoder().encode("com.sun.star.document.XEventListener\0"),
      1,
      [LangXEventListener.static_type().getTypeLibType() as R],
    );
  return getTypeFromTypeDescriptionReference(the_type);
}
/** Original deprecated Reference pointer overload. @param reference - Ignored declared pointer. @returns Borrowed type. */
export function getCppuType(reference?: Reference<XEventListener> | null): Type {
  void reference;
  return UnoType.get(["Reference", cppu_detail_getUnoType]);
}
/** Original generated interface static API. */
export const XEventListener = Object.freeze({
  /** Original ignored void pointer overload. @param unused - Ignored source pointer. @returns Borrowed type. */
  static_type(unused?: unknown): Type {
    void unused;
    return UnoType.get(cppu_detail_getUnoType);
  },
});
