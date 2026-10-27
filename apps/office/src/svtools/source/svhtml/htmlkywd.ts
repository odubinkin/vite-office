/** @fileoverview Pinned htmlkywd.cxx token/option/entity/color tables and exact lookup predicates. */
import { HtmlTokenId, HtmlOptionId } from "../../inc/htmltokn";
import data from "./htmlkywd-data.json" with { type: "json" };
/** Source UTF-16 lower_bound lookup. @param table - Native sorted entries. @param name - Exact key. @param missing - Native missing sentinel. @returns Numeric value. */
function search(
  table: readonly (readonly (string | number)[])[],
  name: string,
  missing: number,
): number {
  let first = 0,
    end = table.length;
  while (first < end) {
    const middle = (first + end) >>> 1;
    if ((table[middle]?.[0] as string) < name) first = middle + 1;
    else end = middle;
  }
  return table[first]?.[0] === name ? (table[first]?.[1] as number) : missing;
}
/** Original comment-prefix rule precedes token lookup. @param name - Already lowercased tag. @returns Native token. */
export function GetHTMLToken(name: string): HtmlTokenId {
  return name.startsWith("!--") ? HtmlTokenId.COMMENT : search(data.tokens, name, HtmlTokenId.NONE);
}
/** Original case-sensitive, eight-character entity table; NBSP/SHY retain 1/2 sentinels. @param name - Source name. @returns Character or zero. */
export function GetHTMLCharName(name: string): number {
  return search(data.entities, name, 0);
}
/** Original option name lookup, after caller ASCII case folding. @param name - Name. @returns Native option. */
export function GetHTMLOption(name: string): HtmlOptionId {
  return search(data.options, name, HtmlOptionId.UNKNOWN);
}
/** Original ASCII-only case fold leaves all other UTF-16 units unchanged. @param text - Native string. @returns Folded text. */
export function htmlAsciiLower(text: string): string {
  let result = "";
  for (let i = 0; i < text.length; i++) {
    const code = text.charCodeAt(i);
    result += String.fromCharCode(code >= 65 && code <= 90 ? code + 32 : code);
  }
  return result;
}
/** Original named color lookup has an unsigned missing sentinel. @param name - Color spelling. @returns RGB or SAL_MAX_UINT32. */
export function GetHTMLColor(name: string): number {
  return search(data.colors, htmlAsciiLower(name), 0xffffffff);
}
