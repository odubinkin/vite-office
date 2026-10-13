/** @fileoverview Verifies real mounted document context menus execute through the original active frame. */
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import { createWriterDocumentSession } from "../composition/writer-module";
import { WriterWorkbench } from "../presentation/writer-view";
const sessions: ReturnType<typeof createWriterDocumentSession>[] = [];
afterEach(
  /** Releases mounted original document owners and device ports. @returns Nothing. */ () => {
    cleanup();
    vi.restoreAllMocks();
    for (const s of sessions.splice(0)) s.Close();
  },
);
it("mounted right click opens the original Writer text popup", /** Reproduces missing browser popup event presentation. @returns Nothing. */ () => {
  const s = createWriterDocumentSession();
  sessions.push(s);
  const n = s.docShell.GetDoc().paragraphs[0];
  if (n === undefined) throw Error("Missing body");
  n.SetText("native body");
  render(
    <WriterWorkbench isActive view={s.view} fileDialogs={s.fileDialogs} services={s.services} />,
  );
  const p = screen.getByText("native body"),
    range = document.createRange();
  range.setStart(p.firstChild as Text, 2);
  range.collapse(true);
  Object.defineProperty(document, "caretRangeFromPoint", {
    configurable: true,
    value: /** Supplies real DOM range at device ingress. @returns Native caret range. */ () =>
      range,
  });
  act(
    /** Focuses the actual native selection. @returns Nothing. */ () => {
      p.focus();
      window.getSelection()?.setBaseAndExtent(p.firstChild as Text, 2, p.firstChild as Text, 2);
      document.dispatchEvent(new Event("selectionchange"));
    },
  );
  fireEvent.contextMenu(p, { clientX: 20, clientY: 30 });
  expect(screen.getByRole("menu", { name: "Writer context menu" })).toBeVisible();
});

import { getWriterTextCaretPoint } from "./writer-selection";
import { SwpHints } from "../../source/core/txtnode/ndhints";
import { SwTextINetFormat } from "../../source/core/txtnode/txtatr2";
import { SwFormatINetFormat } from "../../source/core/txtnode/fmtatr2";
import { WRITER_COMMAND_IDS as ids } from "../../uiconfig/swriter/menubar/menubar-commands";
import { createSfxShell } from "../../../sfx2/source/control/shell";
import { SfxInterface } from "../../../sfx2/source/control/objface";
import { HoriOrientation } from "../../../offapi/com/sun/star/text/HoriOrientation";
const oldCaret = Object.getOwnPropertyDescriptor(document, "caretRangeFromPoint"),
  oldElement = Object.getOwnPropertyDescriptor(document, "elementFromPoint"),
  oldRect = Object.getOwnPropertyDescriptor(Range.prototype, "getBoundingClientRect");
afterEach(
  /** Restores only the injected device API properties. @returns Nothing. */ () => {
    for (const [object, key, descriptor] of [
      [document, "caretRangeFromPoint", oldCaret],
      [document, "elementFromPoint", oldElement],
      [Range.prototype, "getBoundingClientRect", oldRect],
    ] as const) {
      if (descriptor === undefined) Reflect.deleteProperty(object, key);
      else Object.defineProperty(object, key, descriptor);
    }
  },
);
/** Mounts original body owners and optionally original distinct native URL hints. @param mixed - Whether original URL items differ. @returns Mounted frame and paragraph. */ function fixture(
  mixed = false,
) {
  const s = createWriterDocumentSession();
  sessions.push(s);
  const doc = s.docShell.GetDoc(),
    node = doc.paragraphs[0];
  if (node === undefined) throw Error("Missing body");
  node.SetText("abcdefgh");
  if (mixed)
    node.SetTextHints(
      new SwpHints(doc.GetAttrPool(), [
        new SwTextINetFormat(new SwFormatINetFormat("https://example.test/a"), 0, 3),
        new SwTextINetFormat(new SwFormatINetFormat("https://example.test/b"), 5, 8),
      ]),
    );
  doc.GetUndoManager().Clear();
  const props = { isActive: true, view: s.view, fileDialogs: s.fileDialogs, services: s.services },
    mounted = render(<WriterWorkbench {...props} />),
    p = screen.getByRole("textbox", { name: "Writer document text" }) as HTMLParagraphElement;
  return { s, doc, node, p, mounted, props };
}
/** Installs a real DOM selection at original text offsets. @param p - Mounted paragraph. @param point - Moving endpoint. @param mark - Fixed endpoint. @returns Nothing. */ function select(
  p: HTMLParagraphElement,
  point: number,
  mark = point,
): void {
  act(
    /** Publishes actual browser selection through the existing native device mapper. @returns Nothing. */ () => {
      p.focus();
      const a = getWriterTextCaretPoint(p, mark),
        b = getWriterTextCaretPoint(p, point);
      window.getSelection()?.setBaseAndExtent(a.node, a.offset, b.node, b.offset);
      document.dispatchEvent(new Event("selectionchange"));
    },
  );
}
/** Supplies actual hit testing at a current paragraph offset. @param p - Mounted paragraph. @param offset - Hit offset. @returns Nothing. */ function hit(
  p: HTMLParagraphElement,
  offset: number,
): void {
  Object.defineProperty(document, "caretRangeFromPoint", {
    configurable: true,
    value: /** Supplies a real current range. @returns Hit range. */ () => {
      const range = document.createRange(),
        point = getWriterTextCaretPoint(p, offset);
      range.setStart(point.node, point.offset);
      range.collapse(true);
      return range;
    },
  });
}
it("real popup removes mixed native hyperlinks with one undo while retaining selection and text", /** Checks actual clicked Remove through original native dispatcher and history. @returns Nothing. */ () => {
  const f = fixture(true);
  select(f.p, 8, 0);
  hit(f.p, 2);
  expect(fireEvent.mouseDown(f.p, { button: 2 })).toBe(false);
  fireEvent.contextMenu(f.p, { clientX: 100, clientY: 120 });
  const popup = screen.getByRole("menu", { name: "Writer context menu" });
  expect(popup).toHaveFocus();
  expect(screen.getByRole("menuitem", { name: "Edit Hyperlink…" })).toBeDisabled();
  fireEvent.click(screen.getByRole("menuitem", { name: "Remove Hyperlink" }));
  expect(screen.queryByRole("menu", { name: "Writer context menu" })).not.toBeInTheDocument();
  expect(f.mounted.container.querySelectorAll("a[data-writer-hyperlink]")).toHaveLength(0);
  expect(f.node.GetText()).toBe("abcdefgh");
  expect(f.doc.GetUndoManager().GetUndoActionCount()).toBe(1);
  expect(f.s.view.GetWrtShell().GetCursor().HasMark()).toBe(true);
  act(
    /** Restores original distinct URL items with native Undo. @returns Nothing. */ () => {
      f.s.view.Execute(ids.undo);
    },
  );
  expect(f.mounted.container.querySelectorAll("a[data-writer-hyperlink]")).toHaveLength(2);
  act(
    /** Reapplies the one native attribute transaction. @returns Nothing. */ () => {
      f.s.view.Execute(ids.redo);
    },
  );
  expect(f.mounted.container.querySelectorAll("a[data-writer-hyperlink]")).toHaveLength(0);
});
it("keyboard popup is unselected, uses original moving-endpoint device rect and restores focus on Escape", /** Checks reversed native selection without mouse reposition. @returns Nothing. */ () => {
  const f = fixture(true);
  select(f.p, 1, 7);
  const before = f.s.view.GetWrtShell().CaptureCursorState();
  Object.defineProperty(Range.prototype, "getBoundingClientRect", {
    configurable: true,
    value:
      /** Measures the actual moving endpoint supplied by the browser adapter. @param this - Live DOM range. @returns Live device rect. */ function (
        this: Range,
      ) {
        expect(this.startOffset).toBe(1);
        expect(this.collapsed).toBe(true);
        return new DOMRect(110, 120, 4, 8);
      },
  });
  fireEvent.keyDown(f.p, { key: "F10", shiftKey: true });
  const menu = screen.getByRole("menu", { name: "Writer context menu" });
  expect(menu).toHaveFocus();
  expect(menu.style.left).toBe("112px");
  expect(menu.style.top).toBe("124px");
  expect(f.s.view.GetWrtShell().CaptureCursorState()).toEqual(before);
  fireEvent.keyDown(menu, { key: "Escape" });
  expect(f.p).toHaveFocus();
  expect(f.s.view.GetWrtShell().CaptureCursorState()).toEqual(before);
});
it("ContextMenu key uses current native cursor when the device Selection is absent", /** Checks keyboard admission without fabricated model positions. @returns Nothing. */ () => {
  const f = fixture();
  select(f.p, 3);
  const before = f.s.view.GetWrtShell().CaptureCursorState();
  vi.spyOn(window, "getSelection").mockReturnValue(null);
  fireEvent.keyDown(f.p, { key: "ContextMenu" });
  expect(screen.getByRole("menu", { name: "Writer context menu" })).toHaveFocus();
  expect(f.s.view.GetWrtShell().CaptureCursorState()).toEqual(before);
});
it("modified and composing keys retain existing keyboard ownership", /** Prevents generic popup input from consuming command modifiers. @returns Nothing. */ () => {
  const f = fixture();
  select(f.p, 2);
  for (const event of [
    { key: "x" },
    { key: "ContextMenu", ctrlKey: true },
    { key: "ContextMenu", metaKey: true },
    { key: "ContextMenu", altKey: true },
    { key: "ContextMenu", shiftKey: true },
    { key: "ContextMenu", isComposing: true },
    { key: "F10" },
  ])
    fireEvent.keyDown(f.p, event);
  expect(screen.queryByRole("menu", { name: "Writer context menu" })).not.toBeInTheDocument();
});
it("unresolved or stale mouse positions cannot invent a document popup owner", /** Checks transient DOM/device failures against original node admission. @returns Nothing. */ () => {
  const f = fixture();
  Object.defineProperty(document, "caretRangeFromPoint", {
    configurable: true,
    value: /** Reports no device hit. @returns No range. */ () => null,
  });
  fireEvent.contextMenu(f.p, { clientX: 10, clientY: 10 });
  expect(screen.queryByRole("menu", { name: "Writer context menu" })).not.toBeInTheDocument();
  hit(f.p, 1);
  const index = f.p.dataset.writerNodeIndex;
  delete f.p.dataset.writerNodeIndex;
  fireEvent.contextMenu(f.p, { clientX: 10, clientY: 10 });
  expect(screen.queryByRole("menu", { name: "Writer context menu" })).not.toBeInTheDocument();
  f.p.dataset.writerNodeIndex = "99999";
  fireEvent.contextMenu(f.p, { clientX: 10, clientY: 10 });
  expect(screen.queryByRole("menu", { name: "Writer context menu" })).not.toBeInTheDocument();
  f.p.dataset.writerNodeIndex = index;
});
it("unknown native resource and inactive frames do not fabricate a text popup", /** Checks original dispatcher registration and actual frame gating. @returns Nothing. */ () => {
  const f = fixture(),
    iface = new SfxInterface([]),
    overlay = createSfxShell(null, iface),
    d = f.s.view.GetViewFrame().GetDispatcher();
  iface.RegisterPopupMenu("unknown");
  d.Push(overlay);
  hit(f.p, 1);
  fireEvent.contextMenu(f.p, { clientX: 10, clientY: 10 });
  expect(screen.queryByRole("menu", { name: "Writer context menu" })).not.toBeInTheDocument();
  d.Pop(overlay);
  fireEvent.contextMenu(f.p, { clientX: 10, clientY: 10 });
  expect(screen.getByRole("menu", { name: "Writer context menu" })).toBeVisible();
  f.mounted.rerender(<WriterWorkbench {...f.props} isActive={false} />);
  expect(screen.queryByRole("menu", { name: "Writer context menu" })).not.toBeInTheDocument();
  fireEvent.contextMenu(f.p, { clientX: 10, clientY: 10 });
  expect(screen.queryByRole("menu", { name: "Writer context menu" })).not.toBeInTheDocument();
});

import { BrowserLocalizationService } from "../../../framework/browser/localization/browser-localization";
import {
  selectWriterCommandResource,
  selectWriterPopupCommandResource,
} from "../presentation/writer-command-presentation";
it("native popup labels localize independently and commands without PopupLabel retain their general labels", /** Checks original metadata fallback without altering other command surfaces. @returns Nothing. */ () => {
  const locale = new BrowserLocalizationService("fr-FR", {
    "fr-FR": {
      [`writer.command.${ids.editHyperlink}.popup-label`]: "Modifier le lien",
      [`writer.command.${ids.editHyperlink}.label`]: "Lien",
      [`writer.command.${ids.removeHyperlink}.label`]: "Supprimer le lien",
    },
  });
  expect(selectWriterCommandResource(locale, ids.editHyperlink).label).toBe("Lien");
  expect(selectWriterPopupCommandResource(locale, ids.editHyperlink).label).toBe(
    "Modifier le lien",
  );
  expect(
    selectWriterPopupCommandResource(new BrowserLocalizationService("en-US"), ids.editHyperlink)
      .label,
  ).toBe("Edit Hyperlink");
  expect(selectWriterPopupCommandResource(locale, ids.removeHyperlink).label).toBe(
    "Supprimer le lien",
  );
});
it("absent device hit APIs and an empty Selection retain original cursor ownership", /** Checks unavailable device ports without a native position fallback. @returns Nothing. */ () => {
  const f = fixture();
  select(f.p, 3);
  Reflect.deleteProperty(document, "caretRangeFromPoint");
  Reflect.deleteProperty(document, "elementFromPoint");
  fireEvent.contextMenu(f.p, { clientX: 10, clientY: 10 });
  expect(screen.queryByRole("menu", { name: "Writer context menu" })).not.toBeInTheDocument();
  window.getSelection()?.removeAllRanges();
  fireEvent.keyDown(f.p, { key: "ContextMenu" });
  expect(screen.getByRole("menu", { name: "Writer context menu" })).toHaveFocus();
  expect(f.s.view.GetWrtShell().GetCursor().GetPoint().GetContentIndex()).toBe(3);
});
it("stale label projection cannot supply a different native mouse position", /** Checks original device conversion rejects an incomplete mounted marker owner. @returns Nothing. */ () => {
  const f = fixture();
  select(f.p, 2);
  const marker = document.createElement("span");
  marker.dataset.writerListMarker = "stale";
  marker.textContent = "x";
  f.p.append(marker);
  Object.defineProperty(document, "caretRangeFromPoint", {
    configurable: true,
    value:
      /** Returns the actual temporarily incomplete marker range. @returns Native device range. */ () => {
        const r = document.createRange();
        r.setStart(marker.firstChild as Text, 0);
        r.collapse(true);
        return r;
      },
  });
  fireEvent.contextMenu(f.p, { clientX: 10, clientY: 10 });
  expect(screen.queryByRole("menu", { name: "Writer context menu" })).not.toBeInTheDocument();
  expect(f.s.view.GetWrtShell().GetCursor().GetPoint().GetContentIndex()).toBe(2);
  marker.remove();
});
it("real element hit testing selects the original frame and rejects a stale DOM text offset", /** Checks native edit-window rejection without fabricating a different model position. @returns Nothing. */ () => {
  const f = fixture();
  select(f.p, 2);
  Object.defineProperty(document, "elementFromPoint", {
    configurable: true,
    value: /** Returns the original mounted device element. @returns Paragraph. */ () => f.p,
  });
  hit(f.p, 3);
  expect(fireEvent.contextMenu(f.p, { clientX: 10, clientY: 10 })).toBe(false);
  fireEvent.keyDown(screen.getByRole("menu", { name: "Writer context menu" }), { key: "Escape" });
  select(f.p, 3);
  const before = f.s.view.GetWrtShell().CaptureCursorState();
  f.p.append(document.createTextNode("stale"));
  hit(f.p, 10);
  expect(fireEvent.contextMenu(f.p, { clientX: 10, clientY: 10 })).toBe(true);
  expect(screen.queryByRole("menu", { name: "Writer context menu" })).not.toBeInTheDocument();
  expect(f.s.view.GetWrtShell().CaptureCursorState()).toEqual(before);
});
it("captured native Control border gesture owns context events and retains Undo before a later right click", /** Checks real native column tracking, release event priority and independent popup admission. @returns Nothing. */ () => {
  const s = createWriterDocumentSession();
  sessions.push(s);
  const doc = s.docShell.GetDoc(),
    table = doc.nodes.MakeTableNode("Gesture", { width: 4500, horiOrient: HoriOrientation.LEFT });
  for (let c = 0; c < 3; c++) table.AddColumnWidth(1500);
  const row = doc.nodes.AppendTableRow(table, 3),
    first = row.GetTabBoxes()[0]?.GetParagraphs()[0];
  if (first === undefined) throw Error("Missing original first cell");
  for (const box of row.GetTabBoxes()) for (const node of box.GetParagraphs()) node.SetText("Cell");
  s.view.GetWrtShell().FocusNode(first);
  vi.spyOn(Element.prototype, "getBoundingClientRect").mockImplementation(
    /** Supplies device rectangles of the actual native cell owners. @param this - Mounted owner. @returns Device bounds. */ function (
      this: Element,
    ): DOMRect {
      const c = this.matches("td,th")
        ? Array.from((this.parentElement as HTMLElement).children).indexOf(this)
        : 0;
      return new DOMRect(
        100 + c * 100,
        100,
        this.matches("td,th") ? 100 : this.matches("table,tr") ? 300 : 0,
        50,
      );
    },
  );
  render(
    <WriterWorkbench isActive view={s.view} fileDialogs={s.fileDialogs} services={s.services} />,
  );
  const p = screen.getByRole("textbox", {
    name: "Row 1 column 1 paragraph 1",
  }) as HTMLParagraphElement;
  expect(
    fireEvent.mouseDown(p, { button: 0, detail: 1, ctrlKey: true, clientX: 203, clientY: 125 }),
  ).toBe(false);
  expect(s.view.GetEditWin().GetTableBorderDragPosition()).toBeDefined();
  expect(fireEvent.contextMenu(p, { ctrlKey: true, clientX: 203, clientY: 125 })).toBe(false);
  expect(screen.queryByRole("menu", { name: "Writer context menu" })).not.toBeInTheDocument();
  fireEvent.mouseMove(document, { clientX: 223, clientY: 125 });
  fireEvent.mouseUp(document, { clientX: 223, clientY: 125 });
  const changed = table.GetColumnWidths();
  expect(changed).not.toEqual([1500, 1500, 1500]);
  expect(fireEvent.contextMenu(p, { clientX: 223, clientY: 125 })).toBe(false);
  expect(screen.queryByRole("menu", { name: "Writer context menu" })).not.toBeInTheDocument();
  fireEvent.keyDown(p, { key: "z", ctrlKey: true });
  expect(table.GetColumnWidths()).toEqual([1500, 1500, 1500]);
  fireEvent.keyDown(p, { key: "y", ctrlKey: true });
  expect(table.GetColumnWidths()).toEqual(changed);
  fireEvent.mouseDown(p, { button: 2, detail: 1 });
  hit(p, 2);
  fireEvent.contextMenu(p, { clientX: 150, clientY: 125 });
  expect(screen.getByRole("menu", { name: "Writer context menu" })).toBeVisible();
});
