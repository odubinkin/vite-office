/** @fileoverview Browser download workflows for Writer exports. */

import type { DocumentExportPort } from "../../../svl/source/misc/storage";
import { SwDocShell } from "../../source/uibase/app/docsh";

/** Exports the active Writer graph as an ODT browser download. @param docShell - Active Writer shell. @param port - Browser download adapter. @param filename - Download filename. @returns Completion after serialization. */
export async function saveWriterOdtToPort(
  docShell: SwDocShell,
  port: DocumentExportPort,
  filename: string,
): Promise<void> {
  const bytes = await docShell.SerializeOdt();
  await docShell.Export(
    {
      filterId: "writer8",
      kind: "export",
      mediaType: SwDocShell.ODT_MEDIA_TYPE,
      name: filename,
    },
    /** Delegates the storage-neutral export to the browser-owned port. @returns Port completion. */ () =>
      port.export({ data: bytes, mediaType: SwDocShell.ODT_MEDIA_TYPE, name: filename }),
  );
}

/** Exports canonical paragraph text through a browser download port. @param docShell - Active Writer shell. @param port - Browser download adapter. @param filename - Download filename. @returns Port completion. */
export function exportWriterTextToPort(
  docShell: SwDocShell,
  port: DocumentExportPort,
  filename: string,
): Promise<void> {
  return docShell.Export(
    {
      filterId: "Text",
      kind: "export",
      mediaType: "text/plain;charset=utf-8",
      name: filename,
    },
    /** Serializes the live Writer graph as plain paragraph text. @param document - Canonical graph. @returns Port completion. */ (
      document,
    ) =>
      port.export({
        data: document.paragraphs
          .map(
            /** Selects canonical paragraph text. @param paragraph - Text node. @returns Plain text. */ (
              paragraph,
            ) => paragraph.GetText(),
          )
          .join("\n"),
        mediaType: "text/plain;charset=utf-8",
        name: filename,
      }),
  );
}
