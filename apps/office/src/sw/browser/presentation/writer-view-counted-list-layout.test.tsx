/** @fileoverview Verifies native independent counted list placement across body and cell owners. */
import { act, cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  SvxFirstLineIndentItem,
  SvxTextLeftMarginItem,
} from "../../../editeng/source/items/frmitems";
import { RES_MARGIN_FIRSTLINE, RES_MARGIN_TEXTLEFT, RES_PARATR_NUMRULE } from "../../inc/hintids";
import { createWriterNumFormat } from "../../source/core/doc/number";
import { SwPosition } from "../../source/core/crsr/pam";
import { projectSwTextPrintBounds } from "../../source/core/layout/newfrm";
import { SwNumRuleItem } from "../../source/core/para/paratr";
import {
  resolveSwListTextLeftMargin,
  resolveSwListFirstLineIndent,
} from "../../source/core/txtnode/ndtxt-list-indent";
import { createWriterDocumentSession } from "../composition/writer-module";
import { WriterEditableParagraph } from "../editor/WriterEditableParagraph";
import { WriterViewStore } from "./writer-view-projection";
const sessions: ReturnType<typeof createWriterDocumentSession>[] = [];
const stores: WriterViewStore[] = [];
afterEach(
  /** Releases native and mounted owners. @returns Nothing. */ () => {
    cleanup();
    vi.restoreAllMocks();
    for (const store of stores.splice(0)) store.Close();
    for (const session of sessions.splice(0)) session.Close();
  },
);
/** Creates actual body and cell sections with independently authored geometry. @param cell - Target a cell. @param kind - Native list family. @returns Owned fixture. */
function fixture(cell = false, kind: "numbered" | "bullet" = "numbered") {
  const session = createWriterDocumentSession();
  sessions.push(session);
  const doc = session.docShell.GetDoc(),
    shell = session.view.GetWrtShell(),
    body = doc.paragraphs[0];
  if (body === undefined) throw new Error("Missing body");
  const table = doc.nodes.MakeTableNode("GeometryTable", {}, body);
  table.AddColumnWidth(3000);
  table.AddColumnWidth(3000);
  const boxes = doc.nodes.AppendTableRow(table, 2).GetTabBoxes(),
    first = boxes[0]?.GetParagraphs()[0],
    neighbor = boxes[1]?.GetParagraphs()[0];
  if (first === undefined || neighbor === undefined) throw new Error("Missing cells");
  const node = cell ? first : body;
  node.SetText("Geometry");
  const rule = doc.EnsureNumRule("GeometryRule", kind);
  rule.Set(
    3,
    createWriterNumFormat(kind, "", {
      positionAndSpaceMode: "label-alignment",
      indentAt: 1440,
      firstLineIndent: -360,
      listTabPosition: 2160,
      labelFollowedBy: "listtab",
      suffix: ".",
    }),
  );
  node.SetNumRule("GeometryRule");
  node.SetAttrListLevel(3);
  node.AddToList();
  shell.FocusNode(node);
  const point = new SwPosition(node, 0);
  shell.SetPaM(point);
  point.Dispose();
  session.docShell.GetUndoManager().Clear();
  const store = new WriterViewStore(session.view);
  stores.push(store);
  return { session, doc, shell, node, rule, store, body, first, neighbor };
}
/** Mounts only immutable presentation values. @param f - Native fixture. @param follow - Follow fragment. @returns Render controls. */
function mount(f: ReturnType<typeof fixture>, follow = false) {
  const props = {
    index: 0,
    isActive: true,
    isFollow: follow,
    ...(f.node === f.first
      ? { cellPosition: { rowIndex: 0, cellIndex: 0, paragraphIndex: 0 } }
      : {}),
    retainElement: /** Keeps this projection read-only. @returns Nothing. */ () => undefined,
  };
  const paragraph = f.store.GetSnapshot().activeParagraph;
  const view = render(
    <WriterEditableParagraph {...props} paragraph={paragraph} listMarker={paragraph.listMarker} />,
  );
  return {
    ...view,
    refresh: /** Projects the current native revision. @returns Nothing. */ () => {
      const next = f.store.GetSnapshot().activeParagraph;
      view.rerender(
        <WriterEditableParagraph {...props} paragraph={next} listMarker={next.listMarker} />,
      );
    },
  };
}
describe("native counted list axes", /** Registers literal independent layout ownership. @returns Nothing. */ () => {
  for (const cell of [false, true])
    for (const inherited of [false, true])
      for (const profile of [
        { left: undefined, first: undefined, textLeft: 1440, offset: -360 },
        { left: 1680, first: undefined, textLeft: 1680, offset: -360 },
        { left: undefined, first: 120, textLeft: 1440, offset: 120 },
        { left: 0, first: undefined, textLeft: 0, offset: -360 },
        { left: -240, first: 120, textLeft: -240, offset: 120 },
        { left: 1680, first: 65537, textLeft: 1680, offset: 1 },
        { left: undefined, first: -65537, textLeft: 1440, offset: -1 },
      ])
        it(`projects left=${profile.left} first=${profile.first} cell=${cell} inherited=${inherited}`, /** Checks native short inputs,independent style/direct axes and metadata cannot select layout. @returns Nothing. */ () => {
          const f = fixture(cell);
          if (inherited) {
            const style = f.doc.GetTextFormatColl("text-body");
            style.ResetFormatAttr(RES_MARGIN_FIRSTLINE);
            style.ResetFormatAttr(RES_MARGIN_TEXTLEFT);
            style.SetFormatAttr(new SwNumRuleItem("GeometryRule"));
            f.node.ResetAttr(RES_PARATR_NUMRULE);
            f.node.ChgFormatColl(style);
            f.node.AddToList();
          }
          if (profile.left !== undefined)
            f.node.SetAttr(new SvxTextLeftMarginItem(profile.left, RES_MARGIN_TEXTLEFT));
          if (profile.first !== undefined)
            f.node.SetAttr(new SvxFirstLineIndentItem(profile.first, RES_MARGIN_FIRSTLINE, true));
          f.node.SetListGeometryWins(true);
          const before = f.session.docShell.GetUndoManager().GetUndoActionCount(),
            id = f.node.GetListId();
          const projected = f.store.GetSnapshot().activeParagraph;
          expect(resolveSwListTextLeftMargin(f.node)).toBe(profile.textLeft);
          expect(resolveSwListFirstLineIndent(f.node)).toBe(profile.offset);
          expect(projected.listLayout?.indentAtPt).toBe(profile.textLeft / 20);
          expect(projected.listLayout?.firstLineIndentPt).toBe(profile.offset / 20);
          expect(projectSwTextPrintBounds(f.node, f.doc.GetPageDesc().GetValue()).left).toBe(
            profile.textLeft + profile.offset,
          );
          const view = mount(f),
            p = screen.getByRole("textbox"),
            marker = view.container.querySelector("[data-writer-list-marker]");
          if (marker === null) throw new Error("Missing counted marker");
          expect(marker.parentElement).toHaveStyle({
            marginInlineStart: `${(profile.textLeft + profile.offset) / 20}pt`,
          });
          expect(p.style.textIndent).toBe("");
          act(
            /** Changes retained metadata without layout authority. @returns Nothing. */ () => {
              f.node.SetListGeometryWins(false);
            },
          );
          view.refresh();
          expect(marker.parentElement).toHaveStyle({
            marginInlineStart: `${(profile.textLeft + profile.offset) / 20}pt`,
          });
          expect(f.node.GetListId()).toBe(id);
          expect(f.node.GetText()).toBe("Geometry");
          expect(f.neighbor.GetText()).toBe("");
          expect(f.session.docShell.GetUndoManager().GetUndoActionCount()).toBe(before);
        });
  for (const cell of [false, true])
    for (const p of [
      { raw: -120, ignore: false, absolute: false, left: 960, offset: -480 },
      { raw: 120, ignore: false, absolute: false, left: 960, offset: -240 },
      { raw: -120, ignore: true, absolute: false, left: 960, offset: -360 },
      { raw: 120, ignore: true, absolute: true, left: 720, offset: -360 },
      { raw: -120, ignore: false, absolute: true, left: 840, offset: -480 },
      { raw: 65537, ignore: false, absolute: false, left: 960, offset: -359 },
    ])
      it(`projects legacy raw=${p.raw} ignore=${p.ignore} absolute=${p.absolute} cell=${cell}`, /** Checks native absolute/relative text-left and signed-short sum independently of label width. @returns Nothing. */ () => {
        const f = fixture(cell);
        f.rule.Set(
          3,
          createWriterNumFormat("numbered", "", {
            positionAndSpaceMode: "label-width-and-position",
            absLSpace: 720,
            firstLineOffset: -360,
            charTextDistance: 100,
          }),
        );
        f.rule.SetAbsSpaces(p.absolute);
        f.node.SetAttr(new SvxTextLeftMarginItem(240, RES_MARGIN_TEXTLEFT));
        f.node.SetAttr(new SvxFirstLineIndentItem(p.raw, RES_MARGIN_FIRSTLINE));
        f.doc.GetDocumentSettingManager().set("IGNORE_FIRST_LINE_INDENT_IN_NUMBERING", p.ignore);
        expect(resolveSwListTextLeftMargin(f.node)).toBe(p.left);
        expect(resolveSwListFirstLineIndent(f.node)).toBe(p.offset);
        expect(projectSwTextPrintBounds(f.node, f.doc.GetPageDesc().GetValue()).left).toBe(
          p.left + p.offset,
        );
        const projected = f.store.GetSnapshot().activeParagraph;
        expect(projected.listLayout?.indentAtPt).toBe(p.left / 20);
        expect(projected.listLayout?.firstLineIndentPt).toBe(p.offset / 20);
        const view = mount(f);
        expect(
          view.container.querySelector("[data-writer-list-marker]")?.parentElement,
        ).toHaveStyle({ marginInlineStart: `${(p.left + p.offset) / 20}pt` });
      });
  for (const cell of [false, true])
    for (const kind of ["bullet", "numbered"] as const)
      it(`restores independent ${kind} axes through paragraph history cell=${cell}`, /** Checks actual shared shell edits,history and follow marker suppression. @returns Nothing. */ () => {
        const f = fixture(cell, kind),
          retained = f.store.GetSnapshot().activeParagraph,
          view = mount(f);
        act(
          /** Sets native left item independently. @returns Nothing. */ () => {
            expect(
              f.shell.SetParagraphItems([new SvxTextLeftMarginItem(1680, RES_MARGIN_TEXTLEFT)]),
            ).toBe(true);
          },
        );
        view.refresh();
        expect(f.store.GetSnapshot().activeParagraph.listLayout).toMatchObject({
          indentAtPt: 84,
          firstLineIndentPt: -18,
        });
        act(
          /** Sets native first-line item independently. @returns Nothing. */ () => {
            expect(
              f.shell.SetParagraphItems([new SvxFirstLineIndentItem(120, RES_MARGIN_FIRSTLINE)]),
            ).toBe(true);
          },
        );
        view.refresh();
        expect(f.store.GetSnapshot().activeParagraph.listLayout).toMatchObject({
          indentAtPt: 84,
          firstLineIndentPt: 6,
        });
        act(
          /** Restores native first-line absence. @returns Nothing. */ () => {
            expect(f.shell.Undo()).toBe(true);
          },
        );
        view.refresh();
        expect(f.store.GetSnapshot().activeParagraph.listLayout?.firstLineIndentPt).toBe(-18);
        act(
          /** Reapplies the independent first-line item. @returns Nothing. */ () => {
            expect(f.shell.Redo()).toBe(true);
          },
        );
        view.refresh();
        expect(
          view.container.querySelector("[data-writer-list-marker]")?.parentElement,
        ).toHaveStyle({ marginInlineStart: "90pt" });
        expect(retained.listLayout?.indentAtPt).toBe(72);
        expect(retained.listLayout?.firstLineIndentPt).toBe(-18);
        expect(f.node.GetText()).toBe("Geometry");
        expect(f.neighbor.GetText()).toBe("");
        cleanup();
        const follow = mount(f, true);
        expect(follow.container.querySelector("[data-writer-list-marker]")).toBeNull();
        expect(screen.getByRole("textbox")).toHaveTextContent("Geometry");
      });
  it("resolves plain and unbound first-line inputs and keeps uncounted legacy offset zero", /** Checks native owner boundaries without changing raw authored items. @returns Nothing. */ () => {
    const f = fixture(),
      record = f.node.GetNum();
    if (record === undefined) throw new Error("Missing bound number");
    f.node.SetAttr(new SvxFirstLineIndentItem(120, RES_MARGIN_FIRSTLINE));
    vi.spyOn(record, "GetNumRule").mockReturnValue(undefined);
    expect(resolveSwListFirstLineIndent(f.node)).toBe(120);
    expect(f.store.GetSnapshot().activeParagraph.listLayout).toBeUndefined();
    vi.restoreAllMocks();
    f.rule.Set(
      3,
      createWriterNumFormat("numbered", "", {
        positionAndSpaceMode: "label-width-and-position",
        absLSpace: 720,
        firstLineOffset: -360,
      }),
    );
    f.node.SetCountedInList(false);
    expect(resolveSwListFirstLineIndent(f.node)).toBe(0);
    f.node.ResetAttr(RES_PARATR_NUMRULE);
    expect(resolveSwListTextLeftMargin(f.node)).toBeUndefined();
    expect(resolveSwListFirstLineIndent(f.node)).toBe(120);
  });
});
