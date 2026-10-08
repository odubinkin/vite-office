/** @fileoverview Verifies native cell format ownership, sharing, defaults and change hints. */
import { expect, it, vi } from "vitest";
import { SwPosition } from "../crsr/pam";
import { SwCursor } from "../crsr/swcrsr";
import { SfxItemSet } from "../../../../svl/source/items/itemset";
import { SvxBoxItem, SvxBoxInfoItem } from "../../../../editeng/source/items/frmitems";
import { SvxBorderLine } from "../../../../editeng/source/items/borderline";
import { SID_ATTR_BORDER_INNER } from "../../../../svx/inc/svxids";

import { SwDoc } from "../doc/doc";
import { SwTableBox } from "./swtable";
import { SwTableBoxFormat } from "../../../inc/swtblfmt";
import { SwClient } from "../../../inc/calbck";
import { SwFrameFormat } from "../layout/atrfrm";
import { SwFormatVertOrient } from "../../../inc/fmtornt";
import { SwFormatFrameSize, SwFrameSize } from "../../../inc/fmtfsize";
import { SfxUInt16Item } from "../../../../svl/source/items/intitem";
import { TableBoxFormatChanged } from "../../../inc/hints";
/** Requires an original owner. @param value - Optional owner. @returns Actual owner. */
function required<T>(value: T | undefined): T {
  if (value === undefined) throw Error("Missing native cell owner");
  return value;
}
/** Creates original connected boxes. @returns Native graph. */
function fixture() {
  const doc = new SwDoc(),
    table = doc.nodes.MakeTableNode("Cells");
  table.AddColumnWidth(3000);
  table.AddColumnWidth(3000);
  const row = doc.nodes.AppendTableRow(table, 2),
    first = required(row.GetTabBoxes()[0]),
    second = required(row.GetTabBoxes()[1]);
  return { doc, table, row, first, second };
}
it("native cell format owns exact ranges and concrete inherited defaults", /** Checks independent native defaults rather than authored transport fields. @returns Nothing. */ () => {
  const f = fixture(),
    format = f.doc.MakeTableBoxFormat(),
    box = new SwTableBox(format, f.first.GetStartNode());
  expect(format).toBeInstanceOf(SwTableBoxFormat);
  expect(format).toBeInstanceOf(SwFrameFormat);
  expect(box).toBeInstanceOf(SwClient);
  expect(box.GetRegisteredIn()).toBe(format);
  expect(format.GetDoc()).toBe(f.doc);
  expect(format.DerivedFrom()).toBe(f.doc.GetDfltFrameFormat());
  expect(format.GetAttrSet().GetParent()).toBe(f.doc.GetDfltFrameFormat().GetAttrSet());
  expect(format.GetAttrSet().GetRanges()).toEqual([
    [89, 90],
    [98, 99],
    [105, 105],
    [107, 107],
    [109, 109],
    [112, 114],
    [127, 127],
    [137, 137],
    [157, 159],
    [160, 160],
  ]);
  expect(format.GetVertOrient()).toBeInstanceOf(SwFormatVertOrient);
  expect(format.GetVertOrient().GetPos()).toBe(0);
  expect(format.GetVertOrient().GetVertOrient()).toBe(0);
  expect(format.GetVertOrient().GetRelationOrient()).toBe(1);
  expect(format.GetBox().Which()).toBe(113);
  expect(format.GetBox().GetDistance(0)).toBe(0);
  expect(format.GetFrameSize().GetWidth()).toBe(0);
  expect(format.GetFrameSize().GetHeightSizeType()).toBe(SwFrameSize.Variable);
  expect(box.GetFormat()).toEqual({});
  expect(Object.hasOwn(box, "format")).toBe(false);
  expect(f.doc.MakeTableBoxFormat().GetName()).not.toBe(format.GetName());
  const inherited = new SwFormatVertOrient(720, 3, 7);
  f.doc.GetDfltFrameFormat().SetFormatAttr(inherited);
  expect(format.GetVertOrient().equals(inherited)).toBe(true);
  expect(box.GetVertOrient()).not.toBe(format.GetVertOrient());
  box.Dispose();
  expect(format.IsDisposed()).toBe(true);
  expect(format.GetTableBox()).toBeUndefined();
});
it("shared cell claim copies every direct item and preserves unrelated peers", /** Checks complete item ownership, exclusive claims and foreign admission. @returns Nothing. */ () => {
  const f = fixture(),
    format = f.first.GetFrameFormat(),
    observer = new SwClient();
  observer.RegisterToModify(format);
  f.second.ChgFrameFormat(format);
  const size = new SwFormatFrameSize(SwFrameSize.Minimum, 3000, 880);
  size.SetWidthPercent(42);
  size.SetHeightPercentRelation(4);
  format.SetFormatAttr(size);
  format.SetFormatAttr(new SwFormatVertOrient(720, 3, 7));
  format.SetFormatAttr(new SfxUInt16Item(127, 37));
  format.SetAuto(false);
  const copy = f.first.ClaimFrameFormat();
  expect(copy).not.toBe(format);
  expect(copy.GetFrameSize().equals(size)).toBe(true);
  expect(copy.GetFrameSize()).not.toBe(format.GetFrameSize());
  expect(copy.GetVertOrient()).toEqual(new SwFormatVertOrient(720, 3, 7));
  expect(copy.GetAttrSet().Get(127).QueryValue()).toBe(37);
  expect(copy.IsAuto()).toBe(false);
  expect(copy.DerivedFrom()).toBe(f.doc.GetDfltFrameFormat());
  expect(f.second.GetFrameFormat()).toBe(format);
  expect(copy.GetTableBox()).toBe(f.first);
  expect(format.GetTableBox()).toBe(f.second);
  const watch = new SwClient();
  watch.RegisterToModify(copy);
  expect(f.first.ClaimFrameFormat()).toBe(copy);
  copy.SetFormatAttr(new SwFormatVertOrient(0, 2, 1));
  expect(f.second.GetVertOrient()).toEqual(new SwFormatVertOrient(720, 3, 7));
  expect(
    /** Rejects a foreign native format. @returns Nothing. */ () =>
      f.first.ChgFrameFormat(new SwDoc().MakeTableBoxFormat()),
  ).toThrow("another document");
  expect(
    /** Rejects foreign construction. @returns Native box. */ () =>
      new SwTableBox(new SwDoc().MakeTableBoxFormat(), f.first.GetStartNode()),
  ).toThrow("another document");
  watch.Dispose();
  observer.Dispose();
  f.first.Dispose();
  f.second.Dispose();
  expect(copy.IsDisposed()).toBe(true);
  expect(format.IsDisposed()).toBe(true);
});
it.each([158, 159])(
  "calculation item %s remains exclusive while shared construction excludes calculation attributes",
  /** Checks native direct SET exclusion without a calculation engine. @param which - Native item ID. @returns Nothing. */ (
    which,
  ) => {
    const f = fixture(),
      format = f.first.GetFrameFormat();
    format.SetFormatAttr(new SfxUInt16Item(which, 23));
    const first = new SwTableBox(format, f.first.GetStartNode());
    expect(first.GetFrameFormat()).not.toBe(format);
    expect(first.GetFrameFormat().GetAttrSet().GetItemIfSet(158, false)).toBeUndefined();
    expect(first.GetFrameFormat().GetAttrSet().GetItemIfSet(159, false)).toBeUndefined();
    expect(format.GetAttrSet().Get(which).QueryValue()).toBe(23);
    first.Dispose();
    const solo = f.doc.MakeTableBoxFormat();
    solo.SetFormatAttr(new SfxUInt16Item(which, 29));
    const exclusive = new SwTableBox(solo, f.first.GetStartNode());
    expect(exclusive.GetFrameFormat()).toBe(solo);
    expect(exclusive.ClaimFrameFormat()).toBe(solo);
    exclusive.Dispose();
  },
);
it("native change hint borrows owners before registration and final disposal respects live listeners", /** Checks native ordering and suppressed change notifications. @returns Nothing. */ () => {
  const f = fixture(),
    original = f.first.GetFrameFormat(),
    target = f.doc.MakeTableBoxFormat(),
    events: unknown[] = [];
  const observer = new SwClient(
    /** Observes exact original native change. @param source - Old owner. @param hint - Native hint. @returns Nothing. */ (
      source,
      hint,
    ) => {
      if (hint instanceof TableBoxFormatChanged)
        events.push([
          source,
          hint.m_rNewFormat,
          hint.m_rTableBox,
          hint.m_rTableBox.GetRegisteredIn(),
        ]);
    },
  );
  observer.RegisterToModify(original);
  f.first.ChgFrameFormat(target);
  expect(events).toEqual([[original, target, f.first, original]]);
  expect(f.first.GetFrameFormat()).toBe(target);
  expect(original.IsDisposed()).toBe(false);
  observer.Dispose();
  const next = f.doc.MakeTableBoxFormat();
  f.first.ChgFrameFormat(next, false);
  expect(target.IsDisposed()).toBe(true);
  expect(events).toHaveLength(1);
  const disposed = vi.spyOn(next, "DisposeModify");
  f.first.Dispose();
  expect(disposed).toHaveBeenCalledOnce();
  f.first.Dispose();
  expect(disposed).toHaveBeenCalledOnce();
});

it("native border publication reuses shared formats only for identical changed-side types", /** Checks real shared item ownership across original rectangle cells. @returns Nothing. */ () => {
  const doc = new SwDoc(),
    table = doc.nodes.MakeTableNode("Borders");
  for (let column = 0; column < 4; column++) table.AddColumnWidth(3000);
  const rows = [];
  for (let row = 0; row < 4; row++) rows.push(doc.nodes.AppendTableRow(table, 4));
  const boxes = rows.flatMap(
      /** Reads original native cells. @param row - Connected row. @returns Actual boxes. */ (
        row,
      ) => row.GetTabBoxes(),
    ),
    first = required(boxes[0]),
    last = required(boxes.at(-1)),
    original = first.GetFrameFormat();
  original.SetFormatAttr(new SwFormatVertOrient(720, 3, 7));
  original.SetFormatAttr(new SfxUInt16Item(127, 37));
  for (const box of boxes) box.ChgFrameFormat(original);
  expect(table.GetFrameFormat().GetName()).toBe("Borders");
  const position = new SwPosition(required(first.GetParagraphs()[0]), 0),
    cursor = new SwCursor(position);
  position.Dispose();
  cursor.SetMark();
  cursor.GetMark().Assign(required(last.GetParagraphs()[0]), 0);
  const item = new SvxBoxItem(113);
  item.SetAllDistances(80);
  for (const edge of [0, 1, 2, 3]) item.SetLine(new SvxBorderLine(0x112233, 20), edge);
  const info = new SvxBoxInfoItem(SID_ATTR_BORDER_INNER);
  info.SetLine(new SvxBorderLine(0x445566, 10), 0);
  info.SetLine(new SvxBorderLine(0x445566, 10), 1);
  const value = new SfxItemSet(doc.GetAttrPool(), [
    [113, 113],
    [SID_ATTR_BORDER_INNER, SID_ATTR_BORDER_INNER],
  ]);
  value.Put(item);
  value.Put(info);
  expect(doc.SetTabBorders(cursor, value)).toBe(true);
  const middle = required(boxes[5]).GetFrameFormat();
  expect(required(boxes[6]).GetFrameFormat()).toBe(middle);
  expect(required(boxes[9]).GetFrameFormat()).toBe(middle);
  expect(required(boxes[10]).GetFrameFormat()).toBe(middle);
  expect(first.GetFrameFormat()).not.toBe(middle);
  expect(last.GetFrameFormat()).not.toBe(middle);
  expect(middle.GetBox().GetTop()).toBeUndefined();
  expect(middle.GetBox().GetRight()).toBeUndefined();
  expect(middle.GetBox().GetDistance(0)).toBe(80);
  expect(middle.GetAttrSet().Get(127).QueryValue()).toBe(37);
  expect(middle.GetVertOrient()).toEqual(new SwFormatVertOrient(720, 3, 7));
  expect(doc.GetUndoManager().GetUndoActionCount()).toBe(1);
  cursor.Dispose();
});
it("invalid insertion and incomplete table teardown preserve native cell registrations", /** Checks admission before document mutation and last-client release. @returns Nothing. */ () => {
  const f = fixture(),
    format = f.first.GetFrameFormat(),
    position = new SwPosition(required(f.doc.paragraphs[0]), 0);
  expect(
    /** Rejects zero native table dimensions. @returns Table. */ () =>
      f.doc.InsertTable({ mnInsMode: 0, mnRowsToRepeat: 0 }, position, 0, 1),
  ).toThrow("positive unsigned table dimensions");
  expect(
    /** Refuses a table without a following body paragraph. @returns Nothing. */ () =>
      f.doc.nodes.DeleteTable(f.table.GetTableNode()),
  ).toThrow("needs following text");
  expect(f.first.GetFrameFormat()).toBe(format);
  expect(format.IsDisposed()).toBe(false);
  expect(f.row.GetTabBoxes()).toEqual([f.first, f.second]);
  position.Dispose();
});
