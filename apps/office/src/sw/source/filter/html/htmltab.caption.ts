/** @fileoverview Original caption save owner from htmltab.cxx retains actual cursor, section boundaries, attribute heads and numbering. Full caption/table token orchestration remains with its native consumer. */
import type { HTMLTable } from "./htmltab";
import { HtmlTokenId as T, HtmlOptionId as O } from "../../../../svtools/inc/htmltokn";
import { htmlAsciiLower } from "../../../../svtools/source/svhtml/htmlkywd";
import { InsertTempTableCaptionSection, InsertTableSection } from "./htmltab.sections";
import { HTMLAttrContext, SwHTMLAppendMode as M } from "./htmlctxt";
import { SvxAdjustItem } from "../../../../editeng/inc/adjustitem";
import { SvxAdjust as A } from "../../../../editeng/inc/svxenum";
import { RES_PARATR_ADJUST } from "../../../inc/hintids";
import { SwPoolFormatId as P } from "../../../inc/poolfmt";
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

/** Original caption initialization block of BuildTableCaption uses the actual current table owner. Recursive token reading is kept outside this lifecycle responsibility. @param parser - Actual importer with a live current table. @param current - Table receiving the caption. @returns Owned native save or null on source overflow. */
export function BeginTableCaption(
  parser: SwHTMLParser,
  current: HTMLTable,
): CaptionSaveStruct | null {
  const outer = parser.m_xTable;
  if (!outer) throw new Error("assert(current native table)");
  if (outer.IsOverflowing()) {
    parser.SaveState(T.NONE);
    return null;
  }
  let top = true;
  const options = parser.GetOptions();
  for (let i = options.length; i;) {
    const option = options[--i];
    if (option?.GetToken() === O.ALIGN && htmlAsciiLower(option.GetString()) === "bottom")
      top = false;
  }
  const saved = new CaptionSaveStruct(parser, parser.m_pPam.GetPoint());
  const section =
    outer === current
      ? InsertTempTableCaptionSection(parser)
      : InsertTableSection(parser, outer, P.COLL_TEXT);
  if (!section) throw new Error("assert(caption section)");
  const context = new HTMLAttrContext(T.CAPTION_ON),
    item = new SvxAdjustItem(A.Center, RES_PARATR_ADJUST);
  try {
    parser.InsertAttr(parser.m_xAttrTab.pAdjust, item, context);
  } finally {
    item.Dispose();
  }
  parser.PushContext(context);
  current.SetCaption(section, top);
  parser.SaveState(T.NONE);
  return saved;
}
/** Original BuildTableCaption finalization closes local contexts, normalizes trailing paragraphs, applies actual deferred attributes, restores source stacks/numbering and finally restores the saved point value. Save-owner destruction remains the caller's responsibility. @param parser - Actual importer. @param current - Caption table. @param saved - Original same-entry save. @returns Nothing. */
export function EndTableCaption(
  parser: SwHTMLParser,
  current: HTMLTable,
  saved: CaptionSaveStruct,
): void {
  while (parser.m_aContexts.length > parser.m_nContextStAttrMin + 1) {
    const context = parser.PopContext();
    if (!context) throw new Error("assert(caption local context)");
    parser.EndContext(context);
  }
  const stripped = parser.StripTrailingLF() > 0;
  if (parser.m_xTable === current) {
    if (parser.m_pPam.GetPoint().GetContentIndex() || stripped) parser.AppendTextNode(M.AM_NOSPACE);
  } else if (!parser.m_pPam.GetPoint().GetContentIndex() && !stripped)
    parser.StripTrailingPara(parser.m_xTable);
  const context = parser.PopContext();
  if (context) parser.EndContext(context);
  parser.SetAttr(false);
  saved.RestoreAll(parser);
  const point = saved.GetPos();
  parser.m_pPam.GetPoint().Assign(point.GetNode(), point.GetContentIndex());
}
