/** @fileoverview Source TransliterationWrapper's case-ignore path over the existing native transliteration module. */
import { Exception } from "../../../cppu/inc/com/sun/star/uno/Exception";
import { LANGUAGE_NONE, LANGUAGE_SYSTEM } from "../../../i18nlangtag/inc/lang";
import { convertLanguageToLocale } from "../../../i18nlangtag/source/isolang/mslangid";
import { Transliteration_caseignore } from "../../../i18npool/source/transliteration/transliteration_caseignore";
import { TransliterationFlags } from "../../../i18nutil/inc/transliteration";
import { TransliterationModules } from "../../../offapi/com/sun/star/i18n/TransliterationModules";
import type { OUStringConstReference } from "../../../sal/inc/rtl/ustring";

/** The source wrapper's IGNORE_CASE mode, consumed by the number formatter. */
export class TransliterationWrapper {
  private readonly trans = new Transliteration_caseignore();
  private language = LANGUAGE_SYSTEM;
  private firstCall = true;

  /** Creates the source wrapper for the currently represented IGNORE_CASE mode. @param type - Source mode.  @returns Constructed instance. */
  constructor(private readonly type: TransliterationFlags) {
    if (type !== TransliterationFlags.IGNORE_CASE)
      throw new Error("TransliterationWrapper mode is outside the represented module set");
  }

  /** Returns the source module mode. @returns Mode. */
  getType(): TransliterationFlags {
    return this.type;
  }

  /** Source language-sensitive mode query. @returns Whether mode depends on language. */
  needLanguageForTheMode(): boolean {
    return true;
  }

  /** Loads the native module with the current source language. @returns Nothing. */
  private loadModuleImpl(): void {
    const locale = convertLanguageToLocale(this.language, false);
    try {
      this.trans.loadModule(TransliterationModules.IGNORE_CASE, locale);
    } catch (error) {
      if (!(error instanceof Exception)) throw error;
    } finally {
      locale.dispose();
      this.firstCall = false;
    }
  }

  /** Source first-call and language-change reload rules.  @param language - Language. @returns Nothing. */
  loadModuleIfNeeded(language: number): void {
    let load = this.firstCall;
    this.firstCall = false;
    if (this.language !== language) {
      this.language = language === LANGUAGE_NONE ? LANGUAGE_SYSTEM : language;
      if (!load) load = this.needLanguageForTheMode();
    }
    if (load) this.loadModuleImpl();
  }

  /** Source comparison forwards to the actual case-ignore module and catches only UNO exceptions.  @param first - First. @param pos1 - Pos1. @param count1 - Count1. @param match1 - Match1. @param second - Second. @param pos2 - Pos2. @param count2 - Count2. @param match2 - Match2. @returns The boolean result. */
  equals(
    first: OUStringConstReference,
    pos1: number,
    count1: number,
    match1: [number],
    second: OUStringConstReference,
    pos2: number,
    count2: number,
    match2: [number],
  ): boolean {
    try {
      if (this.firstCall) this.loadModuleImpl();
      return this.trans.equals(first, pos1, count1, match1, second, pos2, count2, match2);
    } catch (error) {
      if (!(error instanceof Exception)) throw error;
      return false;
    }
  }

  /** Source full-string isEqual calls equals with both complete lengths.  @param first - First. @param second - Second. @returns The boolean result. */
  isEqual(first: OUStringConstReference, second: OUStringConstReference): boolean {
    return this.equals(first, 0, first.getLength(), [0], second, 0, second.getLength(), [0]);
  }

  /** Releases the owned native module. @returns Nothing. */
  dispose(): void {
    this.trans.dispose();
  }
}
