/** @fileoverview Native SwCharFormat construction from charfmt.hxx; the real format base owns attributes and derivation. */
import { SwFormat } from "../source/core/attr/format";
import type { SwAttrPool } from "../source/core/attr/swatrset";
import {
  RES_CHRATR_BEGIN,
  RES_CHRATR_END,
  RES_UNKNOWNATR_BEGIN,
  RES_UNKNOWNATR_END,
} from "./hintids";
/** Native character format; linked paragraph-style handling remains with its owning style integration. */
export class SwCharFormat extends SwFormat {
  /** Original name/pool/parent constructor. @param pool - Document pool. @param name - Name. @param parent - Optional native parent. @returns Format. */
  constructor(pool: SwAttrPool, name: string, parent?: SwCharFormat) {
    super(
      pool,
      name,
      [
        [RES_CHRATR_BEGIN, RES_CHRATR_END - 1],
        [RES_UNKNOWNATR_BEGIN, RES_UNKNOWNATR_END - 1],
      ],
      parent,
    );
  }
}
