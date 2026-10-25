/** @fileoverview Original XNumberFormatCode.idl four-method consumed interface contract over genuine Locale,NumberFormatCode and Sequence values. This type projection does not claim generated UNO interface ABI,queryInterface/reference counting or service construction. */
import type { LocaleConstReference } from "../../../../../udkapi/com/sun/star/lang/Locale";
import type { Sequence } from "../../../../../cppu/inc/com/sun/star/uno/Sequence";
import type { NumberFormatCode, NumberFormatCodeAddress } from "./NumberFormatCode";
/** Original four IDL method contracts;implementation/service lifetime remains with the actual provider. */
export interface XNumberFormatCode {
  /** Original default code query. @param type - Native short format type. @param usage - Native short usage. @param locale - Borrowed original locale. @returns Owned generated value. */
  getDefault(type: number, usage: number, locale: LocaleConstReference): NumberFormatCode;
  /** Original indexed code query. @param index - Native short format index. @param locale - Borrowed original locale. @returns Owned generated value. */
  getFormatCode(index: number, locale: LocaleConstReference): NumberFormatCode;
  /** Original usage-filtered code query. @param usage - Native short usage. @param locale - Borrowed original locale. @returns Owned genuine Sequence. */
  getAllFormatCode(usage: number, locale: LocaleConstReference): Sequence<NumberFormatCodeAddress>;
  /** Original complete code query. @param locale - Borrowed original locale. @returns Owned genuine Sequence. */
  getAllFormatCodes(locale: LocaleConstReference): Sequence<NumberFormatCodeAddress>;
}
