/** @fileoverview Complete original XEntityResolver.idl declarations and normal CPPUMaker type binding; DOM/parser behavior belongs to actual native component owners. */
import type { Reference } from "../../../../../../cppu/inc/com/sun/star/uno/Reference";
import type { Type } from "../../../../../../cppu/inc/com/sun/star/uno/Type";
import { UnoType, getTypeFromTypeDescriptionReference } from "../../../../../../cppu/inc/unotype";
import {
  typelib_static_mi_interface_type_init,
  type typelib_TypeDescriptionReference as R,
} from "../../../../../../cppu/inc/typelib/typedescription";
import type { XInterface } from "../../../../../../cppu/inc/com/sun/star/uno/XInterface";
import type { OUStringConstReference } from "../../../../../../sal/inc/rtl/ustring";
import type { InputSource } from "./InputSource";
/** Original direct base and complete declared methods; no replacement component is provided. */
export interface XEntityResolver extends XInterface {
  /** Original XEntityResolver::resolveEntity. @param sPublicId - Original borrowed string input. @param sSystemId - Original borrowed string input. @returns Original InputSource result. */
  resolveEntity(sPublicId: OUStringConstReference, sSystemId: OUStringConstReference): InputSource;
}
const the_type: [R | null] = [null];
/** Original normal generated getter retains its implicit root or explicit direct base through the existing CPPU factory. @returns Borrowed cached type. */
export function cppu_detail_getUnoType(): Type {
  if (the_type[0] === null)
    typelib_static_mi_interface_type_init(
      the_type,
      new TextEncoder().encode("com.sun.star.xml.sax.XEntityResolver\0"),
      0,
      null,
    );
  return getTypeFromTypeDescriptionReference(the_type);
}
/** Original deprecated Reference pointer overload. @param reference - Ignored declared pointer. @returns Borrowed type. */
export function getCppuType(reference?: Reference<XEntityResolver> | null): Type {
  void reference;
  return UnoType.get(["Reference", cppu_detail_getUnoType]);
}
/** Original generated interface static API. */
export const XEntityResolver = Object.freeze({
  /** Original ignored void pointer overload. @param unused - Ignored source pointer. @returns Borrowed type. */
  static_type(unused?: unknown): Type {
    void unused;
    return UnoType.get(cppu_detail_getUnoType);
  },
});
