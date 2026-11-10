/** @fileoverview Original ICU stock word instance construction from named brkitr resources. */
import { registerBrkitrCommonData } from "../data/in/icudt78l.brkitr";
import { Locale } from "./locid";
import { RuleBasedBreakIterator } from "./rbbi";
import { U_ICUDATA_BRKITR } from "./ubrkimpl";
import { udata_open } from "./unicode/udata";
import { ULocDataLocaleType } from "./unicode/uloc";
import { UErrorCode as E, U_FAILURE } from "./unicode/utypes";
import {
  ures_close,
  ures_getByKeyWithFallback,
  ures_getLocaleByType,
  ures_getString,
} from "./uresbund";
import { ures_openNoDefault } from "./uresbund.lifecycle";
import { UResourceBundle } from "./uresimp";

/** Original BreakIterator::buildInstance for the stock word resource. @param locale - Requested locale. @param status - Sticky source status. @returns Owned rule iterator or null. */
export function createWordInstance(
  locale: Locale,
  status: [number],
): RuleBasedBreakIterator | null {
  if (U_FAILURE(status[0])) return null;
  const root = ures_openNoDefault(U_ICUDATA_BRKITR, locale.getName(), status);
  const rules = new UResourceBundle();
  const name = new UResourceBundle();
  try {
    let actual: Locale;
    let extension: string;
    let fileName: string;
    try {
      ures_getByKeyWithFallback(root, "boundaries", rules, status);
      ures_getByKeyWithFallback(rules, "word", name, status);
      const length: [number] = [0];
      const filename = ures_getString(name, length, status);
      if (U_FAILURE(status[0]) || filename === null) return null;
      if (length[0] >= 256) {
        status[0] = E.U_BUFFER_OVERFLOW_ERROR;
        return null;
      }
      actual = new Locale(
        ures_getLocaleByType(name, ULocDataLocaleType.ULOC_ACTUAL_LOCALE, status),
      );
      const dot = filename.indexOf(".");
      extension = dot < 0 ? "" : filename.slice(dot + 1, dot + 4);
      fileName = dot < 0 ? "" : filename.slice(0, dot);
    } finally {
      ures_close(rules);
      ures_close(name);
    }
    registerBrkitrCommonData(status);
    const memory = udata_open(U_ICUDATA_BRKITR, extension, fileName, status);
    if (U_FAILURE(status[0]) || memory === null) return null;
    const result = new RuleBasedBreakIterator(memory, status);
    if (!U_FAILURE(status[0])) {
      const valid = new Locale(
        ures_getLocaleByType(root, ULocDataLocaleType.ULOC_VALID_LOCALE, status),
      );
      result.setLocaleIDs(locale, valid, actual);
    }
    if (U_FAILURE(status[0])) {
      result.dispose();
      return null;
    }
    return result;
  } finally {
    ures_close(root);
  }
}
