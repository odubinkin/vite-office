/** @fileoverview Copies plain and bounded rich text through browser Clipboard APIs with a local plain-text fallback for static browser deployments. */

/** Describes browser capabilities needed to write plain text without an application backend. */
export interface BrowserClipboardEnvironment {
  /** Native asynchronous clipboard writer when the browser exposes one. */
  readonly clipboard: Pick<Clipboard, "writeText"> | undefined;
  /** DOM document used only for the local legacy copy fallback. */
  readonly document: Document;
}

/** Defines a browser ClipboardItem constructor that accepts MIME-typed binary payloads. */
export type BrowserClipboardItemConstructor = new (items: Record<string, Blob>) => ClipboardItem;

/** Describes browser capabilities needed to write an HTML and plain-text clipboard pair. */
export interface BrowserRichClipboardEnvironment {
  /** Blob constructor used to create MIME-typed clipboard payloads. */
  readonly Blob: typeof Blob;
  /** Native ClipboardItem constructor when the browser supports rich clipboard writes. */
  readonly ClipboardItem: BrowserClipboardItemConstructor | undefined;
  /** Native clipboard writer and plain-text fallback writer when the browser exposes them. */
  readonly clipboard: Pick<Clipboard, "write" | "writeText"> | undefined;
  /** DOM document used only when rich and native plain-text writes are unavailable. */
  readonly document: Document;
}

/** Defines one portable rich clipboard pair. */
export interface RichClipboardPayload {
  /** Sanitized HTML representation for rich-text-capable target editors. */
  readonly html: string;
  /** Sanitized plain-text representation for plain-text targets and legacy fallback. */
  readonly plainText: string;
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
 * Copies a bounded HTML representation together with its exact plain-text fallback whenever the browser supports rich clipboard items.
 *
 * @param payload - Sanitized paired clipboard representations produced by a bounded Writer command.
 * @param environment - Browser APIs used by the static frontend; defaults to the current global browser.
 * @returns A promise fulfilled after one browser clipboard mechanism accepts the payload.
 * @throws {Error} When rich and plain clipboard mechanisms are all unavailable or reject the write.
 */
export async function copyRichText(
  payload: RichClipboardPayload,
  environment: BrowserRichClipboardEnvironment = {
    Blob: globalThis.Blob,
    ClipboardItem: globalThis.ClipboardItem as BrowserClipboardItemConstructor | undefined,
    clipboard: globalThis.navigator.clipboard,
    document: globalThis.document,
  },
): Promise<void> {
  if (environment.clipboard !== undefined && environment.ClipboardItem !== undefined) {
    try {
      const clipboardItem = new environment.ClipboardItem({
        "text/html": new environment.Blob([payload.html], { type: "text/html" }),
        "text/plain": new environment.Blob([payload.plainText], { type: "text/plain" }),
      });
      await environment.clipboard.write([clipboardItem]);
      return;
    } catch {
      // Preserve copy in browser environments that expose but reject rich clipboard writes.
    }
  }
  await copyPlainText(payload.plainText, {
    clipboard: environment.clipboard,
    document: environment.document,
  });
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
