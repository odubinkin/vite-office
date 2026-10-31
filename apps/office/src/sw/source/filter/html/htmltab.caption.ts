/** @fileoverview Original caption save owner from htmltab.cxx retains actual cursor, section boundaries, attribute heads and numbering. Full caption/table token orchestration remains with its native consumer. */
import type { SwHTMLParser } from "./swhtml";
import { SectionSaveStruct } from "./htmltab.save";
import { HTMLAttrTable } from "./swhtml.attr";
import { SwHTMLNumRuleInfo } from "./htmlnum";
import type { SwPosition } from "../../core/crsr/pam";
/** Original caption snapshot owns one copied cursor and saved heads, while numbering borrows its document-owned rule. */
export class CaptionSaveStruct extends SectionSaveStruct {
  private readonly m_aSavePos: SwPosition;
  private readonly m_aNumRuleInfo = new SwHTMLNumRuleInfo();
  readonly m_xAttrTab = new HTMLAttrTable();
  /** Freezes actual section bounds before saving attributes and suspending current numbering. @param parser - Actual importer. @param position - Original position copied by value. @returns Caption save owner. */
  constructor(parser: SwHTMLParser, position: SwPosition) {
    super(parser);
    this.m_aSavePos = position.clone();
    parser.SaveAttrTab(this.m_xAttrTab);
    this.m_aNumRuleInfo.Set(parser.GetNumInfo());
    parser.GetNumInfo().Clear();
  }
  /** Borrows the tracked saved position without moving the live cursor. @returns Native saved position. */
  GetPos(): SwPosition {
    return this.m_aSavePos;
  }
  /** Original ordered restoration assumes the caller closed caption-local contexts first. It does not move the live cursor; BuildTableCaption performs that separate source step. @param parser - Same importer. @returns Nothing. */
  RestoreAll(parser: SwHTMLParser): void {
    this.Restore(parser);
    parser.RestoreAttrTab(this.m_xAttrTab);
    parser.GetNumInfo().Set(this.m_aNumRuleInfo);
  }
  /** Original save-owner destruction releases the copied position, without deleting borrowed attribute/context/number-rule owners. @returns Nothing. */
  SourceDispose(): void {
    this.m_aSavePos.Dispose();
  }
}
