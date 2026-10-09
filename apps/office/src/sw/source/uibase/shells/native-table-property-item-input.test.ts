/** @fileoverview Checks canonical native changed table-item consumption and original-owner history. */
import { afterEach, expect, it, vi } from "vitest";
import { createWriterDocumentSession } from "../../../browser/composition/writer-module";
import { SwPosition } from "../../core/crsr/pam";
import { SwTabCols } from "../../core/bastyp/tabcol";
import { SwTableRep } from "../table/swtablerep";
import { SwTableColumnPage } from "../../ui/table/tabledlg";
import { ItemSetToTableParam } from "./tabsh";
import { SwPtrItem } from "../utlui/uiitems";
import { SfxItemSet } from "../../../../svl/source/items/itemset";
import { SfxStringItem } from "../../../../svl/source/items/stritem";
import { SfxUInt16Item } from "../../../../svl/source/items/intitem";
import { SfxBoolItem } from "../../../../svl/source/items/cenumitm";
import { SwFormatLayoutSplit } from "../../../inc/fmtlsplt";
import { SwFormatRowSplit } from "../../../inc/fmtrowsplt";
import {
  SvxULSpaceItem,
  SvxBoxItem,
  SvxBoxInfoItem,
} from "../../../../editeng/source/items/frmitems";
import {
  FN_TABLE_REP,
  FN_TABLE_SET_VERT_ALIGN,
  FN_PARAM_TABLE_NAME,
  FN_PARAM_TABLE_HEADLINE,
} from "../../../inc/cmdid";
import { RES_BOX, RES_UL_SPACE, RES_COLLAPSING_BORDERS } from "../../../inc/hintids";
import { SID_ATTR_BORDER_INNER } from "../../../../svx/inc/svxids";
import { HoriOrientation as H } from "../../../../offapi/com/sun/star/text/HoriOrientation";
import { VertOrientation } from "../../../../offapi/com/sun/star/text/VertOrientation";
const sessions: ReturnType<typeof createWriterDocumentSession>[] = [];
afterEach(
  /** Closes original sessions. @returns Nothing. */ () => {
    vi.restoreAllMocks();
    for (const session of sessions.splice(0)) session.Close();
  },
);
/** Requires an original owner. @param value - Optional owner. @returns Owner. */
function required<T>(value: T | undefined): T {
  if (value === undefined) throw new Error("Missing native item fixture owner");
  return value;
}
/** Creates the actual native shell and independent rows. @returns Original graph. */
function fixture() {
  const session = createWriterDocumentSession();
  sessions.push(session);
  const doc = session.docShell.GetDoc(),
    shell = session.view.GetWrtShell(),
    table = doc.nodes.MakeTableNode("Original", { width: 6000, horiOrient: H.LEFT });
  table.AddColumnWidth(1000);
  table.AddColumnWidth(5000);
  for (const values of [
    [1000, 5000],
    [1000, 1000, 4000],
    [4000, 2000],
  ])
    for (const [i, box] of doc.nodes.AppendTableRow(table, values.length).GetTabBoxes().entries()) {
      const size = box.GetFrameSize();
      size.SetWidth(required(values[i]));
      box.SetFrameSize(size);
    }
  const lines = [...table.GetTabLines()],
    boxes = lines.flatMap(
      /** Captures boxes. @param line - Row. @returns Owners. */ (line) => [...line.GetTabBoxes()],
    ),
    node = required(required(required(lines[1]).GetTabBoxes()[2]).GetParagraphs()[0]);
  node.SetText("Original text");
  const position = new SwPosition(node, 2);
  shell.SetCursor(position);
  position.Dispose();
  doc.GetUndoManager().Clear();
  const input = new SfxItemSet(doc.GetAttrPool(), [[1, 32767]]),
    cursor = shell.CaptureCursorState();
  return { session, doc, shell, table, lines, boxes, node, input, cursor };
}
/** Reads all original widths. @param f - Actual graph. @returns Per-row widths. */
function widths(f: ReturnType<typeof fixture>) {
  return f.table
    .GetTabLines()
    .map(
      /** Reads native row. @param line - Original row. @returns Widths. */ (line) =>
        line
          .GetTabBoxes()
          .map(
            /** Reads box item. @param box - Native owner. @returns Width. */ (box) =>
              box.GetFrameSize().GetWidth(),
          ),
    );
}
it.each([true, false])(
  "explicit table dialog preserves collapsing-border choice %s",
  /** Checks both choices through accepted dialog ingress. @param collapsing - Accepted checkbox state. @returns Nothing. */ (
    collapsing,
  ) => {
    const f = fixture();
    const columns = new SwTabCols();
    f.shell.GetTabCols(columns);
    f.input.Put(new SfxBoolItem(RES_COLLAPSING_BORDERS, collapsing));
    expect(
      ItemSetToTableParam(f.shell, {
        width: 6000,
        columnWidths: [1000, 5000],
        tableRep: new SwTableRep(f.table, 6000, columns),
        headerRows: 0,
        repeatHeaderRows: false,
        borderItems: f.input,
      }),
    ).toBe(true);
    expect(f.table.GetFormat().borderModel).toBe(collapsing ? "collapsing" : "separating");
  },
);
it("empty native input does not materialize defaults or create table history", /** Checks the exact original format and cursor. @returns Nothing. */ () => {
  const f = fixture(),
    format = f.table.GetFormat(),
    attrs = vi.spyOn(f.shell, "SetTableAttr"),
    columns = vi.spyOn(f.shell, "SetTabCols"),
    header = vi.spyOn(f.shell, "SetRowsToRepeat");
  expect(ItemSetToTableParam(f.shell, f.input)).toBe(true);
  expect(attrs).not.toHaveBeenCalled();
  expect(columns).not.toHaveBeenCalled();
  expect(header).not.toHaveBeenCalled();
  expect(f.table.GetFormat()).toStrictEqual(format);
  expect(f.doc.GetUndoManager().GetUndoActionCount()).toBe(0);
  expect(f.shell.CaptureCursorState()).toEqual(f.cursor);
});
it("native input ignores inherited disabled invalid and null-owner declarations", /** Checks explicit item admission and missing table. @returns Nothing. */ () => {
  const f = fixture(),
    parent = new SfxItemSet(f.doc.GetAttrPool(), [[1, 32767]]);
  parent.Put(new SvxULSpaceItem(100, 200, RES_UL_SPACE));
  parent.Put(new SfxUInt16Item(FN_PARAM_TABLE_HEADLINE, 2));
  f.input.SetParent(parent);
  f.input.DisableItem(FN_PARAM_TABLE_NAME);
  f.input.InvalidateItem(FN_TABLE_SET_VERT_ALIGN);
  f.input.Put(new SwPtrItem(FN_TABLE_REP, null));
  const format = f.table.GetFormat();
  expect(ItemSetToTableParam(f.shell, f.input)).toBe(true);
  expect(f.table.GetFormat()).toStrictEqual(format);
  expect(f.doc.GetUndoManager().GetUndoActionCount()).toBe(0);
  const position = new SwPosition(required(f.doc.paragraphs[0]), 0);
  f.shell.SetCursor(position);
  position.Dispose();
  expect(ItemSetToTableParam(f.shell, f.input)).toBe(false);
});
it("native name-only input records one rename without touching frame defaults", /** Checks isolated rename and native history. @returns Nothing. */ () => {
  const f = fixture(),
    format = f.table.GetFormat(),
    attrs = vi.spyOn(f.shell, "SetTableAttr");
  f.input.Put(new SfxStringItem(FN_PARAM_TABLE_NAME, "Renamed"));
  expect(ItemSetToTableParam(f.shell, f.input)).toBe(true);
  expect(f.table.GetName()).toBe("Renamed");
  expect(attrs).not.toHaveBeenCalled();
  expect(f.table.GetFormat()).toStrictEqual(format);
  expect(f.doc.GetUndoManager().GetUndoActionCount()).toBe(1);
  for (let i = 0; i < 3; i++) {
    expect(f.shell.Undo()).toBe(true);
    expect(f.table.GetName()).toBe("Original");
    expect(f.shell.Redo()).toBe(true);
    expect(f.table.GetName()).toBe("Renamed");
  }
  expect(f.shell.CaptureCursorState()).toEqual(f.cursor);
  expect(f.table.GetTabLines()).toEqual(f.lines);
});
it("native spacing and table flags leave width and headline attributes unadvertised", /** Checks independent frame attributes. @returns Nothing. */ () => {
  const f = fixture(),
    original = f.table.GetFormat(),
    header = vi.spyOn(f.shell, "SetRowsToRepeat");
  f.input.Put(new SvxULSpaceItem(240, 120, RES_UL_SPACE));
  f.input.Put(new SwFormatLayoutSplit(false));
  f.input.Put(new SfxBoolItem(RES_COLLAPSING_BORDERS, true));
  ItemSetToTableParam(f.shell, f.input);
  expect(header).not.toHaveBeenCalled();
  expect(f.table.GetFormat()).toStrictEqual({
    ...original,
    marginTop: 240,
    marginBottom: 120,
    layoutSplit: false,
    borderModel: "collapsing",
  });
  expect(widths(f)).toEqual([
    [1000, 5000],
    [1000, 1000, 4000],
    [4000, 2000],
  ]);
  expect(f.doc.GetUndoManager().GetUndoActionCount()).toBe(1);
  expect(f.shell.Undo()).toBe(true);
  expect(f.table.GetFormat()).toStrictEqual(original);
  expect(f.shell.Redo()).toBe(true);
  expect(f.table.GetFormat().marginTop).toBe(240);
});
it.each(["cursor", "row"])(
  "native combined table input retains scope%s in one history group",
  /** Checks source selection restoration and every represented changed-item category. @param scope - Native selection. @returns Nothing. */ (
    scope,
  ) => {
    const f = fixture();
    if (scope === "row") f.shell.SelectTableRow();
    const cursor = f.shell.CaptureCursorState(),
      geometry = new SwTabCols();
    f.shell.GetTabCols(geometry);
    const rep = new SwTableRep(f.table, 9000, geometry);
    rep.width = 9000;
    rep.SetWidthChanged();
    f.input.Put(new SwPtrItem(FN_TABLE_REP, rep));
    f.input.Put(new SfxUInt16Item(FN_PARAM_TABLE_HEADLINE, 2));
    f.input.Put(new SfxUInt16Item(FN_TABLE_SET_VERT_ALIGN, VertOrientation.BOTTOM));
    f.input.Put(new SwFormatRowSplit(false));
    const border = new SvxBoxItem(RES_BOX);
    border.SetAllDistances(50);
    const info = new SvxBoxInfoItem(SID_ATTR_BORDER_INNER);
    info.SetTable(true);
    info.SetDist(true);
    f.input.Put(border);
    f.input.Put(info);
    expect(ItemSetToTableParam(f.shell, f.input)).toBe(true);
    expect(f.table.GetRowsToRepeat()).toBe(2);
    expect(widths(f)).toEqual([
      [1500, 7500],
      [1500, 1500, 6000],
      [6000, 3000],
    ]);
    expect(f.doc.GetUndoManager().GetUndoActionCount()).toBe(1);
    expect(f.shell.CaptureCursorState()).toEqual(cursor);
    for (let i = 0; i < 3; i++) {
      expect(f.shell.Undo()).toBe(true);
      expect(widths(f)).toEqual([
        [1000, 5000],
        [1000, 1000, 4000],
        [4000, 2000],
      ]);
      expect(f.shell.Redo()).toBe(true);
      expect(widths(f)).toEqual([
        [1500, 7500],
        [1500, 1500, 6000],
        [6000, 3000],
      ]);
    }
    expect(f.table.GetTabLines()).toEqual(f.lines);
    expect(f.shell.CaptureCursorState()).toEqual(cursor);
    expect(f.node.GetText()).toBe("Original text");
  },
);
it("native columns item consumes the borrowed current-row representation", /** Checks native hidden constraints without a width-array conversion. @returns Nothing. */ () => {
  const f = fixture(),
    geometry = new SwTabCols();
  f.shell.GetTabCols(geometry);
  const rep = new SwTableRep(f.table, geometry.GetRightMax(), geometry),
    page = new SwTableColumnPage(rep);
  page.ValueChangedHdl(0, 1440);
  page.DeactivatePage(undefined, f.input);
  expect(ItemSetToTableParam(f.shell, f.input)).toBe(true);
  expect(widths(f)).toEqual([
    [1000, 5000],
    [1440, 560, 4000],
    [4000, 2000],
  ]);
  expect(f.doc.GetUndoManager().GetUndoActionCount()).toBe(1);
  expect(f.shell.Undo()).toBe(true);
  expect(widths(f)).toEqual([
    [1000, 5000],
    [1000, 1000, 4000],
    [4000, 2000],
  ]);
  expect(f.shell.Redo()).toBe(true);
  expect(widths(f)[1]).toEqual([1440, 560, 4000]);
});
it("native automatic alignment advertises orientation without replacing the frame width", /** Checks source FULL geometry item construction. @returns Nothing. */ () => {
  const f = fixture(),
    geometry = new SwTabCols();
  f.shell.GetTabCols(geometry);
  const rep = new SwTableRep(f.table, 9000, geometry);
  rep.align = H.FULL;
  rep.width = 9000;
  rep.left = rep.right = 0;
  rep.SetWidthChanged();
  f.input.Put(new SwPtrItem(FN_TABLE_REP, rep));
  ItemSetToTableParam(f.shell, f.input);
  expect(f.table.GetFormat().width).toBe(6000);
  expect(f.table.GetHoriOrient()).toBe(H.FULL);
  expect(widths(f)).toEqual([
    [1000, 5000],
    [1000, 1000, 4000],
    [4000, 2000],
  ]);
});

it("native border-only item admission preserves cursor and complete original formats through undo", /** Checks border-only selection without a row-split item. @returns Nothing. */ () => {
  const f = fixture(),
    original = f.boxes.map(
      /** Captures complete original formats. @param box - Owner. @returns Format. */ (box) =>
        box.GetFormat(),
    );
  f.input.Put(new SvxBoxItem(RES_BOX));
  expect(ItemSetToTableParam(f.shell, f.input)).toBe(true);
  expect(f.shell.CaptureCursorState()).toEqual(f.cursor);
  expect(widths(f)).toEqual([
    [1000, 5000],
    [1000, 1000, 4000],
    [4000, 2000],
  ]);
  expect(f.doc.GetUndoManager().GetUndoActionCount()).toBe(1);
  expect(f.shell.Undo()).toBe(true);
  expect(
    f.boxes.map(
      /** Reads complete restored formats. @param box - Owner. @returns Format. */ (box) =>
        box.GetFormat(),
    ),
  ).toStrictEqual(original);
  expect(f.shell.CaptureCursorState()).toEqual(f.cursor);
});

it("native row-split-only input does not request border writes and retains complete frame defaults", /** Checks independent row item admission and grouped history. @returns Nothing. */ () => {
  const f = fixture(),
    borders = vi.spyOn(f.shell, "SetTabBorders"),
    original = f.table.GetFormat();
  f.input.Put(new SwFormatRowSplit(false));
  expect(ItemSetToTableParam(f.shell, f.input)).toBe(true);
  expect(borders).not.toHaveBeenCalled();
  expect(f.table.GetFormat()).toStrictEqual(original);
  expect(f.doc.GetUndoManager().GetUndoActionCount()).toBe(1);
  expect(f.shell.CaptureCursorState()).toEqual(f.cursor);
  expect(f.shell.Undo()).toBe(true);
  expect(f.table.GetFormat()).toStrictEqual(original);
});
