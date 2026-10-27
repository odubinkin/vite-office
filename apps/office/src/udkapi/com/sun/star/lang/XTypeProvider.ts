/** @fileoverview Original XTypeProvider IDL interface and cppumaker normal static type binding; actual implementations supply type and obsolete implementation-ID sequences. */
import type { XInterface } from "../../../../../cppu/inc/com/sun/star/uno/XInterface";
import type { Sequence } from "../../../../../cppu/inc/com/sun/star/uno/Sequence";
import type { Type } from "../../../../../cppu/inc/com/sun/star/uno/Type";
import type { Reference } from "../../../../../cppu/inc/com/sun/star/uno/Reference";
import { UnoType, getTypeFromTypeDescriptionReference } from "../../../../../cppu/inc/unotype";
import {
  typelib_static_mi_interface_type_init,
  type typelib_TypeDescriptionReference as R,
} from "../../../../../cppu/inc/typelib/typedescription";
/** Original published UNO contract. */
export interface XTypeProvider extends XInterface {
  /** Returns original declared supported types. @returns Owned Type sequence. */
  getTypes(): Sequence<Type>;
  /** Original obsolete ID contract; helper implementations return empty. @returns Owned byte sequence. */
  getImplementationId(): Sequence<number>;
}
const the_type: [R | null] = [null];
/** Original normal static MI initializer includes the implicit root. @returns Borrowed cached type. */
export function cppu_detail_getUnoType(): Type {
  if (the_type[0] === null)
    typelib_static_mi_interface_type_init(
      the_type,
      new TextEncoder().encode("com.sun.star.lang.XTypeProvider\0"),
      0,
      null,
    );
  return getTypeFromTypeDescriptionReference(the_type);
}
/** Original deprecated declared Reference overload. @param reference - Ignored declared pointer. @returns Borrowed type. */
export function getCppuType(reference?: Reference<XTypeProvider> | null): Type {
  void reference;
  return UnoType.get(["Reference", cppu_detail_getUnoType]);
}
/** Original generated static API. */
export const XTypeProvider = Object.freeze({
  /** Original ignored void pointer overload. @param unused - Ignored pointer. @returns Borrowed type. */
  static_type(unused?: unknown): Type {
    void unused;
    return UnoType.get(cppu_detail_getUnoType);
  },
});
