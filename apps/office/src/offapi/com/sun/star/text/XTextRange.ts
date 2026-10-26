/** @fileoverview Original XTextRange IDL contract and cppumaker-normal static interface binding; concrete behavior is supplied by actual component owners. */
import type { Reference } from "../../../../../cppu/inc/com/sun/star/uno/Reference";
import type { Type } from "../../../../../cppu/inc/com/sun/star/uno/Type";
import { UnoType, getTypeFromTypeDescriptionReference } from "../../../../../cppu/inc/unotype";
import {
  typelib_static_mi_interface_type_init,
  type typelib_TypeDescriptionReference as R,
} from "../../../../../cppu/inc/typelib/typedescription";
import type { XInterface } from "../../../../../cppu/inc/com/sun/star/uno/XInterface";
import type { XText } from "./XText";
import type { OUString, OUStringConstReference } from "../../../../../sal/inc/rtl/ustring";
/** Original declared methods and direct base; no component implementation is manufactured. */
export interface XTextRange extends XInterface {
  /** Original getText contract. @returns Original Reference<XText> result. */
  getText(): Reference<XText>;
  /** Original getStart contract. @returns Original Reference<XTextRange> result. */
  getStart(): Reference<XTextRange>;
  /** Original getEnd contract. @returns Original Reference<XTextRange> result. */
  getEnd(): Reference<XTextRange>;
  /** Original getString contract. @returns Original OUString result. */
  getString(): OUString;
  /** Original setString contract. @param aString - Original declared argument. @returns Original void result. */
  setString(aString: OUStringConstReference): void;
}
const the_type: [R | null] = [null];
/** Original normal generated getter retains its implicit root or explicit direct base through the existing CPPU factory. @returns Borrowed cached type. */
export function cppu_detail_getUnoType(): Type {
  if (the_type[0] === null)
    typelib_static_mi_interface_type_init(
      the_type,
      new TextEncoder().encode("com.sun.star.text.XTextRange\0"),
      0,
      null,
    );
  return getTypeFromTypeDescriptionReference(the_type);
}
/** Original deprecated Reference pointer overload. @param reference - Ignored declared pointer. @returns Borrowed type. */
export function getCppuType(reference?: Reference<XTextRange> | null): Type {
  void reference;
  return UnoType.get(["Reference", cppu_detail_getUnoType]);
}
/** Original generated interface static API. */
export const XTextRange = Object.freeze({
  /** Original ignored void pointer overload. @param unused - Ignored source pointer. @returns Borrowed type. */
  static_type(unused?: unknown): Type {
    void unused;
    return UnoType.get(cppu_detail_getUnoType);
  },
});
