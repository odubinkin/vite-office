/** @fileoverview Original XSimpleText IDL contract and cppumaker-normal static interface binding; concrete behavior is supplied by actual component owners. */
import type { Reference } from "../../../../../cppu/inc/com/sun/star/uno/Reference";
import type { Type } from "../../../../../cppu/inc/com/sun/star/uno/Type";
import { UnoType, getTypeFromTypeDescriptionReference } from "../../../../../cppu/inc/unotype";
import {
  typelib_static_mi_interface_type_init,
  type typelib_TypeDescriptionReference as R,
} from "../../../../../cppu/inc/typelib/typedescription";
import { XTextRange } from "./XTextRange";
import type { XTextCursor } from "./XTextCursor";
import type { OUStringConstReference } from "../../../../../sal/inc/rtl/ustring";
/** Original declared methods and direct base; no component implementation is manufactured. */
export interface XSimpleText extends XTextRange {
  /** Original createTextCursor contract. @returns Original Reference<XTextCursor> result. */
  createTextCursor(): Reference<XTextCursor>;
  /** Original createTextCursorByRange contract. @param aTextPosition - Original declared argument. @returns Original Reference<XTextCursor> result. */
  createTextCursorByRange(aTextPosition: Reference<XTextRange>): Reference<XTextCursor>;
  /** Original insertString contract. @param xRange - Original declared argument. @param aString - Original declared argument. @param bAbsorb - Original declared argument. @returns Original void result. */
  insertString(
    xRange: Reference<XTextRange>,
    aString: OUStringConstReference,
    bAbsorb: boolean,
  ): void;
  /** Original insertControlCharacter contract. @param xRange - Original declared argument. @param nControlCharacter - Original declared argument. @param bAbsorb - Original declared argument. @returns Original void result. */
  insertControlCharacter(
    xRange: Reference<XTextRange>,
    nControlCharacter: number,
    bAbsorb: boolean,
  ): void;
}
const the_type: [R | null] = [null];
/** Original normal generated getter retains its implicit root or explicit direct base through the existing CPPU factory. @returns Borrowed cached type. */
export function cppu_detail_getUnoType(): Type {
  if (the_type[0] === null)
    typelib_static_mi_interface_type_init(
      the_type,
      new TextEncoder().encode("com.sun.star.text.XSimpleText\0"),
      1,
      [XTextRange.static_type().getTypeLibType() as R],
    );
  return getTypeFromTypeDescriptionReference(the_type);
}
/** Original deprecated Reference pointer overload. @param reference - Ignored declared pointer. @returns Borrowed type. */
export function getCppuType(reference?: Reference<XSimpleText> | null): Type {
  void reference;
  return UnoType.get(["Reference", cppu_detail_getUnoType]);
}
/** Original generated interface static API. */
export const XSimpleText = Object.freeze({
  /** Original ignored void pointer overload. @param unused - Ignored source pointer. @returns Borrowed type. */
  static_type(unused?: unknown): Type {
    void unused;
    return UnoType.get(cppu_detail_getUnoType);
  },
});
