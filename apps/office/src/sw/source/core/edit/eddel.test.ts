/** @fileoverview Verifies native edit-shell marked-range ownership without upstream execution. */
import { it, expect, vi } from "vitest";
import { SwDoc } from "../doc/doc";
import { SwCursor } from "../crsr/swcrsr";
import { SwPosition } from "../crsr/pam";
import { SwUndoDelete } from "../undo/undel";
import { SfxListUndoAction } from "../../../../svl/source/undo/undo";
import {
  createWriterUndoCursorState,
  type SwUndoCursorState,
  type SwUndoRedoContext,
} from "../undo/undobj";
import { createWriterDeleteSelectionOperation } from "./eddel";
/** Requires an actual owner. @param value - Optional owner. @returns Owner. */
function required<T>(value: T | undefined): T {
  if (value === undefined) throw new Error("Missing core delete owner");
  return value;
}
/** Creates native document/cursor/context owners. @returns Actual graph and observed cursor boundaries. */
function fixture() {
  const doc = new SwDoc(),
    first = required(doc.paragraphs[0]);
  first.SetText("Alpha");
  const second = doc.nodes.MakeTextNode("Beta"),
    position = new SwPosition(first, 0),
    cursor = new SwCursor(position);
  position.Dispose();
  const restore = vi.fn<(state: SwUndoCursorState) => void>(),
    context: SwUndoRedoContext = {
      GetDoc: /** Verifies native selected text deletion.  @returns Operation result. */ () => doc,
      RestoreCursor: restore,
    };
  const state = /** Verifies native selected text deletion.  @returns Operation result. */ () =>
    createWriterUndoCursorState(
      cursor.GetPoint().GetNode() as typeof first,
      cursor.GetPoint().GetContentIndex(),
      cursor.HasMark() ? (cursor.GetMark().GetNode() as typeof first) : undefined,
      cursor.HasMark() ? cursor.GetMark().GetContentIndex() : undefined,
      first,
      first.GetCharacterItemsAt(0),
    );
  return { doc, first, second, cursor, context, restore, state };
}
it.each([false, true])(
  "native DeleteSel ignores an unmarked or collapsed owner mark=%s",
  /** Verifies native selected text deletion. @param marked - Current owner. @returns Operation result. */ (
    marked,
  ) => {
    const f = fixture();
    if (marked) f.cursor.SetMark();
    expect(createWriterDeleteSelectionOperation(f.cursor, "delete", f.state())).toBeUndefined();
    expect(f.first.GetText()).toBe("Alpha");
    expect(f.doc.GetUndoManager().GetUndoNodes().Count()).toBe(0);
    f.cursor.Dispose();
  },
);
it("native single marked range retains SwUndoDelete and normalized undo boundaries", /** Verifies native selected text deletion.  @returns Operation result. */ () => {
  const f = fixture();
  f.cursor.GetPoint().Assign(f.first, 1);
  f.cursor.SetMark();
  f.cursor.GetPoint().Assign(f.first, 4);
  const operation = required(createWriterDeleteSelectionOperation(f.cursor, "delete", f.state()));
  expect(operation.action).toBeInstanceOf(SwUndoDelete);
  expect(operation.execute).toBeUndefined();
  operation.action.RedoWithContext(f.context);
  expect(f.first.GetText()).toBe("Aa");
  operation.action.UndoWithContext(f.context);
  expect(f.first.GetText()).toBe("Alpha");
  expect(f.restore.mock.calls.at(-1)?.[0].point).toEqual({ node: f.first, offset: 4 });
  expect(f.restore.mock.calls.at(-1)?.[0].mark).toEqual({ node: f.first, offset: 1 });
  operation.action.Dispose();
  f.cursor.Dispose();
});
it.each([false, true])(
  "native ring DeleteSel keeps its skipped root caret marked=%s",
  /** Verifies native selected text deletion. @param marked - Current owner. @returns Operation result. */ (
    marked,
  ) => {
    const f = fixture();
    if (marked) f.cursor.SetMark();
    const selected = f.cursor.Create(f.cursor);
    selected.GetPoint().Assign(f.second, 0);
    selected.SetMark();
    selected.GetPoint().Assign(f.second, 4);
    const operation = required(createWriterDeleteSelectionOperation(f.cursor, "delete", f.state())),
      group = operation.action as SfxListUndoAction<SwUndoRedoContext>;
    expect(group).toBeInstanceOf(SfxListUndoAction);
    expect(group.GetActionCount()).toBe(0);
    required(operation.execute)(f.context);
    expect(group.GetActionCount()).toBe(1);
    expect(f.second.GetText()).toBe("");
    expect(f.first.GetText()).toBe("Alpha");
    expect(f.restore.mock.calls.at(-1)?.[0].point).toEqual({ node: f.first, offset: 0 });
    group.UndoWithContext(f.context);
    expect(f.second.GetText()).toBe("Beta");
    group.RedoWithContext(f.context);
    expect(f.second.GetText()).toBe("");
    group.Dispose();
    selected.Dispose();
    f.cursor.Dispose();
  },
);
it.each(["body", "other-table"] as const)(
  "delete profile rejects unrepresented %s structural span before content mutation",
  /** Checks the existing structural guard remains explicit. @param destination - Unsupported topology. @returns Nothing. */
  (destination) => {
    const f = fixture(),
      table = f.doc.nodes.MakeTableNode("One", {}, f.first);
    table.AddColumnWidth(1000);
    const row = f.doc.nodes.AppendTableRow(table, 1),
      cell = required(required(row.GetTabBoxes()[0]).GetParagraphs()[0]);
    cell.SetText("Cell");
    let end = f.second;
    if (destination === "other-table") {
      const other = f.doc.nodes.MakeTableNode("Two");
      other.AddColumnWidth(1000);
      end = required(
        required(f.doc.nodes.AppendTableRow(other, 1).GetTabBoxes()[0]).GetParagraphs()[0],
      );
      end.SetText("Other");
    }
    f.cursor.GetPoint().Assign(cell, 1);
    f.cursor.SetMark();
    f.cursor.GetPoint().Assign(end, 1);
    expect(
      /** Verifies native selected text deletion.  @returns Operation result. */ () =>
        createWriterDeleteSelectionOperation(f.cursor, "delete", f.state()),
    ).toThrow("requires text nodes in one section");
    expect(cell.GetText()).toBe("Cell");
    expect(f.second.GetText()).toBe("Beta");
    expect(f.doc.GetUndoManager().GetUndoNodes().Count()).toBe(0);
    f.cursor.Dispose();
  },
);
