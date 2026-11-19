/** @fileoverview Original TransferCommandOperation IDL enum and normal generated CPPU static type binding. */
import type { Type } from "../../../../../cppu/inc/com/sun/star/uno/Type";
import {
  typelib_static_enum_type_init,
  type typelib_TypeDescriptionReference as R,
} from "../../../../../cppu/inc/typelib/typedescription";
import { getTypeFromTypeDescriptionReference } from "../../../../../cppu/inc/unotype";
/** Original published enumerators and cppumaker width sentinel. */
export enum TransferCommandOperation {
  /** Original copy operation. */ COPY,
  /** Original move operation. */ MOVE,
  /** Original link operation. */ LINK,
  /** Original cppumaker fixed-width sentinel. */ MAKE_FIXED_SIZE = 0x7fffffff,
}
/** Original normal static type cell. */
const the_type: [R | null] = [null];
/** Original static enum getter through actual CPPU. @returns Borrowed native type. */
export function cppu_detail_getUnoType_TransferCommandOperation(): Type {
  if (the_type[0] === null)
    typelib_static_enum_type_init(
      the_type,
      new TextEncoder().encode("com.sun.star.ucb.TransferCommandOperation\0"),
      0,
    );
  return getTypeFromTypeDescriptionReference(the_type);
}
