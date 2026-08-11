/** @fileoverview Copies plain text through the browser Clipboard API with a local legacy fallback for static browser deployments. */

/** Describes browser capabilities needed to write plain text without an application backend. */
export interface BrowserClipboardEnvironment {
  /** Native asynchronous clipboard writer when the browser exposes one. */
  readonly clipboard: Pick<Clipboard, "writeText"> | undefined;
  /** DOM document used only for the local legacy copy fallback. */
  readonly document: Document;
}

/**
 * Copies plain text using the native Clipboard API and falls back to a temporary DOM selection when it is unavailable or denied.
 *
 * @param text - Plain text copied without parsing, document-model mutation, or network requests.
 * @param environment - Browser capabilities used by the static frontend; defaults to the current global browser.
 * @returns A promise fulfilled after text reaches a browser clipboard mechanism.
 * @throws {Error} When neither clipboard mechanism can complete the write.
 */
export async function copyPlainText(
  text: string,
  environment: BrowserClipboardEnvironment = {
    clipboard: globalThis.navigator.clipboard,
    document: globalThis.document,
  },
): Promise<void> {
  if (environment.clipboard !== undefined) {
    try {
      await environment.clipboard.writeText(text);
      return;
    } catch {
      copyWithLegacyCommand(text, environment.document);
      return;
    }
  }
  copyWithLegacyCommand(text, environment.document);
}

/**
 * Copies plain text through a temporary off-screen textarea when the asynchronous Clipboard API is unavailable or rejected.
 *
 * @param text - Plain text copied without converting it into HTML.
 * @param document - Browser document used to create and remove the temporary fallback textarea.
 * @returns Nothing; the legacy command either completes synchronously or throws.
 * @throws {Error} When the browser declines the legacy copy command.
 */
function copyWithLegacyCommand(text: string, document: Document): void {
  const source = document.createElement("textarea");
  source.setAttribute("aria-hidden", "true");
  source.style.left = "-9999px";
  source.style.position = "fixed";
  source.value = text;
  document.body.append(source);
  source.select();
  const didCopy = document.execCommand("copy");
  source.remove();
  if (!didCopy) throw new Error("Browser clipboard fallback rejected the copy operation.");
}
