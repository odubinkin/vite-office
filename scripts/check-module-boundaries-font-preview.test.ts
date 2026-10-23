/** @fileoverview Native SVTools font preview dependency direction and browser ownership guard coverage. */
import { expect, it } from "vitest";
import { isForbiddenModuleEdge, getRuntimeOwnershipViolation } from "./check-module-boundaries.mjs";

it("admits native SVTools font preview dependencies without reversing application ownership", /** Pinned sampletext.cxx and Library_svt consume the actual font, script, encoding and language owners. @returns Nothing. */ () => {
  for (const target of ["external", "i18nlangtag", "i18nutil", "unotools", "sal", "offapi", "vcl"])
    expect(isForbiddenModuleEdge("svtools", target)).toBe(false);
  for (const target of ["sc", "sw", "framework", "sfx2", "svx"])
    expect(isForbiddenModuleEdge("svtools", target)).toBe(true);
  expect(isForbiddenModuleEdge("vcl", "svtools")).toBe(true);
  expect(getRuntimeOwnershipViolation("svtools/source/misc/sampletext.ts", "", "react")).toMatch(
    /presentation package/u,
  );
});
