/** @fileoverview Complete original XMutationEvent.idl contract and normal CPPUMaker binding for native DOM events/views. */
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
import type { XNode } from "../XNode";
import type { OUString, OUStringConstReference } from "../../../../../../../sal/inc/rtl/ustring";
import type { AttrChangeType } from "./AttrChangeType";
/** Original direct base and complete declared methods. */
export interface XMutationEvent extends XEvent {
  /** Original XMutationEvent::getRelatedNode.  @returns Original com::sun::star::xml::dom::XNode result. */
  getRelatedNode(): Reference<XNode>;
  /** Original XMutationEvent::getPrevValue.  @returns Original string result. */
  getPrevValue(): OUString;
  /** Original XMutationEvent::getNewValue.  @returns Original string result. */
  getNewValue(): OUString;
  /** Original XMutationEvent::getAttrName.  @returns Original string result. */
  getAttrName(): OUString;
  /** Original XMutationEvent::getAttrChange.  @returns Original AttrChangeType result. */
  getAttrChange(): AttrChangeType;
  /** Original XMutationEvent::initMutationEvent. @param typeArg - Original borrowed string input. @param canBubbleArg - Original borrowed boolean input. @param cancelableArg - Original borrowed boolean input. @param relatedNodeArg - Original borrowed com::sun::star::xml::dom::XNode input. @param prevValueArg - Original borrowed string input. @param newValueArg - Original borrowed string input. @param attrNameArg - Original borrowed string input. @param attrChangeArg - Original borrowed AttrChangeType input. @returns Original void result. */
  initMutationEvent(
    typeArg: OUStringConstReference,
    canBubbleArg: boolean,
    cancelableArg: boolean,
    relatedNodeArg: Reference<XNode>,
    prevValueArg: OUStringConstReference,
    newValueArg: OUStringConstReference,
    attrNameArg: OUStringConstReference,
    attrChangeArg: AttrChangeType,
  ): void;
}
const the_type: [R | null] = [null];
/** Original normal generated getter retains its implicit root or explicit direct base through the existing CPPU factory. @returns Borrowed cached type. */
export function cppu_detail_getUnoType(): Type {
  if (the_type[0] === null)
    typelib_static_mi_interface_type_init(
      the_type,
      new TextEncoder().encode("com.sun.star.xml.dom.events.XMutationEvent\0"),
      1,
      [XEvent.static_type().getTypeLibType() as R],
    );
  return getTypeFromTypeDescriptionReference(the_type);
}
/** Original deprecated Reference pointer overload. @param reference - Ignored declared pointer. @returns Borrowed type. */
export function getCppuType(reference?: Reference<XMutationEvent> | null): Type {
  void reference;
  return UnoType.get(["Reference", cppu_detail_getUnoType]);
}
/** Original generated interface static API. */
export const XMutationEvent = Object.freeze({
  /** Original ignored void pointer overload. @param unused - Ignored source pointer. @returns Borrowed type. */
  static_type(unused?: unknown): Type {
    void unused;
    return UnoType.get(cppu_detail_getUnoType);
  },
});
