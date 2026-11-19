/** @fileoverview Complete original XFastDocumentHandler.idl methods and normal CPPUMaker static type binding; actual source components supply behavior. */
import type { Reference } from "../../../../../../cppu/inc/com/sun/star/uno/Reference";
import type { Type } from "../../../../../../cppu/inc/com/sun/star/uno/Type";
import { UnoType, getTypeFromTypeDescriptionReference } from "../../../../../../cppu/inc/unotype";
import {
  typelib_static_mi_interface_type_init,
  type typelib_TypeDescriptionReference as R,
} from "../../../../../../cppu/inc/typelib/typedescription";
import type { OUStringConstReference } from "../../../../../../sal/inc/rtl/ustring";
import { XFastContextHandler } from "./XFastContextHandler";
import type { XLocator } from "./XLocator";
/** Receives fast SAX document events and creates root contexts. */ export interface XFastDocumentHandler extends XFastContextHandler {
  /** Original startDocument contract. @returns Original declared result. */
  startDocument(): void;
  /** Original endDocument contract. @returns Original declared result. */
  endDocument(): void;
  /** Original processingInstruction contract. @param aTarget - Original declared argument. @param aData - Original declared argument. @returns Original declared result. */
  processingInstruction(aTarget: OUStringConstReference, aData: OUStringConstReference): void;
  /** Original setDocumentLocator contract. @param xLocator - Original declared argument. @returns Original declared result. */
  setDocumentLocator(xLocator: Reference<XLocator>): void;
}
const the_type: [R | null] = [null];
/** Original normal generated getter retains its implicit root or explicit direct base through the existing CPPU factory. @returns Borrowed cached type. */
export function cppu_detail_getUnoType(): Type {
  if (the_type[0] === null)
    typelib_static_mi_interface_type_init(
      the_type,
      new TextEncoder().encode("com.sun.star.xml.sax.XFastDocumentHandler\0"),
      1,
      [XFastContextHandler.static_type().getTypeLibType() as R],
    );
  return getTypeFromTypeDescriptionReference(the_type);
}
/** Original deprecated Reference pointer overload. @param reference - Ignored declared pointer. @returns Borrowed type. */
export function getCppuType(reference?: Reference<XFastDocumentHandler> | null): Type {
  void reference;
  return UnoType.get(["Reference", cppu_detail_getUnoType]);
}
/** Original generated interface static API. */
export const XFastDocumentHandler = Object.freeze({
  /** Original ignored void pointer overload. @param unused - Ignored source pointer. @returns Borrowed type. */
  static_type(unused?: unknown): Type {
    void unused;
    return UnoType.get(cppu_detail_getUnoType);
  },
});
