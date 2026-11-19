/** @fileoverview Complete original XFastContextHandler.idl methods and normal CPPUMaker static type binding; actual source components supply behavior. */
import type { Reference } from "../../../../../../cppu/inc/com/sun/star/uno/Reference";
import type { Type } from "../../../../../../cppu/inc/com/sun/star/uno/Type";
import { UnoType, getTypeFromTypeDescriptionReference } from "../../../../../../cppu/inc/unotype";
import {
  typelib_static_mi_interface_type_init,
  type typelib_TypeDescriptionReference as R,
} from "../../../../../../cppu/inc/typelib/typedescription";
import type { OUStringConstReference } from "../../../../../../sal/inc/rtl/ustring";
import type { XFastAttributeList } from "./XFastAttributeList";
import type { XInterface } from "../../../../../../cppu/inc/com/sun/star/uno/XInterface";
/** Receives element content and creates child contexts during fast SAX parsing. */ export interface XFastContextHandler extends XInterface {
  /** Original startFastElement contract. @param Element - Original declared argument. @param Attribs - Original declared argument. @returns Original declared result. */
  startFastElement(Element: number, Attribs: Reference<XFastAttributeList>): void;
  /** Original startUnknownElement contract. @param Namespace - Original declared argument. @param Name - Original declared argument. @param Attribs - Original declared argument. @returns Original declared result. */
  startUnknownElement(
    Namespace: OUStringConstReference,
    Name: OUStringConstReference,
    Attribs: Reference<XFastAttributeList>,
  ): void;
  /** Original endFastElement contract. @param Element - Original declared argument. @returns Original declared result. */
  endFastElement(Element: number): void;
  /** Original endUnknownElement contract. @param Namespace - Original declared argument. @param Name - Original declared argument. @returns Original declared result. */
  endUnknownElement(Namespace: OUStringConstReference, Name: OUStringConstReference): void;
  /** Original createFastChildContext contract. @param Element - Original declared argument. @param Attribs - Original declared argument. @returns Original declared result. */
  createFastChildContext(
    Element: number,
    Attribs: Reference<XFastAttributeList>,
  ): Reference<XFastContextHandler>;
  /** Original createUnknownChildContext contract. @param Namespace - Original declared argument. @param Name - Original declared argument. @param Attribs - Original declared argument. @returns Original declared result. */
  createUnknownChildContext(
    Namespace: OUStringConstReference,
    Name: OUStringConstReference,
    Attribs: Reference<XFastAttributeList>,
  ): Reference<XFastContextHandler>;
  /** Original characters contract. @param aChars - Original declared argument. @returns Original declared result. */
  characters(aChars: OUStringConstReference): void;
}
const the_type: [R | null] = [null];
/** Original normal generated getter retains its implicit root or explicit direct base through the existing CPPU factory. @returns Borrowed cached type. */
export function cppu_detail_getUnoType(): Type {
  if (the_type[0] === null)
    typelib_static_mi_interface_type_init(
      the_type,
      new TextEncoder().encode("com.sun.star.xml.sax.XFastContextHandler\0"),
      0,
      null,
    );
  return getTypeFromTypeDescriptionReference(the_type);
}
/** Original deprecated Reference pointer overload. @param reference - Ignored declared pointer. @returns Borrowed type. */
export function getCppuType(reference?: Reference<XFastContextHandler> | null): Type {
  void reference;
  return UnoType.get(["Reference", cppu_detail_getUnoType]);
}
/** Original generated interface static API. */
export const XFastContextHandler = Object.freeze({
  /** Original ignored void pointer overload. @param unused - Ignored source pointer. @returns Borrowed type. */
  static_type(unused?: unknown): Type {
    void unused;
    return UnoType.get(cppu_detail_getUnoType);
  },
});
