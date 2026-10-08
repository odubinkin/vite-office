/** @fileoverview Literal native physical selection cases over actual independent row boxes. */
import { expect, it } from "vitest";
import { SwDoc } from "../doc/doc";
import { SwTable, type SwTableBox } from "./swtable";
import { SwPosition } from "../crsr/pam";
import { SwTableCursor } from "../crsr/swcrsr";
import { SwDocShell } from "../../uibase/app/docsh";
import { SwWrtShell } from "../../uibase/wrtsh/wrtsh1";
import { createDocument } from "../../../../sfx2/source/doc/objsh";
import { projectWriterCharacterAttributes } from "../txtnode/txatbase";
/** Requires an actual owner. @param value - Optional owner. @returns Connected owner. */
function required<T>(value: T | undefined): T {
  if (value === undefined) throw new Error("Missing physical selection owner");
  return value;
}
/** Builds actual box frame widths without a projection or shared grid. @param widths - Authored independent rows. @returns Native fixture. */
function fixture(widths: readonly (readonly number[])[]) {
  const doc = new SwDoc(),
    table = doc.nodes.MakeTableNode("Physical");
  for (const width of required(widths[0])) table.AddColumnWidth(width);
  const boxes: SwTableBox[] = [];
  for (const row of widths) {
    const line = doc.nodes.AppendTableRow(table, row.length);
    for (const [column, box] of line.GetTabBoxes().entries()) {
      const size = box.GetFrameSize();
      size.SetWidth(required(row[column]));
      box.SetFrameSize(size);
      required(box.GetParagraphs()[0]).SetText("Cell" + boxes.length);
      boxes.push(box);
    }
  }
  return { doc, table, boxes };
}
const cases: readonly [
  string,
  readonly (readonly number[])[],
  number,
  number,
  0 | 1 | 2,
  readonly number[],
][] = [
  [
    "column borders select different native indices",
    [
      [1000, 5000],
      [1000, 1000, 4000],
      [4000, 2000],
    ],
    4,
    4,
    2,
    [1, 4, 5, 6],
  ],
  [
    "native range selects majority overlap outside index rectangle",
    [
      [1000, 5000],
      [3000, 3000],
      [4000, 2000],
    ],
    1,
    3,
    0,
    [1, 2, 3],
  ],
  [
    "half overlap preserves upper and lower off-range intervals",
    [
      [2000, 2000, 2000],
      [1000, 2000, 3000],
      [2000, 2000, 2000],
      [1000, 2500, 2500],
    ],
    4,
    7,
    2,
    [0, 1, 4, 7, 10],
  ],
  [
    "less than half overlap combines both off-range intervals",
    [
      [2000, 2000, 2000],
      [1000, 2000, 3000],
      [2001, 2000, 1999],
      [1000, 2500, 2500],
    ],
    4,
    7,
    2,
    [1, 4, 6, 7, 10],
  ],
  [
    "reversed endpoints retain sorted physical selection",
    [
      [2000, 2000, 2000],
      [1000, 2000, 3000],
      [2000, 2000, 2000],
      [1000, 2500, 2500],
    ],
    7,
    4,
    2,
    [0, 1, 4, 7, 10],
  ],
  [
    "same line endpoints combine into a native union",
    [
      [1000, 5000],
      [3000, 3000],
      [4000, 2000],
    ],
    3,
    2,
    0,
    [2, 3],
  ],
  [
    "disjoint column endpoints combine over every row",
    [
      [2000, 2000, 2000],
      [1000, 2000, 3000],
      [2000, 2000, 2000],
    ],
    3,
    8,
    2,
    [0, 1, 2, 3, 4, 5, 6, 7, 8],
  ],
  [
    "odd width midpoint truncates at native integer border",
    [
      [4, 6],
      [3, 3, 4],
      [2, 3, 5],
    ],
    3,
    3,
    2,
    [0, 1, 3, 6],
  ],
  ["zero width endpoint remains in native selection", [[1, 0, 9]], 1, 1, 0, [1]],
  [
    "trailing majority selects beyond the integer midpoint",
    [
      [60, 60],
      [100, 20],
    ],
    2,
    2,
    2,
    [0, 1, 2],
  ],
  [
    "row search includes all original unequal count cells",
    [
      [1000, 5000],
      [1000, 1000, 4000],
      [4000, 2000],
    ],
    4,
    6,
    1,
    [2, 3, 4, 5, 6],
  ],
];
for (const [name, widths, start, end, search, expected] of cases)
  it(
    "physical selection " + name,
    /** Checks literal source geometry without reading upstream. @returns Nothing. */ () => {
      const f = fixture(widths),
        selected: SwTableBox[] = [],
        before = [...f.doc.nodes.entries()];
      f.table.CreateSelection(
        required(f.boxes[start]).GetStartNode(),
        required(f.boxes[end]).GetStartNode(),
        selected,
        search,
      );
      expect(selected).toEqual(
        expected.map(
          /** Looks up original owners. @param index - Literal coordinate. @returns Box. */ (
            index,
          ) => f.boxes[index],
        ),
      );
      expect(new Set(selected).size).toBe(selected.length);
      expect(f.doc.nodes.entries()).toEqual(before);
      expect(
        f.table
          .GetTabLines()
          .map(
            /** Reads authored native widths. @param line - Row. @returns Actual widths. */ (
              line,
            ) =>
              line
                .GetTabBoxes()
                .map(
                  /** Reads owned frame size. @param box - Cell. @returns Width. */ (box) =>
                    box.GetFrameSize().GetWidth(),
                ),
          ),
      ).toEqual(widths);
      expect(f.doc.GetUndoManager().GetUndoActionCount()).toBe(0);
    },
  );
it("physical selection retains matched endpoint only when the other is foreign", /** Checks native partial endpoint return and cleared output. @returns Nothing. */ () => {
  const f = fixture([
      [1000, 5000],
      [3000, 3000],
    ]),
    other = f.doc.nodes.MakeTableNode("Other"),
    foreign = required(f.doc.nodes.AppendTableRow(other, 1).GetTabBoxes()[0]),
    selected = [...f.boxes];
  f.table.CreateSelection(
    required(f.boxes[3]).GetStartNode(),
    foreign.GetStartNode(),
    selected,
    SwTable.SEARCH_COL,
  );
  expect(selected).toEqual([f.boxes[3]]);
  f.table.CreateSelection(
    foreign.GetStartNode(),
    foreign.GetStartNode(),
    selected,
    SwTable.SEARCH_NONE,
  );
  expect(selected).toEqual([]);
});
it("physical selection shell rings format actual independent cells with reversible history", /** Checks both native selection ingress paths and unchanged graph geometry. @returns Nothing. */ () => {
  for (const simple of [false, true]) {
    const f = fixture([
        [1000, 2000, 3000],
        [1500, 2000, 2500],
        [2000, 2000, 2000],
      ]),
      docShell = new SwDocShell(
        f.doc,
        createDocument({ id: "physical-selection", suiteId: "writer", title: "Physical" }),
      ),
      shell = new SwWrtShell(docShell);
    try {
      const node = required(required(f.boxes[4]).GetParagraphs()[0]),
        pos = new SwPosition(node, 2),
        before = [...f.doc.nodes.entries()];
      shell.SetCursor(pos);
      pos.Dispose();
      expect(shell.SelTableRowOrCol(false, simple)).toBe(true);
      const cursor = shell.getShellCursor() as SwTableCursor,
        selected = [f.boxes[1], f.boxes[4], f.boxes[7]];
      expect(cursor.GetSelectedBoxes()).toEqual(selected);
      expect(
        new Set(
          [...shell.GetCursor().GetRingContainer()].map(
            /** Reads actual ring section owners. @param range - Native range. @returns Original section. */ (
              range,
            ) => range.GetPoint().GetNode().StartOfSectionNode(),
          ),
        ),
      ).toEqual(
        new Set([
          required(f.boxes[1]).GetStartNode(),
          required(f.boxes[4]).GetStartNode(),
          required(f.boxes[7]).GetStartNode(),
        ]),
      );
      expect(cursor.GetSelectedBoxes()).toEqual(selected);
      expect(shell.ToggleCharacterFormat("bold")).toBe(true);
      for (const [index, box] of f.boxes.entries())
        expect(
          projectWriterCharacterAttributes(required(box.GetParagraphs()[0]).GetCharacterItemsAt(1))
            .bold,
        ).toBe([1, 4, 7].includes(index));
      expect(shell.Undo()).toBe(true);
      expect(shell.HasBoxSelection()).toBe(true);
      expect((shell.getShellCursor() as SwTableCursor).GetSelectedBoxes()).toEqual(selected);
      expect(shell.Redo()).toBe(true);
      expect(f.doc.nodes.entries()).toEqual(before);
      expect(
        f.table
          .GetTabLines()
          .map(
            /** Reads retained row widths. @param line - Native row. @returns Widths. */ (line) =>
              line
                .GetTabBoxes()
                .map(
                  /** Reads original frame. @param box - Original cell. @returns Width. */ (box) =>
                    box.GetFrameSize().GetWidth(),
                ),
          ),
      ).toEqual([
        [1000, 2000, 3000],
        [1500, 2000, 2500],
        [2000, 2000, 2000],
      ]);
    } finally {
      shell.Close();
    }
  }
});
