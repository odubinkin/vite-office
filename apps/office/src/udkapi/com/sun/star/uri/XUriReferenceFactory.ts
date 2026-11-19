/** @fileoverview Complete original XUriReferenceFactory.idl declaration and normal cached CPPUMaker interface type. Actual components implement the declared behavior. */
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
import type { RelativeUriExcessParentSegments } from "./RelativeUriExcessParentSegments";
/** Original implicit XInterface root and complete declared methods. */
export interface XUriReferenceFactory extends XInterface {
  /** Original parse contract. @param uriReference - Original declared argument. @returns Original declared result. */
  parse(uriReference: OUStringConstReference): Reference<XUriReference>;
  /** Original makeAbsolute contract. @param baseUriReference - Original declared argument. @param uriReference - Original declared argument. @param processAdditionalSpecialSegments - Original declared argument. @param excessParentSegments - Original declared argument. @returns Original declared result. */
  makeAbsolute(
    baseUriReference: Reference<XUriReference>,
    uriReference: Reference<XUriReference>,
    processAdditionalSpecialSegments: boolean,
    excessParentSegments: RelativeUriExcessParentSegments,
  ): Reference<XUriReference>;
  /** Original makeRelative contract. @param baseUriReference - Original declared argument. @param uriReference - Original declared argument. @param preferAuthorityOverRelativePath - Original declared argument. @param preferAbsoluteOverRelativePath - Original declared argument. @param encodeRetainedSpecialSegments - Original declared argument. @returns Original declared result. */
  makeRelative(
    baseUriReference: Reference<XUriReference>,
    uriReference: Reference<XUriReference>,
    preferAuthorityOverRelativePath: boolean,
    preferAbsoluteOverRelativePath: boolean,
    encodeRetainedSpecialSegments: boolean,
  ): Reference<XUriReference>;
}
const the_type: [R | null] = [null];
/** Original normal static interface getter. @returns Borrowed cached type. */
export function cppu_detail_getUnoType(): Type {
  if (the_type[0] === null)
    typelib_static_mi_interface_type_init(
      the_type,
      new TextEncoder().encode("com.sun.star.uri.XUriReferenceFactory\0"),
      0,
      null,
    );
  return getTypeFromTypeDescriptionReference(the_type);
}
/** Original deprecated Reference pointer overload. @param reference - Ignored original pointer. @returns Cached type. */
export function getCppuType(reference?: Reference<XUriReferenceFactory> | null): Type {
  void reference;
  return UnoType.get(["Reference", cppu_detail_getUnoType]);
}
/** Original generated static API. */
export const XUriReferenceFactory = Object.freeze({
  /** Original ignored void pointer overload. @param unused - Ignored pointer. @returns Cached type. */
  static_type(unused?: unknown): Type {
    void unused;
    return UnoType.get(cppu_detail_getUnoType);
  },
});
