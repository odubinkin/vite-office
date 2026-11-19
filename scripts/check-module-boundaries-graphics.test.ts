/** @fileoverview Keeps the borrowed Writer Graphic contract separate from VCL runtime dependencies. */
import { expect, it } from "vitest";
import { isForbiddenDomainVclImport } from "./check-module-boundaries.mjs";

it("permits only the original Writer Graphic type dependencies", /** Exercises the admitted native callers and the unchanged runtime boundary. @returns Nothing. */ () => {
  const graphic = "vcl/source/gdi/graph.ts";
  for (const caller of [
    "sw/source/core/doc/DocumentContentOperationsManager.ts",
    "sw/source/core/docnode/nodes.ts",
    "sw/source/core/graphic/ndgrf.ts",
  ]) {
    expect(isForbiddenDomainVclImport(caller, graphic, true)).toBe(false);
    expect(isForbiddenDomainVclImport(caller, graphic)).toBe(true);
    expect(isForbiddenDomainVclImport(caller, "vcl/browser/font-list.ts", true)).toBe(true);
  }
  expect(isForbiddenDomainVclImport("sw/source/core/doc/doc.ts", graphic, true)).toBe(true);
});
