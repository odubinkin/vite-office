/** @fileoverview Original XSingleComponentFactory.idl contract and cppumaker-normal type binding; concrete behavior stays with component owners. */
import type { Reference } from "../../../../../cppu/inc/com/sun/star/uno/Reference";
import type { Type } from "../../../../../cppu/inc/com/sun/star/uno/Type";
import { UnoType, getTypeFromTypeDescriptionReference } from "../../../../../cppu/inc/unotype";
import {
  typelib_static_mi_interface_type_init,
  type typelib_TypeDescriptionReference as R,
} from "../../../../../cppu/inc/typelib/typedescription";
import type { XInterface } from "../../../../../cppu/inc/com/sun/star/uno/XInterface";
import type { Sequence } from "../../../../../cppu/inc/com/sun/star/uno/Sequence";
import type { Any } from "../../../../../cppu/inc/com/sun/star/uno/Any";
import type { XComponentContext } from "../uno/XComponentContext";
/** Original declared methods and implicit or explicit XInterface root. */
export interface XSingleComponentFactory extends XInterface {
  /** Original contextual creation. @param context - Actual deployment context. @returns Owned instance. */
  createInstanceWithContext(context: Reference<XComponentContext>): Reference<XInterface>;
  /** Original argument/context creation. @param arguments_ - Original initialization arguments. @param context - Actual deployment context. @returns Owned instance. */
  createInstanceWithArgumentsAndContext(
    arguments_: Sequence<Any>,
    context: Reference<XComponentContext>,
  ): Reference<XInterface>;
}
const the_type: [R | null] = [null];
/** Original normal generated getter retains its implicit root or explicit direct base through the existing CPPU factory. @returns Borrowed cached type. */
export function cppu_detail_getUnoType(): Type {
  if (the_type[0] === null)
    typelib_static_mi_interface_type_init(
      the_type,
      new TextEncoder().encode("com.sun.star.lang.XSingleComponentFactory\0"),
      0,
      null,
    );
  return getTypeFromTypeDescriptionReference(the_type);
}
/** Original deprecated Reference pointer overload. @param reference - Ignored declared pointer. @returns Borrowed type. */
export function getCppuType(reference?: Reference<XSingleComponentFactory> | null): Type {
  void reference;
  return UnoType.get(["Reference", cppu_detail_getUnoType]);
}
/** Original generated interface static API. */
export const XSingleComponentFactory = Object.freeze({
  /** Original ignored void pointer overload. @param unused - Ignored source pointer. @returns Borrowed type. */
  static_type(unused?: unknown): Type {
    void unused;
    return UnoType.get(cppu_detail_getUnoType);
  },
});
