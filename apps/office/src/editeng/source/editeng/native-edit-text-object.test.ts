/** @fileoverview Real EditTextObject ownership, native pool resolution, text, fields, style and cache contracts. */
import { expect, it } from "vitest";
import { EditTextObjectImpl } from "./editobj.owner";
import { EditTextObject, XParaPortionList, type ContentInfo, type XEditAttribute } from "./editobj";
import { TextRotation } from "../../inc/editobj";
import { EditEngineItemPool } from "../../inc/editdoc";
import { OutlinerMode } from "../../inc/outliner";
import { EECharAttrib } from "../../inc/editdata";
import { FieldUpdater } from "../../inc/fieldupdater";
import { SvxFieldData, SvxFieldItem, SvxTableField, SvxURLField } from "../../inc/flditem";
import { SvxWeightItem } from "../../inc/wghtitem";
import { FontWeight } from "../../../tools/inc/fontenum";
import { EE_CHAR_WEIGHT, EE_FEATURE_FIELD } from "../../inc/eeitem";
import * as FieldType from "../../../offapi/com/sun/star/text/textfield/Type";
import { SfxItemPool } from "../../../svl/inc/itempool";
import { SfxStyleFamily } from "../../../svl/inc/style";
import { SvtScriptType } from "../../../svl/inc/languageoptions";
import type { SharedString } from "../../../svl/inc/sharedstring";
import { SharedStringPool } from "../../../svl/inc/sharedstringpool";
import { Locale } from "../../../udkapi/com/sun/star/lang/Locale";
import { uppercase } from "../../../unotools/inc/charclass";
import { OUString, type OUStringConstReference } from "../../../sal/inc/rtl/ustring";
import { MapUnit } from "../../../tools/inc/mapunit";
import { LineEnd } from "../../../tools/inc/lineend";
import { text } from "../../../i18nlangtag/source/isolang/isolang.tables";
import { WrongList } from "./edtspell";
import { MisspellRange } from "../../inc/misspellrange";
import type { Section } from "../../inc/section";

/** Creates the actual UTF16 value, including NUL and surrogate units. @param value - Text. @returns Owner. */
function unicode(value: string): OUString {
  return new OUString(
    Uint16Array.from(
      value
        .split("")
        .map(
          /** Reads one UTF16 unit. @param unit - Unit. @returns Code. */ (unit) =>
            unit.charCodeAt(0),
        ),
    ),
    value.length,
  );
}
/** Creates the genuine five-input object and initializes paragraphs at its producer boundary. @param values - Paragraphs. @returns Owner. */
function object(...values: string[]): EditTextObjectImpl {
  const owner = new EditTextObjectImpl(
    null,
    MapUnit.MapTwip,
    false,
    TextRotation.NONE,
    SvtScriptType.LATIN,
  );
  for (const value of values) {
    const s = unicode(value);
    owner.CreateAndInsertContent().SetText(s);
    s.dispose();
  }
  return owner;
}
/** Creates valid native cache metadata without requiring an unported device. @returns Cache. */
function cache(): XParaPortionList {
  return new XParaPortionList(null, -1, 1, 2, 3, 4);
}

it("resolves only a genuine EditEngine pool in the secondary chain and preserves independent object metrics", /** Real pool ownership and Clone type are observable native contracts. @returns Nothing. */ () => {
  const root = new SfxItemPool(),
    middle = new SfxItemPool(),
    pool = new EditEngineItemPool();
  pool.SetDefaultMetric(MapUnit.MapPoint);
  root.SetSecondaryPool(middle);
  middle.SetSecondaryPool(pool);
  const owner = new EditTextObjectImpl(
    root,
    MapUnit.MapMM,
    true,
    TextRotation.NONE,
    SvtScriptType.ASIAN,
  );
  expect(owner.GetPool()).toBe(pool);
  expect(owner.GetMetric()).toBe(MapUnit.MapMM);
  expect(owner.GetPool().GetMetric(EE_CHAR_WEIGHT)).toBe(MapUnit.MapPoint);
  expect(owner.HasMetric()).toBe(true);
  expect(owner.GetScriptType()).toBe(SvtScriptType.ASIAN);
  const clonedPool = pool.Clone();
  expect(clonedPool).not.toBeInstanceOf(EditEngineItemPool);
  const fresh = new EditTextObjectImpl(
    clonedPool,
    MapUnit.MapCM,
    false,
    TextRotation.NONE,
    SvtScriptType.NONE,
  );
  expect(fresh.GetPool()).not.toBe(clonedPool);
  expect(fresh.GetPool()).toBeInstanceOf(EditEngineItemPool);
  expect(fresh.GetPool().GetMetric(EE_CHAR_WEIGHT)).toBe(MapUnit.MapCM);
  const unspecified = new EditTextObjectImpl(
    null,
    MapUnit.LASTENUMDUMMY,
    false,
    TextRotation.NONE,
    SvtScriptType.UNKNOWN,
  );
  expect(unspecified.HasMetric()).toBe(false);
  for (const value of [owner, fresh, unspecified]) value.dispose();
});

it("joins complete UTF16 paragraphs with native separators and preserves invalid-index behavior", /** Enum value three exercises the source fallback within its underlying range. @returns Nothing. */ () => {
  const owner = object("A\0😀", "", "last"),
    empty = object();
  expect(owner.GetParagraphCount()).toBe(3);
  expect(owner.GetTextLen(0)).toBe(4);
  expect([owner.HasText(0), owner.HasText(1), owner.HasText(-1)]).toEqual([true, false, false]);
  for (const index of [-1, 3]) {
    expect(owner.GetTextLen(index)).toBe(0);
    const value = owner.GetText(index);
    expect(value.isEmpty()).toBe(true);
    value.dispose();
  }
  const first = owner.GetText(0);
  expect(text(first)).toBe("A\0😀");
  first.dispose();
  const joined = owner.GetText();
  expect(text(joined)).toBe("A\0😀\n\nlast");
  joined.dispose();
  for (const [end, separator] of [
    [LineEnd.LINEEND_CR, "\r"],
    [LineEnd.LINEEND_LF, "\n"],
    [LineEnd.LINEEND_CRLF, "\r\n"],
    [3 as LineEnd, "\r\n"],
  ] as const) {
    const value = owner.GetTextWithLineEnd(end);
    expect(text(value)).toBe(`A\0😀${separator}${separator}last`);
    value.dispose();
  }
  const blank = empty.GetText();
  expect(blank.isEmpty()).toBe(true);
  blank.dispose();
  expect(empty.GetParagraphCount()).toBe(0);
  owner.dispose();
  empty.dispose();
});

it("keeps source orientation formulas and invalidates caches only on changed orientation", /** Six real orientation states plus independent cache metadata and user type. @returns Nothing. */ () => {
  const owner = object("text"),
    info = cache();
  expect([
    info.GetRefDevPtr(),
    info.GetPaperWidth(),
    info.getFontScaleX(),
    info.getFontScaleY(),
    info.getSpacingScaleX(),
    info.getSpacingScaleY(),
  ]).toEqual([null, 0xffffffff, 1, 2, 3, 4]);
  for (const [vertical, rotation, effective, top] of [
    [false, TextRotation.NONE, false, false],
    [false, TextRotation.TOPTOBOTTOM, true, true],
    [false, TextRotation.BOTTOMTOTOP, true, false],
    [true, TextRotation.NONE, true, true],
    [true, TextRotation.TOPTOBOTTOM, false, false],
    [true, TextRotation.BOTTOMTOTOP, false, false],
  ] as const) {
    owner.SetVertical(vertical);
    owner.SetRotation(rotation);
    owner.SetPortionInfo(info);
    owner.SetVertical(vertical);
    owner.SetRotation(rotation);
    expect(owner.GetPortionInfo()).toBe(info);
    expect([
      owner.GetVertical(),
      owner.GetRotation(),
      owner.IsEffectivelyVertical(),
      owner.IsTopToBottom(),
    ]).toEqual([vertical, rotation, effective, top]);
  }
  expect(owner.GetUserType()).toBe(OutlinerMode.DontKnow);
  owner.SetUserType(OutlinerMode.OutlineObject);
  expect(owner.GetUserType()).toBe(OutlinerMode.OutlineObject);
  expect(owner.GetPortionInfo()).toBe(info);
  const clone = owner.Clone();
  expect(clone.GetPortionInfo()).toBeNull();
  expect(clone.equals(owner)).toBe(true);
  owner.SetVertical(false);
  expect(owner.GetPortionInfo()).toBeNull();
  owner.SetPortionInfo(info);
  owner.SetRotation(TextRotation.NONE);
  expect(owner.GetPortionInfo()).toBeNull();
  owner.SetPortionInfo(info);
  owner.ClearPortionInfo();
  expect(owner.GetPortionInfo()).toBeNull();
  owner.dispose();
  clone.dispose();
});

it("projects actual character items, paragraph sets and sections and removes attributes with change-only cache invalidation", /** No item or pool double participates. @returns Nothing. */ () => {
  const owner = object("abc"),
    paragraph = owner.GetContents()[0] as ContentInfo,
    weight = new SvxWeightItem(FontWeight.WEIGHT_BOLD, EE_CHAR_WEIGHT);
  const attribute = owner.CreateAttrib(weight, 0, 2);
  paragraph.GetCharAttribs().push(attribute);
  expect(owner.GetParaAttribs(0)).toBe(paragraph.GetParaAttribs());
  const output = [new EECharAttrib(0, 0)];
  const previous = output[0];
  owner.GetCharAttribs(-1, output);
  owner.GetCharAttribs(1, output);
  expect(output[0]).toBe(previous);
  owner.GetCharAttribs(0, output);
  expect(output).toHaveLength(1);
  expect(output[0]).not.toBe(attribute);
  expect([
    (output[0] as EECharAttrib).nStart,
    (output[0] as EECharAttrib).nEnd,
    (output[0] as EECharAttrib).pAttr,
  ]).toEqual([0, 2, attribute.GetItem()]);
  const sections: Section[] = [];
  owner.GetAllSections(sections);
  expect(
    sections.map(
      /** Reads span. @param section - Section. @returns Bounds. */ (section) => [
        section.mnStart,
        section.mnEnd,
        section.maAttributes.length,
      ],
    ),
  ).toEqual([
    [0, 2, 1],
    [2, 3, 0],
  ]);
  const info = cache();
  owner.SetPortionInfo(info);
  expect(owner.RemoveCharAttribs(EE_FEATURE_FIELD)).toBe(false);
  expect(owner.GetPortionInfo()).toBe(info);
  expect(owner.RemoveCharAttribs(EE_CHAR_WEIGHT)).toBe(true);
  expect(owner.GetPortionInfo()).toBeNull();
  paragraph.GetCharAttribs().push(owner.CreateAttrib(weight, 0, 1));
  expect(owner.RemoveCharAttribs(0)).toBe(true);
  expect(owner.RemoveCharAttribs(0)).toBe(false);
  owner.GetCharAttribs(0, output);
  expect(output).toEqual([]);
  owner.dispose();
});

it("copies actual string and paragraph values while separating pool identity and spelling from value equality", /** Native base comparison ignores pool; strict operator includes it. @returns Nothing. */ () => {
  const owner = object("same"),
    clone = owner.Clone(),
    other = object("same");
  expect(owner.Equals(owner, true)).toBe(true);
  expect(owner.Equals(other)).toBe(true);
  expect(owner.equals(other)).toBe(false);
  expect(EditTextObject.prototype.Equals.call(owner, other)).toBe(true);
  expect(clone.GetPool()).toBe(owner.GetPool());
  expect(clone.GetContents()[0]).not.toBe(owner.GetContents()[0]);
  expect(owner.isWrongListEqual(clone)).toBe(true);
  expect(owner.HasOnlineSpellErrors()).toBe(false);
  const wrong = new WrongList();
  (owner.GetContents()[0] as ContentInfo).SetWrongList(wrong);
  expect(owner.HasOnlineSpellErrors()).toBe(false);
  expect(owner.isWrongListEqual(clone)).toBe(false);
  wrong.SetRanges([new MisspellRange(0n, 2n)]);
  expect(owner.HasOnlineSpellErrors()).toBe(true);
  expect(owner.equals(clone)).toBe(true);
  const spellingCopy = owner.Clone();
  expect(owner.isWrongListEqual(spellingCopy)).toBe(true);
  wrong.SetRanges([]);
  expect(owner.isWrongListEqual(spellingCopy)).toBe(false);
  const noParagraphs = object();
  expect(noParagraphs.isWrongListEqual(owner)).toBe(false);
  noParagraphs.dispose();
  clone.SetUserType(OutlinerMode.TextObject);
  expect(owner.Equals(clone)).toBe(false);
  clone.SetUserType(OutlinerMode.DontKnow);
  clone.SetVertical(true);
  expect(owner.Equals(clone)).toBe(false);
  clone.SetVertical(false);
  clone.SetRotation(TextRotation.TOPTOBOTTOM);
  expect(owner.Equals(clone)).toBe(false);
  const different = new EditTextObjectImpl(
    owner.GetPool(),
    MapUnit.MapPoint,
    false,
    TextRotation.NONE,
    SvtScriptType.LATIN,
  );
  expect(owner.Equals(different)).toBe(false);
  const script = new EditTextObjectImpl(
    owner.GetPool(),
    MapUnit.MapTwip,
    false,
    TextRotation.NONE,
    SvtScriptType.COMPLEX,
  );
  expect(owner.Equals(script)).toBe(false);
  const empty = object();
  expect(owner.Equals(empty)).toBe(false);
  const newText = unicode("changed");
  (other.GetContents()[0] as ContentInfo).SetText(newText);
  newText.dispose();
  expect(owner.Equals(other)).toBe(false);
  for (const value of [owner, clone, other, spellingCopy, different, script, empty])
    value.dispose();
});

it("normalizes through the actual string pool and returns independent shared-string owners", /** Native case operation borrows actual locale values. @returns Nothing. */ () => {
  const owner = object("a\0ß", "a\0ß"),
    en = unicode("en"),
    blank = new OUString(),
    locale = new Locale(en, blank, blank);
  const pool = new SharedStringPool({
    /** Binds actual uppercase. @param value - String. @returns Mapped value. */ uppercase(
      value: OUStringConstReference,
    ) {
      return uppercase(value, locale);
    },
  });
  owner.NormalizeString(pool);
  const values = owner.GetSharedStrings();
  expect(values[0]).not.toBe((owner.GetContents()[0] as ContentInfo).GetSharedString());
  expect((values[0] as SharedString).getData()).toBe((values[1] as SharedString).getData());
  expect((values[0] as SharedString).getDataIgnoreCase()).not.toBeNull();
  owner.dispose();
  expect(text((values[0] as SharedString).getString())).toBe("a\0ß");
  for (const value of values) value.dispose();
  en.dispose();
  blank.dispose();
});

it("preserves style output bounds and the native difference between rename and matching-change cache behavior", /** Source invalidation is intentionally asymmetric. @returns Nothing. */ () => {
  const owner = object("a", "b"),
    name = unicode("old"),
    changed = unicode("new"),
    missing = unicode("missing"),
    output = unicode("unchanged"),
    family: [SfxStyleFamily] = [SfxStyleFamily.Char],
    info = cache();
  owner.SetPortionInfo(info);
  owner.SetStyleSheet(-1, name, SfxStyleFamily.Para);
  owner.SetStyleSheet(2, name, SfxStyleFamily.Para);
  owner.GetStyleSheet(-1, output, family);
  owner.GetStyleSheet(2, output, family);
  expect(text(output)).toBe("unchanged");
  expect(family[0]).toBe(SfxStyleFamily.Char);
  owner.SetStyleSheet(0, name, SfxStyleFamily.Para);
  expect(owner.GetPortionInfo()).toBe(info);
  owner.GetStyleSheet(0, output, family);
  expect(text(output)).toBe("old");
  expect(family[0]).toBe(SfxStyleFamily.Para);
  expect(
    owner.ChangeStyleSheets(
      missing.getStr().subarray(0, missing.getLength()),
      SfxStyleFamily.Para,
      changed,
      SfxStyleFamily.Char,
    ),
  ).toBe(false);
  expect(owner.GetPortionInfo()).toBe(info);
  owner.ChangeStyleSheetName(
    SfxStyleFamily.Char,
    name.getStr().subarray(0, name.getLength()),
    changed,
  );
  expect(text((owner.GetContents()[0] as ContentInfo).GetStyle())).toBe("old");
  owner.ChangeStyleSheetName(
    SfxStyleFamily.Para,
    name.getStr().subarray(0, name.getLength()),
    changed,
  );
  expect(text((owner.GetContents()[0] as ContentInfo).GetStyle())).toBe("new");
  expect(owner.GetPortionInfo()).toBe(info);
  expect(
    owner.ChangeStyleSheets(
      changed.getStr().subarray(0, changed.getLength()),
      SfxStyleFamily.Para,
      changed,
      SfxStyleFamily.Para,
    ),
  ).toBe(true);
  expect(owner.GetPortionInfo()).toBeNull();
  owner.SetPortionInfo(info);
  expect(
    owner.ChangeStyleSheets(
      changed.getStr().subarray(0, changed.getLength()),
      SfxStyleFamily.Para,
      name,
      SfxStyleFamily.Char,
    ),
  ).toBe(true);
  expect(owner.GetPortionInfo()).toBeNull();
  owner.GetStyleSheet(0, output, family);
  expect(text(output)).toBe("old");
  expect(family[0]).toBe(SfxStyleFamily.Char);
  owner.dispose();
  for (const value of [name, changed, missing, output]) value.dispose();
});

it("uses filtered field ordinals and reverse last-field lookup without inventing text-span filtering", /** Field APIs have distinct native selection rules. @returns Nothing. */ () => {
  const owner = object("x"),
    attrs = (owner.GetContents()[0] as ContentInfo).GetCharAttribs();
  expect(owner.GetField()).toBeNull();
  expect(owner.IsFieldObject()).toBe(false);
  expect(owner.HasField()).toBe(false);
  attrs.push(owner.CreateAttrib(new SvxWeightItem(FontWeight.WEIGHT_BOLD, EE_CHAR_WEIGHT), 0, 1));
  expect(owner.GetField()).toBeNull();
  for (const data of [
    new SvxURLField(),
    new SvxTableField(3),
    new SvxFieldData(),
    new SvxTableField(4),
  ])
    attrs.push(owner.CreateAttrib(new SvxFieldItem(data, EE_FEATURE_FIELD), 5, 8));
  expect(owner.GetField()).toBe((attrs[4] as XEditAttribute).GetItem());
  expect(owner.IsFieldObject()).toBe(true);
  expect((owner.GetFieldData(0, 0, FieldType.TABLE) as SvxTableField).GetTab()).toBe(3);
  expect((owner.GetFieldData(0, 1n, FieldType.TABLE) as SvxTableField).GetTab()).toBe(4);
  expect(owner.GetFieldData(0, 2, FieldType.TABLE)).toBeNull();
  expect(owner.GetFieldData(0, 4, FieldType.UNSPECIFIED)).toBeNull();
  expect(owner.GetFieldData(0, 5, FieldType.UNSPECIFIED)).toBeNull();
  expect(owner.GetFieldData(0, -1n, FieldType.UNSPECIFIED)).toBeNull();
  expect(owner.GetFieldData(0, 1n << 64n, FieldType.UNSPECIFIED)).toBe(
    ((attrs[1] as XEditAttribute).GetItem() as SvxFieldItem).GetField(),
  );
  expect(owner.GetFieldData(-1, 0, FieldType.TABLE)).toBeNull();
  expect(owner.GetFieldData(1, 0, FieldType.TABLE)).toBeNull();
  expect(owner.HasField(FieldType.TABLE)).toBe(true);
  expect(owner.HasField(FieldType.URL)).toBe(true);
  expect(owner.HasField(FieldType.DATE)).toBe(false);
  const multi = object("ab"),
    empty = object();
  expect(multi.GetField()).toBeNull();
  expect(empty.GetField()).toBeNull();
  const nullOwner = object("x");
  (nullOwner.GetContents()[0] as ContentInfo)
    .GetCharAttribs()
    .push(nullOwner.CreateAttrib(new SvxFieldItem(null, EE_FEATURE_FIELD, true), 0, 1));
  expect(nullOwner.HasField()).toBe(true);
  expect(nullOwner.HasField(FieldType.TABLE)).toBe(false);
  expect(nullOwner.GetFieldData(0, 0, FieldType.UNSPECIFIED)).toBeNull();
  for (const value of [owner, multi, empty, nullOwner]) value.dispose();
});

it("updates genuine table fields and lets the page-relative callback replace every field through its actual holder", /** The native callback deliberately visits non-URL fields and retains portion cache. @returns Nothing. */ () => {
  const owner = object("x"),
    attrs = (owner.GetContents()[0] as ContentInfo).GetCharAttribs(),
    info = cache();
  attrs.push(owner.CreateAttrib(new SvxWeightItem(FontWeight.WEIGHT_NORMAL, EE_CHAR_WEIGHT), 0, 1));
  for (const data of [new SvxURLField(), new SvxTableField(3), new SvxFieldData()])
    attrs.push(owner.CreateAttrib(new SvxFieldItem(data, EE_FEATURE_FIELD), 0, 1));
  owner.SetPortionInfo(info);
  const updater = new FieldUpdater(owner.GetFieldUpdater());
  updater.updateTableFields(-7);
  expect((owner.GetFieldData(0, 0, FieldType.TABLE) as SvxTableField).GetTab()).toBe(-7);
  const visited: number[] = [];
  updater.UpdatePageRelativeURLs(
    /** Reads actual field and replaces URL using the genuine pool-bound write sink. @param item - Borrowed item. @param sink - Actual write access. @returns Nothing. */ (
      item,
      sink,
    ) => {
      visited.push((item.GetField() as SvxFieldData).GetClassId());
      if ((item.GetField() as SvxFieldData).GetClassId() === FieldType.URL)
        sink.SetItem(new SvxFieldItem(new SvxTableField(19), EE_FEATURE_FIELD));
    },
  );
  expect(visited).toEqual([FieldType.URL, FieldType.TABLE, FieldType.UNSPECIFIED]);
  expect((owner.GetFieldData(0, 0, FieldType.TABLE) as SvxTableField).GetTab()).toBe(19);
  expect(owner.GetPortionInfo()).toBe(info);
  const empty = object();
  let calls = 0;
  empty.GetFieldUpdater().updateTableFields(0);
  empty.GetFieldUpdater().UpdatePageRelativeURLs(
    /** Counts callbacks. @returns Nothing. */ () => {
      ++calls;
    },
  );
  expect(calls).toBe(0);
  owner.dispose();
  empty.dispose();
});
