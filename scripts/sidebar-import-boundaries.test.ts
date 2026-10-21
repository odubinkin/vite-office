/** @fileoverview Protects exact browser sidebar dependency adapters without widening native module edges. */
import { expect, it } from "vitest";
import { isSidebarPresentationImport } from "./module-boundaries/sidebar-imports.mjs";
import { isForbiddenModuleEdge } from "./check-module-boundaries.mjs";
it("limits sidebar adaptation to its exact native panel and browser command dependencies", /** Guards the consumed sidebar integration without opening general SVX reverse imports. @returns Nothing. */ () => {
  const entries = [
    [
      "svx/browser/sidebar/styles/StylesPropertyPanel.tsx",
      ["sfx2/browser/presentation/SidebarPanel.tsx"],
    ],
    [
      "svx/browser/sidebar/text/TextPropertyPanel.tsx",
      [
        "sfx2/browser/presentation/SidebarPanel.tsx",
        "framework/browser/presentation/CommandSelectControl.tsx",
        "framework/browser/presentation/CommandToolbar.tsx",
        "framework/browser/presentation/command-surface.ts",
      ],
    ],
    [
      "svx/browser/sidebar/paragraph/ParaPropertyPanel.tsx",
      [
        "sfx2/browser/presentation/SidebarPanel.tsx",
        "framework/browser/presentation/CommandToolbar.tsx",
        "framework/browser/presentation/command-surface.ts",
      ],
    ],
  ] as const;
  for (const [source, targets] of entries) {
    for (const target of targets) expect(isSidebarPresentationImport(source, target)).toBe(true);
    expect(
      isSidebarPresentationImport(source, "framework/browser/presentation/CommandMenuBar.tsx"),
    ).toBe(false);
    expect(isSidebarPresentationImport(source.replace("/browser/", "/source/"), targets[0])).toBe(
      false,
    );
  }
  expect(isForbiddenModuleEdge("svx", "framework")).toBe(true);
  expect(isForbiddenModuleEdge("svx", "sfx2")).toBe(true);
});
