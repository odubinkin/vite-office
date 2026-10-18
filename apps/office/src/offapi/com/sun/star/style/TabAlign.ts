/** @fileoverview Original TabAlign IDL enum and normal generated CPPU static type binding. */
import type { Type } from "../../../../../cppu/inc/com/sun/star/uno/Type";
import {
  typelib_static_enum_type_init,
  type typelib_TypeDescriptionReference as R,
} from "../../../../../cppu/inc/typelib/typedescription";
import { getTypeFromTypeDescriptionReference } from "../../../../../cppu/inc/unotype";
/** Original published enumerators and cppumaker width sentinel. */
export enum TabAlign {
  LEFT,
  CENTER,
  RIGHT,
  DECIMAL,
  DEFAULT,
  MAKE_FIXED_SIZE = 0x7fffffff,
}
/** Original normal static type cell. */
const the_type: [R | null] = [null];
/** Original static enum getter through actual CPPU. @returns Borrowed native type. */
export function cppu_detail_getUnoType_TabAlign(): Type {
  if (the_type[0] === null)
    typelib_static_enum_type_init(
      the_type,
      new TextEncoder().encode("com.sun.star.style.TabAlign\0"),
      0,
    );
  return getTypeFromTypeDescriptionReference(the_type);
}
