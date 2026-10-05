/** @fileoverview Verifies native ring numbering ownership, table selections and exact SwPamRanges without upstream access. */
import { afterEach, expect, it } from "vitest";
import { SwDoc } from "../doc/doc";
import { SwEditShell, SwPamRanges } from "./ednumber";
import { SwPaM, SwPosition } from "../crsr/pam";
import { SwTableCursor } from "../crsr/swcrsr";
import { SwTextNode } from "../txtnode/ndtxt";
import { SwNumRule, SwNumRuleType } from "../doc/number";
import { applyWriterParagraphList } from "../doc/list";
import { SwNumRuleItem } from "../para/paratr";
import { SwWrtShell } from "../../uibase/wrtsh/wrtsh1";
import { SwDocShell } from "../../uibase/app/docsh";
import { SwEditWin } from "../../uibase/docvw/edtwin";
import { createDocument } from "../../../../sfx2/source/doc/objsh";
import { SfxListUndoAction } from "../../../../svl/source/undo/undo";
import { SwUndoNumUpDown, SwUndoDelNum } from "../undo/unnum";
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
/** Applies a native marker family independently of UI commands. @param node - Actual node. @param kind - Family. @returns Nothing. */
function list(node: SwTextNode, kind: "numbered" | "bullet" | "none"): void {
  if (kind !== "none")
    applyWriterParagraphList(node, { kind, styleId: kind + "Rule", listId: kind + "ID" });
}
const commandCases = (["row", "column"] as const).flatMap(
  /** Combines table shapes. @param shape - Shape. @returns Cases. */ (shape) =>
    (["numbered", "bullet"] as const).map(
      /** Combines marker families. @param kind - Family. @returns Case. */ (kind) =>
        [shape, kind] as const,
    ),
);
it.each(commandCases)(
  "native table ring list commands own every selected cell %s/%s",
  /** Checks real table cursor,shared identity,current slots and atomic history. @param shape - Shape. @param kind - Family. @returns Nothing. */ (
    shape,
    kind,
  ) => {
    const owner = fixture(),
      targets = selected(owner, shape),
      neighbors = owner.nodes.filter(
        /** Excludes only actual selection. @param node - Native node. @returns Whether untouched. */ (
          node,
        ) => !targets.includes(node),
      ),
      count = owner.docShell.GetUndoManager().GetUndoActionCount();
    expect(owner.shell).toBeInstanceOf(SwEditShell);
    expect([...owner.shell.GetCursor().GetRingContainer()]).toHaveLength(3);
    for (const node of targets) {
      node.SetAttrListLevel(2);
      node.SetCountedInList(false);
      node.SetParagraphTextLeftMargin(400);
      node.SetParagraphFirstLineIndent(-120);
      node.SetParagraphRightMargin(80);
    }
    const before = targets.map(
      /** Captures independent original items. @param node - Node. @returns Original values. */ (
        node,
      ) => ({ list: node.CaptureListItems(), indent: indents(node) }),
    );
    expect(owner.shell.SetParagraphListKind(kind)).toBe(true);
    const rule = targets[0]?.GetNumRule(),
      id = targets[0]?.GetListId();
    expect(rule).toBeDefined();
    expect(id?.length).toBeGreaterThan(0);
    expect(owner.docShell.GetUndoManager().GetUndoActionCount()).toBe(count + 1);
    const action = owner.docShell.GetUndoManager().GetUndoAction();
    expect(action).toBeInstanceOf(SfxListUndoAction);
    expect((action as SfxListUndoAction<unknown>).GetActionCount()).toBe(targets.length);
    let current = targets.map(replace);
    for (let cycle = 0; cycle < 3; cycle++) {
      expect(owner.shell.Undo()).toBe(true);
      current.forEach(
        /** Verifies original native values. @param node - Current slot. @param index - Original position. @returns Nothing. */ (
          node,
          index,
        ) => {
          expect(node.CaptureListItems().Equals(required(before[index]).list, true)).toBe(true);
          expect(indents(node)).toEqual(required(before[index]).indent);
        },
      );
      current = current.map(replace);
      expect(owner.shell.Redo()).toBe(true);
      for (const node of current) {
        expect(node.GetNumRule()).toBe(rule);
        expect(node.GetListId()).toBe(id);
        expect(node.GetListKind()).toBe(kind);
        expect(node.IsCountedInList()).toBe(true);
        expect(indents(node)).toEqual([undefined, undefined, undefined]);
      }
      expect(owner.shell.HasBoxSelection()).toBe(true);
      expect([...owner.shell.GetCursor().GetRingContainer()]).toHaveLength(3);
      expect(owner.shell.GetListShell().GetKind()).toBe(kind);
      for (const node of neighbors) expect(node.GetListKind()).toBe("none");
      expect(owner.body.GetListKind()).toBe("none");
      expect(owner.outside.GetListKind()).toBe("none");
    }
    expect(owner.shell.SetParagraphListKind("none")).toBe(true);
    expect(owner.docShell.GetUndoManager().GetUndoAction()).toBeInstanceOf(SfxListUndoAction);
    for (const node of current) expect(node.GetListKind()).toBe("none");
    expect(owner.shell.Undo()).toBe(true);
    for (const node of current) expect(node.GetNumRule()).toBe(rule);
    expect(owner.shell.Redo()).toBe(true);
    for (const node of current) expect(node.GetListKind()).toBe("none");
    expect(owner.shell.DelNumRules()).toBe(false);
  },
);
const levels = (["row", "column"] as const).flatMap(
  /** Combines selections. @param shape - Native shape. @returns Cases. */ (shape) =>
    [false, true].map(
      /** Combines level directions. @param down - Direction. @returns Case. */ (down) =>
        [shape, down] as const,
    ),
);
it.each(levels)(
  "native table ring levels normalize delta ranges %s/down=%s",
  /** Checks current numeric delta actions and complete table cursor boundaries. @param shape - Shape. @param down - Direction. @returns Nothing. */ (
    shape,
    down,
  ) => {
    const owner = fixture(),
      targets = selected(owner, shape);
    for (const node of targets) {
      list(node, "numbered");
      node.SetAttrListLevel(2);
    }
    const neighbors = owner.nodes.filter(
      /** Reads untouched boxes. @param node - Node. @returns Whether outside. */ (node) =>
        !targets.includes(node),
    );
    expect(owner.shell.CanNumUpDown(down)).toBe(true);
    expect(owner.shell.NumUpDown(down)).toBe(true);
    const action = required(owner.docShell.GetUndoManager().GetUndoAction());
    expect(action).toBeInstanceOf(SfxListUndoAction);
    expect((action as SfxListUndoAction<unknown>).GetActionCount()).toBe(3);
    expect(action.GetPayloadSize()).toBe(15);
    let current = targets.map(replace);
    for (let cycle = 0; cycle < 3; cycle++) {
      expect(owner.shell.Undo()).toBe(true);
      for (const node of current) expect(node.GetAttrListLevel()).toBe(2);
      current = current.map(replace);
      expect(owner.shell.Redo()).toBe(true);
      for (const node of current) expect(node.GetAttrListLevel()).toBe(down ? 3 : 1);
      expect(owner.shell.HasBoxSelection()).toBe(true);
      expect([...owner.shell.GetCursor().GetRingContainer()]).toHaveLength(3);
    }
    for (const node of neighbors) expect(node.GetAttrListLevel()).toBe(0);
  },
);
it("native ring levels retain eligible ranges when another selected cell reaches its limit", /** Checks source per-range execution without an invented all-ring abort. @returns Nothing. */ () => {
  const owner = fixture(),
    targets = selected(owner, "row");
  for (const node of targets) {
    list(node, "numbered");
    node.SetAttrListLevel(
      node.StartOfSectionNode() === required(owner.nodes[3]).StartOfSectionNode() ? 9 : 2,
    );
  }
  expect(owner.shell.CanNumUpDown(true)).toBe(true);
  expect(owner.shell.NumUpDown(true)).toBe(true);
  expect(
    (
      owner.docShell.GetUndoManager().GetUndoAction() as SfxListUndoAction<unknown>
    ).GetActionCount(),
  ).toBe(2);
  for (const node of targets)
    expect(node.GetAttrListLevel()).toBe(
      node.StartOfSectionNode() === required(owner.nodes[3]).StartOfSectionNode() ? 9 : 3,
    );
  expect(owner.shell.Undo()).toBe(true);
  for (const node of targets) node.SetAttrListLevel(9);
  expect(owner.shell.CanNumUpDown(true)).toBe(false);
  expect(owner.shell.NumUpDown(true)).toBe(false);
});
it.each([false, true])(
  "native core SetCurNumRule shares one created list across sparse ranges reset=%s",
  /** Checks explicit new-list identity, count and independent undo values. @param reset - Indent reset. @returns Nothing. */ (
    reset,
  ) => {
    const owner = fixture();
    owner.shell.FocusNode(owner.body);
    const other = extra(owner.shell, owner.lastBody),
      rule = new SwNumRule("NewRingRule", "label-alignment");
    for (const node of [owner.body, owner.lastBody]) {
      node.SetParagraphTextLeftMargin(600);
      node.SetCountedInList(false);
    }
    expect(owner.shell.SetCurNumRule(rule, true, "", reset)).toBe(true);
    const id = owner.body.GetListId();
    expect(id.length).toBeGreaterThan(0);
    expect(owner.lastBody.GetListId()).toBe(id);
    expect(owner.body.GetNumRule()).toBe(owner.lastBody.GetNumRule());
    expect(rule.GetDefaultListId()).toBe("");
    for (const node of [owner.body, owner.lastBody]) {
      expect(node.IsCountedInList()).toBe(true);
      expect(node.GetParagraphTextLeftMargin()).toBe(reset ? 0 : 600);
    }
    expect(owner.secondBody.GetListKind()).toBe("none");
    expect(owner.shell.Undo()).toBe(true);
    for (const node of [owner.body, owner.lastBody]) {
      expect(node.GetListKind()).toBe("none");
      expect(node.GetParagraphTextLeftMargin()).toBe(600);
      expect(node.IsCountedInList()).toBe(false);
    }
    expect(owner.shell.Redo()).toBe(true);
    expect(owner.lastBody.GetListId()).toBe(id);
    other.Dispose();
  },
);
it("native core SetCurNumRule creates one fresh identity for an already stored rule", /** Checks create-new versus default list identity. @returns Nothing. */ () => {
  const owner = fixture();
  const rule = owner.doc.EnsureNumRule("ExistingRing", "numbered");
  owner.shell.FocusNode(owner.body);
  const other = extra(owner.shell, owner.lastBody);
  expect(owner.shell.SetCurNumRule(rule, true)).toBe(true);
  expect(owner.body.GetListId()).not.toBe(rule.GetDefaultListId());
  expect(owner.lastBody.GetListId()).toBe(owner.body.GetListId());
  expect(owner.secondBody.GetListKind()).toBe("none");
  other.Dispose();
});
const stateCases = (["numbered", "bullet", "none"] as const).flatMap(
  /** Combines initial ring state. @param first - First family. @returns Cases. */ (first) =>
    (["numbered", "bullet", "none"] as const).map(
      /** Combines last ring state. @param last - Last family. @returns Case. */ (last) =>
        [first, last] as const,
    ),
);
it.each(stateCases)(
  "native ring state retains source per-range break ordering %s/%s",
  /** Checks actual HasNumber/HasBullet and final per-ring state independently. @param first - First ring. @param last - Second ring. @returns Nothing. */ (
    first,
    last,
  ) => {
    const owner = fixture();
    list(owner.body, first);
    list(owner.lastBody, last);
    owner.shell.FocusNode(owner.body);
    const other = extra(owner.shell, owner.lastBody);
    expect(owner.shell.HasNumber()).toBe(first === "numbered");
    expect(owner.shell.HasBullet()).toBe(first === "bullet");
    expect(owner.shell.SelectionHasNumber()).toBe(last === "numbered");
    expect(owner.shell.SelectionHasBullet()).toBe(last === "bullet");
    expect(owner.shell.GetListShell().GetKind()).toBe(last);
    expect(owner.secondBody.GetListKind()).toBe("none");
    other.Dispose();
  },
);
const emptyCases = (["numbered", "bullet"] as const).flatMap(
  /** Combines marker kinds. @param kind - Kind. @returns Cases. */ (kind) =>
    (["leading", "trailing", "middle", "mixed"] as const).map(
      /** Combines empty placements. @param shape - Placement. @returns Case. */ (shape) =>
        [kind, shape] as const,
    ),
);
it.each(emptyCases)(
  "native linear selection state follows empty-paragraph rule %s/%s",
  /** Checks both native selection queries over real ordered nodes. @param kind - Family. @param shape - Placement. @returns Nothing. */ (
    kind,
    shape,
  ) => {
    const owner = fixture();
    for (const node of [owner.body, owner.secondBody, owner.lastBody]) list(node, kind);
    if (shape === "leading") {
      owner.body.SetText("");
      owner.body.SetNumRule("");
    } else if (shape === "trailing") {
      owner.lastBody.SetText("");
      owner.lastBody.SetNumRule("");
    } else if (shape === "middle") {
      owner.secondBody.SetText("");
      owner.secondBody.SetNumRule("");
    } else {
      owner.secondBody.SetNumRule("");
    }
    const point = new SwPosition(owner.lastBody, 0),
      mark = new SwPosition(owner.body, 0);
    try {
      owner.shell.SetPaM(point, mark);
    } finally {
      point.Dispose();
      mark.Dispose();
    }
    expect(owner.shell.SelectionHasNumber()).toBe(kind === "numbered" && shape !== "mixed");
    expect(owner.shell.SelectionHasBullet()).toBe(kind === "bullet" && shape !== "mixed");
    expect(owner.shell.GetListShell().GetKind()).toBe(shape === "mixed" ? "none" : kind);
  },
);
it.each([false, true])(
  "native reserved outline counted exception differs from ordinary list state counted=%s",
  /** Checks native point and range outline exception without confusing type and identity. @param counted - Count state. @returns Nothing. */ (
    counted,
  ) => {
    const owner = fixture(),
      rule = owner.doc.EnsureNumRule(SwNumRule.GetOutlineRuleName(), "numbered");
    rule.SetRuleType(SwNumRuleType.OUTLINE_RULE);
    owner.body.SetAttr(new SwNumRuleItem(rule.GetName()));
    owner.body.SetCountedInList(counted);
    owner.shell.FocusNode(owner.body);
    expect(owner.body.HasNumber()).toBe(true);
    expect(owner.shell.HasNumber()).toBe(counted);
    expect(owner.shell.SelectionHasNumber()).toBe(counted);
    expect(owner.shell.SelectionHasBullet()).toBe(false);
    owner.body.SetNumRule("");
    list(owner.body, "numbered");
    owner.body.SetCountedInList(false);
    expect(owner.shell.HasNumber()).toBe(true);
    expect(owner.shell.SelectionHasNumber()).toBe(true);
  },
);
it("native detached raw list family is not a native HasNumber or HasBullet", /** Checks actual list membership rather than direct DTO family. @returns Nothing. */ () => {
  const owner = fixture();
  list(owner.body, "bullet");
  owner.body.RemoveFromList();
  owner.shell.FocusNode(owner.body);
  expect(owner.body.GetListKind()).toBe("bullet");
  expect(owner.shell.HasNumber()).toBe(false);
  expect(owner.shell.HasBullet()).toBe(false);
  expect(owner.shell.SelectionHasNumber()).toBe(false);
  expect(owner.shell.SelectionHasBullet()).toBe(false);
});
it("native structural cursor state ignores numbering-only commands", /** Checks native nontext traversal and no history publication. @returns Nothing. */ () => {
  const owner = fixture();
  owner.shell.GetCursor().GetPoint().nNode.Assign(owner.table.GetTableNode());
  expect(owner.shell.HasNumber()).toBe(false);
  expect(owner.shell.HasBullet()).toBe(false);
  expect(owner.shell.SelectionHasNumber()).toBe(false);
  expect(owner.shell.SelectionHasBullet()).toBe(false);
  expect(owner.shell.SetCurNumRule(new SwNumRule("StructuralRing", "label-alignment"))).toBe(false);
  expect(owner.shell.DelNumRules()).toBe(false);
  expect(owner.shell.NumUpDown(true)).toBe(false);
});
const normalizedCases = [
  { name: "collapsed", input: [[1, 1]], expected: [[1, 1]] },
  { name: "reversed", input: [[5, 3]], expected: [[3, 5]] },
  {
    name: "sorted gaps",
    input: [
      [8, 8],
      [1, 1],
      [5, 5],
    ],
    expected: [
      [1, 1],
      [5, 5],
      [8, 8],
    ],
  },
  {
    name: "predecessor adjacent",
    input: [
      [1, 2],
      [3, 4],
    ],
    expected: [[1, 4]],
  },
  {
    name: "predecessor equal",
    input: [
      [1, 3],
      [3, 5],
    ],
    expected: [[1, 5]],
  },
  {
    name: "successor adjacent",
    input: [
      [5, 7],
      [2, 4],
    ],
    expected: [[2, 7]],
  },
  {
    name: "successor equal",
    input: [
      [5, 7],
      [2, 5],
    ],
    expected: [[2, 7]],
  },
  {
    name: "bridge",
    input: [
      [1, 2],
      [6, 7],
      [3, 5],
    ],
    expected: [[1, 7]],
  },
  {
    name: "contained predecessor",
    input: [
      [1, 7],
      [3, 5],
    ],
    expected: [[1, 7]],
  },
  {
    name: "same-start equal",
    input: [
      [2, 4],
      [2, 4],
    ],
    expected: [[2, 4]],
  },
  {
    name: "same-start longer retains native shorter end",
    input: [
      [2, 4],
      [2, 8],
    ],
    expected: [[2, 4]],
  },
  {
    name: "same-start shorter",
    input: [
      [2, 8],
      [2, 4],
    ],
    expected: [[2, 8]],
  },
  {
    name: "partial overlap is not blanket union",
    input: [
      [1, 5],
      [3, 8],
    ],
    expected: [
      [1, 5],
      [3, 8],
    ],
  },
] as const;
it.each(normalizedCases)(
  "native SwPamRanges preserves pinned sorted-vector policy $name",
  /** Checks explicit native insertion traces without upstream execution. @param profile - Source-derived trace. @param profile.input - Intervals. @param profile.expected - Expected native intervals. @returns Nothing. */ ({
    input,
    expected,
  }) => {
    const owner = fixture();
    // Use an independently consecutive body span after the table for all indexed traces.
    const consecutive: SwTextNode[] = [];
    for (let index = 0; index < 10; index++)
      consecutive.push(owner.doc.nodes.MakeTextNode("Ordered" + index));
    const first = required(input[0]),
      point = new SwPosition(required(consecutive[first[1]])),
      mark = new SwPosition(required(consecutive[first[0]])),
      range = new SwPaM(point, mark);
    point.Dispose();
    mark.Dispose();
    try {
      const normalized = new SwPamRanges(range);
      for (const pair of input.slice(1))
        normalized.Insert(required(consecutive[pair[0]]), required(consecutive[pair[1]]));
      expect(normalized.Count()).toBe(expected.length);
      for (let index = 0; index < normalized.Count(); index++) {
        expect(normalized.SetPam(index, range)).toBe(range);
        const pair = required(expected[index]);
        expect(range.Start().GetNode()).toBe(consecutive[pair[0]]);
        expect(range.End().GetNode()).toBe(consecutive[pair[1]]);
        expect(range.GetPoint().GetContentIndex()).toBe(0);
        expect(range.GetMark().GetContentIndex()).toBe(0);
        expect(range.HasMark()).toBe(true);
      }
      expect(
        /** Rejects an absent normalized interval. @returns Nothing. */ () =>
          normalized.SetPam(999, range),
      ).toThrow(/range index/);
    } finally {
      range.Dispose();
    }
  },
);
it("native duplicate ring level ranges change a paragraph once", /** Checks native normalization prevents double delta and keeps unselected neighbors. @returns Nothing. */ () => {
  const owner = fixture();
  list(owner.body, "numbered");
  owner.body.SetAttrListLevel(2);
  owner.shell.FocusNode(owner.body);
  const other = extra(owner.shell, owner.body);
  expect(owner.shell.NumUpDown(true)).toBe(true);
  expect(owner.body.GetAttrListLevel()).toBe(3);
  expect(
    (
      owner.docShell.GetUndoManager().GetUndoAction() as SfxListUndoAction<unknown>
    ).GetActionCount(),
  ).toBe(1);
  expect(owner.shell.Undo()).toBe(true);
  expect(owner.body.GetAttrListLevel()).toBe(2);
  expect(owner.shell.Redo()).toBe(true);
  expect(owner.body.GetAttrListLevel()).toBe(3);
  expect(owner.secondBody.GetListKind()).toBe("none");
  other.Dispose();
});
it("native single-range editing actions retain public history types", /** Checks inherited core operations keep the existing one-range delta and removal API. @returns Nothing. */ () => {
  const owner = fixture();
  list(owner.body, "numbered");
  owner.body.SetAttrListLevel(2);
  owner.shell.FocusNode(owner.body);
  expect(owner.shell.NumUpDown(true)).toBe(true);
  expect(owner.docShell.GetUndoManager().GetUndoAction()).toBeInstanceOf(SwUndoNumUpDown);
  expect(owner.shell.DelNumRules()).toBe(true);
  expect(owner.docShell.GetUndoManager().GetUndoAction()).toBeInstanceOf(SwUndoDelNum);
  expect(owner.shell.Undo()).toBe(true);
  expect(owner.body.GetAttrListLevel()).toBe(3);
});

it.each([false, true])(
  "native numbering history retains its public cursor-only API marked=%s",
  /** Checks fallback native range reconstruction independently of the borrowed ring API. @param marked - Whether cursor has a range. @returns Nothing. */ (
    marked,
  ) => {
    const owner = fixture();
    for (const node of [owner.body, owner.secondBody, owner.lastBody]) {
      list(node, "numbered");
      node.SetAttrListLevel(2);
    }
    owner.shell.FocusNode(owner.body);
    if (marked) {
      const point = new SwPosition(owner.lastBody, 2),
        mark = new SwPosition(owner.body, 1);
      try {
        owner.shell.SetPaM(point, mark);
      } finally {
        point.Dispose();
        mark.Dispose();
      }
    }
    const state = owner.shell.CaptureCursorState(),
      targets = marked ? [owner.body, owner.secondBody, owner.lastBody] : [owner.body],
      neighbor = marked ? owner.outside : owner.secondBody;
    expect(owner.shell.ApplyAction(new SwUndoNumUpDown(state, 1))).toBe(true);
    for (const node of targets) expect(node.GetActualListLevel()).toBe(3);
    expect(owner.shell.Undo()).toBe(true);
    for (const node of targets) expect(node.GetActualListLevel()).toBe(2);
    expect(owner.shell.Redo()).toBe(true);
    for (const node of targets) expect(node.GetActualListLevel()).toBe(3);
    expect(owner.shell.ApplyAction(new SwUndoDelNum(owner.doc, state))).toBe(true);
    for (const node of targets) expect(node.GetListKind()).toBe("none");
    expect(owner.shell.Undo()).toBe(true);
    for (const node of targets) {
      expect(node.GetListKind()).toBe("numbered");
      expect(node.GetActualListLevel()).toBe(3);
    }
    expect(owner.shell.Redo()).toBe(true);
    for (const node of targets) expect(node.GetListKind()).toBe("none");
    expect(neighbor.GetActualListLevel()).toBe(marked ? -1 : 2);
  },
);
