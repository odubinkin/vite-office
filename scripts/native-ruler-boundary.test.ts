/** @fileoverview Checks source-owned ruler library edges without permitting reverse or browser dependencies. */
import { expect, it } from "vitest";
import { isForbiddenModuleEdge, getRuntimeOwnershipViolation } from "./check-module-boundaries.mjs";
it.each(["svtools", "vcl"])(
  "native SVX ruler admits its source %s library",
  /** Checks actual native library direction. @param target - Native dependency. @returns Nothing. */ (
    target,
  ) => {
    expect(isForbiddenModuleEdge("svx", target)).toBe(false);
    expect(isForbiddenModuleEdge(target, "svx")).toBe(true);
  },
);
it("native ruler ownership excludes Writer and browser reverse dependencies", /** Checks source ownership gates after the native graph extension. @returns Nothing. */ () => {
  expect(isForbiddenModuleEdge("sw", "svtools")).toBe(false);
  expect(isForbiddenModuleEdge("svtools", "sw")).toBe(true);
  expect(isForbiddenModuleEdge("svx", "sw")).toBe(true);
  expect(getRuntimeOwnershipViolation("svx/source/dialog/svxruler.ts", "", "react")).toMatch(
    /browser presentation/u,
  );
  expect(
    getRuntimeOwnershipViolation(
      "svtools/source/control/ruler.ts",
      "sw/browser/editor",
      "../../../sw/browser/editor",
    ),
  ).toMatch(/browser adapters/u);
});
