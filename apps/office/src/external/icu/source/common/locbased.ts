/** @fileoverview Original ICU78.3 LocaleBased shared valid/actual locale contract from locbased.cpp. Native locale references use actual Locale owners and immutable borrowed views. */
import { Locale, type LocaleConstReference } from "./locid";
import { UErrorCode as E, U_FAILURE } from "./unicode/utypes";
/** Original utility with no separately stored locale state. */
// eslint-disable-next-line @typescript-eslint/no-extraneous-class -- Preserve the original static-only LocaleBased utility class.
export class LocaleBased {
  /** Original borrowed metadata selection; failure and unknown enum return root, setting error only for a new invalid enum. @param valid - Valid locale. @param actual - Actual locale. @param type - ACTUAL0/VALID1. @param status - Sticky status. @returns Borrowed locale. */
  static getLocale(
    valid: LocaleConstReference,
    actual: LocaleConstReference,
    type: number,
    status: [number],
  ): LocaleConstReference {
    if (U_FAILURE(status[0])) return Locale.getRoot();
    switch (type | 0) {
      case 1:
        return valid;
      case 0:
        return actual;
      default:
        status[0] = E.U_ILLEGAL_ARGUMENT_ERROR;
        return Locale.getRoot();
    }
  }
  /** Original ID uses literal root rather than the empty normalized root Locale name. @param valid - Valid locale. @param actual - Actual locale. @param type - Enum. @param status - Status. @returns Borrowed name/root/null. */
  static getLocaleID(
    valid: LocaleConstReference,
    actual: LocaleConstReference,
    type: number,
    status: [number],
  ): string | null {
    const locale = this.getLocale(valid, actual, type, status);
    if (U_FAILURE(status[0])) return null;
    return locale.equals(Locale.getRoot()) ? "root" : locale.getName();
  }
}
