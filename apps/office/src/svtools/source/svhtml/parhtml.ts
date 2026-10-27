/** @fileoverview Native synchronous HTML token/filter owner from svtools/source/svhtml/parhtml.cxx. */
import { HtmlTokenId as T, HtmlOptionId } from "../../inc/htmltokn";
import { SvParserState as S } from "../../inc/svparser";
import { SvParser } from "../svrtf/svparser";
import { SvStream } from "../../../tools/source/stream/stream";
import {
  RTL_TEXTENCODING_UTF8,
  RTL_TEXTENCODING_UNICODE,
  RTL_TEXTENCODING_DONTKNOW,
} from "../../../sal/inc/rtl/textenc";
import * as C from "../../../sal/textenc/textcvt";
import * as F from "../../../sal/inc/rtl/textcvt.h";
import { GetHTMLToken, htmlAsciiLower } from "./htmlkywd";
import { HTMLOption, GetOptions, UnescapeToken } from "./parhtml.options";
import { ScanText, htmlAlpha, htmlControl } from "./parhtml.text";
import { GetNextRawToken } from "./parhtml.raw";
import tables from "./htmlkywd-data.json" with { type: "json" };
const preKept = new Set<number>(tables.preKeptTokens);
/** Native ASCII whitespace includes form feed in token names/options. @param code - Scalar. @returns Space. */
function white(code: number): boolean {
  return code === 32 || (code >= 9 && code <= 13);
}
/** Source paired token low bit distinguishes off tokens. @param token - Native token. @returns Off. */
function offToken(token: T): boolean {
  return (token & 1) !== 0;
}
/** Native HTML parser state and callbacks over the shared SvParser byte/character owner. */
export abstract class HTMLParser extends SvParser<T> {
  public sSaveToken = "";
  public readonly maOptions: HTMLOption[] = [];
  public bIsInHeader = true;
  public bReadListing = false;
  public bReadXMP = false;
  public bReadPRE = false;
  public bReadTextArea = false;
  public bReadScript = false;
  public bReadStyle = false;
  public bEndTokenFound = false;
  public bPre_IgnoreNewPara = false;
  public bReadNextChar = false;
  public bReadComment = false;
  public m_bPreserveSpaces = false;
  public aEndToken = "";
  private nPre_LinePos = 0;
  private mnPendingOffToken = T.NONE;
  private maNamespace = "";
  /** Sets source UTF-8 default while retaining the native new-document flag. @param input - Native stream. @param bNewDoc - Source import mode. @returns Parser. */
  public constructor(
    input: SvStream,
    public readonly bNewDoc = true,
  ) {
    super(input);
    this.SetSrcEncoding(RTL_TEXTENCODING_UTF8);
  }
  /** Native token consumer supplied by Writer or another document owner. @param token - Filtered token. @returns Nothing. */
  protected abstract NextToken(token: T): void;
  /** Exposes native byte position to split scanner functions. @returns Byte offset. */
  public Tell(): number {
    return this.rInput.Tell();
  }
  /** Rewinds only the source byte stream; scanner restores converter/line state explicitly. @param position - Original byte offset. @returns Nothing. */
  public Seek(position: number): void {
    this.rInput.Seek(position);
  }
  /** Reads the source EOF flag. @returns EOF. */
  public get eof(): boolean {
    return this.rInput.eof();
  }
  /** Source namespace alias becomes a prefix ending with a colon. @param name - Alias. @returns Nothing. */
  public SetNamespace(name: string): void {
    this.maNamespace = name + ":";
  }
  /** Sets native XML whitespace policy. @param preserve - Policy. @returns Nothing. */
  public SetPreserveSpaces(preserve: boolean): void {
    this.m_bPreserveSpaces = preserve;
  }
  /** Reads original whitespace policy. @returns Policy. */
  public GetPreserveSpaces(): boolean {
    return this.m_bPreserveSpaces;
  }
  /** Parses one synchronous stream with the original filter/consumer order. @returns Native parser state. */
  public CallParser(): S {
    this.eState = S.Working;
    this.nNextCh = this.GetNextChar();
    this.SaveState(T.NONE);
    this.nPre_LinePos = 0;
    this.bPre_IgnoreNewPara = false;
    this.Continue(T.NONE);
    return this.eState;
  }
  /** Continues the native scan/filter/consume loop. @param token - Restored token or NONE. @returns Nothing. */
  public Continue(token: T): void {
    if (token === T.NONE) token = this.GetNextToken();
    while (this.IsParserWorking()) {
      this.SaveState(token);
      token = this.FilterToken(token);
      if (token !== T.NONE) this.NextToken(token);
      if (this.IsParserWorking()) this.SaveState(T.NONE);
      token = this.GetNextToken();
    }
  }
  /** Native per-byte numeric-entity conversion for non-Unicode source encodings. @param character - Numeric value before scalar validation. @returns Converted or source signed-byte fallback. */
  public ConvertEntityCharacter(character: number): number {
    if (
      this.eSrcEnc === RTL_TEXTENCODING_DONTKNOW ||
      this.eSrcEnc === RTL_TEXTENCODING_UNICODE ||
      this.eSrcEnc === RTL_TEXTENCODING_UTF8 ||
      character >= 256
    )
      return character;
    const result = new Uint16Array(1);
    C.rtl_convertTextToUnicode(
      C.rtl_createTextToUnicodeConverter(this.eSrcEnc),
      null,
      Uint8Array.of(character),
      1,
      result,
      1,
      F.RTL_TEXTTOUNICODE_FLAGS_UNDEFINED_DEFAULT |
        F.RTL_TEXTTOUNICODE_FLAGS_MBUNDEFINED_DEFAULT |
        F.RTL_TEXTTOUNICODE_FLAGS_INVALID_DEFAULT |
        F.RTL_TEXTTOUNICODE_FLAGS_FLUSH,
      [0],
      [0],
    );
    return result[0] === 0 ? ((character << 24) >> 24) >>> 0 : (result[0] as number);
  }
  /** Reads cached original tag options. @param noConvert - Native CR/LF exception. @returns Options. */
  public GetOptions(noConvert?: HtmlOptionId): readonly HTMLOption[] {
    return GetOptions(this, noConvert);
  }
  /** Removes source scanner escape marks from the actual token. @returns Nothing. */
  public UnescapeToken(): void {
    UnescapeToken(this);
  }
  /** Source PRE start state is independent from the other legacy mode flags. @returns Nothing. */
  public StartPRE(): void {
    this.bReadPRE = true;
    this.bPre_IgnoreNewPara = true;
    this.nPre_LinePos = 0;
  }
  /** Source listing start state. @returns Nothing. */
  public StartListing(): void {
    this.bReadListing = true;
    this.bPre_IgnoreNewPara = true;
    this.nPre_LinePos = 0;
  }
  /** Source XMP start state. @returns Nothing. */
  public StartXMP(): void {
    this.bReadXMP = true;
    this.bPre_IgnoreNewPara = true;
    this.nPre_LinePos = 0;
  }
  /** Applies source global/filter-mode transitions. @param token - Scanned token. @returns Filtered token. */
  public FilterToken(token: T): T {
    switch (token) {
      case T.INVALID:
        return T.NONE;
      case T.HEAD_OFF:
        this.bIsInHeader = false;
        break;
      case T.HEAD_ON:
        this.bIsInHeader = true;
        break;
      case T.BODY_ON:
      case T.FRAMESET_ON:
        this.bIsInHeader = false;
        break;
      case T.BODY_OFF:
        this.bReadPRE = this.bReadListing = this.bReadXMP = false;
        break;
      case T.HTML_OFF:
        this.bReadPRE = this.bReadListing = this.bReadXMP = false;
        return T.NONE;
      case T.PREFORMTXT_ON:
        this.StartPRE();
        break;
      case T.PREFORMTXT_OFF:
        this.bReadPRE = false;
        break;
      case T.LISTING_ON:
        this.StartListing();
        break;
      case T.LISTING_OFF:
        this.bReadListing = false;
        break;
      case T.XMP_ON:
        this.StartXMP();
        break;
      case T.XMP_OFF:
        this.bReadXMP = false;
        break;
      default:
        if (this.bReadPRE) token = this.FilterPRE(token);
        else if (this.bReadListing) token = this.FilterListing(token);
        else if (this.bReadXMP) token = this.FilterXMP(token);
    }
    return token;
  }
  /** Native PRE token allowlist, tab expansion and first-break suppression. @param token - Original token. @returns Filtered token. */
  public FilterPRE(token: T): T {
    switch (token) {
      case T.PARABREAK_ON:
      case T.LINEBREAK:
      case T.NEWPARA:
        token = token === T.PARABREAK_ON ? T.LINEBREAK : token;
        this.nPre_LinePos = 0;
        if (this.bPre_IgnoreNewPara) token = T.NONE;
        break;
      case T.TABCHAR: {
        const spaces = 8 - (this.nPre_LinePos % 8);
        if (this.aToken.length < spaces) this.aToken = this.aToken.padEnd(spaces, " ");
        this.nPre_LinePos += spaces;
        token = T.TEXTTOKEN;
        break;
      }
      case T.TEXTTOKEN:
        this.nPre_LinePos += this.aToken.length;
        break;
      default:
        if (!preKept.has(token) && token !== T.NONE)
          token =
            token >= T.ONOFF_START && offToken(token) ? T.UNKNOWNCONTROL_OFF : T.UNKNOWNCONTROL_ON;
    }
    this.bPre_IgnoreNewPara = false;
    return token;
  }
  /** Source XMP reconstructs markup text instead of interpreting its known tags. @param token - Original token. @returns Token. */
  public FilterXMP(token: T): T {
    if (token === T.NEWPARA) {
      if (this.bPre_IgnoreNewPara) token = T.NONE;
    } else if (
      token !== T.TEXTTOKEN &&
      token !== T.NONBREAKSPACE &&
      token !== T.SOFTHYPH &&
      token !== T.NONE
    ) {
      this.sSaveToken = (token >= T.ONOFF_START && offToken(token) ? "</" : "<") + this.sSaveToken;
      if (this.aToken !== "") {
        this.UnescapeToken();
        this.sSaveToken += " ";
        this.aToken = this.sSaveToken + this.aToken;
      } else this.aToken = this.sSaveToken;
      this.aToken += ">";
      token = T.TEXTTOKEN;
    }
    this.bPre_IgnoreNewPara = false;
    return token;
  }
  /** Source listing keeps text and maps all remaining tags to unknown controls. @param token - Original token. @returns Token. */
  public FilterListing(token: T): T {
    if (token === T.NEWPARA) {
      if (this.bPre_IgnoreNewPara) token = T.NONE;
    } else if (
      token !== T.TEXTTOKEN &&
      token !== T.NONBREAKSPACE &&
      token !== T.SOFTHYPH &&
      token !== T.NONE
    )
      token =
        token >= T.ONOFF_START && offToken(token) ? T.UNKNOWNCONTROL_OFF : T.UNKNOWNCONTROL_ON;
    this.bPre_IgnoreNewPara = false;
    return token;
  }
  /** Native tag/raw/text token scanner; pending paired-off tokens precede option-cache clearing. @returns Scanned token. */
  protected override GetNextToken_(): T {
    let token = T.NONE;
    this.sSaveToken = "";
    if (this.mnPendingOffToken !== T.NONE) {
      token = this.mnPendingOffToken;
      this.mnPendingOffToken = T.NONE;
      this.aToken = "";
      return token;
    }
    this.maOptions.length = 0;
    if (!this.IsParserWorking()) return T.NONE;
    if (this.bReadNextChar) {
      this.nNextCh = this.GetNextChar();
      if (!this.IsParserWorking()) return T.NONE;
      this.bReadNextChar = false;
    }
    if (this.bReadScript || this.bReadStyle || this.aEndToken !== "") {
      token = GetNextRawToken(this);
      if (token !== T.NONE || !this.IsParserWorking()) return token;
    }
    do {
      let next = true;
      switch (this.nNextCh) {
        case 60: {
          const position = this.Tell(),
            line = this.GetLineNr(),
            column = this.GetLinePos();
          let off = false;
          this.nNextCh = this.GetNextChar();
          if (this.nNextCh === 47) {
            off = true;
            this.nNextCh = this.GetNextChar();
          }
          if (htmlAlpha(this.nNextCh) || this.nNextCh === 33 || this.nNextCh === 63) {
            let name = "";
            do {
              name += String.fromCodePoint(this.nNextCh);
              this.nNextCh = this.GetNextChar();
              if (name === "![CDATA[") break;
            } while (
              this.nNextCh !== 62 &&
              this.nNextCh !== 47 &&
              !white(this.nNextCh) &&
              !htmlControl(this.nNextCh) &&
              !this.eof
            );
            this.aToken += name;
            while (white(this.nNextCh)) this.nNextCh = this.GetNextChar();
            this.sSaveToken = this.aToken;
            this.aToken = htmlAsciiLower(this.aToken);
            if (this.maNamespace !== "" && this.aToken.startsWith(this.maNamespace))
              this.aToken = this.aToken.slice(this.maNamespace.length);
            token = GetHTMLToken(this.aToken);
            if (token === T.NONE) token = T.UNKNOWNCONTROL_ON;
            if (off) {
              if (token >= T.ONOFF_START) token++;
              else if (token !== T.LINEBREAK || this.maNamespace !== "")
                token = T.UNKNOWNCONTROL_OFF;
            }
            if (token === T.COMMENT) {
              this.aToken = this.sSaveToken + (this.nNextCh !== 62 ? " " : "");
              let buffer = this.aToken,
                done = false,
                firstEnd:
                  { position: number; line: number; column: number; length: number } | undefined;
              while (!done && !this.eof) {
                if (this.nNextCh === 62) {
                  firstEnd ??= {
                    position: this.Tell(),
                    line: this.GetLineNr(),
                    column: this.GetLinePos(),
                    length: buffer.length,
                  };
                  done = buffer.length >= 2 && buffer.endsWith("--");
                  if (!done) buffer += ">";
                } else if (
                  !htmlControl(this.nNextCh) ||
                  this.nNextCh === 13 ||
                  this.nNextCh === 10 ||
                  this.nNextCh === 9
                )
                  buffer += String.fromCodePoint(this.nNextCh);
                if (!done) this.nNextCh = this.GetNextChar();
              }
              this.aToken = buffer;
              if (!done && firstEnd !== undefined) {
                this.Seek(firstEnd.position);
                this.SetLineNr(firstEnd.line);
                this.SetLinePos(firstEnd.column);
                this.ClearTxtConvContext();
                this.aToken = this.aToken.slice(0, firstEnd.length);
                this.nNextCh = 62;
              }
            } else if (token === T.CDATA) {
              let buffer = "",
                done = false;
              while (!done && !this.eof) {
                if (this.nNextCh === 62) {
                  done = buffer.length >= 2 && buffer.endsWith("]]");
                  if (done) buffer = buffer.slice(0, -2);
                  else buffer += ">";
                } else if (!htmlControl(this.nNextCh)) buffer += String.fromCodePoint(this.nNextCh);
                if (!done) this.nNextCh = this.GetNextChar();
              }
              this.aToken = buffer;
            } else this.aToken = "";
            if (this.nNextCh !== 62) {
              ScanText(this, 62);
              if (token >= T.ONOFF_START && this.aToken.endsWith("/")) {
                this.mnPendingOffToken = token + 1;
                this.aToken = this.aToken.slice(0, -1);
              }
              if (this.nNextCh === 0xffff && this.eof) {
                this.Seek(position);
                this.SetLineNr(line);
                this.SetLinePos(column);
                this.ClearTxtConvContext();
                this.aToken = "<";
                token = T.TEXTTOKEN;
                this.nNextCh = this.GetNextChar();
                next = false;
                break;
              }
            }
          } else {
            if (off) {
              ScanText(this, 62);
              if (this.nNextCh === 0xffff && this.eof) {
                this.Seek(position);
                this.SetLineNr(line);
                this.SetLinePos(column);
                this.ClearTxtConvContext();
                this.aToken = "<";
                token = T.TEXTTOKEN;
                this.nNextCh = this.GetNextChar();
                next = false;
                break;
              }
              this.aToken = "";
            } else if (this.nNextCh === 37) {
              token = T.UNKNOWNCONTROL_ON;
              const aspPosition = this.Tell(),
                aspLine = this.GetLineNr(),
                aspColumn = this.GetLinePos();
              let buffer = this.aToken,
                done = false;
              while (!done && !this.eof) {
                done = this.nNextCh === 62 && buffer.endsWith("%");
                if (!done) {
                  buffer += String.fromCodePoint(this.nNextCh);
                  this.nNextCh = this.GetNextChar();
                }
              }
              if (!done) {
                this.Seek(aspPosition);
                this.SetLineNr(aspLine);
                this.SetLinePos(aspColumn);
                this.ClearTxtConvContext();
                this.aToken = "<%";
                token = T.TEXTTOKEN;
                break;
              }
              this.aToken = buffer;
              this.sSaveToken = this.aToken;
              this.aToken = "";
            } else {
              this.aToken = "<";
              token = T.TEXTTOKEN;
              next = false;
              break;
            }
          }
          next = this.nNextCh === 62;
          switch (token) {
            case T.TEXTAREA_ON:
              this.bReadTextArea = true;
              break;
            case T.TEXTAREA_OFF:
              this.bReadTextArea = false;
              break;
            case T.SCRIPT_ON:
              if (!this.bReadTextArea) this.bReadScript = true;
              break;
            case T.SCRIPT_OFF:
              if (!this.bReadTextArea) {
                this.bReadScript = false;
                this.bReadNextChar = true;
                next = false;
              }
              break;
            case T.STYLE_ON:
              this.bReadStyle = true;
              break;
            case T.STYLE_OFF:
              this.bReadStyle = false;
              break;
          }
          break;
        }
        case 0xffff:
          if (this.eof) {
            this.eState = S.Accepted;
            token = T.INVALID;
          } else {
            token = ScanText(this);
            next = this.aToken.length === 0;
          }
          break;
        case 12:
          token = T.LINEFEEDCHAR;
          break;
        default:
          if (
            (this.nNextCh === 10 || this.nNextCh === 13) &&
            (this.bReadListing || this.bReadXMP || this.bReadPRE || this.bReadTextArea)
          ) {
            const old = this.nNextCh,
              code = this.GetNextChar();
            if (!((old === 10 && code === 13) || (old === 13 && code === 10))) {
              next = false;
              this.nNextCh = code;
            }
            token = T.NEWPARA;
          } else if (this.nNextCh === 9 && this.bReadPRE) token = T.TABCHAR;
          else {
            token = ScanText(this);
            next = this.aToken.length === 0;
          }
      }
      if (next && this.eState === S.Working) this.nNextCh = this.GetNextChar();
    } while (token === T.NONE && this.eState === S.Working);
    return token;
  }
}
