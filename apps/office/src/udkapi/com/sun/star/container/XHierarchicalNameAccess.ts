/** @fileoverview Original XHierarchicalNameAccess IDL and normal generated type binding; concrete lookup remains with native component owners. */
import type { Reference } from "../../../../../cppu/inc/com/sun/star/uno/Reference";
import type { Any } from "../../../../../cppu/inc/com/sun/star/uno/Any";
import type { Type } from "../../../../../cppu/inc/com/sun/star/uno/Type";
import type { XInterface } from "../../../../../cppu/inc/com/sun/star/uno/XInterface";
import type { OUStringConstReference } from "../../../../../sal/inc/rtl/ustring";
import { UnoType, getTypeFromTypeDescriptionReference } from "../../../../../cppu/inc/unotype";
import {
  typelib_static_mi_interface_type_init,
  type typelib_TypeDescriptionReference as R,
} from "../../../../../cppu/inc/typelib/typedescription";
/** Complete original two-method declaration. */
export interface XHierarchicalNameAccess extends XInterface {
  /** Original lookup, with original NoSuchElement/WrappedTarget exception contract. @param name - Native path. @returns Owned Any. */
  getByHierarchicalName(name: OUStringConstReference): Any;
  /** Original presence query. @param name - Native path. @returns Source result. */
  hasByHierarchicalName(name: OUStringConstReference): boolean;
}
const the_type: [R | null] = [null];
/** Original normal generated getter retains its implicit root or explicit direct base through the existing CPPU factory. @returns Borrowed cached type. */
export function cppu_detail_getUnoType(): Type {
  if (the_type[0] === null)
    typelib_static_mi_interface_type_init(
      the_type,
      new TextEncoder().encode("com.sun.star.container.XHierarchicalNameAccess\0"),
      0,
      null,
    );
  return getTypeFromTypeDescriptionReference(the_type);
}
/** Original deprecated Reference pointer overload. @param reference - Ignored declared pointer. @returns Borrowed type. */
export function getCppuType(reference?: Reference<XHierarchicalNameAccess> | null): Type {
  void reference;
  return UnoType.get(["Reference", cppu_detail_getUnoType]);
}
/** Original generated interface static API. */
export const XHierarchicalNameAccess = Object.freeze({
  /** Original ignored void pointer overload. @param unused - Ignored source pointer. @returns Borrowed type. */
  static_type(unused?: unknown): Type {
    void unused;
    return UnoType.get(cppu_detail_getUnoType);
  },
});
