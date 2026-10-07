/** @fileoverview Verifies UI paints native selected boxes and never owns selected row state. */
import { selectMountedTableRow } from "../../../../test-support/table-mouse-dom";
import { cleanup, render, screen, fireEvent, act, within } from "@testing-library/react";
import { afterEach, it, expect } from "vitest";
import { createWriterDocumentSession } from "../composition/writer-module";
import { WriterWorkbench } from "../presentation/writer-view";
import { SwTableCursor } from "../../source/core/crsr/swcrsr";
const sessions: ReturnType<typeof createWriterDocumentSession>[] = [];
afterEach(
  /** Checks actual table selection behavior.  @returns Operation result. */ () => {
    cleanup();
    for (const session of sessions.splice(0)) session.Close();
  },
);
/** Requires actual owner. @param value - Optional owner. @returns Owner. */
function required<T>(value: T | undefined): T {
  if (value === undefined) throw new Error("Missing UI table owner");
  return value;
}
/** Builds two mounted real tables and a body. @returns Real view owners. */
function fixture() {
  const session = createWriterDocumentSession();
  sessions.push(session);
  const doc = session.docShell.GetDoc(),
    body = required(doc.paragraphs[0]);
  body.SetText("Body");
  const table = doc.nodes.MakeTableNode("First", { width: 4000, align: "left" }, body);
  table.AddColumnWidth(2000);
  table.AddColumnWidth(2000);
  doc.nodes.AppendTableRow(table, 2);
  doc.nodes.AppendTableRow(table, 2);
  const boxes = table
    .GetTabLines()
    .flatMap(
      /** Checks actual table selection behavior. @param line - Current owner. @returns Operation result. */ (
        line,
      ) => line.GetTabBoxes(),
    );
  boxes.forEach(
    /** Checks actual table selection behavior. @param box - Current owner. @param i - Current owner. @returns Operation result. */ (
      box,
      i,
    ) => required(box.GetParagraphs()[0]).SetText("Cell" + i),
  );
  const other = doc.nodes.MakeTableNode("Second", { width: 7000, align: "left" });
  other.AddColumnWidth(4000);
  doc.nodes.AppendTableRow(other, 1);
  render(<WriterWorkbench isActive view={session.view} />);
  return {
    session,
    doc,
    body,
    table,
    boxes,
    other,
    shell: session.view.GetWrtShell(),
    edit: session.view.GetEditWin(),
  };
}
/** Returns visible painted cells. @param table - Native name. @returns Mounted selected cells. */
function painted(table: string) {
  return screen
    .getByRole("table", { name: table })
    .querySelectorAll('[data-writer-editor-selected="true"]');
}
it("row gesture paints actual selected boxes and body cursor removes stale row and properties", /** Checks actual table selection behavior.  @returns Operation result. */ () => {
  const f = fixture();
  expect(screen.queryByRole("button", { name: "Select row 2 in First" })).toBeNull();
  expect(selectMountedTableRow("First", 2)).toBe(true);
  const c = f.shell.getShellCursor() as SwTableCursor;
  expect(c).toBeInstanceOf(SwTableCursor);
  expect(c.GetSelectedBoxes()).toEqual(f.boxes.slice(2));
  expect(painted("First")).toHaveLength(2);
  const rows = screen.getByRole("table", { name: "First" }).querySelectorAll("tr");
  expect(rows[0]).toHaveAttribute("aria-selected", "false");
  expect(rows[1]).toHaveAttribute("aria-selected", "true");
  expect(f.session.viewStore.GetSnapshot().selectedTableBoxes).toEqual(
    f.boxes
      .slice(2)
      .map(
        /** Checks actual table selection behavior. @param box - Current owner. @returns Operation result. */ (
          box,
        ) => box.GetStartNode().GetIndex(),
      ),
  );
  act(
    /** Checks actual table selection behavior.  @returns Operation result. */ () => {
      f.edit.SetSelection({ point: { nodeIndex: f.body.GetIndex(), contentIndex: 0 } });
    },
  );
  expect(painted("First")).toHaveLength(0);
  expect(screen.queryByRole("button", { name: "Table Properties" })).toBeNull();
  expect(f.shell.HasBoxSelection()).toBe(false);
});
it("caret alone sets table properties context without painting a selected row", /** Checks actual table selection behavior.  @returns Operation result. */ () => {
  const f = fixture(),
    node = required(required(f.boxes[1]).GetParagraphs()[0]);
  act(
    /** Checks actual table selection behavior.  @returns Operation result. */ () => {
      f.edit.SetSelection({ point: { nodeIndex: node.GetIndex(), contentIndex: 2 } });
    },
  );
  expect(painted("First")).toHaveLength(0);
  fireEvent.click(screen.getByRole("button", { name: "Table Properties" }));
  expect(
    within(screen.getByRole("dialog", { name: "Table Properties" })).getByLabelText(
      "Table width (cm)",
    ),
  ).toHaveValue(7.06);
  fireEvent.click(screen.getByRole("button", { name: "Cancel" }));
  const second = required(
    required(required(f.other.GetTabLines()[0]).GetTabBoxes()[0]).GetParagraphs()[0],
  );
  act(
    /** Checks actual table selection behavior.  @returns Operation result. */ () => {
      f.edit.SetSelection({ point: { nodeIndex: second.GetIndex(), contentIndex: 0 } });
    },
  );
  fireEvent.click(screen.getByRole("button", { name: "Table Properties" }));
  expect(
    within(screen.getByRole("dialog", { name: "Table Properties" })).getByLabelText(
      "Table width (cm)",
    ),
  ).toHaveValue(12.35);
  expect(painted("First")).toHaveLength(0);
  expect(painted("Second")).toHaveLength(0);
});
it("keyboard escalation paints only native rectangle and ordinary caret clears it", /** Checks actual table selection behavior.  @returns Operation result. */ () => {
  const f = fixture(),
    node = required(required(f.boxes[1]).GetParagraphs()[0]);
  act(
    /** Checks actual table selection behavior.  @returns Operation result. */ () => {
      f.edit.SetSelection({ point: { nodeIndex: node.GetIndex(), contentIndex: 0 } });
      f.edit.MoveSectionBoundary(true, true);
    },
  );
  expect(painted("First")).toHaveLength(2);
  expect((f.shell.getShellCursor() as SwTableCursor).GetSelectedBoxes()).toEqual(
    f.boxes.slice(0, 2),
  );
  act(
    /** Checks actual table selection behavior.  @returns Operation result. */ () => {
      f.edit.SetSelection({ point: { nodeIndex: node.GetIndex(), contentIndex: 1 } });
    },
  );
  expect(painted("First")).toHaveLength(0);
  act(
    /** Checks actual table selection behavior.  @returns Operation result. */ () => {
      expect(f.shell.Insert("X")).toBe(true);
    },
  );
  expect(node.GetText()).toBe("CXell1");
  expect(required(f.boxes[0]).GetParagraphs()[0]?.GetText()).toBe("Cell0");
});
it("table properties use native selected rows and preserve other row geometry", /** Checks actual table selection behavior.  @returns Operation result. */ () => {
  const f = fixture();
  selectMountedTableRow("First", 2);
  fireEvent.click(screen.getByRole("button", { name: "Table Properties" }));
  const dialog = screen.getByRole("dialog", { name: "Table Properties" });
  fireEvent.click(within(dialog).getByRole("tab", { name: "Text Flow" }));
  fireEvent.change(within(dialog).getByRole("spinbutton", { name: "Minimum row height (cm)" }), {
    target: { value: "1" },
  });
  fireEvent.click(within(dialog).getByRole("button", { name: "OK" }));
  expect(f.table.GetTabLines()[0]?.GetFormat().frameSize?.GetHeight()).toBeUndefined();
  expect(f.table.GetTabLines()[1]?.GetFormat().frameSize?.GetHeight()).toBe(567);
  expect(painted("First")).toHaveLength(2);
  expect(f.shell.HasBoxSelection()).toBe(true);
});

it("row surface delegates to native selection and caret properties apply to its current row", /** Checks the row hit path and unselected native context. @returns Nothing. */ () => {
  const f = fixture();
  selectMountedTableRow("First", 2);
  expect(painted("First")).toHaveLength(2);
  const node = required(required(f.boxes[0]).GetParagraphs()[0]);
  act(
    /** Places an ordinary actual cursor. @returns Nothing. */ () => {
      f.edit.SetSelection({ point: { nodeIndex: node.GetIndex(), contentIndex: 1 } });
    },
  );
  fireEvent.click(screen.getByRole("button", { name: "Table Properties" }));
  const dialog = screen.getByRole("dialog", { name: "Table Properties" });
  fireEvent.click(within(dialog).getByRole("tab", { name: "Text Flow" }));
  fireEvent.change(within(dialog).getByRole("spinbutton", { name: "Minimum row height (cm)" }), {
    target: { value: "1" },
  });
  fireEvent.click(within(dialog).getByRole("button", { name: "OK" }));
  expect(f.table.GetTabLines()[0]?.GetFormat().frameSize?.GetHeight()).toBe(567);
  expect(f.table.GetTabLines()[1]?.GetFormat().frameSize?.GetHeight()).toBeUndefined();
  expect(painted("First")).toHaveLength(0);
});
it("clicking an already current empty cell focuses the paragraph without a second editing host", /** Checks actual DOM focus while preserving native current point. @returns Nothing. */ () => {
  const f = fixture(),
    node = required(required(f.boxes[0]).GetParagraphs()[0]);
  act(
    /** Places the native first-cell position and clears its text. @returns Nothing. */ () => {
      node.SetText("");
      f.edit.SetSelection({ point: { nodeIndex: node.GetIndex(), contentIndex: 0 } });
    },
  );
  const cell = within(screen.getByRole("table", { name: "First" })).getByLabelText(
    "Row 1 column 1 paragraph 1",
  );
  fireEvent.click(cell);
  expect(cell).toHaveFocus();
  expect(cell).not.toHaveAttribute("contenteditable");
  expect(f.shell.getShellCursor().GetPoint().GetNode()).toBe(node);
  expect(f.shell.getShellCursor().GetPoint().GetContentIndex()).toBe(0);
  expect(f.shell.HasBoxSelection()).toBe(false);
});
