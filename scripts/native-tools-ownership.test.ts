/** @fileoverview Protects original shared tools ownership and the source-proven Writer/Calc consumers. */
import { expect, it } from "vitest";
import {
  getRuntimeOwnershipLayer,
  getRuntimeOwnershipViolation,
  isForbiddenModuleEdge,
} from "./check-module-boundaries.mjs";

it("native tools geometry is shared infrastructure with original Writer and Calc consumers", /** Checks the exact owner and prohibits reverse/application/browser edges. @returns Nothing. */ () => {
  expect(getRuntimeOwnershipLayer("tools/inc/gen.ts")).toBe("upstream-mechanism");
  expect(isForbiddenModuleEdge("sw", "tools")).toBe(false);
  for (const module of ["sw", "sc", "framework", "vcl", "svl"])
    expect(isForbiddenModuleEdge("tools", module)).toBe(true);
  expect(isForbiddenModuleEdge("tools", "o3tl")).toBe(false);
  expect(isForbiddenModuleEdge("tools", "cppu")).toBe(false);
  // Original stream.cxx includes rtl/string.hxx and rtl/ustring.hxx.
  expect(isForbiddenModuleEdge("tools", "sal")).toBe(false);
  expect(isForbiddenModuleEdge("sc", "tools")).toBe(false);
  expect(getRuntimeOwnershipViolation("tools/inc/gen.ts", "", "react")).toMatch(/browser/u);
  expect(
    getRuntimeOwnershipViolation(
      "tools/inc/gen.ts",
      "sw/browser/editor/WriterEditor.tsx",
      "../../../sw/browser/editor/WriterEditor",
    ),
  ).toMatch(/browser/u);
});
