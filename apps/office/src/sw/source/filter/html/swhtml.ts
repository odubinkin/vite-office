/** @fileoverview Consumed native SwHTMLParser body, paragraph and inline-attribute paths over HTMLParser, actual SwPaM and deferred HTMLAttr owners. */
import { HTMLParser } from "../../../../svtools/source/svhtml/parhtml";
import { HtmlTokenId as T, HtmlOptionId as O } from "../../../../svtools/inc/htmltokn";
import { SvParserState } from "../../../../svtools/inc/svparser";
import type { SvStream } from "../../../../tools/source/stream/stream";
import type { SwDoc } from "../../core/doc/doc";
import { SwPaM, SwPosition } from "../../core/crsr/pam";
import { SwTextNode } from "../../core/txtnode/ndtxt";
import { setTextFormatCollAtNode } from "../../core/doc/docfmt";
import {
  HTMLAttr,
  HTMLAttrTable,
  NewAttr,
  EndAttr,
  lcl_swhtml_getItemInfo,
  type HTMLAttrHead,
} from "./swhtml.attr";
import { SetAttr_ } from "./swhtml.setattr";
import { HTMLAttrContext, SwHTMLAppendMode as A } from "./htmlctxt";
import { SwHTMLNumRuleInfo } from "./htmlnum";
import { BreakIteratorImpl } from "../../../../i18npool/source/breakiterator/breakiteratorImpl";
import type { SfxPoolItem } from "../../../../svl/source/items/poolitem";
import { SvxWeightItem } from "../../../../editeng/inc/wghtitem";
import { SvxPostureItem } from "../../../../editeng/inc/postitem";
import { SvxCrossedOutItem } from "../../../../editeng/inc/crossedoutitem";
import { SvxUnderlineItem } from "../../../../editeng/inc/udlnitem";
import {
  SvxEscapementItem,
  DFLT_ESC_SUPER,
  DFLT_ESC_SUB,
} from "../../../../editeng/inc/escapementitem";
import { SvxULSpaceItem } from "../../../../editeng/inc/ulspitem";
import { SvxAdjustItem } from "../../../../editeng/inc/adjustitem";
import { SvxAdjust } from "../../../../editeng/inc/svxenum";
import {
  FontWeight,
  FontItalic,
  FontStrikeout,
  FontLineStyle,
} from "../../../../tools/inc/fontenum";
import * as H from "../../../inc/hintids";
import { SwPoolFormatId, WRITER_PARAGRAPH_STYLE_POOL } from "../../../inc/poolfmt";
import { SwCSS1Parser } from "./htmlcss1";
import { SvxCSS1PropertyInfo } from "./svxcss1.types";
import { SfxItemSet } from "../../../../svl/source/items/itemset";
import { SvxFontHeightItem } from "../../../../editeng/inc/fhgtitem";
import { SwFormatCharFormat } from "../../core/txtnode/fmtatr2";
const HTML_PARSPACE = Math.round((5 * 1440) / 25.4);
/** Native synchronous body insertion owner. Unrepresented form/graphic/field producers do not have alternate model adapters here. */
export class SwHTMLParser extends HTMLParser {
  readonly m_xAttrTab = new HTMLAttrTable();
  readonly m_aParaAttrs: HTMLAttr[] = [];
  readonly m_aSetAttrTab: HTMLAttr[] = [];
  readonly m_aContexts: HTMLAttrContext[] = [];
  readonly m_pCSS1Parser: SwCSS1Parser;
  private readonly m_pNumRuleInfo = new SwHTMLNumRuleInfo();
  private readonly breakIterator = new BreakIteratorImpl();
  private m_nOpenParaToken = T.NONE;
  private m_bNoParSpace = false;
  private m_bDocInitialized = false;
  private m_bInTitle = false;
  private readonly m_bOldIsHTMLMode: boolean;
  /** Borrows the original existing document/cursor, clearing its mark as the native constructor does. @param m_xDoc - Actual document. @param m_pPam - Actual cursor. @param input - Native stream. @param m_aPathToFile - Source path. @param m_sBaseURL - Source base URL. @param newDoc - Native new-document flag. @returns Parser. */
  constructor(
    readonly m_xDoc: SwDoc,
    readonly m_pPam: SwPaM,
    input: SvStream,
    readonly m_aPathToFile = "",
    readonly m_sBaseURL = "",
    newDoc = false,
  ) {
    super(input, newDoc);
    // Office.Common/Filter/HTML/Import/FontSize defaults, in native twips.
    this.m_pCSS1Parser = new SwCSS1Parser(
      m_xDoc,
      this,
      [140, 200, 240, 280, 360, 480, 720],
      m_sBaseURL,
      newDoc,
    );
    m_pPam.DeleteMark();
    this.m_bOldIsHTMLMode = m_xDoc.GetDocumentSettingManager().get("HTML_MODE");
    m_xDoc.GetDocumentSettingManager().set("HTML_MODE", true);
  }
  /** Native current numbering state. @returns Actual owner. */
  GetNumInfo(): SwHTMLNumRuleInfo {
    return this.m_pNumRuleInfo;
  }
  /** Binds synchronous completion to original context/attribute finalization. @returns Original parser result. */
  override CallParser(): SvParserState {
    const result = super.CallParser();
    if (result === SvParserState.Accepted) {
      while (this.m_aContexts.length) {
        const context = this.PopContext();
        if (context) this.EndContext(context);
      }
      this.SetAttr(false);
      // Consumed Markdown insertion ends at a body/cell section's EOF. Preserve the
      // native empty-tail removal without introducing a standalone HTML file reader.
      const node = this.GetTextNode();
      if (
        !this.bNewDoc &&
        !node.Len() &&
        !this.m_xDoc.GetIDocumentMarkAccess().FindMarkAtPosition(this.m_pPam.GetPoint())
      ) {
        const nodes = node.GetNodes(),
          next = nodes.at(node.GetIndex() + 1);
        const count = nodes.entries().filter(
          /** Counts real text owners in this same section. @param candidate - Node. @returns Same section text. */
          (candidate) =>
            candidate instanceof SwTextNode &&
            candidate.StartOfSectionNode() === node.StartOfSectionNode(),
        ).length;
        if (!(next instanceof SwTextNode) && count > 1) nodes.removeTextNode(node);
      }
    }
    return result;
  }
  /** Releases remaining native node-index/item owners after success or failure, without deleting borrowed document/cursor. @returns Nothing. */
  SourceDispose(): void {
    this.m_pCSS1Parser.SourceDispose();
    this.m_xDoc.GetDocumentSettingManager().set("HTML_MODE", this.m_bOldIsHTMLMode);
    const seen = new Set<HTMLAttr>();
    const release =
      /** Releases shared borrowed chains exactly once at parser destruction. @param attr - Chain root. @returns Nothing. */ (
        attr: HTMLAttr | null,
      ): void => {
        if (!attr || seen.has(attr)) return;
        seen.add(attr);
        release(attr.GetNext());
        release(attr.GetPrev());
        attr.SourceDispose();
      };
    for (const head of Object.values(this.m_xAttrTab)) {
      release(head[0]);
      head[0] = null;
    }
    for (const attr of this.m_aSetAttrTab) release(attr);
    this.m_aSetAttrTab.length = this.m_aParaAttrs.length = this.m_aContexts.length = 0;
  }
  /** Reads the represented original content node. @returns Actual text owner. */
  private GetTextNode(): SwTextNode {
    const node = this.m_pPam.GetPoint().GetNode();
    if (!(node instanceof SwTextNode)) throw new Error("assert(SwTextNode)");
    return node;
  }
  /** Native current-context push. @param context - New native context. @returns Nothing. */
  PushContext(context: HTMLAttrContext): void {
    this.m_aContexts.push(context);
  }
  /** Original token search removes only the matching context, leaving intervening inline contexts open. @param token - Opening token or NONE for top. @returns Removed context or null. */
  PopContext(token = T.NONE): HTMLAttrContext | null {
    let position = this.m_aContexts.length;
    if (!position) return null;
    if (token === T.NONE) --position;
    else {
      let found = false;
      while (position) {
        const current = this.m_aContexts[--position];
        if (current?.GetToken() === token) {
          found = true;
          break;
        }
        if (current?.GetToken() === T.NONE) break;
      }
      if (!found) return null;
    }
    return this.m_aContexts.splice(position, 1)[0] ?? null;
  }
  /** Native deferred item insertion. @param head - Stable attribute-table slot. @param item - Borrowed item. @param context - Actual new context. @returns Nothing. */
  InsertAttr(head: HTMLAttrHead, item: SfxPoolItem, context: HTMLAttrContext): void {
    if (NewAttr(this, this.m_xAttrTab, head, item) && head[0]) context.GetAttrs().push(head[0]);
  }
  /** Original context attribute close order. @param context - Removed context. @returns Nothing. */
  EndContextAttrs(context: HTMLAttrContext): void {
    for (const attr of context.GetAttrs()) EndAttr(this, attr, true, this.breakIterator);
    context.GetAttrs().length = 0;
  }
  /** Ends represented context attributes and its source append mode. @param context - Removed native owner. @returns Nothing. */
  EndContext(context: HTMLAttrContext): void {
    if (context.GetPopStack())
      while (this.m_aContexts.length) {
        const inner = this.PopContext();
        if (inner) this.EndContext(inner);
      }
    this.EndContextAttrs(context);
    if (context.GetAppendMode() !== A.AM_NONE && this.m_pPam.GetPoint().GetContentIndex())
      this.AppendTextNode(context.GetAppendMode());
  }
  /** Original end-token normalization. @param token - Closing token. @returns Nothing. */
  EndTag(token: T): void {
    const context = this.PopContext((token & ~1) as T);
    if (context) this.EndContext(context);
  }
  /** Opens original standard attributes across all supplied script heads. @param token - Native opening token. @param items - Borrowed head/item pairs. @returns Nothing. */
  NewStdAttr(token: T, items: readonly (readonly [HTMLAttrHead, SfxPoolItem])[] = []): void {
    const context = new HTMLAttrContext(token);
    try {
      const style = this.GetStyleOption(O.STYLE);
      if (style) {
        const set = new SfxItemSet(this.m_xDoc.GetAttrPool(), this.m_pCSS1Parser.GetWhichMap());
        try {
          for (const [, item] of items) set.Put(item);
          const info = new SvxCSS1PropertyInfo();
          this.m_pCSS1Parser.ParseStyleOption(style, set, info);
          this.InsertAttrs(set, info, context);
        } finally {
          set.Dispose();
        }
      } else for (const [head, item] of items) this.InsertAttr(head, item, context);
    } finally {
      for (const [, item] of items) item.Dispose();
    }
    this.PushContext(context);
  }
  /** Reads duplicate HTML options in original reverse order. @param id - Native option. @returns First source occurrence. */
  private GetStyleOption(id: O): string {
    let result = "";
    for (const option of [...this.GetOptions()].reverse())
      if (option.GetToken() === id) result = option.GetString();
    return result;
  }
  /** Consumed native InsertAttrs paths; percentage heights are deliberately not applied. @param items - Native declarations. @param info - Native property flags. @param context - Actual attribute context. @returns Nothing. */
  InsertAttrs(items: SfxItemSet, info: SvxCSS1PropertyInfo, context: HTMLAttrContext): void {
    void info;
    const tab = this.m_xAttrTab;
    const heads = new Map<number, HTMLAttrHead>([
      [H.RES_CHRATR_WEIGHT, tab.pBold],
      [H.RES_CHRATR_CJK_WEIGHT, tab.pBoldCJK],
      [H.RES_CHRATR_CTL_WEIGHT, tab.pBoldCTL],
      [H.RES_CHRATR_POSTURE, tab.pItalic],
      [H.RES_CHRATR_CJK_POSTURE, tab.pItalicCJK],
      [H.RES_CHRATR_CTL_POSTURE, tab.pItalicCTL],
      [H.RES_CHRATR_FONTSIZE, tab.pFontHeight],
      [H.RES_CHRATR_CJK_FONTSIZE, tab.pFontHeightCJK],
      [H.RES_CHRATR_CTL_FONTSIZE, tab.pFontHeightCTL],
      [H.RES_CHRATR_UNDERLINE, tab.pUnderline],
      [H.RES_CHRATR_COLOR, tab.pFontColor],
      [H.RES_CHRATR_CROSSEDOUT, tab.pStrike],
      [H.RES_PARATR_ADJUST, tab.pAdjust],
    ]);
    for (const item of items.entries()) {
      if (item instanceof SvxFontHeightItem && item.GetProp() !== 100) continue;
      const head = heads.get(item.Which());
      if (head) this.InsertAttr(head, item, context);
    }
  }
  /** Native semantic tags retain a separate character-format stack beneath direct CSS attributes. @param token - Native opening token. @returns Nothing. */
  NewCharFormat(token: T): void {
    const context = new HTMLAttrContext(token);
    const format = this.m_pCSS1Parser.GetChrFormat(token, this.GetStyleOption(O.CLASS));
    const style = this.GetStyleOption(O.STYLE);
    if (style) {
      const items = new SfxItemSet(this.m_xDoc.GetAttrPool(), this.m_pCSS1Parser.GetWhichMap());
      try {
        const info = new SvxCSS1PropertyInfo();
        this.m_pCSS1Parser.ParseStyleOption(style, items, info);
        this.InsertAttrs(items, info, context);
      } finally {
        items.Dispose();
      }
    }
    if (format) {
      const item = new SwFormatCharFormat(format);
      try {
        this.InsertAttr(this.m_xAttrTab.pCharFormats, item, context);
      } finally {
        item.Dispose();
      }
    }
    this.PushContext(context);
  }
  /** Original pending-list flush. @param checkEnd - Native early-end selector. @param beforeTable - Table boundary selector. @returns Nothing. */
  SetAttr(checkEnd = true, beforeTable = false): void {
    SetAttr_(this, checkEnd, beforeTable);
  }
  /** Original paragraph style selection over the consumed context pool IDs. @returns Nothing. */
  SetTextCollAttrs(): void {
    let pool = SwPoolFormatId.COLL_TEXT as number;
    for (const context of this.m_aContexts)
      if (context.GetTextFormatColl()) pool = context.GetTextFormatColl();
    const entry = WRITER_PARAGRAPH_STYLE_POOL.find(
      /** Matches original pool identity. @param value - Native pool metadata. @returns Identity match. */ (
        value,
      ) => value.poolId === pool,
    );
    if (!entry) throw new Error("HTML paragraph pool identity is not represented.");
    setTextFormatCollAtNode(this.GetTextNode(), this.m_xDoc.GetTextFormatColl(entry.id), false);
  }
  /** Removes at most two trailing hard linefeeds through the real content owner. @returns Removed count. */
  StripTrailingLF(): number {
    const node = this.GetTextNode(),
      end = this.m_pPam.GetPoint().GetContentIndex();
    let count = 0;
    while (count < end && node.GetText()[end - count - 1] === "\n") ++count;
    count = Math.min(2, count);
    if (count) node.EraseText(end - count, count);
    return count;
  }
  /** Original append spacing and open-character range splitting over native script services. @param mode - Source spacing mode. @returns Append result. */
  AppendTextNode(mode = A.AM_NORMAL): boolean {
    const stripped = this.StripTrailingLF();
    if ((mode === A.AM_NOSPACE || mode === A.AM_SOFTNOSPACE) && stripped > 1) mode = A.AM_SPACE;
    this.m_aParaAttrs.length = 0;
    const node = this.GetTextNode();
    if (mode === A.AM_SPACE || mode === A.AM_NOSPACE) {
      const space = node.GetAttr(H.RES_UL_SPACE) as SvxULSpaceItem,
        noSpace = mode === A.AM_NOSPACE;
      if (noSpace ? space.GetLower() > 0 : space.GetLower() === 0) {
        const inherited = node.GetTextFormatColl().GetULSpace();
        if (
          (noSpace ? inherited.GetLower() === 0 : inherited.GetLower() > 0) &&
          inherited.GetUpper() === space.GetUpper()
        )
          node.ResetAttr(H.RES_UL_SPACE);
        else
          node.SetAttr(
            new SvxULSpaceItem(space.GetUpper(), noSpace ? 0 : HTML_PARSPACE, H.RES_UL_SPACE),
          );
      }
    }
    this.m_bNoParSpace = mode === A.AM_NOSPACE || mode === A.AM_SOFTNOSPACE;
    const old = new SwPosition(node, this.m_pPam.GetPoint().GetContentIndex());
    try {
      const result = this.m_xDoc
        .GetDocumentContentOperationsManager()
        .AppendTextNode(this.m_pPam.GetPoint());
      for (const head of Object.values(this.m_xAttrTab)) {
        let attr = head[0];
        let whole = false;
        if (!attr || attr.GetItem().Which() >= H.RES_PARATR_BEGIN) continue;
        while (attr) {
          const next = attr.GetNext();
          if (
            attr.GetStartParagraphIdx() < old.GetNodeIndex() ||
            (!whole &&
              attr.GetStartParagraphIdx() === old.GetNodeIndex() &&
              attr.GetStartContent() !== old.GetContentIndex())
          ) {
            whole =
              attr.GetStartParagraphIdx() === old.GetNodeIndex() && attr.GetStartContent() === 0;
            let start = attr.GetStartContent(),
              insert = true;
            const [dependent, script] = lcl_swhtml_getItemInfo(attr),
              startNode = attr.GetStartParagraph().GetNode();
            const enqueue =
              /** Retains native outer-chain versus whole-paragraph pending-list precedence. @param pending - Actual clone/chain. @returns Nothing. */ (
                pending: HTMLAttr,
              ): void => {
                if (next && !whole) next.InsertPrev(pending);
                else if (pending.m_bInsAtStart) this.m_aSetAttrTab.unshift(pending);
                else this.m_aSetAttrTab.push(pending);
              };
            if (dependent && startNode instanceof SwTextNode) {
              const text = startNode.GetText(),
                units = new Uint16Array(text.length);
              for (let i = 0; i < text.length; ++i) units[i] = text.charCodeAt(i);
              let actual = this.breakIterator.getScriptType(units, start),
                end = this.breakIterator.endOfScript(units, start, actual);
              while (end < old.GetContentIndex() && end !== -1) {
                if (script === actual) {
                  const pending = attr.Clone(old.GetNode(), end);
                  pending.m_nStartContent = start;
                  pending.ClearPrev();
                  enqueue(pending);
                }
                start = end;
                actual = this.breakIterator.getScriptType(units, start);
                end = this.breakIterator.endOfScript(units, start, actual);
              }
              insert = script === actual;
            }
            if (insert) {
              const pending = attr.Clone(old.GetNode(), old.GetContentIndex());
              pending.m_nStartContent = start;
              enqueue(pending);
            } else {
              const previous = attr.GetPrev();
              if (previous) enqueue(previous);
            }
            attr.ClearPrev();
          }
          attr.SetStart(this.m_pPam.GetPoint());
          attr = next;
        }
      }
      if (!this.GetNumInfo().GetDepth()) this.GetTextNode().ResetAttr(H.RES_PARATR_NUMRULE);
      this.SetAttr();
      return result;
    } finally {
      old.Dispose();
    }
  }
  /** Original remembered no-space paragraph restoration. @returns Nothing. */
  AddParSpace(): void {
    if (!this.m_bNoParSpace) return;
    this.m_bNoParSpace = false;
    const node = this.m_xDoc.GetNodes().at(this.GetTextNode().GetIndex() - 1);
    if (!(node instanceof SwTextNode)) return;
    const space = node.GetAttr(H.RES_UL_SPACE) as SvxULSpaceItem;
    if (space.GetLower()) return;
    const inherited = node.GetTextFormatColl().GetULSpace();
    if (inherited.GetLower() && inherited.GetUpper() === space.GetUpper())
      node.ResetAttr(H.RES_UL_SPACE);
    else node.SetAttr(new SvxULSpaceItem(space.GetUpper(), HTML_PARSPACE, H.RES_UL_SPACE));
  }
  /** Opens the native P context, retaining reverse option precedence. @returns Nothing. */
  NewPara(): void {
    if (this.m_pPam.GetPoint().GetContentIndex()) this.AppendTextNode(A.AM_SPACE);
    else this.AddParSpace();
    const context = new HTMLAttrContext(T.PARABREAK_ON);
    this.InsertAlignment(context);
    this.PushContext(context);
    this.SetTextCollAttrs();
    this.m_nOpenParaToken = T.PARABREAK_ON;
  }
  /** Original paragraph close skips empty HTML paragraphs. @param real - Explicit closing tag selector. @returns Nothing. */
  EndPara(real = false): void {
    if (real) {
      if (this.m_pPam.GetPoint().GetContentIndex()) this.AppendTextNode(A.AM_SPACE);
      else this.AddParSpace();
    }
    const context = this.PopContext(
      this.m_nOpenParaToken !== T.NONE ? this.m_nOpenParaToken : T.PARABREAK_ON,
    );
    if (context) {
      this.EndContext(context);
      this.SetAttr();
    }
    if (real) this.SetTextCollAttrs();
    this.m_nOpenParaToken = T.NONE;
    this.SetPreserveSpaces(false);
  }
  /** Native heading open and pool-ID selection. @param token - Original heading opening token. @returns Nothing. */
  NewHeading(token: T): void {
    if (this.m_pPam.GetPoint().GetContentIndex()) this.AppendTextNode(A.AM_SPACE);
    else this.AddParSpace();
    const context = new HTMLAttrContext(
      token,
      SwPoolFormatId.COLL_HEADLINE1 + (token - T.HEAD1_ON) / 2,
    );
    this.InsertAlignment(context);
    this.PushContext(context);
    this.SetTextCollAttrs();
  }
  /** Original heading close finds the last heading regardless of the closing level. @returns Nothing. */
  EndHeading(): void {
    if (this.m_pPam.GetPoint().GetContentIndex()) this.AppendTextNode(A.AM_SPACE);
    else this.AddParSpace();
    for (let index = this.m_aContexts.length; index;) {
      const context = this.m_aContexts[--index];
      if (
        context &&
        context.GetToken() >= T.HEAD1_ON &&
        context.GetToken() <= T.HEAD6_ON &&
        (context.GetToken() & 1) === 0
      ) {
        this.m_aContexts.splice(index, 1);
        this.EndContext(context);
        this.SetAttr();
        break;
      }
    }
    this.SetTextCollAttrs();
  }
  /** Original represented block-style transition. @param token - Opening token. @param pool - Native pool ID. @returns Nothing. */
  NewTextFormatColl(token: T, pool: number): void {
    const mode = token === T.ADDRESS_ON ? A.AM_NOSPACE : A.AM_SPACE;
    if (this.m_pPam.GetPoint().GetContentIndex()) this.AppendTextNode(mode);
    else if (mode === A.AM_SPACE) this.AddParSpace();
    this.PushContext(new HTMLAttrContext(token, pool));
    this.SetTextCollAttrs();
  }
  /** Original block close applies its append policy before ending context attributes. @param token - Original opening or closing token. @returns Nothing. */
  EndTextFormatColl(token: T): void {
    const opening = (token & ~1) as T,
      mode = opening === T.ADDRESS_ON ? A.AM_SOFTNOSPACE : A.AM_SPACE;
    if (this.m_pPam.GetPoint().GetContentIndex()) this.AppendTextNode(mode);
    else if (mode === A.AM_SPACE) this.AddParSpace();
    const context = this.PopContext(opening);
    if (context) {
      this.EndContext(context);
      this.SetAttr();
    }
    this.SetTextCollAttrs();
  }
  /** Native ALIGN option values and reverse duplicate-option iteration. @param context - New block context. @param initial - Native default. @returns Nothing. */
  private InsertAlignment(context: HTMLAttrContext, initial = SvxAdjust.End): void {
    let alignment = initial;
    for (const option of [...this.GetOptions()].reverse()) {
      if (option.GetToken() === O.ALIGN) {
        const value = option.GetString().toLowerCase();
        alignment =
          value === "left"
            ? SvxAdjust.Left
            : value === "right"
              ? SvxAdjust.Right
              : value === "center"
                ? SvxAdjust.Center
                : value === "justify"
                  ? SvxAdjust.Block
                  : alignment;
      }
      if (option.GetToken() === O.XML_SPACE && option.GetString() === "preserve")
        this.SetPreserveSpaces(true);
    }
    if (alignment !== SvxAdjust.End) {
      const item = new SvxAdjustItem(alignment, H.RES_PARATR_ADJUST);
      try {
        this.InsertAttr(this.m_xAttrTab.pAdjust, item, context);
      } finally {
        item.Dispose();
      }
    }
  }
  /** Original represented body token dispatch; CSS/list/table producers extend this same native owner. @param token - Filtered native token. @returns Nothing. */
  protected override NextToken(token: T): void {
    const tab = this.m_xAttrTab;
    if (token === T.TITLE_ON) {
      this.m_bInTitle = true;
      return;
    }
    if (token === T.TITLE_OFF) {
      this.m_bInTitle = false;
      return;
    }
    if (this.m_bInTitle || this.bReadScript || this.bReadStyle) return;
    switch (token) {
      case T.TEXTTOKEN:
      case T.CDATA: {
        let text = this.aToken;
        if (text.startsWith(" ") && !this.bReadPRE && !this.GetPreserveSpaces()) {
          const offset = this.m_pPam.GetPoint().GetContentIndex(),
            previous = this.GetTextNode().GetText()[offset - 1];
          if (!offset || previous === " " || previous === "\n") text = text.slice(1);
        }
        if (text) {
          if (!this.m_bDocInitialized) {
            this.SetTextCollAttrs();
            this.m_bDocInitialized = true;
          }
          this.m_xDoc.GetDocumentContentOperationsManager().InsertString(this.m_pPam, text);
          this.m_aParaAttrs.length = 0;
          this.SetAttr();
        }
        break;
      }
      case T.NONBREAKSPACE:
        this.m_xDoc.GetDocumentContentOperationsManager().InsertString(this.m_pPam, "\u00a0");
        break;
      case T.SOFTHYPH:
        this.m_xDoc.GetDocumentContentOperationsManager().InsertString(this.m_pPam, "\u00ad");
        break;
      case T.TABCHAR:
        this.m_xDoc.GetDocumentContentOperationsManager().InsertString(this.m_pPam, "\t");
        break;
      case T.LINEBREAK:
        if (!this.bReadPRE) {
          this.m_xDoc.GetDocumentContentOperationsManager().InsertString(this.m_pPam, "\n");
          break;
        }
        if (this.m_pPam.GetPoint().GetContentIndex()) {
          this.AppendTextNode();
          this.SetTextCollAttrs();
        }
        break;
      case T.NEWPARA:
        if (token === T.NEWPARA || this.m_pPam.GetPoint().GetContentIndex()) {
          this.AppendTextNode();
          this.SetTextCollAttrs();
        }
        break;
      case T.PARABREAK_ON:
        if (this.m_nOpenParaToken !== T.NONE) this.EndPara();
        this.NewPara();
        break;
      case T.PARABREAK_OFF:
        this.EndPara(true);
        break;
      case T.DIVISION_ON:
      case T.CENTER_ON: {
        if (this.m_nOpenParaToken !== T.NONE) this.EndPara();
        if (this.m_pPam.GetPoint().GetContentIndex()) this.AppendTextNode(A.AM_NOSPACE);
        const context = new HTMLAttrContext(token);
        context.SetAppendMode(A.AM_NOSPACE);
        this.InsertAlignment(context, token === T.CENTER_ON ? SvxAdjust.Center : SvxAdjust.End);
        this.PushContext(context);
        break;
      }
      case T.DIVISION_OFF:
      case T.CENTER_OFF:
        if (this.m_nOpenParaToken !== T.NONE) this.EndPara();
        this.EndTag(token);
        this.SetAttr();
        this.SetTextCollAttrs();
        break;
      case T.HEAD1_ON:
      case T.HEAD2_ON:
      case T.HEAD3_ON:
      case T.HEAD4_ON:
      case T.HEAD5_ON:
      case T.HEAD6_ON:
        if (this.m_nOpenParaToken !== T.NONE) {
          if (this.bReadPRE) this.m_nOpenParaToken = T.NONE;
          else this.EndPara();
        }
        this.NewHeading(token);
        break;
      case T.HEAD1_OFF:
      case T.HEAD2_OFF:
      case T.HEAD3_OFF:
      case T.HEAD4_OFF:
      case T.HEAD5_OFF:
      case T.HEAD6_OFF:
        this.EndHeading();
        break;
      case T.BLOCKQUOTE_ON:
      case T.BLOCKQUOTE30_ON:
        if (this.m_nOpenParaToken !== T.NONE) this.EndPara();
        this.NewTextFormatColl(T.BLOCKQUOTE_ON, SwPoolFormatId.COLL_HTML_BLOCKQUOTE);
        break;
      case T.BLOCKQUOTE_OFF:
      case T.BLOCKQUOTE30_OFF:
        if (this.m_nOpenParaToken !== T.NONE) this.EndPara();
        this.EndTextFormatColl(T.BLOCKQUOTE_ON);
        break;
      case T.ADDRESS_ON:
        if (this.m_nOpenParaToken !== T.NONE) this.EndPara();
        this.NewTextFormatColl(token, SwPoolFormatId.COLL_SEND_ADDRESS);
        break;
      case T.ADDRESS_OFF:
        if (this.m_nOpenParaToken !== T.NONE) this.EndPara();
        this.EndTextFormatColl(token);
        break;
      case T.PREFORMTXT_ON:
      case T.LISTING_ON:
      case T.XMP_ON:
        if (this.m_nOpenParaToken !== T.NONE) this.EndPara();
        this.NewTextFormatColl(token, SwPoolFormatId.COLL_HTML_PRE);
        break;
      case T.PREFORMTXT_OFF:
        this.m_bNoParSpace = true;
        this.EndTextFormatColl(token);
        break;
      case T.LISTING_OFF:
      case T.XMP_OFF:
        this.EndTextFormatColl(token);
        break;
      case T.EMPHASIS_ON:
      case T.CITATION_ON:
      case T.STRONG_ON:
      case T.CODE_ON:
      case T.SAMPLE_ON:
      case T.KEYBOARD_ON:
      case T.VARIABLE_ON:
      case T.DEFINSTANCE_ON:
      case T.SHORTQUOTE_ON:
      case T.LANGUAGE_ON:
      case T.AUTHOR_ON:
      case T.PERSON_ON:
      case T.ACRONYM_ON:
      case T.ABBREVIATION_ON:
      case T.TELETYPE_ON:
        this.NewCharFormat(token);
        break;
      case T.EMPHASIS_OFF:
      case T.CITATION_OFF:
      case T.STRONG_OFF:
      case T.CODE_OFF:
      case T.SAMPLE_OFF:
      case T.KEYBOARD_OFF:
      case T.VARIABLE_OFF:
      case T.DEFINSTANCE_OFF:
      case T.SHORTQUOTE_OFF:
      case T.LANGUAGE_OFF:
      case T.AUTHOR_OFF:
      case T.PERSON_OFF:
      case T.ACRONYM_OFF:
      case T.ABBREVIATION_OFF:
      case T.TELETYPE_OFF:
        this.EndTag(token);
        break;
      case T.BOLD_ON:
        this.NewStdAttr(token, [
          [tab.pBold, new SvxWeightItem(FontWeight.WEIGHT_BOLD, H.RES_CHRATR_WEIGHT)],
          [tab.pBoldCJK, new SvxWeightItem(FontWeight.WEIGHT_BOLD, H.RES_CHRATR_CJK_WEIGHT)],
          [tab.pBoldCTL, new SvxWeightItem(FontWeight.WEIGHT_BOLD, H.RES_CHRATR_CTL_WEIGHT)],
        ]);
        break;
      case T.ITALIC_ON:
        this.NewStdAttr(token, [
          [tab.pItalic, new SvxPostureItem(FontItalic.ITALIC_NORMAL, H.RES_CHRATR_POSTURE)],
          [tab.pItalicCJK, new SvxPostureItem(FontItalic.ITALIC_NORMAL, H.RES_CHRATR_CJK_POSTURE)],
          [tab.pItalicCTL, new SvxPostureItem(FontItalic.ITALIC_NORMAL, H.RES_CHRATR_CTL_POSTURE)],
        ]);
        break;
      case T.STRIKE_ON:
      case T.STRIKETHROUGH_ON:
      case T.DELETEDTEXT_ON:
        this.NewStdAttr(T.STRIKE_ON, [
          [
            tab.pStrike,
            new SvxCrossedOutItem(FontStrikeout.STRIKEOUT_SINGLE, H.RES_CHRATR_CROSSEDOUT),
          ],
        ]);
        break;
      case T.UNDERLINE_ON:
      case T.INSERTEDTEXT_ON:
        this.NewStdAttr(T.UNDERLINE_ON, [
          [
            tab.pUnderline,
            new SvxUnderlineItem(FontLineStyle.LINESTYLE_SINGLE, H.RES_CHRATR_UNDERLINE),
          ],
        ]);
        break;
      case T.SUPERSCRIPT_ON:
      case T.SUBSCRIPT_ON:
        this.NewStdAttr(token, [
          [
            tab.pEscapement,
            new SvxEscapementItem(
              token === T.SUPERSCRIPT_ON ? DFLT_ESC_SUPER : DFLT_ESC_SUB,
              80,
              H.RES_CHRATR_ESCAPEMENT,
            ),
          ],
        ]);
        break;
      case T.SPAN_ON:
        this.NewStdAttr(token);
        break;
      case T.BOLD_OFF:
      case T.ITALIC_OFF:
      case T.STRIKE_OFF:
      case T.UNDERLINE_OFF:
      case T.SUPERSCRIPT_OFF:
      case T.SUBSCRIPT_OFF:
      case T.SPAN_OFF:
        this.EndTag(token);
        break;
      case T.INSERTEDTEXT_OFF:
        this.EndTag(T.UNDERLINE_OFF);
        break;
      case T.DELETEDTEXT_OFF:
      case T.STRIKETHROUGH_OFF:
        this.EndTag(T.STRIKE_OFF);
        break;
    }
  }
}
