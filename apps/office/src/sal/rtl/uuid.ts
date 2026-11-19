/** @fileoverview Consumed original RTL UUID v4 generation and exact lexical comparison contracts. Browser generation delegates to native Web Crypto; named/MD5 UUID APIs are unbound. */
import { randomUUID } from "../../external/webcrypto/uuid";
import { abort } from "../../external/emscripten/file";
import type { ByteElements } from "../inc/rtl/byteseq.h";
/** Original unsigned byte-pointer read for the selected VM address representations. @param bytes - Actual initialized bytes. @param offset - Valid byte offset. @returns Unsigned byte. */
function byte(bytes: ByteElements, offset: number): number {
  return ArrayBuffer.isView(bytes)
    ? (new Uint8Array(bytes.buffer, bytes.byteOffset)[offset] as number)
    : (bytes.get(offset) as [number])[0] & 255;
}
/** Original v4 result and ignored historical predecessor/Ethernet parameters, using the browser's existing UUID implementation. The original fatal failure contract uses the already linked abort. @param target - Writable 16-byte pointer. @param predecessor - Ignored historical predecessor. @param useEthernetAddress - Ignored historical flag. @returns Nothing. */
export function rtl_createUuid(
  target: ByteElements | null,
  predecessor: ByteElements | null,
  useEthernetAddress: boolean,
): void {
  void predecessor;
  void useEthernetAddress;
  if (target === null) {
    abort();
    return;
  }
  let value: string;
  try {
    value = randomUUID().replaceAll("-", "");
  } catch {
    console.error("rtl_random_getBytes(): cannot read random device, aborting.");
    abort();
    return;
  }
  const view = ArrayBuffer.isView(target)
    ? new Uint8Array(target.buffer, target.byteOffset, 16)
    : null;
  for (let index = 0; index < 16; ++index) {
    const valueByte = Number.parseInt(value.slice(index * 2, index * 2 + 2), 16);
    if (view) view[index] = valueByte;
    else
      ((target as Pick<ReadonlyMap<number, unknown>, "get">).get(index) as [number])[0] = valueByte;
  }
}
/** Original network-field lexical comparison returns exactly minus one, zero or one. Unsigned network-order field comparison equals ordered byte comparison. @param first - First 16-byte UUID. @param second - Second 16-byte UUID. @returns Original ordering result. */
export function rtl_compareUuid(first: ByteElements, second: ByteElements): number {
  for (let index = 0; index < 16; ++index) {
    const a = byte(first, index),
      b = byte(second, index);
    if (a !== b) return a < b ? -1 : 1;
  }
  return 0;
}
