/** @fileoverview Native SvParser character conversion, token ring and saved-state ownership from svparser.cxx. */
import { SvParserState } from "../../inc/svparser";
import { SvStream } from "../../../tools/source/stream/stream";
import {
  RTL_TEXTENCODING_DONTKNOW,
  RTL_TEXTENCODING_SYMBOL,
  RTL_TEXTENCODING_UNICODE,
  RTL_TEXTENCODING_UTF8,
  type rtl_TextEncoding,
} from "../../../sal/inc/rtl/textenc";
import * as C from "../../../sal/textenc/textcvt";
import * as F from "../../../sal/inc/rtl/textcvt.h";
/** Source logical ring entry; initialized storage does not claim behavior for unread native slots. */
interface TokenStack<T> {
  sToken: string;
  nTokenValue: number;
  bTokenHasValue: boolean;
  nTokenId: T;
}
/** Original saved-state fields; converter state resets remain a separate native operation. */
interface ParserSave<T> extends TokenStack<T> {
  nFilePos: number;
  nlLineNr: number;
  nlLinePos: number;
  nNextCh: number;
}
/** Source parser base over the existing synchronous in-memory stream. Device callbacks/pending I/O are outside this stream binding. */
export abstract class SvParser<T extends number> {
  public aToken = "";
  public nNextCh = 0;
  protected eState = SvParserState.NotStarted;
  protected eSrcEnc: rtl_TextEncoding = RTL_TEXTENCODING_DONTKNOW;
  protected nTokenValue = 0;
  protected bTokenHasValue = false;
  protected nlLineNr = 1;
  protected nlLinePos = 1;
  protected nConversionErrors = 0;
  protected m_nTokenIndex = 0;
  private nNextChPos = 0;
  private bSwitchToUCS2 = false;
  private converter: C.rtl_TextToUnicodeConverter = null;
  private context: C.rtl_TextToUnicodeContext = 1;
  private readonly stack: TokenStack<T>[];
  private stackIndex = 0;
  private stackCount = 0;
  private saved: ParserSave<T> | undefined;
  private saveToken = 0 as T;
  /** Retains source stream and minimum-three token-ring size. @param rInput - Native byte stream. @param stackSize - Original UInt8 size. @returns Parser. */
  public constructor(
    protected readonly rInput: SvStream,
    stackSize = 3,
  ) {
    this.stack = Array.from(
      { length: Math.max(3, stackSize & 255) },
      /** Initializes only portable inactive ring storage. @returns Entry. */ () => ({
        sToken: "",
        nTokenValue: 0,
        bTokenHasValue: false,
        nTokenId: 0 as T,
      }),
    );
  }
  /** Source next-token specialization. @returns Native token. */
  protected abstract GetNextToken_(): T;
  /** Reads parser state. @returns State. */
  public GetStatus(): SvParserState {
    return this.eState;
  }
  /** Reads source line. @returns One-based line. */
  public GetLineNr(): number {
    return this.nlLineNr;
  }
  /** Reads source column. @returns One-based column. */
  public GetLinePos(): number {
    return this.nlLinePos;
  }
  /** Sets saved source line. @param value - Line. @returns Nothing. */
  public SetLineNr(value: number): void {
    this.nlLineNr = value;
  }
  /** Sets saved source column. @param value - Column. @returns Nothing. */
  public SetLinePos(value: number): void {
    this.nlLinePos = value;
  }
  /** Tests source working state. @returns Working. */
  public IsParserWorking(): boolean {
    return this.eState === SvParserState.Working;
  }
  /** Reads the selected native encoding. @returns Encoding. */
  public GetSrcEncoding(): rtl_TextEncoding {
    return this.eSrcEnc;
  }
  /** Sets source BOM probe policy. @param enabled - Policy. @returns Nothing. */
  public SetSwitchToUCS2(enabled: boolean): void {
    this.bSwitchToUCS2 = enabled;
  }
  /** Reads native source character byte unit size. @returns Two for UCS2, one otherwise. */
  public GetCharSize(): number {
    return this.eSrcEnc === RTL_TEXTENCODING_UNICODE ? 2 : 1;
  }
  /** Resets actual descriptor context after a stream rewind. @returns Nothing. */
  public ClearTxtConvContext(): void {
    C.rtl_resetTextToUnicodeContext(this.converter, this.context);
  }
  /** Changes native converter ownership and preserves the source unknown-encoding fallback. @param encoding - Requested native encoding. @returns Nothing. */
  public SetSrcEncoding(encoding: rtl_TextEncoding): void {
    if (encoding === this.eSrcEnc) return;
    C.rtl_destroyTextToUnicodeContext(this.converter, this.context);
    C.rtl_destroyTextToUnicodeConverter(this.converter);
    this.context = 1;
    this.converter = C.rtl_createTextToUnicodeConverter(encoding);
    this.eSrcEnc = this.converter !== null ? encoding : RTL_TEXTENCODING_DONTKNOW;
    if (this.converter !== null) this.context = C.rtl_createTextToUnicodeContext(this.converter);
  }
  /** Reconsumes lookahead after an encoding/context change. @returns Nothing. */
  public RereadLookahead(): void {
    this.rInput.Seek(this.nNextChPos);
    this.nNextCh = this.GetNextChar();
  }
  /** Original scalar conversion over incremental native descriptors, retaining error fallback and byte rewind rules. @returns Scalar or UTF16 EOF sentinel. */
  public GetNextChar(): number {
    let code = 0;
    let error: boolean;
    if (this.bSwitchToUCS2 && this.rInput.Tell() === 0) {
      this.rInput.StartReadingUnicodeText(RTL_TEXTENCODING_DONTKNOW);
      const encoding = this.rInput.GetStreamEncoding();
      if (encoding === RTL_TEXTENCODING_UNICODE) this.eSrcEnc = encoding;
      else if (encoding === RTL_TEXTENCODING_UTF8) this.SetSrcEncoding(encoding);
      this.bSwitchToUCS2 = false;
    }
    this.nNextChPos = this.rInput.Tell();
    if (this.eSrcEnc === RTL_TEXTENCODING_UNICODE) {
      const unit: [number] = [0];
      this.rInput.ReadUtf16(unit);
      error = !this.rInput.good();
      if (!error) {
        code = unit[0];
        if (code >= 0xd800 && code <= 0xdbff) {
          const position = this.rInput.Tell();
          this.rInput.ReadUtf16(unit);
          if (this.rInput.good() && unit[0] >= 0xdc00 && unit[0] <= 0xdfff)
            code = 0x10000 + ((code - 0xd800) << 10) + (unit[0] - 0xdc00);
          else this.rInput.Seek(position);
        }
      }
    } else {
      let chars = 0;
      const flags =
        F.RTL_TEXTTOUNICODE_FLAGS_UNDEFINED_ERROR |
        F.RTL_TEXTTOUNICODE_FLAGS_MBUNDEFINED_ERROR |
        F.RTL_TEXTTOUNICODE_FLAGS_INVALID_ERROR;
      do {
        const byte: [number] = [0];
        this.rInput.ReadChar(byte);
        error = !this.rInput.good();
        if (!error) {
          if (
            this.eSrcEnc === RTL_TEXTENCODING_DONTKNOW ||
            this.eSrcEnc === RTL_TEXTENCODING_SYMBOL
          ) {
            code = byte[0] & 255;
            chars = 1;
          } else {
            const output = new Uint16Array(2),
              info: [number] = [0],
              consumed: [number] = [0];
            chars = C.rtl_convertTextToUnicode(
              this.converter,
              this.context,
              Int8Array.of(byte[0]),
              1,
              output,
              1,
              flags,
              info,
              consumed,
            );
            if (info[0] & F.RTL_TEXTTOUNICODE_INFO_SRCBUFFERTOOSMALL) {
              if (this.context !== 1) {
                while (info[0] & F.RTL_TEXTTOUNICODE_INFO_SRCBUFFERTOOSMALL) {
                  this.rInput.ReadChar(byte);
                  error = !this.rInput.good();
                  if (error) break;
                  chars = C.rtl_convertTextToUnicode(
                    this.converter,
                    this.context,
                    Int8Array.of(byte[0]),
                    1,
                    output,
                    2,
                    flags,
                    info,
                    consumed,
                  );
                }
                if (!error) {
                  if (chars === 1 && info[0] === 0) code = output[0] as number;
                  else if (chars === 2 && info[0] === 0)
                    code =
                      0x10000 +
                      (((output[0] as number) - 0xd800) << 10) +
                      (output[1] as number) -
                      0xdc00;
                  else {
                    code = 63;
                    chars = 1;
                    this.nConversionErrors++;
                  }
                }
              } else {
                const bytes = new Int8Array(10);
                bytes[0] = byte[0];
                let length = 1;
                while (info[0] & F.RTL_TEXTTOUNICODE_INFO_SRCBUFFERTOOSMALL && length < 10) {
                  this.rInput.ReadChar(byte);
                  error = !this.rInput.good();
                  if (error) break;
                  bytes[length++] = byte[0];
                  chars = C.rtl_convertTextToUnicode(
                    this.converter,
                    null,
                    bytes,
                    length,
                    output,
                    1,
                    flags,
                    info,
                    consumed,
                  );
                }
                if (!error) {
                  if (chars === 1 && info[0] === 0) code = output[0] as number;
                  else {
                    code = (bytes[0] as number) & 255;
                    this.rInput.SeekRel(-(length - 1));
                    chars = 1;
                    this.nConversionErrors++;
                  }
                }
              }
            } else if (chars === 1 && info[0] === 0) code = output[0] as number;
            else if (chars !== 0 || info[0] !== 0) {
              code = byte[0] & 255;
              chars = 1;
              this.nConversionErrors++;
            }
          }
        }
      } while (chars === 0 && !error);
    }
    if (code > 0x10ffff || (code >= 0xd800 && code <= 0xdfff)) code = 63;
    if (error) return 0xffff;
    if (code === 10) {
      this.nlLineNr++;
      this.nlLinePos = 1;
    } else this.nlLinePos++;
    return code;
  }
  /** Native token-ring scan/replay; only working-state entries are retained. @returns Native token. */
  public GetNextToken(): T {
    let token = 0 as T;
    if (this.stackCount === 0) {
      this.aToken = "";
      this.nTokenValue = -1;
      this.bTokenHasValue = false;
      token = this.GetNextToken_();
      if (this.eState === SvParserState.Pending) return token;
    }
    this.stackIndex = (this.stackIndex + 1) % this.stack.length;
    if (this.stackCount !== 0) {
      this.stackCount--;
      const entry = this.stack[this.stackIndex] as TokenStack<T>;
      this.aToken = entry.sToken;
      this.nTokenValue = entry.nTokenValue;
      this.bTokenHasValue = entry.bTokenHasValue;
      token = entry.nTokenId;
      this.m_nTokenIndex++;
    } else if (this.eState === SvParserState.Working) {
      this.stack[this.stackIndex] = {
        sToken: this.aToken,
        nTokenValue: this.nTokenValue,
        bTokenHasValue: this.bTokenHasValue,
        nTokenId: token,
      };
      this.m_nTokenIndex++;
    } else if (this.eState !== SvParserState.Accepted && this.eState !== SvParserState.Pending)
      this.eState = SvParserState.Error;
    return token;
  }
  /** Moves within the native bounded ring and restores its retained token fields. @param count - Signed token movement. @returns Retained token. */
  public SkipToken(count: number): T {
    const offset = Math.max(-this.stack.length + 1, Math.min(this.stack.length - 1, count));
    this.stackIndex = (this.stackIndex + offset + this.stack.length) % this.stack.length;
    this.stackCount = Math.max(0, Math.min(this.stack.length, this.stackCount - count));
    this.m_nTokenIndex -= this.stackCount;
    const entry = this.stack[this.stackIndex] as TokenStack<T>;
    this.aToken = entry.sToken;
    this.nTokenValue = entry.nTokenValue;
    this.bTokenHasValue = entry.bTokenHasValue;
    return entry.nTokenId;
  }
  /** Saves original stream/token/line/lookahead fields without copying converter state. @param token - Pending token discriminator. @returns Nothing. */
  public SaveState(token: T): void {
    this.saved = {
      nFilePos: this.rInput.Tell(),
      sToken: this.aToken,
      nTokenValue: this.nTokenValue,
      bTokenHasValue: this.bTokenHasValue,
      nTokenId: token,
      nlLineNr: this.nlLineNr,
      nlLinePos: this.nlLinePos,
      nNextCh: this.nNextCh,
    };
  }
  /** Restores the original saved fields and byte position. @returns Nothing. */
  public RestoreState(): void {
    const saved = this.saved;
    if (saved === undefined) return;
    this.aToken = saved.sToken;
    this.nlLineNr = saved.nlLineNr;
    this.nlLinePos = saved.nlLinePos;
    this.nTokenValue = saved.nTokenValue;
    this.bTokenHasValue = saved.bTokenHasValue;
    this.nNextCh = saved.nNextCh;
    this.saveToken = saved.nTokenId;
    this.rInput.Seek(saved.nFilePos);
  }
  /** Reads the most recently restored native discriminator. @returns Token. */
  public GetSaveToken(): T {
    return this.saveToken;
  }
}
