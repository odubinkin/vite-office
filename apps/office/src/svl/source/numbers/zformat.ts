/** @fileoverview Native compiled-format constructor and subformat ownership, with represented General/Boolean/Text and ungrouped integer output; remaining output families are unported. */
import { Construct } from "./zformat.construct";
import type { ImpSvNumberInputScan } from "./zforfind";
import type { NativeNumberWrapper } from "../../../unotools/source/i18n/nativenumberwrapper";
import { approxEqual, round } from "../../../sal/inc/rtl/math";
import {
  rtl_math_StringFormat as Format,
  rtl_math_DecimalPlaces,
  rtl_math_doubleToUString,
} from "../../../sal/inc/rtl/math.h";
import { OUStringBuffer } from "../../../sal/inc/rtl/ustrbuf";
import { OUString, type OUStringConstReference } from "../../../sal/inc/rtl/ustring";
import type { Color } from "../../../tools/inc/color";
import { DateOrder } from "../../../unotools/source/i18n/localedatawrapper";
import { NfKeywordIndex } from "../../inc/nfkeytab";
import { NfSymbolType } from "../../inc/nfsymbol";
import { SvNumFormatType } from "../../inc/zforlist";
import { IsIso8601 } from "./zformat.iso";
import { IsInQuote, GetQuoteEnd } from "./zformat.quotes";
import { StripNewCurrencyDelimiters } from "./zformat.currency";
import { INPUTSTRING_PRECISION, UNLIMITED_PRECISION } from "./zforlist.defaults";
import { LANGUAGE_SYSTEM } from "../../../i18nlangtag/inc/lang";
import { LocaleType, Substitute } from "./zformat.locale";
import { SvNumberNatNum, type SvNumberNatNumConstReference } from "./zformat.natnum";
import type { ImpSvNumberformatScan } from "./zforscan";

/** Original zero output creates a real owned string. @returns Native zero string. */
function zero(): OUString {
  return new OUString(Uint16Array.of(48), 1);
}
/** Original Unicode C conversion consumes the existing real SAL allocation/ref owner. @param value - Binary64. @param format - Original selector. @param precision - Native decimal places. @param decimal - Locale's first decimal unit. @returns Owned formatted string. */
function output(value: number, format: Format, precision: number, decimal: number): OUString {
  const result = new OUString();
  rtl_math_doubleToUString(
    result.getDataAddress(),
    null,
    0,
    value,
    format,
    precision,
    decimal,
    null,
    0,
    true,
  );
  return result;
}

/** Original standard NUMBER branches of GetOutputString,ImpGetOutputInputLine,ImpGetOutputStandard and ImpGetOutputStdToPrecision. Precision and decimal are the actual scanner/language fields;this does not fabricate a SvNumberFormatter service or parsed format entry. The admitted native NatNum0 requires no transliteration. @param value - Binary64 input. @param precision - Native uint16 standard precision. @param decimal - Original locale decimal sal_Unicode. @returns Owned native formatted string. */
export function formatStandardNumber(value: number, precision: number, decimal: number): OUString {
  precision &= 65535;
  if (precision === INPUTSTRING_PRECISION) {
    if (value === 0) return zero();
    return output(
      value,
      Format.rtl_math_StringFormat_Automatic,
      rtl_math_DecimalPlaces.rtl_math_DecimalPlaces_Max,
      decimal,
    );
  }
  if (precision === UNLIMITED_PRECISION) {
    if (value < 0 || Object.is(value, -0)) {
      if (!(value < 0)) value = -value;
    }
    if (value === 0) return zero();
    if (value < 1 && value > -1) {
      let fixed = value < -1e-4 || value > 1e-4;
      if (!fixed) {
        const exponent = Math.ceil(-Math.log10(Math.abs(value)));
        if (exponent <= 9 && approxEqual(round(value, 16), round(value, exponent + 16)))
          fixed = true;
      }
      return output(
        value,
        fixed ? Format.rtl_math_StringFormat_F : Format.rtl_math_StringFormat_E2,
        rtl_math_DecimalPlaces.rtl_math_DecimalPlaces_Max,
        decimal,
      );
    }
    return output(
      value,
      Format.rtl_math_StringFormat_Automatic,
      rtl_math_DecimalPlaces.rtl_math_DecimalPlaces_Max,
      decimal,
    );
  }
  if (Math.abs(value) > 1e15)
    return output(value, Format.rtl_math_StringFormat_E2, Math.min(precision, 14), decimal);
  const result = output(value, Format.rtl_math_StringFormat_F, Math.min(precision, 300), decimal);
  // With native F/no-grouping/erase-zeroes,the original checkForAll0s minus-zero branch can only see "-0".
  if (result.getLength() === 2 && result.getStr()[0] === 45 && result.getStr()[1] === 48) {
    result.dispose();
    return zero();
  }
  return result;
}

/** Original ImpSvNumberformatInfo owned token arrays and scalar scan result. Native scalar initialization belongs to ImpSvNumFor,not to a fabricated scanner result. */
export class ImpSvNumberformatInfo {
  readonly sStrArray: OUString[] = [];
  readonly nTypeArray: number[] = [];
  declare nThousand: number;
  declare nCntPre: number;
  declare nCntPost: number;
  declare nCntExp: number;
  declare eScannedType: number;
  declare bThousand: boolean;
  /** Original value copy requires the destination arrays to have been enlarged first. @param source - Actual original info. @param count - Native uint16 count. @returns Nothing. */
  Copy(source: ImpSvNumberformatInfo, count: number): void {
    count &= 65535;
    for (let index = 0; index < count; ++index) {
      (this.sStrArray[index] as OUString).assign(source.sStrArray[index] as OUString);
      this.nTypeArray[index] = source.nTypeArray[index] as number;
    }
    this.eScannedType = source.eScannedType;
    this.bThousand = source.bThousand;
    this.nThousand = source.nThousand;
    this.nCntPre = source.nCntPre;
    this.nCntPost = source.nCntPost;
    this.nCntExp = source.nCntExp;
  }
}

/** Original subformat token/info owner. Color pointers/names and NatNum metadata retain their original subformat ownership. */
export class ImpSvNumFor {
  private readonly aI = new ImpSvNumberformatInfo();
  private nStringsCnt = 0;
  private readonly aNatNum = new SvNumberNatNum();
  private readonly sColorName = new OUString();
  private pColor: Color | null = null;
  /** Original constructor initializes the info scalars while both token vectors remain empty. @returns Subformat. */
  constructor() {
    this.aI.eScannedType = SvNumFormatType.UNDEFINED;
    this.aI.bThousand = false;
    this.aI.nThousand = 0;
    this.aI.nCntPre = 0;
    this.aI.nCntPost = 0;
    this.aI.nCntExp = 0;
  }
  /** Original vector resize preserves the retained prefix and destroys removed OUStrings. @param count - Native uint16 count. @returns Nothing. */
  Enlarge(count: number): void {
    count &= 65535;
    if (this.nStringsCnt !== count) {
      this.nStringsCnt = count;
      while (this.aI.sStrArray.length > count) (this.aI.sStrArray.pop() as OUString).dispose();
      while (this.aI.sStrArray.length < count) this.aI.sStrArray.push(new OUString());
      this.aI.nTypeArray.length = count;
      for (let index = 0; index < count; ++index) this.aI.nTypeArray[index] ??= 0;
    }
  }
  /** Original mutable info reference;Enlarge must precede token assignment. @returns Actual info owner. */
  Info(): ImpSvNumberformatInfo {
    return this.aI;
  }
  /** Original symbol count. @returns Native uint16 count. */
  GetCount(): number {
    return this.nStringsCnt;
  }
  /** Original borrowed color pointer. @returns Color or null. */
  GetColor(): Color | null {
    return this.pColor;
  }
  /** Original color pointer and owned-name assignment. @param color - Borrowed pointer. @param name - Actual color name. @returns Nothing. */
  SetColor(color: Color | null, name: OUStringConstReference): void {
    this.pColor = color;
    this.sColorName.assign(name);
  }
  /** Original const color-name borrow. @returns Actual string owner. */
  GetColorName(): OUStringConstReference {
    return this.sColorName;
  }
  /** Original modifier assignment. @param number - Native uint8 modifier. @param dbNum - DBNum interpretation. @returns Nothing. */
  SetNatNumNum(number: number, dbNum: boolean): void {
    this.aNatNum.SetNum(number, dbNum);
  }
  /** Original modifier language assignment. @param language - Native language ID. @returns Nothing. */
  SetNatNumLang(language: number): void {
    this.aNatNum.SetLang(language);
  }
  /** Original modifier date context. @param date - Context. @returns Nothing. */
  SetNatNumDate(date: boolean): void {
    this.aNatNum.SetDate(date);
  }
  /** Original owned parameter assignment. @param params - Native string. @returns Nothing. */
  SetNatNumParams(params: OUStringConstReference): void {
    this.aNatNum.SetParams(params);
  }
  /** Original const metadata borrow. @returns Actual subformat-owned metadata. */
  GetNatNum(): SvNumberNatNumConstReference {
    return this.aNatNum;
  }
  /** Original token scan for an explicit new-currency symbol. @returns Presence. */
  HasNewCurrency(): boolean {
    for (let index = 0; index < this.nStringsCnt; index++)
      if (this.aI.nTypeArray[index] === NfSymbolType.CURRENCY) return true;
    return false;
  }
  /** Original first currency token and immediately following extension;failed lookup leaves outputs untouched. @param symbol - Mutable symbol. @param extension - Mutable extension. @returns Found. */
  GetNewCurrencySymbol(symbol: OUString, extension: OUString): boolean {
    for (let index = 0; index < this.nStringsCnt; index++) {
      if (this.aI.nTypeArray[index] !== NfSymbolType.CURRENCY) continue;
      symbol.assign(this.aI.sStrArray[index] as OUString);
      if (index < this.nStringsCnt - 1 && this.aI.nTypeArray[index + 1] === NfSymbolType.CURREXT)
        extension.assign(this.aI.sStrArray[index + 1] as OUString);
      else extension.clear();
      return true;
    }
    return false;
  }
  /** Original token/info, color and native-number metadata copy. @param source - Actual source subformat. @param scanner - Destination scanner for cross-owner color rebinding. @returns Nothing. */
  Copy(source: ImpSvNumFor, scanner: ImpSvNumberformatScan | null): void {
    this.Enlarge(source.nStringsCnt);
    this.aI.Copy(source.aI, this.nStringsCnt);
    this.sColorName.assign(source.sColorName);
    this.pColor = scanner ? scanner.GetColor(this.sColorName) : source.pColor;
    this.aNatNum.assign(source.aNatNum);
  }
  /** Original vector and native-number metadata member destruction. @returns Nothing. */
  dispose(): void {
    this.aNatNum.dispose();
    this.sColorName.dispose();
    for (let index = this.aI.sStrArray.length - 1; index >= 0; --index)
      (this.aI.sStrArray[index] as OUString).dispose();
  }
}

/** Original SvNumberformat compiled-entry owner with actual four-section prefix/condition/scanner construction and value-copy lifetimes. Remaining formatted output and standard-table generation are separate incomplete responsibilities. */
export class SvNumberformat {
  private readonly NumFor = [
    new ImpSvNumFor(),
    new ImpSvNumFor(),
    new ImpSvNumFor(),
    new ImpSvNumFor(),
  ];
  private readonly sFormatstring = new OUString();
  private readonly sComment = new OUString();
  private bStandard = false;
  private bAdditionalBuiltin = false;
  private eType: number = SvNumFormatType.DEFINED;
  private fLimit1 = 0;
  private fLimit2 = 0;
  private eOp1 = 0;
  private eOp2 = 0;
  private readonly maLocale = new LocaleType();
  private readonly rScan: ImpSvNumberformatScan;
  /** Original static quote-state helper. @param value - Native string. @param position - Offset. @param quote - Quote unit. @param escapeInside - Inside escape. @param escapeOutside - Outside escape. @returns Quote state. */
  static IsInQuote(
    value: OUStringConstReference,
    position: number,
    quote = 34,
    escapeInside = 0,
    escapeOutside = 92,
  ): boolean {
    return IsInQuote(value, position, quote, escapeInside, escapeOutside);
  }
  /** Original static closing-quote helper. @param value - Native string. @param position - Offset. @param quote - Quote unit. @param escapeInside - Inside escape. @returns Closing position or source sentinel. */
  static GetQuoteEnd(
    value: OUStringConstReference,
    position: number,
    quote = 34,
    escapeInside = 0,
  ): number {
    return GetQuoteEnd(value, position, quote, escapeInside);
  }
  /** Original automatic-currency code conversion used by builtin insertion. @param value - Native format code. @returns Owned stripped code. */
  static StripNewCurrencyDelimiters(value: OUStringConstReference): OUString {
    return StripNewCurrencyDelimiters(value);
  }
  /** Original normal and copy constructor overloads. Normal construction consumes the actual format scanner, input scanner and native-number provider, preserving the original Boolean replacement default. @param args - Original constructor/copy inputs. @returns Owned parsed entry. */
  constructor(
    ...args:
      | [
          code: OUString,
          scanner: ImpSvNumberformatScan,
          input: ImpSvNumberInputScan,
          native: NativeNumberWrapper,
          checkPos: [number],
          language: [number],
          replaceBoolean?: boolean,
        ]
      | [source: SvNumberformat]
      | [source: SvNumberformat, scanner: ImpSvNumberformatScan]
  ) {
    try {
      if (args[0] instanceof SvNumberformat) {
        const source = args[0];
        this.rScan = args.length === 2 ? args[1] : source.rScan;
        this.maLocale.assign(source.maLocale);
        this.sFormatstring.assign(source.sFormatstring);
        this.sComment.assign(source.sComment);
        this.eType = source.eType;
        this.bStandard = source.bStandard;
        this.bAdditionalBuiltin = source.bAdditionalBuiltin;
        this.fLimit1 = source.fLimit1;
        this.fLimit2 = source.fLimit2;
        this.eOp1 = source.eOp1;
        this.eOp2 = source.eOp2;
        for (let index = 0; index < 4; ++index)
          (this.NumFor[index] as ImpSvNumFor).Copy(
            source.NumFor[index] as ImpSvNumFor,
            this.rScan !== source.rScan ? this.rScan : null,
          );
      } else {
        const [code, scanner, input, native, checkPos, language, replaceBoolean = true] = args as [
          OUString,
          ImpSvNumberformatScan,
          ImpSvNumberInputScan,
          NativeNumberWrapper,
          [number],
          [number],
          boolean?,
        ];
        this.rScan = scanner;
        Construct.call(this, code, input, native, checkPos, language, replaceBoolean);
      }
    } catch (error) {
      this.dispose();
      throw error;
    }
  }
  /** Original parsed ISO date-layout query. @param index - Native subformat. @returns Source flag. */
  IsIso8601(index: number): boolean {
    return IsIso8601(this, index);
  }
  /** Original locale substitution presence. @returns Substituted format. */
  IsSubstituted(): boolean {
    return this.maLocale.meSubstitute !== Substitute.NONE;
  }
  /** Original system-time substitution query. @returns System time format. */
  IsSystemTimeFormat(): boolean {
    return (
      this.maLocale.meSubstitute === Substitute.TIME && this.maLocale.meLanguage === LANGUAGE_SYSTEM
    );
  }
  /** Original system-long-date substitution query. @returns System long date format. */
  IsSystemLongDateFormat(): boolean {
    return (
      this.maLocale.meSubstitute === Substitute.LONGDATE &&
      this.maLocale.meLanguage === LANGUAGE_SYSTEM
    );
  }
  /** Original built-in generation marks the compiled standard entry after successful insertion. @returns Nothing. */
  SetStandard(): void {
    this.bStandard = true;
  }
  /** Original complete type flags. @returns Native type. */
  GetType(): number {
    return this.eType;
  }
  /** Source condition test for whether the second subformat denotes negative values. @returns Real-negative status. */
  IsSecondSubformatRealNegative(): boolean {
    return (
      this.fLimit1 === 0 &&
      this.fLimit2 === 0 &&
      ((this.eOp1 === 6 && this.eOp2 === 0) ||
        (this.eOp1 === 5 && this.eOp2 === 3) ||
        (this.eOp1 === 0 && this.eOp2 === 0))
    );
  }
  /** Source token lookup, including forward/backward literal or currency search. @param subformat - Native 0..3 section. @param position - Token offset or 0xffff for last. @param string - Search for a literal/currency token. @returns Borrowed token or null. */
  GetNumForString(
    subformat: number,
    position: number,
    string = false,
  ): OUStringConstReference | null {
    if (subformat > 3) return null;
    const section = this.NumFor[subformat] as ImpSvNumFor,
      count = section.GetCount();
    if (!count) return null;
    const info = section.Info();
    if (position === 0xffff) {
      position = count - 1;
      if (string) {
        while (
          position > 0 &&
          info.nTypeArray[position] !== NfSymbolType.STRING &&
          info.nTypeArray[position] !== NfSymbolType.CURRENCY
        )
          position--;
        if (
          info.nTypeArray[position] !== NfSymbolType.STRING &&
          info.nTypeArray[position] !== NfSymbolType.CURRENCY
        )
          return null;
      }
    } else if (position > count - 1) return null;
    else if (string) {
      while (
        position < count &&
        info.nTypeArray[position] !== NfSymbolType.STRING &&
        info.nTypeArray[position] !== NfSymbolType.CURRENCY
      )
        position++;
      if (
        position >= count ||
        (info.nTypeArray[position] !== NfSymbolType.STRING &&
          info.nTypeArray[position] !== NfSymbolType.CURRENCY)
      )
        return null;
    }
    return info.sStrArray[position] as OUString;
  }
  /** Source literal-token count excludes numeric and modifier tokens. @param subformat - Native section. @returns Count. */
  private ImpGetNumForStringElementCount(subformat: number): number {
    const section = this.NumFor[subformat] as ImpSvNumFor,
      types = section.Info().nTypeArray;
    let count = 0;
    for (let index = 0; index < section.GetCount(); index++) {
      switch (types[index]) {
        case NfSymbolType.STRING:
        case NfSymbolType.CURRENCY:
        case NfSymbolType.DATESEP:
        case NfSymbolType.TIMESEP:
        case NfSymbolType.TIME100SECSEP:
        case NfSymbolType.PERCENT:
          count++;
      }
    }
    return count;
  }
  /** Source count check first admits the complete token count, then compares literal counts with modifiers ignored. @param subformat - Native section. @param allCount - Input fragment count. @param numberCount - Input numeric fragment count. @returns Count match. */
  IsNumForStringElementCountEqual(
    subformat: number,
    allCount: number,
    numberCount: number,
  ): boolean {
    if (subformat < 4) {
      const count = (this.NumFor[subformat] as ImpSvNumFor).GetCount();
      if (allCount === count) return true;
      if (allCount < count)
        return (
          this.ImpGetNumForStringElementCount(subformat) === ((allCount - numberCount) & 0xffff)
        );
    }
    return false;
  }
  /** Source scanned type of one compiled subformat. @param subformat - Native section. @returns Scanned type or UNDEFINED. */
  GetNumForInfoScannedType(subformat: number): number {
    return subformat < 4
      ? (this.NumFor[subformat] as ImpSvNumFor).Info().eScannedType
      : SvNumFormatType.UNDEFINED;
  }
  /** Source negative section's first literal sign test. @returns Whether its negative sign is implicit. */
  IsNegativeWithoutSign(): boolean {
    if (this.IsSecondSubformatRealNegative()) {
      const value = this.GetNumForString(1, 0, true);
      if (value) return !SvNumberformat.HasStringNegativeSign(value);
    }
    return false;
  }
  /** Source sign-at-start-or-end predicate, ignoring only ASCII spaces. @param value - Literal token. @returns Whether '-' occurs at an edge. */
  static HasStringNegativeSign(value: OUStringConstReference): boolean {
    const length = value.getLength();
    if (!length) return false;
    const units = value.getStr();
    let position = 0;
    do {
      if (units[position] === 45) return true;
    } while (units[position] === 32 && ++position < length);
    position = length - 1;
    do {
      if (units[position] === 45) return true;
    } while (units[position] === 32 && 0 < --position);
    return false;
  }
  /** Original type assignment. @param type - Original flags. @returns Nothing. */
  SetType(type: number): void {
    this.eType = type;
  }
  /** Original standard-entry flag. @returns Native standard status. */
  IsStandard(): boolean {
    return this.bStandard;
  }
  /** Original additional-builtin flag assignment. @returns Nothing. */
  SetAdditionalBuiltin(): void {
    this.bAdditionalBuiltin = true;
  }
  /** Original additional-builtin field query. @returns Actual flag. */
  IsAdditionalBuiltin(): boolean {
    return this.bAdditionalBuiltin;
  }
  /** Original comment assignment preserves the owned member identity. @param comment - Original format name/comment. @returns Nothing. */
  SetComment(comment: OUStringConstReference): void {
    this.sComment.assign(comment);
  }
  /** Original borrowed comment member. @returns Actual field. */
  GetComment(): OUStringConstReference {
    return this.sComment;
  }
  /** Original formatter-private field access;the C++ friend access tag is erased,not a new state or policy. Only the format table/formatter may use this on standard format0/10000/etc. @returns Last allocated key within the locale block. */
  GetLastInsertKey(): number {
    return (this.NumFor[0] as ImpSvNumFor).Info().nThousand;
  }
  /** Original formatter-private write to the standard entry's shared nThousand field. @param key - Native uint16 last key. @returns Nothing. */
  SetLastInsertKey(key: number): void {
    (this.NumFor[0] as ImpSvNumFor).Info().nThousand = key & 65535;
  }
  /** Original native type with the DEFINED flag removed. @returns Format flags. */
  GetMaskedType(): number {
    return this.eType & ~SvNumFormatType.DEFINED;
  }
  /** Original text-type bit test. @returns Whether the entry is a text format. */
  IsTextFormat(): boolean {
    return (this.eType & SvNumFormatType.TEXT) !== 0;
  }
  /** Original fourth-subformat text test. @returns Whether text has a dedicated section. */
  HasTextFormat(): boolean {
    const section = this.NumFor[3] as ImpSvNumFor;
    return section.GetCount() > 0 || section.Info().eScannedType === SvNumFormatType.TEXT;
  }
  /** Original first date-token ordering, falling back to the current locale for non-date formats. @returns DateOrder. */
  GetDateOrder(): DateOrder {
    if (this.eType & SvNumFormatType.DATE) {
      const first = this.NumFor[0] as ImpSvNumFor,
        types = first.Info().nTypeArray;
      for (let index = 0; index < first.GetCount(); index++) {
        const token = types[index];
        switch (token) {
          case NfKeywordIndex.D:
          case NfKeywordIndex.DD:
            return DateOrder.DMY;
          case NfKeywordIndex.M:
          case NfKeywordIndex.MM:
          case NfKeywordIndex.MMM:
          case NfKeywordIndex.MMMM:
          case NfKeywordIndex.MMMMM:
            return DateOrder.MDY;
          case NfKeywordIndex.YY:
          case NfKeywordIndex.YYYY:
          case NfKeywordIndex.EC:
          case NfKeywordIndex.EEC:
          case NfKeywordIndex.R:
          case NfKeywordIndex.RR:
            return DateOrder.YMD;
        }
      }
    }
    return this.rScan.GetLoc().getDateOrder();
  }
  /** Original packed first-three date-token order, or zero for a non-date format. @returns Packed D/M/Y bytes. */
  GetExactDateOrder(): number {
    if (!(this.eType & SvNumFormatType.DATE)) return 0;
    const first = this.NumFor[0] as ImpSvNumFor,
      types = first.Info().nTypeArray;
    let order = 0,
      count = 0;
    for (let index = 0; index < first.GetCount() && count < 3; index++) {
      const token = types[index];
      let char = 0;
      switch (token) {
        case NfKeywordIndex.D:
        case NfKeywordIndex.DD:
          char = 68;
          break;
        case NfKeywordIndex.M:
        case NfKeywordIndex.MM:
        case NfKeywordIndex.MMM:
        case NfKeywordIndex.MMMM:
        case NfKeywordIndex.MMMMM:
          char = 77;
          break;
        case NfKeywordIndex.YY:
        case NfKeywordIndex.YYYY:
        case NfKeywordIndex.EC:
        case NfKeywordIndex.EEC:
        case NfKeywordIndex.R:
        case NfKeywordIndex.RR:
          char = 89;
          break;
      }
      if (char) {
        order = (order << 8) | char;
        count++;
      }
    }
    return order;
  }
  /** Original compiled MM:SS token-state recognizer, including bracketed minutes and trailing fractional digits. @returns Whether the first subformat is a minute-second time. */
  IsMinuteSecondFormat(): boolean {
    if (this.GetMaskedType() !== SvNumFormatType.TIME) return false;
    const kLB = 0x01,
      kRB = 0x02,
      kMM = 0x04,
      kTS = 0x08,
      kSS = 0x10,
      first = this.NumFor[0] as ImpSvNumFor,
      info = first.Info();
    let state = 0,
      separator = false;
    for (let index = 0; index < first.GetCount(); ++index) {
      const token = info.nTypeArray[index],
        value = info.sStrArray[index] as OUString;
      switch (token) {
        case NfSymbolType.DEL: {
          if (value.getLength() !== 1) return false;
          const character = value.getStr()[0];
          if (character === 91) {
            if (state !== 0 && state !== (kMM | kTS)) return false;
            state |= kLB;
          } else if (character === 93) {
            if (state !== (kLB | kMM) && state !== (kMM | kTS | kLB | kSS)) return false;
            state |= kRB;
          } else return false;
          break;
        }
        case NfKeywordIndex.MI:
        case NfKeywordIndex.MMI:
          if (state !== 0 && state !== kLB) return false;
          state |= kMM;
          break;
        case NfSymbolType.TIMESEP:
          if (state !== kMM && state !== (kLB | kMM | kRB)) return false;
          state |= kTS;
          break;
        case NfKeywordIndex.S:
        case NfKeywordIndex.SS:
          if (
            state !== (kMM | kTS) &&
            state !== (kLB | kMM | kRB | kTS) &&
            state !== (kMM | kTS | kLB)
          )
            return false;
          state |= kSS;
          break;
        case NfSymbolType.TIME100SECSEP:
          if (state !== (kMM | kTS | kSS) && state !== (kLB | kMM | kRB | kTS | kSS)) return false;
          separator = true;
          break;
        case NfSymbolType.DIGIT:
          if (!separator) return false;
          break;
        case NfSymbolType.STRING:
          break;
        default:
          return false;
      }
    }
    return state === (kMM | kTS | kSS) || state === (kLB | kMM | kRB | kTS | kSS);
  }
  /** Original entry language. @returns Native uint16 language. */
  GetLanguage(): number {
    return this.maLocale.meLanguage;
  }
  /** Original subformat-order currency symbol lookup, clearing both outputs only after all sections fail. @param symbol - Mutable symbol. @param extension - Mutable extension. @returns Found. */
  GetNewCurrencySymbol(symbol: OUString, extension: OUString): boolean {
    for (const section of this.NumFor)
      if (section.GetNewCurrencySymbol(symbol, extension)) return true;
    symbol.clear();
    extension.clear();
    return false;
  }
  /** Original borrowed normalized code owner. @returns Native const field. */
  GetFormatstring(): OUStringConstReference {
    return this.sFormatstring;
  }
  /** Original text output copies input at @/General tokens in the selected text section. @param value - Text input. @param output - Actual mutable output. @param color - Color output. @param star - Star fill flag. @returns Nothing. */
  GetOutputString(
    value: OUStringConstReference,
    output: OUString,
    color: [Color | null],
    star?: boolean,
  ): void;
  /** Original standard NUMBER, LOGICAL and TEXT numeric output. @param value - Binary64 input. @param output - Actual mutable output. @param color - Original output color pointer. @param precision - Native current standard precision. @param decimal - Original first decimal unit. @param scanner - Current language's format scanner for Boolean keywords. @returns Whether star-fill occurred. */
  GetOutputString(
    value: number,
    output: OUString,
    color: [Color | null],
    precision: number,
    decimal: number,
    scanner?: ImpSvNumberformatScan,
  ): boolean;
  /** Implements Get Output String. @param value - Value. @param output - Output. @param color - Color. @param precisionOrStar - Precision Or Star. @param decimal - Decimal. @param scanner - Scanner. @returns The boolean | void result. */ GetOutputString(
    value: number | OUStringConstReference,
    output: OUString,
    color: [Color | null],
    precisionOrStar: number | boolean = false,
    decimal = 0,
    scanner?: ImpSvNumberformatScan,
  ): boolean | void {
    if (typeof value !== "number") {
      const index = this.IsTextFormat()
        ? 0
        : (this.NumFor[3] as ImpSvNumFor).GetCount() > 0
          ? 3
          : -1;
      if (index < 0) {
        color[0] = null;
        return;
      }
      color[0] = null;
      const section = this.NumFor[index] as ImpSvNumFor;
      const info = section.Info();
      const buffer = new OUStringBuffer();
      try {
        if (info.eScannedType === SvNumFormatType.TEXT)
          for (let token = 0; token < section.GetCount(); token++) {
            const kind = info.nTypeArray[token];
            if (kind === NfKeywordIndex.GENERAL || kind === NfSymbolType.DEL) buffer.append(value);
            else if (kind !== NfSymbolType.STAR && kind !== NfSymbolType.BLANK)
              buffer.append(info.sStrArray[token] as OUString);
          }
        const result = buffer.makeStringAndClear();
        try {
          output.assign(result);
        } finally {
          result.dispose();
        }
      } finally {
        buffer.dispose();
      }
      void precisionOrStar;
      return;
    }
    const precision = precisionOrStar as number;
    output.clear();
    color[0] = null;
    if (
      this.eType === SvNumFormatType.LOGICAL &&
      scanner &&
      this.sFormatstring.equals(scanner.GetBooleanString())
    ) {
      output.assign(value ? scanner.GetTrueString() : scanner.GetFalseString());
      return false;
    }
    const section = this.NumFor[0] as ImpSvNumFor,
      info = section.Info();
    // Original nonstandard NUMBER dispatch, restricted to the represented ungrouped integer digit production.
    if (
      this.GetMaskedType() === SvNumFormatType.NUMBER &&
      this.eOp1 === 0 &&
      this.eOp2 === 0 &&
      section.GetCount() === 1 &&
      info.nTypeArray[0] === NfSymbolType.DIGIT &&
      info.nCntPost === 0 &&
      info.nThousand === 0 &&
      !info.bThousand &&
      section.GetNatNum().GetNatNum() === 0 &&
      Number.isFinite(value)
    ) {
      color[0] = section.GetColor();
      this.ImpGetNumberOutput(value, section, output);
      return false;
    }
    if (
      this.eType !== SvNumFormatType.TEXT &&
      (!this.bStandard || this.eType !== SvNumFormatType.NUMBER)
    )
      throw new Error("SvNumberformat nonstandard output is not implemented");
    const result = formatStandardNumber(
      value,
      this.eType === SvNumFormatType.TEXT ? Math.min(precision & 65535, 300) : precision,
      decimal,
    );
    try {
      output.assign(result);
    } finally {
      result.dispose();
    }
    return false;
  }
  /** Original ImpGetNumberOutput/ImpDecimalFill/ImpNumberFillWithThousands digit-only integer path. Caller admits one ungrouped digit token, no conditions, no decimals/scaling and NatNum0. Native ROUND correction precedes F conversion; the original backwards placeholder fill and rounded-zero sign suppression are retained. Other output productions remain unported. @param value - Finite native number. @param section - Actual compiled subformat. @param outputString - Actual owned output. @returns Nothing. */
  private ImpGetNumberOutput(value: number, section: ImpSvNumFor, outputString: OUString): void {
    let sign = value < 0;
    value = round(Math.abs(value), 0);
    const buffer = new OUStringBuffer();
    try {
      if (value !== 0) {
        const digits = output(value, Format.rtl_math_StringFormat_F, 0, 46);
        try {
          buffer.append(digits);
        } finally {
          digits.dispose();
        }
        buffer.stripStart(48);
      }
      if (buffer.isEmpty()) sign = false;
      let position = buffer.getLength();
      const pattern = section.Info().sStrArray[0] as OUString;
      for (let index = pattern.getLength() - 1; index >= 0; --index) {
        if (position > 0) --position;
        else if (pattern.getStr()[index] === 48) buffer.insertChar(0, 48);
        else if (pattern.getStr()[index] === 63) buffer.insertChar(0, 0x2007);
      }
      if (sign) buffer.insertChar(0, 45);
      const result = buffer.makeStringAndClear();
      try {
        outputString.assign(result);
      } finally {
        result.dispose();
      }
    } finally {
      buffer.dispose();
    }
  }
  /** Original compiled entry member destruction. @returns Nothing. */
  dispose(): void {
    this.sComment.dispose();
    this.sFormatstring.dispose();
    for (let index = this.NumFor.length - 1; index >= 0; --index)
      (this.NumFor[index] as ImpSvNumFor).dispose();
  }
}

/** Original borrowed const parsed-entry surface consumed by public formatter clients;mutation,destruction and formatter-private key access remain with the actual owning table/formatter. */
export type SvNumberformatConstReference = Pick<
  SvNumberformat,
  | "GetType"
  | "GetMaskedType"
  | "IsTextFormat"
  | "HasTextFormat"
  | "GetDateOrder"
  | "GetExactDateOrder"
  | "IsMinuteSecondFormat"
  | "GetLanguage"
  | "GetNewCurrencySymbol"
  | "IsIso8601"
  | "IsStandard"
  | "IsAdditionalBuiltin"
  | "GetComment"
  | "GetFormatstring"
  | "GetOutputString"
  | "GetNumForString"
  | "IsSecondSubformatRealNegative"
  | "IsNegativeWithoutSign"
  | "IsNumForStringElementCountEqual"
  | "GetNumForInfoScannedType"
>;
