/** @fileoverview Original sal/osl/unx/process_impl.cxx process-locale cache and native pthread locking. */
import type { rtl_Locale } from "../../inc/rtl/locale";
import { oslProcessError } from "../../inc/osl/process";
import { lockProcessLocale, unlockProcessLocale } from "../../../external/emscripten/locale";
import { imp_getProcessLocale } from "./nlsupport";
const g_process_locale: [rtl_Locale | null] = [null];
/** Original lazy getter, retaining Unknown for a null output pointer. @param result - Output pointer slot or null. @returns Original process status. */
export function osl_getProcessLocale(result: [rtl_Locale | null] | null): oslProcessError {
  let error = oslProcessError.Unknown;
  if (result) {
    lockProcessLocale();
    try {
      if (g_process_locale[0] === null) imp_getProcessLocale(g_process_locale);
      result[0] = g_process_locale[0];
      error = oslProcessError.None;
    } finally {
      unlockProcessLocale();
    }
  }
  return error;
}
/** Original setter stores the supplied pointer; its null debug precondition is not a release rejection. @param locale - Source locale pointer. @returns Original success status. */
export function osl_setProcessLocale(locale: rtl_Locale | null): oslProcessError {
  lockProcessLocale();
  try {
    g_process_locale[0] = locale;
  } finally {
    unlockProcessLocale();
  }
  return oslProcessError.None;
}
