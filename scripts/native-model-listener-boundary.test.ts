/** @fileoverview Source-backed shared COW/listener dependencies retain reverse/application/browser isolation. */
import { expect, it } from "vitest";
import { isForbiddenModuleEdge, getRuntimeOwnershipViolation } from "./check-module-boundaries.mjs";
it("admits original interfacecontainer3 and SfxBaseModel SDK dependencies without reverse or browser edges", /** Original headers consume o3tl/comphelper and published document/util listener declarations. @returns Nothing. */ () => {
  for (const [source, target] of [
    ["comphelper", "o3tl"],
    ["comphelper", "cppuhelper"],
    ["sfx2", "comphelper"],
    ["sfx2", "offapi"],
  ]) {
    expect(isForbiddenModuleEdge(source, target)).toBe(false);
    expect(isForbiddenModuleEdge(target, source)).toBe(true);
  }
  for (const source of [
    "comphelper/inc/interfacecontainer3.ts",
    "comphelper/source/streaming/seqstream.ts",
    "o3tl/inc/cow_wrapper.ts",
    "sfx2/source/doc/sfxbasemodel.ts",
  ]) {
    expect(getRuntimeOwnershipViolation(source, "", "react")).toMatch(/presentation package/u);
    expect(
      getRuntimeOwnershipViolation(source, "vcl/browser/font-list.ts", "../font-list"),
    ).toMatch(/browser adapters/u);
  }
});
