/** @fileoverview Complete original XDocumentBuilder.idl declarations and normal CPPUMaker type binding; DOM/parser behavior belongs to actual native component owners. */
import type { Reference } from "../../../../../../cppu/inc/com/sun/star/uno/Reference";
import type { Type } from "../../../../../../cppu/inc/com/sun/star/uno/Type";
import { UnoType, getTypeFromTypeDescriptionReference } from "../../../../../../cppu/inc/unotype";
import {
  typelib_static_mi_interface_type_init,
  type typelib_TypeDescriptionReference as R,
} from "../../../../../../cppu/inc/typelib/typedescription";
import type { XInterface } from "../../../../../../cppu/inc/com/sun/star/uno/XInterface";
import type { XDOMImplementation } from "./XDOMImplementation";
import type { XDocument } from "./XDocument";
import type { XInputStream } from "../../../../../../udkapi/com/sun/star/io/XInputStream";
import type { OUStringConstReference } from "../../../../../../sal/inc/rtl/ustring";
import type { XEntityResolver } from "../sax/XEntityResolver";
import type { XErrorHandler } from "../sax/XErrorHandler";
/** Original direct base and complete declared methods; no replacement component is provided. */
export interface XDocumentBuilder extends XInterface {
  /** Original XDocumentBuilder::getDOMImplementation.  @returns Original XDOMImplementation result. */
  getDOMImplementation(): Reference<XDOMImplementation>;
  /** Original XDocumentBuilder::isNamespaceAware.  @returns Original boolean result. */
  isNamespaceAware(): boolean;
  /** Original XDocumentBuilder::isValidating.  @returns Original boolean result. */
  isValidating(): boolean;
  /** Original XDocumentBuilder::newDocument.  @returns Original XDocument result. */
  newDocument(): Reference<XDocument>;
  /** Original XDocumentBuilder::parse. @param input - Original borrowed com::sun::star::io::XInputStream input. @returns Original XDocument result. @throws Original raises( com::sun::star::xml::sax::SAXException, com::sun::star::io::IOException ). */
  parse(input: Reference<XInputStream>): Reference<XDocument>;
  /** Original XDocumentBuilder::parseURI. @param uri - Original borrowed string input. @returns Original XDocument result. @throws Original raises( com::sun::star::xml::sax::SAXException, com::sun::star::io::IOException ). */
  parseURI(uri: OUStringConstReference): Reference<XDocument>;
  /** Original XDocumentBuilder::setEntityResolver. @param er - Original borrowed com::sun::star::xml::sax::XEntityResolver input. @returns Original void result. */
  setEntityResolver(er: Reference<XEntityResolver>): void;
  /** Original XDocumentBuilder::setErrorHandler. @param eh - Original borrowed com::sun::star::xml::sax::XErrorHandler input. @returns Original void result. */
  setErrorHandler(eh: Reference<XErrorHandler>): void;
}
const the_type: [R | null] = [null];
/** Original normal generated getter retains its implicit root or explicit direct base through the existing CPPU factory. @returns Borrowed cached type. */
export function cppu_detail_getUnoType(): Type {
  if (the_type[0] === null)
    typelib_static_mi_interface_type_init(
      the_type,
      new TextEncoder().encode("com.sun.star.xml.dom.XDocumentBuilder\0"),
      0,
      null,
    );
  return getTypeFromTypeDescriptionReference(the_type);
}
/** Original deprecated Reference pointer overload. @param reference - Ignored declared pointer. @returns Borrowed type. */
export function getCppuType(reference?: Reference<XDocumentBuilder> | null): Type {
  void reference;
  return UnoType.get(["Reference", cppu_detail_getUnoType]);
}
/** Original generated interface static API. */
export const XDocumentBuilder = Object.freeze({
  /** Original ignored void pointer overload. @param unused - Ignored source pointer. @returns Borrowed type. */
  static_type(unused?: unknown): Type {
    void unused;
    return UnoType.get(cppu_detail_getUnoType);
  },
});
