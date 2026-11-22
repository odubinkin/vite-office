/** @fileoverview Native XGraphic IDL and its generated static type binding. */
import type { XInterface } from "../../../../../cppu/inc/com/sun/star/uno/XInterface";
import type { Type } from "../../../../../cppu/inc/com/sun/star/uno/Type";
import { UnoType, getTypeFromTypeDescriptionReference } from "../../../../../cppu/inc/unotype";
import {
  typelib_static_mi_interface_type_init,
  type typelib_TypeDescriptionReference as R,
} from "../../../../../cppu/inc/typelib/typedescription";

/** Native interface for a loaded graphic. */
export interface XGraphic extends XInterface {
  /** Returns the signed-byte GraphicType constant. @returns Graphic type. */
  getType(): number;
}

const the_type: [R | null] = [null];

/** Generated normal static interface getter. @returns Cached native interface type. */
export function cppu_detail_getUnoType(): Type {
  if (the_type[0] === null)
    typelib_static_mi_interface_type_init(
      the_type,
      new TextEncoder().encode("com.sun.star.graphic.XGraphic\0"),
      0,
      null,
    );
  return getTypeFromTypeDescriptionReference(the_type);
}

/** Original normal type factory owner. */
export const XGraphic = Object.freeze({
  /** Returns the original static interface type. @returns Native type. */
  static_type(): Type {
    return UnoType.get(cppu_detail_getUnoType);
  },
});
