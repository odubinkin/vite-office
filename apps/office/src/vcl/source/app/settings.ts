/** @fileoverview Original AllSettings data-language state for application consumers. */
import { LanguageTag } from "../../../i18nlangtag/inc/languagetag";
import { getSystemLocale } from "../../../unotools/source/misc/syslocale";

/** Original application data locale, captured from the system-locale owner. */
export class AllSettings {
  private readonly maLocale: LanguageTag;

  /** Initializes the consumed original maLocale field. @returns Settings. */
  constructor() {
    const locale = getSystemLocale();
    try {
      this.maLocale = new LanguageTag(locale);
    } finally {
      locale.dispose();
    }
  }

  /** Original borrowed application data-language tag for this runtime. @returns Application language tag. */
  GetLanguageTag(): LanguageTag {
    return this.maLocale;
  }
}
