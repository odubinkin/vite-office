/** @fileoverview Original XMultiServiceFactory IDL contract and cppumaker-normal static interface binding; concrete behavior is supplied by actual component owners. */
import type { Reference } from "../../../../../cppu/inc/com/sun/star/uno/Reference";
import type { Type } from "../../../../../cppu/inc/com/sun/star/uno/Type";
import { UnoType, getTypeFromTypeDescriptionReference } from "../../../../../cppu/inc/unotype";
import {
  typelib_static_mi_interface_type_init,
  type typelib_TypeDescriptionReference as R,
} from "../../../../../cppu/inc/typelib/typedescription";
import type { XInterface } from "../../../../../cppu/inc/com/sun/star/uno/XInterface";
import type { Any } from "../../../../../cppu/inc/com/sun/star/uno/Any";
import type { Sequence } from "../../../../../cppu/inc/com/sun/star/uno/Sequence";
import type { OUString, OUStringConstReference } from "../../../../../sal/inc/rtl/ustring";
/** Original declared methods and direct base; no component implementation is manufactured. */
export interface XMultiServiceFactory extends XInterface {
  /** Original named instance creation; actual concrete service can raise UNO Exception. @param service - Unicode classified instance name. @returns Acquired actual interface. */
  createInstance(service: OUStringConstReference): Reference<XInterface>;
  /** Original named instance creation with actual Any arguments. @param service - Actual Unicode name. @param arguments_ - Actual argument sequence. @returns Acquired instance. */
  createInstanceWithArguments(
    service: OUStringConstReference,
    arguments_: Sequence<Any>,
  ): Reference<XInterface>;
  /** Original available classified names. @returns Actual Unicode name sequence. */
  getAvailableServiceNames(): Sequence<OUString>;
}
const the_type: [R | null] = [null];
/** Original normal generated getter retains its implicit root or explicit direct base through the existing CPPU factory. @returns Borrowed cached type. */
export function cppu_detail_getUnoType(): Type {
  if (the_type[0] === null)
    typelib_static_mi_interface_type_init(
      the_type,
      new TextEncoder().encode("com.sun.star.lang.XMultiServiceFactory\0"),
      0,
      null,
    );
  return getTypeFromTypeDescriptionReference(the_type);
}
/** Original deprecated Reference pointer overload. @param reference - Ignored declared pointer. @returns Borrowed type. */
export function getCppuType(reference?: Reference<XMultiServiceFactory> | null): Type {
  void reference;
  return UnoType.get(["Reference", cppu_detail_getUnoType]);
}
/** Original generated interface static API. */
export const XMultiServiceFactory = Object.freeze({
  /** Original ignored void pointer overload. @param unused - Ignored source pointer. @returns Borrowed type. */
  static_type(unused?: unknown): Type {
    void unused;
    return UnoType.get(cppu_detail_getUnoType);
  },
});
