/** @fileoverview Original CJK word-service subtypes and their constructor state. */
import { unicode } from "../../../i18nlangtag/source/isolang/isolang.tables";
import { OUString } from "../../../sal/inc/rtl/ustring";
import { Locale } from "../../../udkapi/com/sun/star/lang/Locale";
import { getHangingCharacters } from "../localedata/localedata";
import { BreakIterator_Unicode } from "./breakiterator_unicode";

/** Original CJK subtype inherits all Unicode word operations. */
export class BreakIterator_CJK extends BreakIterator_Unicode {
  protected readonly hangingCharacters = new OUString();

  /** Original CJK implementation identity. @returns CJK iterator. */
  constructor() {
    super();
    this.setImplementationName("BreakIterator_CJK");
  }

  /** Initializes the locale-derived hanging characters and original implementation name. @param language - Source language. @param country - Source country. @param name - Implementation suffix. @returns Nothing. */
  protected initializeLocale(language: string, country: string, name: string): void {
    const lang = unicode(language);
    const region = unicode(country);
    const variant = new OUString();
    const locale = new Locale(lang, region, variant);
    try {
      const characters = getHangingCharacters(locale);
      try {
        this.hangingCharacters.moveAssign(characters);
      } finally {
        characters.dispose();
      }
    } finally {
      locale.dispose();
      variant.dispose();
      region.dispose();
      lang.dispose();
    }
    this.setImplementationName(name);
  }

  /** Assigns the original virtual service identity. @param name - Implementation suffix. @returns Nothing. */
  private setImplementationName(name: string): void {
    const value = unicode("com.sun.star.i18n." + name);
    try {
      this.cBreakIterator.moveAssign(value);
    } finally {
      value.dispose();
    }
  }

  /** Releases the original locale-dependent member. @returns Nothing. */
  protected override destroy(): void {
    this.hangingCharacters.dispose();
    super.destroy();
  }
}

/** Original Chinese mainland component. */
export class BreakIterator_zh extends BreakIterator_CJK {
  /** Original locale and implementation defaults. @returns Chinese mainland iterator. */
  constructor() {
    super();
    this.initializeLocale("zh", "CN", "BreakIterator_zh");
  }
}

/** Original traditional Chinese component. */
export class BreakIterator_zh_TW extends BreakIterator_CJK {
  /** Original locale and implementation defaults. @returns Traditional Chinese iterator. */
  constructor() {
    super();
    this.initializeLocale("zh", "TW", "BreakIterator_zh_TW");
  }
}

/** Original Japanese component. */
export class BreakIterator_ja extends BreakIterator_CJK {
  /** Original locale and implementation defaults. @returns Japanese iterator. */
  constructor() {
    super();
    this.initializeLocale("ja", "JP", "BreakIterator_ja");
  }
}

/** Original Korean component. */
export class BreakIterator_ko extends BreakIterator_CJK {
  /** Original locale and implementation defaults. @returns Korean iterator. */
  constructor() {
    super();
    this.initializeLocale("ko", "KR", "BreakIterator_ko");
  }
}
