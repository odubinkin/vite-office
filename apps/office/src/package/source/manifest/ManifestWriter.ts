/** @fileoverview Platform-neutral JS manifest composition binding to actual PropertyValue sequences and ManifestExport; document type and stream policy belong to calling filters. */
import type { PropertyValue } from "../../../udkapi/com/sun/star/beans/PropertyValue";
import { XmlStringDocumentHandler } from "../../../sax/source/expatwrap/saxwriter";
import { ManifestExport } from "./ManifestExport";
/** Writes a plain OASIS manifest through actual shared source owners. @param sequence - Native property sequences. @returns UTF16 XML. */
export function createManifestXml(sequence: readonly (readonly PropertyValue[])[]): string {
  const handler = new XmlStringDocumentHandler();
  new ManifestExport(handler, sequence);
  return handler.getXml();
}
