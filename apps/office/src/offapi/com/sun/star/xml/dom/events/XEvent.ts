/** @fileoverview Complete original XEvent.idl contract and normal CPPUMaker binding for native DOM events/views. */
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
import type { OUString, OUStringConstReference } from "../../../../../../../sal/inc/rtl/ustring";
import type { XEventTarget } from "./XEventTarget";
import type { PhaseType } from "./PhaseType";
import type { Time } from "../../../util/Time";
/** Original direct base and complete declared methods. */
export interface XEvent extends XInterface {
  /** Original XEvent::getType.  @returns Original string result. */
  getType(): OUString;
  /** Original XEvent::getTarget.  @returns Original XEventTarget result. */
  getTarget(): Reference<XEventTarget>;
  /** Original XEvent::getCurrentTarget.  @returns Original XEventTarget result. */
  getCurrentTarget(): Reference<XEventTarget>;
  /** Original XEvent::getEventPhase.  @returns Original PhaseType result. */
  getEventPhase(): PhaseType;
  /** Original XEvent::getBubbles.  @returns Original boolean result. */
  getBubbles(): boolean;
  /** Original XEvent::getCancelable.  @returns Original boolean result. */
  getCancelable(): boolean;
  /** Original XEvent::getTimeStamp.  @returns Original com::sun::star::util::Time result. */
  getTimeStamp(): Time;
  /** Original XEvent::stopPropagation.  @returns Original void result. */
  stopPropagation(): void;
  /** Original XEvent::preventDefault.  @returns Original void result. */
  preventDefault(): void;
  /** Original XEvent::initEvent. @param eventTypeArg - Original borrowed string input. @param canBubbleArg - Original borrowed boolean input. @param cancelableArg - Original borrowed boolean input. @returns Original void result. */
  initEvent(
    eventTypeArg: OUStringConstReference,
    canBubbleArg: boolean,
    cancelableArg: boolean,
  ): void;
}
const the_type: [R | null] = [null];
/** Original normal generated getter retains its implicit root or explicit direct base through the existing CPPU factory. @returns Borrowed cached type. */
export function cppu_detail_getUnoType(): Type {
  if (the_type[0] === null)
    typelib_static_mi_interface_type_init(
      the_type,
      new TextEncoder().encode("com.sun.star.xml.dom.events.XEvent\0"),
      0,
      null,
    );
  return getTypeFromTypeDescriptionReference(the_type);
}
/** Original deprecated Reference pointer overload. @param reference - Ignored declared pointer. @returns Borrowed type. */
export function getCppuType(reference?: Reference<XEvent> | null): Type {
  void reference;
  return UnoType.get(["Reference", cppu_detail_getUnoType]);
}
/** Original generated interface static API. */
export const XEvent = Object.freeze({
  /** Original ignored void pointer overload. @param unused - Ignored source pointer. @returns Borrowed type. */
  static_type(unused?: unknown): Type {
    void unused;
    return UnoType.get(cppu_detail_getUnoType);
  },
});
