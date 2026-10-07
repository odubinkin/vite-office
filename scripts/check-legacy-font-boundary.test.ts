/** @fileoverview Checks native converter module admission without widening reverse dependencies. */
import { expect, it } from "vitest";
import { isForbiddenModuleEdge, getRuntimeOwnershipViolation } from "./check-module-boundaries.mjs";
it("admits only the source-owned xmloff to unotools converter edge", /** Preserves original module boundaries while admitting the actual native import dependency. @returns Nothing. */ () => {
  expect(isForbiddenModuleEdge("xmloff", "unotools")).toBe(false);
  for (const [from, to] of [
    ["unotools", "xmloff"],
    ["unotools", "sw"],
    ["framework", "unotools"],
    ["sw", "unotools"],
  ])
    expect(isForbiddenModuleEdge(from, to)).toBe(true);
  expect(
    getRuntimeOwnershipViolation(
      "unotools/source/misc/fontcvt.ts",
      "vcl/browser/font-list.ts",
      "../../../vcl/browser/font-list",
    ),
  ).toContain("must receive browser adapters");
});
