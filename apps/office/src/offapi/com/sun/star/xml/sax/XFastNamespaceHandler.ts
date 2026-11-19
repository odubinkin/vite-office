/** @fileoverview Complete original XFastNamespaceHandler.idl methods and normal CPPUMaker static type binding; actual source components supply behavior. */
import type { Reference } from "../../../../../../cppu/inc/com/sun/star/uno/Reference";
import type { Type } from "../../../../../../cppu/inc/com/sun/star/uno/Type";
import { UnoType, getTypeFromTypeDescriptionReference } from "../../../../../../cppu/inc/unotype";
import {
  typelib_static_mi_interface_type_init,
  type typelib_TypeDescriptionReference as R,
} from "../../../../../../cppu/inc/typelib/typedescription";
import type { OUString, OUStringConstReference } from "../../../../../../sal/inc/rtl/ustring";
import type { XInterface } from "../../../../../../cppu/inc/com/sun/star/uno/XInterface";
/** Receives namespace declarations from the fast SAX parser. */ export interface XFastNamespaceHandler extends XInterface {
  /** Original registerNamespace contract. @param NamespacePrefix - Original declared argument. @param NamespaceURI - Original declared argument. @returns Original declared result. */
  registerNamespace(
    NamespacePrefix: OUStringConstReference,
    NamespaceURI: OUStringConstReference,
  ): void;
  /** Original getNamespaceURI contract. @param NamespacePrefix - Original declared argument. @returns Original declared result. */
  getNamespaceURI(NamespacePrefix: OUStringConstReference): OUString;
}
const the_type: [R | null] = [null];
/** Original normal generated getter retains its implicit root or explicit direct base through the existing CPPU factory. @returns Borrowed cached type. */
export function cppu_detail_getUnoType(): Type {
  if (the_type[0] === null)
    typelib_static_mi_interface_type_init(
      the_type,
      new TextEncoder().encode("com.sun.star.xml.sax.XFastNamespaceHandler\0"),
      0,
      null,
    );
  return getTypeFromTypeDescriptionReference(the_type);
}
/** Original deprecated Reference pointer overload. @param reference - Ignored declared pointer. @returns Borrowed type. */
export function getCppuType(reference?: Reference<XFastNamespaceHandler> | null): Type {
  void reference;
  return UnoType.get(["Reference", cppu_detail_getUnoType]);
}
/** Original generated interface static API. */
export const XFastNamespaceHandler = Object.freeze({
  /** Original ignored void pointer overload. @param unused - Ignored source pointer. @returns Borrowed type. */
  static_type(unused?: unknown): Type {
    void unused;
    return UnoType.get(cppu_detail_getUnoType);
  },
});
