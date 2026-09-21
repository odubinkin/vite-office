/** @fileoverview Verifies inner Writer responsibility boundaries independently of repository paths. */

import { describe, expect, it } from "vitest";

import { getWriterLayer, getWriterOwnershipViolation } from "./check-module-boundaries.mjs";

describe("Writer inner module boundaries", /** Registers Writer ownership boundary cases. @returns Nothing. */ function defineWriterBoundaryTests(): void {
  it("classifies the enforced Writer layers", /** Verifies stable path-to-layer routing. @returns Nothing. */ function classifiesWriterLayers(): void {
    expect(getWriterLayer("sw/source/core/doc/doc.ts")).toBe("core");
    expect(getWriterLayer("sw/source/filter/xml/swxml.ts")).toBe("filter");
    expect(getWriterLayer("sw/source/uibase/uiview/view.ts")).toBe("uibase");
    expect(getWriterLayer("sw/browser/presentation/writer-view.tsx")).toBe("browser");
  });

  it("rejects reverse browser and inner-layer dependencies", /** Verifies forbidden dependency directions. @returns Nothing. */ function rejectsReverseEdges(): void {
    expect(
      getWriterOwnershipViolation(
        "sw/source/uibase/uiview/view.ts",
        "sw/browser/workflows/writer-workflows",
        "../../../browser/workflows/writer-workflows",
      ),
    ).toMatch(/browser adapters/u);
    expect(
      getWriterOwnershipViolation(
        "sw/source/core/doc/doc.ts",
        "sw/source/uibase/uiview/view",
        "../../uibase/uiview/view",
      ),
    ).toMatch(/core must not depend on uibase/u);
    expect(
      getWriterOwnershipViolation(
        "sw/source/filter/xml/swxml.ts",
        "sw/source/uibase/app/docsh",
        "../../uibase/app/docsh",
      ),
    ).toMatch(/filter must not depend on uibase/u);
    expect(getWriterOwnershipViolation("sw/source/core/doc/doc.ts", "", "react")).toMatch(
      /must not import React/u,
    );
  });

  it("allows inward and browser-adapter dependencies", /** Verifies supported dependency directions. @returns Nothing. */ function allowsInwardEdges(): void {
    expect(
      getWriterOwnershipViolation(
        "sw/source/uibase/uiview/view.ts",
        "sw/source/core/doc/doc",
        "../../core/doc/doc",
      ),
    ).toBeUndefined();
    expect(
      getWriterOwnershipViolation(
        "sw/browser/presentation/writer-view.tsx",
        "sw/source/uibase/uiview/view",
        "../../source/uibase/uiview/view",
      ),
    ).toBeUndefined();
  });
});
