/** @fileoverview Consumed native SwCSS1Parser character-style and configured font-height owners from htmlcss1.cxx. */
import { SvxCSS1Parser } from "./svxcss1";
import { cssAsciiLower } from "./svxcss1.properties";
import { Css1ScriptFlags } from "./svxcss1.types";
import { HtmlTokenId as T } from "../../../../svtools/inc/htmltokn";
import { SwPoolFormatId as P } from "../../../inc/poolfmt";
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
/** Native Writer specialization over the actual CSS1 grammar/property receiver. */
export class SwCSS1Parser extends SvxCSS1Parser {
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
          for (const which of [
            H.RES_CHRATR_FONTSIZE,
            H.RES_CHRATR_CJK_FONTSIZE,
            H.RES_CHRATR_CTL_FONTSIZE,
          ]) {
            const height = items.GetItemIfSet(which, false);
            if (height instanceof SvxFontHeightItem && height.GetProp() !== 100)
              items.ClearItem(which);
          }
          format.SetFormatAttrSet(items);
        } finally {
          items.Dispose();
        }
      }
    }
    return format;
  }
}
