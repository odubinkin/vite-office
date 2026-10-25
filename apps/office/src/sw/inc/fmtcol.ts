/** @fileoverview Original inline graphic style construction from fmtcol.hxx, using the actual shared SwFormatColl implementation. */
import { SwFormatColl } from "../source/core/doc/fmtcol";
import type { SwAttrPool } from "../source/core/attr/swatrset";
import {
  RES_FRMATR_BEGIN,
  RES_GRFATR_END,
  RES_UNKNOWNATR_BEGIN,
  RES_UNKNOWNATR_END,
} from "./hintids";

/** Native graphic style owns frame and graphic ranges, without an invented graphic service or document node. */
export class SwGrfFormatColl extends SwFormatColl {
  /** Original graphic collection constructor from fmtcol.hxx. @param pool - Document pool. @param name - Native name. @param parent - Optional graphic parent. @returns Collection. */
  constructor(pool: SwAttrPool, name: string, parent?: SwGrfFormatColl) {
    super(pool, name, parent, [
      [RES_FRMATR_BEGIN, RES_GRFATR_END - 1],
      [RES_UNKNOWNATR_BEGIN, RES_UNKNOWNATR_END - 1],
    ]);
  }
}
