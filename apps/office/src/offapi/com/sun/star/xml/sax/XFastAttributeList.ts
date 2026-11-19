/** @fileoverview Complete original XFastAttributeList.idl methods and normal CPPUMaker static type binding; actual source components supply behavior. */
import type { Reference } from "../../../../../../cppu/inc/com/sun/star/uno/Reference";
import type { Type } from "../../../../../../cppu/inc/com/sun/star/uno/Type";
import { UnoType, getTypeFromTypeDescriptionReference } from "../../../../../../cppu/inc/unotype";
import {
  typelib_static_mi_interface_type_init,
  type typelib_TypeDescriptionReference as R,
} from "../../../../../../cppu/inc/typelib/typedescription";
import type { Sequence } from "../../../../../../cppu/inc/com/sun/star/uno/Sequence";
import type { Attribute } from "../Attribute";
import type { FastAttribute } from "../FastAttribute";
import type { OUString } from "../../../../../../sal/inc/rtl/ustring";
import type { XInterface } from "../../../../../../cppu/inc/com/sun/star/uno/XInterface";
/** Exposes tokenized and unknown attributes to fast SAX handlers. */ export interface XFastAttributeList extends XInterface {
  /** Original hasAttribute contract. @param Token - Original declared argument. @returns Original declared result. */
  hasAttribute(Token: number): boolean;
  /** Original getValueToken contract. @param Token - Original declared argument. @returns Original declared result. */
  getValueToken(Token: number): number;
  /** Original getOptionalValueToken contract. @param Token - Original declared argument. @param Default - Original declared argument. @returns Original declared result. */
  getOptionalValueToken(Token: number, Default: number): number;
  /** Original getValue contract. @param Token - Original declared argument. @returns Original declared result. */
  getValue(Token: number): OUString;
  /** Original getOptionalValue contract. @param Token - Original declared argument. @returns Original declared result. */
  getOptionalValue(Token: number): OUString;
  /** Original getUnknownAttributes contract. @returns Original declared result. */
  getUnknownAttributes(): Sequence<Attribute>;
  /** Original getFastAttributes contract. @returns Original declared result. */
  getFastAttributes(): Sequence<FastAttribute>;
}
const the_type: [R | null] = [null];
/** Original normal generated getter retains its implicit root or explicit direct base through the existing CPPU factory. @returns Borrowed cached type. */
export function cppu_detail_getUnoType(): Type {
  if (the_type[0] === null)
    typelib_static_mi_interface_type_init(
      the_type,
      new TextEncoder().encode("com.sun.star.xml.sax.XFastAttributeList\0"),
      0,
      null,
    );
  return getTypeFromTypeDescriptionReference(the_type);
}
/** Original deprecated Reference pointer overload. @param reference - Ignored declared pointer. @returns Borrowed type. */
export function getCppuType(reference?: Reference<XFastAttributeList> | null): Type {
  void reference;
  return UnoType.get(["Reference", cppu_detail_getUnoType]);
}
/** Original generated interface static API. */
export const XFastAttributeList = Object.freeze({
  /** Original ignored void pointer overload. @param unused - Ignored source pointer. @returns Borrowed type. */
  static_type(unused?: unknown): Type {
    void unused;
    return UnoType.get(cppu_detail_getUnoType);
  },
});
