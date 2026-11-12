/** @fileoverview Complete original XDOMImplementation.idl declarations and normal CPPUMaker type binding; DOM/parser behavior belongs to actual native component owners. */
import type { Reference } from "../../../../../../cppu/inc/com/sun/star/uno/Reference";
import type { Type } from "../../../../../../cppu/inc/com/sun/star/uno/Type";
import { UnoType, getTypeFromTypeDescriptionReference } from "../../../../../../cppu/inc/unotype";
import {
  typelib_static_mi_interface_type_init,
  type typelib_TypeDescriptionReference as R,
} from "../../../../../../cppu/inc/typelib/typedescription";
import type { XInterface } from "../../../../../../cppu/inc/com/sun/star/uno/XInterface";
import type { OUStringConstReference } from "../../../../../../sal/inc/rtl/ustring";
import type { XDocumentType } from "./XDocumentType";
import type { XDocument } from "./XDocument";
/** Original direct base and complete declared methods; no replacement component is provided. */
export interface XDOMImplementation extends XInterface {
  /** Original XDOMImplementation::createDocument. @param namespaceURI - Original borrowed string input. @param qualifiedName - Original borrowed string input. @param doctype - Original borrowed XDocumentType input. @returns Original XDocument result. @throws Original raises (DOMException). */
  createDocument(
    namespaceURI: OUStringConstReference,
    qualifiedName: OUStringConstReference,
    doctype: Reference<XDocumentType>,
  ): Reference<XDocument>;
  /** Original XDOMImplementation::createDocumentType. @param qualifiedName - Original borrowed string input. @param publicId - Original borrowed string input. @param systemId - Original borrowed string input. @returns Original XDocumentType result. @throws Original raises (DOMException). */
  createDocumentType(
    qualifiedName: OUStringConstReference,
    publicId: OUStringConstReference,
    systemId: OUStringConstReference,
  ): Reference<XDocumentType>;
  /** Original XDOMImplementation::hasFeature. @param feature - Original borrowed string input. @param ver - Original borrowed string input. @returns Original boolean result. */
  hasFeature(feature: OUStringConstReference, ver: OUStringConstReference): boolean;
}
const the_type: [R | null] = [null];
/** Original normal generated getter retains its implicit root or explicit direct base through the existing CPPU factory. @returns Borrowed cached type. */
export function cppu_detail_getUnoType(): Type {
  if (the_type[0] === null)
    typelib_static_mi_interface_type_init(
      the_type,
      new TextEncoder().encode("com.sun.star.xml.dom.XDOMImplementation\0"),
      0,
      null,
    );
  return getTypeFromTypeDescriptionReference(the_type);
}
/** Original deprecated Reference pointer overload. @param reference - Ignored declared pointer. @returns Borrowed type. */
export function getCppuType(reference?: Reference<XDOMImplementation> | null): Type {
  void reference;
  return UnoType.get(["Reference", cppu_detail_getUnoType]);
}
/** Original generated interface static API. */
export const XDOMImplementation = Object.freeze({
  /** Original ignored void pointer overload. @param unused - Ignored source pointer. @returns Borrowed type. */
  static_type(unused?: unknown): Type {
    void unused;
    return UnoType.get(cppu_detail_getUnoType);
  },
});
