/** @fileoverview Checks native minimum label distance at the immutable browser rendering boundary. */
import { cleanup, render } from "@testing-library/react";
import { afterEach, expect, it } from "vitest";
import { createWriterDocumentSession } from "../composition/writer-module";
import { WriterViewStore } from "../presentation/writer-view-projection";
import { createWriterNumFormat } from "../../source/core/doc/number";
import { WriterEditableParagraph } from "./WriterEditableParagraph";
afterEach(/** Releases mounted projections. @returns Nothing. */ () => cleanup());
for (const cell of [false, true])
  for (const kind of ["bullet", "numbered"] as const)
    for (const mode of ["label-alignment", "label-width-and-position"] as const)
      it(`projects label minimum separately from authored layout cell=${cell} kind=${kind} mode=${mode}`, /** Checks actual node/rule ownership and the platform intrinsic-width boundary. @returns Nothing. */ () => {
        const session = createWriterDocumentSession(),
          doc = session.docShell.GetDoc(),
          body = doc.paragraphs[0];
        if (body === undefined) throw new Error("Missing body");
        const table = doc.nodes.MakeTableNode("WidthTable", {}, body);
        table.AddColumnWidth(3000);
        const node = cell
          ? doc.nodes.AppendTableRow(table, 1).GetTabBoxes()[0]?.GetParagraphs()[0]
          : body;
        if (node === undefined) throw new Error("Missing cell");
        node.SetText("Owned item text");
        const rule = doc.EnsureNumRule("WidthRule", kind);
        rule.Set(
          2,
          createWriterNumFormat(kind, "•", {
            positionAndSpaceMode: mode,
            indentAt: 720,
            firstLineIndent: 0,
            listTabPosition: 720,
            absLSpace: 720,
            firstLineOffset: 0,
            charTextDistance: 216,
            labelFollowedBy: "listtab",
            suffix: ".",
          }),
        );
        node.SetNumRule("WidthRule");
        node.SetAttrListLevel(2);
        node.AddToList();
        session.view.GetWrtShell().FocusNode(node);
        const store = new WriterViewStore(session.view);
        try {
          const p = store.GetSnapshot().activeParagraph;
          expect(p.listMarkerMinimumDistancePt).toBe(mode === "label-alignment" ? 0 : 10.8);
          expect(Object.keys(p.listLayout ?? {}).sort()).toEqual([
            "firstLineIndentPt",
            "indentAtPt",
            "labelFollowedBy",
            "listTabPositionPt",
          ]);
          expect(p.text).toBe("Owned item text");
          const owner = node.GetNumRule(),
            listId = node.GetListId();
          const view = render(
            <WriterEditableParagraph
              index={0}
              isActive
              paragraph={p}
              listMarker={p.listMarker}
              {...(cell ? { cellPosition: { rowIndex: 0, cellIndex: 0, paragraphIndex: 0 } } : {})}
              retainElement={/** Keeps mounting read-only. @returns Nothing. */ () => undefined}
            />,
          );
          const marker = view.container.querySelector("[data-writer-list-marker]");
          expect(marker).toHaveStyle({
            minWidth: "max-content",
            paddingInlineEnd: mode === "label-alignment" ? "0pt" : "10.8pt",
          });
          expect(node.GetNumRule()).toBe(owner);
          expect(node.GetListId()).toBe(listId);
          expect(node.GetText()).toBe("Owned item text");
          expect(node.GetActualListLevel()).toBe(2);
        } finally {
          store.Close();
          session.Close();
        }
      });

it("retains omitted label-gap compatibility and follow suppression", /** Checks older detached projections and follow frames preserve editable text without a repeated label. @returns Nothing. */ () => {
  const session = createWriterDocumentSession(),
    doc = session.docShell.GetDoc(),
    node = doc.paragraphs[0];
  if (node === undefined) throw new Error("Missing body");
  node.SetText("Stable body");
  session.view.GetWrtShell().SetParagraphListKind("bullet");
  const store = new WriterViewStore(session.view);
  try {
    const { listMarkerMinimumDistancePt: gap, ...paragraph } = store.GetSnapshot().activeParagraph;
    expect(gap).toBe(0);
    const props = {
      index: 0,
      isActive: true,
      paragraph,
      listMarker: paragraph.listMarker,
      retainElement: /** Keeps this detached projection read-only. @returns Nothing. */ () =>
        undefined,
    };
    const view = render(<WriterEditableParagraph {...props} />);
    expect(view.container.querySelector("[data-writer-list-marker]")).toHaveStyle({
      paddingInlineEnd: "0pt",
      minWidth: "max-content",
    });
    expect(view.getByRole("textbox")).toHaveTextContent("Stable body");
    view.rerender(<WriterEditableParagraph {...props} isFollow />);
    expect(view.container.querySelector("[data-writer-list-marker]")).toBeNull();
    expect(view.getByRole("textbox")).toHaveTextContent("Stable body");
    expect(node.GetText()).toBe("Stable body");
    expect(node.GetListKind()).toBe("bullet");
  } finally {
    store.Close();
    session.Close();
  }
});
