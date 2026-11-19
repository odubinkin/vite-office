/** @fileoverview Original XZipFileAccess.idl declaration and normal CPPUMaker multiple-interface binding. */
import type { Reference } from "../../../../../../cppu/inc/com/sun/star/uno/Reference";
import type { Type } from "../../../../../../cppu/inc/com/sun/star/uno/Type";
import { UnoType, getTypeFromTypeDescriptionReference } from "../../../../../../cppu/inc/unotype";
import {
  typelib_static_mi_interface_type_init,
  type typelib_TypeDescriptionReference as R,
} from "../../../../../../cppu/inc/typelib/typedescription";
import type { XInterface } from "../../../../../../cppu/inc/com/sun/star/uno/XInterface";
import type { XInputStream } from "../../../../../../udkapi/com/sun/star/io/XInputStream";
import type { OUStringConstReference } from "../../../../../../sal/inc/rtl/ustring";
/** Original complete ZIP pattern access declaration. */
export interface XZipFileAccess extends XInterface {
  /** Original wildcard stream lookup. @param pattern - Borrowed UTF16 pattern. @returns Acquired first matching entry stream. */
  getStreamByPattern(pattern: OUStringConstReference): Reference<XInputStream>;
}
const the_type: [R | null] = [null];
/** Original cached generated getter. @returns Borrowed interface type. */
export function cppu_detail_getUnoType(): Type {
  if (the_type[0] === null)
    typelib_static_mi_interface_type_init(
      the_type,
      new TextEncoder().encode("com.sun.star.packages.zip.XZipFileAccess\0"),
      0,
      null,
    );
  return getTypeFromTypeDescriptionReference(the_type);
}
/** Original deprecated Reference pointer overload. @param reference - Ignored declared pointer. @returns Borrowed type. */
export function getCppuType(reference?: Reference<XZipFileAccess> | null): Type {
  void reference;
  return UnoType.get(["Reference", cppu_detail_getUnoType]);
}
/** Original generated interface static API. */
export const XZipFileAccess = Object.freeze({
  /** Original ignored void-pointer overload. @param unused - Ignored pointer. @returns Borrowed type. */
  static_type(unused?: unknown): Type {
    void unused;
    return UnoType.get(cppu_detail_getUnoType);
  },
});
