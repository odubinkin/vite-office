/** @fileoverview Checks original table format inheritance and complete border-paint snapshots after the full profile. */
import { expect, it } from "vitest";
import { SwDoc } from "../doc/doc";
import { SwClient, type SwModify } from "../../../inc/calbck";
import type { SwModelHint } from "../../../inc/hints";
import { SwFormatFrameSize, SwFrameSize } from "../../../inc/fmtfsize";
import { SvxBorderLine } from "../../../../editeng/source/items/borderline";
import { Style } from "../../../../svx/source/dialog/framelink";
import { OverlapType, SwLineEntry, SwTabFramePainter } from "./paintfrm";

/** Reads original client registrations. @param owner - Native broadcaster. @returns Borrowed client identities. */
function clients(owner: SwModify): unknown[] {
  const result: unknown[] = [];
  owner.ForAllListeners(
    /** Borrows a registered client. @param client - Actual client. @returns Continue flag. */
    (client) => {
      result.push(client);
      return false;
    },
  );
  return result;
}

it("row parent replacement and copying notify the original clients without replacing the row", /** Checks actual inheritance, independent items and exact notification source. @returns Nothing. */ () => {
  const doc = new SwDoc(),
    table = doc.nodes.MakeTableNode("Row inheritance"),
    row = doc.nodes.AppendTableRow(table, 1),
    format = row.GetFrameFormat(),
    parent = doc.MakeTableLineFormat(),
    source = doc.MakeTableLineFormat();
  parent.SetFormatAttr(new SwFormatFrameSize(SwFrameSize.Minimum, 3000, 720));
  source.SetDerivedFrom(parent);
  source.SetFormatAttr(new SwFormatFrameSize(SwFrameSize.Fixed, 4500, 960));
  source.SetAuto(false);
  const name = format.GetName(),
    revision = doc.GetDocumentStateManager().GetModelRevision(),
    hints: SwModelHint[] = [];
  const observer = new SwClient(
    /** Observes the actual row owner. @param owner - Original broadcaster. @param hint - Native hint. @returns Nothing. */
    (owner, hint) => {
      expect(owner).toBe(format);
      hints.push(hint);
    },
  );
  observer.RegisterToModify(format);
  const before = clients(format);
  try {
    expect(format.SetDerivedFrom(parent)).toBe(true);
    expect(format.GetRegisteredIn()).toBe(parent);
    expect(format.GetAttrSet().GetParent()).toBe(parent.GetAttrSet());
    expect(format.GetFrameSize()).toBe(parent.GetFrameSize());
    expect(hints).toEqual([{ kind: "format-inheritance-changed", formatId: name }]);
    expect(format.SetDerivedFrom(parent)).toBe(false);
    expect(hints).toHaveLength(1);
    format.CopyFormatFrom(source);
    expect(row.GetFrameFormat()).toBe(format);
    expect(clients(format)).toEqual(before);
    expect(format.GetName()).toBe(name);
    expect(format.IsAuto()).toBe(false);
    expect(format.GetAttrSet()).not.toBe(source.GetAttrSet());
    expect(format.GetFrameSize().GetHeight()).toBe(960);
    source.SetFormatAttr(new SwFormatFrameSize(SwFrameSize.Fixed, 4500, 1200));
    expect(format.GetFrameSize().GetHeight()).toBe(960);
    expect(doc.GetDocumentStateManager().GetModelRevision()).toBe(revision);
  } finally {
    observer.Dispose();
    doc.Dispose();
  }
});

it("box format lookup ignores non-box clients and copied attributes retain original box ownership", /** Checks detached and attached native box formats with independent direct items. @returns Nothing. */ () => {
  const doc = new SwDoc(),
    empty = doc.MakeTableBoxFormat(),
    table = doc.nodes.MakeTableNode("Box ownership"),
    row = doc.nodes.AppendTableRow(table, 1),
    box = row.GetTabBoxes()[0];
  expect(box).toBeDefined();
  if (!box) throw Error("Missing original box");
  const format = box.GetFrameFormat(),
    source = doc.MakeTableBoxFormat(),
    observer = new SwClient();
  observer.RegisterToModify(empty);
  try {
    expect(empty.GetTableBox()).toBeUndefined();
    expect(format.GetTableBox()).toBe(box);
    source.SetFormatAttr(new SwFormatFrameSize(SwFrameSize.Minimum, 1800, 600));
    source.SetAuto(false);
    empty.SetDerivedFrom(source);
    format.CopyFormatFrom(empty);
    expect(format.DerivedFrom()).toBe(source);
    expect(format.GetAttrSet().GetParent()).toBe(source.GetAttrSet());
    expect(format.GetTableBox()).toBe(box);
    expect(format.GetFrameSize().GetHeight()).toBe(600);
    format.CopyFormatFrom(source);
    expect(format.GetAttrSet()).not.toBe(source.GetAttrSet());
    expect(format.IsAuto()).toBe(false);
    source.SetFormatAttr(new SwFormatFrameSize(SwFrameSize.Minimum, 1800, 840));
    expect(format.GetFrameSize().GetHeight()).toBe(600);
    expect(box.GetFrameFormat()).toBe(format);
  } finally {
    observer.Dispose();
    doc.Dispose();
  }
});

it("two by two native border painting releases temporary frame clients and returns independent snapshots", /** Checks every original grid boundary, outer flag and paint-copy lifetime. @returns Nothing. */ () => {
  const doc = new SwDoc(),
    table = doc.nodes.MakeTableNode("Grid lifetime"),
    rows = [doc.nodes.AppendTableRow(table, 2), doc.nodes.AppendTableRow(table, 2)],
    owners = rows.flatMap(
      /** Borrows row and cell formats. @param row - Original row. @returns Native owners. */
      (row) => [
        row.GetFrameFormat(),
        ...row.GetTabBoxes().map(
          /** Borrows a cell format. @param box - Original box. @returns Native format. */
          (box) => box.GetFrameFormat(),
        ),
      ],
    ),
    before = owners.map(clients),
    lines: (boolean | number)[][] = [],
    painter = new SwTabFramePainter(table);
  try {
    expect(owners.map(clients)).toEqual(before);
    painter.PaintLines(
      /** Reads immutable stored geometry through the paint copy. @param line - Independent interval. @param horizontal - Family. @returns Nothing. */
      (line, horizontal) => {
        lines.push([horizontal, line.mnKey, line.mnStartPos, line.mnEndPos, line.mbOuter]);
        line.mnEndPos = -10;
        line.maAttribute.SetWordTableCell(true);
      },
    );
    expect(lines).toEqual([
      [false, 0, 0, 1, true],
      [false, 0, 1, 2, true],
      [false, 1, 0, 1, false],
      [false, 1, 1, 2, false],
      [false, 2, 0, 1, true],
      [false, 2, 1, 2, true],
      [true, 0, 0, 1, true],
      [true, 0, 1, 2, true],
      [true, 1, 0, 1, false],
      [true, 1, 1, 2, false],
      [true, 2, 0, 1, true],
      [true, 2, 1, 2, true],
    ]);
    const again: (boolean | number)[][] = [];
    painter.PaintLines(
      /** Re-reads copied original geometry. @param line - Paint copy. @param horizontal - Family. @returns Nothing. */
      (line, horizontal) =>
        again.push([horizontal, line.mnKey, line.mnStartPos, line.mnEndPos, line.mbOuter]),
    );
    expect(again).toEqual(lines);
    expect(owners.map(clients)).toEqual(before);
  } finally {
    doc.Dispose();
  }
});

/** Constructs an independent original border style. @param start - Start coordinate. @param end - End coordinate. @param color - Border color. @param width - Native width. @returns Owned interval. */
function entry(start: number, end: number, color: number, width: number): SwLineEntry {
  return new SwLineEntry(42, start, end, false, new Style(new SvxBorderLine(color, width)));
}

it("insertion order preserves native coordinate order in both paint families", /** Checks independently ordered disjoint intervals in the represented native ordered set. @returns Nothing. */ () => {
  const doc = new SwDoc(),
    painter = new SwTabFramePainter(doc.nodes.MakeTableNode("Unordered source borders")),
    lines: (boolean | number)[][] = [];
  try {
    for (const horizontal of [false, true]) {
      painter.Insert(entry(30, 33, 1, 20), horizontal);
      painter.Insert(entry(60, 63, 2, 20), horizontal);
      painter.Insert(entry(0, 3, 3, 20), horizontal);
      painter.Insert(entry(45, 48, 4, 20), horizontal);
      painter.Insert(entry(15, 18, 5, 20), horizontal);
    }
    painter.PaintLines(
      /** Reads independent source coordinate order. @param line - Paint copy. @param horizontal - Family. @returns Nothing. */
      (line, horizontal) =>
        lines.push([horizontal, line.mnStartPos, line.mnEndPos, line.maAttribute.GetColorPrim()]),
    );
    expect(lines).toEqual([
      [false, 0, 3, 3],
      [false, 15, 18, 5],
      [false, 30, 33, 1],
      [false, 45, 48, 4],
      [false, 60, 63, 2],
      [true, 0, 3, 3],
      [true, 15, 18, 5],
      [true, 30, 33, 1],
      [true, 45, 48, 4],
      [true, 60, 63, 2],
    ]);
  } finally {
    doc.Dispose();
  }
});

it.each([
  { label: "zero length", start: 5, end: 5 },
  { label: "reversed ends", start: 9, end: 3 },
])(
  "degenerate borders do not enter either paint family: $label",
  /** Checks native empty-interval admission before any paint exists. @param interval - Empty source interval. @returns Nothing. */ (
    interval,
  ) => {
    const doc = new SwDoc(),
      painter = new SwTabFramePainter(doc.nodes.MakeTableNode("Empty intervals")),
      lines: SwLineEntry[] = [];
    try {
      painter.Insert(entry(interval.start, interval.end, 1, 20), false);
      painter.Insert(entry(interval.start, interval.end, 2, 40), true);
      painter.PaintLines(
        /** Collects any admitted source interval. @param line - Paint copy. @returns Nothing. */
        (line) => lines.push(line),
      );
      expect(lines).toEqual([]);
    } finally {
      doc.Dispose();
    }
  },
);

it.each([
  {
    label: "touching sorted ends",
    old: [10, 20, 1, 20],
    next: [0, 10, 2, 40],
    overlap: OverlapType.NO_OVERLAP,
    expected: [
      [0, 10, 2],
      [10, 20, 1],
    ],
  },
  {
    label: "following disjoint ends",
    old: [0, 10, 1, 20],
    next: [20, 30, 2, 40],
    overlap: OverlapType.NO_OVERLAP,
    expected: [
      [0, 10, 1],
      [20, 30, 2],
    ],
  },
  {
    label: "extending stronger line",
    old: [0, 8, 1, 20],
    next: [3, 12, 2, 40],
    overlap: OverlapType.OVERLAP1,
    expected: [
      [0, 3, 1],
      [3, 8, 2],
      [8, 12, 2],
    ],
  },
  {
    label: "contained weaker line",
    old: [0, 12, 1, 40],
    next: [3, 9, 2, 20],
    overlap: OverlapType.OVERLAP2,
    expected: [
      [0, 3, 1],
      [3, 9, 1],
      [9, 12, 1],
    ],
  },
  {
    label: "preceding stronger line",
    old: [6, 12, 1, 20],
    next: [0, 9, 2, 40],
    overlap: OverlapType.OVERLAP3,
    expected: [
      [0, 6, 2],
      [6, 9, 2],
      [9, 12, 1],
    ],
  },
  {
    label: "equal style favors new color",
    old: [0, 12, 1, 20],
    next: [0, 12, 2, 20],
    overlap: OverlapType.OVERLAP2,
    expected: [[0, 12, 2]],
  },
])(
  "border families preserve source arbitration: $label",
  /** Checks both independent line families and literal source interval outputs. @param scenario - Source arrangement. @returns Nothing. */ (
    scenario,
  ) => {
    const doc = new SwDoc(),
      painter = new SwTabFramePainter(doc.nodes.MakeTableNode("Arbitration")),
      [a = 0, b = 0, color = 0, width = 0] = scenario.old,
      [c = 0, d = 0, nextColor = 0, nextWidth = 0] = scenario.next;
    try {
      expect(entry(a, b, color, width).Overlaps(entry(c, d, nextColor, nextWidth))).toBe(
        scenario.overlap,
      );
      for (const horizontal of [false, true]) {
        painter.Insert(entry(1, 1, 99, 20), horizontal);
        painter.Insert(entry(a, b, color, width), horizontal);
        painter.Insert(entry(c, d, nextColor, nextWidth), horizontal);
      }
      const lines: (boolean | number)[][] = [];
      painter.PaintLines(
        /** Captures complete line-family partitions. @param line - Resolved original copy. @param horizontal - Independent family. @returns Nothing. */
        (line, horizontal) =>
          lines.push([horizontal, line.mnStartPos, line.mnEndPos, line.maAttribute.GetColorPrim()]),
      );
      expect(lines).toEqual(
        [false, true].flatMap(
          /** Expands literal expected partitions. @param horizontal - Family. @returns Expected boundaries. */
          (horizontal) =>
            scenario.expected.map(
              /** Adds a family to one literal boundary. @param interval - Expected interval. @returns Complete paint boundary. */
              (interval) => [horizontal, ...interval],
            ),
        ),
      );
    } finally {
      doc.Dispose();
    }
  },
);
