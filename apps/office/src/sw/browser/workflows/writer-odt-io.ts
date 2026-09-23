/** @fileoverview Primary browser ODT operations around the live Writer shell. */

import { createDocument } from "../../../sfx2/source/doc/objsh";
import { SwDoc } from "../../source/core/doc/doc";
import { SwDocShell } from "../../source/uibase/app/docsh";
import type { BrowserWriterDocument, WriterOdtStore } from "../storage/writer-odt-store";

/** Reports whether the currently supported Writer body has visible content. @param document - Live Writer model. @returns True when at least one paragraph is nonempty. */
export function hasWriterContent(document: SwDoc): boolean {
  return document.paragraphs.some(
    /** Checks visible paragraph text. @param paragraph - Candidate paragraph. @returns Whether it has text. */
    (paragraph) => paragraph.GetText().trim().length > 0,
  );
}

/** Saves a dirty Writer model, or immediately persists a newly imported nonempty document. */
/**
 * Handles the Writer browser operation.
 * @param docShell - Input value.
 * @param store - Input value.
 * @param imported - Whether the just-opened document must be saved before any edit.
 * @returns Operation result.
 */ export async function autosaveWriter(
  docShell: SwDocShell,
  store: WriterOdtStore,
  imported = false,
): Promise<boolean> {
  const state = docShell.GetDocumentState();
  if ((!state.isModified && !imported) || !hasWriterContent(docShell.GetDoc())) return false;
  const persist =
    /**
     * Handles the Writer browser operation.
     * @returns Operation result.
     */ async (): Promise<{ readonly generation: number }> => {
      const captured = docShell.GetDocumentState();
      const bytes = await docShell.SerializeOdt();
      const existing = await store.load(captured.id);
      const record: BrowserWriterDocument = {
        bytes,
        id: captured.id,
        title: captured.title,
        version: captured.contentGeneration,
      };
      if (existing !== undefined && existing.title !== record.title)
        await store.rename(record, existing.title);
      else await store.save(record);
      return { generation: captured.contentGeneration };
    };
  const medium = docShell.GetMedium();
  if (
    medium.kind === "primary" &&
    medium.destination.kind === "storage" &&
    medium.destination.key === state.id
  )
    await docShell.Save(persist);
  else
    await docShell.SaveAs(
      { kind: "primary", name: state.title, source: medium.source, storageKey: state.id },
      persist,
    );
  return true;
}

/** Saves a separate named copy and changes the active primary identity after commit. */
/**
 * Handles the Writer browser operation.
 * @param docShell - Input value.
 * @param store - Input value.
 * @param title - Input value.
 * @returns Operation result.
 */ export async function saveWriterAsBrowserCopy(
  docShell: SwDocShell,
  store: WriterOdtStore,
  title: string,
): Promise<string> {
  const normalized = title.trim();
  if (!normalized) throw new Error("Document name is required.");
  if (!hasWriterContent(docShell.GetDoc())) throw new Error("Empty documents cannot be saved.");
  const generation = docShell.GetDocumentState().contentGeneration;
  const id = globalThis.crypto.randomUUID();
  const bytes = await docShell.SerializeOdt(undefined, normalized);
  await store.saveAs({ bytes, id, title: normalized, version: generation });
  docShell.AdoptSavedBrowserCopy(id, normalized, generation);
  return id;
}

/** Opens an ODT browser copy as a new live Writer graph. */
/**
 * Handles the Writer browser operation.
 * @param docShell - Input value.
 * @param store - Input value.
 * @param id - Input value.
 * @returns Operation result.
 */ export async function openBrowserWriterDocument(
  docShell: SwDocShell,
  store: WriterOdtStore,
  id: string,
): Promise<boolean> {
  const record = await store.load(id);
  if (record === undefined) return false;
  await docShell.Open(
    record.bytes,
    createDocument({ id: record.id, suiteId: "writer", title: record.title }),
    {
      kind: "primary",
      name: record.title,
      storageKey: record.id,
      filterId: "writer8",
      mediaType: SwDocShell.ODT_MEDIA_TYPE,
    },
  );
  return true;
}

/** Imports a UTF-8 text file with paragraph breaks and fresh browser identity. */
/**
 * Handles the Writer browser operation.
 * @param docShell - Input value.
 * @param bytes - Input value.
 * @param filename - Input value.
 * @returns Operation result.
 */ export function openWriterText(
  docShell: SwDocShell,
  bytes: Uint8Array,
  filename: string,
): void {
  const text = new TextDecoder("utf-8", { fatal: true }).decode(bytes).replace(/\r\n?/g, "\n");
  const title = filename.replace(/\.txt$/i, "") || "Imported text";
  const defaultFontDevice = docShell.GetDefaultFontDevice();
  const document = new SwDoc(defaultFontDevice === undefined ? {} : { defaultFontDevice });
  for (const [index, line] of text.split("\n").entries()) {
    const paragraph = index === 0 ? document.paragraphs[0] : document.nodes.MakeTextNode();
    paragraph?.SetText(line);
  }
  docShell.ReplaceDocument(
    document,
    createDocument({ id: globalThis.crypto.randomUUID(), suiteId: "writer", title }),
    { kind: "untitled", name: title },
  );
}
