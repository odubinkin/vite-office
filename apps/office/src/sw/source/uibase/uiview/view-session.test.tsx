/** @fileoverview Verifies persistent Writer session ownership, shell dispatch, React subscription, and remount behavior. */

import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { IDBFactory } from "fake-indexeddb";
import { describe, expect, it, vi } from "vitest";

import { createDocument } from "../../../../sfx2/source/doc/objsh";
import type {
  DocumentSnapshot,
  PrimarySavePort,
  StoredDocumentOpenPort,
} from "../../../../sfx2/source/doc/docfile";
import type { RecoverySavePort } from "../../../../svl/source/misc/recovery";
import { createDownloadFilename } from "../../../../vcl/browser/browser-download";
import { createWriterViewControllerFactory } from "../../../browser/workflows/writer-workflows";
import { SwDoc } from "../../core/doc/doc";
import type { WriterSnapshotState } from "../../core/doc/writer-storage";
import { WRITER_COMMAND_IDS } from "../../../uiconfig/swriter/menubar/menubar-commands";
import { SwDocShell } from "../app/docsh";
import { createWriterBrowserSessionServices, createWriterDocumentSession } from "../app/swmodule";
import { WriterWorkbench } from "./view";
import { SwView, type WriterSessionServices } from "./view-session";

/** Creates deterministic injected browser services without requiring real platform APIs. @returns Test session services. */
function createServices(): WriterSessionServices {
  return {
    copyRichText: vi.fn(
      /** Resolves deterministic clipboard writes. @returns Completion. */ async () => undefined,
    ),
    createDownloadFilename,
    documentExport: { export: vi.fn() },
    documentOpen: {
      open: vi.fn(
        /** Resolves a cancelled deterministic file selection. @returns Undefined. */ async () =>
          undefined,
      ),
    },
    readRichClipboard: vi.fn(
      /** Returns a deterministic empty clipboard payload. @returns Empty rich/plain values. */ async () => ({
        html: "",
        plainText: "",
      }),
    ),
  };
}

/** In-memory retained recovery history shared by simulated reload sessions. */
class SessionRecoveryStorage implements RecoverySavePort<WriterSnapshotState> {
  /** Newest-first recovery histories. */
  readonly histories = new Map<string, DocumentSnapshot<WriterSnapshotState>[]>();

  /** Loads newest recovery record. @param id - Document identity. @returns Latest record. */
  async load(id: string): Promise<DocumentSnapshot<WriterSnapshotState> | undefined> {
    return this.histories.get(id)?.[0];
  }

  /** Saves one complete generation. @param snapshot - Recovery record. @returns Fulfilled completion. */
  async save(snapshot: DocumentSnapshot<WriterSnapshotState>): Promise<void> {
    const current = this.histories.get(snapshot.id) ?? [];
    this.histories.set(snapshot.id, [snapshot, ...current]);
  }

  /** Loads newest-first recovery history. @param id - Document identity. @returns Retained records. */
  async loadGenerations(id: string): Promise<readonly DocumentSnapshot<WriterSnapshotState>[]> {
    return this.histories.get(id) ?? [];
  }

  /** Deletes recovery history. @param id - Document identity. @returns Fulfilled completion. */
  async deleteGenerations(id: string): Promise<void> {
    this.histories.delete(id);
  }
}

/** Replaces the visible browser-owned editable paragraph text. @param text - Next paragraph text. @returns Nothing. */
function enterText(text: string): void {
  const paragraph = screen.getByRole("textbox", { name: "Writer document text" });
  paragraph.textContent = text;
  fireEvent.input(paragraph);
}

describe("persistent Writer view session" /** Groups Stage 2 ownership and dispatch acceptance tests. @returns Nothing. */, function definePersistentSessionTests(): void {
  it("executes domain commands without DOM through the top Writer shell" /** Verifies stable ownership identities, top-shell resolution, command metadata/state, invalidation, persistent PaM, and New replacement. @returns Completion after clipboard adapter checks. */, async function executesDomainCommands(): Promise<void> {
    const session = createWriterDocumentSession(createServices());
    const { docShell, frame, view } = session;
    const wrtShell = view.GetWrtShell();
    const cursor = wrtShell.GetCursor();
    const initialDocument = docShell.GetDoc();
    const initialSnapshot = view.GetSnapshot();
    expect(view.GetSnapshot()).toBe(initialSnapshot);
    expect(frame.GetActiveView()).toBe(view);
    expect(wrtShell.GetDocShell()).toBe(docShell);
    expect(frame.GetDispatcher().GetShell(0)).toBe(wrtShell.GetCommandShell());
    expect(
      frame.GetDispatcher().QueryDispatch(WRITER_COMMAND_IDS.alignCenter)?.command,
    ).toMatchObject({
      capabilityId: "CAP-0112",
      target: "shell",
      undoPolicy: "record",
    });
    expect(view.Execute("writer.missing")).toEqual({
      commandId: "writer.missing",
      status: "missing",
    });
    const listener = vi.fn();
    const unsubscribe = view.Subscribe(listener);
    expect(view.Execute(WRITER_COMMAND_IDS.alignCenter).status).toBe("executed");
    expect(view.Execute(WRITER_COMMAND_IDS.fontName).status).toBe("executed");
    expect(docShell.GetDoc()).toBe(initialDocument);
    expect(docShell.GetDoc().paragraphs[0]?.alignment).toBe("center");
    expect(view.QueryState(WRITER_COMMAND_IDS.alignCenter)).toMatchObject({
      checked: true,
      enabled: true,
    });
    expect(view.QueryState(WRITER_COMMAND_IDS.undo).enabled).toBe(true);
    expect(view.QueryState(WRITER_COMMAND_IDS.bold).checked).toBe(false);
    expect(view.QueryState(WRITER_COMMAND_IDS.defaultParagraphStyle)).toMatchObject({
      checked: true,
      value: "default",
    });
    expect(view.QueryState(WRITER_COMMAND_IDS.unorderedList).checked).toBe(false);
    expect(view.QueryState(WRITER_COMMAND_IDS.toggleHorizontalRuler).checked).toBe(true);
    expect(view.QueryState(WRITER_COMMAND_IDS.toggleSidebar).checked).toBe(true);
    expect(view.QueryState(WRITER_COMMAND_IDS.toggleStatusBar).checked).toBe(true);
    expect(view.GetSnapshot()).not.toBe(initialSnapshot);
    expect(wrtShell.GetCursor()).toBe(cursor);
    expect(listener).toHaveBeenCalled();
    expect(view.Execute(WRITER_COMMAND_IDS.undo).status).toBe("executed");
    expect(docShell.GetDoc().paragraphs[0]?.alignment).toBe("left");
    const sameDocShell = view.GetDocShell();
    view.Execute(WRITER_COMMAND_IDS.newDocument);
    expect(view.GetDocShell()).toBe(sameDocShell);
    expect(view.GetWrtShell()).toBe(wrtShell);
    expect(wrtShell.GetCursor()).toBe(cursor);
    expect(docShell.GetUndoManager().GetUndoActionCount()).toBe(0);
    expect(wrtShell.Undo()).toBe(false);
    expect(wrtShell.Redo()).toBe(false);
    await view.Paste();
    await view.Paste({ clipboardHandled: true });
    unsubscribe();
    session.Close();
    expect(frame.GetActiveView()).toBeUndefined();
    expect(
      /** Reads a closed view frame. @returns Nothing before the expected exception. */
      () => view.GetViewFrame(),
    ).toThrow("not attached");
  });

  it("publishes mixed formatting from the persistent directional SwPaM" /** Verifies selection state is owned by SwWrtShell, command query exposes mixed state, formatting retains direction, and Undo restores it. @returns Nothing; shell and dispatch state are asserted without DOM input. */, function publishesCanonicalSelectionState(): void {
    const session = createWriterDocumentSession(createServices());
    const shell = session.view.GetWrtShell();
    const paragraphId = shell.GetActiveParagraph().id;
    expect(shell.HandleInput("insertText", "ab")).toBe(true);
    shell.SetSelection({
      mark: { offset: 0, paragraphId },
      point: { offset: 1, paragraphId },
    });
    session.view.Execute(WRITER_COMMAND_IDS.bold);
    shell.SetSelection({
      mark: { offset: 2, paragraphId },
      point: { offset: 0, paragraphId },
    });
    expect(session.view.QueryState(WRITER_COMMAND_IDS.bold)).toMatchObject({
      checked: false,
      mixed: true,
    });
    session.view.Execute(WRITER_COMMAND_IDS.bold);
    expect(session.view.QueryState(WRITER_COMMAND_IDS.bold)).toMatchObject({
      checked: true,
      mixed: false,
    });
    expect(shell.GetCursorSelection()).toEqual({
      mark: { offset: 2, paragraphId },
      point: { offset: 0, paragraphId },
    });
    session.view.Execute(WRITER_COMMAND_IDS.undo);
    expect(session.view.QueryState(WRITER_COMMAND_IDS.bold).mixed).toBe(true);
    expect(shell.GetCursorSelection()).toEqual({
      mark: { offset: 2, paragraphId },
      point: { offset: 0, paragraphId },
    });
    session.Close();
  });

  it("routes toolbar, menu, and shortcut through one command ID and survives React remount" /** Verifies shared dispatch handler/state and view lifetime independent from React. @returns Completion after async browser adapters settle. */, async function convergesCommandSurfaces(): Promise<void> {
    const services = createServices();
    const session = createWriterDocumentSession(services);
    const execute = vi.spyOn(session.view, "Execute");
    const boldHandler = vi.spyOn(session.view.GetWrtShell(), "ToggleCharacterFormat");
    const firstMount = render(<WriterWorkbench isActive view={session.view} />);
    const formattingToolbar = screen.getByRole("toolbar", { name: "Writer formatting toolbar" });
    fireEvent.click(
      formattingToolbar.querySelector('button[aria-label="Bold"]') as HTMLButtonElement,
    );
    expect(screen.getByRole("button", { name: "Bold" })).toHaveAttribute("aria-pressed", "true");
    fireEvent.click(screen.getByRole("button", { name: "Format" }));
    fireEvent.click(screen.getByRole("menuitem", { name: "Text" }));
    fireEvent.click(screen.getByRole("menuitemcheckbox", { name: "Bold" }));
    fireEvent.keyDown(window, { ctrlKey: true, key: "b" });
    expect(
      execute.mock.calls
        .filter(
          /** Retains only Bold dispatch calls. @param call - Captured Execute arguments. @returns Whether this call targeted Bold. */
          ([commandId]) => commandId === WRITER_COMMAND_IDS.bold,
        )
        .map(
          /** Projects the command identity from one dispatch call. @param call - Captured Execute arguments. @returns Stable command ID. */
          ([commandId]) => commandId,
        ),
    ).toEqual([WRITER_COMMAND_IDS.bold, WRITER_COMMAND_IDS.bold]);
    expect(boldHandler).toHaveBeenCalledTimes(3);

    fireEvent.click(screen.getByRole("button", { name: "Ordered List" }));
    fireEvent.click(screen.getByRole("button", { name: "Demote" }));
    fireEvent.click(screen.getByRole("button", { name: "Format" }));
    fireEvent.click(screen.getByRole("menuitem", { name: "Bullets and Numbering" }));
    fireEvent.click(screen.getByRole("menuitem", { name: "Promote" }));

    enterText("Persistent session text");
    fireEvent.click(screen.getByRole("button", { name: "Edit" }));
    fireEvent.click(screen.getByRole("menuitem", { name: "Undo" }));
    fireEvent.click(screen.getByRole("button", { name: "Edit" }));
    fireEvent.click(screen.getByRole("menuitem", { name: "Redo" }));
    fireEvent.click(screen.getByRole("button", { name: "File" }));
    fireEvent.click(screen.getByRole("menuitem", { name: "Save as ODT…" }));
    await waitFor(
      /** Waits for asynchronous ODT serialization and download dispatch. @returns Nothing. */
      () => expect(services.documentExport.export).toHaveBeenCalled(),
    );
    fireEvent.click(screen.getByRole("button", { name: "Open ODT" }));
    await waitFor(
      /** Asserts that toolbar Open reached the injected file service. @returns Nothing. */
      () => expect(services.documentOpen.open).toHaveBeenCalled(),
    );
    const document = session.docShell.GetDoc();
    firstMount.unmount();
    render(<WriterWorkbench isActive view={session.view} />);
    expect(screen.getByRole("textbox", { name: "Writer document text" })).toHaveTextContent(
      "Persistent session text",
    );
    expect(session.docShell.GetDoc()).toBe(document);
    session.Close();
  });

  it("keeps inactive browser shortcuts inert" /** Verifies the frame visibility gate prevents accelerator dispatch. @returns Nothing. */, function ignoresInactiveShortcut(): void {
    const session = createWriterDocumentSession(createServices());
    const boldHandler = vi.spyOn(session.view.GetWrtShell(), "ToggleCharacterFormat");
    const mount = render(<WriterWorkbench isActive={false} view={session.view} />);
    fireEvent.keyDown(window, { ctrlKey: true, key: "b" });
    expect(boldHandler).not.toHaveBeenCalled();
    mount.unmount();
    session.Close();
  });

  it("opens and saves ODT through the existing document session" /** Verifies file lifecycle replaces the document graph without replacing frame, view, document shell, or Writer shell. @returns Completion after ODT import. */, async function preservesSessionAcrossOdtLifecycle(): Promise<void> {
    const services = createServices();
    const session = createWriterDocumentSession(services);
    const sourceBytes = await session.docShell.SerializeOdt();
    vi.mocked(services.documentOpen.open).mockResolvedValue({
      bytes: sourceBytes,
      name: "persistent.odt",
      reference: { id: "persistent-file" },
    });
    const { docShell, frame, view } = session;
    const wrtShell = view.GetWrtShell();
    await view.OpenOdt();
    await view.SaveOdt();
    expect(session).toMatchObject({ docShell, frame, view });
    expect(view.GetWrtShell()).toBe(wrtShell);
    expect(services.documentExport.export).toHaveBeenCalledWith({
      data: expect.any(Uint8Array),
      mediaType: SwDocShell.ODT_MEDIA_TYPE,
      name: "Untitled Writer Document.odt",
    });
    session.Close();
  });

  it("keeps downloads independent from the browser-local primary medium" /** Verifies UI commands use Save As for the first confirmed local write, Save thereafter, and never acknowledge downloads. @returns Completion after local persistence. */, async function separatesUiMediumOperations(): Promise<void> {
    let stored: DocumentSnapshot<WriterSnapshotState> | undefined;
    const storedDocumentOpen: StoredDocumentOpenPort<WriterSnapshotState> = {
      /** Loads the current matching fixture snapshot. @param id - Requested identity. @returns Matching snapshot or undefined. */
      load: async (id) => (stored?.id === id ? stored : undefined),
    };
    const primarySave: PrimarySavePort<WriterSnapshotState> = {
      /** Retains one complete primary snapshot. @param snapshot - Persisted snapshot. @returns Fulfilled completion. */
      save: async (snapshot) => {
        stored = snapshot;
      },
    };
    const services: WriterSessionServices = {
      ...createServices(),
      primarySave,
      storedDocumentOpen,
    };
    const session = createWriterDocumentSession(services);
    const paragraphId = session.view.GetWrtShell().GetActiveParagraph().id;
    session.view.GetWrtShell().InsertText(paragraphId, "dirty", 0, "insertText");
    const dirtyGeneration = session.docShell.GetDocumentState().contentGeneration;

    await session.view.SaveOdt();
    expect(session.docShell.GetDocumentState()).toMatchObject({
      isModified: true,
      savedGeneration: null,
    });
    expect(session.docShell.GetMedium()).toMatchObject({
      kind: "untitled",
      lastOperation: { operation: "download", state: "unconfirmed" },
    });

    await session.view.SaveLocal();
    expect(stored?.version).toBe(dirtyGeneration);
    expect(session.docShell.GetDocumentState()).toMatchObject({
      isModified: false,
      savedGeneration: dirtyGeneration,
    });
    expect(session.docShell.GetMedium()).toMatchObject({
      destination: { key: "writer-workbench", kind: "indexeddb" },
      kind: "browser-local",
      lastOperation: { operation: "save-as", state: "succeeded" },
    });

    session.view.GetWrtShell().InsertText(paragraphId, "!", 5, "insertText");
    const nextGeneration = session.docShell.GetDocumentState().contentGeneration;
    session.view.ExportText();
    expect(session.docShell.GetDocumentState()).toMatchObject({
      isModified: true,
      savedGeneration: dirtyGeneration,
    });
    await session.view.SaveLocal();
    expect(stored?.version).toBe(nextGeneration);
    expect(session.docShell.GetMedium().lastOperation).toMatchObject({
      operation: "save",
      state: "succeeded",
    });
    session.Close();
  });

  it("offers and restores the latest intact recovery snapshot after session reload" /** Verifies application-owned recovery survives shell/view recreation and remains caller-selected. @returns Completion after simulated crash reload. */, async function restoresRecoveryAfterReload(): Promise<void> {
    const recoveryStorage = new SessionRecoveryStorage();
    const first = createWriterDocumentSession({
      ...createServices(),
      recoverySave: recoveryStorage,
    });
    const paragraphId = first.view.GetWrtShell().GetActiveParagraph().id;
    first.view.GetWrtShell().InsertText(paragraphId, "Recovered text", 0, "insertText");
    await expect(first.autoRecovery?.SaveDocument("writer-workbench")).resolves.toMatchObject({
      status: "saved",
    });
    first.Close();

    const reloaded = createWriterDocumentSession({
      ...createServices(),
      recoverySave: recoveryStorage,
    });
    await expect(reloaded.GetRecoveryCandidate()).resolves.toMatchObject({
      id: "writer-workbench",
      latestGeneration: 1,
    });
    await expect(reloaded.RestoreRecovery()).resolves.toMatchObject({
      generation: 1,
      status: "restored",
    });
    expect(reloaded.docShell.GetDoc().paragraphs[0]?.text).toBe("Recovered text");
    expect(reloaded.docShell.GetDocumentState()).toMatchObject({
      isModified: true,
      recoveryGeneration: 1,
      savedGeneration: null,
    });
    await reloaded.DiscardRecovery();
    await expect(reloaded.GetRecoveryCandidate()).resolves.toBeUndefined();
    await expect(reloaded.RestoreRecovery()).resolves.toEqual({
      id: "writer-workbench",
      status: "missing",
    });
    reloaded.Close();
  });

  it("injects browser lifecycle scheduling and a fallback tab identity" /** Verifies the production composition root owns browser-only timers/listeners and can close them deterministically. @returns Nothing after adapter cleanup. */, function createsBrowserRecoveryEnvironment(): void {
    vi.stubGlobal("indexedDB", new IDBFactory());
    vi.stubGlobal("crypto", {});
    try {
      const services = createWriterBrowserSessionServices();
      expect(services.recoveryEnvironment?.isHidden()).toBe(false);
      const session = createWriterDocumentSession(services);
      expect(session.autoRecovery).toBeDefined();
      session.Close();

      const environment = services.recoveryEnvironment;
      if (environment === undefined) throw new Error("Recovery environment was not created.");
      const removePageHide = environment.onPageHide(
        /** Handles a fixture pagehide event. @returns Nothing. */ () => undefined,
      );
      const removeVisibility = environment.onVisibilityChange(
        /** Handles a fixture visibility event. @returns Nothing. */ () => undefined,
      );
      const timer = environment.setInterval(
        /** Handles a fixture interval. @returns Nothing. */ () => undefined,
        10_000,
      );
      environment.clearInterval(timer);
      removePageHide();
      removeVisibility();
    } finally {
      vi.unstubAllGlobals();
    }
  });

  it("retains explicit construction order before frame attachment" /** Verifies pre-frame invalidation remains local and dispatch requires an attached frame. @returns Nothing. */, function enforcesFrameConstructionOrder(): void {
    const state = createDocument({ id: "isolated", suiteId: "writer", title: "Isolated Writer" });
    const docShell = new SwDocShell(new SwDoc("isolated-paragraph-1"), state);
    const view = new SwView(docShell, createWriterViewControllerFactory(createServices()));
    expect(
      /** Dispatches before frame attachment. @returns Nothing before the expected exception. */
      () => view.Execute(WRITER_COMMAND_IDS.undo),
    ).toThrow("not attached");
    view.NewDocument();
    view.Close();
  });

  it("rejects attaching one Writer view to multiple frames" /** Verifies construction order remains explicit. @returns Nothing. */, function rejectsSecondFrame(): void {
    const session = createWriterDocumentSession(createServices());
    expect(
      /** Attempts a second frame attachment. @returns Nothing before the expected exception. */
      () => session.view.AttachFrame(session.frame),
    ).toThrow("already attached");
    session.Close();
  });
});
