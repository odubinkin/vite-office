/** @fileoverview Calc browser-byte composition for native XML import/export wrapper responsibilities over shared ZIP/manifest services. */
import {
  DocumentArchive,
  ArchiveChecks,
  type ArchiveLimits,
} from "../../../../package/source/zippackage/document-archive";
import { packXmlPackage } from "../../../../package/source/zippackage/xml-package";
import type { XmlPackage } from "../../../../svl/source/misc/storage";
import { readPlainPackageManifest } from "../../../../package/source/zippackage/ZipPackage";
import {
  createManifestXml,
  createManifestProperty,
} from "../../../../package/source/manifest/ManifestWriter";
import { ScDocument } from "../../../inc/document";
import { ScXMLImport, type ScXMLImportOptions } from "./xmlimprt";
import { ScXMLExport, type ScXMLExportOptions } from "./xmlexprt";
import { prepareTableProtection } from "./xmlexprt.protection";
import {
  XMLDocumentSettingsContext,
  type ViewSettings,
} from "../../../../xmloff/source/core/DocumentSettingsContext";
import { exportViewSettings } from "../../../../xmloff/source/core/SettingsExportHelper";
import {
  parseOdfXmlStream,
  SvXMLIgnoreContext,
  SvXMLImportContext,
} from "../../../../xmloff/source/core/xmlimp";
import { XMLToken } from "../../../../xmloff/source/core/xmltoken";
import { ReadUserDataSequence, WriteUserDataSequence } from "../../ui/view/viewdata.settings";

/** Accepts the original settings element in the settings stream. */
class ScXMLDocumentSettingsContext extends SvXMLImportContext {
  /** Collects the incoming view data before the content stream is read. @param applyViews - Receives the loaded view records. @returns Context. */
  constructor(private readonly applyViews: (views: ViewSettings) => void) {
    super();
  }
  /** Dispatches the settings group using the shared xmloff owner. @param element - Child token. @returns Context. */
  override createFastChildContext(element: XMLToken): SvXMLImportContext {
    if (element !== XMLToken.OFFICE_SETTINGS) return new SvXMLIgnoreContext(true);
    return new XMLDocumentSettingsContext(undefined, this.applyViews);
  }
  /** Ignores unrelated children of the settings stream. @returns Ignore context. */
  override createUnknownChildContext(): SvXMLImportContext {
    return new SvXMLIgnoreContext(true);
  }
}
/** Native spreadsheet package media type. */
export const ODS_MIMETYPE = "application/vnd.oasis.opendocument.spreadsheet";
/** Browser import controls preserve shared ZIP/XML limits. */
export interface OdsImportOptions extends ScXMLImportOptions {
  readonly zipLimits?: ArchiveLimits;
}
/** Byte I/O replaces native medium/storage transport;the actual document and shared package contracts remain the same. */
export class ScXMLImportWrapper {
  /** Binds the actual document. @param document - Target/source. @returns Wrapper. */
  constructor(private readonly document: ScDocument) {}
  /** Imports a plain modern ODS package directly into a fresh actual document. @param bytes - Package. @param options - Controls. @returns Completion. */
  async Import(bytes: Uint8Array | XmlPackage, options: OdsImportOptions = {}): Promise<void> {
    if (options.isCancelled?.()) throw new Error("ODS operation was cancelled");
    const zip =
      bytes instanceof Uint8Array
        ? options.zipLimits === undefined
          ? await DocumentArchive.open(bytes, undefined, ArchiveChecks.TryCheckInsensitive)
          : await DocumentArchive.open(bytes, options.zipLimits, ArchiveChecks.TryCheckInsensitive)
        : {
            getEntryNames:
              /** Reads or measures an unpacked Calc XML stream.  @returns Operation result. */ () =>
                Object.keys(bytes.files),
            getEntryMethod:
              /** Reads or measures an unpacked Calc XML stream.  @returns Operation result. */ () =>
                0,
            readTextEntry:
              /** Reads or measures an unpacked Calc XML stream. @param name - name. @returns Operation result. */ async (
                name: string,
              ) => {
                const value = bytes.files[name];
                if (typeof value !== "string") throw new Error(`Missing ODS XML stream: ${name}`);
                return value;
              },
          };
    if (zip.getEntryNames()[0] !== "mimetype" || zip.getEntryMethod("mimetype") !== 0)
      throw new Error("ODS requires first uncompressed mimetype entry");
    const mimetype = await zip.readTextEntry("mimetype");
    if (mimetype !== ODS_MIMETYPE) throw new Error("Invalid ODS mimetype");
    readPlainPackageManifest(zip, await zip.readTextEntry("META-INF/manifest.xml"), mimetype);
    if (options.isCancelled?.()) throw new Error("ODS operation was cancelled");
    let views: ViewSettings | undefined;
    if (zip.getEntryNames().includes("settings.xml")) {
      parseOdfXmlStream(
        await zip.readTextEntry("settings.xml"),
        {
          /** Opens the original settings root. @param element - Root token. @returns Context. */
          createFastContext: (element) =>
            element === XMLToken.OFFICE_DOCUMENT_SETTINGS
              ? new ScXMLDocumentSettingsContext(
                  /** Retains parsed settings until the sheet names are available. @param records - Parsed views. @returns Nothing. */
                  (records) => (views = records),
                )
              : new SvXMLIgnoreContext(true),
          /** Ignores a settings stream with an unrelated root. @returns Ignore context. */
          createUnknownContext: () => new SvXMLIgnoreContext(true),
        },
        options,
      );
    }
    const content = await zip.readTextEntry("content.xml");
    const importer = new ScXMLImport(this.document, options);
    if (zip.getEntryNames().includes("styles.xml"))
      importer.importStyles(await zip.readTextEntry("styles.xml"));
    importer.importContent(content);
    if (views !== undefined) ReadUserDataSequence(this.document, views);
  }
  /** Writes an external ODS package. @param options - Controls. @returns Package bytes. */
  async Export(options: ScXMLExportOptions = {}): Promise<Uint8Array> {
    const bytes = await packXmlPackage((await this.ExportXml(options)).files);
    if (bytes.length > (options.maxOutputBytes ?? 64 * 1024 * 1024))
      throw new Error("ODS export size limit exceeded");
    return bytes;
  }

  /** Writes supported content through shared native manifest properties and ZIP records. @param options - Controls. @returns ODS bytes. */
  async ExportXml(options: ScXMLExportOptions = {}): Promise<XmlPackage> {
    if (options.isCancelled?.()) throw new Error("ODS operation was cancelled");
    const tableProtection = await prepareTableProtection(this.document);
    if (options.isCancelled?.()) throw new Error("ODS operation was cancelled");
    const exporter = new ScXMLExport(this.document, options),
      content = exporter.exportContent(tableProtection),
      styles = exporter.exportStyles(),
      views = WriteUserDataSequence(this.document),
      files: Record<string, string> = {},
      zip = {
        /** Retains one unpacked stream. @param name - Path. @param value - Text. @returns Nothing. */
        putNextEntry(name: string, value: string) {
          files[name] = value;
        },
      };
    zip.putNextEntry("mimetype", ODS_MIMETYPE);
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
      ...(styles
        ? [
            [
              ["FullPath", "styles.xml"],
              ["MediaType", "text/xml"],
            ],
          ]
        : []),
      ...(views.length
        ? [
            [
              ["FullPath", "settings.xml"],
              ["MediaType", "text/xml"],
            ],
          ]
        : []),
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
    zip.putNextEntry("META-INF/manifest.xml", createManifestXml(manifest));
    zip.putNextEntry("content.xml", content);
    if (styles) zip.putNextEntry("styles.xml", styles);
    if (views.length) zip.putNextEntry("settings.xml", exportViewSettings(views));
    const size = Object.values(files).reduce(
      /** Reads or measures an unpacked Calc XML stream. @param sum - sum. @param value - value. @returns Operation result. */ (
        sum,
        value,
      ) => sum + new TextEncoder().encode(value).length,
      0,
    );
    if (size > (options.maxOutputBytes ?? 64 * 1024 * 1024))
      throw new Error("ODS export size limit exceeded");
    return { format: "xml", files };
  }
}
/** Browser package-to-native-document binding. @param bytes - ODS. @param options - Controls. @returns Actual document. */
export async function readOdsDocument(
  bytes: Uint8Array | XmlPackage,
  options: OdsImportOptions = {},
): Promise<ScDocument> {
  const doc = new ScDocument();
  await new ScXMLImportWrapper(doc).Import(bytes, options);
  return doc;
}
/** Browser native-document-to-package binding. @param document - Actual document. @param options - Controls. @returns ODS bytes. */
export async function writeOdsDocument(
  document: ScDocument,
  options: ScXMLExportOptions = {},
): Promise<Uint8Array> {
  return await new ScXMLImportWrapper(document).Export(options);
}

/** Writes primary browser XML. @param document - Model. @param options - Controls. @returns XML streams. */
export function writeOdsXml(
  document: ScDocument,
  options: ScXMLExportOptions = {},
): Promise<XmlPackage> {
  return new ScXMLImportWrapper(document).ExportXml(options);
}
