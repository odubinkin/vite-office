/** @fileoverview Observes actual owned OOXML input references in tests; no replacement stream or query provider is installed. */
import type { Reference } from "../cppu/inc/com/sun/star/uno/Reference";
import { Sequence, type SequenceElements } from "../cppu/inc/com/sun/star/uno/Sequence";
import type { XInputStream } from "../udkapi/com/sun/star/io/XInputStream";
const Bytes = Sequence.specialize<number>("sal_Int8", 1);
/** Reads an owned input reference without closing its underlying stream, then destroys the passed Reference value. @param input - Owned return value. @returns Observed bytes or null for an empty reference. */
export function readOwnedInput(input: Reference<XInputStream>): Uint8Array | null {
  const output = new Bytes(),
    result: number[] = [];
  try {
    if (!input.is()) return null;
    for (;;) {
      const count = (input.get() as XInputStream).readSomeBytes(output, 16384);
      if (count === 0) break;
      const cells = output.getConstArray() as SequenceElements;
      for (let i = 0; i < count; ++i) result.push((cells.get(i) as [number])[0] & 255);
    }
    return Uint8Array.from(result);
  } finally {
    output.dispose();
    input.dispose();
  }
}
/** Observes fixture XML bytes with their actual BOM/signature, without adding a production string helper to native stream owners. @param input - Owned input return value. @returns Fixture XML or null. */
export function readOwnedXml(input: Reference<XInputStream>): string | null {
  const bytes = readOwnedInput(input);
  if (bytes === null) return null;
  const little = (bytes[0] === 255 && bytes[1] === 254) || (bytes[0] === 60 && bytes[1] === 0),
    big = (bytes[0] === 254 && bytes[1] === 255) || (bytes[0] === 0 && bytes[1] === 60);
  return new TextDecoder(little ? "utf-16le" : big ? "utf-16be" : "utf-8", { fatal: true }).decode(
    bytes,
  );
}
