/** @fileoverview Complete original XNode.idl declarations and normal CPPUMaker type binding; DOM/parser behavior belongs to actual native component owners. */
import type { Reference } from "../../../../../../cppu/inc/com/sun/star/uno/Reference";
import type { Type } from "../../../../../../cppu/inc/com/sun/star/uno/Type";
import { UnoType, getTypeFromTypeDescriptionReference } from "../../../../../../cppu/inc/unotype";
import {
  typelib_static_mi_interface_type_init,
  type typelib_TypeDescriptionReference as R,
} from "../../../../../../cppu/inc/typelib/typedescription";
import type { XInterface } from "../../../../../../cppu/inc/com/sun/star/uno/XInterface";
import type { XNamedNodeMap } from "./XNamedNodeMap";
import type { XNodeList } from "./XNodeList";
import type { OUString, OUStringConstReference } from "../../../../../../sal/inc/rtl/ustring";
import type { NodeType } from "./NodeType";
import type { XDocument } from "./XDocument";
/** Original direct base and complete declared methods; no replacement component is provided. */
export interface XNode extends XInterface {
  /** Original XNode::appendChild. @param newChild - Original borrowed XNode input. @returns Original XNode result. @throws Original raises (DOMException). */
  appendChild(newChild: Reference<XNode>): Reference<XNode>;
  /** Original XNode::cloneNode. @param deep - Original borrowed boolean input. @returns Original XNode result. */
  cloneNode(deep: boolean): Reference<XNode>;
  /** Original XNode::getAttributes.  @returns Original XNamedNodeMap result. */
  getAttributes(): Reference<XNamedNodeMap>;
  /** Original XNode::getChildNodes.  @returns Original XNodeList result. */
  getChildNodes(): Reference<XNodeList>;
  /** Original XNode::getFirstChild.  @returns Original XNode result. */
  getFirstChild(): Reference<XNode>;
  /** Original XNode::getLastChild.  @returns Original XNode result. */
  getLastChild(): Reference<XNode>;
  /** Original XNode::getLocalName.  @returns Original string result. */
  getLocalName(): OUString;
  /** Original XNode::getNamespaceURI.  @returns Original string result. */
  getNamespaceURI(): OUString;
  /** Original XNode::getNextSibling.  @returns Original XNode result. */
  getNextSibling(): Reference<XNode>;
  /** Original XNode::getNodeName.  @returns Original string result. */
  getNodeName(): OUString;
  /** Original XNode::getNodeType.  @returns Original NodeType result. */
  getNodeType(): NodeType;
  /** Original XNode::getNodeValue.  @returns Original string result. @throws Original raises (DOMException). */
  getNodeValue(): OUString;
  /** Original XNode::getOwnerDocument.  @returns Original XDocument result. */
  getOwnerDocument(): Reference<XDocument>;
  /** Original XNode::getParentNode.  @returns Original XNode result. */
  getParentNode(): Reference<XNode>;
  /** Original XNode::getPrefix.  @returns Original string result. */
  getPrefix(): OUString;
  /** Original XNode::getPreviousSibling.  @returns Original XNode result. */
  getPreviousSibling(): Reference<XNode>;
  /** Original XNode::hasAttributes.  @returns Original boolean result. */
  hasAttributes(): boolean;
  /** Original XNode::hasChildNodes.  @returns Original boolean result. */
  hasChildNodes(): boolean;
  /** Original XNode::insertBefore. @param newChild - Original borrowed XNode input. @param refChild - Original borrowed XNode input. @returns Original XNode result. @throws Original raises (DOMException). */
  insertBefore(newChild: Reference<XNode>, refChild: Reference<XNode>): Reference<XNode>;
  /** Original XNode::isSupported. @param feature - Original borrowed string input. @param ver - Original borrowed string input. @returns Original boolean result. */
  isSupported(feature: OUStringConstReference, ver: OUStringConstReference): boolean;
  /** Original XNode::normalize.  @returns Original void result. */
  normalize(): void;
  /** Original XNode::removeChild. @param oldChild - Original borrowed XNode input. @returns Original XNode result. @throws Original raises (DOMException). */
  removeChild(oldChild: Reference<XNode>): Reference<XNode>;
  /** Original XNode::replaceChild. @param newChild - Original borrowed XNode input. @param oldChild - Original borrowed XNode input. @returns Original XNode result. @throws Original raises (DOMException). */
  replaceChild(newChild: Reference<XNode>, oldChild: Reference<XNode>): Reference<XNode>;
  /** Original XNode::setNodeValue. @param nodeValue - Original borrowed string input. @returns Original void result. @throws Original raises (DOMException). */
  setNodeValue(nodeValue: OUStringConstReference): void;
  /** Original XNode::setPrefix. @param prefix - Original borrowed string input. @returns Original void result. @throws Original raises (DOMException). */
  setPrefix(prefix: OUStringConstReference): void;
}
const the_type: [R | null] = [null];
/** Original normal generated getter retains its implicit root or explicit direct base through the existing CPPU factory. @returns Borrowed cached type. */
export function cppu_detail_getUnoType(): Type {
  if (the_type[0] === null)
    typelib_static_mi_interface_type_init(
      the_type,
      new TextEncoder().encode("com.sun.star.xml.dom.XNode\0"),
      0,
      null,
    );
  return getTypeFromTypeDescriptionReference(the_type);
}
/** Original deprecated Reference pointer overload. @param reference - Ignored declared pointer. @returns Borrowed type. */
export function getCppuType(reference?: Reference<XNode> | null): Type {
  void reference;
  return UnoType.get(["Reference", cppu_detail_getUnoType]);
}
/** Original generated interface static API. */
export const XNode = Object.freeze({
  /** Original ignored void pointer overload. @param unused - Ignored source pointer. @returns Borrowed type. */
  static_type(unused?: unknown): Type {
    void unused;
    return UnoType.get(cppu_detail_getUnoType);
  },
});
