/** @fileoverview Source-contract checks for native CSS parser options, owned maps and public scalar property merges. */
import { expect, it } from "vitest";
import { SwDoc } from "../../core/doc/doc";
import { SvxCSS1Parser, aItemIds } from "./svxcss1";
import { SvxCSS1PropertyInfo } from "./svxcss1.types";
import { SfxItemSet } from "../../../../svl/source/items/itemset";
import { SvxULSpaceItem } from "../../../../editeng/inc/ulspitem";
import { SvxAdjust } from "../../../../editeng/inc/svxenum";
import { RTL_TEXTENCODING_UTF8, RTL_TEXTENCODING_DONTKNOW } from "../../../../sal/inc/rtl/textenc";
import {
  SvxFirstLineIndentItem,
  SvxTextLeftMarginItem,
  SvxRightMarginItem,
  SvxIndentValue,
} from "../../../../editeng/inc/lrspitem";
import { RES_MARGIN_FIRSTLINE, RES_MARGIN_TEXTLEFT, RES_MARGIN_RIGHT } from "../../../inc/hintids";
import * as EditEngine from "../../../../editeng/inc/editeng";
import { EE_PARA_WRITINGDIR } from "../../../../editeng/inc/eeitem";
import { SvxFrameDirectionItem } from "../../../../editeng/inc/frmdiritem";
import { SvxFrameDirection } from "../../../../editeng/inc/frmdir";

it("clears the actual EditEngine direction item while retaining parsed character declarations", /** The original complete EditEngine package supplies SID_ATTR_FRAMEDIRECTION without replacing the pool or slot mapper. @returns Nothing. */ () => {
  const pool = EditEngine.CreatePool(),
    parser = new SvxCSS1Parser(pool, ""),
    items = new SfxItemSet(pool, parser.GetWhichMap()),
    info = new SvxCSS1PropertyInfo(),
    direction = new SvxFrameDirectionItem(SvxFrameDirection.Horizontal_RL_TB, EE_PARA_WRITINGDIR);
  try {
    expect(aItemIds.nDirection).toBe(EE_PARA_WRITINGDIR);
    items.Put(direction);
    expect(items.GetItemIfSet(EE_PARA_WRITINGDIR, false)).toBeDefined();
    parser.ParseStyleOption("font-weight: bold", items, info);
    expect(items.GetItemIfSet(EE_PARA_WRITINGDIR, false)).toBeUndefined();
    expect(items.GetItemIfSet(aItemIds.nWeight, false)).toBeDefined();
  } finally {
    direction.Dispose();
    items.Dispose();
    parser.SourceDispose();
    pool.sendShutdownHint();
  }
});

it("retains native parser options and font-size defaults across stylesheet groups", /** The concrete base parser intentionally has an empty StyleParsed hook; its complete lifecycle remains callable. @returns Nothing. */ () => {
  const doc = new SwDoc(),
    parser = new SvxCSS1Parser(doc.GetAttrPool(), "https://example.test/styles/", [0]);
  try {
    expect(parser.GetBaseURL()).toBe("https://example.test/styles/");
    expect(parser.GetDfltEncoding()).toBe(RTL_TEXTENCODING_DONTKNOW);
    parser.SetDfltEncoding(RTL_TEXTENCODING_UTF8);
    expect(parser.GetDfltEncoding()).toBe(RTL_TEXTENCODING_UTF8);
    expect(parser.IsIgnoreFontFamily()).toBe(false);
    parser.SetIgnoreFontFamily(true);
    expect(parser.IsIgnoreFontFamily()).toBe(true);
    expect(
      Array.from(
        { length: 8 },
        /** Checks the native seven-size table and its default. @param _ - Unused array entry. @param index - Size index. @returns Font height. */ (
          _,
          index,
        ) => parser.GetFontHeight(index),
      ),
    ).toEqual([160, 200, 220, 240, 340, 400, 640, 640]);
    expect(parser.ParseStyleSheet("p, .body { color: red } h1 { font-weight: bold }")).toBe(true);
    expect(parser.ParseStyleSheet("p { font-style: italic }")).toBe(true);
  } finally {
    parser.SourceDispose();
    doc.Dispose();
  }
});

it("preserves omitted margin items and replaces explicitly supplied sides", /** Native smart merging consults each public property flag independently of the pooled items. @returns Nothing. */ () => {
  const doc = new SwDoc(),
    parser = new SvxCSS1Parser(doc.GetAttrPool(), ""),
    source = new SfxItemSet(doc.GetAttrPool(), parser.GetWhichMap()),
    target = new SfxItemSet(doc.GetAttrPool(), parser.GetWhichMap()),
    info = new SvxCSS1PropertyInfo(),
    targetInfo = new SvxCSS1PropertyInfo(),
    first = new SvxFirstLineIndentItem(SvxIndentValue.twips(120), RES_MARGIN_FIRSTLINE),
    left = new SvxTextLeftMarginItem(SvxIndentValue.twips(240), RES_MARGIN_TEXTLEFT),
    right = new SvxRightMarginItem(SvxIndentValue.twips(360), RES_MARGIN_RIGHT);
  try {
    source.Put(first);
    source.Put(left);
    source.Put(right);
    SvxCSS1Parser.MergeStyles(source, info, target, targetInfo, true);
    expect(target.GetItemIfSet(RES_MARGIN_FIRSTLINE, false)).toBeUndefined();
    expect(target.GetItemIfSet(RES_MARGIN_TEXTLEFT, false)).toBeUndefined();
    expect(target.GetItemIfSet(RES_MARGIN_RIGHT, false)).toBeUndefined();
    info.m_bTextIndent = info.m_bLeftMargin = info.m_bRightMargin = true;
    SvxCSS1Parser.MergeStyles(source, info, target, targetInfo, true);
    expect(target.Get(RES_MARGIN_FIRSTLINE).equals(first)).toBe(true);
    expect(target.Get(RES_MARGIN_TEXTLEFT).equals(left)).toBe(true);
    expect(target.Get(RES_MARGIN_RIGHT).equals(right)).toBe(true);
    expect(targetInfo.m_bTextIndent).toBe(true);
    expect(
      /** Exercises the erased base overload without native target arguments. @returns Never. */ () =>
        parser.ParseStyleOption("color: red"),
    ).toThrow("assert(ParseStyleOption native arguments)");
    expect(
      /** Exercises the missing native property-info argument. @returns Never. */ () =>
        parser.ParseStyleOption("color: red", target),
    ).toThrow("assert(ParseStyleOption native arguments)");
    parser.ParseStyleOption("font-weight: bold", target, targetInfo);
    expect(target.GetItemIfSet(aItemIds.nWeight, false)).not.toBeUndefined();
  } finally {
    first.Dispose();
    left.Dispose();
    right.Dispose();
    source.Dispose();
    target.Dispose();
    parser.SourceDispose();
    doc.Dispose();
  }
});

it("copies and clears native public scalar state with the source preserve-space and visibility omissions", /** These are original public property fields, not private parser counters or replacement owners. @returns Nothing. */ () => {
  const source = new SvxCSS1PropertyInfo();
  source.m_aId = "example";
  source.m_bPreserveSpace = true;
  source.m_bVisible = false;
  source.m_bTopMargin = source.m_bBottomMargin = true;
  source.m_bLeftMargin = source.m_bRightMargin = source.m_bTextIndent = true;
  source.m_nLeftMargin = 120;
  source.m_nRightMargin = 240;
  source.m_nTopBorderDistance = 1;
  source.m_nBottomBorderDistance = 2;
  source.m_nLeftBorderDistance = 3;
  source.m_nRightBorderDistance = 4;
  source.m_nColumnCount = 3;
  source.m_eFloat = SvxAdjust.Left;
  source.m_ePosition = 2;
  source.m_eSizeType = 2;
  source.m_ePageBreakBefore = 2;
  source.m_ePageBreakAfter = 3;
  source.m_eLeftType = source.m_eTopType = source.m_eWidthType = source.m_eHeightType = 2;
  source.m_nLeft = 10;
  source.m_nTop = 20;
  source.m_nWidth = 300;
  source.m_nHeight = 400;
  const copied = new SvxCSS1PropertyInfo(source),
    target = new SvxCSS1PropertyInfo();
  expect(copied.m_aId).toBe("example");
  expect(copied.m_bPreserveSpace).toBe(false);
  expect(copied.m_bVisible).toBe(true);
  target.Merge(source);
  expect(target.m_aId).toBe("");
  expect(target.m_bPreserveSpace).toBe(false);
  expect(target.m_bVisible).toBe(true);
  expect([
    target.m_bTopMargin,
    target.m_bBottomMargin,
    target.m_bLeftMargin,
    target.m_bRightMargin,
    target.m_bTextIndent,
  ]).toEqual([true, true, true, true, true]);
  expect([target.m_nLeftMargin, target.m_nRightMargin]).toEqual([120, 240]);
  expect([
    target.m_nTopBorderDistance,
    target.m_nBottomBorderDistance,
    target.m_nLeftBorderDistance,
    target.m_nRightBorderDistance,
  ]).toEqual([1, 2, 3, 4]);
  expect([
    target.m_nColumnCount,
    target.m_eFloat,
    target.m_ePosition,
    target.m_eSizeType,
    target.m_ePageBreakBefore,
    target.m_ePageBreakAfter,
  ]).toEqual([3, SvxAdjust.Left, 2, 2, 2, 3]);
  expect([target.m_nLeft, target.m_nTop, target.m_nWidth, target.m_nHeight]).toEqual([
    10, 20, 300, 400,
  ]);
  target.Merge(new SvxCSS1PropertyInfo());
  expect(target.m_nColumnCount).toBe(0);
  expect(target.m_nTopBorderDistance).toBe(1);
  expect(target.m_nWidth).toBe(300);
  source.Clear();
  expect(source.m_aId).toBe("");
  expect(source.m_bPreserveSpace).toBe(true);
  expect(source.m_bVisible).toBe(false);
  expect(source.m_nTopBorderDistance).toBe(65535);
  expect(source.m_nWidth).toBe(0);
  expect(copied.m_nWidth).toBe(300);
});

it.each(["class", "id", "tag"] as const)(
  "owns independent %s entries and smart-merges paragraph spacing sides",
  /** Map insertion clones real item sets; updating one margin must preserve the other original side. @param kind - Native map family. @returns Nothing. */ (
    kind,
  ) => {
    const doc = new SwDoc(),
      parser = new SvxCSS1Parser(doc.GetAttrPool(), ""),
      first = new SfxItemSet(doc.GetAttrPool(), parser.GetWhichMap()),
      second = new SfxItemSet(doc.GetAttrPool(), parser.GetWhichMap()),
      firstInfo = new SvxCSS1PropertyInfo(),
      secondInfo = new SvxCSS1PropertyInfo(),
      oldSpace = new SvxULSpaceItem(120, 240, aItemIds.nULSpace),
      newSpace = new SvxULSpaceItem(360, 480, aItemIds.nULSpace);
    try {
      first.Put(oldSpace);
      second.Put(newSpace);
      firstInfo.m_bTopMargin = firstInfo.m_bBottomMargin = true;
      secondInfo.m_bTopMargin = true;
      const insert =
          kind === "class"
            ? parser.InsertClass.bind(parser)
            : kind === "id"
              ? parser.InsertId.bind(parser)
              : parser.InsertTag.bind(parser),
        lookup =
          kind === "class"
            ? parser.GetClass.bind(parser)
            : kind === "id"
              ? parser.GetId.bind(parser)
              : parser.GetTag.bind(parser);
      expect(lookup("absent")).toBeNull();
      insert("example", first, firstInfo);
      const entry = lookup("example");
      if (!entry) throw new Error("Missing inserted native map entry");
      expect(entry.GetItemSet()).not.toBe(first);
      first.ClearItem();
      insert("example", second, secondInfo);
      expect(lookup("example")).toBe(entry);
      let space = entry.GetItemSet().Get(aItemIds.nULSpace) as SvxULSpaceItem;
      expect([space.GetUpper(), space.GetLower()]).toEqual([360, 240]);
      secondInfo.m_bTopMargin = false;
      secondInfo.m_bBottomMargin = true;
      insert("example", second, secondInfo);
      space = entry.GetItemSet().Get(aItemIds.nULSpace) as SvxULSpaceItem;
      expect([space.GetUpper(), space.GetLower()]).toEqual([360, 480]);
      SvxCSS1Parser.MergeStyles(second, new SvxCSS1PropertyInfo(), first, firstInfo, false);
      expect((first.Get(aItemIds.nULSpace) as SvxULSpaceItem).GetLower()).toBe(480);
    } finally {
      oldSpace.Dispose();
      newSpace.Dispose();
      first.Dispose();
      second.Dispose();
      parser.SourceDispose();
      doc.Dispose();
    }
  },
);
