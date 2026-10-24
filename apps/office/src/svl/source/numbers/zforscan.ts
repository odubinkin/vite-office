/** @fileoverview Original standard-name extraction and admitted single-General scanner state/compilation;full language/service initialization and other pattern families remain unported. */
import { OUString, type OUStringConstReference } from "../../../sal/inc/rtl/ustring";
import type { LocaleConstReference } from "../../../udkapi/com/sun/star/lang/Locale";
import { uppercase } from "../../../unotools/inc/charclass";
import { SvNumFormatType } from "../../inc/zforlist";
import type { ImpSvNumberformatInfo } from "./zformat";
/** Original keyword localization enum values from zforscan.hxx. */
export const KeywordLocalization = { LocaleLegacy: 0, EnglishOnly: 1, AllowEnglish: 2 } as const;
/** Original keyword discriminator from nfkeytab.hxx. */
export const NF_KEY_GENERAL = 39;
/** Original flag set by FinalScan when the General keyword occurs. */
export const FLAG_STANDARD_IN_FORMAT = 1000;

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
  private readonly englishGeneral = new OUString(Uint16Array.of(71, 69, 78, 69, 82, 65, 76), 7);
  private readonly symbol = new OUString();
  private nResultStringsCnt = 0;
  private eScannedType: number = SvNumFormatType.UNDEFINED;
  private nThousand = 0;
  private nStandardPrec = 2;
  /** Consumed native scanner constructor/dependent-General-keyword initialization. The caller owns prepared locale fields,as the native language-data owner does. @param locale - Borrowed actual CharClass locale. @param standardName - Actual extracted standard name from loaded locale format0. @param localization - Original selected keyword-localization field after dependent-keyword initialization. @returns Actual scanner state. */
  constructor(
    private readonly locale: LocaleConstReference,
    standardName: OUStringConstReference,
    private readonly localization: number,
  ) {
    this.sNameStandardFormat = new OUString(standardName);
    this.generalKeyword = uppercase(standardName, locale);
  }
  /** Original Reset scalar state for admitted General tokens;the fixed source symbol storage remains owned until destruction. @returns Nothing. */
  Reset(): void {
    this.nResultStringsCnt = 0;
    this.eScannedType = SvNumFormatType.UNDEFINED;
    this.nThousand = 0;
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
      if (!upper.equals(this.generalKeyword)) {
        if (
          this.localization === KeywordLocalization.AllowEnglish &&
          upper.equals(this.englishGeneral)
        )
          foundEnglish = true;
        else
          throw new Error("Number-format patterns other than single General are not implemented");
      }
      // Symbol_Division uses original case for a locale keyword and the locale name for an English match.
      this.symbol.assign(foundEnglish ? this.sNameStandardFormat : code);
      this.eScannedType = SvNumFormatType.NUMBER;
      this.nThousand = FLAG_STANDARD_IN_FORMAT;
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
      info.nTypeArray[index] = NF_KEY_GENERAL;
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
    this.englishGeneral.dispose();
    this.generalKeyword.dispose();
    this.sNameStandardFormat.dispose();
  }
}
