/** @fileoverview Original FormatElement.idl normal generated type initializer;actual value storage is owned by the shared compound/Sequence implementation. */
import type { Type } from "../../../../../cppu/inc/com/sun/star/uno/Type";
import { UnoType, getTypeFromTypeDescriptionReference } from "../../../../../cppu/inc/unotype";
import {
  typelib_static_struct_type_init,
  type typelib_TypeDescriptionReference as R,
} from "../../../../../cppu/inc/typelib/typedescription";
/** Original normal generated static type cell. */
const the_type: [R | null] = [null];
/** Original member types in IDL order,using actual shared type initialization. @returns Borrowed generated type. */
export function cppu_detail_getUnoType_FormatElement(): Type {
  if (the_type[0] === null) {
    const string = UnoType.get("OUString").getTypeLibType() as R;
    typelib_static_struct_type_init(
      the_type,
      new TextEncoder().encode("com.sun.star.i18n.FormatElement\0"),
      null,
      7,
      [
        string,
        string,
        string,
        string,
        string,
        UnoType.get("sal_Int16").getTypeLibType() as R,
        UnoType.get("bool").getTypeLibType() as R,
      ],
      null,
    );
  }
  return getTypeFromTypeDescriptionReference(the_type);
}
/** Original compound member lvalues in existing shared Sequence storage;not document binary bytes. */
export type FormatElementAddress = { get(offset: number): unknown };
