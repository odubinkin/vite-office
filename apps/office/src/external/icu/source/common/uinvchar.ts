/** @fileoverview ICU78.3 UTF16 invariant-character predicate and counted ASCII-platform release conversion. EBCDIC machinery remains unported. */
const invariantChars = [0xfffffbff, 0xffffffe5, 0x87fffffe, 0x87fffffe];
/** Original counted or NUL-terminated UTF16 predicate; caller supplies the source span for nonnegative lengths. @param text - UTF16 pointer projection. @param length - Count or negative NUL-terminated mode. @returns Invariant repertoire only. */
export function uprv_isInvariantUString(text: string | null, length: number): boolean {
  length |= 0;
  for (let i = 0; ; ++i) {
    let c: number;
    if (length < 0) {
      c = i === (text as string).length ? 0 : (text as string).charCodeAt(i);
      if (c === 0) break;
    } else {
      if (length === 0) break;
      --length;
      c = (text as string).charCodeAt(i);
    }
    if (!(c <= 0x7f && ((invariantChars[c >> 5] as number) & (1 << (c & 0x1f))) !== 0))
      return false;
  }
  return true;
}

/** Original ASCII-platform u_UCharsToChars release path; non-invariant input becomes NUL. Native debug assertions and EBCDIC conversion are outside this binding. @param text - Readable counted UTF16 span. @param output - Writable narrow-byte span. @param length - Native int32 count. @returns Nothing. */
export function u_UCharsToChars(text: string | null, output: Uint8Array, length: number): void {
  length |= 0;
  for (let i = 0; length > 0; ++i, --length) {
    const c = (text as string).charCodeAt(i);
    output[i] = c <= 127 && ((invariantChars[c >> 5] as number) & (1 << (c & 31))) !== 0 ? c : 0;
  }
}
