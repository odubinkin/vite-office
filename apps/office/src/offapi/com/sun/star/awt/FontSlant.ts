/** @fileoverview Original FontSlant IDL enum and cppumaker-normal static type getter over actual CPPU. */
import type { Type } from "../../../../../cppu/inc/com/sun/star/uno/Type";
import {
  typelib_static_enum_type_init,
  type typelib_TypeDescriptionReference as R,
} from "../../../../../cppu/inc/typelib/typedescription";
import { getTypeFromTypeDescriptionReference } from "../../../../../cppu/inc/unotype";
/** Original declared values and generated width sentinel. */
export enum FontSlant {
  NONE = 0,
  OBLIQUE = 1,
  ITALIC = 2,
  DONTKNOW = 3,
  REVERSE_OBLIQUE = 4,
  REVERSE_ITALIC = 5,
  MAKE_FIXED_SIZE = 0x7fffffff,
}
/** Original generated normal static enum cell. */
const the_type: [R | null] = [null];
/** Original normal enum getter; native overload selector is represented by this declared function identity. @returns Actual borrowed type. */
export function cppu_detail_getUnoType_FontSlant(): Type {
  if (the_type[0] === null)
    typelib_static_enum_type_init(
      the_type,
      new Uint8Array([
        99, 111, 109, 46, 115, 117, 110, 46, 115, 116, 97, 114, 46, 97, 119, 116, 46, 70, 111, 110,
        116, 83, 108, 97, 110, 116, 0,
      ]),
      0,
    );
  return getTypeFromTypeDescriptionReference(the_type);
}
