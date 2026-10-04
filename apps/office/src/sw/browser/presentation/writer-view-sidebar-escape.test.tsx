/** @fileoverview Checks native Paragraph panel cancellation with actual owned Writer frames. */
import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { createWriterDocumentSession } from "../composition/writer-module";
import { WriterWorkbench } from "./writer-view";

const sessions: ReturnType<typeof createWriterDocumentSession>[] = [];
afterEach(
  /** Disposes owned presentation before its Writer frames. @returns Nothing. */ () => {
    cleanup();
    for (const session of sessions.splice(0)) session.Close();
  },
);

/** Mounts a real owned Writer client. @returns Session, editor and sidebar. */
function mountWriter() {
  const session = createWriterDocumentSession();
  sessions.push(session);
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
    editor: screen.getByLabelText("Writer document body"),
    sidebar: within(screen.getByRole("complementary", { name: "Writer properties sidebar" })),
  };
}

describe("Paragraph sidebar Escape", /** Groups native panel cancellation routes. @returns Nothing. */ () => {
  for (const control of ["Start", "No List"]) {
    it(`returns ${control} content to its title before the owning document`, /** Checks the two-stage native route without executing commands. @returns Nothing. */ function cancelsParagraphContent(): void {
      const { session, editor, sidebar } = mountWriter();
      const execute = vi.spyOn(session.view.GetViewFrame().GetDispatcher(), "Execute");
      const generation = session.view.GetDocShell().GetDocumentState().contentGeneration;
      const title = sidebar.getByRole("button", { name: "Paragraph" });
      const content = sidebar.getByRole("button", { name: control });
      content.focus();
      expect(fireEvent.keyDown(content, { key: "Escape" })).toBe(false);
      expect(title).toHaveFocus();
      expect(title).toHaveAttribute("aria-expanded", "true");
      expect(fireEvent.keyDown(title, { key: "Escape" })).toBe(false);
      expect(editor).toHaveFocus();
      expect(sidebar.getByRole("button", { name: "Properties" })).toHaveAttribute(
        "aria-pressed",
        "true",
      );
      expect(execute).not.toHaveBeenCalled();
      expect(session.view.GetDocShell().GetDocumentState().contentGeneration).toBe(generation);
    });
  }
  for (const control of ["Paragraph", "More Options"]) {
    for (const modified of [false, true]) {
      it(`returns collapsed ${control} to its document with modifiers=${modified}`, /** Checks native Escape ignores modifiers and retains panel/deck state. @returns Nothing. */ function cancelsParagraphHeader(): void {
        const { session, editor, sidebar } = mountWriter();
        const title = sidebar.getByRole("button", { name: "Paragraph" });
        fireEvent.click(title);
        const execute = vi.spyOn(session.view.GetViewFrame().GetDispatcher(), "Execute");
        const generation = session.view.GetDocShell().GetDocumentState().contentGeneration;
        const button = sidebar.getByRole("button", { name: control });
        button.focus();
        expect(
          fireEvent.keyDown(button, {
            key: "Escape",
            ctrlKey: modified,
            altKey: modified,
            shiftKey: modified,
          }),
        ).toBe(false);
        expect(editor).toHaveFocus();
        expect(title).toHaveAttribute("aria-expanded", "false");
        expect(sidebar.queryByRole("button", { name: "Start" })).not.toBeInTheDocument();
        expect(sidebar.getByRole("button", { name: "Properties" })).toHaveAttribute(
          "aria-pressed",
          "true",
        );
        expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
        expect(execute).not.toHaveBeenCalled();
        expect(session.view.GetDocShell().GetDocumentState().contentGeneration).toBe(generation);
      });
    }
  }
});
