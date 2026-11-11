/** @fileoverview Test-only native-byte output transport: initialized SAL values share their actual UNO Sequence for one call and are destroyed exactly once. */
import { ByteSequence } from "../sal/inc/rtl/byteseq";
import { toUnoSequence, type Sequence } from "../cppu/inc/com/sun/star/uno/Sequence";
/** Writes actual signed-byte native values to a production output contract. @param stream - Actual output owner. @param bytes - Fixture bytes. @returns Nothing. */
export function writeOutput(
  stream: { writeBytes(bytes: Sequence<number>): void },
  bytes: Uint8Array,
): void {
  const value = new ByteSequence(bytes, bytes.length),
    data = toUnoSequence(value);
  try {
    stream.writeBytes(data);
  } finally {
    data.dispose();
    value.dispose();
  }
}
