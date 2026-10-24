/** @fileoverview Identifies real private FontFace registrations so preview resources never appear as document font families. */
const previews = new WeakSet<FontFace>();

/** Marks an actual private browser face by identity;this does not create or register a font. @param face - Actual constructed preview face. @returns Nothing. */
export function rememberBrowserFontPreviewFace(face: FontFace): void {
  previews.add(face);
}

/** Tests actual private-face identity without interpreting family names. @param face - Registered browser face. @returns Whether owned exclusively by preview painting. */
export function isBrowserFontPreviewFace(face: FontFace): boolean {
  return previews.has(face);
}
