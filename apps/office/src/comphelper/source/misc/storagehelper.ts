/** @fileoverview Original OStorageHelper CopyInputToOutput with explicit ByteReader/ByteWriter crosscasts and32000-byte native transfer loops. Storage/service/encryption helper families remain unported; no replacement factory or stream is created here. */
import type { Reference } from "../../../cppu/inc/com/sun/star/uno/Reference";
import { Sequence } from "../../../cppu/inc/com/sun/star/uno/Sequence";
import type { XInputStream } from "../../../udkapi/com/sun/star/io/XInputStream";
import type { XOutputStream } from "../../../udkapi/com/sun/star/io/XOutputStream";
import { ByteReader, ByteWriter } from "../../inc/bytereader";
const Bytes = Sequence.specialize<number>("sal_Int8", 1);
/** Original static helper namespace; it does not implement an XStorage service. */
export const OStorageHelper = {
  /** Original do/while transfer, preserving short-read termination, final empty writes and exception propagation. The raw stack array is lowered to primitive uninitialized lvalue cells, never a fake Sequence. @param input - Actual input Reference. @param output - Actual output Reference. @returns Nothing. */
  CopyInputToOutput(input: Reference<XInputStream>, output: Reference<XOutputStream>): void {
    const size = 32000,
      reader = input.get();
    if (reader instanceof ByteReader) {
      const writer = output.get();
      if (writer instanceof ByteWriter) {
        const buffer = new Map<number, [number]>();
        // Original sal_Int8 stack array is uninitialized; only the prefix written by the reader is consumed.
        for (let i = 0; i < size; ++i) buffer.set(i, [undefined as unknown as number]);
        let read: number;
        do {
          read = reader.readSomeBytes(buffer, size);
          writer.writeBytes(buffer, read);
        } while (read === size);
        return;
      }
    }
    const sequence = new Bytes(size);
    try {
      let read: number;
      do {
        read = (input.get() as XInputStream).readBytes(sequence, size);
        if (read < size) sequence.realloc(read);
        (output.get() as XOutputStream).writeBytes(sequence);
      } while (read === size);
    } finally {
      sequence.dispose();
    }
  },
};
