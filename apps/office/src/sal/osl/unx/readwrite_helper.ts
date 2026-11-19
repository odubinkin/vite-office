/** @fileoverview Original readwrite_helper.cxx consumed safeWrite/cap_ssize_t over actual libc write; safeRead remains unbound. */
import { writeDescriptor } from "../../../external/emscripten/file";
/** Original write-all loop, including EINTR retry and positive-write assertion. @param fd - Actual descriptor. @param data - Borrowed original bytes. @param dataSize - Original size_t count. @returns False on native write error. */
export function safeWrite(fd: number, data: Uint8Array, dataSize: number): boolean {
  let remaining = dataSize >>> 0,
    offset = 0;
  while (remaining) {
    const written = writeDescriptor(fd, data.subarray(offset), Math.min(remaining, 0x7fffffff));
    if (written.result < 0) {
      if (written.errno === 27) continue;
      return false;
    }
    if (written.result <= 0) throw new Error("assert(nWritten > 0)");
    remaining -= written.result;
    offset += written.result;
  }
  return true;
}
