/** @fileoverview Numeric-result cases extracted from pinned ImpSvNumberInputScan::IsNumberFormat; calendar dispatch remains in its separate source path. */
import { text } from "../../../i18nlangtag/source/isolang/isolang.tables";
import type { OUString } from "../../../sal/inc/rtl/ustring";
import { rtl_math_ConversionStatus, rtl_math_uStringToDouble } from "../../../sal/inc/rtl/math.h";
import { SvNumFormatType } from "../../inc/zforlist";
import type { ImpSvNumberInputScanContext } from "./zforfind.context";

/** Binds source StringToDouble for its admitted unsigned fixed-decimal fragments. The caller has already split ASCII digits and bounded the complete input to 308 code units; no exponent, sign, grouping or non-number token is passed here. @param value - Constructed unsigned decimal. @returns Nearest binary64 value. */
export function StringToDouble(value: string): number {
  return Number(value);
}

/** Original post-classification signed-date, fragment-count and matched-format checks from IsNumberFormat, before value conversion. @param this - Original scanner owner after successful IsNumberFormatMain. @returns Whether category/count checks succeed. */
export function CheckScannedNumber(this: ImpSvNumberInputScanContext): boolean {
  const state = this["fields"],
    date =
      state.eScannedType === SvNumFormatType.DATE ||
      state.eScannedType === SvNumFormatType.DATETIME;
  if (
    state.nSign &&
    date &&
    state.mbEraCE &&
    (this["IsDatePatternNumberOfType"](0, "Y") ||
      (this["MayBeIso8601"]() &&
        (state.sStrArray[state.nNums[0] as number] as OUString).getLength() >= 4))
  ) {
    const first = state.sStrArray[0] as OUString,
      last = first.getStr()[first.getLength() - 1];
    if (last === 45 || last === 43) {
      if (state.nSign < 0) state.mbEraCE = false;
      state.nSign = 0;
    }
  }
  if (state.bNegCheck || (state.nSign !== 0 && date)) return false;
  switch (state.eScannedType) {
    case SvNumFormatType.PERCENT:
    case SvNumFormatType.CURRENCY:
    case SvNumFormatType.NUMBER:
      if (state.nDecPos === 1) {
        if (state.nMatchedAllStrings) state.nThousand = 0;
        else if (state.nNumericsCnt !== 1) return false;
      } else if (state.nDecPos === 2) {
        if (state.nMatchedAllStrings)
          state.nThousand = state.nNumericsCnt === 2 ? 0 : state.nNumericsCnt - 1;
        else if (state.nNumericsCnt !== state.nThousand + 2) return false;
      } else {
        if (state.nMatchedAllStrings) state.nThousand = state.nNumericsCnt - 1;
        else if (state.nNumericsCnt !== state.nThousand + 1) return false;
      }
      break;
    case SvNumFormatType.SCIENTIFIC:
      if (state.nDecPos === 1) {
        if (state.nNumericsCnt !== 2) return false;
      } else if (state.nDecPos === 2) {
        if (state.nNumericsCnt !== state.nThousand + 3) return false;
      } else if (state.nNumericsCnt !== state.nThousand + 2) return false;
      break;
    case SvNumFormatType.DATE:
      if (state.nMonth < 0 && state.nDayOfWeek < 0 && state.nNumericsCnt === 3) {
        state.nMonth = 0;
        state.nMonthPos = 0;
      }
      if (state.nMonth) {
        if (state.nNumericsCnt > 2) return false;
      } else {
        if (state.nNumericsCnt > 3) return false;
        return (
          this["GetDatePatternNumbers"]() === state.nNumericsCnt ||
          this["IsAcceptableIso8601"]() ||
          state.nMatchedAllStrings !== 0
        );
      }
      break;
    case SvNumFormatType.TIME:
      if (state.nNumericsCnt > (state.nDecPos ? 4 : 3)) return false;
      break;
    case SvNumFormatType.DATETIME:
      if (state.nMonth < 0 && state.nDayOfWeek < 0 && state.nNumericsCnt >= 5) {
        state.nMonth = 0;
        state.nMonthPos = 0;
      }
      if (state.nMonth) {
        if (state.nNumericsCnt > (state.nDecPos ? 6 : 5)) return false;
      } else {
        if (state.nNumericsCnt > (state.nDecPos ? 7 : 6)) return false;
        return (
          this["IsAcceptedDatePattern"](state.nNums[0] as number) ||
          this["MayBeIso8601"]() ||
          state.nMatchedAllStrings !== 0
        );
      }
      break;
  }
  return true;
}

/** Original numeric/logical result switch and its final overflow/failure outputs. Requires the original category/count checks to have succeeded; DATE, TIME and DATETIME are dispatched elsewhere by the source caller. @param this - Original scanner owner. @param outputType - Original F_Type output. @param output - Original fOutNumber output. @returns Numeric conversion success. */
export function ConvertScannedNumber(
  this: ImpSvNumberInputScanContext,
  outputType: [number],
  output: [number],
): boolean {
  const state = this["fields"];
  const part =
    /** Borrows an ASCII numeric fragment by its native numeric-part index. @param index - Numeric-part index. @returns Fragment text. */ (
      index: number,
    ): string => text(state.sStrArray[state.nNums[index] as number] as OUString);
  let result = true,
    buffer = "",
    index: number;
  switch (state.eScannedType) {
    case SvNumFormatType.LOGICAL:
      if (state.nLogical === 1) output[0] = 1;
      else if (state.nLogical === -1) output[0] = 0;
      else result = false;
      break;
    case SvNumFormatType.PERCENT:
    case SvNumFormatType.CURRENCY:
    case SvNumFormatType.NUMBER:
    case SvNumFormatType.SCIENTIFIC:
    case SvNumFormatType.DEFINED:
      if (state.nDecPos === 1) buffer += "0.";
      for (index = 0; index <= state.nThousand; index++) buffer += part(index);
      if (state.nDecPos === 2 && index < state.nNumericsCnt) {
        buffer += ".";
        const stop =
          state.eScannedType === SvNumFormatType.SCIENTIFIC
            ? state.nNumericsCnt - 1
            : state.nNumericsCnt;
        for (; index < stop; index++) buffer += part(index);
      }
      if (state.eScannedType !== SvNumFormatType.SCIENTIFIC) output[0] = StringToDouble(buffer);
      else {
        buffer += "E";
        if (state.nESign === -1) buffer += "-";
        buffer += part(state.nNumericsCnt - 1);
        const units = Uint16Array.from(
            buffer,
            /** Maps the assembled ASCII number to SAL UTF-16 input. @param char - ASCII character. @returns UTF-16 unit. */ (
              char,
            ) => char.charCodeAt(0),
          ),
          status: [rtl_math_ConversionStatus] = [
            rtl_math_ConversionStatus.rtl_math_ConversionStatus_Ok,
          ];
        output[0] = rtl_math_uStringToDouble(units, units.length, 46, 44, status, null);
        if (status[0] === rtl_math_ConversionStatus.rtl_math_ConversionStatus_OutOfRange) {
          outputType[0] = SvNumFormatType.TEXT;
          output[0] = state.nESign === -1 ? 0 : Number.MAX_VALUE;
          return true;
        }
      }
      if (state.nStringScanSign)
        state.nSign = state.nSign ? state.nSign * state.nStringScanSign : state.nStringScanSign;
      if (state.nSign < 0) output[0] = -output[0];
      if (state.eScannedType === SvNumFormatType.PERCENT) output[0] /= 100;
      break;
    case SvNumFormatType.FRACTION:
      if (state.nNumericsCnt === 1) output[0] = StringToDouble(part(0));
      else if (state.nNumericsCnt === 2) {
        if (state.nThousand === 1) output[0] = StringToDouble(part(0) + part(1));
        else {
          const numerator = StringToDouble(part(0)),
            denominator = StringToDouble(part(1));
          if (denominator !== 0) output[0] = numerator / denominator;
          else result = false;
        }
      } else {
        index = 1;
        buffer = part(0);
        if (state.nThousand > 0) for (; index <= state.nThousand; index++) buffer += part(index);
        output[0] = StringToDouble(buffer);
        if (index === state.nNumericsCnt - 2) {
          const numerator = StringToDouble(part(index)),
            denominator = StringToDouble(part(index + 1));
          if (denominator !== 0) output[0] += numerator / denominator;
          else result = false;
        }
      }
      if (state.nStringScanSign)
        state.nSign = state.nSign ? state.nSign * state.nStringScanSign : state.nStringScanSign;
      if (state.nSign < 0) output[0] = -output[0];
      break;
  }
  if (result) {
    if (output[0] < -Number.MAX_VALUE) {
      outputType[0] = SvNumFormatType.TEXT;
      output[0] = -Number.MAX_VALUE;
      return true;
    }
    if (output[0] > Number.MAX_VALUE) {
      outputType[0] = SvNumFormatType.TEXT;
      output[0] = Number.MAX_VALUE;
      return true;
    }
  } else {
    state.eScannedType = SvNumFormatType.TEXT;
    output[0] = 0;
  }
  outputType[0] = state.eScannedType;
  return result;
}
