/** @fileoverview Consumed script and word methods of the original XBreakIterator IDL and its registered UNO type. */
export interface XBreakIterator {
  /** Queries a codepoint at a UTF16 position. @param text - Logical UTF16 string view. @param position - Code-unit index. @returns ScriptType. */
  getScriptType(text: Uint16Array, position: number): number;
  /** Finds the end of a script run. @param text - Logical UTF16 string view. @param position - Initial code-unit offset. @param scriptType - Expected initial class. @returns Code-unit boundary or minus one. */
  endOfScript(text: Uint16Array, position: number, scriptType: number): number;
}

import type { Type } from "../../../../../cppu/inc/com/sun/star/uno/Type";
import type { XInterface } from "../../../../../cppu/inc/com/sun/star/uno/XInterface";
import { UnoType, getTypeFromTypeDescriptionReference } from "../../../../../cppu/inc/unotype";
import {
  typelib_static_mi_interface_type_init,
  type typelib_TypeDescriptionReference as R,
} from "../../../../../cppu/inc/typelib/typedescription";
import type { OUStringConstReference } from "../../../../../sal/inc/rtl/ustring";
import type { LocaleConstReference } from "../../../../../udkapi/com/sun/star/lang/Locale";
import type { Boundary } from "./Boundary";

/** Original consumed UNO word service and existing script operations. */
export interface XBreakIteratorService extends XInterface, XBreakIterator {
  /** Original deprecated query returns zero for all inputs. @param text - Counted input. @param position - Native offset. @param locale - Native locale. @returns Zero. */
  getWordType(text: OUStringConstReference, position: number, locale: LocaleConstReference): number;
  /** Original next-word boundary query. @param text - Input. @param position - Native offset. @param locale - Requested locale. @param wordType - Native word mode. @returns Boundary. */
  nextWord(
    text: OUStringConstReference,
    position: number,
    locale: LocaleConstReference,
    wordType: number,
  ): Boundary;
  /** Original previous-word boundary query. @param text - Input. @param position - Native offset. @param locale - Requested locale. @param wordType - Native word mode. @returns Boundary. */
  previousWord(
    text: OUStringConstReference,
    position: number,
    locale: LocaleConstReference,
    wordType: number,
  ): Boundary;
  /** Original directional word boundary. @param text - Input. @param position - Native offset. @param locale - Requested locale. @param wordType - Native word mode. @param direction - Forward preference. @returns Boundary. */
  getWordBoundary(
    text: OUStringConstReference,
    position: number,
    locale: LocaleConstReference,
    wordType: number,
    direction: boolean,
  ): Boundary;
}

const the_type: [R | null] = [null];
/** Original generated interface type getter. @returns Borrowed registered type. */
export function cppu_detail_getUnoType(): Type {
  if (the_type[0] === null)
    typelib_static_mi_interface_type_init(
      the_type,
      new TextEncoder().encode("com.sun.star.i18n.XBreakIterator\0"),
      0,
      null,
    );
  return getTypeFromTypeDescriptionReference(the_type);
}

/** Original generated declaration used by WeakImplHelper and UNO_QUERY. */
export const XBreakIterator = Object.freeze({
  /** Original static type selection. @returns Borrowed type. */
  static_type(): Type {
    return UnoType.get(cppu_detail_getUnoType);
  },
});
