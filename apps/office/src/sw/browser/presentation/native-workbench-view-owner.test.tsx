/** @fileoverview Verifies native workbench view ownership selects the current original store and preserves borrowed versus local lifetime. */
import { act, cleanup, render, screen } from "@testing-library/react";
import { expect, it, vi } from "vitest";
import { createWriterDocumentSession } from "../composition/writer-module";
import { WriterWorkbench } from "./writer-view";
import { WriterViewStore } from "./writer-view-projection";
import { SwRootFrame } from "../../source/core/layout/newfrm";
import { SwFormatVertOrient } from "../../inc/fmtornt";

/** Supplies a real view with explicit session-store borrowing or local ownership. @param session - Original native session. @param borrowed - Whether to borrow. @returns Actual workbench. */
function workbench(session: ReturnType<typeof createWriterDocumentSession>, borrowed: boolean) {
  return (
    <WriterWorkbench
      isActive
      view={session.view}
      {...(borrowed ? { viewStore: session.viewStore } : {})}
    />
  );
}
it.each([false, true])(
  "native workbench follows current view text, layout and original format notifications borrowed=%s",
  /** Switches actual native view owners and continues native text and cell attribute editing. @param borrowed - Session store ownership. @returns Nothing. */ (
    borrowed,
  ) => {
    const first = createWriterDocumentSession(),
      second = createWriterDocumentSession();
    first.view.GetWrtShell().Insert("First owner");
    second.view.GetWrtShell().Insert("Second owner");
    const doc = second.docShell.GetDoc(),
      table = doc.nodes.MakeTableNode("Original table", { width: 3000 }, doc.paragraphs[0]);
    table.AddColumnWidth(3000);
    const row = doc.nodes.AppendTableRow(table, 1),
      box = row.GetTabBoxes()[0];
    if (box === undefined) throw Error("Original cell absent");
    const node = box.GetParagraphs()[0];
    if (node === undefined) throw Error("Original cell paragraph absent");
    node.SetText("Native cell");
    const firstState = first.docShell.GetDocumentState(),
      secondState = second.docShell.GetDocumentState(),
      firstHistory = first.docShell.GetDoc().GetUndoManager().GetUndoActionCount(),
      secondHistory = doc.GetUndoManager().GetUndoActionCount(),
      root = second.view.GetWrtShell().GetLayout(),
      format = vi.spyOn(SwRootFrame.prototype, "Format"),
      close = vi.spyOn(WriterViewStore.prototype, "Close");
    try {
      const mounted = render(workbench(first, borrowed));
      expect(screen.getByRole("textbox", { name: "Writer document text" })).toHaveTextContent(
        "First owner",
      );
      format.mockClear();
      mounted.rerender(workbench(second, borrowed));
      expect(screen.getByRole("textbox", { name: "Writer document text" })).toHaveTextContent(
        "Second owner",
      );
      expect(format).toHaveBeenCalled();
      expect(
        format.mock.instances.every(
          /** Tests actual native layout receiver. @param receiver - Original Format receiver. @returns Whether current. */ (
            receiver,
          ) => receiver === root,
        ),
      ).toBe(true);
      expect(first.docShell.GetDocumentState()).toEqual(firstState);
      expect(second.docShell.GetDocumentState()).toEqual(secondState);
      expect(first.docShell.GetDoc().GetUndoManager().GetUndoActionCount()).toBe(firstHistory);
      expect(doc.GetUndoManager().GetUndoActionCount()).toBe(secondHistory);
      expect(close).toHaveBeenCalledTimes(borrowed ? 0 : 1);
      act(
        /** Mutates only the original current view document. @returns Nothing. */ () => {
          second.view.GetWrtShell().Insert(" edited");
        },
      );
      expect(screen.getByRole("textbox", { name: "Writer document text" })).toHaveTextContent(
        "Second owner edited",
      );
      act(
        /** Publishes original native cell item notification without a generic document mutation. @returns Nothing. */ () => {
          box.GetFrameFormat().SetFormatAttr(new SwFormatVertOrient(0, 2));
        },
      );
      const cell = screen.getByRole("textbox", { name: "Row 1 column 1 paragraph 1" });
      expect(cell).toHaveTextContent("Native cell");
      expect(cell.closest("td")).toHaveStyle({ verticalAlign: "middle" });
      expect(box.GetParagraphs()[0]).toBe(node);
      act(
        /** Mutates previous native owner independently. @returns Nothing. */ () => {
          first.view.GetWrtShell().Insert(" old edit");
        },
      );
      expect(screen.getByRole("textbox", { name: "Writer document text" })).toHaveTextContent(
        "Second owner edited",
      );
      mounted.unmount();
      expect(close).toHaveBeenCalledTimes(borrowed ? 0 : 2);
      expect(close.mock.instances).not.toContain(first.viewStore);
      expect(close.mock.instances).not.toContain(second.viewStore);
      expect(first.viewStore.GetSnapshot().paragraphs[0]?.text).toBe("First owner old edit");
      expect(second.viewStore.GetSnapshot().paragraphs[0]?.text).toBe("Second owner edited");
    } finally {
      cleanup();
      format.mockRestore();
      close.mockRestore();
      first.Close();
      second.Close();
    }
  },
);
it.each([false, true])(
  "native workbench switches store ownership both ways without closing borrowed state startBorrowed=%s",
  /** Exercises current borrowed/local lifetime with the same original native view. @param startBorrowed - Initial mode. @returns Nothing. */ (
    startBorrowed,
  ) => {
    const session = createWriterDocumentSession(),
      close = vi.spyOn(WriterViewStore.prototype, "Close");
    session.view.GetWrtShell().Insert("Original owner");
    const before = session.docShell.GetDocumentState(),
      history = session.docShell.GetDoc().GetUndoManager().GetUndoActionCount();
    try {
      const mounted = render(workbench(session, startBorrowed));
      mounted.rerender(workbench(session, !startBorrowed));
      expect(close).toHaveBeenCalledTimes(startBorrowed ? 0 : 1);
      mounted.rerender(workbench(session, startBorrowed));
      expect(close).toHaveBeenCalledTimes(1);
      expect(close.mock.instances).not.toContain(session.viewStore);
      expect(session.docShell.GetDocumentState()).toEqual(before);
      expect(session.docShell.GetDoc().GetUndoManager().GetUndoActionCount()).toBe(history);
      act(
        /** Edits through original live view after both ownership changes. @returns Nothing. */ () => {
          session.view.GetWrtShell().Insert(" remains live");
        },
      );
      expect(screen.getByRole("textbox", { name: "Writer document text" })).toHaveTextContent(
        "Original owner remains live",
      );
      mounted.unmount();
      expect(close).toHaveBeenCalledTimes(startBorrowed ? 1 : 2);
      expect(close.mock.instances).not.toContain(session.viewStore);
      expect(session.viewStore.GetSnapshot().paragraphs[0]?.text).toBe(
        "Original owner remains live",
      );
    } finally {
      cleanup();
      close.mockRestore();
      session.Close();
    }
  },
);
it("native workbench replaces an injected store for the same original view", /** Verifies useSyncExternalStore follows new store identity without claiming its lifetime. @returns Nothing. */ () => {
  const session = createWriterDocumentSession(),
    next = new WriterViewStore(session.view),
    previousRead = vi.spyOn(session.viewStore, "GetSnapshot"),
    currentRead = vi.spyOn(next, "GetSnapshot"),
    close = vi.spyOn(WriterViewStore.prototype, "Close");
  try {
    const mounted = render(
      <WriterWorkbench isActive view={session.view} viewStore={session.viewStore} />,
    );
    mounted.rerender(<WriterWorkbench isActive view={session.view} viewStore={next} />);
    previousRead.mockClear();
    currentRead.mockClear();
    act(
      /** Publishes current original view content. @returns Nothing. */ () => {
        session.view.GetWrtShell().Insert("Current subscriber");
      },
    );
    expect(screen.getByRole("textbox", { name: "Writer document text" })).toHaveTextContent(
      "Current subscriber",
    );
    expect(currentRead).toHaveBeenCalled();
    expect(previousRead).not.toHaveBeenCalled();
    mounted.unmount();
    expect(close).not.toHaveBeenCalled();
  } finally {
    cleanup();
    close.mockRestore();
    previousRead.mockRestore();
    currentRead.mockRestore();
    next.Close();
    session.Close();
  }
});
it("native workbench retains the same owned store during ordinary rerenders", /** Verifies unrelated React rerenders retain current native subscription lifetime. @returns Nothing. */ () => {
  const session = createWriterDocumentSession(),
    close = vi.spyOn(WriterViewStore.prototype, "Close");
  try {
    const mounted = render(workbench(session, false));
    mounted.rerender(workbench(session, false));
    act(
      /** Publishes actual native text after a stable rerender. @returns Nothing. */ () => {
        session.view.GetWrtShell().Insert("Stable owner");
      },
    );
    expect(screen.getByRole("textbox", { name: "Writer document text" })).toHaveTextContent(
      "Stable owner",
    );
    expect(close).not.toHaveBeenCalled();
    mounted.unmount();
    expect(close).toHaveBeenCalledTimes(1);
    expect(close.mock.instances).not.toContain(session.viewStore);
  } finally {
    cleanup();
    close.mockRestore();
    session.Close();
  }
});
