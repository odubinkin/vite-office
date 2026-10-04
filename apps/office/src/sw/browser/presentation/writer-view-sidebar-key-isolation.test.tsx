/** @fileoverview Checks Sidebar local key isolation using real Writer frames and owned ports. */
import { act, cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  createWriterBrowserSessionServices,
  createWriterDocumentSession,
} from "../composition/writer-module";
import { WriterWorkbench } from "./writer-view";

const sessions: ReturnType<typeof createWriterDocumentSession>[] = [];
afterEach(
  /** Releases owned frames and spies. @returns Nothing. */ () => {
    cleanup();
    vi.restoreAllMocks();
    for (const session of sessions.splice(0)) session.Close();
  },
);

/** Mounts a selected Writer document with isolated clipboard adapters.
 * @returns Session, ports and real rendered controls.
 */
function mountWriter() {
  const write = vi.fn(
    /** Accepts a local transfer without using a system clipboard. @returns Completion. */ async () =>
      undefined,
  );
  const read = vi.fn(
    /** Supplies local clipboard data. @returns Owned transfer. */ async () => ({
      html: "",
      plainText: "ClipboardProof",
    }),
  );
  const session = createWriterDocumentSession({
    ...createWriterBrowserSessionServices(),
    copyRichText: write,
    readRichClipboard: read,
  });
  sessions.push(session);
  session.view.GetWrtShell().Insert("ProtectedSelection");
  session.view.GetWrtShell().SelectAll();
  render(
    <WriterWorkbench
      fileDialogs={session.fileDialogs}
      isActive
      services={session.services}
      view={session.view}
    />,
  );
  return {
    session,
    write,
    read,
    editor: screen.getByLabelText("Writer document body"),
    sidebar: within(screen.getByRole("complementary", { name: "Writer properties sidebar" })),
  };
}

describe("Writer Sidebar key isolation", /** Groups owned docking-boundary routing. @returns Nothing. */ () => {
  for (const sample of [
    { owner: "Start", key: "Delete", shiftKey: true, ctrlKey: false, metaKey: false },
    { owner: "More Options", key: "Insert", shiftKey: false, ctrlKey: true, metaKey: false },
    { owner: "Close Sidebar Deck", key: "Insert", shiftKey: false, ctrlKey: false, metaKey: true },
    { owner: "Properties", key: "Insert", shiftKey: true, ctrlKey: false, metaKey: false },
  ]) {
    it(`isolates ${JSON.stringify(sample)} from document clipboard commands`, /** Checks no command lookup, port use or model effect from existing Sidebar controls. @returns Completion. */ async function isolatesClipboardShortcut(): Promise<void> {
      const fixture = mountWriter();
      const owner = fixture.sidebar.getByRole("button", { name: sample.owner });
      owner.focus();
      const dispatcher = fixture.session.view.GetViewFrame().GetDispatcher();
      const lookup = vi.spyOn(dispatcher, "FindCommandByShortcut");
      const execute = vi.spyOn(dispatcher, "Execute");
      const generation = fixture.session.docShell.GetDocumentState().contentGeneration;
      const text = fixture.editor.textContent;
      await act(
        /** Delivers the key and flushes potential clipboard continuations. @returns Completion. */ async () => {
          fireEvent.keyDown(owner, sample);
          await Promise.resolve();
        },
      );
      expect(lookup).not.toHaveBeenCalled();
      expect(execute).not.toHaveBeenCalled();
      expect(fixture.write).not.toHaveBeenCalled();
      expect(fixture.read).not.toHaveBeenCalled();
      expect(fixture.session.docShell.GetDocumentState().contentGeneration).toBe(generation);
      expect(fixture.editor.textContent).toBe(text);
      expect(owner).toHaveFocus();
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });
  }

  it("retains real Undo, Redo and Bold document fallback from Sidebar", /** Checks nonlocal command keys still execute through the active frame. @returns Nothing. */ function retainsGlobalFallback(): void {
    const fixture = mountWriter();
    const owner = fixture.sidebar.getByRole("button", { name: "Start" });
    owner.focus();
    const execute = vi.spyOn(fixture.session.view.GetViewFrame().GetDispatcher(), "Execute");
    fireEvent.keyDown(owner, { key: "z", ctrlKey: true });
    expect(fixture.editor).not.toHaveTextContent("ProtectedSelection");
    owner.focus();
    fireEvent.keyDown(owner, { key: "z", ctrlKey: true, shiftKey: true });
    expect(fixture.editor).toHaveTextContent("ProtectedSelection");
    owner.focus();
    fireEvent.keyDown(owner, { key: "b", ctrlKey: true });
    expect(execute).toHaveBeenCalledTimes(3);
    expect(owner).toHaveFocus();
    expect(fixture.write).not.toHaveBeenCalled();
    expect(fixture.read).not.toHaveBeenCalled();
    act(
      /** Inserts using the fallback command's pending character attributes. @returns Nothing. */ () => {
        fixture.session.view.GetWrtShell().Insert("FallbackBold");
      },
    );
    expect(fixture.editor.querySelector("strong")).toHaveTextContent("FallbackBold");
  });
});
