/** @fileoverview Original drawing bitmap repetition mode from BitmapMode.idl. */
import type { Type } from "../../../../../cppu/inc/com/sun/star/uno/Type";
import {
  typelib_static_enum_type_init,
  type typelib_TypeDescriptionReference,
} from "../../../../../cppu/inc/typelib/typedescription";
import { getTypeFromTypeDescriptionReference } from "../../../../../cppu/inc/unotype";

/** Original bitmap fill mode values. */
export enum BitmapMode {
  REPEAT = 0,
  STRETCH = 1,
  NO_REPEAT = 2,
}

const type: [typelib_TypeDescriptionReference | null] = [null];
/** Publishes the cached native enum type. @returns UNO type. */
export function cppu_detail_getUnoType_BitmapMode(): Type {
  if (type[0] === null)
    typelib_static_enum_type_init(
      type,
      new TextEncoder().encode("com.sun.star.drawing.BitmapMode\0"),
      0,
    );
  return getTypeFromTypeDescriptionReference(type);
}
