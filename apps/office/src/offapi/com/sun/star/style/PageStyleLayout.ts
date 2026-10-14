/** @fileoverview Original PageStyleLayout IDL enum and normal CPPU static type binding. */
import type { Type } from "../../../../../cppu/inc/com/sun/star/uno/Type";
import {
  typelib_static_enum_type_init,
  type typelib_TypeDescriptionReference as R,
} from "../../../../../cppu/inc/typelib/typedescription";
import { getTypeFromTypeDescriptionReference } from "../../../../../cppu/inc/unotype";
/** Original declared values and cppumaker width sentinel. */
export enum PageStyleLayout {
  ALL,
  LEFT,
  RIGHT,
  MIRRORED,
  MAKE_FIXED_SIZE = 0x7fffffff,
}
/** Original normal static type cell. */
const the_type: [R | null] = [null];
/** Original normal enum getter through actual CPPU. @returns Borrowed real type. */
export function cppu_detail_getUnoType_PageStyleLayout(): Type {
  if (the_type[0] === null)
    typelib_static_enum_type_init(
      the_type,
      new TextEncoder().encode("com.sun.star.style.PageStyleLayout\0"),
      0,
    );
  return getTypeFromTypeDescriptionReference(the_type);
}
