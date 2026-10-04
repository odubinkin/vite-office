/** @fileoverview Checks ShowPanel viewport adjustment on actual owned Writer clients. */
import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { createWriterDocumentSession } from "../composition/writer-module";
import { WriterWorkbench } from "./writer-view";

const sessions: ReturnType<typeof createWriterDocumentSession>[] = [];
afterEach(
  /** Releases all owned clients and geometry spies. @returns Nothing. */ () => {
    cleanup();
    vi.restoreAllMocks();
    for (const session of sessions.splice(0)) session.Close();
  },
);

describe("Writer Sidebar ShowPanel", /** Groups real frame focus and adjustment. @returns Nothing. */ () => {
  for (const route of ["Tab", "Escape"]) {
    it(`shows the oversized Paragraph panel after ${route} title entry`, /** Checks owned model, viewport and focus without dispatch. @returns Nothing. */ function showsWriterPanel(): void {
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
      const sidebar = within(
        screen.getByRole("complementary", { name: "Writer properties sidebar" }),
      );
      const panel = sidebar.getByRole("region", { name: "Paragraph" });
      const viewport = panel.parentElement as HTMLElement;
      Object.defineProperties(viewport, {
        clientHeight: { configurable: true, value: 100 },
        clientTop: { configurable: true, value: 2 },
        scrollHeight: { configurable: true, value: 600 },
      });
      vi.spyOn(viewport, "getBoundingClientRect").mockReturnValue(new DOMRect(5, 100, 200, 100));
      vi.spyOn(panel, "getBoundingClientRect").mockImplementation(
        /** Supplies actual content coordinates after the current scroll. @returns Measured panel rectangle. */ () =>
          new DOMRect(5, 182 - viewport.scrollTop, 200, 220),
      );
      const title = sidebar.getByRole("button", { name: "Paragraph" });
      const execute = vi.spyOn(session.view.GetViewFrame().GetDispatcher(), "Execute");
      const generation = session.view.GetDocShell().GetDocumentState().contentGeneration;
      const control =
        route === "Tab"
          ? sidebar.getByRole("button", { name: "Properties" })
          : sidebar.getByRole("button", { name: "Start" });
      control.focus();
      expect(fireEvent.keyDown(control, { key: route })).toBe(false);
      expect(title).toHaveFocus();
      expect(title).toHaveAttribute("aria-expanded", "true");
      expect(viewport.scrollTop).toBe(80);
      expect(execute).not.toHaveBeenCalled();
      expect(session.view.GetDocShell().GetDocumentState().contentGeneration).toBe(generation);
      expect(sidebar.getByRole("button", { name: "Properties" })).toHaveAttribute(
        "aria-pressed",
        "true",
      );
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });
  }
});
