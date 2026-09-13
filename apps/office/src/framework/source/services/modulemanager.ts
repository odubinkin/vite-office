/**
 * @fileoverview Defines the browser module-manager suite inventory presented by the foundation workbench without claiming feature parity.
 */

/** Identifies a planned office-suite domain with a stable browser-facing key. */
export type SuiteId = "base" | "calc" | "chart" | "draw" | "impress" | "math" | "writer";

/** Describes one suite entry and an optional unavailable-foundation status. */
export interface SuiteDefinition {
  /** Short statement of the future document domain. */
  readonly description: string;
  /** Stable suite key used by view state and accessibility relationships. */
  readonly id: SuiteId;
  /** Human-readable suite name aligned with the LibreOffice product vocabulary. */
  readonly name: string;
  /** Explicit non-capability status shown only for suites without an implemented workbench. */
  readonly status?: "Foundation only";
}

/** Defines a suite-owned workspace factory registered by the application composition root. */
export interface OfficeModuleFactory {
  /** Creates the suite workspace without exposing its concrete component to framework core. */
  readonly createWorkspace: () => React.ReactNode;
  /** Stable suite identity whose route activates the factory. */
  readonly suiteId: SuiteId;
}

/** Combines framework-owned route metadata with an optional suite-owned workspace factory. */
export interface OfficeModuleDescriptor extends SuiteDefinition {
  /** Creates an implemented workspace, or remains absent for a foundation-only suite. */
  readonly createWorkspace?: () => React.ReactNode;
}

/** Ordered suite inventory resolved by the static browser module manager. */
export const suiteDefinitions = [
  {
    description: "Text documents, page layout, review, and publishing workflows.",
    id: "writer",
    name: "Writer",
  },
  {
    description: "Worksheets, formulas, analysis, and calculation workflows.",
    id: "calc",
    name: "Calc",
    status: "Foundation only",
  },
  {
    description: "Slide authoring, presenting, animation, and export workflows.",
    id: "impress",
    name: "Impress",
    status: "Foundation only",
  },
  {
    description: "Vector graphics, diagrams, connectors, and page composition.",
    id: "draw",
    name: "Draw",
    status: "Foundation only",
  },
  {
    description: "Database documents, tables, queries, forms, and reports.",
    id: "base",
    name: "Base",
    status: "Foundation only",
  },
  {
    description: "Formula authoring, semantic layout, rendering, and embedding.",
    id: "math",
    name: "Math",
    status: "Foundation only",
  },
  {
    description: "Shared chart models, editing, rendering, and embedding.",
    id: "chart",
    name: "Chart",
    status: "Foundation only",
  },
] as const satisfies readonly SuiteDefinition[];

/**
 * Resolves suite factories into the complete ordered module inventory.
 *
 * @param factories - Suite-owned factories registered by the composition root.
 * @returns Fresh ordered descriptors preserving framework route metadata.
 * @throws {Error} When a factory targets an unknown suite or duplicates a registration.
 */
export function createOfficeModuleDescriptors(
  factories: readonly OfficeModuleFactory[],
): readonly OfficeModuleDescriptor[] {
  const registered = new Map<SuiteId, OfficeModuleFactory>();
  for (const factory of factories) {
    if (
      !suiteDefinitions.some(
        /** Checks whether framework route metadata exists for a factory. @param suite - Known suite definition. @returns True for the registered identity. */
        (suite) => suite.id === factory.suiteId,
      )
    )
      throw new Error(`Unknown office module factory: ${factory.suiteId}`);
    if (registered.has(factory.suiteId))
      throw new Error(`Duplicate office module factory: ${factory.suiteId}`);
    registered.set(factory.suiteId, factory);
  }
  return suiteDefinitions.map(
    /** Joins one route descriptor to its optional registered factory. @param suite - Framework-owned suite metadata. @returns Fresh complete module descriptor. */
    (suite) => {
      const factory = registered.get(suite.id);
      return factory === undefined
        ? { ...suite }
        : { ...suite, createWorkspace: factory.createWorkspace };
    },
  );
}
