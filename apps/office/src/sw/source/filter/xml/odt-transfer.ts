/** @fileoverview Defines the ODT worker envelope around the canonical Writer graph record. */

import type { SwDoc } from "../../core/doc/doc";
import {
  decodeWriterDocument,
  encodeWriterDocument,
  type WriterDocumentRecord,
} from "../basflt/writer-document-codec";

/** Current structured-clone envelope used by ODT Worker adapters. */
export interface OdtWriterTransferRecord {
  readonly graph: WriterDocumentRecord;
  readonly transferVersion: 4;
}

/** Creates one structured-clone transfer without defining a second graph schema. @param document - Canonical graph. @returns Worker envelope. */
export function createOdtWriterTransfer(document: SwDoc): OdtWriterTransferRecord {
  return { graph: encodeWriterDocument(document), transferVersion: 4 };
}

/** Restores only the current Worker envelope through the canonical graph codec. @param candidate - Worker value. @returns Canonical graph. */
export function restoreOdtWriterTransfer(candidate: unknown): SwDoc {
  if (
    typeof candidate !== "object" ||
    candidate === null ||
    Array.isArray(candidate) ||
    !("transferVersion" in candidate) ||
    candidate.transferVersion !== 4 ||
    !("graph" in candidate)
  )
    throw new Error("ODT worker transfer schema is unsupported.");
  return decodeWriterDocument(candidate.graph);
}
