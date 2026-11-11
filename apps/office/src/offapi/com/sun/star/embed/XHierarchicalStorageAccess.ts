/** @fileoverview Original XHierarchicalStorageAccess IDL contract and cppumaker-normal static interface binding; concrete behavior is supplied by actual component owners. */
import type { Reference } from "../../../../../cppu/inc/com/sun/star/uno/Reference";
import type { Type } from "../../../../../cppu/inc/com/sun/star/uno/Type";
import { UnoType, getTypeFromTypeDescriptionReference } from "../../../../../cppu/inc/unotype";
import {
  typelib_static_mi_interface_type_init,
  type typelib_TypeDescriptionReference as R,
} from "../../../../../cppu/inc/typelib/typedescription";
import type { XInterface } from "../../../../../cppu/inc/com/sun/star/uno/XInterface";
import type { OUStringConstReference } from "../../../../../sal/inc/rtl/ustring";
import type { XExtendedStorageStream } from "./XExtendedStorageStream";
/** All original declared methods and required bases; no storage component or implementation is synthesized. */
export interface XHierarchicalStorageAccess extends XInterface {
  /** Original openStreamElementByHierarchicalName contract. @param sStreamPath - Original argument. @param nOpenMode - Original argument. @returns Original value or owned interface reference. */
  openStreamElementByHierarchicalName(
    sStreamPath: OUStringConstReference,
    nOpenMode: number,
  ): Reference<XExtendedStorageStream>;
  /** Original openEncryptedStreamElementByHierarchicalName contract. @param sStreamName - Original argument. @param nOpenMode - Original argument. @param sPassword - Original argument. @returns Original value or owned interface reference. */
  openEncryptedStreamElementByHierarchicalName(
    sStreamName: OUStringConstReference,
    nOpenMode: number,
    sPassword: OUStringConstReference,
  ): Reference<XExtendedStorageStream>;
  /** Original removeStreamElementByHierarchicalName contract. @param sElementPath - Original argument. @returns Nothing. */
  removeStreamElementByHierarchicalName(sElementPath: OUStringConstReference): void;
}
const the_type: [R | null] = [null];
/** Original normal generated getter retains its implicit root or explicit direct base through the existing CPPU factory. @returns Borrowed cached type. */
export function cppu_detail_getUnoType(): Type {
  if (the_type[0] === null)
    typelib_static_mi_interface_type_init(
      the_type,
      new TextEncoder().encode("com.sun.star.embed.XHierarchicalStorageAccess\0"),
      0,
      null,
    );
  return getTypeFromTypeDescriptionReference(the_type);
}
/** Original deprecated Reference pointer overload. @param reference - Ignored declared pointer. @returns Borrowed type. */
export function getCppuType(reference?: Reference<XHierarchicalStorageAccess> | null): Type {
  void reference;
  return UnoType.get(["Reference", cppu_detail_getUnoType]);
}
/** Original generated interface static API. */
export const XHierarchicalStorageAccess = Object.freeze({
  /** Original ignored void pointer overload. @param unused - Ignored source pointer. @returns Borrowed type. */
  static_type(unused?: unknown): Type {
    void unused;
    return UnoType.get(cppu_detail_getUnoType);
  },
});
