/** @fileoverview Exact browser sidebar Sfx/control dependencies,without opening reverse native module edges. */
/** Native panels borrow actual Sfx bindings;React presenters use only the declared panel and command adapters. */
const sidebarPresentationImports = new Map([
  // Native sidebar panels consume Sfx panel/binding ownership;React command controls are the exact browser boundary.
  [
    "svx/browser/sidebar/styles/StylesPropertyPanel.tsx",
    new Set(["sfx2/browser/presentation/SidebarPanel"]),
  ],
  [
    "svx/browser/sidebar/text/TextPropertyPanel.tsx",
    new Set([
      "sfx2/browser/presentation/SidebarPanel",
      "framework/browser/presentation/CommandSelectControl",
      "framework/browser/presentation/CommandToolbar",
      "framework/browser/presentation/command-surface",
    ]),
  ],
  [
    "svx/browser/sidebar/paragraph/ParaPropertyPanel.tsx",
    new Set([
      "sfx2/browser/presentation/SidebarPanel",
      "framework/browser/presentation/CommandToolbar",
      "framework/browser/presentation/command-surface",
    ]),
  ],
]);

/** Matches only the declared browser presenters and their exact adapter dependencies. @param relativeSource - Actual source-relative owner. @param relativeTarget - Resolved relative import,with an optional TypeScript suffix. @returns Whether this precise browser edge is declared. */
export function isSidebarPresentationImport(relativeSource, relativeTarget) {
  const source = relativeSource.replaceAll("\\", "/"),
    target = relativeTarget.replaceAll("\\", "/").replace(/\.tsx?$/u, "");
  return sidebarPresentationImports.get(source)?.has(target) ?? false;
}
