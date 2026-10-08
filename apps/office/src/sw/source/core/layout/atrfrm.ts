/** @fileoverview Represents table frame-format identity from pinned atrfrm.cxx; fly frames and the full frame attribute collection remain unverified. */
import { SwFormat } from "../attr/format";
import type { SwAttrPool } from "../attr/swatrset";
import type { SwDoc } from "../doc/doc";
import type { WhichRangesContainer } from "../../../../svl/source/items/itemset";
import { SwFormatFrameSize } from "../../../inc/fmtfsize";
import { SwFormatRowSplit } from "../../../inc/fmtrowsplt";
import { RES_ROW_SPLIT, RES_FRM_SIZE, RES_COLLAPSING_BORDERS } from "../../../inc/hintids";

/** Native frame identity owns its name and document attribute pool. */
export class SwFrameFormat extends SwFormat {
  /** Creates the represented table frame identity. @param pool - Document pool. @param name - Raw frame name. @param ranges - Native format ranges. @param derivedFrom - Optional parent frame. @returns Nothing. */
  public constructor(
    pool: SwAttrPool,
    name: string,
    ranges: WhichRangesContainer = [[RES_FRM_SIZE, RES_COLLAPSING_BORDERS]],
    derivedFrom?: SwFrameFormat,
  ) {
    super(pool, name, ranges, derivedFrom);
  }
  /** Reads the effective native row split attribute. @returns Owned or inherited item. */
  public GetRowSplit(): SwFormatRowSplit {
    return this.GetAttrSet().Get(RES_ROW_SPLIT) as SwFormatRowSplit;
  }
  /** Reads complete effective native frame size. @returns Owned or inherited item. */
  public GetFrameSize(): SwFormatFrameSize {
    return this.GetAttrSet().Get(RES_FRM_SIZE) as SwFormatFrameSize;
  }
  /** Resolves the owning native document. @returns Attribute-pool owner. */
  public GetDoc(): SwDoc {
    return this.GetAttrSet().GetDoc();
  }
}
