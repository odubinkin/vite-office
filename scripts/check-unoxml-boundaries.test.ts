/** @fileoverview Native unoxml event owners retain their actual SDK/CPPU/SAL dependencies and existing browser/application separation. */
import { expect, it } from "vitest";
import {
  isForbiddenModuleEdge,
  getRuntimeOwnershipLayer,
  getRuntimeOwnershipViolation,
} from "./check-module-boundaries.mjs";
it("admits source-backed unoxml event dependencies without application or presentation edges", /** Library_unoxml links CPPU/cppuhelper/SAL and consumes SDK API; event headers/source do not own application models or browser adapters. @returns Nothing. */ () => {
  for (const dependency of ["cppu", "cppuhelper", "offapi", "sal"])
    expect(isForbiddenModuleEdge("unoxml", dependency)).toBe(false);
  for (const dependency of ["sw", "sc", "vcl", "sfx2", "framework"])
    expect(isForbiddenModuleEdge("unoxml", dependency)).toBe(true);
  for (const dependency of ["cppu", "cppuhelper", "sal"])
    expect(isForbiddenModuleEdge(dependency, "unoxml")).toBe(true);
  for (const source of [
    "unoxml/inc/event.ts",
    "unoxml/source/events/event.ts",
    "unoxml/source/events/mutationevent.ts",
  ]) {
    expect(getRuntimeOwnershipLayer(source)).toBe("upstream-mechanism");
    expect(getRuntimeOwnershipViolation(source, "", "react")).toMatch(/presentation package/u);
    expect(
      getRuntimeOwnershipViolation(source, "vcl/browser/font-list.ts", "../font-list"),
    ).toMatch(/browser adapters/u);
  }
});
