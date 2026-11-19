/** @fileoverview Complete test_doubleToString witnesses from pinned sal/qa/rtl/math/test-rtl-math.cxx, replayed through actual Unicode and byte C facades. */
import { expect, it } from "vitest";
import { OUString } from "../inc/rtl/ustring";
import { OString } from "../inc/rtl/string";
import { text } from "../../i18nlangtag/source/isolang/isolang.tables";
import {
  rtl_math_doubleToString,
  rtl_math_doubleToUString,
  rtl_math_stringToDouble,
  rtl_math_uStringToDouble,
  rtl_math_StringFormat as F,
  rtl_math_DecimalPlaces as P,
} from "../inc/rtl/math.h";
/** Actual positive finite input construction for the original four std::nextafter witnesses. @param steps - Steps toward zero from DBL_MAX. @returns Binary64 input. */
function maxBelow(steps: number): number {
  const bytes = new DataView(new ArrayBuffer(8));
  bytes.setBigUint64(0, 0x7fefffffffffffffn - BigInt(steps));
  return bytes.getFloat64(0);
}
/** Original source cases, with defaults materialized exactly. */
type FormatCase = readonly [
  value: number,
  format: F,
  places: number,
  erase: boolean,
  expected: string,
  groups?: readonly number[] | null,
  decimal?: number,
  group?: number,
];
const cases: readonly FormatCase[] = [
  [
    999999999999999,
    F.rtl_math_StringFormat_Automatic,
    P.rtl_math_DecimalPlaces_Max,
    true,
    "99,99,99,99,99,99,999",
    [3, 2, 0],
    46,
    44,
  ],
  [949, F.rtl_math_StringFormat_Automatic, -2, true, "900", [3, 2, 0], 46, 44],
  [950, F.rtl_math_StringFormat_Automatic, -2, true, "1,000", [3, 2, 0], 46, 44],
  [123456.78, F.rtl_math_StringFormat_Automatic, 2, true, "1٬23٬456٫78", [3, 2, 0], 0x66b, 0x66c],
  [
    4503599627370495,
    F.rtl_math_StringFormat_Automatic,
    P.rtl_math_DecimalPlaces_Max,
    true,
    "4503599627370495",
  ],
  [4503599627370496, F.rtl_math_StringFormat_Automatic, 2, false, "4503599627370496.00"],
  [-4503599627370496, F.rtl_math_StringFormat_Automatic, 2, false, "-4503599627370496.00"],
  [
    9007199254740991,
    F.rtl_math_StringFormat_Automatic,
    P.rtl_math_DecimalPlaces_Max,
    true,
    "9007199254740991",
  ],
  [
    9007199254740992,
    F.rtl_math_StringFormat_Automatic,
    P.rtl_math_DecimalPlaces_Max,
    true,
    "9.00719925474099E+015",
  ],
  [
    Number(9007199254740993n),
    F.rtl_math_StringFormat_Automatic,
    P.rtl_math_DecimalPlaces_Max,
    true,
    "9.00719925474099E+015",
  ],
  [0.001234567, F.rtl_math_StringFormat_G, 3, true, "0.00123"],
  [123.4567, F.rtl_math_StringFormat_G, 3, true, "123"],
  [123.4567, F.rtl_math_StringFormat_G, 4, true, "123.5"],
  [99.6, F.rtl_math_StringFormat_G, 3, true, "99.6"],
  [999.6, F.rtl_math_StringFormat_G, 3, true, "1000"],
  [9999.6, F.rtl_math_StringFormat_G, 3, true, "1E+004"],
  [12345.6789, F.rtl_math_StringFormat_G, -3, true, "1.2E+004"],
  [2000000528764739, F.rtl_math_StringFormat_G, 15, true, "2.00000052876474E+015"],
  [2000000528764739, F.rtl_math_StringFormat_G, 16, true, "2000000528764739"],
  [2000000528764739, F.rtl_math_StringFormat_G, 18, false, "2000000528764739.00"],
  ...[
    "1.7976931348623157E+308",
    "1.7976931348623155E+308",
    "1.7976931348623153E+308",
    "1.7976931348623151E+308",
    "1.797693134862315E+308",
  ].map(
    /** Original DBL_MAX and four nextafters. @param expected - Source output. @param steps - Source position. @returns Case. */
    (expected, steps): [number, F, number, boolean, string] => [
      maxBelow(steps),
      F.rtl_math_StringFormat_Automatic,
      P.rtl_math_DecimalPlaces_Max,
      true,
      expected,
    ],
  ),
  ...[
    "1.797693134862316E+308",
    "1.797693134862316E+308",
    "1.797693134862315E+308",
    "1.797693134862315E+308",
    "1.797693134862315E+308",
  ].map(
    /** Original nextafters with15places. @param expected - Source output. @param steps - Source position. @returns Case. */
    (expected, steps): [number, F, number, boolean, string] => [
      maxBelow(steps),
      F.rtl_math_StringFormat_Automatic,
      15,
      true,
      expected,
    ],
  ),
  [Number.MAX_VALUE, F.rtl_math_StringFormat_Automatic, 14, true, "1.79769313486232E+308"],
  [Number.MAX_VALUE, F.rtl_math_StringFormat_Automatic, 2, true, "1.8E+308"],
  [123456.789, F.rtl_math_StringFormat_E, 2, false, "1.23E+005"],
  [
    9.9999999999999929,
    F.rtl_math_StringFormat_Automatic,
    P.rtl_math_DecimalPlaces_Max,
    true,
    "9.99999999999999",
  ],
  [
    0.99999999999999933,
    F.rtl_math_StringFormat_F,
    P.rtl_math_DecimalPlaces_Max,
    true,
    "0.999999999999999",
  ],
];
it.for(cases)(
  "replays source formatting case %#",
  /** Original Unicode witnesses and byte-width adaptation use genuine C facade owners. @param testCase - Original input, expected output and materialized defaults. @returns Nothing. */ (
    testCase: FormatCase,
  ) => {
    const [value, format, places, erase, expected, groups = null, decimal = 46, group = 0] =
      testCase;
    const wide = new OUString(),
      bytes = new OString();
    try {
      rtl_math_doubleToUString(
        wide.getDataAddress(),
        null,
        0,
        value,
        format,
        places,
        decimal,
        groups,
        group,
        erase,
      );
      expect(text(wide)).toBe(expected);
      rtl_math_doubleToString(
        bytes.getDataAddress(),
        null,
        0,
        value,
        format,
        places,
        decimal,
        groups,
        group,
        erase,
      );
      const byteExpected = expected.replaceAll("٫", "k").replaceAll("٬", "l");
      expect(new TextDecoder().decode(bytes.getStr().subarray(0, bytes.getLength()))).toBe(
        byteExpected,
      );
      if (value === maxBelow(4) && places === P.rtl_math_DecimalPlaces_Max) {
        expect(rtl_math_uStringToDouble(wide.getStr(), wide.getLength(), 46, 44)).toBe(value);
        expect(rtl_math_stringToDouble(bytes.getStr(), bytes.getLength(), 46, 44)).toBe(value);
      }
    } finally {
      wide.dispose();
      bytes.dispose();
    }
  },
);
