/** @fileoverview Original CharClass uppercase overload responsibility exposed as an explicit prepared-locale field binding; full CharClass/service APIs remain pending. */
export { uppercase, CharClass } from "../source/i18n/charclass";

import type { OUString, OUStringConstReference } from "../../sal/inc/rtl/ustring";
/** Borrowed const CharClass operation consumed by SharedStringPool. This erased contract neither constructs a classification service nor claims the remaining CharClass API. */
export interface CharClassUppercaseReference {
  /** Original whole-string operation on the classifier's existing locale state. @param value - Actual source. @returns Owned uppercase value. */
  uppercase(value: OUStringConstReference): OUString;
}
