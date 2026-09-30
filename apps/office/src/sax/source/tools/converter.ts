/** @fileoverview Implements the existing measure targets from pinned sax/source/tools/converter.cxx. */

/** Native core length targets implemented by Writer XML import. */
export type CoreMeasureUnit = "twip" | "mm100";

const measureRatios = {
  twip: { cm: 72000 / 127, in: 1440, mm: 7200 / 127, pt: 20, pc: 240 },
  mm100: { cm: 1000, in: 2540, mm: 100, pt: 635 / 18, pc: 1270 / 3, px: 635 / 24 },
};

/** Owns SAX scalar conversion without document or XML-context policy. */
export const Converter = {
  /** Serializes a core integer to centimetres with the pinned SAX precision. @param value - Core measure. @param source - Native core unit. @returns XML centimetre measure. */
  convertMeasureToXML(value: number, source: CoreMeasureUnit): string {
    const absolute = Math.abs(value);
    const scaled = source === "mm100" ? absolute : Math.trunc((absolute * 127 + 36) / 72);
    const remainder = scaled % 1000;
    const fraction =
      remainder === 0 ? "" : `.${String(remainder).padStart(3, "0").replace(/0+$/u, "")}`;
    return `${value < 0 ? "-" : ""}${Math.trunc(scaled / 1000)}${fraction}cm`;
  },
  /** Parses a native measure and rounds/clamps it to the selected core unit. Null corresponds to native false without an output value. @param value - Source measure. @param target - Core unit. @param min - Inclusive lower limit. @param max - Inclusive upper limit. @returns Converted integer or null on unsupported syntax/unit. */
  convertMeasure(
    value: string,
    target: CoreMeasureUnit = "mm100",
    min = -2147483648,
    max = 2147483647,
  ): number | null {
    let position = 0;
    // The pinned XML attribute view is UTF-8: signed non-ASCII char bytes also compare <= space.
    while (
      position < value.length &&
      (value.charCodeAt(position) <= 32 || value.charCodeAt(position) >= 128)
    )
      position++;
    const negative = value[position] === "-";
    if (negative) position++;
    let amount = 0;
    while (
      position < value.length &&
      value.charCodeAt(position) >= 48 &&
      value.charCodeAt(position) <= 57
    ) {
      amount = amount * 10 + value.charCodeAt(position) - 48;
      position++;
    }
    if (value[position] === ".") {
      position++;
      let divisor = 1;
      while (
        position < value.length &&
        value.charCodeAt(position) >= 48 &&
        value.charCodeAt(position) <= 57
      ) {
        divisor *= 10;
        amount += (value.charCodeAt(position) - 48) / divisor;
        position++;
      }
    }
    // The pinned XML attribute view is UTF-8: signed non-ASCII char bytes also compare <= space.
    while (
      position < value.length &&
      (value.charCodeAt(position) <= 32 || value.charCodeAt(position) >= 128)
    )
      position++;
    if (position < value.length) {
      const tail = value.slice(position);
      const ratios: Readonly<Record<string, number>> = measureRatios[target];
      const ratio = ratios[tail.slice(0, 2).toLowerCase()];
      if (ratio === undefined || (tail.length !== 2 && tail[2] !== " ")) return null;
      amount *= ratio;
    }
    amount += 0.5;
    if (negative) amount = -amount;
    if (amount <= min) return min;
    if (amount >= max) return max;
    return Math.trunc(amount) || 0;
  },
};
