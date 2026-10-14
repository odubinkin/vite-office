/** @fileoverview Native XComplexColor IDL contract and original cppumaker-normal type binding. */
import type { XInterface } from "../../../../../cppu/inc/com/sun/star/uno/XInterface";
import type { Reference } from "../../../../../cppu/inc/com/sun/star/uno/Reference";
import type { Type } from "../../../../../cppu/inc/com/sun/star/uno/Type";
import type { Color } from "./Color";
import type { XTheme } from "./XTheme";
import { UnoType, getTypeFromTypeDescriptionReference } from "../../../../../cppu/inc/unotype";
import {
  typelib_static_mi_interface_type_init,
  type typelib_TypeDescriptionReference as R,
} from "../../../../../cppu/inc/typelib/typedescription";
/** Original generated interface inherits the implicit UNO root; implementation is supplied by the component owner. */
export interface XComplexColor extends XInterface {
  /** Original signed32 representation identifier. @returns Native type. */
  getType(): number;
  /** Original signed32 theme palette index. @returns Native index. */
  getThemeColorType(): number;
  /** Original resolve call uses an actual declared theme reference. @param xTheme - Actual shared Reference<XTheme>. @returns Native signed32 Color alias. */
  resolveColor(xTheme: Reference<XTheme>): Color;
}
/** Original normal generated static type cell. */
const the_type: [R | null] = [null];
/** Original normal getter reuses the real static MI factory, including implicit XInterface. @returns Actual borrowed cached Type. */
export function cppu_detail_getUnoType(): Type {
  if (the_type[0] === null)
    typelib_static_mi_interface_type_init(
      the_type,
      new TextEncoder().encode("com.sun.star.util.XComplexColor\0"),
      0,
      null,
    );
  return getTypeFromTypeDescriptionReference(the_type);
}
/** Original deprecated declared Reference pointer overload. @param reference - Ignored Reference<XComplexColor> pointer. @returns Actual borrowed Type. */
export function getCppuType(reference?: Reference<XComplexColor> | null): Type {
  void reference;
  return UnoType.get(["Reference", cppu_detail_getUnoType]);
}
/** Original generated static API accompanying the structural interface declaration. */
export const XComplexColor = Object.freeze({
  /** Original ignored void-pointer static_type delegates through actual UnoType. @param unused - Ignored pointer. @returns Actual borrowed Type. */
  static_type(unused?: unknown): Type {
    void unused;
    return UnoType.get(cppu_detail_getUnoType);
  },
});
