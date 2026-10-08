/** @fileoverview Primary browser ODT operations around the live Writer shell. */

import { createDocument } from "../../../sfx2/source/doc/objsh";
import { SwDoc } from "../../source/core/doc/doc";
import { SwDocShell } from "../../source/uibase/app/docsh";
import type { BrowserWriterDocument, WriterOdtStore } from "../storage/writer-odt-store";

/** Stable identity selected for a document imported from the computer. */
export interface ImportedWriterIdentity {
  readonly id: string;
  readonly title: string;
}

/** Reports whether the currently supported Writer body has visible content. @param document - Live Writer model. @returns True when at least one paragraph is nonempty. */
export function hasWriterContent(document: SwDoc): boolean {
  return document.paragraphs.some(
    /** Checks visible paragraph text. @param paragraph - Candidate paragraph. @returns Whether it has text. */
    (paragraph) => paragraph.GetText().trim().length > 0,
  );
}

/** Returns the first two whitespace-delimited words, which become an untitled document's first browser name. @param document - Live Writer model. @returns Two-word title or undefined until the threshold is reached. */
export function getAutomaticWriterTitle(document: SwDoc): string | undefined {
  const words: string[] = [];
  for (const paragraph of document.paragraphs) {
    for (const word of paragraph.GetText().trim().split(/\s+/u)) {
      if (word.length > 0) words.push(word);
      if (words.length === 2) return words.join(" ");
    }
  }
  return undefined;
}

/** Allocates the first unused browser title by appending a one-based parenthesized index. @param baseTitle - Requested display name. @param documents - Existing browser records. @returns Unique normalized title. */
export function getUniqueWriterTitle(
  baseTitle: string,
  documents: readonly BrowserWriterDocument[],
): string {
  const normalized = baseTitle.trim();
  if (normalized.length === 0) throw new Error("Document name is required.");
  const occupied = new Set(
    documents.map(
      /** Selects one occupied browser title. @param document - Stored record. @returns Record title. */ (
        document,
      ) => document.title,
    ),
  );
  if (!occupied.has(normalized)) return normalized;
  let index = 1;
  while (occupied.has(`${normalized} (${index})`)) index += 1;
  return `${normalized} (${index})`;
}

/** Derives the browser title represented by a supported imported filename. @param filename - Computer filename. @returns Extension-free title. */
export function getImportedWriterTitle(filename: string): string {
  return filename.replace(/\.(odt|txt)$/i, "") || "Imported document";
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
  const medium = docShell.GetMedium();
  if (!imported && medium.kind === "untitled") {
    const automaticTitle = getAutomaticWriterTitle(docShell.GetDoc());
    if (automaticTitle === undefined) return false;
    const requestedTitle = state.title === medium.name ? automaticTitle : state.title;
    const title = getUniqueWriterTitle(requestedTitle, await store.list());
    const id = globalThis.crypto.randomUUID();
    const generation = state.contentGeneration;
    const bytes = await docShell.SerializeOdt(undefined, title);
    await store.saveAs({ bytes, id, title, version: generation });
    docShell.AdoptSavedBrowserCopy(id, title, generation);
    return true;
  }
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
 * @param identity - Optional collision-resolved browser identity.
 * @returns Operation result.
 */ export function openWriterText(
  docShell: SwDocShell,
  bytes: Uint8Array,
  filename: string,
  identity?: ImportedWriterIdentity,
): void {
  const text = new TextDecoder("utf-8", { fatal: true }).decode(bytes).replace(/\r\n?/g, "\n");
  const title = identity?.title ?? getImportedWriterTitle(filename);
  const defaultFontDevice = docShell.GetDefaultFontDevice();
  const document = new SwDoc(defaultFontDevice === undefined ? {} : { defaultFontDevice });
  for (const [index, line] of text.split("\n").entries()) {
    const paragraph = index === 0 ? document.paragraphs[0] : document.nodes.MakeTextNode();
    paragraph?.SetText(line);
  }
  docShell.ReplaceDocument(
    document,
    createDocument({
      id: identity?.id ?? globalThis.crypto.randomUUID(),
      suiteId: "writer",
      title,
    }),
    { kind: "input", name: filename, source: { kind: "external", reference: bytes } },
  );
}
