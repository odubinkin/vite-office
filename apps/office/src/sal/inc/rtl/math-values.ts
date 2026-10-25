/** @fileoverview Native RTL numeric conversion status,format and precision declarations. */
/** Status of the represented decimal-to-binary64 conversion. */
export enum rtl_math_ConversionStatus {
  rtl_math_ConversionStatus_Ok = 0,
  rtl_math_ConversionStatus_OutOfRange = 1,
  rtl_math_ConversionStatus_FORCE_EQUAL_SIZE = 2147483647,
}

/** Original rounding selector values from include/rtl/math.h. */
export enum rtl_math_RoundingMode {
  rtl_math_RoundingMode_Corrected = 0,
  rtl_math_RoundingMode_Down = 1,
  rtl_math_RoundingMode_Up = 2,
  rtl_math_RoundingMode_Floor = 3,
  rtl_math_RoundingMode_Ceiling = 4,
  rtl_math_RoundingMode_HalfDown = 5,
  rtl_math_RoundingMode_HalfUp = 6,
  rtl_math_RoundingMode_HalfEven = 7,
  rtl_math_RoundingMode_FORCE_EQUAL_SIZE = 2147483647,
}

/** Original format selectors from include/rtl/math.h; integer values are part of the C contract. */
export enum rtl_math_StringFormat {
  rtl_math_StringFormat_E = 0,
  rtl_math_StringFormat_F = 1,
  rtl_math_StringFormat_G = 2,
  rtl_math_StringFormat_Automatic = 3,
  rtl_math_StringFormat_E1 = 4,
  rtl_math_StringFormat_E2 = 5,
  rtl_math_StringFormat_G1 = 6,
  rtl_math_StringFormat_G2 = 7,
  rtl_math_StringFormat_FORCE_EQUAL_SIZE = 2147483647,
}
/** Original sentinel shared by automatic precision and default G significance. */
export enum rtl_math_DecimalPlaces {
  rtl_math_DecimalPlaces_Max = 0x7ffffff,
  // eslint-disable-next-line @typescript-eslint/prefer-literal-enum-member -- Native math.h deliberately aliases Max for G significance.
  rtl_math_DecimalPlaces_DefaultSignificance = rtl_math_DecimalPlaces_Max,
}
