/** @fileoverview Original XInitialization IDL contract and cppumaker-normal static interface binding; concrete behavior is supplied by actual component owners. */
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
/** Original declared methods and direct base; no component implementation is manufactured. */
export interface XInitialization extends XInterface {
  /** Original post-creation initialization; concrete initialization can raise the original UNO Exception. @param arguments_ - Actual argument sequence. @returns Nothing. */
  initialize(arguments_: Sequence<Any>): void;
}
const the_type: [R | null] = [null];
/** Original normal generated getter retains its implicit root or explicit direct base through the existing CPPU factory. @returns Borrowed cached type. */
export function cppu_detail_getUnoType(): Type {
  if (the_type[0] === null)
    typelib_static_mi_interface_type_init(
      the_type,
      new TextEncoder().encode("com.sun.star.lang.XInitialization\0"),
      0,
      null,
    );
  return getTypeFromTypeDescriptionReference(the_type);
}
/** Original deprecated Reference pointer overload. @param reference - Ignored declared pointer. @returns Borrowed type. */
export function getCppuType(reference?: Reference<XInitialization> | null): Type {
  void reference;
  return UnoType.get(["Reference", cppu_detail_getUnoType]);
}
/** Original generated interface static API. */
export const XInitialization = Object.freeze({
  /** Original ignored void pointer overload. @param unused - Ignored source pointer. @returns Borrowed type. */
  static_type(unused?: unknown): Type {
    void unused;
    return UnoType.get(cppu_detail_getUnoType);
  },
});
