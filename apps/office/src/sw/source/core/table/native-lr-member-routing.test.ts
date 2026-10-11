/** @fileoverview Verifies original published LR UNO member identities against concrete native sides, independent context and actual table history. */
import { expect, it } from "vitest";
import {
  SvxIndentValue,
  SvxFontUnitMetrics,
  SvxLRSpaceItem,
} from "../../../../editeng/inc/lrspitem";
import {
  MID_FIRST_LINE_UNIT_INDENT,
  MID_R_UNIT_MARGIN,
  MID_L_UNIT_MARGIN,
} from "../../../../editeng/inc/memberids";
import { MeasureUnit as U } from "../../../../offapi/com/sun/star/util/MeasureUnit";
import { createWriterDocumentSession } from "../../../browser/composition/writer-module";
import { SfxItemSet } from "../../../../svl/source/items/itemset";
import { RES_LR_SPACE } from "../../../inc/hintids";
/** Requires an original native owner. @param value - Candidate. @returns Native owner. */
function required<T>(value: T | undefined): T {
  if (value === undefined) throw Error("Missing native member owner");
  return value;
}
/** Authors independent native field/proportion context. @returns Original item. */
function authored(): SvxLRSpaceItem {
  const item = new SvxLRSpaceItem(
    new SvxIndentValue(2.5, U.FONT_CJK_ADVANCE),
    new SvxIndentValue(1.25, U.FONT_EM),
    SvxIndentValue.twips(17),
    RES_LR_SPACE,
  );
  item.PutValue(51, 6);
  item.PutValue(66, 7);
  item.SetPropTextFirstLineOffset(24);
  item.SetGutterMargin(31);
  item.SetRightGutterMargin(43);
  item.SetAutoFirst(true);
  item.SetExplicitZeroMarginValLeft(true);
  item.SetExplicitZeroMarginValRight(true);
  return item;
}
it("published original member identities retain first13/right14/left15", /** Checks native protocol independently of roundtrip logic. @returns Nothing. */ () => {
  expect(MID_FIRST_LINE_UNIT_INDENT).toBe(13);
  expect(MID_R_UNIT_MARGIN).toBe(14);
  expect(MID_L_UNIT_MARGIN).toBe(15);
});
it.each([0, 0x80])(
  "native pair query%s reads concrete independent right/left sides",
  /** Reads native absolute/font pairs with conversion bit. @param convert - Native flag. @returns Nothing. */ (
    convert,
  ) => {
    const item = authored(),
      before = item.Clone();
    expect(item.QueryValue(14 | convert)).toEqual({ First: 1.25, Second: U.FONT_EM });
    expect(item.QueryValue(15 | convert)).toEqual({ First: 2.5, Second: U.FONT_CJK_ADVANCE });
    expect(item.QueryValue(13 | convert)).toBeUndefined();
    expect(item.QueryValue(5 | convert)).toBeUndefined();
    expect(item.QueryValue(11 | convert)).toBeUndefined();
    expect(item.QueryValue(8 | convert)).toBe(convert ? 30 : 17);
    expect(item.equals(before)).toBe(true);
    const metrics = new SvxFontUnitMetrics(120, 180);
    expect(item.ResolveRight(metrics)).toBe(150);
    expect(item.ResolveTextLeft(metrics)).toBe(450);
  },
);
it.each([
  [13, 0],
  [13, 0x80],
  [14, 0],
  [14, 0x80],
  [15, 0],
  [15, 0x80],
] as const)(
  "native pair member%s conversion%s updates its original side and no sibling context",
  /** Applies original identity to concrete sides. @param member - Native ID. @param convert - Native flag. @returns Nothing. */ (
    member,
    convert,
  ) => {
    const item = authored(),
      expected = item.Clone(),
      input: { First: number; Second: number } = { First: 1.75, Second: U.FONT_EM },
      left = item.GetLeft(),
      right = item.GetRight(),
      first = item.GetTextFirstLineOffset();
    if (member === 13) expected.SetTextFirstLineOffset(new SvxIndentValue(1.75, U.FONT_EM));
    else if (member === 14) expected.SetRight(new SvxIndentValue(1.75, U.FONT_EM));
    else expected.SetTextLeft(new SvxIndentValue(1.75, U.FONT_EM));
    expect(item.PutValue(input, member | convert)).toBe(true);
    expect(item.equals(expected)).toBe(true);
    expect(item.GetLeft()).toBe(left);
    expect(item.GetRight()).toBe(right);
    expect(item.GetTextFirstLineOffset()).toBe(first);
    expect(item.GetLeft().m_dValue).toBe(member === 15 ? 1.75 : 2.5);
    expect(item.GetRight().m_dValue).toBe(member === 14 ? 1.75 : 1.25);
    expect(item.GetTextFirstLineOffset().m_dValue).toBe(member === 13 ? 1.75 : 17);
    expect([item.GetPropLeft(), item.GetPropRight(), item.GetPropTextFirstLineOffset()]).toEqual([
      member === 15 ? 100 : 51,
      member === 14 ? 100 : 66,
      member === 13 ? 100 : 24,
    ]);
    expect([
      item.GetGutterMargin(),
      item.GetRightGutterMargin(),
      item.IsAutoFirst(),
      item.IsExplicitZeroMarginValLeft(),
      item.IsExplicitZeroMarginValRight(),
    ]).toEqual([31, 43, true, true, true]);
    input.First = 9;
    input.Second = U.TWIP;
    expect(item.equals(expected)).toBe(true);
    const clone = item.Clone();
    expect(clone.equals(item)).toBe(true);
    expect(clone.GetLeft()).not.toBe(left);
    expect(clone.GetRight()).not.toBe(right);
    expect(clone.GetTextFirstLineOffset()).not.toBe(first);
    clone.SetRight(SvxIndentValue.twips(99));
    expect(item.equals(expected)).toBe(true);
    expect(clone.equals(item)).toBe(false);
  },
);
it.each([14, 15])(
  "native member%s retains concrete hanging-indent setter effects",
  /** Uses actual source empty-font context while preserving unrelated native fields. @param member - Original ID. @returns Nothing. */ (
    member,
  ) => {
    const item = new SvxLRSpaceItem(
      SvxIndentValue.twips(200),
      SvxIndentValue.twips(70),
      SvxIndentValue.twips(-30),
      RES_LR_SPACE,
    );
    const first = item.GetTextFirstLineOffset();
    expect(item.GetLeft()).toEqual(SvxIndentValue.twips(170));
    expect(item.PutValue({ First: 2.5, Second: U.FONT_EM }, member)).toBe(true);
    expect(item.GetLeft()).toEqual(SvxIndentValue.twips(member === 14 ? 170 : -30));
    expect(item.GetRight()).toEqual(
      member === 14 ? new SvxIndentValue(2.5, U.FONT_EM) : SvxIndentValue.twips(70),
    );
    expect(item.GetTextFirstLineOffset()).toBe(first);
    expect(first).toEqual(SvxIndentValue.twips(-30));
    expect(item.ResolveTextLeft(new SvxFontUnitMetrics(120, 180))).toBe(member === 14 ? 200 : 0);
    expect(item.ResolveRight(new SvxFontUnitMetrics(120, 180))).toBe(member === 14 ? 300 : 70);
  },
);
it.each([
  null,
  [],
  false,
  0,
  {},
  { First: "1", Second: U.FONT_EM },
  { First: 1, Second: 19.5 },
  { First: 1, Second: -32769 },
  { First: 1, Second: 32768 },
])(
  "invalid native pair%s rejects without changing any original fields",
  /** Checks all original sides and conversion variants. @param input - Malformed pair. @returns Nothing. */ (
    input,
  ) => {
    for (const member of [13, 14, 15])
      for (const convert of [0, 0x80]) {
        const item = authored(),
          before = item.Clone(),
          left = item.GetLeft(),
          right = item.GetRight(),
          first = item.GetTextFirstLineOffset();
        expect(item.PutValue(input, member | convert)).toBe(false);
        expect(item.equals(before)).toBe(true);
        expect(item.GetLeft()).toBe(left);
        expect(item.GetRight()).toBe(right);
        expect(item.GetTextFirstLineOffset()).toBe(first);
      }
  },
);
it.each([14, 15])(
  "native table member%s preserves original side and item context through three UndoRedo cycles",
  /** Changes the native LR item via original shell/ItemSet. @param member - Native ID. @returns Nothing. */ (
    member,
  ) => {
    const session = createWriterDocumentSession(),
      doc = session.docShell.GetDoc(),
      shell = session.view.GetWrtShell();
    try {
      const table = doc.nodes.MakeTableNode("NativeMemberRouting", { width: 3000 }),
        frame = table.GetFrameFormat();
      table.AddColumnWidth(3000);
      const row = doc.nodes.AppendTableRow(table, 1),
        box = required(row.GetTabBoxes()[0]),
        node = required(box.GetParagraphs()[0]);
      node.SetText("Original native sides");
      shell.FocusNode(node);
      const before = authored();
      frame.SetFormatAttr(before);
      doc.GetUndoManager().Clear();
      const cursor = shell.GetCursor(),
        nodes = [...doc.nodes.entries()],
        after = before.Clone();
      expect(after.PutValue({ First: 3.25, Second: U.FONT_CJK_ADVANCE }, member | 0x80)).toBe(true);
      expect(after.GetLeft().m_dValue).toBe(member === 15 ? 3.25 : 2.5);
      expect(after.GetRight().m_dValue).toBe(member === 14 ? 3.25 : 1.25);
      const input = new SfxItemSet(doc.GetAttrPool(), [[RES_LR_SPACE, RES_LR_SPACE]]);
      input.Put(after);
      expect(shell.SetTableAttr(input)).toBe(true);
      for (let cycle = 0; cycle < 3; cycle++) {
        expect(shell.Undo()).toBe(true);
        expect(frame.GetLRSpace().equals(before)).toBe(true);
        expect(frame.GetLRSpace().QueryValue(14)).toEqual({ First: 1.25, Second: U.FONT_EM });
        expect(frame.GetLRSpace().QueryValue(15)).toEqual({
          First: 2.5,
          Second: U.FONT_CJK_ADVANCE,
        });
        expect(shell.Redo()).toBe(true);
        expect(frame.GetLRSpace().equals(after)).toBe(true);
        expect(frame.GetLRSpace().GetLeft().m_dValue).toBe(member === 15 ? 3.25 : 2.5);
        expect(frame.GetLRSpace().GetRight().m_dValue).toBe(member === 14 ? 3.25 : 1.25);
        expect(shell.GetCursor()).toBe(cursor);
        expect(doc.nodes.entries()).toEqual(nodes);
        expect(table.GetFrameFormat()).toBe(frame);
        expect(table.GetTabLines()[0]).toBe(row);
        expect(row.GetTabBoxes()[0]).toBe(box);
        expect(box.GetParagraphs()[0]).toBe(node);
      }
      expect(input.Get(RES_LR_SPACE)).toEqual(after);
      expect(before.GetLeft().m_dValue).toBe(2.5);
      expect(before.GetRight().m_dValue).toBe(1.25);
      expect(doc.GetUndoManager().GetUndoActionCount()).toBe(1);
    } finally {
      session.Close();
    }
  },
);
