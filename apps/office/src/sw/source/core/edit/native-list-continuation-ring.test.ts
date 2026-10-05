/** @fileoverview Verifies source-owned continuation over actual table rings and boolean restart history without upstream access. */
import { afterEach, expect, it } from "vitest";
import { SwDoc } from "../doc/doc";
import { SwContentIndex } from "../bastyp/index";
import { SwEditShell } from "./ednumber";
import { SwPaM, SwPosition } from "../crsr/pam";
import { SwTableCursor } from "../crsr/swcrsr";
import { SwTextNode } from "../txtnode/ndtxt";
import { SwNumRuleType } from "../doc/number";
import { applyWriterParagraphList } from "../doc/list";
import { SwWrtShell } from "../../uibase/wrtsh/wrtsh1";
import { SwDocShell } from "../../uibase/app/docsh";
import { SwEditWin } from "../../uibase/docvw/edtwin";
import { createDocument } from "../../../../sfx2/source/doc/objsh";
import { SfxListUndoAction } from "../../../../svl/source/undo/undo";
import { SwUndoNumRuleStart } from "../undo/unnum";
import { SfxRequest } from "../../../../sfx2/source/control/request";
import { WRITER_COMMAND_IDS } from "../../../uiconfig/swriter/menubar/menubar-commands";
import { RES_MARGIN_FIRSTLINE, RES_MARGIN_TEXTLEFT, RES_MARGIN_RIGHT } from "../../../inc/hintids";
const shells: SwWrtShell[] = [];
afterEach(
  /** Closes all native owners. @returns Nothing. */ () => {
    for (const shell of shells.splice(0)) shell.Close();
  },
);
/** Requires an actual native owner. @param value - Optional owner. @returns Owner. */
function required<T>(value: T | undefined): T {
  if (value === undefined) throw new Error("Missing ring numbering owner");
  return value;
}
/** Builds actual body slots and a three-row native table with multi-paragraph cells. @returns Owners. */
function fixture() {
  const doc = new SwDoc(),
    body = required(doc.paragraphs[0]),
    secondBody = doc.nodes.MakeTextNode("Middle"),
    lastBody = doc.nodes.MakeTextNode("Last");
  body.SetText("Body");
  const table = doc.nodes.MakeTableNode("RingLists", {}, lastBody);
  for (let column = 0; column < 3; column++) table.AddColumnWidth(2000);
  for (let row = 0; row < 3; row++) doc.nodes.AppendTableRow(table, 3);
  const boxes = table
      .GetTabLines()
      .flatMap(
        /** Collects actual boxes. @param row - Native row. @returns Boxes. */ (row) =>
          row.GetTabBoxes(),
      ),
    nodes = boxes.map(
      /** Reads actual cell owner. @param box - Box. @param index - Position. @returns Text node. */ (
        box,
        index,
      ) => {
        const node = required(box.GetParagraphs()[0]);
        node.SetText("Cell" + index);
        return node;
      },
    );
  const tail = doc.nodes.AppendTableCellParagraph(required(boxes[4]));
  tail.SetText("Tail");
  const empty = doc.nodes.AppendTableCellParagraph(required(boxes[7])),
    outside = doc.nodes.MakeTextNode("Outside"),
    docShell = new SwDocShell(
      doc,
      createDocument({ id: "ring-list", suiteId: "writer", title: "Ring lists" }),
    ),
    shell = new SwWrtShell(docShell),
    edit = new SwEditWin(shell);
  shells.push(shell);
  return {
    doc,
    body,
    secondBody,
    lastBody,
    table,
    boxes,
    nodes,
    tail,
    empty,
    outside,
    docShell,
    shell,
    edit,
  };
}
/** Selects real row or middle column and materializes native editing rings. @param owner - Owners. @param kind - Selection shape. @returns Selected native nodes. */
function selected(owner: ReturnType<typeof fixture>, kind: "row" | "column"): SwTextNode[] {
  owner.edit.SelectTableRow(required(owner.nodes[4]).GetIndex());
  if (kind === "column") {
    const display = owner.shell.getShellCursor() as SwTableCursor;
    display.GetPoint().Assign(required(owner.nodes[1]), 0);
    display.GetMark().Assign(owner.empty, 0);
    owner.shell.NotifySelectionChanged();
  }
  const nodes: SwTextNode[] = [];
  for (const range of owner.shell.GetCursor().GetRingContainer())
    for (let index = range.Start().GetNodeIndex(); index <= range.End().GetNodeIndex(); index++) {
      const node = owner.doc.nodes.at(index);
      if (node instanceof SwTextNode) nodes.push(node);
    }
  return nodes;
}
/** Captures direct indentation. @param node - Actual node. @returns Independent item values. */
function indents(node: SwTextNode) {
  return [RES_MARGIN_FIRSTLINE, RES_MARGIN_TEXTLEFT, RES_MARGIN_RIGHT].map(
    /** Reads one direct item. @param which - Native identity. @returns Optional item. */ (which) =>
      node.GetpSwAttrSet()?.GetItemIfSet(which, false),
  );
}
/** Replaces an actual section-preserving native slot. @param old - Old node. @returns Current node. */
function replace(old: SwTextNode): SwTextNode {
  const node = new SwTextNode(
      old.GetNodes(),
      old.StartOfSectionNode(),
      old.GetTextFormatColl(),
      old.GetText(),
    ),
    attrs = old.GetpSwAttrSet(),
    hints = old.GetpSwpHints();
  if (attrs !== undefined) node.SetAttr(attrs);
  if (hints !== undefined) node.SetTextHints(hints.clone());
  old.GetNodes().replaceTextNode(old, node);
  expect(old.GetNodes().indexOfOrUndefined(old)).toBeUndefined();
  return node;
}
/** Creates one extra actual ring range without a projection. @param shell - Native editing shell. @param first - First node. @param last - Optional end node. @returns Owned extra range. */
function extra(shell: SwWrtShell, first: SwTextNode, last = first): SwPaM {
  const point = new SwPosition(last, last.Len()),
    mark = new SwPosition(first, 0);
  try {
    return new SwPaM(point, mark, shell.GetCursor());
  } finally {
    point.Dispose();
    mark.Dispose();
  }
}
const cases = (["row", "column"] as const).flatMap(
  /** Combines actual table selections. @param shape - Selection shape. @returns Cases. */ (
    shape,
  ) =>
    (["numbered", "bullet"] as const).flatMap(
      /** Combines native preceding families. @param kind - List family. @returns Cases. */ (
        kind,
      ) =>
        (["same", "different", "plain"] as const).map(
          /** Combines selected rules. @param initial - Rule relation. @returns Case. */ (
            initial,
          ) => [shape, kind, initial] as const,
        ),
    ),
);
it.each(cases)(
  "native continuation owns every table ring %s/%s/%s",
  /** Checks actual command dispatch, restart deltas, list identity and grouped replacement history. @param shape - Selection. @param kind - Preceding family. @param initial - Rule relation. @returns Nothing. */ (
    shape,
    kind,
    initial,
  ) => {
    const owner = fixture(),
      previous = required(owner.nodes[shape === "row" ? 2 : 0]);
    applyWriterParagraphList(previous, { kind, styleId: "Prior", listId: "prior" });
    let targets = selected(owner, shape);
    for (const node of targets) {
      if (initial !== "plain")
        applyWriterParagraphList(node, {
          kind,
          styleId: initial === "same" ? "Prior" : "Other",
          listId: "selected",
          level: 2,
          restart: true,
          startValue: 7,
        });
      node.SetCountedInList(false);
      node.SetParagraphTextLeftMargin(600);
      node.SetParagraphFirstLineIndent(-120);
      node.SetParagraphRightMargin(80);
    }
    const before = targets.map(
        /** Captures actual list values. @param node - Native node. @returns Independent items. */ (
          node,
        ) => node.CaptureListItems(),
      ),
      indentBefore = targets.map(indents),
      neighbors = owner.nodes.filter(
        /** Excludes selected actual boxes. @param node - Native node. @returns Whether outside. */ (
          node,
        ) => !targets.includes(node),
      ),
      neighborBefore = neighbors.map(
        /** Captures unaffected values. @param node - Neighbor. @returns Items. */ (node) =>
          node.CaptureListItems(),
      ),
      count = owner.docShell.GetUndoManager().GetUndoActionCount(),
      cursor = owner.shell.CaptureCursorState(),
      pointIndex = cursor.point.node.GetIndex(),
      listId = { value: "" };
    expect(owner.shell).toBeInstanceOf(SwEditShell);
    expect([...owner.shell.GetCursor().GetRingContainer()]).toHaveLength(3);
    expect(owner.shell.SearchNumRule(kind === "numbered", listId)).toBe(previous.GetNumRule());
    expect(listId.value).toBe("prior");
    expect(owner.shell.GetTextShell().CanContinueNumbering()).toBe(true);
    const slot = required(
        owner.shell.GetCommandShell().GetInterface().GetSlot(WRITER_COMMAND_IDS.continueNumbering),
      ),
      command = required(owner.shell.GetCommandShell().ResolveSlot(slot.slotId));
    expect(command.execute(new SfxRequest(slot.slotId))).toMatchObject({
      status: "executed",
      value: true,
    });
    expect(owner.docShell.GetUndoManager().GetUndoActionCount()).toBe(count + 1);
    const history = required(owner.docShell.GetUndoManager().GetUndoAction());
    expect(history).toBeInstanceOf(SfxListUndoAction);
    expect(history.GetPayloadSize()).toBe(targets.length * (initial === "different" ? 8 : 6));
    for (let index = 0; index < targets.length; index++) {
      const node = required(targets[index]);
      expect(node.GetNumRule()).toBe(previous.GetNumRule());
      expect(node.GetListId()).toBe("prior");
      expect(node.IsCountedInList()).toBe(true);
      expect(node.IsListRestart()).toBe(initial === "same");
      expect(node.HasAttrListRestartValue()).toBe(initial !== "plain");
      if (initial !== "plain") expect(node.GetAttrListRestartValue()).toBe(7);
      expect(indents(node)).toEqual(indentBefore[index]);
    }
    const after = targets.map(
      /** Captures actual final values. @param node - Native node. @returns Independent items. */ (
        node,
      ) => node.CaptureListItems(),
    );
    for (let cycle = 0; cycle < 3; cycle++) {
      targets = targets.map(replace);
      expect(owner.shell.Undo()).toBe(true);
      for (let index = 0; index < targets.length; index++) {
        expect(
          required(targets[index]).CaptureListItems().Equals(required(before[index]), true),
        ).toBe(true);
        expect(indents(required(targets[index]))).toEqual(indentBefore[index]);
      }
      expect(owner.shell.CaptureCursorState().tableSelection).toBe(true);
      expect([...owner.shell.GetCursor().GetRingContainer()]).toHaveLength(3);
      expect(owner.shell.getShellCursor().GetPoint().GetNodeIndex()).toBe(pointIndex);
      targets = targets.map(replace);
      expect(owner.shell.Redo()).toBe(true);
      for (let index = 0; index < targets.length; index++)
        expect(
          required(targets[index]).CaptureListItems().Equals(required(after[index]), true),
        ).toBe(true);
      expect(owner.shell.CaptureCursorState().tableSelection).toBe(true);
      expect([...owner.shell.GetCursor().GetRingContainer()]).toHaveLength(3);
      for (let index = 0; index < neighbors.length; index++)
        expect(
          required(neighbors[index])
            .CaptureListItems()
            .Equals(required(neighborBefore[index]), true),
        ).toBe(true);
    }
    expect(owner.shell.ContinueNumbering()).toBe(false);
    expect(owner.docShell.GetUndoManager().GetUndoActionCount()).toBe(count + 1);
  },
);
it("native continuation traverses sparse body rings without changing intervening sections", /** Checks inherited core execution over actual independent ranges. @returns Nothing. */ () => {
  const owner = fixture();
  applyWriterParagraphList(owner.body, {
    kind: "numbered",
    styleId: "SparsePrior",
    listId: "sparse",
  });
  for (const node of [owner.secondBody, owner.lastBody])
    applyWriterParagraphList(node, {
      kind: "bullet",
      styleId: "SparseOther",
      restart: true,
      startValue: 9,
    });
  owner.shell.FocusNode(owner.secondBody);
  const ring = extra(owner.shell, owner.lastBody);
  try {
    expect(owner.shell.ContinueNumbering()).toBe(true);
    for (const node of [owner.secondBody, owner.lastBody]) {
      expect(node.GetListId()).toBe("sparse");
      expect(node.IsListRestart()).toBe(false);
      expect(node.GetAttrListRestartValue()).toBe(9);
    }
    expect(owner.docShell.GetUndoManager().GetUndoAction()?.GetPayloadSize()).toBe(16);
    expect(owner.shell.Undo()).toBe(true);
    for (const node of [owner.secondBody, owner.lastBody]) {
      expect(node.GetListKind()).toBe("bullet");
      expect(node.IsListRestart()).toBe(true);
    }
    expect(owner.shell.Redo()).toBe(true);
    for (const node of owner.nodes) expect(node.GetListKind()).toBe("none");
    expect(owner.outside.GetListKind()).toBe("none");
  } finally {
    ring.Dispose();
  }
});
it.each([false, true])(
  "native restart flag primitive and numeric history preserve unrelated values flag=%s",
  /** Checks flag-only operation and current-slot replacement. @param flag - Requested flag. @returns Nothing. */ (
    flag,
  ) => {
    const owner = fixture(),
      node = required(owner.nodes[4]);
    applyWriterParagraphList(node, {
      kind: "numbered",
      styleId: "Flag",
      listId: "flag",
      level: 3,
      restart: !flag,
      startValue: 11,
    });
    node.SetCountedInList(false);
    owner.shell.FocusNode(node);
    const position = new SwPosition(node, 1),
      range = new SwPaM(position);
    try {
      expect(owner.shell.IsNumRuleStart()).toBe(!flag);
      expect(owner.shell.IsNumRuleStart(range)).toBe(!flag);
      expect(owner.shell.SetNumRuleStart(flag, range)).toBe(true);
      const history = owner.docShell.GetUndoManager().GetUndoAction();
      expect(history).toBeInstanceOf(SwUndoNumRuleStart);
      expect(history?.GetPayloadSize()).toBe(2);
      let current = replace(node);
      for (let cycle = 0; cycle < 3; cycle++) {
        expect(current.IsListRestart()).toBe(flag);
        expect(current.GetAttrListRestartValue()).toBe(11);
        expect(current.GetActualListLevel()).toBe(3);
        expect(current.GetListId()).toBe("flag");
        expect(current.IsCountedInList()).toBe(false);
        expect(owner.shell.Undo()).toBe(true);
        expect(current.IsListRestart()).toBe(!flag);
        current = replace(current);
        expect(owner.shell.Redo()).toBe(true);
      }
      expect(owner.shell.SetNumRuleStart(flag)).toBe(false);
      expect(owner.doc.SetNumRuleStart(owner.shell.GetCursor().GetPoint(), flag)).toBe(false);
    } finally {
      range.Dispose();
      position.Dispose();
    }
  },
);
it.each(["row", "column"] as const)(
  "native restart flags use normalized ring end points %s",
  /** Checks native SetNumRuleStart multi-range endpoint semantics. @param shape - Selection. @returns Nothing. */ (
    shape,
  ) => {
    const owner = fixture(),
      targets = selected(owner, shape);
    for (const node of targets)
      applyWriterParagraphList(node, {
        kind: "numbered",
        styleId: "Ends",
        restart: true,
        startValue: 13,
      });
    expect(owner.shell.SetNumRuleStart(false)).toBe(true);
    const ends = [...owner.shell.GetCursor().GetRingContainer()].map(
      /** Reads each native range endpoint. @param range - Native ring. @returns Text node. */ (
        range,
      ) => range.End().GetNode(),
    );
    for (const node of targets) {
      expect(node.IsListRestart()).toBe(!ends.includes(node));
      expect(node.GetAttrListRestartValue()).toBe(13);
    }
    expect(owner.shell.Undo()).toBe(true);
    for (const node of targets) expect(node.IsListRestart()).toBe(true);
    expect(owner.shell.Redo()).toBe(true);
    expect(owner.shell.SetNumRuleStart(false)).toBe(false);
  },
);
it("native restart guards ignore structural and plain positions and reject foreign ownership", /** Checks native flag guards without constructing unsupported history. @returns Nothing. */ () => {
  const owner = fixture(),
    position = new SwPosition(owner.body),
    range = new SwPaM(position),
    other = fixture();
  try {
    expect(owner.doc.SetNumRuleStart(position, true)).toBe(false);
    expect(owner.shell.SetNumRuleStart(true, range)).toBe(false);
    range.GetPoint().nNode.Assign(owner.table.GetTableNode());
    expect(owner.shell.IsNumRuleStart(range)).toBe(false);
    expect(owner.doc.SetNumRuleStart(range.GetPoint(), true)).toBe(false);
    expect(owner.shell.SetNumRuleStart(true, range)).toBe(false);
    expect(
      /** Rejects a native foreign position. @returns Nothing. */ () =>
        other.doc.SetNumRuleStart(position, true),
    ).toThrow(/another node array/);
    owner.shell.GetCursor().GetPoint().nNode.Assign(owner.table.GetTableNode());
    expect(owner.shell.GetTextShell().CanContinueNumbering()).toBe(false);
    expect(owner.shell.ContinueNumbering()).toBe(false);
  } finally {
    range.Dispose();
    position.Dispose();
  }
});
it("native continuation stops at an outline list rather than skipping to an older ordinary list", /** Checks source search classification and no history on unavailable continuation. @returns Nothing. */ () => {
  const owner = fixture();
  applyWriterParagraphList(owner.body, { kind: "numbered", styleId: "Earlier", listId: "earlier" });
  applyWriterParagraphList(owner.secondBody, { kind: "numbered", styleId: "OutlineStop" });
  required(owner.secondBody.GetNumRule()).SetRuleType(SwNumRuleType.OUTLINE_RULE);
  owner.shell.FocusNode(owner.lastBody);
  expect(owner.shell.GetTextShell().CanContinueNumbering()).toBe(false);
  expect(owner.shell.ContinueNumbering()).toBe(false);
  expect(owner.lastBody.GetListKind()).toBe("none");
  expect(owner.docShell.GetUndoManager().GetUndoActionCount()).toBe(0);
});
it("native continuation notices a changed later table ring when the first box is already in the prior list", /** Checks all-ring no-op eligibility independently of the first range. @returns Nothing. */ () => {
  const owner = fixture(),
    previous = required(owner.nodes[2]);
  applyWriterParagraphList(previous, { kind: "numbered", styleId: "Later", listId: "later" });
  const targets = selected(owner, "row");
  for (const node of targets)
    applyWriterParagraphList(node, { kind: "numbered", styleId: "Later", listId: "later" });
  required(targets.at(-1)).SetCountedInList(false);
  expect(owner.shell.ContinueNumbering()).toBe(true);
  for (const node of targets) expect(node.IsCountedInList()).toBe(true);
  expect(owner.shell.Undo()).toBe(true);
  expect(required(targets.at(-1)).IsCountedInList()).toBe(false);
  expect(required(targets[0]).IsCountedInList()).toBe(true);
});

it("native normalized restart flags skip plain table endpoints and retain eligible history", /** Checks mixed native ring eligibility without altering plain boxes. @returns Nothing. */ () => {
  const owner = fixture(),
    targets = selected(owner, "row"),
    last = required(owner.nodes[5]);
  applyWriterParagraphList(last, {
    kind: "numbered",
    styleId: "Eligible",
    restart: false,
    startValue: 17,
  });
  expect(owner.shell.SetNumRuleStart(true)).toBe(true);
  expect(last.IsListRestart()).toBe(true);
  for (const node of targets) if (node !== last) expect(node.GetListKind()).toBe("none");
  expect(owner.docShell.GetUndoManager().GetUndoAction()?.GetPayloadSize()).toBe(2);
  expect(owner.shell.Undo()).toBe(true);
  expect(last.IsListRestart()).toBe(false);
  expect(last.GetAttrListRestartValue()).toBe(17);
  expect(owner.shell.Redo()).toBe(true);
  expect(owner.shell.SetNumRuleStart(true)).toBe(false);
});
it("native normalized restart flags reject structural ring end points without publishing history", /** Checks actual structural and plain multi-selection guards. @returns Nothing. */ () => {
  const owner = fixture(),
    ring = extra(owner.shell, owner.lastBody);
  try {
    ring.GetPoint().nNode.Assign(owner.table.GetTableNode());
    ring.GetMark().nNode.Assign(owner.table.GetTableNode());
    expect([...owner.shell.GetCursor().GetRingContainer()]).toHaveLength(2);
    expect(owner.shell.SetNumRuleStart(true)).toBe(false);
    expect(owner.docShell.GetUndoManager().GetUndoActionCount()).toBe(0);
  } finally {
    ring.Dispose();
  }
});

it("native generic positions and clones keep structural node identity without a content registry", /** Checks current structural Assign, clone and mark contracts. @returns Nothing. */ () => {
  const owner = fixture(),
    table = owner.table.GetTableNode(),
    position = new SwPosition(table),
    copy = position.clone(),
    range = new SwPaM(position);
  try {
    expect(position.GetNode()).toBe(table);
    expect(copy.GetNode()).toBe(table);
    expect(copy.GetContentIndex()).toBe(0);
    position.SetContent(0);
    range.SetMark();
    expect(range.GetMark().GetNode()).toBe(table);
    expect(range.GetMark().GetContentIndex()).toBe(0);
    position.Assign(owner.body, 1);
    expect(position.nContent.GetContentNode()).toBe(owner.body);
    position.SetContent(2);
    const bodyCopy = position.clone();
    try {
      expect(bodyCopy.GetNode()).toBe(owner.body);
      expect(bodyCopy.GetContentIndex()).toBe(2);
    } finally {
      bodyCopy.Dispose();
    }
    position.Assign(table);
    expect(position.GetNode()).toBe(table);
    expect(position.GetContentIndex()).toBe(0);
    expect(
      /** Rejects a detached structural content registry. @returns Nothing. */ () =>
        position.nContent.GetContentNode(),
    ).toThrow(/disposed/);
    expect(
      /** Rejects structural nonzero content. @returns Nothing. */ () => position.SetContent(1),
    ).toThrow(/outside/);
    expect(
      /** Rejects structural assignment with a content offset. @returns Nothing. */ () =>
        position.Assign(table, 1),
    ).toThrow(/outside/);
    expect(
      /** Rejects invalid generic construction. @returns Nothing. */ () => new SwPosition(table, 1),
    ).toThrow(/outside/);
    expect(
      /** Rejects negative generic construction. @returns Nothing. */ () =>
        new SwPosition(table, -1),
    ).toThrow(/outside/);
    expect(
      /** Rejects nonintegral generic content. @returns Nothing. */ () => position.SetContent(0.5),
    ).toThrow(/outside/);
    position.Assign(owner.body, 0);
    expect(position.GetNode()).toBe(owner.body);
    expect(position.nContent.GetContentNode()).toBe(owner.body);
  } finally {
    range.Dispose();
    copy.Dispose();
    position.Dispose();
  }
});
it("native nullable content index detaches and re-registers its native callback owner", /** Checks nullable registration, transfer and unchanged bounded validation. @returns Nothing. */ () => {
  const owner = fixture(),
    changes: SwTextNode[] = [],
    index = new SwContentIndex(
      undefined,
      0,
      "mark",
      "before",
      /** Records actual content registry transfers. @param node - New content owner. @returns Nothing. */ (
        node,
      ) => {
        changes.push(node as SwTextNode);
      },
    );
  try {
    expect(index.GetIndex()).toBe(0);
    index.Assign(owner.body, 1);
    expect(index.GetContentNode()).toBe(owner.body);
    expect(changes).toEqual([owner.body]);
    index.Assign(undefined, 0);
    expect(index.GetIndex()).toBe(0);
    expect(
      /** Rejects absent native registry ownership. @returns Nothing. */ () =>
        index.GetContentNode(),
    ).toThrow(/disposed/);
    index.Assign(owner.secondBody, 1);
    expect(changes).toEqual([owner.body, owner.secondBody]);
    index.Assign(owner.secondBody, 2);
    expect(changes).toHaveLength(2);
    expect(
      /** Rejects invalid detached offset. @returns Nothing. */ () => index.Assign(undefined, 1),
    ).toThrow(/outside/);
    expect(
      /** Rejects a negative native content index. @returns Nothing. */ () =>
        index.Assign(owner.body, -1),
    ).toThrow(/outside/);
    expect(
      /** Rejects a nonintegral native content index. @returns Nothing. */ () =>
        index.Assign(owner.body, 0.5),
    ).toThrow(/outside/);
    const bare = new SwContentIndex(undefined);
    try {
      bare.Assign(owner.body, 0);
      bare.Assign(undefined, 0);
      expect(bare.GetIndex()).toBe(0);
    } finally {
      bare.Dispose();
    }
  } finally {
    index.Dispose();
  }
});
it("native grouped restart initialization retains the displayed cursor and all live table rings", /** Checks actual initial grouped command execution rather than only history replay. @returns Nothing. */ () => {
  const owner = fixture(),
    targets = selected(owner, "row");
  for (const node of targets)
    applyWriterParagraphList(node, {
      kind: "numbered",
      styleId: "Initial",
      restart: false,
      startValue: 19,
    });
  const display = owner.shell.getShellCursor(),
    point = display.GetPoint().GetNodeIndex(),
    mark = display.GetMark().GetNodeIndex();
  expect(owner.shell.SetNumRuleStart(true)).toBe(true);
  expect(owner.shell.getShellCursor()).toBe(display);
  expect([...owner.shell.GetCursor().GetRingContainer()]).toHaveLength(3);
  expect(owner.shell.getShellCursor().GetPoint().GetNodeIndex()).toBe(point);
  expect(owner.shell.getShellCursor().GetMark().GetNodeIndex()).toBe(mark);
  for (const range of owner.shell.GetCursor().GetRingContainer()) {
    const node = range.End().GetNode() as SwTextNode;
    expect(node.IsListRestart()).toBe(true);
    expect(node.GetAttrListRestartValue()).toBe(19);
  }
  expect(owner.shell.Undo()).toBe(true);
  for (const node of targets) expect(node.IsListRestart()).toBe(false);
  expect(owner.shell.Redo()).toBe(true);
});
