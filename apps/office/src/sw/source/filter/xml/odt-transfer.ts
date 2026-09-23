/** @fileoverview Defines the ODT worker envelope around the canonical Writer graph record. */

import type { SwDoc } from "../../core/doc/doc";
import type { DefaultFontDevice } from "../../core/doc/default-font";
import {
  decodeWriterDocument,
  encodeWriterDocument,
  type WriterDocumentRecord,
} from "../../core/doc/writer-document-codec";

/** Current structured-clone envelope used by ODT Worker adapters. */
export interface OdtWriterTransferRecord {
  readonly graph: WriterDocumentRecord;
  readonly transferVersion: 5;
}

/** Creates one structured-clone transfer without defining a second graph schema. @param document - Canonical graph. @returns Worker envelope. */
export function createOdtWriterTransfer(document: SwDoc): OdtWriterTransferRecord {
  return { graph: encodeWriterDocument(document), transferVersion: 5 };
}

/** Restores only the current Worker envelope through the canonical graph codec. @param candidate - Worker value. @param defaultFontDevice - Current output device. @returns Canonical graph. */
export function restoreOdtWriterTransfer(
  candidate: unknown,
  defaultFontDevice?: DefaultFontDevice,
): SwDoc {
  if (
    typeof candidate !== "object" ||
    candidate === null ||
    Array.isArray(candidate) ||
    !("transferVersion" in candidate) ||
    candidate.transferVersion !== 5 ||
    !("graph" in candidate)
  )
    throw new Error("ODT worker transfer schema is unsupported.");
  return decodeWriterDocument(candidate.graph, defaultFontDevice);
}
