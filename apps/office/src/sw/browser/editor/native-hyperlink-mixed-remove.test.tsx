/** @fileoverview Verifies mounted native mixed hyperlink removal for body and cell owners. */
import { act, cleanup, render, waitFor } from "@testing-library/react";
import { afterEach, expect, it } from "vitest";
import { createWriterDocumentSession } from "../composition/writer-module";
import { WriterWorkbench } from "../presentation/writer-view";
import { WRITER_COMMAND_IDS } from "../../uiconfig/swriter/menubar/menubar-commands";
import { SwPosition } from "../../source/core/crsr/pam";
const sessions: ReturnType<typeof createWriterDocumentSession>[] = [];
afterEach(
  /** Releases actual mounted view subscriptions. @returns Nothing. */ () => {
    cleanup();
    for (const s of sessions.splice(0)) s.Close();
  },
);
it.each([false, true])(
  "mounted mixed Remove preserves text and removes both links cell=%s",
  /** Runs native UI command and history. @param cell - Original cell. @returns Completion. */ async (
    cell,
  ) => {
    const session = createWriterDocumentSession();
    sessions.push(session);
    const doc = session.docShell.GetDoc(),
      table = doc.nodes.MakeTableNode("MixedUI");
    table.AddColumnWidth(3000);
    const box = doc.nodes.AppendTableRow(table, 1).GetTabBoxes()[0],
      node = cell ? box?.GetParagraphs()[0] : doc.paragraphs[0];
    if (node === undefined) throw Error("Missing owner");
    node.SetText("abcdefgh");
    node.SetHyperlink(0, 3, { url: "https://example.test/a" });
    node.SetHyperlink(5, 8, { url: "https://example.test/b" });
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
      p = new SwPosition(node, 8),
      m = new SwPosition(node, 0);
    try {
      act(
        /** Sets actual mixed native selection. @returns Nothing. */ () => {
          shell.SetPaM(p, m);
        },
      );
    } finally {
      p.Dispose();
      m.Dispose();
    }
    expect(session.view.QueryState(WRITER_COMMAND_IDS.removeHyperlink).enabled).toBe(true);
    act(
      /** Dispatches the native command through the mounted view frame. @returns Nothing. */ () => {
        expect(session.view.Execute(WRITER_COMMAND_IDS.removeHyperlink).status).toBe("executed");
      },
    );
    await waitFor(
      /** Checks actual original rendering. @returns Nothing. */ () => {
        expect(mounted.container.querySelector('a[href="https://example.test/a"]')).toBeNull();
        expect(mounted.container.querySelector('a[href="https://example.test/b"]')).toBeNull();
      },
    );
    expect(node.GetText()).toBe("abcdefgh");
    expect(doc.GetUndoManager().GetUndoActionCount()).toBe(1);
    act(
      /** Restores both original links with one undo. @returns Nothing. */ () => {
        shell.Undo();
      },
    );
    await waitFor(
      /** Checks both rendered link owners. @returns Nothing. */ () => {
        expect(
          mounted.container.querySelector('a[href="https://example.test/a"]'),
        ).toHaveTextContent("abc");
        expect(
          mounted.container.querySelector('a[href="https://example.test/b"]'),
        ).toHaveTextContent("fgh");
      },
    );
    act(
      /** Reapplies selected native reset. @returns Nothing. */ () => {
        shell.Redo();
      },
    );
    expect(node.GetText()).toBe("abcdefgh");
  },
);
