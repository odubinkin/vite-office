/** @fileoverview Verifies application and shared runtime responsibility boundaries independently of repository paths. */
import { describe, expect, it } from "vitest";
import {
  findUnapprovedModuleCycle,
  getRuntimeImportSpecifiers,
  isOriginalSalO3tlImport,
  isForbiddenModuleEdge,
  isOriginalCharacterValueImport,
  isForbiddenDomainVclImport,
  getProtectedBrowserGlobalReferences,
  getProtectedOwnershipReferences,
  getRuntimeOwnershipLayer,
  getRuntimeOwnershipViolation,
} from "./check-module-boundaries.mjs";
it("keeps XML reader byte values below application and browser owners", /** Admits only original shared value dependencies and header/source ownership. @returns Nothing. */ () => {
  for (const dependency of ["cppu", "sal"])
    expect(isForbiddenModuleEdge("xmlreader", dependency)).toBe(false);
  for (const dependency of ["sc", "sw", "configmgr", "sax", "o3tl", "framework"])
    expect(isForbiddenModuleEdge("xmlreader", dependency)).toBe(true);
  expect(isForbiddenModuleEdge("sal", "xmlreader")).toBe(true);
  expect(isForbiddenModuleEdge("cppu", "xmlreader")).toBe(true);
  for (const source of [
    "xmlreader/inc/span.ts",
    "xmlreader/inc/pad.ts",
    "xmlreader/source/span.ts",
    "xmlreader/source/pad.ts",
  ]) {
    expect(getRuntimeOwnershipLayer(source)).toBe("upstream-mechanism");
    expect(getRuntimeOwnershipViolation(source, "", "react")).toMatch(/presentation package/u);
    expect(
      getRuntimeOwnershipViolation(source, "vcl/browser/font-list.ts", "../font-list"),
    ).toMatch(/browser adapters/u);
  }
});

it("keeps shared configuration nodes below application and browser owners", /** Verifies the exact new owner edges and existing reverse/browser restrictions. @returns Nothing. */ () => {
  for (const dependency of ["cppu", "o3tl", "sal", "udkapi"])
    expect(isForbiddenModuleEdge("configmgr", dependency)).toBe(false);
  for (const dependency of ["sc", "sw", "vcl", "framework", "offapi"])
    expect(isForbiddenModuleEdge("configmgr", dependency)).toBe(true);
  expect(isForbiddenModuleEdge("sal", "configmgr")).toBe(true);
  expect(isForbiddenModuleEdge("cppu", "configmgr")).toBe(true);
  expect(isForbiddenModuleEdge("udkapi", "configmgr")).toBe(true);
  const source = "configmgr/source/node.ts";
  expect(getRuntimeOwnershipLayer(source)).toBe("upstream-mechanism");
  expect(getRuntimeOwnershipViolation(source, "", "react")).toMatch(/presentation package/u);
  expect(getRuntimeOwnershipViolation(source, "vcl/browser/font-list.ts", "../font-list")).toMatch(
    /browser adapters/u,
  );
});

it("owns genuine CPPU type metadata and SAL comparison without browser dependencies", /** Protects actual typelib primitive owners. @returns Nothing. */ () => {
  expect(isForbiddenModuleEdge("cppu", "sal")).toBe(false);
  expect(isForbiddenModuleEdge("cppu", "o3tl")).toBe(false);
  // Original include/com/sun/star/uno/Type.h includes the generated TypeClass enum.
  expect(isForbiddenModuleEdge("cppu", "udkapi")).toBe(false);
  // Original generated .hpp bindings require CPPU; CPPU TypeClass back-references are type-only.
  expect(isForbiddenModuleEdge("udkapi", "cppu")).toBe(false);
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
  // Original cppumaker normal enum getters use CPPU static type initialization.
  expect(isForbiddenModuleEdge("offapi", "cppu")).toBe(false);
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
    for (const dependency of ["framework", "sfx2", "svl", "svx", "editeng", "vcl", "xmloff", "sal"])
      expect(isForbiddenModuleEdge("sc", dependency)).toBe(false);
    expect(isForbiddenModuleEdge("sc", "sw")).toBe(true);
    expect(isForbiddenModuleEdge("sw", "sc")).toBe(true);
    for (const shared of ["framework", "sfx2", "svl", "svx", "editeng", "vcl", "xmloff", "sal"]) {
      expect(isForbiddenModuleEdge(shared, "sc")).toBe(true);
      expect(isForbiddenModuleEdge(shared, "sw")).toBe(true);
    }
  });
  it("admits source-owned cui border pages and svx line selection with no reverse or browser edges", /** Checks the native dialog owner graph. @returns Nothing. */ () => {
    expect(isForbiddenModuleEdge("sw", "cui")).toBe(false);
    for (const module of ["editeng", "svl", "svx", "tools"])
      expect(isForbiddenModuleEdge("cui", module)).toBe(false);
    expect(isForbiddenModuleEdge("svx", "editeng")).toBe(false);
    expect(isForbiddenModuleEdge("tools", "cui")).toBe(true);
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
    expect(isForbiddenModuleEdge("xmloff", "editeng")).toBe(true);
    expect(isForbiddenModuleEdge("editeng", "xmloff")).toBe(false);
    expect(isForbiddenModuleEdge("xmloff", "offapi")).toBe(false);
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
  for (const target of ["sal", "svl"]) expect(isForbiddenModuleEdge("formula", target)).toBe(false);
  for (const target of ["sc", "sw", "framework", "external"])
    expect(isForbiddenModuleEdge("formula", target)).toBe(true);
  expect(isForbiddenModuleEdge("external", "formula")).toBe(true);
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

it("permits Calc attribute Any transport while protecting reverse and browser boundaries", /** Checks only the actual original dependency. @returns Nothing. */ () => {
  expect(isForbiddenModuleEdge("sc", "cppu")).toBe(false);
  expect(isForbiddenModuleEdge("cppu", "sc")).toBe(true);
  expect(
    getRuntimeOwnershipViolation(
      "sc/source/core/data/attrib.values.ts",
      "vcl/browser/font-list.ts",
      "../../../../vcl/browser/font-list",
    ),
  ).toMatch(/browser adapters/u);
});

it("keeps original enum extraction below SVL and Calc without reverse or browser edges", /** Checks exact native helper dependencies. @returns Nothing. */ () => {
  for (const target of ["comphelper", "cppu"])
    expect(isForbiddenModuleEdge("svl", target)).toBe(false);
  for (const target of ["cppu", "udkapi"])
    expect(isForbiddenModuleEdge("comphelper", target)).toBe(false);
  for (const target of ["sc", "sw", "svl", "framework"])
    expect(isForbiddenModuleEdge("comphelper", target)).toBe(true);
  expect(isForbiddenModuleEdge("cppu", "comphelper")).toBe(true);
  for (const source of ["comphelper/inc/extract.ts", "svl/inc/eitem.ts", "svl/inc/cenumitm.ts"]) {
    expect(getRuntimeOwnershipLayer(source)).toBe("upstream-mechanism");
    expect(getRuntimeOwnershipViolation(source, "", "react")).toMatch(/presentation package/u);
  }
  expect(
    getRuntimeOwnershipViolation(
      "comphelper/inc/extract.ts",
      "vcl/browser/font-list.ts",
      "../../vcl/browser/font-list",
    ),
  ).toMatch(/browser adapters/u);
});

it("permits the original shared integer hash dependency while retaining reverse restrictions", /** Protects original unsigned item hashing. @returns Nothing. */ () => {
  expect(isForbiddenModuleEdge("svl", "o3tl")).toBe(false);
  expect(isForbiddenModuleEdge("o3tl", "svl")).toBe(true);
  for (const source of ["svl/inc/cintitem.ts", "svl/inc/intitem.ts"])
    expect(getRuntimeOwnershipLayer(source)).toBe("upstream-mechanism");
});

it("keeps original SVX angle units below Calc and browser responsibilities", /** Checks exact native header dependency and reverse restrictions. @returns Nothing. */ () => {
  expect(isForbiddenModuleEdge("svx", "tools")).toBe(false);
  expect(isForbiddenModuleEdge("tools", "svx")).toBe(true);
  for (const source of ["svx/inc/sdangitm.ts", "tools/inc/degree.ts"]) {
    expect(getRuntimeOwnershipLayer(source)).toBe("upstream-mechanism");
    expect(getRuntimeOwnershipViolation(source, "", "react")).toMatch(/presentation package/u);
  }
});

it("permits actual generated alignment enum dependencies without reverse or browser ownership", /** Checks source includes and generated type responsibility. @returns Nothing. */ () => {
  for (const source of ["editeng", "offapi", "svx"])
    expect(isForbiddenModuleEdge(source, "cppu")).toBe(false);
  expect(isForbiddenModuleEdge("svx", "offapi")).toBe(false);
  for (const target of ["editeng", "offapi", "svx"])
    expect(isForbiddenModuleEdge("cppu", target)).toBe(true);
  expect(getRuntimeOwnershipLayer("editeng/inc/justifyitem.ts")).toBe("upstream-mechanism");
  expect(getRuntimeOwnershipViolation("editeng/inc/justifyitem.ts", "", "react")).toMatch(
    /presentation package/u,
  );
});

it("permits original metric owners and only the exact SAL64 numeric header witness", /** Protects native value dependencies without broader SAL/o3tl permissions. @returns Nothing. */ () => {
  for (const source of ["editeng", "svx", "tools"])
    expect(isForbiddenModuleEdge(source, "o3tl")).toBe(false);
  expect(isForbiddenModuleEdge("editeng", "tools")).toBe(false);
  expect(isForbiddenModuleEdge("tools", "editeng")).toBe(true);
  const path = "../../sal/inc/types";
  expect(
    isOriginalSalO3tlImport(
      "o3tl/inc/unit_conversion.ts",
      "sal/inc/types",
      `import { SAL_MIN_INT64, SAL_MAX_INT64 } from "${path}";`,
      path,
    ),
  ).toBe(true);
  expect(
    isOriginalSalO3tlImport(
      "o3tl/inc/unit_conversion.ts",
      "sal/inc/types",
      `import { SAL_MIN_INT32, SAL_MAX_INT32 } from "${path}";`,
      path,
    ),
  ).toBe(false);
});

it("allows original VCL slant helper dependencies while retaining reverse application guards", /** Native unohelp.hxx consumes tools/fontenum and awt FontSlant; no browser dependency is introduced. @returns Nothing. */ () => {
  for (const dependency of ["tools", "offapi"]) {
    expect(isForbiddenModuleEdge("vcl", dependency)).toBe(false);
    expect(isForbiddenModuleEdge(dependency, "vcl")).toBe(true);
  }
  for (const application of ["sc", "sw", "framework"])
    expect(isForbiddenModuleEdge("vcl", application)).toBe(true);
});

it("permits original SVTools scalar metric dependencies while preserving reverse application and browser guards", /** Original unitconv consumes Tools and o3tl, without presentation owners. @returns Nothing. */ () => {
  for (const target of ["tools", "o3tl"]) {
    expect(isForbiddenModuleEdge("svtools", target)).toBe(false);
    expect(isForbiddenModuleEdge(target, "svtools")).toBe(true);
  }
  for (const target of ["sc", "sw", "framework", "vcl"])
    expect(isForbiddenModuleEdge("svtools", target)).toBe(true);
  expect(getRuntimeOwnershipLayer("svtools/source/misc/unitconv.ts")).toBe("upstream-mechanism");
  expect(getRuntimeOwnershipViolation("svtools/source/misc/unitconv.ts", "", "react")).toMatch(
    /presentation package/u,
  );
});

it("admits original Tools Color Any operators while retaining reverse and application guards", /** Header owns the original specialization, no CPPU to Tools dependency. @returns Nothing. */ () => {
  expect(isForbiddenModuleEdge("tools", "cppu")).toBe(false);
  expect(isForbiddenModuleEdge("cppu", "tools")).toBe(true);
  for (const target of ["sc", "sw", "framework", "vcl"])
    expect(isForbiddenModuleEdge("tools", target)).toBe(true);
  expect(getRuntimeOwnershipLayer("tools/inc/color.ts")).toBe("upstream-mechanism");
  expect(getRuntimeOwnershipViolation("tools/inc/color.ts", "", "react")).toMatch(
    /presentation package/u,
  );
});

it("admits native docmodel color values using Tools and o3tl without app or reverse edges", /** Checks shared color value ownership. @returns Nothing. */ () => {
  expect(isForbiddenModuleEdge("docmodel", "tools")).toBe(false);
  expect(isForbiddenModuleEdge("docmodel", "o3tl")).toBe(false);
  for (const module of ["sw", "sc", "framework", "vcl"])
    expect(isForbiddenModuleEdge("docmodel", module)).toBe(true);
  expect(isForbiddenModuleEdge("tools", "docmodel")).toBe(true);
  expect(getRuntimeOwnershipLayer("docmodel/inc/color/ComplexColor.ts")).toBe("upstream-mechanism");
  expect(getRuntimeOwnershipViolation("docmodel/inc/color/ComplexColor.ts", "", "react")).toMatch(
    /browser presentation package/u,
  );
});

it("admits the original color-item dependency on docmodel without reverse item or app edges", /** Checks the native colritem.hxx Color and ComplexColor owner boundary. @returns Nothing. */ () => {
  expect(isForbiddenModuleEdge("editeng", "docmodel")).toBe(false);
  expect(isForbiddenModuleEdge("docmodel", "editeng")).toBe(true);
  expect(isForbiddenModuleEdge("editeng", "sc")).toBe(true);
  expect(isForbiddenModuleEdge("editeng", "sw")).toBe(true);
  expect(getRuntimeOwnershipLayer("editeng/inc/colritem.ts")).toBe("upstream-mechanism");
  expect(
    getRuntimeOwnershipViolation("editeng/source/items/textitem.color.ts", "", "react"),
  ).toMatch(/browser presentation package/u);
});

it("admits native font-item SAL encoding and Unicode hash owners without app or browser edges", /** Checks fontitem.hxx RTL text declarations and source string hash ownership. @returns Nothing. */ () => {
  expect(isForbiddenModuleEdge("editeng", "sal")).toBe(false);
  expect(isForbiddenModuleEdge("sal", "editeng")).toBe(true);
  expect(isForbiddenModuleEdge("editeng", "sw")).toBe(true);
  expect(isForbiddenModuleEdge("editeng", "sc")).toBe(true);
  expect(getRuntimeOwnershipLayer("editeng/inc/fontitem.ts")).toBe("upstream-mechanism");
  expect(
    getRuntimeOwnershipViolation("editeng/source/items/textitem.font.ts", "", "react"),
  ).toMatch(/browser presentation package/u);
});

it("admits original ODF font handlers using Tools enums and SAL encoding declarations", /** Preserves font-only shared dependencies without app or reverse edges. @returns Nothing. */ () => {
  expect(isForbiddenModuleEdge("xmloff", "o3tl")).toBe(false);
  expect(isForbiddenModuleEdge("o3tl", "xmloff")).toBe(true);
  expect(isForbiddenModuleEdge("xmloff", "tools")).toBe(false);
  expect(isForbiddenModuleEdge("xmloff", "sal")).toBe(false);
  expect(isForbiddenModuleEdge("tools", "xmloff")).toBe(true);
  expect(isForbiddenModuleEdge("sal", "xmloff")).toBe(true);
  expect(isForbiddenModuleEdge("xmloff", "sw")).toBe(true);
  expect(isForbiddenModuleEdge("xmloff", "sc")).toBe(true);
});

it("admits native Writer charset declarations without granting shared reverse dependencies", /** Protects font-value enum ownership. @returns Nothing. */ () => {
  expect(isForbiddenModuleEdge("sw", "sal")).toBe(false);
  expect(isForbiddenModuleEdge("sal", "sw")).toBe(true);
});

it("admits original ODF border IDL values without application or reverse dependencies", /** Original bordrhdl.cxx consumes the published BorderLine2 type. @returns Nothing. */ () => {
  expect(isForbiddenModuleEdge("xmloff", "offapi")).toBe(false);
  expect(isForbiddenModuleEdge("offapi", "xmloff")).toBe(true);
  expect(isForbiddenModuleEdge("xmloff", "sw")).toBe(true);
});

it("admits original set-item MapUnit and page-item OUString dependencies without reverse edges", /** Native presentation signatures borrow existing shared types and no browser service. @returns Nothing. */ () => {
  expect(isForbiddenModuleEdge("svl", "tools")).toBe(false);
  expect(isForbiddenModuleEdge("tools", "svl")).toBe(true);
  expect(isForbiddenModuleEdge("svx", "sal")).toBe(false);
  expect(isForbiddenModuleEdge("sal", "svx")).toBe(true);
});

it("keeps primitive language identities below Editeng and browser owners", /** Native SAL/Locale conversion dependencies are admitted while app/browser edges remain forbidden. @returns Nothing. */ () => {
  expect(isForbiddenModuleEdge("editeng", "i18nlangtag")).toBe(false);
  expect(isForbiddenModuleEdge("sc", "i18nlangtag")).toBe(false);
  expect(isForbiddenModuleEdge("i18nlangtag", "sal")).toBe(false);
  expect(isForbiddenModuleEdge("i18nlangtag", "udkapi")).toBe(false);
  for (const owner of ["editeng", "sc", "sw", "framework", "vcl"])
    expect(isForbiddenModuleEdge("i18nlangtag", owner)).toBe(true);
  expect(getRuntimeOwnershipLayer("i18nlangtag/inc/lang.ts")).toBe("upstream-mechanism");
  expect(getRuntimeOwnershipViolation("i18nlangtag/inc/lang.ts", "", "react")).toMatch(
    /presentation package/u,
  );
  expect(
    getRuntimeOwnershipViolation(
      "i18nlangtag/inc/lang.ts",
      "vcl/browser/font-list.ts",
      "../font-list",
    ),
  ).toMatch(/browser adapters/u);
});

it("admits original Editeng script-hint values without reverse or browser dependencies", /** Native public header and library link own this dependency, not UI localization. @returns Nothing. */ () => {
  expect(isForbiddenModuleEdge("editeng", "i18nutil")).toBe(false);
  for (const owner of ["editeng", "sc", "sw", "framework", "vcl", "tools", "svl"])
    expect(isForbiddenModuleEdge("i18nutil", owner)).toBe(true);
  expect(getRuntimeOwnershipLayer("i18nutil/inc/scriptchangescanner.ts")).toBe(
    "upstream-mechanism",
  );
  expect(getRuntimeOwnershipViolation("i18nutil/inc/scriptchangescanner.ts", "", "react")).toMatch(
    /presentation package/u,
  );
  expect(
    getRuntimeOwnershipViolation(
      "i18nutil/inc/scriptchangescanner.ts",
      "vcl/browser/font-list.ts",
      "../font-list",
    ),
  ).toMatch(/browser adapters/u);
});

it("keeps native numeric locale resources below tab items and application/browser owners", /** Allows the source-backed locale client/producer edges while blocking reverse and application dependencies. @returns Nothing. */ () => {
  expect(isForbiddenModuleEdge("editeng", "unotools")).toBe(false);
  expect(isForbiddenModuleEdge("unotools", "editeng")).toBe(true);
  expect(isForbiddenModuleEdge("unotools", "i18npool")).toBe(false);
  for (const owner of ["i18npool", "unotools"])
    for (const app of ["sc", "sw", "framework"])
      expect(isForbiddenModuleEdge(owner, app)).toBe(true);
  for (const owner of ["i18nlangtag", "udkapi", "cppu", "offapi"]) {
    expect(isForbiddenModuleEdge("i18npool", owner)).toBe(false);
    expect(isForbiddenModuleEdge(owner, "i18npool")).toBe(true);
  }
  expect(isForbiddenModuleEdge("i18npool", "unotools")).toBe(true);
  expect(
    getRuntimeOwnershipViolation(
      "i18npool/source/localedata/localedata.ts",
      "sw/browser/presentation/WriterView.tsx",
      "../../sw/browser/presentation/WriterView",
    ),
  ).toMatch(/browser adapters/u);
});

it("admits original paragraph property clients without admitting reverse application dependencies", /** Keeps the actual native link edges and existing layer/cycle guards. @returns Nothing. */ () => {
  expect(isForbiddenModuleEdge("editeng", "comphelper")).toBe(false);
  expect(isForbiddenModuleEdge("sw", "cppu")).toBe(false);
  expect(isForbiddenModuleEdge("comphelper", "editeng")).toBe(true);
  expect(isForbiddenModuleEdge("comphelper", "sw")).toBe(true);
  expect(isForbiddenModuleEdge("cppu", "sw")).toBe(true);
  expect(isForbiddenModuleEdge("cppu", "editeng")).toBe(true);
  expect(isForbiddenModuleEdge("editeng", "sw")).toBe(true);
});

it("distinguishes emitted imports from erased type syntax before runtime cycle detection", /** Owner allowlisting still applies to both kinds of import. @returns Nothing. */ () => {
  const source = `import type { TypeClass } from "type-only";
 import { type A, type B as C } from "named-types";
 import { A, type B } from "mixed";
 import Foo from "default";
 import * as ns from "namespace";
 import "side-effect";
 import {} from "empty";
 export type { X } from "export-type";
 export { type X } from "export-named-type";
 export { type X, Y } from "export-mixed";
 export * from "export-star";
 export * as alias from "export-namespace";
 export {} from "export-empty";
 type Query=typeof import("type-query");
 type Module=import("import-type").A;
 import Legacy=require("equals");
 import type LegacyType=require("equals-type");
 const load=()=>import("dynamic");
 const required=require("require");`;
  expect([...getRuntimeImportSpecifiers(source)].sort()).toEqual(
    [
      "default",
      "dynamic",
      "empty",
      "equals",
      "export-empty",
      "export-mixed",
      "export-named-type",
      "export-namespace",
      "export-star",
      "mixed",
      "named-types",
      "namespace",
      "require",
      "side-effect",
    ].sort(),
  );
  expect([...getRuntimeImportSpecifiers("const value=1;")]).toEqual([]);
  for (const target of ["udkapi", "offapi"])
    expect(isForbiddenModuleEdge("svl", target)).toBe(false);
  for (const module of ["sc", "sw", "vcl", "framework", "svl"])
    for (const owner of ["udkapi", "cppu", "offapi"])
      expect(isForbiddenModuleEdge(owner, module)).toBe(true);
});
it("admits only source-backed VCL variation and original UTF16 decimal header bindings", /** Preserves reverse/application edge rejection and exact shared SAL/o3tl named bindings. @returns Nothing. */ () => {
  expect(isForbiddenModuleEdge("vcl", "o3tl")).toBe(false);
  expect(isForbiddenModuleEdge("o3tl", "vcl")).toBe(true);
  expect(isForbiddenModuleEdge("vcl", "sc")).toBe(true);
  const specifier = "../../sal/inc/rtl/math.h";
  expect(
    isOriginalSalO3tlImport(
      "o3tl/inc/string_view.ts",
      "sal/inc/rtl/math.h.ts",
      'import { rtl_math_uStringToDouble } from "../../sal/inc/rtl/math.h";',
      specifier,
    ),
  ).toBe(true);
  expect(
    isOriginalSalO3tlImport(
      "o3tl/inc/string_view.ts",
      "sal/inc/rtl/math.h.ts",
      'import { rtl_math_stringToDouble } from "../../sal/inc/rtl/math.h";',
      specifier,
    ),
  ).toBe(false);
  expect(
    isOriginalSalO3tlImport(
      "o3tl/inc/other.ts",
      "sal/inc/rtl/math.h.ts",
      'import { rtl_math_uStringToDouble } from "../../sal/inc/rtl/math.h";',
      specifier,
    ),
  ).toBe(false);
});

it("admits only original pure document-pool VCL dependencies while retaining domain/browser gates", /** Verifies the exact consumed native edge and negative browser/reverse cases. @returns Nothing. */ () => {
  for (const target of ["vcl/inc/idle.ts", "vcl/inc/task.ts", "vcl/inc/scheduler.ts"])
    expect(isForbiddenDomainVclImport("sc/source/core/tool/chartlis.ts", target)).toBe(false);
  for (const target of [
    "vcl/browser/sal-timer.ts",
    "vcl/source/app/scheduler.ts",
    "vcl/inc/idle-other.ts",
  ])
    expect(isForbiddenDomainVclImport("sc/source/core/tool/chartlis.ts", target)).toBe(true);
  expect(isForbiddenDomainVclImport("sc/source/core/data/document.ts", "vcl/inc/idle.ts")).toBe(
    true,
  );
  const source = "sc/source/core/data/docpool.ts";
  for (const target of [
    "vcl/inc/fntstyle.ts",
    "vcl/source/outdev/font.ts",
    "vcl/inc/fntstyle",
    "vcl/source/outdev/font",
  ])
    expect(isForbiddenDomainVclImport(source, target)).toBe(false);
  for (const target of [
    "vcl/browser/font-list.ts",
    "vcl/browser/default-font-device.ts",
    "vcl/source/font/font.ts",
  ])
    expect(isForbiddenDomainVclImport(source, target)).toBe(true);
  for (const caller of ["sc/source/core/data/document.ts", "sw/source/core/doc/doc.ts"])
    expect(isForbiddenDomainVclImport(caller, "vcl/source/outdev/font.ts")).toBe(true);
  expect(
    isForbiddenDomainVclImport(
      "sc/browser/presentation/ScGridWindow.tsx",
      "vcl/browser/font-list.ts",
    ),
  ).toBe(false);
  expect(isForbiddenDomainVclImport(source, "tools/inc/fontenum.ts")).toBe(false);
  expect(
    getRuntimeOwnershipViolation(
      source,
      "vcl/browser/font-list.ts",
      "../../../../vcl/browser/font-list",
    ),
  ).toMatch(/browser/u);
  expect(
    getRuntimeOwnershipViolation(
      "vcl/source/outdev/font.ts",
      "vcl/browser/default-font-device.ts",
      "../../browser/default-font-device",
    ),
  ).toMatch(/browser/u);
  expect(isForbiddenModuleEdge("sc", "tools")).toBe(false);
  expect(isForbiddenModuleEdge("vcl", "i18nlangtag")).toBe(false);
  expect(isForbiddenModuleEdge("tools", "sc")).toBe(true);
  expect(isForbiddenModuleEdge("i18nlangtag", "vcl")).toBe(true);
});

it("admits only pinned character-handler value imports without widening module or browser permissions", /** Checks the exact new source edges and nearby forbidden imports. @returns Nothing. */ () => {
  const any = "cppu/inc/com/sun/star/uno/Any.ts";
  expect(
    isOriginalCharacterValueImport(
      "xmloff/source/style/weighhdl.ts",
      "cppu/inc/com/sun/star/uno/Any",
    ),
  ).toBe(true);
  expect(isOriginalCharacterValueImport("sax/source/tools/converter.ts", "o3tl/inc/numeric")).toBe(
    true,
  );
  for (const name of ["weighhdl", "postuhdl", "undlihdl", "cdouthdl", "xmlbahdl"])
    expect(isOriginalCharacterValueImport(`xmloff/source/style/${name}.ts`, any)).toBe(true);
  expect(isOriginalCharacterValueImport("xmloff/source/text/txtprmap.ts", any)).toBe(true);
  expect(
    isOriginalCharacterValueImport("xmloff/source/style/postuhdl.ts", "vcl/inc/unohelp.ts"),
  ).toBe(true);
  expect(
    isOriginalCharacterValueImport("sax/source/tools/converter.ts", "o3tl/inc/numeric.ts"),
  ).toBe(true);
  expect(isOriginalCharacterValueImport("sax/source/tools/other.ts", "o3tl/inc/numeric.ts")).toBe(
    false,
  );
  expect(
    isOriginalCharacterValueImport("sax/source/tools/converter.ts", "o3tl/inc/unit_conversion.ts"),
  ).toBe(false);
  expect(isOriginalCharacterValueImport("xmloff/source/style/other.ts", any)).toBe(false);
  expect(
    isOriginalCharacterValueImport(
      "xmloff/source/style/postuhdl.ts",
      "cppu/inc/typelib/typedescription.ts",
    ),
  ).toBe(false);
  expect(
    isOriginalCharacterValueImport("xmloff/source/style/weighhdl.ts", "vcl/inc/unohelp.ts"),
  ).toBe(false);
  expect(
    isOriginalCharacterValueImport("xmloff/source/style/postuhdl.ts", "vcl/browser/font-list.ts"),
  ).toBe(false);
  expect(
    isOriginalCharacterValueImport("xmloff/source/style/cdouthdl.ts", "vcl/browser/font-list.ts"),
  ).toBe(false);
  expect(
    isOriginalCharacterValueImport(
      "xmloff/source/style/cdouthdl.ts",
      "cppu/inc/typelib/typedescription.ts",
    ),
  ).toBe(false);
  expect(isForbiddenModuleEdge("xmloff", "cppu")).toBe(true);
  expect(isForbiddenModuleEdge("xmloff", "vcl")).toBe(true);
  expect(isForbiddenModuleEdge("sax", "o3tl")).toBe(true);
  expect(
    getRuntimeOwnershipViolation(
      "xmloff/source/style/postuhdl.ts",
      "vcl/browser/font-list.ts",
      "../../../vcl/browser/font-list",
    ),
  ).toMatch(/browser adapters/u);
});

it("admits the original VCL numeric-field Unicode utility dependency without admitting its reverse", /** Source field.cxx and Library_vcl.mk own this edge. @returns Nothing. */ () => {
  expect(isForbiddenModuleEdge("vcl", "i18nutil")).toBe(false);
  expect(isForbiddenModuleEdge("i18nutil", "vcl")).toBe(true);
});
