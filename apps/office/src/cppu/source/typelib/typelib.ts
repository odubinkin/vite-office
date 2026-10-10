/** @fileoverview Original type-reference equality from cppu/source/typelib/typelib.cxx; registry and ownership functions remain separate required owners. */
import type { typelib_TypeDescriptionReference } from "../../inc/typelib/typedescription";
import { rtl_ustr_compare } from "../../../sal/inc/rtl/ustring.h";

/** Original pointer shortcut, class/length tests and terminated-name comparison. @param first - Borrowed original type-reference record; both-null identity is defined. @param second - Borrowed original type-reference record. @returns Original reference equality without acquiring or releasing names/types. */
export function typelib_typedescriptionreference_equals(
  first: Readonly<typelib_TypeDescriptionReference> | null,
  second: Readonly<typelib_TypeDescriptionReference> | null,
): boolean {
  return (
    first === second ||
    ((first as Readonly<typelib_TypeDescriptionReference>).eTypeClass ===
      (second as Readonly<typelib_TypeDescriptionReference>).eTypeClass &&
      (first as Readonly<typelib_TypeDescriptionReference>).pTypeName.length ===
        (second as Readonly<typelib_TypeDescriptionReference>).pTypeName.length &&
      rtl_ustr_compare(
        (first as Readonly<typelib_TypeDescriptionReference>).pTypeName.buffer,
        (second as Readonly<typelib_TypeDescriptionReference>).pTypeName.buffer,
      ) === 0)
  );
}
