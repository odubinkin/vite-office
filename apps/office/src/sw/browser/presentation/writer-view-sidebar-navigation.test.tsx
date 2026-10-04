/** @fileoverview Checks managed Sidebar focus traversal with owned Writer frames. */
import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { createWriterDocumentSession } from "../composition/writer-module";
import { WriterWorkbench } from "./writer-view";

const sessions: ReturnType<typeof createWriterDocumentSession>[] = [];
afterEach(
  /** Disposes each owned client and frame. @returns Nothing. */ () => {
    cleanup();
    for (const session of sessions.splice(0)) session.Close();
  },
);

/** Mounts actual Writer chrome and captures its command state. @returns Owned controls and state. */
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
  const sidebar = within(screen.getByRole("complementary", { name: "Writer properties sidebar" }));
  return {
    session,
    execute: vi.spyOn(session.view.GetViewFrame().GetDispatcher(), "Execute"),
    generation: session.view.GetDocShell().GetDocumentState().contentGeneration,
    title: sidebar.getByRole("button", { name: "Paragraph" }),
    options: sidebar.getByRole("button", { name: "More Options" }),
    rail: sidebar.getByRole("button", { name: "Properties" }),
    close: sidebar.getByRole("button", { name: "Close Sidebar Deck" }),
    sidebar,
  };
}

describe("Writer Sidebar managed traversal", /** Groups native owned focus routes. @returns Nothing. */ () => {
  it("tabs through a collapsed title and toolbar before expanding into content", /** Checks focus alone leaves document state intact. @returns Nothing. */ () => {
    const owner = mountWriter();
    fireEvent.click(owner.title);
    owner.title.focus();
    expect(fireEvent.keyDown(owner.title, { key: "Tab" })).toBe(false);
    expect(owner.options).toHaveFocus();
    expect(owner.title).toHaveAttribute("aria-expanded", "false");
    expect(fireEvent.keyDown(owner.options, { key: "Tab" })).toBe(false);
    expect(owner.sidebar.getByRole("button", { name: "Start" })).toHaveFocus();
    expect(owner.title).toHaveAttribute("aria-expanded", "true");
    expect(owner.execute).not.toHaveBeenCalled();
    expect(owner.session.view.GetDocShell().GetDocumentState().contentGeneration).toBe(
      owner.generation,
    );
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("tabs between the deck toolbox, activation button and first expanded panel", /** Checks Tab does not activate the deck button. @returns Nothing. */ () => {
    const owner = mountWriter();
    fireEvent.click(owner.title);
    for (const shiftKey of [false, true]) {
      owner.close.focus();
      expect(fireEvent.keyDown(owner.close, { key: "Tab", shiftKey })).toBe(false);
      expect(owner.rail).toHaveFocus();
    }
    expect(fireEvent.keyDown(owner.rail, { key: "Tab", shiftKey: true })).toBe(false);
    expect(owner.close).toHaveFocus();
    owner.rail.focus();
    expect(fireEvent.keyDown(owner.rail, { key: "Tab" })).toBe(false);
    expect(owner.title).toHaveFocus();
    expect(owner.title).toHaveAttribute("aria-expanded", "true");
    expect(owner.rail).toHaveAttribute("aria-pressed", "true");
    expect(owner.execute).not.toHaveBeenCalled();
  });

  it("opens a closed deck when Tab enters its first panel", /** Checks native ShowPanel without button activation or command execution. @returns Nothing. */ () => {
    const owner = mountWriter();
    fireEvent.click(owner.title);
    fireEvent.click(owner.close);
    owner.rail.focus();
    expect(owner.rail).toHaveAttribute("aria-pressed", "false");
    expect(fireEvent.keyDown(owner.rail, { key: "Tab" })).toBe(false);
    expect(owner.title).toHaveFocus();
    expect(owner.title).toHaveAttribute("aria-expanded", "true");
    expect(owner.rail).toHaveAttribute("aria-pressed", "true");
    expect(owner.execute).not.toHaveBeenCalled();
  });

  for (const control of ["title", "options"] as const) {
    it(`routes ${control} arrows to the deck title and activation rail`, /** Checks all native panel boundary arrows without dispatch. @returns Nothing. */ () => {
      const owner = mountWriter();
      for (const key of ["ArrowLeft", "ArrowUp", "ArrowRight", "ArrowDown"]) {
        owner[control].focus();
        expect(fireEvent.keyDown(owner[control], { key, ctrlKey: true })).toBe(false);
        expect(key === "ArrowLeft" || key === "ArrowUp" ? owner.close : owner.rail).toHaveFocus();
      }
      expect(owner.execute).not.toHaveBeenCalled();
      expect(owner.session.view.GetDocShell().GetDocumentState().contentGeneration).toBe(
        owner.generation,
      );
    });
  }
});
