/** @fileoverview ICU CharsetMatch result state used by the charset detection API. */
import type { CharsetRecognizer } from "./csrecog";
import type { InputText } from "./inputext";

/** Original mutable match slot, initialized before detection. */
export class CharsetMatch {
  private confidence = 0;
  private fCharsetName: string | null = null;
  private fLang: string | null = null;

  /** Original result assignment with recognizer defaults. @param input - Native input for optional character conversion. @param recognizer - Original recognizer. @param confidence - Calculated confidence. @param name - Optional result-specific name. @param language - Optional result-specific language. @returns Nothing. */
  set(
    input: InputText,
    recognizer: CharsetRecognizer | null,
    confidence: number,
    name: string | null = null,
    language: string | null = null,
  ): void {
    void input;
    this.confidence = confidence;
    this.fCharsetName = name ?? recognizer?.getName() ?? null;
    this.fLang = language ?? recognizer?.getLanguage() ?? null;
  }

  /** Original match name. @returns Registered name or null. */
  getName(): string | null {
    return this.fCharsetName;
  }

  /** Original match language. @returns Native language or null. */
  getLanguage(): string | null {
    return this.fLang;
  }

  /** Original match confidence. @returns Native confidence. */
  getConfidence(): number {
    return this.confidence;
  }
}
