/** @fileoverview Verifies inner Writer responsibility boundaries independently of repository paths. */

import { describe, expect, it } from "vitest";

import {
  isForbiddenModuleEdge,
  getProtectedBrowserGlobalReferences,
  getProtectedOwnershipReferences,
  getRuntimeOwnershipLayer,
  getRuntimeOwnershipViolation,
} from "./check-module-boundaries.mjs";

describe("runtime ownership boundaries", /** Registers runtime ownership boundary cases. @returns Nothing. */ function defineRuntimeBoundaryTests(): void {
  it("isolates Calc and Writer while admitting shared dependencies", /** Verifies independent application owners. @returns Nothing. */ () => {
    for (const dependency of ["framework", "sfx2", "svl", "svx", "editeng", "vcl", "xmloff"])
      expect(isForbiddenModuleEdge("sc", dependency)).toBe(false);
    expect(isForbiddenModuleEdge("sc", "sw")).toBe(true);
    expect(isForbiddenModuleEdge("sw", "sc")).toBe(true);
    for (const shared of ["framework", "sfx2", "svl", "svx", "editeng", "vcl", "xmloff"]) {
      expect(isForbiddenModuleEdge(shared, "sc")).toBe(true);
      expect(isForbiddenModuleEdge(shared, "sw")).toBe(true);
    }
  });
  it("admits source-owned cui border pages and svx line selection with no reverse or browser edges", /** Checks the native dialog owner graph. @returns Nothing. */ () => {
    expect(isForbiddenModuleEdge("sw", "cui")).toBe(false);
    for (const module of ["editeng", "svl", "svx"])
      expect(isForbiddenModuleEdge("cui", module)).toBe(false);
    expect(isForbiddenModuleEdge("svx", "editeng")).toBe(false);
    for (const module of ["sw", "framework"])
      expect(isForbiddenModuleEdge("cui", module)).toBe(true);
    expect(isForbiddenModuleEdge("editeng", "svx")).toBe(true);
    expect(getRuntimeOwnershipLayer("cui/source/tabpages/border.ts")).toBe("upstream-mechanism");
    expect(getRuntimeOwnershipViolation("cui/source/tabpages/border.ts", "", "react")).toMatch(
      /browser presentation package/u,
    );
    expect(
      getRuntimeOwnershipViolation(
        "svx/source/dialog/frmsel.ts",
        "sw/browser/presentation/page",
        "../../sw/browser/presentation/page",
      ),
    ).toMatch(/browser adapters/u);
  });
  it("admits native border value dependencies while rejecting reverse browser edges", /** Checks source-owned box dependencies and browser isolation. @returns Nothing. */ () => {
    expect(isForbiddenModuleEdge("editeng", "offapi")).toBe(false);
    expect(isForbiddenModuleEdge("editeng", "svtools")).toBe(false);
    expect(isForbiddenModuleEdge("xmloff", "editeng")).toBe(false);
    expect(isForbiddenModuleEdge("svtools", "editeng")).toBe(true);
    expect(isForbiddenModuleEdge("svtools", "sw")).toBe(true);
    expect(getRuntimeOwnershipLayer("svtools/source/control/ctrlbox.ts")).toBe(
      "upstream-mechanism",
    );
    expect(getRuntimeOwnershipViolation("svtools/source/control/ctrlbox.ts", "", "react")).toMatch(
      /browser presentation package/u,
    );
  });
  it("classifies native o3tl utilities and restricts the Writer container dependency", /** Checks the precise source utility edge and browser isolation. @returns Nothing. */ () => {
    expect(getRuntimeOwnershipLayer("o3tl/inc/sorted_vector.ts")).toBe("upstream-mechanism");
    expect(isForbiddenModuleEdge("sw", "o3tl")).toBe(false);
    expect(isForbiddenModuleEdge("o3tl", "sw")).toBe(true);
    expect(isForbiddenModuleEdge("o3tl", "vcl")).toBe(true);
    expect(isForbiddenModuleEdge("framework", "o3tl")).toBe(true);
    expect(getRuntimeOwnershipViolation("o3tl/inc/sorted_vector.ts", "", "react")).toMatch(
      /browser presentation package/u,
    );
    expect(
      getRuntimeOwnershipViolation(
        "o3tl/inc/sorted_vector.ts",
        "sw/browser/editor/writer",
        "../../sw/browser/editor/writer",
      ),
    ).toMatch(/browser adapters/u);
  });
  it("classifies the enforced Writer layers", /** Verifies stable path-to-layer routing. @returns Nothing. */ function classifiesWriterLayers(): void {
    expect(getRuntimeOwnershipLayer("sw/source/core/doc/doc.ts")).toBe("writer-core");
    expect(getRuntimeOwnershipLayer("sw/source/filter/xml/swxml.ts")).toBe("writer-filter");
    expect(getRuntimeOwnershipLayer("sw/source/uibase/uiview/view.ts")).toBe("writer-uibase");
    expect(getRuntimeOwnershipLayer("sw/browser/presentation/writer-view.tsx")).toBe("browser");
    expect(getRuntimeOwnershipLayer("framework/browser/app/desktop.tsx")).toBe("browser");
    expect(getRuntimeOwnershipLayer("vcl/browser/browser-file.ts")).toBe("browser");
    expect(getRuntimeOwnershipLayer("sfx2/source/control/dispatch.ts")).toBe("sfx");
    expect(getRuntimeOwnershipLayer("svl/source/undo/undo.ts")).toBe("upstream-mechanism");
    expect(getRuntimeOwnershipLayer("sax/source/fastparser/fastparser.ts")).toBe(
      "upstream-mechanism",
    );
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

  it("rejects browser storage and clipboard DTO ownership in protected layers", /** Verifies semantic boundary names are parsed as identifiers and remain allowed in their outer/filter owners. @returns Nothing. */ function detectsOwnershipLeaks(): void {
    const source = `
      /** indexedDbKey and WriterClipboardPaste in comments are harmless. */
      interface BrowserRoute { indexedDbKey: string }
      function paste(value: WriterClipboardPaste): BrowserRoute {
        void "browser-local";
        return value as never;
      }
    `;
    expect(getProtectedOwnershipReferences("sw/source/uibase/app/docsh.ts", source)).toEqual([
      "WriterClipboardPaste",
      "browser-local",
      "indexedDbKey",
    ]);
    expect(getProtectedOwnershipReferences("sw/source/filter/html/swhtml.ts", source)).toEqual([
      "browser-local",
      "indexedDbKey",
    ]);
    expect(getProtectedOwnershipReferences("sw/browser/workflows/io.ts", source)).toEqual([]);
  });
});

it("permits the editeng vcl font dependency while retaining reverse and browser gates", /** Verifies the local font dependency contract independently of upstream source availability. @returns Nothing. */ () => {
  expect(isForbiddenModuleEdge("editeng", "vcl")).toBe(false);
  expect(isForbiddenModuleEdge("vcl", "editeng")).toBe(true);
  expect(isForbiddenModuleEdge("editeng", "sw")).toBe(true);
  expect(
    getRuntimeOwnershipViolation(
      "editeng/source/items/numitem.ts",
      "vcl/browser/font-list.ts",
      "../../../vcl/browser/font-list",
    ),
  ).toMatch(/browser adapters/u);
});
