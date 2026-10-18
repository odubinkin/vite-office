/** @fileoverview Platform-neutral JS manifest composition binding to actual PropertyValue sequences and ManifestExport; document type and stream policy belong to calling filters. */
import { PropertyValue } from "../../../udkapi/com/sun/star/beans/PropertyValue";
import { OUString } from "../../../sal/inc/rtl/ustring";
import { XmlStringDocumentHandler } from "../../../sax/source/expatwrap/saxwriter";
import { ManifestExport } from "./ManifestExport";
/** Writes a plain OASIS manifest through actual shared source owners. @param sequence - Native property sequences. @returns UTF16 XML. */
export function createManifestXml(sequence: readonly (readonly PropertyValue[])[]): string {
  const handler = new XmlStringDocumentHandler();
  new ManifestExport(handler, sequence);
  return handler.getXml();
}

/** Builds an actual string-valued PropertyValue without a parallel package DTO model. @param name - Property name. @param value - Native value content. @returns Property. */
export function createManifestProperty(name: string, value: string): PropertyValue {
  const result = new PropertyValue(),
    key = new OUString(
      Uint16Array.from(
        name,
        /** ASCII name unit. @param c - Character. @returns Unit. */ (c) => c.charCodeAt(0),
      ),
      name.length,
    ),
    data = new OUString(
      Uint16Array.from(
        value.split(""),
        /** UTF16 content unit. @param c - Unit. @returns Code. */ (c) => c.charCodeAt(0),
      ),
      value.length,
    );
  try {
    result.Name = key;
    result.Value.insert([data.pData], "OUString");
    return result;
  } finally {
    key.dispose();
    data.dispose();
  }
}
