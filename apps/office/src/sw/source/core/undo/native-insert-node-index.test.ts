/** @fileoverview Verifies numeric native insertion ownership after actual body/cell node replacement, without upstream access. */
import { expect, it } from "vitest";
import { SwDoc } from "../doc/doc";
import { SwTextNode } from "../txtnode/ndtxt";
import { SwPosition } from "../crsr/pam";
import { SwUndoInsert } from "./unins";
import {
  createWriterCollapsedCursorState,
  type SwUndoCursorState,
  type SwUndoRedoContext,
} from "./undobj";
import { SwInsertFlags } from "../../../inc/IDocumentContentOperations";
import {
  createWriterCharacterItemSet,
  projectWriterCharacterAttributes,
} from "../txtnode/txatbase";
import { SwDocShell } from "../../uibase/app/docsh";
import { SwWrtShell } from "../../uibase/wrtsh/wrtsh1";
import { createDocument } from "../../../../sfx2/source/doc/objsh";

/** Requires a current native owner. @param value - Optional owner. @returns Actual owner. */
function required<T>(value: T | undefined): T {
  if (value === undefined) throw new Error("Missing insertion index owner");
  return value;
}
/** Creates actual body and cell slots with untouched neighbors. @param kind - Target slot. @returns Native owners. */
function fixture(kind: "first" | "second" | "cell") {
  const doc = new SwDoc(),
    first = required(doc.paragraphs[0]),
    second = doc.nodes.MakeTextNode();
  first.SetText("abc");
  second.SetText("abc");
  const table = doc.nodes.MakeTableNode("Index", {}, second);
  table.AddColumnWidth(2000);
  table.AddColumnWidth(2000);
  const row = doc.nodes.AppendTableRow(table, 2),
    cell = required(required(row.GetTabBoxes()[0]).GetParagraphs()[0]),
    neighbor = required(required(row.GetTabBoxes()[1]).GetParagraphs()[0]);
  cell.SetText("abc");
  neighbor.SetText("Keep");
  return {
    doc,
    first,
    second,
    cell,
    neighbor,
    node: kind === "first" ? first : kind === "second" ? second : cell,
  };
}
/** Creates independent pending native items. @param doc - Current document. @param bold - Explicit weight. @returns Native item set. */
function items(doc: SwDoc, bold = false) {
  return createWriterCharacterItemSet(doc.GetAttrPool(), { bold, italic: false, underline: false });
}
/** Captures an ephemeral current boundary. @param node - Current node. @param offset - Future or current offset. @param bold - Pending weight. @returns Cursor state. */
function state(node: SwTextNode, offset: number, bold = false) {
  return createWriterCollapsedCursorState(node, offset, items(node.GetDoc(), bold));
}
/** Creates a literal native fragment without inserting another live node. @param node - Current owner. @param text - Text. @param bold - Explicit fragment format. @returns Owned fragment. */
function fragment(node: SwTextNode, text: string, bold = false) {
  const source = new SwTextNode(
    node.GetNodes(),
    node.StartOfSectionNode(),
    node.GetTextFormatColl(),
    text,
  );
  if (bold) source.ToggleTextRangeFormat(0, text.length, "bold");
  return source.CaptureTextFragment(0, text.length);
}
/** Replaces actual native ownership at the same numeric slot. @param node - Old native node. @returns New current owner. */
function replace(node: SwTextNode): SwTextNode {
  const copy = node.CloneTo(node.GetNodes());
  node.GetNodes().replaceTextNode(node, copy);
  return copy;
}
const cases = (["first", "second", "cell"] as const).flatMap(
  /** Combines slot and insertion path. @param kind - Slot. @returns Native cases. */
  (kind) =>
    [false, true].map(
      /** Records whether the native pending-item insertion path is used. @param native - Native text path. @returns Case. */
      (native) => [kind, native] as const,
    ),
);
it.each(cases)(
  "numeric insertion mutates current native slot after replacement %s/%s",
  /** Verifies native target, text, formatting and cursor across repeated node replacement. @param kind - Slot. @param native - Native text path. @returns Nothing. */ (
    kind,
    native,
  ) => {
    const owner = fixture(kind),
      original = owner.node,
      pending = items(owner.doc, true),
      inserted = fragment(original, "XY", true),
      before = state(original, 1),
      after = state(original, 3, true),
      action = new SwUndoInsert(
        original,
        1,
        inserted,
        undefined,
        before,
        after,
        SwInsertFlags.DEFAULT,
        native ? pending : undefined,
      ),
      restored: SwUndoCursorState[] = [],
      context: SwUndoRedoContext = {
        GetDoc: /** Supplies current document. @returns Document. */ () => owner.doc,
        RestoreCursor:
          /** Records the actual restored boundary. @param value - Boundary. @returns Nothing. */ (
            value,
          ) => {
            restored.push(value);
          },
      };
    let current = replace(original);
    pending.ClearItem();
    inserted.hints.DeleteAtPos(0);
    before.pendingCharacterItems.ClearItem();
    for (let cycle = 0; cycle < 3; cycle++) {
      action.RedoWithContext(context);
      expect(current.GetText()).toBe("aXYbc");
      expect(projectWriterCharacterAttributes(current.GetCharacterItemsAt(2)).bold).toBe(true);
      expect(required(restored.at(-1)).point.node).toBe(current);
      expect(required(restored.at(-1)).point.offset).toBe(3);
      expect(
        projectWriterCharacterAttributes(required(restored.at(-1)).pendingCharacterItems).bold,
      ).toBe(true);
      current = replace(current);
      action.UndoWithContext(context);
      expect(current.GetText()).toBe("abc");
      expect(required(restored.at(-1)).point.node).toBe(current);
      expect(required(restored.at(-1)).point.offset).toBe(1);
      expect(original.GetText()).toBe("abc");
      expect(original.GetNodes().indexOfOrUndefined(original)).toBeUndefined();
      expect(owner.neighbor.GetText()).toBe("Keep");
      expect(action.GetPayloadSize()).toBeLessThan(20);
      current = replace(current);
    }
  },
);
it.each(["first", "cell"] as const)(
  "numeric typing groups the current replacement slot %s",
  /** Verifies the native node-index grouping predicate across physical replacement. @param kind - Native target. @returns Nothing. */ (
    kind,
  ) => {
    const owner = fixture(kind),
      original = owner.node,
      first = new SwUndoInsert(
        original,
        1,
        fragment(original, "X"),
        "word",
        state(original, 1),
        state(original, 2),
        SwInsertFlags.DEFAULT,
        items(owner.doc),
      ),
      restored: SwUndoCursorState[] = [],
      context: SwUndoRedoContext = {
        GetDoc: /** Supplies current document. @returns Document. */ () => owner.doc,
        RestoreCursor:
          /** Captures current cursor boundary. @param value - Boundary. @returns Nothing. */ (
            value,
          ) => {
            restored.push(value);
          },
      };
    first.RedoWithContext(context);
    let current = replace(original);
    const second = new SwUndoInsert(
      current,
      2,
      fragment(current, "Y"),
      "word",
      state(current, 2),
      state(current, 3, true),
      SwInsertFlags.DEFAULT,
      items(owner.doc),
    );
    second.RedoWithContext(context);
    expect(first.Merge(second)).toBe(true);
    expect(current.GetText()).toBe("aXYbc");
    current = replace(current);
    first.UndoWithContext(context);
    expect(current.GetText()).toBe("abc");
    current = replace(current);
    first.RedoWithContext(context);
    expect(current.GetText()).toBe("aXYbc");
    expect(required(restored.at(-1)).point.node).toBe(current);
    expect(required(restored.at(-1)).point.offset).toBe(3);
    expect(
      projectWriterCharacterAttributes(required(restored.at(-1)).pendingCharacterItems).bold,
    ).toBe(true);
    expect(original.GetText()).toBe("aXbc");
  },
);
it("numeric typing keeps different documents and node indices separate", /** Verifies document ownership remains distinct even when numeric slots coincide. @returns Nothing. */ () => {
  const own = fixture("first"),
    foreign = fixture("first"),
    first = new SwUndoInsert(
      own.node,
      1,
      fragment(own.node, "X"),
      "word",
      state(own.node, 1),
      state(own.node, 2),
      SwInsertFlags.DEFAULT,
    );
  const otherDocument = new SwUndoInsert(
    foreign.node,
    2,
    fragment(foreign.node, "Y"),
    "word",
    state(foreign.node, 2),
    state(foreign.node, 3),
    SwInsertFlags.DEFAULT,
  );
  const otherNode = new SwUndoInsert(
    own.second,
    2,
    fragment(own.second, "Y"),
    "word",
    state(own.second, 2),
    state(own.second, 3),
    SwInsertFlags.DEFAULT,
  );
  expect(first.Merge(otherDocument)).toBe(false);
  expect(first.Merge(otherNode)).toBe(false);
});
it.each(["first", "cell"] as const)(
  "actual shell typing targets replaced native history nodes %s",
  /** Proves current numeric insertion payload and grouping enter the real persistent shell. @param kind - Native target. @returns Nothing. */ (
    kind,
  ) => {
    const owner = fixture(kind),
      shell = new SwWrtShell(
        new SwDocShell(
          owner.doc,
          createDocument({ id: "insert-index", suiteId: "writer", title: "Insertion index" }),
        ),
      ),
      original = owner.node,
      point = new SwPosition(original, 1);
    expect(shell.SetPaM(point)).toBe(true);
    point.Dispose();
    expect(shell.Insert("X")).toBe(true);
    let current = replace(original);
    expect(shell.Insert("Y")).toBe(true);
    expect(shell.GetDoc().GetUndoManager().GetUndoActionCount()).toBe(1);
    expect(current.GetText()).toBe("aXYbc");
    current = replace(current);
    expect(shell.Undo()).toBe(true);
    expect(current.GetText()).toBe("abc");
    expect(shell.GetCursor().GetPoint().GetNode()).toBe(current);
    expect(shell.GetCursor().GetPoint().GetContentIndex()).toBe(1);
    current = replace(current);
    expect(shell.Redo()).toBe(true);
    expect(current.GetText()).toBe("aXYbc");
    expect(shell.GetCursor().GetPoint().GetNode()).toBe(current);
    expect(shell.GetActiveParagraph()).toBe(current);
    expect(shell.GetCursor().GetPoint().GetContentIndex()).toBe(3);
    expect(owner.neighbor.GetText()).toBe("Keep");
    shell.Close();
  },
);

it("current native shell paragraph follows cursor navigation and model replacement", /** Verifies actual cursor ownership across native replacement, table movement and document lifecycle. @returns Nothing. */ () => {
  const owner = fixture("cell"),
    docShell = new SwDocShell(
      owner.doc,
      createDocument({ id: "cursor-owner", suiteId: "writer", title: "Cursor owner" }),
    ),
    shell = new SwWrtShell(docShell);
  const body = replace(owner.first);
  expect(shell.GetActiveParagraph()).toBe(body);
  shell.FocusNode(body);
  shell.FocusNode(owner.cell);
  expect(shell.GetActiveParagraph()).toBe(owner.cell);
  expect(shell.GoNextCell(false)).toBe(true);
  expect(shell.GetActiveParagraph()).toBe(owner.neighbor);
  expect(shell.SelectTableRow()).toBe(true);
  expect(shell.GetActiveParagraph()).toBe(shell.getShellCursor().GetPoint().GetNode());
  shell.StartOfSection(false);
  expect(shell.GetActiveParagraph()).toBe(shell.getShellCursor().GetPoint().GetNode());
  shell.FocusNode(body);
  shell.EndOfSection(false);
  expect(shell.GetActiveParagraph()).toBe(shell.getShellCursor().GetPoint().GetNode());
  const doc = docShell.InitNew(
      createDocument({ id: "cursor-new", suiteId: "writer", title: "Cursor new" }),
    ),
    node = required(doc.paragraphs[0]);
  expect(shell.GetActiveParagraph()).toBe(node);
  expect(shell.GetCursor().GetPoint().GetNode()).toBe(node);
  const current = replace(node);
  expect(shell.GetActiveParagraph()).toBe(current);
  expect(shell.Insert("Fresh")).toBe(true);
  expect(current.GetText()).toBe("Fresh");
  expect(shell.Undo()).toBe(true);
  expect(shell.GetActiveParagraph()).toBe(current);
  expect(current.GetText()).toBe("");
  shell.Close();
});
