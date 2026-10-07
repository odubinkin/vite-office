/** @fileoverview Checks actual mounted numbering font ownership for body and table-cell lists. */
import { act, cleanup, render } from "@testing-library/react";
import { afterEach, expect, it } from "vitest";
import { createWriterDocumentSession } from "../composition/writer-module";
import { WriterWorkbench } from "../presentation/writer-view";
import { WriterViewStore } from "../presentation/writer-view-projection";
import { WriterEditableParagraph } from "./WriterEditableParagraph";
import { applyWriterParagraphList } from "../../source/core/doc/list";
import { createWriterNumFormat } from "../../source/core/doc/number";
import { SfxStringItem } from "../../../svl/source/items/stritem";
import {
  FontItalic,
  FontLineStyle,
  FontWeight,
  SvxFontItem,
  SvxFontHeightItem,
  SvxPostureItem,
  SvxUnderlineItem,
  SvxWeightItem,
} from "../../../editeng/source/items/textitem";
import {
  RES_CHRATR_FONT,
  RES_CHRATR_FONTSIZE,
  RES_CHRATR_POSTURE,
  RES_CHRATR_WEIGHT,
  RES_CHRATR_UNDERLINE,
  RES_CHRATR_COLOR,
} from "../../inc/hintids";
const sessions: ReturnType<typeof createWriterDocumentSession>[] = [];
afterEach(
  /** Unmounts before original owner disposal. @returns Nothing. */ () => {
    cleanup();
    for (const session of sessions.splice(0)) session.Close();
  },
);
for (const cell of [false, true])
  for (const kind of ["bullet", "numbered"] as const)
    it(`native label font resets independently from paragraph cell=${cell} kind=${kind}`, /** Checks actual option owner, immutable values, body/cell painting and edit/history without private marker state. @returns Nothing. */ () => {
      const session = createWriterDocumentSession();
      sessions.push(session);
      const doc = session.docShell.GetDoc(),
        body = doc.paragraphs[0];
      if (body === undefined) throw Error("Missing body");
      const table = doc.GetNodes().MakeTableNode("Font labels");
      table.AddColumnWidth(6000);
      const node = cell
        ? doc.GetNodes().AppendTableRow(table, 1).GetTabBoxes()[0]?.GetParagraphs()[0]
        : body;
      if (node === undefined) throw Error("Missing member");
      node.SetText("Owned label font");
      node.SetAttr(
        new SvxFontItem("Liberation Serif", RES_CHRATR_FONT, "Liberation Serif", "roman"),
      );
      node.SetAttr(new SvxFontHeightItem(320, RES_CHRATR_FONTSIZE));
      node.SetAttr(new SvxWeightItem(FontWeight.BOLD, RES_CHRATR_WEIGHT));
      node.SetAttr(new SvxPostureItem(FontItalic.NORMAL, RES_CHRATR_POSTURE));
      node.SetAttr(new SvxUnderlineItem(FontLineStyle.SINGLE, RES_CHRATR_UNDERLINE));
      node.SetAttr(new SfxStringItem(RES_CHRATR_COLOR, "#336699"));
      applyWriterParagraphList(node, { kind, level: 0, ruleName: "LabelFont" });
      const rule = node.GetNumRule();
      if (rule === undefined) throw Error("Missing rule");
      rule.Set(0, createWriterNumFormat(kind, "•", { bulletFont: "Liberation Mono" }));
      session.view.GetWrtShell().FocusNode(node);
      const nodeIndex = node.GetIndex();
      doc.GetUndoManager().Clear();
      const store = new WriterViewStore(session.view),
        mounted = render(<WriterWorkbench isActive view={session.view} />);
      /** Reads the current original node's marker. @returns Device decoration. */
      function marker(): HTMLElement {
        const element = mounted.container
          .querySelector(`p[data-writer-node-index="${nodeIndex}"]`)
          ?.parentElement?.querySelector<HTMLElement>("[data-writer-list-marker]");
        if (element == null) throw Error("Missing marker");
        return element;
      }
      const beforeGeneration = session.docShell.GetContentGeneration(),
        beforeModified = session.docShell.IsModified();
      try {
        expect(marker()).toHaveStyle({
          fontFamily:
            kind === "bullet" ? "Liberation Mono" : "Liberation Serif, Liberation Serif, serif",
          fontSize: "16pt",
          fontWeight: kind === "bullet" ? 400 : 700,
          fontStyle: kind === "bullet" ? "normal" : "italic",
          color: "#336699",
          minWidth: "max-content",
        });
        expect(marker().style.textDecorationLine).toBe("");
        const retained = store.GetSnapshot();
        expect(Object.isFrozen(retained.activeParagraph.listMarkerFont)).toBe(true);
        const text = mounted.container.querySelector(
          `p[data-writer-node-index="${node.GetIndex()}"]`,
        );
        expect(text).toHaveStyle({ fontWeight: 700, fontStyle: "italic", fontSize: "16pt" });
        act(
          /** Uses the actual compatibility setting and explicit native view repaint. @returns Nothing. */ () => {
            doc.GetDocumentSettingManager().set("DO_NOT_RESET_PARA_ATTRS_FOR_NUM_FONT", true);
            session.view.GetViewFrame().GetBindings().Invalidate("view");
          },
        );
        expect(marker()).toHaveStyle({
          fontWeight: 700,
          fontStyle: "italic",
          textDecorationLine: "underline",
        });
        expect(retained.activeParagraph.listMarkerFont?.weight).toBe(
          kind === "bullet" ? FontWeight.NORMAL : FontWeight.BOLD,
        );
        expect(retained.activeParagraph.listMarkerFont?.underline).toBe(FontLineStyle.NONE);
        act(
          /** Admits native label affinity while retaining the selected source font. @returns Nothing. */ () => {
            session.view.GetEditWin().SetSelection({
              point: { nodeIndex: node.GetIndex(), contentIndex: 0, inFrontOfLabel: true },
            });
          },
        );
        expect(marker()).toHaveStyle({ backgroundColor: "#c0c0c0", fontWeight: 700 });
        expect(session.docShell.GetContentGeneration()).toBe(beforeGeneration);
        expect(session.docShell.IsModified()).toBe(beforeModified);
        expect(doc.GetUndoManager().GetUndoActionCount()).toBe(0);
        act(
          /** Types only through the existing native edit window. @returns Nothing. */ () => {
            session.view.GetEditWin().InsertText("X");
          },
        );
        expect(node.GetText()).toBe("XOwned label font");
        expect(marker().style.backgroundColor).toBe("");
        expect(marker()).toHaveStyle({ fontWeight: 700, textDecorationLine: "underline" });
        expect(node.GetNumRule()).toBe(rule);
        expect(doc.GetUndoManager().GetUndoActionCount()).toBe(1);
      } finally {
        store.Close();
      }
    });

it("detached and follow projections retain the previous device fallback without another font owner", /** Checks older primitive projections and native oblique/auto ink conversion. @returns Nothing. */ () => {
  const session = createWriterDocumentSession();
  sessions.push(session);
  session.view.GetWrtShell().SetParagraphListKind("bullet");
  const store = new WriterViewStore(session.view);
  try {
    const snapshot = store.GetSnapshot(),
      { listMarkerFont, ...detached } = snapshot.activeParagraph;
    if (listMarkerFont === undefined) throw Error("Missing native font values");
    const props = {
      index: 0,
      isActive: true,
      paragraph: detached,
      listMarker: detached.listMarker,
      retainElement: /** Keeps detached device rendering read-only. @returns Nothing. */ () =>
        undefined,
    };
    const mounted = render(<WriterEditableParagraph {...props} />);
    const marker = mounted.container.querySelector<HTMLElement>("[data-writer-list-marker]");
    expect(marker).toHaveStyle({
      fontWeight: detached.computedStyle.fontWeight,
      fontStyle: detached.computedStyle.fontStyle,
    });
    mounted.rerender(
      <WriterEditableParagraph
        {...props}
        paragraph={{
          ...detached,
          listMarkerFont: { ...listMarkerFont, posture: FontItalic.OBLIQUE, color: "auto" },
        }}
      />,
    );
    expect(marker).toHaveStyle({ fontStyle: "oblique" });
    expect(marker?.style.color).toBe("initial");
    mounted.rerender(<WriterEditableParagraph {...props} isFollow />);
    expect(mounted.container.querySelector("[data-writer-list-marker]")).toBeNull();
  } finally {
    store.Close();
  }
});
