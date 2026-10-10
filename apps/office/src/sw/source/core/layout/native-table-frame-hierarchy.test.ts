/** @fileoverview Verifies native table hierarchy, layout inheritance, original linked ownership and deterministic destruction. */
import { expect, it, vi } from "vitest";
import { SwDoc } from "../doc/doc";
import { SwTableLine } from "../table/swtable";
import { SwFrame, SwLayoutFrame, SwFrameType } from "./wsfrm";
import { SwTabFrame, SwRowFrame, SwCellFrame } from "./tabfrm";
import { SwFormatFrameSize, SwFrameSize } from "../../../inc/fmtfsize";
import { MoveTableLineHint, MoveTableBoxHint } from "../../../inc/hints";
import type { SwModify } from "../../../inc/calbck";
import { HoriOrientation } from "../../../../offapi/com/sun/star/text/HoriOrientation";
import { SwTableRep } from "../../uibase/table/swtablerep";
import { CheckSplitCells } from "../frmedt/tblsel";
import { SwPosition } from "../crsr/pam";
import { createWriterDocumentSession } from "../../../browser/composition/writer-module";
import { createSwPageFrames } from "./newfrm";
import { createDefaultWriterPageDescriptor } from "./pagedesc";
/** Requires an original fixture owner. @param value - Optional owner. @returns Original owner. */
function required<T>(value: T | undefined): T {
  if (value === undefined) throw Error("Missing table hierarchy owner");
  return value;
}
/** Reads original registered clients without modifying their registration. @param format - Native broadcaster. @returns Original clients. */
function clients(format: SwModify): unknown[] {
  const result: unknown[] = [];
  format.ForAllListeners(
    /** Records native identity. @param client - Registered client. @returns Continue flag. */ (
      client,
    ) => {
      result.push(client);
      return false;
    },
  );
  return result;
}
/** Builds the actual native table graph. @returns Original table, rows, boxes and document. */
function fixture() {
  const doc = new SwDoc(),
    table = doc.nodes.MakeTableNode("Physical", { width: 4000, horiOrient: HoriOrientation.FULL });
  table.AddColumnWidth(1000);
  table.AddColumnWidth(3000);
  const first = doc.nodes.AppendTableRow(table, 2),
    second = doc.nodes.AppendTableRow(table, 2);
  return {
    doc,
    table,
    first,
    second,
    box: required(first.GetTabBoxes()[0]),
    peer: required(first.GetTabBoxes()[1]),
  };
}
it("native table frame registers its original format and owns the exact row/cell sibling hierarchy", /** Checks independent original pointers and recursive teardown. @returns Nothing. */ () => {
  const f = fixture(),
    baseline = clients(f.box.GetFrameFormat()),
    frame = new SwTabFrame(f.table);
  const first = required(frame.Lower()) as SwRowFrame,
    second = required(first.GetNext()) as SwRowFrame,
    a = required(first.Lower()) as SwCellFrame,
    b = required(a.GetNext()) as SwCellFrame;
  expect(frame).toBeInstanceOf(SwLayoutFrame);
  expect(frame).toBeInstanceOf(SwFrame);
  expect(frame.GetType()).toBe(0x0800);
  expect(SwFrameType.Tab).toBe(0x0800);
  expect(frame.GetTable()).toBe(f.table);
  expect(frame.GetFormat()).toBe(f.table.GetFrameFormat());
  expect(frame.GetRegisteredIn()).toBe(f.table.GetFrameFormat());
  expect(clients(f.table.GetFrameFormat())).toContain(frame);
  expect(first.GetTabLine()).toBe(f.first);
  expect(second.GetTabLine()).toBe(f.second);
  expect(first.GetUpper()).toBe(frame);
  expect(second.GetUpper()).toBe(frame);
  expect(first.GetPrev()).toBeUndefined();
  expect(second.GetPrev()).toBe(first);
  expect(second.GetNext()).toBeUndefined();
  expect(a.GetTabBox()).toBe(f.box);
  expect(b.GetTabBox()).toBe(f.peer);
  expect(a.GetUpper()).toBe(first);
  expect(b.GetPrev()).toBe(a);
  expect(a.GetFormat()).toBe(f.box.GetFrameFormat());
  expect(clients(f.box.GetFrameFormat())).toEqual([...baseline, a]);
  frame.Dispose();
  expect(frame.Lower()).toBeUndefined();
  expect(frame.GetRegisteredIn()).toBeUndefined();
  expect(clients(f.table.GetFrameFormat())).not.toContain(frame);
  for (const lower of [first, second, a, b]) {
    expect(lower.GetRegisteredIn()).toBeUndefined();
    expect(lower.GetUpper()).toBeUndefined();
    expect(lower.GetPrev()).toBeUndefined();
    expect(lower.GetNext()).toBeUndefined();
  }
  expect(clients(f.box.GetFrameFormat())).toEqual(baseline);
  expect(clients(f.first.GetFrameFormat())).toEqual([f.first]);
  frame.Dispose();
});
it("native table constructor destroys empty physical rows and links remaining original rows", /** Checks native empty-lower admission without replacing the model. @returns Nothing. */ () => {
  const f = fixture(),
    empty = new SwTableLine(f.doc.MakeTableLineFormat());
  f.table.AddLine(empty, 1);
  const frame = new SwTabFrame(f.table);
  try {
    const first = required(frame.Lower()) as SwRowFrame,
      second = required(first.GetNext()) as SwRowFrame;
    expect(first.GetTabLine()).toBe(f.first);
    expect(second.GetTabLine()).toBe(f.second);
    expect(second.GetNext()).toBeUndefined();
    expect(clients(empty.GetFrameFormat())).toEqual([empty]);
    expect(f.table.GetTabLines()).toEqual([f.first, empty, f.second]);
  } finally {
    frame.DestroyImpl();
  }
  const doc = new SwDoc(),
    table = doc.nodes.MakeTableNode("Empty"),
    only = new SwTableLine(doc.MakeTableLineFormat());
  table.AddLine(only);
  const none = new SwTabFrame(table);
  expect(none.Lower()).toBeUndefined();
  expect(none.GetTable()).toBe(table);
  none.DestroyImpl();
});
it("width queries borrow linked physical cell formats without allocating another cell client", /** Checks current native claims, exact width scaling and registration counts. @returns Nothing. */ () => {
  const f = fixture();
  f.peer.ChgFrameFormat(f.box.GetFrameFormat());
  const frame = new SwTabFrame(f.table),
    row = required(frame.Lower()) as SwRowFrame,
    cell = required(row.Lower()) as SwCellFrame;
  try {
    const old = f.box.GetFrameFormat(),
      next = f.box.ClaimFrameFormat();
    expect(next).not.toBe(old);
    expect(cell.GetFormat()).toBe(next);
    expect(cell.GetUpper()).toBe(row);
    expect(row.GetUpper()).toBe(frame);
    next.SetFormatAttr(new SwFormatFrameSize(SwFrameSize.Variable, 500, 0));
    const count = clients(next);
    expect(frame.GetBoxPrintWidth(f.box, 8000)).toBe(1000);
    expect(frame.GetBoxPrintWidth(f.box, 8000)).toBe(1000);
    expect(clients(next)).toEqual(count);
    const lower = required(row.GetNext()) as SwRowFrame,
      box = required(f.second.GetTabBoxes()[1]);
    box.ClaimFrameFormat().SetFormatAttr(new SwFormatFrameSize(SwFrameSize.Variable, 1500, 0));
    expect(frame.GetBoxPrintWidth(box, 8000)).toBe(3000);
    expect(lower.GetUpper()).toBe(frame);
    const foreign = f.doc.nodes.MakeTableNode("Foreign");
    foreign.AddColumnWidth(2000);
    const foreignBox = required(f.doc.nodes.AppendTableRow(foreign, 1).GetTabBoxes()[0]);
    expect(frame.GetBoxPrintWidth(foreignBox, 8000)).toBe(0);
    const zero = f.doc.nodes.MakeTableNode("Zero", { width: 0, horiOrient: HoriOrientation.FULL });
    zero.AddColumnWidth(3000);
    const zeroBox = required(f.doc.nodes.AppendTableRow(zero, 1).GetTabBoxes()[0]),
      zeroFrame = new SwTabFrame(zero);
    try {
      expect(zeroFrame.GetBoxPrintWidth(zeroBox, 8000)).toBe(0);
    } finally {
      zeroFrame.DestroyImpl();
    }
    f.peer.ClaimFrameFormat().SetFormatAttr(new SwFormatFrameSize(SwFrameSize.Variable, 3500, 0));
    f.table.SetFormat({ horiOrient: HoriOrientation.FULL });
    expect(frame.GetBoxPrintWidth(f.box, 8000)).toBe(1000);
  } finally {
    frame.DestroyImpl();
  }
});
it("row and cell format history retarget original linked frames without detaching their parents", /** Checks real replacement and native move notifications. @returns Nothing. */ () => {
  const f = fixture(),
    frame = new SwTabFrame(f.table),
    row = required(frame.Lower()) as SwRowFrame,
    cell = required(row.Lower()) as SwCellFrame;
  try {
    const oldRow = f.first.GetFrameFormat(),
      newRow = f.doc.MakeTableLineFormat(),
      restoredRow = f.doc.MakeTableLineFormat();
    restoredRow.SetFormatAttr(oldRow.GetFrameSize());
    f.first.ChgFrameFormat(newRow);
    expect(row.GetFormat()).toBe(newRow);
    expect(row.GetUpper()).toBe(frame);
    newRow.CallSwClientNotify(new MoveTableLineHint(restoredRow, f.first));
    expect(row.GetFormat()).toBe(restoredRow);
    expect(row.Lower()).toBe(cell);
    const oldBox = f.box.GetFrameFormat(),
      newBox = f.doc.MakeTableBoxFormat(),
      restoredBox = f.doc.MakeTableBoxFormat();
    restoredBox.SetFormatAttr(oldBox.GetFrameSize());
    f.box.ChgFrameFormat(newBox);
    expect(cell.GetFormat()).toBe(newBox);
    expect(cell.GetUpper()).toBe(row);
    newBox.CallSwClientNotify(new MoveTableBoxHint(restoredBox, f.box));
    expect(cell.GetFormat()).toBe(restoredBox);
    expect(cell.GetUpper()).toBe(row);
  } finally {
    frame.DestroyImpl();
  }
});
it("page-flow exceptions release complete temporary table registration and native lower clients", /** Checks the real formatting exception path. @returns Nothing. */ () => {
  const f = fixture(),
    format = f.table.GetFrameFormat(),
    rowFormat = f.first.GetFrameFormat(),
    boxFormat = f.box.GetFrameFormat(),
    before = [clients(format), clients(rowFormat), clients(boxFormat)],
    descriptor = {
      ...createDefaultWriterPageDescriptor("en-US").GetValue(),
      height: 600,
      topMargin: 100,
      bottomMargin: 100,
    };
  expect(
    /** Runs original pagination with an unavailable native follow style. @returns Native pages. */ () =>
      createSwPageFrames(
        [],
        {
          initialName: descriptor.name,
          descriptors: [{ value: descriptor, followName: "Missing" }],
        },
        undefined,
        [
          {
            table: f.table,
            tableName: f.table.GetName(),
            afterParagraphIndex: -1,
            rowHeights: [500, 500],
          },
        ],
      ),
  ).toThrow("Writer layout follow page descriptor is missing.");
  expect([clients(format), clients(rowFormat), clients(boxFormat)]).toEqual(before);
});

it("native dialog geometry handles unconnected declarations and releases connected table clients", /** Checks literal default columns and real native formatting lifetime. @returns Nothing. */ () => {
  const doc = new SwDoc(),
    table = doc.nodes.MakeTableNode("Draft");
  table.AddColumnWidth(1000);
  table.AddColumnWidth(3000);
  const draft = new SwTableRep(table, 8000);
  expect(draft.width).toBe(8000);
  expect(draft.columns).toEqual([
    { nWidth: 1000, bVisible: true },
    { nWidth: 3000, bVisible: true },
  ]);
  const row = doc.nodes.AppendTableRow(table, 2),
    before = clients(row.GetFrameFormat()),
    connected = new SwTableRep(table, 8000);
  expect(connected.width).toBe(8000);
  expect(connected.columns).toEqual([
    { nWidth: 2000, bVisible: true },
    { nWidth: 6000, bVisible: true },
  ]);
  expect(clients(row.GetFrameFormat())).toEqual(before);
  expect(clients(table.GetFrameFormat())).toEqual([table]);
});
it("native split admission rejects invalid divisions, absent selection and empty physical print width", /** Checks actual shell guards and temporary native-frame release. @returns Nothing. */ () => {
  const session = createWriterDocumentSession(),
    doc = session.docShell.GetDoc(),
    shell = session.view.GetWrtShell();
  try {
    for (const divisions of [0, 1, 1.5, NaN]) expect(CheckSplitCells(shell, divisions)).toBe(false);
    expect(CheckSplitCells(shell, 2)).toBe(false);
    const table = doc.nodes.MakeTableNode("Split");
    table.AddColumnWidth(3000);
    const row = doc.nodes.AppendTableRow(table, 1),
      box = required(row.GetTabBoxes()[0]),
      position = new SwPosition(required(box.GetParagraphs()[0]), 0);
    shell.SetCursor(position);
    position.Dispose();
    const selection = vi.spyOn(shell, "GetTableSel").mockReturnValue([]);
    expect(CheckSplitCells(shell, 2)).toBe(false);
    selection.mockRestore();
    const page = doc.GetPageDesc(),
      value = page.GetValue(),
      geometry = vi
        .spyOn(page, "GetValue")
        .mockReturnValue({ ...value, width: 0, leftMargin: 0, rightMargin: 0 });
    expect(CheckSplitCells(shell, 2)).toBe(false);
    geometry.mockRestore();
    expect(clients(table.GetFrameFormat())).toEqual([table]);
    expect(clients(row.GetFrameFormat())).toEqual([row]);
    expect(clients(box.GetFrameFormat())).toEqual([box]);
  } finally {
    vi.restoreAllMocks();
    session.Close();
  }
});

it("native dialog alignment preserves original geometry before connected frame ownership", /** Checks independent native orientation defaults without a temporary frame leak. @returns Nothing. */ () => {
  const doc = new SwDoc();
  const cases = [
    [HoriOrientation.CENTER, 2000, 2000, 4000],
    [HoriOrientation.LEFT, 0, 4000, 4000],
    [HoriOrientation.RIGHT, 4000, 0, 4000],
    [HoriOrientation.LEFT_AND_WIDTH, 500, 3500, 4000],
    [HoriOrientation.NONE, 500, 700, 6800],
    [HoriOrientation.FULL, 500, 700, 8000],
  ] as const;
  for (const [horiOrient, left, right, width] of cases) {
    const table = doc.nodes.MakeTableNode("Orient" + horiOrient, {
      horiOrient,
      width: 4000,
      marginLeft: 500,
      marginRight: 700,
    });
    table.AddColumnWidth(4000);
    const rep = new SwTableRep(table, 8000);
    expect([rep.left, rep.right, rep.width]).toEqual([left, right, width]);
    expect(clients(table.GetFrameFormat())).toEqual([table]);
  }
});
