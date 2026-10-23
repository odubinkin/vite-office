/** @fileoverview Native SwXTextDocument model API responsibility is separate from UI and format-specific filters. */
import { expect, it } from "vitest";
import {
  getRuntimeOwnershipLayer,
  getRuntimeOwnershipViolation,
  isForbiddenModuleEdge,
} from "./check-module-boundaries.mjs";
it("admits shared XML API values and the native Writer model supplier while rejecting UI reversals", /** Checks original xmloff/Library_xo.mk and sw xmlimp.cxx/unotxdoc.hxx dependencies. @returns Nothing. */ () => {
  const model = "sw/source/uibase/uno/unotxdoc.ts",
    filter = "sw/source/filter/xml/xmlimp.ts",
    ui = "sw/source/uibase/uiview/view.ts",
    core = "sw/source/core/doc/doc.ts";
  expect(getRuntimeOwnershipLayer(model)).toBe("writer-model-api");
  expect(getRuntimeOwnershipViolation(filter, model, "../../uibase/uno/unotxdoc")).toBeUndefined();
  expect(getRuntimeOwnershipViolation(filter, ui, "../../uibase/uiview/view")).toMatch(/uibase/u);
  expect(getRuntimeOwnershipViolation(core, model, "../../uibase/uno/unotxdoc")).toMatch(
    /core must not depend/u,
  );
  expect(getRuntimeOwnershipViolation(model, ui, "../uiview/view")).toMatch(/model API/u);
  expect(getRuntimeOwnershipViolation(model, filter, "../../filter/xml/xmlimp")).toMatch(
    /model API/u,
  );
  expect(
    getRuntimeOwnershipViolation(
      model,
      "sw/browser/editor/editor.ts",
      "../../../browser/editor/editor",
    ),
  ).toMatch(/browser adapters/u);
  for (const dependency of ["cppu", "udkapi"])
    expect(isForbiddenModuleEdge("xmloff", dependency)).toBe(false);
  for (const dependency of ["sw", "sc", "framework"])
    expect(isForbiddenModuleEdge("xmloff", dependency)).toBe(true);
});
