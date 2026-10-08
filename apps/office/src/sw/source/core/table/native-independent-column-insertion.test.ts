/** @fileoverview Literal native column insertion over independent row positions and widths. */
import { expect, it } from "vitest";
import { SwDoc } from "../doc/doc";
import { type SwTableBox } from "./swtable";
import { SvxBoxItem } from "../../../../editeng/source/items/frmitems";
import { SvxBorderLine } from "../../../../editeng/source/items/borderline";
import { RES_BOX } from "../../../inc/hintids";
/** Requires an actual owner. @param value - Optional owner. @returns Owner. */
function required<T>(value: T | undefined): T {
  if (value === undefined) throw new Error("Missing independent column owner");
  return value;
}
/** Builds independent actual box geometry. @returns Native document and original cells. */
function fixture() {
  const doc = new SwDoc(),
    table = doc.nodes.MakeTableNode("Independent");
  table.AddColumnWidth(1000);
  table.AddColumnWidth(5000);
  const widths = [
      [1000, 5000],
      [1000, 1000, 4000],
      [4000, 2000],
    ],
    boxes: SwTableBox[] = [];
  for (const row of widths) {
    const line = doc.nodes.AppendTableRow(table, row.length);
    for (const [column, box] of line.GetTabBoxes().entries()) {
      const size = box.GetFrameSize(),
        borders = new SvxBoxItem(RES_BOX);
      size.SetWidth(required(row[column]));
      borders.SetAllDistances(30 + boxes.length);
      for (const edge of [0, 1, 2, 3])
        borders.SetLine(new SvxBorderLine(0x102030 + boxes.length, 10 + edge), edge);
      box.SetFormat({ frameSize: size, box: borders });
      required(box.GetParagraphs()[0]).SetText("Cell" + boxes.length);
      boxes.push(box);
    }
  }
  return { doc, table, boxes };
}
const cases: readonly [boolean, number, readonly (readonly number[])[]][] = [
  [
    false,
    1,
    [
      [545, 2727, 2728],
      [545, 546, 2727, 2182],
      [2727, 2182, 1091],
    ],
  ],
  [
    true,
    1,
    [
      [545, 2728, 2727],
      [545, 546, 2182, 2727],
      [2182, 1091, 2727],
    ],
  ],
  [
    false,
    2,
    [
      [375, 1875, 1875, 1875],
      [375, 375, 1875, 1875, 1500],
      [1875, 1875, 1500, 750],
    ],
  ],
  [
    true,
    2,
    [
      [375, 1875, 1875, 1875],
      [375, 375, 1500, 1875, 1875],
      [1500, 750, 1875, 1875],
    ],
  ],
];
for (const [behind, count, expected] of cases)
  it(
    "independent column insertion behind=" + behind + " count=" + count,
    /** Checks literal rounding, row edges, surviving identities and right-border transfer. @returns Nothing. */ () => {
      const f = fixture(),
        lines = f.table.GetTabLines(),
        originals = lines.map(
          /** Reads actual row owners. @param line - Row. @returns Original boxes. */ (line) => [
            ...line.GetTabBoxes(),
          ],
        ),
        positions = behind ? [1, 2, 1] : [1, 2, 0],
        formats = f.boxes.map(
          /** Saves original attributes. @param box - Cell. @returns Independent format. */ (box) =>
            box.GetFormat(),
        ),
        selection = [
          required(f.boxes[1]),
          required(f.boxes[4]),
          required(f.boxes[5]),
          required(f.boxes[6]),
        ];
      expect(f.table.InsertCol(f.doc, selection, count, behind)).toBe(true);
      expect(
        lines.map(
          /** Reads actual native widths. @param line - Row. @returns Widths. */ (line) =>
            line
              .GetTabBoxes()
              .map(
                /** Reads owned width. @param box - Cell. @returns Width. */ (box) =>
                  box.GetFrameSize().GetWidth(),
              ),
        ),
      ).toEqual(expected);
      for (const [row, line] of lines.entries()) {
        const source = required(required(originals[row])[required(positions[row])]),
          index = required(positions[row]) + (behind ? 1 : 0),
          originalFormat = required(formats[f.boxes.indexOf(source)]),
          inserted = line.GetTabBoxes().slice(index, index + count);
        expect(
          line
            .GetTabBoxes()
            .filter(
              /** Removes only freshly inserted cells. @param box - Cell. @returns Whether original. */ (
                box,
              ) => !inserted.includes(box),
            ),
        ).toEqual(originals[row]);
        for (const [offset, box] of inserted.entries()) {
          const borders = required(originalFormat.box).Clone(),
            size = box.GetFrameSize();
          if (!behind || offset + 1 < count) borders.SetLine(undefined, 3);
          expect(box.GetFormat()).toEqual({ ...originalFormat, frameSize: size, box: borders });
          expect(required(box.GetParagraphs()[0]).GetText()).toBe("");
          expect(f.table.GetTableBox(box.GetStartNode().GetIndex())).toBe(box);
        }
        expect(source.GetBox().GetRight()).toEqual(
          behind ? undefined : required(originalFormat.box).GetRight(),
        );
        for (const edge of [0, 1, 2])
          expect(source.GetBox().GetLine(edge)).toEqual(required(originalFormat.box).GetLine(edge));
        expect(
          line
            .GetTabBoxes()
            .reduce(
              /** Adds conserved actual widths. @param sum - Prior sum. @param box - Cell. @returns Total. */ (
                sum,
                box,
              ) => sum + box.GetFrameSize().GetWidth(),
              0,
            ),
        ).toBe(6000);
      }
      expect(f.table.GetTableBox(-1)).toBeUndefined();
      expect(f.doc.GetUndoManager().GetUndoActionCount()).toBe(0);
    },
  );
it("independent columns retain absent right border and native selected-row averaging", /** Checks a borderless source and distinct row edges with source widths. @returns Nothing. */ () => {
  const f = fixture();
  for (const box of f.boxes) box.SetFormat({ frameSize: box.GetFrameSize() });
  expect(
    f.doc.InsertCol([required(f.boxes[0]), required(f.boxes[3]), required(f.boxes[6])], 1, false),
  ).toBe(true);
  expect(
    f.table
      .GetTabLines()
      .map(
        /** Reads widths by actual row. @param line - Row. @returns Widths. */ (line) =>
          line
            .GetTabBoxes()
            .map(
              /** Reads box width. @param box - Cell. @returns Width. */ (box) =>
                box.GetFrameSize().GetWidth(),
            ),
      ),
  ).toEqual([
    [1090, 818, 4092],
    [818, 1090, 818, 3274],
    [3273, 1090, 1637],
  ]);
  for (const line of f.table.GetTabLines())
    for (const box of line.GetTabBoxes()) expect(box.GetFormat().box).toBeUndefined();
});
