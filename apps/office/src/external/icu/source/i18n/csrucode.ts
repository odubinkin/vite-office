/** @fileoverview ICU's original UTF-16 and UTF-32 charset recognizers. */
import type { CharsetMatch } from "./csmatch";
import { CharsetRecognizer } from "./csrecog";
import type { InputText } from "./inputext";

/** Original UTF-16 confidence adjustment for one code unit. @param unit - Native code unit. @param confidence - Current score. @returns Clamped score. */
function adjustConfidence(unit: number, confidence: number): number {
  if (unit === 0) confidence -= 10;
  else if ((unit >= 0x20 && unit <= 0xff) || unit === 0x0a) confidence += 10;
  return Math.max(0, Math.min(100, confidence));
}

/** Shared byte scan for the two original UTF-16 endian recognizers. */
abstract class CharsetRecog_UTF_16 extends CharsetRecognizer {
  /** Selects the concrete native endian variant. @param littleEndian - Original byte order. @returns Recognizer. */
  constructor(private readonly littleEndian: boolean) {
    super();
  }

  /** Original UTF-16 scan over at most 30 raw bytes. @param input - Original input. @param result - Output match slot. @returns Whether confidence is positive. */
  override match(input: InputText, result: CharsetMatch): boolean {
    const bytes = input.fRawInput as Uint8Array;
    const length = input.fRawLength;
    const count = Math.min(length, 30);
    let confidence = 10;
    for (let index = 0; index < count - 1; index += 2) {
      const first = bytes[index] as number;
      const second = bytes[index + 1] as number;
      const unit = this.littleEndian ? first | (second << 8) : (first << 8) | second;
      if (index === 0 && unit === 0xfeff) {
        confidence = this.littleEndian && length >= 4 && bytes[2] === 0 && bytes[3] === 0 ? 0 : 100;
        break;
      }
      confidence = adjustConfidence(unit, confidence);
      if (confidence === 0 || confidence === 100) break;
    }
    if (count < 4 && confidence < 100) confidence = 0;
    result.set(input, this, confidence);
    return confidence > 0;
  }
}

/** Original UTF-16BE recognizer. */
export class CharsetRecog_UTF_16_BE extends CharsetRecog_UTF_16 {
  /** Original big-endian dispatch. @returns Recognizer. */
  constructor() {
    super(false);
  }

  /** Original registered name. @returns Charset name. */
  override getName(): string {
    return "UTF-16BE";
  }
}

/** Original UTF-16LE recognizer. */
export class CharsetRecog_UTF_16_LE extends CharsetRecog_UTF_16 {
  /** Original little-endian dispatch. @returns Recognizer. */
  constructor() {
    super(true);
  }

  /** Original registered name. @returns Charset name. */
  override getName(): string {
    return "UTF-16LE";
  }
}

/** Original UTF-32 base matching logic. */
abstract class CharsetRecog_UTF_32 extends CharsetRecognizer {
  /** Original endian-dependent raw assembly. @param input - Raw bytes. @param index - Byte offset. @returns Signed 32-bit value. */
  protected abstract getChar(input: Uint8Array, index: number): number;

  /** Original UTF-32 matching, retaining the source scalar boundary. @param input - Native input. @param result - Output match slot. @returns Whether confidence is positive. */
  override match(input: InputText, result: CharsetMatch): boolean {
    const bytes = input.fRawInput as Uint8Array;
    const limit = Math.trunc(input.fRawLength / 4) * 4;
    const hasBOM = limit > 0 && this.getChar(bytes, 0) === 0xfeff;
    let valid = 0;
    let invalid = 0;
    for (let index = 0; index < limit; index += 4) {
      const value = this.getChar(bytes, index);
      if (value < 0 || value >= 0x10ffff || (value >= 0xd800 && value <= 0xdfff)) invalid++;
      else valid++;
    }
    let confidence = 0;
    if (hasBOM && invalid === 0) confidence = 100;
    else if (hasBOM && valid > invalid * 10) confidence = 80;
    else if (valid > 3 && invalid === 0) confidence = 100;
    else if (valid > 0 && invalid === 0) confidence = 80;
    else if (valid > invalid * 10) confidence = 25;
    result.set(input, this, confidence);
    return confidence > 0;
  }
}

/** Original UTF-32BE recognizer. */
export class CharsetRecog_UTF_32_BE extends CharsetRecog_UTF_32 {
  /** Original registered name. @returns Charset name. */
  override getName(): string {
    return "UTF-32BE";
  }

  /** Original signed big-endian byte assembly. @param input - Raw bytes. @param index - Byte offset. @returns Signed unit. */
  protected override getChar(input: Uint8Array, index: number): number {
    return (
      ((input[index] as number) << 24) |
      ((input[index + 1] as number) << 16) |
      ((input[index + 2] as number) << 8) |
      (input[index + 3] as number)
    );
  }
}

/** Original UTF-32LE recognizer. */
export class CharsetRecog_UTF_32_LE extends CharsetRecog_UTF_32 {
  /** Original registered name. @returns Charset name. */
  override getName(): string {
    return "UTF-32LE";
  }

  /** Original signed little-endian byte assembly. @param input - Raw bytes. @param index - Byte offset. @returns Signed unit. */
  protected override getChar(input: Uint8Array, index: number): number {
    return (
      ((input[index + 3] as number) << 24) |
      ((input[index + 2] as number) << 16) |
      ((input[index + 1] as number) << 8) |
      (input[index] as number)
    );
  }
}
