/** @fileoverview Original ICU CharsetRecognizer virtual name and match contract. */
import type { CharsetMatch } from "./csmatch";
import type { InputText } from "./inputext";

/** Actual recognizer interface used by the native detector. */
export abstract class CharsetRecognizer {
  /** Original charset name. @returns Registered name. */
  abstract getName(): string;

  /** Original base language value. @returns Empty language string. */
  getLanguage(): string {
    return "";
  }

  /** Original matcher over raw and preprocessed bytes. @param input - Actual input. @param result - Output match slot. @returns Whether confidence is positive. */
  abstract match(input: InputText, result: CharsetMatch): boolean;
}
