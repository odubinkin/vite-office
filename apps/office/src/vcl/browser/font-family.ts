/** @fileoverview Resolves browser fallback families without changing the native stored font name. */

/** Applies a generic-family fallback after the requested physical face. @param family - Requested font family. @param generic - ODF generic family. @returns Browser font-family value. */
export function browserFontFamily(
  family: string | undefined,
  generic: string | undefined,
): string | undefined {
  if (family === undefined) return undefined;
  switch (generic?.toLowerCase()) {
    case "roman":
      return `${family}, Liberation Serif, serif`;
    case "swiss":
      return `${family}, Liberation Sans, sans-serif`;
    case "modern":
      return `${family}, Liberation Mono, monospace`;
    default:
      return family;
  }
}

/** Decodes the browser's valid CSS family serialization, including CSS code-point escapes and line continuations. @param descriptor - FontFace.family. @returns Actual registered family name. */
export function decodeBrowserFontFamily(descriptor: string): string {
  const quoted =
    (descriptor.startsWith('"') && descriptor.endsWith('"')) ||
    (descriptor.startsWith("'") && descriptor.endsWith("'"));
  const value = quoted ? descriptor.slice(1, -1) : descriptor;
  return value.replace(
    /\\(?:([0-9a-fA-F]{1,6})(?:\r\n|[ \t\r\n\f])?|\r\n|[\n\r\f]|(.))/g,
    /** Decodes one CSS escape from the platform descriptor. @param _match - Complete escape. @param hex - Optional hexadecimal value. @param escaped - Optional simple escape. @returns Decoded value. */ (
      _match,
      hex: string | undefined,
      escaped: string | undefined,
    ) => {
      if (hex === undefined) return escaped ?? "";
      const point = Number.parseInt(hex, 16);
      return String.fromCodePoint(
        point === 0 || point > 0x10ffff || (point >= 0xd800 && point <= 0xdfff) ? 0xfffd : point,
      );
    },
  );
}
