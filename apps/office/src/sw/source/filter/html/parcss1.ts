/** @fileoverview Ports Writer's native CSS1 scanner and callback grammar from parcss1.cxx. */
import {
  CSS1Token as T,
  CSS1ParserState as S,
  CSS1SelectorType as K,
  CSS1Selector,
  CSS1Expression,
  css1Units,
} from "./parcss1.h";
import { toDouble, toUInt32 } from "../../../../o3tl/inc/string_view";
import { convert, Length } from "../../../../o3tl/inc/unit_conversion";
/** Native UTF16 EOF sentinel. */
const EOF = 0xffff;
/** ASCII identifier-start predicate. @param c - UTF16 unit. @returns Source classification. */
function alpha(c: number): boolean {
  return (c >= 65 && c <= 90) || (c >= 97 && c <= 122);
}
/** ASCII numeric predicate. @param c - UTF16 unit. @returns Source classification. */
function digit(c: number): boolean {
  return c >= 48 && c <= 57;
}
/** ASCII identifier continuation. @param c - UTF16 unit. @returns Source classification. */
function identifier(c: number): boolean {
  return alpha(c) || digit(c) || c === 45;
}
/** ASCII hexadecimal predicate. @param c - UTF16 unit. @returns Source classification. */
function hex(c: number): boolean {
  return digit(c) || (c >= 65 && c <= 70) || (c >= 97 && c <= 102);
}
/** Native whitespace used before numeric units and important keywords. @param c - UTF16 unit. @returns Source classification. */
function extendedSpace(c: number): boolean {
  return c === 32 || (c >= 9 && c <= 13);
}
/** Native stylesheet-edge/scanner whitespace subset. @param c - UTF16 unit. @returns Source classification. */
function space(c: number): boolean {
  return c === 32 || c === 9 || c === 13 || c === 10;
}
/** Consumed original five-field scanner rewind state. */
type InputPosition = readonly [number, number, number, number, boolean];
/** Native CSS1 parser; selectors and expressions are delivered at their original parse points. */
export class CSS1Parser {
  private m_bWhiteSpace = false;
  private m_bEOF = false;
  private m_cNextCh = 0;
  private m_nInPos = 0;
  private m_nlLineNr = 0;
  private m_nlLinePos = 0;
  private m_nValue = 0;
  private m_eState = S.ACCEPTED;
  private m_nToken = T.NULL;
  private m_aIn = "";
  private m_aToken = "";
  /** Resets the source read fields and primes the first token. @param input - Original style text. @returns Nothing. */
  private InitRead(input: string): void {
    this.m_nlLineNr = 0;
    this.m_nlLinePos = 0;
    this.m_bWhiteSpace = true;
    this.m_bEOF = false;
    this.m_eState = S.WORKING;
    this.m_nValue = 0;
    this.m_aIn = input;
    this.m_nInPos = 0;
    this.m_cNextCh = this.GetNextChar();
    this.m_nToken = this.GetNextToken();
  }
  /** Returns the next native UTF16 unit, preserving original EOF and line positions. @returns Unit. */
  private GetNextChar(): number {
    if (this.m_nInPos >= this.m_aIn.length) {
      this.m_bEOF = true;
      return EOF;
    }
    const c = this.m_aIn.charCodeAt(this.m_nInPos++);
    if (c === 10) {
      this.m_nlLineNr = (this.m_nlLineNr + 1) >>> 0;
      this.m_nlLinePos = 1;
    } else this.m_nlLinePos = (this.m_nlLinePos + 1) >>> 0;
    return c;
  }
  /** Copies only the native fields saved around hex/unit lookahead. @returns Source rewind fields. */
  private SaveInput(): InputPosition {
    return [this.m_nInPos, this.m_cNextCh, this.m_nlLineNr, this.m_nlLinePos, this.m_bEOF];
  }
  /** Restores original lookahead without rolling back whitespace. @param value - Source saved fields. @returns Nothing. */
  private RestoreInput(value: InputPosition): void {
    [this.m_nInPos, this.m_cNextCh, this.m_nlLineNr, this.m_nlLinePos, this.m_bEOF] = value;
  }
  /** Scans the original CSS1 identifier continuation. @param lower - Fold ASCII during the unit probe. @returns Original/folded token. */
  private ScanIdentifier(lower = false): string {
    let value = "";
    do {
      const c = this.m_cNextCh;
      value += String.fromCharCode(lower && c >= 65 && c <= 90 ? c + 32 : c);
      this.m_cNextCh = this.GetNextChar();
    } while (identifier(this.m_cNextCh) && !this.m_bEOF);
    return value;
  }
  /** Executes the native context-independent lexer, including its original fallback and rewind branches. @returns Next token. */
  private GetNextToken(): T {
    let result = T.NULL;
    this.m_aToken = "";
    do {
      const previousSpace = this.m_bWhiteSpace;
      this.m_bWhiteSpace = false;
      let next = true;
      const c = this.m_cNextCh;
      if (c === 47) {
        this.m_cNextCh = this.GetNextChar();
        if (this.m_cNextCh === 42) {
          this.m_cNextCh = this.GetNextChar();
          let asterisk = false;
          while (!(asterisk && this.m_cNextCh === 47) && !this.m_bEOF) {
            asterisk = this.m_cNextCh === 42;
            this.m_cNextCh = this.GetNextChar();
          }
        } else {
          next = false;
          result = T.SLASH;
        }
      } else if (c === 64) {
        this.m_cNextCh = this.GetNextChar();
        if (alpha(this.m_cNextCh)) {
          this.m_aToken += this.ScanIdentifier();
          const lower = this.m_aToken.toLowerCase();
          if (lower === "import") result = T.IMPORT_SYM;
          else if (lower === "page") result = T.PAGE_SYM;
          if (result === T.NULL) {
            this.m_aToken = "";
            let depth = 0,
              quote = 0,
              done = false,
              escape = false;
            while (!done && !this.m_bEOF) {
              const escaped = escape;
              escape = false;
              switch (this.m_cNextCh) {
                case 123:
                  if (!quote && !escaped) depth++;
                  break;
                case 59:
                  if (!quote && !escaped) done = depth === 0;
                  break;
                case 125:
                  if (!quote && !escaped) done = --depth === 0;
                  break;
                case 34:
                case 39:
                  if (!escaped) {
                    if (quote) {
                      if (quote === this.m_cNextCh) quote = 0;
                    } else quote = this.m_cNextCh;
                  }
                  break;
                case 92:
                  if (!escaped) escape = true;
                  break;
              }
              this.m_cNextCh = this.GetNextChar();
            }
          }
          next = false;
        }
      } else if (c === 33) {
        this.m_cNextCh = this.GetNextChar();
        while (extendedSpace(this.m_cNextCh) && !this.m_bEOF) {
          this.m_bWhiteSpace = true;
          this.m_cNextCh = this.GetNextChar();
        }
        if (this.m_cNextCh === 105 || this.m_cNextCh === 73) {
          this.m_aToken += this.ScanIdentifier();
          result = this.m_aToken.toLowerCase() === "important" ? T.IMPORTANT_SYM : T.IDENT;
          this.m_bWhiteSpace = false;
          next = false;
        } else next = false;
      } else if (c === 34 || c === 39) {
        this.m_cNextCh = this.GetNextChar();
        do {
          this.m_aToken += String.fromCharCode(this.m_cNextCh);
          this.m_cNextCh = this.GetNextChar();
        } while (this.m_cNextCh !== c && !this.m_bEOF);
        result = T.STRING;
      } else if (digit(c)) {
        const saved = this.SaveInput();
        let probe = "";
        do {
          probe += String.fromCharCode(this.m_cNextCh);
          this.m_cNextCh = this.GetNextChar();
        } while (probe.length < 7 && hex(this.m_cNextCh) && !this.m_bEOF);
        if (probe.length === 6) {
          this.m_aToken += probe;
          result = T.HEXCOLOR;
          next = false;
        } else {
          this.RestoreInput(saved);
          do {
            this.m_aToken += String.fromCharCode(this.m_cNextCh);
            this.m_cNextCh = this.GetNextChar();
          } while ((digit(this.m_cNextCh) || this.m_cNextCh === 46) && !this.m_bEOF);
          this.m_nValue = toDouble(css1Units(this.m_aToken));
          while (extendedSpace(this.m_cNextCh) && !this.m_bEOF) {
            this.m_bWhiteSpace = true;
            this.m_cNextCh = this.GetNextChar();
          }
          if (this.m_cNextCh === 37) {
            this.m_bWhiteSpace = false;
            result = T.PERCENTAGE;
          } else if ([99, 67, 101, 69, 105, 73, 112, 80, 109, 77].includes(this.m_cNextCh)) {
            const old = this.SaveInput(),
              unit = this.ScanIdentifier(true);
            result = T.NUMBER;
            switch (unit) {
              case "cm":
                this.m_nValue = convert(this.m_nValue, Length.cm, Length.twip);
                result = T.LENGTH;
                break;
              case "em":
                result = T.EMS;
                break;
              case "ex":
                result = T.EMX;
                break;
              case "in":
                this.m_nValue = convert(this.m_nValue, Length.in, Length.twip);
                result = T.LENGTH;
                break;
              case "mm":
                this.m_nValue = convert(this.m_nValue, Length.mm, Length.twip);
                result = T.LENGTH;
                break;
              case "pt":
                this.m_nValue = convert(this.m_nValue, Length.pt, Length.twip);
                result = T.LENGTH;
                break;
              case "pc":
                this.m_nValue = convert(this.m_nValue, Length.pc, Length.twip);
                result = T.LENGTH;
                break;
              case "px":
                result = T.PIXLENGTH;
                break;
            }
            if (result === T.NUMBER) this.RestoreInput(old);
            else this.m_bWhiteSpace = false;
            next = false;
          } else {
            next = false;
            result = T.NUMBER;
          }
        }
      } else if (c === 58) result = T.COLON;
      else if (c === 46) result = previousSpace ? T.DOT_W_WS : T.DOT_WO_WS;
      else if (c === 43) result = T.PLUS;
      else if (c === 45) result = T.MINUS;
      else if (c === 123) result = T.OBRACE;
      else if (c === 125) result = T.CBRACE;
      else if (c === 59) result = T.SEMICOLON;
      else if (c === 44) result = T.COMMA;
      else if (c === 35) {
        this.m_cNextCh = this.GetNextChar();
        if (hex(this.m_cNextCh)) {
          const saved = this.SaveInput();
          let probe = "";
          do {
            probe += String.fromCharCode(this.m_cNextCh);
            this.m_cNextCh = this.GetNextChar();
          } while (probe.length < 9 && hex(this.m_cNextCh) && !this.m_bEOF);
          if (probe.length === 6 || probe.length === 3) {
            this.m_aToken += probe;
            result = T.HEXCOLOR;
            next = false;
          } else if (probe.length === 8) {
            const value = toUInt32(css1Units(probe), 16),
              alpha = (value & 255) / 255;
            const red = Math.trunc((1 - alpha) * 255 + alpha * ((value >>> 24) & 255));
            const green = Math.trunc((1 - alpha) * 255 + alpha * ((value >>> 16) & 255));
            const blue = Math.trunc((1 - alpha) * 255 + alpha * ((value >>> 8) & 255));
            this.m_aToken += ((red << 16) + (green << 8) + blue).toString(16);
            result = T.HEXCOLOR;
            next = false;
          } else this.RestoreInput(saved);
        }
        if (result === T.NULL) {
          result = T.HASH;
          next = false;
        }
      } else if (space(c)) this.m_bWhiteSpace = true;
      else if (c === EOF && this.m_bEOF) {
        this.m_eState = S.ACCEPTED;
        next = false;
      } else if (alpha(c)) {
        let isHex = true,
          value = "";
        do {
          value += String.fromCharCode(this.m_cNextCh);
          if (isHex) isHex = value.length < 7 && hex(this.m_cNextCh);
          this.m_cNextCh = this.GetNextChar();
        } while (identifier(this.m_cNextCh) && !this.m_bEOF);
        this.m_aToken += value;
        if (isHex && value.length === 6) {
          next = false;
          result = T.HEXCOLOR;
        } else if (
          this.m_cNextCh === 40 &&
          ["url", "rgb", "rgba"].includes(this.m_aToken.toLowerCase())
        ) {
          let depth = 0,
            value = "";
          do {
            value += String.fromCharCode(this.m_cNextCh);
            if (this.m_cNextCh === 40) depth++;
            else if (this.m_cNextCh === 41) depth--;
            this.m_cNextCh = this.GetNextChar();
          } while ((depth > 1 || this.m_cNextCh !== 41) && !this.m_bEOF);
          value += String.fromCharCode(this.m_cNextCh);
          this.m_aToken += value;
          next = true;
          result = this.m_aToken[0] === "u" || this.m_aToken[0] === "U" ? T.URL : T.RGB;
        } else {
          next = false;
          result = T.IDENT;
        }
      }
      if (next) this.m_cNextCh = this.GetNextChar();
    } while (result === T.NULL && this.m_eState === S.WORKING);
    return result;
  }
  /** Parses original import/rule loops or initializes their string overload. @param input - Optional native style element. @returns Nothing. */
  protected ParseStyleSheet(input?: string): void {
    if (input !== undefined) {
      let first = 0,
        last = input.length;
      while (first < last && space(input.charCodeAt(first))) first++;
      while (last > first && space(input.charCodeAt(last - 1))) last--;
      let value = input.slice(first, last);
      if (value.startsWith("<!--")) value = value.slice(4);
      if (value.endsWith("-->")) value = value.slice(0, -3);
      if (!value.length) return;
      this.InitRead(value);
    }
    let done = false,
      old = 0x7fffffff;
    while (!done && this.m_eState === S.WORKING) {
      if (old === this.m_nInPos && this.m_cNextCh !== EOF) break;
      old = this.m_nInPos;
      if (this.m_nToken === T.IMPORT_SYM) this.m_nToken = this.GetNextToken();
      else if ([T.IDENT, T.DOT_W_WS, T.HASH, T.PAGE_SYM].includes(this.m_nToken)) done = true;
      if (!done) this.m_nToken = this.GetNextToken();
    }
    old = 0x7fffffff;
    while (this.m_eState === S.WORKING) {
      if (old === this.m_nInPos && this.m_cNextCh !== EOF) break;
      old = this.m_nInPos;
      if ([T.IDENT, T.DOT_W_WS, T.HASH, T.PAGE_SYM].includes(this.m_nToken)) this.ParseRule();
      else this.m_nToken = this.GetNextToken();
    }
  }
  /** Parses original inline declarations and native malformed-property recovery. @param input - Style option text. @returns Nothing. */
  protected ParseStyleOption(input: string): void {
    if (!input.length) return;
    this.InitRead(input);
    while (this.m_nToken === T.SEMICOLON) this.m_nToken = this.GetNextToken();
    const property = { value: "" };
    let expression = this.ParseDeclaration(property);
    if (expression === undefined) return;
    this.DeclarationParsed(property.value, expression);
    let old = 0x7fffffff;
    while (this.m_nToken === T.SEMICOLON && this.m_eState === S.WORKING) {
      if (old === this.m_nInPos && this.m_cNextCh !== EOF) break;
      old = this.m_nInPos;
      this.m_nToken = this.GetNextToken();
      if (this.m_nToken === T.IDENT) {
        expression = this.ParseDeclaration(property);
        if (expression !== undefined) this.DeclarationParsed(property.value, expression);
      } else
        while (this.m_nToken !== T.SEMICOLON && this.m_eState === S.WORKING)
          this.m_nToken = this.GetNextToken();
    }
  }
  /** Parses the source selector/declaration rule sequence, retaining callback timing before brace validation. @returns Nothing. */
  private ParseRule(): void {
    let selector = this.ParseSelector();
    if (selector === undefined) return;
    this.SelectorParsed(selector, true);
    let old = 0x7fffffff;
    while (this.m_nToken === T.COMMA && this.m_eState === S.WORKING) {
      if (old === this.m_nInPos && this.m_cNextCh !== EOF) break;
      old = this.m_nInPos;
      this.m_nToken = this.GetNextToken();
      selector = this.ParseSelector();
      if (selector === undefined) return;
      this.SelectorParsed(selector, false);
    }
    if (this.m_nToken !== T.OBRACE) return;
    this.m_nToken = this.GetNextToken();
    const property = { value: "" };
    let expression = this.ParseDeclaration(property);
    if (expression === undefined) return;
    this.DeclarationParsed(property.value, expression);
    old = 0x7fffffff;
    while (this.m_nToken === T.SEMICOLON && this.m_eState === S.WORKING) {
      if (old === this.m_nInPos && this.m_cNextCh !== EOF) break;
      old = this.m_nInPos;
      this.m_nToken = this.GetNextToken();
      if (this.m_nToken === T.IDENT) {
        expression = this.ParseDeclaration(property);
        if (expression !== undefined) this.DeclarationParsed(property.value, expression);
      }
    }
    if (this.m_nToken === T.CBRACE) this.m_nToken = this.GetNextToken();
  }
  /** Builds native linked selector components and the optional final pseudo component. @returns First component or undefined. */
  private ParseSelector(): CSS1Selector | undefined {
    let root: CSS1Selector | undefined,
      last: CSS1Selector | undefined,
      done = false,
      old = 0x7fffffff;
    while (!done && this.m_eState === S.WORKING) {
      if (old === this.m_nInPos && this.m_cNextCh !== EOF) break;
      old = this.m_nInPos;
      let next = true,
        component: CSS1Selector | undefined;
      switch (this.m_nToken) {
        case T.IDENT: {
          let value = this.m_aToken,
            type = K.ELEMENT;
          this.m_nToken = this.GetNextToken();
          if (this.m_nToken === T.DOT_WO_WS) {
            this.m_nToken = this.GetNextToken();
            if (this.m_nToken !== T.IDENT) return root;
            value += "." + this.m_aToken;
            type = K.ELEM_CLASS;
          } else next = false;
          component = new CSS1Selector(type, value);
          break;
        }
        case T.DOT_W_WS:
          this.m_nToken = this.GetNextToken();
          if (this.m_nToken !== T.IDENT) return root;
          component = new CSS1Selector(K.CLASS, this.m_aToken);
          break;
        case T.HASH:
          this.m_nToken = this.GetNextToken();
          if (this.m_nToken !== T.IDENT) return root;
          component = new CSS1Selector(K.ID, this.m_aToken);
          break;
        case T.PAGE_SYM:
          component = new CSS1Selector(K.PAGE, this.m_aToken);
          break;
        default:
          done = true;
          break;
      }
      if (component !== undefined) {
        if (last !== undefined) last.SetNext(component);
        else root = component;
        last = component;
      }
      if (next && !done) this.m_nToken = this.GetNextToken();
    }
    if (root === undefined) return root;
    if (this.m_nToken === T.COLON && this.m_eState === S.WORKING) {
      this.m_nToken = this.GetNextToken();
      if (this.m_nToken === T.IDENT) {
        last?.SetNext(new CSS1Selector(K.PSEUDO, this.m_aToken));
        this.m_nToken = this.GetNextToken();
      }
    }
    return root;
  }
  /** Builds original linked terms, numeric unary signs, predecessor operators and ignored priority marker. @param property - Original output name. @returns First term or undefined. */
  private ParseDeclaration(property: { value: string }): CSS1Expression | undefined {
    let root: CSS1Expression | undefined, last: CSS1Expression | undefined;
    if (this.m_nToken !== T.IDENT) return root;
    property.value = this.m_aToken;
    this.m_nToken = this.GetNextToken();
    if (this.m_nToken !== T.COLON) return root;
    this.m_nToken = this.GetNextToken();
    let done = false,
      sign = 0,
      op = 0,
      old = 0x7fffffff;
    while (!done && this.m_eState === S.WORKING) {
      if (old === this.m_nInPos && this.m_cNextCh !== EOF) break;
      old = this.m_nInPos;
      let expression: CSS1Expression | undefined;
      if (this.m_nToken === T.MINUS) sign = 45;
      else if (this.m_nToken === T.PLUS) sign = 43;
      else if (
        [
          T.NUMBER,
          T.LENGTH,
          T.PIXLENGTH,
          T.EMS,
          T.EMX,
          T.STRING,
          T.PERCENTAGE,
          T.IDENT,
          T.URL,
          T.RGB,
          T.HEXCOLOR,
        ].includes(this.m_nToken)
      ) {
        if ([T.NUMBER, T.LENGTH, T.PIXLENGTH, T.EMS, T.EMX].includes(this.m_nToken) && sign === 45)
          this.m_nValue = -this.m_nValue;
        expression = new CSS1Expression(this.m_nToken, this.m_aToken, this.m_nValue, op);
        this.m_nValue = 0;
        sign = 0;
        op = 0;
      } else if (this.m_nToken === T.SLASH) {
        op = 47;
        sign = 0;
      } else if (this.m_nToken === T.COMMA) {
        op = 44;
        sign = 0;
      } else done = true;
      if (expression !== undefined) {
        if (last !== undefined) last.SetNext(expression);
        else root = expression;
        last = expression;
      }
      if (!done) this.m_nToken = this.GetNextToken();
    }
    if (root === undefined) return root;
    if (this.m_nToken === T.IMPORTANT_SYM) this.m_nToken = this.GetNextToken();
    return root;
  }
  /** Native empty virtual selector callback. @param selector - Owned source chain. @param first - Starts a selector group. @returns Nothing. */
  protected SelectorParsed(selector: CSS1Selector, first: boolean): void {
    void selector;
    void first;
  }
  /** Native empty virtual declaration callback. @param property - Original name. @param expression - Owned source terms. @returns Nothing. */
  protected DeclarationParsed(property: string, expression: CSS1Expression): void {
    void property;
    void expression;
  }
}
