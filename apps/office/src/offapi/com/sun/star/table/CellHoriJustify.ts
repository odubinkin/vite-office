/** @fileoverview Original CellHoriJustify IDL enum and normal generated CPPU type binding. */
import type { Type } from "../../../../../cppu/inc/com/sun/star/uno/Type";
import {
  typelib_static_enum_type_init,
  type typelib_TypeDescriptionReference as R,
} from "../../../../../cppu/inc/typelib/typedescription";
import { getTypeFromTypeDescriptionReference } from "../../../../../cppu/inc/unotype";
/** Original CellHoriJustify declared values. */
export enum CellHoriJustify {
  STANDARD = 0,
  LEFT = 1,
  CENTER = 2,
  RIGHT = 3,
  BLOCK = 4,
  REPEAT = 5,
  /** Original generated native enum-width sentinel. */
  MAKE_FIXED_SIZE = 0x7fffffff,
}
/** Original generated normal static enum-type cell. */
const the_type: [R | null] = [null];
/** Original cppumaker normal enum getter; compile-time overload argument is erased into this declared getter identity. @returns Actual borrowed UNO Type. */
export function cppu_detail_getUnoType_CellHoriJustify(): Type {
  if (the_type[0] === null)
    typelib_static_enum_type_init(
      the_type,
      new Uint8Array([
        99, 111, 109, 46, 115, 117, 110, 46, 115, 116, 97, 114, 46, 116, 97, 98, 108, 101, 46, 67,
        101, 108, 108, 72, 111, 114, 105, 74, 117, 115, 116, 105, 102, 121, 0,
      ]),
      0,
    );
  return getTypeFromTypeDescriptionReference(the_type);
}
