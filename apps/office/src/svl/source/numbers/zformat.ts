/** @fileoverview Native General/NatNum0 compiled subformats,constructor/copy lifetime and standard NUMBER output responsibilities;other format families and full formatter services remain unported. */
import type { Color } from "../../../tools/inc/color";
import { SvNumFormatType } from "../../inc/zforlist";
import type { ImpSvNumberformatScan } from "./zforscan";
import { OUString, type OUStringConstReference } from "../../../sal/inc/rtl/ustring";
import {
  rtl_math_doubleToUString,
  rtl_math_StringFormat as Format,
  rtl_math_DecimalPlaces,
} from "../../../sal/inc/rtl/math.h";
import { approxEqual, round } from "../../../sal/inc/rtl/math";
import { INPUTSTRING_PRECISION, UNLIMITED_PRECISION } from "./zforlist.defaults";

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

/** Original subformat token/info owner. Color and NatNum prefix services are not admitted by the current General/NatNum0 constructor path. */
export class ImpSvNumFor {
  private readonly aI = new ImpSvNumberformatInfo();
  private nStringsCnt = 0;
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
  /** Original represented token/info copy. Color rebinding is a separate unported responsibility. @param source - Native General/NatNum0 subformat. @returns Nothing. */
  Copy(source: ImpSvNumFor): void {
    this.Enlarge(source.nStringsCnt);
    this.aI.Copy(source.aI, this.nStringsCnt);
  }
  /** Original vector member destruction. @returns Nothing. */
  dispose(): void {
    for (let index = this.aI.sStrArray.length - 1; index >= 0; --index)
      (this.aI.sStrArray[index] as OUString).dispose();
  }
}

/** Original SvNumberformat compiled-entry owner for the admitted single General/NatNum0 subformat path. Conditions,other patterns,prefixes and nonstandard output remain explicit unported boundaries. No synthetic parsed entry or formatter service is supplied. */
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
  private eType: number = SvNumFormatType.DEFINED;
  private readonly language: number;
  private readonly rScan: ImpSvNumberformatScan;
  /** Original General-only constructor responsibility:scan,Enlarge,CopyInfo,type assignment and normalized code. Input-number scanner/native-number supplier parameters are erased because this admitted path never consumes them;other constructor families must be ported before admission. @param args - Original admitted constructor/copy overload inputs. @returns Owned parsed entry. */
  constructor(
    ...args:
      | [code: OUString, scanner: ImpSvNumberformatScan, checkPos: [number], language: [number]]
      | [source: SvNumberformat]
      | [source: SvNumberformat, scanner: ImpSvNumberformatScan]
  ) {
    if (args[0] instanceof SvNumberformat) {
      const source = args[0];
      this.rScan = args.length === 2 ? args[1] : source.rScan;
      this.language = source.language;
      this.sFormatstring.assign(source.sFormatstring);
      this.sComment.assign(source.sComment);
      this.eType = source.eType;
      this.bStandard = source.bStandard;
      for (let index = 0; index < 4; ++index)
        (this.NumFor[index] as ImpSvNumFor).Copy(source.NumFor[index] as ImpSvNumFor);
    } else {
      const [code, scanner, checkPos, language] = args as [
        OUString,
        ImpSvNumberformatScan,
        [number],
        [number],
      ];
      this.rScan = scanner;
      this.language = language[0] & 65535;
      checkPos[0] = scanner.ScanFormat(code);
      const count = scanner.GetResultStringsCnt();
      // In the admitted empty/General scanner paths ScanFormat returns zero;other families throw at admission.
      if (count === 0) checkPos[0] = 1;
      if (checkPos[0] === 0) {
        const first = this.NumFor[0] as ImpSvNumFor;
        first.Enlarge(count);
        scanner.CopyInfo(first.Info(), count);
        this.eType = first.Info().eScannedType;
      }
      this.sFormatstring.assign(code);
    }
  }
  /** Original built-in generation marks the compiled standard entry after successful insertion. @returns Nothing. */
  SetStandard(): void {
    this.bStandard = true;
  }
  /** Original complete type flags. @returns Native type. */
  GetType(): number {
    return this.eType;
  }
  /** Original type assignment. @param type - Original flags. @returns Nothing. */
  SetType(type: number): void {
    this.eType = type;
  }
  /** Original standard-entry flag. @returns Native standard status. */
  IsStandard(): boolean {
    return this.bStandard;
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
  /** Original entry language. @returns Native uint16 language. */
  GetLanguage(): number {
    return this.language;
  }
  /** Original borrowed normalized code owner. @returns Native const field. */
  GetFormatstring(): OUStringConstReference {
    return this.sFormatstring;
  }
  /** Original GetOutputString standard NUMBER responsibility;current-language precision/decimal are projected fields. Color is reset before output and the native star-fill return remains false. @param value - Binary64 input. @param output - Actual mutable output. @param color - Original output color pointer. @param precision - Native current standard precision. @param decimal - Original first decimal unit. @returns Whether star-fill occurred. */
  GetOutputString(
    value: number,
    output: OUString,
    color: [Color | null],
    precision: number,
    decimal: number,
  ): boolean {
    if (!this.bStandard || this.eType !== SvNumFormatType.NUMBER)
      throw new Error("SvNumberformat nonstandard output is not implemented");
    output.clear();
    color[0] = null;
    const result = formatStandardNumber(value, precision, decimal);
    try {
      output.assign(result);
    } finally {
      result.dispose();
    }
    return false;
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
  | "GetLanguage"
  | "IsStandard"
  | "GetComment"
  | "GetFormatstring"
  | "GetOutputString"
>;
