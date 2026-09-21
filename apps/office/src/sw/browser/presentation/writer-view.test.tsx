/** @fileoverview Verifies browser projection over persistent Writer view and shell dispatch. */

import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { IDBFactory } from "fake-indexeddb";
import { describe, expect, it, vi } from "vitest";

import { createDocument } from "../../../sfx2/source/doc/objsh";
import type {
  DocumentSnapshot,
  PrimarySavePort,
  StoredDocumentOpenPort,
} from "../../../sfx2/source/doc/docfile";
import type { RecoverySavePort } from "../../../svl/source/misc/recovery";
import { createDownloadFilename } from "../../../vcl/browser/browser-download";
import {
  createWriterViewControllerFactory,
  type WriterSessionServices,
} from "../workflows/writer-workflows";
import { SwDoc } from "../../source/core/doc/doc";
import type { WriterSnapshotState } from "../../source/filter/basflt/writer-storage";
import { WRITER_COMMAND_IDS } from "../../uiconfig/swriter/menubar/menubar-commands";
import { SwDocShell } from "../../source/uibase/app/docsh";
import {
  createWriterBrowserSessionServices,
  createWriterDocumentSession,
} from "../composition/writer-module";
import { WriterWorkbench } from "./writer-view";
import { WriterViewProjection } from "./writer-view-projection";
import {
  getTestSelection,
  getNodeId,
  handleTestInput,
  setTestCursor,
  setTestSelection,
} from "../../../test/wrtsh-test-helpers";
import { SwView } from "../../source/uibase/uiview/view";

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
  const range = document.createRange();
  range.selectNodeContents(paragraph);
  const selection = window.getSelection() as Selection;
  selection.removeAllRanges();
  selection.addRange(range);
  fireEvent(
    paragraph,
    new InputEvent("beforeinput", {
      bubbles: true,
      cancelable: true,
      data: text,
      inputType: "insertReplacementText",
    }),
  );
}

describe("persistent Writer view session" /** Groups Stage 2 ownership and dispatch acceptance tests. @returns Nothing. */, function definePersistentSessionTests(): void {
  it("presents otherwise unclassified medium completion states at the browser boundary", /** Verifies presentation-only medium fallbacks. @returns Nothing. */ function presentsMediumFallbacks(): void {
    const failed = createWriterDocumentSession(createServices());
    failed.docShell.GetMedium().SetOperation("open", "failed");
    const failedMount = render(<WriterWorkbench isActive view={failed.view} />);
    expect(screen.getByText("Document operation failed.")).toBeInTheDocument();
    failedMount.unmount();
    failed.Close();

    const saving = createWriterDocumentSession(createServices());
    saving.docShell.GetMedium().SetOperation("save", "unconfirmed");
    const savingMount = render(<WriterWorkbench isActive view={saving.view} />);
    expect(screen.getByText("Saving document.")).toBeInTheDocument();
    savingMount.unmount();
    saving.Close();
  });

  it("presents recovery results through the existing Writer status bar", /** Verifies recovery feedback uses the footer status surface without an additional notice panel. @returns Nothing. */ function presentsRecoveryStatusInFooter(): void {
    const session = createWriterDocumentSession(createServices());
    const mount = render(
      <WriterWorkbench
        isActive
        recoveryNotice="Recovered document generation 5."
        view={session.view}
      />,
    );
    const statusBar = screen.getByRole("status", { name: "Writer status bar" });
    expect(statusBar).toHaveTextContent("Recovered document generation 5.");
    expect(screen.getAllByText("Recovered document generation 5.")).toHaveLength(1);
    mount.unmount();
    session.Close();
  });

  it("preserves actionable clipboard and local-storage errors in the status bar", /** Verifies exact platform errors and localized fallbacks. @returns Completion after asynchronous commands settle. */ async () => {
    const services: WriterSessionServices = {
      ...createServices(),
      primarySave: {
        save: vi
          .fn()
          .mockRejectedValueOnce(new Error("Browser storage is unavailable."))
          .mockRejectedValueOnce(new Error("quota failed")),
      },
    };
    const session = createWriterDocumentSession(services);
    const mount = render(<WriterWorkbench isActive view={session.view} />);
    session.view.Execute(WRITER_COMMAND_IDS.copy);
    await waitFor(
      /** Waits for the selection-required feedback. @returns Nothing. */ () =>
        expect(screen.getByRole("status", { name: "Writer status bar" })).toHaveTextContent(
          "Select text to copy.",
        ),
    );
    session.view.GetWrtShell().Insert("dirty");
    session.view.Execute(WRITER_COMMAND_IDS.saveLocal);
    await waitFor(
      /** Waits for the storage-unavailable feedback. @returns Nothing. */ () =>
        expect(screen.getByRole("status", { name: "Writer status bar" })).toHaveTextContent(
          "Browser storage is unavailable.",
        ),
    );
    session.view.Execute(WRITER_COMMAND_IDS.saveLocal);
    await waitFor(
      /** Waits for the generic local-save fallback. @returns Nothing. */ () =>
        expect(screen.getByRole("status", { name: "Writer status bar" })).toHaveTextContent(
          "Could not save locally.",
        ),
    );
    mount.unmount();
    session.Close();
  });

  it("edits the document title from the workspace header", /** Verifies click-to-edit commits on Enter and blur. @returns Nothing. */ function editsDocumentTitle(): void {
    const session = createWriterDocumentSession(createServices());
    const mount = render(<WriterWorkbench isActive view={session.view} />);
    const titleButton = screen.getByRole("button", { name: "Edit document title" });

    fireEvent.click(titleButton);
    const titleInput = screen.getByRole("textbox", { name: "Document title" });
    fireEvent.change(titleInput, { target: { value: "Renamed with Enter" } });
    fireEvent.keyDown(titleInput, { key: "Enter" });
    expect(session.docShell.GetDocumentState().title).toBe("Renamed with Enter");
    expect(screen.getByRole("button", { name: "Edit document title" })).toHaveTextContent(
      "Renamed with Enter",
    );

    fireEvent.click(screen.getByRole("button", { name: "Edit document title" }));
    const blurInput = screen.getByRole("textbox", { name: "Document title" });
    fireEvent.change(blurInput, { target: { value: "Renamed on blur" } });
    fireEvent.blur(blurInput);
    expect(session.docShell.GetDocumentState().title).toBe("Renamed on blur");

    fireEvent.click(screen.getByRole("button", { name: "Edit document title" }));
    const blankInput = screen.getByRole("textbox", { name: "Document title" });
    fireEvent.change(blankInput, { target: { value: "   " } });
    fireEvent.keyDown(blankInput, { key: "Escape" });
    expect(screen.getByRole("textbox", { name: "Document title" })).toBeVisible();
    fireEvent.blur(blankInput);
    expect(screen.getByRole("button", { name: "Edit document title" })).toHaveTextContent(
      "Renamed on blur",
    );

    fireEvent.click(screen.getByRole("button", { name: "Edit document title" }));
    const sameTitleInput = screen.getByRole("textbox", { name: "Document title" });
    fireEvent.change(sameTitleInput, { target: { value: "Renamed on blur" } });
    fireEvent.blur(sameTitleInput);
    expect(session.docShell.GetDocumentState().title).toBe("Renamed on blur");

    mount.unmount();
    session.Close();
  });

  it("executes domain commands without DOM through the top Writer shell" /** Verifies stable ownership identities, top-shell resolution, command metadata/state, invalidation, persistent PaM, and New replacement. @returns Completion after clipboard adapter checks. */, async function executesDomainCommands(): Promise<void> {
    const session = createWriterDocumentSession(createServices());
    const { docShell, frame, view } = session;
    const wrtShell = view.GetWrtShell();
    const cursor = wrtShell.GetCursor();
    const initialDocument = docShell.GetDoc();
    const initialSnapshot = session.viewStore.GetSnapshot();
    const projection = session.viewStore.projection;
    expect(
      projection.SetSelection(initialDocument, wrtShell, {
        point: { offset: 0, paragraphId: "missing-projection" },
      }),
    ).toBe(false);
    expect(projection.FocusParagraph(initialDocument, wrtShell, "missing-projection")).toBe(false);
    expect(
      projection.FocusParagraph(initialDocument, wrtShell, initialSnapshot.activeParagraph.id),
    ).toBe(true);
    expect(
      projection.SetSelection(initialDocument, wrtShell, {
        mark: { offset: 0, paragraphId: "missing-mark" },
        point: initialSnapshot.cursorSelection.point,
      }),
    ).toBe(false);
    expect(session.viewStore.GetSnapshot()).toBe(initialSnapshot);
    expect(frame.GetActiveView()).toBe(view);
    expect(wrtShell.GetDocShell()).toBe(docShell);
    expect(frame.GetDispatcher().GetShell(0)).toBe(wrtShell.GetListShell().GetCommandShell());
    expect(
      frame.GetDispatcher().QueryDispatch(WRITER_COMMAND_IDS.alignCenter)?.command,
    ).toMatchObject({
      capabilityId: "CAP-0112",
    });
    expect(view.QueryCommand(WRITER_COMMAND_IDS.alignCenter)?.id).toBe(
      WRITER_COMMAND_IDS.alignCenter,
    );
    expect(view.Execute("writer.missing")).toEqual({
      commandId: "writer.missing",
      status: "missing",
    });
    const dialogDispatch = view.Execute(WRITER_COMMAND_IDS.hyperlinkDialog);
    expect(dialogDispatch.status).toBe("executed");
    if (dialogDispatch.status !== "executed") throw new Error("Hyperlink command did not execute.");
    const dialogRequest = view.GetDialogController().GetSnapshot();
    if (dialogRequest === undefined) throw new Error("Hyperlink request was not published.");
    expect(view.GetDialogController().Cancel(dialogRequest.id)).toBe(true);
    await expect(dialogDispatch.value).resolves.toBe(false);
    expect(view.Execute(WRITER_COMMAND_IDS.editHyperlink).status).toBe("disabled");
    expect(
      view.Execute(WRITER_COMMAND_IDS.hyperlinkDialog, {
        hyperlink: { url: "https://example.test/direct" },
        text: "Direct link",
      }).status,
    ).toBe("executed");
    expect(
      view.Execute(WRITER_COMMAND_IDS.editHyperlink, {
        hyperlink: { url: "https://example.test/edited" },
      }).status,
    ).toBe("executed");
    expect(wrtShell.GetHyperlinkAtCursor()?.url).toBe("https://example.test/edited");
    const listener = vi.fn();
    const unsubscribe = session.viewStore.Subscribe(listener);
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
    expect(
      view.QueryState(`${WRITER_COMMAND_IDS.styleApply}?FamilyName:string=ParagraphStyles`),
    ).toEqual({ enabled: true, value: "default" });
    expect(
      /** Applies an unsupported parameter through the numeric StyleApply slot. @returns Nothing before the expected exception. */ () =>
        view.Execute(
          `${WRITER_COMMAND_IDS.styleApply}?Style:string=Missing&FamilyName:string=ParagraphStyles`,
        ),
    ).toThrow("Unsupported Writer paragraph style");
    expect(
      /** Executes StyleApply without its required request argument. @returns Nothing before the expected exception. */ () =>
        view.Execute(WRITER_COMMAND_IDS.styleApply),
    ).toThrow("Unsupported Writer paragraph style");
    expect(view.QueryState(WRITER_COMMAND_IDS.unorderedList).checked).toBe(false);
    expect(view.QueryState(WRITER_COMMAND_IDS.toggleHorizontalRuler).checked).toBe(true);
    expect(view.Execute(WRITER_COMMAND_IDS.toggleHorizontalRuler).status).toBe("executed");
    expect(view.QueryState(WRITER_COMMAND_IDS.toggleHorizontalRuler).checked).toBe(false);
    expect(view.Execute(WRITER_COMMAND_IDS.toggleHorizontalRuler).status).toBe("executed");
    expect(view.QueryState(WRITER_COMMAND_IDS.toggleSidebar).checked).toBe(true);
    expect(view.QueryState(WRITER_COMMAND_IDS.toggleStatusBar).checked).toBe(true);
    expect(session.viewStore.GetSnapshot()).not.toBe(initialSnapshot);
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
    await expect(view.Paste()).rejects.toThrow("Clipboard has no text to paste.");
    await expect(view.Paste({ clipboardHandled: true })).rejects.toThrow(
      "Clipboard has no text to paste.",
    );
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
    const paragraphId = getNodeId(shell, shell.GetActiveParagraph());
    expect(handleTestInput(shell, "insertText", "ab")).toBe(true);
    setTestSelection(shell, {
      mark: { offset: 0, paragraphId },
      point: { offset: 1, paragraphId },
    });
    session.view.Execute(WRITER_COMMAND_IDS.bold);
    setTestSelection(shell, {
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
    expect(getTestSelection(shell)).toEqual({
      mark: { offset: 2, paragraphId },
      point: { offset: 0, paragraphId },
    });
    session.view.Execute(WRITER_COMMAND_IDS.undo);
    expect(session.view.QueryState(WRITER_COMMAND_IDS.bold).mixed).toBe(true);
    expect(getTestSelection(shell)).toEqual({
      mark: { offset: 2, paragraphId },
      point: { offset: 0, paragraphId },
    });
    session.Close();
  });

  it("routes toolbar, menu, and shortcut through one command ID and survives React remount" /** Verifies shared dispatch handler/state and view lifetime independent from React. @returns Completion after async browser adapters settle. */, async function convergesCommandSurfaces(): Promise<void> {
    const services = createServices();
    const session = createWriterDocumentSession(services);
    const execute = vi.spyOn(session.frame.GetDispatcher(), "Execute");
    const boldHandler = vi.spyOn(session.view.GetWrtShell(), "ToggleCharacterFormat");
    const firstMount = render(<WriterWorkbench isActive view={session.view} />);
    const formattingToolbar = screen.getByRole("toolbar", { name: "Writer formatting toolbar" });
    fireEvent.click(
      formattingToolbar.querySelector('button[aria-label="Bold"]') as HTMLButtonElement,
    );
    expect(screen.getByRole("button", { name: "Bold" })).toHaveAttribute("aria-pressed", "true");
    fireEvent.click(screen.getByRole("button", { name: "Format" }));
    fireEvent.mouseEnter(screen.getByRole("menuitem", { name: "Text" }));
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
    ).toEqual([WRITER_COMMAND_IDS.bold, WRITER_COMMAND_IDS.bold, WRITER_COMMAND_IDS.bold]);
    expect(boldHandler).toHaveBeenCalledTimes(3);

    fireEvent.click(screen.getByRole("button", { name: "Ordered List" }));
    expect(within(formattingToolbar).getByRole("button", { name: "Bold" })).toBeVisible();
    fireEvent.click(within(formattingToolbar).getByRole("button", { name: "Increase" }));
    fireEvent.click(screen.getByRole("button", { name: "Format" }));
    fireEvent.mouseEnter(screen.getByRole("menuitem", { name: "Lists" }));
    fireEvent.click(screen.getByRole("menuitem", { name: "Promote Outline Level" }));

    enterText("Persistent session text");
    fireEvent.click(screen.getByRole("button", { name: "Edit" }));
    fireEvent.click(screen.getByRole("menuitem", { name: "Undo" }));
    fireEvent.click(screen.getByRole("button", { name: "Edit" }));
    fireEvent.click(screen.getByRole("menuitem", { name: "Redo" }));
    fireEvent.click(screen.getByRole("button", { name: "File" }));
    fireEvent.click(screen.getByRole("menuitem", { name: "Save As…" }));
    await waitFor(
      /** Waits for asynchronous ODT serialization and download dispatch. @returns Nothing. */
      () => expect(services.documentExport.export).toHaveBeenCalled(),
    );
    fireEvent.click(screen.getByRole("button", { name: "Open" }));
    await waitFor(
      /** Asserts that toolbar Open reached the injected file service. @returns Nothing. */
      () => expect(services.documentOpen.open).toHaveBeenCalled(),
    );
    const document = session.docShell.GetDoc();
    firstMount.unmount();
    const mount = render(<WriterWorkbench isActive view={session.view} />);
    expect(screen.getByRole("textbox", { name: "Writer document text" })).toHaveTextContent(
      "Persistent session text",
    );
    expect(session.docShell.GetDoc()).toBe(document);
    mount.unmount();
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

  it("creates, edits, removes, and undoes hyperlinks through upstream-aligned UI commands", /** Verifies generated placements and direct command execution share one ranged Writer attribute. @returns Completion after bindings reproject the model. */ async function editsHyperlinks(): Promise<void> {
    const session = createWriterDocumentSession(createServices());
    const shell = session.view.GetWrtShell();
    expect(handleTestInput(shell, "insertText", "Link")).toBe(true);
    setTestSelection(shell, {
      mark: { offset: 0, paragraphId: "writer-paragraph-1" },
      point: { offset: 4, paragraphId: "writer-paragraph-1" },
    });
    const mount = render(<WriterWorkbench isActive view={session.view} />);

    fireEvent.click(screen.getByRole("button", { name: "Hyperlink" }));
    expect(screen.getByRole("dialog", { name: "Hyperlink" })).toBeVisible();
    fireEvent.change(screen.getByLabelText("URL"), {
      target: { value: "https://example.test/first" },
    });
    fireEvent.change(screen.getByLabelText("Target"), { target: { value: "_blank" } });
    fireEvent.click(screen.getByRole("button", { name: "Apply" }));
    await waitFor(
      /** Waits for the accepted dialog request to reach the Writer shell. @returns Assertion result. */ () =>
        expect(screen.getByRole("link", { name: "Link" })).toHaveAttribute(
          "href",
          "https://example.test/first",
        ),
    );
    expect(shell.GetActiveParagraph().runs[0]?.hyperlink).toMatchObject({
      targetFrame: "_blank",
      url: "https://example.test/first",
    });
    expect(session.view.Execute(WRITER_COMMAND_IDS.editHyperlink).status).toBe("executed");
    expect(await screen.findByRole("dialog", { name: "Hyperlink" })).toBeVisible();
    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));
    await waitFor(
      /** Waits for cancelled edit dispatch to release the command. @returns Assertion result. */ () =>
        expect(screen.getByRole("button", { name: "Hyperlink" })).toBeEnabled(),
    );

    fireEvent.click(screen.getByRole("button", { name: "Edit" }));
    fireEvent.click(screen.getByRole("menuitem", { name: "Hyperlink…" }));
    fireEvent.change(screen.getByLabelText("URL"), {
      target: { value: "https://example.test/updated" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Apply" }));
    await waitFor(
      /** Waits for the edited hyperlink to be committed by dispatch completion. @returns Assertion result. */ () =>
        expect(shell.GetActiveParagraph().runs[0]?.hyperlink?.url).toBe(
          "https://example.test/updated",
        ),
    );

    session.view.Execute(WRITER_COMMAND_IDS.removeHyperlink);
    await waitFor(
      /** Waits for bindings invalidation to reproject the hyperlink-free model. @returns Assertion result. */ () =>
        expect(screen.queryByRole("link", { name: "Link" })).not.toBeInTheDocument(),
    );
    expect(shell.GetActiveParagraph().runs[0]?.hyperlink).toBeUndefined();
    expect(shell.Undo()).toBe(true);
    expect(shell.GetActiveParagraph().runs[0]?.hyperlink?.url).toBe("https://example.test/updated");
    mount.unmount();
    session.Close();
  });

  it("opens the hyperlink dialog by shortcut and inserts linked text at a caret", /** Covers the upstream Ctrl+K accelerator, cancel path, optional text field, and relative destinations. @returns Completion after dialog dispatch settles. */ async function insertsHyperlinkAtCaret(): Promise<void> {
    const session = createWriterDocumentSession(createServices());
    const mount = render(<WriterWorkbench isActive view={session.view} />);
    fireEvent.keyDown(window, { ctrlKey: true, key: "k" });
    expect(screen.getByRole("dialog", { name: "Hyperlink" })).toBeVisible();
    const emptyForm = screen.getByLabelText("URL").closest("form");
    if (emptyForm === null) throw new Error("Hyperlink dialog form is missing.");
    fireEvent.submit(emptyForm);
    expect(screen.getByRole("dialog", { name: "Hyperlink" })).toBeVisible();
    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));
    expect(screen.queryByRole("dialog", { name: "Hyperlink" })).not.toBeInTheDocument();

    await waitFor(
      /** Waits for the cancelled dispatch to release its command binding. @returns Assertion result. */ () =>
        expect(screen.getByRole("button", { name: "Hyperlink" })).toBeEnabled(),
    );
    fireEvent.click(screen.getByRole("button", { name: "Hyperlink" }));
    fireEvent.change(screen.getByLabelText("URL"), { target: { value: "docs/guide.html" } });
    fireEvent.change(screen.getByLabelText("Text"), { target: { value: "Guide" } });
    fireEvent.click(screen.getByRole("button", { name: "Apply" }));
    const link = await screen.findByRole("link", { name: "Guide" });
    expect(link).toHaveAttribute("href", "docs/guide.html");
    fireEvent.click(link);
    fireEvent.click(screen.getByRole("textbox", { name: "Writer document text" }));
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
    const paragraphId = getNodeId(
      session.view.GetWrtShell(),
      session.view.GetWrtShell().GetActiveParagraph(),
    );
    setTestCursor(session.view.GetWrtShell(), paragraphId, 0);
    session.view.GetWrtShell().Insert("dirty");
    const dirtyGeneration = session.docShell.GetDocumentState().contentGeneration;

    await session.view.SaveOdt();
    expect(session.docShell.GetDocumentState()).toMatchObject({
      isModified: true,
      savedGeneration: null,
    });
    expect(session.docShell.GetMedium()).toMatchObject({
      kind: "untitled",
      lastOperation: { operation: "none", state: "idle" },
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

    setTestCursor(session.view.GetWrtShell(), paragraphId, 5);
    handleTestInput(session.view.GetWrtShell(), "insertText", "!");
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
    const paragraphId = getNodeId(
      first.view.GetWrtShell(),
      first.view.GetWrtShell().GetActiveParagraph(),
    );
    setTestCursor(first.view.GetWrtShell(), paragraphId, 0);
    first.view.GetWrtShell().Insert("Recovered text");
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
    const docShell = new SwDocShell(new SwDoc(), state);
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

  it("keeps projection keys scoped to their live canonical document", /** Verifies browser keys cannot resolve into another document graph. @returns Nothing. */ function scopesProjectionKeys(): void {
    const first = new SwDoc();
    const second = new SwDoc();
    const projection = new WriterViewProjection();
    const firstNode = first.paragraphs[0];
    if (firstNode === undefined) throw new Error("First Writer document has no paragraph.");
    const projectionId = projection.GetNodeId(firstNode);
    expect(projection.GetNodeId(firstNode)).toBe(projectionId);
    expect(projection.ResolveNode(first, projectionId)).toBe(firstNode);
    expect(projection.ResolveNode(second, projectionId)).toBeUndefined();
    expect(projection.ResolveNode(first, "missing-projection")).toBeUndefined();
  });
});
