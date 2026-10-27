/** @fileoverview Verifies native character-format ownership, source portion building, notification and Worker transport. */
import { assert, expect, it } from "vitest";
import { SfxItemSet } from "../../../../svl/source/items/itemset";
import { SwFormatAutoFormat } from "./txatbase";
import { SwDoc } from "../doc/doc";
import { SwFormatCharFormat, SwFormatINetFormat } from "./fmtatr2";
import { SwTextCharFormat } from "./txtatr2";
import { MakeTextAttr } from "./thints";
import { SwpHints } from "./ndhints";
import { SwAttrIter } from "../text/itratr";
import { SvxWeightItem, SvxPostureItem } from "../../../../editeng/source/items/textitem";
import { FontWeight, FontItalic } from "../../../../tools/inc/fontenum";
import { SwPoolFormatId as P } from "../../../inc/poolfmt";
import { SetAttrMode } from "../../../inc/swtypes";
import { SwPaM, SwPosition } from "../crsr/pam";
import { SwClient } from "../../../inc/calbck";
import { UpdateAttrHint, SwUpdateAttr } from "../../../inc/hints";
import {
  RES_CHRATR_WEIGHT,
  RES_CHRATR_POSTURE,
  RES_TXTATR_CHARFMT,
  RES_TXTATR_INETFMT,
  WRITER_CHARACTER_WHICH_RANGES,
  RES_UPDATEATTR_ATTRSET_CHG,
} from "../../../inc/hintids";
import {
  encodeWriterDocument,
  decodeWriterDocument,
} from "../../../browser/filter/xml/writer-document-codec";

it("builds native shared boundaries and style order, and merges complete replacement portions", /** Exercises real document insertion, controls and formatter stacks without run-to-style reconstruction. @returns Nothing. */ () => {
  const doc = new SwDoc(),
    node = doc.paragraphs[0];
  assert(node);
  node.SetText("abcdef");
  const first = new SwPosition(node, 0),
    last = new SwPosition(node, 6),
    range = new SwPaM(last, first);
  try {
    const strong = doc.GetCharFormatFromPool(P.CHR_HTML_STRONG),
      emphasis = doc.GetCharFormatFromPool(P.CHR_HTML_EMPHASIS);
    assert(strong && emphasis);
    doc.InsertPoolItem(range, new SwFormatCharFormat(strong));
    range.GetMark().Assign(node, 2);
    range.GetPoint().Assign(node, 4);
    doc.InsertPoolItem(range, new SwFormatCharFormat(emphasis), SetAttrMode.DONTREPLACE);
    const hints = node.GetpSwpHints();
    assert(hints);
    expect(
      hints
        .entries()
        .map(
          /** Verifies builds native shared boundaries and style order, and merges complete replacement portions. @param h - h value. @returns Callback result. */ (
            h,
          ) => [
            h.start,
            h.end,
            h.format.QueryValue(),
            h instanceof SwTextCharFormat ? h.GetSortNumber() : -1,
          ],
        ),
    ).toEqual([
      [0, 2, "Strong Emphasis", 0],
      [2, 4, "Strong Emphasis", 0],
      [2, 4, "Emphasis", 1],
      [4, 6, "Strong Emphasis", 0],
    ]);
    const iterator = new SwAttrIter(node);
    iterator.Seek(3);
    expect(
      (iterator.GetAttrHandler().ReadItem(RES_CHRATR_WEIGHT) as SvxWeightItem).GetWeight(),
    ).toBe(FontWeight.WEIGHT_BOLD);
    expect(
      (iterator.GetAttrHandler().ReadItem(RES_CHRATR_POSTURE) as SvxPostureItem).GetPosture(),
    ).toBe(FontItalic.ITALIC_NORMAL);
    expect(node.GetCharacterItemsAt(3).Get(RES_CHRATR_POSTURE).QueryValue()).toBe(
      emphasis.GetAttrSet().Get(RES_CHRATR_POSTURE).QueryValue(),
    );
    expect(node.GetTextRangeFormatState(0, 6, "italic")).toBe("mixed");
    range.GetMark().Assign(node, 0);
    range.GetPoint().Assign(node, 6);
    doc.InsertPoolItem(range, new SwFormatCharFormat(strong), SetAttrMode.DONTREPLACE);
    const middle = hints
      .entries()
      .filter(
        /** Verifies builds native shared boundaries and style order, and merges complete replacement portions. @param hint - hint value. @returns Callback result. */ (
          hint,
        ) => hint.start === 2 && hint.end === 4,
      );
    expect(
      middle.map(
        /** Verifies builds native shared boundaries and style order, and merges complete replacement portions. @param hint - hint value. @returns Callback result. */ (
          hint,
        ) => (hint instanceof SwTextCharFormat ? hint.GetSortNumber() : -1),
      ),
    ).toEqual([1, 1]);
    expect(node.InsertItem(new SwFormatCharFormat(strong), 0, 6)).toBeUndefined();
    expect(hints.Count()).toBe(1);
    expect(hints.Get(0).GetEnd()).toBe(6);
    expect(node.GetTextRangeFormatState(0, 6, "bold")).toBe("on");
  } finally {
    range.Dispose();
    first.Dispose();
    last.Dispose();
    doc.Dispose();
  }
});
it("forwards original range updates and retains actual style identity through clones and Worker reconstruction", /** Checks live owner changes rather than only initial imported item values. @returns Nothing. */ () => {
  const doc = new SwDoc(),
    node = doc.paragraphs[0];
  assert(node);
  node.SetText("abcd");
  const style = doc.MakeCharFormat("Named", doc.GetDfltCharFormat());
  const item = new SwFormatCharFormat(style),
    hint = MakeTextAttr(doc, item, 1, 3);
  assert(hint instanceof SwTextCharFormat);
  hint.SetSortNumber(7);
  hint.SetDontExpand(true);
  hint.SetDontExpandStartAttr(true);
  hint.SetPriorityAttr(true);
  node.SetTextHints(new SwpHints(doc.GetAttrPool(), [hint]));
  const updates: UpdateAttrHint[] = [];
  const observer = new SwClient(
    /** Verifies forwards original range updates and retains actual style identity through clones and Worker reconstruction. @param _source - _source value. @param event - event value. @returns Nothing. */ (
      _source,
      event,
    ) => {
      if (event.kind === "update-attr") updates.push(event);
    },
  );
  observer.RegisterToModify(node);
  try {
    const clone = item.Clone();
    expect(clone.GetCharFormat()).toBe(style);
    expect(clone.m_pTextAttribute).toBeUndefined();
    style.SetFormatAttr(new SvxWeightItem(FontWeight.WEIGHT_BOLD, RES_CHRATR_WEIGHT));
    expect(updates).toHaveLength(1);
    expect(updates[0]?.m_pOld).toBe(updates[0]?.m_pNew);
    expect(updates[0]?.m_pNew?.getStart()).toBe(1);
    expect(updates[0]?.m_pNew?.getEnd()).toBe(3);
    expect(updates[0]?.m_pNew?.getWhichAttr()).toBe(RES_UPDATEATTR_ATTRSET_CHG);
    const record = structuredClone(encodeWriterDocument(doc)),
      copy = decodeWriterDocument(record);
    try {
      expect(encodeWriterDocument(copy)).toEqual(record);
      const copiedNode = copy.paragraphs[0],
        copiedStyle = copy.FindCharFormatByName("Named");
      assert(copiedNode && copiedStyle);
      const copiedHint = copiedNode.GetpSwpHints()?.Get(0);
      assert(copiedHint instanceof SwTextCharFormat);
      expect(copiedHint.GetAttr().GetCharFormat()).toBe(copiedStyle);
      expect(copiedHint.GetpTextNode()).toBe(copiedNode);
      expect(copiedHint.GetSortNumber()).toBe(7);
      copiedStyle.SetFormatAttr(new SvxWeightItem(FontWeight.WEIGHT_NORMAL, RES_CHRATR_WEIGHT));
      expect(copiedNode.GetTextRangeFormatState(1, 3, "bold")).toBe("off");
      expect(node.GetTextRangeFormatState(1, 3, "bold")).toBe("on");
    } finally {
      copy.Dispose();
    }
  } finally {
    observer.Dispose();
    doc.Dispose();
  }
});
it("keeps native character name disambiguation and copies actual foreign style graphs", /** Checks custom names that collide with programmatic pool names and constructor flags across pools. @returns Nothing. */ () => {
  const source = new SwDoc(),
    destination = new SwDoc();
  try {
    for (const [ui, programmatic] of [
      ["Bullets", "Bullet Symbols"],
      ["Bullet Symbols", "Bullet Symbols (user)"],
      ["Custom (user)", "Custom"],
      ["No Character Style", "Standard"],
    ]) {
      assert(ui !== undefined && programmatic !== undefined);
      expect(
        new SwFormatCharFormat(source.MakeCharFormat(ui, source.GetDfltCharFormat())).QueryValue(),
      ).toBe(programmatic);
    }
    const strong = source.GetCharFormatFromPool(P.CHR_HTML_STRONG);
    assert(strong);
    const custom = source.MakeCharFormat("Custom Child", strong);
    const copied = MakeTextAttr(destination, new SwFormatCharFormat(custom), 0, 2);
    assert(copied instanceof SwTextCharFormat);
    const format = copied.GetAttr().GetCharFormat();
    assert(format);
    expect(format.GetDoc()).toBe(destination);
    expect(format.DerivedFrom()?.GetPoolFormatId()).toBe(P.CHR_HTML_STRONG);
    expect(format.GetAttrSet().Get(RES_CHRATR_WEIGHT).QueryValue()).toBe(
      strong.GetAttrSet().Get(RES_CHRATR_WEIGHT).QueryValue(),
    );
    expect(copied.Which()).toBe(RES_TXTATR_CHARFMT);
    expect(copied.IsCharFormatAttr()).toBe(true);
    expect(copied.IsNesting()).toBe(false);
    const defaultLink = destination.GetAttrPool().GetUserOrPoolDefaultItem(RES_TXTATR_INETFMT);
    assert(defaultLink instanceof SwFormatINetFormat);
    expect(defaultLink.GetINetFormatId()).toBe(P.CHR_INET_NORMAL);
    expect(defaultLink.GetVisitedFormatId()).toBe(P.CHR_INET_VISIT);
    expect(SwFormatINetFormat.CreateDefault().GetINetFormatId()).toBe(P.ZERO);
    expect(SwFormatINetFormat.CreateDefault().GetVisitedFormatId()).toBe(P.ZERO);
  } finally {
    destination.Dispose();
    source.Dispose();
  }
});
it("owns native update value fields independently of the caller vector", /** Verifies owns native update value fields independently of the caller vector. @returns Nothing. */ () => {
  const fields = [1, 65537];
  const value = new SwUpdateAttr(2, 5, 65537, fields);
  fields[0] = 9;
  expect(value.getFmtAttrs()).toEqual([1, 1]);
  expect(value.getWhichAttr()).toBe(1);
  expect(value.getStart()).toBe(2);
  expect(value.getEnd()).toBe(5);
});

it("keeps a direct value equal to the paragraph when a character style would otherwise override it", /** Exercises the real automatic-style portion branch and subsequent named-style replacement. @returns Nothing. */ () => {
  const doc = new SwDoc(),
    node = doc.paragraphs[0];
  assert(node);
  node.SetText("abcd");
  const strong = doc.GetCharFormatFromPool(P.CHR_HTML_STRONG);
  assert(strong);
  const start = new SwPosition(node, 1),
    end = new SwPosition(node, 3),
    range = new SwPaM(end, start);
  try {
    node.SetAttr(new SvxWeightItem(FontWeight.WEIGHT_NORMAL, RES_CHRATR_WEIGHT));
    doc.InsertPoolItem(range, new SwFormatCharFormat(strong));
    const items = new SfxItemSet(doc.GetAttrPool(), WRITER_CHARACTER_WHICH_RANGES);
    items.Put(new SvxWeightItem(FontWeight.WEIGHT_NORMAL, RES_CHRATR_WEIGHT));
    doc.InsertPoolItem(range, new SwFormatAutoFormat(items));
    expect(node.GetTextRangeFormatState(1, 3, "bold")).toBe("off");
    expect(
      node
        .GetpSwpHints()
        ?.entries()
        .some(
          /** Verifies keeps a direct value equal to the paragraph when a character style would otherwise override it. @param hint - hint value. @returns Callback result. */ (
            hint,
          ) => hint.format instanceof SwFormatAutoFormat,
        ),
    ).toBe(true);
    doc.InsertPoolItem(range, new SwFormatCharFormat(strong));
    expect(node.GetTextRangeFormatState(1, 3, "bold")).toBe("on");
    expect(
      node
        .GetpSwpHints()
        ?.entries()
        .some(
          /** Verifies keeps a direct value equal to the paragraph when a character style would otherwise override it. @param hint - hint value. @returns Callback result. */ (
            hint,
          ) => hint.format instanceof SwFormatAutoFormat,
        ),
    ).toBe(false);
    const onlyItems = new SfxItemSet(doc.GetAttrPool(), WRITER_CHARACTER_WHICH_RANGES);
    node.GetParaAttr(onlyItems, 2, 2, true, false);
    expect(onlyItems.Count()).toBe(0);
  } finally {
    range.Dispose();
    start.Dispose();
    end.Dispose();
    doc.Dispose();
  }
});
