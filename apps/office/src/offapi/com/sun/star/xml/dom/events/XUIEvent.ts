/** @fileoverview Complete original XUIEvent.idl contract and normal CPPUMaker binding for native DOM events/views. */
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
import { XEvent } from "./XEvent";
import type { XAbstractView } from "../views/XAbstractView";
import type { OUStringConstReference } from "../../../../../../../sal/inc/rtl/ustring";
/** Original direct base and complete declared methods. */
export interface XUIEvent extends XEvent {
  /** Original XUIEvent::getView.  @returns Original com::sun::star::xml::dom::views::XAbstractView result. */
  getView(): Reference<XAbstractView>;
  /** Original XUIEvent::getDetail.  @returns Original long result. */
  getDetail(): number;
  /** Original XUIEvent::initUIEvent. @param typeArg - Original borrowed string input. @param canBubbleArg - Original borrowed boolean input. @param cancelableArg - Original borrowed boolean input. @param viewArg - Original borrowed com::sun::star::xml::dom::views::XAbstractView input. @param detailArg - Original borrowed long input. @returns Original void result. */
  initUIEvent(
    typeArg: OUStringConstReference,
    canBubbleArg: boolean,
    cancelableArg: boolean,
    viewArg: Reference<XAbstractView>,
    detailArg: number,
  ): void;
}
const the_type: [R | null] = [null];
/** Original normal generated getter retains its implicit root or explicit direct base through the existing CPPU factory. @returns Borrowed cached type. */
export function cppu_detail_getUnoType(): Type {
  if (the_type[0] === null)
    typelib_static_mi_interface_type_init(
      the_type,
      new TextEncoder().encode("com.sun.star.xml.dom.events.XUIEvent\0"),
      1,
      [XEvent.static_type().getTypeLibType() as R],
    );
  return getTypeFromTypeDescriptionReference(the_type);
}
/** Original deprecated Reference pointer overload. @param reference - Ignored declared pointer. @returns Borrowed type. */
export function getCppuType(reference?: Reference<XUIEvent> | null): Type {
  void reference;
  return UnoType.get(["Reference", cppu_detail_getUnoType]);
}
/** Original generated interface static API. */
export const XUIEvent = Object.freeze({
  /** Original ignored void pointer overload. @param unused - Ignored source pointer. @returns Borrowed type. */
  static_type(unused?: unknown): Type {
    void unused;
    return UnoType.get(cppu_detail_getUnoType);
  },
});
