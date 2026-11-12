/** @fileoverview Original DOMExceptionType IDL enum and normal generated CPPU static type binding. */
import type { Type } from "../../uno/Type";
import {
  typelib_static_enum_type_init,
  type typelib_TypeDescriptionReference as R,
} from "../../../../../typelib/typedescription";
import { getTypeFromTypeDescriptionReference } from "../../../../../unotype";
/** Original published enumerators and cppumaker width sentinel. */
export enum DOMExceptionType {
  DOMSTRING_SIZE_ERR,
  HIERARCHY_REQUEST_ERR,
  INDEX_SIZE_ERR,
  INUSE_ATTRIBUTE_ERR,
  INVALID_ACCESS_ERR,
  INVALID_CHARACTER_ERR,
  INVALID_MODIFICATION_ERR,
  INVALID_STATE_ERR,
  NAMESPACE_ERR,
  NO_DATA_ALLOWED_ERR,
  NO_MODIFICATION_ALLOWED_ERR,
  NOT_FOUND_ERR,
  NOT_SUPPORTED_ERR,
  SYNTAX_ERR,
  WRONG_DOCUMENT_ERR,
  MAKE_FIXED_SIZE = 0x7fffffff,
}
/** Original normal static type cell. */
const the_type: [R | null] = [null];
/** Original static enum getter through actual CPPU. @returns Borrowed native type. */
export function cppu_detail_getUnoType_DOMExceptionType(): Type {
  if (the_type[0] === null)
    typelib_static_enum_type_init(
      the_type,
      new TextEncoder().encode("com.sun.star.xml.dom.DOMExceptionType\0"),
      0,
    );
  return getTypeFromTypeDescriptionReference(the_type);
}
