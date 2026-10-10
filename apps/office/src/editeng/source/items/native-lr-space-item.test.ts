/** @fileoverview Verifies original LR item fields, signed layout/proportion/zero contracts and independent clone equality. */
import { SvxIndentValue } from "../../inc/lrspitem";
import { expect, it } from "vitest";
import { SvxLRSpaceItem, SvxULSpaceItem, SvxBoxItem } from "./frmitems";
import { RES_LR_SPACE } from "../../../sw/inc/hintids";
it("original LR defaults, signed proportions, hanging text origin and sticky zero flags", /** Exercises original native layout fields independently. @returns Nothing. */ () => {
  const item = new SvxLRSpaceItem(RES_LR_SPACE);
  expect(item.QueryValue()).toEqual({
    Left: 0,
    TextLeft: 0,
    Right: 0,
    ScaleLeft: 100,
    ScaleRight: 100,
    FirstLine: 0,
    ScaleFirstLine: 100,
    AutoFirstLine: false,
  });
  expect([
    item.GetLeft().m_dValue,
    item.GetRight().m_dValue,
    item.GetTextLeft().m_dValue,
    item.GetTextFirstLineOffset().m_dValue,
    item.GetGutterMargin(),
    item.GetRightGutterMargin(),
    item.IsExplicitZeroMarginValLeft(),
    item.IsExplicitZeroMarginValRight(),
  ]).toEqual([0, 0, 0, 0, 0, 0, false, false]);
  item.SetLeft(SvxIndentValue.twips(-15), 50);
  item.SetRight(SvxIndentValue.twips(15), 50);
  expect([
    item.GetLeft().m_dValue,
    item.ResolveLeft(),
    item.GetRight().m_dValue,
    item.ResolveRight(),
    item.GetPropLeft(),
    item.GetPropRight(),
  ]).toEqual([-7.5, -8, 7.5, 8, 50, 50]);
  item.SetTextLeft(SvxIndentValue.twips(720));
  item.SetTextFirstLineOffset(SvxIndentValue.twips(-120));
  expect([
    item.ResolveLeft(),
    item.GetTextLeft().m_dValue,
    item.ResolveTextLeft(),
    item.GetTextFirstLineOffset().m_dValue,
    item.ResolveTextFirstLineOffset(),
  ]).toEqual([600, 720, 720, -120, -120]);
  item.SetTextFirstLineOffset(SvxIndentValue.twips(-60), 50);
  expect(item.ResolveLeft()).toBe(690);
  item.SetTextLeft(SvxIndentValue.twips(500), 80);
  expect(item.ResolveLeft()).toBe(370);
  item.SetTextFirstLineOffset(SvxIndentValue.twips(30), 200);
  expect([
    item.ResolveLeft(),
    item.GetTextLeft().m_dValue,
    item.ResolveTextFirstLineOffset(),
    item.GetPropTextFirstLineOffset(),
  ]).toEqual([400, 400, 60, 200]);
  item.SetPropTextFirstLineOffset(75);
  expect(item.GetPropTextFirstLineOffset()).toBe(75);
  item.SetLeft(SvxIndentValue.twips(0));
  expect(item.IsExplicitZeroMarginValLeft()).toBe(false);
  item.SetTextLeft(SvxIndentValue.twips(0));
  item.SetRight(SvxIndentValue.twips(0));
  item.SetTextLeft(SvxIndentValue.twips(72));
  item.SetRight(SvxIndentValue.twips(-72));
  expect([item.IsExplicitZeroMarginValLeft(), item.IsExplicitZeroMarginValRight()]).toEqual([
    true,
    true,
  ]);
  item.SetGutterMargin(41);
  item.SetRightGutterMargin(73);
  item.SetAutoFirst(true);
  expect([item.GetGutterMargin(), item.GetRightGutterMargin(), item.IsAutoFirst()]).toEqual([
    41,
    73,
    true,
  ]);
  expect(item.QueryValue(0x80)).toMatchObject({ Left: 127, Right: -127, AutoFirstLine: true });
  expect(item.QueryValue(1)).toBeUndefined();
  const clone = item.Clone();
  expect(clone).not.toBe(item);
  expect(clone.equals(item)).toBe(true);
  expect([
    clone.GetGutterMargin(),
    clone.GetRightGutterMargin(),
    clone.GetPropTextFirstLineOffset(),
    clone.IsExplicitZeroMarginValLeft(),
    clone.IsExplicitZeroMarginValRight(),
  ]).toEqual([41, 73, 75, true, true]);
  clone.SetExplicitZeroMarginValLeft(false);
  clone.SetExplicitZeroMarginValRight(false);
  clone.SetLeft(SvxIndentValue.twips(33));
  expect(item.ResolveLeft()).toBe(72);
  expect(item.equals(new SvxULSpaceItem(0, 0, 98))).toBe(false);
  expect(item.equals(new SvxLRSpaceItem(99))).toBe(false);
});
it.each([
  "left",
  "right",
  "first",
  "propLeft",
  "propRight",
  "propFirst",
  "gutter",
  "rightGutter",
  "auto",
  "zeroLeft",
  "zeroRight",
])(
  "original LR equality includes independent %s context",
  /** Changes exactly one original field. @param field - Native field. @returns Nothing. */ (
    field,
  ) => {
    const item = new SvxLRSpaceItem(98),
      clone = item.Clone();
    switch (field) {
      case "left":
        clone.SetLeft(SvxIndentValue.twips(1));
        break;
      case "right":
        clone.SetRight(SvxIndentValue.twips(1));
        break;
      case "first":
        clone.SetTextFirstLineOffset(SvxIndentValue.twips(1));
        break;
      case "propLeft":
        clone.SetLeft(SvxIndentValue.twips(0), 50);
        break;
      case "propRight":
        clone.SetRight(SvxIndentValue.twips(1), 50);
        item.SetRight(SvxIndentValue.twips(0.5));
        break;
      case "propFirst":
        clone.SetPropTextFirstLineOffset(50);
        break;
      case "gutter":
        clone.SetGutterMargin(1);
        break;
      case "rightGutter":
        clone.SetRightGutterMargin(1);
        break;
      case "auto":
        clone.SetAutoFirst(true);
        break;
      case "zeroLeft":
        clone.SetExplicitZeroMarginValLeft(true);
        break;
      case "zeroRight":
        clone.SetExplicitZeroMarginValRight(true);
        break;
    }
    expect(item.equals(clone)).toBe(false);
    expect(item.equals(item.Clone())).toBe(true);
  },
);

it.each([
  [3, 10, 30],
  [15, 70, 90],
])(
  "shared original border style%s retains supplied composite widths",
  /** Checks shared native item branches retained by the LR port. @param style - Native style. @param gap - Gap. @param width - Native complete width. @returns Nothing. */ (
    style,
    gap,
    width,
  ) => {
    const box = new SvxBoxItem(100);
    expect(
      box.PutValue(
        {
          Color: 0,
          InnerLineWidth: 10,
          OuterLineWidth: 10,
          LineDistance: gap,
          LineStyle: style,
          LineWidth: 90,
        },
        3,
      ),
    ).toBe(true);
    expect(box.QueryValue(3)).toMatchObject({
      InnerLineWidth: 10,
      OuterLineWidth: 10,
      LineDistance: gap,
      LineWidth: width,
    });
  },
);
