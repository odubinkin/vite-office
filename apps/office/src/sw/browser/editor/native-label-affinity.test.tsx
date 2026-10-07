/** @fileoverview Verifies actual mounted native label affinity and DOM Selection roundtrips. */
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import type { MouseEvent } from "react";
import { BrowserWriterEditWindow } from "./browser-writer-edit-window";
import { selectMountedTableRow } from "../../../../test-support/table-mouse-dom";
import { createWriterDocumentSession } from "../composition/writer-module";
import { WriterWorkbench } from "../presentation/writer-view";
import { applyWriterParagraphList } from "../../source/core/doc/list";
import {
  BrowserWriterSelectionMapper,
  getWriterDomSelection,
  restoreWriterDomSelection,
} from "./writer-selection";
const sessions: ReturnType<typeof createWriterDocumentSession>[] = [];
afterEach(
  /** Unmounts before native session disposal. @returns Nothing. */ () => {
    cleanup();
    for (const session of sessions.splice(0)) session.Close();
    vi.restoreAllMocks();
  },
);
/** Creates a mounted original body/cell paragraph and list marker. @param cell - Cell context. @returns Native and DOM owners. */
function fixture(cell: boolean) {
  const session = createWriterDocumentSession();
  sessions.push(session);
  const doc = session.docShell.GetDoc(),
    body = doc.paragraphs[0];
  if (body === undefined) throw Error("Missing body");
  const table = doc.nodes.MakeTableNode("Labels");
  table.AddColumnWidth(6000);
  const node = cell
    ? doc.nodes.AppendTableRow(table, 1).GetTabBoxes()[0]?.GetParagraphs()[0]
    : body;
  if (node === undefined) throw Error("Missing node");
  node.SetText("Alpha");
  applyWriterParagraphList(node, { kind: cell ? "numbered" : "bullet", level: 0 });
  render(<WriterWorkbench isActive view={session.view} />);
  const element = cell
    ? screen.getByLabelText("Row 1 column 1 paragraph 1")
    : screen
        .getAllByRole("textbox")
        .find(
          /** Locates actual text. @param e - Candidate. @returns Whether matches. */ (e) =>
            e.textContent === "Alpha",
        );
  if (!(element instanceof HTMLParagraphElement)) throw Error("Missing paragraph");
  const marker = element.parentElement?.querySelector<HTMLElement>("[data-writer-list-marker]");
  if (marker == null) throw Error("Missing marker");
  return { session, doc, node, element, marker, shell: session.view.GetWrtShell() };
}
/** Sets actual text coordinates. @param element - Current paragraph. @param offset - UTF16 text offset. @returns Nothing. */
function textCaret(element: HTMLParagraphElement, offset: number): void {
  const text = element.firstChild,
    selection = window.getSelection();
  if (text === null || selection === null) throw Error("No caret");
  selection.setBaseAndExtent(text, offset, text, offset);
}
it.each([false, true])(
  "mounted repeated Home paints native label and End clears cell=%s",
  /** Checks actual DOM/native cursor owner and continued native editing. @param cell - Cell context. @returns Nothing. */ (
    cell,
  ) => {
    const f = fixture(cell),
      cursor = f.shell.getShellCursor();
    textCaret(f.element, 2);
    expect(fireEvent.keyDown(f.element, { key: "Home" })).toBe(false);
    expect(f.shell.IsInFrontOfLabel()).toBe(false);
    expect(fireEvent.keyDown(f.element, { key: "Home" })).toBe(false);
    expect(f.shell.IsInFrontOfLabel()).toBe(true);
    expect(getWriterDomSelection(window.getSelection())?.point).toEqual({
      paragraphId: f.element.dataset.writerParagraphId,
      nodeIndex: f.node.GetIndex(),
      offset: 0,
      inFrontOfLabel: true,
      ...(cell ? { inRepeatedHeadline: false } : {}),
    });
    expect(f.marker.querySelector("[data-writer-label-caret]")).not.toBeNull();
    expect(f.marker).toHaveAttribute("contenteditable", "false");
    expect(f.element.parentElement).toHaveStyle({ "caret-color": "rgba(0, 0, 0, 0)" });
    expect(fireEvent.keyDown(f.element, { key: "Home" })).toBe(false);
    expect(f.shell.IsInFrontOfLabel()).toBe(true);
    fireEvent(window.document, new Event("selectionchange"));
    expect(f.shell.IsInFrontOfLabel()).toBe(true);
    expect(fireEvent.keyDown(f.element, { key: "End" })).toBe(false);
    expect(f.shell.IsInFrontOfLabel()).toBe(false);
    expect(f.marker.querySelector("[data-writer-label-caret]")).toBeNull();
    expect(cursor.GetPoint().GetContentIndex()).toBe(5);
    fireEvent.mouseDown(f.marker, { button: 0, clientX: 999, clientY: 999 });
    expect(f.shell.IsInFrontOfLabel()).toBe(true);
    expect(cursor.GetPoint().GetNode()).toBe(f.node);
    expect(cursor.GetPoint().GetContentIndex()).toBe(0);
    expect(f.doc.GetUndoManager().GetUndoActionCount()).toBe(0);
    act(
      /** Types through the real edit window with native label selection. @returns Nothing. */ () => {
        f.element.closest("[data-writer-editing-host]")?.dispatchEvent(
          new InputEvent("beforeinput", {
            inputType: "insertText",
            data: "X",
            bubbles: true,
            cancelable: true,
          }),
        );
      },
    );
    expect(f.node.GetText()).toBe("XAlpha");
    expect(f.shell.IsInFrontOfLabel()).toBe(false);
    expect(f.marker.querySelector("[data-writer-label-caret]")).toBeNull();
    expect(f.element).toHaveTextContent("XAlpha");
    act(
      /** Undoes through the persistent native shell. @returns Nothing. */ () => {
        expect(f.shell.Undo()).toBe(true);
      },
    );
    expect(f.node.GetText()).toBe("Alpha");
    expect(cursor.GetPoint().GetNode()).toBe(f.node);
  },
);
it("label DOM mapper distinguishes text0, skips equal labels and guards missing markers", /** Checks real browser Selection endpoints without synthetic cursor ownership. @returns Nothing. */ () => {
  const f = fixture(false),
    id = f.element.dataset.writerParagraphId as string,
    mapper = new BrowserWriterSelectionMapper(
      {
        document,
        getSelection: /** Reads native selection. @returns Current selection. */ () =>
          window.getSelection(),
      },
      /** Resolves actual paragraph. @returns Mounted paragraph. */ () => f.element,
    ),
    cursor = { point: { paragraphId: id, offset: 0, inFrontOfLabel: true } };
  textCaret(f.element, 0);
  expect(mapper.Read()?.point.inFrontOfLabel).toBeUndefined();
  expect(mapper.Restore(cursor)).toBe(true);
  expect(mapper.Read()?.point.inFrontOfLabel).toBe(true);
  const focus = window.getSelection()?.focusNode;
  expect(mapper.Restore(cursor)).toBe(true);
  expect(window.getSelection()?.focusNode).toBe(focus);
  expect(mapper.Restore({ point: { paragraphId: id, offset: 0 } })).toBe(true);
  expect(mapper.Read()?.point.inFrontOfLabel).toBeUndefined();
  f.marker.dataset.writerListMarker = "different-owner";
  expect(mapper.Restore(cursor)).toBe(false);
  f.marker.remove();
  expect(mapper.Restore(cursor)).toBe(false);
  expect(
    restoreWriterDomSelection(
      cursor,
      /** Represents an unmounted owner. @returns No paragraph. */ () => undefined,
      window.getSelection(),
    ),
  ).toBe(false);
  const orphan = document.createElement("span");
  orphan.dataset.writerListMarker = id;
  document.body.append(orphan);
  window.getSelection()?.setBaseAndExtent(orphan, 0, orphan, 0);
  expect(mapper.Read()).toBeUndefined();
  orphan.remove();
});

it("native label boundary retains backward table-fragment ranges and rejects foreign adjacent owners", /** Checks current native endpoint restoration after the Chromium boundary correction. @returns Nothing. */ () => {
  const f = fixture(true),
    id = f.element.dataset.writerParagraphId as string,
    selection = window.getSelection() as Selection;
  const follow = document.createElement("p");
  follow.dataset.writerParagraphId = id;
  follow.dataset.writerFragmentStart = "3";
  follow.dataset.writerNodeIndex = String(f.node.GetIndex());
  follow.textContent = "ha";
  f.element.closest("[data-writer-editing-host]")?.append(follow);
  const resolve =
    /** Resolves current source offsets to actual mounted occurrences. @param owner - Paragraph identity. @param offset - Model offset. @returns Mounted fragment. */ (
      owner: string,
      offset = 0,
    ) => (owner === id ? (offset >= 3 ? follow : f.element) : undefined);
  const label = { point: { paragraphId: id, offset: 0, inFrontOfLabel: true } };
  expect(restoreWriterDomSelection(label, resolve, selection)).toBe(true);
  expect(selection.focusNode).toBe(f.marker.parentNode);
  expect(selection.focusOffset).toBe(
    Array.from((f.marker.parentNode as Node).childNodes).indexOf(f.marker) + 1,
  );
  expect(getWriterDomSelection(selection)?.point.inFrontOfLabel).toBe(true);
  // A decoration hit and both surrounding boundaries resolve to the same native label.
  selection.setBaseAndExtent(f.marker, 0, f.marker, 0);
  expect(getWriterDomSelection(selection)?.point.offset).toBe(0);
  selection.setBaseAndExtent(f.marker.firstChild as Node, 0, f.marker.firstChild as Node, 0);
  expect(getWriterDomSelection(selection)?.point.inFrontOfLabel).toBe(true);
  const parent = f.marker.parentNode as Node,
    index = Array.from(parent.childNodes).indexOf(f.marker);
  selection.setBaseAndExtent(parent, index, parent, index);
  expect(getWriterDomSelection(selection)?.point.inFrontOfLabel).toBe(true);
  const backwards = { mark: { paragraphId: id, offset: 4 }, point: { paragraphId: id, offset: 1 } };
  expect(restoreWriterDomSelection(backwards, resolve, selection)).toBe(true);
  expect(selection.anchorNode).toBe(follow.firstChild);
  expect(selection.anchorOffset).toBe(1);
  expect(selection.focusNode).toBe(f.element.firstChild);
  expect(selection.focusOffset).toBe(1);
  expect(getWriterDomSelection(selection)?.point.offset).toBe(1);
  expect(getWriterDomSelection(selection)?.mark?.offset).toBe(4);
  expect(
    restoreWriterDomSelection(
      { ...backwards, mark: { paragraphId: "unmounted", offset: 4 } },
      resolve,
      selection,
    ),
  ).toBe(false);
  expect(
    restoreWriterDomSelection(
      { point: { paragraphId: "unmounted", offset: 0 } },
      resolve,
      selection,
    ),
  ).toBe(false);
  expect(
    restoreWriterDomSelection({ point: { paragraphId: id, offset: 0 } }, resolve, selection),
  ).toBe(true);
  expect(getWriterDomSelection(selection)?.point.inFrontOfLabel).toBeUndefined();
  const host = f.element.closest<HTMLElement>("[data-writer-editing-host]") as HTMLElement;
  host.focus();
  expect(restoreWriterDomSelection(label, resolve, selection)).toBe(true);
  const oldId = f.marker.dataset.writerListMarker;
  f.marker.dataset.writerListMarker = "foreign";
  selection.setBaseAndExtent(f.marker, 0, f.marker, 0);
  expect(getWriterDomSelection(selection)).toBeUndefined();
  expect(restoreWriterDomSelection(label, resolve, selection)).toBe(false);
  f.marker.dataset.writerListMarker = oldId;
  const oldIndex = f.element.dataset.writerNodeIndex;
  delete f.element.dataset.writerNodeIndex;
  expect(restoreWriterDomSelection(label, resolve, selection)).toBe(true);
  expect(getWriterDomSelection(selection)?.point.nodeIndex).toBeUndefined();
  f.element.dataset.writerNodeIndex = oldIndex;
  f.element
    .closest("[data-writer-table-box]")
    ?.setAttribute("data-writer-repeated-headline", "true");
  expect(getWriterDomSelection(selection)?.point.inRepeatedHeadline).toBe(true);
  f.marker.remove();
  expect(restoreWriterDomSelection(label, resolve, selection)).toBe(false);
  const orphan = document.createElement("span");
  orphan.dataset.writerListMarker = id;
  host.append(orphan);
  selection.setBaseAndExtent(orphan, 0, orphan, 0);
  expect(getWriterDomSelection(selection)).toBeUndefined();
  orphan.remove();
  follow.remove();
});

it("native marker pointer preserves table-border priority and guards missing platform selection", /** Checks competing native gestures on the same numbered cell label, including stale DOM owners. @returns Nothing. */ () => {
  const f = fixture(true),
    host = f.element.closest<HTMLElement>("[data-writer-editing-host]") as HTMLElement;
  expect(selectMountedTableRow("Labels", 1)).toBe(true);
  expect(f.shell.HasBoxSelection()).toBe(true);
  expect(fireEvent.mouseDown(f.marker, { button: 0, detail: 0, clientX: 999, clientY: 999 })).toBe(
    false,
  );
  expect(f.shell.HasBoxSelection()).toBe(false);
  expect(f.shell.IsInFrontOfLabel()).toBe(false);
  expect(fireEvent.mouseDown(f.marker, { button: 0, detail: 1, clientX: 999, clientY: 999 })).toBe(
    false,
  );
  expect(f.shell.IsInFrontOfLabel()).toBe(true);
  expect(fireEvent.mouseDown(f.marker, { button: 2, detail: 1, clientX: 999, clientY: 999 })).toBe(
    true,
  );
  const cursor = f.shell.getShellCursor();
  const controller = new BrowserWriterEditWindow(
    f.session.view.GetEditWin(),
    {
      document,
      getSelection: /** Models unavailable platform selection. @returns No selection. */ () => null,
    },
    /** Resolves the actual current native node. @returns Mounted paragraph. */ () => f.element,
  );
  const event =
    /** Builds a platform event with an actual current root. @param target - Native event target. @returns Pointer event. */ (
      target: EventTarget,
    ) =>
      ({
        target,
        currentTarget: host,
        button: 0,
        detail: 1,
        clientX: 999,
        clientY: 999,
        preventDefault: vi.fn(),
      }) as unknown as MouseEvent<HTMLElement>;
  controller.HandlePointerDown(event(f.marker));
  expect(cursor.GetPoint().GetNode()).toBe(f.node);
  controller.HandlePointerDown(event(f.element.firstChild as Node));
  const selectedController = new BrowserWriterEditWindow(
    f.session.view.GetEditWin(),
    {
      document,
      getSelection: /** Reads the actual platform selection. @returns Current selection. */ () =>
        window.getSelection(),
    },
    /** Resolves the current paragraph. @returns Paragraph. */ () => f.element,
  );
  const nodeIndex = f.element.dataset.writerNodeIndex;
  delete f.element.dataset.writerNodeIndex;
  const stale = event(f.marker);
  selectedController.HandlePointerDown(stale);
  expect(stale.preventDefault).not.toHaveBeenCalled();
  f.element.dataset.writerNodeIndex = nodeIndex;
  const detached = document.createElement("span");
  detached.dataset.writerListMarker = "absent";
  selectedController.HandlePointerDown(event(detached));
  expect(f.doc.GetUndoManager().GetUndoActionCount()).toBe(0);
  const table = f.element.closest("table") as HTMLTableElement;
  for (const element of [table, ...table.querySelectorAll("tr,td,th")])
    element.getBoundingClientRect =
      /** Supplies literal device frame edges after the prior gutter helper restored own getters. @returns Physical rectangle. */ () => ({
        x: 100,
        y: 100,
        left: 100,
        top: 100,
        right: 200,
        bottom: 150,
        width: 100,
        height: 50,
        toJSON: /** Serializes the device bounds. @returns Nothing. */ () => undefined,
      });
  expect(fireEvent.mouseDown(f.marker, { button: 0, detail: 1, clientX: 93, clientY: 125 })).toBe(
    false,
  );
  fireEvent.mouseUp(document, { button: 0, clientX: 93, clientY: 125 });
  expect(f.shell.getShellCursor().GetPoint().GetNode()).toBe(f.node);
  expect(f.shell.HasBoxSelection()).toBe(true);
  fireEvent.mouseDown(f.marker, { button: 0, detail: 1, clientX: 999, clientY: 999 });
  expect(f.shell.HasBoxSelection()).toBe(false);
  expect(fireEvent.mouseDown(f.marker, { button: 0, detail: 1, clientX: 200, clientY: 125 })).toBe(
    false,
  );
  expect(f.session.view.GetEditWin().GetTableBorderDragPosition()).toBeDefined();
  fireEvent.keyDown(document, { key: "Escape" });
  expect(f.session.view.GetEditWin().GetTableBorderDragPosition()).toBeUndefined();
});

it("standalone native label restore focuses its paragraph without fabricating an editing host", /** Checks the public mapper contract on a mounted paragraph without a shared root. @returns Nothing. */ () => {
  const wrapper = document.createElement("div"),
    marker = document.createElement("span"),
    paragraph = document.createElement("p");
  marker.dataset.writerListMarker = "standalone";
  marker.contentEditable = "false";
  paragraph.dataset.writerParagraphId = "standalone";
  paragraph.tabIndex = -1;
  paragraph.textContent = "Text";
  wrapper.append(marker, paragraph);
  document.body.append(wrapper);
  expect(
    restoreWriterDomSelection(
      { point: { paragraphId: "standalone", offset: 0, inFrontOfLabel: true } },
      /** Resolves the actual standalone paragraph. @returns Paragraph. */ () => paragraph,
      window.getSelection(),
    ),
  ).toBe(true);
  expect(document.activeElement).toBe(paragraph);
  expect(getWriterDomSelection(window.getSelection())?.point.inFrontOfLabel).toBe(true);
  wrapper.remove();
});

it("native unfragmented text caret remains distinct from a decorated label boundary", /** Checks default source offset and marked affinity admission on a paragraph without fragment metadata. @returns Nothing. */ () => {
  const wrapper = document.createElement("div"),
    marker = document.createElement("span"),
    paragraph = document.createElement("p");
  marker.dataset.writerListMarker = "unfragmented";
  marker.textContent = "•";
  marker.contentEditable = "false";
  paragraph.dataset.writerParagraphId = "unfragmented";
  paragraph.textContent = "Text";
  paragraph.tabIndex = -1;
  wrapper.append(marker, paragraph);
  document.body.append(wrapper);
  const resolve = /** Resolves the actual source node. @returns Paragraph. */ () => paragraph;
  expect(
    restoreWriterDomSelection(
      { point: { paragraphId: "unfragmented", offset: 2 } },
      resolve,
      window.getSelection(),
    ),
  ).toBe(true);
  expect(getWriterDomSelection(window.getSelection())).toEqual({
    point: { paragraphId: "unfragmented", offset: 2 },
  });
  expect(
    restoreWriterDomSelection(
      {
        point: { paragraphId: "unfragmented", offset: 0, inFrontOfLabel: true },
        mark: { paragraphId: "unfragmented", offset: 3 },
      },
      resolve,
      window.getSelection(),
    ),
  ).toBe(true);
  expect(getWriterDomSelection(window.getSelection())?.point.inFrontOfLabel).toBeUndefined();
  expect(window.getSelection()?.toString()).toBe("Tex");
  wrapper.remove();
});
