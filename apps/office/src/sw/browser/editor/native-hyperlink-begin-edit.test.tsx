/** @fileoverview Verifies mounted native beginning-of-link edit selection and cancellation for body and cell owners. */
import { act, cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, expect, it } from "vitest";
import { createWriterDocumentSession } from "../composition/writer-module";
import { WriterWorkbench } from "../presentation/writer-view";
import { SwPosition } from "../../source/core/crsr/pam";
const sessions: ReturnType<typeof createWriterDocumentSession>[] = [];
afterEach(
  /** Releases actual mounted view subscriptions. @returns Nothing. */ () => {
    cleanup();
    for (const s of sessions.splice(0)) s.Close();
  },
);
it.each([false, true])(
  "mounted begin edit selects only the original following link cell=%s",
  /** Checks actual menu/controller and native selected owners. @param cell - Native cell context. @returns Completion. */ async (
    cell,
  ) => {
    const session = createWriterDocumentSession();
    sessions.push(session);
    const doc = session.docShell.GetDoc(),
      table = doc.nodes.MakeTableNode("BeginUI");
    table.AddColumnWidth(3000);
    const box = doc.nodes.AppendTableRow(table, 1).GetTabBoxes()[0],
      node = cell ? box?.GetParagraphs()[0] : doc.paragraphs[0];
    if (node === undefined) throw Error("Missing original owner");
    node.SetText("xxaaabbb");
    node.SetHyperlink(2, 5, { url: "https://example.test/same" });
    node.SetHyperlink(5, 8, { url: "https://example.test/same" });
    doc.GetUndoManager().Clear();
    const mounted = render(
        <WriterWorkbench
          isActive
          view={session.view}
          fileDialogs={session.fileDialogs}
          services={session.services}
        />,
      ),
      shell = session.view.GetWrtShell(),
      p = new SwPosition(node, 5);
    try {
      act(
        /** Sets the original native shared-boundary caret. @returns Nothing. */ () => {
          shell.SetPaM(p);
        },
      );
    } finally {
      p.Dispose();
    }
    fireEvent.click(screen.getByRole("button", { name: /^Edit$/ }));
    const menu = screen.getByRole("menuitem", { name: "Hyperlink…" });
    expect(menu).toBeEnabled();
    fireEvent.click(menu);
    expect(await screen.findByLabelText("URL")).toHaveValue("https://example.test/same");
    expect([
      shell.GetCursor().GetPoint().GetContentIndex(),
      shell.GetCursor().GetMark().GetContentIndex(),
    ]).toEqual([8, 5]);
    fireEvent.click(screen.getByRole("button", { name: /^Cancel$/ }));
    await waitFor(
      /** Checks real dialog cancellation. @returns Nothing. */ () => {
        expect(screen.queryByLabelText("URL")).toBeNull();
      },
    );
    expect([
      shell.GetCursor().GetPoint().GetContentIndex(),
      shell.GetCursor().GetMark().GetContentIndex(),
    ]).toEqual([8, 5]);
    fireEvent.click(screen.getByRole("button", { name: /^Edit$/ }));
    fireEvent.click(screen.getByRole("menuitem", { name: "Hyperlink…" }));
    const url = await screen.findByLabelText("URL");
    fireEvent.change(url, { target: { value: "https://example.test/changed" } });
    fireEvent.click(screen.getByRole("button", { name: /^Apply$/ }));
    await waitFor(
      /** Checks actual rendered owners. @returns Nothing. */ () => {
        expect(
          mounted.container.querySelector('a[href="https://example.test/changed"]')?.textContent,
        ).toBe("bbb");
        expect(
          mounted.container.querySelector('a[href="https://example.test/same"]')?.textContent,
        ).toBe("aaa");
      },
    );
  },
);
