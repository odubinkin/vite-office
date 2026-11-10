/** @fileoverview Original CreateTextObject/script member groups over actual document, attribute, item, line, cache and raw ICU direction owners. Constructor and process-service admission remain explicit test dependencies. */
import { expect, it } from "vitest";
import { PreparedOuter, paragraphs } from "../../../test/editeng-engine-fixture";
import { EditSelection } from "../../inc/EditSelection";
import { EditPaM } from "../../inc/EditPaM";
import { ESelection } from "../../inc/ESelection";
import type { ContentNode } from "../../inc/ContentNode";
import { MakeCharAttrib, EditEngineItemPool } from "../../inc/editdoc";
import type { EditCharAttribField } from "../../inc/editattr";
import { TextRotation } from "../../inc/editobj";
import { TextPortion, ExtraPortionInfo } from "../../inc/TextPortion";
import { EditLine } from "../../inc/EditLine";
import { ScalingParameters, EEHorizontalTextDirection as Horizontal } from "../../inc/editdata";
import { SvxFrameDirectionItem } from "../../inc/frmdiritem";
import { SvxFrameDirection as Direction } from "../../inc/frmdir";
import { SvxColorItem } from "../../inc/colritem";
import { SvxScriptHintItem } from "../../inc/scripthintitem";
import { ScriptHintType } from "../../../i18nutil/inc/scriptchangescanner";
import { SvxFieldItem } from "../../inc/flditem";
import * as EE from "../../inc/eeitem";
import { SvtScriptType as Script } from "../../../svl/inc/languageoptions";
import { SfxBoolItem } from "../../../svl/inc/eitem";
import {
  SfxStyleSheet,
  SfxStyleSheetPool,
  SfxStyleFamily,
  SfxStyleSearchBits,
} from "../../../svl/inc/style";
import { Color } from "../../../tools/inc/color";
import { Size } from "../../../tools/inc/gen";
import { MapUnit } from "../../../tools/inc/mapunit";
import { LANGUAGE_ENGLISH_US, LANGUAGE_JAPANESE } from "../../../i18nlangtag/inc/lang";
import { unicode, text } from "../../../i18nlangtag/source/isolang/isolang.tables";
import { MisspellRange } from "../../inc/misspellrange";
import type { EditTextObjectImpl } from "./editobj.owner";
import type { EditTextObject, ContentInfo } from "./editobj";

/** Prepares source state and calls the real SetText/ImpInsertText bodies. No alternate parser, script query or object factory participates. @param value - Original text. @returns Prepared outer owner. */
function prepare(value: string): PreparedOuter {
  const outer = new PreparedOuter(),
    engine = outer.implementation,
    input = unicode(value);
  engine.useActualInsertion = true;
  engine.meDefLanguage = LANGUAGE_ENGLISH_US;
  engine.mbUpdateLayout = false;
  engine.EnableUndo(false);
  try {
    engine.SetText(input);
  } finally {
    input.dispose();
  }
  return outer;
}
/** Reads actual object paragraph values while respecting SAL value ownership. @param object - Source object. @returns Original texts. */
function values(object: EditTextObject): string[] {
  const result: string[] = [];
  for (let index = 0; index < object.GetParagraphCount(); index++) {
    const value = object.GetText(index);
    try {
      result.push(text(value));
    } finally {
      value.dispose();
    }
  }
  return result;
}

/** Test-only static view of the actual factory-produced derived owner, as used by native internal producers. No object is wrapped or copied. @param object - Actual source object. @returns Same actual implementation. */
function internal(object: EditTextObject): EditTextObjectImpl {
  return object as EditTextObjectImpl;
}

it("creates the actual complete object through the public owner with source script, orientation, metric and pool metadata", /** Full insertion and object creation execute over real owners; unported direction initialization is only observed. @returns Nothing. */ () => {
  const outer = prepare("Latin\n中\nالعربية"),
    engine = outer.implementation,
    doc = engine.GetEditDoc();
  doc.GetItemPool().SetDefaultMetric(MapUnit.MapMM);
  doc.SetRotation(TextRotation.TOPTOBOTTOM);
  doc.SetModified(false);
  const object = outer.CreateTextObject();
  try {
    expect(values(object)).toEqual(["Latin", "中", "العربية"]);
    expect(object.GetScriptType()).toBe(Script.LATIN | Script.ASIAN | Script.COMPLEX);
    expect(doc.IsModified()).toBe(false);
    expect(object.GetPool()).toBe(doc.GetItemPool());
    expect(internal(object).GetMetric()).toBe(MapUnit.MapMM);
    expect(object.GetRotation()).toBe(TextRotation.TOPTOBOTTOM);
    expect(object.GetVertical()).toBe(false);
    expect(object.IsEffectivelyVertical()).toBe(true);
    expect(internal(object).GetPortionInfo()).toBeNull();
    expect(engine.writingRequests).toEqual([0, 1, 2]);
    expect(paragraphs(engine)).toEqual(["Latin", "中", "العربية"]);
  } finally {
    object.dispose();
    engine.dispose();
  }
});

it("copies and clips actual text, styles, hard attributes and character spans while preserving attributes of an empty source paragraph", /** Reversed source selection is adjusted by value and actual destination-pool cloning is used. @returns Nothing. */ () => {
  const outer = prepare("abcd\n\nwxyz"),
    engine = outer.implementation,
    doc = engine.GetEditDoc(),
    first = doc.GetObject(0) as ContentNode,
    middle = doc.GetObject(1) as ContentNode,
    last = doc.GetObject(2) as ContentNode,
    pool = new SfxStyleSheetPool(doc.GetItemPool()),
    name = unicode("Object source"),
    style = new SfxStyleSheet(name, pool, SfxStyleFamily.Para, SfxStyleSearchBits.UserDefined),
    color = new SvxColorItem(new Color(0x112233), EE.EE_CHAR_COLOR),
    destination = new EditEngineItemPool();
  pool.Insert(style);
  first.SetStyleSheet(style);
  first.GetContentAttribs().GetItems().Put(new SfxBoolItem(EE.EE_PARA_BULLETSTATE, false));
  for (const [node, start, end] of [
    [first, 0, 4],
    [first, 0, 2],
    [middle, 0, 0],
    [last, 1, 4],
    [last, 2, 3],
  ] as const) {
    const attribute = MakeCharAttrib(doc.GetItemPool(), color, start, end);
    if (!attribute) throw new Error("Expected real color attribute.");
    node.GetCharAttribs().InsertAttrib(attribute);
  }
  destination.SetDefaultMetric(MapUnit.MapPoint);
  const selection = new EditSelection(new EditPaM(last, 2), new EditPaM(first, 2)),
    before = engine.CreateESel(selection),
    object = engine.CreateTextObject(selection, destination, true, 0);
  try {
    expect(values(object)).toEqual(["cd", "", "wx"]);
    expect(engine.CreateESel(selection)).toEqual(before);
    expect(object.GetPool()).toBe(destination);
    expect(destination.GetMetric(0)).toBe(MapUnit.MapPoint);
    expect(internal(object).GetMetric()).toBe(doc.GetItemPool().GetMetric(0));
    const contents = internal(object).GetContents();
    expect(text((contents[0] as ContentInfo).GetStyle())).toBe("Object source");
    expect(contents[0]?.GetFamily()).toBe(SfxStyleFamily.Para);
    expect(
      (contents[0]?.GetParaAttribs().Get(EE.EE_PARA_BULLETSTATE) as SfxBoolItem).GetValue(),
    ).toBe(false);
    expect(
      contents.map(
        /** Reads independently owned copied spans. @param content - Actual paragraph. @returns Spans. */ (
          content,
        ) =>
          content
            .GetCharAttribs()
            .map(
              /** Reads source endpoints. @param attribute - Actual attribute. @returns Span. */ (
                attribute,
              ) => [attribute.GetStart(), attribute.GetEnd()],
            ),
      ),
    ).toEqual([[[0, 2]], [[0, 0]], [[1, 2]]]);
    expect(contents[0]?.GetCharAttribs()[0]?.GetItemHolder().getPool()).toBe(destination);
    first.SetChar(2, 88);
    expect(values(object)).toEqual(["cd", "", "wx"]);
    expect(internal(object).GetPortionInfo()).toBeNull();
  } finally {
    object.dispose();
    engine.dispose();
    name.dispose();
  }
});

it("clones spelling only for an allow-big whole-paragraph selection", /** Eligibility applies to the complete selection, not separately to its middle paragraphs. @returns Nothing. */ () => {
  const engine = prepare("abcd\n中").implementation,
    doc = engine.GetEditDoc(),
    first = doc.GetObject(0) as ContentNode;
  first.CreateWrongList();
  first.GetWrongList()?.SetRanges([new MisspellRange(1n, 3n)]);
  const all = new EditSelection(doc.GetStartPaM(), doc.GetEndPaM()),
    full = engine.CreateTextObject(all, doc.GetItemPool(), true),
    disabled = engine.CreateTextObject(all, doc.GetItemPool()),
    partial = engine.CreateTextObject(
      new EditSelection(new EditPaM(first, 1), doc.GetEndPaM()),
      doc.GetItemPool(),
      true,
    );
  try {
    const copied = internal(full).GetContents()[0]?.GetWrongList();
    expect(copied).not.toBe(first.GetWrongList());
    expect(copied?.GetRanges()).toEqual([new MisspellRange(1n, 3n)]);
    expect(internal(disabled).GetContents()[0]?.GetWrongList()).toBeNull();
    expect(internal(partial).GetContents()[0]?.GetWrongList()).toBeNull();
    const original = first.GetWrongList();
    if (!original) throw new Error("Expected actual spelling state.");
    original.back().mnEnd = 4n;
    expect(copied?.GetRanges()).toEqual([new MisspellRange(1n, 3n)]);
  } finally {
    full.dispose();
    disabled.dispose();
    partial.dispose();
    engine.dispose();
  }
});

it("copies eligible formatted cache payloads using TextPortion copy and EditLine Clone semantics", /** Actual line/portion values are explicitly prepared; no renderer or paragraph height calculation is fabricated. @returns Nothing. */ () => {
  const engine = prepare("ab").implementation,
    portion = engine.GetParaPortions().getRef(0),
    first = new TextPortion(1),
    second = new TextPortion(1),
    line = new EditLine(),
    device = {};
  first.setWidth(11);
  first.setHeight(12);
  first.SetExtraInfos(new ExtraPortionInfo());
  second.setWidth(13);
  portion.GetTextPortions().Append(first);
  portion.GetTextPortions().Append(second);
  line.SetStart(0);
  line.SetEnd(2);
  line.SetStartPortion(0);
  line.SetEndPortion(1);
  line.SetHeight(17, 12);
  line.GetCharPosArray().push(11, 24);
  line.SetHangingPunctuation(true);
  line.GetKashidaArray().push(true, false);
  portion.GetLines().Append(line);
  engine.mbFormatted = true;
  engine.mbUpdateLayout = true;
  engine.mpRefDev = device;
  engine.maPaperSize.setWidth(100);
  engine.mnColumns = 3;
  engine.mnColumnSpacing = 2;
  engine.maScalingParameters.fFontX = 1.5;
  engine.maScalingParameters.fSpacingY = 0.75;
  const object = engine.CreateTextObject(
    new EditSelection(engine.GetEditDoc().GetStartPaM(), engine.GetEditDoc().GetEndPaM()),
    engine.GetEditDoc().GetItemPool(),
    true,
    2,
  );
  try {
    const cache = internal(object).GetPortionInfo();
    if (!cache) throw new Error("Expected original eligible source cache.");
    expect(cache.GetRefDevPtr()).toBe(device);
    expect(cache.GetPaperWidth()).toBe(32);
    expect([
      cache.getFontScaleX(),
      cache.getFontScaleY(),
      cache.getSpacingScaleX(),
      cache.getSpacingScaleY(),
    ]).toEqual([1.5, 1, 1, 0.75]);
    const copy = cache.at(0);
    expect([copy.nHeight, copy.nFirstLineOffset]).toEqual([
      portion.GetHeight(),
      portion.GetFirstLineOffset(),
    ]);
    expect(copy.aTextPortions.Count()).toBe(2);
    expect(copy.aTextPortions.at(0)).not.toBe(first);
    expect(copy.aTextPortions.at(0).GetExtraInfos()).toBeNull();
    expect(copy.aLines.at(0)).not.toBe(line);
    expect(copy.aLines.at(0).GetHeight()).toBe(17);
    expect(copy.aLines.at(0).GetCharPosArray()).toEqual([11, 24]);
    expect(copy.aLines.at(0).GetKashidaArray()).toEqual([]);
    expect(copy.aLines.at(0).IsHangingPunctuation()).toBe(false);
    engine.maScalingParameters.fFontX = 2;
    line.GetCharPosArray()[0] = 99;
    expect(cache.getFontScaleX()).toBe(1.5);
    expect(copy.aLines.at(0).GetCharPosArray()).toEqual([11, 24]);
  } finally {
    object.dispose();
    engine.dispose();
  }
});

it.each([
  [false, true, true, 1],
  [true, false, true, 1],
  [true, true, false, 1],
  [true, true, true, 2],
] as const)(
  "retains cache eligibility flags formatted=%s layout=%s allow=%s threshold=%s",
  /** Source conjunction is retained without creating an empty fallback cache. @param formatted - Source state. @param layout - Source state. @param allow - Source argument. @param threshold - Source threshold. @returns Nothing. */ (
    formatted,
    layout,
    allow,
    threshold,
  ) => {
    const engine = prepare("ab").implementation,
      doc = engine.GetEditDoc();
    engine.GetParaPortions().getRef(0).GetTextPortions().Append(new TextPortion(2));
    engine.mbFormatted = formatted;
    engine.mbUpdateLayout = layout;
    const object = engine.CreateTextObject(
      new EditSelection(doc.GetStartPaM(), doc.GetEndPaM()),
      doc.GetItemPool(),
      allow,
      threshold,
    );
    try {
      expect(internal(object).GetPortionInfo()).toBeNull();
    } finally {
      object.dispose();
      engine.dispose();
    }
  },
);

it("preserves unsigned16 cached portion/line count narrowing at65536", /** Real owner vectors retain65536 values; the original copying loop sees zero after its uint16 assignment. @returns Nothing. */ () => {
  const engine = prepare("").implementation,
    doc = engine.GetEditDoc(),
    portion = engine.GetParaPortions().getRef(0);
  for (let index = 0; index < 65536; index++) {
    portion.GetTextPortions().Append(new TextPortion(0));
    portion.GetLines().Append(new EditLine());
  }
  engine.mbFormatted = true;
  engine.mbUpdateLayout = true;
  const object = engine.CreateTextObject(
    new EditSelection(doc.GetStartPaM(), doc.GetEndPaM()),
    doc.GetItemPool(),
    true,
  );
  try {
    expect(portion.GetTextPortions().Count()).toBe(65536);
    expect(portion.GetLines().Count()).toBe(65536);
    expect(internal(object).GetPortionInfo()?.at(0).aTextPortions.Count()).toBe(0);
    expect(internal(object).GetPortionInfo()?.at(0).aLines.Count()).toBe(0);
  } finally {
    object.dispose();
    engine.dispose();
  }
});

it("retains original paragraph overload defaults and its zero-count reverse-selection outcome", /** Source pointer checks do not reject zero counts when both resulting nodes exist. @returns Nothing. */ () => {
  const outer = prepare("ab\ncd\nef"),
    engine = outer.implementation,
    single = outer.CreateTextObject(1),
    zero = outer.CreateTextObject(1, 0),
    publicSelection = outer.CreateTextObject(new ESelection(0, 1, 1, 1));
  try {
    if (!single || !zero) throw new Error("Expected actual source range outcomes.");
    expect(values(single)).toEqual(["cd"]);
    expect(values(zero)).toEqual(["", ""]);
    expect(values(publicSelection)).toEqual(["b", "c"]);
    expect(outer.CreateTextObject(0, 0)).toBeNull();
    expect(outer.CreateTextObject(99)).toBeNull();
  } finally {
    single?.dispose();
    zero?.dispose();
    publicSelection.dispose();
    engine.dispose();
  }
});

it("keeps source endpoint-only script membership, caret bias and one final language fallback", /** A middle CJK run is not added merely because it lies inside the range. @returns Nothing. */ () => {
  const outer = prepare("A中B"),
    engine = outer.implementation,
    node = engine.GetEditDoc().GetObject(0) as ContentNode;
  try {
    expect(
      engine.GetItemScriptType(new EditSelection(new EditPaM(node, 0), new EditPaM(node, 3))),
    ).toBe(Script.LATIN);
    expect(
      engine.GetItemScriptType(new EditSelection(new EditPaM(node, 1), new EditPaM(node, 2))),
    ).toBe(Script.ASIAN);
    const cursor = outer.CreateTextObject(new ESelection(0, 2, 0, 2));
    try {
      expect(values(cursor)).toEqual([""]);
      expect(cursor.GetScriptType()).toBe(Script.ASIAN);
    } finally {
      cursor.dispose();
    }
    const mixed = prepare("\n中");
    const object = mixed.CreateTextObject();
    try {
      expect(object.GetScriptType()).toBe(Script.ASIAN);
    } finally {
      object.dispose();
      mixed.implementation.dispose();
    }
    const empty = prepare("");
    empty.implementation.meDefLanguage = LANGUAGE_JAPANESE;
    const blank = empty.CreateTextObject();
    try {
      expect(blank.GetScriptType()).toBe(Script.ASIAN);
      expect(empty.implementation.writingRequests).toEqual([]);
    } finally {
      blank.dispose();
      empty.implementation.dispose();
    }
  } finally {
    engine.dispose();
  }
});

it.each([
  ["a中ع", Script.ASIAN],
  ["中ع", Script.COMPLEX],
  ["ع中", Script.ASIAN],
  [" ...中", Script.ASIAN],
  ["", Script.LATIN],
  ["𠀀", Script.LATIN],
] as const)(
  "uses original field replacement-unit selection for %s",
  /** Real field display values and the actual BreakIterator script implementation drive the source algorithm. @param display - Field contents. @param expected - Source script result. @returns Nothing. */ (
    display,
    expected,
  ) => {
    const engine = prepare("").implementation,
      doc = engine.GetEditDoc(),
      value = unicode(display),
      fieldItem = new SvxFieldItem(null, EE.EE_FEATURE_FIELD, true);
    doc.InsertFeature(doc.GetStartPaM(), fieldItem);
    const node = doc.GetObject(0) as ContentNode,
      field = node.GetCharAttribs().FindNextAttrib(EE.EE_FEATURE_FIELD, 0) as EditCharAttribField;
    field.SetFieldValue(value);
    try {
      engine.InitScriptTypes(0);
      expect(engine.GetItemScriptType(new EditSelection(doc.GetStartPaM(), doc.GetEndPaM()))).toBe(
        expected,
      );
      expect(text(node.GetString())).toBe("\u0001");
      expect(text(field.GetFieldValue())).toBe(display);
    } finally {
      value.dispose();
      engine.dispose();
    }
  },
);

it.each([
  [3, Script.LATIN],
  [1, Script.LATIN | Script.COMPLEX],
] as const)(
  "retains original script-hint traversal across boundary%s",
  /** Gapped hints are not substituted for FindAttribRightOpen's actual source result. @param next - Actual second start. @param expected - Source result. @returns Nothing. */ (
    next,
    expected,
  ) => {
    const engine = prepare("    ").implementation,
      doc = engine.GetEditDoc(),
      node = doc.GetObject(0) as ContentNode;
    for (const [hint, start, end] of [
      [ScriptHintType.Latin, 0, 1],
      [ScriptHintType.Complex, next, 4],
    ] as const) {
      const attribute = MakeCharAttrib(
        doc.GetItemPool(),
        new SvxScriptHintItem(hint, EE.EE_CHAR_SCRIPT_HINT),
        start,
        end,
      );
      if (!attribute) throw new Error("Expected actual script-hint attribute.");
      node.GetCharAttribs().InsertAttrib(attribute);
    }
    try {
      expect(engine.GetItemScriptType(new EditSelection(doc.GetStartPaM(), doc.GetEndPaM()))).toBe(
        expected,
      );
    } finally {
      engine.dispose();
    }
  },
);

it("uses original horizontal/environment/pool precedence and suppresses RTL for effective vertical text", /** Default direction comes from the real pool, not an invented locale/window fallback. @returns Nothing. */ () => {
  const engine = prepare("abc").implementation,
    doc = engine.GetEditDoc(),
    node = doc.GetObject(0) as ContentNode,
    environment = new SvxFrameDirectionItem(Direction.Environment, EE.EE_PARA_WRITINGDIR),
    right = new SvxFrameDirectionItem(Direction.Horizontal_RL_TB, EE.EE_PARA_WRITINGDIR);
  try {
    node.GetContentAttribs().GetItems().Put(environment);
    engine.meDefaultHorizontalTextDirection = Horizontal.R2L;
    expect(engine.IsRightToLeft(0)).toBe(true);
    engine.meDefaultHorizontalTextDirection = Horizontal.L2R;
    expect(engine.IsRightToLeft(0)).toBe(false);
    engine.meDefaultHorizontalTextDirection = Horizontal.Default;
    expect(engine.IsRightToLeft(0)).toBe(false);
    const empty = engine.GetEmptyItemSet();
    expect(engine.GetEmptyItemSet()).toBe(empty);
    doc.GetItemPool().SetUserDefaultItem(right);
    expect(engine.IsRightToLeft(0)).toBe(true);
    engine.meDefaultHorizontalTextDirection = Horizontal.L2R;
    node.GetContentAttribs().GetItems().Put(right);
    expect(engine.IsRightToLeft(0)).toBe(true);
    doc.SetVertical(true);
    expect(engine.IsRightToLeft(0)).toBe(false);
    engine.mnColumns = 2;
    engine.mnColumnSpacing = 3;
    expect(engine.GetColumnWidth(new Size(10, 20))).toBe(8);
    doc.SetVertical(false);
    expect(engine.GetColumnWidth(new Size(10, 20))).toBe(3);
    expect(Object.is(engine.GetColumnWidth(new Size(2, 20)), 0)).toBe(true);
  } finally {
    engine.dispose();
  }
});

it("preserves scaling defaults, value copies and defaulted double equality", /** NaN does not gain a same-object shortcut. @returns Nothing. */ () => {
  const source = new ScalingParameters(),
    copy = new ScalingParameters(source);
  expect(source.areValuesDefault()).toBe(true);
  expect(copy.equals(source)).toBe(true);
  source.fFontX = 2;
  expect(copy.fFontX).toBe(1);
  copy.assign(source);
  expect(copy.fFontX).toBe(2);
  source.fFontX = Number.NaN;
  expect(source.equals(source)).toBe(false);
  expect(source.areValuesDefault()).toBe(false);
});

it("retains the native overlap split and reconnects equal character attributes", /** Exercises the character-attribute path used for rich text insertion. @returns Nothing. */ () => {
  const outer = prepare("abcdef");
  const engine = outer.implementation;
  const doc = engine.GetEditDoc();
  const node = doc.GetObject(0) as ContentNode;
  const color = new SvxColorItem(new Color(0x112233), EE.EE_CHAR_COLOR);
  const replacement = new SvxColorItem(new Color(0xabcdef), EE.EE_CHAR_COLOR);
  try {
    doc.InsertAttrib(node, 0, 6, color);
    doc.InsertAttrib(node, 2, 4, replacement);
    const attributes = node.GetCharAttribs().GetAttribs();
    expect(
      attributes.map(
        /** Projects native attribute endpoints. @param attribute - Actual attribute. @returns Native endpoints. */ (
          attribute,
        ) => [attribute.GetStart(), attribute.GetEnd()],
      ),
    ).toEqual([
      [0, 2],
      [2, 4],
      [4, 6],
    ]);
    doc.InsertAttrib(node, 2, 4, color);
    expect(attributes).toHaveLength(1);
    expect(attributes[0]?.GetStart()).toBe(0);
    expect(attributes[0]?.GetEnd()).toBe(6);
  } finally {
    replacement.Dispose();
    color.Dispose();
    engine.dispose();
  }
});
