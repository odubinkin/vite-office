/** @fileoverview Verifies actual inclusive Writer paragraph collection ranges and one native undo owner against literal node/style contracts. */

import { afterEach, describe, expect, it } from "vitest";
import { SfxRequest, createRequestArguments } from "../../../../sfx2/source/control/request";
import { SfxUInt16Item } from "../../../../svl/source/items/intitem";
import { createDocument } from "../../../../sfx2/source/doc/objsh";
import { SfxViewFrame } from "../../../../sfx2/source/view/viewfrm";
import { SwDoc } from "../doc/doc";
import { SwPaM, SwPosition } from "../crsr/pam";
import { SwTextNode } from "../txtnode/ndtxt";
import { SwNumRuleItem } from "../para/paratr";
import { RES_PARATR_NUMRULE, RES_PARATR_LIST_LEVEL } from "../../../inc/hintids";
import { getTextFormatCollNodes } from "../doc/docfmt";
import { SwUndoFormatColl } from "../undo/unfmco";
import { SwDocShell } from "../../uibase/app/docsh";
import { SwView } from "../../uibase/uiview/view";
import { createTextFormatCollAction } from "./edfcol";

const views: SwView[] = [];

/** Requires a real native fixture node. @param value - Optional node. @returns Defined value. */
function required<T>(value: T | undefined): T {
  if (value === undefined) throw new Error("Missing paragraph range fixture");
  return value;
}

/** Creates actual document/view/frame owners with an empty middle paragraph. @returns Core owner chain and independent node identities. */
function fixture() {
  const doc = new SwDoc(),
    first = required(doc.paragraphs[0]);
  first.SetText("BeforeRange");
  for (const text of ["AlphaRange", "", "BravoRange", "AfterRange"])
    doc.GetNodes().MakeTextNode(text);
  const parent = doc.MakeTextFormatColl("Range parent", doc.GetDfltTextFormatColl(), "RangeParent");
  const a = doc.MakeTextFormatColl("Owned range A", parent, "OwnedA"),
    b = doc.MakeTextFormatColl("Owned range B", parent, "OwnedB");
  a.SetNextTextFormatColl(b);
  b.SetNextTextFormatColl(a);
  const owner = new SwDocShell(
    doc,
    createDocument({ id: "range-style", suiteId: "writer", title: "Range" }),
  );
  const view = new SwView(owner),
    frame = new SfxViewFrame<SwView>();
  view.AttachFrame(frame);
  frame.SetActiveView(view, [
    owner.GetCommandShell(),
    view.GetCommandShell(),
    view.GetWrtShell().GetCommandShell(),
    view.GetWrtShell().GetListShell().GetCommandShell(),
  ]);
  views.push(view);
  return {
    doc,
    owner,
    view,
    frame,
    shell: view.GetWrtShell(),
    nodes: doc.paragraphs.slice(),
    a,
    b,
    parent,
  };
}

afterEach(
  /** Closes all actual source-owned view chains. @returns Nothing. */ () => {
    for (const view of views.splice(0)) view.Close();
  },
);

describe("SwEditShell inclusive paragraph collection range", /** Groups source-derived whole-node style selection. @returns Nothing. */ () => {
  it.each([false, true])(
    "applies every mixed selected paragraph with reversed=%s, including empty/end-zero and an already-active endpoint",
    /** Checks exact range, original ownership and one undo unit. @param reversed - Point/mark direction. @returns Nothing. */ (
      reversed,
    ) => {
      const { doc, owner, shell, nodes, a, b, parent } = fixture();
      const first = required(nodes[1]),
        empty = required(nodes[2]),
        last = required(nodes[3]);
      first.ChgFormatColl(a);
      empty.ChgFormatColl(b);
      last.ChgFormatColl(b);
      const before = nodes.map(
        /** Reads current actual collection identities. @param node - Paragraph. @returns Collection. */ (
          node,
        ) => node.GetTextFormatColl(),
      );
      const point = reversed ? new SwPosition(last, 0) : new SwPosition(first, 2),
        mark = reversed ? new SwPosition(first, 2) : new SwPosition(last, 0);
      shell.SetPaM(point, mark);
      const cursor = shell.GetCursor();
      expect(getTextFormatCollNodes(doc, cursor)).toEqual([first, empty, last]);
      expect(shell.SetParagraphStyle("OwnedA")).toBe(true);
      expect(
        nodes.map(
          /** Reads independent style IDs. @param node - Paragraph. @returns ID. */ (node) =>
            node.GetParagraphStyle(),
        ),
      ).toEqual(["default", "OwnedA", "OwnedA", "OwnedA", "default"]);
      expect(owner.GetUndoManager().GetUndoActionCount()).toBe(1);
      expect(owner.GetUndoManager().GetUndoAction()).toBeInstanceOf(SwUndoFormatColl);
      expect(first.GetTextFormatColl()).toBe(a);
      expect(a.DerivedFrom()).toBe(parent);
      expect(a.GetNextTextFormatColl()).toBe(b);
      expect(shell.SetParagraphStyle("OwnedA")).toBe(false);
      expect(owner.GetUndoManager().GetUndoActionCount()).toBe(1);
      for (let iteration = 0; iteration < 3; iteration += 1) {
        expect(shell.Undo()).toBe(true);
        expect(
          nodes.map(
            /** Reads restored actual owners. @param node - Paragraph. @returns Collection. */ (
              node,
            ) => node.GetTextFormatColl(),
          ),
        ).toEqual(before);
        expect(shell.GetCursor()).toBe(cursor);
        expect(cursor.GetPoint().GetNode()).toBe(reversed ? last : first);
        expect(cursor.GetPoint().GetContentIndex()).toBe(reversed ? 0 : 2);
        expect(cursor.GetMark().GetNode()).toBe(reversed ? first : last);
        expect(cursor.GetMark().GetContentIndex()).toBe(reversed ? 2 : 0);
        expect(shell.Redo()).toBe(true);
        expect([
          first.GetTextFormatColl(),
          empty.GetTextFormatColl(),
          last.GetTextFormatColl(),
        ]).toEqual([a, a, a]);
        expect(cursor.HasMark()).toBe(true);
      }
      expect(doc.paragraphs).toEqual(nodes);
    },
  );

  it("changes only the collapsed paragraph and retains local whole-range no-op history", /** Checks canonical caret and unchanged range contracts. @returns Nothing. */ () => {
    const { owner, shell, nodes, a } = fixture();
    const target = required(nodes[2]);
    shell.SetPaM(new SwPosition(target, 0));
    expect(shell.SetParagraphStyle("OwnedA")).toBe(true);
    expect(
      nodes.map(
        /** Reads literal node styles. @param node - Paragraph. @returns Style ID. */ (node) =>
          node.GetParagraphStyle(),
      ),
    ).toEqual(["default", "default", "OwnedA", "default", "default"]);
    expect(target.GetTextFormatColl()).toBe(a);
    expect(shell.GetCursor().HasMark()).toBe(false);
    expect(shell.SetParagraphStyle("OwnedA")).toBe(false);
    expect(owner.GetUndoManager().GetUndoActionCount()).toBe(1);
    expect(shell.Undo()).toBe(true);
    expect(target.GetParagraphStyle()).toBe("default");
    expect(shell.Undo()).toBe(false);
  });

  it("includes table-cell text and skips table/start/end nodes within the native index span", /** Checks actual complete SwNodes traversal rather than filtered body paragraphs. @returns Nothing. */ () => {
    const { doc, shell, nodes, a } = fixture();
    const table = doc.GetNodes().MakeTableNode("RangeTable"),
      row = doc.GetNodes().AppendTableRow(table, 2);
    const cells = row
      .GetTabBoxes()
      .map(
        /** Resolves actual empty cell text. @param box - Native box. @returns Cell paragraph. */ (
          box,
        ) => required(box.GetParagraphs()[0]),
      );
    const tail = doc.GetNodes().MakeTextNode("AfterTable");
    const start = required(nodes[3]);
    shell.SetPaM(new SwPosition(start, 3), new SwPosition(tail, 0));
    expect(getTextFormatCollNodes(doc, shell.GetCursor())).toEqual([
      start,
      required(nodes[4]),
      ...cells,
      tail,
    ]);
    expect(shell.SetParagraphStyle("OwnedA")).toBe(true);
    for (const node of [start, required(nodes[4]), ...cells, tail])
      expect(node.GetTextFormatColl()).toBe(a);
    expect(required(nodes[2]).GetParagraphStyle()).toBe("default");
    expect(shell.Undo()).toBe(true);
    for (const node of [start, required(nodes[4]), ...cells, tail])
      expect(node.GetParagraphStyle()).toBe("default");
    expect(shell.Redo()).toBe(true);
    for (const node of cells) expect(node.GetTextFormatColl()).toBe(a);
  });

  it("restores per-paragraph direct list items and suppression exactly through repeated range UndoRedo", /** Checks independent direct list histories under one action. @returns Nothing. */ () => {
    const { doc, shell, owner, nodes, a, b } = fixture();
    const first = required(nodes[1]),
      last = required(nodes[3]);
    const listStyle = doc.MakeTextFormatColl(
      "Range list",
      doc.GetDfltTextFormatColl(),
      "RangeList",
    );
    doc.EnsureNumRule("RangeRule", "numbered");
    listStyle.SetFormatAttr(new SwNumRuleItem("RangeRule"));
    first.ChgFormatColl(listStyle);
    first.SetAttr(new SfxUInt16Item(RES_PARATR_LIST_LEVEL, 3));
    last.ChgFormatColl(b);
    last.SetEmptyListStyleDueToSetOutlineLevelAttr();
    const firstItems = first.CaptureListItems(),
      lastItems = last.CaptureListItems();
    const firstSuppressed = first.IsEmptyListStyleDueToSetOutlineLevelAttr(),
      lastSuppressed = last.IsEmptyListStyleDueToSetOutlineLevelAttr();
    shell.SetPaM(new SwPosition(first, 1), new SwPosition(last, 0));
    expect(shell.SetParagraphStyle("OwnedA")).toBe(true);
    const action = owner.GetUndoManager().GetUndoAction();
    expect(action).toBeInstanceOf(SwUndoFormatColl);
    expect(action?.GetPayloadSize()).toBe(9 + firstItems.Count() + lastItems.Count());
    for (let iteration = 0; iteration < 3; iteration += 1) {
      shell.Undo();
      expect(first.GetTextFormatColl()).toBe(listStyle);
      expect(last.GetTextFormatColl()).toBe(b);
      expect(first.CaptureListItems().entries()).toEqual(firstItems.entries());
      expect(last.CaptureListItems().entries()).toEqual(lastItems.entries());
      expect(first.IsEmptyListStyleDueToSetOutlineLevelAttr()).toBe(firstSuppressed);
      expect(last.IsEmptyListStyleDueToSetOutlineLevelAttr()).toBe(lastSuppressed);
      shell.Redo();
      expect(first.GetTextFormatColl()).toBe(a);
      expect(last.GetTextFormatColl()).toBe(a);
    }
    expect(listStyle.GetAttrSet().GetItemIfSet(RES_PARATR_NUMRULE, false)).toBeDefined();
  });

  it("redos by the captured native display name and safely ignores a name that has disappeared", /** Checks actual native DoSetFormatColl lookup and replacement owner identity. @returns Nothing. */ () => {
    const { doc, shell, nodes, a } = fixture();
    const first = required(nodes[1]),
      last = required(nodes[3]);
    shell.SetPaM(new SwPosition(first, 0), new SwPosition(last, 0));
    shell.SetParagraphStyle("OwnedA");
    a.SetFormatName("Renamed after application");
    shell.Undo();
    shell.Redo();
    expect([first.GetParagraphStyle(), last.GetParagraphStyle()]).toEqual(["default", "default"]);
    shell.Undo();
    const replacement = doc.MakeTextFormatColl(
      "Owned range A",
      doc.GetDfltTextFormatColl(),
      "ReplacementA",
    );
    shell.Redo();
    expect([first.GetTextFormatColl(), last.GetTextFormatColl()]).toEqual([
      replacement,
      replacement,
    ]);
    expect(a.GetName()).toBe("Renamed after application");
  });

  it("rejects foreign point/mark graphs and collections before mutation", /** Checks real native position guards through the core action boundary. @returns Nothing. */ () => {
    const { doc, shell, nodes, a } = fixture(),
      foreign = new SwDoc();
    const other = required(foreign.paragraphs[0]),
      local = required(nodes[1]);
    const range = new SwPaM(new SwPosition(other, 0));
    expect(
      /** Executes a foreign range. @returns Invalid action. */ () =>
        createTextFormatCollAction(doc, range, a, shell.CaptureCursorState()),
    ).toThrow("another node graph");
    range.Assign(new SwPosition(local, 0), new SwPosition(local, 1));
    range.GetMark().nNode.Assign(other);
    expect(
      /** Executes a foreign native mark. @returns Invalid action. */ () =>
        createTextFormatCollAction(doc, range, a, shell.CaptureCursorState()),
    ).toThrow("another node graph");
    range.Assign(new SwPosition(local, 0));
    expect(
      /** Supplies a foreign collection. @returns Invalid action. */ () =>
        createTextFormatCollAction(
          doc,
          range,
          foreign.GetDfltTextFormatColl(),
          shell.CaptureCursorState(),
        ),
    ).toThrow("another document");
    expect(
      nodes.every(
        /** Reads untouched model state. @param node - Paragraph. @returns Whether default. */ (
          node,
        ) => node.GetParagraphStyle() === "default",
      ),
    ).toBe(true);
    range.Dispose();
    foreign.Dispose();
  });

  it.each(["point", "mark"] as const)(
    "rejects a detached %s even though its source node array is the active one",
    /** Checks actual detached node registration independently of text-range widths. @param endpoint - Detached endpoint. @returns Nothing. */ (
      endpoint,
    ) => {
      const { doc, shell, nodes, a } = fixture(),
        local = required(nodes[1]);
      const detached = new SwTextNode(
        doc.GetNodes(),
        local.StartOfSectionNode(),
        doc.GetDfltTextFormatColl(),
        "Detached",
      );
      const range = new SwPaM(new SwPosition(local, 0), new SwPosition(local, 1));
      (endpoint === "point" ? range.GetPoint() : range.GetMark()).nNode.Assign(detached);
      expect(
        /** Applies an unregistered endpoint. @returns Invalid action. */ () =>
          createTextFormatCollAction(doc, range, a, shell.CaptureCursorState()),
      ).toThrow("detached");
      expect(shell.GetDocShell().GetUndoManager().GetUndoActionCount()).toBe(0);
      range.Dispose();
    },
  );

  it("retains document-shell StyleApply slot5552 and Para2 result across real range dispatch and graph replacement", /** Checks actual owner/frame behavior and session isolation. @returns Nothing. */ () => {
    const first = fixture(),
      other = fixture();
    first.shell.SetPaM(
      new SwPosition(required(first.nodes[1]), 1),
      new SwPosition(required(first.nodes[3]), 0),
    );
    const request = new SfxRequest(
      5552,
      createRequestArguments(5552, { Template: "Owned range A", Family: 2 }),
    );
    first.frame.GetDispatcher().ExecuteRequest(request);
    expect(request.IsDone()).toBe(true);
    expect(request.GetReturnValue()).toBeInstanceOf(SfxUInt16Item);
    expect((request.GetReturnValue() as SfxUInt16Item).GetValue()).toBe(2);
    expect(
      first.nodes
        .slice(1, 4)
        .map(
          /** Reads dispatched collection IDs. @param node - Paragraph. @returns Style. */ (node) =>
            node.GetParagraphStyle(),
        ),
    ).toEqual(["OwnedA", "OwnedA", "OwnedA"]);
    expect(
      other.nodes.every(
        /** Reads isolated collection IDs. @param node - Paragraph. @returns Whether untouched. */ (
          node,
        ) => node.GetParagraphStyle() === "default",
      ),
    ).toBe(true);
    first.owner.InitNew(createDocument({ id: "range-new", suiteId: "writer", title: "New" }));
    expect(first.owner.GetUndoManager().GetUndoActionCount()).toBe(0);
    first.frame.GetDispatcher().Execute(".uno:StyleApply", { Template: "Heading 1", Family: 2 });
    expect(first.shell.GetActiveParagraph().GetParagraphStyle()).toBe("heading-1");
  });
});
