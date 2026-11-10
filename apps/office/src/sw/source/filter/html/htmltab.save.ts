/** @fileoverview Original SectionSaveStruct from htmltab.cxx freezes the actual parser font/context stacks across table sections. */
import type { SwHTMLParser } from "./swhtml";
import type { HTMLTable } from "./htmltab";
import { HtmlTokenId as T } from "../../../../svtools/inc/htmltokn";
/** Native section save value borrows parser stack boundaries and retains the optional original nested-table reference. It owns no replacement stack or parser. */
export class SectionSaveStruct {
  m_xTable: HTMLTable | null = null;
  private readonly m_nBaseFontStMinSave: number;
  private readonly m_nFontStMinSave: number;
  private readonly m_nFontStHeadStartSave: number;
  private readonly m_nDefListDeepSave: number;
  private readonly m_nContextStMinSave: number;
  private readonly m_nContextStAttrMinSave: number;
  /** Saves current bounds and freezes each actual stack at its current depth. @param parser - Native importer. @returns New native save value. */
  constructor(parser: SwHTMLParser) {
    this.m_nBaseFontStMinSave = parser.m_nBaseFontStMin & 0xffff;
    this.m_nFontStMinSave = parser.m_nFontStMin & 0xffff;
    this.m_nFontStHeadStartSave = parser.m_nFontStHeadStart & 0xffff;
    this.m_nDefListDeepSave = parser.m_nDefListDeep & 0xffff;
    this.m_nContextStMinSave = parser.m_nContextStMin;
    this.m_nContextStAttrMinSave = parser.m_nContextStAttrMin;
    parser.m_nBaseFontStMin = parser.m_aBaseFontStack.length & 0xffff;
    parser.m_nFontStMin = parser.m_aFontStack.length & 0xffff;
    parser.m_nContextStMin = parser.m_aContexts.length;
    parser.m_nContextStAttrMin = parser.m_nContextStMin;
    parser.m_nDefListDeep = 0;
  }
  /** Original debug-query value used by cell attribute diagnostics. @returns Previous attribute-context lower bound. */
  GetContextStAttrMin(): number {
    return this.m_nContextStAttrMinSave;
  }
  /** Truncates only section-local font entries and restores original counters. The caller has already cleaned local contexts, as in upstream; Restore does not pop them or invalidate deferred paragraph attributes. @param parser - Same native importer. @returns Nothing. */
  Restore(parser: SwHTMLParser): void {
    if (parser.m_aBaseFontStack.length > parser.m_nBaseFontStMin)
      parser.m_aBaseFontStack.splice(parser.m_nBaseFontStMin);
    parser.m_nBaseFontStMin = this.m_nBaseFontStMinSave;
    if (parser.m_aFontStack.length > parser.m_nFontStMin)
      parser.m_aFontStack.splice(parser.m_nFontStMin);
    parser.m_nFontStMin = this.m_nFontStMinSave;
    parser.m_nFontStHeadStart = this.m_nFontStHeadStartSave;
    parser.m_nContextStMin = this.m_nContextStMinSave;
    parser.m_nContextStAttrMin = this.m_nContextStAttrMinSave;
    parser.m_nDefListDeep = this.m_nDefListDeepSave;
    parser.m_bNoParSpace = false;
    parser.m_nOpenParaToken = T.NONE;
    parser.m_aParaAttrs.length = 0;
  }
}
