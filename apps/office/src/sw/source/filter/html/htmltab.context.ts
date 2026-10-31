/** @fileoverview Original HTMLTableContext numbering, cursor ownership and PRE/Listing/XMP suspension from htmltab.cxx. */
import { SwHTMLNumRuleInfo } from "./htmlnum";
import { HTMLAttrTable } from "./swhtml.attr";
import type { SwHTMLParser } from "./swhtml";
import type { SwPosition } from "../../core/crsr/pam";
import type { SwTableNode } from "../../core/docnode/node";
import type { SwFrameFormat } from "../../core/layout/atrfrm";
/** Native table context owns its position and numbering snapshot and borrows real table/frame owners. */
export class HTMLTableContext {
  private readonly m_aNumRuleInfo = new SwHTMLNumRuleInfo();
  private m_pTableNd: SwTableNode | null = null;
  private m_pFrameFormat: SwFrameFormat | null = null;
  private m_bRestartPRE = false;
  private m_bRestartXMP = false;
  private m_bRestartListing = false;
  readonly m_xAttrTab = new HTMLAttrTable();
  /** Original context takes the owned position and stack bounds. @param m_pPos - Owned cursor position. @param m_nContextStMin - Context lower bound. @param m_nContextStAttrMin - Attribute lower bound. @returns Context. */
  constructor(
    private readonly m_pPos: SwPosition | null,
    private readonly m_nContextStMin: number,
    private readonly m_nContextStAttrMin: number,
  ) {}
  /** Releases the uniquely owned cursor position. @returns Nothing. */
  SourceDispose(): void {
    this.m_pPos?.Dispose();
  }
  /** Original numbering copy. @param value - Source snapshot. @returns Nothing. */
  SetNumInfo(value: SwHTMLNumRuleInfo): void {
    this.m_aNumRuleInfo.Set(value);
  }
  /** Original numbering borrow. @returns State. */
  GetNumInfo(): SwHTMLNumRuleInfo {
    return this.m_aNumRuleInfo;
  }
  /** Original position borrow. @returns Actual position or null. */
  GetPos(): SwPosition | null {
    return this.m_pPos;
  }
  /** Original table node assignment. @param value - Borrowed table node. @returns Nothing. */
  SetTableNode(value: SwTableNode | null): void {
    this.m_pTableNd = value;
  }
  /** Original table node borrow. @returns Actual node. */
  GetTableNode(): SwTableNode | null {
    return this.m_pTableNd;
  }
  /** Original containing frame assignment. @param value - Borrowed frame. @returns Nothing. */
  SetFrameFormat(value: SwFrameFormat | null): void {
    this.m_pFrameFormat = value;
  }
  /** Original containing frame borrow. @returns Actual frame. */
  GetFrameFormat(): SwFrameFormat | null {
    return this.m_pFrameFormat;
  }
  /** Original context lower bound. @returns Index. */
  GetContextStMin(): number {
    return this.m_nContextStMin;
  }
  /** Original attribute lower bound. @returns Index. */
  GetContextStAttrMin(): number {
    return this.m_nContextStAttrMin;
  }
  /** Original independent legacy-mode snapshot followed by suspension. @param parser - Actual importer. @returns Nothing. */
  SavePREListingXMP(parser: SwHTMLParser): void {
    this.m_bRestartPRE = parser.IsReadPRE();
    this.m_bRestartXMP = parser.IsReadXMP();
    this.m_bRestartListing = parser.IsReadListing();
    parser.FinishPREListingXMP();
  }
  /** Original clear followed by ordered restart of all captured flags. @param parser - Actual importer. @returns Nothing. */
  RestorePREListingXMP(parser: SwHTMLParser): void {
    parser.FinishPREListingXMP();
    if (this.m_bRestartPRE) parser.StartPRE();
    if (this.m_bRestartXMP) parser.StartXMP();
    if (this.m_bRestartListing) parser.StartListing();
  }
}
