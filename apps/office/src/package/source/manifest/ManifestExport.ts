/**
 * @fileoverview Reimplements the bounded ODF package manifest exporter from pinned LibreOffice `package/source/manifest/ManifestExport.cxx`.
 */

import { SaxesParser, type SaxesAttributeNS, type SaxesTagNS } from "saxes";

/** MIME type of an OpenDocument Text package. */
export const ODT_MIMETYPE = "application/vnd.oasis.opendocument.text";

/** ODF manifest namespace owned by the package manifest format. */
const manifestNamespace = "urn:oasis:names:tc:opendocument:xmlns:manifest:1.0";

/** Creates the ODF 1.3 manifest for the currently emitted Writer streams. @param fonts - Embedded font package paths. @returns Complete manifest XML. */
export function createOdtManifestXml(fonts: readonly string[] = []): string {
  const entries = [
    ["/", ODT_MIMETYPE],
    ["content.xml", "text/xml"],
    ["styles.xml", "text/xml"],
    ["meta.xml", "text/xml"],
    ...fonts.map(
      /** Declares one package font. @param path - ZIP entry name. @returns Manifest tuple. */
      (path) => [path, "application/x-font-ttf"] as const,
    ),
  ] as const;
  return `<?xml version="1.0" encoding="UTF-8"?><manifest:manifest xmlns:manifest="${manifestNamespace}" manifest:version="1.3">${entries
    .map(
      /** Serializes one manifest tuple. @param entry - Full path and media type. @returns File-entry XML. */
      (entry) => {
        const [path, mediaType] = entry;
        return `<manifest:file-entry manifest:full-path="${escapeManifestXml(path)}" manifest:media-type="${escapeManifestXml(mediaType)}"/>`;
      },
    )
    .join("")}</manifest:manifest>`;
}

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

/** Escapes XML attribute metacharacters for package-owned manifest serialization. @param value - Raw attribute value. @returns XML-safe value. */
function escapeManifestXml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll('"', "&quot;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}
