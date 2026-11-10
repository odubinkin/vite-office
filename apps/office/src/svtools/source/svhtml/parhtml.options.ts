/** @fileoverview Native HTMLOption values and mutable GetOptions/UnescapeToken scanners from parhtml.cxx. */
import { HTMLTableFrame as F, HTMLTableRules as R } from "../../inc/parhtml";
import { HtmlOptionId } from "../../inc/htmltokn";
import { Color } from "../../../tools/inc/color";
import { toInt } from "../../../sal/rtl/strtmpl";
import { GetHTMLColor, GetHTMLOption, htmlAsciiLower } from "./htmlkywd";
/** Original module-owned table-frame option aliases from parhtml.cxx. */
const aTableFrameOptEnums: readonly (readonly [string, F])[] = [
  ["void", F.Void],
  ["above", F.Above],
  ["below", F.Below],
  ["hsides", F.HSides],
  ["lhs", F.LHS],
  ["rhs", F.RHS],
  ["vsides", F.VSides],
  ["box", F.Box],
  ["border", F.Box],
];
/** Original module-owned inner-rule option aliases from parhtml.cxx. */
const aTableRulesOptEnums: readonly (readonly [string, R])[] = [
  ["none", R.NONE],
  ["groups", R.Groups],
  ["rows", R.Rows],
  ["cols", R.Cols],
  ["all", R.All],
];
/** Native HTML whitespace and printable predicates. @param code - UTF-16 unit. @returns Printable. */
function printable(code: number): boolean {
  return code >= 32 && code !== 127;
}
/** Native rtl ASCII whitespace (unlike HTML_ISSPACE, includes form feed). @param code - Unit. @returns Whitespace. */
function white(code: number): boolean {
  return code === 32 || (code >= 9 && code <= 13);
}
/** Source scalar option, preserving original name and parsed string. */
export class HTMLOption {
  /** Retains native constructor fields. @param nToken - Option kind. @param aToken - Original name. @param aValue - Unescaped value. @returns Option. */
  public constructor(
    private readonly nToken: HtmlOptionId,
    private readonly aToken: string,
    private readonly aValue: string,
  ) {}
  /** Reads original kind. @returns Kind. */
  public GetToken(): HtmlOptionId {
    return this.nToken;
  }
  /** Reads original spelling. @returns Name. */
  public GetTokenString(): string {
    return this.aToken;
  }
  /** Reads native unescaped value. @returns String. */
  public GetString(): string {
    return this.aValue;
  }
  /** Uses the existing source integer scanner and the signed32 template result domain. @returns Signed32 or zero on overflow. */
  public GetSNumber(): number {
    const units = new Uint16Array(this.aValue.length);
    for (let i = 0; i < units.length; i++) units[i] = this.aValue.charCodeAt(i);
    const value = toInt(units, units.length, 10);
    return value < -2147483648n || value > 2147483647n ? 0 : Number(value);
  }
  /** Source unsigned option conversion clamps negative signed values to zero. @returns Nonnegative value. */
  public GetNumber(): number {
    return Math.max(0, this.GetSNumber());
  }
  /** Native simplified numeral scan retains unsigned32 wraparound. @param numbers - Cleared output vector. @returns Nothing. */
  public GetNumbers(numbers: number[]): void {
    numbers.length = 0;
    let inside = false,
      value = 0;
    for (let i = 0; i < this.aValue.length; i++) {
      const code = this.aValue.charCodeAt(i);
      if (code >= 48 && code <= 57) {
        value = (value * 10 + code - 48) >>> 0;
        inside = true;
      } else if (inside) {
        numbers.push(value);
        inside = false;
        value = 0;
      }
    }
    if (inside) numbers.push(value);
  }
  /** Native named/Netscape six-digit color conversion, including skipped low punctuation. @param color - Existing color destination. @returns Nothing. */
  public GetColor(color: Color): void {
    let value =
      this.aValue !== "" && this.aValue[0] !== "#" ? GetHTMLColor(this.aValue) : 0xffffffff;
    if (value === 0xffffffff) {
      value = 0;
      let position = 0;
      for (let i = 0; i < 6; i++) {
        let code = position < this.aValue.length ? this.aValue.charCodeAt(position++) : 48;
        if (code < 48) {
          code = position < this.aValue.length ? this.aValue.charCodeAt(position++) : 48;
          if (code < 48)
            code = position < this.aValue.length ? this.aValue.charCodeAt(position++) : 48;
        }
        const digit =
          code >= 48 && code <= 57
            ? code - 48
            : code >= 65 && code <= 70
              ? code - 55
              : code >= 97 && code <= 102
                ? code - 87
                : 0;
        value = (value * 16 + digit) >>> 0;
      }
    }
    color.SetRed((value >>> 16) & 255);
    color.SetGreen((value >>> 8) & 255);
    color.SetBlue(value & 255);
  }
  /** Original enum lookup with zero/explicit fallback. @param entries - Native name/value pairs. @param fallback - Original default. @returns Selected value. */
  public GetEnum<T extends number>(entries: readonly (readonly [string, T])[], fallback?: T): T;
  /** Original bool/output enum lookup preserves the output on failure. @param output - Native mutable enum reference. @param entries - Original table. @returns Match. */
  public GetEnum<T extends number>(
    output: [T],
    entries: readonly (readonly [string, T])[],
  ): boolean;
  /** Binds both native template overloads without normalizing whitespace or touching output on failure. @param entriesOrOutput - Table or enum reference. @param fallbackOrEntries - Default or table. @returns Original selected enum or success flag. */
  public GetEnum<T extends number>(
    entriesOrOutput: readonly (readonly [string, T])[] | [T],
    fallbackOrEntries: T | readonly (readonly [string, T])[] = 0 as T,
  ): T | boolean {
    const output = typeof fallbackOrEntries !== "number";
    const entries = output
      ? fallbackOrEntries
      : (entriesOrOutput as readonly (readonly [string, T])[]);
    const name = htmlAsciiLower(this.aValue);
    for (const [key, value] of entries)
      if (name === htmlAsciiLower(key)) {
        if (output) {
          (entriesOrOutput as [T])[0] = value;
          return true;
        }
        return value;
      }
    return output ? false : (fallbackOrEntries as T);
  }
  /** Original table-frame enum aliases and zero fallback. @returns Native frame. */
  public GetTableFrame(): F {
    return this.GetEnum(aTableFrameOptEnums);
  }
  /** Original inner-rule enum aliases and zero fallback. @returns Native rules. */
  public GetTableRules(): R {
    return this.GetEnum(aTableRulesOptEnums);
  }
}
/** Native mutable token/option cache view shared with the lexer. */
export interface HTMLOptionContext {
  aToken: string;
  readonly maOptions: HTMLOption[];
}
/** Native backslash unescaper; doubled slashes retain one literal slash. @param context - Actual token. @returns Nothing. */
export function UnescapeToken(context: Pick<HTMLOptionContext, "aToken">): void {
  let position = 0,
    escape = false;
  while (position < context.aToken.length) {
    const old = escape;
    escape = false;
    if (context.aToken[position] === "\\" && !old) {
      context.aToken = context.aToken.slice(0, position) + context.aToken.slice(position + 1);
      escape = true;
    } else position++;
  }
}
/** Exact GetOptions scanner mutates escaped token storage and caches even unknown options. @param context - Native token/cache. @param noConvert - Source CR/LF exception. @returns Native option vector. */
export function GetOptions(
  context: HTMLOptionContext,
  noConvert?: HtmlOptionId,
): readonly HTMLOption[] {
  if (context.maOptions.length !== 0) return context.maOptions;
  let position = 0;
  while (position < context.aToken.length) {
    const first = context.aToken.charCodeAt(position);
    if ((first >= 65 && first <= 90) || (first >= 97 && first <= 122)) {
      let start = position,
        code = 0,
        value = "";
      while (position < context.aToken.length) {
        code = context.aToken.charCodeAt(position);
        if (code === 61 || !printable(code) || white(code)) break;
        position++;
      }
      const name = context.aToken.slice(start, position),
        token = GetHTMLOption(htmlAsciiLower(name));
      const strip =
        (token < HtmlOptionId.SCRIPT_START || token >= HtmlOptionId.SCRIPT_END) &&
        token !== noConvert;
      while (position < context.aToken.length) {
        code = context.aToken.charCodeAt(position);
        if (printable(code) && !white(code)) break;
        position++;
      }
      if (position !== context.aToken.length && code === 61) {
        position++;
        while (position < context.aToken.length) {
          code = context.aToken.charCodeAt(position);
          if (printable(code) && code !== 32 && code !== 9 && code !== 13 && code !== 10) break;
          position++;
        }
        if (position !== context.aToken.length) {
          let length = 0;
          start = position;
          if (code === 34 || code === 39) {
            const end = code;
            position++;
            start++;
            let done = false,
              escape = false;
            while (position < context.aToken.length && !done) {
              const old = escape;
              escape = false;
              code = context.aToken.charCodeAt(position);
              if ((code === 13 || code === 10) && strip)
                context.aToken =
                  context.aToken.slice(0, position) + context.aToken.slice(position + 1);
              else if (code === 92 && !old) {
                context.aToken =
                  context.aToken.slice(0, position) + context.aToken.slice(position + 1);
                escape = true;
              } else if ((code === 34 || code === 39) && !old && code === end) done = true;
              else {
                position++;
                length++;
              }
            }
            if (position !== context.aToken.length) position++;
          } else {
            let done = false,
              escape = false;
            while (position < context.aToken.length && !done) {
              const old = escape;
              escape = false;
              code = context.aToken.charCodeAt(position);
              if (
                (code === 32 && !old) ||
                code === 9 ||
                code === 13 ||
                code === 10 ||
                !printable(code)
              )
                done = true;
              else if (code === 92 && !old) {
                context.aToken =
                  context.aToken.slice(0, position) + context.aToken.slice(position + 1);
                escape = true;
              } else {
                position++;
                length++;
              }
            }
          }
          if (length !== 0) value = context.aToken.slice(start, start + length);
        }
      }
      context.maOptions.push(new HTMLOption(token, name, value));
    } else position++;
  }
  return context.maOptions;
}
