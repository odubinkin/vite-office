/** @fileoverview Literal native row counts, independent formats and top-border transfer without upstream execution. */
import { expect, it } from "vitest";
import { SwDoc } from "../doc/doc";
import { SwFormatFrameSize, SwFrameSize } from "../../../inc/fmtfsize";
import { SvxBoxItem } from "../../../../editeng/source/items/frmitems";
import { SvxBorderLine } from "../../../../editeng/source/items/borderline";
import { RES_BOX } from "../../../inc/hintids";
/** Requires a native owner. @param value - Optional owner. @returns Owner. */
function required<T>(value: T | undefined): T {
  if (value === undefined) throw new Error("Missing numeric row owner");
  return value;
}
/** Builds independent native rows. @param borders - Authored top/other borders. @returns Actual document and table. */
function fixture(borders: boolean) {
  const doc = new SwDoc(),
    table = doc.nodes.MakeTableNode("NumericRows"),
    widths = [
      [1000, 5000],
      [1000, 1000, 4000],
      [4000, 2000],
    ];
  table.AddColumnWidth(1000);
  table.AddColumnWidth(5000);
  for (const [row, authored] of widths.entries()) {
    const line = doc.nodes.AppendTableRow(table, authored.length);
    line.SetFormat({
      frameSize: new SwFormatFrameSize(SwFrameSize.Minimum, 0, 240 + row * 100),
      keepTogether: row === 1,
    });
    for (const [column, box] of line.GetTabBoxes().entries()) {
      const size = box.GetFrameSize(),
        item = new SvxBoxItem(RES_BOX);
      size.SetWidth(required(authored[column]));
      item.SetAllDistances(40 + row + column);
      if (borders)
        for (const edge of [0, 1, 2, 3])
          item.SetLine(new SvxBorderLine(0x102030 + row, 10 + edge), edge);
      box.SetFormat({ frameSize: size, ...(borders ? { box: item } : {}) });
      required(box.GetParagraphs()[0]).SetText("r" + row + "c" + column);
    }
  }
  return { doc, table, widths };
}
for (const behind of [false, true])
  for (const count of [1, 2])
    it(
      "native numeric rows transfer top behind=" + behind + " count=" + count,
      /** Checks native copy direction, all edge attributes and independent source geometry. @returns Nothing. */ () => {
        const f = fixture(true),
          originals = [...f.table.GetTabLines()],
          source = required(originals[behind ? 1 : 0]),
          originalFormats = source
            .GetTabBoxes()
            .map(
              /** Saves complete source attributes. @param box - Native box. @returns Format. */ (
                box,
              ) => box.GetFormat(),
            ),
          selection = [
            required(required(originals[0]).GetTabBoxes()[1]),
            required(required(originals[1]).GetTabBoxes()[0]),
          ],
          index = behind ? 2 : 0;
        expect(f.table.InsertRow(f.doc, selection, count, behind)).toBe(true);
        const inserted = f.table.GetTabLines().slice(index, index + count);
        expect(inserted).toHaveLength(count);
        expect(
          f.table
            .GetTabLines()
            .filter(
              /** Preserves original connected rows. @param line - Row. @returns Whether original. */ (
                line,
              ) => !inserted.includes(line),
            ),
        ).toEqual(originals);
        for (const [offset, line] of inserted.entries()) {
          expect(line.GetFormat()).toEqual(source.GetFormat());
          expect(
            line
              .GetTabBoxes()
              .map(
                /** Reads actual native widths. @param box - Cell. @returns Width. */ (box) =>
                  box.GetFrameSize().GetWidth(),
              ),
          ).toEqual(f.widths[behind ? 1 : 0]);
          for (const [column, box] of line.GetTabBoxes().entries()) {
            const format = required(originalFormats[column]),
              item = required(format.box).Clone();
            if (behind || offset > 0) item.SetLine(undefined, 0);
            expect(box.GetFormat()).toEqual({ ...format, box: item });
            expect(box).not.toBe(source.GetTabBoxes()[column]);
            expect(required(box.GetParagraphs()[0]).GetText()).toBe("");
            expect(required(box.GetParagraphs()[0]).GetTextFormatColl()).toBe(
              required(
                required(source.GetTabBoxes()[column]).GetParagraphs()[0],
              ).GetTextFormatColl(),
            );
            expect(box.GetStartNode().StartOfSectionNode()).toBe(f.table.GetTableNode());
          }
        }
        for (const [column, box] of source.GetTabBoxes().entries()) {
          const format = required(originalFormats[column]),
            item = required(format.box).Clone();
          if (!behind) item.SetLine(undefined, 0);
          expect(box.GetFormat()).toEqual({ ...format, box: item });
        }
        expect(f.doc.GetUndoManager().GetUndoActionCount()).toBe(0);
      },
    );
it("native numeric rows preserve absent top items", /** Checks source defaults remain omitted while complete independent frames copy. @returns Nothing. */ () => {
  const f = fixture(false),
    source = required(f.table.GetTabLines()[1]);
  const formats = source
    .GetTabBoxes()
    .map(
      /** Saves original default-free formats. @param box - Cell. @returns Attributes. */ (box) =>
        box.GetFormat(),
    );
  expect(f.doc.InsertRow([required(source.GetTabBoxes()[2])], 2, false)).toBe(true);
  for (const line of f.table.GetTabLines().slice(1, 3))
    expect(
      line
        .GetTabBoxes()
        .map(
          /** Reads actual copied attributes. @param box - Cell. @returns Format. */ (box) =>
            box.GetFormat(),
        ),
    ).toEqual(formats);
  expect(f.doc.GetUndoManager().GetUndoActionCount()).toBe(1);
});
