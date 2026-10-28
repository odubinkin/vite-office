/** @fileoverview Original XMLFile2UTFConverter and RTL conversion owners from sax/source/expatwrap/xml2utf.cxx. Logical Sequence cells are copied only at the existing RTL pointer/view binding; no host encoding decoder or replacement UNO value provider is installed. */
import { Sequence, type SequenceElements } from "../../../cppu/inc/com/sun/star/uno/Sequence";
import { Reference } from "../../../cppu/inc/com/sun/star/uno/Reference";
import { NotConnectedException } from "../../../cppu/inc/com/sun/star/io/NotConnectedException";
import type { XInputStream } from "../../../udkapi/com/sun/star/io/XInputStream";
import { OString, OStringLiteral, type OStringConstReference } from "../../../sal/inc/rtl/string";
import { rtl_getTextEncodingFromMimeCharset } from "../../../sal/textenc/tencinfo";
import {
  RTL_TEXTENCODING_DONTKNOW,
  RTL_TEXTENCODING_UTF8,
  type rtl_TextEncoding,
} from "../../../sal/inc/rtl/textenc";
import * as C from "../../../sal/textenc/textcvt";
import * as F from "../../../sal/inc/rtl/textcvt.h";
import { concatSequences } from "../../../comphelper/inc/sequence";
const Bytes = Sequence.specialize<number>("sal_Int8", 1),
  Unicode = Sequence.specialize<number>("sal_Unicode", 2);
const utf8 = new OString(new OStringLiteral(Uint8Array.of(117, 116, 102, 45, 56, 0))),
  utf16 = new OString(new OStringLiteral(Uint8Array.of(117, 116, 102, 45, 49, 54, 0))),
  ucs4 = new OString(new OStringLiteral(Uint8Array.of(117, 99, 115, 45, 52, 0)));
const declaration = Uint8Array.of(60, 63, 120, 109, 108),
  encodingAttribute = Uint8Array.of(32, 101, 110, 99, 111, 100, 105, 110, 103),
  doubleQuote = Uint8Array.of(34),
  singleQuote = Uint8Array.of(39);
/** Existing logical signed-byte pointer to RTL char-view binding. @param sequence - Actual Sequence. @returns Byte view. */
function byteView(sequence: Sequence<number>): Uint8Array {
  const data = sequence.getConstArray() as SequenceElements,
    result = new Uint8Array(sequence.getLength());
  for (let i = 0; i < result.length; ++i) result[i] = (data.get(i) as [number])[0];
  return result;
}
/** Existing logical sal_Unicode pointer to RTL view binding. @param pointer - Actual source cells. @param count - Unicode count. @returns Unit view. */
function unicodeView(pointer: SequenceElements, count: number): Uint16Array {
  const result = new Uint16Array(count);
  for (let i = 0; i < count; ++i) result[i] = (pointer.get(i * 2) as [number])[0];
  return result;
}
/** Native memcpy into actual signed-byte Sequence cells. @param sequence - Destination. @param source - Native byte view. @param offset - Original destination pointer offset. @returns Nothing. */
function writeBytes(sequence: Sequence<number>, source: Uint8Array, offset = 0): void {
  const data = sequence.getArray() as SequenceElements;
  for (let i = 0; i < source.length; ++i)
    (data.get(offset + i) as [number])[0] = ((source[i] as number) << 24) >> 24;
}
/** Native memcpy into actual Unicode Sequence cells. @param sequence - Destination. @param source - Source units. @param offset - Destination unit offset. @returns Nothing. */
function writeUnicode(sequence: Sequence<number>, source: Uint16Array, offset = 0): void {
  const data = sequence.getArray() as SequenceElements;
  for (let i = 0; i < source.length; ++i)
    (data.get((offset + i) * 2) as [number])[0] = source[i] as number;
}
/** Original Text2UnicodeConverter owns actual RTL handles and a pending byte Sequence. */
export class Text2UnicodeConverter {
  private m_convText2Unicode: C.rtl_TextToUnicodeConverter = null;
  private m_contextText2Unicode: C.rtl_TextToUnicodeContext = null;
  private m_bCanContinue = false;
  private m_bInitialized = false;
  private readonly m_seqSource = new Bytes();
  /** Original MIME lookup and init/DONTKNOW branches. @param sEncoding - Original OString reference. @returns Converter. */
  constructor(sEncoding: OStringConstReference) {
    const encoding = rtl_getTextEncodingFromMimeCharset(sEncoding.getStr());
    if (encoding !== RTL_TEXTENCODING_DONTKNOW) this.init(encoding);
  }
  /** Original explicit handle/context initialization. @param encoding - Native encoding. @returns Nothing. */
  private init(encoding: rtl_TextEncoding): void {
    this.m_bCanContinue = true;
    this.m_bInitialized = true;
    this.m_convText2Unicode = C.rtl_createTextToUnicodeConverter(encoding);
    this.m_contextText2Unicode = C.rtl_createTextToUnicodeContext(this.m_convText2Unicode);
  }
  /** Original recognized-encoding predicate, independent of null factory fallback. @returns Can convert. */ canContinue(): boolean {
    return this.m_bCanContinue;
  }
  /** Original pending prefix, unflushed flags, grow/retry and source remainder logic. @param seqText - Actual byte Sequence. @returns Owned Unicode Sequence. */
  convert(seqText: Sequence<number>): Sequence<number> {
    let nSourceCount = 0,
      nTargetCount = 0;
    const nSourceSize = seqText.getLength() + this.m_seqSource.getLength(),
      seqUnicode = new Unicode(nSourceSize);
    let source = byteView(seqText);
    try {
      if (this.m_seqSource.hasElements()) {
        const temp = new Uint8Array(nSourceSize),
          prefix = byteView(this.m_seqSource);
        temp.set(prefix);
        temp.set(source, prefix.length);
        source = temp;
        const empty = new Bytes();
        try {
          this.m_seqSource.moveAssign(empty);
        } finally {
          empty.dispose();
        }
      }
      const info: [number] = [0],
        consumed: [number] = [0];
      for (;;) {
        const target = new Uint16Array(seqUnicode.getLength() - nTargetCount);
        const written = C.rtl_convertTextToUnicode(
          this.m_convText2Unicode,
          this.m_contextText2Unicode,
          source.subarray(nSourceCount),
          nSourceSize - nSourceCount,
          target,
          target.length,
          F.RTL_TEXTTOUNICODE_FLAGS_UNDEFINED_DEFAULT |
            F.RTL_TEXTTOUNICODE_FLAGS_MBUNDEFINED_DEFAULT |
            F.RTL_TEXTTOUNICODE_FLAGS_INVALID_DEFAULT,
          info,
          consumed,
        );
        writeUnicode(seqUnicode, target.subarray(0, written), nTargetCount);
        nTargetCount += written;
        nSourceCount += consumed[0];
        if (info[0] & F.RTL_TEXTTOUNICODE_INFO_DESTBUFFERTOOSMALL) {
          seqUnicode.realloc(seqUnicode.getLength() * 2);
          continue;
        }
        break;
      }
      if (info[0] & F.RTL_TEXTTOUNICODE_INFO_SRCBUFFERTOOSMALL) {
        this.m_seqSource.realloc(nSourceSize - nSourceCount);
        writeBytes(this.m_seqSource, source.subarray(nSourceCount));
      }
      seqUnicode.realloc(nTargetCount);
      return seqUnicode;
    } catch (error) {
      seqUnicode.dispose();
      throw error;
    }
  }
  /** Original destructor deliberately calls UnicodeToTextConverter destruction on the shared descriptor, as in source. @returns Nothing. */
  dispose(): void {
    if (this.m_bInitialized) {
      C.rtl_destroyTextToUnicodeContext(this.m_convText2Unicode, this.m_contextText2Unicode);
      C.rtl_destroyUnicodeToTextConverter(this.m_convText2Unicode);
    }
    this.m_seqSource.dispose();
  }
}
/** Original Unicode2TextConverter owns its RTL context and pending surrogate Sequence. */
export class Unicode2TextConverter {
  private readonly m_convUnicode2Text: C.rtl_UnicodeToTextConverter;
  private readonly m_contextUnicode2Text: C.rtl_UnicodeToTextContext;
  private readonly m_seqSource = new Unicode();
  /** Original required target encoding. @param encoding - Native encoding. @returns Converter. */
  constructor(encoding: rtl_TextEncoding) {
    this.m_convUnicode2Text = C.rtl_createUnicodeToTextConverter(encoding);
    this.m_contextUnicode2Text = C.rtl_createUnicodeToTextContext(this.m_convUnicode2Text);
  }
  /** Original3x estimate, pending source prefix, grow/retry and incomplete surrogate remainder. @param puSource - Actual borrowed Unicode cells. @param nSourceSize - Source unit count. @returns Owned byte Sequence. */
  convert(puSource: SequenceElements, nSourceSize: number): Sequence<number> {
    let source = unicodeView(puSource, nSourceSize);
    if (this.m_seqSource.hasElements()) {
      const prefix = unicodeView(
          this.m_seqSource.getConstArray() as SequenceElements,
          this.m_seqSource.getLength(),
        ),
        temp = new Uint16Array(nSourceSize + prefix.length);
      temp.set(prefix);
      temp.set(source, prefix.length);
      source = temp;
      nSourceSize += prefix.length;
      const empty = new Unicode();
      try {
        this.m_seqSource.moveAssign(empty);
      } finally {
        empty.dispose();
      }
    }
    let nTargetCount = 0,
      nSourceCount = 0,
      nSeqSize = nSourceSize * 3;
    const seqText = new Bytes(nSeqSize),
      info: [number] = [0],
      consumed: [number] = [0];
    try {
      for (;;) {
        const target = new Uint8Array(nSeqSize - nTargetCount);
        const written = C.rtl_convertUnicodeToText(
          this.m_convUnicode2Text,
          this.m_contextUnicode2Text,
          source.subarray(nSourceCount),
          nSourceSize - nSourceCount,
          target,
          target.length,
          F.RTL_UNICODETOTEXT_FLAGS_UNDEFINED_DEFAULT | F.RTL_UNICODETOTEXT_FLAGS_INVALID_DEFAULT,
          info,
          consumed,
        );
        writeBytes(seqText, target.subarray(0, written), nTargetCount);
        nTargetCount += written;
        nSourceCount += consumed[0];
        if (info[0] & F.RTL_UNICODETOTEXT_INFO_DESTBUFFERTOSMALL) {
          nSeqSize *= 2;
          seqText.realloc(nSeqSize);
          continue;
        }
        break;
      }
      if (info[0] & F.RTL_UNICODETOTEXT_INFO_SRCBUFFERTOSMALL) {
        this.m_seqSource.realloc(nSourceSize - nSourceCount);
        writeUnicode(this.m_seqSource, source.subarray(nSourceCount));
      }
      seqText.realloc(nTargetCount);
      return seqText;
    } catch (error) {
      seqText.dispose();
      throw error;
    }
  }
  /** Original context/descriptor destruction precedes pending Sequence member destruction. @returns Nothing. */
  dispose(): void {
    C.rtl_destroyUnicodeToTextContext(this.m_convUnicode2Text, this.m_contextUnicode2Text);
    C.rtl_destroyUnicodeToTextConverter(this.m_convUnicode2Text);
    this.m_seqSource.dispose();
  }
}
/** Original XML file converter retains stream, started flag, encoding and optional conversion owners. It does not own stream closure. */
export class XMLFile2UTFConverter {
  private readonly m_in = new Reference<XInputStream>();
  private m_bStarted = false;
  private readonly m_sEncoding = new OString();
  private m_pText2Unicode: Text2UnicodeConverter | null = null;
  private m_pUnicode2Text: Unicode2TextConverter | null = null;
  /** Original Reference member assignment does not reset parser state. @param stream - Input interface. @returns Nothing. */ setInputStream(
    stream: Reference<XInputStream>,
  ): void {
    this.m_in.assign(stream);
  }
  /** Original encoding assignment does not reset parser state. @param encoding - Original byte name. @returns Nothing. */ setEncoding(
    encoding: OStringConstReference,
  ): void {
    this.m_sEncoding.assign(encoding);
  }
  /** Original initial512-byte heuristic, accumulation, source scan and conversion order. @param seq - Byte output lvalue. @param nMaxToRead - Original request; returned output can exceed it. @returns Converted output count. */
  readAndConvert(seq: Sequence<number>, nMaxToRead: number): number {
    if (!this.m_in.is()) throw new NotConnectedException();
    if (!this.m_bStarted) nMaxToRead = Math.max(512, nMaxToRead);
    let nRead: number;
    const seqStart = new Bytes();
    try {
      for (;;) {
        nRead = (this.m_in.get() as XInputStream).readSomeBytes(seq, nMaxToRead);
        if (nRead + seqStart.getLength()) {
          if (!this.m_bStarted && nRead) {
            if (seqStart.hasElements()) {
              const combined = concatSequences(Bytes, seqStart, seq);
              try {
                seq.moveAssign(combined);
              } finally {
                combined.dispose();
              }
            }
            if (!XMLFile2UTFConverter.isEncodingRecognizable(seq)) {
              seqStart.assign(seq);
              continue;
            }
            if (this.scanForEncoding(seq) || !this.m_sEncoding.isEmpty()) this.initializeDecoding();
            const empty = new Bytes();
            try {
              seqStart.moveAssign(empty);
            } finally {
              empty.dispose();
            }
          }
          if (this.m_pText2Unicode && this.m_pUnicode2Text && this.m_pText2Unicode.canContinue()) {
            const unicode = this.m_pText2Unicode.convert(seq);
            try {
              const converted = this.m_pUnicode2Text.convert(
                unicode.getConstArray() as SequenceElements,
                unicode.getLength(),
              );
              try {
                seq.moveAssign(converted);
              } finally {
                converted.dispose();
              }
            } finally {
              unicode.dispose();
            }
          }
          if (!this.m_bStarted) {
            this.m_bStarted = true;
            XMLFile2UTFConverter.removeEncoding(seq);
          }
          nRead = seq.getLength();
        }
        break;
      }
      return nRead;
    } finally {
      seqStart.dispose();
    }
  }
  /** Original first-line quoted encoding attribute removal, including source quote-order asymmetry. @param seq - Converted output lvalue. @returns Nothing. */
  private static removeEncoding(seq: Sequence<number>): void {
    seq.getArray(); // Original writable pointer borrow detaches COW even when no declaration is removed.
    const bytes = byteView(seq);
    if (
      seq.getLength() < 5 ||
      !declaration.every(
        /** Original strncmp over five bytes. @param c - Byte. @param i - Offset. @returns Equal. */ (
          c,
          i,
        ) => bytes[i] === c,
      )
    )
      return;
    let str = new OString(bytes, bytes.length);
    try {
      const nMax = str.indexOf(10);
      if (nMax >= 0) {
        const line = str.copy(0, nMax);
        str.dispose();
        str = line;
      }
      const nFound = str.indexOf(encodingAttribute);
      if (nFound < 0) return;
      let nStart = str.indexOf(doubleQuote, nFound),
        nStop: number;
      if (nStart < 0 || str.indexOf(singleQuote, nFound) < nStart) {
        nStart = str.indexOf(singleQuote, nFound);
        nStop = str.indexOf(singleQuote, nStart + 1);
      } else nStop = str.indexOf(doubleQuote, nStart + 1);
      if (nStart >= 0 && nStop >= 0 && nStart + 1 < nStop) {
        const data = byteView(seq);
        writeBytes(seq, data.subarray(nStop + 1), nFound);
        seq.realloc(seq.getLength() - (nStop + 1 - nFound));
      }
    } finally {
      str.dispose();
    }
  }
  /** Original8-byte recognition and closing-bracket heuristic. @param seq - Initial bytes. @returns Enough bytes. */
  private static isEncodingRecognizable(seq: Sequence<number>): boolean {
    const p = byteView(seq);
    let check = false;
    if (seq.getLength() < 8) return false;
    if (
      declaration.every(
        /** Original five-byte comparison. @param c - Byte. @param i - Offset. @returns Equal. */ (
          c,
          i,
        ) => p[i] === c,
      )
    )
      check = true;
    else if ((p[0] === 60 || p[2] === 60) && (p[4] === 63 || p[6] === 63)) check = true;
    else if ((p[1] === 60 || p[3] === 60) && (p[5] === 63 || p[7] === 63)) check = true;
    if (check) return p.includes(62);
    return true;
  }
  /** Original declaration/BOM/signature precedence and byte modifications. @param seq - First accumulated output. @returns Native scan result. */
  private scanForEncoding(seq: Sequence<number>): boolean {
    const p = byteView(seq);
    if (seq.getLength() < 4) return false;
    if (
      seq.getLength() >= 5 &&
      declaration.every(
        /** Original lexical prefix. @param c - Byte. @param i - Offset. @returns Equal. */ (
          c,
          i,
        ) => p[i] === c,
      )
    ) {
      let str = new OString(p, p.length);
      try {
        const nMax = str.indexOf(10);
        if (nMax >= 0) {
          const line = str.copy(0, nMax);
          str.dispose();
          str = line;
        }
        const nFound = str.indexOf(encodingAttribute);
        if (nFound >= 0) {
          let nStart = str.indexOf(doubleQuote, nFound),
            nStop: number;
          if (nStart < 0 || str.indexOf(singleQuote, nFound) < nStart) {
            nStart = str.indexOf(singleQuote, nFound);
            nStop = str.indexOf(singleQuote, nStart + 1);
          } else nStop = str.indexOf(doubleQuote, nStart + 1);
          if (nStart >= 0 && nStop >= 0 && nStart + 1 < nStop) {
            const name = str.copy(nStart + 1, nStop - nStart - 1);
            try {
              this.m_sEncoding.moveAssign(name);
            } finally {
              name.dispose();
            }
          }
        }
      } finally {
        str.dispose();
      }
    } else if (p[0] === 0xfe && p[1] === 0xff) this.m_sEncoding.assign(utf16);
    else if (p[0] === 0xff && p[1] === 0xfe) this.m_sEncoding.assign(utf16);
    else if (p[0] === 0 && p[1] === 0x3c && p[2] === 0 && p[3] === 0x3f) {
      seq.realloc(seq.getLength() + 2);
      const temp = byteView(seq);
      writeBytes(seq, temp.subarray(0, temp.length - 2), 2);
      writeBytes(seq, Uint8Array.of(0xfe, 0xff));
      this.m_sEncoding.assign(utf16);
    } else if (p[0] === 0x3c && p[1] === 0 && p[2] === 0x3f && p[3] === 0) {
      seq.realloc(seq.getLength() + 2);
      const temp = byteView(seq);
      writeBytes(seq, temp.subarray(0, temp.length - 2), 2);
      writeBytes(seq, Uint8Array.of(0xff, 0xfe));
      this.m_sEncoding.assign(utf16);
    } else if (p[0] === 0xef && p[1] === 0xbb && p[2] === 0xbf) {
      writeBytes(seq, p.subarray(3));
      seq.realloc(seq.getLength() - 3);
      this.m_sEncoding.assign(utf8);
    } else if (p[0] === 0 && p[1] === 0 && p[2] === 0 && p[3] === 0x3c)
      this.m_sEncoding.assign(ucs4);
    else if (p[0] === 0x3c && p[1] === 0 && p[2] === 0 && p[3] === 0) this.m_sEncoding.assign(ucs4);
    else return false;
    return true;
  }
  /** Original UTF8 bypass and recognized/unknown converter construction. @returns Nothing. */
  private initializeDecoding(): void {
    if (
      !this.m_sEncoding.isEmpty() &&
      rtl_getTextEncodingFromMimeCharset(this.m_sEncoding.getStr()) !== RTL_TEXTENCODING_UTF8
    ) {
      const text = new Text2UnicodeConverter(this.m_sEncoding),
        oldText = this.m_pText2Unicode;
      this.m_pText2Unicode = text;
      oldText?.dispose();
      const unicode = new Unicode2TextConverter(RTL_TEXTENCODING_UTF8),
        oldUnicode = this.m_pUnicode2Text;
      this.m_pUnicode2Text = unicode;
      oldUnicode?.dispose();
    }
  }
  /** Original reverse unique-pointer/string/reference member destruction, without closing input. @returns Nothing. */
  dispose(): void {
    this.m_pUnicode2Text?.dispose();
    this.m_pText2Unicode?.dispose();
    this.m_sEncoding.dispose();
    this.m_in.dispose();
  }
}
