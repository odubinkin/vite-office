/** @fileoverview Literal native SvxPaperInfo physical unit and first-match fitting contracts over actual PaperInfo/Size owners. */
import { expect, it } from "vitest";
import { SvxPaperInfo as Info } from "../../inc/paperinf";
import { Paper } from "../../../i18nutil/inc/paper";
import cases from "../../../i18nutil/source/utility/native-paper-cases.json";
import { Size } from "../../../tools/inc/gen";
import { MapUnit as M } from "../../../tools/inc/mapunit";
it.each(cases)(
  "retains exact native mm100 paper $id/$name",
  /** Native probe fixture was captured independently from the original paper table. @param row - Original reference value. @returns Nothing. */ (
    row,
  ) => {
    const size = Info.GetPaperSize(row.id, M.Map100thMM);
    expect([size.Width(), size.Height()]).toEqual([row.width, row.height]);
    expect(Info.GetSvxPaper(size, M.Map100thMM)).toBe(
      cases.find(
        /** Native geometry lookup is first-match, including original duplicate paper dimensions. @param candidate - Independent native fixture row. @returns Geometry equality. */ (
          candidate,
        ) => candidate.width === row.width && candidate.height === row.height,
      )?.id,
    );
  },
);
it.each([
  [M.MapTwip, 11906, 16838],
  [M.MapPoint, 595, 842],
  [M.MapMM, 210, 297],
  [M.MapCM, 21, 30],
  [M.Map10thMM, 2100, 2970],
  [M.Map100thMM, 21000, 29700],
  [M.MapInch, 8, 12],
  [M.Map10thInch, 83, 117],
  [M.Map100thInch, 827, 1169],
  [M.Map1000thInch, 8268, 11693],
])(
  "uses original integer physical conversion %j",
  /** Literal expected A4 values include native rounding in both axes. @param unit - Native metric. @param width - Native integer width. @param height - Native integer height. @returns Nothing. */ (
    unit,
    width,
    height,
  ) => {
    const actual = Info.GetPaperSize(Paper.PAPER_A4, unit as M);
    expect([actual.Width(), actual.Height()]).toEqual([width, height]);
  },
);
it("keeps source nonrotating sloppy fitting and width-before-height dimension snap", /** Orientation is a caller decision, not a silent bridge normalization. @returns Nothing. */ () => {
  expect(Info.GetSvxPaper(new Size(11906, 16838))).toBe(Paper.PAPER_A4);
  expect(Info.GetSvxPaper(new Size(11907, 16838))).toBe(Paper.PAPER_A4);
  expect(Info.GetSvxPaper(new Size(11931, 16838))).toBe(Paper.PAPER_USER);
  expect(Info.GetSvxPaper(new Size(21043, 29700), M.Map100thMM)).toBe(Paper.PAPER_A4);
  expect(Info.GetSvxPaper(new Size(21044, 29700), M.Map100thMM)).toBe(Paper.PAPER_USER);
  expect(Info.GetSvxPaper(new Size(16838, 11906))).toBe(Paper.PAPER_USER);
  expect(Info.GetSvxPaper(new Size(24480, 15840))).toBe(Paper.PAPER_LEDGER);
  expect(Info.GetSloppyPaperDimension(11905)).toBe(11906);
  expect(Info.GetSloppyPaperDimension(16837)).toBe(16838);
  expect(Info.GetSloppyPaperDimension(12345)).toBe(12345);
});
it.each([M.MapPixel, M.MapSysFont, M.MapAppFont, M.MapRelative])(
  "does not fabricate missing font/device conversion for %i",
  /** Physical methods remain independent from an absent OutputDevice service. @param unit - Nonphysical unit. @returns Nothing. */ (
    unit,
  ) => {
    expect(
      /** Calls actual unsupported platform boundary. @returns Size or throws. */ () =>
        Info.GetPaperSize(Paper.PAPER_A4, unit),
    ).toThrow("physical map units");
  },
);
