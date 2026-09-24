/** @fileoverview Defines the ODT worker envelope around the canonical Writer graph record. */

import type { SwDoc } from "../../../source/core/doc/doc";
import type { DefaultFontDevice } from "../../../source/core/doc/default-font";
import {
  createOdtFilterDocument,
  type OdtFilterDocument,
} from "../../../source/filter/xml/odt-filter-service";
import {
  decodeWriterDocument,
  encodeWriterDocument,
  type WriterDocumentRecord,
} from "./writer-document-codec";

/** Current structured-clone envelope used by ODT Worker adapters. */
export interface OdtWriterTransferRecord {
  readonly graph: WriterDocumentRecord;
  readonly transferVersion: 5;
}

/** Worker-only cloneable filter payload. */
export interface OdtWorkerDocument {
  readonly document: OdtWriterTransferRecord;
  readonly metadata: Readonly<{ title: string }>;
}

/** Encodes the canonical filter input for a Dedicated Worker. @param input - Canonical graph and title. @returns Cloneable payload. */
export function createOdtWorkerDocument(input: OdtFilterDocument): OdtWorkerDocument {
  return { document: createOdtWriterTransfer(input.document), metadata: { title: input.title } };
}

/** Decodes one Worker payload before entering the canonical filter. @param input - Cloneable payload. @param device - Optional output device. @returns Canonical graph and title. */
export function restoreOdtWorkerDocument(
  input: OdtWorkerDocument,
  device?: DefaultFontDevice,
): OdtFilterDocument {
  if (
    typeof input !== "object" ||
    input === null ||
    Array.isArray(input) ||
    typeof input.metadata !== "object" ||
    input.metadata === null ||
    typeof input.metadata.title !== "string"
  )
    throw new Error("ODT worker document metadata is invalid.");
  return createOdtFilterDocument(
    restoreOdtWriterTransfer(input.document, device),
    input.metadata.title,
  );
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
