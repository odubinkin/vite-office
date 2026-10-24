/** @fileoverview Source-backed Tools/Comphelper date dependency directions. */
import { expect, it } from "vitest";
import { isForbiddenModuleEdge } from "./check-module-boundaries.mjs";
it("admits original Tools date helpers while retaining reverse and application prohibitions", /** Original Library_tl links comphelper;no application or date-provider bypass is added. @returns Nothing. */ () => {
  expect(isForbiddenModuleEdge("tools", "comphelper")).toBe(false);
  expect(isForbiddenModuleEdge("comphelper", "tools")).toBe(true);
  for (const owner of ["tools", "comphelper"])
    for (const app of ["sc", "sw", "framework", "vcl"])
      expect(isForbiddenModuleEdge(owner, app)).toBe(true);
});
