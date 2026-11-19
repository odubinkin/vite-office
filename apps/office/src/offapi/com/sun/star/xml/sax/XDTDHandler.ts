/** @fileoverview Complete original XDTDHandler.idl methods and normal CPPUMaker static type binding; actual source components supply behavior. */
import type { Reference } from "../../../../../../cppu/inc/com/sun/star/uno/Reference";
import type { Type } from "../../../../../../cppu/inc/com/sun/star/uno/Type";
import { UnoType, getTypeFromTypeDescriptionReference } from "../../../../../../cppu/inc/unotype";
import {
  typelib_static_mi_interface_type_init,
  type typelib_TypeDescriptionReference as R,
} from "../../../../../../cppu/inc/typelib/typedescription";
import type { OUStringConstReference } from "../../../../../../sal/inc/rtl/ustring";
import type { XInterface } from "../../../../../../cppu/inc/com/sun/star/uno/XInterface";
/** Receives SAX notation and unparsed-entity declarations. */ export interface XDTDHandler extends XInterface {
  /** Original notationDecl contract. @param sName - Original declared argument. @param sPublicId - Original declared argument. @param sSystemId - Original declared argument. @returns Original declared result. */
  notationDecl(
    sName: OUStringConstReference,
    sPublicId: OUStringConstReference,
    sSystemId: OUStringConstReference,
  ): void;
  /** Original unparsedEntityDecl contract. @param sName - Original declared argument. @param sPublicId - Original declared argument. @param sSystemId - Original declared argument. @param sNotationName - Original declared argument. @returns Original declared result. */
  unparsedEntityDecl(
    sName: OUStringConstReference,
    sPublicId: OUStringConstReference,
    sSystemId: OUStringConstReference,
    sNotationName: OUStringConstReference,
  ): void;
}
const the_type: [R | null] = [null];
/** Original normal generated getter retains its implicit root or explicit direct base through the existing CPPU factory. @returns Borrowed cached type. */
export function cppu_detail_getUnoType(): Type {
  if (the_type[0] === null)
    typelib_static_mi_interface_type_init(
      the_type,
      new TextEncoder().encode("com.sun.star.xml.sax.XDTDHandler\0"),
      0,
      null,
    );
  return getTypeFromTypeDescriptionReference(the_type);
}
/** Original deprecated Reference pointer overload. @param reference - Ignored declared pointer. @returns Borrowed type. */
export function getCppuType(reference?: Reference<XDTDHandler> | null): Type {
  void reference;
  return UnoType.get(["Reference", cppu_detail_getUnoType]);
}
/** Original generated interface static API. */
export const XDTDHandler = Object.freeze({
  /** Original ignored void pointer overload. @param unused - Ignored source pointer. @returns Borrowed type. */
  static_type(unused?: unknown): Type {
    void unused;
    return UnoType.get(cppu_detail_getUnoType);
  },
});
