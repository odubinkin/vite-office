/** @fileoverview Original XLocator IDL contract and cppumaker-normal static interface binding; concrete behavior is supplied by actual component owners. */
import type { OUString } from "../../../../../../sal/inc/rtl/ustring";
import type { Reference } from "../../../../../../cppu/inc/com/sun/star/uno/Reference";
import type { Type } from "../../../../../../cppu/inc/com/sun/star/uno/Type";
import { UnoType, getTypeFromTypeDescriptionReference } from "../../../../../../cppu/inc/unotype";
import {
  typelib_static_mi_interface_type_init,
  type typelib_TypeDescriptionReference as R,
} from "../../../../../../cppu/inc/typelib/typedescription";
import type { XInterface } from "../../../../../../cppu/inc/com/sun/star/uno/XInterface";
/** Complete original locator IDL methods. Concrete owners supply active parser positions and identifiers. */
export interface XLocator extends XInterface {
  /** Original column query. @returns Signed32 column. */ getColumnNumber(): number;
  /** Original line query. @returns Signed32 line. */ getLineNumber(): number;
  /** Original public ID value copy. @returns Owned string. */ getPublicId(): OUString;
  /** Original system ID value copy. @returns Owned string. */ getSystemId(): OUString;
}

const the_type: [R | null] = [null];
/** Original normal generated getter retains its implicit root or explicit direct base through the existing CPPU factory. @returns Borrowed cached type. */
export function cppu_detail_getUnoType(): Type {
  if (the_type[0] === null)
    typelib_static_mi_interface_type_init(
      the_type,
      new TextEncoder().encode("com.sun.star.xml.sax.XLocator\0"),
      0,
      null,
    );
  return getTypeFromTypeDescriptionReference(the_type);
}
/** Original deprecated Reference pointer overload. @param reference - Ignored declared pointer. @returns Borrowed type. */
export function getCppuType(reference?: Reference<XLocator> | null): Type {
  void reference;
  return UnoType.get(["Reference", cppu_detail_getUnoType]);
}
/** Original generated interface static API. */
export const XLocator = Object.freeze({
  /** Original ignored void pointer overload. @param unused - Ignored source pointer. @returns Borrowed type. */
  static_type(unused?: unknown): Type {
    void unused;
    return UnoType.get(cppu_detail_getUnoType);
  },
});
