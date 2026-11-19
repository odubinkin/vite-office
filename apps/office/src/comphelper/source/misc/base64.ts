/** @fileoverview Calc's shared comphelper Base64 sequence conversion. */
const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";

/** Decodes complete quartets with the native table and padding rules. @param source - XML base64 text. @returns Decoded bytes. */
export function decodeBase64(source: string): Uint8Array {
  const bytes = new Uint8Array(Math.floor(source.length / 4) * 3);
  let count = 0;
  let bits = 0;
  let padding = 0;
  let written = 0;
  for (const char of source) {
    const digit = char === "=" || char.charCodeAt(0) === 96 ? 0 : alphabet.indexOf(char);
    if (digit < 0) continue;
    bits = (bits << 6) | digit;
    ++count;
    if (char === "=" && count > 2) ++padding;
    if (count === 4) {
      bytes[written++] = bits >>> 16;
      if (padding < 2) bytes[written++] = bits >>> 8;
      if (padding === 0) bytes[written++] = bits;
      count = bits = padding = 0;
    }
  }
  return bytes.slice(0, written);
}

/** Encodes through the host's equivalent standard padded Base64 operation. @param bytes - Native digest bytes. @returns Encoded text. */
export function encodeBase64(bytes: Uint8Array): string {
  let raw = "";
  for (const byte of bytes) raw += String.fromCharCode(byte);
  return btoa(raw);
}
