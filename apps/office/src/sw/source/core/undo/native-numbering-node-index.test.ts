/** @fileoverview Verifies native numeric numbering history after body/cell owner replacement without upstream access. */
import { afterEach, expect, it } from "vitest";
import { SwDoc } from "../doc/doc";
import { SwTextNode } from "../txtnode/ndtxt";
import { SwPosition } from "../crsr/pam";
import { SwUndoNumOrNoNum, SwUndoNumUpDown, SwUndoDelNum } from "./unnum";
import type { SwUndoRedoContext } from "./undobj";
import { SwDocShell } from "../../uibase/app/docsh";
import { SwWrtShell } from "../../uibase/wrtsh/wrtsh1";
import { createDocument } from "../../../../sfx2/source/doc/objsh";

const documents: SwDoc[] = [];
afterEach(
  /** Releases native owners. @returns Nothing. */ () => {
    for (const doc of documents.splice(0)) doc.Dispose();
  },
);
/** Requires an actual model owner. @param value - Optional owner. @returns Owner. */
function required<T>(value: T | undefined): T {
  if (value === undefined) throw new Error("Missing numbering owner");
  return value;
}
/** Builds native body and cell lists with untouched neighbors. @param kind - Selected section. @returns Native owners. */
function fixture(kind: "body" | "cells") {
  const doc = new SwDoc();
  documents.push(doc);
  const body = required(doc.paragraphs[0]),
    second = doc.nodes.MakeTextNode("Second");
  body.SetText("First");
  const table = doc.nodes.MakeTableNode("Numbering", {}, second);
  table.AddColumnWidth(2000);
  table.AddColumnWidth(2000);
  const row = doc.nodes.AppendTableRow(table, 2),
    cell = required(required(row.GetTabBoxes()[0]).GetParagraphs()[0]),
    neighbor = required(required(row.GetTabBoxes()[1]).GetParagraphs()[0]),
    outside = doc.nodes.MakeTextNode("Outside");
  cell.SetText("First");
  neighbor.SetText("Second");
  const docShell = new SwDocShell(
      doc,
      createDocument({ id: "numbering-index", suiteId: "writer", title: "Numbering" }),
    ),
    shell = new SwWrtShell(docShell);
  for (const node of [body, second, cell, neighbor, outside]) {
    shell.FocusNode(node);
    shell.SetParagraphListKind("numbered");
    node.SetAttrListLevel(node === second || node === neighbor ? 4 : 2);
  }
  docShell.GetUndoManager().Clear();
  return {
    doc,
    docShell,
    shell,
    table,
    outside,
    first: kind === "body" ? body : cell,
    second: kind === "body" ? second : neighbor,
  };
}
/** Replaces the actual numeric slot while retaining its native cell/body section and attributes. @param node - Old owner. @returns Current owner. */
function replace(node: SwTextNode): SwTextNode {
  const next = new SwTextNode(
    node.GetNodes(),
    node.StartOfSectionNode(),
    node.GetTextFormatColl(),
    node.GetText(),
  );
  const direct = node.GetpSwAttrSet();
  if (direct !== undefined) next.SetAttr(direct);
  const hints = node.GetpSwpHints();
  if (hints !== undefined) next.SetTextHints(hints.CopyTo(node.GetDoc().GetAttrPool()));
  node.GetNodes().replaceTextNode(node, next);
  expect(next.StartOfSectionNode()).toBe(node.StartOfSectionNode());
  expect(node.GetNodes().indexOfOrUndefined(node)).toBeUndefined();
  return next;
}
/** Sets actual selection endpoints with distinct content offsets. @param shell - Native shell. @param first - First slot. @param second - Last slot. @param direction - Selection shape. @param zero - Require paragraph-start caret. @returns Nothing. */
function select(
  shell: SwWrtShell,
  first: SwTextNode,
  second: SwTextNode,
  direction: "collapsed" | "forward" | "reversed",
  zero = false,
): void {
  const point = new SwPosition(direction === "forward" ? second : first, zero ? 0 : 1),
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
/** Checks persistent native cursor direction after history restoration. @param shell - Native shell. @param first - Current first owner. @param second - Current last owner. @param direction - Selection shape. @param zero - Paragraph-start caret. @returns Nothing. */
function cursor(
  shell: SwWrtShell,
  first: SwTextNode,
  second: SwTextNode,
  direction: "collapsed" | "forward" | "reversed",
  zero = false,
): void {
  expect(shell.GetCursor().GetPoint().GetNode()).toBe(direction === "forward" ? second : first);
  expect(shell.GetCursor().GetPoint().GetContentIndex()).toBe(zero ? 0 : 1);
  expect(shell.GetActiveParagraph()).toBe(shell.GetCursor().GetPoint().GetNode());
  expect(shell.GetCursor().HasMark()).toBe(direction !== "collapsed");
  if (direction !== "collapsed") {
    expect(shell.GetCursor().GetMark().GetNode()).toBe(direction === "forward" ? first : second);
    expect(shell.GetCursor().GetMark().GetContentIndex()).toBe(0);
  }
}
const levelCases = (["body", "cells"] as const).flatMap(
  /** Combines selected sections. @param kind - Section. @returns Cases. */ (kind) =>
    (["collapsed", "forward", "reversed"] as const).flatMap(
      /** Combines native selection directions. @param direction - Direction. @returns Cases. */ (
        direction,
      ) =>
        [false, true].map(
          /** Combines signed level deltas. @param down - Demote. @returns Case. */ (down) =>
            [kind, direction, down] as const,
        ),
    ),
);
it.each(levelCases)(
  "numeric list-level history targets current native slots %s/%s/%s",
  /** Verifies delta-only undo and current cursor across repeated replacement. @param kind - Section. @param direction - Direction. @param down - Demote. @returns Nothing. */ (
    kind,
    direction,
    down,
  ) => {
    const owner = fixture(kind),
      originalFirst = owner.first,
      originalSecond = owner.second,
      delta = down ? 1 : -1;
    select(owner.shell, owner.first, owner.second, direction);
    expect(owner.shell.NumUpDown(down)).toBe(true);
    expect(owner.docShell.GetUndoManager().GetUndoAction()).toBeInstanceOf(SwUndoNumUpDown);
    expect(owner.docShell.GetUndoManager().GetUndoAction()?.GetPayloadSize()).toBe(5);
    let first = replace(owner.first),
      second = replace(owner.second);
    const id = first.GetListId(),
      rule = first.GetNumRule();
    first.SetListRestart(true);
    first.SetAttrListRestartValue(7);
    first.SetCountedInList(false);
    for (let cycle = 0; cycle < 3; cycle++) {
      expect(owner.shell.Undo()).toBe(true);
      expect(first.GetAttrListLevel()).toBe(2);
      expect(second.GetAttrListLevel()).toBe(4);
      cursor(owner.shell, first, second, direction);
      first = replace(first);
      second = replace(second);
      expect(owner.shell.Redo()).toBe(true);
      expect(first.GetAttrListLevel()).toBe(2 + delta);
      expect(second.GetAttrListLevel()).toBe(4 + (direction === "collapsed" ? 0 : delta));
      expect(first.IsListRestart()).toBe(true);
      expect(first.GetAttrListRestartValue()).toBe(7);
      expect(first.IsCountedInList()).toBe(false);
      expect(first.GetListId()).toBe(id);
      expect(first.GetNumRule()).toBe(rule);
      expect(owner.outside.GetAttrListLevel()).toBe(2);
      expect(originalFirst.GetAttrListLevel()).toBe(2 + delta);
      expect(originalSecond.GetAttrListLevel()).toBe(4 + (direction === "collapsed" ? 0 : delta));
      cursor(owner.shell, first, second, direction);
      first = replace(first);
      second = replace(second);
    }
  },
);
it.each(["body", "cells"] as const)(
  "numeric count history changes only the current slot flag %s",
  /** Verifies native counted-only history and independent metadata. @param kind - Section. @returns Nothing. */ (
    kind,
  ) => {
    const owner = fixture(kind),
      original = owner.first;
    select(owner.shell, owner.first, owner.second, "collapsed", true);
    expect(owner.shell.NumOrNoNum(false)).toBe(true);
    expect(owner.docShell.GetUndoManager().GetUndoAction()).toBeInstanceOf(SwUndoNumOrNoNum);
    expect(owner.docShell.GetUndoManager().GetUndoAction()?.GetPayloadSize()).toBe(3);
    let first = replace(original);
    first.SetAttrListLevel(5);
    first.SetListRestart(true);
    first.SetAttrListRestartValue(9);
    const id = first.GetListId(),
      rule = first.GetNumRule();
    for (let cycle = 0; cycle < 3; cycle++) {
      expect(owner.shell.Undo()).toBe(true);
      expect(first.IsCountedInList()).toBe(true);
      cursor(owner.shell, first, owner.second, "collapsed", true);
      first = replace(first);
      expect(owner.shell.Redo()).toBe(true);
      expect(first.IsCountedInList()).toBe(false);
      expect(first.GetAttrListLevel()).toBe(5);
      expect(first.IsListRestart()).toBe(true);
      expect(first.GetAttrListRestartValue()).toBe(9);
      expect(first.GetListId()).toBe(id);
      expect(first.GetNumRule()).toBe(rule);
      expect(owner.second.IsCountedInList()).toBe(true);
      expect(original.IsCountedInList()).toBe(false);
      cursor(owner.shell, first, owner.second, "collapsed", true);
      first = replace(first);
    }
  },
);
it.each(
  (["body", "cells"] as const).flatMap(
    /** Combines inclusive numbering deletion ranges. @param kind - Section. @returns Cases. */ (
      kind,
    ) =>
      (["collapsed", "forward", "reversed"] as const).map(
        /** Records native direction. @param direction - Selection shape. @returns Case. */ (
          direction,
        ) => [kind, direction] as const,
      ),
  ),
)(
  "numeric numbering deletion restores current native history entries %s/%s",
  /** Verifies independent direct list history,actual levels and current range replay. @param kind - Section. @param direction - Selection shape. @returns Nothing. */ (
    kind,
    direction,
  ) => {
    const owner = fixture(kind),
      originalFirst = owner.first,
      originalSecond = owner.second;
    owner.first.SetListRestart(true);
    owner.first.SetAttrListRestartValue(7);
    owner.first.SetCountedInList(false);
    const firstId = owner.first.GetListId(),
      secondId = owner.second.GetListId();
    select(owner.shell, owner.first, owner.second, direction);
    expect(owner.shell.DelNumRules()).toBe(true);
    expect(owner.docShell.GetUndoManager().GetUndoAction()).toBeInstanceOf(SwUndoDelNum);
    let first = replace(owner.first),
      second = replace(owner.second);
    for (let cycle = 0; cycle < 3; cycle++) {
      // Mutating detached original items cannot change the retained history.
      originalFirst.SetListRestart(false);
      originalFirst.SetAttrListRestartValue(1);
      expect(owner.shell.Undo()).toBe(true);
      expect(first.GetListKind()).toBe("numbered");
      expect(first.GetAttrListLevel()).toBe(2);
      expect(first.GetListId()).toBe(firstId);
      expect(first.IsListRestart()).toBe(true);
      expect(first.GetAttrListRestartValue()).toBe(7);
      expect(first.IsCountedInList()).toBe(false);
      expect(second.GetListKind()).toBe("numbered");
      expect(second.GetAttrListLevel()).toBe(4);
      expect(second.GetListId()).toBe(secondId);
      cursor(owner.shell, first, second, direction);
      first = replace(first);
      second = replace(second);
      expect(owner.shell.Redo()).toBe(true);
      expect(first.GetListKind()).toBe("none");
      expect(second.GetListKind()).toBe(direction === "collapsed" ? "numbered" : "none");
      expect(owner.outside.GetListKind()).toBe("numbered");
      expect(owner.outside.GetAttrListLevel()).toBe(2);
      expect(originalFirst.GetListKind()).toBe("none");
      expect(originalSecond.GetListKind()).toBe(direction === "collapsed" ? "numbered" : "none");
      cursor(owner.shell, first, second, direction);
      first = replace(first);
      second = replace(second);
    }
  },
);
/** Exposes payload replay to verify native structural-node guards independently of shell text cursor adjuncts. */
class CountHistory extends SwUndoNumOrNoNum {
  /** Replays both native payload directions. @param context - Current context. @returns Nothing. */
  public ReplayPayload(context: SwUndoRedoContext): void {
    this.UndoImpl(context);
    this.RedoImpl(context);
  }
}
it("numeric count payload ignores a structural node at its saved index", /** Checks the upstream nontext guard on actual SwNodes. @returns Nothing. */ () => {
  const owner = fixture("body"),
    index = owner.second.GetIndex(),
    action = new CountHistory(owner.second, true, false, owner.shell.CaptureCursorState());
  owner.doc.nodes.removeTextNode(owner.second);
  expect(owner.doc.nodes.at(index)).toBe(owner.table.GetTableNode());
  action.ReplayPayload({
    GetDoc: /** Supplies actual native document. @returns Document. */ () => owner.doc,
    RestoreCursor:
      /** Native payload guard does not restore shell state. @returns Nothing. */ () => {},
  });
  expect(owner.first.IsCountedInList()).toBe(true);
  expect(owner.outside.IsCountedInList()).toBe(true);
});
