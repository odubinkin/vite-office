/** @fileoverview Actual EditDoc paragraph operations, default-font ownership, style follow and source font assembly. */
import { expect, it } from "vitest";
import {
  EditDoc,
  CreateFont,
  GetScriptItemId,
  EditEngineItemPool,
  DEFTAB,
} from "../../inc/editdoc";
import { EditPaM } from "../../inc/EditPaM";
import { EditSelection } from "../../inc/EditSelection";
import { ContentNode } from "../../inc/ContentNode";
import * as EE from "../../inc/eeitem";
import { EE_PARA_MAX } from "../../inc/EPaM";
import { SvtScriptType } from "../../../svl/inc/languageoptions";
import { SfxItemSet, SfxItemState } from "../../../svl/source/items/itemset";
import { SfxBoolItem } from "../../../svl/inc/eitem";
import { SfxVoidItem } from "../../../svl/source/items/voiditem";
import { SvxFont } from "../../inc/svxfont";
import { SvxFontHeightItem } from "../../inc/fhgtitem";
import { SvxLanguageItem } from "../../inc/langitem";
import { SvxColorItem } from "../../inc/colritem";
import {
  SvxEscapementItem,
  DFLT_ESC_AUTO_SUPER,
  DFLT_ESC_AUTO_SUB,
} from "../../inc/escapementitem";
import {
  SfxStyleSheetPool,
  SfxStyleSheet,
  SfxStyleFamily,
  SfxStyleSearchBits,
} from "../../../svl/inc/style";
import { Font } from "../../../vcl/source/font/font";
import { FontKerning } from "../../../vcl/inc/fntstyle";
import { TextAlign } from "../../../tools/inc/fontenum";
import { Variation } from "../../../vcl/inc/font/Variation";
import { Color } from "../../../tools/inc/color";
import { LANGUAGE_ENGLISH_US, LANGUAGE_GERMAN } from "../../../i18nlangtag/inc/lang";
import { LineEnd } from "../../../tools/inc/lineend";
import { TextRotation } from "../../inc/editobj";
import { unicode, text } from "../../../i18nlangtag/source/isolang/isolang.tables";

/** Inserts through the actual document while preserving source string lifetime. @param doc - Actual owner. @param position - Source value. @param value - Original raw text. @returns Advanced value. */
function insert(doc: EditDoc, position: EditPaM, value: string): EditPaM {
  const string = unicode(value);
  try {
    return doc.InsertText(position, string);
  } finally {
    string.dispose();
  }
}

it("constructs no paragraph until Clear and preserves default font, flags and every-true modification callbacks", /** No fake document or synthetic line array participates. @returns Nothing. */ () => {
  const doc = new EditDoc();
  const calls: null[] = [];
  doc.SetModifyHdl(
    /** Original Link callback argument. @param argument - Source null. @returns Nothing. */ (
      argument,
    ) => {
      calls.push(argument);
    },
  );
  try {
    expect(doc.Count()).toBe(0);
    expect(doc.GetStartPaM().not()).toBe(true);
    expect(doc.GetDefTab()).toBe(DEFTAB);
    doc.SetDefTab(0);
    expect(doc.GetDefTab()).toBe(720);
    doc.SetDefTab(65537);
    expect(doc.GetDefTab()).toBe(1);
    const empty = doc.GetText(LineEnd.LINEEND_LF);
    try {
      expect(text(empty)).toBe("");
    } finally {
      empty.dispose();
    }
    const start = doc.Clear();
    expect(doc.Count()).toBe(1);
    expect(doc.IsModified()).toBe(false);
    expect(calls).toEqual([]);
    expect(doc.GetDefFont().GetAlignment()).toBe(TextAlign.ALIGN_BASELINE);
    expect(doc.GetDefFont().GetFontHeight()).toBe(240);
    expect(
      (start.GetNode() as ContentNode).GetCharAttribs().GetDefFont().Equals(doc.GetDefFont()),
    ).toBe(true);
    const next = insert(doc, start, "ab");
    expect(start.GetIndex()).toBe(0);
    expect(next.GetIndex()).toBe(2);
    insert(doc, next, "c");
    expect(calls).toEqual([null, null]);
    doc.SetModified(false);
    expect(calls).toHaveLength(2);
  } finally {
    doc.dispose();
  }
});

it("splits actual nodes, resets only source paragraph flags and joins feature text in source order", /** Source text ownership and marker ranges are exercised through public EditDoc calls. @returns Nothing. */ () => {
  const doc = new EditDoc(),
    start = doc.Clear(),
    left = start.GetNode() as ContentNode;
  const bullet = new SfxBoolItem(EE.EE_PARA_BULLETSTATE, false),
    direction = new SfxBoolItem(EE.EE_PARA_AUTOWRITINGDIR, false),
    tab = new SfxVoidItem(EE.EE_FEATURE_TAB);
  try {
    left.GetContentAttribs().GetItems().Put(bullet);
    left.GetContentAttribs().GetItems().Put(direction);
    insert(doc, start, "abcd");
    const split = doc.InsertParaBreak(new EditPaM(left, 2), true),
      right = split.GetNode() as ContentNode;
    expect(text(left.GetString())).toBe("ab");
    expect(text(right.GetString())).toBe("cd");
    expect(
      (right.GetContentAttribs().GetItems().Get(EE.EE_PARA_BULLETSTATE) as SfxBoolItem).GetValue(),
    ).toBe(true);
    expect(
      (left.GetContentAttribs().GetItems().Get(EE.EE_PARA_BULLETSTATE) as SfxBoolItem).GetValue(),
    ).toBe(false);
    expect(
      right.GetContentAttribs().GetItems().GetItemState(EE.EE_PARA_AUTOWRITINGDIR, false),
    ).toBe(SfxItemState.DEFAULT);
    const after = doc.InsertFeature(split, tab);
    expect(after.GetIndex()).toBe(1);
    expect(split.GetIndex()).toBe(0);
    const whole = doc.GetText(LineEnd.LINEEND_CRLF);
    try {
      expect(text(whole)).toBe("ab\r\n\tcd");
    } finally {
      whole.dispose();
    }
    expect(doc.GetTextLen()).toBe(5);
    const joined = doc.ConnectParagraphs(left, right);
    expect(joined.GetNode()).toBe(left);
    expect(joined.GetIndex()).toBe(2);
    expect(doc.Count()).toBe(1);
    doc.RemoveChars(joined, 1);
    expect(left.GetCharAttribs().FindFeature(0)).toBeNull();
    const result = doc.GetText(LineEnd.LINEEND_LF);
    try {
      expect(text(result)).toBe("abcd");
    } finally {
      result.dispose();
    }
  } finally {
    tab.Dispose();
    direction.Dispose();
    bullet.Dispose();
    doc.dispose();
  }
});

it("retains first paragraph formatting and base-font assignment across RemoveText", /** Derived font fields revert to new-node defaults while represented base fields are restored. @returns Nothing. */ () => {
  const doc = new EditDoc(),
    start = doc.Clear(),
    first = start.GetNode() as ContentNode,
    color = new SvxColorItem(new Color(0x123456), EE.EE_CHAR_COLOR);
  try {
    first.GetContentAttribs().GetItems().Put(color);
    first.GetCharAttribs().GetDefFont().SetFamilyName("Preserved");
    first.GetCharAttribs().GetDefFont().SetEscapement(30);
    first.GetCharAttribs().GetDefFont().SetPropr(50);
    const end = insert(doc, start, "a");
    doc.InsertParaBreak(end, false);
    const replaced = doc.RemoveText().GetNode() as ContentNode;
    expect(doc.Count()).toBe(1);
    expect(replaced).not.toBe(first);
    expect(replaced.Len()).toBe(0);
    expect(
      (replaced.GetContentAttribs().GetItems().Get(EE.EE_CHAR_COLOR) as SvxColorItem)
        .GetValue()
        .toUInt32(),
    ).toBe(0x123456);
    expect(replaced.GetCharAttribs().GetDefFont().GetFamilyName()).toBe("Preserved");
    expect([
      replaced.GetCharAttribs().GetDefFont().GetEscapement(),
      replaced.GetCharAttribs().GetDefFont().GetPropr(),
    ]).toEqual([0, 100]);
    expect(doc.IsModified()).toBe(true);
  } finally {
    color.Dispose();
    doc.dispose();
  }
});

it("uses actual document positions after vector changes and preserves released-node ownership", /** Drives both fast-cache lookup and full fallback plus selection ordering. @returns Nothing. */ () => {
  const doc = new EditDoc();
  try {
    doc.Clear();
    for (let i = 1; i < 25; i++) doc.Insert(i, new ContentNode(doc.GetItemPool()));
    const last = doc.GetObject(24) as ContentNode;
    expect(doc.GetPos(last)).toBe(24);
    const released = doc.Release(0) as ContentNode;
    try {
      expect(doc.GetPos(last)).toBe(23);
      expect(doc.GetPos(released)).toBe(EE_PARA_MAX);
      const selection = new EditSelection(new EditPaM(last, 0), doc.GetStartPaM());
      selection.Adjust(doc);
      expect(selection.Min().GetNode()).toBe(doc.GetObject(0));
      released.Append(Uint16Array.of(65));
      expect(text(released.GetString())).toBe("A");
    } finally {
      released.dispose();
    }
    doc.Remove(-1);
    expect(doc.Release(999)).toBeNull();
  } finally {
    doc.dispose();
  }
});

it("assembles script-specific values only for exact script selectors and preserves hard-attribute priority", /** Uses actual item sets and distinct native language/height items. @returns Nothing. */ () => {
  const pool = new EditEngineItemPool(),
    set = new SfxItemSet(pool, [[EE.EE_PARA_START, EE.EE_CHAR_END]]),
    font = new SvxFont();
  const latin = new SvxLanguageItem(LANGUAGE_ENGLISH_US, EE.EE_CHAR_LANGUAGE),
    asian = new SvxLanguageItem(LANGUAGE_GERMAN, EE.EE_CHAR_LANGUAGE_CJK),
    height = new SvxFontHeightItem(500, 100, EE.EE_CHAR_FONTHEIGHT_CJK);
  try {
    set.Put(latin);
    set.Put(asian);
    set.Put(height);
    CreateFont(font, set, true, SvtScriptType.ASIAN);
    expect(font.GetLanguage()).toBe(LANGUAGE_GERMAN);
    expect(font.GetFontHeight()).toBe(500);
    CreateFont(font, set, true, SvtScriptType.ASIAN | SvtScriptType.COMPLEX);
    expect(font.GetLanguage()).toBe(LANGUAGE_ENGLISH_US);
    expect(font.GetFontHeight()).toBe(240);
    expect(GetScriptItemId(EE.EE_CHAR_COLOR, SvtScriptType.ASIAN)).toBe(EE.EE_CHAR_COLOR);
    const empty = new SfxItemSet(pool, [[EE.EE_PARA_START, EE.EE_CHAR_END]]);
    try {
      font.SetFamilyName("Kept");
      font.SetFontHeight(123);
      CreateFont(font, empty, false);
      expect(font.GetFamilyName()).toBe("Kept");
      expect(font.GetFontHeight()).toBe(123);
    } finally {
      empty.Dispose();
    }
  } finally {
    height.Dispose();
    asian.Dispose();
    latin.Dispose();
    set.Dispose();
  }
});

it("calculates automatic escapement using the source null-device constants and signed narrowing", /** No synthetic font metrics service is substituted. @returns Nothing. */ () => {
  const font = new SvxFont();
  font.SetPropr(58);
  font.SetNonAutoEscapement(DFLT_ESC_AUTO_SUPER);
  expect(font.GetEscapement()).toBe(33);
  font.SetNonAutoEscapement(DFLT_ESC_AUTO_SUB);
  expect(font.GetEscapement()).toBe(-8);
  font.SetNonAutoEscapement(30000);
  expect(font.GetEscapement()).toBe(13999);
  font.SetNonAutoEscapement(65535);
  expect(font.GetEscapement()).toBe(-1);
  const doc = new EditDoc(),
    node = doc.Clear().GetNode() as ContentNode,
    item = new SvxEscapementItem(DFLT_ESC_AUTO_SUPER, 58, EE.EE_CHAR_ESCAPEMENT);
  try {
    node.GetContentAttribs().GetItems().Put(item);
    node.CreateDefFont();
    expect(node.GetCharAttribs().GetDefFont().GetEscapement()).toBe(33);
  } finally {
    item.Dispose();
    doc.dispose();
  }
});

it("retains Font defaults, copied axes and every newly represented field in equality", /** Vector order, duplicates and IEEE NaN are not normalized. @returns Nothing. */ () => {
  const font = new Font();
  expect(font.GetKerning()).toBe(FontKerning.FontSpecific);
  expect(font.IsKerning()).toBe(true);
  expect([
    font.IsFixKerning(),
    font.IsWordLineMode(),
    font.IsVertical(),
    font.GetOpticalSizing(),
    font.GetOrientation(),
  ]).toEqual([false, false, false, false, 0]);
  const axis = new Variation(1, 2);
  font.SetVariations([axis, axis]);
  axis.fValue = 3;
  expect(
    font
      .GetVariations()
      .map(
        /** Reads actual stored copies. @param value - Axis. @returns Scalar. */ (value) =>
          value.fValue,
      ),
  ).toEqual([2, 2]);
  const copy = new Font(font);
  copy.SetFixKerning(65535);
  expect(copy.GetFixKerning()).toBe(-1);
  expect(copy.Equals(font)).toBe(false);
  copy.assign(font);
  copy.SetWordLineMode(true);
  expect(copy.Equals(font)).toBe(false);
  copy.assign(font);
  copy.SetOrientation(65535);
  expect(copy.GetOrientation()).toBe(-1);
  expect(copy.Equals(font)).toBe(false);
  copy.assign(font);
  copy.SetVertical(true);
  expect(copy.Equals(font)).toBe(false);
  copy.assign(font);
  copy.SetOpticalSizing(true);
  expect(copy.Equals(font)).toBe(false);
  copy.assign(font);
  copy.SetKerning(FontKerning.Asian);
  expect(copy.Equals(font)).toBe(false);
  copy.assign(font);
  copy.SetVariations([new Variation(1, NaN)]);
  expect(copy.Equals(new Font(copy))).toBe(true);
  const independent = new Font();
  independent.SetVariations([new Variation(1, NaN)]);
  expect(copy.Equals(independent)).toBe(false);
});

it("follows real paragraph styles and gives style font values precedence before hard overrides", /** Uses the actual shared style pool and original next-style lookup. @returns Nothing. */ () => {
  const pool = new EditEngineItemPool(),
    styles = new SfxStyleSheetPool(pool),
    firstName = unicode("First"),
    nextName = unicode("Next"),
    first = new SfxStyleSheet(
      firstName,
      styles,
      SfxStyleFamily.Para,
      SfxStyleSearchBits.UserDefined,
    ),
    next = new SfxStyleSheet(nextName, styles, SfxStyleFamily.Para, SfxStyleSearchBits.UserDefined),
    doc = new EditDoc(pool),
    node = doc.Clear().GetNode() as ContentNode,
    height = new SvxFontHeightItem(400, 100, EE.EE_CHAR_FONTHEIGHT);
  try {
    styles.Insert(first);
    styles.Insert(next);
    first.SetFollow(nextName);
    next.GetItemSet().Put(height);
    node.SetStyleSheet(first);
    insert(doc, new EditPaM(node, 0), "ab");
    const split = doc.InsertParaBreak(new EditPaM(node, 1), true).GetNode() as ContentNode;
    expect(split.GetStyleSheet()).toBe(next);
    expect(split.GetCharAttribs().GetDefFont().GetFontHeight()).toBe(400);
    doc.SetVertical(false);
    doc.SetRotation(TextRotation.TOPTOBOTTOM);
    doc.CreateDefFont(false);
    expect(doc.GetDefFont().IsVertical()).toBe(true);
    expect(doc.GetDefFont().GetOrientation()).toBe(2700);
    doc.SetRotation(TextRotation.BOTTOMTOTOP);
    doc.CreateDefFont(false);
    expect(doc.GetDefFont().GetOrientation()).toBe(900);
  } finally {
    height.Dispose();
    doc.dispose();
    firstName.dispose();
    nextName.dispose();
  }
});
