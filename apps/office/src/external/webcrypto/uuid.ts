/** @fileoverview Browser platform binding of the existing native UUID v4 API. No independent random generator, SDK libuuid linking or WASM generation wrapper is installed. */
/** Calls the platform's UUID implementation in the current main/Worker realm. @returns Canonical UUID v4 string supplied by Web Crypto. */
export function randomUUID(): string {
  return globalThis.crypto.randomUUID();
}
