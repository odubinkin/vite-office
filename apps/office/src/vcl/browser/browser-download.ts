/**
 * @fileoverview Implements a browser-only text Blob download adapter with injectable DOM and object-URL capabilities for deterministic tests.
 */

import type { DocumentExportPort } from "../../svl/source/misc/storage";

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

/** Creates a portable browser download filename from a document title. @param title - Human-readable title. @param extension - Required extension including its dot. @returns Sanitized filename. */
export function createDownloadFilename(title: string, extension: string): string {
  const normalizedExtension = extension.startsWith(".") ? extension : `.${extension}`;
  const sanitized = title.trim().replace(/[\\/:*?"<>|]/g, "-") || "Untitled";
  return sanitized.toLowerCase().endsWith(normalizedExtension.toLowerCase())
    ? sanitized
    : `${sanitized}${normalizedExtension}`;
}

/** Creates and triggers a browser download for caller-owned bytes. @param bytes - Exact file bytes. @param mediaType - Blob media type. @param filename - Browser-visible filename. @param document - DOM anchor factory. @param url - Object-URL capability. @returns Nothing. */
export function downloadBytes(
  bytes: Uint8Array,
  mediaType: string,
  filename: string,
  document: DownloadDocument = globalThis.document,
  url: DownloadUrl = globalThis.URL,
): void {
  downloadBlob(new Blob([bytes as BlobPart], { type: mediaType }), filename, document, url);
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
  downloadBlob(new Blob([text], { type: "text/plain;charset=utf-8" }), filename, document, url);
}

/** Creates the browser implementation of the shell-neutral export port. @param exportBytes - Binary browser download capability. @param exportText - Text browser download capability. @returns Replaceable export port. */
export function createBrowserDocumentExportPort(
  exportBytes: typeof downloadBytes = downloadBytes,
  exportText: typeof downloadPlainText = downloadPlainText,
): DocumentExportPort {
  return {
    /** Routes textual and binary payloads to their browser Blob adapters. @param request - Complete neutral export request. @returns Nothing. */
    export: ({ data, mediaType, name }) =>
      typeof data === "string" ? exportText(data, name) : exportBytes(data, mediaType, name),
  };
}

/** Dispatches one Blob through a temporary anchor and always releases its URL. @param blob - File payload. @param filename - Browser filename. @param document - DOM anchor factory. @param url - Object-URL capability. @returns Nothing. */
function downloadBlob(
  blob: Blob,
  filename: string,
  document: DownloadDocument,
  url: DownloadUrl,
): void {
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
