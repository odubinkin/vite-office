/** @fileoverview Verifies native row format registration, claim and shared item mutation. */
import { expect, it } from "vitest";
import { SwDoc } from "../doc/doc";
import { SwTableLine } from "./swtable";
import { SwTableLineFormat } from "../../../inc/swtblfmt";
import { SwClient } from "../../../inc/calbck";
import { SwFrameFormat } from "../layout/atrfrm";
import { SwFormat } from "../attr/format";
import { SwFormatRowSplit } from "../../../inc/fmtrowsplt";
import { SwFormatFrameSize, SwFrameSize } from "../../../inc/fmtfsize";
import { SwPosition } from "../crsr/pam";
import { SwCursor, SwTableCursor } from "../crsr/swcrsr";
import { SwRowFrame } from "../layout/tabfrm";
/** Requires an original model owner. @param value - Optional owner. @returns Actual owner. */
function required<T>(value: T | undefined): T {
  if (value === undefined) throw new Error("Missing native shared format owner");
  return value;
}
/** Creates a connected table with three rows sharing one native format. @returns Original graph. */
function fixture() {
  const doc = new SwDoc(),
    table = doc.nodes.MakeTableNode("Shared");
  table.AddColumnWidth(3000);
  for (let index = 0; index < 3; index++) doc.nodes.AppendTableRow(table, 1);
  const rows = [...table.GetTabLines()],
    first = required(rows[0]),
    format = first.GetFrameFormat();
  for (const row of rows) row.ChgFrameFormat(format);
  const node = required(required(first.GetTabBoxes()[0]).GetParagraphs()[0]),
    position = new SwPosition(node, 0),
    cursor = new SwCursor(position);
  position.Dispose();
  return { doc, table, rows, first, format, node, cursor };
}
it("native row format has exact ranges and concrete pool defaults without authored DTO state", /** Checks actual inheritance and default item ownership. @returns Nothing. */ () => {
  const doc = new SwDoc(),
    format = doc.MakeTableLineFormat(),
    row = new SwTableLine(format);
  expect(format).toBeInstanceOf(SwTableLineFormat);
  expect(format).toBeInstanceOf(SwFrameFormat);
  expect(format).toBeInstanceOf(SwFormat);
  expect(row).toBeInstanceOf(SwClient);
  expect(row.GetRegisteredIn()).toBe(format);
  expect(format.GetDoc()).toBe(doc);
  expect(format.GetAttrSet().GetPool()).toBe(doc.GetAttrPool());
  expect(format.DerivedFrom()).toBe(doc.GetDfltFrameFormat());
  expect(format.GetAttrSet().GetParent()).toBe(doc.GetDfltFrameFormat().GetAttrSet());
  expect(format.GetAttrSet().GetRanges()).toEqual([
    [89, 90],
    [98, 99],
    [105, 105],
    [107, 107],
    [109, 109],
    [112, 114],
    [129, 129],
    [137, 137],
    [160, 160],
  ]);
  expect(format.GetRowSplit()).toBeInstanceOf(SwFormatRowSplit);
  expect(format.GetRowSplit().Which()).toBe(129);
  expect(format.GetRowSplit().GetValue()).toBe(true);
  expect(format.GetFrameSize()).toBeInstanceOf(SwFormatFrameSize);
  expect(format.GetFrameSize().Which()).toBe(90);
  expect(format.GetFrameSize().GetHeightSizeType()).toBe(SwFrameSize.Variable);
  expect(format.GetFrameSize().GetWidthSizeType()).toBe(SwFrameSize.Fixed);
  expect(format.GetFrameSize().GetWidth()).toBe(0);
  expect(format.GetFrameSize().GetHeight()).toBe(0);
  expect(format.GetFrameSize().GetWidthPercent()).toBe(0);
  expect(format.GetFrameSize().GetWidthPercentRelation()).toBe(0);
  expect(format.GetFrameSize().GetHeightPercent()).toBe(0);
  expect(format.GetFrameSize().GetHeightPercentRelation()).toBe(0);
  expect(row.GetFormat()).toEqual({});
  expect(Object.hasOwn(row, "format")).toBe(false);
  expect(row.GetRowSplit()).not.toBe(format.GetRowSplit());
  expect(row.GetFrameSize()).not.toBe(format.GetFrameSize());
  expect(doc.MakeTableLineFormat().GetName()).not.toBe(format.GetName());
  row.Dispose();
});
it("exclusive row claim ignores other client kinds and does not allocate or detach", /** Checks live native client classification and unchanged exclusive ownership. @returns Nothing. */ () => {
  const doc = new SwDoc(),
    format = doc.MakeTableLineFormat(),
    other = new SwClient(),
    row = new SwTableLine(format);
  other.RegisterToModify(format);
  expect(row.ClaimFrameFormat()).toBe(format);
  expect(row.GetRegisteredIn()).toBe(format);
  expect(other.GetRegisteredIn()).toBe(format);
  row.ChgFrameFormat(format);
  expect(row.GetFrameFormat()).toBe(format);
  row.Dispose();
  other.Dispose();
});
it("shared row claim clones all attributes while moving only the claiming original client", /** Checks complete independent native items, inheritance and source identity. @returns Nothing. */ () => {
  const doc = new SwDoc(),
    format = doc.MakeTableLineFormat(),
    first = new SwTableLine(format),
    second = new SwTableLine(format),
    size = new SwFormatFrameSize(SwFrameSize.Minimum, 700, 880);
  size.SetWidthSizeType(SwFrameSize.Variable);
  size.SetWidthPercent(42);
  size.SetWidthPercentRelation(3);
  size.SetHeightPercent(255);
  size.SetHeightPercentRelation(4);
  format.SetAuto(false);
  format.SetFormatAttr(size);
  format.SetFormatAttr(new SwFormatRowSplit(false));
  const revision = doc.GetDocumentStateManager().GetModelRevision(),
    copy = first.ClaimFrameFormat();
  expect(copy).not.toBe(format);
  expect(copy.GetName()).not.toBe(format.GetName());
  expect(copy.GetAttrSet()).not.toBe(format.GetAttrSet());
  expect(copy.GetFrameSize().equals(size)).toBe(true);
  expect(copy.GetFrameSize()).not.toBe(format.GetFrameSize());
  expect(copy.GetRowSplit()).not.toBe(format.GetRowSplit());
  expect(copy.GetRowSplit().GetValue()).toBe(false);
  expect(copy.DerivedFrom()).toBe(doc.GetDfltFrameFormat());
  expect(copy.IsAuto()).toBe(false);
  expect(first.GetRegisteredIn()).toBe(copy);
  expect(second.GetRegisteredIn()).toBe(format);
  const oldClients: unknown[] = [],
    newClients: unknown[] = [];
  format.ForAllListeners(
    /** Collects old registrations. @param client - Original listener. @returns Continue flag. */ (
      client,
    ) => {
      oldClients.push(client);
      return false;
    },
  );
  copy.ForAllListeners(
    /** Collects new registrations. @param client - Moved listener. @returns Continue flag. */ (
      client,
    ) => {
      newClients.push(client);
      return false;
    },
  );
  expect(oldClients).toEqual([second]);
  expect(newClients).toEqual([first]);
  copy.SetFormatAttr(new SwFormatRowSplit(true));
  expect(second.GetRowSplit().GetValue()).toBe(false);
  expect(first.GetRowSplit().GetValue()).toBe(true);
  expect(doc.GetDocumentStateManager().GetModelRevision()).toBe(revision);
  expect(first.ClaimFrameFormat()).toBe(copy);
  expect(
    /** Attempts foreign native owner registration. @returns Nothing. */ () =>
      first.ChgFrameFormat(new SwDoc().MakeTableLineFormat()),
  ).toThrow("another document");
  expect(first.GetFrameFormat()).toBe(copy);
  first.Dispose();
  second.Dispose();
});
it("native listener enumeration skips removed slots, visits appended clients and stops on true", /** Checks original live slot iteration rather than a snapshot. @returns Nothing. */ () => {
  const doc = new SwDoc(),
    format = doc.MakeTableLineFormat(),
    a = new SwClient(),
    b = new SwClient(),
    c = new SwClient(),
    d = new SwClient();
  a.RegisterToModify(format);
  b.RegisterToModify(format);
  c.RegisterToModify(format);
  b.Dispose();
  const visits: unknown[] = [];
  format.ForAllListeners(
    /** Collects live clients and appends a new final slot. @param client - Live listener. @returns Continue flag. */ (
      client,
    ) => {
      visits.push(client);
      if (client === c) d.RegisterToModify(format);
      return false;
    },
  );
  // Vacant slot reuse occurs behind the cursor; a second enumeration sees it.
  expect(visits).toEqual([a, c]);
  const second: unknown[] = [];
  format.ForAllListeners(
    /** Stops at the reused live slot. @param client - Live listener. @returns Stop flag. */ (
      client,
    ) => {
      second.push(client);
      return client === d;
    },
  );
  expect(second).toEqual([a, d]);
  b.RegisterToModify(format);
  const appended = new SwClient(),
    third: unknown[] = [];
  format.ForAllListeners(
    /** Appends beyond the initial listener count. @param client - Live listener. @returns Continue flag. */ (
      client,
    ) => {
      third.push(client);
      if (client === b) appended.RegisterToModify(format);
      return false;
    },
  );
  expect(third).toEqual([a, d, c, b, appended]);
  for (const client of [a, b, c, d, appended]) client.Dispose();
});
it.each([false, true])(
  "core row mutation reuses one claimed owner for selected original peers selected=%s",
  /** Checks operation-local native old-to-new mapping and one document notification. @param selected - Whether only two peers are selected. @returns Nothing. */ (
    selected,
  ) => {
    const f = fixture(),
      cursor = new SwTableCursor(f.cursor.GetPoint());
    try {
      if (cursor instanceof SwTableCursor)
        for (const row of selected ? f.rows.slice(0, 2) : f.rows)
          cursor.InsertBox(required(row.GetTabBoxes()[0]));
      const revision = f.doc.GetDocumentStateManager().GetModelRevision(),
        item = new SwFormatRowSplit(false);
      expect(f.doc.SetRowSplit(cursor, item)).toBe(true);
      item.SetValue(true);
      const format = f.first.GetFrameFormat();
      expect(format).not.toBe(f.format);
      expect(required(f.rows[1]).GetFrameFormat()).toBe(format);
      expect(required(f.rows[2]).GetFrameFormat()).toBe(selected ? f.format : format);
      expect(
        f.rows.map(
          /** Reads native effective row split. @param row - Original line. @returns Flag. */ (
            row,
          ) => row.GetRowSplit().GetValue(),
        ),
      ).toEqual(selected ? [false, false, true] : [false, false, false]);
      expect(f.doc.GetDocumentStateManager().GetModelRevision()).toBe(revision + 1);
      expect(f.doc.GetUndoManager().GetUndoActionCount()).toBe(1);
      expect(f.doc.SetRowSplit(cursor, new SwFormatRowSplit(false))).toBe(true);
      expect(required(f.rows[1]).GetFrameFormat()).toBe(f.first.GetFrameFormat());
      expect(f.doc.GetUndoManager().GetUndoActionCount()).toBe(2);
    } finally {
      if (cursor !== f.cursor) cursor.Dispose();
      f.cursor.Dispose();
    }
  },
);
it("original row frame follows native ownership changes and inserted rows share source format", /** Checks current layout queries and native node construction. @returns Nothing. */ () => {
  const f = fixture();
  try {
    const layout = new SwRowFrame(f.first),
      size = new SwFormatFrameSize(SwFrameSize.Fixed, 0, 660);
    expect(layout.GetTabLine()).toBe(f.first);
    expect(layout.HasFixSize()).toBe(false);
    expect(f.doc.SetRowHeight(f.cursor, size)).toBe(true);
    expect(layout.HasFixSize()).toBe(true);
    expect(layout.Format(120)).toBe(660);
    expect(required(f.rows[1]).GetFrameSize().GetHeight()).toBe(0);
    const source = f.first.GetFrameFormat();
    expect(f.doc.InsertRow([required(f.first.GetTabBoxes()[0])], 2, true)).toBe(true);
    expect(required(f.table.GetTabLines()[1]).GetFrameFormat()).toBe(source);
    expect(required(f.table.GetTabLines()[2]).GetFrameFormat()).toBe(source);
    expect(required(f.table.GetTabLines()[3])).toBe(f.rows[1]);
  } finally {
    f.cursor.Dispose();
  }
});
