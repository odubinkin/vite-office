/** @fileoverview Protects original font-table library dependency directions. */
import { expect, it } from "vitest";
import {
  isForbiddenModuleEdge,
  getRuntimeOwnershipLayer,
  getRuntimeOwnershipViolation,
} from "./check-module-boundaries.mjs";

it("admits native VCL HarfBuzz use while protecting the cmap owner from browser dependencies", /** Checks the original VCL external dependency and rejects reverse browser imports. @returns Nothing. */ () => {
  expect(isForbiddenModuleEdge("vcl", "external")).toBe(false);
  expect(isForbiddenModuleEdge("external", "vcl")).toBe(true);
  expect(getRuntimeOwnershipLayer("external/harfbuzz/src/hb-ot-cmap-table.ts")).toBe(
    "upstream-mechanism",
  );
  expect(
    getRuntimeOwnershipViolation(
      "external/harfbuzz/src/hb-ot-cmap-table.ts",
      "vcl/browser/font-list.ts",
      "../../../vcl/browser/font-list",
    ),
  ).toMatch(/browser adapters/u);
});
