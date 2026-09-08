/**
 * @fileoverview Reimplements the bounded SwXMLReader package orchestration from pinned LibreOffice `sw/source/filter/xml/swxml.cxx`.
 */

import type { OfficeDocument } from "../../../../sfx2/source/doc/docfac";
import {
  validateOdtManifestXml,
  ODT_MIMETYPE,
} from "../../../../package/source/manifest/ManifestExport";
import { ZipFile, type ZipFileLimits } from "../../../../package/source/zipapi/ZipFile";
import type { SwDoc } from "../../core/doc/doc";
import { importWriterXml } from "./xmlimp";

/** Reads mandatory ODT streams in LibreOffice's styles-before-content order. */
export class SwXMLReader {
  /** Imports one ODF 1.3 text package. @param bytes - Complete ODT bytes. @param metadata - Caller identity and lifecycle. @param limits - Optional ZIP ceilings. @returns Canonical SwDoc. */
  public async Read(
    bytes: Uint8Array,
    metadata: OfficeDocument,
    limits?: ZipFileLimits,
  ): Promise<SwDoc> {
    const packageFile = limits === undefined ? new ZipFile(bytes) : new ZipFile(bytes, limits);
    const names = packageFile.getEntryNames();
    if (names[0] !== "mimetype") throw new Error("ODT mimetype must be the first ZIP entry.");
    if (packageFile.getEntryMethod("mimetype") !== 0)
      throw new Error("ODT mimetype must be stored without compression.");
    const mimetype = await packageFile.readTextEntry("mimetype");
    if (mimetype !== ODT_MIMETYPE) throw new Error("ODT mimetype entry is invalid.");
    validateOdtManifestXml(await packageFile.readTextEntry("META-INF/manifest.xml"));
    const stylesXml = await packageFile.readTextEntry("styles.xml");
    const contentXml = await packageFile.readTextEntry("content.xml");
    const metaXml = await packageFile.readTextEntry("meta.xml");
    return importWriterXml(stylesXml, contentXml, metadata, metaXml);
  }
}

/** Convenience ODT import boundary. @param bytes - Complete ODT bytes. @param metadata - Caller document identity. @param limits - Optional ZIP ceilings. @returns Canonical SwDoc. */
export async function readOdtDocument(
  bytes: Uint8Array,
  metadata: OfficeDocument,
  limits?: ZipFileLimits,
): Promise<SwDoc> {
  return new SwXMLReader().Read(bytes, metadata, limits);
}
