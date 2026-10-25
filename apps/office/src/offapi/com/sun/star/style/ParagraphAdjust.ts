/** @fileoverview Original ParagraphAdjust IDL enum. */
import type { Type } from "../../../../../cppu/inc/com/sun/star/uno/Type";
import {
  typelib_static_enum_type_init,
  type typelib_TypeDescriptionReference as R,
} from "../../../../../cppu/inc/typelib/typedescription";
import { getTypeFromTypeDescriptionReference } from "../../../../../cppu/inc/unotype";
/** Original ParagraphAdjust declared values. */
export enum ParagraphAdjust {
  LEFT = 0,
  RIGHT = 1,
  BLOCK = 2,
  CENTER = 3,
  STRETCH = 4,
  START = 5,
  END = 6,
  /** Original generated native enum-width sentinel. */
  MAKE_FIXED_SIZE = 0x7fffffff,
}
/** Original cppumaker-normal static enum type cell. */
const the_type: [R | null] = [null];
/** Normal generated enum getter used by DomainMapper's typed Any insertion. @returns Borrowed native type. */
export function cppu_detail_getUnoType_ParagraphAdjust(): Type {
  if (the_type[0] === null)
    typelib_static_enum_type_init(
      the_type,
      new TextEncoder().encode("com.sun.star.style.ParagraphAdjust\0"),
      0,
    );
  return getTypeFromTypeDescriptionReference(the_type);
}
