/** @fileoverview Managed byte-value form of liblangtag lt-tag.c's private scanner.
 * Copyright (C) 2011–2015 Akira TAGOH. SPDX-License-Identifier: MPL-2.0
 */

/** Original lt-error.h codes consumed by the scanner. */
export enum ScannerErrorCode {
  LT_ERR_EOT = 3,
  LT_ERR_FAIL_ON_SCANNER = 4,
}

/** Native scanner error value, without reference-counted ownership. */
export interface ScannerError {
  readonly code: ScannerErrorCode;
  readonly message: string;
}

/** Caller-owned token and byte-length output slots. */
export interface ScannerOutput {
  token: string | null;
  length: number;
}

/** Caller-owned optional error output, unchanged after successful scanning. */
export interface ScannerErrorSlot {
  error: ScannerError | null;
}

/** Private source scanner state; input is already encoded bytes, as at UTF8.getStr(). */
export class TagScanner {
  readonly #string: Uint8Array;
  #position = 0;

  /** Copies the C-string prefix. @param tag - Input bytes; first NUL terminates the value. @returns Managed scanner. */
  constructor(tag: Uint8Array) {
    const end = tag.indexOf(0);
    this.#string = tag.slice(0, end < 0 ? tag.length : end);
  }

  /** Reports native exhaustion. @returns Whether all prefix bytes were consumed. */
  isEof(): boolean {
    return this.#position >= this.#string.length;
  }

  /** Reads one native token. @param output - Token/length slots. @param error - Optional error slot. @returns Native success flag. */
  getToken(output: ScannerOutput, error?: ScannerErrorSlot): boolean {
    let token = "";
    if (this.isEof())
      return this.#fail(output, error, ScannerErrorCode.LT_ERR_EOT, "No more tokens in buffer");
    while (this.#position < this.#string.length) {
      const byte = this.#string[this.#position++] as number,
        c = String.fromCharCode(byte);
      if (c === "*") {
        if (token.length > 0)
          return this.#fail(
            output,
            error,
            ScannerErrorCode.LT_ERR_FAIL_ON_SCANNER,
            `Invalid wildcard: position = ${this.#position - 1}`,
          );
      } else if (!/^[A-Za-z0-9]$/.test(c) && c !== "-") {
        return this.#fail(
          output,
          error,
          ScannerErrorCode.LT_ERR_FAIL_ON_SCANNER,
          `Invalid character for tag: '${c}'`,
        );
      }
      token += c;
      if (c === "-" || c === "*") break;
      if (this.#string[this.#position] === 45 || this.isEof()) break;
    }
    output.token = token;
    output.length = token.length;
    return true;
  }

  /** Writes the native failure outputs. @param output - Token/length slots. @param error - Optional error slot. @param code - Native code. @param message - Diagnostic byte value. @returns False. */
  #fail(
    output: ScannerOutput,
    error: ScannerErrorSlot | undefined,
    code: ScannerErrorCode,
    message: string,
  ): false {
    if (error) error.error = { code, message };
    output.token = null;
    output.length = 0;
    return false;
  }
}
