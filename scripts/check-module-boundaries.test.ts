/** @fileoverview Verifies inner Writer responsibility boundaries independently of repository paths. */

import { describe, expect, it } from "vitest";

import {
  getProtectedBrowserGlobalReferences,
  getRuntimeOwnershipLayer,
  getRuntimeOwnershipViolation,
} from "./check-module-boundaries.mjs";

describe("runtime ownership boundaries", /** Registers runtime ownership boundary cases. @returns Nothing. */ function defineRuntimeBoundaryTests(): void {
  it("classifies the enforced Writer layers", /** Verifies stable path-to-layer routing. @returns Nothing. */ function classifiesWriterLayers(): void {
    expect(getRuntimeOwnershipLayer("sw/source/core/doc/doc.ts")).toBe("writer-core");
    expect(getRuntimeOwnershipLayer("sw/source/filter/xml/swxml.ts")).toBe("writer-filter");
    expect(getRuntimeOwnershipLayer("sw/source/uibase/uiview/view.ts")).toBe("writer-uibase");
    expect(getRuntimeOwnershipLayer("sw/browser/presentation/writer-view.tsx")).toBe("browser");
    expect(getRuntimeOwnershipLayer("framework/browser/app/desktop.tsx")).toBe("browser");
    expect(getRuntimeOwnershipLayer("vcl/browser/browser-file.ts")).toBe("browser");
    expect(getRuntimeOwnershipLayer("sfx2/source/control/dispatch.ts")).toBe("sfx");
    expect(getRuntimeOwnershipLayer("svl/source/undo/undo.ts")).toBe("upstream-mechanism");
  });

  it("rejects reverse browser and inner-layer dependencies", /** Verifies forbidden dependency directions. @returns Nothing. */ function rejectsReverseEdges(): void {
    expect(
      getRuntimeOwnershipViolation(
        "sw/source/uibase/uiview/view.ts",
        "sw/browser/workflows/writer-workflows",
        "../../../browser/workflows/writer-workflows",
      ),
    ).toMatch(/browser adapters/u);
    expect(
      getRuntimeOwnershipViolation(
        "sw/source/core/doc/doc.ts",
        "sw/source/uibase/uiview/view",
        "../../uibase/uiview/view",
      ),
    ).toMatch(/core must not depend on uibase/u);
    expect(
      getRuntimeOwnershipViolation(
        "sw/source/filter/xml/swxml.ts",
        "sw/source/uibase/app/docsh",
        "../../uibase/app/docsh",
      ),
    ).toMatch(/filter must not depend on uibase/u);
    expect(getRuntimeOwnershipViolation("sw/source/core/doc/doc.ts", "", "react")).toMatch(
      /browser presentation package/u,
    );
    expect(
      getRuntimeOwnershipViolation("sfx2/source/view/viewfrm.ts", "", "react-dom/client"),
    ).toMatch(/browser presentation package/u);
    expect(getRuntimeOwnershipViolation("svl/source/undo/undo.ts", "", "lucide-react")).toMatch(
      /browser presentation package/u,
    );
    expect(
      getRuntimeOwnershipViolation(
        "sw/source/core/doc/doc.ts",
        "framework/browser/app/desktop",
        "../../../../framework/browser/app/desktop",
      ),
    ).toMatch(/browser adapters/u);
    expect(
      getRuntimeOwnershipViolation(
        "sw/source/uibase/uiview/view.ts",
        "vcl/browser/browser-clipboard",
        "../../../../vcl/browser/browser-clipboard",
      ),
    ).toMatch(/browser adapters/u);
    expect(
      getRuntimeOwnershipViolation(
        "sfx2/source/doc/objsh.ts",
        "sw/browser/workflows/writer-workflows",
        "../../../sw/browser/workflows/writer-workflows",
      ),
    ).toMatch(/browser adapters/u);
    expect(
      getRuntimeOwnershipViolation(
        "svl/source/undo/undo.ts",
        "framework/browser/app/desktop",
        "../../../framework/browser/app/desktop",
      ),
    ).toMatch(/browser adapters/u);
    expect(
      getRuntimeOwnershipViolation(
        "sw/source/filter/xml/swxml.ts",
        "framework/source/services/worker-protocol.ts",
        "../../../../framework/source/services/worker-protocol",
      ),
    ).toMatch(/worker protocol through a browser adapter/u);
  });

  it("allows inward and browser-adapter dependencies", /** Verifies supported dependency directions. @returns Nothing. */ function allowsInwardEdges(): void {
    expect(
      getRuntimeOwnershipViolation(
        "sw/source/uibase/uiview/view.ts",
        "sw/source/core/doc/doc",
        "../../core/doc/doc",
      ),
    ).toBeUndefined();
    expect(
      getRuntimeOwnershipViolation(
        "sw/browser/presentation/writer-view.tsx",
        "sw/source/uibase/uiview/view",
        "../../source/uibase/uiview/view",
      ),
    ).toBeUndefined();
    expect(
      getRuntimeOwnershipViolation(
        "sw/browser/filter/xml/odt-worker-runtime.ts",
        "framework/source/services/worker-protocol.ts",
        "../../../../framework/source/services/worker-protocol",
      ),
    ).toBeUndefined();
  });

  it("detects browser globals through syntax rather than comments or larger names", /** Prevents browser execution types from leaking into protected source layers without false positives on documentation or adapter-specific names. @returns Nothing. */ function detectsBrowserGlobals(): void {
    expect(
      getProtectedBrowserGlobalReferences(`
        /** Worker adaptation remains outside this module. */
        interface OdtWorkerTransport {}
        function attach(worker: Worker, scope: DedicatedWorkerGlobalScope): IDBDatabase {
          return scope as unknown as IDBDatabase;
        }
      `),
    ).toEqual(["DedicatedWorkerGlobalScope", "IDBDatabase", "Worker"]);
  });
});
