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

it("admits native salhelper intrusive lifetime dependencies only in their source direction", /** Original salhelper depends on sal and Calc depends on salhelper. @returns Nothing. */ () => {
  expect(isForbiddenModuleEdge("salhelper", "sal")).toBe(false);
  expect(isForbiddenModuleEdge("sc", "salhelper")).toBe(false);
  for (const target of ["sc", "sw", "svl", "tools", "framework"])
    expect(isForbiddenModuleEdge("salhelper", target)).toBe(true);
  expect(isForbiddenModuleEdge("sal", "salhelper")).toBe(true);
});
