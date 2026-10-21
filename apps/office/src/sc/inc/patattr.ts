/** @fileoverview Original patattr.hxx boundary for represented cell-pattern data and canonical holder owners. */
export {
  CellAttributeHelper,
  CellAttributeHolder,
  ScPatternAttr,
} from "../source/core/data/patattr";

/** Erased borrowed style operations;does not implement the missing Calc style owner. */
export type { ScPatternStyleReference } from "../source/core/data/patattr";
