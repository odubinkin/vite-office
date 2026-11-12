/** @fileoverview Original saxwriter.cxx SaxWriterHelper, normal NDEBUG/non-DBG_UTIL profile, with actual acquired stream, UNO byte Sequence and incremental cache. Split functions bind this same original receiver; no replacement XML service is advertised. */
import { Reference } from "../../../cppu/inc/com/sun/star/uno/Reference";
import { Sequence, type SequenceElements } from "../../../cppu/inc/com/sun/star/uno/Sequence";
import { OUString, type OUStringConstReference } from "../../../sal/inc/rtl/ustring";
import type { XOutputStream } from "../../../udkapi/com/sun/star/io/XOutputStream";
import type { XAttributeList } from "../../../offapi/com/sun/star/xml/sax/XAttributeList";
import { PairStringString } from "../../../udkapi/com/sun/star/beans/Pair";
import { IOException } from "../../../cppu/inc/com/sun/star/io/IOException";
import { SAXException } from "../../../cppu/inc/com/sun/star/xml/sax/SAXException";
import { getCaughtException } from "../../../cppuhelper/inc/exc_hlp";
import { withCaughtException } from "../../../cppu/inc/uno/exception-context";
import { ascii, convertToXML, calcXMLByteLength } from "./saxwriter.convert";
/** Original internal helper error severity. */
export enum SaxInvalidCharacterError {
  SAX_NONE,
  SAX_WARNING,
  SAX_ERROR,
}
/** Original ReplacementPair vector element. */
export interface ReplacementPair {
  name: OUString;
  replacement: OUString;
}
/** Original compiled NDEBUG branch of CheckValidName; debug grammar assertions are not a release runtime validator. @param name - Source QName. @returns Nothing. */
function CheckValidName(name: OUStringConstReference): void {
  void name;
}
/** Original helper allocation owns only its actual source members. Nonprivate internal fields bind the extracted original member functions to this receiver. */
export class SaxWriterHelper {
  readonly m_out: Reference<XOutputStream>;
  readonly m_Sequence: Sequence<number>;
  mp_Sequence: SequenceElements;
  nLastLineFeedPos = 0;
  nCurrentPos = 0;
  m_bStartElementFinished = true;
  readonly m_Replacements: ReplacementPair[] = [];
  /** Original defaults and acquired output reference. @param output - Source stream. @returns Actual helper. */
  constructor(output: Reference<XOutputStream>) {
    this.m_out = new Reference(output);
    let sequence: Sequence<number> | undefined;
    try {
      sequence = new (Sequence.specialize<number>("sal_Int8", 1))(1024);
      this.m_Sequence = sequence;
      this.mp_Sequence = sequence.getArray() as SequenceElements;
    } catch (error) {
      sequence?.dispose();
      this.m_out.dispose();
      throw error;
    }
  }
  /** Lowering of direct sal_Int8 pointer assignment, with no new bounds/failure provider. @param index - Source position. @param value - Byte. @returns Nothing. */
  setByte(index: number, value: number): void {
    (this.mp_Sequence.get(index) as [number])[0] = (value << 24) >> 24;
  }
  /** Original writeSequence leaves caller position unchanged on a stream exception. @returns Zero on success. */
  writeSequence(): number {
    try {
      this.m_out.operatorStar().writeBytes(this.m_Sequence);
    } catch (error) {
      if (!(error instanceof IOException)) throw error;
      try {
        const wrapped = withCaughtException(error, getCaughtException),
          message = OUString.createFromAscii(ascii("IO exception during writing\0")),
          context = new Reference();
        try {
          throw new SAXException(message, context, wrapped);
        } finally {
          context.dispose();
          message.dispose();
          wrapped.dispose();
        }
      } finally {
        error.dispose();
      }
    }
    this.nLastLineFeedPos -= 1024;
    return 0;
  }
  /** Original overflowing memcpy/recursive tail writes; exactly full buffers may remain for the caller to flush. @param bytes - Borrowed input. @returns Nothing. */
  AddBytes(bytes: Uint8Array): void {
    const count = 1024 - this.nCurrentPos;
    for (let i = 0; i < count; ++i) this.setByte(this.nCurrentPos + i, bytes[i] as number);
    this.nCurrentPos = this.writeSequence();
    const rest = bytes.subarray(count);
    if (this.nCurrentPos + rest.length <= 1024) {
      for (let i = 0; i < rest.length; ++i) this.setByte(this.nCurrentPos + i, rest[i] as number);
      this.nCurrentPos += rest.length;
    } else this.AddBytes(rest);
  }
  /** Binds duplicated original memcpy branches, preserving their strict greater-than overflow test and deferred exact-full flush. @param bytes - Actual bytes. @returns Nothing. */
  copyBytes(bytes: Uint8Array): void {
    if (this.nCurrentPos + bytes.length > 1024) this.AddBytes(bytes);
    else {
      for (let i = 0; i < bytes.length; ++i) this.setByte(this.nCurrentPos + i, bytes[i] as number);
      this.nCurrentPos += bytes.length;
    }
  }
  /** Original single-byte append and immediate exact-full flush. @param byte - Source byte. @returns Nothing. */
  private byte(byte: number): void {
    this.setByte(this.nCurrentPos, byte);
    ++this.nCurrentPos;
    if (this.nCurrentPos === 1024) this.nCurrentPos = this.writeSequence();
  }
  /** Original vector resize, actual string assignment and lexicographic replacement sort. @param replacements - Native consumed Pair<string,string> sequence. @returns Nothing. */
  setCustomEntityNames(replacements: Sequence<PairStringString>): void {
    while (this.m_Replacements.length > replacements.getLength()) {
      const value = this.m_Replacements.pop() as ReplacementPair;
      value.replacement.dispose();
      value.name.dispose();
    }
    for (let i = 0; i < replacements.getLength(); ++i) {
      const source = PairStringString.unacquired(
        replacements.operatorIndex(i) as unknown as Parameters<
          typeof PairStringString.unacquired
        >[0],
      );
      let value = this.m_Replacements[i];
      if (value === undefined) {
        value = { name: new OUString(), replacement: new OUString() };
        this.m_Replacements.push(value);
      }
      value.name.assign(source.First);
      value.replacement.assign(source.Second);
    }
    if (this.m_Replacements.length > 1)
      this.m_Replacements.sort(
        /** Original ReplacementPair::operator< by UTF16 replacement only. @param first - Left. @param second - Right. @returns Strict order comparison. */ (
          first,
          second,
        ) => first.replacement.compareTo(second.replacement),
      );
  }
  /** Original sorted first-prefix search; a larger candidate ends the search, and shorter prefixes win. @param input - Borrowed source tail. @param length - Tail length. @returns Borrowed vector element or null. */
  findXMLReplacement(input: Uint16Array, length: number): ReplacementPair | null {
    for (const pair of this.m_Replacements) {
      const count = pair.replacement.getLength();
      if (count > length) continue;
      const units = pair.replacement.getStr();
      let result = 0;
      for (let i = 0; i < count; ++i) {
        result = (units[i] as number) - (input[i] as number);
        if (result !== 0) break;
      }
      if (result === 0) return pair;
      if (result > 0) return null;
    }
    return null;
  }
  /** Original source local column count narrows to unsigned32. @returns Column estimate. */
  GetLastColumnCount(): number {
    return (this.nCurrentPos - this.nLastLineFeedPos) >>> 0;
  }
  /** Original delayed close of the start tag. @returns Nothing. */
  FinishStartElement(): void {
    if (!this.m_bStartElementFinished) {
      this.byte(62);
      this.m_bStartElementFinished = true;
    }
  }
  /** Original indentation and its distinct fitting/overflow line-feed bookkeeping. @param level - Original unsigned32 indentation. @returns Nothing. */
  insertIndentation(level: number): void {
    level >>>= 0;
    this.FinishStartElement();
    if (level > 0) {
      if (this.nCurrentPos + level + 1 <= 1024) {
        this.setByte(this.nCurrentPos, 10);
        this.nLastLineFeedPos = this.nCurrentPos;
        ++this.nCurrentPos;
        for (let i = 0; i < level; ++i) this.setByte(this.nCurrentPos + i, 32);
        this.nCurrentPos += level;
        if (this.nCurrentPos === 1024) this.nCurrentPos = this.writeSequence();
      } else {
        const count = (level + 1) >>> 0,
          bytes = new Uint8Array(count);
        bytes[0] = 10;
        bytes.fill(32, 1);
        this.AddBytes(bytes);
        this.nLastLineFeedPos = this.nCurrentPos - count;
        if (this.nCurrentPos === 1024) this.nCurrentPos = this.writeSequence();
      }
    } else {
      this.setByte(this.nCurrentPos, 10);
      this.nLastLineFeedPos = this.nCurrentPos;
      ++this.nCurrentPos;
      if (this.nCurrentPos === 1024) this.nCurrentPos = this.writeSequence();
    }
  }
  /** Original writeString finishes the start tag even for an empty input. @param value - Native string. @param normalize - Markup. @param whitespace - Attribute whitespace. @returns Character validity. */
  writeString(value: OUStringConstReference, normalize: boolean, whitespace: boolean): boolean {
    this.FinishStartElement();
    return convertToXML.call(this, value.getStr(), value.getLength(), normalize, whitespace);
  }
  /** Original byte estimate including source invalid/surrogate differences. @param value - String. @param normalize - Markup. @param whitespace - Attribute whitespace. @returns Signed32 estimate. */
  calcXMLByteLength(
    value: OUStringConstReference,
    normalize: boolean,
    whitespace: boolean,
  ): number {
    return calcXMLByteLength.call(this, value, normalize, whitespace);
  }
  /** Original XML declaration copies at the buffer start, then appends LF without changing the last-line-feed marker. @returns Nothing. */
  startDocument(): void {
    const bytes = ascii('<?xml version="1.0" encoding="UTF-8"?>');
    if (this.nCurrentPos + bytes.length <= 1024) {
      for (let i = 0; i < bytes.length; ++i) this.setByte(i, bytes[i] as number);
      this.nCurrentPos += bytes.length;
    } else this.AddBytes(bytes);
    if (this.nCurrentPos === 1024) this.nCurrentPos = this.writeSequence();
    this.byte(10);
  }
  /** Original startElement emits partial data and retains error severity ordering. @param name - QName. @param attributes - Actual list. @returns Source error category. */
  startElement(
    name: OUStringConstReference,
    attributes: Reference<XAttributeList>,
  ): SaxInvalidCharacterError {
    this.FinishStartElement();
    this.byte(60);
    let result = SaxInvalidCharacterError.SAX_NONE;
    CheckValidName(name);
    if (!this.writeString(name, false, false)) result = SaxInvalidCharacterError.SAX_ERROR;
    const count = attributes.is() ? attributes.operatorStar().getLength() : 0;
    for (let i = 0; i < count; ++i) {
      this.byte(32);
      const key = attributes.operatorStar().getNameByIndex(i);
      try {
        CheckValidName(key);
        if (!this.writeString(key, false, false)) result = SaxInvalidCharacterError.SAX_ERROR;
      } finally {
        key.dispose();
      }
      this.byte(61);
      this.byte(34);
      const value = attributes.operatorStar().getValueByIndex(i);
      try {
        if (!this.writeString(value, true, true) && result !== SaxInvalidCharacterError.SAX_ERROR)
          result = SaxInvalidCharacterError.SAX_WARNING;
      } finally {
        value.dispose();
      }
      this.byte(34);
    }
    this.m_bStartElementFinished = false;
    return result;
  }
  /** Original empty-element completion, without element-name matching in this release helper. @returns Whether completed as empty. */
  FinishEmptyElement(): boolean {
    if (this.m_bStartElementFinished) return false;
    this.byte(47);
    this.byte(62);
    this.m_bStartElementFinished = true;
    return true;
  }
  /** Original full closing tag. @param name - QName. @returns Source character validity. */
  endElement(name: OUStringConstReference): boolean {
    this.FinishStartElement();
    this.byte(60);
    this.byte(47);
    CheckValidName(name);
    const result = this.writeString(name, false, false);
    this.byte(62);
    return result;
  }
  /** Original final shrink/write; does not restore Sequence size or pointer and does not close the stream. @returns Nothing. */
  endDocument(): void {
    if (this.nCurrentPos > 0) {
      this.m_Sequence.realloc(this.nCurrentPos);
      this.nCurrentPos = this.writeSequence();
    }
  }
  /** Original same-stream flush closes a pending start tag and refreshes the pointer after both reallocations. @returns Nothing. */
  clearBuffer(): void {
    this.FinishStartElement();
    if (this.nCurrentPos > 0) {
      this.m_Sequence.realloc(this.nCurrentPos);
      this.nCurrentPos = this.writeSequence();
      this.m_Sequence.realloc(1024);
      this.mp_Sequence = this.m_Sequence.getArray() as SequenceElements;
    }
  }
  /** Original PI writes a space even for empty data and does not reject ?>. @param target - Target. @param data - Data. @returns Source validity. */
  processingInstruction(target: OUStringConstReference, data: OUStringConstReference): boolean {
    this.FinishStartElement();
    this.byte(60);
    this.byte(63);
    let result = this.writeString(target, false, false);
    this.byte(32);
    if (!this.writeString(data, false, false)) result = false;
    this.byte(63);
    this.byte(62);
    return result;
  }
  /** Original CDATA marker only; no state or content delimiter repair is supplied here. @returns Nothing. */
  startCDATA(): void {
    this.FinishStartElement();
    this.copyBytes(ascii("<![CDATA["));
    if (this.nCurrentPos === 1024) this.nCurrentPos = this.writeSequence();
  }
  /** Original CDATA closing marker. @returns Nothing. */
  endCDATA(): void {
    this.FinishStartElement();
    this.copyBytes(ascii("]]>"));
    if (this.nCurrentPos === 1024) this.nCurrentPos = this.writeSequence();
  }
  /** Original comment spelling, without -- or trailing-minus validation. @param value - Comment. @returns Character validity. */
  comment(value: OUStringConstReference): boolean {
    this.FinishStartElement();
    this.byte(60);
    this.byte(33);
    this.byte(45);
    this.byte(45);
    const result = this.writeString(value, false, false);
    this.byte(45);
    this.byte(45);
    this.byte(62);
    return result;
  }
  /** Original reverse member destruction with no implicit write/flush/close. @returns Nothing. */
  dispose(): void {
    for (const pair of this.m_Replacements) {
      pair.replacement.dispose();
      pair.name.dispose();
    }
    this.m_Replacements.length = 0;
    this.m_Sequence.dispose();
    this.m_out.dispose();
  }
}
