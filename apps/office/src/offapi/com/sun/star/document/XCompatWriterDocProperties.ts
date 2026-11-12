/** @fileoverview Original XCompatWriterDocProperties IDL and normal generated CPPUMaker type binding; actual component owners supply the declared methods. */
import type { Reference } from "../../../../../cppu/inc/com/sun/star/uno/Reference";
import type { Type } from "../../../../../cppu/inc/com/sun/star/uno/Type";
import { UnoType, getTypeFromTypeDescriptionReference } from "../../../../../cppu/inc/unotype";
import {
  typelib_static_mi_interface_type_init,
  type typelib_TypeDescriptionReference as R,
} from "../../../../../cppu/inc/typelib/typedescription";
import type { OUString, OUStringConstReference } from "../../../../../sal/inc/rtl/ustring";
import type { XInterface } from "../../../../../cppu/inc/com/sun/star/uno/XInterface";

/** Complete original implicit-root interface; the commented document-properties base in IDL is not an inherited facet. */
export interface XCompatWriterDocProperties extends XInterface {
  /** Original Manager read. @returns Owned string. */ getManager(): OUString;
  /** Original Manager assignment. @param value - Borrowed value. @returns Nothing. */ setManager(
    value: OUStringConstReference,
  ): void;
  /** Original Category read. @returns Owned string. */ getCategory(): OUString;
  /** Original Category assignment. @param value - Borrowed value. @returns Nothing. */ setCategory(
    value: OUStringConstReference,
  ): void;
  /** Original Company read. @returns Owned string. */ getCompany(): OUString;
  /** Original Company assignment. @param value - Borrowed value. @returns Nothing. */ setCompany(
    value: OUStringConstReference,
  ): void;
}
const the_type: [R | null] = [null];
/** Original normal generated getter retains its implicit root or explicit direct base through the existing CPPU factory. @returns Borrowed cached type. */
export function cppu_detail_getUnoType(): Type {
  if (the_type[0] === null)
    typelib_static_mi_interface_type_init(
      the_type,
      new TextEncoder().encode("com.sun.star.document.XCompatWriterDocProperties\0"),
      0,
      null,
    );
  return getTypeFromTypeDescriptionReference(the_type);
}
/** Original deprecated Reference pointer overload. @param reference - Ignored declared pointer. @returns Borrowed type. */
export function getCppuType(reference?: Reference<XCompatWriterDocProperties> | null): Type {
  void reference;
  return UnoType.get(["Reference", cppu_detail_getUnoType]);
}
/** Original generated interface static API. */
export const XCompatWriterDocProperties = Object.freeze({
  /** Original ignored void pointer overload. @param unused - Ignored source pointer. @returns Borrowed type. */
  static_type(unused?: unknown): Type {
    void unused;
    return UnoType.get(cppu_detail_getUnoType);
  },
});
