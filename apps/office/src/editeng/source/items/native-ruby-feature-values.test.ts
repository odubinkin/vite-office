/** @fileoverview Original ruby/automatic direction/empty-feature value contracts using real shared strings, Any and item owners. */
import { expect, it } from "vitest";
import { SvxRubyItem as Ruby } from "../../inc/rubyitem";
import { SvxAutoFrameDirectionItem as Auto } from "../../inc/autodiritem";
import { SfxVoidItem as Void } from "../../../svl/inc/voiditem";
import { SfxInt16Item } from "../../../svl/inc/intitem";
import { SfxPoolItem, SfxItemPresentation } from "../../../svl/inc/poolitem";
import {
  INVALID_POOL_ITEM,
  DISABLED_POOL_ITEM,
  IsInvalidItem,
  IsDisabledItem,
} from "../../../svl/source/items/poolitem";
import { Any } from "../../../cppu/inc/com/sun/star/uno/Any";
import { OUString } from "../../../sal/inc/rtl/ustring";
import { RubyAdjust as Adjust } from "../../../offapi/com/sun/star/text/RubyAdjust";
import * as Position from "../../../offapi/com/sun/star/text/RubyPosition";
import {
  MID_RUBY_TEXT as TEXT,
  MID_RUBY_ADJUST as ADJUST,
  MID_RUBY_POSITION as POS,
  MID_RUBY_CHARSTYLE,
  MID_RUBY_ABOVE,
} from "../../inc/memberids";
import { MapUnit } from "../../../tools/inc/mapunit";
import { SfxItemPool } from "../../../svl/source/items/itempool";
import { SfxItemSet, SfxItemState } from "../../../svl/source/items/itemset";

/** Constructs actual Unicode content, preserving embedded nul and surrogate units. @param units - Logical UTF16 units. @returns String value. */
function text(units: number[]): OUString {
  return new OUString(new Uint16Array(units), units.length);
}
/** Reads actual short Any property. @param item - Ruby value. @param member - Selector. @returns Short. */
function short(item: Ruby, member: number): number {
  const output = new Any(),
    value: [number] = [0];
  expect(item.QueryValue(output, member)).toBe(true);
  expect(output.extract(value, "sal_Int16")).toBe(true);
  return value[0];
}
it("retains original declarations and actual ruby/direction/tab/line-break defaults", /** Real source default ids are4074/4041/4078/4079 with no pool facade. @returns Nothing. */ () => {
  expect([
    Adjust.LEFT,
    Adjust.CENTER,
    Adjust.RIGHT,
    Adjust.BLOCK,
    Adjust.INDENT_BLOCK,
    Adjust.MAKE_FIXED_SIZE,
  ]).toEqual([0, 1, 2, 3, 4, 2147483647]);
  expect([Position.ABOVE, Position.BELOW, Position.INTER_CHARACTER]).toEqual([0, 1, 2]);
  expect([TEXT, ADJUST, MID_RUBY_CHARSTYLE, MID_RUBY_ABOVE, POS]).toEqual([0, 1, 2, 3, 4]);
  const ruby = new Ruby(4074),
    auto = new Auto(true, 4041),
    tab = new Void(4078),
    line = new Void(4079);
  expect([
    ruby.Which(),
    ruby.GetText().getLength(),
    ruby.GetAdjustment(),
    ruby.GetPosition(),
  ]).toEqual([4074, 0, 0, 0]);
  expect([auto.Which(), auto.GetValue(), tab.Which(), line.Which()]).toEqual([
    4041,
    true,
    4078,
    4079,
  ]);
  expect(ruby.QueryValue()).toBeUndefined();
});
it("copies real Unicode content and ruby fields independently while keeping borrowed text stable", /** The native by-value setter does not reset or adopt the caller string object. @returns Nothing. */ () => {
  const item = new Ruby(4074),
    borrowed = item.GetText(),
    input = text([65, 0, 0xd83d, 0xde42, 66]);
  item.SetText(input);
  item.SetAdjustment(Adjust.BLOCK);
  item.SetPosition(Position.INTER_CHARACTER);
  expect(item.GetText()).toBe(borrowed);
  expect(item.GetText().getLength()).toBe(5);
  input.assign(text([90]));
  expect([...borrowed.getStr()]).toEqual([65, 0, 0xd83d, 0xde42, 66, 0]);
  item.SetText(borrowed);
  const copy = new Ruby(item),
    clone = item.Clone(new SfxItemPool());
  expect(copy).not.toBe(item);
  expect(clone).not.toBe(item);
  expect(copy.GetText()).not.toBe(borrowed);
  expect([copy.Which(), copy.GetAdjustment(), copy.GetPosition()]).toEqual([4074, 3, 2]);
  expect(copy.equals(item)).toBe(true);
  expect(clone.equals(item)).toBe(true);
  clone.SetWhich(4000);
  expect(clone.equals(item)).toBe(true);
  expect(SfxPoolItem.areSame(clone, item)).toBe(false);
  item.SetText(text([88]));
  expect(copy.equals(item)).toBe(false);
  item.SetText(copy.GetText());
  item.SetAdjustment(Adjust.LEFT);
  expect(copy.equals(item)).toBe(false);
  item.SetAdjustment(copy.GetAdjustment());
  item.SetPosition(-1);
  expect(copy.equals(item)).toBe(false);
  expect(item.equals(new SfxInt16Item(4074, 0))).toBe(false);
  item.SetPosition(65535);
  expect(item.GetPosition()).toBe(-1);
  item.SetAdjustment(Adjust.MAKE_FIXED_SIZE);
  expect(short(item, ADJUST)).toBe(-1);
});
it("queries and puts real string Any with independent output and original member aliases", /** Original Any address binding is the real pData lvalue slot, not a JS string replacement. @returns Nothing. */ () => {
  const item = new Ruby(4074),
    input = text([0x6f22, 0x5b57]);
  expect(item.PutValue(new Any([input.pData], "OUString"), TEXT | 128)).toBe(true);
  input.assign(text([65]));
  for (const member of [TEXT, TEXT | 128, TEXT + 256]) {
    const output = new Any(),
      result = new OUString();
    expect(item.QueryValue(output, member)).toBe(true);
    expect(output.extract(result, "OUString")).toBe(true);
    expect([...result.getStr()]).toEqual([0x6f22, 0x5b57, 0]);
    result.assign(text([90]));
    expect(item.GetText().getLength()).toBe(2);
  }
  const output = new Any(),
    result = new OUString();
  expect(item.QueryValue(output)).toBe(true);
  expect(output.extract(result, "OUString")).toBe(true);
  expect(result.equals(item.GetText())).toBe(true);
  for (const invalid of [new Any(), new Any([7], "sal_Int16"), 7])
    expect(item.PutValue(invalid, TEXT)).toBe(false);
  expect(item.GetText().getLength()).toBe(2);
});
it("validates only property adjustment while retaining every short position and direct setter values", /** Numeric native range checks are distinct from direct enum assignment and position transport. @returns Nothing. */ () => {
  const item = new Ruby(4074);
  for (const value of [0, 1, 2, 3, 4]) {
    expect(item.PutValue(new Any([value], "sal_Int16"), ADJUST | 128)).toBe(true);
    expect(short(item, ADJUST + 256)).toBe(value);
  }
  for (const value of [-32768, -1, 5, 32767]) {
    expect(item.PutValue(new Any([value], "sal_Int16"), ADJUST)).toBe(false);
    expect(item.GetAdjustment()).toBe(4);
  }
  for (const invalid of [new Any(), new Any([true], "bool"), 7]) {
    expect(item.PutValue(invalid, ADJUST)).toBe(false);
    expect(item.GetAdjustment()).toBe(4);
  }
  for (const value of [-32768, -1, 0, 1, 2, 32767]) {
    expect(item.PutValue(new Any([value], "sal_Int16"), POS | 128)).toBe(true);
    expect(short(item, POS + 256)).toBe(value);
  }
  for (const invalid of [new Any(), new Any([true], "bool"), 7]) {
    expect(item.PutValue(invalid, POS)).toBe(false);
    expect(item.GetPosition()).toBe(32767);
  }
  item.SetAdjustment(-1 as Adjust);
  expect(item.GetAdjustment()).toBe(-1);
});
it("rejects legacy and unknown ruby selectors without touching Any or item values", /** Old charstyle/above selectors are declarations, not implemented SvxRubyItem protocols. @returns Nothing. */ () => {
  const item = new Ruby(4074),
    before = item.Clone();
  for (const member of [MID_RUBY_CHARSTYLE, MID_RUBY_ABOVE, 7, 127]) {
    const output = new Any([77], "sal_Int32"),
      value: [number] = [0];
    expect(item.QueryValue(output, member)).toBe(false);
    expect(output.extract(value, "sal_Int32")).toBe(true);
    expect(value[0]).toBe(77);
    expect(item.PutValue(new Any([1], "sal_Int16"), member)).toBe(false);
    expect(item.equals(before)).toBe(true);
  }
});
it("presents actual ruby content and native Void literal without translated labels", /** Both original presentation functions ignore the metric/provider arguments. @returns Nothing. */ () => {
  const ruby = new Ruby(4074),
    value = text([65, 0x0308]);
  ruby.SetText(value);
  const output = new OUString();
  for (const degree of [SfxItemPresentation.Nameless, SfxItemPresentation.Complete]) {
    expect(
      ruby.GetPresentation(degree, MapUnit.MapTwip, MapUnit.Map100thMM, output, undefined),
    ).toBe(true);
    expect(output.equals(value)).toBe(true);
    expect(
      new Void(4078).GetPresentation(
        degree,
        MapUnit.MapTwip,
        MapUnit.Map100thMM,
        output,
        undefined,
      ),
    ).toBe(true);
    expect([...output.getStr()]).toEqual([86, 111, 105, 100, 0]);
  }
});
it("keeps genuine empty feature objects separate from state sentinels and copied identities", /** Empty value equality excludes Which while areSame and item-set storage keep it. @returns Nothing. */ () => {
  const factory = Void.CreateDefault();
  expect(factory.Which()).toBe(0);
  const tab = new Void(4078),
    copy = new Void(tab),
    clone = tab.Clone();
  expect(copy.Which()).toBe(4078);
  expect(tab.Which()).toBe(4078);
  expect(clone).not.toBe(tab);
  expect(copy.equals(tab)).toBe(true);
  clone.SetWhich(4079);
  expect(clone.equals(tab)).toBe(true);
  expect(SfxPoolItem.areSame(clone, tab)).toBe(false);
  expect(factory.equals(INVALID_POOL_ITEM)).toBe(false);
  expect(factory.equals(DISABLED_POOL_ITEM)).toBe(false);
  expect(IsInvalidItem(factory)).toBe(false);
  expect(IsDisabledItem(factory)).toBe(false);
  expect(factory.QueryValue()).toBeUndefined();
  expect(factory.PutValue(new Any(), 0)).toBe(false);
  expect(factory.HasMetrics()).toBe(false);
  factory.ScaleMetrics(2);
  const pool = new SfxItemPool(),
    set = new SfxItemSet(pool, [[4078, 4079]]);
  expect(set.Put(tab)).toBeInstanceOf(Void);
  expect(set.GetItemState(4078, false)).toBe(SfxItemState.SET);
  expect(set.Put(tab)).toBeUndefined();
  expect(tab.Clone(pool).equals(tab)).toBe(true);
});
it("copies automatic paragraph direction and uses the actual inherited bool Any", /** No native factory or localized presentation service is invented. @returns Nothing. */ () => {
  const item = new Auto(true, 4041),
    copy = new Auto(item),
    clone = item.Clone(new SfxItemPool()),
    output = new Any(),
    value: [boolean] = [false];
  expect(copy.equals(item)).toBe(true);
  expect(clone).toBeInstanceOf(Auto);
  expect(clone.Which()).toBe(4041);
  expect(item.PutValue(new Any([false], "bool"), 255)).toBe(true);
  expect(item.QueryValue(output, 128)).toBe(true);
  expect(output.extract(value, "bool")).toBe(true);
  expect(value[0]).toBe(false);
  expect(copy.GetValue()).toBe(true);
  expect(clone.GetValue()).toBe(true);
  expect(item.HasMetrics()).toBe(false);
});
