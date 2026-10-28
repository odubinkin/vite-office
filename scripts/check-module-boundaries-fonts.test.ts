/** @fileoverview Protects original font-table library dependency directions. */
import { expect, it } from "vitest";
import {
  isForbiddenModuleEdge,
  getRuntimeOwnershipLayer,
  getRuntimeOwnershipViolation,
} from "./check-module-boundaries.mjs";

it("admits native VCL HarfBuzz use while protecting the cmap owner from browser dependencies", /** Checks the original VCL external dependency and rejects reverse browser imports. @returns Nothing. */ () => {
  expect(isForbiddenModuleEdge("vcl", "external")).toBe(false);
  expect(isForbiddenModuleEdge("external", "vcl")).toBe(true);
  expect(getRuntimeOwnershipLayer("external/harfbuzz/src/hb-ot-cmap-table.ts")).toBe(
    "upstream-mechanism",
  );
  expect(
    getRuntimeOwnershipViolation(
      "external/harfbuzz/src/hb-ot-cmap-table.ts",
      "vcl/browser/font-list.ts",
      "../../../vcl/browser/font-list",
    ),
  ).toMatch(/browser adapters/u);
});

it("admits original style label language and Writer complex-color dependencies", /** Library_svxcore and Library_sw retain actual original dependency directions. @returns Nothing. */ () => {
  expect(isForbiddenModuleEdge("svx", "i18nlangtag")).toBe(false);
  expect(isForbiddenModuleEdge("sw", "docmodel")).toBe(false);
  expect(isForbiddenModuleEdge("i18nlangtag", "svx")).toBe(true);
  expect(isForbiddenModuleEdge("docmodel", "sw")).toBe(true);
});

it("admits original font configuration enum ownership without application dependencies", /** Verifies admits original font configuration enum ownership without application dependencies. @returns Nothing. */ () => {
  expect(isForbiddenModuleEdge("unotools", "tools")).toBe(false);
  expect(isForbiddenModuleEdge("unotools", "sw")).toBe(true);
  expect(isForbiddenModuleEdge("tools", "sw")).toBe(true);
  expect(
    getRuntimeOwnershipViolation(
      "unotools/source/config/fontcfg.ts",
      "framework/browser/app/desktop.tsx",
      "../../../../framework/browser/app/desktop",
    ),
  ).toMatch(/browser adapters/u);
});

it("admits the native MS symbol converter dependency without reverse application coupling", /** Original util.cxx consumes unotools/fontcvt.hxx and fontdefs.hxx; Library_msfilter links utl. @returns Nothing. */ () => {
  expect(isForbiddenModuleEdge("filter", "unotools")).toBe(false);
  expect(isForbiddenModuleEdge("unotools", "filter")).toBe(true);
  expect(isForbiddenModuleEdge("filter", "sw")).toBe(true);
});
