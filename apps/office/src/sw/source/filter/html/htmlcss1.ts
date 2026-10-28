/** @fileoverview Consumed native SwCSS1Parser character-style and configured font-height owners from htmlcss1.cxx. */
import { SvxCSS1Parser } from "./svxcss1";
import { cssAsciiLower } from "./svxcss1.properties";
import { Css1ScriptFlags } from "./svxcss1.types";
import { HtmlTokenId as T } from "../../../../svtools/inc/htmltokn";
import { SwPoolFormatId as P } from "../../../inc/poolfmt";
import type { SwCharFormat } from "../../../inc/charfmt";
import type { SfxItemSet } from "../../../../svl/source/items/itemset";
import type { SwDoc } from "../../core/doc/doc";
import type { SwHTMLParser } from "./swhtml";
import { SvxFontHeightItem } from "../../../../editeng/inc/fhgtitem";
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
/** Native Writer specialization over the actual CSS1 grammar/property receiver. */
export class SwCSS1Parser extends SvxCSS1Parser {
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
  private GetCharFormatFromPool(id: P): SwCharFormat {
    const format = this.doc.GetCharFormatFromPool(id);
    if (!format) throw new Error("assert(character format pool identity)");
    return format;
  }
  /** Borrows original document/parser and copies the supplied seven native configured heights. @param doc - Actual document. @param parser - Actual HTML parser. @param heights - HTML font configuration in twips. @param baseURL - Original base. @param newDoc - Native creation selector. @returns Parser. */
  constructor(
    private readonly doc: SwDoc,
    parser: SwHTMLParser,
    private readonly heights: readonly number[],
    baseURL: string,
    newDoc: boolean,
  ) {
    super(doc.GetAttrPool(), baseURL);
    void parser;
    void newDoc;
    this.heights = [...heights];
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
