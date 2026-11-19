/** @fileoverview Complete original XUriSchemeParser.idl declaration and normal cached CPPUMaker interface type. Actual components implement the declared behavior. */
import type { Reference } from "../../../../../cppu/inc/com/sun/star/uno/Reference";
import type { Type } from "../../../../../cppu/inc/com/sun/star/uno/Type";
import { UnoType, getTypeFromTypeDescriptionReference } from "../../../../../cppu/inc/unotype";
import {
  typelib_static_mi_interface_type_init,
  type typelib_TypeDescriptionReference as R,
} from "../../../../../cppu/inc/typelib/typedescription";
import type { XInterface } from "../../../../../cppu/inc/com/sun/star/uno/XInterface";
import type { OUStringConstReference } from "../../../../../sal/inc/rtl/ustring";
import type { XUriReference } from "./XUriReference";
/** Original implicit XInterface root and complete declared methods. */
export interface XUriSchemeParser extends XInterface {
  /** Original parse contract. @param scheme - Original declared argument. @param schemeSpecificPart - Original declared argument. @returns Original declared result. */
  parse(
    scheme: OUStringConstReference,
    schemeSpecificPart: OUStringConstReference,
  ): Reference<XUriReference>;
}
const the_type: [R | null] = [null];
/** Original normal static interface getter. @returns Borrowed cached type. */
export function cppu_detail_getUnoType(): Type {
  if (the_type[0] === null)
    typelib_static_mi_interface_type_init(
      the_type,
      new TextEncoder().encode("com.sun.star.uri.XUriSchemeParser\0"),
      0,
      null,
    );
  return getTypeFromTypeDescriptionReference(the_type);
}
/** Original deprecated Reference pointer overload. @param reference - Ignored original pointer. @returns Cached type. */
export function getCppuType(reference?: Reference<XUriSchemeParser> | null): Type {
  void reference;
  return UnoType.get(["Reference", cppu_detail_getUnoType]);
}
/** Original generated static API. */
export const XUriSchemeParser = Object.freeze({
  /** Original ignored void pointer overload. @param unused - Ignored pointer. @returns Cached type. */
  static_type(unused?: unknown): Type {
    void unused;
    return UnoType.get(cppu_detail_getUnoType);
  },
});
