/** @fileoverview Original synchronous FastSaxParser InputSource read loop and existing host XML engine byte admission. The UNO/RTL converter owns native transport; the host decoder is a backend binding, not a native libxml2/service/ABI certificate. */
import {
  InputSource,
  type InputSourceConstReference,
} from "../../../offapi/com/sun/star/xml/sax/InputSource";
import { XMLFile2UTFConverter } from "../expatwrap/xml2utf";
import { Sequence, type SequenceElements } from "../../../cppu/inc/com/sun/star/uno/Sequence";
import { OString } from "../../../sal/inc/rtl/string";
import {
  rtl_uString2String,
  type rtl_String,
  type rtl_StringSlot,
  OUSTRING_TO_OSTRING_CVTFLAGS,
} from "../../../sal/inc/rtl/string.h";
import {
  RTL_TEXTENCODING_ASCII_US,
  RTL_TEXTENCODING_UTF8,
  RTL_TEXTENCODING_DONTKNOW,
} from "../../../sal/inc/rtl/textenc";
import { rtl_getTextEncodingFromMimeCharset } from "../../../sal/textenc/tencinfo";
import { SAL_NO_ACQUIRE } from "../../../sal/inc/types";
import * as C from "../../../sal/textenc/textcvt";
import * as F from "../../../sal/inc/rtl/textcvt.h";
const Bytes = Sequence.specialize<number>("sal_Int8", 1);
/** Actual Entity source and converter owners; parsed model/service state is not manufactured here. */
export class Entity {
  readonly maStructSource: InputSource;
  readonly maConverter = new XMLFile2UTFConverter();
  /** Original source copy and converter setup before document callbacks. @param source - Actual source value. @returns Entity. */
  constructor(source: InputSourceConstReference) {
    this.maStructSource = new InputSource(source);
    this.maConverter.setInputStream(this.maStructSource.aInputStream);
    if (!this.maStructSource.sEncoding.isEmpty()) {
      const slot: rtl_StringSlot = [null];
      rtl_uString2String(
        slot,
        this.maStructSource.sEncoding.getStr(),
        this.maStructSource.sEncoding.getLength(),
        RTL_TEXTENCODING_ASCII_US,
        OUSTRING_TO_OSTRING_CVTFLAGS,
      );
      const encoding = new OString(slot[0] as rtl_String, SAL_NO_ACQUIRE);
      try {
        this.maConverter.setEncoding(encoding);
      } finally {
        encoding.dispose();
      }
    }
  }
  /** Original BUFFER_SIZE read loop, stopping at nonpositive converted count and never closing input. @returns Converted native byte chunks. */
  *chunks(): Generator<Uint8Array> {
    const output = new Bytes(16 * 1024);
    try {
      for (;;) {
        const nRead = this.maConverter.readAndConvert(output, 16 * 1024);
        if (nRead <= 0) return;
        const pointer = output.getConstArray() as SequenceElements,
          bytes = new Uint8Array(nRead);
        for (let i = 0; i < nRead; ++i) bytes[i] = (pointer.get(i) as [number])[0];
        yield bytes;
      }
    } finally {
      output.dispose();
    }
  }
  /** Original converter before Source member destruction. @returns Nothing. */ dispose(): void {
    this.maConverter.dispose();
    this.maStructSource.dispose();
  }
}
/** Joins backend-owned incomplete input, preserving raw byte values. @param prefix - Old bytes. @param bytes - New bytes. @returns Combined bytes. */
function join(prefix: Uint8Array, bytes: Uint8Array): Uint8Array {
  const result = new Uint8Array(prefix.length + bytes.length);
  result.set(prefix);
  result.set(bytes, prefix.length);
  return result;
}
/** Existing host XML backend decoding state. Native libxml2 encoding aliases/diagnostics and all optional RTL descriptors remain unverified. */
class XmlByteDecoder {
  private pending: Uint8Array = new Uint8Array();
  private decoder: TextDecoder | null = null;
  private order: number[] | null = null;
  private converter: C.rtl_TextToUnicodeConverter = null;
  private context: C.rtl_TextToUnicodeContext = null;
  private ready = false;
  /** Selects the byte engine after the original converter; UTF32 is handled explicitly because the host decoder has no UTF32 label. @param final - Source EOF. @returns Ready to decode. */
  private initialize(final: boolean): boolean {
    const p = this.pending;
    if (!final && p.length < 4) return false;
    let label = "utf-8",
      skip = 0;
    if (p[0] === 0 && p[1] === 0 && p[2] === 0xfe && p[3] === 0xff) {
      this.order = [0, 1, 2, 3];
      skip = 4;
    } else if (p[0] === 0xff && p[1] === 0xfe && p[2] === 0 && p[3] === 0) {
      this.order = [3, 2, 1, 0];
      skip = 4;
    } else if (p[0] === 0 && p[1] === 0 && p[2] === 0 && p[3] === 60) this.order = [0, 1, 2, 3];
    else if (p[0] === 60 && p[1] === 0 && p[2] === 0 && p[3] === 0) this.order = [3, 2, 1, 0];
    else if (p[0] === 0 && p[1] === 0 && p[2] === 60 && p[3] === 0) this.order = [1, 0, 3, 2];
    else if (p[0] === 0 && p[1] === 60 && p[2] === 0 && p[3] === 0) this.order = [2, 3, 0, 1];
    else if (p[0] === 0xfe && p[1] === 0xff) label = "utf-16be";
    else if (p[0] === 0xff && p[1] === 0xfe) label = "utf-16le";
    else if (p[0] === 0 && p[1] === 60 && p[2] === 0 && p[3] === 63) label = "utf-16be";
    else if (p[0] === 60 && p[1] === 0 && p[2] === 63 && p[3] === 0) label = "utf-16le";
    else {
      let head = "";
      for (const c of p) head += String.fromCharCode(c);
      if (head.startsWith("<?xml") && !head.includes("?>") && !final) return false;
      const declaration = /^<\?xml\s[\s\S]*?\?>/u.exec(head)?.[0],
        encoding = declaration
          ? /\bencoding\s*=\s*(['"])([^'"]+)\1/u.exec(declaration)?.[2]
          : undefined;
      if (encoding !== undefined) {
        const normalized = encoding.toLowerCase();
        if (["utf-16", "utf16", "utf-16le"].includes(normalized)) label = "utf-16le";
        else if (normalized === "utf-16be") label = "utf-16be";
        else if (["utf-32", "utf32", "ucs-4", "utf-32be"].includes(normalized))
          this.order = [0, 1, 2, 3];
        else if (normalized === "utf-32le") this.order = [3, 2, 1, 0];
        else {
          const bytes = new TextEncoder().encode(encoding + "\0"),
            id = rtl_getTextEncodingFromMimeCharset(bytes);
          if (id === RTL_TEXTENCODING_DONTKNOW)
            throw new Error("Unsupported XML encoding: " + encoding);
          if (id !== RTL_TEXTENCODING_UTF8) {
            this.converter = C.rtl_createTextToUnicodeConverter(id);
            if (this.converter === null)
              throw new Error("XML encoding converter is unavailable: " + encoding);
            this.context = C.rtl_createTextToUnicodeContext(this.converter);
          }
        }
      }
    }
    if (!this.order && !this.converter) this.decoder = new TextDecoder(label, { fatal: true });
    this.pending = p.subarray(skip);
    this.ready = true;
    return true;
  }
  /** Incremental byte-engine input; decoding never requires DOM or the UI thread. @param bytes - Current native byte block. @param final - Input EOF. @returns Decoded UTF16 for the existing host SAX engine. */
  decode(bytes: Uint8Array, final = false): string {
    this.pending = join(this.pending, bytes);
    if (!this.ready && !this.initialize(final)) return "";
    if (this.order) {
      let result = "",
        i = 0;
      for (; i + 4 <= this.pending.length; i += 4) {
        const p = this.pending,
          o = this.order,
          scalar =
            ((p[i + (o[0] as number)] as number) * 0x1000000 +
              ((p[i + (o[1] as number)] as number) << 16) +
              ((p[i + (o[2] as number)] as number) << 8) +
              (p[i + (o[3] as number)] as number)) >>>
            0;
        if (scalar > 0x10ffff || (scalar >= 0xd800 && scalar <= 0xdfff))
          throw new Error("Invalid XML UTF32 scalar");
        result += String.fromCodePoint(scalar);
      }
      this.pending = this.pending.slice(i);
      if (final && this.pending.length) throw new Error("Incomplete XML UTF32 scalar");
      return result;
    }
    if (this.decoder) {
      const result = this.decoder.decode(this.pending, { stream: !final });
      this.pending = new Uint8Array();
      return result;
    }
    let result = "",
      offset = 0;
    const info: [number] = [0],
      consumed: [number] = [0];
    for (;;) {
      const target = new Uint16Array(Math.max(1, (this.pending.length - offset) * 2)),
        written = C.rtl_convertTextToUnicode(
          this.converter,
          this.context,
          this.pending.subarray(offset),
          this.pending.length - offset,
          target,
          target.length,
          F.RTL_TEXTTOUNICODE_FLAGS_UNDEFINED_ERROR |
            F.RTL_TEXTTOUNICODE_FLAGS_MBUNDEFINED_ERROR |
            F.RTL_TEXTTOUNICODE_FLAGS_INVALID_ERROR |
            (final ? F.RTL_TEXTTOUNICODE_FLAGS_FLUSH : 0),
          info,
          consumed,
        );
      offset += consumed[0];
      for (let i = 0; i < written; ++i) result += String.fromCharCode(target[i] as number);
      if (info[0] & F.RTL_TEXTTOUNICODE_INFO_DESTBUFFERTOOSMALL) continue;
      if (
        info[0] & F.RTL_TEXTTOUNICODE_INFO_ERROR &&
        !(info[0] & F.RTL_TEXTTOUNICODE_INFO_SRCBUFFERTOOSMALL)
      )
        throw new Error("Invalid XML encoded byte sequence");
      break;
    }
    this.pending = this.pending.slice(offset);
    if (final && this.pending.length) throw new Error("Incomplete XML encoded byte sequence");
    return result;
  }
  /** Releases actual RTL context and static converter handle. @returns Nothing. */ dispose(): void {
    if (this.converter) {
      C.rtl_destroyTextToUnicodeContext(this.converter, this.context);
      C.rtl_destroyTextToUnicodeConverter(this.converter);
    }
  }
}
/** Host byte-engine failure, distinct from an original input stream exception. */
export class XmlByteError extends Error {}
/** Feeds each original converted byte block into the existing host lexical engine, retaining chunk checkpoints even for partial decoded units. @param entity - Actual source/converter owner. @returns UTF16 chunks. */
export function* decodedChunks(entity: Entity): Generator<string> {
  const decoder = new XmlByteDecoder();
  let received = false;
  try {
    for (const bytes of entity.chunks()) {
      received = true;
      let text: string;
      try {
        text = decoder.decode(bytes);
      } catch (error) {
        if (error instanceof XmlByteError) throw error;
        throw new XmlByteError(
          error instanceof Error ? error.message : "XML byte decoding failed",
          { cause: error },
        );
      }
      yield text;
    }
    if (received) {
      let tail: string;
      try {
        tail = decoder.decode(new Uint8Array(), true);
      } catch (error) {
        throw new XmlByteError(
          error instanceof Error ? error.message : "XML byte decoding failed",
          { cause: error },
        );
      }
      if (tail) yield tail;
    }
  } finally {
    decoder.dispose();
  }
}
