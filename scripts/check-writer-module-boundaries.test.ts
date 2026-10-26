/** @fileoverview Verifies native Writer filter/value dependency boundaries and adjacent forbidden browser edges. */
import { expect, it } from "vitest";
import {
  isForbiddenModuleEdge,
  isForbiddenDomainVclImport,
  getRuntimeOwnershipLayer,
  getRuntimeOwnershipViolation,
} from "./check-module-boundaries.mjs";
it("admits the native Writer UNO helper dependency and rejects its reverse", /** Pins the Library_sw/unosett.hxx interface implementation edge. @returns Nothing. */ () => {
  expect(isForbiddenModuleEdge("sw", "cppuhelper")).toBe(false);
  expect(isForbiddenModuleEdge("cppuhelper", "sw")).toBe(true);
});

it("classifies the pinned md4c parser as a native external mechanism", () => {
  expect(getRuntimeOwnershipLayer("external/md4c/src/md4c.attribute.ts")).toBe(
    "upstream-mechanism",
  );
  expect(
    getRuntimeOwnershipViolation(
      "external/md4c/src/md4c.attribute.ts",
      "sw/browser/presentation/writer-view.tsx",
      "../../../sw/browser/presentation/writer-view",
    ),
  ).toBeDefined();
});

it("admits only the native Writer default-bullet VCL value owner", () => {
  expect(
    isForbiddenDomainVclImport("sw/source/core/doc/number-bullet.ts", "vcl/source/font/font.ts"),
  ).toBe(false);
  expect(
    isForbiddenDomainVclImport(
      "sw/source/core/doc/number-bullet.ts",
      "vcl/browser/font-metadata-codec.ts",
    ),
  ).toBe(true);
  expect(isForbiddenDomainVclImport("sw/source/core/doc/doc.ts", "vcl/source/font/font.ts")).toBe(
    true,
  );
});
