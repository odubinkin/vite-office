/**
 * @fileoverview Reimplements the bounded ODF package manifest exporter from pinned LibreOffice `package/source/manifest/ManifestExport.cxx`.
 */

import { OUString, type OUStringConstReference } from "../../../sal/inc/rtl/ustring";
import type { PropertyValue } from "../../../udkapi/com/sun/star/beans/PropertyValue";
import { AttributeList } from "../../../comphelper/inc/attributelist";
import type { ManifestDocumentHandler } from "../../../udkapi/com/sun/star/xml/sax/XDocumentHandler";
import {
  MIMETYPE_OASIS_OPENDOCUMENT_TEXT,
  MIMETYPE_OASIS_OPENDOCUMENT_TEXT_WEB,
  MIMETYPE_OASIS_OPENDOCUMENT_TEXT_GLOBAL,
  MIMETYPE_OASIS_OPENDOCUMENT_DRAWING,
  MIMETYPE_OASIS_OPENDOCUMENT_PRESENTATION,
  MIMETYPE_OASIS_OPENDOCUMENT_SPREADSHEET,
  MIMETYPE_OASIS_OPENDOCUMENT_CHART,
  MIMETYPE_OASIS_OPENDOCUMENT_DATABASE,
  MIMETYPE_OASIS_OPENDOCUMENT_FORMULA,
  MIMETYPE_OASIS_OPENDOCUMENT_TEXT_TEMPLATE,
  MIMETYPE_OASIS_OPENDOCUMENT_TEXT_GLOBAL_TEMPLATE,
  MIMETYPE_OASIS_OPENDOCUMENT_DRAWING_TEMPLATE,
  MIMETYPE_OASIS_OPENDOCUMENT_PRESENTATION_TEMPLATE,
  MIMETYPE_OASIS_OPENDOCUMENT_SPREADSHEET_TEMPLATE,
  MIMETYPE_OASIS_OPENDOCUMENT_CHART_TEMPLATE,
  MIMETYPE_OASIS_OPENDOCUMENT_FORMULA_TEMPLATE,
} from "../../../comphelper/inc/documentconstants";

import { SaxesParser, type SaxesAttributeNS, type SaxesTagNS } from "saxes";

/** MIME type of an OpenDocument Text package. */
const ODT_MIMETYPE = MIMETYPE_OASIS_OPENDOCUMENT_TEXT;

/** ODF manifest namespace owned by the package manifest format. */
const manifestNamespace = "urn:oasis:names:tc:opendocument:xmlns:manifest:1.0";

/** Validates mandatory ODT manifest entries before Writer XML import. @param xml - Manifest XML. @returns Validated package entry types. */
export function validateOdtManifestXml(xml: string): ReadonlyMap<string, string> {
  const entries = new Map<string, string>();
  let depth = 0;
  let rootIsValid = false;
  const parser = new SaxesParser({ xmlns: true });
  parser.on(
    "doctype",
    /** Rejects entity-bearing document types. @returns Never. */ () => {
      throw new Error("ODF manifest declarations are unsupported.");
    },
  );
  parser.on(
    "opentag",
    /** Validates and records one manifest element. @param tag - Namespace-aware SAX tag. @returns Nothing. */ (
      tag: SaxesTagNS,
    ) => {
      if (depth >= 256) throw new Error("ODF manifest exceeds depth limit.");
      if (depth === 0) rootIsValid = tag.uri === manifestNamespace && tag.local === "manifest";
      depth += 1;
      if (tag.uri !== manifestNamespace || tag.local !== "file-entry") return;
      const attributes = Object.values(tag.attributes);
      const path = readManifestAttribute(attributes, "full-path");
      const mediaType = readManifestAttribute(attributes, "media-type");
      if (path === undefined || mediaType === undefined || entries.has(path))
        throw new Error("ODF manifest entry is invalid.");
      entries.set(path, mediaType);
    },
  );
  parser.on(
    "closetag",
    /** Closes one bounded manifest nesting level. @returns Nothing. */ () => {
      depth -= 1;
    },
  );
  try {
    parser.write(xml).close();
  } catch (error) {
    if (error instanceof Error && error.message.startsWith("ODF manifest")) throw error;
    throw new Error("ODF manifest XML is invalid.", { cause: error });
  }
  if (!rootIsValid) throw new Error("ODF manifest XML is invalid.");
  if (entries.get("/") !== ODT_MIMETYPE)
    throw new Error("ODF manifest root media type is invalid.");
  for (const path of ["content.xml", "styles.xml", "meta.xml"])
    if (entries.get(path) !== "text/xml") throw new Error(`ODF manifest entry is missing: ${path}`);
  return entries;
}

/** Reads one namespaced manifest attribute. @param attributes - SAX attributes. @param localName - Namespace-local name. @returns Decoded value or undefined. */
function readManifestAttribute(
  attributes: readonly SaxesAttributeNS[],
  localName: string,
): string | undefined {
  return attributes.find(
    /** Matches one manifest expanded name. @param attribute - Candidate attribute. @returns Whether it matches. */
    (attribute) => attribute.uri === manifestNamespace && attribute.local === localName,
  )?.value;
}

/** Ordinary OASIS MIME decisions from the original exporter; encrypted/legacy branches await their actual implementations. */
const oasisTypes = new Set<string>([
  MIMETYPE_OASIS_OPENDOCUMENT_TEXT,
  MIMETYPE_OASIS_OPENDOCUMENT_TEXT_WEB,
  MIMETYPE_OASIS_OPENDOCUMENT_TEXT_GLOBAL,
  MIMETYPE_OASIS_OPENDOCUMENT_DRAWING,
  MIMETYPE_OASIS_OPENDOCUMENT_PRESENTATION,
  MIMETYPE_OASIS_OPENDOCUMENT_SPREADSHEET,
  MIMETYPE_OASIS_OPENDOCUMENT_CHART,
  MIMETYPE_OASIS_OPENDOCUMENT_DATABASE,
  MIMETYPE_OASIS_OPENDOCUMENT_FORMULA,
  MIMETYPE_OASIS_OPENDOCUMENT_TEXT_TEMPLATE,
  MIMETYPE_OASIS_OPENDOCUMENT_TEXT_GLOBAL_TEMPLATE,
  MIMETYPE_OASIS_OPENDOCUMENT_DRAWING_TEMPLATE,
  MIMETYPE_OASIS_OPENDOCUMENT_PRESENTATION_TEMPLATE,
  MIMETYPE_OASIS_OPENDOCUMENT_SPREADSHEET_TEMPLATE,
  MIMETYPE_OASIS_OPENDOCUMENT_CHART_TEMPLATE,
  MIMETYPE_OASIS_OPENDOCUMENT_FORMULA_TEMPLATE,
]);
/** Creates one real native text value. @param value - Text. @returns Value. */
function unicode(value: string): OUString {
  const units = new Uint16Array(value.length);
  for (let i = 0; i < value.length; ++i) units[i] = value.charCodeAt(i);
  return new OUString(units, units.length);
}
/** Reads native UTF16. @param value - Text. @returns Browser text. */
function text(value: OUStringConstReference): string {
  let result = "";
  for (let i = 0; i < value.getLength(); ++i)
    result += String.fromCharCode(value.getStr()[i] as number);
  return result;
}
/** Adds original attribute values while ending temporary text scopes. @param list - Actual list. @param name - Qualified name. @param value - Literal content. @returns Nothing. */
function add(list: AttributeList, name: string, value: string): void {
  const key = unicode(name),
    data = unicode(value);
  try {
    list.AddAttribute(key, data);
  } finally {
    key.dispose();
    data.dispose();
  }
}
/** Calls the original named SAX event on a temporary literal. @param name - Literal. @param action - Event. @returns Nothing. */
function named(name: string, action: (value: OUString) => void): void {
  const value = unicode(name);
  try {
    action(value);
  } finally {
    value.dispose();
  }
}
/** Actual native PropertyValue-sequence exporter for the ordinary unencrypted OASIS branch; browser admission rejects unimplemented legacy/encrypted documents before events. */
// eslint-disable-next-line @typescript-eslint/no-extraneous-class -- Original ManifestExport class performs synchronous SAX export from its constructor.
export class ManifestExport {
  /** Original constructor performs export synchronously in source order. @param handler - Actual consumed SAX callbacks. @param manifest - Actual property sequences. @returns Exporter. */
  constructor(handler: ManifestDocumentHandler, manifest: readonly (readonly PropertyValue[])[]) {
    let docMediaType = "",
      docVersion = "",
      root: readonly PropertyValue[] | undefined;
    for (const sequence of manifest) {
      const media = new OUString(),
        path = new OUString(),
        version = new OUString();
      try {
        for (const property of sequence) {
          const name = text(property.Name);
          if (name === "MediaType") property.Value.extract(media, "OUString");
          else if (name === "FullPath") property.Value.extract(path, "OUString");
          else if (name === "Version") property.Value.extract(version, "OUString");
          if (!path.isEmpty() && !media.isEmpty() && !version.isEmpty()) break;
        }
        if (text(path) === "/") {
          if (docMediaType !== "") throw new Error("Duplicate manifest document root");
          docMediaType = text(media);
          docVersion = text(version);
          root = sequence;
        }
      } finally {
        media.dispose();
        path.dispose();
        version.dispose();
      }
    }
    if (root === undefined) throw new Error("Missing manifest document root");
    if (!oasisTypes.has(docMediaType)) throw new Error("Legacy manifest export is not implemented");
    for (const sequence of manifest)
      for (const property of sequence) {
        const name = text(property.Name);
        if (
          [
            "KeyInfo",
            "InitialisationVector",
            "Salt",
            "IterationCount",
            "Digest",
            "DigestAlgorithm",
            "EncryptionAlgorithm",
            "StartKeyAlgorithm",
            "DerivedKeySize",
            "KeyDerivationFunction",
            "Argon2Args",
          ].includes(name)
        )
          throw new Error("Encrypted manifest export is not implemented");
        if (name === "FullPath") {
          const value = new OUString();
          try {
            property.Value.extract(value, "OUString");
            if (text(value) === "encrypted-package")
              throw new Error("Encrypted manifest export is not implemented");
          } finally {
            value.dispose();
          }
        }
      }
    const attributes = new AttributeList();
    add(attributes, "xmlns:manifest", manifestNamespace);
    if (docVersion >= "1.2") {
      add(attributes, "manifest:version", docVersion);
      add(
        attributes,
        "xmlns:loext",
        "urn:org:documentfoundation:names:experimental:office:xmlns:loext:1.0",
      );
    }
    handler.startDocument();
    named(
      "manifest:manifest",
      /** Original root begin. @param name - Name. @returns Nothing. */ (name) =>
        handler.startElement(name, attributes),
    );
    for (const sequence of manifest) {
      const list = new AttributeList(),
        string = new OUString(),
        fullPath = new OUString();
      try {
        for (const property of sequence) {
          const name = text(property.Name);
          if (name === "MediaType") {
            property.Value.extract(string, "OUString");
            add(list, "manifest:media-type", text(string));
          } else if (name === "Version") {
            property.Value.extract(string, "OUString");
            if (!string.isEmpty()) add(list, "manifest:version", text(string));
          } else if (name === "FullPath") {
            property.Value.extract(fullPath, "OUString");
            add(list, "manifest:full-path", text(fullPath));
          } else if (name === "Size") {
            const size: [bigint] = [0n];
            property.Value.extract(size, "sal_Int64");
            add(list, "manifest:size", String(size[0]));
          }
        }
        named(
          " ",
          /** Original pre-entry whitespace. @param value - Space. @returns Nothing. */ (value) =>
            handler.ignorableWhitespace(value),
        );
        named(
          "manifest:file-entry",
          /** Original entry begin. @param name - Name. @returns Nothing. */ (name) =>
            handler.startElement(name, list),
        );
        named(
          " ",
          /** Original pre-end whitespace. @param value - Space. @returns Nothing. */ (value) =>
            handler.ignorableWhitespace(value),
        );
        named(
          "manifest:file-entry",
          /** Original entry end. @param name - Name. @returns Nothing. */ (name) =>
            handler.endElement(name),
        );
      } finally {
        string.dispose();
        fullPath.dispose();
      }
    }
    named(
      " ",
      /** Original final whitespace. @param value - Space. @returns Nothing. */ (value) =>
        handler.ignorableWhitespace(value),
    );
    named(
      "manifest:manifest",
      /** Original root end. @param name - Name. @returns Nothing. */ (name) =>
        handler.endElement(name),
    );
    handler.endDocument();
  }
}
