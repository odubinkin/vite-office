/** @fileoverview Checks local key ownership before actual Writer global accelerators. */
import { act, cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { createWriterDocumentSession } from "../composition/writer-module";
import { WriterWorkbench } from "./writer-view";

const sessions: ReturnType<typeof createWriterDocumentSession>[] = [];
afterEach(
  /** Disposes listeners and owned sessions. @returns Nothing. */ () => {
    cleanup();
    vi.restoreAllMocks();
    for (const session of sessions.splice(0)) session.Close();
  },
);

/** Mounts an actual frame inside an optional local keyboard owner.
 * @param consume - Whether the enclosing owner consumes Bold.
 * @returns Owned session, editor and sidebar controls.
 */
function mountFrame(consume = false) {
  const session = createWriterDocumentSession();
  sessions.push(session);
  render(
    <div
      onKeyDown={
        /** Models a local widget handling a registered key before global dispatch.
         * @param event - Bubbling local key.
         * @returns Nothing.
         */
        (event) => {
          if (consume && event.ctrlKey && event.key === "b") event.preventDefault();
        }
      }
    >
      <WriterWorkbench
        fileDialogs={session.fileDialogs}
        isActive
        services={session.services}
        view={session.view}
      />
    </div>,
  );
  return {
    session,
    editor: screen.getByLabelText("Writer document body"),
    sidebar: within(screen.getByRole("complementary", { name: "Writer properties sidebar" })),
    bold: within(screen.getByRole("toolbar", { name: "Writer formatting toolbar" })).getByRole(
      "button",
      { name: "Bold" },
    ),
  };
}

describe("Writer accelerator ownership", /** Groups actual frame local-before-global routing. @returns Nothing. */ () => {
  for (const modifier of ["ctrlKey", "metaKey"] as const) {
    it(`executes locally handled ${modifier} SelectAll once`, /** Checks the real editor does not dispatch the same selection again. @returns Nothing. */ function selectsOnce(): void {
      const fixture = mountFrame();
      fixture.editor.focus();
      const select = vi.spyOn(fixture.session.view.GetWrtShell(), "SelectAll");
      const dispatcher = fixture.session.view.GetViewFrame().GetDispatcher();
      const lookup = vi.spyOn(dispatcher, "FindCommandByShortcut");
      const execute = vi.spyOn(dispatcher, "Execute");
      expect(fireEvent.keyDown(fixture.editor, { key: "a", [modifier]: true })).toBe(false);
      expect(select).toHaveBeenCalledOnce();
      expect(lookup).not.toHaveBeenCalled();
      expect(execute).not.toHaveBeenCalled();
      expect(fixture.editor).toHaveFocus();
    });
  }

  for (const origin of ["editor", "sidebar"] as const) {
    it(`preserves a consumed Bold key from ${origin}`, /** Checks command and model effects remain owned locally. @returns Nothing. */ function preservesConsumedCommand(): void {
      const fixture = mountFrame(true);
      const owner =
        origin === "editor"
          ? fixture.editor
          : fixture.sidebar.getByRole("button", { name: "Start" });
      owner.focus();
      const dispatcher = fixture.session.view.GetViewFrame().GetDispatcher();
      const lookup = vi.spyOn(dispatcher, "FindCommandByShortcut");
      const execute = vi.spyOn(dispatcher, "Execute");
      const generation = fixture.session.view.GetDocShell().GetDocumentState().contentGeneration;
      expect(fireEvent.keyDown(owner, { key: "b", ctrlKey: true })).toBe(false);
      expect(lookup).not.toHaveBeenCalled();
      expect(execute).not.toHaveBeenCalled();
      expect(fixture.bold).toHaveAttribute("aria-pressed", "false");
      expect(fixture.session.view.GetDocShell().GetDocumentState().contentGeneration).toBe(
        generation,
      );
      expect(owner).toHaveFocus();
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });
  }

  it("retains unconsumed Bold dispatch from the existing Sidebar", /** Checks native global fallback remains available after local rejection. @returns Nothing. */ function dispatchesUnconsumedCommand(): void {
    const fixture = mountFrame();
    const owner = fixture.sidebar.getByRole("button", { name: "Start" });
    owner.focus();
    const execute = vi.spyOn(fixture.session.view.GetViewFrame().GetDispatcher(), "Execute");
    expect(fireEvent.keyDown(owner, { key: "b", ctrlKey: true })).toBe(false);
    expect(execute).toHaveBeenCalledOnce();
    expect(owner).toHaveFocus();
    act(
      /** Inserts with the command's pending attributes. @returns Nothing. */ () => {
        fixture.session.view.GetWrtShell().Insert("ShortcutProof");
      },
    );
    expect(fixture.editor.querySelector("strong")).toHaveTextContent("ShortcutProof");
  });
});
