/** @fileoverview Implements browser-only file selection and byte reading behind injectable DOM capabilities. */

import type { DocumentOpenPort } from "../../svl/source/misc/storage";

/** Opens a browser file chooser and resolves its single selected file or an explicit cancellation. @param accept - File input accept filter. @param document - DOM element factory. @returns Selected file or undefined. */
export function selectBrowserFile(
  accept: string,
  document: Pick<Document, "createElement"> = globalThis.document,
): Promise<File | undefined> {
  const input = document.createElement("input");
  input.type = "file";
  input.accept = accept;
  input.multiple = false;
  return new Promise(
    /** Installs one-shot chooser completion handlers. @param resolve - Promise resolver. @returns Nothing. */
    (resolve) => {
      let settled = false;
      /** Completes file selection exactly once. @param file - Selected file or cancellation. @returns Nothing. */
      function finish(file: File | undefined): void {
        if (settled) return;
        settled = true;
        input.remove();
        resolve(file);
      }
      input.addEventListener(
        "change",
        /** Resolves the first selected file. @returns Nothing. */
        () => finish(input.files?.[0]),
        { once: true },
      );
      input.addEventListener(
        "cancel",
        /** Resolves an explicit browser cancellation. @returns Nothing. */
        () => finish(undefined),
        { once: true },
      );
      input.click();
    },
  );
}

/** Reads a browser File without interpreting its contents. @param file - Selected browser file. @returns Independent byte array. */
export async function readBrowserFile(file: Blob): Promise<Uint8Array> {
  return new Uint8Array(await file.arrayBuffer());
}

/** Creates the browser implementation of the shell-neutral external document open port. @param selectFile - Browser chooser capability. @param readFile - Browser byte-reading capability. @returns Replaceable open port. */
export function createBrowserDocumentOpenPort(
  selectFile: typeof selectBrowserFile = selectBrowserFile,
  readFile: typeof readBrowserFile = readBrowserFile,
): DocumentOpenPort {
  return {
    /** Selects and reads one browser file as an opaque neutral source. @param accept - Browser accept filter. @returns Opened source or cancellation. */
    open: async (accept) => {
      const file = await selectFile(accept);
      return file === undefined
        ? undefined
        : { bytes: await readFile(file), name: file.name, reference: file };
    },
  };
}
