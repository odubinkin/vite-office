/** @fileoverview ICU's original ISO-2022 escape-sequence recognizers. */
import data from "./csr2022.tables.json" with { type: "json" };
import type { CharsetMatch } from "./csmatch";
import { CharsetRecognizer } from "./csrecog";
import type { InputText } from "./inputext";

/** Original common matcher over the preprocessed text and counted source escape table. */
abstract class CharsetRecog_2022 extends CharsetRecognizer {
  /** Binds the concrete source escape table. @param escapes - Original NUL-terminated rows. @returns Recognizer. */
  constructor(private readonly escapes: readonly (readonly number[])[]) {
    super();
  }

  /** Original recognized escapes and shifts scoring, with integer division. @param bytes - Preprocessed bytes. @param length - Active byte count. @returns Confidence. */
  private match_2022(bytes: Uint8Array, length: number): number {
    let hits = 0;
    let misses = 0;
    let shifts = 0;
    scanInput: for (let index = 0; index < length; index++) {
      if (bytes[index] === 0x1b) {
        checkEscapes: for (const escape of this.escapes) {
          const count = escape.indexOf(0);
          if (length - index < count) continue;
          for (let offset = 1; offset < count; offset++)
            if (escape[offset] !== bytes[index + offset]) continue checkEscapes;
          hits++;
          index += count - 1;
          continue scanInput;
        }
        misses++;
      }
      if (bytes[index] === 0x0e || bytes[index] === 0x0f) shifts++;
    }
    if (hits === 0) return 0;
    let confidence = Math.trunc((100 * hits - 100 * misses) / (hits + misses));
    if (hits + shifts < 5) confidence -= (5 - (hits + shifts)) * 10;
    return Math.max(confidence, 0);
  }

  /** Original variant matching uses the preprocessed input. @param input - Actual input. @param result - Match slot. @returns Whether confidence is positive. */
  override match(input: InputText, result: CharsetMatch): boolean {
    const confidence = this.match_2022(input.fInputBytes, input.fInputLen);
    result.set(input, this, confidence);
    return confidence > 0;
  }
}

/** Original ISO-2022-JP recognizer. */
export class CharsetRecog_2022JP extends CharsetRecog_2022 {
  /** Uses the native JP escape sequences. @returns Recognizer. */
  constructor() {
    super(data.tables.escapeSequences_2022JP);
  }
  /** Original charset identity. @returns Charset name. */
  override getName(): string {
    return "ISO-2022-JP";
  }
}

/** Original ISO-2022-KR recognizer. */
export class CharsetRecog_2022KR extends CharsetRecog_2022 {
  /** Uses the native KR escape sequences. @returns Recognizer. */
  constructor() {
    super(data.tables.escapeSequences_2022KR);
  }
  /** Original charset identity. @returns Charset name. */
  override getName(): string {
    return "ISO-2022-KR";
  }
}

/** Original ISO-2022-CN recognizer. */
export class CharsetRecog_2022CN extends CharsetRecog_2022 {
  /** Uses the native CN escape sequences. @returns Recognizer. */
  constructor() {
    super(data.tables.escapeSequences_2022CN);
  }
  /** Original charset identity. @returns Charset name. */
  override getName(): string {
    return "ISO-2022-CN";
  }
}
