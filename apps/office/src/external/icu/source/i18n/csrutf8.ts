/** @fileoverview ICU's original UTF-8 charset recognition, including its byte-sequence scoring. */
import type { CharsetMatch } from "./csmatch";
import { CharsetRecognizer } from "./csrecog";
import type { InputText } from "./inputext";

/** Original UTF-8 recognizer. */
export class CharsetRecog_UTF8 extends CharsetRecognizer {
  /** Original recognizer name. @returns Charset name. */
  override getName(): string {
    return "UTF-8";
  }

  /** Original lead/trail-byte scan and confidence decision. @param input - Native source input. @param result - Match slot. @returns Whether confidence is positive. */
  override match(input: InputText, result: CharsetMatch): boolean {
    const bytes = input.fRawInput as Uint8Array;
    const length = input.fRawLength;
    const hasBOM = length >= 3 && bytes[0] === 0xef && bytes[1] === 0xbb && bytes[2] === 0xbf;
    let valid = 0;
    let invalid = 0;
    for (let index = 0; index < length; index++) {
      let byte = bytes[index] as number;
      if ((byte & 0x80) === 0) continue;
      let trail: number;
      if ((byte & 0xe0) === 0xc0) trail = 1;
      else if ((byte & 0xf0) === 0xe0) trail = 2;
      else if ((byte & 0xf8) === 0xf0) trail = 3;
      else {
        invalid++;
        continue;
      }
      for (;;) {
        if (++index >= length) break;
        byte = bytes[index] as number;
        if ((byte & 0xc0) !== 0x80) {
          invalid++;
          break;
        }
        if (--trail === 0) {
          valid++;
          break;
        }
      }
    }
    let confidence = 0;
    if (hasBOM && invalid === 0) confidence = 100;
    else if (hasBOM && valid > invalid * 10) confidence = 80;
    else if (valid > 3 && invalid === 0) confidence = 100;
    else if (valid > 0 && invalid === 0) confidence = 80;
    else if (valid === 0 && invalid === 0) confidence = 15;
    else if (valid > invalid * 10) confidence = 25;
    result.set(input, this, confidence);
    return confidence > 0;
  }
}
