/** @fileoverview Original ICU C charset-detection entry points over the actual detector and match owners. */
import { U_FAILURE, type UErrorCode } from "../common/unicode/utypes";
import { CharsetDetector } from "./csdetect";
import type { UCharsetDetector, UCharsetMatch } from "./unicode/ucsdet";

/** Original successful-status detector construction. @param status - Mutable ICU status. @returns Detector or null. */
export function ucsdet_open(status: [UErrorCode]): UCharsetDetector | null {
  return U_FAILURE(status[0]) ? null : new CharsetDetector();
}

/** Original detector deletion including null. @param detector - Owned handle. @returns Nothing. */
export function ucsdet_close(detector: UCharsetDetector | null): void {
  detector?.dispose();
}

/** Original counted byte input forwarding. @param detector - Actual detector. @param input - Borrowed input bytes. @param length - Native byte count. @param status - Mutable ICU status. @returns Nothing. */
export function ucsdet_setText(
  detector: UCharsetDetector,
  input: Uint8Array,
  length: number,
  status: [UErrorCode],
): void {
  if (!U_FAILURE(status[0])) detector.setText(input, length);
}

/** Original best match with incoming-status gate. @param detector - Actual detector. @param status - Mutable ICU status. @returns Borrowed match or null. */
export function ucsdet_detect(
  detector: UCharsetDetector,
  status: [UErrorCode],
): UCharsetMatch | null {
  return U_FAILURE(status[0]) ? null : detector.detect(status);
}

/** Original all-match getter with incoming-status gate. @param detector - Actual detector. @param count - Out match count. @param status - Mutable ICU status. @returns Borrowed match storage or null. */
export function ucsdet_detectAll(
  detector: UCharsetDetector,
  count: [number],
  status: [UErrorCode],
): readonly UCharsetMatch[] | null {
  return U_FAILURE(status[0]) ? null : detector.detectAll(count, status);
}

/** Original charset-name getter with incoming-status gate. @param match - Actual match. @param status - Mutable ICU status. @returns Registered name or null. */
export function ucsdet_getName(match: UCharsetMatch, status: [UErrorCode]): string | null {
  return U_FAILURE(status[0]) ? null : match.getName();
}

/** Original language getter with incoming-status gate. @param match - Actual match. @param status - Mutable ICU status. @returns Language ID or null. */
export function ucsdet_getLanguage(match: UCharsetMatch, status: [UErrorCode]): string | null {
  return U_FAILURE(status[0]) ? null : match.getLanguage();
}

/** Original confidence getter with incoming-status gate. @param match - Actual match. @param status - Mutable ICU status. @returns Confidence or zero. */
export function ucsdet_getConfidence(match: UCharsetMatch, status: [UErrorCode]): number {
  return U_FAILURE(status[0]) ? 0 : match.getConfidence();
}

/** Original input-filter getter. @param detector - Actual detector or null. @returns Filter status. */
export function ucsdet_isInputFilterEnabled(detector: UCharsetDetector | null): boolean {
  return detector?.getStripTagsFlag() ?? false;
}

/** Original input-filter setter. @param detector - Actual detector or null. @param enabled - New flag. @returns Prior flag, or false for null. */
export function ucsdet_enableInputFilter(
  detector: UCharsetDetector | null,
  enabled: boolean,
): boolean {
  return detector?.setStripTagsFlag(enabled) ?? false;
}
