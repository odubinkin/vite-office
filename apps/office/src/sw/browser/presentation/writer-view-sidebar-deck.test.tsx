/** @fileoverview Verifies Properties deck lifecycle in owned Writer frames without upstream access. */
import { act, cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { createWriterDocumentSession } from "../composition/writer-module";
import { WriterWorkbench } from "./writer-view";

const sessions: ReturnType<typeof createWriterDocumentSession>[] = [];
afterEach(
  /** Disposes owned frames after browser listeners. @returns Nothing. */ () => {
    cleanup();
    for (const session of sessions.splice(0)) session.Close();
  },
);

/** Mounts one real Writer frame. @param name - Frame identity. @returns Frame controls. */
function mountFrame(name = "first") {
  const session = createWriterDocumentSession();
  sessions.push(session);
  render(
    <section aria-label={`${name} frame`}>
      <WriterWorkbench
        fileDialogs={session.fileDialogs}
        isActive
        services={session.services}
        view={session.view}
      />
    </section>,
  );
  const frame = within(screen.getByLabelText(`${name} frame`));
  return { session, frame, editor: frame.getByLabelText("Writer document body") };
}

describe("Writer Properties deck lifecycle", /** Groups source-owned deck lifecycle checks. @returns Nothing. */ () => {
  it("closes only the deck and reopens retained command content without changing the document", /** Checks independent deck and global Sidebar state. @returns Nothing. */ function retainsWriterDeck(): void {
    const { session, frame, editor } = mountFrame();
    const sidebar = frame.getByRole("complementary", { name: "Writer properties sidebar" });
    const content = within(sidebar).getByRole("heading", { name: "Paragraph" });
    const generation = session.view.GetDocShell().GetDocumentState().contentGeneration;
    fireEvent.click(within(sidebar).getByRole("button", { name: "Close Sidebar Deck" }));
    expect(content).not.toBeVisible();
    expect(session.view.IsSidebarVisible()).toBe(true);
    const activation = within(sidebar).getByRole("button", { name: "Properties" });
    expect(activation).toHaveAttribute("aria-pressed", "false");
    fireEvent.click(frame.getByRole("button", { name: "View" }));
    expect(frame.getByRole("menuitemcheckbox", { name: "Sidebar" })).toHaveAttribute(
      "aria-checked",
      "true",
    );
    fireEvent.keyDown(frame.getByRole("menuitemcheckbox", { name: "Sidebar" }), { key: "Escape" });
    fireEvent.click(activation);
    expect(editor).toHaveFocus();
    expect(content).toBeVisible();
    expect(session.view.GetDocShell().GetDocumentState().contentGeneration).toBe(generation);
    fireEvent.click(within(sidebar).getByRole("button", { name: "Center" }));
    expect(within(sidebar).getByRole("button", { name: "Center" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
  });

  it("toggles the selected Properties rail and recreates an open deck after global hide", /** Checks native child-window disposal is separate from deck collapse. @returns Nothing. */ function recreatesSidebarDeck(): void {
    const { session, frame, editor } = mountFrame();
    const activation = frame.getByRole("button", { name: "Properties" });
    fireEvent.click(activation);
    expect(activation).toHaveAttribute("aria-pressed", "false");
    expect(editor).toHaveFocus();
    act(
      /** Hides the entire native-shaped Sidebar child. @returns Nothing. */ () =>
        session.view.ToggleSidebar(),
    );
    expect(frame.queryByRole("complementary")).not.toBeInTheDocument();
    act(/** Recreates the Sidebar child. @returns Nothing. */ () => session.view.ToggleSidebar());
    expect(frame.getByRole("button", { name: "Properties" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    expect(frame.getByRole("heading", { name: "Paragraph" })).toBeVisible();
  });

  it("returns focus to the owning frame without dispatch or mutation", /** Checks deck Escape and activation use the correct document client. @returns Nothing. */ function focusesOwningWriter(): void {
    const first = mountFrame();
    const second = mountFrame("second");
    const execute = vi.spyOn(second.session.view.GetViewFrame().GetDispatcher(), "Execute");
    first.editor.focus();
    const close = second.frame.getByRole("button", { name: "Close Sidebar Deck" });
    close.focus();
    fireEvent.keyDown(close, { key: "Escape" });
    expect(second.editor).toHaveFocus();
    expect(second.frame.getByRole("heading", { name: "Paragraph" })).toBeVisible();
    const activation = second.frame.getByRole("button", { name: "Properties" });
    activation.focus();
    fireEvent.keyDown(activation, { key: "Escape" });
    expect(second.editor).toHaveFocus();
    fireEvent.click(activation);
    expect(second.editor).toHaveFocus();
    expect(execute).not.toHaveBeenCalled();
    expect(first.frame.getByRole("heading", { name: "Paragraph" })).toBeVisible();
  });
});
