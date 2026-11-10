/** @fileoverview Consumed native SwCSS1Parser character-style and configured font-height owners from htmlcss1.cxx. */
import { GetPageDesc, SetFormatBreak } from "./htmlcss1.page";
import type { SvxCSS1PropertyInfo } from "./svxcss1.types";
import { SvxCSS1Parser } from "./svxcss1";
import { cssAsciiLower } from "./svxcss1.properties";
import { Css1ScriptFlags } from "./svxcss1.types";
import { HtmlTokenId as T } from "../../../../svtools/inc/htmltokn";
import { SwPoolFormatId as P, WRITER_PARAGRAPH_STYLE_POOL } from "../../../inc/poolfmt";
import type { SwCharFormat } from "../../../inc/charfmt";
import type { SfxItemSet } from "../../../../svl/source/items/itemset";
import { SvxULSpaceItem } from "../../../../editeng/inc/ulspitem";
import type { SwTextFormatColl } from "../../core/doc/fmtcol";
import type { SwDoc } from "../../core/doc/doc";
import type { SwHTMLParser } from "./swhtml";
import { SvxFontHeightItem } from "../../../../editeng/inc/fhgtitem";
import { SvxFontItem } from "../../../../editeng/inc/fontitem";
import type { SwFormat } from "../../core/attr/format";
import {
  RTL_TEXTENCODING_DONTKNOW,
  RTL_TEXTENCODING_SYMBOL,
  type rtl_TextEncoding,
} from "../../../../sal/inc/rtl/textenc";
import * as H from "../../../inc/hintids";
const poolStyles = new Map<T, number>([
  [T.EMPHASIS_ON, P.CHR_HTML_EMPHASIS],
  [T.CITATION_ON, P.CHR_HTML_CITATION],
  [T.STRONG_ON, P.CHR_HTML_STRONG],
  [T.CODE_ON, P.CHR_HTML_CODE],
  [T.SAMPLE_ON, P.CHR_HTML_SAMPLE],
  [T.KEYBOARD_ON, P.CHR_HTML_KEYBOARD],
  [T.VARIABLE_ON, P.CHR_HTML_VARIABLE],
  [T.DEFINSTANCE_ON, P.CHR_HTML_DEFINSTANCE],
  [T.TELETYPE_ON, P.CHR_HTML_TELETYPE],
]);
const namedStyles = new Map<T, string>([
  [T.SHORTQUOTE_ON, "q"],
  [T.LANGUAGE_ON, "lang"],
  [T.AUTHOR_ON, "au"],
  [T.PERSON_ON, "person"],
  [T.ACRONYM_ON, "acronym"],
  [T.ABBREVIATION_ON, "abbrev"],
  [T.INSERTEDTEXT_ON, "ins"],
  [T.DELETEDTEXT_ON, "del"],
]);
/** Original SetCharFormatAttrs for represented character items. Native character brush/box Which values are outside the current core and are not replaced by highlight or paragraph items. @param format - Actual character style. @param items - Original mutable map-entry set. @returns Nothing. */
function SetCharFormatAttrs(format: SwCharFormat, items: SfxItemSet): void {
  for (const which of [
    H.RES_CHRATR_FONTSIZE,
    H.RES_CHRATR_CJK_FONTSIZE,
    H.RES_CHRATR_CTL_FONTSIZE,
  ]) {
    const height = items.GetItemIfSet(which, false);
    if (height instanceof SvxFontHeightItem && height.GetProp() !== 100) items.ClearItem(which);
  }
  format.SetFormatAttrSet(items);
}
/** Original module-local helper changes only direct non-symbol fonts and preserves family/style/pitch and inherited items. @param format - Actual selected format. @param encoding - Native parser encoding. @returns Nothing. */
function lcl_swcss1_setEncoding(format: SwFormat, encoding: rtl_TextEncoding): void {
  if (encoding === RTL_TEXTENCODING_DONTKNOW) return;
  for (const which of [H.RES_CHRATR_FONT, H.RES_CHRATR_CJK_FONT, H.RES_CHRATR_CTL_FONT]) {
    const font = format.GetAttrSet().GetItemIfSet(which, false);
    if (
      !(font instanceof SvxFontItem) ||
      font.GetCharSet() === RTL_TEXTENCODING_SYMBOL ||
      font.GetCharSet() === encoding
    )
      continue;
    const copy = new SvxFontItem(
      font.GetFamily(),
      font.GetFamilyName(),
      font.GetStyleName(),
      font.GetPitch(),
      encoding,
      which,
    );
    try {
      format.SetFormatAttr(copy);
    } finally {
      copy.Dispose();
    }
  }
}
/** Original table-style item consumption merges one-sided spacing from the selected collection, drops proportional font heights, then maps page breaks before publishing real style items. @param coll - Actual collection. @param items - Mutable native CSS entry. @param info - Source declaration flags. @param css - Actual receiver. @returns Nothing. */
function SetTextCollAttrs(
  coll: SwTextFormatColl,
  items: SfxItemSet,
  info: SvxCSS1PropertyInfo,
  css: SwCSS1Parser,
): void {
  const existing = coll.GetAttrSet().GetItemIfSet(H.RES_UL_SPACE),
    incoming = items.GetItemIfSet(H.RES_UL_SPACE, false);
  if (
    (info.m_bTopMargin || info.m_bBottomMargin) &&
    (!info.m_bTopMargin || !info.m_bBottomMargin) &&
    existing instanceof SvxULSpaceItem &&
    incoming instanceof SvxULSpaceItem
  ) {
    const spacing = existing.Clone();
    try {
      if (info.m_bTopMargin) spacing.SetUpper(incoming.GetUpper());
      if (info.m_bBottomMargin) spacing.SetLower(incoming.GetLower());
      items.Put(spacing);
    } finally {
      spacing.Dispose();
    }
  }
  for (const which of [
    H.RES_CHRATR_FONTSIZE,
    H.RES_CHRATR_CJK_FONTSIZE,
    H.RES_CHRATR_CTL_FONTSIZE,
  ]) {
    const height = items.GetItemIfSet(which, false);
    if (height instanceof SvxFontHeightItem && height.GetProp() !== 100) items.ClearItem(which);
  }
  css.SetFormatBreak(items, info);
  coll.SetFormatAttrSet(items);
}
/** Native Writer specialization over the actual CSS1 grammar/property receiver. */
export class SwCSS1Parser extends SvxCSS1Parser {
  private m_bTableHeaderTextCollSet = false;
  private m_bTableTextCollSet = false;
  /** Original one-time TH then TH P cascade over actual tag map entries. @returns Nothing. */
  SetTHTagStyles(): void {
    if (!this.m_bTableHeaderTextCollSet) this.SetTableTextColl(true);
  }
  /** Original one-time TD then TD P cascade over actual tag map entries. @returns Nothing. */
  SetTDTagStyles(): void {
    if (!this.m_bTableTextCollSet) this.SetTableTextColl(false);
  }
  /** Original terminal delayed-style order. @returns Nothing. */
  SetDelayedStyles(): void {
    this.SetTHTagStyles();
    this.SetTDTagStyles();
    this.SetATagStyles();
  }
  /** Original two-entry cascade mutates consumed sets and creates the collection only for a matching tag. Completion is recorded even with no entry. @param header - Select TH rather than TD. @returns Nothing. */
  private SetTableTextColl(header: boolean): void {
    const pool = header ? P.COLL_TABLE_HDLN : P.COLL_TABLE,
      tag = header ? "th" : "td";
    let coll: SwTextFormatColl | undefined;
    for (const key of [tag, tag + " p"]) {
      const entry = this.GetTag(key);
      if (entry) {
        coll ??= this.GetTextFormatColl(pool, "");
        SetTextCollAttrs(coll, entry.GetItemSet(), entry.GetPropertyInfo(), this);
      }
    }
    if (header) this.m_bTableHeaderTextCollSet = true;
    else this.m_bTableTextCollSet = true;
  }
  private m_bLinkCharFormatsSet = false;
  private m_bBodyLinkSet = false;
  private m_bBodyVLinkSet = false;
  /** Original link-color admission flag. @returns Native flag. */
  IsBodyLinkSet(): boolean {
    return this.m_bBodyLinkSet;
  }
  /** Original visited-link-color admission flag. @returns Native flag. */
  IsBodyVLinkSet(): boolean {
    return this.m_bBodyVLinkSet;
  }
  /** Original one-time A-tag style entry. @returns Nothing. */
  SetATagStyles(): void {
    if (!this.m_bLinkCharFormatsSet) this.SetLinkCharFormats();
  }
  /** Original A, A:link and A:visited style precedence over actual pool formats. @returns Nothing. */
  private SetLinkCharFormats(): void {
    let unvisited: SwCharFormat | undefined, visited: SwCharFormat | undefined;
    const common = this.GetTag("a");
    if (common) {
      const items = common.GetItemSet();
      const colorSet = items.GetItemIfSet(H.RES_CHRATR_COLOR, false) !== undefined;
      unvisited = this.GetCharFormatFromPool(P.CHR_INET_NORMAL);
      SetCharFormatAttrs(unvisited, items);
      this.m_bBodyLinkSet ||= colorSet;
      visited = this.GetCharFormatFromPool(P.CHR_INET_VISIT);
      SetCharFormatAttrs(visited, items);
      this.m_bBodyVLinkSet ||= colorSet;
    }
    const link = this.GetTag("a:link");
    if (link) {
      const items = link.GetItemSet();
      const colorSet = items.GetItemIfSet(H.RES_CHRATR_COLOR, false) !== undefined;
      unvisited ??= this.GetCharFormatFromPool(P.CHR_INET_NORMAL);
      SetCharFormatAttrs(unvisited, items);
      this.m_bBodyLinkSet ||= colorSet;
    }
    const visit = this.GetTag("a:visited");
    if (visit) {
      const items = visit.GetItemSet();
      const colorSet = items.GetItemIfSet(H.RES_CHRATR_COLOR, false) !== undefined;
      visited ??= this.GetCharFormatFromPool(P.CHR_INET_VISIT);
      SetCharFormatAttrs(visited, items);
      this.m_bBodyVLinkSet ||= colorSet;
    }
    this.m_bLinkCharFormatsSet = true;
  }
  /** Consumed native GetCharFormatFromPool wrapper for insertion into an existing document. @param id - Original pool identity. @returns Borrowed document style. */
  GetCharFormatFromPool(id: P): SwCharFormat {
    const format = this.doc.GetCharFormatFromPool(id);
    if (!format) throw new Error("assert(character format pool identity)");
    return format;
  }
  /** Consumed original GetTextCollFromPool ownership for existing-document insertion; new-document setup corrects newly materialized formats only. @param id - Original pool ID. @returns Borrowed document collection. */
  GetTextCollFromPool(id: number) {
    const oldLength = this.doc.GetTextFormatColls().length;
    const entry = WRITER_PARAGRAPH_STYLE_POOL.find(
      /** Matches native pool metadata. @param candidate - Definition. @returns Match. */ (
        candidate,
      ) => candidate.poolId === id,
    );
    if (!entry) throw new Error("assert(paragraph format pool identity)");
    const format = this.doc.GetTextFormatColl(entry.id);
    if (this.m_bIsNewDoc)
      for (const created of this.doc.GetTextFormatColls().slice(oldLength))
        lcl_swcss1_setEncoding(created, this.GetDfltEncoding());
    return format;
  }
  /** Original GetTextFormatColl lookup for Markdown's existing-document profile. StyleParsed admits no stylesheet maps in this mode; note pools, script suffixes and existing named descendants still participate. @param pool - Original pool ID. @param className - Original context class. @returns Borrowed document collection. */
  GetTextFormatColl(pool: number, className: string) {
    let [name] = SwCSS1Parser.GetScriptFromClass(className, false);
    if (pool === P.COLL_TEXT) {
      const lower = cssAsciiLower(name);
      if (lower === "sdendnote" || lower === "sdfootnote") {
        pool = lower === "sdendnote" ? P.COLL_ENDNOTE : P.COLL_FOOTNOTE;
        name = "";
      }
    }
    // Original USER_FMT substitutes Standard, without treating a user ID as a pool ID.
    if (pool & (1 << 15)) pool = P.COLL_STANDARD;
    let style = this.GetTextCollFromPool(pool);
    if (name) {
      let descendant = this.doc.FindTextFormatCollByName(style.GetName() + "." + name);
      const entry = WRITER_PARAGRAPH_STYLE_POOL.find(
        /** Matches the original pool identity. @param candidate - Definition. @returns Match. */ (
          candidate,
        ) => candidate.poolId === pool,
      );
      if (!descendant && (entry?.id === "table-contents" || entry?.id === "table-heading")) {
        const text = this.GetTextCollFromPool(P.COLL_TEXT);
        descendant = this.doc.FindTextFormatCollByName(text.GetName() + "." + name);
      }
      if (descendant) style = descendant;
    }
    lcl_swcss1_setEncoding(style, this.GetDfltEncoding());
    return style;
  }
  /** Borrows original document/parser and copies the supplied seven native configured heights. @param doc - Actual document. @param parser - Actual HTML parser. @param heights - HTML font configuration in twips. @param baseURL - Original base. @param m_bIsNewDoc - Native creation selector. @returns Parser. */
  constructor(
    private readonly doc: SwDoc,
    private readonly parser: SwHTMLParser,
    private readonly heights: readonly number[],
    baseURL: string,
    private readonly m_bIsNewDoc: boolean,
  ) {
    super(doc.GetAttrPool(), baseURL, [H.RES_BREAK, H.RES_PAGEDESC, H.RES_KEEP]);
    this.heights = [...heights];
  }
  /** Native master HTML page owner. @returns Borrowed master page. */
  GetMasterPageDesc() {
    return this.doc.getIDocumentStylePoolAccess().GetPageDescFromPool(P.PAGE_HTML, false);
  }
  /** Native first page lookup/creation. @param create - Original flag. @returns Borrowed page or null. */
  GetFirstPageDesc(create = false) {
    return GetPageDesc(this.doc, this.parser, P.PAGE_FIRST, create);
  }
  /** Native left page lookup/creation. @param create - Original flag. @returns Borrowed page or null. */
  GetLeftPageDesc(create = false) {
    return GetPageDesc(this.doc, this.parser, P.PAGE_LEFT, create);
  }
  /** Native right page lookup/creation. @param create - Original flag. @returns Borrowed page or null. */
  GetRightPageDesc(create = false) {
    return GetPageDesc(this.doc, this.parser, P.PAGE_RIGHT, create);
  }
  /** Original paragraph break consumer, preserving the source boolean result. @param items - Actual set. @param info - Parsed state. @returns Source bSetBreak. */
  SetFormatBreak(items: SfxItemSet, info: SvxCSS1PropertyInfo): boolean {
    return SetFormatBreak(this, items, info);
  }
  /** Native indexed HTML font-height lookup. @param size - Zero-based index. @returns Configured twips. */
  override GetFontHeight(size: number): number {
    const height = this.heights[Math.min(size, 6)];
    if (height === undefined) throw new Error("assert(seven configured HTML heights)");
    return height;
  }
  /** Native script suffix stripping with ASCII case matching. @param value - Class name. @param subClassOnly - Require a dash. @returns Original class and script selection. */
  static GetScriptFromClass(
    value: string,
    subClassOnly = true,
  ): readonly [string, Css1ScriptFlags] {
    let position = value.length > 4 ? value.lastIndexOf("-") : -1;
    if (position === -1 && subClassOnly) return [value, Css1ScriptFlags.AllMask];
    position = position === -1 ? 0 : position + 1;
    const suffix = cssAsciiLower(value.slice(position));
    const flags =
      suffix === "western"
        ? Css1ScriptFlags.Western
        : suffix === "cjk"
          ? Css1ScriptFlags.CJK
          : suffix === "ctl"
            ? Css1ScriptFlags.CTL
            : Css1ScriptFlags.AllMask;
    return [
      flags === Css1ScriptFlags.AllMask ? value : position ? value.slice(0, position - 1) : "",
      flags,
    ];
  }
  /** Native semantic tag lookup creates actual document character styles and optional class descendants. @param token - Opening HTML token. @param className - Original class. @returns Borrowed document style or undefined. */
  GetChrFormat(token: T, className: string) {
    const pool = poolStyles.get(token),
      name = namedStyles.get(token);
    if (pool === undefined && name === undefined) return undefined;
    let format =
      pool !== undefined
        ? this.doc.GetCharFormatFromPool(pool)
        : name !== undefined
          ? this.doc.FindCharFormatByName(name)
          : undefined;
    if (!format && name !== undefined) {
      format = this.doc.MakeCharFormat(name, this.doc.GetDfltCharFormat());
      format.SetAuto(false);
    }
    if (!format) throw new Error("assert(character format)");
    const [originalClass] = SwCSS1Parser.GetScriptFromClass(className, false);
    if (originalClass) {
      const classStyleName = format.GetName() + "." + originalClass;
      const existing = this.doc.FindCharFormatByName(classStyleName);
      if (existing) return existing;
      const entry = this.GetClass(originalClass);
      if (entry) {
        format = this.doc.MakeCharFormat(classStyleName, format);
        format.SetAuto(false);
        const items = entry.GetItemSet().Clone();
        try {
          SetCharFormatAttrs(format, items);
        } finally {
          items.Dispose();
        }
      }
    }
    return format;
  }
}
