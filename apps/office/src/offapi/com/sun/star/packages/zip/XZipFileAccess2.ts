/** @fileoverview Original XZipFileAccess2.idl declaration and normal CPPUMaker multiple-interface binding. */
import type { Reference } from "../../../../../../cppu/inc/com/sun/star/uno/Reference";
import type { Type } from "../../../../../../cppu/inc/com/sun/star/uno/Type";
import { UnoType, getTypeFromTypeDescriptionReference } from "../../../../../../cppu/inc/unotype";
import {
  typelib_static_mi_interface_type_init,
  type typelib_TypeDescriptionReference as R,
} from "../../../../../../cppu/inc/typelib/typedescription";
import { XZipFileAccess, cppu_detail_getUnoType as zipType } from "./XZipFileAccess";
import {
  type XNameAccess,
  cppu_detail_getUnoType as nameType,
} from "../../../../../../cppu/inc/com/sun/star/container/XNameAccess";
/** Original merged interface with both declared direct bases. */
export interface XZipFileAccess2 extends XZipFileAccess, XNameAccess {}
const the_type: [R | null] = [null];
/** Original cached generated getter. @returns Borrowed interface type. */
export function cppu_detail_getUnoType(): Type {
  if (the_type[0] === null)
    typelib_static_mi_interface_type_init(
      the_type,
      new TextEncoder().encode("com.sun.star.packages.zip.XZipFileAccess2\0"),
      2,
      [zipType().getTypeLibType() as R, nameType().getTypeLibType() as R],
    );
  return getTypeFromTypeDescriptionReference(the_type);
}
/** Original deprecated Reference pointer overload. @param reference - Ignored declared pointer. @returns Borrowed type. */
export function getCppuType(reference?: Reference<XZipFileAccess2> | null): Type {
  void reference;
  return UnoType.get(["Reference", cppu_detail_getUnoType]);
}
/** Original generated interface static API. */
export const XZipFileAccess2 = Object.freeze({
  /** Original ignored void-pointer overload. @param unused - Ignored pointer. @returns Borrowed type. */
  static_type(unused?: unknown): Type {
    void unused;
    return UnoType.get(cppu_detail_getUnoType);
  },
});
