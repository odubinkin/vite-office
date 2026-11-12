/** @fileoverview Complete original XDocument.idl declarations and normal CPPUMaker type binding; DOM/parser behavior belongs to actual native component owners. */
import type { Reference } from "../../../../../../cppu/inc/com/sun/star/uno/Reference";
import type { Type } from "../../../../../../cppu/inc/com/sun/star/uno/Type";
import { UnoType, getTypeFromTypeDescriptionReference } from "../../../../../../cppu/inc/unotype";
import {
  typelib_static_mi_interface_type_init,
  type typelib_TypeDescriptionReference as R,
} from "../../../../../../cppu/inc/typelib/typedescription";
import { XNode } from "./XNode";
import type { OUStringConstReference } from "../../../../../../sal/inc/rtl/ustring";
import type { XAttr } from "./XAttr";
import type { XCDATASection } from "./XCDATASection";
import type { XComment } from "./XComment";
import type { XDocumentFragment } from "./XDocumentFragment";
import type { XElement } from "./XElement";
import type { XEntityReference } from "./XEntityReference";
import type { XProcessingInstruction } from "./XProcessingInstruction";
import type { XText } from "./XText";
import type { XDocumentType } from "./XDocumentType";
import type { XNodeList } from "./XNodeList";
import type { XDOMImplementation } from "./XDOMImplementation";
/** Original direct base and complete declared methods; no replacement component is provided. */
export interface XDocument extends XNode {
  /** Original XDocument::createAttribute. @param name - Original borrowed string input. @returns Original XAttr result. @throws Original raises (DOMException). */
  createAttribute(name: OUStringConstReference): Reference<XAttr>;
  /** Original XDocument::createAttributeNS. @param namespaceURI - Original borrowed string input. @param qualifiedName - Original borrowed string input. @returns Original XAttr result. @throws Original raises (DOMException). */
  createAttributeNS(
    namespaceURI: OUStringConstReference,
    qualifiedName: OUStringConstReference,
  ): Reference<XAttr>;
  /** Original XDocument::createCDATASection. @param data - Original borrowed string input. @returns Original XCDATASection result. @throws Original raises (DOMException). */
  createCDATASection(data: OUStringConstReference): Reference<XCDATASection>;
  /** Original XDocument::createComment. @param data - Original borrowed string input. @returns Original XComment result. */
  createComment(data: OUStringConstReference): Reference<XComment>;
  /** Original XDocument::createDocumentFragment.  @returns Original XDocumentFragment result. */
  createDocumentFragment(): Reference<XDocumentFragment>;
  /** Original XDocument::createElement. @param tagName - Original borrowed string input. @returns Original XElement result. @throws Original raises (DOMException). */
  createElement(tagName: OUStringConstReference): Reference<XElement>;
  /** Original XDocument::createElementNS. @param namespaceURI - Original borrowed string input. @param qualifiedName - Original borrowed string input. @returns Original XElement result. @throws Original raises (DOMException). */
  createElementNS(
    namespaceURI: OUStringConstReference,
    qualifiedName: OUStringConstReference,
  ): Reference<XElement>;
  /** Original XDocument::createEntityReference. @param name - Original borrowed string input. @returns Original XEntityReference result. @throws Original raises (DOMException). */
  createEntityReference(name: OUStringConstReference): Reference<XEntityReference>;
  /** Original XDocument::createProcessingInstruction. @param target - Original borrowed string input. @param data - Original borrowed string input. @returns Original XProcessingInstruction result. @throws Original raises (DOMException). */
  createProcessingInstruction(
    target: OUStringConstReference,
    data: OUStringConstReference,
  ): Reference<XProcessingInstruction>;
  /** Original XDocument::createTextNode. @param data - Original borrowed string input. @returns Original XText result. */
  createTextNode(data: OUStringConstReference): Reference<XText>;
  /** Original XDocument::getDoctype.  @returns Original XDocumentType result. */
  getDoctype(): Reference<XDocumentType>;
  /** Original XDocument::getDocumentElement.  @returns Original XElement result. */
  getDocumentElement(): Reference<XElement>;
  /** Original XDocument::getElementById. @param elementId - Original borrowed string input. @returns Original XElement result. */
  getElementById(elementId: OUStringConstReference): Reference<XElement>;
  /** Original XDocument::getElementsByTagName. @param tagname - Original borrowed string input. @returns Original XNodeList result. */
  getElementsByTagName(tagname: OUStringConstReference): Reference<XNodeList>;
  /** Original XDocument::getElementsByTagNameNS. @param namespaceURI - Original borrowed string input. @param localName - Original borrowed string input. @returns Original XNodeList result. */
  getElementsByTagNameNS(
    namespaceURI: OUStringConstReference,
    localName: OUStringConstReference,
  ): Reference<XNodeList>;
  /** Original XDocument::getImplementation.  @returns Original XDOMImplementation result. */
  getImplementation(): Reference<XDOMImplementation>;
  /** Original XDocument::importNode. @param importedNode - Original borrowed XNode input. @param deep - Original borrowed boolean input. @returns Original XNode result. @throws Original raises (DOMException). */
  importNode(importedNode: Reference<XNode>, deep: boolean): Reference<XNode>;
}
const the_type: [R | null] = [null];
/** Original normal generated getter retains its implicit root or explicit direct base through the existing CPPU factory. @returns Borrowed cached type. */
export function cppu_detail_getUnoType(): Type {
  if (the_type[0] === null)
    typelib_static_mi_interface_type_init(
      the_type,
      new TextEncoder().encode("com.sun.star.xml.dom.XDocument\0"),
      1,
      [XNode.static_type().getTypeLibType() as R],
    );
  return getTypeFromTypeDescriptionReference(the_type);
}
/** Original deprecated Reference pointer overload. @param reference - Ignored declared pointer. @returns Borrowed type. */
export function getCppuType(reference?: Reference<XDocument> | null): Type {
  void reference;
  return UnoType.get(["Reference", cppu_detail_getUnoType]);
}
/** Original generated interface static API. */
export const XDocument = Object.freeze({
  /** Original ignored void pointer overload. @param unused - Ignored source pointer. @returns Borrowed type. */
  static_type(unused?: unknown): Type {
    void unused;
    return UnoType.get(cppu_detail_getUnoType);
  },
});
