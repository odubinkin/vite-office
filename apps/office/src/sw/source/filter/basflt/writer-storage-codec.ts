/** @fileoverview Defines the durable browser-storage model contract independently from filters. */

import type { SwDoc } from "../../core/doc/doc";
import {
  decodeWriterDocument,
  encodeWriterDocument,
  type WriterDocumentRecord,
} from "./writer-document-codec";

/** Current durable model payload. No older storage-model versions are accepted. */
export interface WriterStorageDocumentRecord {
  readonly document: WriterDocumentRecord;
  readonly storageModelVersion: 2;
}

/** Captures a canonical graph for durable browser storage. @param document - Active Writer graph. @returns Current storage payload. */
export function encodeWriterStorageDocument(document: SwDoc): WriterStorageDocumentRecord {
  return { document: encodeWriterDocument(document), storageModelVersion: 2 };
}

/** Reconstructs a graph from only the current durable schema. @param candidate - Stored payload. @returns Canonical Writer graph. */
export function decodeWriterStorageDocument(candidate: unknown): SwDoc {
  if (
    typeof candidate !== "object" ||
    candidate === null ||
    Array.isArray(candidate) ||
    !("storageModelVersion" in candidate) ||
    candidate.storageModelVersion !== 2 ||
    !("document" in candidate)
  )
    throw new Error("Stored Writer model schema is unsupported.");
  return decodeWriterDocument(candidate.document);
}
