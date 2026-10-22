/** @fileoverview Full Calc ODS/XML filtering and native row-height computation in a Dedicated Worker. */
import type { XmlPackage } from "../../../../svl/source/misc/storage";
import type { OdsImportOptions } from "../../../source/filter/xml/xmlwrap";
import { readOdsDocument, writeOdsDocument, writeOdsXml } from "../../../source/filter/xml/xmlwrap";
import {
  encodeCalcDocument,
  decodeCalcDocument,
  type CalcDocumentRecord,
} from "./calc-document-codec";
/** Serializable request; functions and host devices never cross the worker boundary. */
export type OdsWorkerRequest = { id: number } & (
  | {
      operation: "import";
      input: ArrayBuffer | XmlPackage;
      options: Pick<OdsImportOptions, "limits" | "maxExpandedCells" | "zipLimits">;
    }
  | { operation: "export" | "export-xml"; document: CalcDocumentRecord }
);
/** Worker success alternative, with native classes encoded only at transport boundaries. */
export type OdsWorkerResult = CalcDocumentRecord | XmlPackage | ArrayBuffer;
/** Executes one filter request in the worker. @param request - Request. @returns Transferable filter result. */
export async function processOdsWorkerRequest(request: OdsWorkerRequest): Promise<OdsWorkerResult> {
  if (request.operation === "import") {
    const document = await readOdsDocument(
      request.input instanceof ArrayBuffer ? new Uint8Array(request.input) : request.input,
      request.options,
    );
    try {
      return encodeCalcDocument(document);
    } finally {
      document.DisposeAttributes();
    }
  }
  const document = decodeCalcDocument(request.document);
  try {
    if (request.operation === "export-xml") return writeOdsXml(document);
    return writeOdsDocument(document).buffer as ArrayBuffer;
  } finally {
    document.DisposeAttributes();
  }
}
