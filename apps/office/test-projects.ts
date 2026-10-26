/** @fileoverview Defines disjoint application test projects and matching coverage ownership. */

import type { TestUserConfig } from "vitest/config";

/** Application ownership selectable independently from the complete office suite. */
export type OfficeTestScope = "all" | "writer" | "calc" | "shared";

/** Writer integration cases colocated with the shared component they exercise; paths remain stable for parity mappings. */
const writerIntegrationTests = [
  "src/xmloff/source/text/txtimp.test.ts",
  "src/xmloff/source/text/txtparai.test.ts",
  "src/editeng/browser/text-line-item-codec.test.ts",
  "src/editeng/source/items/{paraitem,textitem,frmitems}.test.ts",
  "src/editeng/source/items/native-lr-space-item.test.ts",
  "src/editeng/source/items/native-adjust-item.test.ts",
  "src/editeng/source/items/native-num-rule.test.ts",
  "src/svl/source/items/itemset.test.ts",
  "src/svl/source/items/{native-bool-item,sitem}.test.ts",
  "src/svl/source/notify/{notify,native-svt-notifier}.test.ts",
  "src/framework/browser/app/desktop.test.tsx",
  "src/framework/browser/presentation/CommandMenuBar-{document-focus,menu-key}.test.tsx",
  "src/xmloff/source/style/native-{legacy-bullet-symbol,bullet-scalar}.test.ts",
];

/** Calc integration cases colocated with their shared locale and item owners. */
const calcIntegrationTests = [
  "src/i18nlangtag/source/isolang/{isolang,mslangid}.test.ts",
  "src/svl/source/items/native-target-which.test.ts",
];

/** Creates test projects and a coverage gate restricted to the selected owners. @param scope - Application or complete-suite selection. @param includeApplicationIntegration - Whether shared coverage also collects application integration evidence. @returns Vitest test configuration. */
export function createOfficeTestOptions(
  scope: OfficeTestScope = "all",
  includeApplicationIntegration = false,
): TestUserConfig {
  const applicationRoots = ["src/sw/**", "src/sc/**"];
  const projects = [
    {
      name: "writer",
      include: ["src/sw/**/*.test.{ts,tsx}", ...writerIntegrationTests],
      exclude: [],
    },
    { name: "calc", include: ["src/sc/**/*.test.{ts,tsx}", ...calcIntegrationTests], exclude: [] },
    {
      name: "shared",
      include: ["src/**/*.test.{ts,tsx}"],
      exclude: [...applicationRoots, ...writerIntegrationTests, ...calcIntegrationTests],
    },
  ];
  const selected =
    scope === "all" || includeApplicationIntegration
      ? projects
      : projects.filter(
          /** Keeps one explicitly selected test owner. @param project - Candidate owner. @returns Whether selected. */
          (project) => project.name === scope,
        );
  return {
    coverage: {
      exclude: [
        "src/**/*.test.{ts,tsx}",
        "src/main.tsx",
        "src/sw/source/filter/xml/odt-worker.ts",
        "src/test/**",
        ...(scope === "shared" ? applicationRoots : []),
      ],
      include: [
        scope === "writer"
          ? "src/sw/**/*.{ts,tsx}"
          : scope === "calc"
            ? "src/sc/**/*.{ts,tsx}"
            : "src/**/*.{ts,tsx}",
      ],
      provider: "istanbul",
      // Preserve diagnostics for integration repairs while retaining every coverage threshold.
      reportOnFailure: true,
      reporter: ["text", "json", "json-summary", "html"],
      reportsDirectory: `./coverage/${scope}`,
      thresholds: { branches: 100, functions: 100, lines: 100, statements: 100 },
    },
    maxWorkers: 2,
    passWithNoTests: scope === "calc",
    projects: selected.map(
      /** Shares transforms while keeping discovery exclusive to one owner. @param project - Owner patterns. @returns Inline project. */
      (project) => ({
        extends: true,
        test: {
          ...project,
          environment: "jsdom",
          setupFiles: ["./src/test/setup.ts"],
          testTimeout: 30_000,
        },
      }),
    ),
  };
}
