/** @fileoverview Resolves browser fallback families without changing Writer's stored font name. */

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
