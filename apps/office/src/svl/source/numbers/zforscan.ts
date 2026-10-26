/** @fileoverview Original standard-name extraction and admitted single-General scanner state/compilation;full language/service initialization and other pattern families remain unported. */
import localizedKeywordLanguages from "./data/keyword-localization.json" with { type: "json" };
import { convertLocaleToLanguage } from "../../../i18nlangtag/source/isolang/mslangid";
import type { XNumberFormatCode } from "../../../offapi/com/sun/star/i18n/XNumberFormatCode";
import { Date as ToolsDate, type DateConstReference } from "../../../tools/source/datetime/tdate";
import { OUString, type OUStringConstReference } from "../../../sal/inc/rtl/ustring";
import type { LocaleConstReference } from "../../../udkapi/com/sun/star/lang/Locale";
import { uppercase } from "../../../unotools/inc/charclass";
import { SvNumFormatType } from "../../inc/zforlist";
import { NfKeywordIndex } from "../../inc/nfkeytab";
import { NfSymbolType } from "../../inc/nfsymbol";
import {
  LANGUAGE_GERMAN,
  LANGUAGE_GERMAN_SWISS,
  LANGUAGE_GERMAN_AUSTRIAN,
  LANGUAGE_GERMAN_LUXEMBOURG,
  LANGUAGE_GERMAN_LIECHTENSTEIN,
} from "../../../i18nlangtag/inc/lang";
import { getLoadedLocale, type LocaleDataWrapper } from "../../../unotools/source/i18n/localedatawrapper";
import type { ImpSvNumberformatInfo } from "./zformat";
/** Original keyword localization enum values from zforscan.hxx. */
export const KeywordLocalization = { LocaleLegacy: 0, EnglishOnly: 1, AllowEnglish: 2 } as const;
/** Original keyword discriminator from nfkeytab.hxx. */
export const NF_KEY_GENERAL = NfKeywordIndex.GENERAL;
/** Original flag set by FinalScan when the General keyword occurs. */
export const FLAG_STANDARD_IN_FORMAT = 1000;

/** Original SetDependentKeywords language anyOf values,generated from the pinned scanner/lang.h. */
const localizedLanguages = new Set(
  localizedKeywordLanguages.map(
    /** Projects the native LanguageType literal. @param entry - Original constant/value. @returns Language ID. */ (
      entry,
    ) => entry.value,
  ),
);
/** Original dependent-General-keyword field preparation uses the loaded Locale,not the requested one. Other keyword families and complete service initialization are separate responsibilities. @param mapper - Actual native code mapper interface. @param loadedLocale - Actual loaded LC_INFO locale. @param localization - Original requested keyword policy. @returns Owned standard name and native selected localization field. */
export function prepareGeneralKeywords(
  mapper: XNumberFormatCode,
  loadedLocale: LocaleConstReference,
  localization: number = KeywordLocalization.AllowEnglish,
): { standardName: OUString; localization: number } {
  if (
    localization !== KeywordLocalization.EnglishOnly &&
    !localizedLanguages.has(convertLocaleToLanguage(loadedLocale))
  )
    localization = KeywordLocalization.EnglishOnly;
  const format = mapper.getFormatCode(0, loadedLocale);
  try {
    return { standardName: extractStandardGeneralName(format.Code), localization };
  } finally {
    format.dispose();
  }
}

/** Original lcl_extractStandardGeneralName pointer walk,including malformed/nested modifier behavior and the first unbracketed semicolon terminator. No regular-expression normalization or synthetic parsed format is introduced. @param code - Actual locale format-code value. @returns Owned standard name. */
export function extractStandardGeneralName(code: OUStringConstReference): OUString {
  let position = 0,
    begin = 0,
    modifier = false,
    done = false;
  const units = code.getStr();
  while (position < code.getLength() && !done) {
    switch (units[position]) {
      case 91:
        modifier = true;
        break;
      case 93:
        if (modifier) {
          modifier = false;
          begin = position + 1;
        }
        break;
      case 59:
        if (!modifier) {
          done = true;
          --position;
        }
        break;
    }
    ++position;
    if (modifier) begin = position;
  }
  return begin < position
    ? new OUString(units.subarray(begin, position), position - begin)
    : new OUString();
}

/** Actual scanner's admitted empty/single-General lexical,type,final and info-copy responsibilities. Constructor inputs project the original current/loaded locale,name and already selected localization fields;full language/service initialization,color,date and other pattern families remain unported. */
export class ImpSvNumberformatScan {
  private readonly sNameStandardFormat: OUString;
  private readonly generalKeyword: OUString;
  private readonly booleanKeyword = new OUString();
  private readonly englishGeneral = new OUString(Uint16Array.of(71, 69, 78, 69, 82, 65, 76), 7);
  private readonly englishTrue = new OUString(Uint16Array.of(84, 82, 85, 69), 4);
  private readonly englishFalse = new OUString(Uint16Array.of(70, 65, 76, 83, 69), 5);
  private readonly trueKeyword = new OUString();
  private readonly falseKeyword = new OUString();
  private readonly symbol = new OUString();
  private nResultStringsCnt = 0;
  private eScannedType: number = SvNumFormatType.UNDEFINED;
  private nThousand = 0;
  private resultTokenType: number = NF_KEY_GENERAL;
  private nStandardPrec = 2;
  private readonly maNullDate = new ToolsDate(30, 12, 1899);
  /** Consumed native scanner constructor/dependent-General-keyword initialization. The caller owns prepared locale fields,as the native language-data owner does. @param locale - Borrowed actual CharClass locale. @param standardName - Actual extracted standard name from loaded locale format0. @param localization - Original selected keyword-localization field after dependent-keyword initialization. @returns Actual scanner state. */
  constructor(
    private locale: LocaleConstReference,
    standardName: OUStringConstReference,
    private localization: number,
    private readonly localeData: LocaleDataWrapper,
  ) {
    this.sNameStandardFormat = new OUString(standardName);
    this.generalKeyword = uppercase(standardName, locale);
    this.SetBooleanKeyword();
  }
  /** Original SetDependentKeywords keeps BOOLEAN English except for localized German dialects. @returns Nothing. */
  private SetBooleanKeyword(): void {
    const loaded = getLoadedLocale(this.locale);
    const language = convertLocaleToLanguage(loaded);
    loaded.dispose();
    const keyword =
      this.localization !== KeywordLocalization.EnglishOnly &&
        [
          LANGUAGE_GERMAN,
          LANGUAGE_GERMAN_SWISS,
          LANGUAGE_GERMAN_AUSTRIAN,
          LANGUAGE_GERMAN_LUXEMBOURG,
          LANGUAGE_GERMAN_LIECHTENSTEIN,
        ].includes(language)
        ? new OUString(Uint16Array.of(76, 79, 71, 73, 83, 67, 72), 7)
        : new OUString(Uint16Array.of(66, 79, 79, 76, 69, 65, 78), 7);
    try {
      this.booleanKeyword.assign(keyword);
    } finally {
      keyword.dispose();
    }
  }
  /** Original GetKeywords()[NF_KEY_BOOLEAN] for built-in format generation. @returns Borrowed keyword. */
  GetBooleanString(): OUStringConstReference {
    return this.booleanKeyword;
  }
  /** Original GetLoc borrows the current language's locale-data wrapper. @returns Current locale data. */
  GetLoc(): LocaleDataWrapper {
    return this.localeData;
  }
  /** Original lazy TRUE_WORD lookup, uppercase conversion and empty-word English fallback. @returns Borrowed uppercase native keyword. */
  GetTrueString(): OUStringConstReference {
    if (this.trueKeyword.isEmpty()) {
      const upper = uppercase(this.localeData.getTrueWord(), this.locale);
      try {
        this.trueKeyword.assign(upper);
        if (this.trueKeyword.isEmpty()) this.trueKeyword.assign(this.englishTrue);
      } finally {
        upper.dispose();
      }
    }
    return this.trueKeyword;
  }
  /** Original lazy FALSE_WORD lookup, uppercase conversion and empty-word English fallback. @returns Borrowed uppercase native keyword. */
  GetFalseString(): OUStringConstReference {
    if (this.falseKeyword.isEmpty()) {
      const upper = uppercase(this.localeData.getFalseWord(), this.locale);
      try {
        this.falseKeyword.assign(upper);
        if (this.falseKeyword.isEmpty()) this.falseKeyword.assign(this.englishFalse);
      } finally {
        upper.dispose();
      }
    }
    return this.falseKeyword;
  }
  /** Original ChangeIntl/next dependent-General-keyword initialization over explicitly prepared current language fields. Scanner identity,parse state and standard precision are preserved;full lazy keyword/service initialization remains unported. @param locale - New actual CharClass locale. @param standardName - Actual loaded-locale standard name. @param localization - Native selected keyword policy. @returns Nothing. */
  ChangeIntl(
    locale: LocaleConstReference,
    standardName: OUStringConstReference,
    localization: number,
  ): void {
    this.locale = locale;
    this.localization = localization;
    this.trueKeyword.clear();
    this.falseKeyword.clear();
    this.sNameStandardFormat.assign(standardName);
    this.SetBooleanKeyword();
    const upper = uppercase(standardName, locale);
    try {
      this.generalKeyword.assign(upper);
    } finally {
      upper.dispose();
    }
  }
  /** Original Reset scalar state for admitted General tokens;the fixed source symbol storage remains owned until destruction. @returns Nothing. */
  Reset(): void {
    this.nResultStringsCnt = 0;
    this.eScannedType = SvNumFormatType.UNDEFINED;
    this.nThousand = 0;
    this.resultTokenType = NF_KEY_GENERAL;
  }
  /** Original null-date member borrow. @returns Actual owned Date value. */
  GetNullDate(): DateConstReference {
    return this.maNullDate;
  }
  /** Original ChangeNullDate validates/normalizes a real Date,then assigns its actual value. The assertion-enabled profile rejects a remaining invalid date;after that assertion the final validity guard is necessarily true. @param day - Native uint16 day. @param month - Native uint16 month. @param year - Native signed16 year. @returns Nothing. */
  ChangeNullDate(day: number, month: number, year: number): void {
    const date = new ToolsDate(day, month, year);
    if (!date.IsValidDate()) {
      date.Normalize();
      if (!date.IsValidDate()) throw new Error("valid null date assertion");
    }
    this.maNullDate.assign(date);
  }
  /** Original precision assignment retains unsigned16 width. @param precision - Native standard precision. @returns Nothing. */
  ChangeStandardPrec(precision: number): void {
    this.nStandardPrec = precision & 65535;
  }
  /** Original precision field default is two before document options are applied. @returns Precision. */
  GetStandardPrec(): number {
    return this.nStandardPrec;
  }
  /** Original result symbol count. @returns Count. */
  GetResultStringsCnt(): number {
    return this.nResultStringsCnt;
  }
  /** Original scanned category. @returns Native type. */
  GetScannedType(): number {
    return this.eScannedType;
  }
  /** Original ScanFormat General path:locale keyword first,optional English recognition,source case retention,NUMBER scan type and FinalScan General flag. Other patterns throw at the explicit unported admission boundary,not as fabricated native syntax errors. @param code - Actual in/out code. @returns Native zero success/control position for admitted paths. */
  ScanFormat(code: OUString): number {
    this.Reset();
    if (code.isEmpty()) return 0;
    const upper = uppercase(code, this.locale);
    try {
      let foundEnglish = false;
      if (code.getLength() === 1 && code.getStr()[0] === 64) {
        this.symbol.assign(code);
        this.eScannedType = SvNumFormatType.TEXT;
        this.resultTokenType = NfSymbolType.DEL;
      } else if (upper.equals(this.booleanKeyword)) {
        this.symbol.assign(code);
        this.eScannedType = SvNumFormatType.LOGICAL;
        this.resultTokenType = NfKeywordIndex.BOOLEAN;
      } else if (!upper.equals(this.generalKeyword)) {
        if (
          this.localization === KeywordLocalization.AllowEnglish &&
          upper.equals(this.englishGeneral)
        )
          foundEnglish = true;
        else
          throw new Error("Number-format patterns other than single General, BOOLEAN or @ are not implemented");
      }
      if (this.eScannedType === SvNumFormatType.UNDEFINED) {
        // Symbol_Division uses original case for a locale keyword and the locale name for an English match.
        this.symbol.assign(foundEnglish ? this.sNameStandardFormat : code);
        this.eScannedType = SvNumFormatType.NUMBER;
        this.nThousand = FLAG_STANDARD_IN_FORMAT;
      }
      this.nResultStringsCnt = 1;
      code.assign(this.symbol);
      return 0;
    } finally {
      upper.dispose();
    }
  }
  /** Original CopyInfo after caller Enlarge;the admitted one-General stream has no EMPTY tokens to skip. @param info - Actual destination owned arrays. @param count - Original valid result count. @returns Nothing. */
  CopyInfo(info: ImpSvNumberformatInfo, count: number): void {
    for (let index = 0; index < count; ++index) {
      (info.sStrArray[index] as OUString).assign(this.symbol);
      info.nTypeArray[index] = this.resultTokenType;
    }
    info.eScannedType = this.eScannedType;
    info.bThousand = false;
    info.nThousand = this.nThousand;
    info.nCntPre = 0;
    info.nCntPost = 0;
    info.nCntExp = 0;
  }
  /** Original scanner string-member destruction following Reset. @returns Nothing. */
  dispose(): void {
    this.Reset();
    this.symbol.dispose();
    this.falseKeyword.dispose();
    this.trueKeyword.dispose();
    this.englishFalse.dispose();
    this.englishTrue.dispose();
    this.englishGeneral.dispose();
    this.generalKeyword.dispose();
    this.booleanKeyword.dispose();
    this.sNameStandardFormat.dispose();
  }
}
