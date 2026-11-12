/** @fileoverview Complete original XMouseEvent.idl contract and normal CPPUMaker binding for native DOM events/views. */
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
import { XUIEvent } from "./XUIEvent";
import type { XEventTarget } from "./XEventTarget";
import type { OUStringConstReference } from "../../../../../../../sal/inc/rtl/ustring";
import type { XAbstractView } from "../views/XAbstractView";
/** Original direct base and complete declared methods. */
export interface XMouseEvent extends XUIEvent {
  /** Original XMouseEvent::getScreenX.  @returns Original long result. */
  getScreenX(): number;
  /** Original XMouseEvent::getScreenY.  @returns Original long result. */
  getScreenY(): number;
  /** Original XMouseEvent::getClientX.  @returns Original long result. */
  getClientX(): number;
  /** Original XMouseEvent::getClientY.  @returns Original long result. */
  getClientY(): number;
  /** Original XMouseEvent::getCtrlKey.  @returns Original boolean result. */
  getCtrlKey(): boolean;
  /** Original XMouseEvent::getShiftKey.  @returns Original boolean result. */
  getShiftKey(): boolean;
  /** Original XMouseEvent::getAltKey.  @returns Original boolean result. */
  getAltKey(): boolean;
  /** Original XMouseEvent::getMetaKey.  @returns Original boolean result. */
  getMetaKey(): boolean;
  /** Original XMouseEvent::getButton.  @returns Original short result. */
  getButton(): number;
  /** Original XMouseEvent::getRelatedTarget.  @returns Original XEventTarget result. */
  getRelatedTarget(): Reference<XEventTarget>;
  /** Original XMouseEvent::initMouseEvent. @param typeArg - Original borrowed string input. @param canBubbleArg - Original borrowed boolean input. @param cancelableArg - Original borrowed boolean input. @param viewArg - Original borrowed com::sun::star::xml::dom::views::XAbstractView input. @param detailArg - Original borrowed long input. @param screenXArg - Original borrowed long input. @param screenYArg - Original borrowed long input. @param clientXArg - Original borrowed long input. @param clientYArg - Original borrowed long input. @param ctrlKeyArg - Original borrowed boolean input. @param altKeyArg - Original borrowed boolean input. @param shiftKeyArg - Original borrowed boolean input. @param metaKeyArg - Original borrowed boolean input. @param buttonArg - Original borrowed short input. @param relatedTargetArg - Original borrowed XEventTarget input. @returns Original void result. */
  initMouseEvent(
    typeArg: OUStringConstReference,
    canBubbleArg: boolean,
    cancelableArg: boolean,
    viewArg: Reference<XAbstractView>,
    detailArg: number,
    screenXArg: number,
    screenYArg: number,
    clientXArg: number,
    clientYArg: number,
    ctrlKeyArg: boolean,
    altKeyArg: boolean,
    shiftKeyArg: boolean,
    metaKeyArg: boolean,
    buttonArg: number,
    relatedTargetArg: Reference<XEventTarget>,
  ): void;
}
const the_type: [R | null] = [null];
/** Original normal generated getter retains its implicit root or explicit direct base through the existing CPPU factory. @returns Borrowed cached type. */
export function cppu_detail_getUnoType(): Type {
  if (the_type[0] === null)
    typelib_static_mi_interface_type_init(
      the_type,
      new TextEncoder().encode("com.sun.star.xml.dom.events.XMouseEvent\0"),
      1,
      [XUIEvent.static_type().getTypeLibType() as R],
    );
  return getTypeFromTypeDescriptionReference(the_type);
}
/** Original deprecated Reference pointer overload. @param reference - Ignored declared pointer. @returns Borrowed type. */
export function getCppuType(reference?: Reference<XMouseEvent> | null): Type {
  void reference;
  return UnoType.get(["Reference", cppu_detail_getUnoType]);
}
/** Original generated interface static API. */
export const XMouseEvent = Object.freeze({
  /** Original ignored void pointer overload. @param unused - Ignored source pointer. @returns Borrowed type. */
  static_type(unused?: unknown): Type {
    void unused;
    return UnoType.get(cppu_detail_getUnoType);
  },
});
