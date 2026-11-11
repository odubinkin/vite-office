/** @fileoverview Original XTransactionListener IDL multiple-base contract and cppumaker-normal static interface binding; concrete behavior is supplied by actual component owners. */
import type { Reference } from "../../../../../cppu/inc/com/sun/star/uno/Reference";
import type { Type } from "../../../../../cppu/inc/com/sun/star/uno/Type";
import { UnoType, getTypeFromTypeDescriptionReference } from "../../../../../cppu/inc/unotype";
import {
  typelib_static_mi_interface_type_init,
  type typelib_TypeDescriptionReference as R,
} from "../../../../../cppu/inc/typelib/typedescription";
import { XEventListener } from "../../../../../udkapi/com/sun/star/lang/XEventListener";
import type { EventObject } from "../../../../../udkapi/com/sun/star/lang/EventObject";
/** Complete original declared interface and required base. */
export interface XTransactionListener extends XEventListener {
  /** Original pre-commit callback may raise UNO Exception. @param event - Borrowed event. @returns Nothing. */
  preCommit(event: Readonly<EventObject>): void;
  /** Original published spelling is commited, with one t. @param event - Borrowed event. @returns Nothing. */
  commited(event: Readonly<EventObject>): void;
  /** Original pre-revert callback may raise UNO Exception. @param event - Borrowed event. @returns Nothing. */
  preRevert(event: Readonly<EventObject>): void;
  /** Original post-revert callback. @param event - Borrowed event. @returns Nothing. */
  reverted(event: Readonly<EventObject>): void;
}
const the_type: [R | null] = [null];
/** Original normal generated getter retains its implicit root or explicit direct base through the existing CPPU factory. @returns Borrowed cached type. */
export function cppu_detail_getUnoType(): Type {
  if (the_type[0] === null)
    typelib_static_mi_interface_type_init(
      the_type,
      new TextEncoder().encode("com.sun.star.embed.XTransactionListener\0"),
      1,
      [XEventListener.static_type().getTypeLibType() as R],
    );
  return getTypeFromTypeDescriptionReference(the_type);
}
/** Original deprecated Reference pointer overload. @param reference - Ignored declared pointer. @returns Borrowed type. */
export function getCppuType(reference?: Reference<XTransactionListener> | null): Type {
  void reference;
  return UnoType.get(["Reference", cppu_detail_getUnoType]);
}
/** Original generated interface static API. */
export const XTransactionListener = Object.freeze({
  /** Original ignored void pointer overload. @param unused - Ignored source pointer. @returns Borrowed type. */
  static_type(unused?: unknown): Type {
    void unused;
    return UnoType.get(cppu_detail_getUnoType);
  },
});
