/** @fileoverview Original XHierarchicalStorageAccess2 IDL contract and cppumaker-normal static interface binding; concrete behavior is supplied by actual component owners. */
import type { Reference } from "../../../../../cppu/inc/com/sun/star/uno/Reference";
import type { Type } from "../../../../../cppu/inc/com/sun/star/uno/Type";
import { UnoType, getTypeFromTypeDescriptionReference } from "../../../../../cppu/inc/unotype";
import {
  typelib_static_mi_interface_type_init,
  type typelib_TypeDescriptionReference as R,
} from "../../../../../cppu/inc/typelib/typedescription";
import { XHierarchicalStorageAccess } from "./XHierarchicalStorageAccess";
import type { NamedValue } from "../../../../../udkapi/com/sun/star/beans/NamedValue";
import type { OUStringConstReference } from "../../../../../sal/inc/rtl/ustring";
import type { Sequence } from "../../../../../cppu/inc/com/sun/star/uno/Sequence";
import type { XExtendedStorageStream } from "./XExtendedStorageStream";
/** All original declared methods and required bases; no storage component or implementation is synthesized. */
export interface XHierarchicalStorageAccess2 extends XHierarchicalStorageAccess {
  /** Original openEncryptedStreamByHierarchicalName contract. @param sStreamName - Original argument. @param nOpenMode - Original argument. @param aEncryptionData - Original argument. @returns Original value or owned interface reference. */
  openEncryptedStreamByHierarchicalName(
    sStreamName: OUStringConstReference,
    nOpenMode: number,
    aEncryptionData: Sequence<NamedValue>,
  ): Reference<XExtendedStorageStream>;
}
const the_type: [R | null] = [null];
/** Original normal generated getter retains its implicit root or explicit direct base through the existing CPPU factory. @returns Borrowed cached type. */
export function cppu_detail_getUnoType(): Type {
  if (the_type[0] === null)
    typelib_static_mi_interface_type_init(
      the_type,
      new TextEncoder().encode("com.sun.star.embed.XHierarchicalStorageAccess2\0"),
      1,
      [XHierarchicalStorageAccess.static_type().getTypeLibType() as R],
    );
  return getTypeFromTypeDescriptionReference(the_type);
}
/** Original deprecated Reference pointer overload. @param reference - Ignored declared pointer. @returns Borrowed type. */
export function getCppuType(reference?: Reference<XHierarchicalStorageAccess2> | null): Type {
  void reference;
  return UnoType.get(["Reference", cppu_detail_getUnoType]);
}
/** Original generated interface static API. */
export const XHierarchicalStorageAccess2 = Object.freeze({
  /** Original ignored void pointer overload. @param unused - Ignored source pointer. @returns Borrowed type. */
  static_type(unused?: unknown): Type {
    void unused;
    return UnoType.get(cppu_detail_getUnoType);
  },
});
