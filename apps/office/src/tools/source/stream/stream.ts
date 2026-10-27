/** @fileoverview Consumed in-memory SvStream text-reader operations from tools/source/stream/stream.cxx. */
import {
  RTL_TEXTENCODING_DONTKNOW,
  RTL_TEXTENCODING_UNICODE,
  RTL_TEXTENCODING_UTF8,
  type rtl_TextEncoding,
} from "../../../sal/inc/rtl/textenc";
import { OStringToOUString, OUStringToOString } from "../../../sal/rtl/ustring-convert";

/** Source stream encoding, byte position and line-reading contract used by Calc's text filter. */
export class SvStream {
  private position = 0;
  private endOfFile = false;
  private bigEndian = false;
  private written = new Uint8Array();
  private writtenLength = 0;
  private hasWritten = false;
  /** Borrows the immutable input bytes and starts at position zero. @param bytes - Source content. @param encoding - Initial stream encoding.  @returns Constructed instance. */
  constructor(
    private readonly bytes: Uint8Array,
    private encoding: rtl_TextEncoding,
  ) {}

  /** Original stream encoding state read by CSV separator detection.  @returns The rtl_TextEncoding result. */
  GetStreamEncoding(): rtl_TextEncoding {
    return this.encoding;
  }

  /** Original stream encoding assignment after the source's BOM probe.  @param encoding - Encoding. @returns Nothing. */
  SetStreamEncoding(encoding: rtl_TextEncoding): void {
    this.encoding = encoding;
  }

  /** Source WriteBytes for the in-memory output stream. @param bytes - Raw output bytes. @returns Written byte count. */
  WriteBytes(bytes: Uint8Array): number {
    if (!this.hasWritten) {
      this.written = this.bytes.slice();
      this.writtenLength = this.bytes.length;
      this.hasWritten = true;
    }
    const end = this.position + bytes.length;
    if (end > this.written.length) {
      const capacity = Math.max(4096, end, this.written.length * 2);
      const grown = new Uint8Array(capacity);
      grown.set(this.written.subarray(0, this.writtenLength));
      this.written = grown;
    }
    this.written.set(bytes, this.position);
    this.writtenLength = Math.max(this.writtenLength, end);
    this.position += bytes.length;
    return bytes.length;
  }

  /** Original std::string_view write uses raw bytes and its logical length, including embedded NUL. The existing byte-string binding carries bytes as code units. @param value - Byte string view. @returns This stream. */
  WriteOString(value: string): SvStream {
    this.WriteBytes(Uint8Array.from(value, (unit) => unit.charCodeAt(0) & 0xff));
    return this;
  }

  /** Original char write narrows to one byte before stream output. @param value - Native char byte or single-byte character. @returns This stream. */
  WriteChar(value: number | string): SvStream {
    return this.WriteUChar(typeof value === "number" ? value : value.charCodeAt(0));
  }

  /** Original integer instantiations of WriteNumberAsString serialize OString decimal text. @param value - Admitted native integer. @returns This stream. */
  WriteNumberAsString(value: number): SvStream {
    return this.WriteOString(value.toString());
  }

  /** Source WriteUChar byte output used by the optional UTF-8 BOM. @param value - Native unsigned byte. @returns This stream. */
  WriteUChar(value: number): SvStream {
    this.WriteBytes(Uint8Array.of(value & 0xff));
    return this;
  }

  /** Source Unicode-or-byte text write with the selected destination encoding. @param value - UTF-16 text. @param encoding - Destination encoding. @param zero - Append a zero unit. @returns Write status. */
  WriteUnicodeOrByteText(value: string, encoding = this.encoding, zero = false): boolean {
    const bytes = OUStringToOString(value + (zero ? "\0" : ""), encoding);
    if (encoding === RTL_TEXTENCODING_UNICODE && this.bigEndian)
      for (let index = 0; index + 1 < bytes.length; index += 2)
        [bytes[index], bytes[index + 1]] = [bytes[index + 1] as number, bytes[index] as number];
    this.WriteBytes(bytes);
    return true;
  }

  /** Source single UTF-16 code-unit write using this stream's encoding. @param value - Code unit. @returns Write status. */
  WriteUniOrByteChar(value: number): boolean {
    return this.WriteUnicodeOrByteText(String.fromCharCode(value & 0xffff));
  }

  /** Source native-endian UTF-16 BOM operation for this browser memory stream. @returns Nothing. */
  StartWritingUnicodeText(): void {
    this.bigEndian = false;
    this.WriteBytes(Uint8Array.of(0xff, 0xfe));
  }

  /** SvMemoryStream-style extraction of the written byte sequence. @returns Independent bytes. */
  GetData(): Uint8Array {
    return this.hasWritten ? this.written.slice(0, this.writtenLength) : this.bytes.slice();
  }

  /** Source StartReadingUnicodeText: inspect only BOMs allowed by the requested encoding. @param readBomEncoding - Encoding selected before BOM inspection. @returns Nothing. */
  StartReadingUnicodeText(readBomEncoding: rtl_TextEncoding): void {
    if (
      readBomEncoding !== RTL_TEXTENCODING_DONTKNOW &&
      readBomEncoding !== RTL_TEXTENCODING_UNICODE &&
      readBomEncoding !== RTL_TEXTENCODING_UTF8
    )
      return;
    const oldPosition = this.position;
    const first = this.bytes[this.position++];
    if (
      (readBomEncoding === RTL_TEXTENCODING_DONTKNOW ||
        readBomEncoding === RTL_TEXTENCODING_UNICODE) &&
      first === 0xfe &&
      this.bytes[this.position++] === 0xff
    ) {
      this.encoding = RTL_TEXTENCODING_UNICODE;
      this.bigEndian = true;
      return;
    }
    this.position = oldPosition + 1;
    if (
      (readBomEncoding === RTL_TEXTENCODING_DONTKNOW ||
        readBomEncoding === RTL_TEXTENCODING_UNICODE) &&
      first === 0xff &&
      this.bytes[this.position++] === 0xfe
    ) {
      this.encoding = RTL_TEXTENCODING_UNICODE;
      this.bigEndian = false;
      return;
    }
    this.position = oldPosition + 1;
    if (
      (readBomEncoding === RTL_TEXTENCODING_DONTKNOW ||
        readBomEncoding === RTL_TEXTENCODING_UTF8) &&
      first === 0xef &&
      this.bytes[this.position++] === 0xbb &&
      this.bytes[this.position++] === 0xbf
    ) {
      this.encoding = RTL_TEXTENCODING_UTF8;
      return;
    }
    this.position = oldPosition;
  }

  /** Native Tell byte offset. @returns Offset. */
  Tell(): number {
    return this.position;
  }

  /** Native Seek used by ReadCsvLine to rewind after an unmatched quote. @param position - Saved byte offset. @returns Nothing. */
  Seek(position: number): void {
    this.position = position;
    this.endOfFile = false;
  }

  /** Native relative byte seek used by parser lookahead rollback. @param offset - Signed byte delta. @returns Nothing. */
  SeekRel(offset: number): void {
    this.Seek(this.position + offset);
  }

  /** Native in-memory read status; this binding has no device/pending errors. @returns Whether the preceding read succeeded. */
  good(): boolean {
    return !this.endOfFile;
  }

  /** Reads one native signed char and sets EOF only after an unsuccessful read. @param output - Original char reference. @returns This stream. */
  ReadChar(output: [number]): SvStream {
    const value = this.bytes[this.position];
    if (value === undefined) {
      this.endOfFile = true;
      return this;
    }
    this.position++;
    output[0] = (value << 24) >> 24;
    return this;
  }

  /** Reads one UTF-16 unit using the stream's existing endian setting. @param output - Original unit reference. @returns This stream. */
  ReadUtf16(output: [number]): SvStream {
    const first: [number] = [0],
      second: [number] = [0];
    this.ReadChar(first);
    this.ReadChar(second);
    if (this.good())
      output[0] = this.bigEndian
        ? ((first[0] & 255) << 8) | (second[0] & 255)
        : (first[0] & 255) | ((second[0] & 255) << 8);
    return this;
  }

  /** Native EOF flag becomes set after an unsuccessful read. @returns EOF. */
  eof(): boolean {
    return this.endOfFile;
  }

  /** Reads one physical line through ReadUniStringLine or ReadByteStringLine. Opposite CR/LF pairs share one terminator; Unicode NUL code units are skipped by ReadUniStringLine. @param maxCodepointsToRead - Source default limit, counted as bytes for non-Unicode streams. @returns Decoded physical line. */
  ReadUniOrByteStringLine(maxCodepointsToRead = 0xfffe): string {
    if (this.encoding === RTL_TEXTENCODING_UNICODE)
      return this.ReadUniStringLine(maxCodepointsToRead);
    if (this.position >= this.bytes.length) {
      this.endOfFile = true;
      return "";
    }
    const start = this.position;
    while (this.position < this.bytes.length && this.position - start < maxCodepointsToRead) {
      const code = this.bytes[this.position];
      if (code === 10 || code === 13) break;
      this.position++;
    }
    const end = this.position;
    const separator = this.bytes[this.position];
    if (separator !== undefined) {
      this.position++;
      if (separator === 10 || separator === 13) {
        const next = this.bytes[this.position];
        if ((separator === 10 && next === 13) || (separator === 13 && next === 10)) this.position++;
      }
    }
    return OStringToOUString(this.bytes.subarray(start, end), this.encoding);
  }

  /** Native ReadUniStringLine's 256-unit buffer, including its original swap/compaction order after embedded NULs. @returns Decoded line.  @param maxCodepointsToRead - Max Codepoints To Read. */
  private ReadUniStringLine(maxCodepointsToRead: number): string {
    const oldPosition = this.position;
    const output: number[] = [];
    let totalLength = 0;
    let lastCode = 0;
    let ended = false;
    while (!ended) {
      const available = Math.min(256, Math.floor((this.bytes.length - this.position) / 2));
      if (!available) {
        if (!output.length) {
          this.endOfFile = true;
          return "";
        }
        break;
      }
      const buffer = new Uint16Array(available);
      for (let i = 0; i < available; i++) {
        const at = this.position + i * 2;
        buffer[i] = (this.bytes[at] as number) | ((this.bytes[at + 1] as number) << 8);
      }
      this.position += available * 2;
      let copied = 0;
      let scanned = 0;
      for (; scanned < available; scanned++) {
        if (this.bigEndian)
          buffer[copied] = ((buffer[copied] as number) >>> 8) | ((buffer[copied] as number) << 8);
        lastCode = buffer[scanned] as number;
        if (lastCode === 10 || lastCode === 13) {
          ended = true;
          break;
        }
        if (lastCode) {
          if (copied < scanned) buffer[copied] = lastCode;
          copied++;
        }
      }
      totalLength += scanned;
      if (totalLength > maxCodepointsToRead) {
        copied -= totalLength - maxCodepointsToRead;
        totalLength = maxCodepointsToRead;
        ended = true;
      }
      for (let i = 0; i < copied; i++) output.push(buffer[i] as number);
    }
    this.position = oldPosition + totalLength * 2;
    if (this.position < this.bytes.length) this.position += 2;
    if (ended && (lastCode === 10 || lastCode === 13) && this.position + 1 < this.bytes.length) {
      const first = this.bytes[this.position] as number;
      const second = this.bytes[this.position + 1] as number;
      const next = this.bigEndian ? (first << 8) | second : first | (second << 8);
      if (next !== lastCode && (next === 10 || next === 13)) this.position += 2;
    }
    let result = "";
    for (let at = 0; at < output.length; at += 1024)
      result += String.fromCharCode(...output.slice(at, at + 1024));
    return result;
  }
}
