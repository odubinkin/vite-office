/** @fileoverview Native HTML raw script/style/end-token scanner from parhtml.cxx. */
import { HtmlTokenId as T } from "../../inc/htmltokn";
import { htmlAsciiLower } from "./htmlkywd";
import { htmlAlpha, htmlControl, type HTMLTextContext } from "./parhtml.text";
/** Shared native raw scanner flags, not an independent token buffer. */
export interface HTMLRawContext extends HTMLTextContext {
  bReadScript: boolean;
  bReadStyle: boolean;
  bReadComment: boolean;
  bEndTokenFound: boolean;
  aEndToken: string;
}
/** Direct source raw-data scan, retaining comment state and deferred end-token consumption. @param ctx - Actual parser. @returns Native raw/none token. */
export function GetNextRawToken(ctx: HTMLRawContext): T {
  if (ctx.bEndTokenFound) {
    ctx.bReadScript = false;
    ctx.bReadStyle = false;
    ctx.aEndToken = "";
    ctx.bEndTokenFound = false;
    return T.NONE;
  }
  let buffer = "",
    more = true,
    token = T.RAWDATA;
  while (more) {
    let next = true;
    switch (ctx.nNextCh) {
      case 60: {
        ctx.aToken += buffer;
        buffer = "";
        const position = ctx.Tell(),
          lineNumber = ctx.GetLineNr(),
          linePosition = ctx.GetLinePos();
        let off = false;
        ctx.nNextCh = ctx.GetNextChar();
        if (ctx.nNextCh === 47) {
          off = true;
          ctx.nNextCh = ctx.GetNextChar();
        } else if (ctx.nNextCh === 33) {
          buffer += "!";
          ctx.nNextCh = ctx.GetNextChar();
        }
        while ((htmlAlpha(ctx.nNextCh) || ctx.nNextCh === 45) && buffer.length < 1024) {
          buffer += String.fromCodePoint(ctx.nNextCh);
          ctx.nNextCh = ctx.GetNextChar();
        }
        const tag = htmlAsciiLower(buffer);
        let done = false;
        if (ctx.bReadScript || ctx.aEndToken !== "") {
          if (!ctx.bReadComment) {
            if (tag.startsWith("!--")) ctx.bReadComment = true;
            else done = off && tag === (ctx.bReadScript ? "script" : ctx.aEndToken);
          }
          if (ctx.bReadComment && ctx.nNextCh === 62 && tag.endsWith("--"))
            ctx.bReadComment = false;
        } else done = off ? tag === "style" || tag === "head" : tag === "body";
        if (done) {
          more = false;
          if (ctx.aToken === "" && (ctx.bReadStyle || ctx.bReadScript)) {
            ctx.bReadScript = false;
            ctx.bReadStyle = false;
            ctx.aEndToken = "";
            token = T.NONE;
          } else ctx.bEndTokenFound = true;
          ctx.Seek(position);
          ctx.SetLineNr(lineNumber);
          ctx.SetLinePos(linePosition);
          ctx.ClearTxtConvContext();
          ctx.nNextCh = 60;
          buffer = "";
        } else {
          ctx.aToken += "<" + (off ? "/" : "");
          next = false;
        }
        break;
      }
      case 45:
        buffer += "-";
        if (ctx.bReadComment) {
          let two = false;
          ctx.nNextCh = ctx.GetNextChar();
          while (ctx.nNextCh === 45) {
            two = true;
            buffer += "-";
            ctx.nNextCh = ctx.GetNextChar();
          }
          if (ctx.nNextCh === 62 && two) ctx.bReadComment = false;
          next = false;
        }
        break;
      case 13:
        ctx.nNextCh = ctx.GetNextChar();
        if (ctx.nNextCh === 10) ctx.nNextCh = ctx.GetNextChar();
        more = false;
        break;
      case 10:
        ctx.nNextCh = ctx.GetNextChar();
        more = false;
        break;
      case 0xffff:
        if (ctx.eof) {
          more = false;
          if (ctx.aToken !== "" || buffer !== "") ctx.bEndTokenFound = true;
          else {
            ctx.bReadScript = false;
            ctx.bReadStyle = false;
            ctx.aEndToken = "";
            token = T.NONE;
          }
        }
        break;
      default:
        if (!htmlControl(ctx.nNextCh) || ctx.nNextCh === 9)
          buffer += String.fromCodePoint(ctx.nNextCh);
    }
    if (!more && buffer !== "") {
      ctx.aToken += buffer;
      buffer = "";
    }
    if (more && next) ctx.nNextCh = ctx.GetNextChar();
  }
  return token;
}
