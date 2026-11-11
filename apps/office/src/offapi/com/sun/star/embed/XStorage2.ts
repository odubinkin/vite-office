/** @fileoverview Original XStorage2 IDL contract and cppumaker-normal static interface binding; concrete behavior is supplied by actual component owners. */
import type { Reference } from "../../../../../cppu/inc/com/sun/star/uno/Reference";
import type { Type } from "../../../../../cppu/inc/com/sun/star/uno/Type";
import { UnoType, getTypeFromTypeDescriptionReference } from "../../../../../cppu/inc/unotype";
import {
  typelib_static_mi_interface_type_init,
  type typelib_TypeDescriptionReference as R,
} from "../../../../../cppu/inc/typelib/typedescription";
import { XStorage } from "./XStorage";
import type { NamedValue } from "../../../../../udkapi/com/sun/star/beans/NamedValue";
import type { OUStringConstReference } from "../../../../../sal/inc/rtl/ustring";
import type { Sequence } from "../../../../../cppu/inc/com/sun/star/uno/Sequence";
import type { XStream } from "../../../../../udkapi/com/sun/star/io/XStream";
/** All original declared methods and required bases; no storage component or implementation is synthesized. */
export interface XStorage2 extends XStorage {
  /** Original openEncryptedStream contract. @param sStreamName - Original argument. @param nOpenMode - Original argument. @param aEncryptionData - Original argument. @returns Original value or owned interface reference. */
  openEncryptedStream(
    sStreamName: OUStringConstReference,
    nOpenMode: number,
    aEncryptionData: Sequence<NamedValue>,
  ): Reference<XStream>;
  /** Original cloneEncryptedStream contract. @param sStreamName - Original argument. @param aEncryptionData - Original argument. @returns Original value or owned interface reference. */
  cloneEncryptedStream(
    sStreamName: OUStringConstReference,
    aEncryptionData: Sequence<NamedValue>,
  ): Reference<XStream>;
}
const the_type: [R | null] = [null];
/** Original normal generated getter retains its implicit root or explicit direct base through the existing CPPU factory. @returns Borrowed cached type. */
export function cppu_detail_getUnoType(): Type {
  if (the_type[0] === null)
    typelib_static_mi_interface_type_init(
      the_type,
      new TextEncoder().encode("com.sun.star.embed.XStorage2\0"),
      1,
      [XStorage.static_type().getTypeLibType() as R],
    );
  return getTypeFromTypeDescriptionReference(the_type);
}
/** Original deprecated Reference pointer overload. @param reference - Ignored declared pointer. @returns Borrowed type. */
export function getCppuType(reference?: Reference<XStorage2> | null): Type {
  void reference;
  return UnoType.get(["Reference", cppu_detail_getUnoType]);
}
/** Original generated interface static API. */
export const XStorage2 = Object.freeze({
  /** Original ignored void pointer overload. @param unused - Ignored source pointer. @returns Borrowed type. */
  static_type(unused?: unknown): Type {
    void unused;
    return UnoType.get(cppu_detail_getUnoType);
  },
});
