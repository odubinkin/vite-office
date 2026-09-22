/** @fileoverview Adapts browser file and durable-storage ports to SfxMedium and SwDocShell. */

import { createDocument } from "../../../sfx2/source/doc/objsh";
import type { PrimarySavePort, StoredDocumentOpenPort } from "../../../sfx2/source/doc/docfile";
import type { DocumentExportPort, DocumentOpenPort } from "../../../svl/source/misc/storage";
import { SwDocShell } from "../../source/uibase/app/docsh";
import {
  loadWriterDocument,
  saveWriterDocument,
  type WriterSnapshotState,
} from "../../source/filter/basflt/writer-storage";

/** Opens one browser-selected ODT through a read-only SfxMedium. @param docShell - Active Writer shell. @param port - Browser picker adapter. @returns Open/cancel result. */
export async function openWriterOdtFromPort(
  docShell: SwDocShell,
  port: DocumentOpenPort,
): Promise<Readonly<{ name?: string; status: "cancelled" | "opened" }>> {
  const generation = docShell.GetDocumentState().contentGeneration;
  docShell.SetMediumOperation("open", "pending", generation);
  try {
    const opened = await port.open(`${SwDocShell.ODT_MEDIA_TYPE},.odt`);
    if (opened === undefined) {
      docShell.SetMediumOperation("none", "idle");
      return { status: "cancelled" };
    }
    const title = opened.name.replace(/\.odt$/i, "") || "Imported Writer Document";
    await docShell.Load(
      opened.bytes,
      createDocument({ id: `writer-odt:${opened.name}`, suiteId: "writer", title }),
      {
        filterId: "writer8",
        kind: "input",
        mediaType: SwDocShell.ODT_MEDIA_TYPE,
        name: opened.name,
        source: { kind: "external", reference: opened.reference },
      },
    );
    return { name: opened.name, status: "opened" };
  } catch (error) {
    docShell.SetMediumOperation("open", "failed", generation, getWriterIoErrorMessage(error));
    throw error;
  }
}

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
            ) => paragraph.text,
          )
          .join("\n"),
        mediaType: "text/plain;charset=utf-8",
        name: filename,
      }),
  );
}

/** Saves the current graph through a confirmed browser-local medium. @param docShell - Active Writer shell. @param port - Browser persistence port. @returns Completion after acknowledgement. */
export async function saveWriterToPrimaryPort(
  docShell: SwDocShell,
  port: PrimarySavePort<WriterSnapshotState>,
): Promise<void> {
  const persist =
    /** Writes one shell-selected graph to durable browser storage. @param document - Canonical graph. @returns Confirmed generation. */ async (
      document: ReturnType<SwDocShell["GetDoc"]>,
    ) => ({
      generation: (await saveWriterDocument(port, document, docShell.GetDocumentState())).snapshot
        .version,
    });
  const state = docShell.GetDocumentState();
  const medium = docShell.GetMedium();
  if (
    medium.kind === "primary" &&
    medium.destination.kind === "storage" &&
    medium.destination.key === state.id
  )
    await docShell.Save(persist);
  else
    await docShell.SaveAs(
      {
        kind: "primary",
        name: state.title,
        source: medium.source,
        storageKey: state.id,
      },
      persist,
    );
}

/** Loads the current identity from browser-local storage. @param docShell - Active Writer shell. @param port - Browser open port. @returns Loaded/missing result. */
export async function loadWriterFromPrimaryPort(
  docShell: SwDocShell,
  port: StoredDocumentOpenPort<WriterSnapshotState>,
): Promise<"loaded" | "missing"> {
  const generation = docShell.GetDocumentState().contentGeneration;
  docShell.SetMediumOperation("open", "pending", generation);
  try {
    const result = await loadWriterDocument(port, docShell.GetDocumentState().id);
    if (result.status === "missing") {
      docShell.SetMediumOperation("none", "idle");
      return "missing";
    }
    docShell.ReplaceDocument(result.document, result.documentState, {
      filterId: "writer-browser-snapshot",
      kind: "primary",
      lastOperation: {
        generation: result.documentState.contentGeneration,
        operation: "open",
        state: "succeeded",
      },
      name: result.documentState.title,
      storageKey: result.documentState.id,
    });
    return "loaded";
  } catch (error) {
    docShell.SetMediumOperation("open", "failed", generation, getWriterIoErrorMessage(error));
    throw error;
  }
}

/** Normalizes browser adapter failures for SfxMedium diagnostics. @param error - Unknown failure. @returns Stable message. */
function getWriterIoErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}
