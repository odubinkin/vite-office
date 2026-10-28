/** @fileoverview Actual formatter color suppliers for isolated language-state tests; no callback or locale service is mocked. */
import { onTestFinished } from "vitest";
import type { XNumberFormatCode } from "../offapi/com/sun/star/i18n/XNumberFormatCode";
import { SvNumberFormatter, SvNFLanguageData } from "../svl/source/numbers/zforlist";
/** Creates the original separate language owner with a real formatter color reference. The caller disposes the language; the callback supplier outlives it until test cleanup. @param mapper - Actual prepared provider. @param language - Native language ID. @returns Actual language owner. */
export function createNumberFormatLanguage(
  mapper: XNumberFormatCode,
  language: number,
): SvNFLanguageData {
  const callback = new SvNumberFormatter(language);
  onTestFinished(
    /** Destroys the genuine callback supplier after borrowed scanner lifetimes end. @returns Nothing. */ () =>
      callback.dispose(),
  );
  return new SvNFLanguageData(mapper, language, callback);
}
