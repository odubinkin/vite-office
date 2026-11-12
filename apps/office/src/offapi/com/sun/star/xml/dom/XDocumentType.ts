/** @fileoverview Complete original XDocumentType.idl declarations and normal CPPUMaker type binding; DOM/parser behavior belongs to actual native component owners. */
import type { Reference } from "../../../../../../cppu/inc/com/sun/star/uno/Reference";
import type { Type } from "../../../../../../cppu/inc/com/sun/star/uno/Type";
import { UnoType, getTypeFromTypeDescriptionReference } from "../../../../../../cppu/inc/unotype";
import {
  typelib_static_mi_interface_type_init,
  type typelib_TypeDescriptionReference as R,
} from "../../../../../../cppu/inc/typelib/typedescription";
import { XNode } from "./XNode";
import type { XNamedNodeMap } from "./XNamedNodeMap";
import type { OUString } from "../../../../../../sal/inc/rtl/ustring";
/** Original direct base and complete declared methods; no replacement component is provided. */
export interface XDocumentType extends XNode {
  /** Original XDocumentType::getEntities.  @returns Original XNamedNodeMap result. */
  getEntities(): Reference<XNamedNodeMap>;
  /** Original XDocumentType::getInternalSubset.  @returns Original string result. */
  getInternalSubset(): OUString;
  /** Original XDocumentType::getName.  @returns Original string result. */
  getName(): OUString;
  /** Original XDocumentType::getNotations.  @returns Original XNamedNodeMap result. */
  getNotations(): Reference<XNamedNodeMap>;
  /** Original XDocumentType::getPublicId.  @returns Original string result. */
  getPublicId(): OUString;
  /** Original XDocumentType::getSystemId.  @returns Original string result. */
  getSystemId(): OUString;
}
const the_type: [R | null] = [null];
/** Original normal generated getter retains its implicit root or explicit direct base through the existing CPPU factory. @returns Borrowed cached type. */
export function cppu_detail_getUnoType(): Type {
  if (the_type[0] === null)
    typelib_static_mi_interface_type_init(
      the_type,
      new TextEncoder().encode("com.sun.star.xml.dom.XDocumentType\0"),
      1,
      [XNode.static_type().getTypeLibType() as R],
    );
  return getTypeFromTypeDescriptionReference(the_type);
}
/** Original deprecated Reference pointer overload. @param reference - Ignored declared pointer. @returns Borrowed type. */
export function getCppuType(reference?: Reference<XDocumentType> | null): Type {
  void reference;
  return UnoType.get(["Reference", cppu_detail_getUnoType]);
}
/** Original generated interface static API. */
export const XDocumentType = Object.freeze({
  /** Original ignored void pointer overload. @param unused - Ignored source pointer. @returns Borrowed type. */
  static_type(unused?: unknown): Type {
    void unused;
    return UnoType.get(cppu_detail_getUnoType);
  },
});
