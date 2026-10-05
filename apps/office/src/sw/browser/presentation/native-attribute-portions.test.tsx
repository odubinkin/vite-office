/** @fileoverview Checks real native item stacks reach shared body/cell DOM without the filter TextRuns formatter. */
import { act, cleanup, render, screen } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import { createWriterDocumentSession } from "../composition/writer-module";
import { WriterWorkbench } from "./writer-view";
import { SwTextNode } from "../../source/core/txtnode/ndtxt";
import { WriterViewProjection } from "./writer-view-projection";
import { SetAttrMode } from "../../inc/swtypes";
import { WriterEditableParagraph } from "../editor/WriterEditableParagraph";
import { SwFormatAutoFormat, SwTextAttrEnd } from "../../source/core/txtnode/txatbase";
import { SwFormatINetFormat } from "../../source/core/txtnode/fmtatr2";
import { SwpHints } from "../../source/core/txtnode/ndhints";
import { SwPosition, SwPaM } from "../../source/core/crsr/pam";
import { SfxItemSet } from "../../../svl/source/items/itemset";
import { SfxStringItem } from "../../../svl/source/items/stritem";
import {
  SvxFontItem,
  SvxFontHeightItem,
  SvxWeightItem,
  SvxPostureItem,
  SvxUnderlineItem,
} from "../../../editeng/source/items/textitem";
import type { SfxPoolItem } from "../../../svl/source/items/poolitem";
import { encodeWriterDocument, decodeWriterDocument } from "../filter/xml/writer-document-codec";

const sessions: ReturnType<typeof createWriterDocumentSession>[] = [];
afterEach(
  /** Releases actual owners and mounted views. @returns Nothing. */ () => {
    cleanup();
    vi.restoreAllMocks();
    for (const session of sessions.splice(0)) session.Close();
  },
);
/** Requires an actual fixture owner. @param value - Actual owner. @returns Owner. */
function required<T>(value: T | undefined): T {
  if (value === undefined) throw new Error("Missing native display owner");
  return value;
}
/** Creates one actual native automatic handle. @param owner - Session. @param items - Independent item families. @returns Format. */
function automatic(
  owner: ReturnType<typeof createWriterDocumentSession>,
  ...items: SfxPoolItem[]
): SwFormatAutoFormat {
  const set = new SfxItemSet(owner.docShell.GetDoc().GetAttrPool(), [[1, 49]]);
  for (const item of items) set.Put(item);
  return new SwFormatAutoFormat(set);
}

for (const cell of [false, true])
  for (const generic of [false, true])
    it(`native display composes overlapping attributes cell=${cell}/generic=${generic}`, /** Checks actual pooled owners, frozen primitives and common body/cell rendering. @returns Nothing. */ () => {
      const session = createWriterDocumentSession();
      sessions.push(session);
      const doc = session.docShell.GetDoc(),
        body = required(doc.paragraphs[0]);
      body.SetText("Body");
      const table = doc.nodes.MakeTableNode("Portions", {}, body);
      table.AddColumnWidth(3000);
      table.AddColumnWidth(3000);
      const row = doc.nodes.AppendTableRow(table, 2),
        first = required(required(row.GetTabBoxes()[0]).GetParagraphs()[0]),
        neighbor = required(required(row.GetTabBoxes()[1]).GetParagraphs()[0]);
      neighbor.SetText("Neighbor");
      const node = cell ? first : body;
      node.SetText("abcdefgh");
      node
        .GetOrCreateSwpHints()
        .Insert(new SwTextAttrEnd(automatic(session, new SvxWeightItem(8, 15)), 0, 6));
      node
        .GetOrCreateSwpHints()
        .Insert(
          new SwTextAttrEnd(
            automatic(
              session,
              new SvxPostureItem(2, 11),
              new SvxUnderlineItem(1, 14),
              new SfxStringItem(3, "#123456"),
              new SfxStringItem(42, "#abcdef"),
              new SvxFontHeightItem(320, 8),
              new SvxFontItem("Stored Face", 7, "Resolved Face", generic ? "modern" : undefined),
            ),
            2,
            4,
          ),
        );
      node
        .GetOrCreateSwpHints()
        .Insert(
          new SwTextAttrEnd(
            new SwFormatINetFormat({ url: "https://example.test/portion", targetFrame: "_blank" }),
            2,
            4,
          ),
        );
      // A failure here proves that display has fallen back to the old filter conversion.
      vi.spyOn(SwpHints.prototype, "toTextRuns").mockImplementation(
        /** Rejects the old display path. @returns Never. */ () => {
          throw new Error("Filter TextRuns must not format UI");
        },
      );
      session.view.GetWrtShell().FocusNode(node);
      session.frame.GetDispatcher().Invalidate("document");
      const before = session.viewStore.GetSnapshot(),
        paragraph = required(
          before.textNodes.find(
            /** Finds actual projected owner. @param p - Value. @returns Match. */ (p) =>
              p.nodeIndex === node.GetIndex(),
          ),
        );
      expect(
        paragraph.runs.map(
          /** Reads literal boundaries. @param run - Portion. @returns Start. */ (run) =>
            run.startOffset,
        ),
      ).toEqual([0, 2, 4, 6]);
      expect(paragraph.runs[1]?.attributes).toEqual({
        bold: true,
        italic: true,
        underline: true,
        color: "#123456",
        highlight: "#abcdef",
        fontSizeTwips: 320,
        fontFamily: "Resolved Face",
        ...(generic ? { fontFamilyGeneric: "modern" } : {}),
      });
      expect(paragraph.runs[0]?.attributes).toEqual({
        bold: true,
        italic: false,
        underline: false,
      });
      expect(paragraph.runs[3]?.attributes.bold).toBe(false);
      expect(paragraph.runs[1]?.hyperlink).toEqual({
        url: "https://example.test/portion",
        targetFrame: "_blank",
      });
      expect(Object.isFrozen(paragraph.runs)).toBe(true);
      expect(Object.isFrozen(paragraph.runs[1]?.attributes)).toBe(true);
      render(
        <WriterWorkbench
          isActive
          view={session.view}
          fileDialogs={session.fileDialogs}
          services={session.services}
        />,
      );
      const editor = screen.getByLabelText(
          cell ? "Row 1 column 1 paragraph 1" : "Writer document text",
        ),
        link = screen.getByRole("link", { name: "cd" });
      expect(editor).toHaveTextContent("abcdefgh");
      expect(link.querySelector("strong em")).toHaveTextContent("cd");
      expect(link.querySelector('[style*="font-family"]')).toHaveStyle({
        fontFamily: generic ? "Resolved Face, Liberation Mono, monospace" : "Resolved Face",
      });
      expect(link.querySelector('[style*="font-size"]')).toHaveStyle({ fontSize: "16pt" });
      expect(screen.getByLabelText("Row 1 column 2 paragraph 1")).toHaveTextContent("Neighbor");
      expect(
        /** Keeps the existing canonical transport boundary explicit. @returns Decoded graph. */ () =>
          decodeWriterDocument(encodeWriterDocument(doc)),
      ).toThrow("Overlapping Writer same-type hints are not normalized");
      expect(paragraph.text).toBe("abcdefgh");
      expect(neighbor.GetText()).toBe("Neighbor");
    });

it("native display retains inherited items and explicit normal resets in a clipped text frame", /** Checks default inheritance, direct normal/auto/transparent overrides and UTF-16 clipping. @returns Nothing. */ () => {
  const session = createWriterDocumentSession();
  sessions.push(session);
  const doc = session.docShell.GetDoc(),
    node = required(doc.paragraphs[0]);
  doc.GetDfltTextFormatColl().SetFormatAttr(new SvxWeightItem(8, 15));
  doc.GetDfltTextFormatColl().SetFormatAttr(new SvxPostureItem(2, 11));
  node.SetAttr(new SvxFontItem("Inherited", 7, "Inherited", "roman"));
  node.SetText("ab😀ef");
  node
    .GetOrCreateSwpHints()
    .Insert(
      new SwTextAttrEnd(
        automatic(
          session,
          new SvxWeightItem(5, 15),
          new SvxPostureItem(0, 11),
          new SfxStringItem(3, "auto"),
          new SfxStringItem(42, "transparent"),
        ),
        2,
        4,
      ),
    );
  session.frame.GetDispatcher().Invalidate("document");
  const p = session.viewStore.GetSnapshot().activeParagraph;
  expect(p.runs[0]?.attributes.bold).toBe(true);
  expect(p.runs[1]?.attributes).toMatchObject({
    bold: false,
    italic: false,
    color: "auto",
    highlight: "transparent",
    fontFamily: "Inherited",
    fontFamilyGeneric: "roman",
  });
  render(
    <WriterEditableParagraph
      paragraph={p}
      isActive
      index={0}
      listMarker={undefined}
      fragmentStart={2}
      fragmentEnd={4}
      isFollow
      retainElement={/** Ignores mount. @returns Nothing. */ () => {}}
    />,
  );
  const editor = screen.getByRole("textbox");
  expect(editor).toHaveTextContent("😀");
  expect(editor.querySelector('[style*="font-weight"]')).toHaveStyle({ fontWeight: 400 });
  expect(editor.querySelector('[style*="font-style"]')).toHaveStyle({ fontStyle: "normal" });
});

for (const cell of [false, true])
  it(`native canonical display survives owned copies Worker and edit history cell=${cell}`, /** Checks the existing normalized graph contract independently of raw overlapping stack inputs. @returns Nothing. */ () => {
    const session = createWriterDocumentSession();
    sessions.push(session);
    const doc = session.docShell.GetDoc(),
      body = required(doc.paragraphs[0]);
    body.SetText("Body");
    const table = doc.nodes.MakeTableNode("Canonical", {}, body);
    table.AddColumnWidth(3000);
    table.AddColumnWidth(3000);
    const row = doc.nodes.AppendTableRow(table, 2),
      first = required(required(row.GetTabBoxes()[0]).GetParagraphs()[0]),
      neighbor = required(required(row.GetTabBoxes()[1]).GetParagraphs()[0]);
    neighbor.SetText("Neighbor");
    const node = cell ? first : body;
    node.SetText("abcdef");
    node.InsertItem(automatic(session, new SvxWeightItem(8, 15)), 0, 2, SetAttrMode.NOHINTADJUST);
    node.InsertItem(
      automatic(
        session,
        new SvxWeightItem(8, 15),
        new SvxPostureItem(2, 11),
        new SvxFontItem("Stored", 7, "Resolved", "modern"),
      ),
      2,
      4,
      SetAttrMode.NOHINTADJUST,
    );
    node.InsertItem(
      new SwFormatINetFormat({ url: "https://example.test/canonical" }),
      2,
      4,
      SetAttrMode.NOHINTADJUST,
    );
    session.view.GetWrtShell().FocusNode(node);
    session.frame.GetDispatcher().Invalidate("document");
    const snapshot = session.viewStore.GetSnapshot(),
      p = required(
        snapshot.textNodes.find(
          /** Finds actual connected owner. @param value - Projection. @returns Match. */ (value) =>
            value.nodeIndex === node.GetIndex(),
        ),
      );
    expect(
      p.runs.map(
        /** Reads literal visual flags. @param r - Portion. @returns Flags. */ (r) => [
          r.text,
          r.attributes.bold,
          r.attributes.italic,
        ],
      ),
    ).toEqual([
      ["ab", true, false],
      ["cd", true, true],
      ["ef", false, false],
    ]);
    const decoded = decodeWriterDocument(encodeWriterDocument(doc)),
      decodedNode = required(
        decoded.nodes
          .entries()
          .find(
            /** Resolves native copied text identity. @param n - Owner. @returns Match. */ (
              n,
            ): n is SwTextNode => n instanceof SwTextNode && n.GetIndex() === node.GetIndex(),
          ),
      );
    const cursor = new SwPaM(new SwPosition(decodedNode));
    const copiedProjection = new WriterViewProjection().Project(
      decoded,
      decodedNode,
      cursor,
      session.docShell.GetDocumentState(),
    );
    cursor.Dispose();
    expect(copiedProjection.activeParagraph.runs).toEqual(p.runs);
    expect(decodedNode).not.toBe(node);
    const copied = doc.nodes.MakeTextNode();
    copied.SetText(node.GetText());
    copied.SetTextHints(node.CaptureTextFragment(0, node.Len()).hints);
    expect(copied.GetpSwpHints()?.Get(0)).not.toBe(node.GetpSwpHints()?.Get(0));
    const copiedCursor = new SwPaM(new SwPosition(copied));
    expect(
      new WriterViewProjection().Project(
        doc,
        copied,
        copiedCursor,
        session.docShell.GetDocumentState(),
      ).activeParagraph.runs,
    ).toEqual(p.runs);
    copiedCursor.Dispose();
    render(
      <WriterWorkbench
        isActive
        view={session.view}
        fileDialogs={session.fileDialogs}
        services={session.services}
      />,
    );
    const editor = screen.getByLabelText(
      cell ? "Row 1 column 1 paragraph 1" : "Writer document text",
    );
    expect(editor.querySelector("a strong em")).toHaveTextContent("cd");
    act(
      /** Edits through actual shell history without transport backdoors. @returns Nothing. */ () => {
        const shell = session.view.GetWrtShell();
        shell.SetCursor(new SwPosition(node, node.Len()));
        expect(shell.Insert("!")).toBe(true);
        expect(shell.Undo()).toBe(true);
      },
    );
    expect(editor).toHaveTextContent("abcdef");
    expect(editor.querySelector("a strong em")).toHaveTextContent("cd");
    act(
      /** Restores actual insertion and immutable display state. @returns Nothing. */ () => {
        expect(session.view.GetWrtShell().Redo()).toBe(true);
      },
    );
    expect(editor).toHaveTextContent("abcdef!");
    expect(editor.querySelector("a strong em")).toHaveTextContent("cd");
    expect(p.text).toBe("abcdef");
    expect(
      required(
        session.viewStore
          .GetSnapshot()
          .textNodes.find(
            /** Finds retained identity. @param value - Snapshot. @returns Match. */ (value) =>
              value.nodeIndex === node.GetIndex(),
          ),
      ).id,
    ).toBe(p.id);
    expect(neighbor.GetText()).toBe("Neighbor");
  });
