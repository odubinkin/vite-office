/** @fileoverview Original complete fixed Unicode3.1.1 text-conversion predicates from unichars.cxx;no host Unicode category substitution. */
/** Original ImplIsControlOrFormat predicate,including legacy explicit code points. @param nUtf32 - Native unsigned32 value. @returns Original classification. */
export function ImplIsControlOrFormat(nUtf32: number): boolean {
  nUtf32 >>>= 0;
  // All code points of
  // <http://www.unicode.org/Public/UNIDATA/UnicodeData.txt>, Version 3.1.1,
  // that have a General Category of Cc (Other, Control) or Cf (Other,
  // Format):
  return (
    nUtf32 <= 0x001f ||
    (nUtf32 >= 0x007f && nUtf32 <= 0x009f) ||
    nUtf32 == 0x070f || // SYRIAC ABBREVIATION MARK
    nUtf32 == 0x180b || // MONGOLIAN FREE VARIATION SELECTOR ONE
    nUtf32 == 0x180c || // MONGOLIAN FREE VARIATION SELECTOR TWO
    nUtf32 == 0x180d || // MONGOLIAN FREE VARIATION SELECTOR THREE
    nUtf32 == 0x180e || // MONGOLIAN VOWEL SEPARATOR
    nUtf32 == 0x200c || // ZERO WIDTH NON-JOINER
    nUtf32 == 0x200d || // ZERO WIDTH JOINER
    nUtf32 == 0x200e || // LEFT-TO-RIGHT MARK
    nUtf32 == 0x200f || // RIGHT-TO-LEFT MARK
    nUtf32 == 0x202a || // LEFT-TO-RIGHT EMBEDDING
    nUtf32 == 0x202b || // RIGHT-TO-LEFT EMBEDDING
    nUtf32 == 0x202c || // POP DIRECTIONAL FORMATTING
    nUtf32 == 0x202d || // LEFT-TO-RIGHT OVERRIDE
    nUtf32 == 0x202e || // RIGHT-TO-LEFT OVERRIDE
    nUtf32 == 0x206a || // INHIBIT SYMMETRIC SWAPPING
    nUtf32 == 0x206b || // ACTIVATE SYMMETRIC SWAPPING
    nUtf32 == 0x206c || // INHIBIT ARABIC FORM SHAPING
    nUtf32 == 0x206d || // ACTIVATE ARABIC FORM SHAPING
    nUtf32 == 0x206e || // NATIONAL DIGIT SHAPES
    nUtf32 == 0x206f || // NOMINAL DIGIT SHAPES
    nUtf32 == 0xfeff || // ZERO WIDTH NO-BREAK SPACE
    nUtf32 == 0xfff9 || // INTERLINEAR ANNOTATION ANCHOR
    nUtf32 == 0xfffa || // INTERLINEAR ANNOTATION SEPARATOR
    nUtf32 == 0xfffb || // INTERLINEAR ANNOTATION TERMINATOR
    nUtf32 == 0x1d173 || // MUSICAL SYMBOL BEGIN BEAM
    nUtf32 == 0x1d174 || // MUSICAL SYMBOL END BEAM
    nUtf32 == 0x1d175 || // MUSICAL SYMBOL BEGIN TIE
    nUtf32 == 0x1d176 || // MUSICAL SYMBOL END TIE
    nUtf32 == 0x1d177 || // MUSICAL SYMBOL BEGIN SLUR
    nUtf32 == 0x1d178 || // MUSICAL SYMBOL END SLUR
    nUtf32 == 0x1d179 || // MUSICAL SYMBOL BEGIN PHRASE
    nUtf32 == 0x1d17a || // MUSICAL SYMBOL END PHRASE
    nUtf32 == 0xe0001 || // LANGUAGE TAG
    (nUtf32 >= 0xe0020 && nUtf32 <= 0xe007f)
  );
}
/** Original ImplIsPrivateUse predicate,including legacy explicit code points. @param nUtf32 - Native unsigned32 value. @returns Original classification. */
export function ImplIsPrivateUse(nUtf32: number): boolean {
  nUtf32 >>>= 0;
  // All code points of
  // <http://www.unicode.org/Public/UNIDATA/UnicodeData.txt>, Version 3.1.1,
  // that have a General Category of Co (Other, Private Use):
  return (
    (nUtf32 >= 0xe000 && nUtf32 <= 0xf8ff) ||
    (nUtf32 >= 0xf0000 && nUtf32 <= 0xffffd) ||
    (nUtf32 >= 0x100000 && nUtf32 <= 0x10fffd)
  );
}
/** Original ImplIsZeroWidth predicate,including legacy explicit code points. @param nUtf32 - Native unsigned32 value. @returns Original classification. */
export function ImplIsZeroWidth(nUtf32: number): boolean {
  nUtf32 >>>= 0;
  // All code points of
  // <http://www.unicode.org/Public/UNIDATA/UnicodeData.txt>, Version 3.1.1,
  // that have "ZERO WIDTH" in their Character name:
  return (
    nUtf32 == 0x200b || // ZERO WIDTH SPACE
    nUtf32 == 0x200c || // ZERO WIDTH NON-JOINER
    nUtf32 == 0x200d || // ZERO WIDTH JOINER
    nUtf32 == 0xfeff
  ); // ZERO WIDTH NO-BREAK SPACE
}
