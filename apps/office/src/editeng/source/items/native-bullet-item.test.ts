/** @fileoverview Actual text/default SvxBulletItem values,Font member identity and native scalar conversions required by EditEngine defaults. */
import { expect, it } from "vitest";
import { SvxBulletItem, SvxBulletStyle as B } from "../../inc/bulletitem";
import { Font } from "../../../vcl/source/font/font";
import { TextAlign, FontPitch, FontFamily } from "../../../tools/inc/fontenum";
import { SfxBoolItem } from "../../../svl/inc/eitem";
import { OUString } from "../../../sal/inc/rtl/ustring";
import { text } from "../../../i18nlangtag/source/isolang/isolang.tables";
import { SfxItemPresentation } from "../../../svl/inc/poolitem";
import { MapUnit } from "../../../tools/inc/mapunit";

it("constructs original fixed-font text defaults with the full candidate list and independent clones", /** No output device or fake graphic owner is constructed. @returns Nothing. */ () => {
  const item = new SvxBulletItem(4033),
    clone = item.Clone();
  expect(item.Which()).toBe(4033);
  expect(item.GetWidth()).toBe(1200);
  expect(item.GetFont().GetFamilyName()).toContain(";");
  expect(item.GetFont().GetPitch()).toBe(FontPitch.PITCH_FIXED);
  expect(item.GetFont().GetFamilyType()).toBe(FontFamily.FAMILY_MODERN);
  expect(item.GetFont().GetAlignment()).toBe(TextAlign.ALIGN_BOTTOM);
  expect(item.GetFont().IsTransparent()).toBe(true);
  expect(clone.equals(item)).toBe(true);
  expect(clone.GetFont()).not.toBe(item.GetFont());
  const value = item.GetFullText();
  try {
    expect(text(value)).toBe(" ");
  } finally {
    value.dispose();
  }
  expect(item.equals(new SfxBoolItem(4033))).toBe(false);
});

it("preserves original private scalar defaults and unsigned16 input conversions", /** Compare copied actual items to independently set source defaults. @returns Nothing. */ () => {
  const item = new SvxBulletItem(4033),
    source = item.Clone();
  source.SetStart(1);
  source.SetScale(75);
  source.SetStyle(B.N123);
  source.SetSymbol(32);
  expect(source.equals(item)).toBe(true);
  source.SetStart(65537);
  expect(source.equals(item)).toBe(true);
  source.SetStart(2);
  expect(source.equals(item)).toBe(false);
  source.SetStart(1);
  source.SetScale(0);
  expect(source.equals(item)).toBe(false);
  source.SetScale(65536 + 75);
  expect(source.equals(item)).toBe(true);
  source.SetWidth(-7);
  expect(source.GetWidth()).toBe(-7);
  expect(source.equals(item)).toBe(false);
  source.SetWidth(1200);
  source.SetStyle(B.BULLET);
  expect(source.equals(item)).toBe(false);
  source.SetStyle(B.N123);
  source.SetSymbol(0x10000);
  expect(source.equals(item)).toBe(false);
  const value = source.GetFullText();
  try {
    expect(value.getLength()).toBe(1);
    expect(value.getStr()[0]).toBe(0);
  } finally {
    value.dispose();
  }
});

it("retains native Font copy assignment and the recipient borrowed member identity", /** Actual Font COW state shares values until mutation without replacing the font member. @returns Nothing. */ () => {
  const item = new SvxBulletItem(4033),
    source = item.Clone();
  const member = source.GetFont(),
    font = new Font(item.GetFont());
  font.SetFamilyName("Independent native font");
  source.SetFont(font);
  expect(source.GetFont()).toBe(member);
  expect(source.equals(item)).toBe(false);
  font.SetFamilyName("Caller changed");
  expect(source.GetFont().GetFamilyName()).toBe("Independent native font");
  item.SetStyle(B.BMP);
  source.SetStyle(B.BMP);
  expect(source.equals(item)).toBe(true);
  const target = new Font();
  expect(target.assign(font)).toBe(target);
  expect(target.Equals(font)).toBe(true);
  expect(target.assign(target)).toBe(target);
  font.SetFontHeight(27);
  expect(target.Equals(font)).toBe(false);
});

it("returns original owned Unicode text presentation independently of native metric arguments", /** NUL and surrogate Unicode16 values are retained. @returns Nothing. */ () => {
  const item = new SvxBulletItem(4033),
    output = new OUString();
  item.SetSymbol(0xd800);
  try {
    expect(
      item.GetPresentation(
        SfxItemPresentation.Complete,
        MapUnit.MapTwip,
        MapUnit.Map100thMM,
        output,
        null,
      ),
    ).toBe(true);
    expect(output.getLength()).toBe(1);
    expect(output.getStr()[0]).toBe(0xd800);
    item.SetSymbol(65);
    expect(output.getStr()[0]).toBe(0xd800);
  } finally {
    output.dispose();
  }
});
