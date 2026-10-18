/** @fileoverview Source-bound five-field line-spacing and real UNO struct regressions, with no native runtime probes. */
import { describe, expect, it } from "vitest";
import { SvxLineSpacingItem, LINE_SPACE_DEFAULT_HEIGHT } from "../../inc/lspcitem";
import { SvxLineSpaceRule as Rule, SvxInterLineSpaceRule as Inter } from "../../inc/svxenum";
import { MID_LINESPACE } from "../../inc/memberids";
import { MID_HEIGHT } from "../../../svl/inc/memberid";
import { CONVERT_TWIPS } from "../../../svl/inc/poolitem";
import { SfxInt16Item } from "../../../svl/inc/intitem";
import { Any } from "../../../cppu/inc/com/sun/star/uno/Any";
import {
  LineSpacing,
  cppu_detail_getUnoType_LineSpacing as spacingType,
} from "../../../offapi/com/sun/star/style/LineSpacing";
import * as Mode from "../../../offapi/com/sun/star/style/LineSpacingMode";

/** Creates a real typed struct Any. @param mode - UNO mode. @param height - UNO short height. @returns Typed value. */
function descriptor(mode: number, height: number): Any {
  const value = new Any();
  value.insert(new LineSpacing(mode, height), spacingType);
  return value;
}
/** Creates a real short Any. @param value - Short. @returns Typed value. */
function short(value: number): Any {
  const result = new Any();
  result.insert([value], "sal_Int16");
  return result;
}
/** Captures all native stored fields independently of the active descriptor. @param item - Native item. @returns Complete state. */
function fields(item: SvxLineSpacingItem): number[] {
  return [
    item.GetInterLineSpace(),
    item.GetLineHeight(),
    item.GetPropLineSpace(),
    item.GetLineSpaceRule(),
    item.GetInterLineSpaceRule(),
  ];
}

describe("original shared five-field line spacing", /** Checks native state and transport contracts. @returns Nothing. */ () => {
  it("retains original defaults, side effects, copies, inactive equality and full hash", /** Checks native state and transport contracts. @returns Nothing. */ () => {
    const a = SvxLineSpacingItem.CreateDefault();
    expect(LINE_SPACE_DEFAULT_HEIGHT).toBe(200);
    expect(a.Which()).toBe(0);
    expect(fields(a)).toEqual([0, 200, 100, Rule.Auto, Inter.Off]);
    const ee = new SvxLineSpacingItem(0, 4040);
    expect(a.equals(ee)).toBe(true);
    expect(a.hashCode()).not.toBe(ee.hashCode());
    expect(a.supportsHashCode()).toBe(true);
    expect(a.HasMetrics()).toBe(false);
    a.ScaleMetrics(2);
    expect(fields(a)).toEqual([0, 200, 100, Rule.Auto, Inter.Off]);
    expect(a.equals(new SfxInt16Item(0, 0))).toBe(false);
    a.SetInterLineSpace(65535);
    expect(a.GetInterLineSpace()).toBe(-1);
    expect(a.GetInterLineSpaceRule()).toBe(Inter.Fix);
    a.SetLineHeight(-1);
    expect(a.GetLineHeight()).toBe(65535);
    expect(a.GetLineSpaceRule()).toBe(Rule.Min);
    a.SetPropLineSpace(65537);
    expect(a.GetPropLineSpace()).toBe(1);
    expect(a.GetInterLineSpaceRule()).toBe(Inter.Prop);
    const copy = new SvxLineSpacingItem(a),
      clone = a.Clone();
    expect(fields(copy)).toEqual(fields(a));
    expect(clone.equals(a)).toBe(true);
    expect(clone.hashCode()).toBe(a.hashCode());
    expect(clone.Which()).toBe(0);
    clone.SetPropLineSpace(2);
    expect(a.equals(clone)).toBe(false);
    clone.SetPropLineSpace(1);
    clone.SetLineHeight(200);
    expect(a.equals(clone)).toBe(false);
    clone.SetLineHeight(65535);
    clone.SetLineSpaceRule(Rule.Fix);
    expect(a.equals(clone)).toBe(false);
    clone.SetLineSpaceRule(Rule.Min);
    clone.SetInterLineSpaceRule(Inter.Off);
    expect(a.equals(clone)).toBe(false);
    a.SetInterLineSpaceRule(Inter.Fix);
    clone.SetInterLineSpace(-1);
    expect(a.equals(clone)).toBe(true);
    clone.SetInterLineSpace(4);
    expect(a.equals(clone)).toBe(false);
    a.SetInterLineSpaceRule(12 as Inter);
    clone.SetInterLineSpaceRule(12 as Inter);
    expect(a.equals(clone)).toBe(false);
  });
  it("projects all original modes through detached descriptors and real typed output", /** Checks native state and transport contracts. @returns Nothing. */ () => {
    const item = new SvxLineSpacingItem(200, 64),
      output = new Any();
    expect(item.QueryValue().Mode).toBe(Mode.PROP);
    expect(item.QueryValue().Height).toBe(100);
    item.SetPropLineSpace(150);
    expect(item.QueryValue().Height).toBe(150);
    item.SetPropLineSpace(65535);
    expect(item.QueryValue().Height).toBe(-1);
    item.SetInterLineSpace(720);
    expect(item.QueryValue().Mode).toBe(Mode.LEADING);
    expect(item.QueryValue(output, CONVERT_TWIPS)).toBe(true);
    const extracted = new LineSpacing();
    expect(output.extract(extracted, spacingType)).toBe(true);
    expect(extracted.equals(new LineSpacing(Mode.LEADING, 1270))).toBe(true);
    expect(item.QueryValue(output, MID_HEIGHT)).toBe(true);
    const scalar: [number] = [0];
    expect(output.extract(scalar, "sal_Int16")).toBe(true);
    expect(scalar[0]).toBe(720);
    expect(item.QueryValue(output, MID_LINESPACE | 256)).toBe(true);
    expect(output.extract(scalar, "sal_Int16")).toBe(true);
    expect(scalar[0]).toBe(Mode.LEADING);
    expect(item.QueryValue(output, 37)).toBe(true);
    expect(output.extract(scalar, "sal_Int16")).toBe(true);
    expect(scalar[0]).toBe(Mode.LEADING);
    item.SetLineHeight(720);
    expect(item.QueryValue().Mode).toBe(Mode.MINIMUM);
    item.QueryValue(output, CONVERT_TWIPS);
    expect(output.extract(extracted, spacingType)).toBe(true);
    expect(extracted.Height).toBe(1270);
    item.SetLineSpaceRule(Rule.Fix);
    expect(item.QueryValue().Mode).toBe(Mode.FIX);
    expect(item.QueryValue().Height).toBe(720);
    item.SetLineSpaceRule(12 as Rule);
    expect(item.QueryValue().equals(new LineSpacing())).toBe(true);
  });
  it("preserves native write extraction, mode/member rules and signed versus unsigned conversion order", /** Checks native state and transport contracts. @returns Nothing. */ () => {
    const item = new SvxLineSpacingItem(200, 64);
    for (const member of [0, MID_HEIGHT, MID_LINESPACE]) {
      const before = fields(item);
      expect(item.PutValue({}, member)).toBe(false);
      expect(fields(item)).toEqual(before);
      const wrong = new Any();
      wrong.insert([true], "bool");
      expect(item.PutValue(wrong, member)).toBe(false);
      expect(fields(item)).toEqual(before);
    }
    expect(item.PutValue(descriptor(Mode.PROP, 150), 0)).toBe(true);
    expect(fields(item)).toEqual([0, 150, 150, Rule.Auto, Inter.Prop]);
    expect(item.PutValue(short(100), MID_HEIGHT)).toBe(true);
    expect(fields(item)).toEqual([0, 100, 100, Rule.Auto, Inter.Off]);
    expect(item.PutValue(short(Mode.LEADING), MID_LINESPACE)).toBe(true);
    expect(fields(item)).toEqual([100, 100, 100, Rule.Auto, Inter.Fix]);
    expect(item.PutValue(descriptor(Mode.LEADING, -1), CONVERT_TWIPS)).toBe(true);
    expect(item.GetInterLineSpace()).toBe(-1);
    expect(item.GetLineHeight()).toBe(65535);
    expect(item.PutValue(descriptor(Mode.LEADING, 1270), CONVERT_TWIPS)).toBe(true);
    expect(item.GetInterLineSpace()).toBe(720);
    expect(item.PutValue(descriptor(Mode.FIX, -1), CONVERT_TWIPS)).toBe(true);
    expect(item.GetLineHeight()).toBe(37154);
    expect(item.GetLineSpaceRule()).toBe(Rule.Fix);
    expect(item.GetInterLineSpaceRule()).toBe(Inter.Off);
    expect(item.PutValue(descriptor(Mode.MINIMUM, 400), 0)).toBe(true);
    expect(item.GetLineHeight()).toBe(400);
    expect(item.GetLineSpaceRule()).toBe(Rule.Min);
    expect(item.PutValue(descriptor(Mode.FIX, 360), 0)).toBe(true);
    expect(item.GetLineHeight()).toBe(360);
    expect(item.PutValue(descriptor(99, 777), 0)).toBe(true);
    expect(item.GetLineHeight()).toBe(777);
    expect(item.GetLineSpaceRule()).toBe(Rule.Fix);
    item.SetLineSpaceRule(Rule.Auto);
    item.SetInterLineSpaceRule(Inter.Off);
    expect(item.PutValue({}, 37)).toBe(true);
    expect(item.GetLineHeight()).toBe(100);
    expect(item.PutValue(descriptor(Mode.PROP, -1), 256)).toBe(true);
    expect(item.GetPropLineSpace()).toBe(65535);
    expect(item.PutValue(descriptor(Mode.LEADING, 25), 0)).toBe(true);
    expect(item.GetInterLineSpace()).toBe(25);
  });
  it("uses original two-short struct defaults, independent copies and actual CPPU member cells", /** Checks native state and transport contracts. @returns Nothing. */ () => {
    const blank = new LineSpacing();
    expect(blank.Mode).toBe(0);
    expect(blank.Height).toBe(0);
    const a = new LineSpacing(65535, 65536);
    expect(a.Mode).toBe(-1);
    expect(a.Height).toBe(0);
    const copy = new LineSpacing(a);
    expect(copy.equals(a)).toBe(true);
    expect(copy.notEquals(a)).toBe(false);
    copy.Height = 35;
    expect(copy.notEquals(a)).toBe(true);
    expect(a.Height).toBe(0);
    expect(blank.assign(copy)).toBe(blank);
    expect(blank.equals(copy)).toBe(true);
    expect(blank.get(0)).toBe(blank.get(0));
    blank.get(2)[0] = 40;
    expect(blank.Height).toBe(40);
    expect(spacingType()).toBeDefined();
    expect(spacingType().getTypeLibType()).toBe(spacingType().getTypeLibType());
  });
});
