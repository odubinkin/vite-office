/**
 * @fileoverview Reimplements the bounded SwXMLWriter package orchestration from pinned LibreOffice `sw/source/filter/xml/wrtxml.cxx`.
 */

import {
  createManifestXml,
  createManifestProperty as property,
} from "../../../../package/source/manifest/ManifestWriter";
import { MIMETYPE_OASIS_OPENDOCUMENT_TEXT as ODT_MIMETYPE } from "../../../../comphelper/inc/documentconstants";
import { ZipOutputStream } from "../../../../package/source/zipapi/ZipOutputStream";
import type { SwDoc } from "../../core/doc/doc";
import { exportContentXml, exportMetaXml, exportStylesXml } from "./xmlexp";

/** Maximum complete STORE-only ODT produced by the browser filter. */
export const ODT_EXPORT_BYTE_LIMIT = 64 * 1024 * 1024;

/** Observable stages matching Writer's XML-then-package export order. */
export type OdtExportProgressStage = "styles" | "content" | "metadata" | "package";

/** Cooperative worker controls inspected between bounded export stages. */
export interface OdtExportControl {
  /** Reports whether the request is no longer applicable. */
  readonly isCancelled?: () => boolean;
  /** Optional stricter complete-output byte ceiling. */
  readonly maxOutputBytes?: number;
  /** Receives deterministic filter progress. */
  readonly onProgress?: (stage: OdtExportProgressStage) => void;
}

/** Writes the currently supported Writer graph as an ODF 1.3 text package. */
export class SwXMLWriter {
  /** Produces a deterministic ODT byte stream. @param document - Canonical Writer document. @param metadata - Filter metadata supplied by the shell. @param control - Cooperative progress/cancellation controls. @returns ODT bytes. */
  public Write(
    document: SwDoc,
    metadata: Readonly<{ title: string }>,
    control: OdtExportControl = {},
  ): Uint8Array {
    const encoder = new TextEncoder();
    const output = new ZipOutputStream();
    const fonts = document.GetEmbeddedFonts();
    output.putNextEntry("mimetype", encoder.encode(ODT_MIMETYPE));
    output.putNextEntry(
      "META-INF/manifest.xml",
      encoder.encode(
        createWriterManifestXml(
          fonts.map(
            /** Projects a font path. @param font - Document font. @returns Package path. */ (
              font,
            ) => font.path,
          ),
        ),
      ),
    );
    checkpoint(control, "styles");
    output.putNextEntry("styles.xml", encoder.encode(exportStylesXml(document)));
    checkpoint(control, "content");
    output.putNextEntry(
      "content.xml",
      encoder.encode(exportContentXml(document, control.isCancelled)),
    );
    checkpoint(control, "metadata");
    output.putNextEntry(
      "meta.xml",
      encoder.encode(exportMetaXml(metadata.title, document.GetLocale())),
    );
    for (const font of fonts) {
      if (font.bytes === undefined)
        throw new Error(`ODF embedded font bytes are missing: ${font.path}`);
      output.putNextEntry(font.path, font.bytes);
    }
    checkpoint(control, "package");
    const bytes = output.finish();
    if (bytes.length > (control.maxOutputBytes ?? ODT_EXPORT_BYTE_LIMIT))
      throw new Error("ODT export exceeds size limit.");
    return bytes;
  }
}

/** Convenience ODT export boundary. @param document - Canonical Writer document. @param metadata - Filter metadata supplied by the shell. @param control - Cooperative progress/cancellation controls. @returns Deterministic ODT bytes. */
export function writeOdtDocument(
  document: SwDoc,
  metadata: Readonly<{ title: string }>,
  control?: OdtExportControl,
): Uint8Array {
  return new SwXMLWriter().Write(document, metadata, control);
}

/** Emits progress then rejects cancelled work before another heavy stage. @param control - Cooperative controls. @param stage - Current stage. @returns Nothing. */
function checkpoint(control: OdtExportControl, stage: OdtExportProgressStage): void {
  if (control.isCancelled?.() === true) throw new Error("ODT operation was cancelled.");
  control.onProgress?.(stage);
}

/** Writer-owned stream policy feeds the shared native manifest sequence exporter. @param fonts - Embedded font entry paths. @returns XML. */
function createWriterManifestXml(fonts: readonly string[]): string {
  const entries: readonly (readonly [string, string])[] = [
    ["/", ODT_MIMETYPE],
    ["content.xml", "text/xml"],
    ["styles.xml", "text/xml"],
    ["meta.xml", "text/xml"],
    ...fonts.map(
      /** Writer font media type. @param path - Path. @returns Entry. */ (path) =>
        [path, "application/x-font-ttf"] as const,
    ),
  ];
  const manifest = entries.map(
    /** Creates actual package properties. @param entry - Path and media type. @returns Native sequence. */ ([
      path,
      media,
    ]) => {
      const sequence = [property("FullPath", path), property("MediaType", media)];
      if (path === "/") sequence.push(property("Version", "1.3"));
      return sequence;
    },
  );
  return createManifestXml(manifest);
}
