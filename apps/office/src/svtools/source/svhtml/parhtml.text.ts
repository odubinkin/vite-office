/** @fileoverview Native HTML ScanText entity, quote and whitespace automaton from parhtml.cxx. */
import { HtmlTokenId as T } from "../../inc/htmltokn";
import { IsControlChar } from "../../../svl/inc/lngmisc";
import { GetHTMLCharName } from "./htmlkywd";
/** Source ASCII alpha predicate. @param code - Scalar. @returns Alpha. */
export function htmlAlpha(code: number): boolean {
  return (code >= 65 && code <= 90) || (code >= 97 && code <= 122);
}
/** Source ASCII digit predicate. @param code - Scalar. @returns Digit. */
export function htmlDigit(code: number): boolean {
  return code >= 48 && code <= 57;
}
/** Source HTML_ISSPACE excludes form feed. @param code - Scalar. @returns HTML whitespace. */
export function htmlSpace(code: number): boolean {
  return code === 32 || code === 9 || code === 13 || code === 10 || code === 11;
}
/** Original linguistic control predicate. @param code - Scalar. @returns Control. */
export function htmlControl(code: number): boolean {
  return IsControlChar(code);
}
/** Native shared character/token state consumed by all scanner phases. */
export interface HTMLTextContext {
  nNextCh: number;
  aToken: string;
  bReadXMP: boolean;
  bReadListing: boolean;
  bReadPRE: boolean;
  bReadTextArea: boolean;
  m_bPreserveSpaces: boolean;
  readonly eof: boolean;
  GetNextChar(): number;
  GetCharSize(): number;
  GetLineNr(): number;
  GetLinePos(): number;
  SetLineNr(value: number): void;
  SetLinePos(value: number): void;
  ClearTxtConvContext(): void;
  ConvertEntityCharacter(character: number): number;
  Tell(): number;
  Seek(position: number): void;
}
/** Native UTF-32 append, including source surrogate admission for raw input units. @param code - Scalar. @returns UTF-16 text. */
function unit(code: number): string {
  return String.fromCodePoint(code);
}
/** Exact source text scanner over the parser's synchronous character stream. @param ctx - Actual parser. @param cBreak - Zero for text, greater-than for options. @returns Native token. */
export function ScanText(ctx: HTMLTextContext, cBreak = 0): T {
  let buffer = "",
    more = true,
    eq = false,
    quote = 0;
  while (more) {
    let next = true;
    switch (ctx.nNextCh) {
      case 38: {
        eq = false;
        if (ctx.bReadXMP) buffer += "&";
        else {
          const position = ctx.Tell(),
            linePosition = ctx.GetLinePos();
          let code = 0;
          ctx.nNextCh = ctx.GetNextChar();
          if (ctx.nNextCh === 35) {
            ctx.nNextCh = ctx.GetNextChar();
            const hex = ctx.nNextCh === 120;
            if (hex || htmlDigit(ctx.nNextCh)) {
              if (hex) {
                ctx.nNextCh = ctx.GetNextChar();
                while (
                  htmlDigit(ctx.nNextCh) ||
                  (ctx.nNextCh >= 65 && ctx.nNextCh <= 70) ||
                  (ctx.nNextCh >= 97 && ctx.nNextCh <= 102)
                ) {
                  code =
                    (code * 16 +
                      (ctx.nNextCh <= 57
                        ? ctx.nNextCh - 48
                        : ctx.nNextCh <= 70
                          ? ctx.nNextCh - 55
                          : ctx.nNextCh - 87)) >>>
                    0;
                  ctx.nNextCh = ctx.GetNextChar();
                }
              } else {
                do {
                  code = (code * 10 + ctx.nNextCh - 48) >>> 0;
                  ctx.nNextCh = ctx.GetNextChar();
                } while (htmlDigit(ctx.nNextCh));
              }
            } else ctx.nNextCh = 0;
            code = ctx.ConvertEntityCharacter(code);
            if (
              code > 0x10ffff ||
              (code >= 0xd800 && code <= 0xdfff) ||
              (htmlControl(code) && code !== 13 && code !== 10 && code !== 9)
            )
              code = 63;
          } else if (htmlAlpha(ctx.nNextCh)) {
            let entity = "";
            do {
              entity += unit(ctx.nNextCh);
              ctx.nNextCh = ctx.GetNextChar();
            } while (
              entity.length < 8 &&
              (htmlAlpha(ctx.nNextCh) || htmlDigit(ctx.nNextCh)) &&
              !ctx.eof
            );
            if (!ctx.eof) {
              code = GetHTMLCharName(entity);
              if (code === 0 && ctx.nNextCh !== 59) {
                for (let length = entity.length - 1; length > 1; length--) {
                  const found = GetHTMLCharName(entity.slice(0, length));
                  if (found !== 0) {
                    code = found;
                    ctx.Seek(ctx.Tell() - (entity.length - length) * ctx.GetCharSize());
                    ctx.SetLinePos(ctx.GetLinePos() - (entity.length - length));
                    ctx.ClearTxtConvContext();
                    ctx.nNextCh = entity.charCodeAt(length);
                    break;
                  }
                }
              }
              if (code === 0) {
                buffer += "&";
                ctx.Seek(position);
                ctx.SetLinePos(linePosition);
                ctx.ClearTxtConvContext();
                break;
              }
              if (code === 1 || code === 2) {
                if (cBreak === 62) code = code === 1 ? 32 : 45;
                else {
                  ctx.aToken += buffer;
                  if (ctx.aToken !== "") {
                    ctx.nNextCh = 38;
                    ctx.Seek(position);
                    ctx.SetLinePos(linePosition);
                    ctx.ClearTxtConvContext();
                    return T.TEXTTOKEN;
                  }
                  if (ctx.nNextCh !== 59) ctx.aToken += " ";
                  return code === 1 ? T.NONBREAKSPACE : T.SOFTHYPH;
                }
              }
            } else ctx.nNextCh = 0;
          } else {
            buffer += "&";
            next = false;
            break;
          }
          next = ctx.nNextCh === 59;
          if (cBreak === 62 && (code === 92 || code === 39 || code === 34 || code === 32))
            buffer += "\\";
          if (code !== 0) buffer += unit(code);
        }
        break;
      }
      case 61:
        if (cBreak === 62 && quote === 0) eq = true;
        buffer += "=";
        break;
      case 92:
        if (cBreak === 62) buffer += "\\";
        buffer += "\\";
        break;
      case 34:
      case 39:
        if (cBreak === 62) {
          if (eq) quote = ctx.nNextCh;
          else if (quote !== 0 && quote === ctx.nNextCh) quote = 0;
        }
        buffer += unit(ctx.nNextCh);
        eq = false;
        break;
      case 0xffff:
        if (ctx.eof) more = false;
        break;
      case 60:
        eq = false;
        if (cBreak === 62) buffer += "<";
        else more = false;
        break;
      case 12:
        if (cBreak === 62) buffer += " ";
        else more = false;
        break;
      default: {
        const code = ctx.nNextCh;
        if (code === 13 || code === 10) {
          if (cBreak === 62) {
            buffer += unit(code);
            break;
          }
          if (ctx.bReadListing || ctx.bReadXMP || ctx.bReadPRE || ctx.bReadTextArea) {
            more = false;
            break;
          }
        }
        if (code === 9 && ctx.bReadPRE && cBreak !== 62) {
          more = false;
          break;
        }
        if (code === 11 && (ctx.bReadPRE || ctx.bReadXMP || ctx.bReadListing) && cBreak !== 62)
          break;
        if (code === 32 || code === 9 || code === 10 || code === 11 || code === 13) {
          if (!ctx.m_bPreserveSpaces) {
            if (code !== 32) ctx.nNextCh = 32;
            buffer += unit(ctx.nNextCh);
            if (
              cBreak !== 62 &&
              !ctx.bReadListing &&
              !ctx.bReadXMP &&
              !ctx.bReadPRE &&
              !ctx.bReadTextArea
            ) {
              do {
                ctx.nNextCh = ctx.GetNextChar();
                if (ctx.nNextCh === 0xffff && ctx.eof) {
                  if (ctx.aToken !== "" || buffer.length > 1) {
                    ctx.aToken += buffer;
                    return T.TEXTTOKEN;
                  }
                  return T.NONE;
                }
              } while (htmlSpace(ctx.nNextCh));
              next = false;
            }
            break;
          }
        }
        eq = false;
        if (ctx.nNextCh === cBreak && quote === 0) more = false;
        else {
          do {
            if (!htmlControl(ctx.nNextCh) || htmlSpace(ctx.nNextCh)) buffer += unit(ctx.nNextCh);
            ctx.nNextCh = ctx.GetNextChar();
            if (ctx.nNextCh === 0xffff && ctx.eof) {
              ctx.aToken += buffer;
              return T.TEXTTOKEN;
            }
          } while (htmlAlpha(ctx.nNextCh) || htmlDigit(ctx.nNextCh));
          next = false;
        }
      }
    }
    if (more && next) ctx.nNextCh = ctx.GetNextChar();
  }
  ctx.aToken += buffer;
  return T.TEXTTOKEN;
}
