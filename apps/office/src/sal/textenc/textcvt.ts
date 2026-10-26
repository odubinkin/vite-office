/** @fileoverview Missing-converter fallback from sal/textenc/textcvt.cxx under the default OString/OUString conversion flags. */

/** The source ImplDummyToUnicode preserves each source byte as the same UTF-16 value. @param source - Borrowed input bytes. @returns Converted text. */
export function ImplDummyToUnicode(source: Uint8Array): string {
  let result = "";
  for (let i = 0; i < source.length; i += 1024)
    result += String.fromCharCode(...source.subarray(i, i + 1024));
  return result;
}

/** The source ImplUnicodeToDummy truncates each UTF-16 code unit to its low byte. @param source - Input UTF-16 text. @returns Converted bytes. */
export function ImplUnicodeToDummy(source: string): Uint8Array {
  const result = new Uint8Array(source.length);
  for (let i = 0; i < source.length; i++) result[i] = source.charCodeAt(i) & 0xff;
  return result;
}
