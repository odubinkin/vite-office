/** @fileoverview Verifies persistent Writer session ownership, shell dispatch, React subscription, and remount behavior. */

import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { createDocument } from "../../../../sfx2/source/doc/docfac";
import { createDownloadFilename } from "../../../../vcl/browser/browser-download";
import { SwDoc } from "../../core/doc/doc";
import { WRITER_COMMAND_IDS } from "../../../uiconfig/swriter/menubar/menubar-commands";
import { SwDocShell } from "../app/docsh";
import { createWriterDocumentSession } from "../app/swmodule";
import { WriterWorkbench } from "./view";
import { SwView, type WriterSessionServices } from "./view-session";

/** Creates deterministic injected browser services without requiring real platform APIs. @returns Test session services. */
function createServices(): WriterSessionServices {
  return {
    copyRichText: vi.fn(
      /** Resolves deterministic clipboard writes. @returns Completion. */ async () => undefined,
    ),
    createDownloadFilename,
    downloadBytes: vi.fn(),
    downloadPlainText: vi.fn(),
    readFile: vi.fn(
      /** Returns deterministic empty file bytes. @returns Empty bytes. */ async () =>
        new Uint8Array(),
    ),
    readRichClipboard: vi.fn(
      /** Returns a deterministic empty clipboard payload. @returns Empty rich/plain values. */ async () => ({
        html: "",
        plainText: "",
      }),
    ),
    selectFile: vi.fn(
      /** Resolves a cancelled deterministic file selection. @returns Undefined. */ async () =>
        undefined,
    ),
  };
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
    fireEvent.click(screen.getByRole("menuitem", { name: "Bold" }));
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
    fireEvent.click(screen.getByRole("button", { name: "Open ODT" }));
    await waitFor(
      /** Asserts that toolbar Open reached the injected file service. @returns Nothing. */
      () => expect(services.selectFile).toHaveBeenCalled(),
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
    const sourceBytes = session.docShell.SaveAs();
    vi.mocked(services.selectFile).mockResolvedValue(
      new File([sourceBytes as BlobPart], "persistent.odt", {
        type: SwDocShell.ODT_MEDIA_TYPE,
      }),
    );
    vi.mocked(services.readFile).mockResolvedValue(sourceBytes);
    const { docShell, frame, view } = session;
    const wrtShell = view.GetWrtShell();
    await view.OpenOdt();
    view.SaveOdt();
    expect(session).toMatchObject({ docShell, frame, view });
    expect(view.GetWrtShell()).toBe(wrtShell);
    expect(services.downloadBytes).toHaveBeenCalledWith(
      expect.any(Uint8Array),
      SwDocShell.ODT_MEDIA_TYPE,
      "Untitled Writer Document.odt",
    );
    session.Close();
  });

  it("retains explicit construction order before frame attachment" /** Verifies pre-frame invalidation remains local and dispatch requires an attached frame. @returns Nothing. */, function enforcesFrameConstructionOrder(): void {
    const docShell = new SwDocShell(
      new SwDoc(
        createDocument({ id: "isolated", suiteId: "writer", title: "Isolated Writer" }),
        "isolated-paragraph-1",
      ),
    );
    const view = new SwView(docShell, createServices());
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
