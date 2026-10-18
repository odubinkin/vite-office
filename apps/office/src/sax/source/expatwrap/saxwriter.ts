/** @fileoverview Platform-neutral JS serialization binding for the five actual SAX callbacks consumed by plain ManifestExport. Native sax Writer/service/stream machinery is not fabricated. */
import type { OUStringConstReference } from "../../../sal/inc/rtl/ustring";
import type { XAttributeList } from "../../../udkapi/com/sun/star/xml/sax/XAttributeList";
import type { ManifestDocumentHandler } from "../../../udkapi/com/sun/star/xml/sax/XDocumentHandler";
/** Reads exact UTF16 without argument-count limits. @param value - Native text. @returns Browser text. */
function text(value: OUStringConstReference): string {
  let result = "";
  for (let i = 0; i < value.getLength(); ++i)
    result += String.fromCharCode(value.getStr()[i] as number);
  return result;
}
/** Erased ES2024 host API binding; repository ES2023 declarations do not yet describe this runtime-verified native method. */
type WellFormedString = string & {
  /** Native surrogate validity. @returns Whether UTF16 is well formed. */ isWellFormed(): boolean;
};
// eslint-disable-next-line no-control-regex -- Native SAX XML10 admission explicitly tests these forbidden control-code ranges.
const invalidChars = /[\u0000-\u0008\u000b\u000c\u000e-\u001f\ufffe\uffff]/u;
/** XML attribute value escaping preserves tab/newline/CR across SAX parsing. @param value - Value. @returns Escaped XML. */
function escaped(value: string): string {
  if (invalidChars.test(value) || !(value as WellFormedString).isWellFormed())
    throw new Error("Invalid character during XML-Export in an attribute value");
  return value
    .replaceAll("&", "&amp;")
    .replaceAll('"', "&quot;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll("\t", "&#9;")
    .replaceAll("\n", "&#10;")
    .replaceAll("\r", "&#13;");
}
/** JS string composition adapter with no native Writer/service identity claim. */
export class XmlStringDocumentHandler implements ManifestDocumentHandler {
  private readonly chunks: string[] = [];
  private xml = "";
  /** Starts one JS serialization. @returns Nothing. */ public startDocument(): void {
    this.chunks.length = 0;
    this.xml = "";
    this.chunks.push('<?xml version="1.0" encoding="UTF-8"?>');
  }
  /** Ends event delivery; exporter closes every element explicitly. @returns Nothing. */ public endDocument(): void {
    this.xml = this.chunks.join("");
  }
  /** Serializes actual ordered attributes. @param name - Name. @param attributes - Native list. @returns Nothing. */ public startElement(
    name: OUStringConstReference,
    attributes: XAttributeList | null,
  ): void {
    this.chunks.push("<", text(name));
    if (attributes)
      for (let i = 0; i < attributes.getLength(); ++i) {
        const key = attributes.getNameByIndex(i),
          value = attributes.getValueByIndex(i);
        try {
          this.chunks.push(" ", text(key), '="', escaped(text(value)), '"');
        } finally {
          key.dispose();
          value.dispose();
        }
      }
    this.chunks.push(">");
  }
  /** Serializes matching end tag. @param name - Name. @returns Nothing. */ public endElement(
    name: OUStringConstReference,
  ): void {
    this.chunks.push("</", text(name), ">");
  }
  /** Serializes exporter-supplied spacing. @param value - Spacing. @returns Nothing. */ public ignorableWhitespace(
    value: OUStringConstReference,
  ): void {
    this.chunks.push(text(value));
  }
  /** Returns complete serialized XML. @returns XML. */ public getXml(): string {
    return this.xml;
  }
}
