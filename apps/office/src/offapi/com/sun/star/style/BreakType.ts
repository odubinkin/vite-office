/** @fileoverview Original BreakType IDL enum and cppumaker-normal static type getter over actual CPPU. */
import type { Type } from "../../../../../cppu/inc/com/sun/star/uno/Type";
import {
  typelib_static_enum_type_init,
  type typelib_TypeDescriptionReference as R,
} from "../../../../../cppu/inc/typelib/typedescription";
import { getTypeFromTypeDescriptionReference } from "../../../../../cppu/inc/unotype";
/** Original declared values and generated width sentinel. */
export enum BreakType {
  NONE = 0,
  COLUMN_BEFORE = 1,
  COLUMN_AFTER = 2,
  COLUMN_BOTH = 3,
  PAGE_BEFORE = 4,
  PAGE_AFTER = 5,
  PAGE_BOTH = 6,
  MAKE_FIXED_SIZE = 0x7fffffff,
}
/** Original generated normal static enum cell. */
const the_type: [R | null] = [null];
/** Original normal enum getter; native overload selector is represented by this declared function identity. @returns Actual borrowed type. */
export function cppu_detail_getUnoType_BreakType(): Type {
  if (the_type[0] === null)
    typelib_static_enum_type_init(
      the_type,
      new TextEncoder().encode("com.sun.star.style.BreakType\0"),
      0,
    );
  return getTypeFromTypeDescriptionReference(the_type);
}
