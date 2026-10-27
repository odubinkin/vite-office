/** @fileoverview Original consumed ByteSinkUtil terminated-array adapter from bytesinkutil.h, reusing actual checked sink and source termination helper. */
import { CheckedArrayByteSink, type ByteSink } from "./unicode/bytestream";
import { u_terminateChars } from "./ustring";
import { UErrorCode, U_FAILURE } from "./unicode/utypes";
/** Original static-only namespace. A nonconstructable object models the native deleted constructor without emitting an unused runtime constructor. */
export const ByteSinkUtil = Object.freeze({
  /** Original lambda adapter returns zero on conversion failure before termination, retaining already-written partial bytes. @param buffer - Actual writable pointer/null for zero/negative capacity. @param capacity - Native capacity. @param lambda - Actual append conversion. @param status - Sticky status. @returns Required length or source failure zero. */
  viaByteSinkToTerminatedChars(
    buffer: Uint8Array | null,
    capacity: number,
    lambda: (sink: ByteSink, status: [number]) => void,
    status: [number],
  ): number {
    if (U_FAILURE(status[0])) return 0;
    const sink = new CheckedArrayByteSink(buffer, capacity);
    lambda(sink, status);
    if (U_FAILURE(status[0])) return 0;
    const reslen = sink.NumberOfBytesAppended();
    if (sink.Overflowed()) {
      status[0] = UErrorCode.U_BUFFER_OVERFLOW_ERROR;
      return reslen;
    }
    return u_terminateChars(buffer, capacity, reslen, status);
  },
});
