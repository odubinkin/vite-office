/** @fileoverview Represents table frame-format identity from pinned atrfrm.cxx; fly frames and the full frame attribute collection remain unverified. */
import { SwFormat } from "../attr/format";
import type { SwAttrPool } from "../attr/swatrset";
import type { SwDoc } from "../doc/doc";
import { RES_FRM_SIZE, RES_COLLAPSING_BORDERS } from "../../../inc/hintids";

/** Native frame identity owns its name and document attribute pool. */
export class SwFrameFormat extends SwFormat {
  /** Creates the represented table frame identity. @param pool - Document pool. @param name - Raw frame name. @returns Nothing. */
  public constructor(pool: SwAttrPool, name: string) {
    super(pool, name, [[RES_FRM_SIZE, RES_COLLAPSING_BORDERS]]);
  }
  /** Resolves the owning native document. @returns Attribute-pool owner. */
  public GetDoc(): SwDoc {
    return this.GetAttrSet().GetDoc();
  }
}
