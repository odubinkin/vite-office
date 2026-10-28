/** @fileoverview Original format-scanner ownership, loaded-locale keyword/currency initialization and lexical/type state. Complete lexical/type/final format scanning preserves the original pipeline; remaining format constructor/output/generator closure is separate. */
import { LANGUAGE_DONTKNOW, LANGUAGE_THAI } from "../../../i18nlangtag/inc/lang";
import { unicode, text } from "../../../i18nlangtag/source/isolang/isolang.tables";
import type { CharClass } from "../../../unotools/source/i18n/charclass";
import type { SvNFLanguageData, SvNumberFormatter } from "./zforlist";
import { sEnglishKeyword, SetDependentKeywordOverrides } from "./zforscan.keywords";
import { convertLocaleToLanguage } from "../../../i18nlangtag/source/isolang/mslangid";
import type { XNumberFormatCode } from "../../../offapi/com/sun/star/i18n/XNumberFormatCode";
import { OUString, type OUStringConstReference } from "../../../sal/inc/rtl/ustring";
import { Date as ToolsDate, type DateConstReference } from "../../../tools/source/datetime/tdate";
import {
  getLoadedLocale,
  type LocaleDataWrapper,
} from "../../../unotools/source/i18n/localedatawrapper";
import { NfKeywordIndex } from "../../inc/nfkeytab";
import { NfSymbolType } from "../../inc/nfsymbol";
import { NF_MAX_FORMAT_SYMBOLS, SvNumFormatType } from "../../inc/zforlist";
import {
  GetKeyWord,
  Next_Symbol,
  Symbol_Division,
  SkipStrings,
  PreviousKeyword,
  NextKeyword,
  PreviousType,
  PreviousChar,
  NextChar,
  IsLastBlankBeforeFrac,
  Is100SecZero,
} from "./zforscan.lex";
import { GetColor, StandardColor, NF_MAX_DEFAULT_COLORS } from "./zforscan.color";
import type { Color } from "../../../tools/inc/color";
import { FinalScan } from "./zforscan.final";
import { RemoveQuotes } from "./zforscan.final-common";
import { FinalScanGetCalendar, IsDateFragment, SwapArrayElements } from "./zforscan.calendar";
import { ScanType, InsertSymbol } from "./zforscan.type";
import localizedKeywordLanguages from "./data/keyword-localization.json" with { type: "json" };
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

/** Original scanner owner, fixed token arrays and current-language reference. The full original lexical/type/final scanning pipeline uses source responsibility fragments. The prepared XNumberFormatCode binding is the actual provider, not a replacement service manager. */
export class ImpSvNumberformatScan {
  protected readonly sKeyword = Array.from(
    { length: NfKeywordIndex.KEYWORD_ENTRIES_COUNT },
    /** Original default constructed keyword member. @returns Empty owner. */ () => new OUString(),
  );
  protected readonly sStrArray = Array.from(
    { length: NF_MAX_FORMAT_SYMBOLS },
    /** Original fixed string member. @returns Empty owner. */ () => new OUString(),
  );
  protected readonly nTypeArray = new Int16Array(NF_MAX_FORMAT_SYMBOLS);
  protected readonly sNameStandardFormat = new OUString();
  protected readonly sCurSymbol = new OUString();
  protected readonly sCurString = new OUString();
  protected readonly sCurAbbrev = new OUString();
  protected readonly sBooleanEquivalent1 = new OUString();
  protected readonly sBooleanEquivalent2 = new OUString();
  protected bKeywordsNeedInit = true;
  protected bCompatCurNeedInit = true;
  protected nResultStringsCnt = 0;
  protected eScannedType: number = SvNumFormatType.UNDEFINED;
  protected bThousand = false;
  protected nThousand = 0;
  protected nCntPre = 0;
  protected nCntPost = 0;
  protected nCntExp = 0;
  protected nStringsCnt = 0;
  protected nExpPos = 65535;
  protected nBlankPos = 65535;
  protected nDecPos = -1;
  protected bExp = false;
  protected bFrac = false;
  protected bBlank = false;
  protected bDecSep = false;
  protected bConvertMode = false;
  protected mbConvertDateOrder = false;
  protected bConvertSystemToSystem = false;
  protected eNewLnge = LANGUAGE_DONTKNOW;
  protected eTmpLnge = LANGUAGE_DONTKNOW;
  protected nCurrPos = -1;
  protected nNatNumModifier = 0;
  protected meKeywordLocalization: number = KeywordLocalization.AllowEnglish;
  private nStandardPrec = 2;
  private readonly maNullDate: ToolsDate;
  /** Original reference-owned language state, provider field and optional copied null date. The native color supplier is the actual formatter reference. @param mrCurrentLanguageData - Actual owner. @param mrColorCallback - Actual formatter color supplier. @param xNFC - Actual prepared service binding. @param nullDate - Native date default. @returns Scanner owner. */
  constructor(
    protected readonly mrCurrentLanguageData: SvNFLanguageData,
    protected readonly mrColorCallback: SvNumberFormatter,
    protected readonly xNFC: XNumberFormatCode,
    nullDate: DateConstReference = new ToolsDate(30, 12, 1899),
  ) {
    this.maNullDate = new ToolsDate(nullDate);
    this.Reset();
  }
  /** Original borrowed color callback supplier. @returns Actual formatter. */
  getColorCallback(): SvNumberFormatter {
    return this.mrColorCallback;
  }
  /** Original color prefix lookup. @param name - Mutable prefix. @returns Borrowed color or null. */
  GetColor(name: OUString): Color | null {
    return GetColor.call(this, name);
  }
  /** Original const color-vector borrow. @returns Actual palette. */
  static GetStandardColors(): readonly Color[] {
    return StandardColor;
  }
  /** Original standard color count. @returns Native bound. */
  static GetStandardColorCount(): number {
    return NF_MAX_DEFAULT_COLORS;
  }
  /** Original standard red color borrow. @returns Palette red. */
  static GetRedColor(): Color {
    return StandardColor[4] as Color;
  }
  /** Original current-language classifier borrow. @returns Actual classifier. */
  GetChrCls(): CharClass {
    return this.mrCurrentLanguageData.GetCharClass();
  }
  /** Original current-language locale wrapper borrow. @returns Actual wrapper. */
  GetLoc(): LocaleDataWrapper {
    return this.mrCurrentLanguageData.GetLocaleData();
  }
  /** Original current-language owner borrow. @returns Original owner. */
  GetCurrentLanguageData(): SvNFLanguageData {
    return this.mrCurrentLanguageData;
  }
  /** Original lazy keyword table query. @returns Borrowed const table. */
  GetKeywords(): readonly OUStringConstReference[] {
    if (this.bKeywordsNeedInit) this.InitKeywords();
    return this.sKeyword;
  }
  /** Original static English keyword table. @returns Borrowed const table. */
  static GetEnglishKeywords(): readonly OUStringConstReference[] {
    return sEnglishKeyword;
  }
  /** Original lazy special word query does not force complete keyword initialization. @param index - Source special keyword. @returns Borrowed member. */
  GetSpecialKeyword(index: number): OUStringConstReference {
    const value = this.sKeyword[index] as OUString;
    if (value.isEmpty()) this.InitSpecialKeyword(index);
    return value;
  }
  /** Original TRUE shortcut. @returns Borrowed keyword. */
  GetTrueString(): OUStringConstReference {
    return this.GetSpecialKeyword(NfKeywordIndex.TRUE);
  }
  /** Original FALSE shortcut. @returns Borrowed keyword. */
  GetFalseString(): OUStringConstReference {
    return this.GetSpecialKeyword(NfKeywordIndex.FALSE);
  }
  /** Original BOOLEAN shortcut. @returns Borrowed keyword. */
  GetBooleanString(): OUStringConstReference {
    return this.GetKeywords()[NfKeywordIndex.BOOLEAN] as OUStringConstReference;
  }
  /** Original RED shortcut. @returns Borrowed keyword. */
  GetRedString(): OUStringConstReference {
    return this.GetKeywords()[NfKeywordIndex.RED] as OUStringConstReference;
  }
  /** Original standard name forces complete keyword initialization. @returns Borrowed original-case name. */
  GetStandardName(): OUStringConstReference {
    if (this.bKeywordsNeedInit) this.InitKeywords();
    return this.sNameStandardFormat;
  }
  /** Original compatibility symbol query. @returns Borrowed symbol. */
  GetCurSymbol(): OUStringConstReference {
    if (this.bCompatCurNeedInit) this.InitCompatCur();
    return this.sCurSymbol;
  }
  /** Original compatibility bank abbreviation query. @returns Borrowed abbreviation. */
  GetCurAbbrev(): OUStringConstReference {
    if (this.bCompatCurNeedInit) this.InitCompatCur();
    return this.sCurAbbrev;
  }
  /** Original uppercase compatibility currency query. @returns Borrowed uppercase symbol. */
  GetCurString(): OUStringConstReference {
    if (this.bCompatCurNeedInit) this.InitCompatCur();
    return this.sCurString;
  }
  /** Original locale invalidation retains precision, parse state and keyword members except lazy TRUE/FALSE clearing. @param mode - Keyword-localization setting. @returns Nothing. */
  ChangeIntl(mode: number = KeywordLocalization.AllowEnglish): void {
    this.meKeywordLocalization = mode;
    this.bKeywordsNeedInit = true;
    this.bCompatCurNeedInit = true;
    (this.sKeyword[NfKeywordIndex.TRUE] as OUString).clear();
    (this.sKeyword[NfKeywordIndex.FALSE] as OUString).clear();
  }
  /** Original special-word initialization and English fallback. Other indices only trigger a native diagnostic and do not mutate fields. @param index - Keyword. @returns Nothing. */
  protected InitSpecialKeyword(index: number): void {
    if (index !== NfKeywordIndex.TRUE && index !== NfKeywordIndex.FALSE) return;
    const upper = this.GetChrCls().uppercase(
        index === NfKeywordIndex.TRUE ? this.GetLoc().getTrueWord() : this.GetLoc().getFalseWord(),
      ),
      target = this.sKeyword[index] as OUString;
    try {
      target.assign(upper);
      if (target.isEmpty()) target.assign(sEnglishKeyword[index] as OUString);
    } finally {
      upper.dispose();
    }
  }
  /** Original compatibility currency fields and uppercase owner update. @returns Nothing. */
  protected InitCompatCur(): void {
    this.mrCurrentLanguageData.GetCompatibilityCurrency(this.sCurSymbol, this.sCurAbbrev);
    const upper = this.GetChrCls().uppercase(this.sCurSymbol);
    try {
      this.sCurString.assign(upper);
    } finally {
      upper.dispose();
    }
    this.bCompatCurNeedInit = false;
  }
  /** Original guarded initialization and final invalidation-bit clearing. @returns Nothing. */
  protected InitKeywords(): void {
    if (!this.bKeywordsNeedInit) return;
    this.SetDependentKeywords();
    this.bKeywordsNeedInit = false;
  }
  /** Original loaded-locale keyword policy, table copy, General/Thai/special/Boolean-equivalent/currency initialization and exact locale overrides. @returns Nothing. */
  protected SetDependentKeywords(): void {
    const loaded = getLoadedLocale(this.GetLoc().getMyLocale());
    try {
      const language = convertLocaleToLanguage(loaded);
      let localized = this.meKeywordLocalization !== KeywordLocalization.EnglishOnly;
      if (localized && !localizedLanguages.has(language)) {
        localized = false;
        this.meKeywordLocalization = KeywordLocalization.EnglishOnly;
      }
      for (let i = 0; i < sEnglishKeyword.length; ++i)
        (this.sKeyword[i] as OUString).assign(sEnglishKeyword[i] as OUString);
      const format = this.xNFC.getFormatCode(0, loaded);
      try {
        const name = extractStandardGeneralName(format.Code);
        try {
          this.sNameStandardFormat.assign(name);
        } finally {
          name.dispose();
        }
      } finally {
        format.dispose();
      }
      const upper = this.GetChrCls().uppercase(this.sNameStandardFormat);
      try {
        (this.sKeyword[NfKeywordIndex.GENERAL] as OUString).assign(upper);
      } finally {
        upper.dispose();
      }
      if (language === LANGUAGE_THAI) {
        const thai = unicode("T");
        try {
          (this.sKeyword[NfKeywordIndex.THAI_T] as OUString).assign(thai);
        } finally {
          thai.dispose();
        }
      } else
        (this.sKeyword[NfKeywordIndex.THAI_T] as OUString).assign(
          sEnglishKeyword[NfKeywordIndex.THAI_T] as OUString,
        );
      this.InitSpecialKeyword(NfKeywordIndex.TRUE);
      this.InitSpecialKeyword(NfKeywordIndex.FALSE);
      const first = text(this.sKeyword[NfKeywordIndex.TRUE] as OUString),
        last = text(this.sKeyword[NfKeywordIndex.FALSE] as OUString),
        one = unicode('"' + first + '";"' + first + '";"' + last + '"'),
        two = unicode('[>0]"' + first + '";[<0]"' + first + '";"' + last + '"');
      try {
        this.sBooleanEquivalent1.assign(one);
        this.sBooleanEquivalent2.assign(two);
      } finally {
        two.dispose();
        one.dispose();
      }
      this.InitCompatCur();
      if (!localized) return;
      SetDependentKeywordOverrides(language, this.sKeyword);
    } finally {
      loaded.dispose();
    }
  }
  /** Original scalar reset; token storage and nCurrPos retain their source lifetime. @returns Nothing. */
  Reset(): void {
    this.nStringsCnt = 0;
    this.nResultStringsCnt = 0;
    this.eScannedType = SvNumFormatType.UNDEFINED;
    this.bExp = false;
    this.bThousand = false;
    this.nThousand = 0;
    this.bDecSep = false;
    this.nDecPos = -1;
    this.nExpPos = 65535;
    this.nBlankPos = 65535;
    this.nCntPre = 0;
    this.nCntPost = 0;
    this.nCntExp = 0;
    this.bFrac = false;
    this.bBlank = false;
    this.nNatNumModifier = 0;
  }
  /** Original const null-date borrow. @returns Date. */
  GetNullDate(): DateConstReference {
    return this.maNullDate;
  }
  /** Original normalize/validate/update null-date path. @param day - Native day. @param month - Native month. @param year - Native year. @returns Nothing. */
  ChangeNullDate(day: number, month: number, year: number): void {
    const date = new ToolsDate(day, month, year);
    if (!date.IsValidDate()) {
      date.Normalize();
      if (!date.IsValidDate()) throw new Error("valid null date assertion");
    }
    if (date.IsValidDate()) this.maNullDate.assign(date);
  }
  /** Original precision assignment. @param precision - Native uint16. @returns Nothing. */
  ChangeStandardPrec(precision: number): void {
    this.nStandardPrec = precision & 65535;
  }
  /** Original precision query. @returns Precision. */
  GetStandardPrec(): number {
    return this.nStandardPrec;
  }
  /** Original result count. @returns Count. */
  GetResultStringsCnt(): number {
    return this.nResultStringsCnt;
  }
  /** Original scan category. @returns Category. */
  GetScannedType(): number {
    return this.eScannedType;
  }
  /** Original conversion-mode overloads. @param mode - Mode bit. @returns Nothing. */
  SetConvertMode(mode: boolean): void;
  /** Original complete conversion setting. @param oldLanguage - Source. @param newLanguage - Destination. @param systemToSystem - Native flag. @param dateOrder - Native flag. @returns Nothing. */
  SetConvertMode(
    oldLanguage: number,
    newLanguage: number,
    systemToSystem: boolean,
    dateOrder: boolean,
  ): void;
  /** Original overload dispatch. @param mode - Bit or language. @param rest - Complete conversion arguments. @returns Nothing. */
  SetConvertMode(mode: boolean | number, ...rest: [] | [number, boolean, boolean]): void {
    if (typeof mode === "boolean") this.bConvertMode = mode;
    else {
      this.bConvertMode = true;
      this.eTmpLnge = mode & 65535;
      this.eNewLnge = (rest[0] as number) & 65535;
      this.bConvertSystemToSystem = rest[1] as boolean;
      this.mbConvertDateOrder = rest[2] as boolean;
    }
  }
  /** Original conversion flag query. @returns Mode. */
  GetConvertMode(): boolean {
    return this.bConvertMode;
  }
  /** Original conversion destination. @returns Language. */
  GetNewLnge(): number {
    return this.eNewLnge;
  }
  /** Original conversion source. @returns Language. */
  GetTmpLnge(): number {
    return this.eTmpLnge;
  }
  /** Original destination setter. @param language - Native uint16. @returns Nothing. */
  SetNewLnge(language: number): void {
    this.eNewLnge = language & 65535;
  }
  /** Original Thai modifier query. @returns Byte. */
  GetNatNumModifier(): number {
    return this.nNatNumModifier;
  }
  /** Original Thai modifier setter. @param value - Native byte. @returns Nothing. */
  SetNatNumModifier(value: number): void {
    this.nNatNumModifier = value & 255;
  }
  /** Original quote-removal dispatch. @param value - In/out owned string. @returns Removed UTF16 units. */
  protected RemoveQuotes(value: OUString): number {
    return RemoveQuotes(value);
  }
  /** Original exact Boolean-equivalent replacement after lazy keyword initialization. @param value - In/out source code. @returns Whether replaced. */
  ReplaceBooleanEquivalent(value: OUString): boolean {
    this.InitKeywords();
    if (value.equals(this.sBooleanEquivalent1) || value.equals(this.sBooleanEquivalent2)) {
      value.assign(this.GetKeywords()[NfKeywordIndex.BOOLEAN] as OUStringConstReference);
      return true;
    }
    return false;
  }
  /** Original calendar final-scan helper dispatch. @param position - Native error cursor. @param index - Native token cursor. @param resultCount - Native remaining count. @returns Native status. */
  protected FinalScanGetCalendar(
    position: [number],
    index: [number],
    resultCount: [number],
  ): number {
    return FinalScanGetCalendar.call(this, position, index, resultCount);
  }
  /** Original adjacent date-particle predicate. @param first - Position. @param second - Position. @returns Whether adjacent. */
  protected IsDateFragment(first: number, second: number): boolean {
    return IsDateFragment.call(this, first, second);
  }
  /** Original slot-content swap. @param first - Position. @param second - Position. @returns Nothing. */
  protected SwapArrayElements(first: number, second: number): void {
    SwapArrayElements.call(this, first, second);
  }
  /** Original type-stage dispatch on the actual token owner. @returns Native control position. */
  protected ScanType(): number {
    return ScanType.call(this);
  }
  /** Original token insertion dispatch. @param position - Native uint16 cursor. @param type - Native token type. @param value - Native string. @returns Whether inserted. */
  protected InsertSymbol(position: [number], type: number, value: OUStringConstReference): boolean {
    return InsertSymbol.call(this, position, type, value);
  }
  /** Original ambiguous E predicate. @param keyword - Native keyword index. @returns Whether E has both scientific and era meanings. */
  protected IsAmbiguousE(keyword: number): boolean {
    return (
      (keyword === NfKeywordIndex.EC || keyword === NfKeywordIndex.E) &&
      (this.GetKeywords()[NfKeywordIndex.EC] as OUString).equals(
        this.GetKeywords()[NfKeywordIndex.E] as OUString,
      )
    );
  }
  /** Original GetKeyWord dispatch on this actual owner. @param value - Source argument. @param position - Source argument. @param english - Source argument. @returns Source result. */
  protected GetKeyWord(
    value: OUStringConstReference,
    position: number,
    english: [boolean],
  ): number {
    return GetKeyWord.call(this, value, position, english);
  }
  /** Original Next_Symbol dispatch on this actual owner. @param value - Source argument. @param position - Source argument. @param symbol - Source argument. @returns Source result. */
  protected Next_Symbol(
    value: OUStringConstReference,
    position: [number],
    symbol: OUString,
  ): number {
    return Next_Symbol.call(this, value, position, symbol);
  }
  /** Original Symbol_Division dispatch on this actual owner. @param value - Source argument. @returns Source result. */
  protected Symbol_Division(value: OUStringConstReference): number {
    return Symbol_Division.call(this, value);
  }
  /** Original SkipStrings dispatch on this actual owner. @param index - Source argument. @param position - Source argument. @returns Source result. */
  protected SkipStrings(index: [number], position: [number]): void {
    SkipStrings.call(this, index, position);
  }
  /** Original PreviousKeyword dispatch on this actual owner. @param index - Source argument. @returns Source result. */
  protected PreviousKeyword(index: number): number {
    return PreviousKeyword.call(this, index);
  }
  /** Original NextKeyword dispatch on this actual owner. @param index - Source argument. @returns Source result. */
  protected NextKeyword(index: number): number {
    return NextKeyword.call(this, index);
  }
  /** Original PreviousType dispatch on this actual owner. @param index - Source argument. @returns Source result. */
  protected PreviousType(index: number): number {
    return PreviousType.call(this, index);
  }
  /** Original PreviousChar dispatch on this actual owner. @param index - Source argument. @returns Source result. */
  protected PreviousChar(index: number): number {
    return PreviousChar.call(this, index);
  }
  /** Original NextChar dispatch on this actual owner. @param index - Source argument. @returns Source result. */
  protected NextChar(index: number): number {
    return NextChar.call(this, index);
  }
  /** Original IsLastBlankBeforeFrac dispatch on this actual owner. @param index - Source argument. @returns Source result. */
  protected IsLastBlankBeforeFrac(index: number): boolean {
    return IsLastBlankBeforeFrac.call(this, index);
  }
  /** Original Is100SecZero dispatch on this actual owner. @param index - Source argument. @param hadDecimal - Source argument. @returns Source result. */
  protected Is100SecZero(index: number, hadDecimal: boolean): boolean {
    return Is100SecZero.call(this, index, hadDecimal);
  }
  /** Original final-stage dispatch. @param code - In/out native format code. @returns Native control position. */
  protected FinalScan(code: OUString): number {
    return FinalScan.call(this, code);
  }
  /** Original ScanFormat runs lexical analysis, type recognition and final compilation in order, preserving zero control semantics at each source boundary. @param code - In/out source format. @returns Native control position; zero denotes success. */
  ScanFormat(code: OUString): number {
    let result = this.Symbol_Division(code);
    if (!result) result = this.ScanType();
    if (!result) result = this.FinalScan(code);
    return result;
  }
  /** Original CopyInfo skips EMPTY tokens and copies actual scalar results. @param info - Enlarged destination. @param count - Native uint16 count. @returns Nothing. */
  CopyInfo(info: ImpSvNumberformatInfo, count: number): void {
    count &= 65535;
    let i = 0,
      j = 0;
    while (i < count && j < NF_MAX_FORMAT_SYMBOLS) {
      if (this.nTypeArray[j] !== NfSymbolType.EMPTY) {
        (info.sStrArray[i] as OUString).assign(this.sStrArray[j] as OUString);
        info.nTypeArray[i] = this.nTypeArray[j] as number;
        ++i;
      }
      ++j;
    }
    info.eScannedType = this.eScannedType;
    info.bThousand = this.bThousand;
    info.nThousand = this.nThousand;
    info.nCntPre = this.nCntPre;
    info.nCntPost = this.nCntPost;
    info.nCntExp = this.nCntExp;
  }
  /** Original owned string member teardown; the borrowed actual provider/language owners outlive this scanner. @returns Nothing. */
  dispose(): void {
    this.Reset();
    for (let i = this.sStrArray.length; i > 0;) (this.sStrArray[--i] as OUString).dispose();
    for (let i = this.sKeyword.length; i > 0;) (this.sKeyword[--i] as OUString).dispose();
    this.sBooleanEquivalent2.dispose();
    this.sBooleanEquivalent1.dispose();
    this.sCurAbbrev.dispose();
    this.sCurString.dispose();
    this.sCurSymbol.dispose();
    this.sNameStandardFormat.dispose();
  }
}
