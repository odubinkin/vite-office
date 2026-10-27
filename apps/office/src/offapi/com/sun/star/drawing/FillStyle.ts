/** @fileoverview Original drawing FillStyle enumeration from FillStyle.idl. */
import type { Type } from "../../../../../cppu/inc/com/sun/star/uno/Type";
import {
  typelib_static_enum_type_init,
  type typelib_TypeDescriptionReference as R,
} from "../../../../../cppu/inc/typelib/typedescription";
import { getTypeFromTypeDescriptionReference } from "../../../../../cppu/inc/unotype";
/** Original values and normal generated width sentinel. */
export enum FillStyle {
  NONE = 0,
  SOLID = 1,
  GRADIENT = 2,
  HATCH = 3,
  BITMAP = 4,
  MAKE_FIXED_SIZE = 0x7fffffff,
}
const the_type: [R | null] = [null];
/** Original normal enum getter uses the existing CPPU static enum factory. @returns Borrowed cached type. */
export function cppu_detail_getUnoType_FillStyle(): Type {
  if (the_type[0] === null)
    typelib_static_enum_type_init(
      the_type,
      new TextEncoder().encode("com.sun.star.drawing.FillStyle\0"),
      0,
    );
  return getTypeFromTypeDescriptionReference(the_type);
}
