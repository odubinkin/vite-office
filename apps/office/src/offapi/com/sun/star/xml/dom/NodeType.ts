/** @fileoverview Original NodeType IDL enum and normal generated CPPU static type binding. */
import type { Type } from "../../../../../../cppu/inc/com/sun/star/uno/Type";
import {
  typelib_static_enum_type_init,
  type typelib_TypeDescriptionReference as R,
} from "../../../../../../cppu/inc/typelib/typedescription";
import { getTypeFromTypeDescriptionReference } from "../../../../../../cppu/inc/unotype";
/** Original published enumerators and cppumaker width sentinel. */
export enum NodeType {
  ATTRIBUTE_NODE,
  CDATA_SECTION_NODE,
  COMMENT_NODE,
  DOCUMENT_FRAGMENT_NODE,
  DOCUMENT_NODE,
  DOCUMENT_TYPE_NODE,
  ELEMENT_NODE,
  ENTITY_NODE,
  ENTITY_REFERENCE_NODE,
  NOTATION_NODE,
  PROCESSING_INSTRUCTION_NODE,
  TEXT_NODE,
  MAKE_FIXED_SIZE = 0x7fffffff,
}
/** Original normal static type cell. */
const the_type: [R | null] = [null];
/** Original static enum getter through actual CPPU. @returns Borrowed native type. */
export function cppu_detail_getUnoType_NodeType(): Type {
  if (the_type[0] === null)
    typelib_static_enum_type_init(
      the_type,
      new TextEncoder().encode("com.sun.star.xml.dom.NodeType\0"),
      0,
    );
  return getTypeFromTypeDescriptionReference(the_type);
}
