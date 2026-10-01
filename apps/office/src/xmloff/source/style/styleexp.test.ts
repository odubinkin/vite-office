/** @fileoverview Verifies direct style numbering attribute omission and empty-value rules from pinned XMLStyleExport. */
import { expect, it } from "vitest";
import { exportParagraphStyleNumberingAttributes } from "./styleexp";

it("exports direct positive and zero outline levels and explicit empty numbering styles", /** Checks literal ODF 1.3 predicates without using model defaults. @returns Nothing. */ () => {
  expect(exportParagraphStyleNumberingAttributes(undefined, undefined)).toBe("");
  expect(exportParagraphStyleNumberingAttributes(3, "Counters")).toBe(
    ' style:default-outline-level="3" style:list-style-name="Counters"',
  );
  expect(exportParagraphStyleNumberingAttributes(0, "")).toBe(
    ' style:default-outline-level="" style:list-style-name=""',
  );
  expect(exportParagraphStyleNumberingAttributes(10, "Outline")).toBe(
    ' style:default-outline-level="10"',
  );
  expect(exportParagraphStyleNumberingAttributes(undefined, 'A&B"')).toBe(
    ' style:list-style-name="A&amp;B&quot;"',
  );
});
