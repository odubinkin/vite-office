/** @fileoverview Original XPathObjectType IDL enum and normal generated CPPU static type binding. */
import type { Type } from "../../../../../../cppu/inc/com/sun/star/uno/Type";
import {
  typelib_static_enum_type_init,
  type typelib_TypeDescriptionReference as R,
} from "../../../../../../cppu/inc/typelib/typedescription";
import { getTypeFromTypeDescriptionReference } from "../../../../../../cppu/inc/unotype";
/** Original published enumerators and cppumaker width sentinel. */
export enum XPathObjectType {
  XPATH_UNDEFINED,
  XPATH_NODESET,
  XPATH_BOOLEAN,
  XPATH_NUMBER,
  XPATH_STRING,
  XPATH_POINT,
  XPATH_RANGE,
  XPATH_LOCATIONSET,
  XPATH_USERS,
  XPATH_XSLT_TREE,
  MAKE_FIXED_SIZE = 0x7fffffff,
}
/** Original normal static type cell. */
const the_type: [R | null] = [null];
/** Original static enum getter through actual CPPU. @returns Borrowed native type. */
export function cppu_detail_getUnoType_XPathObjectType(): Type {
  if (the_type[0] === null)
    typelib_static_enum_type_init(
      the_type,
      new TextEncoder().encode("com.sun.star.xml.xpath.XPathObjectType\0"),
      0,
    );
  return getTypeFromTypeDescriptionReference(the_type);
}
