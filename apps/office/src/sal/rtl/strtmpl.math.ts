/** @fileoverview Consumed strtmpl.hxx doubleToString Automatic/Max/no-group/erase specialization. JS shortest-decimal conversion replaces Dragonbox; integer rounding and presentation retain RTL rules. */
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
