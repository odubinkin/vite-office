/** @fileoverview Verifies native list continuation search, inclusive body/cell execution and current numeric history without upstream access. */
import { afterEach, expect, it } from "vitest";
import { SwDoc } from "../doc/doc";
import { SwTextNode } from "../txtnode/ndtxt";
import { SwPosition } from "../crsr/pam";
import { applyWriterParagraphList } from "../doc/list";
import { SwNumRuleType } from "../doc/number";
import { SwUndoInsNum } from "./unnum";
import { SfxListUndoAction } from "../../../../svl/source/undo/undo";
import { SwDocShell } from "../../uibase/app/docsh";
import { SwWrtShell } from "../../uibase/wrtsh/wrtsh1";
import { createDocument } from "../../../../sfx2/source/doc/objsh";
import { RES_PARATR_LIST_ISCOUNTED, RES_PARATR_LIST_RESTARTVALUE } from "../../../inc/hintids";
import { WRITER_COMMAND_IDS } from "../../../uiconfig/swriter/menubar/menubar-commands";
import { SfxRequest } from "../../../../sfx2/source/control/request";
const documents: SwDoc[] = [];
afterEach(
  /** Disposes document owners. @returns Nothing. */ () => {
    for (const doc of documents.splice(0)) doc.Dispose();
  },
);
/** Requires an actual native owner. @param value - Optional owner. @returns Owner. */
function required<T>(value: T | undefined): T {
  if (value === undefined) throw new Error("Missing continuation owner");
  return value;
}
/** Builds selected native slots with a preceding list and unaffected neighbors. @param section - Selected section. @param initial - Initial rule relation. @returns Owners. */
function fixture(section: "body" | "cells", initial: "same" | "different" | "plain") {
  const doc = new SwDoc();
  documents.push(doc);
  const previous = required(doc.paragraphs[0]),
    body = doc.nodes.MakeTextNode("First"),
    secondBody = doc.nodes.MakeTextNode("Second");
  previous.SetText("Previous");
  const table = doc.nodes.MakeTableNode("Continue", {}, secondBody);
  table.AddColumnWidth(2000);
  table.AddColumnWidth(2000);
  const row = doc.nodes.AppendTableRow(table, 2),
    cell = required(required(row.GetTabBoxes()[0]).GetParagraphs()[0]),
    otherCell = required(required(row.GetTabBoxes()[1]).GetParagraphs()[0]),
    outside = doc.nodes.MakeTextNode("Outside");
  cell.SetText("First");
  otherCell.SetText("Second");
  const first = section === "body" ? body : cell,
    second = section === "body" ? secondBody : otherCell;
  applyWriterParagraphList(previous, { kind: "numbered", styleId: "Previous", listId: "prior" });
  for (const node of [first, second]) {
    if (initial !== "plain")
      applyWriterParagraphList(node, {
        kind: initial === "same" ? "numbered" : "bullet",
        styleId: initial === "same" ? "Previous" : "Other",
        listId: "selected",
        level: 2,
        restart: true,
        startValue: 7,
      });
    node.SetCountedInList(false);
  }
  const docShell = new SwDocShell(
      doc,
      createDocument({ id: "continue-native", suiteId: "writer", title: "Continue" }),
    ),
    shell = new SwWrtShell(docShell);
  return { doc, previous, first, second, outside, table, docShell, shell };
}
/** Assigns persistent native endpoints. @param shell - Shell. @param first - First owner. @param second - Last owner. @param direction - Selection shape. @returns Nothing. */
function select(
  shell: SwWrtShell,
  first: SwTextNode,
  second: SwTextNode,
  direction: "collapsed" | "forward" | "reversed",
): void {
  const point = new SwPosition(direction === "forward" ? second : first, 1),
    mark =
      direction === "collapsed"
        ? undefined
        : new SwPosition(direction === "forward" ? first : second, 0);
  try {
    shell.SetPaM(point, mark);
  } finally {
    point.Dispose();
    mark?.Dispose();
  }
}
/** Replaces actual native slots preserving section and independent hint/item values. @param old - Original owner. @returns Current owner. */
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
  expect(node.StartOfSectionNode()).toBe(old.StartOfSectionNode());
  return node;
}
/** Checks shell cursor restoration against current owners. @param shell - Shell. @param first - Current first. @param second - Current second. @param direction - Selection shape. @returns Nothing. */
function cursor(
  shell: SwWrtShell,
  first: SwTextNode,
  second: SwTextNode,
  direction: "collapsed" | "forward" | "reversed",
): void {
  expect(shell.GetCursor().GetPoint().GetNode()).toBe(direction === "forward" ? second : first);
  expect(shell.GetCursor().GetPoint().GetContentIndex()).toBe(1);
  expect(shell.GetActiveParagraph()).toBe(shell.GetCursor().GetPoint().GetNode());
  expect(shell.GetCursor().HasMark()).toBe(direction !== "collapsed");
  if (direction !== "collapsed") {
    expect(shell.GetCursor().GetMark().GetNode()).toBe(direction === "forward" ? first : second);
    expect(shell.GetCursor().GetMark().GetContentIndex()).toBe(0);
  }
}
const commandCases = (["body", "cells"] as const).flatMap(
  /** Combines native sections. @param section - Section. @returns Cases. */ (section) =>
    (["collapsed", "forward", "reversed"] as const).flatMap(
      /** Combines cursor directions. @param direction - Direction. @returns Cases. */ (
        direction,
      ) =>
        (["same", "different", "plain"] as const).map(
          /** Combines initial rules. @param initial - Initial relation. @returns Case. */ (
            initial,
          ) => [section, direction, initial] as const,
        ),
    ),
);
it.each(commandCases)(
  "native continuation adopts every current selected slot %s/%s/%s",
  /** Exercises actual dispatch, rule-sensitive restart, count and repeated history. @param section - Section. @param direction - Direction. @param initial - Initial relation. @returns Nothing. */
  (section, direction, initial) => {
    const owner = fixture(section, initial),
      originalFirst = owner.first,
      originalSecond = owner.second,
      beforeFirst = owner.first.CaptureListItems(),
      beforeSecond = owner.second.CaptureListItems();
    select(owner.shell, owner.first, owner.second, direction);
    expect(owner.shell.GetListShell().CanContinueNumbering()).toBe(true);
    const slot = required(
        owner.shell
          .GetListShell()
          .GetCommandShell()
          .GetInterface()
          .GetSlot(WRITER_COMMAND_IDS.continueNumbering),
      ),
      command = required(owner.shell.GetListShell().GetCommandShell().ResolveSlot(slot.slotId));
    expect(command.execute(new SfxRequest(slot.slotId))).toMatchObject({
      status: "executed",
      value: true,
    });
    expect(owner.docShell.GetUndoManager().GetUndoAction()).toBeInstanceOf(SfxListUndoAction);
    expect(owner.docShell.GetUndoManager().GetUndoAction()?.GetPayloadSize()).toBe(
      (direction === "collapsed" ? 1 : 2) * (initial === "different" ? 8 : 6),
    );
    let first = replace(owner.first),
      second = replace(owner.second);
    const afterFirst = first.CaptureListItems(),
      afterSecond = second.CaptureListItems();
    expect(first.GetNumRule()).toBe(owner.previous.GetNumRule());
    expect(first.GetListId()).toBe("prior");
    expect(first.IsCountedInList()).toBe(true);
    expect(first.GetpSwAttrSet()?.GetItemIfSet(RES_PARATR_LIST_ISCOUNTED, false)).toBeUndefined();
    expect(first.IsListRestart()).toBe(initial === "same");
    expect(first.HasAttrListRestartValue()).toBe(initial !== "plain");
    if (initial !== "plain") expect(first.GetAttrListRestartValue()).toBe(7);
    if (direction !== "collapsed") expect(second.GetListId()).toBe("prior");
    for (let cycle = 0; cycle < 3; cycle++) {
      expect(owner.shell.Undo()).toBe(true);
      expect(first.CaptureListItems().Equals(beforeFirst, true)).toBe(true);
      expect(second.CaptureListItems().Equals(beforeSecond, true)).toBe(true);
      cursor(owner.shell, first, second, direction);
      first = replace(first);
      second = replace(second);
      expect(owner.shell.Redo()).toBe(true);
      expect(first.CaptureListItems().Equals(afterFirst, true)).toBe(true);
      expect(second.CaptureListItems().Equals(afterSecond, true)).toBe(true);
      cursor(owner.shell, first, second, direction);
      expect(owner.outside.GetListKind()).toBe("none");
      expect(owner.previous.GetListId()).toBe("prior");
      expect(originalFirst.CaptureListItems().Equals(afterFirst, true)).toBe(true);
      expect(originalSecond.CaptureListItems().Equals(afterSecond, true)).toBe(true);
      first = replace(first);
      second = replace(second);
    }
  },
);
it.each(["forward", "reversed"] as const)(
  "native continuation includes mixed body table and plain paragraphs %s",
  /** Checks ordered native section traversal rather than body projection. @param direction - Direction. @returns Nothing. */ (
    direction,
  ) => {
    const owner = fixture("cells", "different"),
      body = required(owner.doc.paragraphs[1]);
    select(owner.shell, body, owner.second, direction);
    expect(owner.shell.ContinueNumbering()).toBe(true);
    for (const node of [body, required(owner.doc.paragraphs[2]), owner.first, owner.second]) {
      expect(node.GetNumRule()).toBe(owner.previous.GetNumRule());
      expect(node.GetListId()).toBe("prior");
    }
    expect(owner.outside.GetListKind()).toBe("none");
    expect(owner.shell.Undo()).toBe(true);
    expect(body.GetListKind()).toBe("none");
    expect(owner.first.GetListKind()).toBe("bullet");
    expect(owner.shell.Redo()).toBe(true);
    expect(body.GetListKind()).toBe("numbered");
  },
);
const searchCases = [false, true].flatMap(
  /** Combines native search directions. @param forward - Direction. @returns Cases. */ (forward) =>
    [false, true].flatMap(
      /** Combines native marker classification. @param numbered - Enumeration. @returns Cases. */ (
        numbered,
      ) =>
        [-1, 0, 1, 2].map(
          /** Combines nonempty allowance. @param allowance - Limit. @returns Case. */ (
            allowance,
          ) => [forward, numbered, allowance] as const,
        ),
    ),
);
it.each(searchCases)(
  "native rule search respects direction family and nonempty allowance %s/%s/%s",
  /** Checks source search policy over empty/plain paragraphs. @param forward - Direction. @param numbered - Enumeration. @param allowance - Limit. @returns Nothing. */ (
    forward,
    numbered,
    allowance,
  ) => {
    const doc = new SwDoc();
    documents.push(doc);
    const nodes = [
      required(doc.paragraphs[0]),
      ...["", "Gap", "Gap", "Origin"].map(
        /** Allocates native ordered text slots. @param text - Text. @returns Node. */ (text) =>
          doc.nodes.MakeTextNode(text),
      ),
    ];
    if (forward) nodes.reverse();
    const ruleNode = required(nodes[0]),
      origin = required(nodes[4]);
    applyWriterParagraphList(ruleNode, {
      kind: numbered ? "numbered" : "bullet",
      styleId: "Search",
      listId: "found",
    });
    const position = new SwPosition(origin, 0),
      listId = { value: "unchanged" };
    try {
      const result = doc.SearchNumRule(position, forward, numbered, false, allowance, listId);
      const found = allowance === -1 || allowance === 2;
      expect(result).toBe(found ? ruleNode.GetNumRule() : undefined);
      expect(listId.value).toBe(found ? "found" : "unchanged");
    } finally {
      position.Dispose();
    }
  },
);
it.each(["body", "cells"] as const)(
  "native continuation stops at nearest incompatible outline and supports bullet fallback %s",
  /** Checks no skipping earlier incompatible numbered rules and actual enabled state. @param section - Section. @returns Nothing. */ (
    section,
  ) => {
    const owner = fixture(section, "plain"),
      previous = owner.previous;
    previous.GetNumRule()?.SetRuleType(SwNumRuleType.OUTLINE_RULE);
    owner.shell.FocusNode(owner.first);
    expect(owner.shell.GetListShell().CanContinueNumbering()).toBe(false);
    expect(owner.shell.ContinueNumbering()).toBe(false);
    previous.GetNumRule()?.SetRuleType(SwNumRuleType.NUM_RULE);
    applyWriterParagraphList(previous, { kind: "bullet", styleId: "Bullets", listId: "bullets" });
    expect(owner.shell.GetListShell().CanContinueNumbering()).toBe(true);
    expect(owner.shell.ContinueNumbering()).toBe(true);
    expect(owner.first.GetListKind()).toBe("bullet");
    expect(owner.first.GetListId()).toBe("bullets");
  },
);
it("native rule search includes its origin only when requested and respects document boundaries", /** Checks defaults, outline inclusion and unchanged output on miss. @returns Nothing. */ () => {
  const owner = fixture("body", "plain"),
    position = new SwPosition(owner.previous),
    listId = { value: "unchanged" };
  try {
    expect(owner.doc.SearchNumRule(position, false, true, false, -1, listId)).toBeUndefined();
    expect(listId.value).toBe("unchanged");
    expect(owner.doc.SearchNumRule(position, false, true, false, -1, listId, true)).toBe(
      owner.previous.GetNumRule(),
    );
    owner.previous.GetNumRule()?.SetRuleType(SwNumRuleType.OUTLINE_RULE);
    expect(owner.doc.SearchNumRule(position, false, true, true, -1, listId, true)).toBe(
      owner.previous.GetNumRule(),
    );
    const end = new SwPosition(owner.outside);
    try {
      expect(owner.doc.SearchNumRule(end, true, true, false, -1, listId)).toBeUndefined();
    } finally {
      end.Dispose();
    }
    position.nNode.Assign(owner.table.GetTableNode());
    expect(owner.doc.SearchNumRule(position, false, true, false, -1, listId)).toBeUndefined();
  } finally {
    position.Dispose();
  }
});
it("native rule search rejects another document and preserves nearest-rule stopping", /** Checks actual rule boundary and portable ownership guard. @returns Nothing. */ () => {
  const owner = fixture("body", "different"),
    position = new SwPosition(owner.second),
    other = new SwDoc();
  documents.push(other);
  const listId = { value: "" };
  try {
    expect(owner.doc.SearchNumRule(position, false, true, false, -1, listId)).toBeUndefined();
    expect(owner.doc.SearchNumRule(position, false, false, false, -1, listId)).toBe(
      owner.first.GetNumRule(),
    );
    expect(
      /** Calls with a foreign owning document. @returns Optional rule. */ () =>
        other.SearchNumRule(position, false, true, false, -1, listId),
    ).toThrow("another document");
  } finally {
    position.Dispose();
  }
});
it("native continuation retains restart values and returns false for an unchanged rule tuple", /** Checks same-rule no-op and plain-paragraph availability. @returns Nothing. */ () => {
  const owner = fixture("body", "same");
  applyWriterParagraphList(owner.first, {
    kind: "numbered",
    styleId: "Previous",
    listId: "prior",
    restart: true,
    startValue: 7,
  });
  owner.shell.FocusNode(owner.first);
  expect(owner.shell.ContinueNumbering()).toBe(false);
  expect(owner.first.IsListRestart()).toBe(true);
  expect(owner.first.GetAttrListRestartValue()).toBe(7);
  owner.shell.FocusNode(owner.previous);
  expect(owner.shell.GetListShell().CanContinueNumbering()).toBe(false);
  expect(owner.shell.ContinueNumbering()).toBe(false);
});
it("numeric continuation history owns independent tuples and rejects foreign replay", /** Checks no retained node identity or caller item-set ownership. @returns Nothing. */ () => {
  const owner = fixture("cells", "different");
  owner.shell.FocusNode(owner.first);
  const before = owner.first.CaptureListItems(),
    after = owner.previous.CaptureListItems(),
    action = new SwUndoInsNum(
      owner.first,
      before,
      after,
      owner.shell.CaptureCursorState(),
      owner.shell.CaptureCursorState(),
    );
  before.ClearItem(RES_PARATR_LIST_RESTARTVALUE);
  after.ClearItem(RES_PARATR_LIST_RESTARTVALUE);
  let node = replace(owner.first);
  expect(owner.shell.ApplyAction(action)).toBe(true);
  expect(node.GetListId()).toBe("prior");
  node = replace(node);
  expect(owner.shell.Undo()).toBe(true);
  expect(node.GetAttrListRestartValue()).toBe(7);
  const other = new SwDoc();
  documents.push(other);
  const context = {
    GetDoc: /** Supplies foreign doc. @returns Document. */ () => other,
    RestoreCursor: /** No shell restoration on foreign failure. @returns Nothing. */ () => {},
  };
  expect(
    /** Replays undo under a foreign context. @returns Nothing. */ () =>
      action.UndoWithContext(context),
  ).toThrow("another document");
  expect(
    /** Replays redo under a foreign context. @returns Nothing. */ () =>
      action.RedoWithContext(context),
  ).toThrow("another document");
});

it("native search retains the fixed post-it section boundary", /** Checks native root section and prevents leaking body lists into fixed extras. @returns Nothing. */ () => {
  const owner = fixture("body", "plain"),
    root = owner.doc.nodes.at(0);
  const note = new SwTextNode(
    owner.doc.nodes,
    owner.doc.nodes.GetEndOfPostIts().StartOfSectionNode(),
    owner.doc.GetDfltTextFormatColl(),
    "Note",
  );
  owner.doc.nodes.insertTextNodeAfter(root, note);
  applyWriterParagraphList(note, { kind: "numbered", styleId: "Note", listId: "note" });
  const position = new SwPosition(note),
    listId = { value: "" };
  try {
    expect(owner.doc.SearchNumRule(position, true, true, false, -1, listId)).toBeUndefined();
    expect(
      owner.doc.SearchNumRule(position, false, false, false, -1, listId, true),
    ).toBeUndefined();
    expect(owner.doc.SearchNumRule(position, true, true, false, -1, listId, true)).toBe(
      note.GetNumRule(),
    );
  } finally {
    position.Dispose();
  }
});
