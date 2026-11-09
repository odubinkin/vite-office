/** @fileoverview ICU's original multibyte charset recognizers and occurrence scoring. */
import data from "./csrmbcs.tables.json";
import type { CharsetMatch } from "./csmatch";
import { CharsetRecognizer } from "./csrecog";
import type { InputText } from "./inputext";

/** Original binary search for a 16-bit character in its frequency table. @param array - Sorted source values. @param value - Native character value. @returns Index or minus one. */
function binarySearch(array: readonly number[], value: number): number {
  let first = 0;
  let last = array.length - 1;
  while (first <= last) {
    const middle = Math.trunc((first + last) / 2);
    const entry = array[middle] as number;
    if (entry === value) return middle;
    if (entry < value) first = middle + 1;
    else last = middle - 1;
  }
  return -1;
}

/** Original byte cursor and decoded character state. */
class IteratedChar {
  charValue = 0;
  index = -1;
  nextIndex = 0;
  error = false;
  done = false;

  /** Original next byte with a negative end sentinel. @param input - Raw source text. @returns Byte or minus one. */
  nextByte(input: InputText): number {
    if (this.nextIndex >= input.fRawLength) {
      this.done = true;
      return -1;
    }
    return (input.fRawInput as Uint8Array)[this.nextIndex++] as number;
  }
}

/** Original multibyte matcher with the concrete variant's byte parser. */
abstract class CharsetRecog_mbcs extends CharsetRecognizer {
  /** Binds the native charset identity and its frequency table. @param name - Charset name. @param language - Native language. @param commonChars - Original frequency table. @returns Recognizer. */
  constructor(
    private readonly name: string,
    private readonly language: string,
    private readonly commonChars: readonly number[] | null,
  ) {
    super();
  }

  /** Original registered name. @returns Charset name. */
  override getName(): string {
    return this.name;
  }

  /** Original registered language. @returns Language ID. */
  override getLanguage(): string {
    return this.language;
  }

  /** Original byte parser for the concrete charset. @param iter - Actual iterator. @param input - Raw source text. @returns Whether a character was admitted. */
  protected abstract nextChar(iter: IteratedChar, input: InputText): boolean;

  /** Original score over valid, common and invalid multibyte sequences. @param input - Native input. @returns Confidence. */
  private match_mbcs(input: InputText): number {
    let doubleByte = 0;
    let common = 0;
    let bad = 0;
    let total = 0;
    const iter = new IteratedChar();
    while (this.nextChar(iter, input)) {
      total++;
      if (iter.error) bad++;
      else if (iter.charValue > 0xff) {
        doubleByte++;
        if (this.commonChars && binarySearch(this.commonChars, iter.charValue & 0xffff) >= 0)
          common++;
      }
      if (bad >= 2 && bad * 5 >= doubleByte) return 0;
    }
    if (doubleByte <= 10 && bad === 0) return doubleByte === 0 && total < 10 ? 0 : 10;
    if (doubleByte < 20 * bad) return 0;
    let confidence: number;
    if (this.commonChars) {
      const maxVal = Math.log(doubleByte / 4);
      const scaleFactor = 90 / maxVal;
      confidence = Math.trunc(Math.log(common + 1) * scaleFactor + 10);
    } else confidence = 30 + doubleByte - 20 * bad;
    return Math.max(0, Math.min(100, confidence));
  }

  /** Original match wrapper writes a result even when the confidence is zero. @param input - Native input. @param result - Actual output slot. @returns Whether confidence is positive. */
  override match(input: InputText, result: CharsetMatch): boolean {
    const confidence = this.match_mbcs(input);
    result.set(input, this, confidence);
    return confidence > 0;
  }
}

/** Original Shift_JIS recognizer. */
export class CharsetRecog_sjis extends CharsetRecog_mbcs {
  /** Binds the original data. @returns Recognizer. */
  constructor() {
    super("Shift_JIS", "ja", data.tables.commonChars_sjis);
  }

  /** Original Shift_JIS next-character byte admission. @param iter - Actual iterator. @param input - Raw source text. @returns Whether a character was read. */
  protected override nextChar(iter: IteratedChar, input: InputText): boolean {
    iter.index = iter.nextIndex;
    iter.error = false;
    const first = (iter.charValue = iter.nextByte(input));
    if (first < 0) return false;
    if (first <= 0x7f || (first > 0xa0 && first <= 0xdf)) return true;
    const second = iter.nextByte(input);
    if (second >= 0) iter.charValue = (first << 8) | second;
    if (!((second >= 0x40 && second <= 0x7f) || (second >= 0x80 && second <= 0xfe)))
      iter.error = true;
    return true;
  }
}

/** Original common EUC byte parser. */
abstract class CharsetRecog_euc extends CharsetRecog_mbcs {
  /** Original EUC code-set and byte-boundary decisions. @param iter - Actual iterator. @param input - Raw source text. @returns Whether a character was read. */
  protected override nextChar(iter: IteratedChar, input: InputText): boolean {
    iter.index = iter.nextIndex;
    iter.error = false;
    const first = (iter.charValue = iter.nextByte(input));
    if (first < 0) return false;
    if (first <= 0x8d) return true;
    const second = iter.nextByte(input);
    if (second >= 0) iter.charValue = (iter.charValue << 8) | second;
    if ((first >= 0xa1 && first <= 0xfe) || first === 0x8e) {
      if (second < 0xa1) iter.error = true;
      return true;
    }
    if (first === 0x8f) {
      const third = iter.nextByte(input);
      iter.charValue = ((iter.charValue << 8) | third) >>> 0;
      if (third < 0xa1) iter.error = true;
    }
    return true;
  }
}

/** Original EUC-JP recognizer. */
export class CharsetRecog_euc_jp extends CharsetRecog_euc {
  /** Binds the original Japanese occurrence table. @returns Recognizer. */
  constructor() {
    super("EUC-JP", "ja", data.tables.commonChars_euc_jp);
  }
}

/** Original EUC-KR recognizer. */
export class CharsetRecog_euc_kr extends CharsetRecog_euc {
  /** Binds the original Korean occurrence table. @returns Recognizer. */
  constructor() {
    super("EUC-KR", "ko", data.tables.commonChars_euc_kr);
  }
}

/** Original Big5 recognizer. */
export class CharsetRecog_big5 extends CharsetRecog_mbcs {
  /** Binds the original Big5 occurrence table. @returns Recognizer. */
  constructor() {
    super("Big5", "zh", data.tables.commonChars_big5);
  }

  /** Original Big5 next-character byte admission. @param iter - Actual iterator. @param input - Raw source text. @returns Whether a character was read. */
  protected override nextChar(iter: IteratedChar, input: InputText): boolean {
    iter.index = iter.nextIndex;
    iter.error = false;
    const first = (iter.charValue = iter.nextByte(input));
    if (first < 0) return false;
    if (first <= 0x7f || first === 0xff) return true;
    const second = iter.nextByte(input);
    if (second >= 0) iter.charValue = (iter.charValue << 8) | second;
    if (second < 0x40 || second === 0x7f || second === 0xff) iter.error = true;
    return true;
  }
}

/** Original GB18030 recognizer. */
export class CharsetRecog_gb_18030 extends CharsetRecog_mbcs {
  /** Binds the original GB18030 occurrence table. @returns Recognizer. */
  constructor() {
    super("GB18030", "zh", data.tables.commonChars_gb_18030);
  }

  /** Original GB18030 next-character byte decisions including the source decimal threshold. @param iter - Actual iterator. @param input - Raw source text. @returns Whether a character was read. */
  protected override nextChar(iter: IteratedChar, input: InputText): boolean {
    iter.index = iter.nextIndex;
    iter.error = false;
    const first = (iter.charValue = iter.nextByte(input));
    if (first < 0) return false;
    if (first <= 0x80) return true;
    const second = iter.nextByte(input);
    if (second >= 0) iter.charValue = (iter.charValue << 8) | second;
    if (first >= 0x81 && first <= 0xfe) {
      if ((second >= 0x40 && second <= 0x7e) || (second >= 80 && second <= 0xfe)) return true;
      if (second >= 0x30 && second <= 0x39) {
        const third = iter.nextByte(input);
        if (third >= 0x81 && third <= 0xfe) {
          const fourth = iter.nextByte(input);
          if (fourth >= 0x30 && fourth <= 0x39) {
            iter.charValue = ((iter.charValue << 16) | (third << 8) | fourth) >>> 0;
            return true;
          }
        }
      }
      iter.error = true;
    }
    return true;
  }
}
