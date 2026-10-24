/** @fileoverview Consumed native SvNumberformat General/standard NUMBER output responsibility;custom patterns,other format types and nonzero NatNum are not implemented here. */
import { OUString } from "../../../sal/inc/rtl/ustring";
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
