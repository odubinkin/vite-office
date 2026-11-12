/** @fileoverview Original XExtendedDocumentHandler IDL and normal generated CPPUMaker type binding; actual component owners supply the declared methods. */
import type { Reference } from "../../../../../../cppu/inc/com/sun/star/uno/Reference";
import type { Type } from "../../../../../../cppu/inc/com/sun/star/uno/Type";
import { UnoType, getTypeFromTypeDescriptionReference } from "../../../../../../cppu/inc/unotype";
import {
  typelib_static_mi_interface_type_init,
  type typelib_TypeDescriptionReference as R,
} from "../../../../../../cppu/inc/typelib/typedescription";
import { XDocumentHandler } from "./XDocumentHandler";
import type { OUStringConstReference } from "../../../../../../sal/inc/rtl/ustring";
/** Complete original declared interface. */
export interface XExtendedDocumentHandler extends XDocumentHandler {
  /** Original CDATA begin. @returns Nothing. */ startCDATA(): void;
  /** Original CDATA end. @returns Nothing. */ endCDATA(): void;
  /** Original comment. @param text - Comment text. @returns Nothing. */ comment(
    text: OUStringConstReference,
  ): void;
  /** Original optional writer line break. @returns Nothing. */ allowLineBreak(): void;
  /** Original uninterpreted content. @param text - Content. @returns Nothing. */ unknown(
    text: OUStringConstReference,
  ): void;
}
const the_type: [R | null] = [null];
/** Original normal generated getter retains its implicit root or explicit direct base through the existing CPPU factory. @returns Borrowed cached type. */
export function cppu_detail_getUnoType(): Type {
  if (the_type[0] === null)
    typelib_static_mi_interface_type_init(
      the_type,
      new TextEncoder().encode("com.sun.star.xml.sax.XExtendedDocumentHandler\0"),
      1,
      [XDocumentHandler.static_type().getTypeLibType() as R],
    );
  return getTypeFromTypeDescriptionReference(the_type);
}
/** Original deprecated Reference pointer overload. @param reference - Ignored declared pointer. @returns Borrowed type. */
export function getCppuType(reference?: Reference<XExtendedDocumentHandler> | null): Type {
  void reference;
  return UnoType.get(["Reference", cppu_detail_getUnoType]);
}
/** Original generated interface static API. */
export const XExtendedDocumentHandler = Object.freeze({
  /** Original ignored void pointer overload. @param unused - Ignored source pointer. @returns Borrowed type. */
  static_type(unused?: unknown): Type {
    void unused;
    return UnoType.get(cppu_detail_getUnoType);
  },
});
