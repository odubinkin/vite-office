/** @fileoverview Original OStorageHelper byte transfer and UTF16 package-name/path helpers. Storage/service/encryption helper families remain unported; no replacement factory or stream is created here. */
import type { Reference } from "../../../cppu/inc/com/sun/star/uno/Reference";
import { Sequence } from "../../../cppu/inc/com/sun/star/uno/Sequence";
import type { XInputStream } from "../../../udkapi/com/sun/star/io/XInputStream";
import type { XOutputStream } from "../../../udkapi/com/sun/star/io/XOutputStream";
import { ByteReader, ByteWriter } from "../../inc/bytereader";
const Bytes = Sequence.specialize<number>("sal_Int8", 1);
/** Original static helper namespace; it does not implement an XStorage service. */
export const OStorageHelper = {
  /** Original UTF16 code-unit scan; empty names and empty internal segments are accepted by this helper. @param name - Borrowed std::u16string_view units. @param slashAllowed - Original slash flag. @returns Source validity result. */
  IsValidZipEntryFileName(name: Uint16Array, slashAllowed: boolean): boolean {
    let dots = 0;
    for (let i = 0; i < name.length; ++i) {
      const unit = name[i] as number;
      switch (unit) {
        case 46:
          if (dots !== -1) ++dots;
          break;
        case 92:
        case 63:
        case 60:
        case 62:
        case 34:
        case 124:
        case 58:
          return false;
        case 47:
          if (!slashAllowed || dots === 1 || dots === 2 || i === 0) return false;
          dots = 0;
          break;
        default:
          dots = -1;
          if (unit < 32 || (unit >= 0xd800 && unit <= 0xdfff)) return false;
      }
    }
    return dots !== 1 && dots !== 2;
  },
  /** Original substring/begin/end checks, including segments containing separators; this does not normalize or validate paths. @param path - Borrowed UTF16 path. @param segment - Borrowed UTF16 segment. @returns Source match result. */
  PathHasSegment(path: Uint16Array, segment: Uint16Array): boolean {
    let result = false;
    const pathLength = path.length,
      segmentLength = segment.length;
    if (segmentLength !== 0 && pathLength >= segmentLength) {
      // Primitive std::u16string_view find/starts_with/substr operations bind to exact JS UTF16 strings.
      let pathText = "",
        segmentText = "";
      for (let i = 0; i < pathLength; ++i) pathText += String.fromCharCode(path[i] as number);
      for (let i = 0; i < segmentLength; ++i)
        segmentText += String.fromCharCode(segment[i] as number);
      const endSegment = "/" + segmentText,
        internalSegment = endSegment + "/";
      if (pathText.indexOf(internalSegment) !== -1) result = true;
      if (!result && pathText.startsWith(segmentText)) {
        if (pathLength === segmentLength || path[segmentLength] === 47) result = true;
      }
      if (
        !result &&
        pathLength > segmentLength &&
        pathText.slice(pathLength - segmentLength - 1) === endSegment
      )
        result = true;
    }
    return result;
  },
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
