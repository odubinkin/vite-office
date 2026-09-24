/**
 * @fileoverview Reimplements the bounded SwXMLReader package orchestration from pinned LibreOffice `sw/source/filter/xml/swxml.cxx`.
 */

import {
  validateOdtManifestXml,
  ODT_MIMETYPE,
} from "../../../../package/source/manifest/ManifestExport";
import { ZipFile, type ZipFileLimits } from "../../../../package/source/zipapi/ZipFile";
import type { DefaultFontDevice } from "../../core/doc/default-font";
import type { OdfXmlDiagnostic } from "../../../../xmloff/source/core/xmlimp";
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
    bytes: Uint8Array,
    metadata: Readonly<{ title: string; locale?: string }>,
    limits?: ZipFileLimits,
    control: OdtImportControl = {},
  ): Promise<ImportedWriterDocument> {
    checkpoint(control, "package");
    const packageFile = limits === undefined ? new ZipFile(bytes) : new ZipFile(bytes, limits);
    const names = packageFile.getEntryNames();
    if (names[0] !== "mimetype") throw new Error("ODT mimetype must be the first ZIP entry.");
    if (packageFile.getEntryMethod("mimetype") !== 0)
      throw new Error("ODT mimetype must be stored without compression.");
    const mimetype = await readXmlEntry(packageFile, "mimetype", control, "package");
    if (mimetype !== ODT_MIMETYPE) throw new Error("ODT mimetype entry is invalid.");
    validateOdtManifestXml(
      await readXmlEntry(packageFile, "META-INF/manifest.xml", control, "manifest"),
    );
    const stylesXml = await readXmlEntry(packageFile, "styles.xml", control, "styles");
    const contentXml = await readXmlEntry(packageFile, "content.xml", control, "content");
    const metaXml = await readXmlEntry(packageFile, "meta.xml", control, "metadata");
    checkpoint(control, "mapping");
    return importWriterXml(stylesXml, contentXml, metadata, metaXml, {
      ...(control.isCancelled === undefined ? {} : { isCancelled: control.isCancelled }),
      ...(control.defaultFontDevice === undefined
        ? {}
        : { defaultFontDevice: control.defaultFontDevice }),
      ...(control.onDiagnostic === undefined ? {} : { onDiagnostic: control.onDiagnostic }),
    });
  }
}

/** Convenience ODT import boundary. @param bytes - Complete ODT bytes. @param metadata - Caller document identity. @param limits - Optional ZIP ceilings. @param control - Cooperative progress/cancellation controls. @returns Canonical SwDoc. */
export async function readOdtDocument(
  bytes: Uint8Array,
  metadata: Readonly<{ title: string; locale?: string }>,
  limits?: ZipFileLimits,
  control?: OdtImportControl,
): Promise<ImportedWriterDocument> {
  return new SwXMLReader().Read(bytes, metadata, limits, control);
}

/** Reads and bounds one UTF-8 package stream. @param packageFile - Validated ZIP. @param name - Entry path. @param control - Cooperative controls. @param stage - Progress stage. @returns Decoded text. */
async function readXmlEntry(
  packageFile: ZipFile,
  name: string,
  control: OdtImportControl,
  stage: OdtImportProgressStage,
): Promise<string> {
  checkpoint(control, stage);
  const bytes = await packageFile.readEntry(name);
  if (bytes.length > (control.maxXmlStreamBytes ?? ODT_XML_STREAM_BYTE_LIMIT))
    throw new Error(`ODT XML stream exceeds size limit: ${name}`);
  checkpoint(control, stage);
  return new TextDecoder("utf-8", { fatal: true }).decode(bytes);
}

/** Emits progress then rejects cancelled work before another heavy stage. @param control - Cooperative controls. @param stage - Current stage. @returns Nothing. */
function checkpoint(control: OdtImportControl, stage: OdtImportProgressStage): void {
  if (control.isCancelled?.() === true) throw new Error("ODT operation was cancelled.");
  control.onProgress?.(stage);
}
