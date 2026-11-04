/** @fileoverview Native SwFormatContent optional node-index ownership from fmtcntnt.hxx and atrfrm.cxx; no fly section or serialized pointer is fabricated. */
import { SfxPoolItem } from "../../svl/source/items/poolitem";
import type { SfxItemPool } from "../../svl/source/items/itempool";
import { SwNodeIndex } from "../source/core/crsr/pam";
import type { SwStartNode } from "../source/core/docnode/node";
import { RES_CNTNT } from "./hintids";
/** Original nonshareable content item owns an optional registered index, never the section itself. */
export class SwFormatContent extends SfxPoolItem {
  private m_oStartNode: SwNodeIndex | null = null;
  /** Original regular/copy construction always allocates an independent engaged index. @param source - Actual section start, source item or null default. @returns Item. */
  constructor(source: SwStartNode | SwFormatContent | null = null) {
    super(RES_CNTNT);
    this.setNonShareable();
    if (source instanceof SwFormatContent) {
      if (source.m_oStartNode) this.m_oStartNode = new SwNodeIndex(source.m_oStartNode);
    } else if (source) this.m_oStartNode = new SwNodeIndex(source);
  }
  /** Original borrowed optional-index query. @returns Actual registered index or null. */
  GetContentIdx(): SwNodeIndex | null {
    return this.m_oStartNode;
  }
  /** Original optional assignment reuses an engaged index, constructs an absent one, or destroys on reset. @param index - Borrowed original index or null. @returns Nothing. */
  SetNewContentIdx(index: SwNodeIndex | null): void {
    if (index) {
      if (this.m_oStartNode) this.m_oStartNode.Assign(index);
      else this.m_oStartNode = new SwNodeIndex(index);
    } else {
      this.m_oStartNode?.Dispose();
      this.m_oStartNode = null;
    }
  }
  /** Original optional SwNodeIndex value equality compares actual node identities. @param other - Actual item. @returns Native equality. */
  override equals(other: SfxPoolItem): boolean {
    return (
      other instanceof SwFormatContent &&
      this.Which() === other.Which() &&
      (this.m_oStartNode === null
        ? other.m_oStartNode === null
        : other.m_oStartNode !== null &&
          this.m_oStartNode.GetNode() === other.m_oStartNode.GetNode())
    );
  }
  /** Original copy clone owns a new registered index when engaged. @param pool - Unused source pool. @returns Actual copied item. */
  override Clone(pool?: SfxItemPool): SwFormatContent {
    void pool;
    return new SwFormatContent(this);
  }
  /** Original member destruction unlinks the owned index without deleting content nodes. @returns Nothing. */
  override Dispose(): void {
    this.m_oStartNode?.Dispose();
    this.m_oStartNode = null;
  }
}
