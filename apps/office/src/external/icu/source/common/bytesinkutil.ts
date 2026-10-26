/** @fileoverview Original consumed ByteSinkUtil terminated-array adapter from bytesinkutil.h, reusing actual checked sink and source termination helper. */
import { CheckedArrayByteSink, type ByteSink } from "./unicode/bytestream";
import { u_terminateChars } from "./ustring";
import { UErrorCode, U_FAILURE } from "./unicode/utypes";
/** Original static-only internal adapter owner. */
// eslint-disable-next-line @typescript-eslint/no-extraneous-class -- Preserve the original static ByteSinkUtil owner.
export class ByteSinkUtil {
  /** Native constructor is deleted. @returns Not constructible. */
  private constructor() {
    /* Not constructible by source callers. */
  }
  /** Original lambda adapter returns zero on conversion failure before termination, retaining already-written partial bytes. @param buffer - Actual writable pointer/null for zero/negative capacity. @param capacity - Native capacity. @param lambda - Actual append conversion. @param status - Sticky status. @returns Required length or source failure zero. */
  static viaByteSinkToTerminatedChars(
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
  }
}
