/** @fileoverview Native non-shareable SwFormatAnchor position/type/page/order state from fmtanchr.hxx and atrfrm.cxx. UNO frame-interface conversion and localized presentation remain unported. */
import { SfxPoolItem } from "../../svl/source/items/poolitem";
import type { SfxItemPool } from "../../svl/source/items/itempool";
import { RndStdIds } from "../../svx/inc/swframetypes";
import { RES_ANCHOR } from "./hintids";
import { SwPosition } from "../source/core/crsr/pam";
import { SwContentNode, SwStartNode, SwTableNode, type SwNode } from "../source/core/docnode/node";
/** Original anchor owns its optional copied position and is never shared by item pooling. */
export class SwFormatAnchor extends SfxPoolItem {
  private static s_nOrderCounter = 0;
  private m_oContentAnchor: SwPosition | null = null;
  private m_eAnchorId: RndStdIds;
  private m_nPageNumber: number;
  private m_nOrder: number;
  /** Original regular and copy construction each obtain a new unsigned32 order. @param typeOrSource - Actual anchor type or const source. @param page - Original uint16 page number, valid only for page anchors. @returns Item. */
  constructor(typeOrSource: RndStdIds | SwFormatAnchor = RndStdIds.FLY_AT_PAGE, page = 0) {
    super(RES_ANCHOR);
    this.setNonShareable();
    this.m_nOrder = SwFormatAnchor.NextOrder();
    if (typeOrSource instanceof SwFormatAnchor) {
      this.m_eAnchorId = typeOrSource.m_eAnchorId;
      this.m_nPageNumber = typeOrSource.m_nPageNumber;
      this.m_oContentAnchor = typeOrSource.m_oContentAnchor?.clone("anchor") ?? null;
    } else {
      this.m_eAnchorId = typeOrSource;
      this.m_nPageNumber = page & 65535;
      if (
        ![
          RndStdIds.FLY_AT_PARA,
          RndStdIds.FLY_AS_CHAR,
          RndStdIds.FLY_AT_PAGE,
          RndStdIds.FLY_AT_FLY,
          RndStdIds.FLY_AT_CHAR,
        ].includes(typeOrSource)
      )
        throw new Error("assert(valid native anchor type)");
      if (typeOrSource !== RndStdIds.FLY_AT_PAGE && this.m_nPageNumber !== 0)
        throw new Error("assert(only page anchors have a page number)");
    }
  }
  /** Original prefix-increment and uint32 order. @returns Native order. */
  private static NextOrder(): number {
    this.s_nOrderCounter = (this.s_nOrderCounter + 1) >>> 0;
    return this.s_nOrderCounter;
  }
  /** Original direct type query. @returns Native ID. */ GetAnchorId(): RndStdIds {
    return this.m_eAnchorId;
  }
  /** Original direct type write does not normalize the owned position. @param type - Native ID. @returns Nothing. */ SetType(
    type: RndStdIds,
  ): void {
    this.m_eAnchorId = type;
  }
  /** Original uint16 page query. @returns Page number. */ GetPageNum(): number {
    return this.m_nPageNumber;
  }
  /** Original uint16 page write. @param page - Native page. @returns Nothing. */ SetPageNum(
    page: number,
  ): void {
    this.m_nPageNumber = page & 65535;
  }
  /** Original native order query. @returns Order. */ GetOrder(): number {
    return this.m_nOrder;
  }
  /** Original borrowed optional position. @returns Actual anchor position or null. */ GetContentAnchor(): SwPosition | null {
    return this.m_oContentAnchor;
  }
  /** Original content-owner-first node query, retaining node-only paragraph/fly anchors. @returns Actual node or null. */
  GetAnchorNode(): SwNode | null {
    return this.m_oContentAnchor
      ? (this.m_oContentAnchor.nContent.GetContentNode() ?? this.m_oContentAnchor.GetNode())
      : null;
  }
  /** Original content-node query through the actual anchor node. @returns Real content node or null. */
  GetAnchorContentNode(): SwContentNode | null {
    const node = this.GetAnchorNode();
    return node instanceof SwContentNode ? node : null;
  }
  /** Original absent/unregistered offset is zero. @returns Native UTF16 offset. */
  GetAnchorContentOffset(): number {
    return this.m_oContentAnchor?.nContent.GetContentNode()
      ? this.m_oContentAnchor.GetContentIndex()
      : 0;
  }
  /** Original optional-position replacement and paragraph/fly content-index detachment. @param position - Real position or native null reset. @returns Nothing. */
  SetAnchor(position: SwPosition | null): void {
    if (!position) {
      this.m_oContentAnchor?.Dispose();
      this.m_oContentAnchor = null;
      return;
    }
    const node = position.GetNode();
    if (!(
      (this.m_eAnchorId === RndStdIds.FLY_AT_FLY && node instanceof SwStartNode) ||
      (this.m_eAnchorId === RndStdIds.FLY_AT_PARA && node instanceof SwTableNode) ||
      node.GetTextNode()
    ))
      throw new Error("assert(anchor requires native text/table/fly start)");
    const owner = position.nContent.GetContentNode();
    if (owner && owner !== node) throw new Error("assert(anchor node/content index agree)");
    this.m_oContentAnchor?.Dispose();
    this.m_oContentAnchor = null;
    const copy = position.clone("anchor");
    this.m_oContentAnchor = copy;
    if (this.m_eAnchorId === RndStdIds.FLY_AT_PARA || this.m_eAnchorId === RndStdIds.FLY_AT_FLY)
      copy.nContent.Assign(undefined, 0);
  }
  /** Original assignment ignores order for equality, and only a changed payload obtains new order/position ownership. @param source - Actual source item. @returns This item. */
  Assign(source: SwFormatAnchor): this {
    if (SfxPoolItem.areSame(this, source)) return this;
    this.m_eAnchorId = source.m_eAnchorId;
    this.m_nPageNumber = source.m_nPageNumber;
    this.m_nOrder = SwFormatAnchor.NextOrder();
    if (source.m_oContentAnchor) {
      if (this.m_oContentAnchor) this.m_oContentAnchor.Assign(source.m_oContentAnchor);
      else this.m_oContentAnchor = source.m_oContentAnchor.clone("anchor");
    } else {
      this.m_oContentAnchor?.Dispose();
      this.m_oContentAnchor = null;
    }
    return this;
  }
  /** Original equality compares type/page/optional position, deliberately excluding order. @param other - Compared native item. @returns Equal payload. */
  public override equals(other: SfxPoolItem): boolean {
    return (
      other instanceof SwFormatAnchor &&
      this.m_eAnchorId === other.m_eAnchorId &&
      this.m_nPageNumber === other.m_nPageNumber &&
      (this.m_oContentAnchor === null
        ? other.m_oContentAnchor === null
        : other.m_oContentAnchor !== null &&
          this.m_oContentAnchor.GetNode() === other.m_oContentAnchor.GetNode() &&
          this.m_oContentAnchor.GetContentIndex() === other.m_oContentAnchor.GetContentIndex())
    );
  }
  /** Original copy constructor clone, with its new order and non-shareable copied position. @param pool - Unused original pool. @returns Native item. */
  public override Clone(pool?: SfxItemPool): SwFormatAnchor {
    void pool;
    return new SwFormatAnchor(this);
  }
  /** Original optional-member destruction releases actual node/content registrations. @returns Nothing. */
  public override Dispose(): void {
    this.m_oContentAnchor?.Dispose();
    this.m_oContentAnchor = null;
  }
}
