/** @fileoverview Source-backed numbering-rule storage,validity,default geometry and ownership prerequisites for the genuine EditEngine item package. */
import { expect, it } from "vitest";
import {
  SvxNumRule,
  SvxNumRuleFlags as F,
  SvxNumRuleType as T,
  SvxNumBulletItem,
  SvxNodeNum,
  SvxConvertNumRule,
  SvxNumberFormat,
} from "../../inc/numitem";
import { SVX_MAX_NUM, SVX_DEF_BULLET } from "../../inc/numdef";
import { SvxNumType as N } from "../../inc/svxenum";
import { SfxBoolItem } from "../../../svl/inc/eitem";
import { SwNumFormat } from "../../../sw/source/core/doc/number";

it("constructs the actual zero-level dynamic EditEngine default without inventing valid levels", /** eerdll.cxx creates NONE,0,false and native fallback formats remain independent of validity. @returns Nothing. */ () => {
  const rule = new SvxNumRule(F.NONE, 0, false);
  expect([SVX_MAX_NUM, SVX_DEF_BULLET]).toEqual([10, 0xf095]);
  expect(rule.GetLevelCount()).toBe(0);
  expect(rule.GetFeatureFlags()).toBe(F.NONE);
  expect(rule.GetNumRuleType()).toBe(T.NUMBERING);
  expect(rule.IsContinuousNumbering()).toBe(false);
  for (let i = 0; i < 10; i++) expect(rule.Get(i)).toBeNull();
  expect(rule.Get(10)).toBeNull();
  expect(rule.Get(-1)).toBeNull();
  const standard = rule.GetLevel(0);
  expect(standard.GetNumberingType()).toBe(N.SVX_NUM_ARABIC);
  expect(rule.GetLevel(10)).toBe(standard);
  expect(new SvxNumRule(F.NONE, 0, true).GetLevel(-1)).toBe(standard);
  const outline = new SvxNumRule(F.NONE, 0, false, T.OUTLINE_NUMBERING);
  expect(outline.GetLevel(0).GetNumberingType()).toBe(N.SVX_NUM_NUMBER_NONE);
  expect(new SvxNumRule(F.NONE, 0, false, T.PRESENTATION_NUMBERING).GetLevel(0)).toBe(
    outline.GetLevel(0),
  );
});

it("retains native Writer integral mm100 conversion and independent Draw versus alignment-mode defaults", /** Constructor feature CONTINUOUS is distinct from the sequential-numbering bool. @returns Nothing. */ () => {
  const writer = new SvxNumRule(F.CONTINUOUS, 3, false);
  for (const [i, expected] of [
    [0, 283],
    [1, 567],
    [2, 850],
  ] as const) {
    const format = writer.GetLevel(i);
    expect(format.GetNumberingType()).toBe(N.SVX_NUM_CHARS_UPPER_LETTER);
    expect(format.GetAbsLSpace()).toBe(expected);
    expect(format.GetFirstLineOffset()).toBe(-283);
    expect(writer.Get(i)).toBeNull();
  }
  expect(writer.IsContinuousNumbering()).toBe(false);
  const unknownMode = new SvxNumRule(
    F.CONTINUOUS,
    1,
    false,
    T.NUMBERING,
    "unknown" as "label-alignment",
  );
  expect(unknownMode.GetLevel(0).GetAbsLSpace()).toBe(0);
  const draw = new SvxNumRule(F.NONE, 3, true, T.NUMBERING, "label-alignment");
  for (let i = 0; i < 3; i++) {
    expect(draw.GetLevel(i).GetAbsLSpace()).toBe(800 * i);
    expect(draw.GetLevel(i).GetPositionAndSpaceMode()).toBe("label-width-and-position");
  }
  const aligned = new SvxNumRule(F.CONTINUOUS, 10, true, T.NUMBERING, "label-alignment");
  for (let i = 0; i < 10; i++) {
    const format = aligned.GetLevel(i);
    expect(format.GetPositionAndSpaceMode()).toBe("label-alignment");
    expect(format.GetLabelFollowedBy()).toBe("listtab");
    expect(format.GetFirstLineIndent()).toBe(-360);
    expect(format.GetIndentAt()).toBe(360 * (i + 2));
    expect(format.GetListtabPos()).toBe(360 * (i + 2));
  }
});

it("preserves physical-format versus valid-format lookup and the equal-format validity asymmetry", /** Native SetLevel replaces only when previous validity is false or format differs. @returns Nothing. */ () => {
  const rule = new SvxNumRule(F.NONE, 1, false);
  const format = new SvxNumberFormat(N.SVX_NUM_ARABIC);
  format.SetStart(7);
  rule.SetLevel(0, format, false);
  expect(rule.Get(0)).toBeNull();
  expect(rule.GetLevel(0).GetStart()).toBe(7);
  const invalid = rule.GetLevel(0);
  rule.SetLevel(0, format);
  const valid = rule.Get(0);
  expect(valid).not.toBe(invalid);
  expect(valid).not.toBe(format);
  expect(valid).toBe(rule.GetLevel(0));
  rule.SetLevel(0, format, false);
  expect(rule.Get(0)).toBe(valid);
  format.SetStart(9);
  rule.SetLevel(0, format, false);
  expect(rule.Get(0)).toBeNull();
  expect(rule.GetLevel(0).GetStart()).toBe(9);
  rule.SetLevelPointer(0, format);
  expect(rule.Get(0)).toBe(rule.GetLevel(0));
  rule.SetLevelPointer(0, format);
  expect(rule.Get(0)?.GetStart()).toBe(9);
  rule.SetLevelPointer(0, null);
  expect(rule.Get(0)).toBeNull();
  expect(rule.GetLevel(0).GetNumberingType()).toBe(N.SVX_NUM_ARABIC);
  rule.SetLevel(10, format);
  rule.SetLevelPointer(10, format);
  expect(rule.Get(10)).toBeNull();
  rule.SetLevel(65536, format);
  expect(rule.Get(0)?.GetStart()).toBe(9);
});

it("copies all ten physical slots while equality only compares the active count", /** Original source keeps unused-level values in copy/assignment but ignores them in equality. @returns Nothing. */ () => {
  const rule = new SvxNumRule(F.NONE, 1, false);
  const format = new SvxNumberFormat(N.SVX_NUM_ARABIC);
  format.SetStart(42);
  rule.SetLevel(9, format);
  const copy = new SvxNumRule(rule);
  expect(copy.Equals(rule)).toBe(true);
  expect(copy.Get(9)).not.toBe(rule.Get(9));
  expect(copy.Get(9)?.GetStart()).toBe(42);
  format.SetStart(43);
  copy.SetLevel(9, format);
  expect(copy.Equals(rule)).toBe(true);
  copy.SetLevel(0, format);
  expect(copy.Equals(rule)).toBe(false);
  rule.SetLevel(0, format);
  expect(copy.Equals(rule)).toBe(true);
  expect(copy.Assign(rule)).toBe(copy);
  const stable = copy.Get(0);
  expect(copy.Assign(copy)).toBe(copy);
  expect(copy.Get(0)).toBe(stable);
  copy.SetLevelPointer(0, null);
  expect(copy.Equals(rule)).toBe(false);
  expect(rule.Equals(copy)).toBe(false);
  expect(new SvxNumRule(F.NONE, 2, false).Equals(rule)).toBe(false);
  expect(new SvxNumRule(F.CONTINUOUS, 1, false).Equals(rule)).toBe(false);
  expect(new SvxNumRule(F.NONE, 1, true).Equals(rule)).toBe(false);
  expect(new SvxNumRule(F.NONE, 1, false, T.OUTLINE_NUMBERING).Equals(rule)).toBe(false);
});

it("retains independent feature bits and current numbering mode", /** Feature masks use any-intersection semantics. @returns Nothing. */ () => {
  const rule = new SvxNumRule(F.NONE, 0, false);
  rule.SetFeatureFlag(F.CHAR_STYLE | F.BULLET_COLOR);
  expect(rule.GetFeatureFlags()).toBe(0x14);
  expect(rule.IsFeatureSupported(F.NONE)).toBe(false);
  expect(rule.IsFeatureSupported(F.BULLET_COLOR | F.CONTINUOUS)).toBe(true);
  rule.SetFeatureFlag(F.CHAR_STYLE, false);
  expect(rule.GetFeatureFlags()).toBe(F.BULLET_COLOR);
  expect(rule.IsFeatureSupported(F.CHAR_STYLE)).toBe(false);
  rule.SetContinuousNumbering(true);
  expect(rule.IsContinuousNumbering()).toBe(true);
  expect(rule.GetFeatureFlags()).toBe(F.BULLET_COLOR);
});

it("owns actual fixed node-number storage and preserves native byte/short conversions", /** Copies do not alias the fixed array. @returns Nothing. */ () => {
  const node = new SvxNodeNum();
  expect(node.GetLevel()).toBe(0);
  expect([...node.GetLevelVal()]).toEqual([0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
  node.SetLevel(258);
  node.GetLevelVal()[2] = 65537;
  const copy = new SvxNodeNum();
  expect(copy.Assign(node)).toBe(copy);
  expect(copy.GetLevel()).toBe(2);
  expect(copy.GetLevelVal()[2]).toBe(1);
  node.GetLevelVal()[2] = 9;
  expect(copy.GetLevelVal()[2]).toBe(1);
  const storage = copy.GetLevelVal();
  expect(copy.Assign(copy).GetLevelVal()).toBe(storage);
  const constructed = new SvxNodeNum(copy);
  expect(constructed.GetLevel()).toBe(copy.GetLevel());
  expect(constructed.GetLevelVal()).not.toBe(copy.GetLevelVal());
  expect([...constructed.GetLevelVal()]).toEqual([...copy.GetLevelVal()]);
});

it("constructs and clones genuine pooled rule values with the native slot default and owned rule member", /** This exercises the real zero-level EditEngine dynamic-default value without a fake pool or UNO wrapper. @returns Nothing. */ () => {
  const rule = new SvxNumRule(F.NONE, 0, false);
  const item = new SvxNumBulletItem(rule);
  expect(item.Which()).toBe(10855);
  expect(item.GetNumRule()).not.toBe(rule);
  expect(item.GetNumRule()).toBe(item.GetNumRule());
  expect(item.GetNumRule().Equals(rule)).toBe(true);
  rule.SetContinuousNumbering(true);
  expect(item.GetNumRule().IsContinuousNumbering()).toBe(false);
  const clone = item.Clone();
  expect(clone.equals(item)).toBe(true);
  expect(clone.GetNumRule()).not.toBe(item.GetNumRule());
  expect(new SvxNumBulletItem(item.GetNumRule(), 4026).equals(item)).toBe(true);
  expect(item.equals(new SfxBoolItem(10855))).toBe(false);
  clone.GetNumRule().SetContinuousNumbering(true);
  expect(clone.equals(item)).toBe(false);
});

it("retains original conversion materialization of invalid physical levels and destination trailing defaults", /** Conversion uses GetLevel rather than valid-level Get and does not carry the source mode into destination constructor defaults. @returns Nothing. */ () => {
  const source = new SvxNumRule(F.CONTINUOUS, 2, true, T.NUMBERING, "label-alignment");
  const format = new SvxNumberFormat(N.SVX_NUM_ARABIC);
  format.SetStart(9);
  source.SetLevel(0, format, false);
  source.SetLevelPointer(1, null);
  const converted = SvxConvertNumRule(source, 3, T.OUTLINE_NUMBERING);
  expect(converted.GetLevelCount()).toBe(3);
  expect(converted.GetNumRuleType()).toBe(T.OUTLINE_NUMBERING);
  expect(converted.GetFeatureFlags()).toBe(F.CONTINUOUS);
  expect(converted.IsContinuousNumbering()).toBe(true);
  expect(converted.Get(0)?.GetStart()).toBe(9);
  expect(converted.Get(0)).not.toBe(source.GetLevel(0));
  expect(converted.Get(1)?.GetNumberingType()).toBe(N.SVX_NUM_ARABIC);
  expect(converted.Get(2)).toBeNull();
  expect(converted.GetLevel(2).GetAbsLSpace()).toBe(850);
  const shortened = SvxConvertNumRule(converted, 1, T.NUMBERING);
  expect(shortened.GetLevelCount()).toBe(1);
  expect(shortened.Get(0)?.GetStart()).toBe(9);
  expect(SvxConvertNumRule(source, 0, T.NUMBERING).GetLevelCount()).toBe(0);
  const empty = new SvxNumRule(F.NONE, 0, false);
  empty.SetLevelPointer(0, format);
  expect(empty.Get(0)?.GetStart()).toBe(9);
});

it("uses the original nonvirtual base comparison when the caller passes an actual Writer format", /** Writer Equals also compares SwClient registration and cannot be dispatched with a sliced base format. @returns Nothing. */ () => {
  const writer = new SwNumFormat();
  const rule = new SvxNumRule(F.NONE, 1, false);
  rule.SetLevel(0, writer);
  const stored = rule.Get(0);
  expect(stored).not.toBeInstanceOf(SwNumFormat);
  rule.SetLevel(0, writer, false);
  expect(rule.Get(0)).toBe(stored);
  expect(rule.Get(0)?.GetNumberingType()).toBe(N.SVX_NUM_ARABIC);
});
