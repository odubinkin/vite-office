/** @fileoverview Checks actual DOM ranges retain native table selection and repeated headline view context. */
import { SwFormatFrameSize, SwFrameSize } from "../../inc/fmtfsize";
import { selectMountedTableRow } from "../../../../test-support/table-mouse-dom";
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, expect, it } from "vitest";
import { createWriterDocumentSession } from "../composition/writer-module";
import { WriterWorkbench } from "../presentation/writer-view";
import { getWriterDomSelection } from "./writer-selection";
import { SwTableCursor } from "../../source/core/crsr/swcrsr";
/** Requires an actual fixture owner. @param value - Resolved owner. @returns Connected owner. */
function required<T>(value: T | null | undefined): T {
  if (value === undefined || value === null) throw new Error("Missing actual fixture owner");
  return value;
}
const sessions: ReturnType<typeof createWriterDocumentSession>[] = [];
afterEach(
  /** Releases DOM before actual shells. @returns Nothing. */ () => {
    cleanup();
    for (const s of sessions.splice(0)) s.Close();
  },
);
/** Creates actual multi-page table and mounted editor. @returns Native owners. */
function fixture() {
  const session = createWriterDocumentSession();
  sessions.push(session);
  const doc = session.docShell.GetDoc(),
    shell = session.view.GetWrtShell(),
    body = required(doc.paragraphs[0]);
  body.SetText("Before");
  const table = doc.nodes.MakeTableNode(
    "Select",
    { headerRows: 1, repeatHeaderRows: true, width: 4000 },
    body,
  );
  table.AddColumnWidth(2000);
  table.AddColumnWidth(2000);
  const nodes = [];
  for (let row = 0; row < 4; row++)
    for (const box of doc.nodes
      .AppendTableRow(table, 2, { frameSize: new SwFormatFrameSize(SwFrameSize.Minimum, 0, 300) })
      .GetTabBoxes()) {
      const node = required(box.GetParagraphs()[0]);
      node.SetText("Cell" + nodes.length);
      nodes.push(node);
    }
  const after = doc.nodes.MakeTextNode("After");
  shell.SetPageDescriptor({
    ...doc.GetPageDesc().GetValue(),
    height: 1000,
    topMargin: 100,
    bottomMargin: 100,
    width: 6000,
    leftMargin: 100,
    rightMargin: 100,
  });
  shell.FocusNode(body);
  doc.GetUndoManager().Clear();
  const mounted = render(
    <WriterWorkbench
      isActive
      view={session.view}
      fileDialogs={session.fileDialogs}
      services={session.services}
    />,
  );
  return { doc, shell, table, nodes, body, after, mounted };
}
/** Resolves original or follow cell occurrence. @param row - Source row. @param col - Source column. @param copy - Occurrence. @returns Mounted text owner. */
function cell(row: number, col = 1, copy = 0) {
  return required(
    screen.getAllByRole("textbox", { name: `Row ${row} column ${col} paragraph 1` })[copy],
  );
}
/** Installs actual direction-preserving DOM endpoints. @param mark - Fixed paragraph. @param point - Moving paragraph. @param fixed - Fixed offset. @param moving - Moving offset. @returns Nothing. */
function select(mark: HTMLElement, point: HTMLElement, fixed = 1, moving = 2) {
  const a = required(document.createTreeWalker(mark, NodeFilter.SHOW_TEXT).nextNode()),
    b = required(document.createTreeWalker(point, NodeFilter.SHOW_TEXT).nextNode());
  window.getSelection()?.setBaseAndExtent(a, fixed, b, moving);
  fireEvent(document, new Event("selectionchange"));
}
it.each([false, true])(
  "activates actual native rectangle from DOM reverse=%s",
  /** Checks actual kernel ownership rather than display state. @param reverse - Direction. @returns Nothing. */ (
    reverse,
  ) => {
    const f = fixture();
    select(reverse ? cell(2, 2) : cell(1), reverse ? cell(1) : cell(2, 2));
    const cursor = f.shell.getShellCursor();
    expect(cursor).toBeInstanceOf(SwTableCursor);
    expect(cursor.GetPoint().GetNode()).toBe(f.nodes[reverse ? 0 : 3]);
    expect(cursor.GetMark().GetNode()).toBe(f.nodes[reverse ? 3 : 0]);
    expect(
      f.mounted.container.querySelectorAll('[data-writer-editor-selected="true"]'),
    ).toHaveLength(4);
    for (const row of f.mounted.container.querySelectorAll(
      '[data-writer-repeated-headline="true"]',
    )) {
      expect(row).toHaveAttribute("aria-selected", "false");
      expect(row.querySelector("[data-writer-editor-selected]")).toBeNull();
      expect(row.querySelector(".bg-indigo-50")).toBeNull();
    }
    expect(f.doc.GetUndoManager().GetUndoActionCount()).toBe(0);
  },
);
it.each(["point", "mark"] as const)(
  "rejects actual repeated headline %s cross-cell hit without losing native node identity",
  /** Checks DOM metadata reaches existing edit window. @param end - Repeated endpoint. @returns Nothing. */ (
    end,
  ) => {
    const f = fixture(),
      mark = end === "mark" ? cell(1, 1, 1) : cell(3),
      point = end === "point" ? cell(1, 1, 1) : cell(3);
    select(mark, point);
    expect(f.shell.HasBoxSelection()).toBe(false);
    expect(f.shell.GetCursor().HasMark()).toBe(false);
    expect(f.shell.GetCursor().GetPoint().GetNode()).toBe(f.nodes[end === "mark" ? 0 : 4]);
    expect(f.shell.GetCursor().GetPoint().GetContentIndex()).toBe(1);
    expect(
      f.mounted.container.querySelectorAll('[data-writer-editor-selected="true"]'),
    ).toHaveLength(0);
    expect(f.doc.GetUndoManager().GetUndoActionCount()).toBe(0);
  },
);
it("paints only original selected headline boxes from the existing row gutter", /** Checks native FillRects split-cell traversal does not include repeated rows. @returns Nothing. */ () => {
  const f = fixture();
  selectMountedTableRow("Select", 1);
  expect((f.shell.getShellCursor() as SwTableCursor).GetSelectedBoxes()).toEqual(
    required(f.table.GetTabLines()[0]).GetTabBoxes(),
  );
  expect(f.mounted.container.querySelectorAll('[data-writer-editor-selected="true"]')).toHaveLength(
    2,
  );
  const rows = [...f.mounted.container.querySelectorAll('tr[data-writer-table-row="0"]')];
  expect(rows).toHaveLength(3);
  expect(rows[0]).toHaveAttribute("aria-selected", "true");
  for (const row of rows.slice(1)) {
    expect(row).toHaveAttribute("aria-selected", "false");
    expect(row.querySelector("[data-writer-editor-selected]")).toBeNull();
  }
});
it("edits a same-cell follow range through original history without creating a table cursor", /** Checks actual repeated view flag preserves ordinary editing and UndoRedo. @returns Nothing. */ () => {
  const f = fixture(),
    follow = cell(1, 1, 1),
    node = required(f.nodes[0]);
  select(follow, follow, 1, 3);
  expect(getWriterDomSelection(window.getSelection())?.point.inRepeatedHeadline).toBe(true);
  expect(f.shell.HasBoxSelection()).toBe(false);
  const event = new InputEvent("beforeinput", {
    bubbles: true,
    cancelable: true,
    inputType: "insertText",
    data: "X",
  });
  act(
    /** Sends actual root intent. @returns Nothing. */ () => {
      follow.dispatchEvent(event);
    },
  );
  expect(event.defaultPrevented).toBe(true);
  expect(node.GetText()).toBe("CXl0");
  for (const copy of screen.getAllByRole("textbox", { name: "Row 1 column 1 paragraph 1" }))
    expect(copy).toHaveTextContent("CXl0");
  act(
    /** Undoes through actual native owner. @returns Nothing. */ () => {
      expect(f.shell.Undo()).toBe(true);
    },
  );
  expect(node.GetText()).toBe("Cell0");
  act(
    /** Redoes through actual native owner. @returns Nothing. */ () => {
      expect(f.shell.Redo()).toBe(true);
    },
  );
  expect(node.GetText()).toBe("CXl0");
  expect(f.body.GetText()).toBe("Before");
  expect(f.after.GetText()).toBe("After");
});
it("reads ordinary table-frame geometry and formats the actual selected original column", /** Checks final DOM classification and native editing-ring ownership. @returns Nothing. */ () => {
  const f = fixture();
  select(cell(1), cell(2));
  expect(getWriterDomSelection(window.getSelection())?.point.inRepeatedHeadline).toBe(false);
  expect(f.shell.HasBoxSelection()).toBe(true);
  const event = new InputEvent("beforeinput", {
    bubbles: true,
    cancelable: true,
    inputType: "formatBold",
  });
  act(
    /** Routes actual format through frame-aware edit window. @returns Nothing. */ () => {
      cell(2).dispatchEvent(event);
    },
  );
  expect(event.defaultPrevented).toBe(true);
  for (const copy of screen.getAllByRole("textbox", { name: "Row 1 column 1 paragraph 1" }))
    expect(copy.querySelector("strong")).toHaveTextContent("Cell0");
  expect(cell(2).querySelector("strong")).toHaveTextContent("Cell2");
  expect(cell(1, 2).querySelector("strong")).toBeNull();
  expect(cell(2, 2).querySelector("strong")).toBeNull();
  act(
    /** Undoes actual column formatting. @returns Nothing. */ () => {
      expect(f.shell.Undo()).toBe(true);
    },
  );
  expect(cell(2).querySelector("strong")).toBeNull();
  expect(f.body.GetText()).toBe("Before");
});
it("reduces a live native row cursor when the actual moving view hit enters a repeated headline", /** Checks final frame-aware existing-table branch preserves fixed native mark cell. @returns Nothing. */ () => {
  const f = fixture();
  selectMountedTableRow("Select", 3);
  const fixed = f.shell.getShellCursor().GetMark().GetNode(),
    offset = f.shell.getShellCursor().GetMark().GetContentIndex();
  select(cell(3, 2), cell(1, 1, 1));
  expect(f.shell.HasBoxSelection()).toBe(false);
  const cursor = f.shell.getShellCursor();
  expect(cursor.GetPoint().GetNode()).toBe(fixed);
  expect(cursor.GetPoint().GetContentIndex()).toBe(0);
  expect(cursor.GetMark().GetNode()).toBe(fixed);
  expect(cursor.GetMark().GetContentIndex()).toBe(offset);
  expect(f.mounted.container.querySelector("[data-writer-editor-selected]")).toBeNull();
  expect(f.doc.GetUndoManager().GetUndoActionCount()).toBe(0);
});
it("deletes a same-cell follow text range through one original node and real history", /** Checks final repeated same-box UpdateCursor admission and deletion independently of typing. @returns Nothing. */ () => {
  const f = fixture(),
    follow = cell(1, 1, 1);
  select(follow, follow, 0, 1);
  const event = new InputEvent("beforeinput", {
    bubbles: true,
    cancelable: true,
    inputType: "deleteContentForward",
  });
  act(
    /** Sends actual same-box deletion. @returns Nothing. */ () => {
      follow.dispatchEvent(event);
    },
  );
  expect(f.shell.HasBoxSelection()).toBe(false);
  expect(f.nodes[0]?.GetText()).toBe("ell0");
  for (const copy of screen.getAllByRole("textbox", { name: "Row 1 column 1 paragraph 1" }))
    expect(copy).toHaveTextContent("ell0");
  act(
    /** Restores original shared headline. @returns Nothing. */ () => {
      expect(f.shell.Undo()).toBe(true);
    },
  );
  expect(f.nodes[0]?.GetText()).toBe("Cell0");
  expect(f.nodes[1]?.GetText()).toBe("Cell1");
});
it("replaces ordinary body text adjacent to the table without supplying table-frame geometry", /** Checks final source position translation distinguishes body and actual cell frames. @returns Nothing. */ () => {
  const f = fixture(),
    body = screen.getByRole("textbox", { name: "Writer document text" });
  select(body, body, 1, 2);
  expect(getWriterDomSelection(window.getSelection())?.point.inRepeatedHeadline).toBeUndefined();
  const event = new InputEvent("beforeinput", {
    bubbles: true,
    cancelable: true,
    inputType: "insertText",
    data: "X",
  });
  act(
    /** Sends actual body input. @returns Nothing. */ () => {
      body.dispatchEvent(event);
    },
  );
  expect(f.body.GetText()).toBe("BXfore");
  expect(f.shell.HasBoxSelection()).toBe(false);
  expect(
    f.nodes.map(
      /** Reads original cells after body edit. @param node - Cell owner. @returns Text. */ (
        node,
      ) => node.GetText(),
    ),
  ).toEqual(["Cell0", "Cell1", "Cell2", "Cell3", "Cell4", "Cell5", "Cell6", "Cell7"]);
  act(
    /** Undoes actual body replacement. @returns Nothing. */ () => {
      expect(f.shell.Undo()).toBe(true);
    },
  );
  expect(f.body.GetText()).toBe("Before");
});
