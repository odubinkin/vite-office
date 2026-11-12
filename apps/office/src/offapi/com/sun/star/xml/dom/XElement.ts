/** @fileoverview Complete original XElement.idl declarations and normal CPPUMaker type binding; DOM/parser behavior belongs to actual native component owners. */
import type { Reference } from "../../../../../../cppu/inc/com/sun/star/uno/Reference";
import type { Type } from "../../../../../../cppu/inc/com/sun/star/uno/Type";
import { UnoType, getTypeFromTypeDescriptionReference } from "../../../../../../cppu/inc/unotype";
import {
  typelib_static_mi_interface_type_init,
  type typelib_TypeDescriptionReference as R,
} from "../../../../../../cppu/inc/typelib/typedescription";
import { XNode } from "./XNode";
import type { OUString, OUStringConstReference } from "../../../../../../sal/inc/rtl/ustring";
import type { XAttr } from "./XAttr";
import type { XNodeList } from "./XNodeList";
/** Original direct base and complete declared methods; no replacement component is provided. */
export interface XElement extends XNode {
  /** Original XElement::getAttribute. @param name - Original borrowed string input. @returns Original string result. */
  getAttribute(name: OUStringConstReference): OUString;
  /** Original XElement::getAttributeNode. @param name - Original borrowed string input. @returns Original XAttr result. */
  getAttributeNode(name: OUStringConstReference): Reference<XAttr>;
  /** Original XElement::getAttributeNodeNS. @param namespaceURI - Original borrowed string input. @param localName - Original borrowed string input. @returns Original XAttr result. */
  getAttributeNodeNS(
    namespaceURI: OUStringConstReference,
    localName: OUStringConstReference,
  ): Reference<XAttr>;
  /** Original XElement::getAttributeNS. @param namespaceURI - Original borrowed string input. @param localName - Original borrowed string input. @returns Original string result. */
  getAttributeNS(namespaceURI: OUStringConstReference, localName: OUStringConstReference): OUString;
  /** Original XElement::getElementsByTagName. @param name - Original borrowed string input. @returns Original XNodeList result. */
  getElementsByTagName(name: OUStringConstReference): Reference<XNodeList>;
  /** Original XElement::getElementsByTagNameNS. @param namespaceURI - Original borrowed string input. @param localName - Original borrowed string input. @returns Original XNodeList result. */
  getElementsByTagNameNS(
    namespaceURI: OUStringConstReference,
    localName: OUStringConstReference,
  ): Reference<XNodeList>;
  /** Original XElement::getTagName.  @returns Original string result. */
  getTagName(): OUString;
  /** Original XElement::hasAttribute. @param name - Original borrowed string input. @returns Original boolean result. */
  hasAttribute(name: OUStringConstReference): boolean;
  /** Original XElement::hasAttributeNS. @param namespaceURI - Original borrowed string input. @param localName - Original borrowed string input. @returns Original boolean result. */
  hasAttributeNS(namespaceURI: OUStringConstReference, localName: OUStringConstReference): boolean;
  /** Original XElement::removeAttribute. @param name - Original borrowed string input. @returns Original void result. @throws Original raises (DOMException). */
  removeAttribute(name: OUStringConstReference): void;
  /** Original XElement::removeAttributeNode. @param oldAttr - Original borrowed XAttr input. @returns Original XAttr result. @throws Original raises (DOMException). */
  removeAttributeNode(oldAttr: Reference<XAttr>): Reference<XAttr>;
  /** Original XElement::removeAttributeNS. @param namespaceURI - Original borrowed string input. @param localName - Original borrowed string input. @returns Original void result. @throws Original raises (DOMException). */
  removeAttributeNS(namespaceURI: OUStringConstReference, localName: OUStringConstReference): void;
  /** Original XElement::setAttribute. @param name - Original borrowed string input. @param value - Original borrowed string input. @returns Original void result. @throws Original raises (DOMException). */
  setAttribute(name: OUStringConstReference, value: OUStringConstReference): void;
  /** Original XElement::setAttributeNode. @param newAttr - Original borrowed XAttr input. @returns Original XAttr result. @throws Original raises (DOMException). */
  setAttributeNode(newAttr: Reference<XAttr>): Reference<XAttr>;
  /** Original XElement::setAttributeNodeNS. @param newAttr - Original borrowed XAttr input. @returns Original XAttr result. @throws Original raises (DOMException). */
  setAttributeNodeNS(newAttr: Reference<XAttr>): Reference<XAttr>;
  /** Original XElement::setAttributeNS. @param namespaceURI - Original borrowed string input. @param qualifiedName - Original borrowed string input. @param value - Original borrowed string input. @returns Original void result. @throws Original raises (DOMException). */
  setAttributeNS(
    namespaceURI: OUStringConstReference,
    qualifiedName: OUStringConstReference,
    value: OUStringConstReference,
  ): void;
}
const the_type: [R | null] = [null];
/** Original normal generated getter retains its implicit root or explicit direct base through the existing CPPU factory. @returns Borrowed cached type. */
export function cppu_detail_getUnoType(): Type {
  if (the_type[0] === null)
    typelib_static_mi_interface_type_init(
      the_type,
      new TextEncoder().encode("com.sun.star.xml.dom.XElement\0"),
      1,
      [XNode.static_type().getTypeLibType() as R],
    );
  return getTypeFromTypeDescriptionReference(the_type);
}
/** Original deprecated Reference pointer overload. @param reference - Ignored declared pointer. @returns Borrowed type. */
export function getCppuType(reference?: Reference<XElement> | null): Type {
  void reference;
  return UnoType.get(["Reference", cppu_detail_getUnoType]);
}
/** Original generated interface static API. */
export const XElement = Object.freeze({
  /** Original ignored void pointer overload. @param unused - Ignored source pointer. @returns Borrowed type. */
  static_type(unused?: unknown): Type {
    void unused;
    return UnoType.get(cppu_detail_getUnoType);
  },
});
