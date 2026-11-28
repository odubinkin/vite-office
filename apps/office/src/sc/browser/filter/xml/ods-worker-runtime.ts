/** @fileoverview Full Calc ODS/XML filtering and native row-height computation in a Dedicated Worker. */
import type { XmlPackage } from "../../../../svl/source/misc/storage";
import { createBrowserRegexMatcher } from "../../../../i18npool/browser/regex-matcher";
import type { OdsImportOptions } from "../../../source/filter/xml/xmlwrap";
import type { SecurityOptionsSnapshot } from "../../../../unotools/source/config/securityoptions";
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
      options: Pick<OdsImportOptions, "limits" | "maxExpandedCells" | "zipLimits" | "baseUrl">;
    }
  | {
      operation: "export" | "export-xml";
      document: CalcDocumentRecord;
      securityOptions?: SecurityOptionsSnapshot;
    }
);
/** Worker success alternative, with native classes encoded only at transport boundaries. */
export type OdsWorkerResult = CalcDocumentRecord | XmlPackage | ArrayBuffer;
/** Executes one filter request in the worker. @param request - Request. @returns Transferable filter result. */
export async function processOdsWorkerRequest(request: OdsWorkerRequest): Promise<OdsWorkerResult> {
  if (request.operation === "import") {
    const document = await readOdsDocument(
      request.input instanceof ArrayBuffer ? new Uint8Array(request.input) : request.input,
      { ...request.options, regexMatcherFactory: createBrowserRegexMatcher },
    );
    try {
      return encodeCalcDocument(document);
    } finally {
      document.Dispose();
    }
  }
  const document = decodeCalcDocument(request.document);
  try {
    const options = request.securityOptions ? { securityOptions: request.securityOptions } : {};
    if (request.operation === "export-xml") return await writeOdsXml(document, options);
    return (await writeOdsDocument(document, options)).buffer as ArrayBuffer;
  } finally {
    document.Dispose();
  }
}
