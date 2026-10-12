/** @fileoverview Verifies application and shared runtime responsibility boundaries independently of repository paths. */

import { describe, expect, it } from "vitest";

import {
  findUnapprovedModuleCycle,
  isOriginalSalO3tlImport,
  isForbiddenModuleEdge,
  getProtectedBrowserGlobalReferences,
  getProtectedOwnershipReferences,
  getRuntimeOwnershipLayer,
  getRuntimeOwnershipViolation,
} from "./check-module-boundaries.mjs";

it("owns genuine CPPU type metadata and SAL comparison without browser or reverse dependencies", /** Protects actual typelib primitive owners. @returns Nothing. */ () => {
  expect(isForbiddenModuleEdge("cppu", "sal")).toBe(false);
  expect(isForbiddenModuleEdge("cppu", "o3tl")).toBe(false);
  // Original include/com/sun/star/uno/Type.h includes the generated TypeClass enum.
  expect(isForbiddenModuleEdge("cppu", "udkapi")).toBe(false);
  expect(isForbiddenModuleEdge("udkapi", "cppu")).toBe(true);
  expect(isForbiddenModuleEdge("o3tl", "cppu")).toBe(true);
  expect(isForbiddenModuleEdge("sal", "cppu")).toBe(true);
  for (const source of [
    "cppu/inc/typelib/typedescription.ts",
    "cppu/inc/com/sun/star/uno/Type.ts",
    "cppu/source/typelib/typelib.ts",
    "sal/inc/osl/interlck.ts",
    "sal/osl/unx/interlck.ts",
  ]) {
    expect(getRuntimeOwnershipLayer(source)).toBe("upstream-mechanism");
    expect(getRuntimeOwnershipViolation(source, "", "react")).toMatch(/presentation package/u);
    expect(
      getRuntimeOwnershipViolation(source, "vcl/browser/font-list.ts", "../font-list"),
    ).toMatch(/browser adapters/u);
  }
  for (const dependency of ["sc", "sw", "framework", "vcl"])
    expect(isForbiddenModuleEdge("cppu", dependency)).toBe(true);
});

it("accepts only the original SAL/o3tl source paths and named value imports", /** Checks all permitted witnesses and rejects alternate syntax, bindings and owners. @returns Nothing. */ () => {
  const specifier = "../../o3tl/inc/string_view";
  const original = `import { implIsWhitespace } from "${specifier}";`;
  expect(
    isOriginalSalO3tlImport("sal/rtl/strtmpl.ts", "o3tl/inc/string_view", original, specifier),
  ).toBe(true);
  expect(
    isOriginalSalO3tlImport("sal/rtl/strtmpl.ts", "o3tl/inc/string_view.ts", original, specifier),
  ).toBe(true);
  expect(
    isOriginalSalO3tlImport(
      "o3tl/inc/string_view.ts",
      "sal/inc/rtl/ustring.h",
      'import { rtl_ustr_toInt64_WithLength } from "../../sal/inc/rtl/ustring.h";',
      "../../sal/inc/rtl/ustring.h",
    ),
  ).toBe(true);
  expect(
    isOriginalSalO3tlImport(
      "o3tl/inc/string_view.ts",
      "sal/inc/types",
      'import { SAL_MAX_INT32, SAL_MIN_INT32 } from "../../sal/inc/types";',
      "../../sal/inc/types",
    ),
  ).toBe(true);
  expect(
    isOriginalSalO3tlImport(
      "o3tl/inc/string_view.ts",
      "sal/inc/types",
      'import { SAL_MIN_INT32 } from "../../sal/inc/types";',
      "../../sal/inc/types",
    ),
  ).toBe(false);
  for (const text of [
    `import { toInt32 } from "${specifier}";`,
    `import { implIsWhitespace, toInt32 } from "${specifier}";`,
    `import { implIsWhitespace as whitespace } from "${specifier}";`,
    `import type { implIsWhitespace } from "${specifier}";`,
    `import { type implIsWhitespace } from "${specifier}";`,
    `import whitespace from "${specifier}";`,
    `import whitespace, { implIsWhitespace } from "${specifier}";`,
    `import * as whitespace from "${specifier}";`,
    `import {} from "${specifier}";`,
    `import "${specifier}";`,
    `export * from "${specifier}";`,
    `export { implIsWhitespace } from "${specifier}";`,
    `import whitespace = require("${specifier}");`,
    `const whitespace = require("${specifier}");`,
    `const whitespace = import("${specifier}");`,
    `const whitespace = import(\`${specifier}\`);`,
    `type Whitespace = typeof import("${specifier}");`,
    `${original}\nconst whitespace = import("${specifier}");`,
    `${original}\nconst whitespace = import(\`${specifier}\`);`,
    `// ${original}`,
    `const explanation = "${specifier}";`,
  ])
    expect(
      isOriginalSalO3tlImport("sal/rtl/strtmpl.ts", "o3tl/inc/string_view", text, specifier),
    ).toBe(false);
  expect(
    isOriginalSalO3tlImport("sal/rtl/ustring.ts", "o3tl/inc/string_view", original, specifier),
  ).toBe(false);
  expect(
    isOriginalSalO3tlImport("sal/rtl/strtmpl.ts", "o3tl/inc/sorted_vector", original, specifier),
  ).toBe(false);
});

it("admits only the witnessed two-owner component while retaining longer and unrelated cycle failures", /** Protects strongly connected component scope before projecting the approved edge. @returns Nothing. */ () => {
  const original = new Map([
    ["sal", new Set(["o3tl"])],
    ["o3tl", new Set(["sal"])],
    ["cppu", new Set(["sal"])],
  ]);
  const witnesses = [
    { sourceModule: "sal", targetModule: "o3tl", approved: true },
    { sourceModule: "o3tl", targetModule: "sal", approved: true },
  ];
  expect(findUnapprovedModuleCycle(original, witnesses)).toBeUndefined();
  expect(Array.from(original.get("sal") ?? [])).toEqual(["o3tl"]);
  expect(findUnapprovedModuleCycle(original, [])).toEqual(["sal", "o3tl", "sal"]);
  expect(findUnapprovedModuleCycle(original, witnesses.slice(0, 1))).toEqual([
    "sal",
    "o3tl",
    "sal",
  ]);
  expect(
    findUnapprovedModuleCycle(original, [...witnesses, { ...witnesses[0], approved: false }]),
  ).toEqual(["sal", "o3tl", "sal"]);
  const larger = new Map(original);
  larger.set("o3tl", new Set(["sal", "third"]));
  larger.set("third", new Set(["sal"]));
  expect(findUnapprovedModuleCycle(larger, witnesses)).toBeDefined();
  const longerWithoutDirectReverse = new Map(larger);
  longerWithoutDirectReverse.set("o3tl", new Set(["third"]));
  expect(findUnapprovedModuleCycle(longerWithoutDirectReverse, witnesses)).toEqual([
    "sal",
    "o3tl",
    "third",
    "sal",
  ]);
  const separate = new Map(original);
  separate.set("other", new Set(["third"]));
  separate.set("third", new Set(["other"]));
  expect(findUnapprovedModuleCycle(separate, witnesses)).toEqual(["other", "third", "other"]);
  const incomingOnly = new Map(original);
  incomingOnly.set("third", new Set(["sal"]));
  expect(findUnapprovedModuleCycle(incomingOnly, witnesses)).toBeUndefined();
  const outgoingOnly = new Map(original);
  outgoingOnly.set("o3tl", new Set(["sal", "third"]));
  outgoingOnly.set("third", new Set());
  expect(findUnapprovedModuleCycle(outgoingOnly, witnesses)).toBeUndefined();
  expect(findUnapprovedModuleCycle(new Map([["sal", new Set(["sal"])]]), [])).toEqual([
    "sal",
    "sal",
  ]);
  expect(findUnapprovedModuleCycle(new Map([["cppu", new Set(["sal"])]]), [])).toBeUndefined();
});

it("owns original locale and case-mapping dependencies without browser or reverse library edges", /** Enforces the actual shared string service dependency directions. @returns Nothing. */ () => {
  expect(isForbiddenModuleEdge("udkapi", "sal")).toBe(false);
  expect(isForbiddenModuleEdge("sal", "udkapi")).toBe(true);
  // The native casefolding fixture hashes the actual RuntimeException.hpp include and generated CPPU API.
  for (const dependency of ["cppu", "external", "offapi", "sal", "udkapi"]) {
    expect(isForbiddenModuleEdge("i18nutil", dependency)).toBe(false);
    expect(isForbiddenModuleEdge(dependency, "i18nutil")).toBe(true);
  }
  // Original transliteration.hxx consumes the generated IDL enum, whose hdl includes SAL types/sentinel.
  expect(isForbiddenModuleEdge("offapi", "sal")).toBe(false);
  expect(isForbiddenModuleEdge("sal", "offapi")).toBe(true);
  expect(isForbiddenModuleEdge("offapi", "cppu")).toBe(true);
  for (const owner of ["udkapi", "i18nutil", "offapi"])
    for (const dependency of ["sc", "sw", "framework", "vcl"])
      expect(isForbiddenModuleEdge(owner, dependency)).toBe(true);
  for (const source of [
    "udkapi/com/sun/star/lang/Locale.ts",
    "i18nutil/inc/casefolding.ts",
    "i18nutil/source/utility/casefolding_data.ts",
    "offapi/com/sun/star/i18n/TransliterationModules.ts",
  ]) {
    expect(getRuntimeOwnershipLayer(source)).toBe("upstream-mechanism");
    expect(getRuntimeOwnershipViolation(source, "", "react")).toMatch(/presentation package/u);
    expect(
      getRuntimeOwnershipViolation(source, "vcl/browser/font-list.ts", "../font-list"),
    ).toMatch(/browser adapters/u);
    expect(
      getRuntimeOwnershipViolation(
        source,
        "framework/source/services/worker-protocol.ts",
        "../worker-protocol",
      ),
    ).toMatch(/worker protocol through a browser adapter/u);
    expect(
      getProtectedOwnershipReferences(
        source,
        'interface Route { indexedDbKey: string }; const backend = "indexeddb";',
      ),
    ).toEqual(["indexedDbKey", "indexeddb"]);
  }
});

it("admits original SVL string ownership in SAL without a reverse library edge", /** Checks the original svl library declaration and shared reference owner. @returns Nothing. */ () => {
  expect(isForbiddenModuleEdge("svl", "sal")).toBe(false);
  expect(isForbiddenModuleEdge("sal", "svl")).toBe(true);
  expect(getRuntimeOwnershipLayer("sal/inc/rtl/ustring.ts")).toBe("upstream-mechanism");
  expect(getRuntimeOwnershipLayer("svl/source/misc/sharedstring.ts")).toBe("upstream-mechanism");
});

it("owns SAL RTL algorithms and C headers without application or browser dependencies", /** Enforces original low-level string ownership. @returns Nothing. */ () => {
  for (const source of ["sal/rtl/strtmpl.ts", "sal/rtl/ustring.ts", "sal/inc/rtl/ustring.h.ts"]) {
    expect(getRuntimeOwnershipLayer(source)).toBe("upstream-mechanism");
    expect(getRuntimeOwnershipViolation(source, "", "react")).toMatch(/presentation package/u);
    expect(
      getRuntimeOwnershipViolation(source, "vcl/browser/font-list.ts", "../font-list"),
    ).toMatch(/browser adapters/u);
  }
  for (const target of ["sc", "sw", "framework", "vcl", "svl"])
    expect(isForbiddenModuleEdge("sal", target)).toBe(true);
});

it("permits Calc mdds dependency while keeping external owners independent", /** Protects shared external storage from app and browser dependencies. @returns Nothing. */ () => {
  expect(isForbiddenModuleEdge("sc", "external")).toBe(false);
  for (const app of ["sc", "sw", "framework", "vcl"])
    expect(isForbiddenModuleEdge("external", app)).toBe(true);
  expect(getRuntimeOwnershipLayer("external/mdds/include/mdds/flat_segment_tree.ts")).toBe(
    "upstream-mechanism",
  );
  expect(
    getRuntimeOwnershipViolation(
      "external/mdds/include/mdds/node.ts",
      "vcl/browser/font-list.ts",
      "../../../../vcl/browser/font-list",
    ),
  ).toMatch(/browser adapters/u);
  expect(getRuntimeOwnershipViolation("external/mdds/include/mdds/node.ts", "", "react")).toMatch(
    /presentation package/u,
  );
});

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

it("retains actual mutual SAL and o3tl string-header owners without application or browser dependencies", /** Protects original inline conversion/whitespace dependencies. @returns Nothing. */ () => {
  expect(isForbiddenModuleEdge("sal", "o3tl")).toBe(false);
  expect(isForbiddenModuleEdge("o3tl", "sal")).toBe(false);
  for (const owner of ["sal", "o3tl"])
    for (const dependency of ["sc", "sw", "framework", "vcl", "udkapi", "svl"])
      expect(isForbiddenModuleEdge(owner, dependency)).toBe(true);
  for (const source of ["o3tl/inc/string_view.ts", "sal/inc/rtl/string.h.ts"]) {
    expect(getRuntimeOwnershipLayer(source)).toBe("upstream-mechanism");
    expect(getRuntimeOwnershipViolation(source, "", "react")).toMatch(/presentation package/u);
    expect(
      getRuntimeOwnershipViolation(source, "vcl/browser/font-list.ts", "../font-list"),
    ).toMatch(/browser adapters/u);
  }
});

it("permits original cppuhelper UNO and SAL owners while retaining application and browser gates", /** Protects original helper ownership, without reverse or application-layer permission. @returns Nothing. */ () => {
  for (const dependency of ["cppu", "sal"])
    expect(isForbiddenModuleEdge("cppuhelper", dependency)).toBe(false);
  for (const dependency of ["sc", "sw", "framework", "vcl", "udkapi", "svl"])
    expect(isForbiddenModuleEdge("cppuhelper", dependency)).toBe(true);
  expect(isForbiddenModuleEdge("cppu", "cppuhelper")).toBe(true);
  expect(getRuntimeOwnershipLayer("cppuhelper/source/supportsservice.ts")).toBe(
    "upstream-mechanism",
  );
  expect(getRuntimeOwnershipViolation("cppuhelper/inc/queryinterface.ts", "", "react")).toMatch(
    /presentation package/u,
  );
  expect(
    getRuntimeOwnershipViolation(
      "cppuhelper/source/supportsservice.ts",
      "vcl/browser/font-list.ts",
      "../../vcl/browser/font-list",
    ),
  ).toMatch(/browser adapters/u);
});

it("keeps shared formula header ownership independent of applications and browser presentation", /** Protects the original shared formula boundary against reverse application and browser dependencies. @returns Nothing. */ () => {
  expect(getRuntimeOwnershipLayer("formula/inc/errorcodes.ts")).toBe("upstream-mechanism");
  expect(isForbiddenModuleEdge("sc", "formula")).toBe(false);
  for (const target of ["sc", "sw", "framework", "external"])
    expect(isForbiddenModuleEdge("formula", target)).toBe(true);
  expect(
    getRuntimeOwnershipViolation(
      "formula/inc/errorcodes.ts",
      "framework/browser/app/desktop.tsx",
      "react",
    ),
  ).toBeDefined();
  expect(
    getRuntimeOwnershipViolation(
      "formula/inc/errorcodes.ts",
      "framework/browser/app/desktop.tsx",
      "../../framework/browser/app/desktop",
    ),
  ).toBeDefined();
});
