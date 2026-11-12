/** @fileoverview Original saxwriter.cxx convertToXML and custom replacement helpers, bound to the actual SaxWriterHelper receiver. No alternate XML encoder or host DOM is used. */
import type { OUStringConstReference } from "../../../sal/inc/rtl/ustring";
import { OUStringToOString } from "../../../sal/inc/rtl/ustring";
import { RTL_TEXTENCODING_UTF8 } from "../../../sal/inc/rtl/textenc";
import { isHighSurrogate, isLowSurrogate, combineSurrogates } from "../../../sal/inc/rtl/character";
import type { SaxWriterHelper } from "./saxwriter.helper";
/** Original XML 1.0 character gate; surrogates are handled separately by the caller. @param code - UTF16 code unit. @returns Whether forbidden. */
export function IsInvalidChar(code: number): boolean {
  return (
    (code < 32 && code !== 9 && code !== 10 && code !== 13) || code === 65534 || code === 65535
  );
}
/** Source literal memcpy input; code units are known ASCII at compile time. @param value - Source token. @returns Byte view. */
export function ascii(value: string): Uint8Array {
  return Uint8Array.from(
    value,
    /** Binds a known source char. @param code - ASCII character. @returns Byte. */ (code) =>
      code.charCodeAt(0),
  );
}
/** Original UTF16 conversion with source incremental failure/flush and surrogate reset ordering. @param this - Actual original helper receiver. @param input - Borrowed source code units. @param length - Actual source length. @param normalize - Escape markup. @param whitespace - Normalize attribute whitespace. @returns Whether every input character was valid. */
export function convertToXML(
  this: SaxWriterHelper,
  input: Uint16Array,
  length: number,
  normalize: boolean,
  whitespace: boolean,
): boolean {
  let success = true,
    surrogate = 0;
  for (let i = 0; i < length; ++i) {
    const c = input[i] as number;
    if (IsInvalidChar(c)) success = false;
    else if (c >= 1 && c <= 127) {
      if (normalize) {
        let token: string | undefined;
        switch (c) {
          case 38:
            token = "&amp;";
            break;
          case 60:
            token = "&lt;";
            break;
          case 62:
            token = "&gt;";
            break;
          case 39:
            token = "&apos;";
            break;
          case 34:
            token = "&quot;";
            break;
          case 13:
            token = "&#x0d;";
            break;
          case 10:
            if (whitespace) token = "&#x0a;";
            else {
              this.setByte(this.nCurrentPos, 10);
              this.nLastLineFeedPos = this.nCurrentPos;
              ++this.nCurrentPos;
            }
            break;
          case 9:
            if (whitespace) token = "&#x09;";
            else {
              this.setByte(this.nCurrentPos, 9);
              ++this.nCurrentPos;
            }
            break;
          default:
            this.setByte(this.nCurrentPos, c);
            ++this.nCurrentPos;
        }
        if (token !== undefined) this.copyBytes(ascii(token));
      } else {
        this.setByte(this.nCurrentPos, c);
        if (c === 10) this.nLastLineFeedPos = this.nCurrentPos;
        ++this.nCurrentPos;
      }
    } else {
      if (normalize && this.m_Replacements.length) {
        const found = this.findXMLReplacement(input.subarray(i), length - i);
        if (found !== null) {
          const bytes = OUStringToOString(
            found.name.getStr().subarray(0, found.name.getLength()),
            RTL_TEXTENCODING_UTF8,
          );
          try {
            this.copyBytes(bytes.getStr().subarray(0, bytes.getLength()));
          } finally {
            bytes.dispose();
          }
          i += found.replacement.getLength() - 1;
          // Source continue deliberately skips the common exact-full flush and surrogate reset.
          continue;
        }
      }
      if (isHighSurrogate(c)) {
        if (surrogate !== 0) success = false;
        surrogate = c;
      } else if (isLowSurrogate(c)) {
        if (surrogate) {
          surrogate = combineSurrogates(surrogate, c);
          this.copyBytes(
            new Uint8Array([
              0xf0 | ((surrogate >> 18) & 15),
              0x80 | ((surrogate >> 12) & 63),
              0x80 | ((surrogate >> 6) & 63),
              0x80 | (surrogate & 63),
            ]),
          );
        } else success = false;
        surrogate = 0;
      } else if (c > 0x7ff)
        this.copyBytes(
          new Uint8Array([0xe0 | ((c >> 12) & 15), 0x80 | ((c >> 6) & 63), 0x80 | (c & 63)]),
        );
      else this.copyBytes(new Uint8Array([0xc0 | ((c >> 6) & 31), 0x80 | (c & 63)]));
    }
    if (this.nCurrentPos === 1024) this.nCurrentPos = this.writeSequence();
    if (surrogate !== 0 && !isHighSurrogate(c)) {
      surrogate = 0;
      success = false;
    }
  }
  if (surrogate !== 0) success = false;
  return success;
}
/** Original calcXMLByteLength; intentionally retains its different invalid-character and surrogate handling. @param this - Actual original helper receiver. @param value - Native input. @param normalize - Markup escape. @param whitespace - Attribute whitespace. @returns Original signed32 estimated byte length. */
export function calcXMLByteLength(
  this: SaxWriterHelper,
  value: OUStringConstReference,
  normalize: boolean,
  whitespace: boolean,
): number {
  let length = 0,
    surrogate = 0;
  const input = value.getStr(),
    count = value.getLength();
  for (let i = 0; i < count; ++i) {
    const c = input[i] as number;
    if (!IsInvalidChar(c) && c >= 1 && c <= 127) {
      if (normalize) {
        switch (c) {
          case 38:
            length += 5;
            break;
          case 60:
          case 62:
            length += 4;
            break;
          case 39:
          case 34:
          case 13:
            length += 6;
            break;
          case 10:
          case 9:
            length += whitespace ? 6 : 1;
            break;
          default:
            ++length;
        }
      } else ++length;
    } else {
      if (normalize && this.m_Replacements.length) {
        const found = this.findXMLReplacement(input.subarray(i), count - i);
        if (found !== null) {
          const bytes = OUStringToOString(
            found.name.getStr().subarray(0, found.name.getLength()),
            RTL_TEXTENCODING_UTF8,
          );
          try {
            length += bytes.getLength();
          } finally {
            bytes.dispose();
          }
          i += found.replacement.getLength() - 1;
          continue;
        }
      }
      if (isHighSurrogate(c)) surrogate = c;
      else if (isLowSurrogate(c)) {
        if (surrogate) length += 4;
        surrogate = 0;
      } else if (c > 0x7ff) length += 3;
      else length += 2;
    }
    if (surrogate !== 0 && !isHighSurrogate(c)) surrogate = 0;
    length |= 0;
  }
  return length;
}
