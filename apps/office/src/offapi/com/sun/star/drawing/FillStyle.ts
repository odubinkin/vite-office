/** @fileoverview Original drawing FillStyle enumeration from FillStyle.idl. */
export enum FillStyle {
  NONE = 0,
  SOLID = 1,
  GRADIENT = 2,
  HATCH = 3,
  BITMAP = 4,
  /** Original generated enum-width sentinel. */
  MAKE_FIXED_SIZE = 0x7fffffff,
}

import type { Type } from "../../../../../cppu/inc/com/sun/star/uno/Type";
import {
  typelib_static_enum_type_init,
  type typelib_TypeDescriptionReference as R,
} from "../../../../../cppu/inc/typelib/typedescription";
import { getTypeFromTypeDescriptionReference } from "../../../../../cppu/inc/unotype";
const the_type: [R | null] = [null];
/** Original normal cppumaker enum type getter. @returns Borrowed native type. */
export function cppu_detail_getUnoType_FillStyle(): Type {
  if (the_type[0] === null)
    typelib_static_enum_type_init(
      the_type,
      new TextEncoder().encode("com.sun.star.drawing.FillStyle\0"),
      0,
    );
  return getTypeFromTypeDescriptionReference(the_type);
}
