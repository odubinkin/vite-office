/**
 * @fileoverview Reimplements the bounded ODF package manifest exporter from pinned LibreOffice `package/source/manifest/ManifestExport.cxx`.
 */

/** MIME type of an OpenDocument Text package. */
export const ODT_MIMETYPE = "application/vnd.oasis.opendocument.text";

/** ODF manifest namespace owned by the package manifest format. */
const manifestNamespace = "urn:oasis:names:tc:opendocument:xmlns:manifest:1.0";

/** Creates the ODF 1.3 manifest for the currently emitted Writer streams. @returns Complete manifest XML. */
export function createOdtManifestXml(): string {
  const entries = [
    ["/", ODT_MIMETYPE],
    ["content.xml", "text/xml"],
    ["styles.xml", "text/xml"],
    ["meta.xml", "text/xml"],
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

/** Validates mandatory ODT manifest entries before Writer XML import. @param xml - Manifest XML. @returns Nothing. */
export function validateOdtManifestXml(xml: string): void {
  if (/<!DOCTYPE/i.test(xml)) throw new Error("ODF manifest declarations are unsupported.");
  const document = new DOMParser().parseFromString(xml, "application/xml");
  const root = document.documentElement;
  if (
    document.getElementsByTagName("parsererror").length > 0 ||
    root.namespaceURI !== manifestNamespace ||
    root.localName !== "manifest"
  )
    throw new Error("ODF manifest XML is invalid.");
  const entries = new Map<string, string>();
  for (const element of root.getElementsByTagNameNS(manifestNamespace, "file-entry")) {
    const path = element.getAttributeNS(manifestNamespace, "full-path");
    const mediaType = element.getAttributeNS(manifestNamespace, "media-type");
    if (path === null || mediaType === null || entries.has(path))
      throw new Error("ODF manifest entry is invalid.");
    entries.set(path, mediaType);
  }
  if (entries.get("/") !== ODT_MIMETYPE)
    throw new Error("ODF manifest root media type is invalid.");
  for (const path of ["content.xml", "styles.xml", "meta.xml"])
    if (entries.get(path) !== "text/xml") throw new Error(`ODF manifest entry is missing: ${path}`);
}

/** Escapes XML attribute metacharacters for package-owned manifest serialization. @param value - Raw attribute value. @returns XML-safe value. */
function escapeManifestXml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll('"', "&quot;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}
