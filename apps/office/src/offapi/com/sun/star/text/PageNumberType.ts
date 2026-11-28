/** @fileoverview Original PageNumberType IDL enumeration and normal CPPU binding. */
import type { Type } from "../../../../../cppu/inc/com/sun/star/uno/Type";
import {
  typelib_static_enum_type_init,
  type typelib_TypeDescriptionReference as R,
} from "../../../../../cppu/inc/typelib/typedescription";
import { getTypeFromTypeDescriptionReference } from "../../../../../cppu/inc/unotype";

/** Original UNO page selection order. */
export enum PageNumberType {
  PREV,
  CURRENT,
  NEXT,
  MAKE_FIXED_SIZE = 0x7fffffff,
}

const the_type: [R | null] = [null];

/** Borrows the canonical UNO enum type. @returns Type. */
export function cppu_detail_getUnoType_PageNumberType(): Type {
  if (the_type[0] === null)
    typelib_static_enum_type_init(
      the_type,
      new TextEncoder().encode("com.sun.star.text.PageNumberType\0"),
      PageNumberType.PREV,
    );
  return getTypeFromTypeDescriptionReference(the_type);
}
