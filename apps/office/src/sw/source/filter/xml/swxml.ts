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
    const manifest = validateOdtManifestXml(
      await readXmlEntry(packageFile, "META-INF/manifest.xml", control, "manifest"),
    );
    const stylesXml = await readXmlEntry(packageFile, "styles.xml", control, "styles");
    const contentXml = await readXmlEntry(packageFile, "content.xml", control, "content");
    const metaXml = await readXmlEntry(packageFile, "meta.xml", control, "metadata");
    checkpoint(control, "mapping");
    const imported = importWriterXml(stylesXml, contentXml, metadata, metaXml, {
      ...(control.isCancelled === undefined ? {} : { isCancelled: control.isCancelled }),
      ...(control.defaultFontDevice === undefined
        ? {}
        : { defaultFontDevice: control.defaultFontDevice }),
      ...(control.onDiagnostic === undefined ? {} : { onDiagnostic: control.onDiagnostic }),
    });
    let totalFontBytes = 0;
    for (const font of imported.document.GetEmbeddedFonts()) {
      checkpoint(control, "mapping");
      if (
        !/^Fonts\/(?!.*(?:\.\.|\/\/))[^\\?#]+$/u.test(font.path) ||
        font.path.startsWith("Fonts//")
      )
        throw new Error(`ODF embedded font path is invalid: ${font.path}`);
      if (
        manifest.get(font.path) !== "application/x-font-ttf" &&
        manifest.get(font.path) !== "application/vnd.ms-opentype"
      )
        throw new Error(`ODF embedded font manifest entry is invalid: ${font.path}`);
      if (!names.includes(font.path))
        throw new Error(`ODF embedded font package entry is missing: ${font.path}`);
      const fontBytes = await packageFile.readEntry(font.path);
      totalFontBytes += fontBytes.length;
      if (fontBytes.length > 4 * 1024 * 1024 || totalFontBytes > 16 * 1024 * 1024)
        throw new Error("ODF embedded fonts exceed size limit.");
      imported.document.SetEmbeddedFontBytes(
        font.path,
        fontBytes,
        isViewableOpenTypeFont(fontBytes),
      );
    }
    return imported;
  }
}

/** Checks OpenType structure and OS/2 embedding rights before browser font loading. @param bytes - Package font bytes. @returns Whether viewing is permitted. */
function isViewableOpenTypeFont(bytes: Uint8Array): boolean {
  if (bytes.length < 12) throw new Error("ODF embedded font is invalid.");
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const signature = view.getUint32(0, false);
  if (signature !== 0x00010000 && signature !== 0x4f54544f)
    throw new Error("ODF embedded font format is invalid.");
  const tableCount = view.getUint16(4, false);
  if (12 + tableCount * 16 > bytes.length) throw new Error("ODF embedded font tables are invalid.");
  for (let index = 0; index < tableCount; index += 1) {
    const offset = 12 + index * 16;
    if (view.getUint32(offset, false) !== 0x4f532f32) continue;
    const tableOffset = view.getUint32(offset + 8, false);
    const tableLength = view.getUint32(offset + 12, false);
    if (tableOffset + tableLength > bytes.length || tableLength < 10)
      throw new Error("ODF embedded font rights table is invalid.");
    return (view.getUint16(tableOffset + 8, false) & 0x0002) === 0;
  }
  return false;
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
