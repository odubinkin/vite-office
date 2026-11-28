/** @fileoverview Source-derived catalog lifecycle and typed number format output. */
import { assert, expect, it } from "vitest";
import { SvNumberFormatter } from "../../../svl/source/numbers/zforlist";
import { NUMBERFORMAT_ENTRY_NOT_FOUND, SvNumFormatType as T } from "../../../svl/inc/zforlist";
import { SvxNumberFormatShell } from "./numfmtsh";
import { SvxNumberInfoItem } from "./numinf";
import { SID_ATTR_NUMBERFORMAT_INFO } from "../../inc/svxids";

const language = 0x0409;
const code = '0.0000" custom"';

it("keeps preview drafts outside the native catalog and restores rejected additions", /** Checks raw preview, duplicate protection and canceled cleanup. @returns Nothing. */ () => {
  const formatter = new SvNumberFormatter(language);
  const dialog = new SvxNumberFormatShell(formatter);
  try {
    expect(dialog.Describe(code, language)).toBeDefined();
    expect(dialog.Describe('0.0000" another"', language)).toBeDefined();
    expect(dialog.GetFormats(T.DEFINED, language)).toEqual([]);
    expect(dialog.AddFormat("", language)).toBeUndefined();
    const entry = dialog.AddFormat(code, language);
    assert(entry);
    expect(dialog.FindEntry(code, language)).toBe(entry.key);
    expect(dialog.AddFormat(code, language)).toBeUndefined();
    expect(
      dialog
        .GetFormats(T.DEFINED, language)
        .map(
          /** Extracts the actual gallery codes. @param row - Format row. @returns Picture. */ (
            row,
          ) => row.code,
        ),
    ).toContain(code);
  } finally {
    dialog.Dispose();
  }
  try {
    expect(formatter.GetROFormatData().GetFormatEntryMap().size).toBeGreaterThan(0);
    const reopened = new SvxNumberFormatShell(formatter);
    try {
      expect(reopened.FindEntry(code, language)).toBe(NUMBERFORMAT_ENTRY_NOT_FOUND);
    } finally {
      reopened.Dispose();
    }
  } finally {
    formatter.dispose();
  }
});

it("preserves the native add and remove list order across unusual cancellation paths", /** Checks the two pinned cancellation asymmetries. @returns Nothing. */ () => {
  const formatter = new SvNumberFormatter(language);
  try {
    const first = new SvxNumberFormatShell(formatter);
    const entry = first.AddFormat(code, language);
    assert(entry);
    expect(first.RemoveFormat(entry.key)).toBeDefined();
    expect(first.GetUpdateData()).toEqual([entry.key]);
    expect(first.FindEntry(code, language)).toBe(NUMBERFORMAT_ENTRY_NOT_FOUND);
    first.Dispose();
    expect(formatter.GetEntry(entry.key)).not.toBeNull();

    const reopened = new SvxNumberFormatShell(formatter);
    expect(reopened.RemoveFormat(entry.key)).toBeDefined();
    expect(reopened.AddFormat(code, language)?.key).toBe(entry.key);
    expect(reopened.GetUpdateData()).toEqual([]);
    reopened.Dispose();
    expect(formatter.GetEntry(entry.key)).toBeNull();
  } finally {
    formatter.dispose();
  }
});

it("carries an independent deletion list and the same borrowed formatter in its cloned output", /** Verifies the source specialized output item contract. @returns Nothing. */ () => {
  const formatter = new SvNumberFormatter(language);
  try {
    const info = new SvxNumberInfoItem(formatter, SID_ATTR_NUMBERFORMAT_INFO);
    info.SetDelFormats([151, 155]);
    const output = info.Clone();
    expect(output.equals(info)).toBe(true);
    expect(output.GetNumberFormatter()).toBe(formatter);
    info.SetDelFormats([155, 151]);
    expect(output.GetDelFormats()).toEqual([151, 155]);
    expect(output.equals(info)).toBe(false);
  } finally {
    formatter.dispose();
  }
});
