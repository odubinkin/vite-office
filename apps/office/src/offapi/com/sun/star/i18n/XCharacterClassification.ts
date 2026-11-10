/** @fileoverview Original XCharacterClassification type and consumed case operations. */
import type { Type } from "../../../../../cppu/inc/com/sun/star/uno/Type";
import type { XInterface } from "../../../../../cppu/inc/com/sun/star/uno/XInterface";
import { UnoType, getTypeFromTypeDescriptionReference } from "../../../../../cppu/inc/unotype";
import {
  typelib_static_mi_interface_type_init,
  type typelib_TypeDescriptionReference as R,
} from "../../../../../cppu/inc/typelib/typedescription";
import type { OUString, OUStringConstReference } from "../../../../../sal/inc/rtl/ustring";
import type { LocaleConstReference } from "../../../../../udkapi/com/sun/star/lang/Locale";

/** Original counted case methods consumed by the native number supplier. */
export interface XCharacterClassification extends XInterface {
  /** Original uppercase mapping. @param input - Text. @param position - Native start. @param count - Native length. @param locale - Locale. @returns Owned string. */
  toUpper(
    input: OUStringConstReference,
    position: number,
    count: number,
    locale: LocaleConstReference,
  ): OUString;
  /** Original lowercase mapping. @param input - Text. @param position - Native start. @param count - Native length. @param locale - Locale. @returns Owned string. */
  toLower(
    input: OUStringConstReference,
    position: number,
    count: number,
    locale: LocaleConstReference,
  ): OUString;
  /** Original title mapping. @param input - Text. @param position - Native start. @param count - Native length. @param locale - Locale. @returns Owned string. */
  toTitle(
    input: OUStringConstReference,
    position: number,
    count: number,
    locale: LocaleConstReference,
  ): OUString;
}

const the_type: [R | null] = [null];
/** Original generated interface type getter. @returns Borrowed registered type. */
export function cppu_detail_getUnoType(): Type {
  if (the_type[0] === null)
    typelib_static_mi_interface_type_init(
      the_type,
      new TextEncoder().encode("com.sun.star.i18n.XCharacterClassification\0"),
      0,
      null,
    );
  return getTypeFromTypeDescriptionReference(the_type);
}

/** Original generated declaration used by WeakImplHelper and UNO_QUERY. */
export const XCharacterClassification = Object.freeze({
  /** Original static type selection. @returns Borrowed type. */
  static_type(): Type {
    return UnoType.get(cppu_detail_getUnoType);
  },
});
