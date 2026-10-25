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

/** Exports native Writer ASCII text through a browser download port. @param docShell - Active Writer shell. @param port - Browser download adapter. @param filename - Download filename. @returns Port completion. */
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
    /** Delivers the shell-owned native filter output. @returns Port completion. */ () =>
      port.export({
        data: docShell.SerializeText(),
        mediaType: "text/plain;charset=utf-8",
        name: filename,
      }),
  );
}
