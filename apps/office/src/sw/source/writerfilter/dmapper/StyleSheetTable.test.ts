/** @fileoverview Checks pinned Word style aliases, reserved Writer names and suffix ownership. */
import { expect, it } from "vitest";
import { StyleSheetTable } from "./StyleSheetTable";

it.each([
  ["Normal", "Standard", true],
  ["BodyText", "Text body", true],
  ["BodyTextIndent", "Text body indent", true],
  ["Footnote Text", "Footnote", true],
  ["Endnote Text", "Endnote", true],
  ["Annotation Text", "Marginalia", true],
  ["Standard", "Standard (WW)", false],
  ["Text body", "Text body (WW)", false],
  ["Custom (WW)", "Custom (WW) (WW)", false],
  ["Normal Table", "Normal Table (WW)", true],
  ["Normal (Web)", "Normal (Web)", true],
  ["body text", "body text", false],
  ["", " (WW)", true],
] as const)(
  "converts %s with the source builtin and reserved-name rules",
  /** Checks the name pair and recognition flag together. @param name - Input Word name. @param converted - Source Writer name. @param recognized - Source builtin recognition. @returns Nothing. */ (
    name,
    converted,
    recognized,
  ) => {
    expect(StyleSheetTable.ConvertStyleName(name)).toEqual([converted, recognized]);
  },
);
