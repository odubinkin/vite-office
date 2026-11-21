/** @fileoverview Original drawing RectanglePoint enum and UNO type. */
import type { Type } from "../../../../../cppu/inc/com/sun/star/uno/Type";
import {
  typelib_static_enum_type_init,
  type typelib_TypeDescriptionReference,
} from "../../../../../cppu/inc/typelib/typedescription";
import { getTypeFromTypeDescriptionReference } from "../../../../../cppu/inc/unotype";

/** Row-major reference points on the original drawing rectangle. */
export enum RectanglePoint {
  LEFT_TOP,
  MIDDLE_TOP,
  RIGHT_TOP,
  LEFT_MIDDLE,
  MIDDLE_MIDDLE,
  RIGHT_MIDDLE,
  LEFT_BOTTOM,
  MIDDLE_BOTTOM,
  RIGHT_BOTTOM,
}

const cached: [typelib_TypeDescriptionReference | null] = [null];
/** Publishes the original enum type. @returns Cached type. */
export function cppu_detail_getUnoType_RectanglePoint(): Type {
  if (!cached[0])
    typelib_static_enum_type_init(
      cached,
      new TextEncoder().encode("com.sun.star.drawing.RectanglePoint\0"),
      0,
    );
  return getTypeFromTypeDescriptionReference(cached);
}
