/** @fileoverview Original NumberText component dependency direction and continued service boundary between i18npool and lingucomponent. */
import { expect, it } from "vitest";
import { isForbiddenModuleEdge, getRuntimeOwnershipViolation } from "./check-module-boundaries.mjs";
it("retains the original NumberText component dependencies without allowing a direct supplier link", /** Verifies source Library_numbertext edges and existing browser/core direction. @returns Nothing. */ () => {
  for (const target of ["cppu", "cppuhelper", "external", "i18nlangtag", "offapi", "sal", "udkapi"])
    expect(isForbiddenModuleEdge("lingucomponent", target)).toBe(false);
  for (const target of ["sc", "sw", "i18npool", "framework"])
    expect(isForbiddenModuleEdge("lingucomponent", target)).toBe(true);
  expect(isForbiddenModuleEdge("i18npool", "lingucomponent")).toBe(true);
  expect(
    getRuntimeOwnershipViolation(
      "lingucomponent/source/numbertext/numbertext.ts",
      "vcl/browser/adapter.ts",
      "../../../vcl/browser/adapter",
    ),
  ).toMatch(/browser adapters/u);
});
