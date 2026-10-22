/** @fileoverview Calc primary browser ODS operations over actual shell/filter owners and the shared store/autosave policy. No recovery copies or alternate workbook serialization. */
import {
  IndexedDbDocumentStore,
  getUniqueDocumentTitle,
  type BrowserDocumentStore,
  type BrowserStoredDocument,
  type BrowserDocumentSummary,
} from "../../../framework/browser/storage/document-store";
import { BrowserAutosaveController } from "../../../framework/browser/workflows/document-autosave";
import { createDocument } from "../../../sfx2/source/doc/objsh";
import { ScDocShell } from "../../source/ui/docshell/docsh";
import { ScHorizontalCellIterator } from "../../inc/dociter";
import { ScAddress } from "../../inc/address";
import type { ScDocument } from "../../inc/document";
import { cellPresentation } from "../editor/cell-input";
/** Creates the suite-specific database over the shared package store. @returns Primary store. */
export function createCalcDocumentStore(): BrowserDocumentStore {
  return new IndexedDbDocumentStore("vite-office-calc-workbench");
}
/** Reads at most the first two displayed scalar words in native row-major sheet order. @param document - Canonical model. @returns Words. */
function contentWords(document: ScDocument): string[] {
  const words: string[] = [];
  for (let tab = 0; tab < document.GetTableCount(); tab++) {
    const iterator = new ScHorizontalCellIterator(
        document,
        tab,
        0,
        0,
        document.MaxCol(),
        document.MaxRow(),
      ),
      col: [number] = [0],
      row: [number] = [0];
    while (iterator.GetNext(col, row)) {
      for (const word of cellPresentation(document, new ScAddress(col[0], row[0], tab))
        .text.trim()
        .split(/\s+/u)) {
        if (word.length) words.push(word);
        if (words.length === 2) return words;
      }
    }
  }
  return words;
}
/** Preserves Writer's empty-document exclusion for primary saving. @param document - Model. @returns Has visible scalar content. */
export function hasCalcContent(document: ScDocument): boolean {
  return contentWords(document).length > 0;
}
/** Uses Writer's first-two-words browser naming policy across displayed Calc cells. @param document - Model. @returns Automatic name when ready. */
export function getAutomaticCalcTitle(document: ScDocument): string | undefined {
  const words = contentWords(document);
  return words.length === 2 ? words.join(" ") : undefined;
}
/** Saves a named independent primary copy and adopts it only after the atomic store commit. @param shell - Actual owner. @param store - Primary store. @param title - Requested name. @returns New identity. */
export async function saveCalcAsBrowserCopy(
  shell: ScDocShell,
  store: BrowserDocumentStore,
  title: string,
): Promise<string> {
  const normalized = title.trim();
  if (!normalized) throw new Error("Document name is required.");
  if (!hasCalcContent(shell.GetDocument())) throw new Error("Empty documents cannot be saved.");
  const id = crypto.randomUUID();
  await shell.SaveAs(
    {
      kind: "primary",
      name: normalized,
      storageKey: id,
      filterId: "calc8",
      mediaType: ScDocShell.ODS_MEDIA_TYPE,
    },
    /** Writes source package bytes at the shell's captured generation. @param document - Actual model. @returns Confirmed generation. */ async () => {
      const generation = shell.GetContentGeneration(),
        content = await shell.SerializeXml();
      await store.saveAs({ content, id, title: normalized, version: generation });
      return { generation };
    },
  );
  return id;
}
/** Writes dirty committed cells according to the same initial naming and medium rules as Writer. @param shell - Canonical owner. @param store - Primary store. @param imported - Persist a just-opened nonempty file. @returns Whether written. */
export async function autosaveCalc(
  shell: ScDocShell,
  store: BrowserDocumentStore,
  imported = false,
): Promise<boolean> {
  const state = shell.GetDocumentState();
  if ((!state.isModified && !imported) || !hasCalcContent(shell.GetDocument())) return false;
  if (!imported && shell.GetMedium().kind === "untitled") {
    const automatic = getAutomaticCalcTitle(shell.GetDocument());
    if (automatic === undefined) return false;
    const requested = state.title === shell.GetMedium().name ? automatic : state.title;
    await saveCalcAsBrowserCopy(
      shell,
      store,
      getUniqueDocumentTitle(requested, await store.list()),
    );
    return true;
  }
  /** Persists the exact source bytes before acknowledging their generation. @param document - Model. @returns Save evidence. */
  async function persist(): Promise<{ readonly generation: number }> {
    const captured = shell.GetDocumentState(),
      content = await shell.SerializeXml(),
      existing = (await store.list()).find(
        /** Selects current browser document metadata by identity. @param record - record. @returns Operation result. */ (
          record,
        ) => record.id === captured.id,
      );
    const record: BrowserStoredDocument = {
      content,
      id: captured.id,
      title: captured.title,
      version: captured.contentGeneration,
    };
    if (existing !== undefined && existing.title !== record.title)
      await store.rename(record, existing.title);
    else await store.save(record);
    return { generation: captured.contentGeneration };
  }
  const medium = shell.GetMedium();
  if (
    medium.kind === "primary" &&
    medium.destination.kind === "storage" &&
    medium.destination.key === state.id
  )
    await shell.Save(persist);
  else
    await shell.SaveAs(
      {
        kind: "primary",
        name: state.title,
        storageKey: state.id,
        source: medium.source,
        filterId: "calc8",
        mediaType: ScDocShell.ODS_MEDIA_TYPE,
      },
      persist,
    );
  return true;
}
/** Loads a stored ODS candidate before replacing model/view identity. @param shell - Active shell. @param store - Primary store. @param id - Saved identity. @returns Whether found. */
export async function openBrowserCalcDocument(
  shell: ScDocShell,
  store: BrowserDocumentStore,
  id: string,
): Promise<boolean> {
  const record = await store.load(id);
  if (record === undefined) return false;
  await shell.Open(
    record.content,
    createDocument({ id: record.id, suiteId: "calc", title: record.title }),
    {
      kind: "primary",
      name: record.title,
      storageKey: record.id,
      filterId: "calc8",
      mediaType: ScDocShell.ODS_MEDIA_TYPE,
    },
  );
  return true;
}
/** Atomically replaces a chosen browser record while keeping the current live graph. @param shell - Active owner. @param store - Store. @param target - Existing record. @returns Completion. */
export async function overwriteBrowserCalcDocument(
  shell: ScDocShell,
  store: BrowserDocumentStore,
  target: BrowserDocumentSummary,
): Promise<void> {
  if (!hasCalcContent(shell.GetDocument())) throw new Error("Empty documents cannot be saved.");
  if (
    shell.GetMedium().kind === "untitled" &&
    getAutomaticCalcTitle(shell.GetDocument()) === undefined
  )
    throw new Error("A new document needs at least two words before it can be saved.");
  const previousId = shell.GetDocumentId();
  await shell.SaveAs(
    {
      kind: "primary",
      name: target.title,
      storageKey: target.id,
      filterId: "calc8",
      mediaType: ScDocShell.ODS_MEDIA_TYPE,
    },
    /** Replaces bytes/identity in a single database transaction. @param document - Model. @returns Evidence. */ async () => {
      const generation = shell.GetContentGeneration(),
        content = await shell.SerializeXml();
      await store.replace(
        { content, id: target.id, title: target.title, version: generation },
        previousId,
      );
      return { generation };
    },
  );
}
/** Connects Calc content and medium state to the shared Writer autosave cadence. @param shell - Owner. @param store - Primary store. @param target - Input surface. @param now - Clock. @returns Session scheduler. */
export function createCalcAutosave(
  shell: ScDocShell,
  store: BrowserDocumentStore,
  target: Pick<Document, "addEventListener" | "removeEventListener"> = globalThis.document,
  now: () => number = Date.now,
): BrowserAutosaveController {
  return new BrowserAutosaveController(
    {
      Subscribe:
        /** Uses actual shell invalidation. @param listener - Observer. @returns Cleanup. */ (
          listener,
        ) => shell.Subscribe(listener),
      NeedsSave: /** Reads committed source dirty/content state. @returns Needs write. */ () =>
        shell.IsModified() && hasCalcContent(shell.GetDocument()),
      Save: /** Writes primary ODS. @returns Written. */ () => autosaveCalc(shell, store),
      OnError: /** Retains actual failure feedback. @param error - Failure. @returns Nothing. */ (
        error,
      ) =>
        shell.SetMediumOperation(
          "save",
          "failed",
          shell.GetContentGeneration(),
          error instanceof Error ? error.message : String(error),
        ),
    },
    target,
    now,
  );
}
