/** @fileoverview Source OnDemandCharClass two-locale cache from include/svl/ondemand.hxx. */
import { NativeNumberWrapper } from "../../unotools/source/i18n/nativenumberwrapper";
import { LANGUAGE_SYSTEM } from "../../i18nlangtag/inc/lang";
import { TransliterationFlags } from "../../i18nutil/inc/transliteration";
import type { LocaleConstReference } from "../../udkapi/com/sun/star/lang/Locale";
import { CharClass } from "../../unotools/source/i18n/charclass";
import { TransliterationWrapper } from "../../unotools/source/i18n/transliterationwrapper";

/** Source lazy case-ignore transliteration owner for SvNumberFormatter language changes. */
export class OnDemandTransliterationWrapper {
  private language = LANGUAGE_SYSTEM;
  private type: TransliterationFlags = TransliterationFlags.NONE;
  private wrapper: TransliterationWrapper | null = null;
  private valid = false;
  private initialized = false;

  /** Source initialization flag. @returns Whether init was called. */
  isInitialized(): boolean {
    return this.initialized;
  }

  /** Initializes case-ignore mode and invalidates any existing wrapper. @param language - Initial source language. @returns Nothing. */
  init(language: number): void {
    this.type = TransliterationFlags.IGNORE_CASE;
    this.changeLocale(language);
    this.wrapper?.dispose();
    this.wrapper = null;
    this.initialized = true;
  }

  /** Invalidates the loaded module for a new language. @param language - New source language. @returns Nothing. */
  changeLocale(language: number): void {
    this.valid = false;
    this.language = language;
  }

  /** Source lazy accessor. @returns Borrowed transliteration wrapper. */
  get(): TransliterationWrapper {
    if (!this.valid) {
      this.wrapper ??= new TransliterationWrapper(this.type);
      this.wrapper.loadModuleIfNeeded(this.language);
      this.valid = true;
    }
    return this.wrapper as TransliterationWrapper;
  }

  /** Releases the owned wrapper. @returns Nothing. */
  dispose(): void {
    this.wrapper?.dispose();
    this.wrapper = null;
    this.valid = false;
  }
}

/** Native two-slot classifier owner; each CharClass keeps its construction locale. */
export class OnDemandCharClass {
  private first: CharClass | null = null;
  private second: CharClass | null = null;
  private current = -1;
  /** Original matching-slot selection and alternating replacement. @param locale - Prepared LanguageTag locale. @returns Nothing. */
  changeLocale(locale: LocaleConstReference): void {
    if (this.first?.getMyLocale().equals(locale)) {
      this.current = 0;
      return;
    }
    if (this.second?.getMyLocale().equals(locale)) {
      this.current = 1;
      return;
    }
    if (this.current === -1 || this.current === 1) {
      this.first?.dispose();
      this.first = new CharClass(locale);
      this.current = 0;
    } else {
      this.second?.dispose();
      this.second = new CharClass(locale);
      this.current = 1;
    }
  }
  /** Original selected current classifier. @returns Borrowed current instance. */
  get(): CharClass {
    return (this.current === 0 ? this.first : this.second) as CharClass;
  }
  /** Releases both cached classifier instances. @returns Nothing. */
  dispose(): void {
    this.first?.dispose();
    this.second?.dispose();
    this.first = this.second = null;
    this.current = -1;
  }
}

/** Original on-demand native-number service owner. Context binding is provided by the actual NativeNumberWrapper supplier path. */
export class OnDemandNativeNumberWrapper {
  private moNativeNumber: NativeNumberWrapper | null = null;
  /** Original lazy emplace and same-instance borrow. @returns Actual native-number wrapper. */
  get(): NativeNumberWrapper {
    if (!this.moNativeNumber) this.moNativeNumber = new NativeNumberWrapper();
    return this.moNativeNumber;
  }
}
