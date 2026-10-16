/** @fileoverview Native RTL numeric conversion status declarations. */
/** Status of the represented decimal-to-binary64 conversion. */
export enum rtl_math_ConversionStatus {
  rtl_math_ConversionStatus_Ok = 0,
  rtl_math_ConversionStatus_OutOfRange = 1,
  rtl_math_ConversionStatus_FORCE_EQUAL_SIZE = 2147483647,
}
