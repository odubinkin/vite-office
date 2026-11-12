/** @fileoverview Complete original XSimpleFileAccess3.idl declarations and normal CPPUMaker interface type binding; no command, interaction or stream provider is manufactured. */
import type { Reference } from "../../../../../cppu/inc/com/sun/star/uno/Reference";
import type { Type } from "../../../../../cppu/inc/com/sun/star/uno/Type";
import { UnoType, getTypeFromTypeDescriptionReference } from "../../../../../cppu/inc/unotype";
import {
  typelib_static_mi_interface_type_init,
  type typelib_TypeDescriptionReference as R,
} from "../../../../../cppu/inc/typelib/typedescription";
import { XSimpleFileAccess2 } from "./XSimpleFileAccess2";
import type { OUStringConstReference } from "../../../../../sal/inc/rtl/ustring";
/** Original complete declared interface. */
export interface XSimpleFileAccess3 extends XSimpleFileAccess2 {
  /** Original XSimpleFileAccess3::isHidden. @param FileURL - Original borrowed argument. @returns Original result. */
  isHidden(FileURL: OUStringConstReference): boolean;
  /** Original XSimpleFileAccess3::setHidden. @param FileURL - Original borrowed argument. @param bHidden - Original borrowed argument. @returns Original result. */
  setHidden(FileURL: OUStringConstReference, bHidden: boolean): void;
}
const the_type: [R | null] = [null];
/** Original normal generated cached getter uses the shared CPPU factory and implicit XInterface root. @returns Borrowed cached Type. */
export function cppu_detail_getUnoType(): Type {
  if (the_type[0] === null)
    typelib_static_mi_interface_type_init(
      the_type,
      new TextEncoder().encode("com.sun.star.ucb.XSimpleFileAccess3\0"),
      1,
      [XSimpleFileAccess2.static_type().getTypeLibType() as R],
    );
  return getTypeFromTypeDescriptionReference(the_type);
}
/** Original deprecated Reference pointer overload. @param reference - Ignored original pointer. @returns Borrowed type. */
export function getCppuType(reference?: Reference<XSimpleFileAccess3> | null): Type {
  void reference;
  return UnoType.get(["Reference", cppu_detail_getUnoType]);
}
/** Original generated interface static API. */
export const XSimpleFileAccess3 = Object.freeze({
  /** Original ignored void pointer overload. @param unused - Ignored pointer. @returns Borrowed type. */
  static_type(unused?: unknown): Type {
    void unused;
    return UnoType.get(cppu_detail_getUnoType);
  },
});
