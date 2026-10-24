/** @fileoverview Original SvNFFormatData format-code selection/default-adjustment responsibilities over genuine UNO sequences. The decimal field is projected explicitly;LocaleData diagnostic logging and the formatter/table/service owners are separate responsibilities. */
import { Sequence, type SequenceElements } from "../../../cppu/inc/com/sun/star/uno/Sequence";
import {
  NumberFormatCode,
  cppu_detail_getUnoType_NumberFormatCode,
  type NumberFormatCodeAddress,
} from "../../../offapi/com/sun/star/i18n/NumberFormatCode";
import * as Type from "../../../offapi/com/sun/star/i18n/KNumberFormatType";
import { OUString, type OUStringConstReference } from "../../../sal/inc/rtl/ustring";
import {
  NfIndexTableOffset as Offset,
  NfEvalDateFormat,
  SvNumFormatType,
  SV_COUNTRY_LANGUAGE_OFFSET,
  SV_MAX_COUNT_STANDARD_FORMATS,
  NUMBERFORMAT_ENTRY_NOT_FOUND,
} from "../../inc/zforlist";
import { SvNumberformat } from "./zformat";
import { ImpSvNumberformatScan, prepareGeneralKeywords } from "./zforscan";
import { convertLanguageToLocale } from "../../../i18nlangtag/source/isolang/mslangid";
import type { Locale } from "../../../udkapi/com/sun/star/lang/Locale";
import {
  getLoadedLocale,
  getNumDecimalSep,
  getNumDecimalSepAlt,
  getNumThousandSep,
  getDateSep,
} from "../../../unotools/source/i18n/localedatawrapper";

import type { LocaleConstReference } from "../../../udkapi/com/sun/star/lang/Locale";
import type { NumberFormatCodeConstReference } from "../../../offapi/com/sun/star/i18n/NumberFormatCode";
import type { XNumberFormatCode } from "../../../offapi/com/sun/star/i18n/XNumberFormatCode";
import { FIXED_NUMBER, CURRENCY } from "../../../offapi/com/sun/star/i18n/KNumberFormatUsage";

/** Original declared initializer-list/sequence specialization. */
const Codes = Sequence.specialize<NumberFormatCodeAddress>(
  cppu_detail_getUnoType_NumberFormatCode,
  40,
);

/** Original exact index/default/currency fallback order,including creation of one default-initialized struct for an empty sequence. Decimal is the actual GetNumDecimalSep field;the diagnostic-only LocaleData checks do not change selection. @param sequence - Original mutable sequence reference. @param offset - Requested built-in index. @param decimal - Borrowed current-language decimal separator. @returns Original sequence index,zero on final fallback. */
export function ImpGetFormatCodeIndex(
  sequence: Sequence<NumberFormatCodeAddress>,
  offset: number,
  decimal: OUStringConstReference,
): number {
  for (let index = 0; index < sequence.getLength(); ++index)
    if (NumberFormatCode.borrowed(sequence.operatorIndex(index)).Index === offset) return index;
  if (sequence.hasElements()) {
    for (let index = 0; index < sequence.getLength(); ++index)
      if (NumberFormatCode.borrowed(sequence.operatorIndex(index)).Default) return index;
    if (Offset.NF_CURRENCY_START <= offset && offset <= Offset.NF_CURRENCY_END) {
      for (const fallback of [Offset.NF_CURRENCY_1000DEC2, Offset.NF_CURRENCY_1000INT])
        for (let index = 0; index < sequence.getLength(); ++index)
          if (NumberFormatCode.borrowed(sequence.operatorIndex(index)).Index === fallback)
            return index;
    }
  } else {
    const value = new NumberFormatCode(),
      temporary = new Codes(new Map([[0, value]]), 1);
    try {
      sequence.assign(temporary);
    } finally {
      temporary.dispose();
      value.dispose();
    }
    const units = new Uint16Array(decimal.getLength() + 13);
    units[0] = 48;
    units.set(decimal.getStr().subarray(0, decimal.getLength()), 1);
    units.fill(35, 1 + decimal.getLength());
    const code = new OUString(units, units.length);
    try {
      NumberFormatCode.borrowed(
        (sequence.getArray() as SequenceElements).get(0) as NumberFormatCodeAddress,
      ).Code = code;
    } finally {
      code.dispose();
    }
  }
  return 0;
}

/** Original mutable pointer/count algorithm prefers medium,then long,and preserves upstream duplicate-medium flags (CALC-272). The caller obtains this actual pointer through Sequence.getArray,retaining native COW before mutation. Diagnostic-only locale-data validation is not represented. @param formats - Actual compound storage pointer. @param count - Original element count. @returns Nothing. */
export function ImpAdjustFormatCodeDefault(formats: SequenceElements, count: number): void {
  if (!count) return;
  let selected = -1,
    medium = -1;
  for (let index = 0; index < count; ++index) {
    const code = NumberFormatCode.borrowed(formats.get(index * 40) as NumberFormatCodeAddress);
    if (code.Default) {
      if (code.Type === Type.MEDIUM) selected = medium = index;
      else {
        if (code.Type === Type.LONG && medium === -1) selected = index;
        // The original LONG arm falls through to this default-arm body.
        if (selected === -1) selected = index;
        code.Default = false;
      }
    }
  }
  if (selected === -1) selected = 0;
  NumberFormatCode.borrowed(formats.get(selected * 40) as NumberFormatCodeAddress).Default = true;
}

/** Original SvNFLanguageData consumed locale/scanner/cached-field ownership. Real Locale values project LanguageTag/LocaleData fields;the actual mapper interface projects the component-context service lookup. Full LanguageTag,calendar,transliteration,input-number scanner,color callback and UNO service ABI are not fabricated. */
export class SvNFLanguageData {
  /** Original friend-visible state grouped after erasing C++ friend access;only native format-table/engine/formatter callers consume it. locale/loadedLocale are explicit real Locale projections,not replacement LanguageTag objects. */
  readonly fields: {
    readonly IniLnge: number;
    ActLnge: [number];
    locale: Locale;
    loadedLocale: Locale;
    pFormatScanner: ImpSvNumberformatScan;
    aDecimalSep: OUString;
    aDecimalSepAlt: OUString;
    aThousandSep: OUString;
    aDateSep: OUString;
    eEvalDateFormat: number;
  };
  /** Original constructor's represented language/cache/scanner path;the actual provider must outlive this borrowed service-field binding. @param mapper - Actual prepared XNumberFormatCode service field. @param language - Native initial language. @returns Owned language/scanner state. */
  constructor(
    private readonly mapper: XNumberFormatCode,
    language: number,
  ) {
    language &= 65535;
    const locale = convertLanguageToLocale(language, false),
      loadedLocale = getLoadedLocale(locale),
      decimal = getNumDecimalSep(locale),
      alternate = getNumDecimalSepAlt(locale),
      thousand = getNumThousandSep(locale),
      date = getDateSep(locale),
      prepared = prepareGeneralKeywords(mapper, loadedLocale);
    try {
      this.fields = {
        IniLnge: language,
        ActLnge: [language],
        locale,
        loadedLocale,
        pFormatScanner: new ImpSvNumberformatScan(
          locale,
          prepared.standardName,
          prepared.localization,
        ),
        aDecimalSep: decimal,
        aDecimalSepAlt: alternate,
        aThousandSep: thousand,
        aDateSep: date,
        eEvalDateFormat: NfEvalDateFormat.International,
      };
    } finally {
      prepared.standardName.dispose();
    }
  }
  /** Original initial language remains unchanged after ChangeIntl. @returns Original uint16 language. */
  GetIniLanguage(): number {
    return this.fields.IniLnge;
  }
  /** Original borrowed cached decimal field. @returns Actual owned member. */
  GetNumDecimalSep(): OUStringConstReference {
    return this.fields.aDecimalSep;
  }
  /** Original borrowed cached alternate decimal field. @returns Actual owned member. */
  GetNumDecimalSepAlt(): OUStringConstReference {
    return this.fields.aDecimalSepAlt;
  }
  /** Original borrowed cached grouping field. @returns Actual owned member. */
  GetNumThousandSep(): OUStringConstReference {
    return this.fields.aThousandSep;
  }
  /** Original borrowed cached date separator. @returns Actual owned member. */
  GetDateSep(): OUStringConstReference {
    return this.fields.aDateSep;
  }
  /** Original current format-scanner reference retains object identity across language changes. @returns Actual scanner. */
  GetFormatScanner(): ImpSvNumberformatScan {
    return this.fields.pFormatScanner;
  }
  /** Original date evaluation setter. @param order - Original enum. @returns Nothing. */
  SetEvalDateFormat(order: number): void {
    this.fields.eEvalDateFormat = order;
  }
  /** Original date evaluation field. @returns Original enum. */
  GetEvalDateFormat(): number {
    return this.fields.eEvalDateFormat;
  }
  /** Original precision forwarding preserves scanner state and uint16 conversion. @param precision - Native short argument. @returns Nothing. */
  ChangeStandardPrec(precision: number): void {
    this.fields.pFormatScanner.ChangeStandardPrec(precision);
  }
  /** Original precision query. @returns Current scanner precision. */
  GetStandardPrec(): number {
    return this.fields.pFormatScanner.GetStandardPrec();
  }
  /** Original no-op for the current language,otherwise locale/cache updates precede scanner ChangeIntl. Unrepresented language/service wrappers are explicit projections,not substitute providers. @param language - Native uint16 current language. @returns Nothing. */
  ChangeIntl(language: number): void {
    language &= 65535;
    const fields = this.fields;
    if (fields.ActLnge[0] === language) return;
    fields.ActLnge[0] = language;
    const locale = convertLanguageToLocale(language, false),
      loadedLocale = getLoadedLocale(locale),
      oldLocale = fields.locale,
      oldLoaded = fields.loadedLocale,
      decimal = getNumDecimalSep(locale),
      alternate = getNumDecimalSepAlt(locale),
      thousand = getNumThousandSep(locale),
      date = getDateSep(locale),
      prepared = prepareGeneralKeywords(this.mapper, loadedLocale);
    try {
      fields.locale = locale;
      fields.loadedLocale = loadedLocale;
      fields.aDecimalSep.assign(decimal);
      fields.aDecimalSepAlt.assign(alternate);
      fields.aThousandSep.assign(thousand);
      fields.aDateSep.assign(date);
      fields.pFormatScanner.ChangeIntl(locale, prepared.standardName, prepared.localization);
    } finally {
      prepared.standardName.dispose();
      date.dispose();
      thousand.dispose();
      alternate.dispose();
      decimal.dispose();
      oldLoaded.dispose();
      oldLocale.dispose();
    }
  }
  /** Original cached string/scanner/locale member destruction for represented owners;the prepared mapper remains borrowed. @returns Nothing. */
  dispose(): void {
    const fields = this.fields;
    fields.aDateSep.dispose();
    fields.aThousandSep.dispose();
    fields.aDecimalSepAlt.dispose();
    fields.aDecimalSep.dispose();
    fields.pFormatScanner.dispose();
    fields.loadedLocale.dispose();
    fields.locale.dispose();
  }
}

/** Original format-table owner;native fields are grouped solely to erase C++ friend access without inventing individual accessor APIs. Actual Map entries own actual parsed formats. Language generation,engine accessors and formatter services remain separate unported responsibilities. */
export class SvNFFormatData {
  private readonly fields = {
    aFTable: new Map<number, SvNumberformat>(),
    aDefaultFormatKeys: new Map<number, number>(),
    MaxCLOffset: 0,
    nDefaultSystemCurrencyFormat: NUMBERFORMAT_ENTRY_NOT_FOUND,
    bNoZero: false,
  };
  /** Original exact-key lookup;native unsigned32 argument conversion is explicit. @param key - Format key. @returns Actual borrowed entry or null. */
  GetEntry(key: number): SvNumberformat | null {
    return this.fields.aFTable.get(key >>> 0) ?? null;
  }
  /** Original public const format lookup shares the same actual entry. @param key - Format key. @returns Borrowed entry or null. */
  GetFormatEntry(key: number): SvNumberformat | null {
    return this.GetEntry(key);
  }
  /** Original category query with missing UNDEFINED and masked ALL-to-DEFINED conversion. @param key - Native format key. @returns Native category. */
  GetType(key: number): number {
    const format = this.GetFormatEntry(key);
    if (!format) return SvNumFormatType.UNDEFINED;
    const type = format.GetMaskedType();
    return type === SvNumFormatType.ALL ? SvNumFormatType.DEFINED : type;
  }
  /** Original locale-block search,including returning one block beyond MaxCLOffset on a miss. @param language - Native uint16 language. @returns Existing or next block offset. */
  ImpGetCLOffset(language: number): number {
    language &= 65535;
    let offset = 0;
    while (offset <= this.fields.MaxCLOffset) {
      const format = this.GetFormatEntry(offset);
      if (format && format.GetLanguage() === language) return offset;
      offset += SV_COUNTRY_LANGUAGE_OFFSET;
    }
    return offset;
  }
  /** Original find-at-CLOffset then same-language ordered-map traversal. Sorting primitive keys preserves std::map ordering without replacing entry owners;an absent exact start key does not lower_bound to a later entry. @param code - Native exact case-sensitive string view. @param offset - Exact first key. @param language - Native uint16 language. @returns Matching key or native missing sentinel. */
  ImpIsEntry(code: OUStringConstReference, offset: number, language: number): number {
    offset >>>= 0;
    language &= 65535;
    const keys = [...this.fields.aFTable.keys()].sort(
      /** Original sal_uInt32 map order. @param left - First key. @param right - Second key. @returns Numeric ordering. */ (
        left,
        right,
      ) => left - right,
    );
    let index = keys.indexOf(offset);
    while (index >= 0 && index < keys.length) {
      const key = keys[index] as number,
        format = this.fields.aFTable.get(key) as SvNumberformat;
      if (format.GetLanguage() !== language) break;
      if (format.GetFormatstring().equals(code)) return key;
      ++index;
    }
    return NUMBERFORMAT_ENTRY_NOT_FOUND;
  }
  /** Original ImpInsertFormat General/NatNum0 path and additional-code duplicate check over actual compiled entries. Prepared scanner/ActLnge fields replace only their original language-data member access. Currency delimiter stripping,other pattern families and diagnostic-only checks are not admitted here. Native-number/input-number services are unconsumed on this path. @param scanner - Actual scanner. @param language - Original ActLnge in/out field. @param code - Borrowed generated struct. @param position - Original uint32 map key. @returns Borrowed inserted entry or null. */
  ImpInsertFormat(
    scanner: ImpSvNumberformatScan,
    language: [number],
    code: NumberFormatCodeConstReference,
    position: number,
  ): SvNumberformat | null {
    position >>>= 0;
    if (
      Offset.NF_INDEX_TABLE_RESERVED_START <= code.Index &&
      code.Index < Offset.NF_INDEX_TABLE_ENTRIES
    )
      throw new Error("reserved formatIndex assertion");
    if (
      code.Index < Offset.NF_INDEX_TABLE_RESERVED_START &&
      code.Usage === CURRENCY &&
      code.Index !== Offset.NF_CURRENCY_1000DEC2_CCC
    )
      throw new Error("Automatic currency format insertion is not implemented");
    const codeString = new OUString(code.Code),
      check: [number] = [0];
    let format: SvNumberformat;
    try {
      format = new SvNumberformat(codeString, scanner, check, language);
    } finally {
      codeString.dispose();
    }
    if (check[0] !== 0) {
      format.dispose();
      return null;
    }
    if (code.Index >= Offset.NF_INDEX_TABLE_RESERVED_START) {
      const offset = position - (position % SV_COUNTRY_LANGUAGE_OFFSET);
      if (
        this.ImpIsEntry(format.GetFormatstring(), offset, language[0]) !==
        NUMBERFORMAT_ENTRY_NOT_FOUND
      ) {
        format.dispose();
        return null;
      }
      // Native position-offset >=10000 guard is unreachable:offset is position-(position%10000),so the difference is in [0,9999] for every uint32 position.
    }
    if (this.fields.aFTable.has(position)) {
      format.dispose();
      return null;
    }
    this.fields.aFTable.set(position, format);
    if (code.Default) format.SetStandard();
    if (!code.DefaultName.isEmpty()) format.SetComment(code.DefaultName);
    return format;
  }
  /** Original map member destruction releases every actual owned entry. Physical STL tree destruction order is not represented;the admitted entries have no destructor callbacks. @returns Nothing. */
  dispose(): void {
    for (const format of this.fields.aFTable.values()) format.dispose();
    this.fields.aFTable.clear();
  }
}

/** Original General-number phase of ImpGenerateFormats,not a replacement for the remaining builtin/table generator. The admitted scanner is in native non-conversion mode;actual prepared locale/scanner/language/decimal fields are supplied explicitly,without a fake SvNFLanguageData service. @param table - Actual owning format table. @param mapper - Actual source-code mapper. @param locale - Original locale. @param scanner - Actual prepared scanner. @param language - Original ActLnge field. @param decimal - Original decimal separator field. @param offset - Native locale block offset. @returns Nothing. */
export function generateStandardNumberFormat(
  table: SvNFFormatData,
  mapper: XNumberFormatCode,
  locale: LocaleConstReference,
  scanner: ImpSvNumberformatScan,
  language: [number],
  decimal: OUStringConstReference,
  offset: number,
): void {
  offset >>>= 0;
  const formats = mapper.getAllFormatCode(FIXED_NUMBER, locale);
  try {
    ImpAdjustFormatCodeDefault(formats.getArray() as SequenceElements, formats.getLength());
    const index = ImpGetFormatCodeIndex(formats, Offset.NF_NUMBER_STANDARD, decimal);
    const standard = table.ImpInsertFormat(
      scanner,
      language,
      NumberFormatCode.borrowed(formats.operatorIndex(index)),
      (offset + Offset.NF_NUMBER_STANDARD) >>> 0,
    );
    if (standard) {
      standard.SetType(SvNumFormatType.NUMBER);
      standard.SetStandard();
      standard.SetLastInsertKey(SV_MAX_COUNT_STANDARD_FORMATS);
    }
  } finally {
    formats.dispose();
  }
}
