/** @fileoverview Checks real native table flow slots, selection admission, typed requests, history and ODT. */
import { afterEach, expect, it, vi } from "vitest";
import { createWriterDocumentSession } from "../../../browser/composition/writer-module";
import { SwTabFrame } from "../../core/layout/tabfrm";
import { SwPosition } from "../../core/crsr/pam";
import { SwTableCursor } from "../../core/crsr/swcrsr";
import { SwFormatFrameSize, SwFrameSize } from "../../../inc/fmtfsize";
import { SwFormatRowSplit } from "../../../inc/fmtrowsplt";
import { SfxBoolItem } from "../../../../svl/source/items/cenumitm";
import { getWriterSlotId } from "../../../sdi/swriter";
import { VertOrientation as V } from "../../../../offapi/com/sun/star/text/VertOrientation";
import { writeOdtDocument } from "../../filter/xml/wrtxml";
import { readOdtDocument } from "../../filter/xml/swxml";

const sessions: ReturnType<typeof createWriterDocumentSession>[] = [];
afterEach(
  /** Closes original native frames. @returns Nothing. */ () => {
    for (const session of sessions.splice(0)) session.Close();
  },
);
/** Requires an original owner. @param value - Optional owner. @returns Owner. */
function required<T>(value: T | undefined): T {
  if (value === undefined) throw new Error("Missing flow fixture owner");
  return value;
}
/** Builds a real frame with three independent table rows. @returns Original owners and cursor port. */
function fixture() {
  const session = createWriterDocumentSession();
  sessions.push(session);
  const shell = session.view.GetWrtShell(),
    doc = shell.GetDoc();
  const table = doc.nodes.MakeTableNode("Flow", {
    width: 6000,
    headerRows: 0,
    repeatHeaderRows: false,
  });
  table.AddColumnWidth(3000);
  table.AddColumnWidth(3000);
  for (let r = 0; r < 3; r++) doc.nodes.AppendTableRow(table, 2);
  const rows = table.GetTabLines(),
    boxes = rows.flatMap(
      /** Retains original box owners. @param row - Original row. @returns Boxes. */ (row) =>
        row.GetTabBoxes(),
    );
  /** Moves the original cursor without fabricating selected boxes. @param index - Flattened box index. @returns Nothing. */
  function move(index: number) {
    const position = new SwPosition(required(required(boxes[index]).GetParagraphs()[0]), 0);
    shell.SetCursor(position);
    position.Dispose();
  }
  move(0);
  doc.GetUndoManager().Clear();
  return { session, view: session.view, shell, doc, table, rows, boxes, move };
}

it.each([
  ["CellVertTop", V.NONE],
  ["CellVertCenter", V.CENTER],
  ["CellVertBottom", V.BOTTOM],
] as const)(
  "dispatches %s through actual selected cell owners and preserves history",
  /** Checks Boolean state and cell scope independently of table formatting. @param name - Slot. @param alignment - Native enum. @returns Nothing. */
  (name, alignment) => {
    const f = fixture();
    f.shell.SetBoxAlign(V.TOP);
    f.doc.GetUndoManager().Clear();
    const cursor = f.shell.CaptureCursorState();
    expect(f.view.Execute(`.uno:${name}`)).toMatchObject({ status: "executed", value: true });
    expect(f.shell.GetBoxAlign()).toBe(alignment);
    expect(f.view.QueryState(`.uno:${name}`)).toMatchObject({ enabled: true, checked: true });
    expect(required(f.boxes[1]).GetFrameFormat().GetVertOrient().GetVertOrient()).toBe(V.NONE);
    expect(f.shell.CaptureCursorState()).toEqual(cursor);
    expect(f.shell.Undo()).toBe(true);
    expect(f.shell.GetBoxAlign()).toBe(V.TOP);
    expect(f.shell.Redo()).toBe(true);
    expect(f.shell.GetBoxAlign()).toBe(alignment);
    f.shell.SelTable();
    if (alignment !== V.NONE) {
      expect(f.shell.GetBoxAlign()).toBe(65535);
      for (const id of ["CellVertTop", "CellVertCenter", "CellVertBottom"])
        expect(f.view.QueryState(`.uno:${id}`)).toMatchObject({ checked: false });
    }
  },
);
it("resets complete Fixed/Minimum row-size items and leaves Variable disabled", /** Checks native default item and mixed-state admission. @returns Nothing. */ () => {
  const f = fixture();
  expect(f.view.QueryState(".uno:SetMinimalRowHeight").enabled).toBe(false);
  for (const type of [SwFrameSize.Fixed, SwFrameSize.Minimum]) {
    const before = new SwFormatFrameSize(type, 500, 900);
    before.SetWidthPercent(50);
    f.shell.SetRowHeight(before);
    f.doc.GetUndoManager().Clear();
    expect(f.view.QueryState(".uno:SetMinimalRowHeight").enabled).toBe(true);
    expect(f.view.Execute(".uno:SetMinimalRowHeight")).toMatchObject({ value: true });
    expect(f.shell.GetRowHeight()?.equals(new SwFormatFrameSize())).toBe(true);
    expect(f.shell.Undo()).toBe(true);
    expect(f.shell.GetRowHeight()?.equals(before)).toBe(true);
    expect(f.shell.Redo()).toBe(true);
    expect(f.shell.GetRowHeight()?.equals(new SwFormatFrameSize())).toBe(true);
  }
  f.shell.SetRowHeight(new SwFormatFrameSize(SwFrameSize.Fixed, 0, 900));
  f.shell.SelTable();
  expect(f.shell.GetRowHeight()).toBeUndefined();
  expect(f.view.QueryState(".uno:SetMinimalRowHeight").enabled).toBe(true);
  expect(f.view.Execute(".uno:SetMinimalRowHeight")).toMatchObject({ value: true });
  expect(f.view.QueryState(".uno:SetMinimalRowHeight").enabled).toBe(false);
});
it("toggles common row split, defaults mixed rows to true and consumes only the native explicit item", /** Checks original row selection, typed slot identity and table-level admission. @returns Nothing. */ () => {
  const f = fixture(),
    slot = getWriterSlotId(".uno:RowSplit");
  expect(f.view.QueryState(".uno:RowSplit")).toMatchObject({
    enabled: true,
    checked: true,
    mixed: false,
  });
  expect(f.view.Execute(".uno:RowSplit")).toMatchObject({ value: true });
  expect(f.shell.GetRowSplit()?.GetValue()).toBe(false);
  expect(f.shell.Undo()).toBe(true);
  expect(f.shell.GetRowSplit()?.GetValue()).toBe(true);
  expect(f.shell.Redo()).toBe(true);
  expect(f.shell.GetRowSplit()?.GetValue()).toBe(false);
  f.shell.SelTable();
  expect(f.view.QueryState(".uno:RowSplit")).toMatchObject({
    checked: false,
    mixed: true,
    value: undefined,
  });
  expect(f.view.Execute(".uno:RowSplit")).toMatchObject({ value: true });
  expect(f.shell.GetRowSplit()?.GetValue()).toBe(true);
  expect(f.view.Execute(".uno:RowSplit", [new SfxBoolItem(slot, true)])).toMatchObject({
    value: true,
  });
  expect(f.shell.GetRowSplit()?.GetValue()).toBe(true);
  f.view.Execute(".uno:RowSplit", [new SfxBoolItem(slot, false)]);
  expect(f.shell.GetRowSplit()?.GetValue()).toBe(false);
  f.view.Execute(".uno:RowSplit", [new SfxBoolItem(slot + 1, false)]);
  expect(f.shell.GetRowSplit()?.GetValue()).toBe(true);
  expect(f.view.QueryState(".uno:RowSplit").value).toBeInstanceOf(SwFormatRowSplit);
  f.shell.SetTableAttr({ layoutSplit: false });
  expect(f.view.QueryState(".uno:RowSplit").enabled).toBe(false);
  expect(f.view.Execute(".uno:RowSplit").status).toBe("disabled");
});
it("admits a top-row prefix in both cursor directions and toggles existing headings from a later row", /** Checks native count rather than browser Boolean arguments. @returns Nothing. */ () => {
  const f = fixture();
  expect(f.shell.GetRowsToRepeat()).toBe(0);
  expect(f.shell.GetRowSelectionFromTop()).toBe(1);
  const before = f.shell.CaptureCursorState();
  f.view.Execute(".uno:HeadingRowsRepeat", [
    new SfxBoolItem(getWriterSlotId(".uno:HeadingRowsRepeat"), false),
  ]);
  expect(f.shell.GetRowsToRepeat()).toBe(1);
  expect(f.shell.CaptureCursorState()).toEqual(before);
  expect(f.shell.Undo()).toBe(true);
  expect(f.shell.GetRowsToRepeat()).toBe(0);
  expect(f.shell.Redo()).toBe(true);
  expect(f.shell.GetRowsToRepeat()).toBe(1);
  f.move(4);
  expect(f.shell.GetRowSelectionFromTop()).toBe(0);
  expect(f.view.QueryState(".uno:HeadingRowsRepeat")).toMatchObject({
    enabled: true,
    checked: true,
  });
  f.view.Execute(".uno:HeadingRowsRepeat");
  expect(f.shell.GetRowsToRepeat()).toBe(0);
  expect(f.view.QueryState(".uno:HeadingRowsRepeat").enabled).toBe(false);
  f.shell.SelTable();
  expect(f.shell.getShellCursor()).toBeInstanceOf(SwTableCursor);
  expect(f.shell.GetRowSelectionFromTop()).toBe(3);
  f.shell.getShellCursor().Exchange();
  expect(f.shell.GetRowSelectionFromTop()).toBe(3);
  f.view.Execute(".uno:HeadingRowsRepeat");
  expect(f.shell.GetRowsToRepeat()).toBe(3);
});
it("ordinary marks do not extend headline selection and table rows below the top stay disabled", /** Checks native ordinary versus table cursor contract. @returns Nothing. */ () => {
  const f = fixture();
  f.move(2);
  f.shell.getShellCursor().SetMark();
  const mark = f.shell.getShellCursor().GetMark();
  mark.Assign(required(required(f.boxes[0]).GetParagraphs()[0]), 0);
  expect(f.shell.IsTableMode()).toBe(false);
  expect(f.shell.GetRowSelectionFromTop()).toBe(0);
  f.shell.ClearMark();
  f.shell.SelTableRow();
  expect(f.shell.GetRowSelectionFromTop()).toBe(0);
  expect(f.view.QueryState(".uno:HeadingRowsRepeat").enabled).toBe(false);
});
it("preserves connected alignment, headline and row-flow commands through ordinary ODT export/import", /** Checks actual I/O without adding a parallel property model. @returns Completion. */ async () => {
  const f = fixture();
  f.shell.SelTable();
  f.view.Execute(".uno:CellVertBottom");
  f.view.Execute(".uno:HeadingRowsRepeat");
  f.view.Execute(".uno:RowSplit", [new SfxBoolItem(getWriterSlotId(".uno:RowSplit"), false)]);
  f.shell.SetRowHeight(new SwFormatFrameSize(SwFrameSize.Fixed, 0, 900));
  f.view.Execute(".uno:SetMinimalRowHeight");
  const opened = await readOdtDocument(
    await writeOdtDocument(f.doc, f.session.docShell.GetDocumentState()),
    { title: "Flow" },
  );
  try {
    const table = required(opened.document.GetTables()[0]);
    expect(table.GetRowsToRepeat()).toBe(3);
    for (const row of table.GetTabLines()) {
      expect(row.GetFrameFormat().GetRowSplit().GetValue()).toBe(false);
      expect(row.GetFrameFormat().GetFrameSize().GetHeightSizeType()).toBe(SwFrameSize.Variable);
      for (const box of row.GetTabBoxes())
        expect(box.GetFrameFormat().GetVertOrient().GetVertOrient()).toBe(V.BOTTOM);
    }
  } finally {
    opened.document.Dispose();
  }
});

it("clears contextual flow commands on the original body cursor without adding history", /** Checks ordinary table exit and core headline query sentinels. @returns Nothing. */ () => {
  const f = fixture(),
    body = required(f.doc.paragraphs[0]),
    point = new SwPosition(body, 0);
  f.shell.SetCursor(point);
  point.Dispose();
  expect(f.shell.GetRowsToRepeat()).toBe(0);
  expect(f.shell.GetRowSelectionFromTop()).toBe(0);
  for (const command of [
    "CellVertTop",
    "CellVertCenter",
    "CellVertBottom",
    "SetMinimalRowHeight",
    "HeadingRowsRepeat",
    "RowSplit",
  ])
    expect(f.view.QueryState(`.uno:${command}`).enabled).toBe(false);
  expect(f.doc.GetUndoManager().GetUndoActionCount()).toBe(0);
});

it("does not infer a heading prefix when the native cell-frame graph is unavailable", /** Checks source layout admission without guessing a model row. @returns Nothing. */ () => {
  const f = fixture(),
    unavailable = vi.spyOn(SwTabFrame.prototype, "Lower").mockReturnValue(undefined);
  try {
    expect(f.shell.GetRowSelectionFromTop()).toBe(0);
    expect(f.view.QueryState(".uno:HeadingRowsRepeat").enabled).toBe(false);
    expect(f.doc.GetUndoManager().GetUndoActionCount()).toBe(0);
  } finally {
    unavailable.mockRestore();
  }
});
