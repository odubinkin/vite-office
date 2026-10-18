/** @fileoverview Native XTheme IDL contract and original cppumaker-normal type binding. */
import type { XInterface } from "../../../../../cppu/inc/com/sun/star/uno/XInterface";
import type { Reference } from "../../../../../cppu/inc/com/sun/star/uno/Reference";
import type { Sequence } from "../../../../../cppu/inc/com/sun/star/uno/Sequence";
import type { Type } from "../../../../../cppu/inc/com/sun/star/uno/Type";
import type { OUString } from "../../../../../sal/inc/rtl/ustring";
import type { Color } from "./Color";
import { UnoType, getTypeFromTypeDescriptionReference } from "../../../../../cppu/inc/unotype";
import {
  typelib_static_mi_interface_type_init,
  type typelib_TypeDescriptionReference as R,
} from "../../../../../cppu/inc/typelib/typedescription";
/** Original generated interface inherits the implicit UNO root. */
export interface XTheme extends XInterface {
  /** Original theme name result. @returns Actual owned Unicode string. */
  getName(): OUString;
  /** Original palette result:12 colors in the documented theme order. @returns Actual shared color sequence. */
  getColorSet(): Sequence<Color>;
}
/** Original normal generated static type cell. */
const the_type: [R | null] = [null];
/** Original normal type getter: implicit root becomes zero explicit bases and is supplied by existing CPPU. @returns Actual borrowed cached Type. */
export function cppu_detail_getUnoType(): Type {
  if (the_type[0] === null)
    typelib_static_mi_interface_type_init(
      the_type,
      new TextEncoder().encode("com.sun.star.util.XTheme\0"),
      0,
      null,
    );
  return getTypeFromTypeDescriptionReference(the_type);
}
/** Original deprecated declared Reference pointer overload; pointer is not inspected or used to infer a type. @param reference - Ignored native Reference<XTheme> pointer. @returns Actual borrowed Type. */
export function getCppuType(reference?: Reference<XTheme> | null): Type {
  void reference;
  return UnoType.get(["Reference", cppu_detail_getUnoType]);
}
/** Original generated static API accompanying the structural interface declaration. */
export const XTheme = Object.freeze({
  /** Original ignored void-pointer static_type delegates to UnoType. @param unused - Original ignored pointer. @returns Actual borrowed Type. */
  static_type(unused?: unknown): Type {
    void unused;
    return UnoType.get(cppu_detail_getUnoType);
  },
});
