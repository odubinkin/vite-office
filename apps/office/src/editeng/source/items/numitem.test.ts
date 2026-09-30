/** @fileoverview Verifies pinned SvxNumberFormat position defaults and mode-dependent legacy getters. */
import { expect, it } from "vitest";
import { SvxNumberFormat } from "./numitem";

it("initializes independent zero geometry in legacy mode", /** Asserts native constructor defaults. @returns Nothing. */ () => {
  const format = new SvxNumberFormat();
  expect(format.GetPositionProperties()).toEqual({
    absLSpace: 0,
    firstLineOffset: 0,
    charTextDistance: 0,
    firstLineIndent: 0,
    indentAt: 0,
    labelFollowedBy: "listtab",
    listTabPosition: 0,
    positionAndSpaceMode: "label-width-and-position",
  });
  expect(format.GetAbsLSpace()).toBe(0);
  expect(format.GetFirstLineOffset()).toBe(0);
  expect(format.GetCharTextDistance()).toBe(0);
  expect(format.GetFirstLineIndent()).toBe(0);
  expect(format.GetIndentAt()).toBe(0);
  expect(format.GetListtabPos()).toBe(0);
  expect(format.GetLabelFollowedBy()).toBe("listtab");
});

it("switches native legacy getters without rewriting either geometry group", /** Asserts raw and effective values and snapshot independence. @returns Nothing. */ () => {
  const values = {
    absLSpace: 720,
    firstLineOffset: -288,
    charTextDistance: 144,
    firstLineIndent: -360,
    indentAt: 1152,
    labelFollowedBy: "space",
    listTabPosition: 1296,
    positionAndSpaceMode: "label-width-and-position",
  } as const;
  const format = new SvxNumberFormat(values);
  expect(format.GetAbsLSpace()).toBe(720);
  expect(format.GetFirstLineOffset()).toBe(-288);
  expect(format.GetCharTextDistance()).toBe(144);
  format.SetPositionAndSpaceMode("label-alignment");
  expect(format.GetPositionAndSpaceMode()).toBe("label-alignment");
  expect(format.GetAbsLSpace()).toBe(792);
  expect(format.GetFirstLineOffset()).toBe(-360);
  expect(format.GetCharTextDistance()).toBe(0);
  expect(format.GetFirstLineIndent()).toBe(-360);
  expect(format.GetIndentAt()).toBe(1152);
  expect(format.GetListtabPos()).toBe(1296);
  expect(format.GetLabelFollowedBy()).toBe("space");
  const snapshot = format.GetPositionProperties();
  expect(snapshot).toEqual({ ...values, positionAndSpaceMode: "label-alignment" });
  format.SetPositionAndSpaceMode("label-width-and-position");
  expect(snapshot.positionAndSpaceMode).toBe("label-alignment");
  expect(format.GetPositionProperties()).toEqual(values);
});

it("retains native signed getter widths at integer boundaries", /** Checks sal_Int32 getter narrowing and short character distance storage. @returns Nothing. */ () => {
  for (const [firstLineIndent, indentAt, expected] of [
    [2147483647, 1, -2147483648],
    [-2147483648, -1, 2147483647],
    [4294967295, 0, -1],
  ] as const) {
    const format = new SvxNumberFormat({
      positionAndSpaceMode: "label-alignment",
      firstLineIndent,
      indentAt,
    });
    expect(format.GetAbsLSpace()).toBe(expected);
    expect(format.GetFirstLineOffset()).toBe(firstLineIndent | 0);
  }
  expect(new SvxNumberFormat({ charTextDistance: 40000 }).GetCharTextDistance()).toBe(-25536);
  expect(new SvxNumberFormat({ charTextDistance: -40000 }).GetCharTextDistance()).toBe(25536);
});
