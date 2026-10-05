/** @fileoverview Verifies numeric undo cursor reconstruction against replaced native body and cell nodes without upstream access. */
import { expect, it, vi } from "vitest";
import { SwDoc } from "../doc/doc";
import { SwTextNode } from "../txtnode/ndtxt";
import {
  SwUndo,
  SwUndRng,
  createWriterUndoCursorState,
  createWriterCollapsedCursorState,
  type SwUndoCursorState,
  type SwUndoRedoContext,
} from "./undobj";
import {
  createWriterCharacterItemSet,
  projectWriterCharacterAttributes,
} from "../txtnode/txatbase";
import { SwDocShell } from "../../uibase/app/docsh";
import { SwWrtShell } from "../../uibase/wrtsh/wrtsh1";
import { createDocument } from "../../../../sfx2/source/doc/objsh";

/** Requires actual native ownership. @param value - Optional native value. @returns Actual value. */
function required<T>(value: T | undefined): T {
  if (value === undefined) throw new Error("Missing numeric history owner");
  return value;
}
/** Exercises real shared history boundaries without retaining payload node references. */
class CursorAction extends SwUndo {
  /** Captures complete input boundaries. @param before - Before state. @param after - After state. @param undo - Native mutation. @param redo - Native mutation. @returns Nothing. */
  public constructor(
    before: SwUndoCursorState,
    after: SwUndoCursorState,
    private readonly undo: () => void = noop,
    private readonly redo: () => void = noop,
  ) {
    super("Cursor boundary", before, after);
  }
  /** Executes the native mutation. @returns Nothing. */
  protected override UndoImpl(): void {
    this.undo();
  }
  /** Executes the native mutation. @returns Nothing. */
  protected override RedoImpl(): void {
    this.redo();
  }
  /** Replaces a completed command boundary. @param state - Current boundary. @returns Nothing. */
  public Update(state: SwUndoCursorState): void {
    this.SetAfterCursor(state);
  }
  /** Reconstructs a grouped action boundary. @param doc - Current graph. @returns Current state. */
  public CurrentAfter(doc: SwDoc): SwUndoCursorState {
    return this.GetAfterCursorState(doc);
  }
}
/** Leaves native payload unchanged. @returns Nothing. */
function noop(): void {}
/** Creates independently owned pending items. @param doc - Native graph. @param bold - Literal pending weight. @returns Items. */
function items(doc: SwDoc, bold = true) {
  return createWriterCharacterItemSet(doc.GetAttrPool(), { bold, italic: false, underline: false });
}
/** Creates actual body and table cell owners. @returns Native graph and nodes. */
function fixture() {
  const doc = new SwDoc(),
    first = required(doc.paragraphs[0]),
    second = doc.nodes.MakeTextNode(),
    active = doc.nodes.MakeTextNode(),
    table = doc.nodes.MakeTableNode("CursorRange", {}, active);
  first.SetText("abcdef");
  second.SetText("uvwxyz");
  active.SetText("active");
  table.AddColumnWidth(2000);
  table.AddColumnWidth(2000);
  const row = doc.nodes.AppendTableRow(table, 2),
    left = required(required(row.GetTabBoxes()[0]).GetParagraphs()[0]),
    right = required(required(row.GetTabBoxes()[1]).GetParagraphs()[0]);
  left.SetText("abcdef");
  right.SetText("uvwxyz");
  return { doc, first, second, active, left, right };
}
/** Replaces a node through actual native array ownership. @param node - Old live node. @returns New live node. */
function replace(node: SwTextNode): SwTextNode {
  const copy = node.CloneTo(node.GetNodes());
  node.GetNodes().replaceTextNode(node, copy);
  return copy;
}
/** Captures observable current endpoint state. @param state - Native restored boundary. @returns Literal observable coordinates and pending value. */
function observed(state: SwUndoCursorState) {
  return {
    point: [state.point.node, state.point.offset],
    mark: state.mark === undefined ? undefined : [state.mark.node, state.mark.offset],
    active: state.activeParagraph,
    tableSelection: state.tableSelection,
    bold: projectWriterCharacterAttributes(state.pendingCharacterItems).bold,
  };
}
const directions = [
  "none",
  "equal",
  "forward-same",
  "backward-same",
  "forward-nodes",
  "backward-nodes",
] as const;
const cases = directions.flatMap(
  /** Combines each native selection shape with shell mode adjuncts. @param direction - Endpoint shape. @returns Cases. */
  (direction) =>
    [undefined, false, true].map(
      /** Records independent native ownership inputs. @param tableSelection - Mode adjunct. @returns Case. */
      (tableSelection) => [direction, tableSelection] as const,
    ),
);
it.each(cases)(
  "numeric undo cursor resolves replaced nodes and selection direction %s/%s",
  /** Proves fresh native resolution and copied pending state through both history boundaries. @param direction - Endpoint shape. @param tableSelection - Mode adjunct. @returns Nothing. */
  (direction, tableSelection) => {
    const owner = fixture(),
      first = tableSelection === true ? owner.left : owner.first,
      second = tableSelection === true ? owner.right : owner.second,
      backward = direction.startsWith("backward"),
      cross = direction.endsWith("nodes"),
      pointNode = backward && cross ? second : first,
      pointOffset = backward ? 4 : 1,
      markNode = cross && !backward ? second : first,
      markOffset = direction === "equal" ? 1 : backward ? 1 : 4;
    const state = {
        ...createWriterUndoCursorState(
          pointNode,
          pointOffset,
          direction === "none" ? undefined : markNode,
          direction === "none" ? undefined : markOffset,
          owner.active,
          items(owner.doc),
        ),
        ...(tableSelection === undefined ? {} : { tableSelection }),
      },
      action = new CursorAction(state, state),
      restored: SwUndoCursorState[] = [];
    const currentFirst = replace(first),
      currentSecond = replace(second),
      currentActive = replace(owner.active),
      expected = {
        point: [backward && cross ? currentSecond : currentFirst, pointOffset],
        mark:
          direction === "none"
            ? undefined
            : [cross && !backward ? currentSecond : currentFirst, markOffset],
        active: currentActive,
        tableSelection,
        bold: true,
      },
      context: SwUndoRedoContext = {
        GetDoc: /** Supplies current graph. @returns Native graph. */ () => owner.doc,
        /** Records actual native current endpoints. @param value - Restored state. @returns Nothing. */
        RestoreCursor: (value) => {
          restored.push(value);
          expect(observed(value)).toEqual(expected);
        },
      },
      nativeRestore = vi.spyOn(SwUndRng.prototype, "SetPaM");
    try {
      state.pendingCharacterItems.ClearItem();
      for (let cycle = 0; cycle < 3; cycle++) {
        action.UndoWithContext(context);
        action.RedoWithContext(context);
        required(restored.at(-1)).pendingCharacterItems.ClearItem();
      }
      expect(nativeRestore).toHaveBeenCalledTimes(6);
      expect(first.GetNodes().indexOfOrUndefined(first)).toBeUndefined();
      expect(second.GetNodes().indexOfOrUndefined(second)).toBeUndefined();
      expect(action.CurrentAfter(owner.doc).pendingCharacterItems).not.toBe(
        state.pendingCharacterItems,
      );
      expect(observed(action.CurrentAfter(owner.doc))).toEqual(expected);
    } finally {
      nativeRestore.mockRestore();
    }
  },
);
it("numeric cursor capture owns mutable boundary inputs and completed grouping updates", /** Proves mutation of input and returned states never changes stored numeric histories. @returns Nothing. */ () => {
  const owner = fixture(),
    before = {
      activeParagraph: owner.active,
      point: { node: owner.first, offset: 1 },
      mark: { node: owner.second, offset: 3 },
      pendingCharacterItems: items(owner.doc),
      tableSelection: false,
    },
    after = { ...before, point: { node: owner.second, offset: 4 } },
    action = new CursorAction(before, after),
    restored: SwUndoCursorState[] = [],
    context: SwUndoRedoContext = {
      GetDoc: /** Returns live graph. @returns Graph. */ () => owner.doc,
      RestoreCursor: /** Records actual boundary. @param state - Boundary. @returns Nothing. */ (
        state,
      ) => {
        restored.push(state);
      },
    };
  before.point.node = owner.second;
  before.point.offset = 5;
  before.mark.offset = 0;
  before.activeParagraph = owner.first;
  before.tableSelection = true;
  after.point.offset = 0;
  after.pendingCharacterItems.ClearItem();
  const first = replace(owner.first),
    second = replace(owner.second),
    active = replace(owner.active);
  action.UndoWithContext(context);
  expect(observed(required(restored.at(-1)))).toEqual({
    point: [first, 1],
    mark: [second, 3],
    active,
    tableSelection: false,
    bold: true,
  });
  action.RedoWithContext(context);
  expect(observed(required(restored.at(-1)))).toEqual({
    point: [second, 4],
    mark: [second, 3],
    active,
    tableSelection: false,
    bold: true,
  });
  const update = {
    ...createWriterCollapsedCursorState(first, 2, items(owner.doc, false)),
    tableSelection: true,
  };
  action.Update(update);
  update.pendingCharacterItems.ClearItem();
  const current = action.CurrentAfter(owner.doc);
  expect(observed(current)).toEqual({
    point: [first, 2],
    mark: undefined,
    active: first,
    tableSelection: true,
    bold: false,
  });
  current.pendingCharacterItems.PutSet(items(owner.doc));
  expect(
    projectWriterCharacterAttributes(action.CurrentAfter(owner.doc).pendingCharacterItems).bold,
  ).toBe(false);
  action.RedoWithContext(context);
  expect(observed(required(restored.at(-1)))).toEqual({
    point: [first, 2],
    mark: undefined,
    active: first,
    tableSelection: true,
    bold: false,
  });
});
it("numeric undo cursor records future content coordinates without live registered positions", /** Proves the after boundary is reconstructed only after native text execution. @returns Nothing. */ () => {
  const doc = new SwDoc(),
    node = required(doc.paragraphs[0]),
    before = createWriterCollapsedCursorState(node, 0, items(doc)),
    after = createWriterCollapsedCursorState(node, 6, items(doc, false)),
    restored: SwUndoCursorState[] = [],
    action = new CursorAction(
      before,
      after,
      /** Executes native text undo. @returns Nothing. */ () => node.SetText(""),
      /** Executes native text redo. @returns Nothing. */ () => node.SetText("abcdef"),
    ),
    context: SwUndoRedoContext = {
      GetDoc: /** Supplies graph. @returns Graph. */ () => doc,
      RestoreCursor:
        /** Records post-payload boundary. @param state - Actual state. @returns Nothing. */ (
          state,
        ) => {
          restored.push(state);
        },
    };
  for (let cycle = 0; cycle < 3; cycle++) {
    action.RedoWithContext(context);
    expect(required(restored.at(-1)).point.offset).toBe(6);
    action.UndoWithContext(context);
    expect(required(restored.at(-1)).point.offset).toBe(0);
  }
});
it.each([false, true])(
  "numeric history restores actual shell owners after native replacement in table mode %s",
  /** Proves current native endpoints enter the persistent shell rather than detached originals. @param tableMode - Table endpoints or body. @returns Nothing. */
  (tableMode) => {
    const owner = fixture(),
      first = tableMode ? owner.left : owner.first,
      second = tableMode ? owner.right : owner.second,
      shell = new SwWrtShell(
        new SwDocShell(
          owner.doc,
          createDocument({ id: "numeric-shell", suiteId: "writer", title: "Numeric history" }),
        ),
      ),
      before = createWriterUndoCursorState(first, 1, second, 4, first, items(owner.doc)),
      state = { ...before, ...(tableMode ? { tableSelection: true } : {}) },
      action = new CursorAction(state, state);
    let currentFirst = replace(first),
      currentSecond = replace(second);
    expect(shell.ApplyAction(action)).toBe(true);
    for (let cycle = 0; cycle < 3; cycle++) {
      currentFirst = replace(currentFirst);
      currentSecond = replace(currentSecond);
      expect(shell.Undo()).toBe(true);
      expect(shell.getShellCursor().GetPoint().GetNode()).toBe(currentFirst);
      expect(shell.getShellCursor().GetMark().GetNode()).toBe(currentSecond);
      expect(shell.getShellCursor().GetPoint().GetContentIndex()).toBe(1);
      expect(shell.getShellCursor().GetMark().GetContentIndex()).toBe(4);
      expect(shell.GetActiveParagraph()).toBe(currentFirst);
      expect(shell.Redo()).toBe(true);
      expect(shell.getShellCursor().GetPoint().GetNode()).toBe(currentFirst);
      expect(shell.getShellCursor().GetMark().GetNode()).toBe(currentSecond);
    }
    shell.Close();
  },
);

it("numeric shell history remains current after document replacement cancels composition", /** Verifies native model replacement cancels old shell state before new numeric history boundaries. @returns Nothing. */ () => {
  const owner = fixture(),
    docShell = new SwDocShell(
      owner.doc,
      createDocument({ id: "old-numeric", suiteId: "writer", title: "Old numeric" }),
    ),
    shell = new SwWrtShell(docShell);
  expect(shell.Insert("old")).toBe(true);
  shell.StartComposition();
  shell.UpdateComposition("discard");
  const doc = docShell.InitNew(
      createDocument({ id: "new-numeric", suiteId: "writer", title: "New numeric" }),
    ),
    first = required(doc.paragraphs[0]),
    second = doc.nodes.MakeTextNode();
  first.SetText("abcdef");
  second.SetText("uvwxyz");
  expect(shell.EndComposition()).toBe(false);
  expect(shell.Undo()).toBe(false);
  expect(first.GetText()).toBe("abcdef");
  const before = createWriterUndoCursorState(first, 1, second, 4, first, items(doc)),
    after = createWriterCollapsedCursorState(second, 2, items(doc, false)),
    action = new CursorAction(before, after);
  let currentFirst = replace(first),
    currentSecond = replace(second);
  expect(shell.ApplyAction(action)).toBe(true);
  expect(shell.GetCursor().GetPoint().GetNode()).toBe(currentSecond);
  expect(shell.GetCursor().GetPoint().GetContentIndex()).toBe(2);
  expect(shell.GetCursor().HasMark()).toBe(false);
  expect(projectWriterCharacterAttributes(shell.GetPendingCharacterItems()).bold).toBe(false);
  expect(shell.Undo()).toBe(true);
  expect(shell.GetCursor().GetPoint().GetNode()).toBe(currentFirst);
  expect(shell.GetCursor().GetMark().GetNode()).toBe(currentSecond);
  expect(shell.GetActiveParagraph()).toBe(currentFirst);
  expect(projectWriterCharacterAttributes(shell.GetPendingCharacterItems()).bold).toBe(true);
  currentFirst = replace(currentFirst);
  currentSecond = replace(currentSecond);
  expect(shell.Redo()).toBe(true);
  expect(shell.GetCursor().GetPoint().GetNode()).toBe(currentSecond);
  expect(shell.GetCursor().HasMark()).toBe(false);
  expect(shell.Undo()).toBe(true);
  expect(shell.GetCursor().GetPoint().GetNode()).toBe(currentFirst);
  expect(shell.GetCursor().GetMark().GetNode()).toBe(currentSecond);
  shell.Close();
});
