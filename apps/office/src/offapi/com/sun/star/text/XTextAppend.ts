/** @fileoverview Original XTextAppend IDL contract and cppumaker-normal static interface binding; concrete behavior is supplied by actual component owners. */
import type { Reference } from "../../../../../cppu/inc/com/sun/star/uno/Reference";
import type { Type } from "../../../../../cppu/inc/com/sun/star/uno/Type";
import { UnoType, getTypeFromTypeDescriptionReference } from "../../../../../cppu/inc/unotype";
import {
  typelib_static_mi_interface_type_init,
  type typelib_TypeDescriptionReference as R,
} from "../../../../../cppu/inc/typelib/typedescription";
import { XText } from "./XText";
import { XParagraphAppend } from "./XParagraphAppend";
import { XTextPortionAppend } from "./XTextPortionAppend";
/** Original declared methods and direct base; no component implementation is manufactured. */
export interface XTextAppend extends XText, XParagraphAppend, XTextPortionAppend {}

const the_type: [R | null] = [null];
/** Original normal generated getter retains its implicit root or explicit direct base through the existing CPPU factory. @returns Borrowed cached type. */
export function cppu_detail_getUnoType(): Type {
  if (the_type[0] === null)
    typelib_static_mi_interface_type_init(
      the_type,
      new TextEncoder().encode("com.sun.star.text.XTextAppend\0"),
      3,
      [
        XText.static_type().getTypeLibType() as R,
        XParagraphAppend.static_type().getTypeLibType() as R,
        XTextPortionAppend.static_type().getTypeLibType() as R,
      ],
    );
  return getTypeFromTypeDescriptionReference(the_type);
}
/** Original deprecated Reference pointer overload. @param reference - Ignored declared pointer. @returns Borrowed type. */
export function getCppuType(reference?: Reference<XTextAppend> | null): Type {
  void reference;
  return UnoType.get(["Reference", cppu_detail_getUnoType]);
}
/** Original generated interface static API. */
export const XTextAppend = Object.freeze({
  /** Original ignored void pointer overload. @param unused - Ignored source pointer. @returns Borrowed type. */
  static_type(unused?: unknown): Type {
    void unused;
    return UnoType.get(cppu_detail_getUnoType);
  },
});
