/** @fileoverview Original XDocumentHandler IDL and normal generated CPPUMaker type binding; actual component owners supply the declared methods. */
import type { Reference } from "../../../../../../cppu/inc/com/sun/star/uno/Reference";
import type { Type } from "../../../../../../cppu/inc/com/sun/star/uno/Type";
import { UnoType, getTypeFromTypeDescriptionReference } from "../../../../../../cppu/inc/unotype";
import {
  typelib_static_mi_interface_type_init,
  type typelib_TypeDescriptionReference as R,
} from "../../../../../../cppu/inc/typelib/typedescription";
import type { XInterface } from "../../../../../../cppu/inc/com/sun/star/uno/XInterface";
import type { OUStringConstReference } from "../../../../../../sal/inc/rtl/ustring";
import type { XAttributeList } from "./XAttributeList";
import type { XLocator } from "./XLocator";
/** Complete original declared interface. */
export interface XDocumentHandler extends XInterface {
  /** Begins document. @returns Nothing. */ startDocument(): void;
  /** Ends document. @returns Nothing. */ endDocument(): void;
  /** Begins element. @param name - Qualified name. @param attributes - Actual list. @returns Nothing. */ startElement(
    name: OUStringConstReference,
    attributes: Reference<XAttributeList>,
  ): void;
  /** Ends element. @param name - Qualified name. @returns Nothing. */ endElement(
    name: OUStringConstReference,
  ): void;
  /** Receives text. @param text - Text. @returns Nothing. */ characters(
    text: OUStringConstReference,
  ): void;
  /** Receives ignorable spacing. @param text - Spacing. @returns Nothing. */ ignorableWhitespace(
    text: OUStringConstReference,
  ): void;
  /** Receives PI. @param target - Target. @param data - Data. @returns Nothing. */ processingInstruction(
    target: OUStringConstReference,
    data: OUStringConstReference,
  ): void;
  /** Receives origin locator. @param locator - Locator. @returns Nothing. */ setDocumentLocator(
    locator: Reference<XLocator>,
  ): void;
}
const the_type: [R | null] = [null];
/** Original normal generated getter retains its implicit root or explicit direct base through the existing CPPU factory. @returns Borrowed cached type. */
export function cppu_detail_getUnoType(): Type {
  if (the_type[0] === null)
    typelib_static_mi_interface_type_init(
      the_type,
      new TextEncoder().encode("com.sun.star.xml.sax.XDocumentHandler\0"),
      0,
      null,
    );
  return getTypeFromTypeDescriptionReference(the_type);
}
/** Original deprecated Reference pointer overload. @param reference - Ignored declared pointer. @returns Borrowed type. */
export function getCppuType(reference?: Reference<XDocumentHandler> | null): Type {
  void reference;
  return UnoType.get(["Reference", cppu_detail_getUnoType]);
}
/** Original generated interface static API. */
export const XDocumentHandler = Object.freeze({
  /** Original ignored void pointer overload. @param unused - Ignored source pointer. @returns Borrowed type. */
  static_type(unused?: unknown): Type {
    void unused;
    return UnoType.get(cppu_detail_getUnoType);
  },
});

/** Caller borrows exactly the five callbacks used by plain manifest export; no other handler implementation is manufactured. */
export type ManifestDocumentHandler = Pick<
  XDocumentHandler,
  "startDocument" | "endDocument" | "startElement" | "endElement" | "ignorableWhitespace"
>;
