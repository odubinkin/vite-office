/** @fileoverview zip.js fixtures for document-format ZIP admission tests. */
import { ZipWriter, Uint8ArrayReader, Uint8ArrayWriter } from "@zip.js/zip.js";

/** Builds a valid ZIP that violates ODF's uncompressed mimetype requirement. @param mimetype - ODF media type. @returns External package. */
export async function compressedMimetypePackage(mimetype: string): Promise<Uint8Array> {
  const writer = new ZipWriter(new Uint8ArrayWriter(), { useWebWorkers: false });
  await writer.add("mimetype", new Uint8ArrayReader(new TextEncoder().encode(mimetype)));
  return writer.close();
}
