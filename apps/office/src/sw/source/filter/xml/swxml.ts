/**
 * @fileoverview Reimplements the bounded SwXMLReader package orchestration from pinned LibreOffice `sw/source/filter/xml/swxml.cxx`.
 */

import { readOdfFontResources } from "../../../../package/source/zippackage/odf-font-resources";
import { initializeLibXml2 } from "../../../../external/libxml2/libxml2";
import { importDocumentMetaXml } from "../../../../xmloff/source/meta/xmlmetai";
import { SfxDocumentProperties } from "../../../../sfx2/source/doc/sfxbasemodel";
import { CheckOdfStorageMediaType } from "../../../../sfx2/source/doc/objstor";
import { readPlainPackageManifest } from "../../../../package/source/zippackage/ZipPackage";
import { MIMETYPE_OASIS_OPENDOCUMENT_TEXT as ODT_MIMETYPE } from "../../../../comphelper/inc/documentconstants";
import {
  DocumentArchive,
  ArchiveChecks,
  assertSafeArchivePath,
  DEFAULT_ARCHIVE_LIMITS,
  type ArchiveLimits,
} from "../../../../package/source/zippackage/document-archive";
import type { XmlPackage } from "../../../../svl/source/misc/storage";
import type { DefaultFontDevice } from "../../core/doc/default-font";
import type { OdfXmlDiagnostic } from "../../../../xmloff/source/core/xmlimp";
import {
  isEmbeddedRaster,
  SvXMLGraphicHelper,
  type XMLGraphic,
} from "../../../../xmloff/source/core/xmlgrhlp";
import { importWriterXml, type ImportedWriterDocument } from "./xmlimp";

/** Maximum UTF-8 size accepted for each mandatory ODT XML stream. */
export const ODT_XML_STREAM_BYTE_LIMIT = 16 * 1024 * 1024;

/** Observable stages matching Writer's package-then-XML import order. */
export type OdtImportProgressStage =
  "package" | "manifest" | "styles" | "content" | "metadata" | "mapping";

/** Cooperative worker controls inspected between bounded import stages. */
export interface OdtImportControl {
  /** Device supplying locale-dependent Writer font defaults. */
  readonly defaultFontDevice?: DefaultFontDevice;
  /** Reports whether the request is no longer applicable. */
  readonly isCancelled?: () => boolean;
  /** Optional stricter per-XML-stream byte ceiling. */
  readonly maxXmlStreamBytes?: number;
  /** Receives deterministic package/import progress. */
  readonly onProgress?: (stage: OdtImportProgressStage) => void;
  /** Local structural diagnostics; callbacks and document content never cross Worker transfer. */
  readonly onDiagnostic?: (diagnostic: OdfXmlDiagnostic) => void;
}

/** Reads mandatory ODT streams in LibreOffice's styles-before-content order. */
export class SwXMLReader {
  /** Imports one ODF 1.3 text package. @param bytes - Complete ODT bytes. @param metadata - Caller identity and lifecycle. @param limits - Optional ZIP ceilings. @param control - Cooperative progress/cancellation controls. @returns Canonical SwDoc. */
  public async Read(
    bytes: Uint8Array | XmlPackage,
    metadata: Readonly<{ title: string; locale?: string }>,
    limits?: ArchiveLimits,
    control: OdtImportControl = {},
  ): Promise<ImportedWriterDocument> {
    checkpoint(control, "package");
    const packageFile =
      bytes instanceof Uint8Array
        ? limits === undefined
          ? await DocumentArchive.open(bytes, undefined, ArchiveChecks.TryCheckInsensitive)
          : await DocumentArchive.open(bytes, limits, ArchiveChecks.TryCheckInsensitive)
        : {
            getEntryNames:
              /** Reads an unpacked Writer stream under the existing import limits.  @returns Operation result. */ () =>
                Object.keys(bytes.files),
            readEntry:
              /** Reads an unpacked Writer stream under the existing import limits. @param name - name. @returns Operation result. */ async (
                name: string,
              ) => {
                const value = bytes.files[name];
                if (value === undefined) throw new Error(`Missing ODF stream: ${name}`);
                return typeof value === "string" ? new TextEncoder().encode(value) : value;
              },
          };
    const names = packageFile.getEntryNames();
    const readText =
      /** Reads an unpacked Writer stream under the existing import limits. @param name - name. @param stage - stage. @returns Operation result. */ (
        name: string,
        stage?: OdtImportProgressStage,
      ) =>
        bytes instanceof Uint8Array
          ? readXmlEntry(packageFile, name, control, stage)
          : Promise.resolve(readStoredXml(bytes, name, control, stage));
    const optionalText =
      /** Reads an unpacked Writer stream under the existing import limits. @param name - name. @param stage - stage. @returns Operation result. */ (
        name: string,
        stage: OdtImportProgressStage,
      ) =>
        names.includes(name)
          ? readText(name, stage)
          : (checkpoint(control, stage), Promise.resolve(undefined));
    const mimetype = await optionalText("mimetype", "package");
    const packageMetadata = readPlainPackageManifest(
      packageFile,
      await readText("META-INF/manifest.xml", "manifest"),
      mimetype,
    );
    CheckOdfStorageMediaType(packageMetadata, ODT_MIMETYPE);
    const manifest = packageMetadata.streamMediaTypes;
    const settingsXml = names.includes("settings.xml") ? await readText("settings.xml") : undefined;
    const stylesXml = await optionalText("styles.xml", "styles");
    const contentXml = await optionalText("content.xml", "content");
    const metaXml = await optionalText("meta.xml", "metadata");
    checkpoint(control, "mapping");
    const graphics = new Map<string, XMLGraphic>();
    const bounds = limits ?? DEFAULT_ARCHIVE_LIMITS;
    let totalPictureBytes = 0;
    for (const [path, mediaType] of manifest) {
      if (!isEmbeddedRaster(mediaType)) continue;
      assertSafeArchivePath(path);
      const picture = await packageFile.readEntry(path);
      totalPictureBytes += picture.length;
      if (picture.length > bounds.maxEntryBytes || totalPictureBytes > bounds.maxTotalBytes)
        throw new Error("ODF embedded images exceed size limit.");
      if (picture.length) graphics.set(path, { bytes: picture, mediaType });
      if (control.isCancelled?.() === true) throw new Error("ODT operation was cancelled.");
    }
    const properties = metaXml === undefined ? undefined : new SfxDocumentProperties();
    let imported: ImportedWriterDocument;
    try {
      if (metaXml !== undefined && properties) {
        await initializeLibXml2();
        importDocumentMetaXml(metaXml, properties.LoadFromDocument.bind(properties), control);
      }
      imported = importWriterXml(stylesXml, contentXml, metadata, undefined, {
        ...(properties ? { documentProperties: properties } : {}),
        graphicHelper: new SvXMLGraphicHelper(graphics),
        ...(settingsXml === undefined ? {} : { settingsXml }),
        ...(control.isCancelled === undefined ? {} : { isCancelled: control.isCancelled }),
        ...(control.defaultFontDevice === undefined
          ? {}
          : { defaultFontDevice: control.defaultFontDevice }),
        ...(control.onDiagnostic === undefined ? {} : { onDiagnostic: control.onDiagnostic }),
      });
    } finally {
      properties?.Dispose();
    }
    try {
      const fonts = await readOdfFontResources(
        imported.document.GetEmbeddedFonts(),
        names,
        manifest,
        packageFile.readEntry.bind(packageFile),
        /** Keeps the original Writer import progress checkpoint. @returns Completion of the import checkpoint. */ () =>
          checkpoint(control, "mapping"),
      );
      for (const font of fonts)
        imported.document.SetEmbeddedFontBytes(font.path, font.bytes, font.canLoad);
      return imported;
    } catch (error) {
      imported.document.Dispose();
      throw error;
    }
  }
}

/** Convenience ODT import boundary. @param bytes - Complete ODT bytes. @param metadata - Caller document identity. @param limits - Optional ZIP ceilings. @param control - Cooperative progress/cancellation controls. @returns Canonical SwDoc. */
export async function readOdtDocument(
  bytes: Uint8Array | XmlPackage,
  metadata: Readonly<{ title: string; locale?: string }>,
  limits?: ArchiveLimits,
  control?: OdtImportControl,
): Promise<ImportedWriterDocument> {
  return new SwXMLReader().Read(bytes, metadata, limits, control);
}

/** Reads and bounds one UTF-8 package stream. @param packageFile - Validated ZIP. @param name - Entry path. @param control - Cooperative controls. @param stage - Progress stage. @returns Decoded text. */
async function readXmlEntry(
  packageFile: Pick<DocumentArchive, "readEntry">,
  name: string,
  control: OdtImportControl,
  stage?: OdtImportProgressStage,
): Promise<string> {
  checkpoint(control, stage);
  const bytes = await packageFile.readEntry(name);
  if (bytes.length > (control.maxXmlStreamBytes ?? ODT_XML_STREAM_BYTE_LIMIT))
    throw new Error(`ODT XML stream exceeds size limit: ${name}`);
  checkpoint(control, stage);
  return new TextDecoder("utf-8", { fatal: true }).decode(bytes);
}

/** Emits progress then rejects cancelled work before another heavy stage. @param control - Cooperative controls. @param stage - Public stage when applicable. @returns Nothing. */
function checkpoint(control: OdtImportControl, stage?: OdtImportProgressStage): void {
  if (control.isCancelled?.() === true) throw new Error("ODT operation was cancelled.");
  if (stage !== undefined) control.onProgress?.(stage);
}

/** Reads browser XML text without archive, byte-copy or decode work. @param data - Stored XML. @param name - Stream. @param control - Limits. @param stage - Progress stage. @returns XML. */
function readStoredXml(
  data: XmlPackage,
  name: string,
  control: OdtImportControl,
  stage?: OdtImportProgressStage,
): string {
  checkpoint(control, stage);
  const xml = data.files[name];
  if (typeof xml !== "string") throw new Error(`Missing ODT XML stream: ${name}`);
  if (
    new TextEncoder().encode(xml).length > (control.maxXmlStreamBytes ?? ODT_XML_STREAM_BYTE_LIMIT)
  )
    throw new Error(`ODT XML stream exceeds size limit: ${name}`);
  return xml;
}
