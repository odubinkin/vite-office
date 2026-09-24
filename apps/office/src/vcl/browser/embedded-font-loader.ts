/** @fileoverview Browser FontFace adapter for package-backed Writer fonts, bounded by SwXMLReader. */

/** Browser-facing subset of a package-backed font resource. */
export interface BrowserEmbeddedFont {
  readonly familyName: string;
  readonly style: "normal" | "italic";
  readonly weight: "normal" | "bold";
  readonly bytes?: Uint8Array;
  readonly canLoad?: boolean;
}

/** Installs viewable document fonts and returns a revocation callback. @param fonts - Validated package resources. @param fontSet - Browser font collection. @param FontFaceClass - Browser constructor. @param onChange - Availability callback. @returns Cleanup callback. */
export function installWriterEmbeddedFonts(
  fonts: readonly BrowserEmbeddedFont[],
  fontSet: FontFaceSet | undefined = globalThis.document?.fonts,
  FontFaceClass: typeof FontFace | undefined = globalThis.FontFace,
  onChange?: (family: string, available: boolean) => void,
): () => void {
  if (fontSet === undefined || FontFaceClass === undefined) {
    for (const font of fonts) onChange?.(font.familyName, false);
    return /** No browser font API needs no revocation. @returns Nothing. */ () => undefined;
  }
  let active = true;
  const installed: FontFace[] = [];
  for (const font of fonts) {
    if (!font.canLoad || font.bytes === undefined) {
      onChange?.(font.familyName, false);
      continue;
    }
    const face = new FontFaceClass(font.familyName, font.bytes.slice().buffer as ArrayBuffer, {
      style: font.style,
      weight: font.weight,
    });
    void face.load().then(
      /** Publishes a loaded face only while its document is active. @param loaded - Browser face. @returns Nothing. */
      (loaded) => {
        if (!active) return;
        fontSet.add(loaded);
        installed.push(loaded);
        onChange?.(font.familyName, true);
      },
      /** Exposes a deterministic fallback when decoding fails. @returns Nothing. */
      () => {
        if (active) onChange?.(font.familyName, false);
      },
    );
  }
  return /** Revokes faces owned by this document. @returns Nothing. */ () => {
    active = false;
    for (const face of installed) fontSet.delete(face);
  };
}
