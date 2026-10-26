/** @fileoverview Consumed ICU78.3 UErrorCode constants, status predicates and UDate units from utypes.h. */
export const UErrorCode = {
  U_USING_FALLBACK_WARNING: -128,
  U_STRING_NOT_TERMINATED_WARNING: -124,
  U_ZERO_ERROR: 0,
  U_ILLEGAL_ARGUMENT_ERROR: 1,
  U_MISSING_RESOURCE_ERROR: 2,
  U_INVALID_FORMAT_ERROR: 3,
  U_INTERNAL_PROGRAM_ERROR: 5,
  U_MEMORY_ALLOCATION_ERROR: 7,
  U_INDEX_OUTOFBOUNDS_ERROR: 8,
  U_BUFFER_OVERFLOW_ERROR: 15,
  U_UNSUPPORTED_ERROR: 16,
  U_RESOURCE_TYPE_MISMATCH: 17,
  U_INVARIANT_CONVERSION_ERROR: 26,
  U_INVALID_STATE_ERROR: 27,
  U_NO_WRITE_PERMISSION: 30,
} as const;
/** Native enum storage also admits the other ICU status codes. */
export type UErrorCode = number;
/** Original double UTC milliseconds from 1 January 1970. */
export type UDate = number;
export const U_MILLIS_PER_DAY = 86400000;
/** Original warnings count as success. @param status - ICU status. @returns Success. */
export function U_SUCCESS(status: UErrorCode): boolean {
  return status <= 0;
}
/** Original positive error codes count as failure. @param status - ICU status. @returns Failure. */
export function U_FAILURE(status: UErrorCode): boolean {
  return status > 0;
}
