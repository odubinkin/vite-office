/** @fileoverview Retains the actual buffers used to create browser FontFaces; JS weak ownership follows the real face. */
const buffers = new WeakMap<FontFace, ArrayBuffer>();

/** Records the same immutable-by-convention buffer supplied to FontFace, with no name-based synthetic font registry. @param face - Actual constructed face. @param bytes - Constructor buffer owned by the caller. @returns Nothing. */
export function rememberBrowserFontFaceSource(face: FontFace, bytes: ArrayBuffer): void {
  buffers.set(face, bytes.slice(0));
}

/** Returns a detached copy of an actual constructor source, when it is available. CSS FontFace sources are not exposed by the platform and remain absent here. @param face - Actual registered face. @returns Original source bytes or undefined. */
export function readBrowserFontFaceSource(face: FontFace): ArrayBuffer | undefined {
  return buffers.get(face)?.slice(0);
}
