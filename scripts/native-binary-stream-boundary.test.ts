/** @fileoverview Original oox binary stream SDK dependencies retain reverse and browser isolation. */
import { expect, it } from "vitest";
import { isForbiddenModuleEdge, getRuntimeOwnershipViolation } from "./check-module-boundaries.mjs";
it("admits original UNO stream owners without permitting reverse or browser imports", /** Original binary stream headers consume Reference/Sequence/io SDK. @returns Nothing. */ () => {
  for (const target of ["cppu", "udkapi"]) {
    expect(isForbiddenModuleEdge("oox", target)).toBe(false);
    expect(isForbiddenModuleEdge(target, "oox")).toBe(true);
  }
  for (const path of [
    "oox/source/helper/binarystreambase.ts",
    "oox/source/helper/binaryinputstream.ts",
    "oox/source/helper/binaryoutputstream.ts",
  ]) {
    expect(getRuntimeOwnershipViolation(path, "", "react")).toMatch(/presentation package/u);
    expect(getRuntimeOwnershipViolation(path, "vcl/browser/font-list.ts", "../font-list")).toMatch(
      /browser adapters/u,
    );
  }
});
