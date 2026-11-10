/** @fileoverview Actual InsertTable construction uses native position-dependent default borders, shared source line/box formats and width copy-on-write. */
import { assert, expect, it } from "vitest";
import { SwDoc } from "../doc/doc";
import { SwPosition } from "../crsr/pam";
import { HoriOrientation } from "../../../../offapi/com/sun/star/text/HoriOrientation";
import { SwInsertTableFlags as F } from "../../../inc/itabenum";
import { SwFillOrder, SwFormatFillOrder } from "../../../inc/fmtfordr";
import { RES_FILL_ORDER, RES_BOX, RES_FRM_SIZE } from "../../../inc/hintids";
import { SvxBoxItemLine as E } from "../../../../editeng/source/items/frmitems";
import { SvxBorderLineStyle as S } from "../../../../editeng/source/items/borderline";
/** Requires a connected fixture owner without constructing a substitute. @param value - Actual optional fixture value. @returns Original value. */
function present<T>(value: T | undefined | null): T {
  assert(value !== undefined && value !== null);
  return value;
}
it.each([false, true])(
  "constructs all four source border variants and shares formats in HTML_MODE=%s",
  /** Native layout mode changes actual border color/style, not edge admission or format sharing. @param html - Real document flag. @returns Nothing. */ (
    html,
  ) => {
    const doc = new SwDoc(),
      node = doc.paragraphs[0];
    assert(node);
    doc.GetDocumentSettingManager().set("HTML_MODE", html);
    const p = new SwPosition(node),
      table = present(
        doc.InsertTable(
          { mnInsMode: F.DefaultBorder, mnRowsToRepeat: 0 },
          p,
          3,
          3,
          HoriOrientation.FULL,
        ),
      ),
      lines = table.GetTabLines();
    for (let row = 0; row < 3; row++)
      for (let col = 0; col < 3; col++) {
        const line = present(lines[row]),
          box = present(line.GetTabBoxes()[col]),
          format = box.GetFrameFormat(),
          border = box.GetBox();
        expect(line.GetFrameFormat()).toBe(present(lines[0]).GetFrameFormat());
        expect(line.GetFrameFormat().GetFillOrder().GetValue()).toBe(SwFillOrder.ATT_LEFT_TO_RIGHT);
        expect(format.GetAttrSet().GetItemIfSet(RES_FRM_SIZE, false)).toBeDefined();
        for (const edge of [E.TOP, E.BOTTOM, E.LEFT, E.RIGHT]) {
          const visible = edge === E.TOP ? row === 0 : edge === E.RIGHT ? col === 2 : true,
            stroke = border.GetLine(edge);
          expect(stroke !== undefined).toBe(visible);
          expect(border.GetDistance(edge, true)).toBe(55);
          if (stroke) {
            expect(stroke.GetColor().toUInt32()).toBe(html ? 0x808080 : 0);
            expect(stroke.GetBorderLineStyle()).toBe(html ? S.DOUBLE : S.SOLID);
            expect(stroke.GetWidth()).toBe(10);
          }
        }
        border.Dispose();
      }
    const formats = lines.flatMap(
      /** Reads actual registered owners. @param line - Original row. @returns Formats. */ (line) =>
        line
          .GetTabBoxes()
          .map(
            /** Borrows format identity. @param box - Actual cell. @returns Native owner. */ (
              box,
            ) => box.GetFrameFormat(),
          ),
    );
    expect(new Set(formats).size).toBe(4);
    p.Dispose();
    doc.Dispose();
  },
);
it.each([[[0, 100, 200, 300]], [[0, 100, 300, 400]]])(
  "shares borderless formats until source column widths differ: %s",
  /** A differing width clones an already registered format without altering earlier cells. @param positions - Native vector. @returns Nothing. */ (
    positions,
  ) => {
    const doc = new SwDoc(),
      node = doc.paragraphs[0];
    assert(node);
    const p = new SwPosition(node),
      table = present(
        doc.InsertTable(
          { mnInsMode: 0, mnRowsToRepeat: 0 },
          p,
          2,
          3,
          HoriOrientation.LEFT,
          null,
          positions,
        ),
      ),
      lines = table.GetTabLines(),
      first = present(lines[0]).GetTabBoxes(),
      second = present(lines[1]).GetTabBoxes();
    expect(present(first[0]).GetFrameFormat()).toBe(present(first[2]).GetFrameFormat());
    expect(present(first[0]).GetFrameFormat()).toBe(present(second[0]).GetFrameFormat());
    expect(present(first[1]).GetFrameFormat() === present(first[0]).GetFrameFormat()).toBe(
      positions[2] === 200,
    );
    expect(present(first[1]).GetFrameFormat() === present(second[1]).GetFrameFormat()).toBe(
      positions[2] === 200,
    );
    for (const line of lines) {
      expect(
        line
          .GetTabBoxes()
          .map(
            /** Reads real width. @param box - Native cell. @returns Twips. */ (box) =>
              box.GetFrameSize().GetWidth(),
          ),
      ).toEqual(positions[2] === 200 ? [100, 100, 100] : [100, 200, 100]);
      for (const box of line.GetTabBoxes())
        expect(box.GetFrameFormat().GetAttrSet().GetItemIfSet(RES_BOX, false)).toBeUndefined();
    }
    p.Dispose();
    doc.Dispose();
  },
);
it("keeps native fill-order static default and concrete snapshot restoration independent of insertion", /** The document default is TOP_DOWN even though insertion explicitly sets LEFT_TO_RIGHT. Original Clone restores its declared WhichId. @returns Nothing. */ () => {
  const doc = new SwDoc(),
    item = doc.GetAttrPool().GetUserOrPoolDefaultItem(RES_FILL_ORDER);
  expect(item).toBeInstanceOf(SwFormatFillOrder);
  expect((item as SwFormatFillOrder).GetValue()).toBe(SwFillOrder.ATT_TOP_DOWN);
  const value = new SwFormatFillOrder(SwFillOrder.ATT_RIGHT_TO_LEFT),
    restored = doc.GetAttrPool().CreateItem({ which: RES_FILL_ORDER, value: value.QueryValue() });
  expect(restored).toBeInstanceOf(SwFormatFillOrder);
  expect((restored as SwFormatFillOrder).GetValue()).toBe(SwFillOrder.ATT_RIGHT_TO_LEFT);
  const row = doc.MakeTableLineFormat();
  expect(row.GetFillOrder()).toBe(item);
  expect(row.GetAttrSet().GetFillOrder()).toBe(item);
  value.SetWhich(0);
  const clone = value.Clone();
  expect(clone.Which()).toBe(RES_FILL_ORDER);
  expect(clone.GetValue()).toBe(SwFillOrder.ATT_RIGHT_TO_LEFT);
  clone.Dispose();
  value.Dispose();
  restored.Dispose();
  doc.Dispose();
});
