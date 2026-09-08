/**
 * @fileoverview Reimplements the bounded SwXMLWriter package orchestration from pinned LibreOffice `sw/source/filter/xml/wrtxml.cxx`.
 */

import {
  createOdtManifestXml,
  ODT_MIMETYPE,
} from "../../../../package/source/manifest/ManifestExport";
import { ZipOutputStream } from "../../../../package/source/zipapi/ZipOutputStream";
import type { SwDoc } from "../../core/doc/doc";
import { exportContentXml, exportMetaXml, exportStylesXml } from "./xmlexp";

/** Writes the currently supported Writer graph as an ODF 1.3 text package. */
export class SwXMLWriter {
  /** Produces a deterministic ODT byte stream. @param document - Canonical Writer document. @returns ODT bytes. */
  public Write(document: SwDoc): Uint8Array {
    const encoder = new TextEncoder();
    const output = new ZipOutputStream();
    output.putNextEntry("mimetype", encoder.encode(ODT_MIMETYPE));
    output.putNextEntry("META-INF/manifest.xml", encoder.encode(createOdtManifestXml()));
    output.putNextEntry("styles.xml", encoder.encode(exportStylesXml(document)));
    output.putNextEntry("content.xml", encoder.encode(exportContentXml(document)));
    output.putNextEntry("meta.xml", encoder.encode(exportMetaXml(document)));
    return output.finish();
  }
}

/** Convenience ODT export boundary. @param document - Canonical Writer document. @returns Deterministic ODT bytes. */
export function writeOdtDocument(document: SwDoc): Uint8Array {
  return new SwXMLWriter().Write(document);
}
