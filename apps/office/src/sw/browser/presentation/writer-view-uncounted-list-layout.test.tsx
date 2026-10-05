/** @fileoverview Verifies native uncounted list text placement across body and cell owners. */
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
import { resolveSwListTextLeftMargin } from "../../source/core/txtnode/ndtxt-list-indent";
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
describe("native uncounted list text geometry", /** Registers literal upstream placement contracts. @returns Nothing. */ () => {
  for (const cell of [false, true])
    for (const inherited of [false, true])
      for (const profile of [
        { left: undefined, first: undefined, textLeft: 1440 },
        { left: 1680, first: undefined, textLeft: 1680 },
        { left: undefined, first: 120, textLeft: 1440 },
        { left: 0, first: -120, textLeft: 0 },
        { left: -240, first: 120, textLeft: -240 },
      ])
        it(`retains left=${profile.left} first=${profile.first} cell=${cell} inherited=${inherited}`, /** Checks both axes, negative and zero placement without label-tab or legacy metadata guesses. @returns Nothing. */ () => {
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
          f.node.SetCountedInList(false);
          f.node.SetListGeometryWins(true);
          const count = f.doc.nodes.entries().length,
            id = f.node.GetListId(),
            history = f.session.docShell.GetUndoManager().GetUndoActionCount();
          const projected = f.store.GetSnapshot().activeParagraph;
          expect(resolveSwListTextLeftMargin(f.node)).toBe(profile.textLeft);
          expect(projected.uncountedListTextLeftPt).toBe(profile.textLeft / 20);
          expect(projected.listMarker).toBeUndefined();
          expect(projected.listLayout?.listTabPositionPt).toBe(108);
          expect(projectSwTextPrintBounds(f.node, f.doc.GetPageDesc().GetValue()).left).toBe(
            profile.textLeft,
          );
          const view = mount(f);
          const p = screen.getByRole("textbox");
          expect(p).toHaveStyle({
            marginInlineStart: `${profile.textLeft / 20}pt`,
            textIndent: "0pt",
          });
          expect(p.parentElement?.style.marginInlineStart).toBe("");
          expect(view.container.querySelector("[data-writer-list-marker]")).toBeNull();
          expect(view.container.querySelector(".shrink-0[aria-hidden='true']")).toBeNull();
          expect(p).toHaveTextContent("Geometry");
          expect(f.node.GetNumRule()).toBe(f.rule);
          expect(f.node.GetListId()).toBe(id);
          expect(f.node.GetActualListLevel()).toBe(3);
          expect(f.doc.nodes.entries()).toHaveLength(count);
          expect(f.neighbor.GetText()).toBe("");
          expect(f.session.docShell.GetUndoManager().GetUndoActionCount()).toBe(history);
        });
  for (const cell of [false, true])
    for (const absolute of [false, true])
      for (const first of [-120, 120])
        it(`retains legacy text-left absolute=${absolute} first=${first} cell=${cell}`, /** Checks native AbsLSpace ownership without using a label offset for uncounted text. @returns Nothing. */ () => {
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
          f.rule.SetAbsSpaces(absolute);
          f.node.SetAttr(new SvxTextLeftMarginItem(240, RES_MARGIN_TEXTLEFT));
          f.node.SetAttr(new SvxFirstLineIndentItem(first, RES_MARGIN_FIRSTLINE));
          f.node.SetCountedInList(false);
          const left = absolute ? (first < 0 ? 840 : 720) : 960;
          expect(resolveSwListTextLeftMargin(f.node)).toBe(left);
          expect(projectSwTextPrintBounds(f.node, f.doc.GetPageDesc().GetValue()).left).toBe(left);
          mount(f, true);
          expect(screen.getByRole("textbox")).toHaveStyle({
            marginInlineStart: `${left / 20}pt`,
            textIndent: "0pt",
          });
          expect(
            screen.queryByTestId(`writer-list-marker-${f.store.GetSnapshot().activeParagraph.id}`),
          ).toBeNull();
        });
  for (const cell of [false, true])
    for (const kind of ["bullet", "numbered"] as const)
      it(`reprojects ${kind} geometry through native count history cell=${cell}`, /** Checks actual edit-window transitions preserve text, rule and neighbor owners. @returns Nothing. */ () => {
        const f = fixture(cell, kind),
          retained = f.store.GetSnapshot().activeParagraph,
          view = mount(f);
        expect(retained.uncountedListTextLeftPt).toBeUndefined();
        expect(retained.listMarker).toBeDefined();
        const id = f.node.GetListId(),
          count = f.doc.nodes.entries().length;
        act(
          /** Applies native Backspace count transition. @returns Nothing. */ () => {
            expect(f.session.view.GetEditWin().DeleteLeft()).toBe(true);
          },
        );
        view.refresh();
        expect(f.store.GetSnapshot().activeParagraph.uncountedListTextLeftPt).toBe(72);
        expect(screen.getByRole("textbox")).toHaveStyle({
          marginInlineStart: "72pt",
          textIndent: "0pt",
        });
        act(
          /** Restores counted state through native history. @returns Nothing. */ () => {
            expect(f.shell.Undo()).toBe(true);
          },
        );
        view.refresh();
        expect(f.store.GetSnapshot().activeParagraph.uncountedListTextLeftPt).toBeUndefined();
        expect(screen.getByRole("textbox").style.marginInlineStart).toBe("");
        act(
          /** Reapplies uncounted state through native history. @returns Nothing. */ () => {
            expect(f.shell.Redo()).toBe(true);
          },
        );
        view.refresh();
        expect(screen.getByRole("textbox")).toHaveStyle({
          marginInlineStart: "72pt",
          textIndent: "0pt",
        });
        act(
          /** Restores native numbering with ShiftBackspace. @returns Nothing. */ () => {
            expect(f.session.view.GetEditWin().DeleteLeft(true)).toBe(true);
          },
        );
        view.refresh();
        expect(f.store.GetSnapshot().activeParagraph.uncountedListTextLeftPt).toBeUndefined();
        expect(retained.listMarker).toBeDefined();
        expect(Object.isFrozen(retained)).toBe(true);
        expect(f.node.GetListId()).toBe(id);
        expect(f.node.GetNumRule()).toBe(f.rule);
        expect(f.node.GetText()).toBe("Geometry");
        expect(f.doc.nodes.entries()).toHaveLength(count);
        expect(f.neighbor.GetText()).toBe("");
      });
  it("leaves plain and unbound nodes outside list geometry", /** Checks absent native owner does not suppress plain first-line indentation. @returns Nothing. */ () => {
    const f = fixture();
    const record = f.node.GetNum();
    if (record === undefined) throw new Error("Missing bound number");
    vi.spyOn(record, "GetNumRule").mockReturnValue(undefined);
    f.node.SetCountedInList(false);
    expect(resolveSwListTextLeftMargin(f.node)).toBeUndefined();
    expect(f.store.GetSnapshot().activeParagraph.uncountedListTextLeftPt).toBeUndefined();
    vi.restoreAllMocks();
    f.node.ResetAttr(RES_PARATR_NUMRULE);
    f.node.SetAttr(new SvxTextLeftMarginItem(600, RES_MARGIN_TEXTLEFT));
    f.node.SetAttr(new SvxFirstLineIndentItem(120, RES_MARGIN_FIRSTLINE));
    expect(resolveSwListTextLeftMargin(f.node)).toBeUndefined();
    expect(projectSwTextPrintBounds(f.node, f.doc.GetPageDesc().GetValue()).left).toBe(720);
    mount(f);
    expect(screen.getByRole("textbox")).toHaveStyle({
      marginInlineStart: "30pt",
      textIndent: "6pt",
    });
  });
});
