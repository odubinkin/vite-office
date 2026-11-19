/** @fileoverview Complete original XUriReference.idl declaration and normal cached CPPUMaker interface type. Actual components implement the declared behavior. */
import type { Reference } from "../../../../../cppu/inc/com/sun/star/uno/Reference";
import type { Type } from "../../../../../cppu/inc/com/sun/star/uno/Type";
import { UnoType, getTypeFromTypeDescriptionReference } from "../../../../../cppu/inc/unotype";
import {
  typelib_static_mi_interface_type_init,
  type typelib_TypeDescriptionReference as R,
} from "../../../../../cppu/inc/typelib/typedescription";
import type { XInterface } from "../../../../../cppu/inc/com/sun/star/uno/XInterface";
import type { OUString, OUStringConstReference } from "../../../../../sal/inc/rtl/ustring";
/** Original implicit XInterface root and complete declared methods. */
export interface XUriReference extends XInterface {
  /** Original getUriReference contract. @returns Original declared result. */
  getUriReference(): OUString;
  /** Original isAbsolute contract. @returns Original declared result. */
  isAbsolute(): boolean;
  /** Original getScheme contract. @returns Original declared result. */
  getScheme(): OUString;
  /** Original getSchemeSpecificPart contract. @returns Original declared result. */
  getSchemeSpecificPart(): OUString;
  /** Original isHierarchical contract. @returns Original declared result. */
  isHierarchical(): boolean;
  /** Original hasAuthority contract. @returns Original declared result. */
  hasAuthority(): boolean;
  /** Original getAuthority contract. @returns Original declared result. */
  getAuthority(): OUString;
  /** Original getPath contract. @returns Original declared result. */
  getPath(): OUString;
  /** Original hasRelativePath contract. @returns Original declared result. */
  hasRelativePath(): boolean;
  /** Original getPathSegmentCount contract. @returns Original declared result. */
  getPathSegmentCount(): number;
  /** Original getPathSegment contract. @param index - Original declared argument. @returns Original declared result. */
  getPathSegment(index: number): OUString;
  /** Original hasQuery contract. @returns Original declared result. */
  hasQuery(): boolean;
  /** Original getQuery contract. @returns Original declared result. */
  getQuery(): OUString;
  /** Original hasFragment contract. @returns Original declared result. */
  hasFragment(): boolean;
  /** Original getFragment contract. @returns Original declared result. */
  getFragment(): OUString;
  /** Original setFragment contract. @param fragment - Original declared argument. @returns Original declared result. */
  setFragment(fragment: OUStringConstReference): void;
  /** Original clearFragment contract. @returns Original declared result. */
  clearFragment(): void;
}
const the_type: [R | null] = [null];
/** Original normal static interface getter. @returns Borrowed cached type. */
export function cppu_detail_getUnoType(): Type {
  if (the_type[0] === null)
    typelib_static_mi_interface_type_init(
      the_type,
      new TextEncoder().encode("com.sun.star.uri.XUriReference\0"),
      0,
      null,
    );
  return getTypeFromTypeDescriptionReference(the_type);
}
/** Original deprecated Reference pointer overload. @param reference - Ignored original pointer. @returns Cached type. */
export function getCppuType(reference?: Reference<XUriReference> | null): Type {
  void reference;
  return UnoType.get(["Reference", cppu_detail_getUnoType]);
}
/** Original generated static API. */
export const XUriReference = Object.freeze({
  /** Original ignored void pointer overload. @param unused - Ignored pointer. @returns Cached type. */
  static_type(unused?: unknown): Type {
    void unused;
    return UnoType.get(cppu_detail_getUnoType);
  },
});
