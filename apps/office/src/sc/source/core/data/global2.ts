/** @fileoverview Original global2.cxx string-to-value policy and unambiguous date/time state machine, using actual RTL, tools Date and document formatter owners. */
import { isAsciiDigit } from "../../../../sal/inc/rtl/character";
import { ScCalcConfig } from "../../../inc/calcconfig";
import { FormulaError } from "../../../../formula/inc/errorcodes";
import type { OUStringConstReference } from "../../../../sal/inc/rtl/ustring";
import { stringToDouble, pow10Exp } from "../../../../sal/inc/rtl/math";
import { rtl_math_ConversionStatus } from "../../../../sal/inc/rtl/math-values";
import { toInt32 } from "../../../../o3tl/inc/string_view";
import { Date } from "../../../../tools/source/datetime/tdate";
import { SvNumFormatType } from "../../../../svl/inc/zforlist";
import type { ScInterpreterContext } from "../../../inc/interpretercontext";
/** Original empty-or-ASCII-spaces predicate. @param value - Counted native string. @returns Empty flag. */
function isEmptyString(value: OUStringConstReference): boolean {
  if (value.isEmpty()) return true;
  const units = value.getStr();
  if (units[0] === 32) {
    let p = 1;
    while (p < value.getLength() && units[p] === 32) ++p;
    if (p === value.getLength()) return true;
  }
  return false;
}
/** Original ordered conversion policies and literal native date/time parsing. Outputs are in/out native references; source error assignment order is retained. @param value - Native string. @param config - Actual calculation settings. @param error - Error output. @param stringError - Original caller-selected string error. @param context - Actual interpreter formatter context. @param formatType - In/out format kind. @returns Converted value. */
export function ConvertStringToValue(
  value: OUStringConstReference,
  config: ScCalcConfig,
  error: [FormulaError],
  stringError: FormulaError,
  context: ScInterpreterContext,
  formatType: [number],
): number {
  let result = 0;
  if (stringError === FormulaError.CellNoValue) {
    error[0] = stringError;
    return result;
  }
  switch (config.meStringConversion) {
    case ScCalcConfig.StringConversion.ILLEGAL:
      error[0] = stringError;
      return result;
    case ScCalcConfig.StringConversion.ZERO:
      return result;
    case ScCalcConfig.StringConversion.LOCALE: {
      if (config.mbEmptyStringAsZero && isEmptyString(value)) return result;
      const index: [number] = [0],
        output: [number] = [result];
      if (!context.NFIsNumberFormat(value, index, output)) {
        error[0] = stringError;
        output[0] = 0;
      }
      return output[0];
    }
    case ScCalcConfig.StringConversion.UNAMBIGUOUS:
      if (!config.mbEmptyStringAsZero && isEmptyString(value)) {
        error[0] = stringError;
        return result;
      }
      break;
  }
  const status: [rtl_math_ConversionStatus] = [
      rtl_math_ConversionStatus.rtl_math_ConversionStatus_Ok,
    ],
    end: [number] = [0];
  result = stringToDouble(value, 0, 0, status, end);
  const length = value.getLength();
  if (status[0] === rtl_math_ConversionStatus.rtl_math_ConversionStatus_Ok && end[0] < length) {
    const units = value.getStr();
    let p = end[0];
    switch (units[p++]) {
      case 32:
        while (p < length && units[p] === 32) ++p;
        if (p < length) error[0] = stringError;
        break;
      case 45:
      case 58: {
        const date = units[p - 1] === 45;
        const year = 0,
          month = 1,
          day = 2,
          hour = 3,
          minute = 4,
          second = 5,
          fraction = 6,
          done = 7,
          blank = 8,
          stop = 9;
        const unit = [0, 0, 0, 0, 0, 0, 0],
          limit = [0, 12, 31, 0, 59, 59, 0];
        let state = date ? month : minute;
        formatType[0] = date ? SvNumFormatType.DATE : SvNumFormatType.TIME;
        unit[state - 1] = toInt32(units.subarray(0, end[0]));
        let lastStart = p;
        p = 0;
        while (p < length && units[p] === 32) ++p;
        if (p < length && !isAsciiDigit(units[p] as number)) error[0] = stringError;
        p = lastStart;
        while (p < length && error[0] === FormulaError.NONE && state < blank) {
          if (state === minute) formatType[0] |= SvNumFormatType.TIME;
          if (isAsciiDigit(units[p] as number)) {
            if (p - lastStart >= 2 && state !== fraction) error[0] = stringError;
          } else if (p > lastStart) {
            if (state < done) {
              unit[state] = toInt32(units.subarray(lastStart, p));
              if (limit[state] && (limit[state] as number) < (unit[state] as number))
                error[0] = stringError;
            }
            lastStart = p + 1;
            switch (state) {
              case month:
                if (units[p] !== 45 || p + 1 === length) error[0] = stringError;
                break;
              case day:
                if ((units[p] !== 84 || p + 1 === length) && units[p] !== 32)
                  error[0] = stringError;
                break;
              case hour:
                if (units[p] !== 58 || p + 1 === length) error[0] = stringError;
                break;
              case minute:
                if ((units[p] !== 58 || p + 1 === length) && units[p] !== 32)
                  error[0] = stringError;
                if (units[p] === 32) state = done;
                break;
              case second:
                if (((units[p] !== 44 && units[p] !== 46) || p + 1 === length) && units[p] !== 32)
                  error[0] = stringError;
                if (units[p] === 32) state = done;
                break;
              case fraction:
                state = done;
                break;
              default:
                error[0] = stringError;
                break;
            }
            ++state;
          } else error[0] = stringError;
          ++p;
        }
        if (state === blank) {
          while (p < length && units[p] === 32) ++p;
          if (p < length) error[0] = stringError;
          state = stop;
        }
        if (
          state === month ||
          (state === day && p <= lastStart) ||
          state === hour ||
          (state === minute && p <= lastStart)
        )
          error[0] = stringError;
        if (error[0] === FormulaError.NONE) {
          if (p > lastStart && state < done) {
            unit[state] = toInt32(units.subarray(lastStart, p));
            if (limit[state] && (limit[state] as number) < (unit[state] as number))
              error[0] = stringError;
          }
          if (date && (unit[hour] as number) > 23) error[0] = stringError;
          if (error[0] === FormulaError.NONE) {
            if (date && unit[day] === 0) unit[day] = 1;
            const part = unit[fraction] as number;
            const fractionValue = part <= 0 ? 0 : pow10Exp(part, -Math.ceil(Math.log10(part)));
            if (!date) result = 0;
            else {
              const parsedDate = new Date(
                unit[day] as number,
                unit[month] as number,
                unit[year] as number,
              );
              if (!parsedDate.IsValidDate()) error[0] = stringError;
              else
                result =
                  parsedDate.GetAsNormalizedDays() - context.NFGetNullDate().GetAsNormalizedDays();
            }
            result +=
              ((unit[hour] as number) * 3600 +
                (unit[minute] as number) * 60 +
                (unit[second] as number) +
                fractionValue) /
              86400;
          }
        }
        break;
      }
      default:
        error[0] = stringError;
    }
    if (error[0] !== FormulaError.NONE) result = 0;
  }
  return result;
}
