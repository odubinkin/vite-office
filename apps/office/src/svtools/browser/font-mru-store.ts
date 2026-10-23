/** @fileoverview Browser profile storage for the native fontnameboxmruentries logical file;expected browser storage denial follows native failed-file-open no-op behavior. */
import { decodeFontMruEntries, encodeFontMruEntries } from "../source/control/ctrlbox.fontmru";
/** One common profile entry is shared by Writer and Calc,like the source user/config file. */
export const FONT_MRU_STORAGE_KEY = "libreoffice.fontnameboxmruentries";
/** Tests actual browser I/O failures only;programming errors are not swallowed. @param error - Actual thrown value. @returns Expected unavailable-store condition. */
function unavailable(error: unknown): boolean {
  return (
    error instanceof DOMException &&
    (error.name === "SecurityError" || error.name === "QuotaExceededError")
  );
}
/** Reads the source logical file from the browser profile. @param window_ - Actual browser host. @returns Decoded names or no saved entries. */
export function readFontMruEntries(window_: Window = window): string[] {
  try {
    const text = window_.localStorage.getItem(FONT_MRU_STORAGE_KEY);
    return text === null ? [] : decodeFontMruEntries(text);
  } catch (error) {
    if (!unavailable(error)) throw error;
    return [];
  }
}
/** Saves nonempty native MRU data;empty state preserves an existing profile value. @param entries - Native nonempty recent names. @param window_ - Actual browser host. @returns Nothing. */
export function saveFontMruEntries(entries: readonly string[], window_: Window = window): void {
  const text = encodeFontMruEntries(entries);
  if (text === undefined) return;
  try {
    window_.localStorage.setItem(FONT_MRU_STORAGE_KEY, text);
  } catch (error) {
    if (!unavailable(error)) throw error;
  }
}
