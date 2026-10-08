/** @fileoverview Checks the actual native column item dependency without admitting reverse or browser edges. */
import { expect, it } from "vitest";
import { isForbiddenModuleEdge, getRuntimeOwnershipViolation } from "./check-module-boundaries.mjs";
it("native column item admits svx to svl and rejects Writer and browser ownership", /** Checks source-owned library direction and isolation. @returns Nothing. */ () => {
  expect(isForbiddenModuleEdge("svx", "svl")).toBe(false);
  expect(isForbiddenModuleEdge("svl", "svx")).toBe(true);
  expect(isForbiddenModuleEdge("svx", "sw")).toBe(true);
  expect(getRuntimeOwnershipViolation("svx/source/dialog/rulritem.ts", "", "react")).toMatch(
    /browser presentation package/u,
  );
  expect(
    getRuntimeOwnershipViolation(
      "svx/source/dialog/rulritem.ts",
      "sw/browser/editor",
      "../../../sw/browser/editor",
    ),
  ).toMatch(/browser adapters/u);
});
