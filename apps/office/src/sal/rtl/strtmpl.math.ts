/** @fileoverview Consumed strtmpl.hxx Automatic/Max and Unicode float G7/no-group/erase specializations. JS shortest-decimal conversion replaces Dragonbox; integer rounding and presentation retain RTL rules. */
import { RTL_STR_MAX_VALUEOFFLOAT } from "../inc/rtl/string.h";
/** Formats the native consumed Automatic/Max specialization without porting buffer allocation or unrelated format modes. @param value - Binary64. @returns Native decimal text. */
export function doubleToString(value: number): string {
  if (Number.isNaN(value)) return "NaN";
  if (!Number.isFinite(value)) return value < 0 ? "-INF" : "INF";
  const sign = value < 0 || Object.is(value, -0) ? "-" : "";
  const absolute = Math.abs(value);
  // Native preserves all exact integer digits below 2^53, even beyond15significant digits.
  if (Number.isSafeInteger(absolute)) return sign + absolute.toFixed(0);
  const [mantissa, exponentText] = absolute.toString().split("e");
  const decimal = (mantissa as string).indexOf(".");
  const raw = (mantissa as string).replace(".", "");
  const first = raw.search(/[1-9]/);
  let digits = raw.slice(first).replace(/0+$/, "");
  let exponent = Number(exponentText ?? 0) + (decimal < 0 ? raw.length : decimal) - first - 1;
  // Native's four nextafter steps below DBL_MAX retain17digits to avoid exporting overflow.
  const maximum = absolute >= 1.797693134862315e308;
  const scientific = maximum || exponent <= -15 || exponent >= 15;
  const precision = maximum ? 17 : 15;
  if (digits.length > precision) {
    const divisor = 10n ** BigInt(digits.length - precision);
    const rounded = (((BigInt(digits) + divisor / 2n) / divisor) * divisor).toString();
    exponent += rounded.length - digits.length;
    digits = rounded.replace(/0+$/, "");
  }
  if (scientific) {
    const fraction = digits.length > 1 ? "." + digits.slice(1) : "";
    return (
      sign +
      digits[0] +
      fraction +
      "E" +
      (exponent < 0 ? "-" : "+") +
      Math.abs(exponent).toString().padStart(3, "0")
    );
  }
  if (exponent < 0) return sign + "0." + "0".repeat(-exponent - 1) + digits;
  const integerDigits = exponent + 1;
  return (
    sign +
    (digits.length <= integerDigits
      ? digits + "0".repeat(integerDigits - digits.length)
      : digits.slice(0, integerDigits) + "." + digits.slice(integerDigits))
  );
}

/** Native consumed G/float precision derived from the original buffer macro and exponent/sign decoration. */
const FLOAT_SIGNIFICANCE = RTL_STR_MAX_VALUEOFFLOAT - "-x.E-xxx".length;
/** Formats original G7/no-group/erase for an already narrowed float;notation selection precedes rounding,as in native doubleToString. @param value - Actual finite-or-special binary32 parameter. @returns Original Unicode-compatible decimal text. */
function floatToString(value: number): string {
  if (Number.isNaN(value)) return "NaN";
  if (!Number.isFinite(value)) return value < 0 ? "-INF" : "INF";
  const sign = value < 0 || Object.is(value, -0) ? "-" : "";
  const absolute = Math.abs(value);
  if (absolute === 0) return sign + "0";
  const [mantissa, exponentText] = absolute.toString().split("e");
  const decimal = (mantissa as string).indexOf(".");
  const raw = (mantissa as string).replace(".", "");
  const first = raw.search(/[1-9]/);
  let digits = raw.slice(first).replace(/0+$/, "");
  let exponent = Number(exponentText ?? 0) + (decimal < 0 ? raw.length : decimal) - first - 1;
  const scientific = exponent < -4 || exponent >= FLOAT_SIGNIFICANCE;
  if (digits.length > FLOAT_SIGNIFICANCE) {
    const divisor = 10n ** BigInt(digits.length - FLOAT_SIGNIFICANCE);
    const rounded = (((BigInt(digits) + divisor / 2n) / divisor) * divisor).toString();
    exponent += rounded.length - digits.length;
    digits = rounded.replace(/0+$/, "");
  }
  if (scientific) {
    const fraction = digits.length > 1 ? "." + digits.slice(1) : "";
    return (
      sign +
      digits[0] +
      fraction +
      "E" +
      (exponent < 0 ? "-" : "+") +
      Math.abs(exponent).toString().padStart(3, "0")
    );
  }
  if (exponent < 0) return sign + "0." + "0".repeat(-exponent - 1) + digits;
  const integerDigits = exponent + 1;
  return (
    sign +
    (digits.length <= integerDigits
      ? digits + "0".repeat(integerDigits - digits.length)
      : digits.slice(0, integerDigits) + "." + digits.slice(integerDigits))
  );
}
/** Original valueOfFP Unicode/float/maxLen15 specialization with the original null guard,terminator and untouched trailing caller storage. @param data - Actual sufficiently sized borrowed output storage. @param value - Native binary32 parameter. @returns Original written count. */
export function valueOfFP(data: Uint16Array | null, value: number): number {
  if (data === null) throw new Error("assert(pStr)");
  const text = floatToString(value);
  for (let index = 0; index < text.length; index++) data[index] = text.charCodeAt(index);
  data[text.length] = 0;
  return text.length;
}
