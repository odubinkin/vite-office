/** @fileoverview Original VerticalAlignment IDL enum and normal generated CPPU type binding. */
import type { Type } from "../../../../../cppu/inc/com/sun/star/uno/Type";
import {
  typelib_static_enum_type_init,
  type typelib_TypeDescriptionReference as R,
} from "../../../../../cppu/inc/typelib/typedescription";
import { getTypeFromTypeDescriptionReference } from "../../../../../cppu/inc/unotype";
/** Original VerticalAlignment declared values. */
export enum VerticalAlignment {
  TOP = 0,
  MIDDLE = 1,
  BOTTOM = 2,
  /** Original generated native enum-width sentinel. */
  MAKE_FIXED_SIZE = 0x7fffffff,
}
/** Original generated normal static enum-type cell. */
const the_type: [R | null] = [null];
/** Original cppumaker normal enum getter; compile-time overload argument is erased into this declared getter identity. @returns Actual borrowed UNO Type. */
export function cppu_detail_getUnoType_VerticalAlignment(): Type {
  if (the_type[0] === null)
    typelib_static_enum_type_init(
      the_type,
      new Uint8Array([
        99, 111, 109, 46, 115, 117, 110, 46, 115, 116, 97, 114, 46, 115, 116, 121, 108, 101, 46, 86,
        101, 114, 116, 105, 99, 97, 108, 65, 108, 105, 103, 110, 109, 101, 110, 116, 0,
      ]),
      0,
    );
  return getTypeFromTypeDescriptionReference(the_type);
}
