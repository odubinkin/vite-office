/** @fileoverview ICU InputText owns the preprocessing buffer and borrows the source byte span. */
const BUFFER_SIZE = 8192;

/** Original charset-detection input and byte histogram. */
export class InputText {
  readonly fInputBytes = new Uint8Array(BUFFER_SIZE);
  readonly fByteStats = new Int16Array(256);
  fInputLen = 0;
  fC1Bytes = false;
  fRawInput: Uint8Array | null = null;
  fRawLength = 0;

  /** Original counted input setter and NUL-terminated length sentinel. @param input - Borrowed byte input. @param length - Native signed count. @returns Nothing. */
  setText(input: Uint8Array, length: number): void {
    this.fInputLen = 0;
    this.fC1Bytes = false;
    this.fRawInput = input;
    if (length === -1) {
      const nul = input.indexOf(0);
      this.fRawLength = nul === -1 ? input.length : nul;
    } else this.fRawLength = length;
  }

  /** Original distinction between unset and an empty source. @returns Whether input was set. */
  isSet(): boolean {
    return this.fRawInput !== null;
  }

  /** Original bounded markup filtering, fallback copy and C1-byte detection. @param stripTags - Native input filter flag. @returns Nothing. */
  MungeInput(stripTags: boolean): void {
    const input = this.fRawInput as Uint8Array;
    let openTags = 0;
    let badTags = 0;
    if (stripTags) {
      let output = 0;
      let inMarkup = false;
      for (let index = 0; index < this.fRawLength && output < BUFFER_SIZE; index++) {
        const byte = input[index] as number;
        if (byte === 0x3c) {
          if (inMarkup) badTags++;
          inMarkup = true;
          openTags++;
        }
        if (!inMarkup) this.fInputBytes[output++] = byte;
        if (byte === 0x3e) inMarkup = false;
      }
      this.fInputLen = output;
    }
    if (
      openTags < 5 ||
      Math.trunc(openTags / 5) < badTags ||
      (this.fInputLen < 100 && this.fRawLength > 600)
    ) {
      this.fInputLen = Math.min(this.fRawLength, BUFFER_SIZE);
      this.fInputBytes.set(input.subarray(0, this.fInputLen));
    }
    this.fByteStats.fill(0);
    for (let index = 0; index < this.fInputLen; index++) {
      const byte = this.fInputBytes[index] as number;
      this.fByteStats[byte] = (this.fByteStats[byte] as number) + 1;
    }
    for (let byte = 0x80; byte <= 0x9f; byte++) {
      if (this.fByteStats[byte] !== 0) {
        this.fC1Bytes = true;
        break;
      }
    }
  }
}
