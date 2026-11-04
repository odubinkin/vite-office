/** @fileoverview Original StringPiece const-char pointer constructor's out-of-line strlen/count calculation. Header field construction stays in unicode/stringpiece; other CPP methods remain unported. */
/** Original strlen result narrowed to signed32. The source pointer must be readable through its NUL. @param pointer - Actual byte address. @returns Original constructor count. */
export function cStringLength(pointer: Uint8Array): number {
  let length = 0;
  while (pointer[length] !== 0) ++length;
  return length | 0;
}
