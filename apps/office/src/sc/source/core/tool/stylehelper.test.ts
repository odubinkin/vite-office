/** @fileoverview Pinned ordered built-in/API style-name conversion,UTF16 ownership and exact user suffix contracts. */
import { expect, it } from "vitest";
import { ScStyleNameConversion as Names, SC_STYLE_PROG_STANDARD } from "../../../inc/stylehelper";
import {
  scStyleNameResourcesEnglish as English,
  type ScStyleNameResources,
} from "../../../inc/globstr";
import { SfxStyleFamily as F } from "../../../../svl/inc/style-values";
import { unicode, text } from "../../../../i18nlangtag/source/isolang/isolang.tables";
/** Invokes the real source conversion and releases actual string owners. @param direction - Native operation. @param value - Actual input. @param family - Source family. @param resources - Borrowed resolved labels. @returns Unicode value. */
function convert(
  direction: "display" | "program",
  value: string,
  family: F,
  resources?: ScStyleNameResources,
): string {
  const input = unicode(value),
    out =
      direction === "display"
        ? Names.DisplayToProgrammaticName(input, family, resources)
        : Names.ProgrammaticToDisplayName(input, family, resources);
  try {
    return text(out);
  } finally {
    out.dispose();
    input.dispose();
  }
}
it("retains all original built-in cell names and pivot names in their literal native order", /** Uses the original resource names and independent expected programmatic names. @returns Nothing. */ () => {
  for (const value of [
    "Heading",
    "Heading 1",
    "Heading 2",
    "Text",
    "Note",
    "Footnote",
    "Hyperlink",
    "Status",
    "Good",
    "Neutral",
    "Bad",
    "Warning",
    "Error",
    "Accent",
    "Accent 1",
    "Accent 2",
    "Accent 3",
    "Result",
    "Default",
    "Result2",
    "Pivot Table Value",
    "Pivot Table Result",
    "Pivot Table Category",
    "Pivot Table Title",
    "Pivot Table Field",
    "Pivot Table Corner",
  ]) {
    expect(convert("display", value, F.Para)).toBe(value);
    expect(convert("program", value, F.Para)).toBe(value);
  }
  expect(convert("program", "Heading1", F.Para)).toBe("Heading 1");
  expect(convert("display", "Heading1", F.Para)).toBe("Heading1 (user)");
  expect(convert("display", convert("program", "Heading1", F.Para), F.Para)).toBe("Heading 1");
});
it("keeps cell,page and graphic maps independent and invalid-family fallthrough unchanged", /** Exercises each lazy family repeatedly and every family rejection path. @returns Nothing. */ () => {
  for (const family of [F.Page, F.Frame])
    for (let repeat = 0; repeat < 2; repeat++) {
      expect(convert("display", "Default", family)).toBe("Default");
      expect(convert("program", "Default", family)).toBe("Default");
    }
  expect(convert("program", "Report", F.Page)).toBe("Report");
  expect(convert("program", "Note", F.Frame)).toBe("Note");
  expect(convert("display", "Heading1", F.Page)).toBe("Heading1");
  for (const family of [F.None, F.Char, F.Table, F.All]) {
    expect(convert("display", "Heading1", family)).toBe("Heading1");
    expect(convert("program", "Heading1", family)).toBe("Heading1");
    expect(convert("display", "X (user)", family)).toBe("X (user) (user)");
    expect(convert("program", "X (user)", family)).toBe("X");
  }
});
it("escapes exact user suffix once and strips it before map or family resolution while preserving arbitrary UTF16 names", /** NUL,combining sequences and supplementary units remain source values. @returns Nothing. */ () => {
  for (const value of [
    "",
    "a\u0000😀e\u0301",
    "heading1",
    "Heading1 (User)",
    "Heading1(user)",
    "末尾 ",
  ]) {
    expect(convert("display", value, F.Para)).toBe(value);
    expect(convert("program", value, F.Para)).toBe(value);
  }
  expect(convert("display", "Custom (user)", F.Para)).toBe("Custom (user) (user)");
  expect(convert("program", "Custom (user) (user)", F.Para)).toBe("Custom (user)");
  expect(convert("program", "Heading1 (user)", F.Para)).toBe("Heading1");
  expect(convert("program", " (user)", F.None)).toBe("");
});
it("borrows actual resolved resource values without a translation service and retains alias-priority and original sentinel iteration", /** Catalog data are inputs,not mocked ScModule/gettext owners. @returns Nothing. */ () => {
  const localized = {
    ...English,
    STR_STYLENAME_STANDARD: "Native localized default",
    STR_STYLENAME_HEADING: "Native heading",
    STR_STYLENAME_HEADING_1: "Native heading one",
    STR_STYLENAME_NOTE: "Native note",
  };
  for (const family of [F.Para, F.Page, F.Frame]) {
    expect(convert("program", "Default", family, localized)).toBe("Native localized default");
    expect(convert("display", "Native localized default", family, localized)).toBe("Default");
    expect(convert("display", "Default", family, localized)).toBe("Default (user)");
    expect(convert("program", "Unknown", family, localized)).toBe("Unknown");
  }
  expect(convert("display", "Native heading one", F.Para, localized)).toBe("Heading 1");
  expect(convert("program", "Heading1", F.Para, localized)).toBe("Native heading one");
  expect(convert("display", "Native note", F.Frame, localized)).toBe("Note");
  const interrupted = {
    ...localized,
    STR_STYLENAME_HEADING_1: "",
    STR_STYLENAME_TEXT: "Unvisited text",
  };
  expect(convert("program", "Text", F.Para, interrupted)).toBe("Text");
  expect(convert("display", "Unvisited text", F.Para, interrupted)).toBe("Unvisited text");
  const firstEmpty = { ...localized, STR_STYLENAME_HEADING: "" };
  expect(convert("display", "", F.Para, firstEmpty)).toBe("Heading");
  expect(convert("display", "Unknown", F.None, localized)).toBe("Unknown");
});
it("returns independent native value owners and keeps default cached maps alive after returned values are disposed", /** Uses genuine OUString copy/lifetime operations. @returns Nothing. */ () => {
  const input = unicode("Custom😀"),
    unknown = Names.DisplayToProgrammaticName(input, F.Para),
    standard = Names.ProgrammaticToDisplayName(SC_STYLE_PROG_STANDARD, F.Para);
  try {
    input.dispose();
    expect(text(unknown)).toBe("Custom😀");
    expect(text(standard)).toBe("Default");
  } finally {
    unknown.dispose();
    standard.dispose();
  }
  expect(convert("program", "Default", F.Para)).toBe("Default");
  expect(convert("display", "Default", F.Para)).toBe("Default");
});
