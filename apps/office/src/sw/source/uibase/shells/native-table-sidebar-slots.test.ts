/** @fileoverview Verifies native table sidebar item types, geometry, history and ODT roundtrips. */
import { afterEach, expect, it, vi } from "vitest";
import { createWriterDocumentSession } from "../../../browser/composition/writer-module";
import { SfxUInt16Item, SfxUInt32Item, SfxInt32Item } from "../../../../svl/source/items/intitem";
import {
  SID_ATTR_TABLE_ROW_HEIGHT,
  SID_ATTR_TABLE_COLUMN_WIDTH,
  SID_ATTR_TABLE_ALIGNMENT,
  SID_ATTR_TABLE_LEFT_SPACE,
  SID_ATTR_TABLE_RIGHT_SPACE,
} from "../../../inc/cmdid";
import { HoriOrientation as H } from "../../../../offapi/com/sun/star/text/HoriOrientation";
import { SwTableShell } from "./tabsh";
import { SwTableFUNC } from "../table/tablemgr";
import { SwTabFrame } from "../../core/layout/tabfrm";
import { SfxRequest } from "../../../../sfx2/source/control/request";
import { SwFormatFrameSize, SwFrameSize } from "../../../inc/fmtfsize";
import { SwPosition } from "../../core/crsr/pam";
import { writeOdtDocument } from "../../filter/xml/wrtxml";
import { readOdtDocument } from "../../filter/xml/swxml";

const sessions: ReturnType<typeof createWriterDocumentSession>[] = [];
afterEach(
  /** Closes original native frame ownership. @returns Nothing. */
  () => {
    for (const session of sessions.splice(0)) session.Close();
  },
);
/** Creates an original three-column graph and actual frame. @param column - Current box. @returns Fixture. */
function fixture(column = 0) {
  const session = createWriterDocumentSession();
  sessions.push(session);
  const shell = session.view.GetWrtShell(),
    doc = shell.GetDoc();
  const table = doc.nodes.MakeTableNode("Sidebar", { width: 6000, horiOrient: H.LEFT });
  for (const width of [1000, 2000, 3000]) table.AddColumnWidth(width);
  for (let i = 0; i < 2; i++) doc.nodes.AppendTableRow(table, 3);
  const node = table.GetTabLines()[0]?.GetTabBoxes()[column]?.GetParagraphs()[0];
  if (!node) throw new Error("Missing table sidebar cell");
  const position = new SwPosition(node, 0);
  shell.SetCursor(position);
  position.Dispose();
  doc.GetUndoManager().Clear();
  return { session, shell, doc, table, view: session.view };
}
/** Executes the actual native alignment request. @param f - Fixture. @param alignment - Native enum. @param left - Twips. @param right - Twips. @returns Dispatch result. */
function align(f: ReturnType<typeof fixture>, alignment: number, left = 0, right = 0) {
  return f.view.Execute(".uno:TableAlignment", [
    new SfxUInt16Item(SID_ATTR_TABLE_ALIGNMENT, alignment),
    new SfxInt32Item(SID_ATTR_TABLE_LEFT_SPACE, left),
    new SfxInt32Item(SID_ATTR_TABLE_RIGHT_SPACE, right),
  ]);
}

it.each([0, 1, 2])(
  "reads current cell geometry and applies column width with history column=%i",
  /** Checks source current-column lookup and actual separator mutations. @param column - Column. @returns Nothing. */
  (column) => {
    const f = fixture(column),
      before = f.table.GetColumnWidths();
    expect(f.shell.GetCurTabColNum()).toBe(column);
    expect((f.view.QueryState(".uno:TableColumWidth").value as SfxUInt32Item).GetValue()).toBe(
      before[column],
    );
    const result = f.view.Execute(".uno:TableColumWidth", [
      new SfxUInt32Item(SID_ATTR_TABLE_COLUMN_WIDTH, (before[column] as number) + 100),
    ]);
    expect(result).toMatchObject({ status: "executed", value: true });
    expect(f.table.GetColumnWidths()[column]).toBe((before[column] as number) + 100);
    expect(f.doc.GetUndoManager().GetUndoActionCount()).toBe(1);
    expect(f.shell.Undo()).toBe(true);
    expect(f.table.GetColumnWidths()).toEqual(before);
    expect(f.shell.Redo()).toBe(true);
    expect(f.table.GetColumnWidths()[column]).toBe((before[column] as number) + 100);
  },
);
it("changes Variable row height into Minimum and retains original row/history" /** Checks native complete size item and typed rejection. @returns Nothing. */, () => {
  const f = fixture(),
    row = f.table.GetTabLines()[0];
  expect(f.shell.GetRowHeight()?.GetHeightSizeType()).toBe(SwFrameSize.Variable);
  expect(
    f.view.Execute(".uno:TableRowHeight", [new SfxUInt32Item(SID_ATTR_TABLE_ROW_HEIGHT, 720)]),
  ).toMatchObject({ value: true });
  expect(f.shell.GetRowHeight()?.GetHeightSizeType()).toBe(SwFrameSize.Minimum);
  expect((f.view.QueryState(".uno:TableRowHeight").value as SfxUInt32Item).GetValue()).toBe(720);
  expect(f.shell.Undo()).toBe(true);
  expect(f.shell.GetRowHeight()?.GetHeightSizeType()).toBe(SwFrameSize.Variable);
  expect(f.shell.Redo()).toBe(true);
  expect(f.table.GetTabLines()[0]).toBe(row);
  expect(
    f.view.Execute(".uno:TableRowHeight", [new SfxUInt16Item(SID_ATTR_TABLE_ROW_HEIGHT, 900)]),
  ).toMatchObject({ value: false });
  f.shell.SelTable();
  expect(f.view.QueryState(".uno:TableRowHeight")).toMatchObject({ mixed: true, value: undefined });
  expect(
    f.view.Execute(".uno:TableRowHeight", [new SfxUInt32Item(SID_ATTR_TABLE_ROW_HEIGHT, 900)]),
  ).toMatchObject({ value: false });
});
it.each([H.FULL, H.LEFT, H.RIGHT, H.CENTER, H.NONE, H.LEFT_AND_WIDTH])(
  "preserves native alignment, three-item state and ODT alignment=%i",
  /** Checks original frame attributes and ordinary export/open. @param alignment - Source enum. @returns Completion. */
  async (alignment) => {
    const f = fixture();
    expect(align(f, alignment, 360, 360)).toMatchObject({ value: true });
    const format = f.table.GetFrameFormat(),
      width = format.GetFrameSize().GetWidth();
    const page = f.doc.GetPageDesc().GetValue(),
      space = page.width - page.leftMargin - page.rightMargin;
    expect(format.GetHoriOrient().GetHoriOrient()).toBe(alignment);
    expect(width).toBe(
      [H.FULL, H.LEFT_AND_WIDTH].includes(alignment)
        ? space
        : alignment === H.LEFT || alignment === H.RIGHT
          ? space - 360
          : space - 720,
    );
    expect((f.view.QueryState(".uno:TableAlignment").value as SfxUInt16Item).GetValue()).toBe(
      alignment,
    );
    expect(f.doc.GetUndoManager().GetUndoActionCount()).toBe(1);
    expect(f.shell.Undo()).toBe(true);
    expect(f.table.GetFrameFormat().GetFrameSize().GetWidth()).toBe(6000);
    expect(f.shell.Redo()).toBe(true);
    const bytes = await writeOdtDocument(f.doc, f.session.docShell.GetDocumentState());
    const opened = await readOdtDocument(bytes, f.session.docShell.GetDocumentState()),
      imported = opened.document.GetTables()[0];
    expect(imported?.GetFrameFormat().GetHoriOrient().GetHoriOrient()).toBe(alignment);
    expect(imported?.GetFrameFormat().GetFrameSize().GetWidth()).toBe(width);
  },
);
it("retains native minimum width fallback and rejects wrong alignment transport" /** Checks signed spacing, boundary truncation and exact UInt16 contract. @returns Nothing. */, () => {
  const f = fixture();
  expect(
    f.view.Execute(".uno:TableAlignment", [new SfxUInt32Item(SID_ATTR_TABLE_ALIGNMENT, H.LEFT)]),
  ).toMatchObject({ value: false });
  expect(align(f, H.LEFT_AND_WIDTH + 1)).toMatchObject({ value: false });
  for (const orientation of [H.LEFT, H.RIGHT, H.CENTER, H.NONE]) {
    expect(align(f, orientation, 100000, 100000)).toMatchObject({ value: true });
    expect(f.table.GetFrameFormat().GetFrameSize().GetWidth()).toBe(23);
  }
  expect(
    f.view.Execute(".uno:TableLeftSpace", [new SfxInt32Item(SID_ATTR_TABLE_LEFT_SPACE, 100)]),
  ).toMatchObject({ value: false });
});

it("retains optional spacing defaults and state-only spacing contracts" /** Exercises absent/mismatched native request items and direct no-table state. @returns Nothing. */, () => {
  const f = fixture();
  expect(f.view.Execute(".uno:TableRowHeight")).toMatchObject({ value: false });
  expect(f.view.Execute(".uno:TableColumWidth")).toMatchObject({ value: false });
  expect(f.view.Execute(".uno:TableAlignment")).toMatchObject({ value: false });
  expect(f.view.Execute(".uno:TableRightSpace")).toMatchObject({ value: false });
  expect(
    f.view.Execute(".uno:TableAlignment", [new SfxUInt16Item(SID_ATTR_TABLE_ALIGNMENT, H.NONE)]),
  ).toMatchObject({ value: true });
  expect(f.table.GetFrameFormat().GetLRSpace().ResolveLeft()).toBe(0);
  expect(f.table.GetFrameFormat().GetLRSpace().ResolveRight()).toBe(0);
  expect(
    f.view.Execute(".uno:TableAlignment", [
      new SfxUInt16Item(SID_ATTR_TABLE_ALIGNMENT, H.LEFT),
      new SfxUInt32Item(SID_ATTR_TABLE_LEFT_SPACE, 999),
      new SfxUInt32Item(SID_ATTR_TABLE_RIGHT_SPACE, 999),
    ]),
  ).toMatchObject({ value: true });
  const session = createWriterDocumentSession();
  sessions.push(session);
  const native = new SwTableShell(session.view.GetWrtShell()).GetCommandShell();
  for (const slot of native.GetInterface().GetSlots())
    expect(slot.GetState(new SwTableShell(session.view.GetWrtShell())).enabled).toBe(false);
  expect(session.view.GetWrtShell().GetCurTabColNum()).toBe(0);
});
it("uses source percentage width to calculate sidebar spacing without mutating the table" /** Checks relative frame state and independent returned items. @returns Nothing. */, () => {
  const f = fixture();
  align(f, H.RIGHT, 360, 0);
  const size = f.table.GetFrameFormat().GetFrameSize().Clone();
  size.SetWidthPercent(50);
  f.table.GetFrameFormat().SetFormatAttr(size);
  const page = f.doc.GetPageDesc().GetValue(),
    space = page.width - page.leftMargin - page.rightMargin;
  const item = f.view.QueryState(".uno:TableLeftSpace").value as SfxInt32Item;
  expect(item.GetValue()).toBe(space - Math.trunc(space / 2));
  expect((f.view.QueryState(".uno:TableRightSpace").value as SfxInt32Item).GetValue()).toBe(0);
  item.SetValue(999);
  expect((f.view.QueryState(".uno:TableLeftSpace").value as SfxInt32Item).GetValue()).toBe(
    space - Math.trunc(space / 2),
  );
});
it("finds original cell frames in later rows and refuses foreign box geometry" /** Checks native frame traversal beyond the first row. @returns Nothing. */, () => {
  const f = fixture(),
    box = f.table.GetTabLines()[1]?.GetTabBoxes()[2],
    node = box?.GetParagraphs()[0];
  if (!node || !box) throw new Error("Missing later native row");
  const position = new SwPosition(node, 0);
  f.shell.SetCursor(position);
  position.Dispose();
  const manager = new SwTableFUNC(f.shell);
  manager.InitTabCols();
  expect(manager.GetCurColNum()).toBe(2);
  expect(manager.GetColWidth(2)).toBe(3000);
  const foreign = fixture(),
    foreignBox = foreign.table.GetTabLines()[0]?.GetTabBoxes()[0];
  if (!foreignBox) throw new Error("Missing foreign native box");
  const frame = new SwTabFrame(f.table);
  try {
    expect(frame.GetBoxPrintOffset(foreignBox, 10000)).toBeUndefined();
  } finally {
    frame.DestroyImpl();
  }
});

it("returns the native first-column default when current layout geometry is unavailable" /** Checks failed native geometry lookup without guessing a model index. @returns Nothing. */, () => {
  const f = fixture(2),
    geometry = vi.spyOn(f.shell, "GetTabCols").mockReturnValue(false);
  try {
    expect(f.shell.GetCurTabColNum()).toBe(0);
  } finally {
    geometry.mockRestore();
  }
});
it("rejects a direct table metric request after the current table context is absent" /** Checks the native owner independently of dispatcher enabled-state protection. @returns Nothing. */, () => {
  const session = createWriterDocumentSession();
  sessions.push(session);
  const owner = new SwTableShell(session.view.GetWrtShell()),
    slot = owner.GetCommandShell().GetInterface().GetSlot(".uno:TableRowHeight");
  if (!slot) throw new Error("Missing native row metric slot");
  expect(
    slot.Execute(
      owner,
      new SfxRequest(slot.slotId, [new SfxUInt32Item(SID_ATTR_TABLE_ROW_HEIGHT, 720)]),
    ),
  ).toBe(false);
  expect(session.view.GetWrtShell().GetDoc().GetUndoManager().GetUndoActionCount()).toBe(0);
});
it("preserves existing Fixed and Minimum row height types across metric edits and history" /** Checks complete native size item retention rather than resetting its height mode. @returns Nothing. */, () => {
  const f = fixture();
  for (const type of [SwFrameSize.Fixed, SwFrameSize.Minimum]) {
    f.shell.SetRowHeight(new SwFormatFrameSize(type, 0, 600));
    f.doc.GetUndoManager().Clear();
    expect(
      f.view.Execute(".uno:TableRowHeight", [new SfxUInt32Item(SID_ATTR_TABLE_ROW_HEIGHT, 900)]),
    ).toMatchObject({ value: true });
    expect([
      f.shell.GetRowHeight()?.GetHeightSizeType(),
      f.shell.GetRowHeight()?.GetHeight(),
    ]).toEqual([type, 900]);
    expect(f.shell.Undo()).toBe(true);
    expect(f.shell.GetRowHeight()?.GetHeight()).toBe(600);
    expect(f.shell.Redo()).toBe(true);
    expect([
      f.shell.GetRowHeight()?.GetHeightSizeType(),
      f.shell.GetRowHeight()?.GetHeight(),
    ]).toEqual([type, 900]);
  }
});
