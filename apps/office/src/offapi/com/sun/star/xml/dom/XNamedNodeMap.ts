/** @fileoverview Complete original XNamedNodeMap.idl declarations and normal CPPUMaker type binding; DOM/parser behavior belongs to actual native component owners. */
import type { Reference } from "../../../../../../cppu/inc/com/sun/star/uno/Reference";
import type { Type } from "../../../../../../cppu/inc/com/sun/star/uno/Type";
import { UnoType, getTypeFromTypeDescriptionReference } from "../../../../../../cppu/inc/unotype";
import {
  typelib_static_mi_interface_type_init,
  type typelib_TypeDescriptionReference as R,
} from "../../../../../../cppu/inc/typelib/typedescription";
import type { XInterface } from "../../../../../../cppu/inc/com/sun/star/uno/XInterface";
import type { OUStringConstReference } from "../../../../../../sal/inc/rtl/ustring";
import type { XNode } from "./XNode";
/** Original direct base and complete declared methods; no replacement component is provided. */
export interface XNamedNodeMap extends XInterface {
  /** Original XNamedNodeMap::getLength.  @returns Original long result. */
  getLength(): number;
  /** Original XNamedNodeMap::getNamedItem. @param name - Original borrowed string input. @returns Original XNode result. */
  getNamedItem(name: OUStringConstReference): Reference<XNode>;
  /** Original XNamedNodeMap::getNamedItemNS. @param namespaceURI - Original borrowed string input. @param localName - Original borrowed string input. @returns Original XNode result. */
  getNamedItemNS(
    namespaceURI: OUStringConstReference,
    localName: OUStringConstReference,
  ): Reference<XNode>;
  /** Original XNamedNodeMap::item. @param index - Original borrowed long input. @returns Original XNode result. */
  item(index: number): Reference<XNode>;
  /** Original XNamedNodeMap::removeNamedItem. @param name - Original borrowed string input. @returns Original XNode result. @throws Original raises (DOMException). */
  removeNamedItem(name: OUStringConstReference): Reference<XNode>;
  /** Original XNamedNodeMap::removeNamedItemNS. @param namespaceURI - Original borrowed string input. @param localName - Original borrowed string input. @returns Original XNode result. @throws Original raises (DOMException). */
  removeNamedItemNS(
    namespaceURI: OUStringConstReference,
    localName: OUStringConstReference,
  ): Reference<XNode>;
  /** Original XNamedNodeMap::setNamedItem. @param arg - Original borrowed XNode input. @returns Original XNode result. @throws Original raises (DOMException). */
  setNamedItem(arg: Reference<XNode>): Reference<XNode>;
  /** Original XNamedNodeMap::setNamedItemNS. @param arg - Original borrowed XNode input. @returns Original XNode result. @throws Original raises (DOMException). */
  setNamedItemNS(arg: Reference<XNode>): Reference<XNode>;
}
const the_type: [R | null] = [null];
/** Original normal generated getter retains its implicit root or explicit direct base through the existing CPPU factory. @returns Borrowed cached type. */
export function cppu_detail_getUnoType(): Type {
  if (the_type[0] === null)
    typelib_static_mi_interface_type_init(
      the_type,
      new TextEncoder().encode("com.sun.star.xml.dom.XNamedNodeMap\0"),
      0,
      null,
    );
  return getTypeFromTypeDescriptionReference(the_type);
}
/** Original deprecated Reference pointer overload. @param reference - Ignored declared pointer. @returns Borrowed type. */
export function getCppuType(reference?: Reference<XNamedNodeMap> | null): Type {
  void reference;
  return UnoType.get(["Reference", cppu_detail_getUnoType]);
}
/** Original generated interface static API. */
export const XNamedNodeMap = Object.freeze({
  /** Original ignored void pointer overload. @param unused - Ignored source pointer. @returns Borrowed type. */
  static_type(unused?: unknown): Type {
    void unused;
    return UnoType.get(cppu_detail_getUnoType);
  },
});
