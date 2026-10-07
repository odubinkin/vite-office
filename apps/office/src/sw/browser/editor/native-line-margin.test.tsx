/** @fileoverview Checks real mounted Home/End uses native line owners rather than DOM mutation. */
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, expect, it } from "vitest";
import { createWriterDocumentSession } from "../composition/writer-module";
import { WriterWorkbench } from "../presentation/writer-view";
import { BrowserWriterEditWindow } from "./browser-writer-edit-window";
import { SwEditWin } from "../../source/uibase/docvw/edtwin";
import { measureWriterCursorTextLines } from "./writer-line-measurement";
import { createDocument } from "../../../sfx2/source/doc/objsh";
const sessions: ReturnType<typeof createWriterDocumentSession>[] = [];
afterEach(
  /** Releases actual views and selection listeners. @returns Nothing. */ () => {
    cleanup();
    for (const session of sessions.splice(0)) session.Close();
  },
);
/** Creates an actual mounted body/cell fixture. @param cell - Use a table paragraph. @returns Native and DOM owners. */
function fixture(cell: boolean) {
  const session = createWriterDocumentSession();
  sessions.push(session);
  const doc = session.docShell.GetDoc(),
    body = doc.paragraphs[0];
  if (body === undefined) throw Error("Missing body");
  const table = doc.nodes.MakeTableNode("Table1", {}, body);
  table.AddColumnWidth(6000);
  const row = doc.nodes.AppendTableRow(table, 1),
    node = cell ? row.GetTabBoxes()[0]?.GetParagraphs()[0] : body;
  if (node === undefined) throw Error("Missing text owner");
  node.SetText("abcdef");
  render(
    <WriterWorkbench
      isActive
      view={session.view}
      fileDialogs={session.fileDialogs}
      services={session.services}
    />,
  );
  const element = cell
    ? screen.getByLabelText("Row 1 column 1 paragraph 1")
    : screen
        .getAllByRole("textbox")
        .find(
          /** Finds the actual body paragraph. @param current - Mounted input. @returns Whether native text matches. */ (
            current,
          ) => current.textContent === "abcdef",
        );
  if (element === undefined) throw Error("Missing editable paragraph");
  return { session, doc, node, element, shell: session.view.GetWrtShell() };
}
/** Sets the direction-preserving native DOM caret. @param element - Current paragraph. @param point - Moving offset. @param mark - Fixed offset. @returns Nothing. */
function select(element: HTMLElement, point: number, mark = point): void {
  const text = element.firstChild,
    selection = window.getSelection();
  if (text === null || selection === null) throw Error("Missing DOM point");
  selection.setBaseAndExtent(text, mark, text, point);
}
it.each([false, true])(
  "ordinary Home End owns body/cell caret, reversed Shift and input cell=%s",
  /** Checks mounted selection and original graph through real shell. @param cell - Cell context. @returns Nothing. */ (
    cell,
  ) => {
    const f = fixture(cell),
      cursor = f.shell.getShellCursor();
    select(f.element, 2);
    expect(fireEvent.keyDown(f.element, { key: "End" })).toBe(false);
    expect(cursor.GetPoint().GetNode()).toBe(f.node);
    expect(cursor.GetPoint().GetContentIndex()).toBe(6);
    expect(window.getSelection()?.focusOffset).toBe(6);
    expect(fireEvent.keyDown(f.element, { key: "Home" })).toBe(false);
    expect(cursor.GetPoint().GetContentIndex()).toBe(0);
    select(f.element, 2, 4);
    expect(fireEvent.keyDown(f.element, { key: "End", shiftKey: true })).toBe(false);
    expect(cursor.GetMark().GetContentIndex()).toBe(4);
    expect(cursor.GetPoint().GetContentIndex()).toBe(6);
    expect(window.getSelection()?.anchorOffset).toBe(4);
    expect(fireEvent.keyDown(f.element, { key: "Home" })).toBe(false);
    expect(cursor.HasMark()).toBe(false);
    expect(f.doc.GetUndoManager().GetUndoActionCount()).toBe(0);
    act(
      /** Performs real native continued typing at the moved caret. @returns Nothing. */ () => {
        expect(f.shell.Insert("X")).toBe(true);
      },
    );
    expect(f.node.GetText()).toBe("Xabcdef");
    expect(f.element).toHaveTextContent("Xabcdef");
    act(
      /** Checks unchanged owners through real undo. @returns Nothing. */ () => {
        expect(f.shell.Undo()).toBe(true);
      },
    );
    expect(f.node.GetText()).toBe("abcdef");
  },
);
it("guards platform modifiers/composition and absent DOM selection", /** Checks ordinary keys are admitted only through current native geometry. @returns Nothing. */ () => {
  const f = fixture(true);
  for (const modifiers of [{ altKey: true }, { isComposing: true }]) {
    select(f.element, 2);
    expect(fireEvent.keyDown(f.element, { key: "End", ...modifiers })).toBe(true);
  }
  window.getSelection()?.removeAllRanges();
  expect(fireEvent.keyDown(f.element, { key: "Home" })).toBe(true);
  expect(f.doc.GetUndoManager().GetUndoActionCount()).toBe(0);
});

/** Calls the real adapter with a cancelable platform key. @param adapter - Real browser/native boundary. @returns Whether the key was consumed. */
function endKey(adapter: BrowserWriterEditWindow): boolean {
  const nativeEvent = new KeyboardEvent("keydown", { key: "End", cancelable: true });
  act(
    /** Delivers native intent and flushes the mounted projection publication. @returns Nothing. */ () =>
      adapter.HandleKeyDown({
        key: "End",
        ctrlKey: false,
        metaKey: false,
        altKey: false,
        shiftKey: false,
        nativeEvent,
        preventDefault: /** Cancels actual platform default behavior. @returns Nothing. */ () =>
          nativeEvent.preventDefault(),
      } as Parameters<typeof adapter.HandleKeyDown>[0]),
  );
  return nativeEvent.defaultPrevented;
}
it("unfragmented DOM ports use native text coordinates", /** Checks the public adapter's optional fragment metadata against actual DOM and model owners. @returns Nothing. */ () => {
  const f = fixture(true);
  delete f.element.dataset.writerFragmentStart;
  delete f.element.dataset.writerFragmentEnd;
  const adapter = new BrowserWriterEditWindow(
    new SwEditWin(f.shell.GetView()),
    {
      document,
      getSelection: /** Reads actual native selection. @returns Selection. */ () =>
        window.getSelection(),
    },
    /** Resolves the actual unfragmented device paragraph. @returns Paragraph. */ () =>
      f.element as HTMLParagraphElement,
  );
  select(f.element, 2);
  expect(endKey(adapter)).toBe(true);
  expect(f.shell.getShellCursor().GetPoint().GetContentIndex()).toBe(6);
  expect(f.node.GetText()).toBe("abcdef");
});
it("nullable device text and detached document geometry have explicit empty fallback", /** Checks nullable DOM port fault injection, independently of rendered-browser parity. @returns Nothing. */ () => {
  const detached = document.implementation.createHTMLDocument("Detached"),
    paragraph = detached.createElement("p");
  Object.defineProperty(paragraph, "textContent", {
    get: /** Models unavailable device text under the Node nullable port contract. @returns No readable text. */ () =>
      null,
  });
  expect(measureWriterCursorTextLines(paragraph)).toEqual([{ start: 0, end: 0, height: 240 }]);
  const f = fixture(true);
  act(
    /** Makes the real current text owner empty before device fallback. @returns Nothing. */ () =>
      f.node.SetText(""),
  );
  f.element.replaceChildren();
  delete f.element.dataset.writerFragmentStart;
  delete f.element.dataset.writerFragmentEnd;
  Object.defineProperty(f.element, "textContent", {
    configurable: true,
    get: /** Models an unavailable text port for an already empty native owner. @returns No readable text. */ () =>
      null,
  });
  const selection = window.getSelection();
  selection?.setBaseAndExtent(f.element, 0, f.element, 0);
  const adapter = new BrowserWriterEditWindow(
    new SwEditWin(f.shell.GetView()),
    {
      document,
      getSelection: /** Reads actual native selection. @returns Selection. */ () =>
        window.getSelection(),
    },
    /** Resolves the actual empty device paragraph. @returns Paragraph. */ () =>
      f.element as HTMLParagraphElement,
  );
  expect(endKey(adapter)).toBe(true);
  expect(f.shell.getShellCursor().GetPoint().GetContentIndex()).toBe(0);
  expect(f.node.GetText()).toBe("");
  delete (f.element as unknown as { textContent?: string | null }).textContent;
});
it("selection publication replacing the graph rejects stale cursor geometry", /** Checks actual native lifecycle invalidation between selection and device-frame admission. @returns Nothing. */ () => {
  const f = fixture(true),
    oldIndex = f.node.GetIndex(),
    adapter = new BrowserWriterEditWindow(
      new SwEditWin(f.shell.GetView()),
      {
        document,
        getSelection: /** Reads actual native selection. @returns Selection. */ () =>
          window.getSelection(),
      },
      /** Retains the just-read old projection during graph replacement. @returns Old paragraph. */ () =>
        f.element as HTMLParagraphElement,
    );
  const unsubscribe = f.shell.Subscribe(
    /** Replaces the actual graph once at native selection publication. @param hint - Native notification. @returns Nothing. */ (
      hint,
    ) => {
      if (
        hint.kind !== "cursor-selection-changed" &&
        !(
          hint.kind === "model-transaction" &&
          hint.hints.some(
            /** Detects the actual nested selection publication. @param nested - Source hint. @returns Whether this transaction changes selection. */ (
              nested,
            ) => nested.kind === "cursor-selection-changed",
          )
        )
      )
        return;
      unsubscribe();
      f.session.docShell.InitNew(
        createDocument({ id: "replacement", suiteId: "writer", title: "Replacement" }),
      );
    },
  );
  select(f.element, 2);
  expect(endKey(adapter)).toBe(false);
  expect(f.session.docShell.GetDoc()).not.toBe(f.doc);
  expect(f.shell.getShellCursor().GetPoint().GetNodeIndex()).not.toBe(oldIndex);
  expect(f.session.docShell.GetDoc().GetUndoManager().GetUndoActionCount()).toBe(0);
});
