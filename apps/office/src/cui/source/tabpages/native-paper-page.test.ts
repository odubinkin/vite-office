/** @fileoverview Original CUI paper selection, manual recognition, orientation,1mm body and larger-side margin contracts with actual native catalog/geometry owners. */
import { expect, it, vi } from "vitest";
import { SvxPageDescPage, MINBODY } from "./page";
import { Paper } from "../../../i18nutil/inc/paper";
import { getPageFormatDefaultLimits } from "../../browser/dialog/page-format-defaults";
const geometry = {
  width: 11906,
  height: 16838,
  landscape: false,
  leftMargin: 1134,
  rightMargin: 1134,
  topMargin: 1134,
  bottomMargin: 1134,
};
it("consumes actual schema defaults without a second hardcoded page size limit", /** The static resource supplies source cm/mm values, not a pretend live Components provider. @returns Nothing. */ () => {
  expect(getPageFormatDefaultLimits()).toEqual({
    widthCm: 600,
    heightCm: 600,
    leftMm: 9999,
    rightMm: 9999,
    topMm: 9999,
    bottomMm: 9999,
  });
  expect(MINBODY).toBe(57);
  const page = new SvxPageDescPage(geometry, getPageFormatDefaultLimits());
  expect(page.GetPaperSizeBox().GetEntries()).toHaveLength(37);
  expect(page.GetPaperSizeBox().get_active_id()).toBe(Paper.PAPER_A4);
  expect(page.GetFieldRanges().width).toEqual({ minimum: 2325, maximum: 340157 });
});
it("preserves User and unsupported-list fallback without fabricating dimensions", /** Native list owner decides actual active identity before the page event. @returns Nothing. */ () => {
  const page = new SvxPageDescPage(geometry, getPageFormatDefaultLimits()),
    original = page.GetGeometry();
  page.PaperSizeSelect_Impl(Paper.PAPER_USER);
  expect(page.GetGeometry()).toBe(original);
  page.PaperSizeSelect_Impl(Paper.PAPER_SCREEN_16_9);
  expect(page.GetPaperSizeBox().get_active_id()).toBe(Paper.PAPER_USER);
  expect(page.GetGeometry()).toBe(original);
  page.SwapOrientation_Impl(false);
  expect(page.GetGeometry()).toBe(original);
});
it("retains original automatic versus manual landscape recognition asymmetry", /** Reset normalizes orientation, while manual-size handler passes oriented dimensions directly to GetSvxPaper. @returns Nothing. */ () => {
  const page = new SvxPageDescPage(
    { ...geometry, width: 16838, height: 11906, landscape: true },
    getPageFormatDefaultLimits(),
  );
  expect(page.GetPaperSizeBox().get_active_id()).toBe(Paper.PAPER_A4);
  page.PaperSizeModify_Impl("width", 16838);
  expect(page.GetGeometry()).toMatchObject({ width: 16838, height: 11906, landscape: true });
  expect(page.GetPaperSizeBox().get_active_id()).toBe(Paper.PAPER_USER);
  page.SwapOrientation_Impl(false);
  expect(page.GetGeometry()).toMatchObject({ width: 11906, height: 16838, landscape: false });
  expect(page.GetPaperSizeBox().get_active_id()).toBe(Paper.PAPER_USER);
  page.PaperSizeModify_Impl("width", 11905);
  expect(page.GetGeometry().width).toBe(11905);
  expect(page.GetPaperSizeBox().get_active_id()).toBe(Paper.PAPER_A4);
  page.SwapOrientation_Impl(true);
  expect(page.GetGeometry()).toMatchObject({ width: 16838, height: 11906, landscape: true });
  expect(page.GetAcceptedGeometry()).toMatchObject({
    width: 16838,
    height: 11906,
    landscape: true,
  });
});
it("applies all selected paper dimensions, native1mm body and right/bottom tie preference", /** Original CalcMargin adjusts the larger stored side rather than splitting the correction. @returns Nothing. */ () => {
  const page = new SvxPageDescPage(
    { ...geometry, leftMargin: 4000, rightMargin: 4000, topMargin: 5000, bottomMargin: 5000 },
    getPageFormatDefaultLimits(),
  );
  page.PaperSizeSelect_Impl(Paper.PAPER_A6);
  expect(page.GetGeometry()).toEqual({
    width: 5953,
    height: 8391,
    landscape: false,
    leftMargin: 4000,
    rightMargin: 1896,
    topMargin: 5000,
    bottomMargin: 3334,
  });
  expect(page.GetAcceptedGeometry()).toEqual(page.GetGeometry());
  expect(page.GetFieldRanges().width.minimum).toBe(5953);
  expect(page.GetFieldRanges().height.minimum).toBe(8391);
});
it("reduces the larger left/top margins and clamps actual manual input to current limits", /** The native earlier inequality branch is distinct from equal-side preference. @returns Nothing. */ () => {
  const page = new SvxPageDescPage(
    { ...geometry, leftMargin: 5000, rightMargin: 3000, topMargin: 6000, bottomMargin: 4000 },
    getPageFormatDefaultLimits(),
  );
  page.PaperSizeSelect_Impl(Paper.PAPER_A6);
  expect(page.GetGeometry()).toMatchObject({
    leftMargin: 2896,
    rightMargin: 3000,
    topMargin: 4334,
    bottomMargin: 4000,
  });
  page.PaperSizeModify_Impl("width", 1);
  expect(page.GetGeometry().width).toBe(5953);
  page.SetMargin("leftMargin", -1);
  expect(page.GetGeometry().leftMargin).toBe(0);
  page.SetMargin("leftMargin", 99999);
  expect(page.GetGeometry().leftMargin).toBe(
    page.GetGeometry().width - page.GetGeometry().rightMargin - 57,
  );
  page.PaperSizeModify_Impl("height", 999999);
  expect(page.GetGeometry().height).toBe(340157);
});

it("normalizes a sloppy known size only during Reset and retains source range values as control state", /** Native Reset snaps known formats before source Range writes field bounds. @returns Nothing. */ () => {
  const page = new SvxPageDescPage({ ...geometry, width: 11905 }, getPageFormatDefaultLimits());
  expect(page.GetGeometry().width).toBe(11906);
  page.PaperSizeModify_Impl("width", 11905);
  expect(page.GetGeometry().width).toBe(11905);
  expect(page.GetPaperSizeBox().get_active_id()).toBe(Paper.PAPER_A4);
  const small = new SvxPageDescPage(
    {
      ...geometry,
      width: 100,
      height: 100,
      leftMargin: 0,
      rightMargin: 0,
      topMargin: 0,
      bottomMargin: 0,
    },
    getPageFormatDefaultLimits(),
  );
  expect(small.GetGeometry()).toMatchObject({ width: 100, height: 100 });
  expect(small.GetFieldRanges().width.minimum).toBe(57);
  small.PaperSizeModify_Impl("height", 1);
  expect(small.GetGeometry().height).toBe(57);
});

it("reports missing installed schema defaults instead of inventing numeric configuration", /** Only the platform XML parser port supplies a missing-resource document; actual page/configuration owners are not replaced. @returns Nothing. */ () => {
  const parse = DOMParser.prototype.parseFromString;
  const empty = parse.call(new DOMParser(), "<component-schema/>", "application/xml");
  const spy = vi.spyOn(DOMParser.prototype, "parseFromString").mockReturnValueOnce(empty);
  try {
    expect(
      /** Exercises the actual installed-default resource failure. @returns Limits or throws. */ () =>
        getPageFormatDefaultLimits(),
    ).toThrow("Missing original page limit MaximumPaperWidth");
  } finally {
    spy.mockRestore();
  }
});

it("keeps the original FillItemSet known-paper admission separate from preview-only manual geometry", /** Manual same-known-format size changes are not emitted unless paper or orientation changes. @returns Nothing. */ () => {
  const page = new SvxPageDescPage(geometry, getPageFormatDefaultLimits());
  page.PaperSizeModify_Impl("width", 11905);
  expect(page.GetGeometry().width).toBe(11905);
  expect(page.GetAcceptedGeometry()).toEqual(geometry);
  page.SetMargin("leftMargin", 1200);
  expect(page.GetAcceptedGeometry()).toEqual({ ...geometry, leftMargin: 1200 });
  const sloppy = new SvxPageDescPage({ ...geometry, width: 11905 }, getPageFormatDefaultLimits());
  expect(sloppy.GetGeometry().width).toBe(11906);
  expect(sloppy.GetAcceptedGeometry().width).toBe(11905);
  sloppy.PaperSizeSelect_Impl(Paper.PAPER_USER);
  expect(sloppy.GetAcceptedGeometry().width).toBe(11906);
  const user = new SvxPageDescPage(
    { ...geometry, width: 12000, height: 16000 },
    getPageFormatDefaultLimits(),
  );
  expect(user.GetAcceptedGeometry()).toEqual({ ...geometry, width: 12000, height: 16000 });
  user.PaperSizeModify_Impl("height", 17000);
  expect(user.GetAcceptedGeometry()).toMatchObject({ width: 12000, height: 17000 });
  user.PaperSizeModify_Impl("width", 13000);
  expect(user.GetAcceptedGeometry()).toMatchObject({ width: 13000, height: 17000 });
  user.SwapOrientation_Impl(true);
  expect(user.GetAcceptedGeometry()).toMatchObject({
    width: 17000,
    height: 13000,
    landscape: true,
  });
});
it("preserves original changed-margin uint16 narrowing without truncating unchanged original items", /** This source FillItemSet cast remains even for the configured large-page domain. @returns Nothing. */ () => {
  const original = {
      ...geometry,
      width: 200000,
      height: 180000,
      leftMargin: 70000,
      topMargin: 70000,
    },
    page = new SvxPageDescPage(original, getPageFormatDefaultLimits());
  expect(page.GetAcceptedGeometry()).toEqual(original);
  page.SetMargin("leftMargin", 100000);
  page.SetMargin("rightMargin", 1000);
  page.SetMargin("topMargin", 100000);
  page.SetMargin("bottomMargin", 1000);
  expect(page.GetGeometry()).toMatchObject({ leftMargin: 100000, topMargin: 100000 });
  expect(page.GetAcceptedGeometry()).toMatchObject({
    leftMargin: 34464,
    rightMargin: 1000,
    topMargin: 34464,
    bottomMargin: 1000,
  });
});
