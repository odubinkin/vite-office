/**
 * @fileoverview Defines the browser module-manager suite inventory presented by the foundation workbench without claiming feature parity.
 */

/** Identifies a planned office-suite domain with a stable browser-facing key. */
export type SuiteId = "base" | "calc" | "chart" | "draw" | "impress" | "math" | "writer";

/** Describes one planned suite entry and its intentionally unavailable foundation state. */
export interface SuiteDefinition {
  /** Short statement of the future document domain. */
  readonly description: string;
  /** Stable suite key used by view state and accessibility relationships. */
  readonly id: SuiteId;
  /** Human-readable suite name aligned with the LibreOffice product vocabulary. */
  readonly name: string;
  /** Explicit non-capability status shown to users. */
  readonly status: "Foundation only";
}

/** Ordered suite inventory resolved by the static browser module manager. */
export const suiteDefinitions = [
  {
    description: "Text documents, page layout, review, and publishing workflows.",
    id: "writer",
    name: "Writer",
    status: "Foundation only",
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
