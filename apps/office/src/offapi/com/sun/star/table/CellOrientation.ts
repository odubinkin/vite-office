/** @fileoverview Original CellOrientation IDL enum and cppumaker-normal static type getter over actual CPPU. */
import type { Type } from "../../../../../cppu/inc/com/sun/star/uno/Type";
import {
  typelib_static_enum_type_init,
  type typelib_TypeDescriptionReference as R,
} from "../../../../../cppu/inc/typelib/typedescription";
import { getTypeFromTypeDescriptionReference } from "../../../../../cppu/inc/unotype";
/** Original declared values and generated width sentinel. */
export enum CellOrientation {
  STANDARD = 0,
  TOPBOTTOM = 1,
  BOTTOMTOP = 2,
  STACKED = 3,
  MAKE_FIXED_SIZE = 0x7fffffff,
}
/** Original generated normal static enum cell. */
const the_type: [R | null] = [null];
/** Original normal enum getter; native overload selector is represented by this declared function identity. @returns Actual borrowed type. */
export function cppu_detail_getUnoType_CellOrientation(): Type {
  if (the_type[0] === null)
    typelib_static_enum_type_init(
      the_type,
      new Uint8Array([
        99, 111, 109, 46, 115, 117, 110, 46, 115, 116, 97, 114, 46, 116, 97, 98, 108, 101, 46, 67,
        101, 108, 108, 79, 114, 105, 101, 110, 116, 97, 116, 105, 111, 110, 0,
      ]),
      0,
    );
  return getTypeFromTypeDescriptionReference(the_type);
}
