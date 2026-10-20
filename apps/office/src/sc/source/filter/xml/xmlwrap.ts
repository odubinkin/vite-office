/** @fileoverview Calc browser-byte composition for native XML import/export wrapper responsibilities over shared ZIP/manifest services. */
import { ZipFile, type ZipFileLimits } from "../../../../package/source/zipapi/ZipFile";
import { ZipOutputStream } from "../../../../package/source/zipapi/ZipOutputStream";
import { readPlainPackageManifest } from "../../../../package/source/zippackage/ZipPackage";
import {
  createManifestXml,
  createManifestProperty,
} from "../../../../package/source/manifest/ManifestWriter";
import { ScDocument } from "../../../inc/document";
import { ScXMLImport, type ScXMLImportOptions } from "./xmlimprt";
import { ScXMLExport, type ScXMLExportOptions } from "./xmlexprt";
/** Native spreadsheet package media type. */
export const ODS_MIMETYPE = "application/vnd.oasis.opendocument.spreadsheet";
/** Browser import controls preserve shared ZIP/XML limits. */
export interface OdsImportOptions extends ScXMLImportOptions {
  readonly zipLimits?: ZipFileLimits;
}
/** Byte I/O replaces native medium/storage transport;the actual document and shared package contracts remain the same. */
export class ScXMLImportWrapper {
  /** Binds the actual document. @param document - Target/source. @returns Wrapper. */
  constructor(private readonly document: ScDocument) {}
  /** Imports a plain modern ODS package directly into a fresh actual document. @param bytes - Package. @param options - Controls. @returns Completion. */
  async Import(bytes: Uint8Array, options: OdsImportOptions = {}): Promise<void> {
    if (options.isCancelled?.()) throw new Error("ODS operation was cancelled");
    const zip =
      options.zipLimits === undefined ? new ZipFile(bytes) : new ZipFile(bytes, options.zipLimits);
    if (zip.getEntryNames()[0] !== "mimetype" || zip.getEntryMethod("mimetype") !== 0)
      throw new Error("ODS requires first uncompressed mimetype entry");
    const mimetype = await zip.readTextEntry("mimetype");
    if (mimetype !== ODS_MIMETYPE) throw new Error("Invalid ODS mimetype");
    readPlainPackageManifest(zip, await zip.readTextEntry("META-INF/manifest.xml"), mimetype);
    if (options.isCancelled?.()) throw new Error("ODS operation was cancelled");
    const content = await zip.readTextEntry("content.xml");
    const importer = new ScXMLImport(this.document, options);
    if (zip.getEntryNames().includes("styles.xml"))
      importer.importStyles(await zip.readTextEntry("styles.xml"));
    importer.importContent(content);
  }
  /** Writes supported content through shared native manifest properties and ZIP records. @param options - Controls. @returns ODS bytes. */
  Export(options: ScXMLExportOptions = {}): Uint8Array {
    if (options.isCancelled?.()) throw new Error("ODS operation was cancelled");
    const content = new ScXMLExport(this.document, options).exportContent(),
      zip = new ZipOutputStream(),
      encoder = new TextEncoder();
    zip.putNextEntry("mimetype", encoder.encode(ODS_MIMETYPE));
    const manifest = [
      [
        ["FullPath", "/"],
        ["MediaType", ODS_MIMETYPE],
        ["Version", "1.3"],
      ],
      [
        ["FullPath", "content.xml"],
        ["MediaType", "text/xml"],
      ],
    ].map(
      /** Builds actual native PropertyValue sequences. @param properties - Fields. @returns Sequence. */ (
        properties,
      ) =>
        properties.map(
          /** Constructs the existing shared property owner. @param entry - Field. @returns Property. */ ([
            name,
            value,
          ]) => createManifestProperty(name as string, value as string),
        ),
    );
    zip.putNextEntry("META-INF/manifest.xml", encoder.encode(createManifestXml(manifest)));
    zip.putNextEntry("content.xml", encoder.encode(content));
    const bytes = zip.finish();
    if (bytes.length > (options.maxOutputBytes ?? 64 * 1024 * 1024))
      throw new Error("ODS export size limit exceeded");
    return bytes;
  }
}
/** Browser package-to-native-document binding. @param bytes - ODS. @param options - Controls. @returns Actual document. */
export async function readOdsDocument(
  bytes: Uint8Array,
  options: OdsImportOptions = {},
): Promise<ScDocument> {
  const doc = new ScDocument();
  await new ScXMLImportWrapper(doc).Import(bytes, options);
  return doc;
}
/** Browser native-document-to-package binding. @param document - Actual document. @param options - Controls. @returns ODS bytes. */
export function writeOdsDocument(
  document: ScDocument,
  options: ScXMLExportOptions = {},
): Uint8Array {
  return new ScXMLImportWrapper(document).Export(options);
}
