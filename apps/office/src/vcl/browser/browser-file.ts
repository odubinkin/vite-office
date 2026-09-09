/** @fileoverview Implements browser-only file selection and byte reading behind injectable DOM capabilities. */

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
