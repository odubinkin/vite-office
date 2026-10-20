/** @fileoverview Native numbering-format scalar/color ownership used by the real SvxNumRule dependency;no rule,format or color mocks. */
import { expect, it } from "vitest";
import {
  SvxNumberFormat,
  SvxNumRule,
  SvxNumRuleFlags,
  SVX_NUM_REL_SIZE_MIN,
} from "../../inc/numitem";
import { SvxNumType, SvxAdjust } from "../../inc/svxenum";
import { Color, COL_BLACK } from "../../../tools/inc/color";

it("retains original alignment,color,relative-size,character-style and legal defaults", /** All values are owned by the shared original base format. @returns Nothing. */ () => {
  const format = new SvxNumberFormat(SvxNumType.SVX_NUM_ARABIC);
  expect(format.GetNumAdjust()).toBe(SvxAdjust.Left);
  expect(format.GetBulletRelSize()).toBe(100);
  expect(format.GetBulletColor().equals(COL_BLACK)).toBe(true);
  expect(format.GetCharFormatName()).toBe("");
  expect(format.GetIsLegal()).toBe(false);
  expect(SVX_NUM_REL_SIZE_MIN).toBe(25);
  const rule = new SvxNumRule(SvxNumRuleFlags.NONE, 2, false);
  expect(rule.GetLevel(1).GetBulletColor().equals(COL_BLACK)).toBe(true);
});

it("narrows native relative size before applying its minimum and preserves unvalidated enum/name values", /** Upper relative sizes and arbitrary Unicode style names are accepted upstream. @returns Nothing. */ () => {
  const format = new SvxNumberFormat(SvxNumType.SVX_NUM_ARABIC);
  for (const [input, expected] of [
    [0, 25],
    [24, 25],
    [25, 25],
    [100, 100],
    [65536, 25],
    [-1, 65535],
  ] as const) {
    format.SetBulletRelSize(input);
    expect(format.GetBulletRelSize()).toBe(expected);
  }
  format.SetNumAdjust(123 as SvxAdjust);
  expect(format.GetNumAdjust()).toBe(123);
  format.SetCharFormatName("A\0😀e\u0301");
  expect(format.GetCharFormatName()).toBe("A\0😀e\u0301");
});

it("compares and copies all added original fields while retaining stable borrowed color identity", /** Native copied Color values never alias another format or caller color. @returns Nothing. */ () => {
  const source = new SvxNumberFormat(SvxNumType.SVX_NUM_ARABIC);
  const changed = new SvxNumberFormat(source);
  changed.SetNumAdjust(SvxAdjust.Right);
  expect(changed.Equals(source)).toBe(false);
  source.SetNumAdjust(SvxAdjust.Right);
  expect(changed.Equals(source)).toBe(true);
  changed.SetBulletRelSize(30);
  expect(changed.Equals(source)).toBe(false);
  source.SetBulletRelSize(30);
  const input = new Color(1, 2, 3);
  const borrowed = changed.GetBulletColor();
  changed.SetBulletColor(input);
  expect(changed.GetBulletColor()).toBe(borrowed);
  expect(changed.Equals(source)).toBe(false);
  source.SetBulletColor(input);
  input.assign(COL_BLACK);
  expect(changed.GetBulletColor().toUInt32()).toBe(0x010203);
  expect(changed.Equals(source)).toBe(true);
  changed.SetCharFormatName("Original style");
  expect(changed.Equals(source)).toBe(false);
  source.SetCharFormatName("Original style");
  changed.SetIsLegal(true);
  expect(changed.Equals(source)).toBe(false);
  source.SetIsLegal(true);
  expect(changed.Equals(source)).toBe(true);
  const copy = new SvxNumberFormat(source);
  expect(copy.Equals(source)).toBe(true);
  expect(copy.GetBulletColor()).not.toBe(source.GetBulletColor());
  source.SetBulletColor(COL_BLACK);
  expect(copy.GetBulletColor().toUInt32()).toBe(0x010203);
  expect(copy.Equals(source)).toBe(false);
  const rule = new SvxNumRule(SvxNumRuleFlags.NONE, 1, false);
  rule.SetLevel(0, copy);
  const cloned = new SvxNumRule(rule);
  copy.SetIsLegal(false);
  expect(rule.GetLevel(0).GetIsLegal()).toBe(true);
  expect(cloned.GetLevel(0).GetBulletColor()).not.toBe(rule.GetLevel(0).GetBulletColor());
  expect(cloned.GetLevel(0).GetCharFormatName()).toBe("Original style");
  expect(cloned.Equals(rule)).toBe(true);
});
