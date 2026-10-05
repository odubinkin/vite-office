/** @fileoverview Checks real mounted Backspace and ShiftBackspace use native list count/history. */
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { createWriterDocumentSession } from "../composition/writer-module";
import { WriterWorkbench } from "../presentation/writer-view";
import { BrowserWriterEditWindow } from "./browser-writer-edit-window";
const sessions: ReturnType<typeof createWriterDocumentSession>[] = [];
afterEach(
  /** Releases document and DOM owners. @returns Nothing. */ () => {
    cleanup();
    vi.restoreAllMocks();
    for (const s of sessions.splice(0)) s.Close();
  },
);
/** Mounts a real numbered cell and neighboring section. @param kind - Native list family. @returns Actual owners. */
function fixture(kind: "bullet" | "numbered") {
  const session = createWriterDocumentSession();
  sessions.push(session);
  const doc = session.docShell.GetDoc(),
    shell = session.view.GetWrtShell(),
    table = doc.nodes.MakeTableNode("Table1", {});
  table.AddColumnWidth(3000);
  table.AddColumnWidth(3000);
  const boxes = doc.nodes.AppendTableRow(table, 2).GetTabBoxes(),
    node = boxes[0]?.GetParagraphs()[0];
  if (node === undefined) throw new Error("Missing cell");
  node.SetText("Item");
  shell.FocusNode(node);
  shell.SetParagraphListKind(kind);
  node.SetAttrListLevel(3);
  session.docShell.GetUndoManager().Clear();
  render(
    <WriterWorkbench
      isActive
      view={session.view}
      fileDialogs={session.fileDialogs}
      services={session.services}
    />,
  );
  return {
    session,
    doc,
    shell,
    node,
    boxes,
    cell: screen.getByLabelText("Row 1 column 1 paragraph 1"),
  };
}
/** Places the DOM caret at the actual cell's start. @param cell - Rendered editable host. @returns Nothing. */
function select(cell: HTMLElement) {
  const selection = window.getSelection();
  if (selection === null) throw new Error("Missing selection");
  selection.setBaseAndExtent(cell, 0, cell, 0);
}
describe("native cell Backspace UI", /** Registers native platform intent evidence. @returns Nothing. */ () => {
  it.each(["bullet", "numbered"] as const)(
    "hides and restores %s cell numbering without deleting content",
    /** Checks keyboard modifiers and shell history. @param kind - Marker family. @returns Nothing. */ (
      kind,
    ) => {
      const f = fixture(kind);
      select(f.cell);
      const count = f.doc.nodes.entries().length;
      fireEvent.keyDown(f.cell, { key: "Backspace" });
      expect(f.node.IsCountedInList()).toBe(false);
      expect(f.cell).toHaveTextContent("Item");
      expect(f.node.GetAttrListLevel()).toBe(3);
      expect(f.doc.nodes.entries()).toHaveLength(count);
      select(f.cell);
      fireEvent.keyDown(f.cell, { key: "Backspace", shiftKey: true });
      expect(f.node.IsCountedInList()).toBe(true);
      expect(f.cell).toHaveTextContent("Item");
      act(
        /** Reverses the native count flag. @returns Nothing. */ () => {
          f.shell.Undo();
        },
      );
      expect(f.node.IsCountedInList()).toBe(false);
      act(
        /** Reapplies native count history. @returns Nothing. */ () => {
          f.shell.Redo();
        },
      );
      expect(f.node.IsCountedInList()).toBe(true);
      expect(screen.getByLabelText("Row 1 column 2 paragraph 1")).toHaveTextContent("");
      expect(f.doc.paragraphs[0]?.GetText()).toBe("");
    },
  );
  it("removes an empty uncounted cell list on virtual beforeinput without adding paragraphs", /** Checks non-keyboard input reaches the same native owner. @returns Nothing. */ () => {
    const f = fixture("numbered");
    act(
      /** Sets an empty native uncounted item. @returns Nothing. */ () => {
        f.node.SetText("");
        f.node.SetCountedInList(false);
      },
    );
    select(f.cell);
    const event = new InputEvent("beforeinput", {
      bubbles: true,
      cancelable: true,
      inputType: "deleteContentBackward",
    });
    act(
      /** Sends the platform intent. @returns Nothing. */ () => {
        f.cell.dispatchEvent(event);
      },
    );
    expect(event.defaultPrevented).toBe(true);
    expect(f.node.GetNumRule()).toBeUndefined();
    expect(f.boxes[0]?.GetParagraphs()).toEqual([f.node]);
    expect(screen.queryByLabelText("Row 1 column 1 paragraph 2")).toBeNull();
  });
  it("translates only unmodified or ShiftBackspace and suppresses stale selections", /** Checks adapter key contracts without implementing model decisions. @returns Nothing. */ () => {
    const win = { DeleteLeft: vi.fn() },
      adapter = new BrowserWriterEditWindow(
        win as unknown as ConstructorParameters<typeof BrowserWriterEditWindow>[0],
        {
          document,
          getSelection: /** Returns current DOM selection. @returns Selection. */ () =>
            window.getSelection(),
        },
        /** Ignores restoration. @returns Nothing. */ () => undefined,
      );
    const sync = vi
      .spyOn(adapter as unknown as { SynchronizeSelection: () => boolean }, "SynchronizeSelection")
      .mockReturnValue(true);
    const element = document.createElement("div");
    element.addEventListener(
      "keydown",
      /** Sends a real keyboard event through the React-shaped platform contract. @param event - Native key event. @returns Nothing. */ (
        event,
      ) =>
        adapter.HandleKeyDown({
          key: event.key,
          ctrlKey: event.ctrlKey,
          metaKey: event.metaKey,
          altKey: event.altKey,
          shiftKey: event.shiftKey,
          nativeEvent: event,
          preventDefault: /** Cancels native mutation. @returns Nothing. */ () =>
            event.preventDefault(),
        } as Parameters<typeof adapter.HandleKeyDown>[0]),
    );
    for (const init of [
      { ctrlKey: true },
      { metaKey: true },
      { altKey: true },
      { isComposing: true },
    ]) {
      const event = new KeyboardEvent("keydown", { key: "Backspace", cancelable: true, ...init });
      element.dispatchEvent(event);
      expect(event.defaultPrevented).toBe(false);
    }
    expect(win.DeleteLeft).not.toHaveBeenCalled();
    for (const shiftKey of [false, true]) {
      const event = new KeyboardEvent("keydown", { key: "Backspace", cancelable: true, shiftKey });
      element.dispatchEvent(event);
      expect(event.defaultPrevented).toBe(true);
      expect(win.DeleteLeft).toHaveBeenLastCalledWith(shiftKey);
    }
    sync.mockReturnValue(false);
    const stale = new KeyboardEvent("keydown", { key: "Backspace", cancelable: true });
    element.dispatchEvent(stale);
    expect(stale.defaultPrevented).toBe(true);
    expect(win.DeleteLeft).toHaveBeenCalledTimes(2);
  });
});
