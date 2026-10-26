/** @fileoverview Original consumed ICU78.3 u_terminateChars/__TERMINATE_STRING contract from ustring.cpp; native pointer/readable-capacity preconditions remain in force. */
import { UErrorCode, U_SUCCESS } from "./unicode/utypes";
/** Original termination helper does not perform public argument validation and returns the original length even on error. @param dest - Writable narrow pointer/null for non-writing cases. @param destCapacity - Native signed32 capacity. @param length - Native signed32 result length. @param status - Nullable sticky status. @returns Input length. */
export function u_terminateChars(
  dest: Uint8Array | null,
  destCapacity: number,
  length: number,
  status: [number] | null,
): number {
  destCapacity |= 0;
  length |= 0;
  if (status !== null && U_SUCCESS(status[0])) {
    if (length < 0) {
      /* Source leaves handling to its caller. */
    } else if (length < destCapacity) {
      (dest as Uint8Array)[length] = 0;
      if (status[0] === UErrorCode.U_STRING_NOT_TERMINATED_WARNING)
        status[0] = UErrorCode.U_ZERO_ERROR;
    } else if (length === destCapacity) status[0] = UErrorCode.U_STRING_NOT_TERMINATED_WARNING;
    else status[0] = UErrorCode.U_BUFFER_OVERFLOW_ERROR;
  }
  return length;
}
