/** @fileoverview Checks mounted original body/cell marked-level painting and immutable native option projection. */
import { act, cleanup, render } from "@testing-library/react";
import { afterEach, expect, it } from "vitest";
import { createWriterDocumentSession } from "../composition/writer-module";
import { WriterWorkbench } from "../presentation/writer-view";
import { WriterViewStore } from "../presentation/writer-view-projection";
import { applyWriterParagraphList } from "../../source/core/doc/list";
import { SwViewColors, ViewOptFlags } from "../../inc/viewopt";
import { WriterEditableParagraph } from "./WriterEditableParagraph";
const sessions: ReturnType<typeof createWriterDocumentSession>[] = [];
afterEach(
  /** Releases mounted views before original document graphs. @returns Nothing. */ () => {
    cleanup();
    for (const session of sessions.splice(0)) session.Close();
  },
);
for (const cell of [false, true])
  for (const kind of ["bullet", "numbered"] as const)
    it(`native marked label paint follows all same-level members cell=${cell} kind=${kind}`, /** Checks actual owner transitions, view guards, publication, retained snapshots and text edits. @returns Nothing. */ () => {
      const session = createWriterDocumentSession();
      sessions.push(session);
      const doc = session.docShell.GetDoc(),
        body = doc.paragraphs[0];
      if (body === undefined) throw Error("Missing body");
      const table = doc.GetNodes().MakeTableNode("Marked paint");
      table.AddColumnWidth(6000);
      const nodes = [0, 1, 2, 3].map(
        /** Creates connected original members. @param index - Member index. @returns Original node. */ (
          index,
        ) => {
          const node = cell
            ? doc.GetNodes().AppendTableRow(table, 1).GetTabBoxes()[0]?.GetParagraphs()[0]
            : index === 0
              ? body
              : doc.GetNodes().MakeTextNode();
          if (node === undefined) throw Error("Missing member");
          node.SetText(`Paint item ${index}`);
          applyWriterParagraphList(node, {
            kind,
            level: index === 2 ? 1 : 0,
            listId: index === 3 ? "Other" : "Marked",
            ruleName: "PaintRule",
          });
          return node;
        },
      );
      const first = nodes[0],
        child = nodes[2];
      if (first === undefined || child === undefined) throw Error("Missing members");
      const shell = session.view.GetWrtShell(),
        edit = session.view.GetEditWin(),
        options = shell.GetViewOptions(),
        store = new WriterViewStore(session.view);
      doc.GetUndoManager().Clear();
      const mounted = render(<WriterWorkbench isActive view={session.view} />);
      const beforeModified = session.docShell.IsModified();
      const beforeGeneration = session.docShell.GetContentGeneration();
      /** Reads original paragraph markers in the production tree. @returns Actual marker elements. */
      function markers(): HTMLElement[] {
        return nodes.map(
          /** Locates an original connected node's decoration. @param node - Original owner. @returns Mounted marker. */ (
            node,
          ) => {
            const element = mounted.container
              .querySelector(`p[data-writer-node-index="${node.GetIndex()}"]`)
              ?.parentElement?.querySelector<HTMLElement>("[data-writer-list-marker]");
            if (element == null) throw Error("Missing marker");
            return element;
          },
        );
      }
      /** Reads mounted colors in native node order. @returns Device color values. */
      function colors(): string[] {
        return markers().map(
          /** Reads actual paint state. @param marker - Decoration. @returns CSS value. */ (
            marker,
          ) => marker.style.backgroundColor,
        );
      }
      /** Explicit repaint matches source option setters' noninvalidating contract. @returns Nothing. */
      function repaint(): void {
        session.view.GetViewFrame().GetDispatcher().Invalidate("view");
      }
      try {
        expect(colors()).toEqual(["", "", "", ""]);
        act(
          /** Admits an original label point through the native edit window. @returns Nothing. */ () => {
            edit.SetSelection({
              point: { nodeIndex: first.GetIndex(), contentIndex: 0, inFrontOfLabel: true },
            });
          },
        );
        expect(colors()).toEqual(["rgb(192, 192, 192)", "rgb(192, 192, 192)", "", ""]);
        expect(mounted.container.querySelectorAll("[data-writer-label-caret]")).toHaveLength(1);
        const retained = store.GetSnapshot();
        expect(retained.activeParagraph.listMarkerBackgroundColor).toBe("#c0c0c0");
        const config = new SwViewColors(options.GetColorConfig());
        config.m_aFieldShadingsColor = "#123456";
        act(
          /** Copies native colors, then explicitly repaints. @returns Nothing. */ () => {
            options.SetColorConfig(config);
            repaint();
          },
        );
        expect(colors()).toEqual(["rgb(18, 52, 86)", "rgb(18, 52, 86)", "", ""]);
        expect(retained.activeParagraph.listMarkerBackgroundColor).toBe("#c0c0c0");
        act(
          /** Checks read-only suppression without clearing native marks. @returns Nothing. */ () => {
            options.SetReadonly(true);
            repaint();
          },
        );
        expect(colors()).toEqual(["", "", "", ""]);
        expect(first.HasMarkedLabel()).toBe(true);
        act(
          /** Checks preview suppression. @returns Nothing. */ () => {
            options.SetReadonly(false);
            options.SetPagePreview(true);
            repaint();
          },
        );
        expect(colors()).toEqual(["", "", "", ""]);
        act(
          /** Checks field visibility suppression. @returns Nothing. */ () => {
            options.SetPagePreview(false);
            options.SetAppearanceFlag(ViewOptFlags.FieldShadings, false);
            repaint();
          },
        );
        expect(colors()).toEqual(["", "", "", ""]);
        act(
          /** Restores painting without inventing mark-state changes. @returns Nothing. */ () => {
            options.SetAppearanceFlag(ViewOptFlags.FieldShadings, true);
            repaint();
          },
        );
        expect(colors()[0]).toBe("rgb(18, 52, 86)");
        act(
          /** Changes the actual marked depth. @returns Nothing. */ () => {
            edit.SetSelection({
              point: { nodeIndex: child.GetIndex(), contentIndex: 0, inFrontOfLabel: true },
            });
          },
        );
        expect(colors()).toEqual(["", "", "rgb(18, 52, 86)", ""]);
        expect(session.docShell.IsModified()).toBe(beforeModified);
        expect(session.docShell.GetContentGeneration()).toBe(beforeGeneration);
        expect(doc.GetUndoManager().GetUndoActionCount()).toBe(0);
        act(
          /** Clears the actual mark with ordinary text cursor admission. @returns Nothing. */ () => {
            edit.SetSelection({ point: { nodeIndex: child.GetIndex(), contentIndex: 0 } });
          },
        );
        expect(colors()).toEqual(["", "", "", ""]);
        act(
          /** Enters the label and types through the native edit owner. @returns Nothing. */ () => {
            edit.SetSelection({
              point: { nodeIndex: first.GetIndex(), contentIndex: 0, inFrontOfLabel: true },
            });
            edit.InsertText("X");
          },
        );
        expect(colors()).toEqual(["", "", "", ""]);
        expect(first.GetText()).toBe("XPaint item 0");
        expect(doc.GetUndoManager().GetUndoActionCount()).toBe(1);
        expect(
          nodes
            .slice(1)
            .map(
              /** Reads unchanged neighbors. @param node - Owner. @returns Model text. */ (node) =>
                node.GetText(),
            ),
        ).toEqual(["Paint item 1", "Paint item 2", "Paint item 3"]);
      } finally {
        store.Close();
      }
    });

it("marked background belongs to the master marker and its reserved slot", /** Checks empty glyph labels and follow frames without duplicate decoration or model mutation. @returns Nothing. */ () => {
  const session = createWriterDocumentSession();
  sessions.push(session);
  const node = session.docShell.GetDoc().paragraphs[0];
  if (node === undefined) throw Error("Missing body");
  applyWriterParagraphList(node, { kind: "bullet", level: 0 });
  session.view
    .GetEditWin()
    .SetSelection({ point: { nodeIndex: node.GetIndex(), contentIndex: 0, inFrontOfLabel: true } });
  const store = new WriterViewStore(session.view);
  try {
    const p = store.GetSnapshot().activeParagraph;
    const props = {
      paragraph: p,
      listMarker: "",
      index: 0,
      isActive: true,
      retainElement: /** Keeps paint-only mounting read-only. @returns Nothing. */ () => undefined,
    };
    const mounted = render(<WriterEditableParagraph {...props} />);
    const marker = mounted.container.querySelector<HTMLElement>("[data-writer-list-marker]");
    expect(marker).toHaveStyle({
      backgroundColor: "#c0c0c0",
      minWidth: "max-content",
      width: "18pt",
      paddingInlineEnd: "0pt",
    });
    mounted.rerender(<WriterEditableParagraph {...props} isFollow />);
    expect(mounted.container.querySelector("[data-writer-list-marker]")).toBeNull();
    expect(node.HasMarkedLabel()).toBe(true);
    expect(node.GetText()).toBe("");
  } finally {
    store.Close();
  }
});
