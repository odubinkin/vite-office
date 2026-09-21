/** @fileoverview Defines the narrow structured-clone contract used only by the ODT worker. */

import type { SwDoc } from "../../core/doc/doc";
import {
  decodeWriterDocument,
  encodeWriterDocument,
  type WriterDocumentRecord,
} from "../basflt/writer-document-codec";

/** Current worker-owned filter graph transfer, distinct from durable storage. */
export interface OdtWriterTransferRecord {
  readonly document: WriterDocumentRecord;
  readonly transferVersion: 2;
}

/** Creates one structured-clone ODT transfer. @param document - Canonical graph. @returns Filter-only transfer. */
export function createOdtWriterTransfer(document: SwDoc): OdtWriterTransferRecord {
  return { document: encodeWriterDocument(document), transferVersion: 2 };
}

/** Restores only the current filter-transfer version. @param candidate - Worker value. @returns Canonical graph. */
export function restoreOdtWriterTransfer(candidate: unknown): SwDoc {
  if (
    typeof candidate !== "object" ||
    candidate === null ||
    Array.isArray(candidate) ||
    !("transferVersion" in candidate) ||
    candidate.transferVersion !== 2 ||
    !("document" in candidate)
  )
    throw new Error("ODT worker transfer schema is unsupported.");
  return decodeWriterDocument(candidate.document);
}
