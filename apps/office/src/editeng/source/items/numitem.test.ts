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
  const format = SvxNumberFormat.FromProperties(values);
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
    const format = SvxNumberFormat.FromProperties({
      positionAndSpaceMode: "label-alignment",
      firstLineIndent,
      indentAt,
    });
    expect(format.GetAbsLSpace()).toBe(expected);
    expect(format.GetFirstLineOffset()).toBe(firstLineIndent | 0);
  }
  expect(SvxNumberFormat.FromProperties({ charTextDistance: 40000 }).GetCharTextDistance()).toBe(
    -25536,
  );
  expect(SvxNumberFormat.FromProperties({ charTextDistance: -40000 }).GetCharTextDistance()).toBe(
    25536,
  );
});

it("owns native marker defaults, unsigned values and ListFormat invalidation", /** Checks raw shared state and setter ownership. @returns Nothing. */ () => {
  const format = new SvxNumberFormat();
  expect(format.GetMarkerProperties()).toEqual({
    prefix: "",
    suffix: "",
    start: 1,
    includeUpperLevels: 1,
  });
  expect(format.HasListFormat()).toBe(false);
  expect(/** Reads an absent pattern. @returns Never. */ () => format.GetListFormat()).toThrow(
    "absent",
  );
  format.SetStart(-1);
  format.SetIncludeUpperLevels(256);
  expect(format.GetStart()).toBe(65535);
  expect(format.GetIncludeUpperLevels()).toBe(0);
  format.SetListFormat("(%1%/%3%)");
  expect(format.GetPrefix()).toBe("(");
  expect(format.GetSuffix()).toBe(")");
  expect(format.GetIncludeUpperLevels()).toBe(2);
  expect(format.GetListFormat(false)).toBe("%1%/%3%");
  format.SetIncludeUpperLevels(7);
  expect(format.GetListFormat()).toBe("(%1%/%3%)");
  const copy = SvxNumberFormat.FromProperties(format.GetMarkerProperties());
  expect(copy.GetIncludeUpperLevels()).toBe(7);
  expect(copy.GetListFormat()).toBe("(%1%/%3%)");
  format.SetPrefix("P");
  expect(format.HasListFormat()).toBe(false);
  expect(format.GetSuffix()).toBe(")");
  format.SetListFormat("[%2%]");
  format.SetSuffix("S");
  expect(format.HasListFormat()).toBe(false);
  expect(format.GetPrefix()).toBe("[");
  format.SetListFormat();
  expect(format.GetPrefix()).toBe("");
  expect(format.GetSuffix()).toBe("");
  expect(format.GetIncludeUpperLevels()).toBe(1);
  expect(copy.GetListFormat()).toBe("(%1%/%3%)");
});

it("derives compatibility fields literally from native percent scanning", /** Covers empty, invalid, percent-affix and overflow patterns without normalization. @returns Nothing. */ () => {
  const cases = [
    ["", "", "", 1],
    ["literal", "", "literal", 1],
    ["%", "", "", 1],
    ["tail%", "tail", "%", 1],
    ["%0%", "%0", "", 1],
    ["%1", "", "1", 1],
    ["%1%", "", "", 1],
    ["%10%", "", "", 1],
    ["prefix%%a%2%?%", "prefix%%a", "?%", 1],
    ["%1%.%3%", "", "", 2],
    ["%1%".repeat(130), "", "", 2],
    ["§(%2%)Ω", "§(", ")Ω", 1],
  ] as const;
  for (const [pattern, prefix, suffix, count] of cases) {
    const format = new SvxNumberFormat();
    format.SetListFormat(pattern);
    expect(format.HasListFormat()).toBe(true);
    expect(format.GetListFormat()).toBe(pattern);
    expect([format.GetPrefix(), format.GetSuffix(), format.GetIncludeUpperLevels()]).toEqual([
      prefix,
      suffix,
      count,
    ]);
  }
});

it("generates native older ODT patterns while trimming unavailable upper levels", /** Asserts overload behavior and independent compatibility count. @returns Nothing. */ () => {
  const format = new SvxNumberFormat();
  format.SetIncludeUpperLevels(10);
  format.SetListFormat("[", "]", 0);
  expect(format.GetListFormat()).toBe("[%1%]");
  expect(format.GetIncludeUpperLevels()).toBe(10);
  format.SetIncludeUpperLevels(2);
  format.SetListFormat("", ".", 2);
  expect(format.GetListFormat()).toBe("%2%.%3%.");
  expect(format.GetListFormat(false)).toBe("%2%.%3%");
  format.SetIncludeUpperLevels(0);
  format.SetListFormat("[", "]", 9);
  expect(format.GetListFormat()).toBe("[]");
  expect(format.GetListFormat(false)).toBe("");
});
