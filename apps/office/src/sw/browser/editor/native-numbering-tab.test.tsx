/** @fileoverview Checks immutable native numbering tab inputs and actual glyph/device refresh at the shared body/cell renderer. */
import { act, cleanup, render } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import { createWriterDocumentSession } from "../composition/writer-module";
import { WriterViewStore } from "../presentation/writer-view-projection";
import { createWriterNumFormat } from "../../source/core/doc/number";
import { WriterEditableParagraph } from "./WriterEditableParagraph";
const sessions: ReturnType<typeof createWriterDocumentSession>[] = [];
afterEach(
  /** Releases owned views and device substitutions. @returns Nothing. */ () => {
    cleanup();
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
    for (const session of sessions.splice(0)) session.Close();
  },
);
for (const cell of [false, true])
  it(`measured native label tab follows glyph and font refresh cell=${cell}`, /** Checks source values, measured positioning and borrowed model/history identity. @returns Completion. */ async () => {
    const session = createWriterDocumentSession();
    sessions.push(session);
    const doc = session.docShell.GetDoc(),
      body = doc.paragraphs[0];
    if (body === undefined) throw Error("Missing paragraph");
    const table = doc.nodes.MakeTableNode("MeasuredTab", {}, body);
    table.AddColumnWidth(6000);
    const node = cell
      ? doc.nodes.AppendTableRow(table, 1).GetTabBoxes()[0]?.GetParagraphs()[0]
      : body;
    if (node === undefined) throw Error("Missing cell");
    node.SetText("Measured item");
    const rule = doc.EnsureNumRule("MeasuredRule", "bullet");
    rule.Set(
      0,
      createWriterNumFormat("bullet", "•", {
        positionAndSpaceMode: "label-alignment",
        indentAt: 720,
        firstLineIndent: 0,
        listTabPosition: 720,
        labelFollowedBy: "listtab",
      }),
    );
    node.SetNumRule("MeasuredRule");
    node.AddToList();
    session.view.GetWrtShell().FocusNode(node);
    const store = new WriterViewStore(session.view);
    let glyphWidth = 12,
      deviceScale = 1,
      resize: (() => void) | undefined;
    const disconnect = vi.fn(),
      observe = vi.fn();
    vi.stubGlobal(
      "ResizeObserver",
      /** Represents browser glyph resize notifications without document mutation. */
      class {
        /** Retains the native device invalidation callback. @param callback - Geometry refresh. @returns Observer instance. */
        constructor(callback: () => void) {
          resize = callback;
        }
        observe = observe;
        disconnect = disconnect;
      },
    );
    let ready: (() => void) | undefined;
    const fonts = new EventTarget();
    Object.defineProperty(fonts, "ready", {
      value: new Promise<void>(
        /** Controls late font completion. @param resolve - Font-ready completion. @returns Nothing. */ (
          resolve,
        ) => {
          ready = resolve;
        },
      ),
    });
    Object.defineProperty(document, "fonts", { configurable: true, value: fonts });
    const rect = HTMLElement.prototype.getBoundingClientRect;
    vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockImplementation(
      /** Supplies deterministic transformed device glyph/slot widths. @param this - Browser element. @returns Rectangle. */
      function (this: HTMLElement) {
        if (this.hasAttribute("data-writer-list-label"))
          return { width: glyphWidth * deviceScale } as DOMRect;
        if (this.hasAttribute("data-writer-list-marker"))
          return { width: 80 * deviceScale } as DOMRect;
        return rect.call(this);
      },
    );
    vi.spyOn(globalThis, "getComputedStyle").mockReturnValue({
      width: "80px",
    } as CSSStyleDeclaration);
    try {
      const p = store.GetSnapshot().activeParagraph;
      expect(p.listTabSettings).toMatchObject({
        defaultDistance: 1134,
        relativeToIndent: true,
        tabCompat: true,
        tabAtLeftIndent: false,
      });
      expect(Object.isFrozen(p.listTabSettings)).toBe(true);
      expect(Object.isFrozen(p.listTabSettings?.stops)).toBe(true);
      expect(Object.keys(p.listLayout ?? {}).sort()).toEqual([
        "firstLineIndentPt",
        "indentAtPt",
        "labelFollowedBy",
        "listTabPositionPt",
      ]);
      const owner = node.GetNumRule(),
        text = node.GetText(),
        history = doc.GetUndoManager().GetUndoActionCount();
      const props = {
        index: 0,
        isActive: true,
        paragraph: p,
        listMarker: p.listMarker,
        retainElement: /** Leaves the model unchanged. @returns Nothing. */ () => undefined,
      };
      const mounted = render(<WriterEditableParagraph {...props} />);
      const marker = mounted.container.querySelector<HTMLElement>("[data-writer-list-marker]");
      expect(marker?.style.width).toBe("56.7pt");
      expect(observe).toHaveBeenCalled();
      glyphWidth = 100;
      deviceScale = 0.5;
      act(/** Invalidates resized glyph geometry. @returns Nothing. */ () => resize?.());
      expect(marker?.style.width).toBe("113.4pt");
      glyphWidth = 12;
      await act(
        /** Completes the late font load. @returns Completion. */ async () => {
          ready?.();
          await Promise.resolve();
        },
      );
      expect(marker?.style.width).toBe("56.7pt");
      glyphWidth = 100;
      act(
        /** Re-measures after another physical face loads. @returns Nothing. */ () =>
          fonts.dispatchEvent(new Event("loadingdone")),
      );
      expect(marker?.style.width).toBe("113.4pt");
      glyphWidth = 0;
      act(
        /** Zero geometry retains the last valid measurement. @returns Nothing. */ () =>
          globalThis.dispatchEvent(new Event("resize")),
      );
      expect(marker?.style.width).toBe("113.4pt");
      mounted.rerender(<WriterEditableParagraph {...props} isFollow />);
      expect(mounted.container.querySelector("[data-writer-list-marker]")).toBeNull();
      expect(disconnect).toHaveBeenCalled();
      act(
        /** Released device callbacks cannot change model or a later frame. @returns Nothing. */ () =>
          resize?.(),
      );
      expect(node.GetNumRule()).toBe(owner);
      expect(node.GetText()).toBe(text);
      expect(doc.GetUndoManager().GetUndoActionCount()).toBe(history);
      const format = rule.Get(0).clone();
      format.SetPositionAndSpaceMode("label-width-and-position");
      rule.Set(0, format);
      const legacy = new WriterViewStore(session.view);
      try {
        expect(legacy.GetSnapshot().activeParagraph.listTabSettings).toBeUndefined();
      } finally {
        legacy.Close();
      }
    } finally {
      store.Close();
      delete (document as unknown as { fonts?: FontFaceSet }).fonts;
    }
  });
it("zero-width detached device and omitted list layout retain compatibility", /** Checks absent native inputs never fabricate document state. @returns Nothing. */ () => {
  const session = createWriterDocumentSession();
  sessions.push(session);
  const node = session.docShell.GetDoc().paragraphs[0];
  if (node === undefined) throw Error("Missing node");
  node.SetText("Detached");
  const rule = session.docShell.GetDoc().EnsureNumRule("DetachedTab", "bullet");
  rule.Set(
    0,
    createWriterNumFormat("bullet", "•", {
      positionAndSpaceMode: "label-alignment",
      indentAt: 720,
      firstLineIndent: 0,
      listTabPosition: 720,
      labelFollowedBy: "listtab",
    }),
  );
  node.SetNumRule("DetachedTab");
  node.AddToList();
  const store = new WriterViewStore(session.view);
  try {
    const p = store.GetSnapshot().activeParagraph,
      { listLayout: oldLayout, ...withoutLayout } = p;
    expect(oldLayout).toBeDefined();
    const props = {
      index: 0,
      isActive: true,
      paragraph: withoutLayout,
      listMarker: p.listMarker,
      retainElement: /** Keeps this device read-only. @returns Nothing. */ () => undefined,
    };
    vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockReturnValue({
      width: 10,
    } as DOMRect);
    vi.spyOn(globalThis, "getComputedStyle").mockReturnValue({ width: "" } as CSSStyleDeclaration);
    const mounted = render(<WriterEditableParagraph {...props} />);
    expect(
      mounted.container.querySelector<HTMLElement>("[data-writer-list-marker]")?.style.width,
    ).toBe("");
    mounted.rerender(<WriterEditableParagraph {...props} paragraph={p} />);
    expect(
      mounted.container.querySelector<HTMLElement>("[data-writer-list-marker]")?.style.width,
    ).toBe("56.7pt");
  } finally {
    store.Close();
  }
});
