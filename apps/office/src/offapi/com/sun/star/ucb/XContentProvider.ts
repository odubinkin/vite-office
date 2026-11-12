/** @fileoverview Complete original XContentProvider.idl declarations and normal CPPUMaker interface type binding; no command, interaction or stream provider is manufactured. */
import type { Reference } from "../../../../../cppu/inc/com/sun/star/uno/Reference";
import type { Type } from "../../../../../cppu/inc/com/sun/star/uno/Type";
import { UnoType, getTypeFromTypeDescriptionReference } from "../../../../../cppu/inc/unotype";
import {
  typelib_static_mi_interface_type_init,
  type typelib_TypeDescriptionReference as R,
} from "../../../../../cppu/inc/typelib/typedescription";
import type { XInterface } from "../../../../../cppu/inc/com/sun/star/uno/XInterface";
import type { XContent } from "./XContent";
import type { XContentIdentifier } from "./XContentIdentifier";
/** Complete original interface, preserving all direct bases in IDL order. */
export interface XContentProvider extends XInterface {
  /** Original content lookup, including IllegalIdentifierException propagation. @param identifier - Borrowed identifier. @returns Acquired content or empty reference. */
  queryContent(identifier: Reference<XContentIdentifier>): Reference<XContent>;
  /** Original signed comparison result. @param id1 - First identifier. @param id2 - Second identifier. @returns Signed ordering result. */
  compareContentIds(id1: Reference<XContentIdentifier>, id2: Reference<XContentIdentifier>): number;
}
const the_type: [R | null] = [null];
/** Original normal generated cached getter uses the shared CPPU factory and original declared direct bases. @returns Borrowed cached Type. */
export function cppu_detail_getUnoType(): Type {
  if (the_type[0] === null)
    typelib_static_mi_interface_type_init(
      the_type,
      new TextEncoder().encode("com.sun.star.ucb.XContentProvider\0"),
      0,
      null,
    );
  return getTypeFromTypeDescriptionReference(the_type);
}
/** Original deprecated Reference pointer overload. @param reference - Ignored original pointer. @returns Borrowed type. */
export function getCppuType(reference?: Reference<XContentProvider> | null): Type {
  void reference;
  return UnoType.get(["Reference", cppu_detail_getUnoType]);
}
/** Original generated interface static API. */
export const XContentProvider = Object.freeze({
  /** Original ignored void pointer overload. @param unused - Ignored pointer. @returns Borrowed type. */
  static_type(unused?: unknown): Type {
    void unused;
    return UnoType.get(cppu_detail_getUnoType);
  },
});
