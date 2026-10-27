/** @fileoverview Native CSS1 token, selector and expression declarations from Writer parcss1.hxx/cxx. */
import { Color } from "../../../../tools/inc/color";
import { GetHTMLColor } from "../../../../svtools/source/svhtml/htmlkywd";
import { getToken, toInt32, toDouble } from "../../../../o3tl/inc/string_view";
import { convertToHex } from "../../../../o3tl/inc/numeric";
/** Original CSS1 scanner token order. */
export enum CSS1Token {
  NULL,
  IDENT,
  STRING,
  NUMBER,
  PERCENTAGE,
  LENGTH,
  PIXLENGTH,
  EMS,
  EMX,
  HEXCOLOR,
  DOT_W_WS,
  DOT_WO_WS,
  COLON,
  SLASH,
  PLUS,
  MINUS,
  OBRACE,
  CBRACE,
  SEMICOLON,
  COMMA,
  HASH,
  IMPORT_SYM,
  PAGE_SYM,
  IMPORTANT_SYM,
  URL,
  RGB,
}
/** Original parser state values. */
export enum CSS1ParserState {
  ACCEPTED,
  WORKING,
}
/** Original selector component order. */
export enum CSS1SelectorType {
  ELEMENT,
  ELEM_CLASS,
  CLASS,
  ID,
  PSEUDO,
  PAGE,
}
/** Adapts an immutable native string to its exact UTF16 view for existing SAL/o3tl operations. @param value - Logical native text. @returns Code-unit view. */
export function css1Units(value: string): Uint16Array {
  const units = new Uint16Array(value.length);
  for (let index = 0; index < value.length; index++) units[index] = value.charCodeAt(index);
  return units;
}
/** Native singly linked selector components. */
export class CSS1Selector {
  private m_pNext: CSS1Selector | undefined;
  /** Owns one selector component. @param m_eType - Native kind. @param m_aSelector - Original text. @returns Selector. */
  constructor(
    private readonly m_eType: CSS1SelectorType,
    private readonly m_aSelector: string,
  ) {}
  /** Returns the original component kind. @returns Kind. */
  GetType(): CSS1SelectorType {
    return this.m_eType;
  }
  /** Borrows the original selector text. @returns Text. */
  GetString(): string {
    return this.m_aSelector;
  }
  /** Transfers the next component reference. @param next - Successor. @returns Nothing. */
  SetNext(next: CSS1Selector | undefined): void {
    this.m_pNext = next;
  }
  /** Borrows the successor. @returns Next component. */
  GetNext(): ConstCSS1Selector | undefined {
    return this.m_pNext;
  }
}
/** Native declaration expression values and linked successors. */
export class CSS1Expression {
  private pNext: CSS1Expression | undefined;
  /** Owns source token/text/number/operator fields. @param eType - Token kind. @param aValue - Original value. @param nValue - Original numeric value. @param cOp - Operator connecting the predecessor. @returns Expression. */
  constructor(
    private eType: CSS1Token,
    private aValue: string,
    private nValue: number,
    private cOp = 0,
  ) {}
  /** Replaces the native value, resetting operator and successor. @param type - Kind. @param value - Text. @param number - Numeric value. @returns Nothing. */
  Set(type: CSS1Token, value: string, number: number): void {
    this.cOp = 0;
    this.eType = type;
    this.aValue = value;
    this.nValue = number;
    this.pNext = undefined;
  }
  /** Returns token kind. @returns Kind. */
  GetType(): CSS1Token {
    return this.eType;
  }
  /** Borrows original text. @returns Value. */
  GetString(): string {
    return this.aValue;
  }
  /** Returns source numeric value. @returns Value. */
  GetNumber(): number {
    return this.nValue;
  }
  /** Rounds the native unsigned length in the defined scalar domain. @returns Unsigned32 length. */
  GetULength(): number {
    return this.nValue < 0 ? 0 : Math.trunc(this.nValue + 0.5) >>> 0;
  }
  /** Rounds the native signed length in the defined scalar domain. @returns Signed32 length. */
  GetSLength(): number {
    return Math.trunc(this.nValue + (this.nValue < 0 ? -0.5 : 0.5)) | 0;
  }
  /** Returns source predecessor operator. @returns UTF16 unit or zero. */
  GetOp(): number {
    return this.cOp;
  }
  /** Transfers the native next expression. @param next - Successor. @returns Nothing. */
  SetNext(next: CSS1Expression | undefined): void {
    this.pNext = next;
  }
  /** Borrows the successor. @returns Expression or undefined. */
  GetNext(): ConstCSS1Expression | undefined {
    return this.pNext;
  }
  /** Fills the original URL output, preserving the source single-quote-only stripping sequence. @param output - Existing mutable string output. @returns Nothing. */
  GetURL(output: { value: string }): void {
    if (this.aValue.length <= 5) return;
    let url = this.aValue.slice(4, -1);
    for (const unit of [" ", "'", " "]) {
      let start = 0,
        end = url.length;
      while (start < end && url[start] === unit) start++;
      while (end > start && url[end - 1] === unit) end--;
      url = url.slice(start, end);
    }
    output.value = url;
  }
  /** Mutates actual Color fields using the original RGB/RGBA, HTML-name and hex branches. @param color - Caller-owned native color. @returns Source success flag. */
  GetColor(color: Color): boolean {
    let success = false,
      numeric = 0xffffffff;
    if (this.eType === CSS1Token.RGB) {
      const value = this.aValue,
        lower = value.slice(0, 4).toLowerCase();
      if (
        value.slice(0, 3).toLowerCase() !== "rgb" ||
        value.length < 6 ||
        (value[3] !== "(" && value[4] !== "(") ||
        value.at(-1) !== ")"
      )
        return false;
      const components = [0, 0, 0, 255],
        position: [number] = [lower === "rgba" ? 5 : 4],
        units = css1Units(value);
      const separator = value.includes(",") ? 44 : 32,
        alphaSlash = value.includes("/");
      for (let channel = 0; channel < 4 && position[0] > 0; channel++) {
        const token = getToken(units, separator, position);
        let number = toInt32(token);
        if (number < 0) number = 0;
        else if (token.includes(37)) number = Math.trunc((Math.min(number, 100) * 255) / 100);
        else if (number > 255) number = 255;
        else if (token.includes(46)) number = Math.trunc(255 * toDouble(token)) | 0;
        components[channel] = number & 255;
        if (alphaSlash && channel === 2)
          while (value[position[0]] === "/" || value[position[0]] === " ") position[0]++;
      }
      color.SetRed(components[0] as number);
      color.SetGreen(components[1] as number);
      color.SetBlue(components[2] as number);
      color.SetAlpha(components[3] as number);
      success = true;
    } else if (this.eType === CSS1Token.IDENT || this.eType === CSS1Token.STRING) {
      numeric = GetHTMLColor(this.aValue);
      success = numeric !== 0xffffffff;
      if (!success && this.eType === CSS1Token.STRING && this.aValue.startsWith("#")) {
        numeric = this.HexColor(1);
        success = true;
      }
    } else if (this.eType === CSS1Token.HEXCOLOR) {
      numeric = this.HexColor(0);
      success = true;
    }
    if (success && numeric !== 0xffffffff) {
      color.SetRed((numeric >>> 16) & 255);
      color.SetGreen((numeric >>> 8) & 255);
      color.SetBlue(numeric & 255);
    }
    return success;
  }
  /** Executes the native padded/repeated hex-color loop. @param offset - String hash offset. @returns Original RGB bits. */
  private HexColor(offset: number): number {
    const double = this.aValue.length - offset === 3,
      end = (double ? 3 : 6) + offset;
    let result = 0;
    for (let index = offset; index < end; index++) {
      const value = convertToHex(
        index < this.aValue.length ? this.aValue.charCodeAt(index) : 48,
        undefined,
        16,
        16,
      );
      result *= 16;
      if (value < 16) result += value;
      if (double) {
        result *= 16;
        if (value < 16) result += value;
      }
    }
    return result >>> 0;
  }
}

/** Native borrowed const selector pointer; no extra runtime object is allocated. */
export type ConstCSS1Selector = Omit<CSS1Selector, "SetNext">;
/** Native borrowed const expression pointer; actual root owners remain mutable. */
export type ConstCSS1Expression = Omit<CSS1Expression, `Set${string}`>;
