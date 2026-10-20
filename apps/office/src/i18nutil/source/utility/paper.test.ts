/** @fileoverview Source-pinned paper table and behavioral matching/rounding/locale boundaries. */
import { expect, it } from "vitest";
import { Paper, PaperInfo, NUM_PAPER_ENTRIES } from "../../inc/paper";
import cases from "./native-paper-cases.json";
import { Locale } from "../../../udkapi/com/sun/star/lang/Locale";
import { unicode } from "../../../i18nlangtag/source/isolang/isolang.tables";

it("retains every native enum position,physical dimension and primary/alternate PostScript identity", /** Checks independent literal numeric fixture from the pinned C++ table. @returns Nothing. */ () => {
  expect(NUM_PAPER_ENTRIES).toBe(86);
  const encode = new TextEncoder();
  for (const row of cases) {
    expect(Paper[row.id]).toBe(row.name);
    const paper = new PaperInfo(row.id);
    expect([paper.getWidth(), paper.getHeight(), paper.getPaper()]).toEqual([
      row.width,
      row.height,
      row.id,
    ]);
    const exact = new PaperInfo(row.width, row.height, true),
      first = cases.find(
        /** Finds source's earlier duplicate rectangle. @param entry - Literal row. @returns Exact match. */ (
          entry,
        ) => entry.width === row.width && entry.height === row.height,
      );
    expect(exact.getPaper()).toBe(first?.id);
    for (const name of [row.ps, row.alias])
      if (name !== null) {
        expect(PaperInfo.fromPSName(encode.encode(name.toUpperCase()))).toBe(row.id);
        expect(PaperInfo.fromPSName(encode.encode(name.toLowerCase()))).toBe(row.id);
      }
  }
  for (const name of ["", "unknown", "A4\0", "Ä4", "a\u212a"])
    expect(PaperInfo.fromPSName(encode.encode(name))).toBe(Paper.PAPER_USER);
});

it("prioritizes exact orientation before rotated matches and retains supplied dimensions", /** Tabloid/Ledger and nonstandard cases exercise native two-pass ordering. @returns Nothing. */ () => {
  expect(new PaperInfo(43180, 27940, true).getPaper()).toBe(Paper.PAPER_LEDGER);
  const landscape = new PaperInfo(29700, 21000, true);
  expect([landscape.getPaper(), landscape.getWidth(), landscape.getHeight()]).toEqual([
    Paper.PAPER_A4,
    29700,
    21000,
  ]);
  expect(new PaperInfo(29700, 21000).getPaper()).toBe(Paper.PAPER_USER);
  expect(new PaperInfo(123, 456, true).getPaper()).toBe(Paper.PAPER_USER);
  expect(new PaperInfo(0, 0).getPaper()).toBe(Paper.PAPER_USER);
});

it("keeps strict44mm100 sloppy tolerance,first-match order and original rotated orientation", /** Exact boundary,failed rotation and early non-user return are observable source behavior. @returns Nothing. */ () => {
  const a4 = new PaperInfo(Paper.PAPER_A4),
    near = new PaperInfo(21043, 29743),
    edge = new PaperInfo(21044, 29700),
    tall = new PaperInfo(21000, 29744);
  expect(near.sloppyEqual(a4)).toBe(true);
  expect(edge.sloppyEqual(a4)).toBe(false);
  expect(tall.sloppyEqual(a4)).toBe(false);
  near.doSloppyFit();
  expect([near.getPaper(), near.getWidth(), near.getHeight()]).toEqual([
    Paper.PAPER_A4,
    21000,
    29700,
  ]);
  near.doSloppyFit(true);
  edge.doSloppyFit();
  expect(edge.getPaper()).toBe(Paper.PAPER_USER);
  const rotated = new PaperInfo(29743, 21043);
  rotated.doSloppyFit(true);
  expect([rotated.getPaper(), rotated.getWidth(), rotated.getHeight()]).toEqual([
    Paper.PAPER_A4,
    29700,
    21000,
  ]);
  const custom = new PaperInfo(123, 456);
  custom.doSloppyFit(true);
  expect([custom.getPaper(), custom.getWidth(), custom.getHeight()]).toEqual([
    Paper.PAPER_USER,
    123,
    456,
  ]);
  expect(PaperInfo.sloppyFitPageDimension(84143)).toBe(84100);
  expect(PaperInfo.sloppyFitPageDimension(118943)).toBe(118900);
  expect(PaperInfo.sloppyFitPageDimension(84144)).toBe(84144);
  expect(PaperInfo.sloppyFitPageDimension(0)).toBe(0);
});

it("selects Letter for only the original exact country list with independent values", /** Locale strings retain actual native owners. @returns Nothing. */ () => {
  for (const country of [
    "US",
    "PR",
    "CA",
    "VE",
    "CL",
    "MX",
    "CO",
    "PH",
    "BZ",
    "CR",
    "GT",
    "NI",
    "PA",
    "SV",
    "GB",
    "DE",
    "TH",
    "us",
    "",
  ]) {
    const lang = unicode("en"),
      region = unicode(country),
      variant = unicode("variant"),
      locale = new Locale(lang, region, variant);
    try {
      const a = PaperInfo.getDefaultPaperForLocale(locale),
        b = PaperInfo.getDefaultPaperForLocale(locale);
      expect(a).not.toBe(b);
      expect(a.getPaper()).toBe(
        ["GB", "DE", "TH", "us", ""].includes(country) ? Paper.PAPER_A4 : Paper.PAPER_LETTER,
      );
    } finally {
      locale.dispose();
      lang.dispose();
      region.dispose();
      variant.dispose();
    }
  }
});
