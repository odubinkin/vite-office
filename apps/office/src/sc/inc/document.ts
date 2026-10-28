/** @fileoverview Public boundary for the minimal ScDocument scalar editing subset. */
export { ScDocument, ScDocumentMode } from "../source/core/data/document";

import type { ScPatternAttr } from "./patattr";
/** Original header coordinate/pattern parameter declaration for the currently bound ApplyPatternAreaTab method. Its existing local return contract is unchanged. */
export type ApplyPatternAreaTabParameters = [
  startCol: number,
  startRow: number,
  endCol: number,
  endRow: number,
  tab: number,
  delta: ScPatternAttr,
];
