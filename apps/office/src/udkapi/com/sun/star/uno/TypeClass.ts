/** @fileoverview Original UNO TypeClass values from its IDL and genuine cppumaker enum binding. */

/** Original UNO enum; deprecated UNION/ARRAY and the generated native size sentinel are retained. */
export enum TypeClass {
  VOID = 0,
  CHAR = 1,
  BOOLEAN = 2,
  BYTE = 3,
  SHORT = 4,
  UNSIGNED_SHORT = 5,
  LONG = 6,
  UNSIGNED_LONG = 7,
  HYPER = 8,
  UNSIGNED_HYPER = 9,
  FLOAT = 10,
  DOUBLE = 11,
  STRING = 12,
  TYPE = 13,
  ANY = 14,
  ENUM = 15,
  TYPEDEF = 16,
  STRUCT = 17,
  UNION = 18,
  EXCEPTION = 19,
  SEQUENCE = 20,
  ARRAY = 21,
  INTERFACE = 22,
  SERVICE = 23,
  MODULE = 24,
  INTERFACE_METHOD = 25,
  INTERFACE_ATTRIBUTE = 26,
  UNKNOWN = 27,
  PROPERTY = 28,
  CONSTANT = 29,
  CONSTANTS = 30,
  SINGLETON = 31,
  MAKE_FIXED_SIZE = 0x7fffffff,
}

import type { Type } from "../../../../../cppu/inc/com/sun/star/uno/Type";
import { getTypeFromTypeDescriptionReference } from "../../../../../cppu/inc/unotype";
import {
  typelib_static_enum_type_init,
  type typelib_TypeDescriptionReference as R,
} from "../../../../../cppu/inc/typelib/typedescription";
const the_type: [R | null] = [null];
/** Original normal CPPUMaker enum type binding; enum declaration values remain unchanged. @returns Borrowed cached Type. */
export function cppu_detail_getUnoType_TypeClass(): Type {
  if (the_type[0] === null)
    typelib_static_enum_type_init(
      the_type,
      new TextEncoder().encode("com.sun.star.uno.TypeClass\0"),
      0,
    );
  return getTypeFromTypeDescriptionReference(the_type);
}
