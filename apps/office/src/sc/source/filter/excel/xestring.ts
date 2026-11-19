/** @fileoverview Original XclExpString text/byte buffers, formatting runs, flags, comparisons, hashes and memory output. Record-stream/XML font orchestration awaits genuine XclExpStream/XclExpXmlStream owners; no replacement stream/provider is supplied. */
import type { XclExpXmlStream } from "../inc/xestream";
import { getTokenFromUtf8 as token } from "../../../../oox/source/token/tokenmap";
import { OUString } from "../../../../sal/inc/rtl/ustring";
import type { OUStringConstReference } from "../../../../sal/inc/rtl/ustring";
import { text } from "../../../../i18nlangtag/source/isolang/isolang.tables";
import { OUStringToOString } from "../../../../sal/rtl/ustring-convert";
import type { rtl_TextEncoding } from "../../../../sal/inc/rtl/textenc";
import {
  XclStrFlags,
  XclFormatRun,
  EXC_STR_MAXLEN,
  EXC_STR_MAXLEN_8BIT,
  EXC_STRF_16BIT,
  EXC_STRF_RICH,
  EXC_LF,
} from "../inc/xlstring";
import { EXC_FONT_NOTFOUND } from "../inc/xlstyle";
import { XclXmlUtils } from "./xestream";
import type { XclExpFontBuffer } from "./xestyle.xml";
import type { XclFontData } from "./xlstyle";
/** Original mismatch followed by vector-length comparison. @param left - Left vector. @param right - Right vector. @returns Signed comparison. */
function lclCompareVectors(
  left: Uint16Array | Uint8Array,
  right: Uint16Array | Uint8Array,
): number {
  const length = Math.min(left.length, right.length);
  for (let i = 0; i < length; ++i) {
    const difference = (left[i] as number) - (right[i] as number);
    if (difference) return difference;
  }
  return left.length - right.length;
}
/** Original sal_uInt32 rolling hash with unsigned16 folding. @param values - Actual vector. @param formats - Whether elements are format runs. @returns Folded hash. */
function lclHashVector(
  values: Uint16Array | Uint8Array | readonly XclFormatRun[],
  formats = false,
): number {
  let hash = values.length >>> 0;
  for (const value of values) {
    const scalar = formats
      ? (((value as XclFormatRun).mnChar << 8) ^ (value as XclFormatRun).mnFontIdx) >>> 0
      : (value as number);
    hash = (Math.imul(hash, 31) + scalar) >>> 0;
  }
  return (hash ^ (hash >>> 16)) & 0xffff;
}
/** Original UTF16 view binding, preserving embedded NUL and surrogate units. @param source - Actual native string or view. @returns Borrowed vector view. */
function units(source: OUStringConstReference | Uint16Array): Uint16Array {
  return source instanceof Uint16Array ? source : source.getStr().subarray(0, source.getLength());
}
/** Original XLS export string value; JS owns physical vector allocations. */
export class XclExpString {
  private maUniBuffer: Uint16Array = new Uint16Array();
  private maCharBuffer: Uint8Array = new Uint8Array();
  private readonly maFormats: XclFormatRun[] = [];
  private mnLen = 0;
  private mnMaxLen = EXC_STR_MAXLEN;
  private mbIsBiff8 = true;
  private mbIsUnicode = false;
  private mb8BitLen = false;
  private mbSmartFlags = false;
  private mbSkipFormats = false;
  private mbHasNewline = false;
  private mbSingleLineForMultipleParagraphs = false;
  /** Original empty(flags,max), Unicode(value,flags,max) and implicit value-copy constructors. @param source - Flags or native text. @param flagsOrMax - Flags for text, maximum for empty. @param maximum - Text maximum. @returns Value. */
  constructor(
    source: XclStrFlags | OUStringConstReference | XclExpString = XclStrFlags.NONE,
    flagsOrMax?: number,
    maximum = EXC_STR_MAXLEN,
  ) {
    if (typeof source === "number") this.Init(0, source, flagsOrMax ?? EXC_STR_MAXLEN, true);
    else if (source instanceof XclExpString) {
      this.maUniBuffer = source.maUniBuffer.slice();
      this.maCharBuffer = source.maCharBuffer.slice();
      for (const run of source.maFormats)
        this.maFormats.push(new XclFormatRun(run.mnChar, run.mnFontIdx));
      this.mnLen = source.mnLen;
      this.mnMaxLen = source.mnMaxLen;
      this.mbIsBiff8 = source.mbIsBiff8;
      this.mbIsUnicode = source.mbIsUnicode;
      this.mb8BitLen = source.mb8BitLen;
      this.mbSmartFlags = source.mbSmartFlags;
      this.mbSkipFormats = source.mbSkipFormats;
      this.mbHasNewline = source.mbHasNewline;
      this.mbSingleLineForMultipleParagraphs = source.mbSingleLineForMultipleParagraphs;
    } else this.Assign(source, flagsOrMax ?? XclStrFlags.NONE, maximum);
  }
  /** Original unformatted Unicode assignment or single-character assignment. @param source - Native string or Unicode unit. @param flags - Original flags. @param maximum - Unsigned16 maximum. @returns Nothing. */
  Assign(
    source: OUStringConstReference | number,
    flags = XclStrFlags.NONE,
    maximum = EXC_STR_MAXLEN,
  ): void {
    const data = typeof source === "number" ? Uint16Array.of(source) : units(source);
    if (typeof source === "number") {
      flags = XclStrFlags.NONE;
      maximum = EXC_STR_MAXLEN;
    }
    this.Init(data.length, flags, maximum, true);
    this.CharsToBuffer(data, 0, this.mnLen);
  }
  /** Original encoded-byte assignment truncates the encoded byte count, not the source Unicode count. @param source - Native text. @param encoding - Actual SAL encoding. @param flags - Original flags. @param maximum - Unsigned16 maximum. @returns Nothing. */
  AssignByte(
    source: OUStringConstReference,
    encoding: rtl_TextEncoding,
    flags = XclStrFlags.NONE,
    maximum = EXC_STR_MAXLEN,
  ): void {
    const data = OUStringToOString(text(source), encoding);
    this.Init(data.length, flags, maximum, false);
    this.CharsToBuffer(data, 0, this.mnLen);
  }
  /** Original Unicode append ignores the wrong byte-string mode after its diagnostic. @param source - Native UTF16 view. @returns Nothing. */
  Append(source: OUStringConstReference | Uint16Array): void {
    if (this.mbIsBiff8) this.BuildAppend(units(source));
  }
  /** Original encoded append and explicit NUL-unit overload. @param source - Native text or Unicode unit. @param encoding - Actual SAL encoding. @returns Nothing. */
  AppendByte(source: OUStringConstReference | number, encoding: rtl_TextEncoding): void {
    if (typeof source === "number") {
      const value = source & 0xffff;
      this.BuildAppend(
        value === 0 ? Uint8Array.of(0) : OUStringToOString(String.fromCharCode(value), encoding),
      );
    } else if (!source.isEmpty()) this.BuildAppend(OUStringToOString(text(source), encoding));
  }
  /** Original format admission preserves diagnostics-only index ordering and optional adjacent-font deduplication. @param character - Unsigned16 start. @param font - Unsigned16 index. @param dropDuplicate - Native default. @returns Nothing. */
  AppendFormat(character: number, font: number, dropDuplicate = true): void {
    character &= 0xffff;
    font &= 0xffff;
    const previous = this.maFormats[this.maFormats.length - 1],
      maximum = this.mbIsBiff8 ? EXC_STR_MAXLEN : EXC_STR_MAXLEN_8BIT;
    if (
      !previous ||
      (this.maFormats.length < maximum && (!dropDuplicate || previous.mnFontIdx !== font))
    )
      this.maFormats.push(new XclFormatRun(character, font));
  }
  /** Original trailing run never drops the equal-font run. @param font - Font index. @returns Nothing. */
  AppendTrailingFormat(font: number): void {
    this.AppendFormat(this.mnLen, font, false);
  }
  /** Original format-vector truncation. @param maximum - Unsigned16 count. @returns Nothing. */
  LimitFormatCount(maximum: number): void {
    maximum &= 0xffff;
    if (this.maFormats.length > maximum) this.maFormats.length = maximum;
  }
  /** Original first-character font or missing sentinel. @returns Font index. */
  GetLeadingFont(): number {
    const first = this.maFormats[0];
    return first?.mnChar === 0 ? first.mnFontIdx : EXC_FONT_NOTFOUND;
  }
  /** Original leading-font extraction/removal. @returns Extracted index or sentinel. */
  RemoveLeadingFont(): number {
    const font = this.GetLeadingFont();
    if (font !== EXC_FONT_NOTFOUND) this.maFormats.shift();
    return font;
  }
  /** Original length. @returns UTF16-unit/encoded-byte count. */
  Len(): number {
    return this.mnLen;
  }
  /** Original empty predicate. @returns Empty. */
  IsEmpty(): boolean {
    return this.mnLen === 0;
  }
  /** Original sticky LF predicate. @returns LF seen in stored content. */
  HasNewline(): boolean {
    return this.mbHasNewline;
  }
  /** Original single-line display override. @returns Flag. */
  IsSingleLineForMultipleParagraphs(): boolean {
    return this.mbSingleLineForMultipleParagraphs;
  }
  /** Original override assignment, reset by Assign. @param value - Flag. @returns Nothing. */
  SetSingleLineForMultipleParagraphs(value: boolean): void {
    this.mbSingleLineForMultipleParagraphs = value;
  }
  /** Original equality ignores output header/length/format-suppression and display override flags. @param other - Value. @returns Equality. */
  IsEqual(other: XclExpString): boolean {
    return (
      this.mnLen === other.mnLen &&
      this.mbIsBiff8 === other.mbIsBiff8 &&
      this.mbIsUnicode === other.mbIsUnicode &&
      this.mbHasNewline === other.mbHasNewline &&
      lclCompareVectors(
        this.mbIsBiff8 ? this.maUniBuffer : this.maCharBuffer,
        this.mbIsBiff8 ? other.maUniBuffer : other.maCharBuffer,
      ) === 0 &&
      this.maFormats.length === other.maFormats.length &&
      this.maFormats.every(
        /** Original run equality. @param value - Run. @param index - Position. @returns Equality. */
        (value, index) => value.equals(other.maFormats[index] as XclFormatRun),
      )
    );
  }
  /** Original ordering selects the buffer using only the left-hand BIFF mode. @param other - Value. @returns Less-than. */
  IsLessThan(other: XclExpString): boolean {
    const comparison = lclCompareVectors(
      this.mbIsBiff8 ? this.maUniBuffer : this.maCharBuffer,
      this.mbIsBiff8 ? other.maUniBuffer : other.maCharBuffer,
    );
    if (comparison) return comparison < 0;
    for (let i = 0; i < Math.min(this.maFormats.length, other.maFormats.length); ++i) {
      const left = this.maFormats[i] as XclFormatRun,
        right = other.maFormats[i] as XclFormatRun;
      if (!left.equals(right)) return left.lessThan(right);
    }
    return this.maFormats.length < other.maFormats.length;
  }
  /** Original rich predicate. @returns Any formats. */
  IsRich(): boolean {
    return this.maFormats.length !== 0;
  }
  /** Original unsigned16 format count. @returns Count. */
  GetFormatsCount(): number {
    return this.maFormats.length & 0xffff;
  }
  /** Original borrowed const vector, without cloning its entries. @returns Formats. */
  GetFormats(): readonly Readonly<XclFormatRun>[] {
    return this.maFormats;
  }
  /** Original flag-field value. @returns Byte. */
  GetFlagField(): number {
    return (this.mbIsUnicode ? EXC_STRF_16BIT : 0) | (this.IsWriteFormats() ? EXC_STRF_RICH : 0);
  }
  /** Original header byte count. @returns Size. */
  GetHeaderSize(): number {
    return (
      (this.mb8BitLen ? 1 : 2) + (this.IsWriteFlags() ? 1 : 0) + (this.IsWriteFormats() ? 2 : 0)
    );
  }
  /** Original character byte count. @returns Size. */
  GetBufferSize(): number {
    return this.mnLen * (this.mbIsUnicode ? 2 : 1);
  }
  /** Original complete size including inline formats. @returns Size. */
  GetSize(): number {
    return (
      this.GetHeaderSize() +
      this.GetBufferSize() +
      (this.IsWriteFormats() ? 4 * this.GetFormatsCount() : 0)
    );
  }
  /** Original valid-index character query; invalid native pointer/index domains remain caller preconditions. @param index - Unsigned16 index. @returns Unit/byte. */
  GetChar(index: number): number {
    return (this.mbIsBiff8 ? this.maUniBuffer : this.maCharBuffer)[index & 0xffff] as number;
  }
  /** Original folded text/format vector hash. @returns Unsigned16 hash. */
  GetHash(): number {
    return (
      lclHashVector(this.mbIsBiff8 ? this.maUniBuffer : this.maCharBuffer) ^
      lclHashVector(this.maFormats, true)
    );
  }
  /** Original borrowed Unicode vector, empty in byte mode. @returns Actual vector. */
  GetUnicodeBuffer(): Uint16Array {
    return this.maUniBuffer;
  }
  /** Original header-to-memory operation; the source rich-string diagnostic is not a new release-mode rejection or format serializer. @param destination - Admitted writable span. @returns Nothing. */
  WriteHeaderToMem(destination: Uint8Array): void {
    let offset = 0;
    if (this.mb8BitLen) destination[offset++] = this.mnLen;
    else {
      destination[offset++] = this.mnLen & 0xff;
      destination[offset++] = this.mnLen >>> 8;
    }
    if (this.IsWriteFlags()) destination[offset] = this.GetFlagField();
  }
  /** Original raw little-endian buffer writer. @param destination - Admitted writable span. @returns Nothing. */
  WriteBufferToMem(destination: Uint8Array): void {
    if (this.IsEmpty()) return;
    if (this.mbIsBiff8) {
      let offset = 0;
      for (const character of this.maUniBuffer) {
        destination[offset++] = character & 0xff;
        if (this.mbIsUnicode) destination[offset++] = character >>> 8;
      }
    } else destination.set(this.maCharBuffer);
  }
  /** Original memory writer always emits the header even with NoHeader, unlike the record-stream Write overload. @param destination - Admitted writable span. @returns Nothing. */
  WriteToMem(destination: Uint8Array): void {
    this.WriteHeaderToMem(destination);
    this.WriteBufferToMem(destination.subarray(this.GetHeaderSize()));
  }
  /** Original XML text and formatted run emission. @param stream - Actual XLSX XML stream. @param fonts - Workbook font table for formatted strings. @returns Nothing. */
  WriteXml(stream: XclExpXmlStream, fonts?: XclExpFontBuffer): void {
    if (!this.IsWriteFormats()) {
      this.WriteXmlText(stream, 0, this.maUniBuffer.length);
      return;
    }
    if (!fonts) throw new Error("XclExpRoot/font-rich string export is not implemented");
    let start = 0;
    let font: XclFontData | undefined;
    for (const format of this.maFormats) {
      this.WriteXmlRun(stream, start, format.mnChar, font);
      start = format.mnChar;
      font = fonts.GetFont(format.mnFontIdx);
    }
    this.WriteXmlRun(stream, start, this.maUniBuffer.length, font);
  }
  /** Writes a nonempty rich-text run. @param stream - Actual XLSX stream. @param start - UTF-16 start. @param end - Exclusive end. @param font - Optional run font. @returns Nothing. */
  private WriteXmlRun(
    stream: XclExpXmlStream,
    start: number,
    end: number,
    font?: XclFontData,
  ): void {
    if (start >= end) return;
    const serializer = stream.GetCurrentStream();
    const run = token("r"),
      props = token("rPr");
    serializer.startElement(run);
    if (font) {
      serializer.startElement(props);
      XclXmlUtils.WriteFontData(serializer, font, token("rFont"));
      serializer.endElement(props);
    }
    this.WriteXmlText(stream, start, end);
    serializer.endElement(run);
  }
  /** Writes an original preserve-space text element for a run. @param stream - Actual XLSX stream. @param start - UTF-16 start. @param end - Exclusive end. @returns Nothing. */
  private WriteXmlText(stream: XclExpXmlStream, start: number, end: number): void {
    const serializer = stream.GetCurrentStream();
    serializer.startElement(token("t"), (token("xml") << 16) | token("space"), "preserve");
    const span = this.maUniBuffer.subarray(start, end);
    const value = new OUString(span, span.length);
    try {
      serializer.writeEscaped(text(value));
    } finally {
      value.dispose();
    }
    serializer.endElement(token("t"));
  }
  /** Original flag emission policy. @returns Emit flags. */
  private IsWriteFlags(): boolean {
    return this.mbIsBiff8 && (!this.IsEmpty() || !this.mbSmartFlags);
  }
  /** Original inline formatting policy. @returns Emit inline formats. */
  private IsWriteFormats(): boolean {
    return this.mbIsBiff8 && !this.mbSkipFormats && this.IsRich();
  }
  /** Original clamped string length. @param length - Signed32 requested count. @returns Nothing. */
  private SetStrLen(length: number): void {
    this.mnLen = Math.min(
      Math.max(length | 0, 0),
      this.mb8BitLen && this.mnMaxLen > 255 ? 255 : this.mnMaxLen,
    );
  }
  /** Original vector filling, sticky Unicode/LF flags and byte-mode reset of Unicode. @param source - Original encoded buffer. @param start - Destination start. @param length - Actual clipped count. @returns Nothing. */
  private CharsToBuffer(source: Uint16Array | Uint8Array, start: number, length: number): void {
    const unicode = source instanceof Uint16Array;
    const destination = unicode ? this.maUniBuffer : this.maCharBuffer;
    destination.set(source.subarray(0, length), start);
    if (unicode) {
      for (let i = start; i < start + length; ++i)
        if ((destination[i] as number) & 0xff00) this.mbIsUnicode = true;
    } else this.mbIsUnicode = false;
    if (!this.mbHasNewline)
      this.mbHasNewline = destination.subarray(start, start + length).includes(EXC_LF);
  }
  /** Original flag reset and actual vector initialization. @param length - Requested count. @param flags - Original flags. @param maximum - Unsigned16 maximum. @param biff8 - Buffer kind. @returns Nothing. */
  private Init(length: number, flags: XclStrFlags, maximum: number, biff8: boolean): void {
    this.mbIsBiff8 = biff8;
    this.mbIsUnicode = biff8 && !!(flags & XclStrFlags.ForceUnicode);
    this.mb8BitLen = !!(flags & XclStrFlags.EightBitLength);
    this.mbSmartFlags = biff8 && !!(flags & XclStrFlags.SmartFlags);
    this.mbSkipFormats = !!(flags & XclStrFlags.SeparateFormats);
    this.mbHasNewline = false;
    this.mbSingleLineForMultipleParagraphs = false;
    this.mnMaxLen = maximum & 0xffff;
    this.SetStrLen(length);
    this.maFormats.length = 0;
    this.maUniBuffer = new Uint16Array(biff8 ? this.mnLen : 0);
    this.maCharBuffer = new Uint8Array(biff8 ? 0 : this.mnLen);
  }
  /** Original same-mode append, preserving existing flags and clipped-prefix behavior. @param source - Appended buffer. @returns Nothing. */
  private BuildAppend(source: Uint16Array | Uint8Array): void {
    if (source instanceof Uint16Array !== this.mbIsBiff8) return;
    const oldLength = this.mnLen,
      oldBuffer = this.mbIsBiff8 ? this.maUniBuffer : this.maCharBuffer;
    this.SetStrLen(this.mnLen + source.length);
    if (this.mbIsBiff8) {
      this.maUniBuffer = new Uint16Array(this.mnLen);
      this.maUniBuffer.set(oldBuffer);
    } else {
      this.maCharBuffer = new Uint8Array(this.mnLen);
      this.maCharBuffer.set(oldBuffer);
    }
    this.CharsToBuffer(source, oldLength, this.mnLen - oldLength);
  }
}
