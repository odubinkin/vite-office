/** @fileoverview Real native ScPageHFItem ownership and ScGlobal nullable rich-text comparison,without a substitute engine or UNO service. */
import { expect, it } from "vitest";
import { ScPageHFItem } from "../../../inc/attrib";
import { ScGlobal } from "./global";
import {
  EditTextObjectImpl,
  TextRotation,
  type EditTextObjectConstReference,
} from "../../../../editeng/inc/editobj";
import { MapUnit } from "../../../../tools/inc/mapunit";
import { SvtScriptType } from "../../../../svl/inc/languageoptions";
import { SfxStyleFamily } from "../../../../svl/inc/style-values";
import { SfxBoolItem } from "../../../../svl/inc/eitem";
import { SfxItemPool } from "../../../../svl/inc/itempool";
import { unicode, text } from "../../../../i18nlangtag/source/isolang/isolang.tables";
import { SvxFieldItem, SvxTableField } from "../../../../editeng/inc/flditem";
import { EE_FEATURE_FIELD } from "../../../../editeng/inc/eeitem";

/** Initializes an actual owner at the original producer boundary. @param value - Paragraph text. @returns Owner. */
function object(value?: string): EditTextObjectImpl {
  const owner = new EditTextObjectImpl(
    null,
    MapUnit.Map100thMM,
    false,
    TextRotation.NONE,
    SvtScriptType.LATIN,
  );
  if (value !== undefined) {
    const s = unicode(value);
    owner.CreateAndInsertContent().SetText(s);
    s.dispose();
  }
  return owner;
}
/** Reads and releases the native owned string result. @param owner - Actual text reference. @returns Text. */
function contents(owner: EditTextObjectConstReference): string {
  const s = owner.GetText();
  try {
    return text(s);
  } finally {
    s.dispose();
  }
}

it("keeps all default areas null and distinguishes null from an actual empty text value", /** Default creation does not fabricate an engine or an empty paragraph. @returns Nothing. */ () => {
  const item = new ScPageHFItem(177),
    clone = item.Clone(),
    empty = object();
  expect(item.Which()).toBe(177);
  expect([item.GetLeftArea(), item.GetCenterArea(), item.GetRightArea()]).toEqual([
    null,
    null,
    null,
  ]);
  expect(clone.equals(item)).toBe(true);
  expect(item.equals(new SfxBoolItem(177))).toBe(false);
  clone.SetLeftArea(empty);
  expect(clone.equals(item)).toBe(false);
  expect(item.equals(clone)).toBe(false);
  const middle = new ScPageHFItem(177),
    right = new ScPageHFItem(177);
  middle.SetCenterArea(empty);
  right.SetRightArea(empty);
  expect(item.equals(middle)).toBe(false);
  expect(item.equals(right)).toBe(false);
  expect(ScGlobal.EETextObjEqual(null, null)).toBe(true);
  expect(ScGlobal.EETextObjEqual(null, empty)).toBe(false);
  expect(ScGlobal.EETextObjEqual(empty, null)).toBe(false);
  expect(ScGlobal.EETextObjEqual(empty, empty)).toBe(true);
  for (const value of [item, clone, middle, right, empty]) value.dispose();
});

it("owns independent three-area clones and clones before replacing an aliased existing area", /** Actual shared strings and pools retain original ownership rather than a browser text projection. @returns Nothing. */ () => {
  const source = object("A\0😀"),
    item = new ScPageHFItem(180);
  item.SetLeftArea(source);
  item.SetCenterArea(source);
  item.SetRightArea(source);
  for (const area of [item.GetLeftArea(), item.GetCenterArea(), item.GetRightArea()]) {
    expect(area).not.toBe(source);
    expect((area as EditTextObjectConstReference).GetPool()).toBe(source.GetPool());
    expect(contents(area as EditTextObjectConstReference)).toBe("A\0😀");
  }
  expect(item.GetLeftArea()).not.toBe(item.GetCenterArea());
  const clone = item.Clone(new SfxItemPool());
  expect(clone.Which()).toBe(180);
  expect(clone.equals(item)).toBe(true);
  expect(clone.GetLeftArea()).not.toBe(item.GetLeftArea());
  item.SetLeftArea(item.GetLeftArea() as EditTextObjectConstReference);
  item.SetCenterArea(item.GetCenterArea() as EditTextObjectConstReference);
  item.SetRightArea(item.GetRightArea() as EditTextObjectConstReference);
  expect(item.equals(clone)).toBe(true);
  const copy = (item.GetLeftArea() as EditTextObjectConstReference).GetSharedStrings();
  const replacement = object("replacement");
  item.SetLeftArea(replacement);
  replacement.dispose();
  item.dispose();
  const saved = copy[0];
  if (saved === undefined) throw Error("Missing owned shared string");
  expect(text(saved.getString())).toBe("A\0😀");
  for (const value of copy) value.dispose();
  source.dispose();
  clone.dispose();
});

it("uses native pool-insensitive text equality and preserves independent field/style values", /** Strict EditTextObject operator equality remains distinct from ScGlobal's base Equals call. @returns Nothing. */ () => {
  const a = object("x"),
    b = object("x"),
    other = object("different");
  expect(a.GetPool()).not.toBe(b.GetPool());
  expect(a.equals(b)).toBe(false);
  expect(ScGlobal.EETextObjEqual(a, b)).toBe(true);
  expect(ScGlobal.EETextObjEqual(a, other)).toBe(false);
  const p = a.GetContents()[0];
  if (p === undefined) throw Error("Missing initialized paragraph");
  p.GetCharAttribs().push(
    a.CreateAttrib(new SvxFieldItem(new SvxTableField(3), EE_FEATURE_FIELD), 0, 1),
  );
  const name = unicode("Native style");
  a.SetStyleSheet(0, name, SfxStyleFamily.Para);
  name.dispose();
  const item = new ScPageHFItem(179);
  item.SetLeftArea(a);
  item.SetCenterArea(b);
  item.SetRightArea(other);
  const clone = new ScPageHFItem(item);
  expect(clone.equals(item)).toBe(true);
  a.GetFieldUpdater().updateTableFields(8);
  const owned = item.GetLeftArea() as EditTextObjectConstReference;
  expect((owned.GetField()?.GetField() as Readonly<SvxTableField>).GetTab()).toBe(3);
  const output = unicode(""),
    family: [SfxStyleFamily] = [SfxStyleFamily.None];
  owned.GetStyleSheet(0, output, family);
  expect(text(output)).toBe("Native style");
  output.dispose();
  expect(family[0]).toBe(SfxStyleFamily.Para);
  for (const value of [item, clone, a, b, other]) value.dispose();
});
