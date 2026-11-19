/** @fileoverview Realm-local Emscripten native runtime bootstrap. The current linked artifact contains pinned libxml2 and its actual libc/MEMFS; filesystem users depend on the shared runtime rather than an XML service or a replacement filesystem. */
import createRuntime, { type LibXml2 } from "@vite-office/libxml2-wasm";
let instance: LibXml2 | undefined;
let loading: Promise<LibXml2> | undefined;
/** Loads the actual linked native runtime before synchronous core components. @returns One actual module per realm. */
export function initializeRuntime(): Promise<LibXml2> {
  return (loading ??= createRuntime().then(
    /** Publishes only fully initialized libc/native exports. @param module - Actual Emscripten module. @returns Same runtime. */ (
      module,
    ) => {
      instance = module;
      return module;
    },
  ));
}
/** Borrows the initialized runtime without selecting a service or inventing native exports. @returns Runtime or absence before bootstrap. */
export function getRuntime(): LibXml2 | undefined {
  return instance;
}
/** Borrows the actual Emscripten filesystem. Default MEMFS is realm-local, with no host filesystem mounted. @returns Native runtime FS API. */
export function getFileSystem(): LibXml2["FS"] {
  if (instance === undefined)
    throw new Error("Emscripten runtime must be initialized before filesystem operations");
  return instance.FS;
}
