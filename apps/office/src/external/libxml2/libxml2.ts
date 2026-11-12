/** @fileoverview Browser module initialization and UTF8 argument marshalling for the actual pinned libxml2 C implementation. Nodes, allocation and XML operations remain native WASM operations. */
import createLibXml2, { type LibXml2 } from "@vite-office/libxml2-wasm";
export type { LibXml2 } from "@vite-office/libxml2-wasm";
/** Original xmlNodePtr represented by an address in this realm's WASM memory. Zero is NULL. */
export type XmlNodePtr = number;
/** Original xmlDocPtr represented by a native address, not a JavaScript document. */
export type XmlDocPtr = number;
/** Original xmlNsPtr retains actual native shared namespace identity. */
export type XmlNsPtr = number;
let instance: LibXml2 | undefined;
let loading: Promise<LibXml2> | undefined;

/** Loads the embedded native library once before synchronous UNO component construction. No native pointer is shared across realms. @returns The actual realm-local C module. */
export function initializeLibXml2(): Promise<LibXml2> {
  return (loading ??= createLibXml2().then(
    /** Publishes only a completely instantiated native module. @param module - Actual Emscripten module. @returns The same module. */ (
      module,
    ) => {
      instance = module;
      return module;
    },
  ));
}

/** Borrows the initialized module for synchronous native entry points. Initialization is a platform bootstrap prerequisite. @returns Actual native library. */
export function getLibXml2(): LibXml2 {
  if (!instance) throw new Error("libxml2 must be initialized before constructing XML components");
  return instance;
}

/** Copies counted source bytes to temporary native storage with an additional terminator. Encoding remains the caller's existing RTL/parser responsibility. Individual C APIs choose counted or terminated interpretation. @param value - Borrowed source bytes. @param action - Synchronous native call consuming the buffer and original byte length. @returns Native call result. */
export function withXmlBytes<T>(
  value: Uint8Array,
  action: (pointer: number, byteLength: number) => T,
): T {
  const module = getLibXml2(),
    length = value.length,
    pointer = module._malloc(length + 1);
  try {
    module.HEAPU8.set(value, pointer);
    module.HEAPU8[pointer + length] = 0;
    return action(pointer, length);
  } finally {
    module._free(pointer);
  }
}
