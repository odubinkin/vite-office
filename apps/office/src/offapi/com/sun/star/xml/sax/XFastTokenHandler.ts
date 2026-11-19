/** @fileoverview Complete original XFastTokenHandler.idl methods and normal CPPUMaker static type binding; actual source components supply behavior. */
import type { Reference } from "../../../../../../cppu/inc/com/sun/star/uno/Reference";
import type { Type } from "../../../../../../cppu/inc/com/sun/star/uno/Type";
import { UnoType, getTypeFromTypeDescriptionReference } from "../../../../../../cppu/inc/unotype";
import {
  typelib_static_mi_interface_type_init,
  type typelib_TypeDescriptionReference as R,
} from "../../../../../../cppu/inc/typelib/typedescription";
import type {
  Sequence,
  SequenceConstReference,
} from "../../../../../../cppu/inc/com/sun/star/uno/Sequence";
import type { XInterface } from "../../../../../../cppu/inc/com/sun/star/uno/XInterface";
/** Original UNO token-handler interface. */
export interface XFastTokenHandler extends XInterface {
  /** Original getTokenFromUTF8 contract. @param Identifier - Original declared argument. @returns Original declared result. */
  getTokenFromUTF8(Identifier: SequenceConstReference<number>): number;
  /** Original getUTF8Identifier contract. @param Token - Original declared argument. @returns Original declared result. */
  getUTF8Identifier(Token: number): Sequence<number>;
}
const the_type: [R | null] = [null];
/** Original normal generated getter retains its implicit root or explicit direct base through the existing CPPU factory. @returns Borrowed cached type. */
export function cppu_detail_getUnoType(): Type {
  if (the_type[0] === null)
    typelib_static_mi_interface_type_init(
      the_type,
      new TextEncoder().encode("com.sun.star.xml.sax.XFastTokenHandler\0"),
      0,
      null,
    );
  return getTypeFromTypeDescriptionReference(the_type);
}
/** Original deprecated Reference pointer overload. @param reference - Ignored declared pointer. @returns Borrowed type. */
export function getCppuType(reference?: Reference<XFastTokenHandler> | null): Type {
  void reference;
  return UnoType.get(["Reference", cppu_detail_getUnoType]);
}
/** Original generated interface static API. */
export const XFastTokenHandler = Object.freeze({
  /** Original ignored void pointer overload. @param unused - Ignored source pointer. @returns Borrowed type. */
  static_type(unused?: unknown): Type {
    void unused;
    return UnoType.get(cppu_detail_getUnoType);
  },
});
