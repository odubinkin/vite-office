/** @fileoverview Native frame identity, complete attribute ranges and special/fly-format construction from atrfrm.cxx/frmfmt.hxx; layout/contact and full destructor families remain unverified. */
import { NameChanged } from "../../../inc/hints";
import type { SwFormatsBase } from "../../../inc/docary";
import { RES_FRMFMT, RES_FLYFRMFMT, RES_DRAWFRMFMT } from "../../../inc/hintids";
import { aFrameFormatSetRange } from "../bastyp/init";
import { SwFormat } from "../attr/format";
import type { SwAttrPool } from "../attr/swatrset";
import type { WhichRangesContainer } from "../../../../svl/source/items/itemset";
import { SwFormatFrameSize } from "../../../inc/fmtfsize";
import { SwFormatVertOrient } from "../../../inc/fmtornt";
import { SvxBoxItem } from "../../../../editeng/source/items/frmitems";
import { RES_BOX, RES_VERT_ORIENT } from "../../../inc/hintids";
import { SwFormatRowSplit } from "../../../inc/fmtrowsplt";
import { RES_ROW_SPLIT, RES_FRM_SIZE } from "../../../inc/hintids";
import { RES_TEXTGRID } from "../../../inc/hintids";
import type { SwTextGridItem } from "../../../inc/tgrditem";

/** Native frame identity owns its name and document attribute pool. */
export class SwFrameFormat extends SwFormat {
  /** Original friend-managed list back-reference; deletion leaves it for the owning container to clear. */
  m_ffList: SwFormatsBase | null = null;
  /** Original registered rename dispatch. @param name - New name. @param broadcast - Whether to notify clients. @returns Nothing. */
  override SetFormatName(name: string, broadcast = false): void {
    if (this.m_ffList !== null) {
      const hint = new NameChanged(this.GetName(), name);
      this.m_ffList.Rename(this, name);
      if (broadcast) this.GetNotifier().Broadcast(hint);
    } else super.SetFormatName(name, broadcast);
  }
  /** Borrows the effective original page text-grid item. @param searchInParent - Whether inherited items participate. @returns Grid item. */
  GetTextGrid(searchInParent = true): SwTextGridItem {
    return this.GetAttrSet().Get(RES_TEXTGRID, searchInParent) as SwTextGridItem;
  }
  /** Creates the represented table frame identity. @param pool - Document pool. @param name - Raw frame name. @param ranges - Native format ranges. @param derivedFrom - Optional parent frame. @param formatWhich - Native frame identity. @returns Nothing. */
  public constructor(
    pool: SwAttrPool,
    name: string,
    ranges: WhichRangesContainer = aFrameFormatSetRange,
    derivedFrom?: SwFrameFormat,
    formatWhich = RES_FRMFMT,
  ) {
    super(pool, name, ranges, derivedFrom, formatWhich);
  }
  /** Reads the effective native row split attribute. @returns Owned or inherited item. */
  public GetRowSplit(): SwFormatRowSplit {
    return this.GetAttrSet().Get(RES_ROW_SPLIT) as SwFormatRowSplit;
  }
  /** Reads complete effective native frame size. @returns Owned or inherited item. */
  public GetFrameSize(): SwFormatFrameSize {
    return this.GetAttrSet().Get(RES_FRM_SIZE) as SwFormatFrameSize;
  }
  /** Reads effective complete native box attributes. @returns Owned, inherited or pooled item. */
  public GetBox(): SvxBoxItem {
    return this.GetAttrSet().Get(RES_BOX) as SvxBoxItem;
  }
  /** Reads effective complete native vertical orientation. @returns Owned, inherited or pooled item. */
  public GetVertOrient(): SwFormatVertOrient {
    return this.GetAttrSet().Get(RES_VERT_ORIENT) as SwFormatVertOrient;
  }
}

/** Original special-format base admits only fly or drawing frame identities. */
export class SpzFrameFormat extends SwFrameFormat {
  /** Original protected constructor. @param pool - Actual pool. @param name - Name. @param parent - Actual frame parent. @param which - Fly or draw identity. @returns Format. */
  protected constructor(
    pool: SwAttrPool,
    name: string,
    parent: SwFrameFormat | undefined,
    which: number,
  ) {
    super(pool, name, undefined, parent, which);
    if (which !== RES_FLYFRMFMT && which !== RES_DRAWFRMFMT)
      throw new Error("assert(special frame identity)");
  }
}
/** Original native fly-format identity and inheritance; fly-layout/contact creation is a separate unported responsibility. */
export class SwFlyFrameFormat extends SpzFrameFormat {
  /** Original constructor forwards RES_FLYFRMFMT. @param pool - Actual document pool. @param name - Name. @param parent - Actual parent. @returns Format. */
  constructor(pool: SwAttrPool, name: string, parent: SwFrameFormat | undefined) {
    super(pool, name, parent, RES_FLYFRMFMT);
  }
}
