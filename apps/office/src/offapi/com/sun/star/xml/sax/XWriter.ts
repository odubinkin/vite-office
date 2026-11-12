/** @fileoverview Original XWriter IDL and normal generated CPPUMaker type binding; actual component owners supply the declared methods. */
import type { Reference } from "../../../../../../cppu/inc/com/sun/star/uno/Reference";
import type { Type } from "../../../../../../cppu/inc/com/sun/star/uno/Type";
import { UnoType, getTypeFromTypeDescriptionReference } from "../../../../../../cppu/inc/unotype";
import {
  typelib_static_mi_interface_type_init,
  type typelib_TypeDescriptionReference as R,
} from "../../../../../../cppu/inc/typelib/typedescription";
import { XActiveDataSource } from "../../../../../../udkapi/com/sun/star/io/XActiveDataSource";
import { XExtendedDocumentHandler } from "./XExtendedDocumentHandler";
import type { Sequence } from "../../../../../../cppu/inc/com/sun/star/uno/Sequence";
import type { PairStringString } from "../../../../../../udkapi/com/sun/star/beans/Pair";
/** Complete original two-base interface; the consumed Pair template argument binds actual generated native storage. */
export interface XWriter extends XActiveDataSource, XExtendedDocumentHandler {
  /** Original custom entity table assignment. @param replacements - Actual consumed native pair sequence. @returns Nothing. */
  setCustomEntityNames(replacements: Sequence<PairStringString>): void;
}
const the_type: [R | null] = [null];
/** Original normal generated getter retains its implicit root or explicit direct base through the existing CPPU factory. @returns Borrowed cached type. */
export function cppu_detail_getUnoType(): Type {
  if (the_type[0] === null)
    typelib_static_mi_interface_type_init(
      the_type,
      new TextEncoder().encode("com.sun.star.xml.sax.XWriter\0"),
      2,
      [
        XActiveDataSource.static_type().getTypeLibType() as R,
        XExtendedDocumentHandler.static_type().getTypeLibType() as R,
      ],
    );
  return getTypeFromTypeDescriptionReference(the_type);
}
/** Original deprecated Reference pointer overload. @param reference - Ignored declared pointer. @returns Borrowed type. */
export function getCppuType(reference?: Reference<XWriter> | null): Type {
  void reference;
  return UnoType.get(["Reference", cppu_detail_getUnoType]);
}
/** Original generated interface static API. */
export const XWriter = Object.freeze({
  /** Original ignored void pointer overload. @param unused - Ignored source pointer. @returns Borrowed type. */
  static_type(unused?: unknown): Type {
    void unused;
    return UnoType.get(cppu_detail_getUnoType);
  },
});
