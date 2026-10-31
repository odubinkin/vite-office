/** @fileoverview Consumed native SwHTMLParser body, paragraph and inline-attribute paths over HTMLParser, actual SwPaM and deferred HTMLAttr owners. */
import { CanRemoveNode, StripTrailingPara } from "./htmlgrin";
import { aHTMLPAlignTable } from "./swhtml.options";
import { HTMLParser } from "../../../../svtools/source/svhtml/parhtml";
import { HtmlTokenId as T, HtmlOptionId as O } from "../../../../svtools/inc/htmltokn";
import { SvParserState } from "../../../../svtools/inc/svparser";
import type { SvStream } from "../../../../tools/source/stream/stream";
import type { SwDoc } from "../../core/doc/doc";
import { SwPaM, SwPosition, type SwNodeIndex } from "../../core/crsr/pam";
import { SwTextNode } from "../../core/txtnode/ndtxt";
import {
  HTMLAttr,
  HTMLAttrTable,
  NewAttr,
  EndAttr,
  SaveAttrTab,
  RestoreAttrTab,
  SplitAttrTab,
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
import { RTL_TEXTENCODING_UTF8 } from "../../../../sal/inc/rtl/textenc";
import { SwCSS1Parser } from "./htmlcss1";
import { SvxCSS1PropertyInfo } from "./svxcss1.types";
import { SfxItemSet } from "../../../../svl/source/items/itemset";
import { ParseStyleOptions } from "./htmlcss1.options";
import { InsertBookmark, NewAnchor } from "./htmlgrin";
import { InsertAttrs } from "./htmlctxt.insert";
import { NewBasefontAttr, EndBasefontAttr, NewFontAttr, EndFontAttr } from "./swhtml.font";
import { SwFormatCharFormat } from "../../core/txtnode/fmtatr2";
import type { HTMLTable } from "./htmltab";
import type { SwTableBox } from "../../core/table/swtable";
import type { Color } from "../../../../tools/inc/color";
import type { SvxBrushItem } from "../../../../editeng/source/items/frmitems.brush";
import { CreateBrushItem } from "./htmltab.brush";
import {
  PrepareHTMLInsertion,
  JoinHTMLInsertionStart,
  FinishHTMLInsertion,
  HasCurrentParaBookmarks,
} from "./swhtml.insertion";
const HTML_PARSPACE = Math.round((5 * 1440) / 25.4);
/** Native synchronous body insertion owner. Unrepresented form/graphic/field producers do not have alternate model adapters here. */
export class SwHTMLParser extends HTMLParser {
  /** Same original parser-state slot, exposed only to source responsibility fragments in TypeScript; no second state is allocated. */
  declare public eState: SvParserState;
  m_pSttNdIdx: SwNodeIndex | null = null;
  m_pTargetCharAttrs: SfxItemSet | null = null;
  readonly m_aTables: HTMLTable[] = [];
  readonly m_aOrphanedTableBoxes: SwTableBox[] = [];
  /** Original parser table registration. @param table - Borrowed native intermediate table. @returns Nothing. */
  RegisterHTMLTable(table: HTMLTable): void {
    this.m_aTables.push(table);
  }
  /** Original deregistration transfers an unconsumed first box into parser cleanup ownership. @param table - Native table being destroyed. @returns Nothing. */
  DeregisterHTMLTable(table: HTMLTable): void {
    if (table.m_xBox1) {
      this.m_aOrphanedTableBoxes.push(table.m_xBox1);
      table.m_xBox1 = null;
    }
    for (let i = this.m_aTables.length; i--;)
      if (this.m_aTables[i] === table) this.m_aTables.splice(i, 1);
  }
  /** Original saturated pixel-to-twip helper under the browser's established 96-DPI device profile. @param pixels - Native uint16 pixels. @returns Saturated uint16 twips. */
  static ToTwips(pixels: number): number {
    return Math.min((pixels & 65535) * 15, 65535);
  }
  /** Original background producer. @param color - Legacy color. @param imageURL - Legacy image. @param style - Inline CSS. @param id - ID. @param className - Class. @returns New native brush or null. */
  CreateBrushItem(
    color: Color | null,
    imageURL: string,
    style: string,
    id: string,
    className: string,
  ): SvxBrushItem | null {
    return CreateBrushItem(this, color, imageURL, style, id, className);
  }
  readonly m_xAttrTab = new HTMLAttrTable();
  readonly m_aParaAttrs: HTMLAttr[] = [];
  readonly m_aSetAttrTab: HTMLAttr[] = [];
  readonly m_aContexts: HTMLAttrContext[] = [];
  readonly m_pCSS1Parser: SwCSS1Parser;
  readonly m_aBaseFontStack: number[] = [];
  readonly m_aFontStack: number[] = [];
  m_nBaseFontStMin = 0;
  m_nFontStMin = 0;
  m_nFontStHeadStart = 0;
  m_nContextStMin = 0;
  m_nContextStAttrMin = 0;
  private readonly m_pNumRuleInfo = new SwHTMLNumRuleInfo();
  private readonly breakIterator = new BreakIteratorImpl();
  m_nOpenParaToken = T.NONE;
  m_nDefListDeep = 0;
  m_bNoParSpace = false;
  private m_bDocInitialized = false;
  private m_bInTitle = false;
  private readonly m_bOldIsHTMLMode: boolean;
  private readonly m_bReadingHeaderOrFooter = false;
  /** Original header/footer admission query; this body-only reader has no header/footer section producer. @returns Native flag. */
  IsReadingHeaderOrFooter(): boolean {
    return this.m_bReadingHeaderOrFooter;
  }
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
    this.m_pCSS1Parser.SetDfltEncoding(RTL_TEXTENCODING_UTF8);
    m_pPam.DeleteMark();
    this.m_bOldIsHTMLMode = m_xDoc.GetDocumentSettingManager().get("HTML_MODE");
    m_xDoc.GetDocumentSettingManager().set("HTML_MODE", true);
  }
  /** Original GetCurrFormatColl borrows the cursor content node's actual collection. @returns Current format collection. */
  GetCurrFormatColl() {
    return this.GetTextNode().GetTextFormatColl();
  }
  /** Original style-option entry over actual CSS maps and property state. @param style - Inline declarations. @param id - ID. @param className - Class. @param items - Actual set. @param info - Actual flags. @param language - Original LANG option. @param direction - Original DIR option. @returns Whether applied. */
  ParseStyleOptions(
    style: string,
    id: string,
    className: string,
    items: SfxItemSet,
    info: SvxCSS1PropertyInfo,
    language?: string,
    direction?: string,
  ): boolean {
    return ParseStyleOptions(this, style, id, className, items, info, language, direction);
  }
  /** Original deferred bookmark producer. @param name - Exact source name. @returns Nothing. */
  InsertBookmark(name: string): void {
    InsertBookmark(this, name);
  }
  /** Native current numbering state. @returns Actual owner. */
  GetNumInfo(): SwHTMLNumRuleInfo {
    return this.m_pNumRuleInfo;
  }
  /** Original open-attribute suspension for native table/caption scopes. @param saved - Actual saved heads. @returns Nothing. */
  SaveAttrTab(saved: HTMLAttrTable): void {
    SaveAttrTab(this, saved);
  }
  /** Original table-boundary range split with retained open identities. @param saved - Actual saved heads. @param moveEndBack - Native previous-content boundary. @returns Nothing. */
  SplitAttrTab(saved: HTMLAttrTable, moveEndBack: boolean): void {
    SplitAttrTab(this, saved, moveEndBack);
  }
  /** Original open-head restoration after native table/caption cleanup. @param saved - Actual saved heads. @returns Nothing. */
  RestoreAttrTab(saved: HTMLAttrTable): void {
    RestoreAttrTab(this, saved);
  }
  /** Original represented node-removal admission. @param index - Actual node index. @returns Native admission. */
  CanRemoveNode(index: number): boolean {
    return CanRemoveNode(this, index);
  }
  /** Original table/caption trailing-paragraph cleanup. @param current - Borrowed original current table across the responsibility split. @returns Nothing. */
  StripTrailingPara(current: HTMLTable | null): void {
    StripTrailingPara(this, current);
  }
  /** Original paragraph-bookmark admission. @param ignoreStack - Native deferred-stack bypass. @returns Mark presence. */
  HasCurrentParaBookmarks(ignoreStack = false): boolean {
    return HasCurrentParaBookmarks(this, ignoreStack);
  }
  /** Binds source split/snapshot preparation and terminal native insertion joins to the synchronous byte parser. @returns Original parser result. */
  override CallParser(): SvParserState {
    PrepareHTMLInsertion(this);
    const undo = this.m_xDoc.GetUndoManager(),
      wasUndo = undo.DoesUndo();
    undo.DoUndo(false);
    try {
      const result = super.CallParser();
      if (result !== SvParserState.Pending) {
        const stripped = this.IsNewDoc() && this.StripTrailingLF() > 0;
        while (this.GetNumInfo().GetNumRule()) EndNumberBulletList(this);
        for (let pass = 0; pass < 2; ++pass) {
          while (this.m_aContexts.length > this.m_nContextStMin) {
            const context = this.PopContext();
            if (context) this.EndContext(context);
          }
          if (!this.m_nContextStMin) break;
          this.m_nContextStMin = 0;
        }
        this.m_aParaAttrs.length = 0;
        this.SetAttr(false);
        this.m_pCSS1Parser.SetDelayedStyles();
        JoinHTMLInsertionStart(this);
        if (result === SvParserState.Accepted) FinishHTMLInsertion(this, stripped);
      }
      return result;
    } finally {
      undo.DoUndo(wasUndo);
    }
  }
  /** Releases remaining native node-index/item owners after success or failure, without deleting borrowed document/cursor. @returns Nothing. */
  SourceDispose(): void {
    this.m_pTargetCharAttrs?.Dispose();
    this.m_pTargetCharAttrs = null;
    this.m_pSttNdIdx?.Dispose();
    this.m_pSttNdIdx = null;
    for (const box of this.m_aOrphanedTableBoxes.splice(0)) box.Dispose();
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
    this.m_aBaseFontStack.length = this.m_aFontStack.length = 0;
  }
  /** Original HTML caption section deletion delegates to the native document operation. Marquee/drawing ownership is not represented by this current importer. @param start - Actual section start. @returns Nothing. */
  DeleteSection(start: import("../../core/docnode/node").SwStartNode): void {
    this.m_xDoc.GetDocumentContentOperationsManager().DeleteSection(start);
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
    if (position <= this.m_nContextStMin) return null;
    if (token === T.NONE) --position;
    else {
      let found = false;
      while (position > this.m_nContextStMin) {
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
  /** Original parser-owned attribute close delegates to the shared native implementation and script service. @param attr - Actual open attribute. @param checkEmpty - Native empty-range policy. @returns Original close result. */
  EndAttr(attr: HTMLAttr, checkEmpty = true): boolean {
    return EndAttr(this, attr, checkEmpty, this.breakIterator);
  }
  /** Original context attribute close order. @param context - Removed context. @returns Nothing. */
  EndContextAttrs(context: HTMLAttrContext): void {
    for (const attr of context.GetAttrs()) EndAttr(this, attr, true, this.breakIterator);
    context.GetAttrs().length = 0;
  }
  /** Ends represented context attributes and its source append mode. @param context - Removed native owner. @returns Nothing. */
  EndContext(context: HTMLAttrContext): void {
    if (context.GetPopStack())
      while (this.m_aContexts.length > this.m_nContextStMin) {
        const inner = this.PopContext();
        if (inner) this.EndContext(inner);
      }
    this.EndContextAttrs(context);
    if (context.GetAppendMode() !== A.AM_NONE && this.m_pPam.GetPoint().GetContentIndex())
      this.AppendTextNode(context.GetAppendMode());
    if (context.IsFinishPREListingXMP()) this.FinishPREListingXMP();
    if (context.IsRestartPRE()) this.StartPRE();
    if (context.IsRestartXMP()) this.StartXMP();
    if (context.IsRestartListing()) this.StartListing();
  }
  /** Original section context suspends and later restarts actual lexer PRE/XMP/LISTING environments. @param context - Actual new context. @returns Nothing. */
  SplitPREListingXMP(context: HTMLAttrContext): void {
    context.SetFinishPREListingXMP(true);
    if (this.IsReadPRE()) context.SetRestartPRE(true);
    if (this.IsReadXMP()) context.SetRestartXMP(true);
    if (this.IsReadListing()) context.SetRestartListing(true);
    this.FinishPREListingXMP();
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
      const style = this.GetStyleOption(O.STYLE),
        id = this.GetStyleOption(O.ID),
        className = this.GetStyleOption(O.CLASS),
        language = this.GetStyleOption(O.LANG),
        direction = this.GetStyleOption(O.DIR);
      if (style || id || className || language || direction) {
        const set = new SfxItemSet(this.m_xDoc.GetAttrPool(), this.m_pCSS1Parser.GetWhichMap());
        try {
          for (const [, item] of items) set.Put(item);
          const info = new SvxCSS1PropertyInfo();
          this.ParseStyleOptions(style, id, className, set, info, language, direction);
          this.InsertAttrs(set, info, context, true);
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
  /** Native consumed attribute/context insertion. @param items - Declarations. @param info - Flags. @param context - Actual context. @param charLevel - Original inline selector. @returns Nothing. */
  InsertAttrs(
    items: SfxItemSet,
    info: SvxCSS1PropertyInfo,
    context: HTMLAttrContext,
    charLevel = false,
  ): void {
    InsertAttrs(this, items, info, context, charLevel);
  }
  /** Original reverse nearest-margin lookup leaves supplied outputs unchanged if no context owns them. @param left - Output. @param right - Output. @param indent - Output. @param ignoreTop - Skip top context. @returns Nothing. */
  GetMarginsFromContext(
    left: [number],
    right: [number],
    indent: [number],
    ignoreTop = false,
  ): void {
    for (
      let index = this.m_aContexts.length - (ignoreTop ? 1 : 0);
      index > this.m_nContextStAttrMin;
    ) {
      const context = this.m_aContexts[--index];
      if (context?.IsLRSpaceChanged()) {
        context.GetMargins(left, right, indent);
        return;
      }
    }
  }
  /** Native spacing lookup takes the nearest changed context or the default body paragraph style. @param upper - Output. @param lower - Output. @returns Nothing. */
  GetULSpaceFromContext(upper: [number], lower: [number]): void {
    let pool = SwPoolFormatId.ZERO as number;
    for (let index = this.m_aContexts.length; index > this.m_nContextStAttrMin;) {
      const context = this.m_aContexts[--index];
      if (context?.IsULSpaceChanged()) {
        context.GetULSpace(upper, lower);
        return;
      }
      if (!pool && context?.GetDefaultTextFormatColl()) pool = context.GetDefaultTextFormatColl();
    }
    const entry = WRITER_PARAGRAPH_STYLE_POOL.find(
      /** Resolves the original default pool. @param item - Metadata. @returns Match. */ (item) =>
        item.poolId === (pool || SwPoolFormatId.COLL_TEXT),
    );
    if (!entry) throw new Error("assert(default HTML paragraph style)");
    const spacing = this.m_xDoc.GetTextFormatColl(entry.id).GetULSpace();
    upper[0] = spacing.GetUpper();
    lower[0] = spacing.GetLower();
  }
  /** Native semantic tags retain a separate character-format stack beneath direct CSS attributes. @param token - Native opening token. @returns Nothing. */
  NewCharFormat(token: T): void {
    const context = new HTMLAttrContext(token);
    const format = this.m_pCSS1Parser.GetChrFormat(token, this.GetStyleOption(O.CLASS));
    const style = this.GetStyleOption(O.STYLE),
      id = this.GetStyleOption(O.ID),
      language = this.GetStyleOption(O.LANG),
      direction = this.GetStyleOption(O.DIR);
    if (style || id || language || direction) {
      const items = new SfxItemSet(this.m_xDoc.GetAttrPool(), this.m_pCSS1Parser.GetWhichMap());
      try {
        const info = new SvxCSS1PropertyInfo();
        this.ParseStyleOptions(style, id, "", items, info, language, direction);
        this.InsertAttrs(items, info, context, true);
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
  /** Original paragraph style selection and consumed context margin contributions. @param topContext - Newly opened explicit style context. @returns Nothing. */
  SetTextCollAttrs(topContext?: HTMLAttrContext): void {
    SetTextCollAttrs(this, topContext);
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
  /** Original append spacing and open-character range splitting over native script services. @param mode - Source spacing mode. @param updateNum - Apply native continuation numbering. @returns Append result. */
  AppendTextNode(mode = A.AM_NORMAL, updateNum = true): boolean {
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
      if (updateNum) {
        if (this.GetNumInfo().GetDepth()) SetNodeNum(this, this.GetNumInfo().GetLevel());
        else this.GetTextNode().ResetAttr(H.RES_PARATR_NUMRULE);
      }
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
    const className = this.GetStyleOption(O.CLASS),
      context = className
        ? new HTMLAttrContext(T.PARABREAK_ON, SwPoolFormatId.COLL_TEXT, className)
        : new HTMLAttrContext(T.PARABREAK_ON);
    const style = this.GetStyleOption(O.STYLE),
      id = this.GetStyleOption(O.ID),
      language = this.GetStyleOption(O.LANG),
      direction = this.GetStyleOption(O.DIR);
    if (style || id || language || direction) {
      const items = new SfxItemSet(this.m_xDoc.GetAttrPool(), this.m_pCSS1Parser.GetWhichMap());
      try {
        const info = new SvxCSS1PropertyInfo();
        this.ParseStyleOptions(style, id, "", items, info, language, direction);
        this.InsertAttrs(items, info, context);
        if (info.m_bPreserveSpace) this.SetPreserveSpaces(true);
      } finally {
        items.Dispose();
      }
    }
    this.InsertAlignment(context);
    this.PushContext(context);
    this.SetTextCollAttrs(className ? context : undefined);
    this.m_nOpenParaToken = T.PARABREAK_ON;
  }
  /** Original paragraph close skips empty HTML paragraphs. @param real - Explicit closing tag selector. @returns Nothing. */
  EndPara(real = false): void {
    if (real) {
      if (this.m_pPam.GetPoint().GetContentIndex()) this.AppendTextNode(A.AM_SPACE);
      else this.AddParSpace();
    }
    if (
      (this.m_nOpenParaToken === T.DT_ON || this.m_nOpenParaToken === T.DD_ON) &&
      this.m_nDefListDeep
    )
      --this.m_nDefListDeep;
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
      this.GetStyleOption(O.CLASS),
    );
    const style = this.GetStyleOption(O.STYLE),
      id = this.GetStyleOption(O.ID),
      language = this.GetStyleOption(O.LANG),
      direction = this.GetStyleOption(O.DIR);
    if (style || id || language || direction) {
      const items = new SfxItemSet(this.m_xDoc.GetAttrPool(), this.m_pCSS1Parser.GetWhichMap());
      try {
        const info = new SvxCSS1PropertyInfo();
        this.ParseStyleOptions(style, id, "", items, info, language, direction);
        this.InsertAttrs(items, info, context);
      } finally {
        items.Dispose();
      }
    }
    this.InsertAlignment(context);
    this.PushContext(context);
    this.SetTextCollAttrs(context);
    this.m_nFontStHeadStart = this.m_aFontStack.length & 0xffff;
  }
  /** Original heading close finds the last heading regardless of the closing level. @returns Nothing. */
  EndHeading(): void {
    if (this.m_pPam.GetPoint().GetContentIndex()) this.AppendTextNode(A.AM_SPACE);
    else this.AddParSpace();
    for (let index = this.m_aContexts.length; index > this.m_nContextStMin;) {
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
    this.m_nFontStHeadStart = this.m_nFontStMin;
  }
  /** Original represented block-style transition. @param token - Opening token. @param pool - Native pool ID. @returns Nothing. */
  NewTextFormatColl(token: T, pool: number): void {
    const mode =
      token === T.ADDRESS_ON
        ? A.AM_NOSPACE
        : token === T.DD_ON || token === T.DT_ON
          ? A.AM_SOFTNOSPACE
          : A.AM_SPACE;
    if (this.m_pPam.GetPoint().GetContentIndex()) this.AppendTextNode(mode);
    else if (mode === A.AM_SPACE) this.AddParSpace();
    const className =
      token === T.LISTING_ON || token === T.XMP_ON ? "" : this.GetStyleOption(O.CLASS);
    const context = new HTMLAttrContext(token, pool, className);
    const style = this.GetStyleOption(O.STYLE),
      id = this.GetStyleOption(O.ID),
      language = this.GetStyleOption(O.LANG),
      direction = this.GetStyleOption(O.DIR);
    if (style || id || language || direction) {
      const items = new SfxItemSet(this.m_xDoc.GetAttrPool(), this.m_pCSS1Parser.GetWhichMap());
      try {
        const info = new SvxCSS1PropertyInfo();
        this.ParseStyleOptions(style, id, "", items, info, language, direction);
        this.InsertAttrs(items, info, context);
      } finally {
        items.Dispose();
      }
    }
    this.PushContext(context);
    this.SetTextCollAttrs(context);
  }
  /** Original block close applies its append policy before ending context attributes. @param token - Original opening or closing token. @returns Nothing. */
  EndTextFormatColl(token: T): void {
    const opening = (token & ~1) as T,
      mode =
        opening === T.ADDRESS_ON || opening === T.DD_ON || opening === T.DT_ON
          ? A.AM_SOFTNOSPACE
          : A.AM_SPACE;
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
        alignment = option.GetEnum(aHTMLPAlignTable, alignment);
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
    if (DispatchDefList(this, token) || DispatchNumberBulletList(this, token)) return;
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
      case T.LINEBREAK:
      case T.NEWPARA:
        // Group the original fallthrough cases: TypeScript forbids a nonempty fallthrough.
        if (token === T.LINEBREAK && !this.bReadPRE) {
          this.m_xDoc.GetDocumentContentOperationsManager().InsertString(this.m_pPam, "\n");
          break;
        }
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
      case T.ANCHOR_ON:
        NewAnchor(this);
        break;
      case T.ANCHOR_OFF:
        this.EndTag(token);
        break;
      case T.BASEFONT_ON:
        NewBasefontAttr(this);
        break;
      case T.BASEFONT_OFF:
        EndBasefontAttr(this);
        break;
      case T.FONT_ON:
      case T.BIGPRINT_ON:
      case T.SMALLPRINT_ON:
        NewFontAttr(this, token);
        break;
      case T.FONT_OFF:
      case T.BIGPRINT_OFF:
      case T.SMALLPRINT_OFF:
        EndFontAttr(this, token);
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

import { DispatchNumberBulletList, EndNumberBulletList, SetNodeNum } from "./htmlnumreader";

import { DispatchDefList } from "./swhtml.definitions";

import { SetTextCollAttrs } from "./swhtml.styles";
