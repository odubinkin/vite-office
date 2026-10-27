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

it("classifies the pinned md4c parser as a native external mechanism", /** Verifies classifies the pinned md4c parser as a native external mechanism. @returns Nothing. */ () => {
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

it("admits only the native Writer default-bullet VCL value owner", /** Verifies admits only the native Writer default-bullet VCL value owner. @returns Nothing. */ () => {
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

it("admits only source-proven global default package reads across the native module boundary", /** Verifies admits only source-proven global default package reads across the native module boundary. @returns Nothing. */ () => {
  for (const source of ["sw/source/core/doc/doc.ts", "sw/source/core/attr/hints.ts"])
    expect(
      getRuntimeOwnershipViolation(
        source,
        "sw/source/uibase/app/swmodule.ts",
        "../../uibase/app/swmodule",
      ),
    ).toBeUndefined();
  expect(
    getRuntimeOwnershipViolation(
      "sw/source/core/attr/swatrset.ts",
      "sw/source/uibase/app/swmodule.ts",
      "../../uibase/app/swmodule",
    ),
  ).toMatch(/must not depend on uibase/u);
  expect(
    getRuntimeOwnershipViolation(
      "sw/source/core/doc/doc.ts",
      "sw/source/uibase/docvw/edtwin.ts",
      "../../uibase/docvw/edtwin",
    ),
  ).toMatch(/must not depend on uibase/u);
});
