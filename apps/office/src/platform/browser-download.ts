/**
 * @fileoverview Implements a browser-only text Blob download adapter with injectable DOM and object-URL capabilities for deterministic tests.
 */

/** Defines the minimum anchor surface needed to trigger a browser download. */
export interface DownloadAnchor {
  /** Triggers the browser download navigation. @returns Nothing; browser handles the navigation. */
  click(): void;
  /** Download filename exposed to the browser. */
  download: string;
  /** Object URL assigned as the download source. */
  href: string;
}

/** Defines the browser DOM capability that creates temporary download anchors. */
export interface DownloadDocument {
  /** Creates an anchor element used only to trigger a Blob download. @param tagName - Required anchor tag. @returns Detached download anchor. */
  createElement(tagName: "a"): DownloadAnchor;
}

/** Defines the object-URL operations used to make and release a Blob download source. */
export interface DownloadUrl {
  /** Creates a temporary browser URL for a Blob. @param blob - Text Blob offered for download. @returns Browser object URL. */
  createObjectURL(blob: Blob): string;
  /** Releases a temporary object URL after click dispatch. @param url - Earlier object URL. @returns Nothing. */
  revokeObjectURL(url: string): void;
}

/**
 * Creates and immediately triggers a UTF-8 plain-text browser download.
 *
 * @param text - Exact plain-text file contents without mutation.
 * @param filename - Browser-visible filename including the intended extension.
 * @param document - Browser DOM factory or a test double.
 * @param url - Browser object-URL factory or a test double.
 * @returns Nothing; the browser owns the resulting file download.
 */
export function downloadPlainText(
  text: string,
  filename: string,
  document: DownloadDocument = globalThis.document,
  url: DownloadUrl = globalThis.URL,
): void {
  const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
  const objectUrl = url.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.download = filename;
  anchor.href = objectUrl;
  try {
    anchor.click();
  } finally {
    url.revokeObjectURL(objectUrl);
  }
}
