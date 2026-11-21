/** @fileoverview Original legacy SearchAlgorithms.idl identities; newer SearchAlgorithms2 uses a distinct numbering. */
import type { Type } from "../../../../../cppu/inc/com/sun/star/uno/Type";
import {
  typelib_static_enum_type_init,
  type typelib_TypeDescriptionReference as R,
} from "../../../../../cppu/inc/typelib/typedescription";
import { getTypeFromTypeDescriptionReference } from "../../../../../cppu/inc/unotype";

/** Algorithm identities from the original SearchAlgorithms IDL enum. */
export enum SearchAlgorithms {
  ABSOLUTE = 0,
  REGEXP = 1,
  APPROXIMATE = 2,
}

const the_type: [R | null] = [null];

/** Original static CPPU enum type. @returns Borrowed type. */
export function cppu_detail_getUnoType_SearchAlgorithms(): Type {
  if (the_type[0] === null)
    typelib_static_enum_type_init(
      the_type,
      new TextEncoder().encode("com.sun.star.util.SearchAlgorithms\0"),
      SearchAlgorithms.ABSOLUTE,
    );
  return getTypeFromTypeDescriptionReference(the_type);
}
